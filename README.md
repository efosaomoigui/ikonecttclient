# iKonectt — Client Design Shortlist

This repository (`ikonecttclient`) contains the unified client-facing digital experience proposals for **iKonectt** (flagship broadband brand of **Intelivision Technologies Limited**).

## Current shortlist

The client-facing hub exposes exactly **A+C Hybrid**, **Template D** and **Template E**. The hybrid keeps A’s approved landing page and slideshow unchanged; compatible C-derived hierarchy and spacing apply only to A’s shared inner pages. D/E remain independent.

Stable active URLs: `/option-a/`, `/option-d/`, `/option-e/`. Switching in the packaged/live hub retains supported page/query context. A bookmarked hub URL can use `?design=d&route=%23%2Fresidential%2Fplans`.

Original B/C sites remain accessible at their existing URLs for compatibility, but are absent from the active selector. All five originals are preserved at `21b060e` on `codex/preserve-five-templates-2026-10-16`. See [consolidation record](docs/CLIENT_DESIGN_SHORTLIST_CONSOLIDATION.md) and [presentation manifest](shared/design-shortlist.js).

The sections below preserve the original five-template implementation/development history. Build packaging still includes archived B/C so existing links remain valid.

## Phase 1 public website

All five options now use the same public route and customer-journey foundation with template-specific visual variants. Existing option URLs and homepage sections remain available. Use routes such as `/option-d/#/residential/plans`, `/option-e/#/support`, or `/option-c/#/my-ikonectt/sign-in`; the option pathname preserves the selected design through reload and browser history.

The shared implementation is in `shared/`: route/menu definitions, provisional copy, internal-page rendering, accessible navigation, validation, coverage scenarios, FAQ search, and static adapters. A–C mount it from their React apps; D/E import the same ES modules. No customer registration or staff Admin navigation is exposed.

Coverage, enquiry forms, authentication, recovery, and portal data are explicitly demonstrations. No message is sent, no login succeeds, and no availability is inferred from an address. Catalogue attributes, support details, and legal text remain pending verification. Exact `content.md` and the separate architectural blueprint were not supplied; see [content audit](docs/CONTENT_AUDIT.md).

See [architecture audit](docs/PHASE_1_ARCHITECTURE.md), [image slots](IMAGE_SLOTS.md), and [completion report](docs/PHASE_1_COMPLETION.md) for routes, validation, and outstanding production inputs. Phase 2 photography has not begun.

To run the shared interaction suite after installing development dependencies:

```bash
npm ci
npm test
```

It brings together:
1. **Interactive Comparison Hub (`index.html`)**: Executive portal allowing the client to toggle between Options A–E, test responsive viewports (Desktop, Tablet, Mobile), and review the feature matrix.
2. **Option A (`option-a/`)**: Editorial photography-first layout, multi-page journey (Home, Residential, Business, Coverage, Support, About), React 19 + TypeScript.
3. **Option B (`option-b/`)**: Panoramic velocity, photography-led art direction, multi-column mega menus, integrated AI Concierge.
4. **Option C (`option-c/`)**: Starlink-inspired restrained design with residential and business editorial sections.
5. **Option D (`option-d/`)**: Supplied `Ikonectt inner pages.html`, hosted as a standalone prototype with hash-based service pages, account views, and demonstration forms. Logo links stay within the hosted prototype.
6. **Option E (`option-e/`)**: Supplied `Ikonectt _ Fibre Broadband for Homes and Businesses.html`, hosted as a standalone homepage with mega menus, an animated horizon, and an address-check interaction.
7. **Static Showcase Pages (`residential.html`, `business.html`, `coverage.html`)**: High-fidelity standalone views.
8. **Design & Content Governance**: [`design.md`](./design.md) and [`Ikonectt_content (1).md`](./Ikonectt_content%20(1).md).

---

## 🚀 Live Preview (Local)

| Target | URL | Description |
| :--- | :--- | :--- |
| **Presentation Hub** | **[http://localhost:3000](http://localhost:3000)** | Executive showcase with interactive preview switcher, comparison matrix, and device viewports. |
| **Option A (Ikonectt 1)** | **[http://localhost:3001](http://localhost:3001)** | Clean editorial layout, multi-page journey, React 19 + TypeScript. |
| **Option B (Ikonectt 2)** | **[http://localhost:3002](http://localhost:3002)** | Panoramic velocity, photography-led direction, multi-column mega menus. |
| **Option C (Option 03)** | **[http://localhost:3003](http://localhost:3003)** | Starlink-inspired restraint and editorial storytelling. |
| **Option D (Inner Pages)** | **[http://localhost:3000/option-d/](http://localhost:3000/option-d/)** | Supplied inner-page prototype, served by the hub without another dev server. |
| **Option E (Fibre Homepage)** | **[http://localhost:3000/option-e/](http://localhost:3000/option-e/)** | Supplied homepage prototype, served by the hub without another dev server. |

---

## ☁️ Deployment on Vercel

This repository is pre-configured for automatic single-click deployment on **Vercel**:

1. **Push to GitHub**:
   ```bash
   git push -u origin main
   ```
2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
   - Import the `ikonecttclient` repository.
   - Keep **Root Directory** at the repository root and **Framework Preset** set to **Other**.
   - The included [`vercel.json`](./vercel.json) and root build script (`npm run build`) automatically:
     - Installs each option's locked dependencies with `npm ci --include=dev`, including Vite and the build plugins
     - Builds Option A into `public_html/option-a/`
     - Builds Option B into `public_html/option-b/`
     - Builds Option C into `public_html/option-c/`
     - Copies the standalone Option D and E prototypes into `public_html/option-d/` and `public_html/option-e/` without extra dependencies
     - Bundles the showcase hub, assets, and static pages into `public_html/`
   - Click **Deploy**.

Once deployed, the client can access the live showcase URL (e.g. `https://ikonecttclient.vercel.app`) and interactively explore all five options from any device without running local servers. Options D and E preserve the supplied prototype content, including plan placeholders and demonstration interactions.

---

## 🛠 Local Commands

```bash
# Install dependencies for all three options before the first build
npm ci --prefix option-a --include=dev
npm ci --prefix option-b --include=dev
npm ci --prefix option-c --include=dev

# Build the entire production showcase (Options A–E + Hub)
npm run build

# Start presentation hub server (port 3000)
npm run dev

# Run Option A dev server (port 3001)
npm --prefix option-a run dev

# Run Option B dev server (port 3002)
npm --prefix option-b run dev
```
