import test from "node:test";
import assert from "node:assert/strict";
import * as C from "../generated/contracts.js";
import { rawFixture, demoCredentials } from "../fixtures.js";
import { createMockAdapter } from "../api.js";
test("isolated UI wire fixtures satisfy the pinned canonical v1 schemas", () => {
  for (const [key, schema] of [
    ["customer", C.Customer],
    ["plans", C.Plan],
    ["subscriptions", C.Subscription],
    ["orders", C.Order],
    ["payments", C.Payment],
    ["receipts", C.Receipt],
    ["tickets", C.TicketDetail],
  ])
    for (const record of Array.isArray(rawFixture[key])
      ? rawFixture[key]
      : [rawFixture[key]])
      schema.parse(record);
});
test("explicit mock provider supports Stage 2 workflows without turning reports into verified payments", async () => {
  const api = createMockAdapter(null);
  await api.login(demoCredentials.accountNumber, demoCredentials.password);
  await api.updateProfile("+2348000000456");
  assert.equal((await api.session()).phone, "+2348000000456");
  const order = await api.createOrder({
    planId: rawFixture.plans[0].id,
    buildingId: rawFixture.customer.buildingId,
    type: "NEW_CONNECTION",
  });
  C.Order.parse(order);
  const payment = await api.reportPayment({
    orderId: order.id,
    amountMinor: order.amountMinor,
    currency: "NGN",
    reference: "SIMULATED-MOCK-TRANSFER",
    method: "BANK_TRANSFER",
    evidence: "SIMULATED test details",
  });
  C.Payment.parse(payment);
  assert.equal(payment.status, "REPORTED");
  await assert.rejects(api.receipt(payment.id), { status: 409 });
  await api.reply(rawFixture.tickets[0].id, "A simulated customer response.");
  assert.equal((await api.ticket(rawFixture.tickets[0].id)).updates.length, 3);
  assert.equal(
    (await api.checkCoverage({ buildingId: rawFixture.customer.buildingId }))
      .eligibility,
    "UNKNOWN",
  );
  assert.equal((await api.guidance("Help with my plan")).simulated, true);
});
