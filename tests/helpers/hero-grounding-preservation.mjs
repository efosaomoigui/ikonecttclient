import fs from 'node:fs';
const checkpoint=JSON.parse(fs.readFileSync(new URL('../../docs/evidence/hero-grounding/checkpoint.json',import.meta.url)));
// Client feedback explicitly authorises A's audience photos, E's hero and restored
// photo panels, followed by A's approved price-card asset links.
// All hero copy, catalogue data and customer logic stay protected.
const allowed=new Set(['shared/design-preview.js','option-a/src/App.tsx','option-a/vite.config.ts','option-a/src/components/ui/hero-slides.js','option-e/visual-map.js','shared/campaign.css','option-a/index.html','option-a/src/components/pages/HomePage.tsx','shared/campaign.js','option-e/index.html','option-e/corporate-light.js','option-e/corporate-light.css','option-e/refinement.js','option-e/city-experience.js','option-e/photo-network.js','option-e/homepage-sections.js']);
export const heroGroundingHash=(file,previous,{normalized=false}={})=>allowed.has(file)?checkpoint.files[file][normalized?'sha256LF':'sha256']:previous;
