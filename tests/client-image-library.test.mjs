import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {heroSlides} from '../option-a/src/components/ui/hero-slides.js';
import {clientImageAssets,clientImageURL,clientPicture} from '../shared/client-image-library.js';
const read=path=>fs.readFileSync(new URL('../'+path,import.meta.url));
test('client originals remain byte-identical and every responsive export stays within source dimensions',()=>{
 const record=JSON.parse(read('assets/review/client-library/exports.json'));
 assert.equal(record.assets.length,8);
 for(const asset of record.assets){
  assert.equal(crypto.createHash('sha256').update(read(asset.source)).digest('hex'),asset.sourceSHA256);
  assert.equal(clientImageAssets[asset.id].width,asset.width);
  for(const image of asset.exports){assert.ok(image.width<=asset.width);assert.ok(image.height<=asset.height);assert.equal(read(image.path).length,image.bytes);assert.equal(Math.round(asset.height*image.width/asset.width),image.height);assert.ok(fs.existsSync(fileURLToPath(clientImageURL(asset.id,image.width))));}
  assert.match(clientPicture(asset.id),/data-client-image/);
 }
});
test('A retains all three approved hero stories and places the supplied family between the approved stories',()=>{
 assert.equal(heroSlides.length,4);
 assert.deepEqual([heroSlides[0],heroSlides[2],heroSlides[3]].map(s=>s.name),['Residential','Connected family','Business collaboration']);
 const originals=[['a-h01-residential-woman-desktop-red-cushions-v1','a-h01-residential-woman-medium-red-cushions-v1','a-h01-residential-woman-mobile-red-cushions-v1'],['a-h02-connected-family-desktop-v3','a-h02-connected-family-medium-v1','a-h02-connected-family-mobile-v1'],['a-h03-business-collaboration-desktop-v3','a-h03-business-collaboration-medium-v2','a-h03-business-collaboration-mobile-v2']];
 for(let i=0;i<3;i++)for(const [n,key] of ['desktop','medium','mobile'].entries())assert.ok([heroSlides[0],heroSlides[2],heroSlides[3]][i][key].src.includes(originals[i][n]));
 assert.ok(heroSlides[1].desktop.src.includes('client-library/family-tablet-1-'));assert.match(heroSlides[1].mobile.src,/family-tablet-1-portrait-/);
});
