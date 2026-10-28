// Same 24px, rounded, open-stroke language as the approved benefit icons.
const paths={
 laptop:'<rect x="4" y="3" width="16" height="13" rx="2"/><path d="m4 16-2 5h20l-2-5M9 21h6"/>',
 play:'<rect x="2" y="4" width="20" height="15" rx="3"/><path d="m10 8 6 3.5-6 3.5ZM8 22h8"/>',
 home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1ZM9 21v-8h6v8"/>',
 office:'<rect x="5" y="3" width="14" height="18" rx="1"/><path d="M9 7h1m4 0h1M9 11h1m4 0h1M9 15h1m4 0h1M10 21v-3h4v3"/>',
 enterprise:'<path d="M3 21V9h7m0 12V3h11v18M1 21h22M6 12v1m0 3v1M14 7h1m3 0h1m-5 4h1m3 0h1m-5 4h1m3 0h1M14 21v-3h3v3"/>',
 wifi:'<path d="M3 8a15 15 0 0 1 18 0M6 12a10 10 0 0 1 12 0M9 16a5 5 0 0 1 6 0"/><circle cx="12" cy="20" r=".8"/>',
 headset:'<path d="M3 14v-3a9 9 0 0 1 18 0v6a4 4 0 0 1-4 4h-3"/><rect x="3" y="11" width="4" height="7" rx="2"/><rect x="17" y="11" width="4" height="7" rx="2"/><path d="M11 21h3"/>',
 wrench:'<path d="M14 4a6 6 0 0 0-7 7L3 15a3 3 0 0 0 4 4l4-4a6 6 0 0 0 7-7l-4 4-3-3 4-4Z"/>',
 alert:'<path d="M10.3 4 2.5 18a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 4a2 2 0 0 0-3.4 0ZM12 9v5m0 3v.1"/>',
 clipboard:'<rect x="5" y="4" width="14" height="18" rx="2"/><rect x="9" y="2" width="6" height="4" rx="1"/><path d="M9 11h6m-6 4h6m-6 4h3"/>',
 message:'<path d="M21 15a3 3 0 0 1-3 3H9l-6 4V6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3ZM7 8h10M7 12h7"/>',
 payment:'<rect x="2" y="4" width="20" height="16" rx="3"/><path d="M2 9h20M6 15h4"/>',
 pin:'<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.5"/>',
 user:'<circle cx="12" cy="7" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
 router:'<rect x="3" y="13" width="18" height="8" rx="2"/><path d="M7 13V8m10 5V8M7 17h.1m3.9 0h.1M8 4a7 7 0 0 1 8 0M10 7a3 3 0 0 1 4 0"/>',
 globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c5 5 5 13 0 18-5-5-5-13 0-18Z"/>',
};
function iconFor(title){
 const value=title.toLowerCase();
 if(/work from home|remote work/.test(value))return 'laptop';
 if(/stream|entertain|unwind/.test(value))return 'play';
 if(/household|residential|home/.test(value))return 'home';
 if(/enterprise/.test(value))return 'enterprise';
 if(/sme|business/.test(value))return 'office';
 if(/payment|renewal|plans/.test(value))return 'payment';
 if(/coverage|installation|address/.test(value))return 'pin';
 if(/account/.test(value))return 'user';
 if(/fault/.test(value))return 'alert';
 if(/troubleshoot/.test(value))return 'wrench';
 if(/request|complaint/.test(value))return 'clipboard';
 if(/support|help/.test(value))return 'headset';
 if(/enquiry|contact/.test(value))return 'message';
 if(/wi-fi|internet|connect/.test(value))return 'wifi';
 if(/services/.test(value))return 'router';
 return 'globe';
}
export function decorateInformationCards(scope){
 for(const card of scope.querySelectorAll('article.ik-panel')){
  if(card.querySelector(':scope>.ik-card-icon'))continue;
  const heading=card.querySelector('h3');if(!heading)continue;
  const name=iconFor(heading.textContent),container=scope.ownerDocument.createElement('div');
  container.innerHTML=`<svg class="ik-card-icon" data-card-icon="${name}" viewBox="0 0 24 24" width="52" height="52" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths[name]}</svg>`;
  card.prepend(container.firstElementChild);
 }
}
