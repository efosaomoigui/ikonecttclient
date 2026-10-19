# My Ikonectt customer portal

Standalone customer frontend in `my-ikonectt/`. No public website, Admin/CRM, backend or shared contract files are changed. Built with browser ES modules, local CSS, local fonts and existing approved brand assets. No runtime dependency installation is required. Use Node 22+.

```powershell
cd my-ikonectt
npm run dev
```

Open http://127.0.0.1:4175/. Routes use hashes so the same files can be mounted at any static subdirectory without server rewrite rules.

```powershell
npm test
npm run build
```

The build emits `my-ikonectt/dist/`. Deploy that directory to the customer portal host or a `/my-ikonectt/` static mount. The existing public website showcase build is intentionally unchanged and does not package this independently owned application.

## Preview account

- Account number: `10000001`
- Password: `IkonecttDemo!2026`
- Development setup/recovery code: `DEMO-RESET-TOKEN`

All fixtures and actions are simulated, visibly labeled, and contain no production data. The demo session marker uses sessionStorage; it is never consulted by the live adapter. Demo ticket/password changes are memory-only and reset on page reload. Demo access is hidden automatically in live mode. There is no self-registration.

## Live configuration

Edit `config.js`: set `mode: 'live'` and the backend `apiBase`, including `/api/v1`. Rebuild. The frontend's actual origin must be allowed by backend CORS. Use HTTPS for deployment. A running API and staff-issued customer credentials are required.

`live.js` consumes Agent 1's `contracts/index.ts` and `contracts/README.md` v1.0.0 routes. It maps canonical wire records to the view interfaces in `types.d.ts`. `fixtures.js` supplies the same wire shapes to the same mapping functions. Shared contracts remain authoritative; they are not duplicated or modified here.

Live bearer tokens remain in memory, never URLs or browser storage. Reloading a live portal requires sign-in again because v1 has no refresh endpoint. Server sessions are checked on authenticated navigation. Logout calls the revocation endpoint and always clears local credentials. Password changes revoke sessions and return to sign-in. Mandatory password setup routes directly to Account Security before protected data is fetched.

Recovery requests return a generic acknowledgement. The separate setup/recovery form accepts the code sent through the approved verified channel. Codes are not read from URLs or retained by the frontend. Development recovery does not send email or SMS.

Billing money converts integer minor units exactly once in the service layer. Only confirmed payments expose receipts. There is no invoice endpoint in v1, so bills show an explicit empty state. Usage, service addresses and unavailable plan details are not fabricated. Notification UI shows supported delivery metadata, without inventing message content.

`config.chat` is a future integration boundary. When supplied, its button dispatches `ikonectt:customer-care-open` on `window`; the approved customer-care integration can subscribe. No chatbot, third-party SDK, credential or autonomous action is included.

## Contract validation

After the backend branch is available, wire fixtures can be checked against its canonical Zod schemas:

```powershell
node --experimental-strip-types tests/verify-contracts.mjs ../contracts/index.ts
```

The path argument may point to the backend agent's separate checkout. This check only reads those files. See `DELIVERY.md` for the tested state and limitations.
