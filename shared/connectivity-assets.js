export const connectivityAssets={
 city:'lagos-night-city',fibre:'fibre-network-city',map:'digital-coverage-map',network:'abstract-network',wave:'digital-wave',
};
export const connectivityURL=(key,width=832)=>new URL(`../assets/visual-library/connectivity/${connectivityAssets[key]}-${width}.webp`,import.meta.url).href;
export const connectivitySrcSet=key=>[320,480,640,832].map(w=>`${connectivityURL(key,w)} ${w}w`).join(', ');
