import {publicContacts} from '../shared/content.js';
import {escapeHTML as esc} from '../shared/forms.js';
import {officialPortal} from '../shared/public-data.js';
import {phoneInputHTML,phoneCountry,formatPhoneInput,normalizePhone} from '../shared/phone-input.js';
import {imageHTML} from './visual-map.js';

const icon=name=>`<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${{
 call:'<path d="M3 13v-2a9 9 0 0 1 18 0v6a4 4 0 0 1-4 4h-3"/><rect x="3" y="11" width="4" height="7" rx="2"/><rect x="17" y="11" width="4" height="7" rx="2"/>',
 email:'<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m3 5 9 7 9-7"/>',
 chat:'<path d="M21 15a3 3 0 0 1-3 3H9l-6 4V6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3Z"/><path d="M7 8h10M7 12h7"/>',
 pin:'<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 0 1 14 0Z"/><circle cx="12" cy="10" r="2.5"/>',
 faq:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 4 2c-1.5 1-1.5 1.5-1.5 3m0 3v.1"/>',
 wifi:'<path d="M3 8a15 15 0 0 1 18 0M6 12a10 10 0 0 1 12 0M9 16a5 5 0 0 1 6 0"/><circle cx="12" cy="20" r=".8"/>',
 account:'<circle cx="12" cy="7" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
}[name]}</svg>`;
export function contactSupportPageHTML(formHTML){
 const phone=publicContacts.phones[0],email=publicContacts.emails[0],address=publicContacts.address;
 const form=formHTML.replace(/^<p class="ik-notice">[\s\S]*?<\/p>/,'');
 return `<section class="ik-section e-support-channels"><div class="ik-wrap"><header class="e-support-section-heading"><p class="e-section-kicker">CUSTOMER CARE</p><h2>Connect with our team.</h2></header><div class="e-support-channel-grid">
 <a class="e-support-channel" href="tel:${esc(phone.number)}">${icon('call')}<h3>Call us.</h3><span>${esc(phone.label)}</span></a>
 <a class="e-support-channel" href="mailto:${esc(email.address)}">${icon('email')}<h3>Email us.</h3><span>${esc(email.address)}</span></a>
 <a class="e-support-channel" data-support-whatsapp aria-disabled="true" target="_blank" rel="noopener noreferrer">${icon('chat')}<h3>Chat on WhatsApp.</h3><span data-support-whatsapp-status role="status">Loading contact details...</span></a>
 </div></div></section>
 <section class="ik-section e-support-enquiry"><div class="ik-wrap"><div class="e-support-enquiry-grid"><div class="e-support-enquiry-copy"><p class="e-section-kicker">GET IN TOUCH</p><h2>How can we help you?</h2><p>Send us your enquiry and our customer-care team will help you with the next steps.</p><figure class="e-support-enquiry-photo">${imageHTML('account-photo',{sizes:'(max-width:767px) 100vw,45vw'})}</figure><div class="e-support-office">${icon('pin')}<div><h3>Visit our office</h3><p>${address.lines.map(esc).join('<br>')}</p><a href="${esc(address.mapUrl)}" target="_blank" rel="noopener noreferrer">View on map</a></div></div></div><div class="e-support-form-card"><h3>Send an enquiry.</h3>${form}</div></div></div></section>
 <section class="ik-section e-support-quick"><div class="ik-wrap"><h2>Looking for a quick answer?</h2><nav class="e-support-quick-grid" aria-label="Quick assistance"><a href="#/support/faqs">${icon('faq')}<span>FAQs</span></a><a href="#/support/troubleshooting">${icon('wifi')}<span>Troubleshooting</span></a><a href="${officialPortal}" target="_blank" rel="noopener noreferrer">${icon('account')}<span>My Ikonectt</span></a></nav></div></section>`;
}

export function initializeContactSupport(main,client,{signal}={}){
 const form=main.querySelector('.e-support-form-card form[data-form="support"]');if(!form)return;
 const original=form.elements.namedItem('phone');
 if(original&&!form.querySelector('.ik-assistant-phone')){
  const wrapper=main.ownerDocument.createElement('div');wrapper.innerHTML=phoneInputHTML({id:original.id,describedBy:original.getAttribute('aria-describedby')||''});
  wrapper.querySelector('input').value=original.value;original.replaceWith(wrapper.firstElementChild);
 }
 const opts=signal?{signal}:{};
 form.addEventListener('change',event=>{if(event.target.name==='country')phoneCountry(form);},opts);
 form.addEventListener('focusout',event=>{if(event.target.name==='phone')formatPhoneInput(form);},opts);
 form.addEventListener('submit',event=>{
  try{form.elements.phone.value=normalizePhone(form.elements.phone.value,'NG');}
  catch(error){event.preventDefault();event.stopPropagation();const field=form.elements.phone;field.setAttribute('aria-invalid','true');form.querySelector('#'+field.id+'-error').textContent=error.message;const summary=form.querySelector('.ik-error-summary');summary.hidden=false;summary.textContent=error.message;field.focus();}
 },opts);
 const whatsapp=main.querySelector('[data-support-whatsapp]');
 const status=main.querySelector('[data-support-whatsapp-status]');
 if(client)void client.contacts().then(contacts=>{
  if(!whatsapp.isConnected||signal?.aborted)return;
  whatsapp.href=contacts.whatsappUrl;whatsapp.removeAttribute('aria-disabled');status.textContent='Start a conversation';
 }).catch(()=>{if(status.isConnected)status.textContent='Please call or email us instead.';});
 else status.textContent='Contact details are currently unavailable. Please call or email us.';
}
