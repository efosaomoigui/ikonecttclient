# Option E content audit and implementation strategy

Discovery date: 17 November 2026. This is an internal implementation inventory, not public website copy. `inventory-before.json` preserves the 30-route map, seven aliases, navigation, nine catalogue entries and source snapshots captured before this content overhaul. Existing uncommitted visual refinements are part of the baseline and must be retained.

## Source precedence and scope

1. Current user brief and canonical `AGENTS.md` govern scope: content improvements in the existing Option E design; no production deployment; no second checkout; no manual generated-output or legacy showcase mirroring.
2. Current implementation determines what actions actually do. Shared public forms and coverage scenarios are browser demonstrations. The independently built customer and Admin applications have separate provider and integration boundaries. Do not rewrite architecture, data contracts or business rules to satisfy marketing wording.
3. Existing client-approved company/contact/story records take precedence over stale generic placeholders and presentation-era copy. `shared/content.js` supplies official contact channels; `option-e/footer-contacts.js` re-exports those records. `shared/company-pages.js` records the source for the Intelivision relationship and infrastructure narrative.
4. `shared/catalogue.js` supplies all displayed speeds, monthly NGN prices, plan IDs and reference status. Preserve its figures and status. Published reference pricing still awaits final client confirmation.
5. Visible content may be overridden after rendering: `option-e/section-showcase.js`, `option-e/review-updates.js`, `shared/polish.js`, `shared/brand-spelling.js` and presentation links must be reviewed alongside the base templates.

## Existing testimonial approvals

The eight customer stories are existing client-approved content, not illustrative sample testimonials. `option-e/customer-stories.js` records approval flags for quote, attribution, publication, portrait and rating on every record, together with original public image URLs. `docs/REVIEW_UPDATES_2026_11_15.md` records that the client requested these previously published stories and supplied their source cards.

Retain approved quotation text, names, occupations, ratings and original imagery. Do not silently edit quoted claims as marketing copy. Approval-aware rendering must preserve the truthful pending state when there are no approved entries. Any explicitly requested illustrative samples remain labelled and local-only; public hosts and `?production-preview` must never promote them to customer endorsements. Earlier discovery concern about absent approval evidence was resolved by reading the complete records and review note.

## Page inventory and decisions

| Existing routes | Purpose | Main issue | Decision |
| --- | --- | --- | --- |
| `home` | Introduce the brand and principal journeys | Multiple heading layers, duplicate audience instructions and repeated generic benefits | Preserve approved section order and imagery; shorten instructions, improve action labels and align account/coverage promises with build behaviour |
| `residential` | Household usage and installation next steps | Full catalogue and coverage FAQs repeated from plan/help pages; stacked closing CTA | Keep household guidance and installation steps; replace repeated catalogue/FAQ blocks with concise links or focused summaries |
| `residential/plans` | Residential catalogue | Vague section heading and hidden pricing qualification | Make catalogue purpose explicit; retain consistent speed, NGN/month and one visible commercial qualification |
| `residential/plans/demo-1`, `residential/plans/demo-2` | Selected-plan information | Duplicate generic metadata and FAQ blocks | Keep both compatibility routes, dynamic plan selection and distinct defaults; link to relevant help rather than repeating broad FAQs |
| `residential/compare` | Two-plan comparison | Repeated generic closing CTA; selection wording obscures installation-enquiry destination | Keep selectors, comparison and plan propagation; clarify actual next actions |
| `residential/installation` | Installation enquiry preview | Copy can imply delivery or eligibility confirmation | Keep form names and fields; concise preview instructions and accurate result message |
| `business` | Introduce workplace connectivity | Catalogue and segment content repeated elsewhere | Retain business needs and route introductions; leave full pricing detail to business plans |
| `business/solutions` | Choose business enquiry context | Repeated generic connectivity copy and placeholders | Explain how to choose SME/enterprise paths without implying approved products or SLAs |
| `business/solutions/connectivity`, `business/solutions/sme`, `business/solutions/enterprise` | Relevant business requirements | Identical editorial copy and tables of unverified claims | Retain routes; distinguish useful requirement prompts, remove empty specification rows and consolidated disclaimers |
| `business/plans` | Business catalogue | Generic wording and overlapping action list | Keep prices/speeds, quote selection and coverage audience context |
| `business/quote` | Business enquiry preview | Action must not imply a delivered quote request | Preserve plan/field contracts; improve labels and preview feedback |
| `coverage` | Demonstrate structured address check | Home launcher reads like a live decision | State preview status clearly without changing scenario or lookup architecture |
| `coverage/results` | Explain selected scenario | Direct links do not contain in-memory results | Preserve truthful empty state, result actions and plan/address context |
| `coverage/verification` | Address-review enquiry preview | Verification wording can imply a completed check | Explain the request and its preview status accurately |
| `support` | Find help by problem and action | Entire FAQ collection repeated from FAQs | Keep problem categories and support actions; use concise search guidance rather than a second full initial answer list |
| `support/faqs` | Search/filter complete answers | Two closing CTA sections and repeated generic copy | Own full FAQ content here; consolidate closing actions |
| `support/troubleshooting` | Safe manual guided checks | Must remain distinct from automatic diagnostics | Preserve topics, bounded steps, troubleshooting cautions and final support options |
| `support/fault`, `support/service-request` | Distinct fault/service enquiry previews | Submission wording must match browser-only form | Keep separate functional pages, field names and categories; clarify description and feedback |
| `support/contact` | Support channels and support enquiry | Useful channels overlap with Contact | Retain channels and support purpose; avoid broad company marketing |
| `about` | Company identity and Intelivision relationship | Audience and approach sections repeat homepage marketing | Keep supported company/network context; condense repeated usage claims |
| `contact` | Channels and enquiry routing | General-enquiry tile links to same page using an unused query | Remove redundant self-link; retain general form, direct channels and specialist paths |
| `privacy`, `terms` | Legal document locations | Approved documents/dates absent | Retain routes and explicit publication-pending state; do not fabricate legal text |
| `my-ikonectt/sign-in`, `my-ikonectt/forgot-password`, `my-ikonectt/preview` | Account access introduction/preview | Shared public release, isolated demo and integrated app differ | Explain actual entry behaviour; preserve authentication, recovery, account, payment and support integrations |
| `/option-e/photo-credits.html` | Static asset attribution | Ancillary page copied into public artifact | Retain attribution and home link; include in link/metadata review |

