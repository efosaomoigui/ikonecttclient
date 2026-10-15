# Ikonectt Phase 1 completion report

15 October 2026. Scope: website structure and customer journeys across A–E. This delivers the structural preview; client content approval and production integrations remain outstanding. Phase 2 photography has not begun.

## 1. Files changed

- `.gitattributes` (consistent HTML line endings across Windows and Vercel/Linux)
- `IMAGE_SLOTS.md`
- `README.md`
- `docs/CONTENT_AUDIT.md`
- `docs/PHASE_1_ARCHITECTURE.md`
- `docs/PHASE_1_COMPLETION.md`
- `docs/phase-1-breakpoints.json`
- `docs/phase-1-menus.json`
- `option-a/index.html`
- `option-a/src/App.tsx`
- `option-a/src/components/pages/HomePage.tsx`
- `option-b/src/App.tsx`
- `option-b/src/components/option2/CoverageChecker.tsx`
- `option-b/src/components/option2/HomePage.tsx`
- `option-c/src/App.tsx`
- `option-c/src/components/BusinessEditorialSection.tsx`
- `option-c/src/components/CoverageActionSection.tsx`
- `option-c/src/components/MyIkonecttSection.tsx`
- `option-c/src/components/ResidentialEditorialSection.tsx`
- `option-c/src/data/content.ts`
- `option-d/index.html`
- `option-e/index.html`
- `package-lock.json`
- `package.json`
- `scripts/build_showcase.js`
- `shared/content.js`
- `shared/forms.js`
- `shared/package.json`
- `shared/pages.js`
- `shared/public-site.css`
- `shared/public-site.d.ts`
- `shared/public-site.js`
- `shared/routes.js`
- `shared/static-adapter.js`
- `tests/public-site.test.mjs`

Generated distributions in `public_html/option-a/` through `public_html/option-e/` and `public_html/shared/` are refreshed by the production build. Existing source photographs and official logo assets remain intact. The compact comparison landing page remains unchanged in this phase.

## 2. Routes implemented

30 explicit route definitions per template, 150 template/route combinations. Prefix every route below with the existing `/option-a/`, `/option-b/`, `/option-c/`, `/option-d/`, or `/option-e/` pathname. The pathname is the persistent template context. Category and troubleshooting-step query parameters stay inside the hash and never contain customer details.

| Route suffix | Page |
| --- | --- |
| `#/home` | Home |
| `#/residential` | Internet that keeps your home connected. |
| `#/residential/plans` | Residential Plans |
| `#/residential/plans/demo-1` | Residential Plan Details |
| `#/residential/plans/demo-2` | Residential Plan Details |
| `#/residential/compare` | Compare Plans |
| `#/residential/installation` | Installation Enquiry |
| `#/business` | Connectivity built for business. |
| `#/business/solutions` | Business Solutions |
| `#/business/solutions/connectivity` | Business Connectivity |
| `#/business/solutions/sme` | SME Connectivity |
| `#/business/solutions/enterprise` | Enterprise Connectivity |
| `#/business/plans` | Business Plans |
| `#/business/quote` | Request a Quote |
| `#/coverage` | Check Coverage |
| `#/coverage/results` | Coverage Results |
| `#/coverage/verification` | Address Verification |
| `#/support` | How can we help? |
| `#/support/faqs` | Frequently Asked Questions |
| `#/support/troubleshooting` | Troubleshooting |
| `#/support/fault` | Report a Fault |
| `#/support/service-request` | Service Request |
| `#/support/contact` | Contact Support |
| `#/about` | Connecting people and possibilities. |
| `#/contact` | Let’s talk. |
| `#/privacy` | Privacy Policy |
| `#/terms` | Terms and Conditions |
| `#/my-ikonectt/sign-in` | Welcome to My Ikonectt. |
| `#/my-ikonectt/forgot-password` | Forgot Password |
| `#/my-ikonectt/preview` | My Ikonectt |

Preserved aliases include `#/residential/enquire`, `#/coverage/verify`, `#/my-ikonectt/login`, `#plans`, `#portal`, and `#top`. Unknown routes show a recovery page, not another template. Direct result links without an in-memory address show a prompt to begin a check. Reloading never reconstructs coverage from a city name.

## 3. Shared components and behavior

- Route manifest and public mega-menu groups.
- Desktop hover/click menus, ArrowDown/left/right keyboard entry, Escape, outside-click dismissal, current-route indicators, skip link, and mobile accordion.
- Breadcrumbs, page heroes, editorial sections, neutral image reservations, plan placeholders, comparison interface and complete public footer.
- Required/email/phone validation, inline errors, focusable error summary, password visibility toggle and honest demo confirmation.
- Country → State → City/LGA → District/Area → Street/Estate → Building/Address hierarchy with downstream reset and dependent inputs.
- Five explicitly selected demonstration result states: Available, Verification Required, Planned, Unavailable, Unknown. No geographic inference or fabricated lookup.
- Six Help Centre categories, FAQ search and filtering, guided troubleshooting, escalation, fault/service-request/contact forms.
- Account-number-compatible sign-in and recovery previews; unauthenticated portal shell. No registration, staff Admin entry, successful login, private account retrieval or payment action.
- Form input is not transmitted or persisted in browser storage. Address/plan context is retained only in the current mounted preview's memory to connect the journey.

