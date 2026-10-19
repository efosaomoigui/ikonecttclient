import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runtimeConfig } from "./runtime.mjs";
const root = path.resolve(fileURLToPath(new URL("./", import.meta.url)));
const types = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
};
http
  .createServer(async (req, res) => {
    try {
      const pathname = decodeURIComponent(
        new URL(req.url, "http://localhost").pathname,
      );
      if (pathname === "/runtime-config.js") {
        res.writeHead(200, {
          "Content-Type": "text/javascript",
          "Cache-Control": "no-store",
        });
        res.end(runtimeConfig());
        return;
      }
      let file = path.resolve(root, "." + pathname);
      const relative = path.relative(root, file);
      if (
        relative.startsWith("..") ||
        path.isAbsolute(relative) ||
        relative.split(/[\\/]/).some((part) => part.startsWith(".")) ||
        ["vendor", "node_modules", "tests", "evidence"].includes(
          relative.split(/[\\/]/)[0],
        )
      )
        throw Error();
      if ((await stat(file)).isDirectory())
        file = path.join(file, "index.html");
      const content = await readFile(file);
      res.writeHead(200, {
        "Content-Type": types[path.extname(file)] || "application/octet-stream",
        "Cache-Control": "no-store",
      });
      res.end(content);
    } catch {
      res.writeHead(404);
      res.end("Not found");
    }
  })
  .listen(Number(process.env.PORT || 4175), "127.0.0.1", () =>
    console.log(
      `Local: http://127.0.0.1:${process.env.PORT || 4175}/ (${process.env.IKONECTT_MODE || "live"} API mode)`,
    ),
  );
