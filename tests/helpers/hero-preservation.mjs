import fs from 'node:fs';
import {creativePreservationHash} from './creative-preservation.mjs';
import {storyPreservationHash} from './story-preservation.mjs';
import {corporateLightHash} from './corporate-light-preservation.mjs';

// The client explicitly authorised this later hero refinement. Keep older phase
// records immutable and protect these three sources at the new checkpoint.
const checkpoint=JSON.parse(fs.readFileSync(new URL('../../docs/evidence/template-a-hero-refinement/checkpoint.json',import.meta.url)));
const authorised=new Set([
 'option-a/src/components/ui/HeroSlideshow.tsx',
 'option-a/src/components/ui/hero-slideshow.js',
 'option-a/src/components/ui/hero-slideshow.css',
]);
export function heroPreservationHash(file,historical,{normalized=false}={}){
 if(!authorised.has(file))return corporateLightHash(file,creativePreservationHash(file,historical,{normalized}),{normalized});
 return storyPreservationHash(file,checkpoint.files[file][normalized?'sha256LF':'sha256'],{normalized});
}
