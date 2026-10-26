// Official campaign subjects in room compositions. Original visible subject pixels
// are retained; only the obscured surroundings have been rebuilt as room plates.
export const campaignAssets={
 family:{stem:'client-family-scene-v2',width:640,height:320,widths:[320,480,640],alt:'The Ikonectt campaign family together on a sofa in a warm living room, smiling as the father points ahead.'},
 individual:{stem:'client-individual-scene-v2',width:480,height:330,widths:[320,480],alt:'The Ikonectt campaign customer seated on the distinctive red chair in a living room, smiling with his smartphone.'},
};
export function campaignURL(key,width=campaignAssets[key].width){
 return new URL(`../assets/visual-library/campaign/${campaignAssets[key].stem}-${width}.webp`,import.meta.url).href;
}
export function campaignPicture(key){
 const asset=campaignAssets[key];
 return `<picture class="ik-campaign-picture" data-campaign="${key}"><img src="${campaignURL(key)}" srcset="${asset.widths.map(width=>`${campaignURL(key,width)} ${width}w`).join(',')}" sizes="${key==='family'?'(max-width:767px) calc(100vw - 48px),600px':'(max-width:767px) calc(100vw - 32px),50vw'}" width="${asset.width}" height="${asset.height}" alt="${asset.alt}" loading="lazy" decoding="async"></picture>`;
}
