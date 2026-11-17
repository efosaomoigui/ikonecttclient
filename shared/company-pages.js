import {publicContacts} from './content.js';
import {escapeHTML as esc} from './forms.js';

// Paraphrased from the client-supplied https://ikonectt.com/about-us-2/.
export function aboutPageHTML(){
 return `<section class="ik-section e-company-overview">
  <div class="ik-wrap e-company-overview-grid">
   <div>
    <p class="e-company-eyebrow">Our company</p>
    <h2>The company behind ikonectt.</h2>
    <p class="e-company-lead">ikonectt is the flagship broadband brand of Intelivision Technologies Limited, a Nigerian internet service provider.</p>
    <p>We bring together fibre connectivity and technical expertise for households, residential estates, offices and enterprise customers.</p>
   </div>
   <aside class="e-company-network">
    <p class="e-company-eyebrow">Our network</p>
    <h3>Connected through WIOCC.</h3>
    <p>Intelivision works with WIOCC to deliver broadband in Nigeria. Our network draws on Open Access Data Metro, Google Equiano and other infrastructure assets.</p>
    <ul aria-label="Infrastructure referenced by Intelivision"><li>WIOCC</li><li>Google Equiano</li><li>Open Access Data Metro</li></ul>
   </aside>
  </div>
 </section>
 <section class="ik-section e-company-audiences">
  <div class="ik-wrap e-company-panel">
   <p class="e-company-eyebrow">The people we connect</p>
   <h2>Who we serve.</h2>
   <div class="ik-grid e-company-services">
    <article class="ik-panel"><h3>Homes and estates</h3><p>Uncapped fixed-fibre broadband for everyday home life and residential communities.</p><a class="e-text-link" href="#/residential">Explore residential connectivity <span aria-hidden="true">→</span></a></article>
    <article class="ik-panel"><h3>Businesses and enterprise</h3><p>Connectivity options shaped around offices, organisations and larger business requirements.</p><a class="e-text-link" href="#/business">Explore business connectivity <span aria-hidden="true">→</span></a></article>
   </div>
  </div>
 </section>
 <section class="ik-section e-company-approach">
  <div class="ik-wrap e-company-approach-grid">
   <div><p class="e-company-eyebrow">Our approach</p><h2>How we work.</h2></div>
   <div><p>We discuss each customer’s location and requirements before confirming service options. Contact our team to ask about coverage, plan conditions and installation.</p><div class="ik-actions"><a class="ik-button" href="#/coverage">Check Coverage</a><a class="ik-button ik-button-secondary" href="#/contact">Talk to our team</a></div></div>
  </div>
 </section>`;
}

export function contactDetailsHTML(){
 const {address,emails,phones,socials}=publicContacts;
 const email=emails[0],phone=phones[0];
 const names={facebook:'Facebook',x:'X',instagram:'Instagram',linkedin:'LinkedIn'};
 return `<div class="ik-grid e-contact-grid">
  <article class="ik-panel e-contact-card"><h3>Office address</h3><p>${address.lines.map(esc).join('<br>')}</p><a class="e-text-link" href="${esc(address.mapUrl)}" target="_blank" rel="noopener noreferrer">View on map <span aria-hidden="true">↗</span></a></article>
  <article class="ik-panel e-contact-card"><h3>Customer support</h3><p>Send your enquiry to our customer care team.</p><a class="e-text-link" href="mailto:${esc(email.address)}">${esc(email.address)}</a></article>
  <article class="ik-panel e-contact-card"><h3>Contact by phone</h3><p>Call us to discuss your connection or service enquiry.</p><a class="e-text-link" href="tel:${esc(phone.number)}">${esc(phone.label)}</a></article>
 </div>
 <nav class="e-contact-profiles" aria-label="Official social profiles">${socials.map(item=>`<a class="e-text-link" href="${esc(item.url)}" target="_blank" rel="noopener noreferrer">${names[item.platform]} <span aria-hidden="true">↗</span></a>`).join('')}</nav>`;
}
