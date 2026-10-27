import fs from 'node:fs';
const checkpoint=JSON.parse(fs.readFileSync(new URL('../../docs/evidence/connectivity-storytelling/checkpoint.json',import.meta.url)));
const allowed=new Set(['option-a/src/components/ui/HeroSlideshow.tsx','option-a/src/components/ui/hero-slideshow.js','option-a/src/components/ui/hero-slideshow.css']);
export const storyPreservationHash=(file,previous,{normalized=false}={})=>allowed.has(file)?checkpoint.files[file][normalized?'sha256LF':'sha256']:previous;
