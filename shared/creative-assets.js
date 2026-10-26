// Active A/E refinements only. Archived templates retain their own image choices.
export const creativeAssets={
 city:{stem:'lagos-clean-v1',width:1725,height:912,widths:[480,800,1280,1600,1725],alt:'Lagos city buildings and roadway at evening.'},
 architecture:{stem:'commercial-architecture-v1',width:1086,height:1448,widths:[480,800,1086],alt:'Illustrative contemporary commercial building with bronze and charcoal glass facades.'},
};
export function creativePictureHTML(key,{decorative=false,priority=false,sizes='(max-width:767px) 100vw,60vw',legacyKey=key}={}){
 const a=creativeAssets[key],url=width=>new URL(`../assets/visual-library/creative/${a.stem}-${width}.webp`,import.meta.url).href;
 return `<picture class="ik-visual-picture" data-visual-asset="${legacyKey}" data-creative-asset="${key}"><img src="${url(a.width)}" srcset="${a.widths.map(w=>`${url(w)} ${w}w`).join(', ')}" sizes="${sizes}" width="${a.width}" height="${a.height}" alt="${decorative?'':a.alt}" loading="${priority?'eager':'lazy'}" decoding="async"${priority?' fetchpriority="high"':''}></picture>`;
}
