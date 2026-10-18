import test from 'node:test';
import assert from 'node:assert/strict';
import {createNetworkModel,createNetworkTimeline} from '../option-e/network-model.js';

// Ensure a rear rooftop response is visible from the restrained camera sweep.
function occludes(eye,target,b){
  const low=[b.x-b.w/2,0,b.z-b.d/2],high=[b.x+b.w/2,b.h,b.z+b.d/2];let enter=0,leave=1;
  for(let k=0;k<3;k++){
    const direction=target[k]-eye[k];
    if(Math.abs(direction)<1e-9){if(eye[k]<low[k]||eye[k]>high[k])return false;continue;}
    let a=(low[k]-eye[k])/direction,z=(high[k]-eye[k])/direction;if(a>z)[a,z]=[z,a];enter=Math.max(enter,a);leave=Math.min(leave,z);if(enter>leave)return false;
  }
  return enter<.999&&leave>0;
}

for(const mobile of [false,true]){
  test(`E ${mobile?'mobile':'desktop'} network is connected, causal and outside building interiors`,()=>{
    const m=createNetworkModel({mobile}),point=new Float32Array(3);
    assert.equal(m.buildings.length,mobile?16:36);assert.equal(m.routes.filter(r=>r.kind==='drop').length,mobile?4:6);
    assert.ok(m.cableBase[1]<.05);assert.ok(m.source[1]>m.cableBase[1]+1,'cable must rise from the ground');
    assert.ok(m.nodes.some(n=>n.kind==='endpoint'&&n.position[2]===m.buildings[0].z),'network must reach the back row');
    for(const angle of [.67,.72,.77]){
      const distance=mobile?17:21,eye=[Math.sin(angle)*distance,mobile?9:10.5,Math.cos(angle)*distance];
      for(const node of m.nodes.filter(n=>n.kind==='endpoint'&&n.position[2]===m.buildings[0].z))assert.ok(!m.buildings.some(b=>occludes(eye,node.position,b)),node.id+' rear endpoint is hidden');
    }
    for(const r of m.routes){
      r.sample(0,point);m.nodes[r.from].position.forEach((v,i)=>assert.ok(Math.abs(v-point[i])<.00001,r.id+' origin'));
      r.sample(1,point);m.nodes[r.to].position.forEach((v,i)=>assert.ok(Math.abs(v-point[i])<.00001,r.id+' endpoint'));
      if(r.parent){const parent=m.routes.find(p=>p.id===r.parent);assert.ok(r.start>=parent.start+parent.duration,r.id+' starts before parent arrival');}
      for(let n=0;n<=150;n++){
        r.sample(n/150,point);
        for(const b of m.buildings){const inside=Math.abs(point[0]-b.x)<b.w/2-.001&&Math.abs(point[2]-b.z)<b.d/2-.001&&point[1]<b.h-.001;assert.equal(inside,false,r.id+' crosses a building');}
      }
    }
  });
  test(`E ${mobile?'mobile':'desktop'} signals travel, branch, activate rear destinations and flow continuously`,()=>{
    const m=createNetworkModel({mobile}),timeline=createNetworkTimeline(m),first=m.firstTransmission;
    assert.equal(timeline.update(0).activeSignals,0);
    const source=timeline.update(first+.3);assert.ok(source.paths[0].active);const x=source.paths[0].head[0];
    assert.notEqual(timeline.update(first+.6).paths[0].head[0],x);
    const main=m.routes.find(r=>r.kind==='trunk'),drop=m.routes.find(r=>r.kind==='drop');
    let state=timeline.update(first+main.start+main.duration+.05);assert.ok(state.nodes[main.to]>.8);assert.ok(state.buildings.every(v=>v===0));
    state=timeline.update(first+drop.start+.5);assert.ok(state.paths.find(p=>p.route.id===drop.id).active);
    state=timeline.update(first+drop.start+drop.duration+.05);assert.ok(state.buildings[m.nodes[drop.to].building]>.8);
    for(const destination of m.routes.filter(r=>r.kind==='drop')){state=timeline.update(first+destination.start+destination.duration+.05);assert.ok(state.buildings[m.nodes[destination.to].building]>.8,destination.id+' never activates');}
    assert.ok(m.cycle<m.activeEnd,'trains must overlap across the network');
    assert.ok(m.routes.every(r=>r.duration<m.cycle),'a pulse must finish each route before repeating');
    for(let t=m.activeEnd;t<m.activeEnd+m.cycle*3;t+=.05){state=timeline.update(first+t);assert.ok(state.activeSignals>0,'network went idle at '+t);}
    for(const destination of m.routes.filter(r=>r.kind==='drop')){state=timeline.update(first+m.cycle*2+destination.start+destination.duration+.05);assert.ok(state.buildings[m.nodes[destination.to].building]>.8,destination.id+' did not activate on a later train');}
    assert.equal(timeline.update(first+m.cycle+.4).activeSignals>0,true);
  });
}
