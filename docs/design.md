# IKONECTTI — MASTER DESIGN SYSTEM (design.md)
**Version:** 2.0.0 (Corrected Standard)  
**Brand:** Ikonectt Telecommunications Limited (Nigeria)  
**Industry:** Ultra-Fast Optical Glass Fibre Broadband & Enterprise Connectivity  
**Target Formats:** Desktop, Tablet & Mobile (Responsive)  
**Ecosystem:** Public Web (Acquisition) • My Ikonectt (Subscriber Self-Care) • Ikonectt Operations Admin (Enterprise NOC & CRM)

---

## 1. Design Philosophy & Creative Vision

The Ikonectt digital visual language is founded on four distinct cornerstones:
**Apple-inspired visual restraint + ipNX photographic storytelling + MTN product clarity + Ikonectt brand identity.**

This establishes a tier-1 telecommunications presence—not a generic SaaS startup or template landing page:
- **Photography-first visual communication:** Visual narrative is driven by large, crisp, authentic Nigerian lifestyle, home, enterprise, and infrastructure imagery.
- **Visual restraint & breathing room:** Generous whitespace (`section: 80px`), clean editorial rhythm, minimal UI chrome, and alternating light and dark tactile surfaces.
- **Bold typographic hierarchy:** SF Pro / Plus Jakarta Sans display typography, exceptionally legible weights, minimal word count, and high-contrast headlines.
- **Purposeful Red Accents:** Ikonectt Core Red (`#ED101A`) is applied deliberately for key interaction anchors and focal guidance—never flooded indiscriminately.
- **Zero Decorative Clutter:** Strictly no decorative gradient soup across standard content cards, no unneeded drop shadows, no repetitive 3-column card templates, and restrained, strictly functional iconography.

---

## 2. Brand Identity & Official Logo Rules (Mandatory)

- **Brand Name:** Ikonectt (always capitalized as "Ikonectt" or "iKonectt®", customer portal: "My Ikonectt").
- **Asset Preservation:** The official uploaded Ikonectt logo image asset MUST be used directly without alterations.
- **CRITICAL LOGO RULES:**
  1. **Never italicize the logo.**
  2. **Never skew, shear, or slant the logo.**
  3. **Never recreate the wordmark using a standard typographic font.**
  4. **Never modify its original vector proportions or aspect ratio.**
  5. **Background Contrast Rule:**
     - Use the authentic **Red logo** on white, pearl, or light-neutral surfaces (`#FFFFFF`, `#FAFAFC`, `#F5F5F7`).
     - Use the authentic **White logo** on red, carbon, or dark-neutral surfaces (`#000000`, `#1D1D1F`, `#ED101A`).
  6. The logo must remain an immutable image asset (`IMAGE`), never editable or mocked inline HTML text.

---

## 3. Calibrated Colour System Tokens

All instances of Apple Action Blue have been permanently eradicated. The brand palette is grounded in authentic Ikonectt Red, neutral blacks/charcoals, and crisp optic whites.

