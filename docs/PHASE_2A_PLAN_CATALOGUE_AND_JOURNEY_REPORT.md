# Phase 2A — Plan catalogue and customer journeys

Implementation and review: 15 October 2026. Scope: the five public client-preview templates. The existing 30 manifest routes per template, navigation, typography, footer, homepage section order and imagery are preserved. No new photography, dependencies or backend integration were introduced.

## Adopted preview catalogue

These are the reference values explicitly selected by the Phase 2A brief, not independently confirmed current commercial offers. Prices are monthly NGN. The presentation includes a discreet client-confirmation note. Residential and Business are separate catalogues.

| Residential plan | Stable ID | Mbps | Monthly NGN |
| --- | --- | ---: | ---: |
| iBasic | res-ibasic | 30 | 15,000 |
| iSilver | res-isilver | 40 | 20,000 |
| iGold | res-igold | 50 | 25,000 |
| iPlatinum | res-iplatinum | 100 | 50,000 |
| iDiamond | res-idiamond | 300 | 75,000 |

Residential source: [Ikonectt provisioning website — For Homes](https://provisions.ikonectt.com/for-homes).

| Business tier (no invented product name) | Stable ID | Monthly NGN |
| --- | --- | ---: |
| 100 Mbps | biz-100 | 105,000 |
| 300 Mbps | biz-300 | 253,000 |
| 500 Mbps | biz-500 | 359,000 |
| 1000 Mbps | biz-1000 | 437,000 |

Business source: [Ikonectt provisioning website](https://provisions.ikonectt.com/).

Direct provisioning-page retrieval timed out during research; search-indexed official content corroborated the selected plan values. The user's explicit values govern the preview. Neither indexed content nor publication establishes present commercial approval.

## Pricing discrepancies

The [newer welcome page](https://ikonectt.com/welcome-to-ikonectt/) was accessible during the review and lists different residential prices. These values are excluded from the implementation.

| Residential speed | Selected provisioning reference | Newer welcome-page reference |
| --- | ---: | ---: |
| 50 Mbps | ₦25,000 | ₦24,500 |
| 100 Mbps | ₦50,000 | ₦65,000 |
| 300 Mbps | ₦75,000 | ₦150,500 |

Do not merge these catalogues, or import newer business names/terms. Client confirmation is still required for current prices, tax treatment, installation, equipment, usage/FUP, commitments, speed guarantees, eligibility and any business SLA. No popular/best labels, free-month/free-installation promotions, unlimited allowance or equipment inclusions were added to the plan presentation.

## Shared implementation

`shared/catalogue.js` owns the nine records and price formatting. Each record contains `id`, `audience`, optional verified `displayName`, `speedMbps`, `monthlyPriceNGN`, `currency`, `billingPeriod`, `verifiedAttributes`, `sourceUrl`, `verificationStatus`, `availabilityStatus` and `displayOrder`. Verification is `published-reference-awaiting-client-confirmation`; availability is `address-verification-required`. The only feature attribute is fibre broadband. Monthly billing follows the supplied prices. The plain records can later be supplied by an approved service without introducing price-versioning tables.

`shared/plan-ui.js` renders carousel cards, complete catalogue grids, plan detail and comparisons. `shared/carousel.js` supplies interaction; `shared/plans.css` supplies responsive layout and five template skins. `shared/pages.js` and `shared/public-site.js` maintain audience and selected-plan state. The old Option B compatibility arrays now derive from the same catalogue rather than carrying fictional prices/features.

All five homepages mount the shared carousel only inside their existing plan section. A retains white rounded cards; B has charcoal panels and red top edges; C retains its dark restrained treatment; D uses Manrope and its red emphasis; E uses Outfit, burgundy and straighter editorial edges. Existing imagery and the surrounding home sections remain intact.

The route manifest remains at 30 routes. Existing `residential/plans/demo-1` and `demo-2` links remain usable. The public alias `residential/plans/details?plan=res-igold` uses the stable ID and works for all five residential plans. Unknown IDs and business IDs on residential detail pages show a useful unavailable-plan state. Public `audience` and `plan` query values survive refresh; addresses/contact details are never put in URLs or browser storage.

## Pages and interactions updated

- Home plan previews: audience switching, nine catalogue-driven cards and audience-appropriate exploration links.
- Residential overview and Plans: all five plans in a full grid, details, comparison, coverage, installation and relevant FAQs.
- Residential Details: correct name, speed, price, neutral unknown terms and selected-plan actions.
- Compare Plans: two selectable residential plans; shared prices, speeds and verified attributes; detail, coverage and selection actions. A labelled, focusable horizontal table region contains mobile overflow.
- Business overview and Plans: all four unnamed speed tiers, quote, coverage and solutions paths.
- Business Solutions: a clear Business Plans continuation.
- Installation, Quote, Coverage and Verification forms: audience-specific stable plan options and selected-plan continuity.
- Coverage Results: explicit demonstration state, appropriate plan exploration and residential installation/business quote follow-up. Refresh without a checked scenario asks for a new demonstration check.
- FAQs: obsolete assertions that no catalogue exists were replaced with concise preview-qualified answers.

Carousel navigation uses native overflow scrolling and scroll snap, previous/next buttons, Left/Right/Home/End keys, visible focus, selected slide state and a polite status announcement. Offscreen focused links bring their card into view. Desktop active cards scale 1.06; small mobile screens disable scaling and retain readable pricing with adjacent previews. Reduced motion switches movement to instant and removes scale/transitions. Native scrolling provides touch swipe and horizontal mouse/trackpad support. No autoplay or carousel package is used.

## Six customer journeys checked

The automated suite exercises these paths for A–E, preserving the template pathname and audience context.

| Journey | Result |
| --- | --- |
| Home → Residential → Plans → Details → Compare → Coverage → Installation | All five detail selections, prices, comparison selection and enquiry context work. A browser walkthrough additionally followed iGold from the carousel through details, comparison and explicit coverage result. |
| Home → Business → Solutions → Business Plans → Quote | Four separate business options; selected tier appears in quotation without residential assumptions. |
| Coverage → selected demo result → Verification/Enquiry → Plans | All five states remain explicitly demonstrative; both audiences retain tier context and get appropriate follow-up/exploration links. Unknown never means unavailable. |
| Help → FAQs → Troubleshooting → Fault/Contact | Existing search/filter, disclosures, guide and local form paths remain operational. |
| My Ikonectt → Sign In Preview → Recovery/Support | Staff-issued account preview remains separate from browsing; no successful authentication or public registration. |
| About → Contact | Existing route and contact enquiry remain available in each visual identity. |

Forms validate locally and explicitly state that details have not been sent. Coverage is never inferred from the entered address. There is no payment, activation, successful account authentication or backend submission in this preview.

## Corrected blueprint reconciliation and content gaps

The supplied 14-page `Ikonectt_Visual_Architecture_Blueprint_Corrected.pdf` is now available and was read, including visual inspection of its public journey/catalogue diagrams. Statements in the older Phase 1 report that it was unavailable describe that earlier audit only.

| Blueprint pages | Reconciliation / boundary |
| --- | --- |
| 2–3 | Public Website remains distinct from Care and Admin. Anonymous plan/coverage/enquiry browsing requires no account; staff-managed onboarding and no public self-registration are preserved. |
| 4 | Account-number/password preview retained. Approximately eight digits is not treated as an exact mandatory production format. Identity verification requires a backend. |
| 5 | One audience-aware catalogue; Country → State → City/LGA → District/Area → Street/Estate → Building/Address retained. Eligibility requires authoritative verification, with unknown separate from unavailable. |
| 6–8 | Payment reporting, financial verification, activation and read-only AI boundaries are acknowledged; no such service was implemented in Phase 2A. |
| 9–12 | Admin/CRM, authoritative ISP integrations, authorization, sessions, limits and audit are future service work. Frontend validation is not production security. |
| 13–14 | Existing build/test/GitHub/Vercel release workflow used. Provider approval, isolated service environments, backups, monitoring and operational controls remain platform dependencies. |

This establishes frontend preview alignment with the available blueprint, not complete implementation of the Care/Admin/payment/security platform. No exact `content.md` exists in the repository. The available `Ikonectt_content (1).md` editorial draft and its existing duplicate remain the content baseline, with the current Phase 2A brief governing the selected catalogue.

Content completeness review: home flow and separate audience exploration remain intact; catalogue and plan FAQs are now meaningful. Coverage/installation/support are explanatory preview flows. Company copy is restrained, contacts remain unconfirmed, and legal pages retain explicit policy-pending states. Remaining approvals: current commercial terms; authoritative coverage and installation process/timelines; public phone/email/address/hours (historic sources conflict); exact legal company styling/relationship; privacy, terms and FUP; form delivery/consent/retention; Care sign-in/recovery and provider integrations. No factual proof, partnerships, uptime guarantee or new photography was invented to fill these gaps.

## Validation and evidence

- `npm run build`: passed; all five options packaged. Existing Vite future-config warnings are non-blocking.
- `npm test`: 77 tests passed, zero failures. Includes all 150 base route/template combinations, legacy aliases, all five residential detail selections per template, catalogue value checks, comparison updates, business selection, audience switching, demonstration coverage, reduced-motion behavior, navigation, account/support and local forms.
- Browser carousel sweep: A–E at requested CSS widths 1440, 1024, 900, 600, 375 and 320. No document overflow or clipped prices in the checked views. Narrow A retest confirmed centred card after settling; initial rapid-animation measurement is retained in raw evidence rather than misreported as a steady-state result.
- Final browser business carousel checks: A–E at desktop and mobile, all four tiers, centred active card, 1.06 desktop scale / no mobile scale, correct status and no document overflow.
- Browser page sweep: 30 checks across the five templates for full Residential/Business Plans, iGold Details, Compare, selected 300 Mbps business Quote and Coverage. Correct catalogue counts, headings and selected values; no document overflow in checked desktop/mobile views.
- Browser mouse arrows, horizontal scroll and keyboard interactions exercised. Mobile comparison constrains a 660px table inside a 281px focusable region at the narrowest checked width.
- Touch swipe is implemented through native scrolling. The available browser tooling has no touch-device emulation, so a physical touch-hardware test remains outstanding; desktop/mobile viewport checks do not substitute for it.
- `git diff --check`: passed. Source photography/logo assets unchanged. No dependency or backend changes.

Curated screenshots and browser metrics are in [evidence/phase-2a](evidence/phase-2a/). Screenshot widths can differ by one CSS pixel because of device-pixel-ratio rounding. The initial responsive metrics include an in-progress smooth-scroll measurement; final carousel checks and the settled narrow screenshot are the presentation evidence.

## Publication

Validated source and generated `public_html` are published through the existing `main` → GitHub → Vercel workflow. Live preview: [Ikonectt client design selection](https://ikonecttclient-kappa.vercel.app/). Production verification is recorded after deployment below.
