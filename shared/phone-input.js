const library=()=>globalThis.libphonenumber;
export const countryFlag=country=>country==='NG'?'<svg viewBox="0 0 30 20" width="24" height="16" aria-hidden="true"><path fill="#008751" d="M0 0h30v20H0z"/><path fill="#fff" d="M10 0h10v20H10z"/></svg>':String.fromCodePoint(...[...country].map(c=>127397+c.charCodeAt(0)));
export function phoneInputHTML({id='ik-assistant-phone',describedBy='ik-assistant-phone-error'}={}){
 return `<div class="ik-assistant-phone"><span data-phone-flag>${countryFlag('NG')}</span><select name="country" aria-label="Phone country"><option value="NG" selected>Nigeria</option></select><span data-phone-dial>+234</span><input id="${id}" name="phone" type="tel" inputmode="tel" maxlength="32" required autocomplete="tel-national" placeholder="803 123 4567" aria-describedby="${describedBy}"></div>`;
}
export function phoneCountry(form){
 const country=form.elements.namedItem('country')?.value||'NG';
 form.querySelector('[data-phone-flag]').innerHTML=countryFlag(country);
 form.querySelector('[data-phone-dial]').textContent='+'+(library()?.getCountryCallingCode(country)||'234');
}
export function normalizePhone(value,country='NG'){
 const api=library();if(!api)throw Error('Phone validation could not load. Please reload the page and try again.');
 let text=String(value||'').trim();
 if(!/^[+\d\s().-]+$/.test(text)||text.length>32)throw Error('Enter a valid phone number for the selected country.');
 text=text.replace(/[\s().-]/g,'');if(text.startsWith('00'))text='+'+text.slice(2);
 if(country==='NG'&&/^234\d{10}$/.test(text))text='+'+text;
 const number=api.parsePhoneNumberFromString(text,country);
 if(!number?.isValid()||number.ext)throw Error('Enter a valid phone number for the selected country.');
 if(country==='NG'&&number.country!=='NG')throw Error('Enter a valid Nigerian phone number.');
 return number.number;
}
export function formatPhoneInput(form){
 try{
  const input=form.elements.namedItem('phone'),number=library().parsePhoneNumberFromString(normalizePhone(input.value,form.elements.country.value));
  if(number.country)form.elements.country.value=number.country;
  phoneCountry(form);input.value=number.nationalNumber;
 }catch{/* Incomplete input is validated when Start Chat is chosen. */}
}
