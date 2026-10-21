// Keep the authenticated navigation frame mounted while route content changes.
export function updateAccountPage(root, markup) {
  const existing = root.querySelector(".app-shell");
  if (!existing) {
    root.innerHTML = markup;
    return true;
  }
  const template = root.ownerDocument.createElement("template");
  template.innerHTML = markup;
  const next = template.content;
  const main = existing.querySelector("#main");
  main.replaceChildren(...next.querySelector("#main").childNodes);
  for (const selector of [".breadcrumb", ".account-number", ".account-chip .avatar"]) {
    const current = existing.querySelector(selector);
    const updated = next.querySelector(selector);
    if (current && updated) current.innerHTML = updated.innerHTML;
  }
  const active = next.querySelector(".sidebar nav a.active")?.getAttribute("href");
  for (const link of existing.querySelectorAll(".sidebar nav a")) {
    const selected = link.getAttribute("href") === active;
    link.classList.toggle("active", selected);
    if (selected) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  }
  existing.classList.remove("nav-open");
  existing.querySelector(".menu-toggle")?.setAttribute("aria-expanded", "false");
  setAccountPagePending(root, false);
  return false;
}

export function setAccountPagePending(root, pending, title) {
  const main = root.querySelector(".app-shell #main");
  if (!main) return false;
  main.toggleAttribute("inert", pending);
  main.setAttribute("aria-busy", String(pending));
  if (pending && title) {
    const divider = root.ownerDocument.createElement("span");
    divider.textContent = "/";
    root.querySelector(".breadcrumb")?.replaceChildren("My Ikonectt ", divider, " ", title);
  }
  const status = root.querySelector(".route-status");
  if (pending && !status)
    root.querySelector(".breadcrumb")?.insertAdjacentHTML(
      "beforeend", '<span class="route-status" role="status">Loading…</span>',
    );
  if (!pending) status?.remove();
  return true;
}
