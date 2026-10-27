// Customer-facing QA against the packaged app or the actual existing Vercel URL.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {createRequire}=require('node:module');
const runtime=createRequire(process.env.IKONECTT_RUNTIME_PACKAGE||'C:/Users/Efe-Dev/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json');
const {chromium}=runtime('playwright'),live=process.argv.includes('--live');
const origin=live?'https://ikonecttclient-kappa.vercel.app':'http://127.0.0.1:3021/public_html';
const output=path.resolve('docs/evidence/final-creative-refinement',live?'live':'local');fs.mkdirSync(output,{recursive:true});
(async()=>{
 const {pages,aliases}=await import('../shared/routes.js'),results=[],network=[];
 const reviewIP=process.env.IKONECTT_REVIEW_HOST_IP;
 const browser=await chromium.launch({headless:true,args:live&&reviewIP&&/^\d{1,3}(\.\d{1,3}){3}$/.test(reviewIP)?[`--host-resolver-rules=MAP ikonecttclient-kappa.vercel.app ${reviewIP}`]:[]});
 try{
  for(const template of ['a','e'])for(const width of [1440,768,390]){
   const page=await browser.newPage({viewport:{width,height:1000},deviceScaleFactor:1,reducedMotion:'reduce',isMobile:width<768,hasTouch:width<768}),errors=[],failed=[];
   page.on('pageerror',e=>errors.push(e.message));
   page.on('response',r=>{if(r.status()>=400)failed.push({status:r.status(),url:r.url()});});
   page.on('requestfailed',r=>{if(r.failure()?.errorText!=='net::ERR_ABORTED')failed.push({error:r.failure()?.errorText,url:r.url()});});
   await page.goto(`${origin}/option-${template}/?production-preview#/home`,{waitUntil:'networkidle',timeout:45000});
   await page.waitForFunction(()=>document.querySelector('.ik-site')?.dataset.route==='home');
   await page.evaluate(()=>document.fonts.ready);
   const dismiss=page.getByRole('button',{name:'Dismiss welcome invitation'});if(await dismiss.isVisible())await dismiss.click();
   assert.equal(await page.locator('[data-brand-signature]').count(),1);
   assert.equal(await page.locator('#home-benefits .ik-benefit-card').count(),6);
   assert.equal(await page.locator('#home-testimonials').count(),0);
   const signature=page.locator('.ik-brand-story');await signature.scrollIntoViewIfNeeded();
   await signature.screenshot({path:path.join(output,`${template}-brand-${width}.png`),style:'.ik-header,.ik-skip,.ik-assistant{visibility:hidden!important}'});
   const signatureStyle=await page.locator('[data-brand-signature]').evaluate(el=>({mask:getComputedStyle(el).maskImage,opacity:getComputedStyle(el).opacity}));
   assert.match(signatureStyle.mask,/ikonectt-i-mask/);assert.ok(+signatureStyle.opacity>0);
   const home=page.locator('.ik-home');
   const portal=page.locator(template==='a'?'#home-portal':'.portal-box');
   await portal.scrollIntoViewIfNeeded();await portal.locator('img').evaluateAll(images=>Promise.all(images.map(i=>i.decode())));
   await portal.screenshot({path:path.join(output,`${template}-portal-${width}.png`),style:'.ik-header,.ik-skip,.ik-assistant{visibility:hidden!important}'});
   assert.equal(await portal.locator(template==='a'?'[data-campaign=individual]':'.e-portal-portrait').count(),1);
   const hero=page.locator(template==='a'?'#home-hero':'.ik-home .hero');await hero.scrollIntoViewIfNeeded();
   await hero.screenshot({path:path.join(output,`${template}-hero-${width}.png`),style:'.ik-header,.ik-skip,.ik-assistant{visibility:hidden!important}'});
   if(template==='e'){
    assert.equal(await hero.locator('[data-creative-asset=city]').count(),1);
    assert.equal(await hero.getAttribute('data-city-state'),'fallback');
    const business=page.locator('.ik-home .pane.biz');await business.scrollIntoViewIfNeeded();
    await business.locator('img').evaluateAll(images=>Promise.all(images.map(i=>i.decode())));
    await business.screenshot({path:path.join(output,`e-business-panel-${width}.png`),style:'.ik-header,.ik-skip,.ik-assistant{visibility:hidden!important}'});
   }
   for(const route of Object.keys(pages)){
    if(route!=='home')await page.evaluate(route=>{location.hash='#/'+route;},route);
    await page.waitForFunction(route=>document.querySelector('.ik-site')?.dataset.route===route,route);
    const current=route==='home'?home:page.locator('#ik-main');
    assert.ok(await current.isVisible());
    const images=await current.locator('img').evaluateAll(images=>Promise.all(images.map(async i=>{i.loading='eager';try{await i.decode();}catch{}return {src:i.currentSrc||i.src,loaded:i.complete&&i.naturalWidth>0};})));
    assert.ok(images.every(i=>i.loaded),JSON.stringify({template,width,route,images}));
    assert.ok(images.every(i=>!/civic-tower-lagos-|lagos-skyline-/.test(i.src)),JSON.stringify({template,width,route,images}));
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,`${template}/${route}/${width}`);
    const heading=current.locator('h1').first();assert.ok((await heading.textContent()).trim());
    const bounds=await heading.boundingBox();assert.ok(bounds.x>=-1&&bounds.x+bounds.width<=width+1,`${template}/${route} heading`);
    if(['residential','coverage','business','about'].includes(route)&&width!==768){
     await current.locator('.ik-page-hero').screenshot({path:path.join(output,`${template}-${route}-${width}.png`),style:'.ik-header,.ik-skip,.ik-assistant{visibility:hidden!important}'});
    }
    const routes=await current.locator('[data-route]').evaluateAll(links=>links.map(a=>a.dataset.route));
    for(const destination of routes){const key=destination.split('?')[0];assert.ok(pages[key]||aliases[key],`Broken route ${destination}`);}
    results.push({template,width,route,images:images.length,overflow:false});
   }
   // Empty support form still validates and keeps the session in the welcome step.
   await page.getByRole('button',{name:'Open Ikonectt Support',exact:true}).click();
   const dialog=page.locator('#ik-assistant-panel');await dialog.getByRole('button',{name:'Start Conversation'}).click();
   assert.equal(await dialog.getAttribute('data-stage'),'welcome');assert.ok(await dialog.locator('[data-errors]').isVisible());
   await dialog.getByRole('button',{name:'Minimise Ikonectt Support'}).click();
   assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);
   network.push({template,width,errors,failed,signatureStyle});console.log(`Checked ${template.toUpperCase()} at ${width}px: ${Object.keys(pages).length} routes`);
   await page.close();
  }
  fs.writeFileSync(path.join(output,'checks.json'),JSON.stringify({origin,routeChecks:results.length,results,network},null,2)+'\n');
  // Readiness is explicit: city imports/rendering need not hold up navigation.
  // Exercise actual animation direction without reduced motion, and city pause.
  for(const template of ['a','e']){
   const page=await browser.newPage({viewport:{width:1440,height:1000}});
   await page.goto(`${origin}/option-${template}/?production-preview#/home`,{waitUntil:'domcontentloaded',timeout:45000});
   await page.waitForFunction(()=>document.querySelector('.ik-site')?.dataset.route==='home');
   if(template==='a'){
    const hero=page.locator('#home-hero');await hero.locator('[data-hero-step="1"]').click();
    await page.waitForFunction(()=>Boolean(document.querySelector('.ik-hero-carpet-roll')));
    await page.waitForFunction(()=>document.querySelectorAll('#home-hero picture').length===1);
    assert.equal(await hero.getAttribute('data-hero-playing'),'false');
   }else{
    await page.waitForFunction(()=>['ready','fallback'].includes(document.querySelector('.ik-home .hero').dataset.cityState));
    const hero=page.locator('.ik-home .hero'),pause=hero.locator('.e-city-pause');await pause.click();
    assert.equal(await hero.getAttribute('data-city-paused'),'true');
    await hero.screenshot({path:path.join(output,'e-animated-hero-paused-1440.png'),style:'.ik-header,.ik-skip,.ik-assistant{visibility:hidden!important}'});
   }
   await page.close();
  }
 }finally{await browser.close();}
 fs.writeFileSync(path.join(output,'checks.json'),JSON.stringify({origin,routeChecks:results.length,results,network},null,2)+'\n');
 console.log(JSON.stringify({origin,routeChecks:results.length,viewports:[1440,768,390],failures:0}));
})().catch(e=>{console.error(e);process.exitCode=1;});
