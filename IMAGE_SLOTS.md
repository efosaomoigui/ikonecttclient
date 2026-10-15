# Phase 1 internal-page image slots

Planned on 15 October 2026. This is an asset brief for Phase 2, not an instruction to generate or replace photography. Existing homepage imagery stays intact. Reserve neutral containers only where the implemented composition needs them; hide purely optional slots rather than leaving oversized empty decoration. The identifiers below are logical asset briefs, not a claim that every slot has already been rendered.

All dimensions are recommended source pixels. No image may imply that a depicted person is an Ikonectt employee, a location is an Ikonectt office, or equipment belongs to Ikonectt without approval. Existing files listed below are candidates, not authenticated documentary photographs or newly approved assets. Phase 1 must not download third-party stock or show broken images.

## Template-specific composition

- **A:** light corporate editorial surfaces, precise red accents, broad readable content columns and restrained rounded containers.
- **B:** panoramic photo-led sections, alternating light/dark residential and business treatment and generous SF Pro/system typography.
- **C:** near-black panoramic restraint, pearl residential break, equal residential/business emphasis and strong horizontal alignment.
- **D:** existing Manrope typography, warm light/dark surfaces, restrained rose/red accents and rounded cards.
- **E:** existing Outfit typography, dark burgundy canvas, large uninterrupted image fields and minimal red-accent controls.

Text remains real HTML. Avoid embedding typography into photographs. Text-safe requirements below specify the image composition; on mobile, prefer text above/below the image instead of forcing it over the crop.

## Candidate assets already present

| Key | Existing file | Status |
| --- | --- | --- |
| R | `option-b/src/assets/images/residential_fibre_living_room_1791941971218.jpg` and equivalent Option C file | Residential lifestyle candidate; retain current use. Suitability/rights and crop need Phase 2 review. |
| L | `option-b/src/assets/images/creative_creator_fibre_1791941972055.jpg` and equivalent Option C file | Supporting lifestyle candidate; avoid repeating consecutively with an existing section. |
| B | `option-b/src/assets/images/business_enterprise_workspace_1791941971989.jpg` and equivalent Option C file | Business context candidate; do not identify depicted workplace as company premises. |
| C | `option-c/src/assets/images/nigerian_business_collaboration.jpg` | Business collaboration candidate; exact composition and permissions need review. |
| H | Existing family hero in Options B/C | Preserve homepage use; no reuse in new internal sections by default. |
| A remote | Existing Option A remote Unsplash references | Existing display references only, not locally approved internal-page assets; do not download or add new uses in Phase 1. |

## Planned slots

### Implemented neutral reservations

The shared pages currently render `data-slot="residential"` on Residential Overview, `data-slot="business"` on Business Overview, `data-slot="solution"` on each of the three solution/segment detail routes, and `data-slot="about"` on About Us. This is six reservations per template, 30 across A–E. They display no photograph and load no new image. Their desktop ratios use the template-specific briefs below; mobile reservations become 4:3 with text outside the image. Separate introductory-hero photography briefs remain optional Phase 2 plans rather than extra empty Phase 1 sections.

“New needed” describes the Phase 2 input requirement. “Conditional” means review the existing candidate first. For A/D/E, local B/C files being present does not approve cross-template reuse.

### Template A

| Slot | Template | Page | Section | Intended purpose | Ratio | Dimensions | Subject position | Text-safe area | Mobile crop | Existing image available | New needed |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A-RH | A | Residential Overview | Introductory hero | Establish home use without performance promises | 16:9 | 1920 × 1080 | Right third | Left 40%; keep home context visible | 4:3 at 800 × 600; preserve face and hands | No local A lifestyle image | Yes, approved asset required |
| A-RS | A | Residential Overview | Lifestyle/service overview | Show a distinct everyday work or household activity | 4:3 | 1200 × 900 | Centre-right | Text alongside; no overlay | 4:3 at 800 × 600; retain device and subject | No local A lifestyle image | Yes |
| A-BH | A | Business Overview | Business hero | Introduce workplace connectivity context without implying an owned site | 16:9 | 1920 × 1080 | Right half | Left 40%; uncluttered workplace background | 4:3 at 800 × 600; preserve team interaction | Remote reference only | Yes |
| A-SD | A | Business Solutions / Solution Details | Optional editorial image | Show relevant general work context; no unverified product or network diagram | 3:2 | 1440 × 960 | Centre | Text outside image | 4:3 at 800 × 600; avoid cutting equipment | No approved local A image | Yes |
| A-AB | A | About Us | Optional company story image | Support factual company story only with authorised genuine people/place/infrastructure | 3:2 | 1440 × 960 | Centre-right | Text outside image | 4:3; keep all approved identifying context | No authentic company image confirmed | Yes, genuine approved image only |

