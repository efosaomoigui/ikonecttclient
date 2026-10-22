// Loaded synchronously before styles: apply only the portal's saved visual preference.
(() => {
  const key = "ikonectt.portal.theme";
  const root = document.documentElement;
  const normalize = value => value === "dark" ? "dark" : "light";
  let theme = "light";
  try { theme = normalize(localStorage.getItem(key)); } catch { /* Storage may be disabled. */ }
  function apply(value) {
    theme = normalize(value);
    root.dataset.theme = theme;
    document.querySelectorAll("[data-theme-toggle]").forEach(button => {
      button.setAttribute("aria-pressed", String(theme === "dark"));
      button.setAttribute("aria-label", `Dark mode`);
      button.title = `Switch to ${theme === "dark" ? "light" : "dark"} mode`;
      const label = button.querySelector("[data-theme-label]");
      if (label) label.textContent = theme === "dark" ? "Dark" : "Light";
    });
  }
  apply(theme);
  document.addEventListener("click", event => {
    if (!event.target.closest?.("[data-theme-toggle]")) return;
    apply(theme === "dark" ? "light" : "dark");
    try { localStorage.setItem(key, theme); } catch { /* Switching still works in memory. */ }
  });
  window.addEventListener("storage", event => {
    if (event.key === key) apply(event.newValue);
  });
})();