```yaml
colors:
  # Primary Brand Spectrum
  primary: "#ED101A"              # Official Ikonectt Core Red (CTA pills, key highlights)
  primary-focus: "#D50913"        # Active / pressed state
  primary-on-dark: "#FF5961"      # Accessible high-legibility red accent for dark mode
  brand-red-deep: "#A80710"       # High-contrast deep red for small text & accessible link text
  brand-red-soft: "#FFF0F1"       # Subtle tinted red fill for chips and status highlights
  brand-red-border: "#FFD4D7"     # Subtle border hairline for red badge containers

  # Monochromes & Typography Ink
  ink: "#1D1D1F"                  # Primary high-contrast typography
  body: "#1D1D1F"                 # Body copy
  body-on-dark: "#FFFFFF"         # High-contrast light typography on dark surfaces
  body-muted: "#CCCCCC"           # Secondary text on dark surfaces
  ink-muted-80: "#333333"         # Secondary headings & strong metadata
  ink-muted-48: "#7A7A7A"         # Auxiliary subtext & captions

  # Neutral Surfaces & Canvas
  canvas: "#FFFFFF"               # Pure optic white primary surface
  canvas-parchment: "#F5F5F7"     # Apple-inspired light neutral surface fill
  surface-pearl: "#FAFAFC"        # Pearl editorial tile background
  divider-soft: "#F0F0F0"         # Soft component separator
  hairline: "#E0E0E0"             # Standard architectural 1px hairline stroke

  # Dark Mode, Tiles & NOC Architecture
  surface-tile-1: "#272729"       # Deep dark editorial tile
  surface-tile-2: "#2A2A2C"       # Elevated dark card surface
  surface-tile-3: "#252527"       # Secondary dark card surface
  surface-black: "#000000"        # Pure obsidian black (flagship footer & cinema sections)
  surface-chip-translucent: "#D2D2D7"

  # Interaction & Status States
  on-primary: "#FFFFFF"           # Text/icon on primary red
  on-dark: "#FFFFFF"              # Text/icon on black/charcoal
  status-operational: "#00D084"   # 99.99% Core Uptime indicator
  status-warning: "#FFAA00"       # Civil works / Maintenance notice
  status-error: "#ED101A"         # Connection fault / Form error
```

*Strict Rule:* No arbitrary blues, purples, or yellows may be introduced into the core interface styling.

---

## 4. Typography Scale & Editorial Rhythm