### Template B

| Slot | Template | Page | Section | Intended purpose | Ratio | Dimensions | Subject position | Text-safe area | Mobile crop | Existing image available | New needed |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| B-RH | B | Residential Overview | Introductory hero | Establish home use without performance promises | 21:9 | 2520 × 1080 | Right third | Left 45%; natural negative space | 4:3 at 800 × 600; separate mobile crop | R available as candidate | Conditional |
| B-RS | B | Residential Overview | Lifestyle/service overview | Show a distinct everyday work or household activity | 3:2 | 1440 × 960 | Centre-right | Text alongside; no overlay | 4:3 at 800 × 600; preserve activity | L available as candidate | Conditional |
| B-BH | B | Business Overview | Business hero | Introduce workplace connectivity context without implying an owned site | 21:9 | 2520 × 1080 | Right half | Left 45%; darker uncluttered field | 4:3 at 800 × 600; preserve primary people | B available as candidate | Conditional |
| B-SD | B | Business Solutions / Solution Details | Optional editorial image | Show relevant general work context; no unverified product or network diagram | 16:9 | 1600 × 900 | Centre | Text outside image | 4:3; retain equipment/work context | B exists; avoid repeating adjacent hero | Conditional, distinct supporting asset likely |
| B-AB | B | About Us | Optional company story image | Support factual company story only with authorised genuine people/place/infrastructure | 16:9 | 1600 × 900 | Centre-right | Text outside image | 4:3; retain approved company context | No authentic company image confirmed | Yes, genuine approved image only |

### Template C

| Slot | Template | Page | Section | Intended purpose | Ratio | Dimensions | Subject position | Text-safe area | Mobile crop | Existing image available | New needed |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| C-RH | C | Residential Overview | Introductory hero | Establish home use without performance promises | 21:9 | 2520 × 1080 | Right third | Left 45%; dark image field if overlaid | 4:3 at 800 × 600; separate mobile crop | R available as candidate | Conditional |
| C-RS | C | Residential Overview | Lifestyle/service overview | Show a distinct everyday work or household activity | 4:3 | 1200 × 900 | Centre-right | Pearl panel copy beside image | 4:3; preserve whole activity | L available as candidate | Conditional |
| C-BH | C | Business Overview | Business hero | Introduce workplace connectivity context without implying an owned site | 21:9 | 2520 × 1080 | Right half | Left 45%; dark tonal continuity | 4:3 at 800 × 600; preserve expressions | C or B available as candidates | Conditional |
| C-SD | C | Business Solutions / Solution Details | Optional editorial image | Show relevant general work context; no unverified product or network diagram | 3:2 | 1440 × 960 | Centre | Text outside image; near-black frame | 4:3; retain useful working context | C exists; avoid repeating hero | Conditional |
| C-AB | C | About Us | Optional company story image | Support factual company story only with authorised genuine people/place/infrastructure | 16:9 | 1600 × 900 | Centre-right | Text outside image | 4:3; keep approved factual context | No authentic company image confirmed | Yes, genuine approved image only |

### Template D

| Slot | Template | Page | Section | Intended purpose | Ratio | Dimensions | Subject position | Text-safe area | Mobile crop | Existing image available | New needed |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| D-RH | D | Residential Overview | Introductory hero | Establish home use without performance promises | 16:9 | 1920 × 1080 | Right third | Left 40%; suited to warm neutral shell | 4:3 at 800 × 600; separate crop | No D photography; R elsewhere only | Yes, or approved candidate reuse |
| D-RS | D | Residential Overview | Lifestyle/service overview | Show a distinct everyday work or household activity | 4:3 | 1200 × 900 | Centre | Text alongside; restrained rounded frame | 4:3; preserve activity and equipment | No D photography; L elsewhere only | Yes, or approved candidate reuse |
| D-BH | D | Business Overview | Business hero | Introduce workplace connectivity context without implying an owned site | 16:9 | 1920 × 1080 | Right half | Left 40%; warm clean workplace tones | 4:3 at 800 × 600; keep team context | No D photography; B elsewhere only | Yes, or approved candidate reuse |
| D-SD | D | Business Solutions / Solution Details | Optional editorial image | Show relevant general work context; no unverified product or network diagram | 3:2 | 1440 × 960 | Centre | Text outside image | 4:3; retain subject and work context | No D supporting photo | Yes |
| D-AB | D | About Us | Optional company story image | Support factual company story only with authorised genuine people/place/infrastructure | 4:3 | 1200 × 900 | Centre | Text outside image | 4:3; no loss of identifying context | No authentic company image confirmed | Yes, genuine approved image only |

