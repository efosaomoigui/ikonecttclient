import {mountSite,navigate} from './public-site.js';
mountSite({root:document.body,home:document.querySelector('main'),template:document.body.dataset.template});
// Retain the homepage address launcher while routing to the full address hierarchy.
const check=document.querySelector('#check'),address=document.querySelector('#addr');
if(check&&address){
  const launch=()=>{if(!address.value.trim()){address.setAttribute('aria-invalid','true');document.querySelector('#helper').textContent='Please complete this field.';address.focus();return;}navigate('coverage',{address:address.value.trim()});};
  check.addEventListener('click',launch);
  address.addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();launch();}});
}
