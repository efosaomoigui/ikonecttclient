# My Ikonectt standalone client review

## Stage A: inspection before implementation

The existing portal has an explicit backend-free mock adapter, local assets/fonts, hash routing and a static build. However, its entry requires a development password and its wallet fixtures are fixed presentation states at ₦25,000. It does not provide the requested passwordless two-profile review, expired/funded ₦30,000 scenario, independently completed renewal or client reset workflow.

Feasible without a framework, backend or layout redesign. The smallest safe extension is a separate build-time adapter and fictional data model, plus demo-only entry/actions. The ordinary build compiles the local pinned vendor snapshot; no outside application source or running service is required. These findings were sent to the coordinator before demo edits; the coordinator recorded Stage A in `docs/standalone-demo/FEASIBILITY.md`.

## Build and deployment boundary

- Project root: **my-ikonectt**. Install `npm ci --include=dev` (build tools are required even when the host sets a production environment); run **npm run build:demo**; deploy output **dist-demo** as a separate preview project. No secret or API environment variables are needed. No deployment has been performed.
- `build-demo.mjs` bundles the existing application using explicit standalone provider/config/view aliases. It rejects the integrated provider dependency graph, localhost/API origins and legacy development credential markers. Existing `npm run build` and `config.js` retain their integrated behavior; no runtime fallback is added.
- The build safely replaces only its own guarded, non-symlink `dist-demo` directory, avoiding stale artifacts. No source, normal `dist`, backend or database directory is removed.
- `vercel.json` selects the demo build/output and applies noindex, CSP and security headers. CSP has **connect-src 'none'** and **form-action 'none'**; an equivalent meta policy is included for basic static hosting. Static scripts, styles, fonts and images are local. There is no API proxy or API route in the artifact.
- Hash links such as `/#/wallet` work after refresh without server-side application routing. The root opens the existing sign-in composition with a small **Review the application** profile selector. It requests no password.
- Recommend Vercel deployment protection/access-controlled previews where the owner's account supports it. This is a project setting, not an implemented authentication service. No preview URL is fabricated and no deployment is authorized yet.

## Fictional profiles and consistency

| Sample | Service | Initial wallet | Illustrative plan |
| --- | --- | --- | --- |
| Ada Okafor | Expired; prior end 21 Sep 2026 | ₦30,000 available / no hold | Demo Home 80; ₦19,500 renewal |
| Meridian Studio | Active through 31 Dec 2026 | ₦0 available / no hold | Demo Business 250; ₦75,000 |

Customer IDs use UUID sequence 1/2, plan IDs 10/11, services 20/21, buildings 30/31. UUID shape is `00000000-0000-4000-8000-` plus a 12-digit sequence. Names, plan labels and amounts align with the independently hosted Admin demo where practical. Ada's expired label is a demo presentation state; no canonical subscription schema was changed. The Admin sample uses a suspended/past-expiry record. These browser demos do **not** share a database or state.

All prices are illustrative, not approved production tariffs. The initial wallet credit is its own fictional settled-funding ledger record. Historical order receipts stay separate and are not converted into wallet credit.

## Client navigation and actions

1. Open the standalone preview root, expand **Review the application**, and choose a sample customer. The existing sign-in composition remains visible with credential fields and real sign-in disabled in this separate build.
2. Click **Open simulated account**. Explore the approved sidebar and Light/Dark header toggle.
3. With Ada, choose **My Services → Renew Plan**, review ₦19,500, check consent and confirm. Wallet becomes posted ₦30,000 / held ₦19,500 / available ₦10,500. Service remains expired.
4. On the renewal detail, use the separate **Simulate confirmed service completion** action. The fictional wallet becomes ₦10,500 / no hold and the sample service becomes Active with the simulated confirmed date. This is not an ISP request. A second renewal shows insufficient funds.
5. **Wallet/Transactions → Simulate settled funding +₦10,000**, or **Top Up Wallet** with one of three illustrative amounts, adds a fictional settled credit only. Payment initiation alone is never presented as credit; service status is unchanged.
6. Support permits a fictional request and local conversation response. Nothing is sent to staff.
7. **Reset demo** restores the current sample. **Switch sample** returns to the selector.

| Function | Demo behavior |
| --- | --- |
| Overview/services/plans/billing/receipt/notifications | Read fictional records |
| Coverage | Return the sample building's simulated availability |
| New connection request | Create a fictional pending-payment order; no automatic service change |
| Funding | Explicit settled-funding simulation; local ledger only |
| Renewal | Explicit consent → hold → separate simulated completion; insufficient balance protected |
| Support request/reply, profile phone | Local, resettable edits |
| Passwords/recovery, real payment reports, provider checkout, staff approval | Unavailable/read-only explanations; no connected service |

State is in memory. Only the chosen profile key is stored in namespaced sessionStorage, so refresh resumes that profile with its original sample records and deep link; refresh/reset discards simulated edits. Exiting clears that key. Theme preference persists separately as before. No real identity, password, token or payment credential is supplied or required.

## Code and initial verification

Changed shared portal presentation only behind a build-only standalone flag: `app.js`, `wallet.js`, and three demo-banner CSS rules. Added `standalone/` adapter/model/safe view/config stubs, `build-demo.mjs`, deployment config, package script and tests. The live adapter, normal configuration, existing scripted mock wallet and canonical vendor snapshot are unchanged.

Initial checks: **38 tests pass** (33 previous + five standalone tests), strict type checking, ordinary production build and standalone build pass. Tests cover both profiles, explicit hold/completion, duplicate intent handling, insufficient balance, funding/service independence, network-request trap, support/reset/refresh isolation, guarded entry and deployment policy. Build output graph and credential/origin marker checks pass. Browser acceptance evidence will be appended after the code handoff.

Integrated runtime has not been stopped, restarted or edited by this demo implementation. Primary owns integration of the committed patch; no main merge or deployment is included.
