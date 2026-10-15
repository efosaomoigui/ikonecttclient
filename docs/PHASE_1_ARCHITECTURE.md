# Phase 1 audit and implementation strategy

## Baseline

- `/option-a/`: React 19, TypeScript, Vite. A local page-state switch renders Home, Residential, Business, Coverage, Support, and About. Existing home sections and imagery can be retained; state-only pages cannot be bookmarked.
- `/option-b/`: React 19, TypeScript, Vite. Four local-state views, modal order/login flows, and a second design toggle. Some hard-coded catalogue/coverage values have no verified source.
- `/option-c/`: React 19, TypeScript, Vite. Homepage sections, scroll navigation, and modals; no complete internal route hierarchy.
- `/option-d/`: Standalone HTML/CSS/JS. Partial hash routing and demo forms; missing help, troubleshooting, fault, service-request, detail, result, and portal views.
- `/option-e/`: Standalone HTML/CSS/JS. Anchor-based homepage; internal journeys missing.
- Root: compact comparison hub. `scripts/build_showcase.js` compiles A–C and copies D–E to `public_html`. Vercel serves that directory.

## References and constraints

Exact `content.md` and the architectural blueprint are absent. The supplied implementation prompt defines the requested boundaries, but is not a substitute for an absent blueprint. Existing identical content drafts are provisional. See `CONTENT_AUDIT.md` for provenance and outstanding approvals. No catalogue, coverage service, authentication, form endpoint, approved legal text, or verified support directory is supplied.

## Architecture

1. Keep the comparison hub and all five existing `/option-x/` URLs. Preserve homepage section components and approved assets.
2. Introduce a dependency-free shared public-site engine, content registry, route manifest, form validation, coverage state machine, FAQ search, and navigation. React apps use thin mounting adapters; standalone templates import the same ES modules.
3. Use `#/section/page` routes beneath each existing option URL. The pathname fixes the template context; reload, back, forward, nested links, and forms stay in that template. No customer information is put in URLs or browser storage.
4. Retain template-specific palettes, typography, radius, spacing, section treatment, and header/footer appearance through scoped variants. Existing homepage sections are retained, while their callbacks enter the shared routes. Legacy components remain in source for reference; disconnected modal/mock flows are no longer mounted.
5. Render internal pages from shared business logic. Route all links to real pages. No public registration or staff administration entry exists.
6. Keep product, coverage, authentication, recovery, and submission states explicitly demonstrative until real integrations and approved facts are available. Unknown addresses never imply availability.
7. Reserve neutral internal photography slots and document them in `IMAGE_SLOTS.md`. No image generation, replacement, or Phase 2 work.

## Stages

A: audit and reference gaps. B: route context and accessible navigation. C: residential/business pages and enquiry forms. D: address hierarchy and five explicit demo result states. E: searchable help, guided support and company pages. F: sign-in/recovery and unauthenticated portal preview. G: automated route/form/journey checks, browser breakpoint checks, build and completion report.
