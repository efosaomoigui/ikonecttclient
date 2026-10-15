# Ikonectt image-production manifest

Phase 1 baseline, extended for Phase 2B on 15 October 2026. This is an asset brief for Phase 2, not an instruction to generate or replace photography. Existing homepage imagery stays intact. Reserve neutral containers only where the implemented composition needs them; hide purely optional slots rather than leaving oversized empty decoration. The identifiers below are logical asset briefs, not a claim that every slot has already been rendered.

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
| C | `option-c/src/assets/images/nigerian_business_collaboration.jpg` | Filename mismatch: actual file is a single-person portrait, not a collaborating team. Preserve current use; unsuitable as evidence for this proposed team scene. |
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
| E-RS | E | Residential Overview | Lifestyle/service overview | Show a distinct everyday work or household activity | 16:9 | 1920 × 1080 | Centre-right | Text alongside; no baked-in text | 4:3; preserve household activity | No E photography; L elsewhere only | Yes, or approved candidate reuse |
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
- The baseline above contains **25 logical internal-page briefs**, not 25 implemented image containers. The current shared renderer has six reservations per template (30 total): Residential, Business, three solution/segment routes and About. RH introductory heroes are optional; RS maps to the rendered residential reservation; BH maps to the rendered business reservation. SD may reuse one approved image across its three separate routes. Homepage proposals and production details follow below; nothing here authorises replacement.

## Phase 2B production register — proposal awaiting approval

No new photograph has been generated, sourced, installed or substituted. Existing photographs, official logos, D's fibre SVG and E's horizon artwork are preserved. These are production briefs for subsequent template-by-template approval. They are not instructions to add new sections. All people concepts intentionally request Black Nigerian representation; a filename, caption or visual appearance cannot establish citizenship, place, rights or client affiliation.

The following field sets extend **every baseline asset record** above. Resolve a record as its existing row + its template profile + its purpose profile + any override. This gives each proposed asset a template/page/section, purpose, subject/environment, composition, light/colour, ratios/dimensions, desktop/mobile crops, text-safe area, overlay, motion, existing candidate, new requirement and approval state without duplicating the same production brief five times.

### Template production profiles (apply to all IDs with that prefix)

| Template | Composition / colour treatment | Lighting direction | Desktop crop | Mobile crop / text safety | Overlay / intended animation | Approval status |
| --- | --- | --- | --- | --- | --- | --- |
| A | Clean corporate editorial, believable lived-in homes and offices; neutral whites, warm skin, restrained red details; keep existing rounded geometry | Broad natural window key from camera-left, soft fill; no hard studio flash | Keep subject in right third for overlaid hero; centre subject/activity for text-outside reservation | Separate 4:3 800×600 crop for internal reservations, all faces/hands/device intact; copy outside. Home hero uses separate portrait master below | Optional charcoal left/bottom gradient only under copy; reservations need none. Once-only 160–200ms opacity/8px rise after approval; no scramble | Proposed; no asset, placement, crop, rights or motion sign-off |
| B | Panoramic warm home / cooler neutral office contrast; realistic materials, natural skin; no generic blue technology tint | Soft directional side light from windows, daylight office; family warm late-afternoon light | Right-half subjects with left 45% calm space for hero; preserve group relationship rather than tight head crop | Internal 4:3 800×600 with copy outside; home portrait 1200×1500 composition leaves lower-left controls safe | Charcoal left→transparent and shallow bottom scrim feathered over broad distance; never opaque black panel. Crossfade only for approved hero, supporting images static | Proposed; existing files are candidates, not approved new uses |
| C | Near-black panoramic restraint + pearl editorial break; honest skin tones and neutral office materials, low-saturation environment | Lateral window light with soft edge separation; avoid crushed faces | Right-third hero subjects; editorial reservation centred, retain work context | Internal 4:3 800×600; alternate crop preserves people as a group. Text outside editorial image; portrait home crop keeps left/bottom copy field calm | Charcoal edge/bottom gradients only where needed. Static first; optional one soft 140–180ms entrance. No default scramble or rotating hero | Proposed; individually approve any future change |
| D | Warm understated Manrope design; understated contemporary Nigerian home/work, natural cream/timber, restrained red accent | Soft window key from camera-right, gentle warm ambient fill | Existing fibre hero stays SVG. For internal photos, preserve full activity centrally; no arbitrary cinematic crop | 4:3 800×600, copy outside; no faces/device cut. RH is optional and cannot displace art without approval | No overlay for reservations. Optional gentle charcoal/burgundy fade only for separately approved photographic hero. Static or 100–180ms opacity; no scramble | Hold for separate D review; no home slideshow recommended |
| E | Dark burgundy, Outfit and uninterrupted fields; cinematic true skin tones, deep wine shadows, highlights without neon | Soft side/rim light from camera-left; city blue-hour light with warm windows | Internal crop subject right / text outside. **Homepage is centred:** use lateral subjects and calm centre, not the internal left-safe recipe | Internal 4:3 800×600; home uses separate 4:5 1200×1500 with calm centre and lower control zone | Broad feathered burgundy radial/vertical/side gradients, no hard rectangle. Static by default; conditional hero crossfade and once-only ≤300ms decorative scramble after approval | Hold for separate E review and retain-horizon vs photograph decision |

