import {test,beforeEach} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {replaceCatalogue,catalogue,priceLabel,pricePeriod} from '../shared/catalogue.js';
import {detailHTML,planCardName} from '../shared/plan-ui.js';
const require=createRequire(import.meta.url),provider=require('../server/client-catalogue.js');
const env={WEBSITE_API_KEY:'private-test-key',IKONECTT_CATALOGUE_PROVIDER:'client'};
const row=(overrides={})=>({id:11,name:'i-Basic_50Mbps',category:'Residential',price_per_month:32500,currency:'NGN',download_mbps:50,upload_mbps:50,description:'',...overrides});
const response=data=>new Response(JSON.stringify({error:false,data}),{headers:{'Content-Type':'application/json'}});
const plansFetch=rows=>async()=>response({count:rows.length,plans:rows});
beforeEach(()=>provider.clearCache());
test('normalises exact monthly money, live upload rates, names and editorial descriptions without local price guesses',async()=>{
 const page=await provider.plans({limit:100},env,plansFetch([row(),row({id:16,name:'I-Silver_100Mbps',download_mbps:100,upload_mbps:20,price_per_month:65000}),row({id:15,name:'I-Business_100Mbps',category:'Business',download_mbps:100,upload_mbps:100,price_per_month:161787.5})]));
 assert.equal(page.total,3);assert.equal(page.items[2].priceMinor,16178750);assert.equal(page.items[1].uploadMbps,20);assert.equal(page.items[0].billingDays,null);assert.equal(page.items[0].billingPeriod,'MONTH');assert.equal(page.items[0].descriptionSource,'EDITORIAL');assert.match(page.items[1].description,/20 Mbps upload/);
 replaceCatalogue(page.items);assert.equal(planCardName(catalogue[0]),'i-Basic_50Mbps');assert.equal(pricePeriod(catalogue[0]),' / month');assert.match(detailHTML(catalogue[1]),/100 Mbps download and 20 Mbps upload/);assert.match(priceLabel(catalogue[2]),/161,787.50/);
});
test('client description wins; name mapping and generic descriptions use current API speeds',()=>{
 assert.deepEqual(provider.description(row({description:' Official description. '})),{description:'Official description.',descriptionSource:'CLIENT'});
 assert.match(provider.description(row({id:999,upload_mbps:33})).description,/33 Mbps upload/);
 assert.match(provider.description(row({id:999,name:'New plan',download_mbps:75})).description,/75 Mbps download/);
});
test('coalesces requests, preserves stable identities and original verification time, never serves an expired cache after failure',async()=>{
 let calls=0;const original=Date.now;let now=original();Date.now=()=>now;
 try{const fetcher=async(url,options)=>{calls++;assert.equal(options.headers['X-API-KEY'],env.WEBSITE_API_KEY);assert.equal(options.redirect,'error');return response({count:1,plans:[row()]});};
 const [a,b]=await Promise.all([provider.plans({},env,fetcher),provider.plans({},env,fetcher)]);assert.equal(calls,1);assert.equal(a.items[0].id,b.items[0].id);assert.equal(a.items[0].fetchedAt,b.items[0].fetchedAt);
 now+=61000;await assert.rejects(provider.plans({},env,async()=>{throw Error(env.WEBSITE_API_KEY)}),e=>e.status===503&&!e.message.includes(env.WEBSITE_API_KEY));
 }finally{Date.now=original;}
});
test('coverage uses actual provider search, supports multiple/no matches and qualifies exact-address feasibility',async()=>{
 let url;const fetcher=async u=>{url=u;return response({covered:true,count:2,matches:[{area:'Dolphin A',zone:'Zone 1'},{area:'Dolphin B',zone:'Zone 2'}]});};
 const found=await provider.areas({search:'dolphin'},env,fetcher);assert.equal(found.total,2);assert.match(url,/coverage\/check\?q=dolphin$/);assert.match(found.items[0].notice,/feasibility/);assert.equal(found.items[0].source,'CLIENT');
 const none=await provider.areas({search:'unmatched'},env,async()=>response({covered:false,count:0,matches:[]}));assert.equal(none.total,0);
 const list=await provider.areas({},env,async()=>response({zone_count:1,area_count:1,zones:[{name:'Zone 1',areas:['Dolphin A']}]}));assert.equal(list.items[0].id,found.items[0].id);
 await assert.rejects(provider.areas({search:'a'},env,fetcher),e=>e.status===400);
 await assert.rejects(provider.areas({search:'x'.repeat(101)},env,fetcher),e=>e.status===400);
});
test('missing keys, unavailable providers and invalid commercial responses fail closed',async()=>{
 await assert.rejects(provider.plans({},{}),e=>e.code==='CLIENT_CATALOGUE_NOT_CONFIGURED');
 for(const overrides of [{currency:'USD'},{price_per_month:1.001},{upload_mbps:0},{id:0},{category:'Unknown'}]){provider.clearCache();await assert.rejects(provider.plans({},env,plansFetch([row(overrides)])),e=>e.status===502);}
 provider.clearCache();await assert.rejects(provider.plans({},env,async()=>new Response('Denied',{status:401})),e=>e.status===503);
 assert.throws(()=>provider.enabled({IKONECTT_CATALOGUE_PROVIDER:'typo'}));
});