## 4. Template-specific implementation

| Template | Preserved identity and integration |
| --- | --- |
| A | Existing editorial HomePage, photos, SF Pro/system typography, bright surfaces, red utility bar, rounded controls. React adapter mounts the shared engine. |
| B | Existing panoramic HomePage and local photos, stronger typography, more angular controls, light surface and dark utility strip. The old geographic mock lookup is replaced by a launcher to the explicit demo checker. |
| C | Existing section components and imagery, near-black canvas and pearl editorial sections, restrained pill controls. Unverified guarantees, support numbers and asserted hubs are replaced with qualified copy without changing section composition. |
| D | Original residential/inner-page home composition, Manrope, warm light/dark tokens, rose accents and rounded treatments. Static adapter owns complete hash routing; old partial route listener is retired. |
| E | Original horizon homepage, Outfit, burgundy surfaces, slim borders and square controls. Static adapter connects all former section anchors to same-template internal journeys. |

Header/footer anatomy is extended to meet the navigation brief, with each option's treatment preserved through scoped variants. Legacy React page/modal components remain in source for reference but are not mounted as alternate incomplete or mock-production journeys.

## 5. Customer journeys and checks

The interaction suite exercises these journeys in every template:

| Journey | Verified path |
| --- | --- |
| Residential | Home → Residential → Plans → Plan Details → Coverage → Installation Enquiry |
| Business | Business → Solutions → Solution Details → Request a Quote |
| Coverage | Checker → each of five demo results → verification/enquiry, including dependent-field reset and safe rendering |
| Support | Search/categories → FAQ/troubleshooting steps → fault/contact escalation |
| Customer account | Sign In → show/hide password → honest unauthenticated feedback → recovery/support |
| Company | About Us → Contact |

All defined routes and rendered public route links are checked in A–E. Forms are checked with missing, invalid and valid sample input. Reload/back/forward/template context, no browser persistence, no registration/Admin paths and unknown-query recovery are covered.

Browser QA covers seven representative pages in each of five templates at all five requested viewport targets: 1440, 1024, 768, 390 and 320px (175 combinations). The in-app browser's zoom maps a few requested targets to an adjacent CSS pixel; actual measured widths are recorded rather than hidden. No page-level horizontal overflow or missing heading was found. Desktop keyboard/Escape and 320px mobile accordion behavior were also checked in all templates. See [breakpoint measurements](phase-1-breakpoints.json) and [menu checks](phase-1-menus.json).

A live-browser coverage → verification flow was checked with invalid email feedback, corrected sample input and a clearly local demonstration confirmation. No runtime console errors were observed in the inspected preview. Existing external Option A images remain external dependencies and can be affected by network conditions.

Final validation: `npm run build` passed for A–C and packaged D/E; `npm test` passed all 51 checks (45 interaction subtests, five template groups and one packaged-asset check). The final 175-case responsive matrix passed with no page overflow, missing heading or observed runtime console error. Homepage plan CTAs were also exercised in the live browser for A–E.

## 6. Remaining content gaps

Exact `content.md` and the separate architectural blueprint are missing. The identical existing editorial drafts are used provisionally; they do not establish client-final approval. See [content audit](CONTENT_AUDIT.md).

Required approvals: current residential/business catalogue, plan features and eligibility, installation conditions, solution definitions, coverage dataset, public contact directory/hours, final company/legal styling, privacy/terms text, social links if desired, and applicable support/renewal policies. No unverified prices, speeds, coverage, SLAs, contacts, response commitments or legal clauses are added to new pages.

## 7. Remaining backend integrations

Live coverage and manual-verification service; installation/quote/contact/fault/service-request delivery and ticketing; approved consent/retention controls; staff-managed onboarding; production authentication/recovery; protected customer services, billing, renewals and support data. Public forms are explicitly demonstrations and sign-in never authenticates.

## 8. Image slots awaiting Phase 2

See [IMAGE_SLOTS.md](../IMAGE_SLOTS.md). It records 25 template-specific composition briefs and 30 actual neutral reservations across residential, business, solution/segment details and About pages, plus optional future hero briefs. Ratios, source dimensions, subject position, text-safe areas, mobile crop, existing candidates and new-asset needs are documented. No new images were generated or substituted.

## 9. Unresolved issues and handoff

Structural browsing is available; approval-dependent content and backend integrations above are intentionally unresolved. Prototype plan/detail/legal pages clearly identify their pending status. Vite emits the existing non-blocking warning about future native-config handling of `__dirname`; all current builds use supported configuration and complete successfully. Client review of the five visual variants remains required before Phase 2.

The existing preview `https://ikonecttclient-kappa.vercel.app/` returned HTTP 200 during audit. Existing option URLs are preserved. Publication of this change uses the existing GitHub/Vercel workflow; no separate hosting project or new public application is created.