All optional text movement is a future specification. Reduced-motion uses a static readable headline and instant/manual image changes. Do not animate image pan/zoom, caption, scramble and crossfade simultaneously. Do not put type or service claims inside the raster asset.

### Purpose production profiles (extend the 25 baseline records)

| ID suffix / pages | Subject description and environment | Intended purpose / composition | Source dimensions and ratios | Existing asset candidate / new requirement | Reuse and approval condition |
| --- | --- | --- | --- | --- | --- |
| RH — Residential introductory hero, optional | Smiling Nigerian woman naturally using a laptop in a comfortable contemporary home; window, sofa and subtle lived-in detail | Confidence and ease; subject right third, visible laptop and hands; left 40–45% low-detail copy area. Mobile: face/laptop retained, copy outside | Use each baseline RH ratio/dimensions: A/D 16:9 1920×1080; B/C/E 21:9 2520×1080; separate mobile 4:3 800×600 | Existing R/L are general context only, neither is the requested relaxed laptop scene. New approved master required unless a candidate passes exact story/crop review | May share shoot/story with HOME-WOMAN, but export a distinct crop; do not repeat in adjacent sections. New introductory hero itself needs layout approval |
| RS — Residential Overview lifestyle reservation; optional home Residential audience reuse | Distinct everyday home activity: a Nigerian couple sharing a screen, parent helping a child, or quiet solo work; not another identical laptop smile | Human supporting story; centred activity, readable home context. Text remains beside/above image; optional image-only treatment occupies this existing reservation without adding a section | A/C/D 4:3 1200×900; B 3:2 1440×960; E 16:9 1920×1080. Mobile 4:3 800×600 | R is a gaming couple; L is a fashion entrepreneur. Neither becomes a verified home/work claim. Review crop/resolution; new shot if intended story differs | Same approved asset can serve that template's audience tile and separate Overview if not shown consecutively; mobile crop independently approved |
| BH — Business Overview reservation; optional home Business audience reuse | Nigerian professionals collaborating around a real project in a contemporary office; varied roles, natural attention, plausible screens | Equal business attention; team right half for overlaid panorama, centred for current text-outside reservation; no invented corporate premises/network claim | A/D 16:9 1920×1080; B/C/E 21:9 2520×1080. Mobile 4:3 800×600 keeping 2–3 primary people and task | B existing workspace 1200×896 is a scene candidate; C portrait file is **not** a team candidate. New sufficiently wide master likely needed | Reuse HOME-BUSINESS shoot with different framing across separate pages; avoid repeating identical frame after its hero |
| SD — Business solution/segment details: connectivity, SME, enterprise | General Nigerian workplace/entrepreneur scene suited to all three contexts; people sharing work, architectural detail or quiet desk environment | Supporting context, not evidence of a distinct plan/SLA/hardware/network. Static text-outside editorial or image-only reservation, full activity in crop | A/C/D 3:2 1440×960; B/E 16:9 1600×900. Mobile 4:3 800×600 | B workspace or L entrepreneur can be considered; no router/server photograph assumed. Existing B/C sources 1200×896 need size/crop review | One approved general scene can serve all three **separate pages**, not three new near-identical productions. SME/enterprise-specific alternative only if independently justified |
| AB — About Us existing company-story reservation | Genuine authorised company people, premises or documented environment; no generated staff/office masquerading as company fact | Authentic company story; static, no headline inside photograph; copy outside, retain approved identifying context. May remain omitted/pending if no authentic asset | A 3:2 1440×960; B/C/E 16:9 1600×900; D 4:3 1200×900. Mobile 4:3 800×600 | None authenticated. Client-supplied authorised material required; generic lifestyle files unsuitable | Rights/identity/location approval required. No new About photograph until actual material is supplied |

