// Client-requested local photo variants. Approved originals remain available.
export const redAccentAssets={
 family:{stem:'family-red-sofa-v1',width:1448,height:1086,widths:[480,800,1024,1448],alt:'A Nigerian family sharing a tablet on a red woven sofa in a warm living room.'},
 business:{stem:'business-red-details-v1',width:1672,height:941,widths:[480,800,1280,1672],alt:'Two Nigerian professionals collaborating with a shared screen and small red details in a contemporary office.'},
 'campaign-family':{stem:'campaign-family-red-sofa-v1',width:640,height:320,widths:[320,480,640],alt:'The Ikonectt campaign family together on a red fabric sofa in their bright living room.'},
};
export const redAccentURL=(key,width=redAccentAssets[key].width)=>new URL(`../assets/visual-library/red-accents/${redAccentAssets[key].stem}-${width}.webp`,import.meta.url).href;
export const redAccentSrcSet=key=>redAccentAssets[key].widths.map(w=>`${redAccentURL(key,w)} ${w}w`).join(', ');
export function redAccentCampaignPicture(){
 const key='campaign-family',a=redAccentAssets[key];
 return `<picture class="ik-campaign-picture" data-campaign="family" data-red-accent="${key}"><img src="${redAccentURL(key)}" srcset="${redAccentSrcSet(key)}" sizes="(max-width:767px) 100vw,640px" width="${a.width}" height="${a.height}" alt="${a.alt}" loading="lazy" decoding="async"></picture>`;
}
