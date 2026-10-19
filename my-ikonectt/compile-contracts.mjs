import { build } from "esbuild";
import { fileURLToPath } from "node:url";
await build({
  entryPoints: [
    fileURLToPath(new URL("./contract-runtime.ts", import.meta.url)),
  ],
  outfile: fileURLToPath(new URL("./generated/contracts.js", import.meta.url)),
  bundle: true,
  format: "esm",
  platform: "browser",
  target: "es2022",
  minify: true,
  legalComments: "none",
});
