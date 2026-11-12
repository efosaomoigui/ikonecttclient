import {footerContacts} from './footer-contacts.js';

const paths={
 location:'<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
 email:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
 phone:'<path d="m8 3 3 5-3 3a15 15 0 0 0 5 5l3-3 5 3-1 4c-1 2-6 0-10-3S2 9 3 5l1-2Z"/>',
 facebook:'<path d="M14 21v-8h3l.5-4H14V7c0-1 .5-2 2-2h2V2h-3c-4 0-5 3-5 5v2H7v4h3v8Z"/>',
 x:'<path d="M4 3h4l12 18h-4ZM20 3 4 21"/>',
 instagram:'<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8"/>',
 linkedin:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 10v7M11 17v-7m0 3c0-4 6-4 6 0v4"/><circle cx="7" cy="7" r=".7"/>',
};
const socialNames={facebook:'Facebook',x:'X',instagram:'Instagram',linkedin:'LinkedIn'};
const socialHosts={facebook:['facebook.com','www.facebook.com'],x:['x.com','www.x.com','twitter.com','www.twitter.com'],instagram:['instagram.com','www.instagram.com'],linkedin:['linkedin.com','www.linkedin.com']};
const mapHosts=['www.google.com','maps.google.com','maps.app.goo.gl','www.openstreetmap.org'];
const safeURL=(value,hosts)=>{
 try {const url=new URL(value);return url.protocol==='https:'&&!url.username&&!url.password&&hosts.includes(url.hostname)?url.href:null;} catch {return null;}
};
const svg=(doc,name,className)=>{
 const icon=doc.createElementNS('http://www.w3.org/2000/svg','svg');
 icon.setAttribute('viewBox','0 0 24 24');icon.setAttribute('fill','none');icon.setAttribute('stroke','currentColor');icon.setAttribute('stroke-width','1.7');icon.setAttribute('stroke-linecap','round');icon.setAttribute('stroke-linejoin','round');icon.setAttribute('aria-hidden','true');icon.setAttribute('focusable','false');icon.setAttribute('class',className);icon.innerHTML=paths[name];return icon;
};
const external=anchor=>{anchor.target='_blank';anchor.rel='noopener noreferrer';};

export function mountFooter(root,contacts=footerContacts){
 if(root?.dataset.template!=='e')return ()=>{};
 const footer=root.querySelector('.ik-footer'),bottom=footer?.querySelector('.ik-footer-bottom');
 if(!bottom||footer.querySelector('.e-footer-contact-strip'))return ()=>{};
 const doc=root.ownerDocument,location=doc.defaultView.location;
 const localSample=['localhost','127.0.0.1','[::1]','::1'].includes(location.hostname)&&!new URLSearchParams(location.search).has('production-preview');
 const address=contacts.address?.verified===true&&Array.isArray(contacts.address.lines)&&contacts.address.lines.length
  ?contacts.address:localSample?{lines:['12 Example Avenue','Lagos, Nigeria'],sample:true}:null;
 const emails=(contacts.emails||[]).filter(item=>item.verified===true&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item.address));
 const phones=(contacts.phones||[]).filter(item=>item.verified===true&&/^\+[1-9]\d{6,14}$/.test(item.number));
 const socials=(contacts.socials||[]).filter(item=>item.verified===true&&socialNames[item.platform]&&safeURL(item.url,socialHosts[item.platform]));
 const strip=doc.createElement('section');strip.className='e-footer-contact-strip';strip.setAttribute('aria-label','Contact and social media');
 const group=(title,icon)=>{
  const outer=doc.createElement('div');outer.className='e-footer-contact-group';
  if(icon)outer.append(svg(doc,icon,'e-footer-contact-icon'));
  const content=doc.createElement('div');content.className='e-footer-contact-content';
  const heading=doc.createElement('h2');heading.textContent=title;content.append(heading);outer.append(content);strip.append(outer);return content;
 };
 if(address){
  const content=group('Office Address','location'),office=doc.createElement('address');
  address.lines.forEach((line,index)=>{if(index)office.append(doc.createElement('br'));office.append(doc.createTextNode(String(line)));});
  const map=address.verified&&safeURL(address.mapUrl,mapHosts);
  if(map){const link=doc.createElement('a');link.href=map;external(link);link.append(office);content.append(link);}else content.append(office);
  if(address.sample){const label=doc.createElement('span');label.className='e-footer-sample-label';label.textContent='Sample address · local review';content.append(label);}
 }
 if(emails.length){
  const content=group('Email Contacts');
  emails.forEach(item=>{const row=doc.createElement('div');row.className='e-footer-channel-row';row.append(svg(doc,'email','e-footer-contact-icon'));const link=doc.createElement('a');link.href='mailto:'+item.address;link.textContent=item.address;if(item.label)link.setAttribute('aria-label',item.label+': '+item.address);row.append(link);content.append(row);});
 }
 if(phones.length){
  const content=group('Telephone');
  phones.forEach(item=>{const row=doc.createElement('div');row.className='e-footer-channel-row';row.append(svg(doc,'phone','e-footer-contact-icon'));const link=doc.createElement('a');link.href='tel:'+item.number;link.textContent=item.label||item.number;row.append(link);content.append(row);});
 }
 if(socials.length){
  const content=group('Social Media'),row=doc.createElement('div');row.className='e-footer-social-links';
  socials.forEach(item=>{const link=doc.createElement('a');link.className='e-footer-social-link';link.href=safeURL(item.url,socialHosts[item.platform]);link.setAttribute('aria-label',socialNames[item.platform]+' (opens in a new tab)');link.title=socialNames[item.platform];external(link);link.append(svg(doc,item.platform,'e-footer-social-icon'));row.append(link);});content.append(row);
 }
 if(strip.children.length){strip.style.setProperty('--e-contact-groups',String(strip.children.length));bottom.before(strip);}
 // Use the existing official light wordmark against the charcoal background.
 const logo=footer.querySelector('.ik-logo img'),original=logo?.getAttribute('src');
 if(logo)logo.src=new URL('../assets/logos/ikonectt_white_transparent.png',import.meta.url).href;
 return ()=>{strip.remove();if(logo&&original)logo.setAttribute('src',original);};
}
if(typeof document!=='undefined')mountFooter(document.querySelector('.ik-site[data-template=e]'));
