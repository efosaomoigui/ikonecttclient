import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {photoNetworkHTML,layoutPhotoNetwork,createCityRenderer} from '../option-e/photo-network.js';

test('photographic signals travel to facade nodes without creating buildings, canvas or a second clock',async()=>{
 const dom=new JSDOM(`<div>${photoNetworkHTML()}</div>`,{pretendToBeVisual:true});
 const host=dom.window.document.querySelector('div');let frames=0;dom.window.requestAnimationFrame=()=>{frames++;};
 const renderer=await createCityRenderer(host);
 assert.equal(host.querySelectorAll('canvas,.e-city-canvas,.e-city-fallback').length,0);
 assert.equal(host.querySelectorAll('svg').length,1);
 const pulse=host.querySelector('[data-photo-pulse]');renderer.render(.8);const first=pulse.style.strokeDashoffset;
 const motion=renderer.render(1.5);assert.notEqual(pulse.style.strokeDashoffset,first);assert.ok(motion.activeSignals>0);
 const midway=renderer.render(2.9);assert.ok(parseFloat(pulse.style.strokeDashoffset)>.45);assert.equal(midway.litBuildings,0);
 const arrival=renderer.render(5.4);assert.ok(arrival.litBuildings>0);assert.equal(arrival.buildings,0);assert.equal(arrival.textures,0);
 assert.equal(frames,0);renderer.destroy();const frozen=pulse.style.strokeDashoffset;renderer.render(10);assert.equal(pulse.style.strokeDashoffset,frozen);assert.equal(pulse.style.opacity,'0');dom.window.close();
});

test('white source rises from the bottom-left boundary after resizing while facade anchors stay fixed',()=>{
 const dom=new JSDOM(`<div>${photoNetworkHTML()}</div>`),host=dom.window.document.querySelector('div'),svg=host.querySelector('svg');
 const node=host.querySelector('[data-photo-node] circle'),originalNode=node.outerHTML;
 assert.equal(host.querySelector('[data-photo-source]').getAttribute('fill'),'#fff');
 assert.equal(host.querySelectorAll('.e-photo-routes-desktop [data-photo-node]').length,8);
 assert.equal(host.querySelectorAll('.e-photo-routes-mobile [data-photo-node]').length,5);
 for(const [width,height] of [[1440,900],[390,844],[320,700]]){
  host.getBoundingClientRect=()=>({width,height});layoutPhotoNetwork(host);
  assert.ok(Math.abs(Number(svg.dataset.sourceX)-32)<.01);
  assert.ok(Math.abs(Number(svg.dataset.sourceY)-(height-2))<.01);
  assert.equal(node.outerHTML,originalNode);
 }
 const hero=dom.window.document.createElement('section');hero.className='hero';hero.dataset.groundedSource='buried';host.before(hero);hero.append(host);
 host.getBoundingClientRect=()=>({width:1440,height:720});layoutPhotoNetwork(host);
 assert.equal(Number(svg.dataset.sourceY),734);assert.equal(node.outerHTML,originalNode);
 dom.window.close();
});
