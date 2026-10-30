// Lightweight signals anchored to the existing 1725 × 912 city photograph.
// No generated buildings, WebGL scene or independent animation clock.
const markURL=new URL('../assets/brand/ikonectt-i-mask.png',import.meta.url).href;
const routes={
 desktop:{source:[465,735],paths:[
  'M465 735C400 707 290 695 230 680L230 615L230 580',
  'M465 735C450 711 370 703 350 691L350 610L350 540',
  'M465 735C480 716 495 705 520 700L560 700L560 610L530 585',
  'M465 735C570 719 655 725 690 733L690 620L690 520',
  'M465 735C650 721 780 732 870 746L870 630L850 550',
  'M465 735C680 727 880 744 1005 756L1005 652L978 525',
  'M465 735C780 738 1090 770 1285 783L1285 650L1320 545',
  'M465 735C850 745 1200 786 1420 801L1420 655L1450 550'
 ],nodes:[[230,580],[350,540],[530,585],[690,520],[850,550],[978,525],[1320,545],[1450,550]]},
 mobile:{source:[885,765],paths:[
  'M885 765C835 750 775 744 740 732L740 645L740 565',
  'M885 765C860 751 812 748 785 738L785 656L800 595',
  'M885 765C890 751 895 745 880 740L880 650L880 580',
  'M885 765C900 752 928 745 948 742L948 650L970 545',
  'M885 765C920 773 980 780 1000 786L1000 715L1000 650'
 ],nodes:[[740,565],[800,595],[880,580],[970,545],[1000,650]]}
};
export function photoNetworkHTML(){
 return `<svg class="e-photo-network" viewBox="0 0 1725 912" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><radialGradient id="e-photo-node-glow"><stop stop-color="#ff7180" stop-opacity=".7"/><stop offset="1" stop-color="#ed101a" stop-opacity="0"/></radialGradient>${Object.entries(routes).map(([name,r])=>`<mask id="e-photo-i-${name}" maskUnits="userSpaceOnUse" x="${r.source[0]-8}" y="${r.source[1]-58}" width="16" height="60"><image href="${markURL}" x="${r.source[0]-8}" y="${r.source[1]-58}" width="16" height="60"/></mask>`).join('')}</defs>${Object.entries(routes).map(([name,r])=>`<g class="e-photo-routes-${name}" data-photo-profile="${name}"><g data-photo-origin><ellipse cx="${r.source[0]}" cy="${r.source[1]+3}" rx="20" ry="4" fill="#071018" opacity=".55"/><rect data-photo-source x="${r.source[0]-8}" y="${r.source[1]-58}" width="16" height="60" fill="#ed101a" mask="url(#e-photo-i-${name})"/><path d="M${r.source[0]-12} ${r.source[1]+1}Q${r.source[0]} ${r.source[1]+5} ${r.source[0]+12} ${r.source[1]+1}" fill="none" stroke="#fff" stroke-opacity=".25"/></g>${r.paths.map(d=>`<path class="e-photo-route" d="${d}"/><path data-photo-pulse d="${d}" pathLength="1"/>`).join('')}${r.nodes.map(([x,y])=>`<g data-photo-node><circle class="e-photo-node-halo" cx="${x}" cy="${y}" r="24" fill="url(#e-photo-node-glow)"/><circle cx="${x}" cy="${y}" r="3" fill="#ff8a95"/></g>`).join('')}</g>`).join('')}</svg>`;
}
export function layoutPhotoNetwork(host){
 const svg=host.querySelector('.e-photo-network');if(!svg)return;
 const rect=host.getBoundingClientRect(),width=rect.width||1725,height=rect.height||912;
 const scale=Math.max(width/1725,height/912),offsetX=(width-1725*scale)/2,offsetY=(height-912*scale)/2;
 const logoHeight=width<768?100:132,logoScale=logoHeight/(60*scale);
 const x=((width<768?40:54)-offsetX)/scale,y=(height-12-offsetY)/scale;
 for(const group of svg.querySelectorAll('[data-photo-profile]')){
  const profile=routes[group.dataset.photoProfile],[oldX,oldY]=profile.source;
  group.querySelector('[data-photo-origin]').setAttribute('transform',`translate(${x} ${y}) scale(${logoScale}) translate(${-oldX} ${-oldY})`);
  const prefix=`M${x} ${y}C${x+40} ${y-20} ${(x+oldX)/2} ${oldY+25} ${oldX} ${oldY}`;
  group.querySelectorAll('.e-photo-route').forEach((path,i)=>path.setAttribute('d',prefix+profile.paths[i].slice(profile.paths[i].indexOf('C'))));
  group.querySelectorAll('[data-photo-pulse]').forEach((path,i)=>path.setAttribute('d',prefix+profile.paths[i].slice(profile.paths[i].indexOf('C'))));
 }
 svg.dataset.sourceX=String(x*scale+offsetX);svg.dataset.sourceY=String(y*scale+offsetY);svg.dataset.sourceHeight=String(logoHeight);
}
export async function createCityRenderer(host){
 const svg=host.querySelector('.e-photo-network');
 if(!svg)throw Error('Photo network layer missing');
 layoutPhotoNetwork(host);
 const sets=[...svg.querySelectorAll('[class^="e-photo-routes-"]')].map(group=>({group,source:group.querySelector('[data-photo-source]'),pulses:[...group.querySelectorAll('[data-photo-pulse]')],nodes:[...group.querySelectorAll('[data-photo-node]')]}));
 const info={mode:'svg',drawCalls:0,triangles:0,buildings:0,textures:0,networkStage:'opening',activeSignals:0,litBuildings:0};
 let destroyed=false;
 function render(time){
  if(destroyed)return info;
  info.activeSignals=0;info.litBuildings=0;info.networkStage=time<.5?'opening':'network-transmission';
  for(const set of sets){
   if(host.ownerDocument.defaultView.getComputedStyle(set.group).display==='none')continue;
   set.source.style.opacity=String(.85+.15*Math.sin(time*.6)**2);
   set.pulses.forEach((pulse,i)=>{
    const clock=time-.5-i*.85,age=clock<0?-1:clock%5.8,active=age>=0&&age<4.8;
    pulse.style.strokeDashoffset=String(1-Math.max(0,Math.min(1,age/4.8)));pulse.style.opacity=active?'1':'0';
    const arrival=age>=4.8?Math.exp(-(age-4.8)*3):0;
    set.nodes[i].style.opacity=String(.16+.84*arrival);
    if(active)info.activeSignals++;if(arrival>.15)info.litBuildings++;
   });
  }
  return info;
 }
 return {render,resize(){layoutPhotoNetwork(host);},simplify(){},destroy(){destroyed=true;for(const set of sets){set.source.style.opacity='.85';set.pulses.forEach(p=>p.style.opacity='0');set.nodes.forEach(n=>n.style.opacity='.16');}}};
}
