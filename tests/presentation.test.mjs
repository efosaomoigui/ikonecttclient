import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {JSDOM} from 'jsdom';
import {installPresentationLinks} from '../scripts/presentation-links.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

test('presentation keeps the original two-design landing and packages isolated applications only into built A/E',()=>{
  const dom=new JSDOM(read('index.html'),{url:'https://presentation.example.test/'});
  try {
    const doc=dom.window.document;
    const links=[...doc.querySelectorAll('#design-options a[data-option-link]')];
    assert.deepEqual(links.map(link=>new URL(link.href).pathname),['/option-a/','/option-e/']);
    assert.equal(doc.querySelectorAll('#design-options article').length,2);
    assert.equal(doc.querySelectorAll('[data-application-link]').length,0);
    assert.match(doc.querySelector('h1').textContent,/Two designs/);
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
    const builds=[],copies=[],fileCopies=[],writes=[];
    const sampleHtml='<!doctype html><html><head><title>Existing website</title></head><body><main>Approved content</main></body></html>';
    const modules={
      'node:path':path,
      'node:fs':{
        existsSync:()=>symlink,lstatSync:()=>({isSymbolicLink:()=>symlink}),
        cpSync:(from,to)=>copies.push([from,to]),
        copyFileSync:(from,to)=>fileCopies.push([from,to]),
        readFileSync:()=>sampleHtml,writeFileSync:(file,html)=>writes.push([file,html]),
      },
      'node:child_process':{execSync:(command,options)=>builds.push([command,options.cwd])},
    };
    vm.runInNewContext(wrapper,{__dirname:path.join(root,'scripts'),require:name=>{
      assert.ok(Object.hasOwn(modules,name),`Unexpected build dependency: ${name}`);return modules[name];
    },console:{log(){}}},{filename:'build_presentation.cjs'});
    return {builds,copies,fileCopies,writes,sampleHtml};
  };
  const result=execute();
  assert.deepEqual(result.builds,[['npm run build',path.resolve(root)],['npm run build:demo',path.join(root,'admin')],['npm run build:demo',path.join(root,'my-ikonectt')]]);
  assert.deepEqual(result.copies,[
    [path.join(root,'admin','dist-demo','admin'),path.join(root,'public_html','admin')],
    [path.join(root,'my-ikonectt','dist-demo'),path.join(root,'public_html','my-ikonectt')],
  ]);
  assert.deepEqual(result.fileCopies.map(([,destination])=>path.relative(root,destination)),[
    path.join('public_html','shared','presentation-links.mjs'),
    path.join('public_html','shared','presentation-links.css'),
  ]);
  assert.deepEqual(result.writes.map(([file])=>path.relative(root,file)),[
    path.join('public_html','option-a','index.html'),path.join('public_html','option-e','index.html'),
  ]);
  for(const [,html] of result.writes){
    const doc=new JSDOM(html).window.document;
    assert.equal(doc.querySelector('main').textContent,'Approved content');
    assert.equal(doc.querySelector('script[type="module"]').getAttribute('src'),'/shared/presentation-links.mjs');
    assert.equal(doc.querySelector('link[rel="stylesheet"]').getAttribute('href'),'/shared/presentation-links.css');
    assert.equal(html.replace('<link rel="stylesheet" href="/shared/presentation-links.css"><script type="module" src="/shared/presentation-links.mjs"></script>',''),result.sampleHtml);
    doc.defaultView.close();
  }
  assert.throws(()=>execute(true),/Unsafe presentation output directory/);
});

for(const template of ['a','e'])test(`Template ${template}: presentation links open customer home/Admin in new tabs and survive header rerenders`,async()=>{
  const header=()=>`<header class="ik-header"><nav class="ik-desktop-nav"><a class="ik-mobile-portal" href="#/my-ikonectt/sign-in"><span>My Ikonectt mobile</span></a></nav><div class="ik-nav-actions"><a href="#/my-ikonectt/sign-in"><span>My Ikonectt desktop</span></a></div></header>`;
  const hero=template==='a'?'<button id="home-my-ikonectt"><span>My Ikonectt</span></button>':'<a id="hero-portal" href="#portal"><span>My Ikonectt</span></a>';
  const dom=new JSDOM(`<div class="ik-site">${header()}<main>${hero}<p>Existing approved website content</p></main></div>`,{url:`https://presentation.example.test/option-${template}/`});
  const win=dom.window,doc=win.document,opened=[];
  win.open=(...args)=>{opened.push(args);return null;};
  let legacyClicks=0;
  // Existing in-page handlers would cancel navigation and show a mock modal.
  const legacy=event=>{legacyClicks++;event.preventDefault();};
  doc.querySelector('main').addEventListener('click',legacy);
  doc.querySelector('.ik-header').addEventListener('click',legacy);
  const cleanup=installPresentationLinks(doc);
  const settle=()=>new Promise(resolve=>win.setTimeout(resolve,0));
  try{
    const assertLinks=()=>{
      const customerLinks=[...doc.querySelectorAll('[data-ik-presentation-customer]')];
      assert.equal(customerLinks.length,template==='a'?2:3);
      for(const link of customerLinks){
        assert.equal(link.href,'https://presentation.example.test/my-ikonectt/#/');
        assert.equal(link.target,'_blank');
        assert.ok(link.relList.contains('noopener')&&link.relList.contains('noreferrer'));
      }
      const desktop=doc.querySelectorAll('.ik-nav-actions [data-ik-presentation-admin]');
      const mobile=doc.querySelectorAll('.ik-desktop-nav [data-ik-presentation-admin]');
      assert.equal(desktop.length,1);assert.equal(mobile.length,1);
      assert.ok(!desktop[0].classList.contains('ik-mobile-portal'));
      assert.ok(mobile[0].classList.contains('ik-mobile-portal'));
      for(const link of [...desktop,...mobile]){
        assert.equal(link.href,'https://presentation.example.test/admin/');
        assert.equal(link.target,'_blank');
        assert.ok(link.relList.contains('noopener')&&link.relList.contains('noreferrer'));
      }
    };
    assertLinks();
    const customer=doc.querySelector('.ik-nav-actions [data-ik-presentation-customer]');
    const customerEvent=new win.MouseEvent('click',{bubbles:true,cancelable:true});
    customer.querySelector('span').dispatchEvent(customerEvent);
    assert.equal(legacyClicks,0,'Template handler must not intercept the customer link.');
    assert.equal(customerEvent.defaultPrevented,false,'Native new-tab anchor navigation must remain enabled.');
    const heroEvent=new win.MouseEvent('click',{bubbles:true,cancelable:true});
    doc.querySelector('main span').dispatchEvent(heroEvent);
    assert.equal(legacyClicks,0);
    if(template==='a'){
      assert.equal(heroEvent.defaultPrevented,true);
      assert.deepEqual(opened,[['/my-ikonectt/#/','_blank','noopener,noreferrer']]);
    }else{
      assert.equal(heroEvent.defaultPrevented,false);
      assert.deepEqual(opened,[]);
    }
    doc.querySelector('.ik-header').outerHTML=header();
    await settle();assertLinks();
    doc.querySelector('.ik-header').append(doc.createElement('small'));
    await settle();assertLinks(); // Unrelated mutations must not duplicate Admin links.
    assert.equal(win.location.pathname,`/option-${template}/`);
    assert.equal(win.location.hash,'','Presentation clicks must not send the public site into its old sign-in route.');
    assert.equal(doc.querySelector('main p').textContent,'Existing approved website content');
  }finally{cleanup();dom.window.close();}
});
