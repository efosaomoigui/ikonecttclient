export function runtimeConfig() {
  const mode = process.env.IKONECTT_MODE || "live";
  if (!["mock", "live"].includes(mode))
    throw new Error("IKONECTT_MODE must be mock or live");
  const apiBase =
    process.env.IKONECTT_API_BASE || "http://127.0.0.1:4000/api/v1";
  const url = new URL(apiBase);
  if (!["http:", "https:"].includes(url.protocol))
    throw new Error("Invalid API URL");
  return (
    "globalThis.__IKONECTT_CONFIG__=" +
    JSON.stringify({ mode, apiBase }).replaceAll("<", "\\u003c") +
    ";\n"
  );
}
