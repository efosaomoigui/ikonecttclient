const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const outDir = path.join(rootDir, 'public_html');

console.log('--- Building iKonectt Client Showcase Distribution for Vercel ---');

// 1. Build Option A
console.log('[1/5] Building Option A...');
execSync('npm run build', { cwd: path.join(rootDir, 'option-a'), stdio: 'inherit' });

// 2. Build Option B
console.log('[2/5] Building Option B...');
execSync('npm run build', { cwd: path.join(rootDir, 'option-b'), stdio: 'inherit' });

// 3. Build Option C (Option 03)
console.log('[3/5] Building Option C (Option 03 Starlink-Restrained)...');
execSync('npm run build', { cwd: path.join(rootDir, 'option-c'), stdio: 'inherit' });

// 4. Create output directory
console.log('[4/5] Preparing public_html directory...');
if (fs.existsSync(outDir)) {
  fs.rmSync(outDir, { recursive: true, force: true });
}
fs.mkdirSync(outDir, { recursive: true });

// Copy root static files
const staticFiles = [
  'index.html',
  'residential.html',
  'business.html',
  'coverage.html',
  'design.md',
  'Ikonectt_content (1).md',
  'README.md'
];

for (const file of staticFiles) {
  const src = path.join(rootDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(outDir, file));
    console.log(`Copied: ${file}`);
  }
}

// Copy assets
function copyFolderSync(from, to, excluded = []) {
  if (!fs.existsSync(from)) return;
  fs.mkdirSync(to, { recursive: true });
  fs.readdirSync(from).forEach(element => {
    if (excluded.includes(element)) return;
    const stat = fs.lstatSync(path.join(from, element));
    if (stat.isFile()) {
      fs.copyFileSync(path.join(from, element), path.join(to, element));
    } else if (stat.isDirectory()) {
      copyFolderSync(path.join(from, element), path.join(to, element));
    }
  });
}

console.log('Copying assets...');
copyFolderSync(path.join(rootDir, 'assets'), path.join(outDir, 'assets'), ['review']);
// The same public-site modules drive standalone templates and the compiled React adapters.
copyFolderSync(path.join(rootDir, 'shared'), path.join(outDir, 'shared'));

// Copy Option A build
console.log('Copying Option A build...');
copyFolderSync(path.join(rootDir, 'option-a', 'dist'), path.join(outDir, 'option-a'));

// Copy Option B build
console.log('Copying Option B build...');
copyFolderSync(path.join(rootDir, 'option-b', 'dist'), path.join(outDir, 'option-b'));

// Copy Option C build
console.log('Copying Option C build...');
copyFolderSync(path.join(rootDir, 'option-c', 'dist'), path.join(outDir, 'option-c'));

// Options D and E are supplied standalone HTML prototypes; no compilation needed.
for (const option of ['option-d', 'option-e']) {
  const source = path.join(rootDir, option);
  if (!fs.existsSync(path.join(source, 'index.html'))) {
    throw new Error(`Missing ${option}/index.html`);
  }
  console.log(`Copying ${option} prototype...`);
  copyFolderSync(source, path.join(outDir, option));
}

console.log('[5/5] Showcase distribution ready in public_html/');
console.log('Two active shortlist options ready: Template A and Template E. B/C/D links remain packaged for compatibility.');
