import {phoneInputHTML} from './phone-input.js';
import {escapeHTML as esc} from './forms.js';
import {getPlan,planName,priceLabel,pricePeriod,planRoute} from './catalogue.js';
export const icon=(name)=>`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${{
  chat:'<path d="M20 11.5a8 8 0 0 1-8 8H5l-3 2v-10a9 9 0 0 1 18 0Z"/><path d="M7 10h8M7 14h5"/>',
  close:'<path d="m6 6 12 12M6 18 18 6"/>',back:'<path d="m14 6-6 6 6 6"/>',
  arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',send:'<path d="m3 3 19 9-19 9 4-9-4-9Zm4 9h15"/>',restart:'<path d="M4 10a8 8 0 1 1 1 7M4 4v6h6"/>'
}[name]||''}</svg>`;
export function shellHTML(logo){
  return `<div class="ik-assistant-dock"><div class="ik-assistant-invitation" data-invitation><button type="button" class="ik-assistant-icon" data-dismiss aria-label="Dismiss welcome invitation">${icon('close')}</button><button type="button" data-open class="ik-assistant-invite-copy"><strong>Help with plans and support</strong><span>Find answers about plans, coverage and support.</span></button></div><a class="ik-assistant-whatsapp" data-whatsapp hidden target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp" title="Chat on WhatsApp"><svg viewBox="0 0 32 32" aria-hidden="true" fill="currentColor"><path d="M16 .8A15.1 15.1 0 0 0 3 23.6L.9 31l7.6-2A15.1 15.1 0 1 0 16 .8Zm0 27.6a12.4 12.4 0 0 1-6.3-1.7l-.5-.3-4.5 1.2 1.2-4.4-.3-.5A12.5 12.5 0 1 1 16 28.4Zm6.9-9.3c-.4-.2-2.2-1.1-2.6-1.2-.3-.1-.6-.2-.8.2-.3.4-1 1.2-1.2 1.4-.2.2-.4.3-.8.1-.4-.2-1.6-.6-3-1.9-1.1-1-1.9-2.2-2.1-2.6-.2-.4 0-.6.2-.8l.6-.7.4-.6c.1-.2 0-.5 0-.7-.1-.2-.9-2.1-1.2-2.9-.3-.7-.6-.6-.8-.6h-.7c-.3 0-.7.1-1 .5-.4.4-1.3 1.3-1.3 3.2s1.4 3.7 1.6 3.9c.2.3 2.7 4.2 6.5 5.8.9.4 1.6.6 2.2.8.9.3 1.7.3 2.3.1.7-.1 2.2-.9 2.5-1.8.3-.9.3-1.7.2-1.8-.1-.2-.4-.3-.8-.5Z"/></svg></a><button type="button" class="ik-assistant-launcher" data-launcher aria-label="Open Ikonectt Help Assistant" aria-haspopup="dialog" aria-expanded="false" aria-controls="ik-assistant-panel">${icon('chat')}<span class="ik-assistant-sr">Ikonectt Help Assistant</span></button></div>
  <dialog id="ik-assistant-panel" class="ik-assistant-panel" data-stage="welcome" aria-label="Ikonectt Help Assistant" aria-describedby="ik-assistant-session-note"><p id="ik-assistant-session-note" class="ik-assistant-sr">Automated guidance; no live agent is connected.</p><header class="ik-assistant-header"><img src="${logo}" width="100" height="34" alt="Ikonectt"><span class="ik-assistant-header-chat" aria-hidden="true">${icon('chat')}</span><button type="button" class="ik-assistant-icon" data-close aria-label="Minimise Ikonectt Help Assistant">${icon('close')}</button></header><div data-introduction class="ik-assistant-body"></div><section data-conversation class="ik-assistant-conversation" hidden aria-label="Support conversation"><div class="ik-assistant-tools"><button type="button" data-restart>${icon('restart')}<span>Restart</span></button><a href="#/support" data-help>Help Centre ${icon('arrow')}</a></div><div class="ik-assistant-scroll" data-scroll><div data-messages role="log" aria-label="Conversation messages" aria-live="polite" aria-relevant="additions text"></div><div data-guidance></div></div><form data-composer class="ik-assistant-composer" autocomplete="off"><label for="ik-assistant-message">Your message</label><div><input id="ik-assistant-message" name="message" type="text" maxlength="600" autocomplete="off" placeholder="Ask about plans or support…"><button type="submit" aria-label="Send message" disabled>${icon('send')}</button></div><small>Please don’t share passwords, payment details or codes.</small></form><footer class="ik-assistant-footer">Automated guidance; no live agent is connected.</footer></section></dialog>`;
}
export function introductionHTML(template,interactive=false){return `<div class="ik-assistant-intro"><h3>${template==='a'?'Ikonectt Virtual Assistance':'Ikonectt Help Assistant'}</h3></div><form data-intro-form novalidate autocomplete="off"><div class="ik-assistant-errors" data-errors role="alert" tabindex="-1" hidden></div><label for="ik-assistant-name">Name <span aria-hidden="true">*</span></label><input id="ik-assistant-name" name="name" type="text" maxlength="80" required autocomplete="off" aria-describedby="ik-assistant-name-error"><span class="ik-assistant-field-error" id="ik-assistant-name-error"></span><label for="ik-assistant-phone">Phone number <span aria-hidden="true">*</span></label>${interactive?phoneInputHTML():`<input id="ik-assistant-phone" name="phone" type="tel" inputmode="tel" maxlength="32" required autocomplete="off" placeholder="+234 803 123 4567" aria-describedby="ik-assistant-phone-error">`}<span class="ik-assistant-field-error" id="ik-assistant-phone-error"></span><label for="ik-assistant-enquiry">How can we help? <span class="ik-assistant-optional">Optional</span></label><textarea id="ik-assistant-enquiry" name="enquiry" rows="2" maxlength="600" autocomplete="off" placeholder="For example, help choosing a plan"></textarea><p class="ik-assistant-privacy">Replies are automated; no live agent is connected.</p><button type="submit" class="ik-assistant-primary">${interactive?'Start Chat':'Start Help'} ${icon('arrow')}</button>${template==='a'?'<a class="ik-assistant-secondary" data-help href="#/support">Browse Help Topics</a>':''}</form>`;}
export function actionHTML(action){if(action.href)return `<a class="ik-assistant-action" href="${esc(action.href)}" target="_blank" rel="noopener noreferrer">${esc(action.label)} ${icon('arrow')}</a>`;return action.route?`<a class="ik-assistant-action" href="#/${esc(action.route)}" data-assistant-route>${esc(action.label)} ${icon('arrow')}</a>`:`<button type="button" class="ik-assistant-action" data-intent="${esc(action.intent)}">${esc(action.label)} ${icon('arrow')}</button>`;}
export function messageHTML({role,text,time},logo){return `<article class="ik-assistant-message" data-role="${role}">${role==='assistant'&&logo?`<img class="ik-assistant-avatar" src="${logo}" width="48" height="16" alt="">`:''}<div class="ik-assistant-bubble">${messageContent(role,text)}</div><small><span>${role==='assistant'?'Ikonectt Help Assistant':'You'}</span> · <time>${esc(time)}</time></small></article>`;}
export function planPickerHTML(ids){return `<details class="ik-assistant-plans"><summary>View plan options</summary><div>${ids.map(id=>{const plan=getPlan(id);return `<button type="button" data-select-plan="${id}"><span><strong>${esc(planName(plan))}</strong><small>${plan.speedMbps} Mbps</small></span><span>${esc(priceLabel(plan))}<small>${esc(pricePeriod(plan))}</small></span></button>`;}).join('')}</div></details>`;}

// Present existing scripted guidance progressively without changing the provider text.
function messageContent(role,text){
  if(role!=='assistant'||text.length<=280)return esc(text);
  const first=text.match(/^.*?[.!?](?:\s|$)/s)?.[0];
  if(!first)return esc(text);
  const rest=text.slice(first.length).trim();
  return `${esc(first.trim())}<details class="ik-assistant-more"><summary>More guidance</summary><p>${esc(rest)}</p></details>`;
}
export function welcomeActions(context){
  return [
    {label:'View Plans',intent:context.audience},
    {label:'Check Coverage',route:planRoute('coverage',getPlan(context.plan),context.audience)},
    {label:'Report a Fault',intent:'fault'},
    {label:'Contact Sales',intent:'sales'},
    {label:'Contact Support',intent:'support'}
  ];
}

export function guestActions(context){return [
 {label:'Check coverage',intent:'coverage'},{label:'Find a broadband plan',intent:context.audience},
 {label:'Make an enquiry',intent:'enquiry'},{label:'Troubleshoot my connection',intent:'troubleshooting'},
 {label:'Contact customer support',intent:'support'},{label:'Manage my subscription',href:'https://portal.ikonectt.com'}
];}
