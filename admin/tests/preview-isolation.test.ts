import {test} from 'node:test';
import assert from 'node:assert/strict';
import configuration from '../vite.config';

async function settings(command:'serve'|'build',mode:string){
 if(typeof configuration!=='function')throw Error('Expected Vite config factory');
 return await configuration({command,mode,isSsrBuild:false,isPreview:false});
}
test('normal local and production Admin never enable the simulated workspace',async()=>{
 for(const [command,mode] of [['serve','development'],['serve','production'],['build','production']] as const){
  const config=await settings(command,mode);
  assert.equal(config.define?.__IKONECTT_PREVIEW__,'false');
  assert.equal(config.define?.__IKONECTT_STANDALONE_DEMO__,'false');
 }
});
test('simulation remains isolated in explicitly selected review and demo modes',async()=>{
 for(const mode of ['review','demo']){
  const config=await settings('build',mode);
  assert.equal(config.define?.__IKONECTT_PREVIEW__,'true');
  assert.equal(config.define?.__IKONECTT_STANDALONE_DEMO__,String(mode==='demo'));
 }
});
