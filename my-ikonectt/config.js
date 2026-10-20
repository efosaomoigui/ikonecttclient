// Live mode must be configured against the backend agent's published contract.
const runtime = globalThis.__IKONECTT_CONFIG__ || {};
if (runtime.mode && !["mock", "live"].includes(runtime.mode))
  throw new Error("Unknown portal provider. Use mock or live.");
export const config = Object.freeze({
  mode: runtime.mode || "live",
  apiBase: runtime.apiBase || "http://127.0.0.1:4000/api/v1",
  timeoutMs: 12000,
  chat: null,
});
