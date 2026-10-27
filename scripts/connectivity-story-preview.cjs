const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {createRequire}=require('node:module');
const req=createRequire('C:/Users/Efe-Dev/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json'),{chromium}=req('playwright');
const live=process.argv.includes('--live'),origin=live?'https://ikonecttclient-kappa.vercel.app':'http://127.0.0.1:3021/public_html';
const output=path.resolve('docs/evidence/connectivity-storytelling',live?'live':'local');fs.mkdirSync(output,{recursive:true});
const screenshotStyle='.ik-header,.ik-skip,.ik-assistant{visibility:hidden!important}';
(async()=>{const reviewIP=process.env.IKONECTT_REVIEW_HOST_IP;
const browser=await chromium.launch({headless:true,args:live&&reviewIP?[`--host-resolver-rules=MAP ikonecttclient-kappa.vercel.app ${reviewIP}`]:[]}),results=[];
try{
 for(const template of ['a','e'])for(const width of [1440,1024,768,390,320]){
  const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce',isMobile:width<768,hasTouch:width<768}),errors=[],failed=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)failed.push({status:r.status(),url:r.url()});});
  await page.goto(`${origin}/option-${template}/?production-preview#/home`,{waitUntil:'networkidle',timeout:45000});await page.evaluate(()=>document.fonts.ready);
  const home=page.locator('.ik-home'),hero=page.locator(template==='a'?'#home-hero':'.ik-home .hero');
  assert.equal(await page.locator('#home-benefits .ik-benefit-card').count(),6);assert.equal(await page.locator('.ik-home .ik-plan-card').count(),5);
  assert.equal(await page.locator('[data-brand-signature]').count(),1);assert.equal(await page.locator('#home-testimonials').count(),0);
  if(template==='a')assert.equal(await hero.locator('[data-hero-city-intro]').count(),0,'reduced motion skips intro');
  for(const [name,selector] of [['coverage',template==='a'?'#home-coverage':'.ik-home .coverage'],['about',template==='a'?'#home-company':'.ik-home .about'],['benefits','#home-benefits']]){
   const section=page.locator(selector);await section.scrollIntoViewIfNeeded();
   const images=await section.locator('[data-story-atmosphere] img').evaluateAll(images=>Promise.all(images.map(async img=>{await img.decode();const r=img.getBoundingClientRect();return {loaded:img.complete&&img.naturalWidth>0,width:r.width,height:r.height,sourceWidth:img.naturalWidth,pointer:getComputedStyle(img.parentElement).pointerEvents};})));
   assert.ok(images.every(i=>i.loaded&&i.width<=832.1&&i.height<=310.1&&i.pointer==='none'),JSON.stringify(images));
   if([1440,390].includes(width))await section.screenshot({path:path.join(output,`${template}-${name}-${width}.png`),style:screenshotStyle});
  }
  // Address launchers and About CTA retain their approved navigation.
  if(template==='a'){
   await page.locator('#home-coverage-input').fill('Example Street');await page.locator('#home-coverage-submit').click();
   await page.waitForFunction(()=>document.querySelector('.ik-site').dataset.route==='coverage');
   await page.evaluate(()=>location.hash='#/home');await page.locator('#home-about').click();await page.waitForFunction(()=>document.querySelector('.ik-site').dataset.route==='about');
  }
  await page.evaluate(()=>location.hash='#/residential');await page.locator('#ik-main .ik-flush-family').waitFor();
  const section=page.locator('#ik-main .ik-flush-family');await section.scrollIntoViewIfNeeded();await section.locator('.ik-campaign-picture img').evaluate(img=>img.decode());
  const geometry=await section.evaluate(section=>{const slot=section.querySelector('.ik-campaign-family'),picture=slot.querySelector('picture'),image=picture.querySelector('img'),s=slot.getBoundingClientRect(),r=picture.getBoundingClientRect(),text=section.querySelector('.ik-editorial>div:first-child').getBoundingClientRect();return {right:s.right,width:s.width,photoWidth:r.width,photoHeight:r.height,radius:getComputedStyle(slot).borderRadius,mask:getComputedStyle(picture).maskImage,fit:getComputedStyle(image).objectFit,textRight:text.right,photoLeft:r.left};});
  assert.ok(Math.abs(geometry.right-width)<1.1,JSON.stringify({template,width,geometry}));assert.equal(geometry.radius,'0px');assert.equal(geometry.fit,'cover');
  assert.equal((geometry.mask.match(/linear-gradient/g)||[]).length,width<1024?0:1,'one text-side blend only');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
  if(width>=1024)assert.ok(geometry.textRight<=geometry.photoLeft+geometry.photoWidth*.16+1,'text stays in the safe area');
  await section.screenshot({path:path.join(output,`${template}-flush-family-${width}.png`),style:screenshotStyle});
  await section.getByRole('link',{name:'Explore Residential Plans'}).click();await page.waitForFunction(()=>document.querySelector('.ik-site').dataset.route==='residential/plans');
  assert.equal(await page.locator('.ik-plan-grid .ik-plan-card').count(),5);
  assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);results.push({template,width,geometry,errors,failed});await page.close();
 }
 // Record the actual city-to-people dissolve, followed by the preserved carpet reveal.
 for(const width of [1440,390]){
  const page=await browser.newPage({viewport:{width,height:1000},isMobile:width<768,hasTouch:width<768});
  await page.goto(`${origin}/option-a/?production-preview#/home`,{waitUntil:'domcontentloaded',timeout:45000});await page.locator('#home-hero').waitFor();
  const hero=page.locator('#home-hero'),intro=hero.locator('[data-hero-city-intro]');
  if(await intro.count()){
   await intro.locator('img').evaluate(img=>img.decode());
   if(await intro.count())await hero.screenshot({path:path.join(output,`a-city-intro-${width}.png`),style:screenshotStyle});
  }
  assert.ok(await hero.getByRole('button',{name:'Check Coverage',exact:true}).isVisible());
  await page.waitForFunction(()=>document.querySelector('#home-hero').dataset.heroIntro==='complete',{},{timeout:5000});
  assert.equal(await hero.locator('[data-current]').getAttribute('data-slide'),'0');
  await hero.screenshot({path:path.join(output,`a-people-hero-${width}.png`),style:screenshotStyle});
  await hero.locator('[data-hero-step="1"]').click();await page.waitForFunction(()=>!!document.querySelector('.ik-hero-carpet-roll'));
  await page.waitForFunction(()=>document.querySelectorAll('#home-hero .ik-hero-picture').length===1);
  assert.equal(await hero.getAttribute('data-hero-playing'),'false');await page.close();
 }
}finally{await browser.close();}
fs.writeFileSync(path.join(output,'checks.json'),JSON.stringify({origin,results,normalHeroWidths:[1440,390]},null,2)+'\n');console.log(JSON.stringify({origin,responsiveChecks:results.length,normalHeroChecks:2,failures:0}));
})().catch(e=>{console.error(e);process.exitCode=1;});
