import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {JSDOM} from 'jsdom';

const root=fileURLToPath(new URL('../',import.meta.url));
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

test('presentation exposes four experiences while packaging only isolated static applications',()=>{
  const dom=new JSDOM(read('index.html'),{url:'https://presentation.example.test/'});
  try {
    const doc=dom.window.document;
    const links=[...doc.querySelectorAll('#design-options a[data-option-link], #design-options a[data-application-link]')];
    assert.deepEqual(links.map(link=>new URL(link.href).pathname),['/option-a/','/option-e/','/admin/','/my-ikonectt/']);
    assert.equal(doc.querySelectorAll('#design-options article').length,4);
    for(const link of links){
      assert.equal(new URL(link.href).origin,'https://presentation.example.test');
      assert.equal(link.target,'_blank');
      assert.ok(link.relList.contains('noopener'));
    }
    // Staff/customer apps open directly: their frame restrictions must not break
    // the established public-design iframe and its two-option controls.
    assert.deepEqual([...doc.querySelectorAll('[data-option-link]')].map(link=>link.dataset.optionLink),['a','e']);
    assert.equal(doc.querySelectorAll('[id^="btn-toggle-"]').length,2);
    assert.equal(new URL(doc.querySelector('#preview-frame').src).pathname,'/option-a/');
  } finally {dom.window.close();}

  const config=JSON.parse(read('vercel.json'));
  const pkg=JSON.parse(read('package.json'));
  assert.equal(config.outputDirectory,'public_html');
  assert.equal(config.buildCommand,'npm run build:presentation');
  assert.equal(pkg.scripts.build,'node scripts/build_showcase.js');
  assert.equal(pkg.scripts['build:presentation'],'node scripts/build_presentation.cjs');
  assert.ok(!config.functions&&!config.builds,'Presentation must not introduce server functions.');
  for(const prefix of ['/admin','/my-ikonectt']){
    const redirect=config.redirects.find(rule=>rule.source===prefix);
    assert.equal(redirect?.destination,prefix+'/','Relative customer assets require a trailing slash.');
    const route=config.headers.find(rule=>rule.source===prefix+'/(.*)');
    assert.ok(route,`Missing isolated demo policy for ${prefix}`);
    const headers=new Map(route.headers.map(header=>[header.key.toLowerCase(),header.value]));
    assert.match(headers.get('content-security-policy'),/connect-src 'none'/);
    assert.match(headers.get('content-security-policy'),/form-action 'none'/);
    assert.match(headers.get('x-robots-tag'),/noindex/);
  }
  const globalPolicies=config.headers.filter(rule=>rule.source==='/(.*)').flatMap(rule=>rule.headers);
  assert.ok(!globalPolicies.some(header=>header.key.toLowerCase()==='content-security-policy'),'Demo CSP must not restrict existing website options or their preview iframe.');

  // Execute the real wrapper with inert process/filesystem boundaries. This
  // checks which builds and artifacts it selects without rebuilding applications,
  // writing generated files, or making network requests during the test.
  const wrapper=read('scripts/build_presentation.cjs');
  const execute=(symlink=false)=>{
    const builds=[],copies=[];
    const modules={
      'node:path':path,
      'node:fs':{existsSync:()=>symlink,lstatSync:()=>({isSymbolicLink:()=>symlink}),cpSync:(from,to)=>copies.push([from,to])},
      'node:child_process':{execSync:(command,options)=>builds.push([command,options.cwd])},
    };
    vm.runInNewContext(wrapper,{__dirname:path.join(root,'scripts'),require:name=>{
      assert.ok(Object.hasOwn(modules,name),`Unexpected build dependency: ${name}`);return modules[name];
    },console:{log(){}}},{filename:'build_presentation.cjs'});
    return {builds,copies};
  };
  const result=execute();
  assert.deepEqual(result.builds,[['npm run build',path.resolve(root)],['npm run build:demo',path.join(root,'admin')],['npm run build:demo',path.join(root,'my-ikonectt')]]);
  assert.deepEqual(result.copies,[
    [path.join(root,'admin','dist-demo','admin'),path.join(root,'public_html','admin')],
    [path.join(root,'my-ikonectt','dist-demo'),path.join(root,'public_html','my-ikonectt')],
  ]);
  assert.throws(()=>execute(true),/Unsafe presentation output directory/);
});
