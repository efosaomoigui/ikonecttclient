import {escapeHTML as esc} from './forms.js';
import {getPlan,planName,priceLabel,planRoute} from './catalogue.js';
export const icon=(name)=>`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${{
  chat:'<path d="M20 11.5a8 8 0 0 1-8 8H5l-3 2v-10a9 9 0 0 1 18 0Z"/><path d="M7 10h8M7 14h5"/>',
  close:'<path d="m6 6 12 12M6 18 18 6"/>',back:'<path d="m14 6-6 6 6 6"/>',
  arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',send:'<path d="m3 3 19 9-19 9 4-9-4-9Zm4 9h15"/>',restart:'<path d="M4 10a8 8 0 1 1 1 7M4 4v6h6"/>'
}[name]||''}</svg>`;
export function shellHTML(logo){
  return `<div class="ik-assistant-dock"><div class="ik-assistant-invitation" data-invitation><button type="button" class="ik-assistant-icon" data-dismiss aria-label="Dismiss welcome invitation">${icon('close')}</button><button type="button" data-open class="ik-assistant-invite-copy"><strong>A little help, right here.</strong><span>Hi there! Welcome to Ikonectt. How can we help you today?</span></button></div><button type="button" class="ik-assistant-launcher" data-launcher aria-label="Open Ikonectt Support" aria-haspopup="dialog" aria-expanded="false" aria-controls="ik-assistant-panel">${icon('chat')}<span class="ik-assistant-sr">Ikonectt Support</span></button></div>
  <dialog id="ik-assistant-panel" class="ik-assistant-panel" data-stage="welcome" aria-label="Ikonectt Support" aria-describedby="ik-assistant-session-note"><p id="ik-assistant-session-note" class="ik-assistant-sr">Demonstration only. No live support service connected.</p><header class="ik-assistant-header"><img src="${logo}" width="100" height="34" alt="Ikonectt"><button type="button" class="ik-assistant-icon" data-close aria-label="Minimise Ikonectt Support">${icon('close')}</button></header><div data-introduction class="ik-assistant-body"></div><section data-conversation class="ik-assistant-conversation" hidden aria-label="Support conversation"><div class="ik-assistant-tools"><button type="button" data-restart>${icon('restart')}<span>Restart</span></button><a href="#/support" data-help>Help Centre ${icon('arrow')}</a></div><div class="ik-assistant-scroll" data-scroll><div data-messages role="log" aria-label="Conversation messages" aria-live="polite" aria-relevant="additions text"></div><div data-guidance></div></div><form data-composer class="ik-assistant-composer" autocomplete="off"><label for="ik-assistant-message">Your message</label><div><input id="ik-assistant-message" name="message" type="text" maxlength="600" autocomplete="off" placeholder="Ask about plans or support…"><button type="submit" aria-label="Send message" disabled>${icon('send')}</button></div><small>Please don’t share passwords, payment details or codes.</small></form><footer class="ik-assistant-footer">Demo only. Your details are not submitted.</footer></section></dialog>`;
}
export function introductionHTML(){return `<div class="ik-assistant-intro"><h3>Welcome to Ikonectt Support</h3></div><form data-intro-form novalidate autocomplete="off"><div class="ik-assistant-errors" data-errors role="alert" tabindex="-1" hidden></div><label for="ik-assistant-name">Full Name <span aria-hidden="true">*</span></label><input id="ik-assistant-name" name="name" type="text" maxlength="80" required autocomplete="off" aria-describedby="ik-assistant-name-error"><span class="ik-assistant-field-error" id="ik-assistant-name-error"></span><label for="ik-assistant-phone">Phone Number <span aria-hidden="true">*</span></label><input id="ik-assistant-phone" name="phone" type="tel" inputmode="tel" maxlength="32" required autocomplete="off" placeholder="+234 803 123 4567" aria-describedby="ik-assistant-phone-error"><span class="ik-assistant-field-error" id="ik-assistant-phone-error"></span><label for="ik-assistant-enquiry">How can we help? <span class="ik-assistant-optional">Optional</span></label><textarea id="ik-assistant-enquiry" name="enquiry" rows="2" maxlength="600" autocomplete="off" placeholder="Tell us what you need help with"></textarea><p class="ik-assistant-privacy">Demo only. Your details are not submitted.</p><button type="submit" class="ik-assistant-primary">Start Conversation ${icon('arrow')}</button></form>`;}
export function actionHTML(action){return action.route?`<a class="ik-assistant-action" href="#/${esc(action.route)}" data-assistant-route>${esc(action.label)} ${icon('arrow')}</a>`:`<button type="button" class="ik-assistant-action" data-intent="${esc(action.intent)}">${esc(action.label)} ${icon('arrow')}</button>`;}
export function messageHTML({role,text,time},logo){return `<article class="ik-assistant-message" data-role="${role}">${role==='assistant'&&logo?`<img class="ik-assistant-avatar" src="${logo}" width="48" height="16" alt="">`:''}<div class="ik-assistant-bubble">${messageContent(role,text)}</div><small><span>${role==='assistant'?'Ikonectt Support':'You'}</span> · <time>${esc(time)}</time></small></article>`;}
export function planPickerHTML(ids){return `<details class="ik-assistant-plans"><summary>Explore published plan options</summary><div>${ids.map(id=>{const plan=getPlan(id);return `<button type="button" data-select-plan="${id}"><span><strong>${esc(planName(plan))}</strong><small>${plan.speedMbps} Mbps</small></span><span>${esc(priceLabel(plan))}<small>/month</small></span></button>`;}).join('')}</div></details>`;}

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
    {label:'Explore Plans',intent:context.audience},
    {label:'Check Coverage',route:planRoute('coverage',getPlan(context.plan),context.audience)},
    {label:'Report an Issue',intent:'fault'},
    {label:'Contact Sales',intent:'sales'},
    {label:'Contact Support',intent:'support'}
  ];
}