No functional route needs deletion. Consolidation should remove repeated sections and excessive instructions within existing pages. Preserve established layout classes and imagery; only make minor spacing adjustments needed by shorter content.

## Contracts and dependencies to preserve

- Hash routes and seven aliases in `shared/routes.js`, including `residential/plans/details` used by `detailRoute()`. Defaults remain iBasic for demo-1 and iSilver for demo-2.
- Query parameters: `audience`, `plan`, comparison `first`/`second`, FAQ `category`/`search`, troubleshooting `topic`/`step`. Existing plan and category keys are data, not editorial labels.
- Address names: `country`, `state`, `city`, `district`, `street`, `building`; country-to-building progression; contact names `name`, `email`, `phone`. Retain form `data-form` values, validation hooks and submit/status behaviour.
- Coverage result states `available`, `verification`, `planned`, `unavailable`, `unknown`; state is in memory. Do not invent persistence or live availability.
- Public-release account fallback in `shared/public-site.js`; demo account anchor rewriting in `scripts/presentation-links.mjs`; local-only Admin entry controlled by `?demo-admin=1`. Preserve native new-tab behaviour and interception selectors.
- `my-ikonectt/build-demo.mjs` replaces providers for isolated demonstrations. Leave application auth, account verification, APIs, wallet, renewal and ticket modules unchanged.
- `scripts/build_public.cjs` is authoritative packaging; Vercel and local public preview use its generated artifact. Root/legacy path redirects in `vercel.json` remain intact.
- Homepage section-order code in `option-e/homepage-order.js` and approved visual modules must remain functional after shortening copy.

## Metadata strategy

The baseline changes `document.title` on hash navigation but retains one homepage description. The build inserts `/option-e/` as the application-document canonical. No public structured data or Open Graph/Twitter metadata was found. Global Vercel `noindex,nofollow,noarchive` deliberately protects the review deployment.

Add concise, page-specific titles/descriptions and restore homepage metadata on return. Make plan titles identify the selected plan and speed. Preserve the single application-document canonical and current redirects; do not introduce a pathname routing migration or artificial hash canonicals. Keep review indexing restrictions. Any future production origin, sitemap or commercial Offer markup requires approved launch decisions and facts. Existing approved organisation/contact data may support modest Organisation structured data if a proper canonical origin is established; avoid unverified Offer or aggregate-rating claims.

## Implementation priorities and acceptance

1. Preserve approved records and all form/route/data contracts. Fix contradictory availability/account wording and ensure a concise pricing qualification remains visible. `shared/polish.js` currently hides several exact-text qualifications; content changes alone must not accidentally retain hidden essential information.
2. Consolidate overview catalogues, broad FAQ repetitions, business placeholder tables, Contact self-link and stacked CTA sections.
3. Rewrite route headings, descriptions, action labels, form instructions, validation/success/empty states and assistant responses in clear Nigerian English.
4. Review actual rendered output after late DOM copy overrides; one meaningful visible H1 per page and logical section hierarchy.
5. Build canonical public-demo output, run relevant checks and review desktop/mobile navigation, stateful journeys, affected links and homepage section order in the generated artifact. Keep the local server available; do not deploy.

## Facts requiring client confirmation

- Final approved plan prices, commercial terms, installation/equipment charges and usage conditions.
- Confirmed service footprint, rollout commitments and installation lead times before stating them.
- Business product specifications, SLA/uptime/performance guarantees and support operating hours before publishing claims.
- Approved privacy/terms documents, effective dates and update dates.
- Intended live public account URL and launch access behaviour.

Official address, customer-care email, telephone and social profiles are already supplied in `shared/content.js`; do not mark them missing. The existing eight approved customer stories likewise do not require invented replacements or a fresh blanket approval request.