The typography utilizes **SF Pro Display** for prominent headlines and **SF Pro Text** / **Plus Jakarta Sans** for interfaces and reading copy, with robust system fallbacks (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`).

| Token | Size (Desktop) | Size (Mobile) | Weight | Line Height | Letter Spacing | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `hero-display` | 56px (3.5rem) | 36px (2.25rem) | 600 / Semibold | 1.07 | -0.025em | Signature cinematic hero proposition |
| `large-display` | 40px (2.5rem) | 28px (1.75rem) | 600 / Semibold | 1.10 | -0.020em | Major section editorial titles |
| `medium-display`| 34px (2.125rem) | 24px (1.5rem) | 600 / Semibold | 1.18 | -0.015em | Product titles & card headers |
| `lead` | 28px (1.75rem) | 20px (1.25rem) | 400 / Regular | 1.25 | -0.010em | Editorial section openers |
| `airy-lead` | 24px (1.5rem) | 18px (1.125rem) | 300 / Light | 1.35 | normal | Expressive lifestyle subheadings |
| `body` | 17px (1.0625rem)| 15px (0.9375rem) | 400 / Regular | 1.50 | -0.005em | Concise narrative copy |
| `caption` | 14px (0.875rem) | 13px (0.8125rem) | 400 / Regular | 1.40 | normal | Spec labels, timestamps, metadata |
| `nav-item` | 12px (0.75rem) | 12px (0.75rem) | 500 / Medium | 1.20 | +0.010em | Global navigation & utility badges |
| `mono-stat` | 44px (2.75rem) | 32px (2.0rem) | 700 (Mono) | 1.00 | tabular-nums | Speed figures (Mbps/Gbps), Naira pricing |

*Typography Rules:* No decorative scripts, slanted display types, or forced italics. Keep body text concise and comfortably tracked.

---

## 5. Spacing, Geometry & Radii

```yaml
rounded:
  none: 0px
  xs: 5px
  sm: 8px
  md: 11px
  lg: 18px
  pill: 9999px
  full: 9999px

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 17px
  lg: 24px
  xl: 32px
  xxl: 48px
  section: 80px
```

- **Public Website:** Spacious editorial sections (`spacing.section: 80px`, `lg: 24px` grid gaps).
- **My Ikonectt & Admin:** High-utility, dense operational grid using `sm: 12px`, `md: 17px`, and `rounded.sm: 8px` cards.
- **Shadow Policy:** Strictly **no drop shadows** on standard navigation, flat cards, or buttons. Hierarchy is created through tonal background contrasts (`#FFFFFF` vs `#F5F5F7` vs `#1D1D1F`) and crisp hairlines (`#E0E0E0`). Soft diffuse photographic shadows (`box-shadow: 0 20px 40px rgba(0,0,0,0.08)`) are reserved exclusively for floating hardware photography.

---

## 6. Standardized Component Vocabulary

1. **Primary Red Pill Button:** `bg-[#ED101A] text-white font-medium px-6 py-3 rounded-full hover:bg-[#D50913] transition-all` (No heavy drop shadows).
2. **White Secondary Pill Button:** `bg-white text-[#1D1D1F] border border-[#E0E0E0] px-6 py-3 rounded-full hover:bg-[#F5F5F7] transition-all`.
3. **Dark Utility Button:** `bg-[#1D1D1F] text-white px-5 py-2.5 rounded-full hover:bg-[#272729]`.
4. **Pearl Capsule Button:** `bg-[#FAFAFC] text-[#1D1D1F] border border-[#E0E0E0] px-4 py-2 rounded-full`.
5. **Circular Icon Button:** 40x40px or 44x44px round container (`rounded-full`), hairline border, centered SVG icon.
6. **Red Text Link:** `text-[#ED101A] font-medium hover:underline inline-flex items-center gap-1`.
7. **Accessible Dark-Surface Link:** `text-[#FF5961] font-medium hover:underline`.
8. **Clean White Global Navigation:** Pure white `#FFFFFF` or subtle translucent backdrop (`backdrop-blur-md bg-white/95`), minimal 52px height, single authentic logo mark, balanced links, no cluttered upper ribbons.
9. **Editorial Product Tiles (Light, Pearl, Charcoal):** Large photographic canvas, generous 32px internal padding, `rounded-[18px]`, crisp hairline border without heavy blur effects.
10. **Plan-Selection Chips:** Sleek pill toggles; selected state highlighted with `#ED101A` hairline border or soft `#FFF0F1` fill.
11. **Clean Search / Input:** Minimal border `#E0E0E0`, rounded-md (8px to 11px), 16px font-size to prevent mobile zoom.
12. **Premium Black Footer:** Pure `#000000` surface, 4-column structured typography, authentic red geo-pins/contact icons, newsletter form with pure white input boxes, and legal attribution strip.

---

## 7. Homepage Architecture & Visual Flow

The public homepage strictly adheres to this approved 8-stage sequence:
1. **Cinematic Hero:** Red-led optical atmosphere, striking Nigerian connectivity focal point, 56px headline, concise subtext, dual CTAs.
2. **Coverage & Feasibility Checker:** Clean, non-intrusive cascading location validator (`State` → `City/LGA` → `Estate/Street`) directly beneath hero.
3. **Residential Broadband ("Connected Living"):** Large-format lifestyle photography, uncluttered feature narrative, family & creator streaming context. Equal visual dignity to enterprise.
4. **Business & Enterprise ("Intelligent Connectivity"):** High-contrast enterprise photography (Lagos Island tech offices, real NOC engineers, server infrastructure).
5. **Featured Fibre Plans:** 4 clear symmetrical tiers with monthly/annual toggle, transparent pricing (`₦`), zero hidden FUP limits, uncluttered specs.
6. **My Ikonectt & Support Preview:** Clean self-service snapshot showing verified 8-digit Account ID login, line status telemetry, and instant NIBSS/card recharge.
7. **Company Confidence / Infrastructure Proof:** Tri-subsea cable landing map, local IXPN peering, and NCC licensing assurance.
8. **Authoritative Dark Footer:** Pure black `#000000` background, verified Victoria Island address, telesales phone/email links, newsletter subscription, and legal links.

---

## 8. Hero Specifications & Motion Rules

- **Visual Concept:** Cinematic, premium, red-led, photographic, clean, and highly legible. Strong focal point (modern Nigerian home or data nexus) with generous negative space.
- **Allowed Exception:** Luminous red fibre-optic light trails and subtle atmospheric depth are explicitly permitted in the Hero to express pure optical speed.
- **Motion Standards:**
  - Entrance: Smooth fade and subtle 12px upward translation (`cubic-bezier(0.16, 1, 0.3, 1)` over 400ms).
  - Ambient: Gentle, low-overhead light pulse along subtle fibre paths.
  - Buttons: Subtle 150ms hover scale (`1.02`).
  - Prohibitions: No bouncing text, no endless spinning particles, no flashing lights, no auto-advancing banner carousels that hijack user focus. Full support for `@media (prefers-reduced-motion: reduce)`.

---

## 9. Photography Standards

- **Core Themes:**
  - Modern Nigerian urban homes (Lekki, Ikoyi, Victoria Island, Abuja FCT).
  - Real Nigerian families, creators, and professionals engaged in unbuffered digital work and 4K entertainment.
  - Authentic corporate tech environments, modern conference spaces, and certified optical splice engineers in the field.
- **Quality Gates:**
  - Crystal clear, natural or cinematic lighting, minimum 1600px width for desktop heroes.
  - Zero stock clichés, zero AI facial artifacts, zero watermarks, and zero repetitive images across consecutive sections.

---

## 10. Restrained Iconography

- **Style:** Clean 24x24 optical box, 1.75px to 2px consistent stroke, rounded terminals.
- **Strict Placement:** Icons are functional tools, not decorative wallpaper. Used solely in:
  - Navigation actions, account dashboard telemetry, coverage check indicators, support buttons, and payment confirmations.
  - Prohibited: No emoji icons, no 6-icon grids listing basic commodity features repeatedly.

---

## 11. Application-Specific Design Behaviour

### 11.1 Public Website
- Editorial layout with large visual storytelling, bold headlines, minimal paragraphs, high-contrast CTA buttons, and clear pricing matrices.

### 11.2 My Ikonectt (Customer Care & Self-Service)
- Inherits identical typography, Ikonectt red tokens, and button styles.
- **Access Architecture:** Gated strictly via verified ~8-digit numeric Account ID (e.g. `8049-2195`) + Password. **No public self-signup.**
- High-utility dashboard: Live line optical attenuation (`-18.4 dBm`), days remaining, one-click remote ONT reboot, Paystack/NIBSS instant recharge, and ticket tracking.

### 11.3 Ikonectt Operations Admin (Internal NOC & CRM)
- High-density operational data tables, role-based access management, live OLT port status monitoring, subscriber provisioning queues, and audit logs.
- Tight 8px–12px padding, clear monochrome tables with status pills (`Operational`, `Degraded`, `Splicing`). No oversized marketing banners.

---

## 12. Floating Chat Assistant Specification

- **Role:** Compact, lightweight, non-intrusive floating support concierge (not a separate full page, and not a generic full-window chat clone).
- **Presentation:** Floating trigger button in bottom-right corner (`bg-[#ED101A]` with white chat icon and live green status dot).
- **Flyout Surface:** 360px wide by ~480px tall clean white card (`#FFFFFF`) with red accent header, short greeting, 4 quick navigation action chips (*Check Line Speed*, *Recharge Account*, *Check Estate Coverage*, *Report Issue*), minimal input field, and direct agent escalation link.

---

## 13. Accessibility, Contrast & Performance

- **WCAG 2.1 AA Compliance:** Minimum 4.5:1 contrast for all normal body text against backgrounds. On red backgrounds, use solid white (`#FFFFFF`). On light surfaces, small red text uses deep red (`#A80710`) to guarantee contrast compliance.
- **Touch Targets:** Minimum 44x44px for all clickable mobile elements.
- **Performant Layout:** Zero external heavy libraries, CSS/Vanilla JS first, responsive images with explicit aspect ratios to prevent layout shifts (CLS).

---

## 14. Strict Prohibitions & Anti-Patterns

1. **NO italicized, sheared, or font-reconstructed Ikonectt logos.**
2. **NO Apple Action Blue (`#0071E3` or similar blues) for primary buttons or links.**
3. **NO generic SaaS landing page patterns (e.g. cluttered 3-column feature cards with colorful icon circles).**
4. **NO decorative gradient backgrounds across standard content sections.**
5. **NO drop shadows on flat cards, buttons, or navigation bars.**
6. **NO long, text-heavy paragraphs in the Hero section.**
7. **NO inconsistent fonts; strictly SF Pro / Plus Jakarta Sans system.**
8. **NO disconnected styling between Public Website, My Ikonectt, and Operations Admin.**
