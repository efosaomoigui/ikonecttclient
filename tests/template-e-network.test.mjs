import test from 'node:test';
import assert from 'node:assert/strict';
import {createNetworkModel,createNetworkTimeline} from '../option-e/network-model.js';

for(const mobile of [false,true]){
  test(`E ${mobile?'mobile':'desktop'} network is connected, causal and outside building interiors`,()=>{
    const m=createNetworkModel({mobile}),point=new Float32Array(3);
    assert.equal(m.buildings.length,mobile?16:36);assert.equal(m.routes.filter(r=>r.kind==='drop').length,mobile?3:4);
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
  test(`E ${mobile?'mobile':'desktop'} signals travel, branch, activate destinations and rest`,()=>{
    const m=createNetworkModel({mobile}),timeline=createNetworkTimeline(m),first=m.firstTransmission;
    assert.equal(timeline.update(0).activeSignals,0);
    const source=timeline.update(first+.3);assert.ok(source.paths[0].active);const x=source.paths[0].head[0];
    assert.notEqual(timeline.update(first+.6).paths[0].head[0],x);
    const main=m.routes.find(r=>r.kind==='trunk'),drop=m.routes.find(r=>r.kind==='drop');
    let state=timeline.update(first+main.start+main.duration+.05);assert.ok(state.nodes[main.to]>.8);assert.ok(state.buildings.every(v=>v===0));
    state=timeline.update(first+drop.start+.5);assert.ok(state.paths.find(p=>p.route.id===drop.id).active);
    state=timeline.update(first+drop.start+drop.duration+.05);assert.ok(state.buildings[m.nodes[drop.to].building]>.8);
    for(const destination of m.routes.filter(r=>r.kind==='drop')){state=timeline.update(first+destination.start+destination.duration+.05);assert.ok(state.buildings[m.nodes[destination.to].building]>.8,destination.id+' never activates');}
    state=timeline.update(first+m.activeEnd+2);assert.equal(state.activeSignals,0);assert.equal(state.stage,'ambient-rest');assert.ok(state.buildings.every(v=>v===0));
    assert.equal(timeline.update(first+m.cycle+.4).activeSignals>0,true);
  });
}
