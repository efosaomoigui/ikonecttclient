const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const output = path.resolve(root, 'public_html');
if (path.dirname(output) !== root || path.basename(output) !== 'public_html' || (fs.existsSync(output) && fs.lstatSync(output).isSymbolicLink())) throw new Error('Unsafe presentation output directory.');
// Reuse the approved website build and the already implemented static adapters.
execSync('npm run build', { cwd: root, stdio: 'inherit' });
for (const app of ['admin', 'my-ikonectt']) execSync('npm run build:demo', { cwd: path.join(root, app), stdio: 'inherit' });
fs.cpSync(path.join(root, 'admin', 'dist-demo', 'admin'), path.join(output, 'admin'), { recursive: true });
fs.cpSync(path.join(root, 'my-ikonectt', 'dist-demo'), path.join(output, 'my-ikonectt'), { recursive: true });
for (const file of ['presentation-links.mjs', 'presentation-links.css']) fs.copyFileSync(path.join(root, 'scripts', file), path.join(output, 'shared', file));
for (const option of ['option-a', 'option-e']) {
  const file = path.join(output, option, 'index.html');
  const html = fs.readFileSync(file, 'utf8');
  fs.writeFileSync(file, html.replace('</head>', '<link rel="stylesheet" href="/shared/presentation-links.css"><script type="module" src="/shared/presentation-links.mjs"></script></head>'));
}
console.log('Presentation ready: Option A, Option E, /admin/ and /my-ikonectt/. Static only; no backend or database.');
