import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';

test('local shortlist serves compiled React templates and retains standalone D/E', {timeout:20000}, async t=>{
  const child=spawn(process.execPath,[fileURLToPath(new URL('../server.js',import.meta.url))],{env:{...process.env,PORT:'0'},stdio:['ignore','pipe','pipe']});
  t.after(()=>child.kill());
  const port=await new Promise((resolve,reject)=>{
    let output='';
    const timer=setTimeout(()=>reject(new Error('Preview server did not start')),10000);
    child.once('error',error=>{clearTimeout(timer);reject(error);});
    child.once('exit',code=>{clearTimeout(timer);reject(new Error('Preview server exited: '+code));});
    child.stdout.on('data',chunk=>{output+=chunk;const match=output.match(/Local:\s+http:\/\/localhost:(\d+)/);if(match){clearTimeout(timer);resolve(Number(match[1]));}});
  });
  const base=`http://127.0.0.1:${port}`;
  const selector=await (await fetch(base+'/')).text();
  for(const id of ['a','e'])assert.ok(selector.includes(`data-option-link="${id}"`));
  assert.ok(!selector.includes('data-option-link="d"'));
  for(const id of ['a','b','c']){
    const response=await fetch(`${base}/option-${id}/`);assert.equal(response.status,200);
    const html=await response.text();assert.doesNotMatch(html,/src\/main\.tsx/);
    const script=html.match(/<script[^>]+src="([^"]+\/assets\/[^\"]+\.js|\.\/assets\/[^\"]+\.js)"/);
    assert.ok(script,'compiled module missing for '+id);
    const asset=await fetch(new URL(script[1],`${base}/option-${id}/`));assert.equal(asset.status,200);
    assert.match(asset.headers.get('content-type'),/javascript/);
    const expected=await readFile(new URL(`../public_html/option-${id}/${script[1].replace(/^\.\//,'')}`,import.meta.url));
    assert.deepEqual(Buffer.from(await asset.arrayBuffer()),expected);
  }
  for(const id of ['d','e'])assert.equal((await fetch(`${base}/option-${id}/`)).status,200);
  assert.equal((await fetch(base+'/public_html/option-a/')).status,200);
  const redirect=await fetch(base+'/option-a?example=1',{redirect:'manual'});assert.equal(redirect.status,301);assert.equal(redirect.headers.get('location'),'/option-a/?example=1');
});