### Template E

| Slot | Template | Page | Section | Intended purpose | Ratio | Dimensions | Subject position | Text-safe area | Mobile crop | Existing image available | New needed |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| E-RH | E | Residential Overview | Introductory hero | Establish home use without performance promises | 21:9 | 2520 × 1080 | Right third | Left 45%; dark field fitting burgundy canvas | 4:3 at 800 × 600; keep subject in portrait-safe centre | Existing artwork preserved; no E photo | Yes, Phase 2 selection |
| E-RS | E | Residential Overview | Lifestyle/service overview | Show a distinct everyday work or household activity | 3:2 | 1440 × 960 | Centre-right | Text alongside; no baked-in text | 4:3; preserve household activity | No E photography; L elsewhere only | Yes, or approved candidate reuse |
| E-BH | E | Business Overview | Business hero | Introduce workplace connectivity context without implying an owned site | 21:9 | 2520 × 1080 | Right half | Left 45%; clean dark negative space | 4:3 at 800 × 600; separate mobile crop | Existing artwork preserved; no E photo | Yes, Phase 2 selection |
| E-SD | E | Business Solutions / Solution Details | Optional editorial image | Show relevant general work context; no unverified product or network diagram | 16:9 | 1600 × 900 | Centre-right | Left copy outside image on mobile | 4:3; retain team/equipment context | No E supporting photo | Yes |
| E-AB | E | About Us | Optional company story image | Support factual company story only with authorised genuine people/place/infrastructure | 16:9 | 1600 × 900 | Centre-right | Text outside image | 4:3; retain authentic context | No authentic company image confirmed | Yes, genuine approved image only |

## Pages intentionally kept interface-first

The following route families apply to **A, B, C, D and E**. They do not need photography to be complete and should not receive filler images.

| Page/section | Photography decision | Reason |
| --- | --- | --- |
| Residential Plans, Plan Details, Compare Plans | No planned photo | Catalogue facts, comparison and enquiry paths have priority; do not invent equipment photos or product differentiation. |
| Installation Enquiry | No planned photo | Clear form sequence and validation are the composition. |
| Business Plans, Request a Quote | No planned photo | Commercial information or a quotation pathway must remain legible. |
| Coverage Checker, Results, Address Verification | No planned photo | Form hierarchy and state explanations have priority; no fabricated coverage maps. |
| Help Centre, FAQs | No planned photo | Search, categories, questions and support actions provide structure. |
| Troubleshooting | No planned photo | Guided steps first; any future equipment diagram needs approved hardware documentation. |
| Report a Fault, Service Request, Contact Support, Contact | No planned photo | Keep forms and escalation choices prominent; no invented staff photos. |
| Privacy, Terms | No planned photo | Approved text and readable document layout only. |
| Sign In, Forgot Password, Portal Preview | No planned photo | Accessible account controls and explicit preview state; never show fabricated customer records. |
| Footer and mega-menu panels | Official logo only; no new photo | Keep navigation scannable and avoid introducing unnecessary asset dependencies. |

## Phase 1 acceptance and Phase 2 handoff

- Neutral placeholders are restrained solid surfaces/hairlines, with an honest short label where helpful. No fabricated lifestyle thumbnail, broken URL, generic stock or simulated factual infrastructure.
- Placeholder geometry must inherit the active template's radius, gutter, colour and composition. Reserve space with aspect ratio to prevent layout shift.
- No placeholder text should claim a finished asset or approved rights. Any optional slot may stay omitted until a real asset is approved.
- Supply a deliberate mobile crop; do not rely on a panoramic desktop crop at 320px/390px.
- Before Phase 2 use, verify rights, subject authenticity, contrast, focal points and responsive crops. Do not use the same photo in consecutive sections.
- This register contains **25 planned internal-page briefs**, including 10 optional solution/company slots. Existing homepage assets and artwork are outside replacement scope.