For any internal image with no overlaid text, text-safe area means no raster text and all surrounding HTML stays outside its bounds on both screen sizes. An image-only treatment may remove a caption only after copy/layout approval; it never silently removes an enquiry action or approved information.

### Baseline asset-to-profile resolution, by template and page

Each entry retains its original logical ID. Rendered ratios below take precedence over earlier aspirational hero language; they describe the existing slot that a future image would occupy, not permission to create a new section.

| Template | Residential Overview | Business Overview | Solution/segment details | About |
| --- | --- | --- | --- | --- |
| A | A-RH optional introductory 16:9; A-RS rendered 4:3 | A-BH rendered 16:9, text outside | A-SD rendered 3:2 on three routes | A-AB rendered 3:2 |
| B | B-RH optional introductory 21:9; B-RS rendered 3:2 | B-BH rendered 21:9, text outside | B-SD rendered 16:9 on three routes | B-AB rendered 16:9 |
| C | C-RH optional introductory 21:9; C-RS rendered 4:3 | C-BH rendered 21:9, text outside | C-SD rendered 3:2 on three routes | C-AB rendered 16:9 |
| D | D-RH optional introductory 16:9; D-RS rendered 4:3 | D-BH rendered 16:9, text outside | D-SD rendered 3:2 on three routes | D-AB rendered 4:3 |
| E | E-RH optional introductory 21:9; E-RS rendered 16:9 (corrected from old 3:2 brief) | E-BH rendered 21:9, text outside | E-SD rendered 16:9 on three routes | E-AB rendered 16:9 |

All rendered slots become 4:3 below 768px, with copy outside. The six slot instances per template are confirmed in `shared/pages.js` and `shared/public-site.css`. There are no empty photographic reservations on the current D/E homepages. Preserve the existing title band above internal editorial reservations; do not convert every internal page into a photographic hero.

### Homepage master stories (production families, not five mandatory slides)

All story production is **unapproved/on hold**. Source dimensions are targets for future masters, not an instruction to upscale existing files. Subject authenticity, rights and believable Nigerian context require approval. The five families below prevent separate near-identical shoots for every route.

