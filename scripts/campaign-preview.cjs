// Local browser QA only. Uses the bundled workspace Playwright runtime.
const fs=require('node:fs');
const path=require('node:path');
const {createRequire}=require('node:module');
const {execFileSync}=require('node:child_process');
const runtime=createRequire(process.env.IKONECTT_RUNTIME_PACKAGE||'C:/Users/Efe-Dev/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json');
const {chromium}=runtime('playwright');
const phase=process.argv[2]||'after';
const out=path.resolve('docs/evidence/client-campaign');
const baselineRef=JSON.parse(fs.readFileSync(path.join(out,'preservation.json'))).baseCommit;
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true});
 const results=[];
 try{
  for(const template of ['a','e'])for(const width of phase==='before'?[1440,390]:[1440,1280,1024,768,390,320]){
   const page=await browser.newPage({viewport:{width,height:1000},deviceScaleFactor:1,reducedMotion:'reduce'});
   const errors=[];page.on('pageerror',error=>errors.push(error.message));
   if(phase==='before')await page.route('**/*',async route=>{
    const pathname=new URL(route.request().url()).pathname;
    const index=pathname===`/public_html/option-${template}/`;
    const bundle=template==='a'&&/^\/public_html\/option-a\/assets\/index-[^/]+\.(js|css)$/.test(pathname);
    if(index||bundle){
     const file=index?`public_html/option-${template}/index.html`:pathname.slice(1);
     await route.fulfill({body:execFileSync('git',['show',`${baselineRef}:${file}`]),contentType:bundle?(file.endsWith('.css')?'text/css':'text/javascript'):'text/html'});
    }else await route.continue();
   });
   for(const route of ['residential','home']){
    await page.goto(`http://127.0.0.1:3021/public_html/option-${template}/#/${route}`,{waitUntil:'networkidle'});
    await page.evaluate(()=>document.fonts.ready);
    const dismiss=page.getByRole('button',{name:'Dismiss welcome invitation'});
    if(await dismiss.isVisible())await dismiss.click();
    const selector=route==='residential'?'#ik-main section:has(>.ik-wrap>.ik-editorial)':template==='a'?'#home-portal':'.portal-box';
    const section=page.locator(selector);
    await section.scrollIntoViewIfNeeded();
    await page.locator(`${selector} img`).evaluateAll(imgs=>Promise.all(imgs.map(i=>i.decode().catch(()=>{}))));
    if(phase==='after'&&route==='home'){
     if(template==='a'&&await section.locator('[data-campaign=individual]').count()!==1)throw Error('A must show the campaign man');
     if(template==='e'){
      const portrait=section.locator('.e-portal-portrait img');
      if(!(await portrait.getAttribute('src')).includes('my-ikonectt-woman-'))throw Error('E must retain the woman with her laptop');
      if(await section.locator('[data-campaign=individual]').count())throw Error('E must not replace the woman with the man');
     }
    }
    const measurement=await section.evaluate(el=>{
     const box=node=>{const r=node.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom};};
     const picture=el.querySelector('.ik-campaign-picture'),image=picture?.querySelector('img');
     let photo=null;
     if(image){const r=box(image);if(getComputedStyle(image).objectFit==='cover')photo=r;else{const scale=Math.min(r.width/image.naturalWidth,r.height/image.naturalHeight),w=image.naturalWidth*scale,h=image.naturalHeight*scale;photo={x:r.x+(r.width-w)/2,y:r.bottom-h,width:w,height:h,right:r.x+(r.width+w)/2,bottom:r.bottom};}}
     return {section:box(el),image:picture?box(picture):null,photo,images:[...el.querySelectorAll('img')].map(i=>({src:i.currentSrc,loaded:i.complete&&i.naturalWidth>0})),text:[...el.querySelectorAll('h2,p,a,button')].map(n=>({text:n.textContent.trim(),box:box(n)})),overflow:document.documentElement.scrollWidth>innerWidth};
    });
    results.push({template,width,route,...measurement,errors:[...errors]});
    if([1440,390,320].includes(width))await section.screenshot({path:path.join(out,`${phase}-${template}-${route}-${width}.png`)});
   }
   await page.close();
  }
 }finally{await browser.close();}
 fs.writeFileSync(path.join(out,`${phase}-measurements.json`),JSON.stringify(results,null,2)+'\n');
 const collisions=results.flatMap(x=>!x.photo?[]:x.text.filter(t=>{const a=t.box,b=x.photo;return Math.min(a.right,b.right)-Math.max(a.x,b.x)>1&&Math.min(a.bottom,b.bottom)-Math.max(a.y,b.y)>1;}).map(t=>[x.template,x.width,x.route,t.text]));
 const outside=results.filter(x=>x.photo&&(x.photo.x<x.section.x-1||x.photo.right>x.section.right+1||x.photo.y<x.section.y-1||x.photo.bottom>x.section.bottom+1)).map(x=>[x.template,x.width,x.route]);
 const report={phase,checks:results.length,overflow:results.filter(x=>x.overflow).map(x=>[x.template,x.width,x.route]),unloaded:results.flatMap(x=>x.images.filter(i=>!i.loaded)),errors:results.flatMap(x=>x.errors),collisions,outside};
 console.log(JSON.stringify(report,null,2));
 if(report.overflow.length||report.unloaded.length||report.errors.length||collisions.length||outside.length)process.exitCode=1;
})().catch(error=>{console.error(error);process.exitCode=1;});
