const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

const includeDemos = process.argv.includes('--with-demos');
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

const apiBase=process.env.IKONECTT_PUBLIC_API_BASE||'/api/v1';
if(!apiBase.startsWith('/')&&!/^https?:\/\//.test(apiBase))throw new Error('Invalid public API base.');
if(apiBase.startsWith('//')||(/[\r\n]/.test(apiBase)))throw new Error('Invalid public API base.');
if(/^https?:/.test(apiBase)){const parsed=new URL(apiBase);if(parsed.username||parsed.password)throw new Error('Public API URL cannot contain credentials.');}
fs.writeFileSync(path.join(output,'shared','public-config.js'),'globalThis.__IKONECTT_PUBLIC_CONFIG__='+JSON.stringify({mode:'api',apiBase})+';\n');
const file=path.join(output,'option-e','index.html');
const source=fs.readFileSync(file,'utf8');
if(!source.includes('<body data-template="e">')||!source.includes('</head>'))throw new Error('Approved website entry is missing.');
const demoLinks = includeDemos
  ? '<link rel="stylesheet" href="/shared/presentation-links.css"><script type="module" src="/shared/presentation-links.mjs"></script>'
  : '';
fs.writeFileSync(file,source
  .replace('<body data-template="e">','<body data-template="e" data-public-release>')

  .replace('</head>', '<script src="/shared/public-config.js"></script><link rel="canonical" href="/option-e/">\n' + demoLinks + '</head>'));
fs.writeFileSync(path.join(output,'index.html'),'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=/option-e/"><title>Ikonectt</title></head><body><a href="/option-e/">Visit Ikonectt</a></body></html>\n');
if (includeDemos) {
  for (const app of ['admin']) {
    execSync('npm run build:demo', { cwd: path.join(root, app), stdio: 'inherit' });
  }
  fs.cpSync(path.join(root, 'admin', 'dist-demo', 'admin'), path.join(output, 'admin'), { recursive: true });
  // The custom customer application remains in source, outside the public artifact.
  for (const name of ['presentation-links.mjs', 'presentation-links.css']) {
    fs.copyFileSync(path.join(root, 'scripts', name), path.join(output, 'shared', name));
  }
}
console.log('Canonical public website built in dist-public. Presentation and application builds are separate.');
