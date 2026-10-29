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
console.log('Presentation ready: Option A, Option E, /admin/ and /my-ikonectt/. Static only; no backend or database.');
