const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const output = path.resolve(root, 'dist-public');
if (path.dirname(output) !== root || path.basename(output) !== 'dist-public'
  || (fs.existsSync(output) && fs.lstatSync(output).isSymbolicLink())) {
  throw new Error('Unsafe public output directory.');
}

fs.rmSync(output, {recursive:true, force:true});
fs.mkdirSync(output);
for (const name of ['option-e', 'shared', 'assets']) {
  const source = path.join(root,name);
  fs.cpSync(source,path.join(output,name),{recursive:true,filter:file=>{
    const parts=path.relative(source,file).split(path.sep);
    return !parts.some(part=>part==='review'||part==='node_modules'||part.startsWith('.'));
  }});
}

const file=path.join(output,'option-e','index.html');
const source=fs.readFileSync(file,'utf8');
if(!source.includes('<body data-template="e">')||!source.includes('</head>'))throw new Error('Approved website entry is missing.');
fs.writeFileSync(file,source
  .replace('<body data-template="e">','<body data-template="e" data-public-release>')
  .replace('href="#portal">My ikonectt','href="#/my-ikonectt/sign-in">My ikonectt')
  .replace('</head>','<link rel="canonical" href="/option-e/">\n<link rel="stylesheet" href="./coverage-skyline.css">\n</head>'));
fs.writeFileSync(path.join(output,'index.html'),'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=/option-e/"><title>Ikonectt</title></head><body><a href="/option-e/">Visit Ikonectt</a></body></html>\n');
console.log('Canonical public website built in dist-public. Presentation and application builds are separate.');
