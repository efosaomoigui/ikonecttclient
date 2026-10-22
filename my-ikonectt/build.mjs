import { mkdir, copyFile, cp, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { writeFile } from "node:fs/promises";
import { runtimeConfig } from "./runtime.mjs";
await import("./compile-contracts.mjs");
const root = new URL("./", import.meta.url),
  dest = new URL("./dist/", root);
await mkdir(dest, { recursive: true });
for (const file of [
  "index.html",
  "portal.css",
  "theme.js",
  "app.js",
  "config.js",
  "api.js",
  "live.js",
  "fixtures.js",
  "journeys.js",
  "form-validation.js",
  "navigation.js",
  "wallet.js",
  "wallet-fixtures.js",
]) {
  await copyFile(new URL(file, root), new URL(file, dest));
}
await writeFile(new URL("runtime-config.js", dest), runtimeConfig());
await cp(new URL("generated/", root), new URL("generated/", dest), {
  recursive: true,
});
await cp(new URL("assets/", root), new URL("assets/", dest), {
  recursive: true,
});
const html = await readFile(new URL("index.html", dest), "utf8");
if (!html.includes("app.js")) throw new Error("Missing portal entry point");
console.log(`Portal build complete: ${fileURLToPath(dest)}`);
