// Brand the initial only; catalogue values, links and existing typography stay intact.
function mountPlanNameMarks(root){
 if(root.dataset.planBrandMounted)return ()=>{};
 root.dataset.planBrandMounted='true';
 const selector='.ik-plan-card h3,.ik-plan-detail h2,.ik-plan-comparison thead th,.ik-page-hero h1';
 function decorate(){
  for(const heading of root.querySelectorAll(selector)){
   if(heading.dataset.planBrand||!/^i(?:Basic|Silver|Gold|Platinum|Diamond)$/.test(heading.textContent))continue;
   const first=heading.firstChild;if(first?.nodeType!==3)continue;
   const prefix=root.ownerDocument.createElement('span'),dash=root.ownerDocument.createElement('span');
   prefix.className='ik-plan-brand-prefix';prefix.textContent='i';
   dash.className='ik-plan-brand-dash';dash.textContent='-';
   first.splitText(1);first.replaceWith(prefix,dash);heading.dataset.planBrand='true';
  }
 }
 decorate();
 const observer=new root.ownerDocument.defaultView.MutationObserver(decorate);
 observer.observe(root,{childList:true,subtree:true});
 return ()=>{
  observer.disconnect();delete root.dataset.planBrandMounted;
  for(const heading of root.querySelectorAll('[data-plan-brand]')){
   heading.querySelector('.ik-plan-brand-prefix')?.replaceWith('i');
   heading.querySelector('.ik-plan-brand-dash')?.remove();delete heading.dataset.planBrand;
  }
 };
}

// One decorative signature per active homepage; the official wordmark stays intact.
export function mountBrandSignature({root,home}){
 if(!['a','e'].includes(root.dataset.template))return ()=>{};
 const names=mountPlanNameMarks(root);
 const section=home.querySelector(root.dataset.template==='a'?'#home-company':'.about');
 if(!section||section.querySelector('[data-brand-signature]'))return names;
 const mark=root.ownerDocument.createElement('span');
 mark.className='ik-brand-i';mark.dataset.brandSignature='official-i';mark.setAttribute('aria-hidden','true');
 section.classList.add('ik-brand-story');section.prepend(mark);
 return ()=>{names();mark.remove();section.classList.remove('ik-brand-story');};
}
