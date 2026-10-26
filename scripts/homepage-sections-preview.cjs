// Browser verification of the two homepage additions and production omission.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {createRequire}=require('node:module');
const runtime=createRequire(process.env.IKONECTT_RUNTIME_PACKAGE||'C:/Users/Efe-Dev/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json');
const {chromium}=runtime('playwright');
const output=path.resolve('docs/evidence/homepage-sections');fs.mkdirSync(output,{recursive:true});
const widths=[1440,1280,1024,768,390,320];
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.woff2':'font/woff2'};
(async()=>{
 const browser=await chromium.launch({headless:true}),results=[],published=[];
 try{
  for(const template of ['a','e'])for(const width of widths){
   const page=await browser.newPage({viewport:{width,height:1000},deviceScaleFactor:1,reducedMotion:'reduce',isMobile:width<768,hasTouch:width<768}),errors=[];
   page.on('pageerror',error=>errors.push(error.message));
   await page.goto(`http://127.0.0.1:3021/public_html/option-${template}/#/home`,{waitUntil:'networkidle'});
   await page.locator('#home-testimonials').waitFor();await page.evaluate(()=>document.fonts.ready);
   const dismiss=page.getByRole('button',{name:'Dismiss welcome invitation'});if(await dismiss.isVisible())await dismiss.click();
   for(const type of ['benefits','testimonials']){
    const section=page.locator(`#home-${type}`);await section.scrollIntoViewIfNeeded();
    const info=await section.evaluate((node,type)=>{
     const cardSelector=type==='benefits'?'.ik-benefit-card':'.ik-testimonial-card',grid=node.querySelector(type==='benefits'?'.ik-benefits-grid':'.ik-testimonials-grid');
     const cards=[...node.querySelectorAll(cardSelector)];
     const box=el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom};};
     const section=box(node);
     return {section,columns:getComputedStyle(grid).gridTemplateColumns.split(' ').length,cards:cards.map(card=>({box:box(card),overflow:card.scrollWidth>card.clientWidth+1||card.scrollHeight>card.clientHeight+1})),overflow:document.documentElement.scrollWidth>innerWidth,heading:node.querySelector('h2').textContent,demo:node.dataset.testimonialMode||null,portraitCount:node.querySelectorAll('img').length,ratingCount:node.querySelectorAll('.ik-customer-rating').length,icons:node.querySelectorAll('svg').length,transitions:cards.map(card=>getComputedStyle(card).transitionDuration)};
    },type);
    assert.equal(info.columns,type==='benefits'?(width>=1024?3:width>=640?2:1):(width>=768?2:1));
    assert.equal(info.cards.length,type==='benefits'?6:2);assert.equal(info.overflow,false);
    for(const card of info.cards){assert.equal(card.overflow,false);assert.ok(card.box.x>=info.section.x-1&&card.box.right<=info.section.right+1);}
    const heights=info.cards.map(card=>card.box.height);assert.ok(Math.max(...heights)-Math.min(...heights)<2);
    assert.ok(info.transitions.every(duration=>duration.split(',').every(value=>parseFloat(value)===0)),'reduced-motion card transitions');
    if(type==='testimonials'){assert.equal(info.demo,'demo');assert.equal(info.portraitCount,0);assert.equal(info.ratingCount,0);}
    else assert.equal(info.icons,6);
    results.push({template,width,type,...info,errors:[...errors]});
    // Component evidence omits unrelated fixed chrome only during the screenshot.
    // The live header, skip link and support assistant are never modified.
    if([1440,390,320].includes(width))await section.screenshot({path:path.join(output,`${template}-${type}-${width}.png`),style:'.ik-header,.ik-skip,.ik-assistant{visibility:hidden!important}'});
   }
   const order=await page.locator('.ik-home').evaluate(home=>{
    const nodes=[home.querySelector('#plans'),home.querySelector('#home-benefits'),home.querySelector('#home-testimonials'),home.querySelector('#home-portal,.portal')];
    return nodes.every((node,index)=>!index||Boolean(nodes[index-1].compareDocumentPosition(node)&Node.DOCUMENT_POSITION_FOLLOWING));
   });assert.equal(order,true);assert.deepEqual(errors,[]);
   // Existing destination remains usable after adding the review sections.
   if(width===390){
    const portal=page.locator(template==='a'?'#home-my-ikonectt':'.portal-box > a');await portal.click();
    await page.locator('#ik-main h1').waitFor();assert.equal(await page.locator('.ik-site').getAttribute('data-route'),'my-ikonectt/sign-in');
    assert.equal(await page.locator('.ik-home').isVisible(),false);
    await page.goto(`http://127.0.0.1:3021/public_html/option-${template}/#/home`,{waitUntil:'networkidle'});await page.locator('#home-testimonials').waitFor();
    assert.equal(await page.locator('#home-benefits').count(),1);assert.equal(await page.locator('#home-testimonials').count(),1);
   }
   await page.close();
  }
  // Serve the actual build on an intercepted public origin: no deployment needed.
  for(const template of ['a','e']){
   const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),reviewRequests=[];
   await page.route('https://release-preview.test/**',async route=>{
    const pathname=decodeURIComponent(new URL(route.request().url()).pathname);
    if(pathname.includes('/assets/review/'))reviewRequests.push(pathname);
    const relative=pathname.endsWith('/')?pathname+'index.html':pathname;
    const file=path.resolve('public_html','.'+relative),root=path.resolve('public_html')+path.sep;
    if(!file.startsWith(root)||!fs.existsSync(file)||!fs.statSync(file).isFile())return route.fulfill({status:404,body:'Not found'});
    await route.fulfill({body:fs.readFileSync(file),contentType:mime[path.extname(file)]||'application/octet-stream'});
   });
   await page.goto(`https://release-preview.test/option-${template}/?review=testimonials#/home`,{waitUntil:'networkidle'});
   assert.equal(await page.locator('#home-benefits .ik-benefit-card').count(),6);
   assert.equal(await page.locator('#home-testimonials').count(),0);assert.deepEqual(reviewRequests,[]);
   published.push({template,benefits:6,testimonials:0,reviewRequests:0});await page.close();
  }
  // Hover feedback is deliberate and does not run continuously.
  const hover=await browser.newPage({viewport:{width:1440,height:1000}});
  for(const template of ['a','e']){
   await hover.goto(`http://127.0.0.1:3021/public_html/option-${template}/#/home`,{waitUntil:'networkidle'});
   const card=hover.locator('.ik-benefit-card').first();await card.scrollIntoViewIfNeeded();
   const before=await card.evaluate(node=>getComputedStyle(node).borderTopColor);await card.hover();
   await hover.waitForFunction(([selector,initial])=>getComputedStyle(document.querySelector(selector)).borderTopColor!==initial,['.ik-benefit-card',before]);
   await hover.mouse.move(0,0);
  }await hover.close();
 }finally{await browser.close();}
 assert.equal(fs.existsSync('public_html/assets/review/homepage-sections/demo-testimonials.json'),false);
 fs.writeFileSync(path.join(output,'measurements.json'),JSON.stringify({results,published},null,2)+'\n');
 console.log(JSON.stringify({responsiveChecks:results.length,widths,errors:results.flatMap(result=>result.errors),published},null,2));
})().catch(error=>{console.error(error);process.exitCode=1;});
