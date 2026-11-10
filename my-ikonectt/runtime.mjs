export function runtimeConfig() {
  const mode = process.env.IKONECTT_MODE || "live";
  if (!["mock", "live"].includes(mode))
    throw new Error("IKONECTT_MODE must be mock or live");
  const apiBase =
    process.env.IKONECTT_API_BASE || "http://127.0.0.1:4000/api/v1";
  const url = new URL(apiBase);
  if (!["http:", "https:"].includes(url.protocol))
    throw new Error("Invalid API URL");
  if (process.env.NODE_ENV === "production") {
    if (mode !== "live")
      throw new Error("Production portal builds require live mode");
    if (!process.env.IKONECTT_API_BASE || url.protocol !== "https:")
      throw new Error("Production portal builds require an explicit HTTPS IKONECTT_API_BASE");
    if (url.username || url.password || url.search || url.hash)
      throw new Error("Production portal API base cannot contain credentials, a query or a fragment");
  }
  return (
    "globalThis.__IKONECTT_CONFIG__=" +
    JSON.stringify({ mode, apiBase }).replaceAll("<", "\\u003c") +
    ";\n"
  );
}
