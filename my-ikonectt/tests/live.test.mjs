import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { createLiveAdapter, summaryView } from "../live.js";
import { createCustomerClient } from "../generated/contracts.js";
import { rawFixture } from "../fixtures.js";
import { parseAmountMinor } from "../journeys.js";
const principal = {
  id: rawFixture.customer.id,
  kind: "CUSTOMER",
  customerId: rawFixture.customer.id,
  roles: [],
  mustChangePassword: false,
};
const session = {
  accessToken: "test-token-in-memory",
  tokenType: "Bearer",
  expiresAt: new Date(Date.now() + 3600000).toISOString(),
  principal,
};
const page = (items) => ({ items, total: items.length, offset: 0, limit: 100 });
test("canonical client sends bearer headers and validates real v1 wire responses", async () => {
  const calls = [];
  let revoked = false;
  let listedTickets = rawFixture.tickets;
  const server = http.createServer(async (req, res) => {
    let body = "";
    for await (const chunk of req) body += chunk;
    const input = body ? JSON.parse(body) : null;
    const path = new URL(req.url, "http://localhost").pathname.replace(
      "/api/v1",
      "",
    );
    calls.push({ path, method: req.method });
    let result,
      status = 200;
    if (path === "/auth/login") {
      assert.deepEqual(input, {
        accountNumber: "A-100000001",
        password: "secret-password",
      });
      result = session;
    } else if (
      req.headers.authorization !== "Bearer " + session.accessToken &&
      !["/capabilities", "/plans"].includes(path)
    ) {
      status = 401;
      result = {
        statusCode: 401,
        code: "UNAUTHORIZED",
        message: "Expired",
        requestId: "test-request",
      };
    } else if (revoked && path === "/auth/session") {
      status = 401;
      result = {
        statusCode: 401,
        code: "UNAUTHORIZED",
        message: "Expired",
        requestId: "test-request",
      };
    } else {
      const routes = {
        "/auth/session": principal,
        "/me/profile": rawFixture.customer,
        "/me/dashboard": {
          customer: rawFixture.customer,
          subscriptions: rawFixture.subscriptions,
          pendingOrders: 0,
          openTickets: 1,
          usage: null,
          usageStatus: "EXTERNAL_PROVIDER_NOT_CONNECTED",
        },
        "/me/subscriptions": page(rawFixture.subscriptions),
        "/plans": page(rawFixture.plans),
        "/me/orders": page(rawFixture.orders),
        "/me/payments": page(rawFixture.payments),
        "/me/tickets": page(listedTickets),
        "/me/notifications": page([]),
        "/capabilities": {
          usage: "not-connected",
          ai: "guidance-only-no-model",
        },
        ["/me/tickets/" + rawFixture.tickets[0].id]: rawFixture.tickets[0],
        ["/me/payments/" + rawFixture.payments[0].id + "/receipt"]:
          rawFixture.receipts[0],
      };
      result = routes[path] || { ok: true };
      if (path === "/me/tickets" && req.method === "POST") {
        assert.deepEqual(input, {
          subject: "Test subject",
          message: "A connection issue to investigate.",
        });
        result = rawFixture.tickets[0];
      }
      if (path === "/auth/change-password") {
        assert.deepEqual(input, {
          currentPassword: "old",
          password: "new-password-2026",
        });
        revoked = true;
      }
    }
    res.writeHead(status, { "Content-Type": "application/json" });
    res.end(JSON.stringify(result));
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  try {
    const base = `http://127.0.0.1:${server.address().port}/api/v1`;
    const api = createLiveAdapter({ base });
    await api.login("A-100000001", "secret-password");
    const data = await api.summary();
    assert.equal(data.receipts[0].amount, 35000);
    assert.equal(data.services[0].monthlyAmount, 35000);
    assert.equal(data.services[0].address, null);
    const boundary = calls.length;
    listedTickets = rawFixture.tickets.map((ticket) => ({ ...ticket, subject: "Updated by support staff" }));
    const refreshed = await api.summary("support", await api.resume());
    assert.equal(refreshed.tickets[0].subject, "Updated by support staff");
    assert.deepEqual(calls.slice(boundary).map((call) => call.path).sort(),
      ["/auth/session", "/me/profile", "/me/tickets"].sort());
    assert.equal(refreshed.services[0].id, data.services[0].id);
    assert.equal(
      (await api.ticket(rawFixture.tickets[0].id)).updates.length,
      2,
    );
    await api.createTicket({
      subject: "Test subject",
      description: "A connection issue to investigate.",
    });
    await api.changePassword("old", "new-password-2026");
    await assert.rejects(api.resume(), { status: 401 });
    assert.ok(calls.some((c) => c.path === "/me/subscriptions"));
    assert.ok(calls.every((c) => !c.path.includes("token")));
  } finally {
    server.closeAllConnections();
    await new Promise((r) => server.close(r));
  }
});
test("no invented usage, address or unpublished plan details", () => {
  const data = summaryView({
    ...rawFixture,
    plans: [],
    receipts: [],
    payments: [],
  });
  assert.deepEqual(data.bills, []);
  assert.equal(data.services[0].speedMbps, null);
  assert.equal(data.services[0].monthlyAmount, null);
  assert.equal(data.services[0].usage, null);
});
test("required password setup avoids protected profile and server 401 clears credentials", async () => {
  let count = 0;
  const api = createLiveAdapter({
    transport: async (path) => {
      count++;
      if (path === "/auth/login")
        return {
          ...session,
          principal: { ...principal, mustChangePassword: true },
        };
      throw Object.assign(new Error("Expired"), { status: 401 });
    },
  });
  assert.equal(
    (await api.login("10000001", "temporary")).mustChangePassword,
    true,
  );
  assert.equal(count, 1);
  await assert.rejects(api.session(), { status: 401 });
  await assert.rejects(api.resume(), { status: 401 });
});
test("session expiry timer clears credentials without a refresh-token flow", async () => {
  const api = createLiveAdapter({
    transport: async () => ({
      ...session,
      expiresAt: new Date(Date.now() - 1000).toISOString(),
      principal: { ...principal, mustChangePassword: true },
    }),
  });
  await api.login("10000001", "temporary");
  await new Promise((r) => setTimeout(r, 15));
  await assert.rejects(api.resume(), { status: 401 });
});
test("pagination uses canonical page schema and malformed responses never become fixture fallback", async () => {
  const paths = [];
  const client = createCustomerClient(
    "http://localhost:4000/api/v1",
    () => undefined,
    () => {},
    async (path) => {
      paths.push(path);
      return {
        items: [rawFixture.plans[0]],
        offset: paths.length - 1,
        total: 2,
        limit: 100,
      };
    },
  );
  assert.equal((await client.plans()).length, 2);
  assert.ok(paths[1].includes("offset=1"));
  const broken = createCustomerClient(
    "http://localhost",
    () => undefined,
    () => {},
    async () => ({ name: "incomplete" }),
  );
  await assert.rejects(broken.profile(), {
    status: 502,
    code: "CONTRACT_MISMATCH",
  });
});
test("unconfirmed receipt 409 and connectivity errors remain explicit", async () => {
  const blocked = createLiveAdapter({
    transport: async () => {
      throw Object.assign(
        new Error("Receipt is available only for confirmed payment"),
        { status: 409 },
      );
    },
  });
  await assert.rejects(blocked.receipt(rawFixture.payments[0].id), {
    status: 409,
  });
  const offline = createLiveAdapter({
    transport: async () => {
      throw new TypeError("network failure");
    },
  });
  await assert.rejects(offline.login("10000001", "temporary"), {
    status: 0,
    code: "NETWORK_ERROR",
  });
});
test("NGN text converts exactly to integer minor units including kobo", () => {
  assert.equal(parseAmountMinor("15000.01"), 1500001);
  assert.equal(parseAmountMinor("0.10"), 10);
  assert.throws(() => parseAmountMinor("1.001"));
  assert.throws(() => parseAmountMinor("0"));
  assert.throws(() => parseAmountMinor("-20"));
});
