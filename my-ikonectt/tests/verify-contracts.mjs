// Run through Agent 1's tsx when the shared TypeScript contract is available.
import { pathToFileURL } from "node:url";
import { rawFixture } from "../fixtures.js";
const C = await import(
  process.argv[2]
    ? pathToFileURL(process.argv[2]).href
    : new URL("../vendor/index.ts", import.meta.url).href
);
for (const [key, schema] of [
  ["customer", C.Customer],
  ["plans", C.Plan],
  ["subscriptions", C.Subscription],
  ["orders", C.Order],
  ["payments", C.Payment],
  ["receipts", C.Receipt],
  ["tickets", C.TicketDetail],
]) {
  for (const record of Array.isArray(rawFixture[key])
    ? rawFixture[key]
    : [rawFixture[key]])
    schema.parse(record);
}
C.CreateTicketRequest.parse({
  subject: "A connection issue",
  message: "Please review my connection.",
});
C.ChangePasswordRequest.parse({
  currentPassword: "temporary",
  password: "NewPassword!2026",
});
console.log(
  "All development wire fixtures and mutation shapes pass Agent 1 canonical Zod schemas.",
);
