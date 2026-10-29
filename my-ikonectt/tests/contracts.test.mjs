import {setupCodeError,setupCodeLimits} from "../form-validation.js";
import test from "node:test";
import assert from "node:assert/strict";
import * as C from "../generated/contracts.js";
import { rawFixture, demoCredentials } from "../fixtures.js";
import { createMockAdapter } from "../api.js";
import { customerGreeting } from "../live.js";
test("customer greeting uses actual names and never treats fixture metadata as a personal name", () => {
  assert.equal(customerGreeting("  Efe   Okoro "), "Hello, Efe");
  assert.equal(customerGreeting("Adaeze Nwosu"), "Hello, Adaeze");
  for (const name of ["SIMULATED Stage4 browser d4e66e52", "DEVELOPMENT Customer", "Demo account", "", null])
    assert.equal(customerGreeting(name), "Welcome back");
  assert.equal(customerGreeting("Testament Okoro"), "Hello, Testament");
});
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

test("reset validation accepts a 13-character password and enforces canonical boundaries",()=>{for(const length of [12,13,128]){const form=new FormData();form.set('next','x'.repeat(length));form.set('confirm','x'.repeat(length));const values=Object.fromEntries(form);assert.equal(values.next,values.confirm);assert.equal(C.ResetPasswordRequest.safeParse({token:'x'.repeat(43),password:values.next}).success,true);}for(const length of [11,129])assert.equal(C.Password.safeParse('x'.repeat(length)).success,false);});

test("setup-code feedback distinguishes empty, incomplete and oversized codes without inspecting secrets",()=>{assert.deepEqual(setupCodeLimits,{min:32,max:200});assert.match(setupCodeError(''),/Enter the one-time/);assert.match(setupCodeError('12345678'),/incomplete.*not your account number/);assert.match(setupCodeError('x'.repeat(201)),/too long/);for(const size of [32,43,200])assert.equal(setupCodeError('x'.repeat(size)),'');assert.equal(setupCodeError(' '+ 'x'.repeat(43)+' '),'');});

test("explicit mock setup keeps the demo code usable without relaxing live validation", async () => {
  assert.equal(setupCodeError("DEMO-RESET-TOKEN", "mock"), "");
  assert.match(setupCodeError("DEMO-RESET-TOKEN", "live"), /incomplete/);
  const api = createMockAdapter(null);
  await assert.rejects(api.resetPassword("WRONG-DEMO-CODE", "x".repeat(13)));
  await api.resetPassword("DEMO-RESET-TOKEN", "x".repeat(13));
  await assert.rejects(api.resetPassword("DEMO-RESET-TOKEN", "x".repeat(13)));
});
