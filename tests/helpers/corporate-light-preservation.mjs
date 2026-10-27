import fs from 'node:fs';
const checkpoint=JSON.parse(fs.readFileSync(new URL('../../docs/evidence/option-e-corporate-light/checkpoint.json',import.meta.url)));
// The new brief changes E presentation only. All shared logic and A keep their old checkpoints.
const allowed=new Set(['option-e/index.html','option-e/refinement.js','option-e/refinement.css','option-e/city-experience.js','option-e/city-three.js','option-e/city-fallback.svg','option-e/photo-credits.html','option-e/corporate-light.js','option-e/corporate-light.css']);
export const corporateLightHash=(file,previous,{normalized=false}={})=>allowed.has(file)?checkpoint.files[file][normalized?'sha256LF':'sha256']:previous;
