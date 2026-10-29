import {setupCodeError,setupCodeLimits} from "./form-validation.js";
import { api } from "./api.js";
import { customerGreeting } from "./live.js";
import { updateAccountPage, setAccountPagePending } from "./navigation.js";
import { config } from "./config.js";
import { walletRoutes, createWalletIntents, loadWalletJourney, walletScreen, walletSummaryCard, serviceRenewalActions, validateTopUpDraft, renewalReady, renewalOutcome, topUpNotice, settleWalletFailure } from "./wallet.js";
import { demoCredentials } from "./fixtures.js";
import {
  loadJourney,
  journeyScreen,
  serviceOrders,
  phoneForm,
  replyForm,
  parseAmountMinor,
} from "./journeys.js";
const root = document.querySelector("#app");
const walletIntents = createWalletIntents();
let customer = null,
  data = null,
  notice = "",
  version = 0,
  aux = {},
  result = {};
const esc = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const money = (n, c = "NGN") =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: c,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);
const moneyMinor = (minor, currency = "NGN") => money(minor / 100, currency);
const date = (v) =>
  v
    ? new Intl.DateTimeFormat("en-NG", { dateStyle: "medium" }).format(
        new Date(v),
      )
    : "Not available";
const link = (path, text, cls = "") =>
  `<a class="${cls}" href="#/${path}">${text}</a>`;
const logo = (withLabel = true) =>
  link(
    "",
    '<img src="assets/logo-red.png" alt="Ikonectt">' + (withLabel ? '<span>MY IKONECTT</span>' : ''),
    "brand",
  );
const arrow = '<span aria-hidden="true">↗</span>';
const icons = {
  overview: "◫",
  services: "◎",
  billing: "▤",
  wallet: "◈",
  support: "◌",
  profile: "♙",
  security: "◇",
  notifications: "♧",
};
const names = {
  overview: "Overview",
  services: "My Services",
  billing: "Billing & Payments",
  wallet: "Wallet",
  support: "Support",
  profile: "My Profile",
  security: "Account Security",
  notifications: "Notifications",
};
const routeNames = {
  orders: "My Services / Orders",
  plans: "My Services / Plans",
  coverage: "Coverage",
  "payment-report": "Billing & Payments / Report payment",
  guidance: "Support / Guidance",
  "top-up": "Wallet / Top Up",
  "top-ups": "Wallet / Top-ups",
  transactions: "Wallet / Transactions",
  renew: "My Services / Renew Plan",
  renewals: "Wallet / Renewals",
};
const pill = (s) =>
  `<span data-status="${esc(String(s).toLowerCase().replaceAll("_", " ").replaceAll(" ", "-"))}" class="pill ${["Active", "Paid", "Verified", "Resolved"].includes(s) ? "green" : ""}">${esc(s)}</span>`;
const empty = (heading, body) =>
  `<div class="empty"><span aria-hidden="true">◎</span><h3>${heading}</h3><p>${body}</p></div>`;
