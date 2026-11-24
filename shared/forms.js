export const escapeHTML = (value='') => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
export const addressFields = [
  {name:'country',label:'Country',options:['Nigeria']},
  {name:'state',label:'State'}, {name:'city',label:'City or LGA'},
  {name:'district',label:'Area or district'}, {name:'street',label:'Street or estate'},
  {name:'building',label:'Building number or name',autocomplete:'street-address'}
];
export const contactFields = [
  {name:'name',label:'Full name',autocomplete:'name'},
  {name:'email',label:'Email address',type:'email',autocomplete:'email'},
  {name:'phone',label:'Phone number',type:'tel',autocomplete:'tel'}
];
export function fieldHTML(field, values={}, prefix='form') {
  const {name,label,type='text',optional=false,options,help=''}=field;
  const id=`${prefix}-${name}`,value=values[name]||field.value||'';
  const attrs=`id="${id}" name="${name}" ${optional?'':'required'} aria-describedby="${id}-hint ${id}-error" autocomplete="${field.autocomplete||'off'}"`;
  let input;
  if(options) input=`<select ${attrs}>${field.noBlank?'':`<option value="">${name==='plan'?'No plan selected':`Select ${escapeHTML(label.toLocaleLowerCase())}`}</option>`}${options.map(item=>{const [key,text]=Array.isArray(item)?item:[item,item];return `<option value="${escapeHTML(key)}" ${value===key?'selected':''}>${escapeHTML(text)}</option>`;}).join('')}</select>`;
  else if(type==='textarea') input=`<textarea ${attrs} maxlength="2000" rows="5">${escapeHTML(value)}</textarea>`;
  else input=`<input ${attrs} type="${type}" maxlength="${type==='password'?128:240}" value="${type==='password'?'':escapeHTML(value)}" ${type==='email'?'inputmode="email"':''}>`;
  if(type==='password') input=`<div class="ik-password-wrap">${input}<button type="button" data-show-password="${id}" aria-label="Show password" aria-pressed="false">Show</button></div>`;
  return `<label class="ik-field ${type==='textarea'||field.full?'ik-full':''}" for="${id}"><span>${escapeHTML(label)} <small>${optional?'(optional)':'(required)'}</small></span>${input}<small id="${id}-hint">${escapeHTML(help)}</small><span id="${id}-error" class="ik-field-error"></span></label>`;
}
export function formHTML(id, fields, button='Review Request',values={}, extra='', notice='Details entered here are not sent to the team. Email or call customer care to submit your enquiry.') {
  return `<p class="ik-notice">${escapeHTML(notice)}</p><form class="ik-form" data-form="${id}" novalidate><div class="ik-form-status ik-error-summary" role="alert" tabindex="-1" hidden></div>${fields.map(field=>fieldHTML(field,values,id)).join('')}${extra}<div class="ik-actions ik-full"><button type="submit" class="ik-button">${button}</button></div><div class="ik-form-status" data-status role="status" aria-live="polite" tabindex="-1"></div></form>`;
}
export function validateForm(form) {
  const errors=[];
  for(const control of form.querySelectorAll('input,select,textarea')) {
    const errorElement=form.querySelector(`#${control.id}-error`);
    let error='';
    if(!control.disabled) {
      const value=control.type==='password'?control.value:control.value.trim();
      if(control.required&&control.type==='checkbox'&&!control.checked)error='Please confirm your consent before submitting.';
      else if(control.required&&!value) error=control.tagName==='SELECT'?'Choose an option.':'Enter the required information.';
      else if(value&&control.type==='email'&&!control.validity.valid) error='Enter an email address, such as name@example.com.';
      else if(value&&control.type==='tel'&&(!/^[+\d() .-]{7,25}$/.test(value)||value.replace(/\D/g,'').length<7||value.replace(/\D/g,'').length>15)) error='Enter a phone number with 7 to 15 digits. Use + for an international prefix.';
      else if(control.validity.tooLong) error=`Use ${control.maxLength} characters or fewer.`;
    }
    control.setAttribute('aria-invalid',String(Boolean(error)));
    if(errorElement) errorElement.textContent=error;
    if(error) errors.push({id:control.id,label:control.closest('label').querySelector('span').textContent,error});
  }
  const summary=form.querySelector('.ik-error-summary');
  summary.hidden=!errors.length;
  summary.innerHTML=errors.length?`<strong>Check ${errors.length} field${errors.length===1?'':'s'} before continuing.</strong><ul>${errors.map(e=>`<li><a href="#${e.id}" data-error-focus="${e.id}">${escapeHTML(e.label)}: ${e.error}</a></li>`).join('')}</ul>`:'';
  if(errors.length) summary.focus();
  return errors;
}
