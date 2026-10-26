// One decorative signature per active homepage; the official wordmark stays intact.
export function mountBrandSignature({root,home}){
 if(!['a','e'].includes(root.dataset.template))return ()=>{};
 const section=home.querySelector(root.dataset.template==='a'?'#home-company':'.about');
 if(!section||section.querySelector('[data-brand-signature]'))return ()=>{};
 const mark=root.ownerDocument.createElement('span');
 mark.className='ik-brand-i';mark.dataset.brandSignature='official-i';mark.setAttribute('aria-hidden','true');
 section.classList.add('ik-brand-story');section.prepend(mark);
 return ()=>{mark.remove();section.classList.remove('ik-brand-story');};
}
