const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{createRequire}=require('node:module');
const req=createRequire('C:/Users/Efe-Dev/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json'),{chromium}=req('playwright');
const live=process.argv.includes('--live'),origin=live?'https://ikonecttclient-kappa.vercel.app':'http://127.0.0.1:3021/public_html';
const out=path.resolve('docs/evidence/option-e-corporate-light',live?'live':'local');fs.mkdirSync(out,{recursive:true});
async function route(page,name){await page.evaluate(name=>location.hash='#/'+name,name);await page.waitForFunction(name=>document.querySelector('.ik-site')?.dataset.route===name,name);}
async function readyPictures(page){
 for(const selector of ['.hero','.pane.res','.pane.biz','.about','.portal','.ik-footer']){const section=page.locator('.ik-home '+selector+',body>'+selector).first();if(await section.count()){await section.scrollIntoViewIfNeeded();await section.locator('img').evaluateAll(images=>Promise.all(images.map(i=>i.decode())));}}
}
async function checkContrast(page){return page.evaluate(()=>{
 const rgb=s=>s.match(/[\d.]+/g).slice(0,3).map(Number),lum=c=>c.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((v,c,i)=>v+c*[.2126,.7152,.0722][i],0);
 return ['.hero h1','.hero .lead','.coverage h2','.finder input','.ik-plan-card h3','.ik-plan-price','.ik-benefit-card p','.ik-footer h2','.ik-footer-brand p','.ik-button','.btn.solid'].map(selector=>{
  const el=document.querySelector(selector),style=getComputedStyle(el);let bg=el;
  while(bg&&getComputedStyle(bg).backgroundColor==='rgba(0, 0, 0, 0)')bg=bg.parentElement;
  // Hero's photographic backdrop is bounded by the deliberately pale scrim.
  const color=lum(rgb(style.color)),background=selector.startsWith('.hero')?lum([235,239,243]):lum(rgb(getComputedStyle(bg).backgroundColor));
  return {selector,ratio:Math.round((Math.max(color,background)+.05)/(Math.min(color,background)+.05)*100)/100};
 });
});}
(async()=>{const ip=process.env.IKONECTT_REVIEW_HOST_IP,browser=await chromium.launch({headless:true,args:live&&ip?[`--host-resolver-rules=MAP ikonecttclient-kappa.vercel.app ${ip}`]:[]}),results=[];
try{
 for(const width of [1440,1280,1024,768,390,320]){
  const page=await browser.newPage({viewport:{width,height:1000},isMobile:width<768,hasTouch:width<768,reducedMotion:'reduce'}),errors=[],failed=[],requests=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)failed.push({status:r.status(),url:r.url()});});page.on('request',r=>requests.push(r.url()));
  await page.goto(`${origin}/option-e/?production-preview#/home`,{waitUntil:'domcontentloaded',timeout:45000});await page.locator('.ik-site[data-route=home]').waitFor();await page.evaluate(()=>document.fonts.ready);
  await readyPictures(page);await page.evaluate(()=>scrollTo(0,0));
  const theme=await page.evaluate(()=>({background:getComputedStyle(document.body).backgroundColor,text:getComputedStyle(document.body).color,scheme:getComputedStyle(document.body).colorScheme,overflow:document.documentElement.scrollWidth>innerWidth+1}));
  assert.deepEqual(theme,{background:'rgb(255, 255, 255)',text:'rgb(36, 39, 44)',scheme:'light',overflow:false});
  assert.equal(await page.locator('.hero').getAttribute('data-city-state'),'fallback');assert.equal(requests.some(u=>u.includes('three-lite.js')),false);
  assert.equal(await page.locator('.ik-benefit-card').count(),6);assert.equal(await page.locator('.ik-home .ik-plan-card').count(),5);assert.equal(await page.locator('#home-testimonials').count(),0);
  for(const selector of ['.ik-header .ik-logo img','.ik-footer .ik-logo img','.ik-assistant-header img'])assert.match(await page.locator(selector).getAttribute('src'),/ikonectt_transparent\.png$/);
  assert.equal(await page.locator('[data-e-people=family]').count(),1);assert.equal(await page.locator('[data-e-people=business]').count(),1);
  const contrast=await checkContrast(page);assert.ok(contrast.every(c=>c.ratio>=4.5),JSON.stringify(contrast));
  await page.screenshot({path:path.join(out,`homepage-${width}.png`),fullPage:true,style:'.ik-assistant{visibility:hidden!important}'});
  // Menus and mobile menu remain the same controls and routes.
  if(width<1024)await page.locator('.ik-mobile-button').click();
  await page.locator('[data-menu=residential]').click();assert.equal(await page.locator('[data-menu=residential]').getAttribute('aria-expanded'),'true');
  await page.keyboard.press('Escape');if(width<1024)await page.keyboard.press('Escape');
  // Local validation, coverage address hand-off, plans and account remain functional.
  await page.locator('#check').click();assert.equal(await page.locator('#addr').getAttribute('aria-invalid'),'true');
  await page.locator('#addr').fill('Example Street');await page.locator('#check').click();await page.waitForFunction(()=>document.querySelector('.ik-site').dataset.route==='coverage');
  for(const name of ['coverage','residential','business','residential/plans','support','my-ikonectt/sign-in','terms']){
   await route(page,name);await page.locator('#ik-main h1').waitFor();
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,name+' overflows');
   if([1440,390].includes(width))await page.screenshot({path:path.join(out,`${name.replaceAll('/','-')}-${width}.png`),fullPage:true,style:'.ik-assistant{visibility:hidden!important}'});
  }
  await route(page,'home');
  const businessTab=page.locator('.ik-home .ik-carousel-audiences button').filter({hasText:'Business'});await businessTab.click();assert.equal(await businessTab.getAttribute('aria-pressed'),'true');assert.ok(await page.locator('.ik-home .ik-plan-card').count()>0);
  await page.locator('.ik-home .ik-carousel-audiences button').filter({hasText:'Residential'}).click();
  // Welcome validation and the first conversational response use the unchanged engine.
  await page.locator('[data-launcher]').click();await page.getByRole('button',{name:'Start Conversation'}).click();assert.equal(await page.locator('[data-errors]').isVisible(),true);
  await page.locator('#ik-assistant-name').fill('Ada Example');await page.locator('#ik-assistant-phone').fill('08031234567');await page.getByRole('button',{name:'Start Conversation'}).click();
  await page.locator('[data-messages] .ik-assistant-message').first().waitFor();assert.match(await page.locator('[data-messages]').innerText(),/Ada/);
  await page.locator('[data-close]').click();
  assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);results.push({width,theme,contrast,errors,failed,reducedMotion:true});
  fs.writeFileSync(path.join(out,'checks.json'),JSON.stringify({origin,results},null,2)+'\n');console.log(`E light theme and journeys passed at ${width}px`);await page.close();
 }
 // Exercise real WebGL separately from the static/reduced-motion responsive review.
 for(const width of [1440,390]){
  const page=await browser.newPage({viewport:{width,height:1000},isMobile:width<768,hasTouch:width<768}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`${origin}/option-e/?production-preview#/home`,{waitUntil:'domcontentloaded',timeout:45000});await page.locator('.hero .actions .solid').waitFor();
  await page.waitForFunction(()=>document.querySelector('.hero').dataset.cityState==='ready',null,{timeout:20000});
  await page.waitForFunction(()=>JSON.parse(document.querySelector('.hero').dataset.cityMetrics).networkStage==='network-transmission',null,{timeout:15000});
  const hero=page.locator('.hero'),before=JSON.parse(await hero.getAttribute('data-city-metrics'));
  assert.equal(before.textures,2);assert.equal(before.buildings,width<1024?16:36);assert.ok(before.drawCalls<=12);assert.ok(before.meanRenderMs<12);
  await page.locator('.e-city-pause').click();assert.equal(await hero.getAttribute('data-city-paused'),'true');
  await hero.screenshot({path:path.join(out,`animated-hero-${width}.png`),style:'.ik-assistant{visibility:hidden!important}'});
  await page.locator('.e-city-pause').click();assert.equal(await hero.getAttribute('data-city-paused'),'false');
  await route(page,'support');assert.equal(await hero.getAttribute('data-city-paused'),'true');assert.deepEqual(errors,[]);
  results.push({width,normalMotion:true,metrics:before,errors});await page.close();
 }
 // A's established homepage still loads, displays plans and follows coverage navigation.
 const a=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});await a.goto(`${origin}/option-a/?production-preview#/home`,{waitUntil:'domcontentloaded',timeout:45000});await a.locator('#home-hero h1').waitFor();assert.equal(await a.locator('#home-hero [data-hero-city-intro]').count(),0);assert.equal(await a.locator('.ik-home .ik-plan-card').count(),5);await a.locator('#home-coverage-input').fill('Example Street');await a.locator('#home-coverage-submit').click();await a.waitForFunction(()=>document.querySelector('.ik-site').dataset.route==='coverage');await a.close();
 fs.writeFileSync(path.join(out,'checks.json'),JSON.stringify({origin,results,optionAFunctional:true},null,2)+'\n');console.log('PASS: six responsive E reviews, two real network render checks, A functional check');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
