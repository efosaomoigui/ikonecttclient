// Presentation metadata only. Commercial content remains in catalogue.js/content.js.
export const activeDesigns = [
  {id:'a', number:1, label:'A+C Hybrid', path:'./option-a/', color:'bg-blue-600'},
  {id:'d', number:2, label:'Template D', path:'./option-d/', color:'bg-emerald-600'},
  {id:'e', number:3, label:'Template E', path:'./option-e/', color:'bg-amber-600'},
];
export const archivedDesigns = [
  {id:'b', path:'./option-b/', status:'archived; existing direct links retained'},
  {id:'c', path:'./option-c/', status:'archived; existing direct links retained'},
];
export const preservation = {commit:'21b060e41aafa5bff7f2cab8e3a2a03df3911637', branch:'codex/preserve-five-templates-2026-10-16'};
export function activeDesign(id) {return activeDesigns.find(design=>design.id===id)||activeDesigns[0];}
