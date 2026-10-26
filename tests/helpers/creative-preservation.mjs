import fs from 'node:fs';
// Later client brief authorises only these existing presentation files.
// Historical baselines and all customer logic keep their original hashes.
const checkpoint=JSON.parse(fs.readFileSync(new URL('../../docs/evidence/final-creative-refinement/checkpoint.json',import.meta.url)));
const allowed=new Set(['shared/visuals.js','option-e/visual-map.js','option-e/photo-credits.html']);
export function creativePreservationHash(file,historical,{normalized=false}={}){
 return allowed.has(file)?checkpoint.files[file][normalized?'sha256LF':'sha256']:historical;
}
