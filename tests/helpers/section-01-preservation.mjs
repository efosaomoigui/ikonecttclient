import fs from 'node:fs';
const approvedPlans = fs.readFileSync(new URL('./approved-plans-section.html', import.meta.url), 'utf8');
const approvedAudiences = fs.readFileSync(new URL('./approved-audience-sections.html', import.meta.url), 'utf8');
// Sections 01/02 and the connected-device strip authorize their entry points,
// the Plans introduction, and the new strip immediately before Plans.
// Historical checks still compare every byte outside the approved scope.
export function withoutNavigationRefinement(file, bytes) {
 if (file !== 'option-e/index.html') return bytes;
 return Buffer.from(bytes.toString()
  .replace(/<link rel="stylesheet" href="\.\/navigation-refinement\.css\?v=1">\r?\n/, '')
  .replace(/<script type="module" src="\.\/navigation-refinement\.js\?v=1"><\/script>\r?\n/, '')
  .replace(/<link rel="stylesheet" href="\.\/plans-refinement\.css\?v=1">\r?\n/, '')
  .replace(/<link rel="stylesheet" href="\.\/connected-devices\.css\?v=1">\r?\n/, '')
  .replace(/<link rel="stylesheet" href="\.\/audience-sections\.css\?v=1">\r?\n/, '')
  .replace(/<link rel="stylesheet" href="\.\/benefits-refinement\.css\?v=1">\r?\n/, '')
  .replace(/<link rel="stylesheet" href="\.\/button-refinement\.css\?v=1">\r?\n/, '')
  .replace(/<link rel="stylesheet" href="\.\/company-story\.css\?v=1">\r?\n/, '')
  .replace(/<link rel="stylesheet" href="\.\/footer-refinement\.css\?v=1">\r?\n/, '')
  .replace(/<script type="module" src="\.\/footer-refinement\.js\?v=1"><\/script>\r?\n/, '')
  .replace(/<script type="module" src="\.\/homepage-order\.js\?v=1"><\/script>\r?\n/, '')
  .replace(/<script type="module" src="\.\/connected-devices\.js\?v=1"><\/script>\r?\n/, '')
  .replace(/  <div class="split e-audience-sections">[\s\S]*?(?=  <section class="e-connected-devices")/, approvedAudiences)
  .replace(/  <section class="e-connected-devices" id="connected-life"[\s\S]*?<\/section>\r?\n\r?\n/, '')
  .replace(/  <section class="plans" id="plans">[\s\S]*?(?=\r?\n  <section class="about")/, approvedPlans));
}