| Family | Purpose / subject / environment | Composition, lighting and colour | Source aspect/dimensions; desktop crop | Mobile crop / text-safe area | Overlay / animation | Existing candidate / new requirement |
| --- | --- | --- | --- | --- | --- | --- |
| HOME-WOMAN | Warm residential confidence; naturally smiling Nigerian woman using laptop at home, relaxed rather than posing at camera | Subject right third, credible laptop/hands, calm wall/soft furnishings left; soft window key left, warm-neutral skin, restrained red textile |21:9 2520×1080 wide master plus 16:9 2400×1350 delivery for A; subject right 60–90%, left 0–45% quiet |4:5 1200×1500 art-directed master; face near upper-right, device mid-right, left/lower copy field; E uses separate lateral framing and calm central 55% | Template-profile graded scrim; hero crossfade only if approved, no continuous Ken Burns. Static initial image | A remote woman is an emotional/display reference only; no confirmed Nigerian scene. No exact local candidate. New approved production required |
| HOME-FAMILY | Togetherness; Nigerian family sharing a genuine household moment, comfortable contemporary home | Two or three people interacting, screen incidental, no forced universal laughter; window key right, warm daylight, honest home detail |21:9 2520×1080; keep complete relationship right half with left 45% calm. A can export 16:9 |4:5 1200×1500 separate composition with at least two primary faces/hands retained; text bottom-left or outside if crop fails | Feathered charcoal left/bottom; crossfade only in approved A/B hero; static C preferred | Existing H 1376×768 shows adult and child with devices, useful reference but inadequate panoramic master. Conditional approved reuse at suitable size; otherwise new wider frame |
| HOME-BUSINESS | Productivity; Nigerian professionals collaborating on a project in a contemporary office | 2–4 primary people, natural discussion, legible plausible work without fabricated metrics; window key left, neutral/cool architectural background with natural skin |21:9 2520×1080; people right half, left 45% uncluttered. A 16:9 export; E centred-safe alternate |4:5 1200×1500 separate 2-person crop; preserve gesture/device and lower controls; E centre 55% stays clear | Charcoal or burgundy side gradient, no opaque panel; restrained crossfade, supporting placement static | Existing B 1200×896 workspace is scene reference; new wide composition needed if crop insufficient. C portrait excluded |
| HOME-ENTREPRENEUR | Progress through enterprise; Nigerian owner/small team actively handling design/orders in a premium but believable studio/shop | In-action rather than arms-crossed headshot, tactile materials and device; warm side light from right, neutral timber/cream, accurate skin |21:9 2520×1080 for B; subject/activity right half, calm left 45% |4:5 1200×1500 with face/hands/work retained; lower-left copy clear | Soft charcoal lower/left gradient; crossfade only for B approved hero, no animated screens | Existing L 1200×896 fashion designer is a supporting reference, not the requested active wide scene. Conditional review or new frame from distinct activity |
| HOME-NIGERIA | Connected place and progress; approved real Nigerian city/architecture at blue hour, no claim of coverage/network ownership | Believable streets/building scale, warm windows, natural sky, no invented fibre-beam map; soft dusk light, burgundy-compatible shadows |21:9 2520×1080; horizon upper third, uncluttered centre for E, architectural anchors toward edges |4:5 1200×1500 deliberately framed architecture, calm central typography and bottom controls; not a random centre crop | Feathered burgundy radial/bottom; restrained crossfade only for approved E hero, no zoom or parallax | Root cityscape-night 512×286 is too small and location unverified; not an approved source. New approved master required |

### Homepage placement records (inherit full story + template profile fields)

The asset identifiers below describe template-specific exports from the story families. Their template, page, section, purpose, subjects, environment, composition, lighting, grade, ratios, dimensions, crops, text-safe area, overlay, motion, candidates, new requirement and approval state are resolved from the named family/profile. Separate export does not automatically require a second photograph.

| Asset identifier | Template / page / section | Story / intended order | Composition override / reuse | Approval status |
| --- | --- | --- | --- | --- |
| A-H 01 | A / Home / existing hero | HOME-WOMAN / first |16:9 delivery; keep A's left-aligned HTML and 620px text column; preserve current image pending approval | Proposed three-slide direction, not implemented |
| A-H 02 | A / Home / existing hero | HOME-FAMILY / second |16:9 export from approved family master; do not duplicate immediately in audience tile | Proposed |
| A-H 03 | A / Home / existing hero | HOME-BUSINESS / third |16:9 export, same fixed headline/CTAs; optional internal A-BH crop from same shoot | Proposed |
| B-H 01 | B / Home / existing panoramic hero | HOME-FAMILY / first |21:9; family first keeps B distinct from A's individual residential story | Proposed; resolve existing broken image references in separately reviewed template work |
| B-H 02 | B / Home / existing panoramic hero | HOME-BUSINESS / second |21:9 wide office; alternate framing from A rather than repeating identical hero | Proposed |
| B-H 03 | B / Home / existing panoramic hero | HOME-ENTREPRENEUR / third |21:9 active studio scene; existing L may guide material/colour, not become automatic hero | Proposed |
| C-H 01 | C / Home / existing full-height hero | HOME-FAMILY / single static image | Preserve current H now; future unique wider family/learning frame, text left, subject right. A/B family crop reuse only by deliberate approval | Static-first recommendation; no slideshow approved |
| E-H 01 | E / Home / conditional full-height hero | HOME-WOMAN / first | Separate composition with subjects lateral, central 55% width × middle 50% height calm; portrait variant also centre-safe | Hold for E retain-horizon vs photography decision |
| E-H 02 | E / Home / conditional full-height hero | HOME-BUSINESS / second | Lateral office participants, central architectural space, fixed existing headline and CTAs | Hold |
| E-H 03 | E / Home / conditional full-height hero | HOME-NIGERIA / third | Empty central sky/quiet architecture aligns with current centred type; not the left-safe A/B composition | Hold |

