import { execFileSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
const ref = process.argv[2] || "4f90e10fbdb9e04fb606109ac5ff3d81145ba18e";
const commit = execFileSync(
  "git",
  ["rev-parse", "--verify", `${ref}^{commit}`],
  { encoding: "utf8" },
).trim();
await mkdir(new URL("./vendor/", import.meta.url), { recursive: true });
for (const file of ["index.ts", "fixtures.ts", "README.md", "openapi.json"]) {
  const data = execFileSync("git", ["show", `${commit}:contracts/${file}`], {
    maxBuffer: 4 * 1024 * 1024,
  });
  await writeFile(new URL("./vendor/" + file, import.meta.url), data);
}
await writeFile(
  new URL("./vendor/provenance.json", import.meta.url),
  JSON.stringify(
    {
      commit,
      source: "contracts/",
      branch: "codex/ikonectt-core-backend",
      note: "Read-only snapshot from a committed Git object. Update only after Agent 1 publishes a stable commit.",
    },
    null,
    2,
  ) + "\n",
);
console.log("Canonical API snapshot synchronized from " + commit);
