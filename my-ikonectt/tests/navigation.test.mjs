import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { updateAccountPage, setAccountPagePending } from "../navigation.js";

const page = (route, body) => `<div class="app-shell"><aside class="sidebar"><nav>
  <a href="#/overview" class="${route === "overview" ? "active" : ""}">Overview</a>
  <a href="#/support" class="${route === "support" ? "active" : ""}">Support</a>
  </nav></aside><div class="app-body"><header class="app-header">
  <button class="menu-toggle" aria-expanded="false">Menu</button>
  <span class="breadcrumb">${route}</span><div class="account-chip">
  <span class="account-number">Account 10000001</span><a class="avatar">EO</a>
  </div></header><main id="main">${body}</main></div></div>`;

test("SPA navigation preserves shell nodes and their event handlers across page changes", () => {
  const dom = new JSDOM('<div id="app"></div>');
  const root = dom.window.document.querySelector("#app");
  assert.equal(updateAccountPage(root, page("overview", "<h1>Overview</h1>")), true);
  const shell = root.querySelector(".app-shell");
  const sidebar = root.querySelector(".sidebar");
  const header = root.querySelector("header");
  const main = root.querySelector("main");
  const support = root.querySelector('a[href="#/support"]');
  let clicks = 0;
  support.addEventListener("click", (event) => { event.preventDefault(); clicks++; });
  for (let i = 0; i < 3; i++) {
    assert.equal(updateAccountPage(root, page("support", "<h1>Support</h1>")), false);
    assert.equal(root.querySelector(".app-shell"), shell);
    assert.equal(root.querySelector(".sidebar"), sidebar);
    assert.equal(root.querySelector("header"), header);
    assert.equal(root.querySelector("main"), main);
  }
  assert.equal(main.textContent, "Support");
  assert.equal(support.getAttribute("aria-current"), "page");
  assert.equal(root.querySelector('a[href="#/overview"]').hasAttribute("aria-current"), false);
  support.click();
  assert.equal(clicks, 1);
  dom.window.close();
});

test("pending navigation keeps content visible but inert, leaves navigation usable and clears its status", () => {
  const dom = new JSDOM('<div id="app"></div>');
  const root = dom.window.document.querySelector("#app");
  updateAccountPage(root, page("overview", '<form><button>Submit</button></form>'));
  const main = root.querySelector("main");
  const form = main.querySelector("form");
  setAccountPagePending(root, true, "Support");
  setAccountPagePending(root, true);
  assert.equal(main.querySelector("form"), form);
  assert.equal(main.hasAttribute("inert"), true);
  assert.equal(main.getAttribute("aria-busy"), "true");
  assert.equal(root.querySelector(".sidebar").hasAttribute("inert"), false);
  assert.equal(root.querySelectorAll('[role="status"]').length, 1);
  assert.match(root.querySelector(".breadcrumb").textContent, /Support/);
  updateAccountPage(root, page("support", "<h1>Fresh support</h1>"));
  assert.equal(main.hasAttribute("inert"), false);
  assert.equal(main.getAttribute("aria-busy"), "false");
  assert.equal(root.querySelector('[role="status"]'), null);
  assert.equal(main.textContent, "Fresh support");
  dom.window.close();
});
