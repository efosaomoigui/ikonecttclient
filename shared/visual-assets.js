// Logical asset references. Client campaign replacements belong here, not in page markup.
const raster=(folder,stem,alt,width,height,extra={})=>({folder,stem,alt,width,height,widths:[480,800,1280,...(width>=1600?[1600]:[])],status:'provisional',...extra});
const vector=(stem,alt)=>({folder:'abstract',stem,alt,width:1200,height:800,status:'original artwork',vector:true});
export const visualAssets={
  home:raster('residential','connected-home','Illustrative contemporary living room with a television, smartphone and Wi-Fi router.',1536,1024),
  workplace:raster('business','contemporary-workplace','Illustrative meeting room with a tablet and video-conference display.',1536,1024),
  infrastructure:raster('infrastructure','network-patch-panel','Illustrative close-up of organised network patch leads and connectors.',1536,1024),
  lagos:raster('city','lagos-skyline','Lagos buildings and a city roadway at evening.',3726,1970,{credit:{author:'Clara Sanchiz',title:'Lagos skyline',source:'https://commons.wikimedia.org/wiki/File:Lagos_skyline.jpg',license:'CC BY-SA 2.0',licenseURL:'https://creativecommons.org/licenses/by-sa/2.0/'}}),
  dusk:raster('city','eko-atlantic-dusk','Sunset over the Eko Atlantic waterfront in Lagos.',1280,720,{credit:{author:'Mrnyben1313',title:'Sunset at Eko Atlantic Victoria Island Lagos',source:'https://commons.wikimedia.org/wiki/File:Sunset_at_Eko_Atlantic_Victoria_Island_Lagos.jpg',license:'CC BY-SA 4.0',licenseURL:'https://creativecommons.org/licenses/by-sa/4.0/'}}),
  network:vector('network-grid','Abstract network lines and connected nodes; not a coverage map.'),
  flow:vector('fibre-flow','Abstract flowing fibre paths; not a diagram of company infrastructure.'),
  signal:vector('signal-arcs','Abstract concentric connection paths; not a geographic service area.'),
  architecture:vector('city-grid','Abstract architectural geometry and connection lines.'),
  spaces:vector('connected-spaces','Abstract connected home and workplace spaces.'),
};
export const visualSlots={
  a:{residential:'home',business:'workplace',about:'spaces','business/solutions/connectivity':'infrastructure','business/solutions/sme':'workplace','business/solutions/enterprise':'lagos'},
  d:{residential:'home',business:'lagos',about:'architecture','business/solutions/connectivity':'infrastructure','business/solutions/sme':'signal','business/solutions/enterprise':'network'},
  e:{residential:'home',business:'workplace',about:'flow','business/solutions/connectivity':'infrastructure','business/solutions/sme':'workplace','business/solutions/enterprise':'dusk'},
};
export function visualURL(key,width=1280,base=document.baseURI){
  const a=visualAssets[key];
  return new URL(`../assets/visual-library/${a.folder}/${a.stem}${a.vector?'.svg':`-${width}.webp`}`,base).href;
}
export function visualSrcSet(key,base=document.baseURI){
  return visualAssets[key].vector?undefined:visualAssets[key].widths.map(w=>`${visualURL(key,w,base)} ${w}w`).join(', ');
}
export function visualCreditHTML(key){
  const c=visualAssets[key].credit;
  return c?`<span class="ik-visual-credit"><a href="${c.source}" target="_blank" rel="noopener">${c.title} · ${c.author}</a> · <a href="${c.licenseURL}" target="_blank" rel="noopener">${c.license}</a> · resized / cropped</span>`:'';
}
export function visualPictureHTML(key,{priority=false,decorative=false,sizes='(max-width: 767px) 100vw, 50vw'}={}){
  const a=visualAssets[key];
  return `<picture class="ik-visual-picture" data-visual-asset="${key}"><img src="${visualURL(key)}"${a.vector?'':` srcset="${visualSrcSet(key)}" sizes="${sizes}"`} width="${a.width}" height="${a.height}" alt="${decorative?'':a.alt}" loading="${priority?'eager':'lazy'}" decoding="async"${priority?' fetchpriority="high"':''}></picture>`;
}
