import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";

const source = readFileSync(new URL("../theme.js", import.meta.url), "utf8");
const control = '<button data-theme-toggle aria-label="Dark mode" aria-pressed="false"><span data-theme-label>Light</span></button>';
function setup(saved, blocked = false) {
  const dom = new JSDOM(control + '<input name="draft" value="Keep my form">', {
    url: "http://localhost/", runScripts: "outside-only",
  });
  if (saved !== undefined) dom.window.localStorage.setItem("ikonectt.portal.theme", saved);
  if (blocked) Object.defineProperty(dom.window, "localStorage", { get() { throw new Error("Disabled"); } });
  dom.window.eval(source);
  return dom;
}

test("theme defaults to approved light and loads a saved theme before application rendering", () => {
  for (const [saved, expected] of [[undefined, "light"], ["invalid", "light"], ["light", "light"], ["dark", "dark"]]) {
    const dom = setup(saved);
    assert.equal(dom.window.document.documentElement.dataset.theme, expected);
    assert.equal(dom.window.document.querySelector("button").getAttribute("aria-pressed"), String(expected === "dark"));
    dom.window.close();
  }
  const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
  assert.ok(html.indexOf('src="theme.js"') < html.indexOf('href="portal.css"'));
  assert.doesNotMatch(html.match(/<script src="theme.js"[^>]*>/)[0], /async|defer|module/);
});

test("delegated accessible theme control switches immediately without replacing account or form nodes", () => {
  const dom = setup();
  const { document, localStorage } = dom.window;
  const input = document.querySelector("input"), button = document.querySelector("button");
  button.querySelector("span").click();
  assert.equal(document.documentElement.dataset.theme, "dark");
  assert.equal(localStorage.getItem("ikonectt.portal.theme"), "dark");
  assert.equal(button.getAttribute("aria-pressed"), "true");
  assert.equal(document.querySelector("input"), input);
  assert.equal(input.value, "Keep my form");
  document.body.insertAdjacentHTML("beforeend", control);
  document.querySelectorAll("button")[1].click();
  assert.equal(document.documentElement.dataset.theme, "light");
  for (const toggle of document.querySelectorAll("button")) assert.equal(toggle.getAttribute("aria-pressed"), "false");
  assert.equal(localStorage.length, 1); // No auth/session storage is introduced.
  dom.window.close();
});

test("theme survives reload, follows same-origin preference changes and tolerates unavailable storage", () => {
  const first = setup(); first.window.document.querySelector("button").click();
  const reloaded = setup(first.window.localStorage.getItem("ikonectt.portal.theme"));
  assert.equal(reloaded.window.document.documentElement.dataset.theme, "dark");
  reloaded.window.dispatchEvent(new reloaded.window.StorageEvent("storage", { key: "ikonectt.portal.theme", newValue: "light" }));
  assert.equal(reloaded.window.document.documentElement.dataset.theme, "light");
  const blocked = setup(undefined, true);
  blocked.window.document.querySelector("button").click();
  assert.equal(blocked.window.document.documentElement.dataset.theme, "dark");
  for (const dom of [first, reloaded, blocked]) dom.window.close();
});

test("the semantic dark palette meets readable text contrast on cards and inputs", () => {
  const css = readFileSync(new URL("../portal.css", import.meta.url), "utf8");
  const darkPalette = css.match(/:root\[data-theme="dark"\] \{([\s\S]*?)\n\}/)[1];
  const palette = Object.fromEntries([...darkPalette.matchAll(/--([\w-]+):\s*(#[\da-f]{6});/g)].map(([, key, value]) => [key, value]));
  const luminance = hex => {
    const c = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4);
    return c[0] * .2126 + c[1] * .7152 + c[2] * .0722;
  };
  const contrast = (a, b) => { const x = luminance(a), y = luminance(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
  for (const background of ["page-background", "sidebar-surface", "surface", "input-surface", "surface-raised", "surface-hover"])
    for (const text of ["text-primary", "text-secondary", "text-muted", "text-accent"])
      assert.ok(contrast(palette[background], palette[text]) >= 4.5, `${text} on ${background}`);
  for (const status of ["success", "pending", "danger"])
    assert.ok(contrast(palette[status + "-text"], palette[status + "-surface"]) >= 4.5);
  assert.ok(contrast(palette["input-border"], palette["input-surface"]) >= 3);
});