D has no new home image or slideshow placement: retain the existing fibre-line SVG and radial hero. If later approved, D-RH is an internal optional hero brief, not blanket approval to replace D's homepage artwork. C's business/city slideshow alternatives remain unselected ideas, not extra production orders. Three stories are proposed for A, B and conditional E; using all five on every template is expressly rejected.

### Existing home supporting placements and image-only opportunities

| Template / actual section | Future composition recommendation within existing structure | Asset mapping / no-change boundary |
| --- | --- | --- |
| A / two edge-to-edge audience panels | Residential lived-in activity and business team, subject upper/right, feathered bottom scrim, current copy low-left; portrait-safe mobile crops | A-RS and A-BH may supply separately approved home crops. Keep all three existing remote images now. Coverage, plans, company and portal remain text/interface-led |
| B / two edge-to-edge audience panels | Keep residential warmth and business neutral daylight; supporting imagery static to contrast with conditional hero | B-RS and B-BH with different frames from their hero stories. Restore existing reference resolution only in separately approved template review; do not install replacements here |
| C / Choose Connection panels | Selective image cards are appropriate here; equal audience weighting; avoid an additional slideshow inside panels | C-RS/C-BH supporting crops, not copies of the immediately preceding family hero |
| C / pearl Residential editorial | Existing image field can be an image-only visual pause, copy stays in its separate column; future caption simplification needs content approval | C-RS story variant; current L remains. Do not add a new full-bleed section |
| C / dark Business editorial | Future authentic collaborative frame with no telemetry/status claim. Existing photo is portrait; evaluate genuine team replacement in individual review | C-BH or C-SD distinct crop. Current asset/copy untouched |
| D / home | Keep procedural hero, text tiles, FAQ, getting-connected steps and final CTA. No forced photo cards or new image-only section | Existing internal D-RS/BH/SD reservations are the first photographic opportunities; About requires genuine company material |
| E / two gradient audience panes | Conditional edge-to-edge photo replacement only within current panes; low-left copy, subjects upper/right, natural burgundy bottom fade. Keep existing hover movement from compounding hero motion | E-RS/E-BH crops, only after each pane approved. Preserve gradients now; About, coverage, plans and portal stay text-led |

No extra image-only band is approved or reserved on A/B/D/E homepages. Internal editorial reservations can let an image stand without an overlaid headline. Conventional cards remain selective supporting treatments, not a site-wide pattern. Footer, navigation and all interface-first routes above retain their existing composition.

## Production sequence after the approval checkpoint

1. Approve story board, exact template/slot list and shoot/source method; resolve B path issue and C content/asset mismatch during individual review before judging replacement directions.
2. Produce one primary residential woman/laptop master and desktop/mobile composition proofs for A; approve skin tone, expression, home context and text safety before any variants.
3. Produce the business collaboration master; crop separately for its approved hero/internal uses, keeping documentary/company implications out.
4. Approve connected-family master, then city/environment master if E photography is selected. Prioritise real Nigerian location specificity, no implied coverage proof.
5. Produce distinct Residential support activity and Business/entrepreneur support only where approved masters cannot provide a suitable non-repetitive crop. Reuse across separate pages deliberately, never copy one hero to all five templates by default.
6. Request genuine authorised About material. Review remaining internal reservations per template; leave interface-first pages image-free.
7. Approve A, then B, C, D and E individually from homepage through internal pages to footer. D/E are separate direction decisions, not automatic inherited assignments.
8. Only after the images/crops are approved, implement static responsive delivery first. Implement a slideshow for a specifically approved hero second, test accessibility/performance and publish that bounded change.

Outstanding for every proposed record: subject/story choice; exact placement; genuine vs illustrative source and representation; usage rights/model/property permission; master resolution; desktop/mobile crop proofs; safe areas and overlay contrast; motion/autoplay/scramble choice; and final per-template approval. **Stop here: no new image production or installation and no hero slideshow implementation in Phase 2B preparation.**