function themeToggle() {
  const dark = document.documentElement.dataset.theme === "dark";
  return `<button type="button" class="theme-toggle" data-theme-toggle aria-label="Dark mode" aria-pressed="${dark}" title="Switch to ${dark ? "light" : "dark"} mode"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path d="M20.2 15.3A8.4 8.4 0 0 1 8.7 3.8 8.5 8.5 0 1 0 20.2 15.3Z"/></svg><span data-theme-label>${dark ? "Dark" : "Light"}</span></button>`;
}
function publicShell(body) {
  return `<header class="public-header">${logo(false)}<nav aria-label="Main navigation">${link("", "Home")}${link("help", "Need help?")}${link("login", `Sign in ${arrow}`, "button small")}${themeToggle()}</nav></header><main id="main" class="public-main ${body.includes('class="auth-layout"') ? 'auth-main' : ''}" tabindex="-1">${body}</main><footer><div>${logo(false)}<p>A little closer to everything that matters.</p></div><div>${link("help", "Account help")}<span>© ${new Date().getFullYear()} Ikonectt</span></div></footer>`;
}
function welcome() {
  return publicShell(
    `<section class="hero"><div class="hero-copy"><p class="eyebrow"><span class="red-dot"></span> YOUR WORLD. CONNECTED.</p><h1>Your connectivity.<br>Your account.<br><em>One place.</em></h1><p class="intro">Life moves better when you’re connected. Take care of your internet, your account and your support — all from My Ikonectt.</p>${link("login", `Sign in to My Ikonectt ${arrow}`, "button")}<p class="caption">Your account. Securely in your hands.</p></div><div class="hero-image"><img src="assets/welcome.webp" alt="Customer relaxing at home, connected through her laptop"><div class="image-label"><span class="signal">▂▄▆</span><div><strong>More life. Less admin.</strong><small>Your connection, made simple.</small></div></div><span class="image-tag">CONNECTED TO WHAT MATTERS</span></div></section><section class="benefits section"><div class="section-heading"><div><p class="eyebrow">A LITTLE MORE CONTROL</p><h2>Everything you need.<br>Right where you need it.</h2></div><p>Less time managing your connection.<br>More time enjoying it.</p></div><div class="benefit-grid">${[
      [
        "01",
        "Your account, at a glance",
        "See your account information, current internet plan and service status.",
      ],
      [
        "02",
        "Clarity on every payment",
        "Review available bills, verified payment records and receipts in one place.",
      ],
      [
        "03",
        "Support that stays with you",
        "Send a support request and follow its progress, from first message to resolution.",
      ],
    ]
      .map(
        ([n, h, p]) =>
          `<article><span class="index">${n}</span><h3>${h}</h3><p>${p}</p></article>`,
      )
      .join(
        "",
      )}</div></section><section class="how section"><p class="eyebrow">SIMPLICITY, EVERY STEP</p><h2>A familiar connection.<br>A simpler way to manage it.</h2><ol class="steps">${[
      ["Sign in", "Use your staff-issued account number."],
      ["View account", "Get a clear picture of your account."],
      ["Access services", "Find your plan and billing records."],
      ["Get support", "We’re here when you need us."],
    ]
      .map(
        ([h, p], i) =>
          `<li><span>0${i + 1}</span><h3>${h}</h3><p>${p}</p></li>`,
      )
      .join(
        "",
      )}</ol></section><section class="closing"><div><p class="eyebrow">WELCOME TO YOUR CONNECTION</p><h2>Make yourself at home.</h2><p>Your Ikonectt account is ready when you are.</p></div>${link("login", `Access My Ikonectt ${arrow}`, "button light")}</section>`,
  );
}
function input(name, label, type = "text", extra = "") {
  return `<label>${label}<input name="${name}" type="${type}" required ${extra}></label>`;
}
function password(name, label, autocomplete = "current-password") {
  const limits=autocomplete==="new-password"?'minlength="12" maxlength="128"':'maxlength="128"';
  return `<label>${label}<span class="password"><input name="${name}" id="${name}" type="password" required ${limits} autocomplete="${autocomplete}"><button type="button" class="reveal" data-reveal="${name}" aria-label="Show ${label.toLowerCase()}" aria-pressed="false">Show</button></span></label>`;
}
function authPage(recovery = false) {
  if (config.standaloneDemo) return publicShell(`<section class="auth-layout"><div class="auth-story"><p class="eyebrow">MY IKONECTT</p><h1>Your world.<br>Within reach.</h1><p>A secure space for your connection, and a little more peace of mind.</p><img src="assets/welcome.webp" alt="Enjoying a connected moment at home"></div><div class="auth-panel"><p class="eyebrow">GOOD TO SEE YOU AGAIN</p><h2>Welcome back.</h2><p>Standalone client review. Real sign-in is unavailable here.</p><form data-form="demo-unavailable" class="demo-unavailable"><label>Account number<input type="text" disabled autocomplete="off" placeholder="Unavailable in this demonstration"></label><label>Password<input type="password" disabled autocomplete="off" placeholder="No credentials required"></label><p class="form-error" role="alert"></p><button type="submit" class="button" disabled>Sign in securely ↗</button></form><details class="demo"><summary>Review the application</summary><p>Explore fictional customer journeys without a password or backend.</p><form data-form="demo-entry"><label>Sample customer<select name="demoProfile"><option value="ada">Ada Okafor — expired service · ₦30,000 wallet</option><option value="meridian">Meridian Studio — active service · ₦0 wallet</option></select></label><p class="form-error" role="alert"></p><button class="button" type="submit">Open simulated account ↗</button></form><p class="subtle-note">Illustrative prices and fictional records only. No payment or ISP connection. This demonstration is independent of Admin; refresh or reset restores samples.</p></details></div></section>`);
  return publicShell(
    `<section class="auth-layout"><div class="auth-story"><p class="eyebrow">MY IKONECTT</p><h1>Your world.<br>Within reach.</h1><p>A secure space for your connection, and a little more peace of mind.</p><img src="assets/welcome.webp" alt="Enjoying a connected moment at home"></div><div class="auth-panel">${link("", "← Back to home", "back")}<p class="eyebrow">${recovery ? "ACCOUNT RECOVERY" : "GOOD TO SEE YOU AGAIN"}</p><h2>${recovery ? "Let’s get you back in." : "Welcome back."}</h2>${notice ? `<div class="notice" role="status">${esc(notice)}</div>` : ""}<p>${recovery ? "Enter your account number to request recovery instructions." : "Sign in with the account details provided by Ikonectt."}</p><form data-form="${recovery ? "recover" : "login"}">${input("accountNumber", "Account number", "text", 'autocomplete="username" inputmode="text" maxlength="64"')}${recovery ? "" : password("password", "Password")}<p class="form-error" role="alert"></p><button class="button" type="submit">${recovery ? "Send recovery instructions" : "Sign in securely"} ${arrow}</button></form>${link(recovery ? "login" : "recover", recovery ? "Back to sign in" : "Forgot your password?", "text-link")}${link("reset", "Set up or recover your account", "setup-link")}<div class="subtle-note">Your account is created by Ikonectt. ${link("help", "Need help accessing it?")}</div>${config.mode === "mock" ? `<details class="demo"><summary>Development preview · demo access</summary><p>Account: <strong>${demoCredentials.accountNumber}</strong><br>Password: <strong>${demoCredentials.password}</strong></p><p>All account information and actions in this preview are simulated.</p></details>` : ""}</div></section>`,
  );
}
function tickets(items) {
  return items.length
    ? `<div class="list">${items.map((t) => link(`support/${encodeURIComponent(t.id)}`, `<div><small>${esc(t.reference)} · ${date(t.createdAt)}</small><h3>${esc(t.subject)}</h3></div><div>${pill(t.status)} ${arrow}</div>`, "list-row")).join("")}</div>`
    : empty(
        "A clear inbox",
        "You have no support requests. We’re here whenever you need a hand.",
      );
}
function serviceCard(s) {
  return `<article class="service-card"><div class="row"><span class="eyebrow">${esc(s.name)}</span>${pill(s.status)}</div><h2>${esc(s.plan)}</h2><p><strong class="speed">${s.speedMbps === null ? "—" : esc(s.speedMbps)}</strong> ${s.speedMbps === null ? "Speed unavailable" : "Mbps"}</p><p>Your plan and current service status.</p><div class="service-footer"><span>${esc(s.address || "Address details unavailable")}</span>${link(`services/${encodeURIComponent(s.id)}`, `View service ${arrow}`, "button light small")}</div>${aux.eligibility || aux.eligibilityErrors ? serviceRenewalActions(s, aux, { esc, link, moneyMinor }) : ""}</article>`;
}
function overview() {
  const s =
      data.services.find((s) => s.status.toUpperCase() === "ACTIVE") ||
      data.services[0],
    p = data.profile;
  return `<div class="page-heading"><p class="eyebrow">YOUR CONNECTION, AT A GLANCE</p><h1>${esc(customerGreeting(p.name))}<span class="greeting-dot">.</span></h1><p>Manage your services and support.</p></div><div class="overview-grid"><div>${s ? serviceCard(s) : empty("No services linked", "Contact support if you expect to see a service here.")}</div><article class="panel payment-summary"><span class="eyebrow">BILLING SNAPSHOT</span><h3>Latest payment</h3><div class="amount">${data.receipts.length ? money(data.receipts[0].amount, data.receipts[0].currency) : "—"}</div><p>${data.receipts.length ? "Most recent verified payment" : "No verified payment records available yet."}</p>${link("billing", `View billing & receipts ${arrow}`, "text-link")}</article></div>${walletSummaryCard(aux.wallet, aux.walletError, { esc, link, moneyMinor })}<div class="quick-actions">${[
    ["services", "My Services", "Plans and service status"],
    ["support/new", "Contact Support", "Submit and track requests"],
    ["profile", "View Profile", "Your contact information"],
  ]
    .map(([r, h, p]) =>
      link(r, `<div><h3>${h}</h3><p>${p}</p></div>${arrow}`, "quick"),
    )
    .join(
      "",
    )}</div><article class="panel"><div class="section-heading compact"><div><p class="eyebrow">HERE TO HELP</p><h2>Recent Support Activity</h2></div>${link("support", `View all ${arrow}`, "text-link")}</div>${tickets(data.tickets.slice(0, 3))}</article>`;
}
function details(entries) {
  return `<dl class="details">${entries.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v ?? "Not available")}</dd></div>`).join("")}</dl>`;
}
function content(route, id) {
  if (config.standaloneDemo && route === "payment-report") return heading("Payment report preview", "No real payment information is collected in this demonstration.") + `<article class="panel"><p>Historical sample payments are read-only. Use the wallet's separate fictional settled-funding control to review wallet credit and explicit renewal.</p>${link("top-up", "Review simulated wallet funding", "button outline")}</article>`;
  const walletPage = walletScreen(route, id, { aux, result, intents: walletIntents, esc, link, heading, details, moneyMinor, date, input });
  if (walletPage !== null) return walletPage;
  const extra = journeyScreen(route, id, {
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
  });
  if (extra !== null) return extra;
  if (route === "overview") return overview();
  if (route === "services") {
    if (id) {
      const s = data.services.find((s) => s.id === id);
      return s
        ? `${link("services", "← My Services", "back")}<h1>${esc(s.plan)}</h1><article class="panel">${pill(s.status)}${details(
            [
              ["Service", s.name],
              ["Service address", s.address],
              [
                "Plan speed",
                s.speedMbps === null ? "Not available" : s.speedMbps + " Mbps",
              ],
              [
                "Plan amount",
                s.monthlyAmount === null
                  ? "Not available"
                  : money(s.monthlyAmount, s.currency),
              ],
              ["Renewal date", date(s.renewalDate)],
              [
                "Usage",
                s.usage === null
                  ? "Usage information is currently unavailable"
                  : s.usage,
              ],
            ],
          )}<p class="subtle-note">Service status reflects the available account record. For plan changes or renewal assistance, contact support.</p>${link("support/new", "Ask about this service", "button")}${serviceRenewalActions(s, aux, { esc, link, moneyMinor })}</article>`
        : missing();
    }
    return (
      heading("My Services", "A closer look at your connection.") +
      (data.services.length
        ? data.services.map(serviceCard).join("")
        : empty(
            "No services linked",
            "Our team can help you check your account.",
          )) +
      serviceOrders(data, { link, esc, pill, moneyMinor, date })
    );
  }
  if (route === "billing") {
    if (id) {
      if (aux.receiptConflict)
        return (
          heading(
            "Receipt not available",
            "Payment must be confirmed by authorized staff before a receipt can be issued.",
          ) + link("billing", "Back to payment records", "button outline")
        );
      const r = aux.receipt;
      return r
        ? `${link("billing", "← Billing & Payments", "back")}<div class="row"><h1>Payment receipt</h1><button class="button outline small" data-print>Print receipt</button></div><article class="panel receipt"><img class="receipt-logo" src="assets/logo-red.png" alt="Ikonectt">${pill(r.status)}<h2>${money(r.amount, r.currency)}</h2><p>${esc(r.description)}</p>${details(
            [
              ["Receipt number", r.reference],
              ["Account number", data.profile.accountNumber],
              ["Customer", data.profile.name],
              ["Order reference", r.billReference],
              ["Payment date", date(r.paidAt)],
              ["Payment method", r.method],
            ],
          )}<p class="subtle-note">This receipt records a verified payment. It does not itself confirm service activation.</p></article>`
        : missing();
    }
    return (
      heading("Billing & Payments", "A clear view of your account records.") +
      `<article class="panel"><h2>Available bills</h2>${data.bills.length ? `<div class="table-scroll" tabindex="0" role="region" aria-label="Billing records"><table><thead><tr><th>Invoice</th><th>Description</th><th>Due date</th><th>Amount</th><th>Status</th></tr></thead><tbody>${data.bills.map((b) => `<tr><td>${esc(b.reference)}</td><td>${esc(b.description)}</td><td>${date(b.dueDate)}</td><td>${money(b.amount, b.currency)}</td><td>${pill(b.status)}</td></tr>`).join("")}</tbody></table></div>` : empty("No bills available", "Bills will appear here when supplied by Ikonectt.")}</article><article class="panel"><div class="section-heading compact"><h2>Payments & receipts</h2>${link("payment-report", "Report a payment", "button outline small")}</div>${
        data.payments?.length
          ? data.payments
              .filter((p) => !p.receiptAvailable)
              .map(
                (p) =>
                  '<div class="list-row"><div><h3>' +
                  esc(p.reference) +
                  "</h3><small>" +
                  date(p.createdAt) +
                  " · " +
                  esc(p.status) +
                  "</small></div><strong>" +
                  money(p.amount, p.currency) +
                  "</strong></div>",
              )
              .join("")
          : ""
      }${data.receipts.length ? data.receipts.map((r) => link(`billing/${encodeURIComponent(r.id)}`, `<div><small>${esc(r.reference)} · ${date(r.paidAt)}</small><h3>${esc(r.description)}</h3></div><div><strong>${money(r.amount, r.currency)}</strong> ${arrow}</div>`, "list-row")).join("") : empty("No receipts available", "Verified payment records will appear here.")}</article><p class="subtle-note">Online payment is not available in this portal yet. ${link("support/new", "Contact support for billing assistance.")}</p>`
    );
  }
  if (route === "support") {
    if (id === "new")
      return `${link("support", "← Support", "back")}${heading("How can we help?", "Tell us what’s happening. Our team will take it from here.")}<form data-form="ticket" class="panel form-panel">${input("subject", "Subject", "text", 'maxlength="120" minlength="5"')}<label>Details<textarea name="description" required minlength="15" maxlength="4000" rows="6" placeholder="Include what happened and when it started. Please don’t share passwords or card details."></textarea></label><p class="form-error" role="alert"></p><button class="button" type="submit">Submit support request ${arrow}</button></form>`;
    if (id) {
      const t = aux.ticket;
      return t
        ? `${link("support", "← Support history", "back")}${heading(esc(t.subject), esc(t.reference) + " · " + date(t.createdAt))}<article class="panel">${pill(t.status)}${details([["Submitted", date(t.createdAt)]])}<h3>Your request</h3><p class="preserve">${esc(t.description)}</p><h3>Request updates</h3><ol class="timeline">${t.updates.map((u) => `<li><small>${date(u.at)}</small><p>${esc(u.message)}</p></li>`).join("")}</ol></article>${replyForm(t, { esc })}`
        : missing();
    }
    return `<div class="row">${heading("Support", "Track your requests and conversations with Ikonectt.")}${link("support/new", `New support request ${arrow}`, "button")}</div><article class="panel"><h2>Request history</h2>${tickets(data.tickets)}</article><div class="support-boundary"><h3>Need more help?</h3><p>Submit a support request or browse account guidance.</p>${link("guidance", "Read-only account guidance", "text-link")}<br>${config.chat ? '<button class="button outline" data-chat>Open customer care</button>' : link("support/new", "Contact the support team", "text-link")}</div>`;
  }
  if (route === "profile")
    return (
      heading("My Profile", "The details linked to your Ikonectt account.") +
      `<article class="panel"><div class="avatar large">${esc(
        data.profile.name
          .split(" ")
          .map((n) => n[0])
          .join(""),
      )}</div><h2>${esc(data.profile.name)}</h2>${details([
        ["Account number", data.profile.accountNumber],
        ["Account type", data.profile.customerType],
        ["Account status", data.profile.status],
        ["Email", data.profile.email],
        ["Phone", data.profile.phone],
        ["Service address", data.profile.address],
      ])}<p class="subtle-note">Need to correct your details? Our team will verify and update your account.</p>${link("support/new", "Request a profile correction", "button outline")} ${link("security", "Manage account security →", "text-link")}</article>${phoneForm(data.profile, { esc })}`
    );
  if (route === "security")
    if (config.standaloneDemo) return heading("Account Security", "This demonstration uses no credentials.") + `<article class="panel"><p>Password changes and recovery are unavailable in this standalone review. No real account is authenticated.</p>${link("login", "Choose another sample customer", "button outline")}</article>`;
  if (route === "security")
    return (
      heading("Account Security", "Keep your connection to us secure.") +
      `<form data-form="password" class="panel form-panel"><h2>Change your password</h2><p>Choose a unique password with at least 12 characters. You’ll sign in again after it changes.</p>${password("current", "Current password")}${password("next", "New password", "new-password")}${password("confirm", "Confirm new password", "new-password")}<p class="form-error" role="alert"></p><button type="submit" class="button">Update password ${arrow}</button></form>`
    );
  if (route === "notifications")
    return (
      heading("Notifications", "Delivery updates about your account.") +
      (data.notifications?.length
        ? '<article class="panel">' +
          data.notifications
            .map(
              (n) =>
                '<div class="list-row"><div><h3>' +
                esc(
                  n.channel === "EMAIL"
                    ? "Account email update"
                    : "Account text message",
                ) +
                "</h3><small>" +
                date(n.createdAt) +
                "</small></div>" +
                pill(n.simulated ? "Simulated" : n.status) +
                "</div>",
            )
            .join("") +
          "</article>"
        : empty(
            api.capabilities.notifications
              ? "You’re all caught up"
              : "Notifications aren’t available yet",
            "Your service information and support updates remain available in their respective pages.",
          ))
    );
  return missing();
}
function heading(h, p) {
  return `<div class="page-heading"><h1>${h}</h1><p>${p}</p></div>`;
}
function missing() {
  return (
    empty(
      "We couldn’t find that page",
      "Use the navigation to return to your account.",
    ) + link("overview", "Back to overview", "button")
  );
}
function shell(body, route) {
  if (config.standaloneDemo) {
    if (["wallet", "transactions"].includes(route)) body += `<article class="panel"><h2>Settlement simulation</h2><p>Demonstrate fictional settled funding. Payment initiation alone is not a credit, and funding never changes service status.</p><button type="button" class="button outline" data-demo-fund>Simulate settled funding +₦10,000</button></article>`;
    if (aux.renewal?.status === "RESERVED") body += `<article class="panel"><h2>Separate simulated service outcome</h2><p>The funds are held. Use this separate demonstration action to simulate a confirmed outcome. No ISP request or real activation will occur.</p><button type="button" class="button" data-demo-complete="${esc(aux.renewal.id)}">Simulate confirmed service completion</button></article>`;
  }
  const navigationRoute={orders:"services",plans:"services",coverage:"services","payment-report":"billing",guidance:"support","top-up":"wallet","top-ups":"wallet",transactions:"wallet",renew:"services",renewals:"wallet"}[route]||route;
  return `<div class="app-shell"><aside class="sidebar">${logo()}<div class="sidebar-label">YOUR ACCOUNT</div><nav aria-label="Account navigation">${Object.entries(
    names,
  )
    .filter(([k]) => k !== "notifications" || api.capabilities.notifications)
    .map(([k, v]) =>
      link(
        k,
        `<span class="nav-icon" aria-hidden="true">${icons[k]}</span>${v}`,
        navigationRoute === k ? "active" : "",
      ),
    )
    .join(
      "",
    )}</nav><div class="sidebar-bottom"><div class="care-card"><strong>Account support</strong>${link("support/new", "Contact Support " + arrow)}</div><button data-logout class="logout">↪ <span>Sign out securely</span></button></div></aside><div class="app-body"><header class="app-header"><button class="menu-toggle" aria-label="Toggle navigation" aria-expanded="false">☰</button><span class="breadcrumb">My Ikonectt <span>/</span> ${names[route] || routeNames[route] || "Account"}</span><div class="account-chip">${themeToggle()}<span class="account-number">Account ${esc(customer.accountNumber)}</span>${link(
    "profile",
    esc(
      customer.name
        .split(" ")
        .map((n) => n[0])
        .join(""),
    ),
    "avatar",
  )}</div></header><main id="main" class="dashboard" tabindex="-1">${config.standaloneDemo ? `<div class="demo-banner standalone-banner"><div><strong>STANDALONE DEMO · fictional records</strong><small>Independent browser state. Refresh/reset restores samples. Prices are illustrative, not approved tariffs.</small></div><div class="wallet-actions">${link("login", "Switch sample", "text-link")}<button type="button" class="button outline small" data-demo-reset>Reset demo</button></div></div>` : config.mode === "mock" ? '<div class="demo-banner">Development preview <span>Sample account · simulated actions</span></div>' : data.simulated ? '<div class="demo-banner">Connected to development API <span>SIMULATED fixture records · real API requests</span></div>' : ""}${notice ? `<div class="notice" role="status">${esc(notice)}</div>` : ""}${body}<div class="dashboard-footer"><span>Connected with Ikonectt.</span><span>Your account number: ${esc(customer.accountNumber)}</span></div></main></div></div>`;
}
async function render() {
  const tick = ++version;
  const [route = "", rawId] = location.hash.replace(/^#\/?/, "").split("/");
  let id;
  try {
    id = rawId ? decodeURIComponent(rawId) : null;
  } catch {
    id = null;
  }
  document.title = `${names[route] || routeNames[route] || { "": "Welcome", login: "Sign in", recover: "Account recovery", help: "Account help" }[route] || "My account"} | My Ikonectt`;
  if (config.standaloneDemo && ["recover", "reset"].includes(route)) {
    root.innerHTML = authPage(); bind(); return;
  }
  if (["", "login", "recover", "reset", "help"].includes(route)) {
    root.innerHTML =
      route === ""
        ? welcome()
        : route === "reset"
          ? publicShell(
              `<section class="reset-page section">${link("login", "← Back to sign in", "back")}<p class="eyebrow">SECURE ACCOUNT ACCESS</p><h1>A fresh start.</h1><p>Paste the full one-time setup or recovery code issued by Ikonectt. This is different from your account number. Then choose a password.</p><form data-form="reset" class="panel form-panel">${input("token", "Setup or recovery code", "password", `autocomplete="off" minlength="${config.mode === "mock" ? 1 : setupCodeLimits.min}" maxlength="${setupCodeLimits.max}"`)}${password("next", "New password", "new-password")}${password("confirm", "Confirm new password", "new-password")}<p class="form-error" role="alert"></p><button type="submit" class="button">Set password ${arrow}</button></form>${config.mode === "mock" ? '<p class="subtle-note">Development code: DEMO-RESET-TOKEN. This action is simulated.</p>' : ""}</section>`,
            )
          : route === "help"
            ? publicShell(
                `<section class="help-page section"><p class="eyebrow">A LITTLE HELP GETTING STARTED</p><h1>Let’s get you connected.</h1><h2>Finding your account number</h2><p>Use the account number supplied by Ikonectt when your service was set up. It is different from the internal Customer ID.</p><h2>Forgotten your password?</h2><p>Request recovery instructions using your account number.</p>${link("recover", "Recover account access", "button")}<h2>Don’t have account details?</h2><p>Contact the Ikonectt team using the contact details on your welcome message or service paperwork. Customer accounts are created by authorized staff.</p>${link("login", "Back to sign in →", "text-link")}</section>`,
              )
            : authPage(route === "recover");
    bind();
    notice = "";
    return;
  }
  if (!setAccountPagePending(root, true, names[route] || routeNames[route] || "Account"))
    root.innerHTML = '<main id="main" class="loading" role="status">Getting your account ready…</main>';
  try {
    let nextCustomer = customer;
    if (!customer || (config.mode === "live" && !customer.mustChangePassword))
      nextCustomer = await api.resume();
    if (tick !== version) return;
    if (nextCustomer.mustChangePassword) {
      if (route !== "security") {
        location.hash = "/security";
        return;
      }
    }
    const nextData = nextCustomer.mustChangePassword
      ? { profile: nextCustomer }
      : (!data || config.mode === "live") ? await api.summary(route, nextCustomer) : data;
    if (tick !== version) return;
    const nextAux = nextCustomer.mustChangePassword
      ? {}
      : { ...await loadJourney(route, id, api, nextData), ...await loadWalletJourney(route, id, api, nextData) };
    if (tick !== version) return;
    customer = nextCustomer;
    data = nextData;
    aux = nextAux;
    const mounted = updateAccountPage(root, shell(content(route, id), route));
    notice = "";
    if (mounted) bindShell();
    bind(root.querySelector("#main"));
    document.querySelector("#main")?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  } catch (e) {
    if (tick !== version) return;
    if (e.status === 401) {
      customer = null;
      data = null;
      walletIntents.clear();
      notice = "Please sign in to access your account.";
      location.hash = "/login";
    } else {
      const message = `<section class="section"><h1>We couldn’t load this page.</h1><p role="alert">${esc(e.message)}</p><button class="button" data-retry>Try again</button> ${link("login", "Back to sign in")}</section>`;
      const main = root.querySelector(".app-shell #main");
      if (main) {
        main.innerHTML = message;
        setAccountPagePending(root, false);
        bind(main);
      } else {
        root.innerHTML = publicShell(message);
        bind();
      }
    }
  }
}
function bind(scope = root) {
  if (config.standaloneDemo) {
    const demoAction = async (button, action, message, reset = false) => {
      button.disabled = true;
      try {
        await action(); data = null; result = {}; walletIntents.clear(); customer = await api.session(); notice = message;
        if (reset && location.hash !== "#/overview") location.hash = "/overview";
        else await render();
      } catch (error) { notice = error.message; await render(); }
    };
    scope.querySelector('[data-demo-reset]')?.addEventListener('click', e => demoAction(e.currentTarget, () => api.resetDemo(), "Sample records restored.", true));
    scope.querySelector('[data-demo-fund]')?.addEventListener('click', e => demoAction(e.currentTarget, () => api.simulateFunding(1000000), "Fictional settled funding recorded. Service status is unchanged."));
    scope.querySelector('[data-demo-complete]')?.addEventListener('click', e => demoAction(e.currentTarget, () => api.completeDemoRenewal(e.currentTarget.dataset.demoComplete), "Simulated service completion recorded. No real ISP activation occurred."));
  }
  scope.querySelectorAll("[data-reveal]").forEach(
    (b) =>
      (b.onclick = () => {
        const i = document.getElementById(b.dataset.reveal);
        i.type = i.type === "password" ? "text" : "password";
        b.textContent = i.type === "text" ? "Hide" : "Show";
        b.setAttribute("aria-pressed", String(i.type === "text"));
        b.setAttribute(
          "aria-label",
          `${i.type === "text" ? "Hide" : "Show"} ${i.name} password`,
        );
      }),
  );
  scope.querySelector("[data-retry]")?.addEventListener("click", render);
  scope.querySelector("[data-wallet-edit]")?.addEventListener("click", () => {
    result.walletDraft = null;
    render();
  });
  scope.querySelectorAll("[data-wallet-scenario]").forEach(button => button.addEventListener("click", async () => {
    if (config.mode !== "mock" || !api.previewWalletScenario) return;
    button.disabled = true;
    try {
      walletIntents.clear();
      result = {};
      await api.previewWalletScenario(button.dataset.walletScenario);
      data = null;
      await render();
    } catch (error) { notice = error.message; await render(); }
  }));
  scope
    .querySelector("[data-print]")
    ?.addEventListener("click", () => window.print());
  scope.querySelector("[data-chat]")?.addEventListener("click", () =>
    window.dispatchEvent(
      new CustomEvent("ikonectt:customer-care-open", {
        detail: { source: "customer-portal" },
      }),
    ),
  );
  document.querySelector(".skip").onclick = (e) => {
    e.preventDefault();
    document.querySelector("#main")?.focus();
  };
  scope.querySelectorAll("form").forEach((f) => {
    f.addEventListener("submit", submit);
    if (["reset", "password"].includes(f.dataset.form))
      f.addEventListener("input", () => {
        const error = f.querySelector(".form-error");
        if (error) error.textContent = "";
      });
  });
}
function bindShell() {
  root.querySelectorAll('.sidebar nav a').forEach(link=>link.addEventListener('click',event=>{if(link.hash===location.hash){event.preventDefault();render();}}));
  root.querySelector(".sidebar nav a.active")?.setAttribute("aria-current", "page");
  root.querySelector(".menu-toggle")?.addEventListener("click", (e) => {
    const open = root.querySelector(".app-shell").classList.toggle("nav-open");
    e.currentTarget.setAttribute("aria-expanded", String(open));
  });
  root.querySelector("[data-logout]")?.addEventListener("click", async (e) => {
    e.currentTarget.disabled = true;
    try {
      await api.logout();
    } catch {
      /* Local credentials are cleared even when the network is unavailable. */
    } finally {
      customer = null;
      data = null;
      walletIntents.clear();
      notice = "Please sign in to access your account.";
      location.hash = "/login";
    }
  });
}
async function submit(e) {
  e.preventDefault();
  const f = e.currentTarget,
    values = Object.fromEntries(new FormData(f)),
    button = f.querySelector("[type=submit]"),
    error = f.querySelector(".form-error"),
    original = button.innerHTML;
  error.textContent = "";
  button.disabled = true;
  button.textContent = "Please wait…";
  f.setAttribute("aria-busy", "true");
  try {
    switch (f.dataset.form) {
      case "demo-entry":
        if (!config.standaloneDemo) throw new Error("Standalone review is not enabled.");
        customer = await api.enterDemo(values.demoProfile);
        data = null; result = {}; walletIntents.clear(); location.hash = "/overview";
        break;
      case "demo-funding":
        if (!config.standaloneDemo) throw new Error("Standalone review is not enabled.");
        await api.simulateFunding(Number(values.demoAmount));
        data = null; notice = "Fictional settled funding recorded. No real payment occurred; service status is unchanged.";
        location.hash = "/wallet";
        break;
      case "login":
        customer = await api.login(
          values.accountNumber.trim(),
          values.password,
        );
        walletIntents.clear();
        data = null;
        location.hash = customer.mustChangePassword ? "/security" : "/overview";
        break;
      case "wallet-top-up-review":
        result.walletDraft = validateTopUpDraft({
          amountMinor: parseAmountMinor(values.amount), currency: "NGN",
          reference: values.reference.trim(), method: values.method, evidence: values.evidence.trim(),
        });
        await render();
        break;
      case "wallet-top-up-confirm": {
        const draft = result.walletDraft || walletIntents.peek("top-up")?.payload;
        if (!draft) throw new Error("Review your top-up details before confirming.");
        const request = walletIntents.prepare("top-up", draft);
        let topUp;
        try { topUp = await api.reportWalletTopUp(request); }
        catch (error) { settleWalletFailure(walletIntents, "top-up", error); throw error; }
        walletIntents.complete("top-up");
        result = {};
        notice = topUpNotice(topUp);
        location.hash = "/top-ups";
        break;
      }
      case "wallet-renew":
      case "wallet-renew-retry": {
        const quote = aux.quote, operation = `renew:${f.dataset.id}`;
        const prior = walletIntents.peek(operation);
        const retry = f.dataset.form === "wallet-renew-retry";
        if (retry && !prior) throw new Error("There is no unconfirmed request to check. Review the current quote.");
        if (!retry && (!renewalReady(quote) || quote.subscriptionId !== f.dataset.id))
          throw new Error("Review the current renewal eligibility before confirming.");
        const request = retry ? { ...prior.payload, idempotencyKey: prior.idempotencyKey }
          : walletIntents.prepare(operation, { priceVersion: quote.priceVersion });
        let renewal;
        try { renewal = await api.requestWalletRenewal(f.dataset.id, request); }
        catch (error) {
          settleWalletFailure(walletIntents, operation, error);
          if (error.status >= 400 && error.status < 500 && error.code !== "LOCAL_PENDING_INTENT" && error.status !== 401) {
            notice = `${error.message} Review the current quote before confirming again.`;
            await render();
            break;
          }
          throw error;
        }
        walletIntents.complete(operation);
        result = {};
        notice = renewalOutcome(renewal)[0] + ". Current status is shown below.";
        location.hash = "/renewals/" + renewal.id;
        break;
      }
      case "recover": {
        const result = await api.recover(values.accountNumber.trim());
        f.innerHTML = `<div class="notice" role="status">${esc(result.message)}</div>${link("reset", "Use your recovery code →", "text-link")}`;
        break;
      }
      case "phone":
        customer = await api.updateProfile(values.phone.trim());
        data = null;
        notice = "Your phone number has been updated.";
        await render();
        break;
      case "order": {
        const payload = {
          planId: values.planId,
          buildingId: values.buildingId,
          type: values.type,
          ...(values.subscriptionId
            ? { subscriptionId: values.subscriptionId }
            : {}),
        };
        const order = await api.createOrder(payload);
        data = null;
        notice =
          "Order received. Payment verification and provisioning are separate steps.";
        location.hash = "/orders/" + order.id;
        break;
      }
      case "payment":
        await api.reportPayment({
          orderId: values.orderId,
          amountMinor: parseAmountMinor(values.amount),
          currency: "NGN",
          reference: values.reference.trim(),
          method: values.method,
          evidence: values.evidence.trim(),
        });
        data = null;
        notice =
          "Payment reported for staff review. It is not yet confirmed and does not activate service.";
        location.hash = "/billing";
        break;
      case "reply":
        await api.reply(f.dataset.id, values.message.trim());
        data = null;
        notice =
          "Your response has been sent. The current request status is shown below.";
        await render();
        break;
      case "coverage":
        result = {
          coverage: await api.checkCoverage({
            buildingId: values.buildingId,
            ...(values.planId ? { planId: values.planId } : {}),
          }),
        };
        await render();
        break;
      case "guidance":
        result = { guidance: await api.guidance(values.message.trim()) };
        await render();
        break;
      case "ticket":
        if (
          values.subject.trim().length < 5 ||
          values.description.trim().length < 15
        )
          throw new Error(
            "Please add a subject and at least 15 characters of detail.",
          );
        {
          const t = await api.createTicket({
            subject: values.subject.trim(),
            description: values.description.trim(),
          });
          data = null;
          notice = `${t.reference} received. You can follow its progress here.`;
          location.hash = "/support/" + encodeURIComponent(t.id);
          break;
        }
      case "reset":
        if(setupCodeError(values.token, config.mode))throw new Error(setupCodeError(values.token, config.mode));
        if (values.next.length < 12 || values.next.length > 128)
          throw new Error("New password must contain 12–128 characters.");
        if (values.next !== values.confirm)
          throw new Error("The new passwords don’t match.");
        await api.resetPassword(values.token.trim(), values.next);
        customer = null;
        data = null;
        location.hash = "/login";
        break;
      case "password":
        if (values.next.length < 12)
          throw new Error("Use at least 12 characters for your new password.");
        if (values.next !== values.confirm)
          throw new Error("The new passwords don’t match.");
        if (values.current === values.next)
          throw new Error(
            "Choose a password different from your current password.",
          );
        await api.changePassword(values.current, values.next);
        customer = null;
        data = null;
        location.hash = "/login";
        break;
    }
  } catch (err) {
    error.textContent = err.message;
    if (err.status === 401 && f.dataset.form !== "login") {
      customer = null;
      data = null;
      walletIntents.clear();
      notice = "Please sign in to access your account.";
      location.hash = "/login";
    }
  } finally {
    button.disabled = false;
    button.innerHTML = original;
    f.removeAttribute("aria-busy");
  }
}
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    root.querySelector(".app-shell")?.classList.remove("nav-open");
    root.querySelector(".menu-toggle")?.setAttribute("aria-expanded", "false");
  }
});
window.addEventListener("ikonectt:session-expired", () => {
  walletIntents.clear();
  customer = null;
  data = null;
  result = {};
  notice = "Your session has ended. Please sign in again.";
  if (location.hash !== "#/login") location.hash = "/login";
  else render();
});
window.addEventListener("hashchange", () => {
  result = {};
  render();
  window.scrollTo(0, 0);
});
render();
