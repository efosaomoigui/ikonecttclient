// Presentation for the additional Stage 2 operations. Uses the approved portal components.
export async function loadJourney(route, id, api) {
  if (route === "orders")
    return id === "new"
      ? {
          plans: await api.plans(),
          buildings: await api.locations({ level: "BUILDING_ADDRESS" }),
        }
      : id
        ? { order: await api.order(id) }
        : {};
  if (route === "plans" || route === "coverage")
    return {
      plans: await api.plans(),
      buildings: await api.locations({ level: "BUILDING_ADDRESS" }),
    };
  if (route === "support" && id && id !== "new")
    return { ticket: await api.ticket(id) };
  if (route === "billing" && id) {
    try {
      return { receipt: await api.receipt(id) };
    } catch (e) {
      if (e.status === 409) return { receiptConflict: true };
      throw e;
    }
  }
  if (route === "guidance")
    return { capabilities: await api.providerCapabilities() };
  return {};
}
export function phoneForm(profile, { esc }) {
  return `<form data-form="phone" class="panel form-panel"><h2>Update your phone number</h2><p>For changes to your name or email, contact support.</p><label>Phone number<input name="phone" type="tel" autocomplete="tel" minlength="7" maxlength="30" value="${esc(profile.phone)}" required></label><p class="form-error" role="alert"></p><button class="button" type="submit">Save phone number ↗</button></form>`;
}
export function replyForm(ticket, { esc }) {
  return ticket.status.toUpperCase() === "CLOSED"
    ? '<p class="subtle-note">This request is closed. Create a new request if you need more help.</p>'
    : `<form data-form="reply" data-id="${esc(ticket.id)}" class="panel form-panel"><h2>Add a response</h2><label>Your message<textarea name="message" rows="4" maxlength="4000" required></textarea></label><p class="form-error" role="alert"></p><button class="button" type="submit">Send response ↗</button></form>`;
}
export function serviceOrders(data, { link, esc, pill, moneyMinor, date }) {
  return `<article class="panel orders-panel"><div class="section-heading compact"><h2>Your orders</h2>${link("orders/new", "Request a service", "button outline small")}</div><p class="subtle-note">Orders, payment verification and service activation are separate steps.</p>${data.orders?.length ? data.orders.map((o) => link("orders/" + o.id, `<div><small>${date(o.createdAt)} · ${esc(o.type.replaceAll("_", " "))}</small><h3>${esc(o.planName)}</h3></div><div>${pill(o.status.replaceAll("_", " "))}<strong>${moneyMinor(o.amountMinor, o.currency)}</strong> ↗</div>`, "list-row order-row")).join("") : "<p>No orders are available for this account.</p>"}<p class="subtle-note">${link("plans", "Explore published plans")} · ${link("coverage", "Check building coverage")}</p></article>`;
}
export function journeyScreen(route, id, ctx) {
  const {
    data,
    aux,
    result,
    link,
    esc,
    heading,
    details,
    pill,
    date,
    moneyMinor,
    input,
  } = ctx;
  if (
    ["orders", "payment-report"].includes(route) &&
    data.profile.status !== "ACTIVE" &&
    (id === "new" || route === "payment-report")
  )
    return (
      heading(
        "Account not active",
        "Contact support before requesting a service or reporting a payment.",
      ) + link("support/new", "Contact support", "button")
    );
  const options = (items, label) =>
    items
      .map(
        (item) =>
          `<option value="${esc(item.id)}">${esc(label(item))}</option>`,
      )
      .join("");
  const buildingSelect = `<label>Building/address<select name="buildingId" required><option value="">Select a recorded building</option>${options(aux.buildings || [], (b) => b.name)}</select></label>`;
  const planSelect = `<label>Published plan<select name="planId" required><option value="">Choose a plan</option>${options(
    (aux.plans || []).filter(
      (p) => p.published && p.kind === data.profile.kind,
    ),
    (p) => p.name + " · " + moneyMinor(p.priceMinor, p.currency),
  )}</select></label>`;
  if (route === "orders") {
    if (id === "new")
      return (
        link("services", "← My Services", "back") +
        heading(
          "Request a service",
          "Review a published plan and verified building before submitting.",
        ) +
        `<form data-form="order" class="panel form-panel">${planSelect}${buildingSelect}<label>Request type<select name="type"><option value="NEW_CONNECTION">New connection</option><option value="RENEWAL">Renewal</option><option value="PLAN_CHANGE">Plan change</option></select></label><label>Existing service (for renewal or plan change)<select name="subscriptionId"><option value="">New connection</option>${options(data.services, (s) => s.plan + " · " + s.status)}</select></label><p class="subtle-note">Coverage must be verified as AVAILABLE. A submitted order awaits payment verification and separate provisioning; it does not activate service.</p><p class="form-error" role="alert"></p><button class="button" type="submit">Submit service request ↗</button></form>`
      );
    if (aux.order) {
      const o = aux.order;
      return (
        link("services", "← My Services", "back") +
        heading("Service order", esc(o.planName)) +
        `<article class="panel">${pill(o.status.replaceAll("_", " "))}${details(
          [
            ["Order reference", o.id],
            ["Request type", o.type.replaceAll("_", " ")],
            ["Plan", o.planName],
            ["Amount", moneyMinor(o.amountMinor, o.currency)],
            [
              "Payment records",
              (data.payments || [])
                .filter((p) => p.orderId === o.id)
                .map((p) => p.status)
                .join(", ") || "No payment reported",
            ],
            [
              "Service status",
              data.services.find((s) => s.id === o.subscriptionId)?.status ||
                "No service activation confirmed",
            ],
            ["Billing period", o.billingDays + " days"],
            ["Submitted", date(o.createdAt)],
          ],
        )}<p class="subtle-note">Order status is separate from payment verification and subscription status. Payment confirmation does not activate internet service.</p>${["PENDING_PAYMENT"].includes(o.status) ? link("payment-report/" + o.id, "Report a payment", "button") : link("billing", "View payment records", "text-link")}</article>`
      );
    }
    return (
      heading("Your orders", "Your service requests at a glance.") +
      serviceOrders(data, ctx)
    );
  }
  if (route === "payment-report") {
    const order = data.orders?.find((o) => o.id === id);
    return (
      link("billing", "← Billing & Payments", "back") +
      heading(
        "Report a payment",
        "Tell Ikonectt about a payment you have already made.",
      ) +
      `<form data-form="payment" class="panel form-panel"><label>Order<select name="orderId" required><option value="">Choose an order</option>${(
        data.orders || []
      )
        .filter((o) => o.status === "PENDING_PAYMENT")
        .map(
          (o) =>
            `<option value="${esc(o.id)}" ${order?.id === o.id ? "selected" : ""}>${esc(o.planName)} · ${moneyMinor(o.amountMinor, o.currency)} · ${esc(o.id.slice(0, 8))}</option>`,
        )
        .join(
          "",
        )}</select></label>${input("amount", "Amount paid (NGN)", "text", 'inputmode="decimal" placeholder="e.g. 15000.00"')}${input("reference", "Transfer/payment reference", "text", 'minlength="3" maxlength="150"')}<label>Payment method<select name="method"><option value="BANK_TRANSFER">Bank transfer</option><option value="OTHER">Other</option></select></label><label>Payment details/evidence<textarea name="evidence" minlength="3" maxlength="2000" rows="4" required placeholder="Include the transfer date and relevant reference. Do not share passwords or card details."></textarea></label><p class="subtle-note">Staff will review your payment report. Submitting it does not charge you or activate service.</p><p class="form-error" role="alert"></p><button type="submit" class="button">Submit payment report ↗</button></form>`
    );
  }
  if (route === "plans")
    return (
      link("services", "← My Services", "back") +
      heading(
        "Published plans",
        "Current plan information supplied by Ikonectt.",
      ) +
      (aux.plans.length
        ? aux.plans
            .filter((p) => p.published)
            .map(
              (p) =>
                `<article class="panel"><div class="row"><h2>${esc(p.name)}</h2>${p.simulated ? pill("SIMULATED") : ""}</div>${details(
                  [
                    ["Speed", p.speedMbps + " Mbps"],
                    ["Plan amount", moneyMinor(p.priceMinor, p.currency)],
                    ["Billing period", p.billingDays + " days"],
                    ["Customer type", p.kind],
                  ],
                )}<p>${p.features.map(esc).join(" · ")}</p><p class="subtle-note">Availability depends on verified coverage for your building.</p>${link("coverage", "Check coverage", "button outline")}</article>`,
            )
            .join("")
        : '<article class="panel"><p>No published plans are available.</p></article>')
    );
  if (route === "coverage")
    return (
      link("services", "← My Services", "back") +
      heading(
        "Check your building",
        "Coverage is confirmed against Ikonectt’s recorded locations.",
      ) +
      `<form data-form="coverage" class="panel form-panel">${buildingSelect}<label>Plan (optional)<select name="planId"><option value="">All available plans</option>${options(aux.plans, (p) => p.name)}</select></label><p class="subtle-note">Can’t find your building? Contact support to verify its coverage. An UNKNOWN result means verification is needed.</p><p class="form-error" role="alert"></p><button type="submit" class="button">Check coverage ↗</button></form>${
        result?.coverage
          ? `<article class="panel" role="status"><h2>${esc(result.coverage.eligibility.replaceAll("_", " "))}</h2><p>${result.coverage.eligibility === "AVAILABLE" ? "Coverage is available at this building. Choose an eligible plan when requesting service." : result.coverage.eligibility === "UNKNOWN" ? "Your building needs staff verification. Unknown does not mean unavailable." : "Please contact support to discuss this coverage result."}</p>${details(
              [
                [
                  "Source",
                  result.coverage.simulated
                    ? "SIMULATED development result"
                    : result.coverage.source,
                ],
                ["Checked", date(result.coverage.checkedAt)],
              ],
            )}${link(result.coverage.eligibility === "AVAILABLE" ? "orders/new" : "support/new", result.coverage.eligibility === "AVAILABLE" ? "Request a service" : "Ask support", "button outline")}</article>`
          : ""
      }`
    );
  if (route === "guidance") {
    const available = aux.capabilities.ai === "guidance-only-no-model";
    const routes = {
      "/me/payments": "billing",
      "/me/tickets": "support",
      "/plans": "plans",
      "/coverage/check": "coverage",
    };
    return (
      link("support", "← Support", "back") +
      heading(
        "Account guidance",
        "Read-only help to find the right information.",
      ) +
      `<article class="panel"><p>Guidance can explain services and direct you to support. It cannot change your account, pay bills or activate internet service.</p>${details(
        [
          [
            "Online payments",
            aux.capabilities.payments === "simulated"
              ? "Development simulation"
              : "Not connected",
          ],
          [
            "Usage data",
            aux.capabilities.usage === "not-connected"
              ? "Not connected"
              : "Available",
          ],
          ["Guidance", available ? "Read-only" : "Unavailable"],
          [
            "Email delivery",
            aux.capabilities.email === "simulated"
              ? "Development simulation"
              : "Not connected",
          ],
          [
            "SMS delivery",
            aux.capabilities.sms === "simulated"
              ? "Development simulation"
              : "Not connected",
          ],
        ],
      )}</article>` +
      (available
        ? `<form data-form="guidance" class="panel form-panel"><label>Your question<textarea name="message" rows="3" maxlength="1000" required></textarea></label><p class="form-error" role="alert"></p><button type="submit" class="button">Get guidance ↗</button></form>`
        : '<article class="panel"><p>Guidance is currently unavailable. Our support team can help.</p></article>') +
      (result?.guidance
        ? `<article class="panel" role="status"><p class="preserve">${esc(result.guidance.answer)}</p><p class="subtle-note">${result.guidance.simulated ? "SIMULATED guidance" : "Read-only guidance"}</p>${result.guidance.links
            .filter((l) => routes[l.path])
            .map((l) =>
              link(routes[l.path], esc(l.label), "button outline small"),
            )
            .join(
              " ",
            )} ${link("support/new", "Contact support", "text-link")}</article>`
        : "")
    );
  }
  return null;
}
export function parseAmountMinor(value) {
  const match = /^(\d{1,10})(?:\.(\d{1,2}))?$/.exec(String(value).trim());
  if (!match)
    throw new Error(
      "Enter a positive NGN amount with at most two decimal places.",
    );
  const result =
    Number(match[1]) * 100 + Number((match[2] || "").padEnd(2, "0"));
  if (!Number.isSafeInteger(result) || result <= 0)
    throw new Error("Enter a positive amount.");
  return result;
}
