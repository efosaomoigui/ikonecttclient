import {test} from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {mountAssistant} from '../shared/assistant.js';

test('Option E support dock stays anchored on phones when page controls scroll behind it',async()=>{
 const dom=new JSDOM('<body><div id="site"><button id="obstacle">Page action</button></div></body>',{url:'http://localhost/option-e/',pretendToBeVisual:true});const {window}=dom;
 for(const key of ['window','document','AbortController'])globalThis[key]=key==='window'?window:window[key];
 Object.defineProperty(window,'innerWidth',{value:390,configurable:true});Object.defineProperty(window,'innerHeight',{value:844,configurable:true});
 let top=790;const obstacle=document.querySelector('#obstacle');obstacle.getClientRects=()=>[{left:300,right:370,top,bottom:top+50}];obstacle.getBoundingClientRect=()=>obstacle.getClientRects()[0];
 const assistant=mountAssistant({root:document.querySelector('#site'),template:'e',getContext:()=>({path:'home'}),navigate:()=>{}});
 try{const host=document.querySelector('.ik-assistant');assert.equal(host.style.getPropertyValue('--assistant-dock-bottom'),'20px');
 for(top of [790,640,500,300]){window.dispatchEvent(new window.Event('scroll'));await new Promise(resolve=>window.setTimeout(resolve,30));assert.equal(host.style.getPropertyValue('--assistant-dock-bottom'),'20px');}
 Object.defineProperty(window,'innerWidth',{value:1440,configurable:true});window.dispatchEvent(new window.Event('resize'));assert.equal(host.style.getPropertyValue('--assistant-dock-bottom'),'20px');
 document.querySelector('[data-launcher]').click();assert.ok(document.querySelector('dialog').hasAttribute('open'));document.querySelector('[data-close]').click();assert.ok(!document.querySelector('dialog').hasAttribute('open'));
 }finally{assistant.destroy();dom.window.close();}
});
