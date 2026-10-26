const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {createRequire}=require('node:module');
const runtime=createRequire(process.env.IKONECTT_RUNTIME_PACKAGE||'C:/Users/Efe-Dev/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json');
const {chromium}=runtime('playwright');
const output=path.resolve('docs/evidence/template-a-hero-refinement');
(async()=>{
 const browser=await chromium.launch({headless:true}),results=[];
 try{
  for(const width of [1440,390,320]){
   const reduced=width===320,page=await browser.newPage({viewport:{width,height:1000},deviceScaleFactor:1,reducedMotion:reduced?'reduce':'no-preference',isMobile:width<768,hasTouch:width<768}),errors=[];
   page.on('pageerror',error=>errors.push(error.message));
   await page.goto('http://127.0.0.1:3021/public_html/option-a/#/home',{waitUntil:'networkidle'});
   const hero=page.locator('#home-hero'),controls=hero.locator('[data-hero-controls]');
   await page.waitForFunction(()=>document.querySelector('#home-hero').dataset.heroState!=='loading');
   assert.equal(await controls.locator('button').count(),3);assert.equal(await hero.locator('[data-hero-position]').count(),0);
   assert.doesNotMatch(await controls.innerText(),/\d\s*\/\s*\d/);
   await hero.screenshot({path:path.join(output,`hero-${width}.png`),style:'.ik-header,.ik-skip,.ik-assistant{visibility:hidden!important}'});
   let firstChangeMs=null;
   if(!reduced){
    const start=Date.now();
    await page.waitForFunction(()=>document.querySelector('#home-hero [data-current]').dataset.slide!=='0',{},{timeout:8000});firstChangeMs=Date.now()-start;
    await page.waitForFunction(()=>document.querySelectorAll('#home-hero picture').length===1);
    assert.ok(firstChangeMs<7000,firstChangeMs);assert.equal(await hero.getAttribute('data-hero-playing'),'true');
   }else assert.equal(await hero.getAttribute('data-hero-playing'),'false');
   const prior=await hero.locator('[data-current]').getAttribute('data-slide');
   await controls.getByRole('button',{name:'Next slide'}).click();
   await page.waitForFunction(old=>document.querySelector('#home-hero [data-current]').dataset.slide!==old,prior);
   if(!reduced){
    await page.waitForFunction(()=>{const roll=document.querySelector('#home-hero .ik-hero-carpet-roll');return roll&&parseFloat(roll.style.left)>20;});
    assert.notEqual(await hero.locator('[data-current]').evaluate(el=>el.style.clipPath),'');
    assert.equal(await hero.locator('[data-current] img').evaluate(el=>getComputedStyle(el).transform),'none');
    await hero.screenshot({path:path.join(output,`carpet-mid-${width}.png`),style:'.ik-header,.ik-skip,.ik-assistant{visibility:hidden!important}'});
   }
   await page.waitForFunction(()=>document.querySelectorAll('#home-hero picture').length===1);
   assert.equal(await hero.locator('.ik-hero-carpet-roll').count(),0);
   assert.equal(await hero.locator('[data-current]').evaluate(el=>el.style.clipPath),'');
   assert.equal(await hero.getAttribute('data-hero-playing'),'false');
   assert.match(await hero.locator('[data-hero-announcement]').textContent(),/slide \d of 3/);
   const sizes=await controls.locator('button').evaluateAll(buttons=>buttons.map(button=>{const r=button.getBoundingClientRect();return {width:r.width,height:r.height};}));
   assert.ok(sizes.every(size=>size.width>=44&&size.height>=44));
   assert.deepEqual(errors,[]);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   results.push({width,reduced,controls:3,numericCounter:false,firstChangeMs,manualNavigation:true,carpetReveal:!reduced,foldCleaned:true,errors});await page.close();
  }
 }finally{await browser.close();}
 fs.writeFileSync(path.join(output,'browser-checks.json'),JSON.stringify(results,null,2)+'\n');console.log(JSON.stringify(results,null,2));
})().catch(error=>{console.error(error);process.exitCode=1;});
