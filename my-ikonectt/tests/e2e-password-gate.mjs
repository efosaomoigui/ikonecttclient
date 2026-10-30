import { readFile, writeFile, mkdir } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import assert from "node:assert/strict";
import { createLiveAdapter } from "../live.js";
const file = process.env.IKONECTT_PASSWORD_GATE_ACCOUNT;
if (!file)
  throw new Error(
    "Set IKONECTT_PASSWORD_GATE_ACCOUNT to the isolated development credential file supplied by Agent 1.",
  );
const account = JSON.parse(await readFile(file, "utf8"));
const base = process.env.IKONECTT_API_BASE || "http://127.0.0.1:4000/api/v1";
if (!["localhost", "127.0.0.1"].includes(new URL(base).hostname))
  throw new Error("Local development API only.");
const api = createLiveAdapter({ base });
const auth = await api.login(account.accountNumber, account.password);
assert.equal(auth.mustChangePassword, true);
await assert.rejects(api.summary(), { status: 403 });
const password = randomBytes(24).toString("base64url");
await api.changePassword(account.password, password);
await assert.rejects(api.resume(), { status: 401 });
const profile = await api.login(account.accountNumber, password);
assert.equal(profile.mustChangePassword, undefined);
assert.equal(
  (await api.summary()).profile.accountNumber,
  account.accountNumber,
);
await api.logout();
await mkdir(new URL("../.local/", import.meta.url), { recursive: true });
await writeFile(
  new URL("../.local/password-gate-completed.json", import.meta.url),
  JSON.stringify({ accountNumber: account.accountNumber, password }),
);
await mkdir(new URL("../evidence/stage2/", import.meta.url), {
  recursive: true,
});
await writeFile(
  new URL("../evidence/stage2/password-gate.json", import.meta.url),
  JSON.stringify(
    {
      runAt: new Date().toISOString(),
      mode: "real HTTP and development database",
      checks: [
        "mustChangePassword returned by login",
        "dashboard blocked with 403 before change",
        "password change succeeds on isolated imported account",
        "old session cleared",
        "new credentials permit dashboard",
        "logout succeeds",
      ],
      passed: true,
    },
    null,
    2,
  ) + "\n",
);
console.log(
  "PASS live required-password-change gate, protected dashboard, change, reauthentication and logout. No credentials logged.",
);
