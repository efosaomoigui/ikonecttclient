// E-only scene coordinates and causal signal schedule. No renderer or extra animation loop.
const clamp=v=>Math.max(0,Math.min(1,v));
const mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
const distance=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
export const easeSignal=t=>{t=clamp(t);return t*t*(3-2*t);};

function path(points,curved=false){
  points=points.filter((p,i)=>i===0||distance(p,points[i-1])>.00001);
  const samples=[];
  if(curved){
    for(let n=0;n<=40;n++){const t=n/40,u=1-t;samples.push([0,1,2].map(i=>u*u*u*points[0][i]+3*u*u*t*points[1][i]+3*u*t*t*points[2][i]+t*t*t*points[3][i]));}
  }else{
    samples.push(points[0]);
    for(let n=1;n<points.length-1;n++){
      const a=points[n-1],b=points[n],c=points[n+1],radius=Math.min(.22,distance(a,b)*.25,distance(b,c)*.25);
      const enter=mix(b,a,radius/distance(a,b)),leave=mix(b,c,radius/distance(b,c));samples.push(enter);
      for(let j=1;j<=6;j++){const t=j/6,u=1-t;samples.push([0,1,2].map(i=>u*u*enter[i]+2*u*t*b[i]+t*t*leave[i]));}
    }
    samples.push(points.at(-1));
  }
  const lengths=[0];for(let i=1;i<samples.length;i++)lengths.push(lengths[i-1]+distance(samples[i-1],samples[i]));
  return {samples,length:lengths.at(-1),sample(t,out){
    const d=clamp(t)*lengths.at(-1);let i=1;while(i<lengths.length-1&&lengths[i]<d)i++;
    const local=(d-lengths[i-1])/(lengths[i]-lengths[i-1]||1);
    for(let k=0;k<3;k++)out[k]=samples[i-1][k]+(samples[i][k]-samples[i-1][k])*local;
    return out;
  }};
}

export function createNetworkModel({mobile=false}={}){
  const grid=mobile?4:6,buildings=[];let seed=137;
  const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  for(let x=0;x<grid;x++)for(let z=0;z<grid;z++){
    const central=1-Math.min(1,Math.hypot(x-grid/2,z-grid/2)/grid);
    buildings.push({x:(x-(grid-1)/2)*2.25,z:(z-(grid-1)/2)*2.25,w:.7+random()*.65,d:.75+random()*.55,h:1.1+random()*5.4*central});
  }
  buildings.forEach(b=>b.lightness=.28+random()*.14);
  const front=grid/2*2.25,side=(grid/2-1)*2.25;
  // Bring the compact source into the visible foreground rather than clipping it
  // beyond the narrow viewport. Both source and port remain outside the blocks.
  const source=mobile?[1.2,.42,5.5]:[-8,.42,8.2];
  const port=[mobile?-.75:-side,.13,front],hub=[0,.13,front],nodes=[],routes=[];
  const addNode=(id,position,kind,building=-1)=>{nodes.push({id,position,kind,building});return nodes.length-1;};
  const portIndex=addNode('fibre-port',port,'port'),hubIndex=addNode('distribution',hub,'junction');
  for(let i=0;i<3;i++){
    const spread=(i-1)*.13,origin=[source[0]+spread*.18,source[1]+(i===1?.06:-.045),source[2]+spread];
    const from=addNode('strand-'+i,origin,'origin');
    routes.push({id:'strand-'+i,kind:'strand',from,to:portIndex,parent:null,start:i*.32,duration:1.35,
      ...path([origin,[origin[0]+(mobile?-.6:1.2),origin[1]+.32,origin[2]-.2],[port[0]+(mobile?.5:-.8),.35,port[2]+(mobile?.2:0)+spread],port],true)});
  }
  const inputEnd=Math.max(...routes.map(r=>r.start+r.duration));
  const main={id:'main-fibre',kind:'trunk',from:portIndex,to:hubIndex,parent:'strand-2',start:inputEnd+.15,duration:1.5,...path([port,hub])};routes.push(main);
  const selected=mobile?[[0,grid-1,-side],[2,grid-1,side],[grid-1,1,front]]:[[0,grid-1,-side],[2,grid-1,0],[4,grid-1,side],[grid-1,2,front]];
  selected.forEach(([column,row,roadX],i)=>{
    const index=column*grid+row,b=buildings[index];
    const faceX=b.x+(roadX>b.x?1:-1)*(b.w/2+.10),endpoint=[faceX,b.h+.14,b.z];
    const to=addNode('building-'+index,endpoint,'endpoint',index);
    const geometry=path([hub,[roadX,.13,front],[roadX,.13,b.z],[faceX,.13,b.z],endpoint]);
    routes.push({id:'drop-'+i,kind:'drop',from:hubIndex,to,parent:main.id,start:main.start+main.duration+.15+i*.3,duration:1.85+geometry.length*.065,...geometry});
  });
  const activeEnd=Math.max(...routes.map(r=>r.start+r.duration)),cycle=activeEnd+2.8;
  return {grid,buildings,source,port,hub,nodes,routes,firstTransmission:3,cycle,activeEnd};
}

export function createNetworkTimeline(model){
  const paths=model.routes.map(route=>({route,active:false,progress:0,level:0,head:new Float32Array(3)}));
  const nodes=new Float32Array(model.nodes.length),buildings=new Float32Array(model.buildings.length);
  const state={paths,nodes,buildings,cycleTime:-1,stage:'opening',sourceLevel:0,activeSignals:0};
  return {state,update(time){
    state.sourceLevel=easeSignal((time-1.3)/1.4);state.stage=time<1.3?'city-reveal':time<model.firstTransmission?'fibre-activation':'network-transmission';
    const clock=time<model.firstTransmission?-1:(time-model.firstTransmission)%model.cycle;state.cycleTime=clock;state.activeSignals=0;nodes.fill(0);buildings.fill(0);
    if(clock>=model.activeEnd)state.stage='ambient-rest';
    for(let i=0;i<paths.length;i++){
      const p=paths[i],r=p.route,age=clock-r.start,after=age-r.duration;
      p.active=clock>=0&&age>=0&&after<=0;p.progress=easeSignal(age/r.duration);r.sample(p.progress,p.head);
      p.level=p.active?.75+.18*Math.sin(p.progress*Math.PI):after>=0&&after<1.4?Math.exp(-after*3)*.45:0;
      if(p.active)state.activeSignals++;
      if(clock>=0&&after>=0&&after<1.8){
        const activation=Math.exp(-after*2.5);nodes[r.to]=Math.max(nodes[r.to],activation);
        const building=model.nodes[r.to].building;if(building>=0)buildings[building]=Math.max(buildings[building],activation);
      }
    }
    return state;
  }};
}
