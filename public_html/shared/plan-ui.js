import {plansFor,getPlan,planName,priceLabel,previewPricingNote,detailRoute,planRoute} from './catalogue.js';
import {escapeHTML as esc} from './forms.js';
const anchor=(route,label,secondary=false)=>`<a class="ik-button${secondary?' ik-button-secondary':''}" href="#/${esc(route)}">${esc(label)}</a>`;
export const pricingNoteHTML=()=>`<p class="ik-pricing-note">${previewPricingNote}</p>`;
export function planCardHTML(plan,{carousel=false,index=0,count=0}={}){
  const home=plan.audience==='residential',label=planName(plan);
  return `<article class="ik-plan-card" data-plan-id="${plan.id}" ${carousel?`role="group" aria-roledescription="slide" aria-label="${index+1} of ${count}: ${esc(label)}"`:''}>
    <div class="ik-plan-card-top"><span class="ik-plan-audience">${home?'Residential':'Business'}</span><span class="ik-plan-order" aria-hidden="true">${String(plan.displayOrder).padStart(2,'0')}</span></div>
    <h3>${esc(label)}</h3><p class="ik-plan-speed"><strong>${plan.speedMbps}</strong> <span>Mbps</span></p>
    <p class="ik-plan-price"><strong>${priceLabel(plan)}</strong><span> /month</span></p>
    <ul class="ik-plan-attributes">${plan.verifiedAttributes.map(item=>`<li>${esc(item.value)}</li>`).join('')}<li>Monthly billing</li></ul>
    <div class="ik-plan-card-actions">${home?anchor(detailRoute(plan),'View Plan Details'):anchor(planRoute('business/quote',plan),'Request a Quote')}${anchor(planRoute('coverage',plan),'Check Coverage',true)}</div>
  </article>`;
}
export function catalogueHTML(audience){return `<div class="ik-plan-grid" aria-label="${audience==='business'?'Business':'Residential'} plan catalogue">${plansFor(audience).map(plan=>planCardHTML(plan)).join('')}</div>${pricingNoteHTML()}`;}
const arrow=direction=>`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${direction==='previous'?'m14 6-6 6 6 6':'m10 6 6 6-6 6'}"/></svg>`;
export function carouselHTML(audience='residential'){
  return `<div class="ik-plan-carousel" data-plan-carousel role="region" aria-roledescription="carousel" aria-label="Broadband plans">
    <div class="ik-carousel-toolbar"><div class="ik-carousel-audiences" role="group" aria-label="Plan audience">${['residential','business'].map(value=>`<button type="button" data-carousel-audience="${value}" aria-pressed="${value===audience}">${value==='residential'?'Residential':'Business'}</button>`).join('')}</div><div class="ik-carousel-arrows"><button type="button" data-carousel-step="-1" aria-label="Previous plan">${arrow('previous')}</button><button type="button" data-carousel-step="1" aria-label="Next plan">${arrow('next')}</button></div></div>
    <div class="ik-carousel-rail" tabindex="0" aria-label="Plans. Use left and right arrow keys to browse.">${plansFor(audience).map((plan,index,items)=>planCardHTML(plan,{carousel:true,index,count:items.length})).join('')}</div>
    <div class="ik-carousel-bottom"><p class="ik-carousel-status" aria-live="polite" aria-atomic="true"></p><div class="ik-actions" data-carousel-links></div></div>${pricingNoteHTML()}</div>`;
}
export function detailHTML(plan){
  return `<div class="ik-plan-detail"><div><span class="ik-badge">Residential</span><h2>${esc(planName(plan))}</h2><p class="ik-plan-speed"><strong>${plan.speedMbps}</strong> <span>Mbps</span></p><p class="ik-plan-price"><strong>${priceLabel(plan)}</strong><span> /month</span></p><p class="ik-muted">Fibre broadband with monthly billing.</p><div class="ik-actions">${anchor(planRoute('coverage',plan),'Check Coverage')}${anchor(planRoute('residential/installation',plan),'Installation Enquiry',true)}</div></div><div class="ik-plan-facts"><h3>Plan at a glance</h3><dl><div><dt>Connection</dt><dd>Fibre broadband</dd></div><div><dt>Billing</dt><dd>Monthly, NGN</dd></div><div><dt>Availability</dt><dd>Requires address verification</dd></div><div><dt>Installation, equipment and usage terms</dt><dd>To be confirmed by Ikonectt</dd></div></dl>${anchor('residential/compare?first='+plan.id,'Compare Plans',true)}</div></div>${pricingNoteHTML()}`;
}
export function comparisonHTML(firstId,secondId){
  const defaults=plansFor('residential'),first=getPlan(firstId)?.audience==='residential'?getPlan(firstId):defaults[0],second=getPlan(secondId)?.audience==='residential'?getPlan(secondId):defaults[2],plans=[first,second];
  const rows=[['Monthly price',plan=>priceLabel(plan)],['Speed',plan=>plan.speedMbps+' Mbps'],['Billing period',()=> 'Monthly'],['Connection',()=> 'Fibre broadband'],['Address availability',()=> 'Requires verification'],['Installation, equipment and usage terms',()=> 'To be confirmed']];
  return `<div class="ik-table-wrap ik-plan-comparison" tabindex="0" role="region" aria-label="Residential plan comparison, scroll horizontally on small screens"><table class="ik-table"><caption>Residential plans compared</caption><thead><tr><th scope="col">Attribute</th>${plans.map(plan=>`<th scope="col">${esc(planName(plan))}</th>`).join('')}</tr></thead><tbody>${rows.map(([label,value])=>`<tr><th scope="row">${label}</th>${plans.map(plan=>`<td>${value(plan)}</td>`).join('')}</tr>`).join('')}<tr><th scope="row">Explore this plan</th>${plans.map(plan=>`<td><div class="ik-actions">${anchor(detailRoute(plan),'View '+planName(plan))}${anchor(planRoute('coverage',plan),'Check Coverage',true)}${anchor(planRoute('residential/installation',plan),'Select '+planName(plan),true)}</div></td>`).join('')}</tr></tbody></table></div>${pricingNoteHTML()}`;
}
