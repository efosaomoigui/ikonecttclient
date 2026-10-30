import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {mountBrandSpelling} from '../shared/brand-spelling.js';
const flush=async()=>{for(let n=0;n<8;n++)await Promise.resolve();};

test('approved spelling follows dynamic public copy, metadata and labels without changing user content or destinations',async()=>{
 const dom=new JSDOM('<!doctype html><title>Ikonectt home</title><meta name="description" content="iKonectt broadband"><main><h2>Why Choose Ikonectt</h2><a href="#/my-ikonectt/sign-in" aria-label="My Ikonectt">My Ikonectt</a><img alt="IKONECTT logo"><input value="Ikonectt typed by user"><textarea>Ikonectt draft</textarea><article data-role="user">I need Ikonectt help</article><article data-role="assistant">Welcome to Ikonectt Support.</article></main>'),doc=dom.window.document,root=doc.querySelector('main'),link=root.querySelector('a'),destroy=mountBrandSpelling(root);
 assert.equal(root.querySelector('h2').textContent,'Why Choose ikonectt');assert.equal(link.textContent,'My ikonectt');assert.equal(link.getAttribute('href'),'#/my-ikonectt/sign-in');assert.equal(link.getAttribute('aria-label'),'My ikonectt');assert.equal(doc.title,'ikonectt home');assert.equal(doc.querySelector('meta').content,'ikonectt broadband');assert.equal(root.querySelector('img').alt,'ikonectt logo');
 assert.equal(root.querySelector('input').value,'Ikonectt typed by user');assert.equal(root.querySelector('textarea').value,'Ikonectt draft');assert.equal(root.querySelector('[data-role=user]').textContent,'I need Ikonectt help');assert.equal(root.querySelector('[data-role=assistant]').textContent,'Welcome to ikonectt Support.');
 const heading=doc.createElement('h1');heading.textContent='About Ikonectt';root.append(heading);doc.title='Contact Ikonectt';link.setAttribute('title','My Ikonectt');await flush();assert.equal(heading.textContent,'About ikonectt');assert.equal(doc.title,'Contact ikonectt');assert.equal(link.title,'My ikonectt');
 destroy();heading.textContent='Ikonectt after cleanup';await flush();assert.equal(heading.textContent,'Ikonectt after cleanup');dom.window.close();
});
