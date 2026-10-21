import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {JSDOM} from 'jsdom';
import {mountSite} from '../shared/public-site.js';
import {mountVisuals} from '../shared/visuals.js';
import {visualAssets,visualSlots,visualURL,visualPictureHTML} from '../shared/visual-assets.js';
import {pages} from '../shared/routes.js';

const read=file=>fs.readFileSync(new URL('../'+file,import.meta.url));
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
test('visual delivery resolves every responsive asset locally, with credits and no invented source sizes',()=>{
  const fixture=new JSDOM('',{url:'https://preview.test/option-a/'});
  globalThis.document=fixture.window.document;
  const exports=JSON.parse(read('assets/review/phase-3/exports.json'));
  for(const [key,asset] of Object.entries(visualAssets)){
    for(const width of asset.vector?[1280]:asset.widths){
      const url=visualURL(key,width,'https://preview.test/option-a/');
      assert.ok(fs.existsSync(new URL('..'+new URL(url).pathname,import.meta.url)),url);
      if(!asset.vector)assert.ok(width<=asset.width,key);
    }
    const markup=new JSDOM(visualPictureHTML(key,{priority:false})).window.document;
    const img=markup.querySelector('img');assert.equal(img.getAttribute('loading'),'lazy');
    assert.ok(img.getAttribute('width'));assert.ok(img.getAttribute('height'));assert.ok(img.alt);
    if(asset.credit){assert.ok(asset.credit.source.startsWith('https://commons.wikimedia.org/'));assert.ok(asset.credit.licenseURL.startsWith('https://creativecommons.org/'));}
  }
  for(const record of exports)for(const file of record.exports){
    assert.ok(file.width<=record.nativeDimensions[0]);assert.ok(read(file.path).length===file.bytes);
  }
  fixture.window.close();
});

test('Phase 3 preserves template heroes, navigation, journeys, logos and archived templates',()=>{
  const baseline=JSON.parse(read('docs/evidence/phase-3/baseline.json'));
  for(const [file,expected] of Object.entries(baseline.files)){
    // 21 October: the client explicitly reduced/relabelled the selector. Its
    // semantics are covered by design-shortlist.test.mjs; template protection remains.
    if(['index.html','shared/design-shortlist.js','shared/design-preview.js'].includes(file))continue;
    let bytes=read(file);
    const text=/\.(?:html|js|jsx|ts|tsx|css|json|md)$/.test(file);
    if(text)bytes=Buffer.from(bytes.toString().replace(/\r\n/g,'\n'));
    if(file==='option-d/index.html'||file==='option-e/index.html'){
      bytes=Buffer.from(bytes.toString().replace('<link rel="stylesheet" href="../shared/visuals.css">\n','').replace('<script type="module" src="../shared/visual-entry.js"></script>\n','').replace(/<link rel="stylesheet" href="\.\/refinement\.css(?:\?v=\d+)?">\n/,'').replace(/<script type="module" src="\.\/refinement\.js(?:\?v=\d+)?"><\/script>\n/,''));
    }
    assert.equal(hash(bytes),expected,file);
  }
  const home=read('option-a/src/components/pages/HomePage.tsx').toString();
  assert.equal(hash(home.split('<HeroSlideshow>')[1].split('</HeroSlideshow>')[0].replace(/\r\n/g,'\n')),baseline.aHeroMarkup);
});

for(const template of ['a','d','e'])test(`Template ${template}: imagery follows only the six editorial routes and leaves transactional pages clean`,async()=>{
  const dom=new JSDOM('<div id="root"><main id="home"><h1>Home</h1></main></div>',{url:`https://preview.test/option-${template}/`,pretendToBeVisual:true});
  const {window}=dom;
  for(const key of ['window','document','CustomEvent','FormData','AbortController'])globalThis[key]=key==='window'?window:window[key];
  window.scrollTo=()=>{};window.matchMedia=()=>({matches:false});
  const root=document.querySelector('#root'),home=document.querySelector('#home');
  const site=mountSite({root,home,template}),visuals=mountVisuals({root,home,template});
  if(template==='e'){
    const credits=[...root.querySelectorAll('.ik-footer a')].find(a=>a.textContent==='Photo credits');
    assert.equal(credits?.getAttribute('href'),'./photo-credits.html');
    const page=read('option-e/photo-credits.html').toString();
    for(const text of ['Clara Sanchiz','Mrnyben1313','https://creativecommons.org/licenses/by-sa/2.0/','https://creativecommons.org/licenses/by-sa/4.0/'])assert.ok(page.includes(text),text);
  }
  for(const path of Object.keys(pages)){
    if(path==='home')continue;
    window.location.hash='#/'+path;
    await new Promise(resolve=>window.addEventListener('hashchange',resolve,{once:true}));
    await new Promise(resolve=>setTimeout(resolve,0));
    const pictures=[...root.querySelectorAll('#ik-main [data-visual-asset]')];
    assert.equal(pictures.length,visualSlots[template][path]?1:0,path);
    if(pictures.length)assert.equal(pictures[0].dataset.visualAsset,visualSlots[template][path]);
    if(template==='e')assert.equal(root.querySelectorAll('.ik-visual-credit').length,0,path);
    assert.equal(root.querySelectorAll('form [data-visual-asset],.ik-plan-card [data-visual-asset],.ik-faq [data-visual-asset]').length,0,path);
  }
  visuals();site();dom.window.close();
});

test('archived B/C do not receive the Phase 3 presentation adapter',()=>{
  for(const template of ['b','c'])assert.doesNotMatch(read(`option-${template}/src/App.tsx`).toString(),/mountVisuals/);
});
