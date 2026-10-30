// Opt-in real HTTP checks. Reads dev credentials only in memory; mutates isolated labeled records.
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { randomUUID, randomBytes } from "node:crypto";
import assert from "node:assert/strict";
import { createLiveAdapter } from "../live.js";
const base = process.env.IKONECTT_API_BASE || "http://127.0.0.1:4000/api/v1";
const credentialsPath = process.env.IKONECTT_TEST_ACCOUNTS;
if (!credentialsPath)
  throw new Error(
    "Set IKONECTT_TEST_ACCOUNTS to Agent 1’s local development credentials file. Never paste credentials into source.",
  );
if (!["127.0.0.1", "localhost"].includes(new URL(base).hostname))
  throw new Error(
    "Live test mutations are restricted to the local development API.",
  );
const credentials = JSON.parse(await readFile(credentialsPath, "utf8"));
const results = [],
  runId = randomUUID().slice(0, 8);
let stage = "initialization";
async function raw(path, { token, method = "GET", body, status = 200 } = {}) {
  const r = await fetch(base + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: "Bearer " + token } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (r.status !== status)
    throw new Error(
      `${method} ${path} returned ${r.status}; expected ${status}`,
    );
  return r.json();
}
function pass(name) {
  results.push({ name, status: "passed" });
  console.log("PASS " + name);
}
try {
  stage = "development health";
  assert.equal((await raw("/health")).database, "connected");
  const admin = credentials.staff.find((s) => s.role === "ADMIN"),
    finance = credentials.staff.find((s) => s.role === "FINANCE");
  const adminSession = await raw("/auth/staff/login", {
    method: "POST",
    body: { email: admin.email, password: admin.password },
  });
  const publicPlans = await raw("/plans?offset=0&limit=100");
  const plan = publicPlans.items.find(
    (p) =>
      p.kind === "RESIDENTIAL" && p.simulated && p.code === "simulated-home-30",
  );
  assert.ok(plan?.simulated, "Requires labeled development fixtures");
  const places = await raw(
    "/coverage/locations?level=BUILDING_ADDRESS&offset=0&limit=100",
  );
  const building = places.items.find(
    (b) => b.eligibility === "AVAILABLE" && b.planIds.includes(plan.id),
  );
  assert.ok(building);
  async function createPerson(label) {
    const created = await raw("/admin/customers", {
      token: adminSession.accessToken,
      method: "POST",
      body: {
        kind: "RESIDENTIAL",
        name: `SIMULATED Portal E2E ${runId} ${label}`,
        email: `portal-e2e-${runId}-${label}@example.test`,
        phone: "+2348000000000",
        buildingId: building.id,
      },
    });
    const password = randomBytes(24).toString("base64url");
    const api = createLiveAdapter({ base });
    await api.resetPassword(created.setupToken, password);
    return {
      api,
      password,
      profile: created.customer,
      setupToken: created.setupToken,
    };
  }
  stage = "staff-created account setup";
  const a = await createPerson("A"),
    b = await createPerson("B");
  await assert.rejects(a.api.resetPassword(a.setupToken, a.password), {
    status: 400,
  });
  delete a.setupToken;
  delete b.setupToken;
  pass(
    "Staff-created isolated accounts complete setup; setup code cannot be reused",
  );
  stage = "customer authentication";
  await a.api.login(a.profile.accountNumber, a.password);
  await b.api.login(b.profile.accountNumber, b.password);
  assert.equal((await a.api.session()).id, a.profile.id);
  pass("Account-number login and session identity");
  stage = "dashboard and profile";
  const summary = await a.api.summary();
  assert.equal(summary.profile.id, a.profile.id);
  assert.equal(summary.services.length, 0);
  assert.equal(
    summary.services.some((s) => s.usage !== null),
    false,
  );
  await a.api.updateProfile("+2348000000123");
  assert.equal((await a.api.session()).phone, "+2348000000123");
  pass(
    "Customer-specific dashboard, empty subscriptions and phone-only profile update",
  );
  stage = "coverage";
  assert.equal(
    (await a.api.checkCoverage({ buildingId: building.id, planId: plan.id }))
      .eligibility,
    "AVAILABLE",
  );
  const unknown = places.items.find((b) => b.eligibility === "UNKNOWN");
  assert.ok(unknown);
  assert.equal(
    (await a.api.checkCoverage({ buildingId: unknown.id })).eligibility,
    "UNKNOWN",
  );
  pass("Available and UNKNOWN coverage use actual recorded results");
  stage = "orders";
  const order = await a.api.createOrder({
    planId: plan.id,
    buildingId: building.id,
    type: "NEW_CONNECTION",
  });
  assert.equal(order.status, "PENDING_PAYMENT");
  assert.equal((await a.api.order(order.id)).customerId, a.profile.id);
  await assert.rejects(b.api.order(order.id), { status: 404 });
  pass("Order creation/detail and cross-customer order isolation");
  stage = "payment report";
  const payment = await a.api.reportPayment({
    orderId: order.id,
    amountMinor: order.amountMinor,
    currency: "NGN",
    reference: `SIMULATED-PORTAL-${runId}`,
    method: "BANK_TRANSFER",
    evidence: "SIMULATED isolated portal integration test evidence",
  });
  assert.equal(payment.status, "REPORTED");
  await assert.rejects(a.api.receipt(payment.id), { status: 409 });
  await assert.rejects(b.api.receipt(payment.id), { status: 404 });
  pass(
    "Payment report remains REPORTED; unconfirmed receipt returns 409; cross-customer receipt returns 404",
  );
  stage = "finance verification";
  const financeSession = await raw("/auth/staff/login", {
    method: "POST",
    body: { email: finance.email, password: finance.password },
  });
  await raw("/admin/payments/" + payment.id + "/verify", {
    token: financeSession.accessToken,
    method: "POST",
    body: {
      decision: "CONFIRMED",
      evidence: "SIMULATED isolated portal test verification",
    },
  });
  const receipt = await a.api.receipt(payment.id);
  assert.equal(receipt.amount, order.amountMinor / 100);
  assert.equal((await a.api.order(order.id)).status, "PAID");
  assert.equal((await a.api.summary()).services.length, 0);
  pass(
    "Confirmed receipt and minor-unit amount; payment verification does not activate service",
  );
  stage = "support";
  const ticket = await a.api.createTicket({
    subject: `SIMULATED portal request ${runId}`,
    description:
      "SIMULATED request to verify the isolated customer support workflow.",
  });
  await a.api.reply(ticket.id, "SIMULATED follow-up from the same customer.");
  assert.equal((await a.api.ticket(ticket.id)).updates.length, 2);
  await assert.rejects(b.api.ticket(ticket.id), { status: 404 });
  await assert.rejects(b.api.reply(ticket.id, "Unauthorized test response"), {
    status: 404,
  });
  pass(
    "Ticket creation/history/detail/reply and cross-customer ticket isolation",
  );
  stage = "notifications and guidance";
  const caps = await a.api.providerCapabilities();
  assert.equal(caps.usage, "not-connected");
  assert.equal(
    (await a.api.guidance("How is payment verified?")).sensitiveActionsAllowed,
    false,
  );
  assert.ok(Array.isArray((await a.api.summary()).notifications));
  pass("Capabilities, notification metadata and read-only guidance");
  stage = "password and revocation";
  const secondSession = createLiveAdapter({ base });
  await secondSession.login(a.profile.accountNumber, a.password);
  const nextPassword = randomBytes(24).toString("base64url");
  await a.api.changePassword(a.password, nextPassword);
  await assert.rejects(a.api.resume(), { status: 401 });
  await assert.rejects(secondSession.session(), { status: 401 });
  await a.api.login(a.profile.accountNumber, nextPassword);
  a.password = nextPassword;
  pass("Password change revokes all sessions; new password signs in");
  stage = "seeded subscriptions";
  const seeded = credentials.customers[0],
    seedApi = createLiveAdapter({ base });
  await seedApi.login(seeded.accountNumber, seeded.password);
  const seededData = await seedApi.summary();
  assert.ok(seededData.services.length);
  assert.ok(seededData.receipts.length);
  assert.equal(seededData.simulated, true);
  await seedApi.logout();
  pass(
    "Existing SIMULATED subscriptions, orders, payments and confirmed receipts load through the live adapter",
  );
  stage = "recovery acknowledgement";
  const recovery = await a.api.recover(a.profile.accountNumber);
  const unknownRecovery = await a.api.recover("UNKNOWN-PORTAL-E2E-" + runId);
  assert.equal(recovery.message, unknownRecovery.message);
  pass(
    "Recovery acknowledgement is generic for known and unknown accounts; no recovery code is exposed",
  );
  stage = "logout";
  await a.api.logout();
  await assert.rejects(a.api.resume(), { status: 401 });
  await b.api.logout();
  await raw("/auth/logout", {
    token: financeSession.accessToken,
    method: "POST",
  });
  await raw("/auth/logout", {
    token: adminSession.accessToken,
    method: "POST",
  });
  pass("Customer logout clears access and requests server revocation");
  await mkdir(new URL("../.local/", import.meta.url), { recursive: true });
  await writeFile(
    new URL("../.local/e2e-browser.json", import.meta.url),
    JSON.stringify(
      {
        accountNumber: a.profile.accountNumber,
        password: a.password,
        orderId: order.id,
        paymentId: payment.id,
        ticketId: ticket.id,
        runId,
      },
      null,
      2,
    ),
  );
  await mkdir(new URL("../evidence/stage2/", import.meta.url), {
    recursive: true,
  });
  await writeFile(
    new URL("../evidence/stage2/live-e2e.json", import.meta.url),
    JSON.stringify(
      {
        runAt: new Date().toISOString(),
        api: base,
        mode: "real HTTP and database, SIMULATED isolated records",
        contract: JSON.parse(
          await readFile(
            new URL("../vendor/provenance.json", import.meta.url),
            "utf8",
          ),
        ).commit,
        results,
      },
      null,
      2,
    ) + "\n",
  );
  console.log(
    `${results.length} live workflow groups passed. Credentials were not logged; isolated browser access is in ignored .local/.`,
  );
} catch (e) {
  console.error("FAIL during " + stage + ": " + e.message);
  process.exitCode = 1;
}
