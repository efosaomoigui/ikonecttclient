import test from "node:test";
import assert from "node:assert/strict";
import { createMockAdapter } from "../api.js";
import { demoCredentials } from "../fixtures.js";
test("mock lifecycle scopes account data, rejects credentials, submits support, invalidates session and changes password", async () => {
  const store = new Map(),
    storage = {
      getItem: (k) => store.get(k),
      setItem: (k, v) => store.set(k, v),
      removeItem: (k) => store.delete(k),
    };
  const api = createMockAdapter(storage);
  await assert.rejects(api.summary(), { status: 401 });
  await assert.rejects(api.login("10000001", "wrong"), { status: 401 });
  const profile = await api.login(
    demoCredentials.accountNumber,
    demoCredentials.password,
  );
  assert.notEqual(profile.id, profile.accountNumber);
  const before = await api.summary();
  before.profile.name = "mutated";
  assert.equal((await api.summary()).profile.name, "Amara Okafor");
  const ticket = await api.createTicket({
    subject: "Connection dropped",
    category: "Connectivity",
    description: "My service has been offline this morning.",
  });
  assert.equal((await api.summary()).tickets[0].id, ticket.id);
  assert.equal(ticket.status, "Open");
  await assert.rejects(api.changePassword("wrong", "NewPassword!2026"));
  await api.changePassword(demoCredentials.password, "NewPassword!2026");
  await assert.rejects(api.session(), { status: 401 });
  await assert.rejects(
    api.login(demoCredentials.accountNumber, demoCredentials.password),
    { status: 401 },
  );
  await api.login(demoCredentials.accountNumber, "NewPassword!2026");
  await api.logout();
  await assert.rejects(api.resume(), { status: 401 });
  assert.equal(store.size, 0);
});
test("recovery acknowledges generically and demo reset codes are single use", async () => {
  const api = createMockAdapter(null);
  const message = (await api.recover("unknown-account")).message;
  assert.ok(message.includes("If the account"));
  await assert.rejects(api.resetPassword("invalid", "FreshPassword!2026"));
  await api.resetPassword("DEMO-RESET-TOKEN", "FreshPassword!2026");
  await assert.rejects(
    api.resetPassword("DEMO-RESET-TOKEN", "AnotherPassword!2026"),
  );
  await api.login(demoCredentials.accountNumber, "FreshPassword!2026");
  assert.equal(
    (await api.session()).accountNumber,
    demoCredentials.accountNumber,
  );
});
