// Live mode must be configured against the backend agent's published contract.
export const config = Object.freeze({
  mode: "mock",
  apiBase: "http://localhost:4000/api/v1",
  timeoutMs: 12000,
  chat: null,
});
