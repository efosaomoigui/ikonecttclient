import { build } from "esbuild";
import { mkdir, copyFile, cp, readFile, writeFile, rm, lstat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
await import("./compile-contracts.mjs");
const root = path.resolve(fileURLToPath(new URL("./", import.meta.url)));
const output = path.join(root, "dist-demo");
// The only recursive removal target is this app's own generated demo output.
if (path.dirname(path.resolve(output)) !== root || path.basename(output) !== "dist-demo")
  throw new Error("Unsafe demo output target");
const existing = await lstat(output).catch(error => { if (error.code !== "ENOENT") throw error; });
if (existing?.isSymbolicLink()) throw new Error("Demo output must not be a symbolic link");
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
const replacements = { "api.js": "api.js", "config.js": "config.js", "live.js": "views.js", "fixtures.js": "fixture-stubs.js", "wallet-fixtures.js": "fixture-stubs.js" };
const result = await build({
  entryPoints: [path.join(root, "app.js")], outfile: path.join(output, "app.js"), bundle: true,
  format: "esm", platform: "browser", target: "es2022", minify: true, legalComments: "none", metafile: true,
  define: { "config.mode": '"demo"', "config.standaloneDemo": "true", "config.chat": "null" },
  banner: { js: 'if (!location.hash) location.hash = "/login";' },
  plugins: [{ name: "standalone-only-provider", setup(builder) {
    builder.onLoad({ filter: /(?:app|wallet)\.js$/ }, async args => {
      if (path.dirname(args.path) !== root) return;
      const source = await readFile(args.path, "utf8");
      return { contents: source.replaceAll("config.standaloneDemo", "true").replaceAll("config.mode", '"demo"').replaceAll("config.chat", "null"), loader: "js" };
    });
    builder.onResolve({ filter: /^\.\/(api|config|live|fixtures|wallet-fixtures)\.js$/ }, args => {
      // The replacement adapter's own ./model.js imports are not intercepted.
      if (path.dirname(args.importer) !== root) return;
      return { path: path.join(root, "standalone", replacements[path.basename(args.path)]) };
    });
  } }],
});
for (const source of Object.keys(result.metafile.inputs)) {
  const absolute = path.resolve(source);
  if (["api.js", "live.js", "fixtures.js", "wallet-fixtures.js", "config.js"].some(name => absolute === path.join(root, name)))
    throw new Error("Standalone dependency graph unexpectedly included an integrated provider: " + source);
}
for (const file of ["portal.css", "theme.js"]) await copyFile(path.join(root, file), path.join(output, file));
await cp(path.join(root, "assets"), path.join(output, "assets"), { recursive: true });
let html = await readFile(path.join(root, "index.html"), "utf8");
const deployment = JSON.parse(await readFile(path.join(root, "vercel.json"), "utf8"));
const csp = deployment.headers.flatMap(rule => rule.headers).find(header => header.key === "Content-Security-Policy").value;
const metaCsp = csp.replace(/frame-ancestors[^;]*(?:;|$)/g, "").trim();
html = html.replace('<meta charset="utf-8" />', `<meta charset="utf-8" /><meta name="robots" content="noindex,nofollow,noarchive" /><meta http-equiv="Content-Security-Policy" content="${metaCsp.replaceAll('"', '&quot;')}" />`);
await writeFile(path.join(output, "index.html"), html);
await writeFile(path.join(output, "runtime-config.js"), 'globalThis.__IKONECTT_CONFIG__={mode:"demo",standaloneDemo:true};\n');
await writeFile(path.join(output, "robots.txt"), "User-agent: *\nDisallow: /\n");
const bundle = await readFile(path.join(output, "app.js"), "utf8");
for (const forbidden of ["IkonecttDemo!2026", "DEMO-RESET-TOKEN", "127.0.0.1", "localhost", "/auth/customer/login", "/api/v1"])
  if (bundle.includes(forbidden)) throw new Error("Unexpected integrated/demo-credential marker in output: " + forbidden);
await mkdir(path.join(root, ".local"), { recursive: true });
await writeFile(path.join(root, ".local", "standalone-build-meta.json"), JSON.stringify(result.metafile, null, 2));
console.log("Standalone portal built: " + output + " (no integrated provider or API origin)");
