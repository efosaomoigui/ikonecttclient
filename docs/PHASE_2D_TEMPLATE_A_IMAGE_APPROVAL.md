# Template A — photography image approval

16 October 2026 · **All three hero scenes visually approved · installation subsequently authorised**

**Subsequent owner instruction:** install the existing nine native-resolution files immediately and implement/deploy the slideshow without waiting for larger sources. Earlier installation gates below document the approval-stage history and are superseded for this release. See [installation report](PHASE_2D_TEMPLATE_A_INSTALLATION.md) for current delivery and validation status.

The first Residential hero scene has been created using the built-in image generation tool. Three actual PNG candidates cover desktop, tablet and portrait composition. The user approved A-H 01 with the reply “this approved” and the attached desktop/mobile reference `codex-clipboard-a72d10eb-db62-473f-ac73-9f5ccb662981.png`. Its visual package, including the mobile image-above-copy arrangement, is recorded as approved. Source-resolution and production-installation gates remain open. The user subsequently approved A-H 02 with “yes, please”. A-H 03 was produced with the later scene/device-diversity corrections and subsequently approved with the reply “approved”. All three hero scenes and their presented responsive compositions now have visual approval; supporting photography remains deferred. See the [approval log](../assets/review/template-a/approval-log.json) and the A-H 02/A-H 03 records below. The A-H 01 technical notes below preserve the submitted review history.

Review location: [`assets/review/template-a/`](../assets/review/template-a/index.html). The local interactive review is served at `http://127.0.0.1:3021/assets/review/template-a/`; it offers all six requested widths, original image files, a blending comparison and the proposed mobile layout. It is separate from the application and Vercel deployment.

## Created asset and production method

**Identifier:** A-H 01 · Residential woman / HOME-WOMAN.

**Concept:** an illustrative Black Nigerian woman laughing naturally over a laptop in a sophisticated contemporary living room. Warm window light, cream knit clothing, natural textured hair, timber and neutral upholstery connect the scene to A's restrained palette. The shadowed wall provides useful negative space rather than relying entirely on a black overlay.

**Method:** built-in `image_gen`, followed by image-generation edits for independent responsive framing and device-edge corrections. The desktop candidate was the visual reference for the medium and portrait scenes; the tablet pose and room framing were subsequently restaged. They are separate compositions, not crops of one desktop master. No CLI/API fallback, stock photography download, pixel upscaling or programmatic photo retouching was used.

**Provenance and usage:** these are AI-generated lifestyle illustrations, not photographs of actual Ikonectt customers, employees or premises. No external stock library, purchased stock licence, real subject identity or company/property release is represented. They must not be captioned as documentary company/customer photography. Publication remains subject to the owner's image approval and applicable generation-account terms; this report does not assert exclusive rights or a third-party release.

| Selected file | Native pixels / ratio | Intended use | Status |
| --- | --- | --- | --- |
| [a-h01-residential-woman-desktop-v1.png](../assets/review/template-a/a-h01-residential-woman-desktop-v1.png) | 1672 × 941; approximately 16:9 | Desktop hero, woman and laptop on the right, naturally shaded left field | Visual package approved; production resolution pending |
| [a-h01-residential-woman-medium-v3.png](../assets/review/template-a/a-h01-residential-woman-medium-v3.png) | 1448 × 1086; exact 4:3 | Tablet background composition with a quieter room and full laptop edge | Visual package approved; production resolution pending |
| [a-h01-residential-woman-mobile-v2.png](../assets/review/template-a/a-h01-residential-woman-mobile-v2.png) | 941 × 1672; approximately 9:16 | Independent portrait; laughing expression, hands and laptop context, charcoal foreground | Visual package and mobile arrangement approved; production resolution pending |

The selected files are byte-identical copies of the native generated outputs. [Asset register](../assets/review/template-a/asset-register.json) records original generation filenames, dimensions, byte sizes and SHA-256 hashes. Earlier responsive attempts are superseded, not additional approved images. [Production prompts](../assets/review/template-a/a-h01-production-prompts.md) contain the actual prompt set and reference relationships.

### Source-resolution limitation

The built-in tool returned the native sizes above despite the larger target dimensions in the prompts. **The preferred 3840 × 2160 desktop, 2400 × 1800 medium and 1440 × 2560 portrait source targets have not been met.** No file has been enlarged to claim those targets.

These files support visual/crop review at the requested viewport widths. They are not certified 4K or final high-density delivery masters. Higher-resolution production inputs, or an explicitly approved bounded native-resolution delivery strategy, must be resolved before installation. The approximately 2MB PNGs are review originals; compressed responsive AVIF/WebP production exports are also deferred. Do not import these review PNGs into the live homepage.

## Existing implementation used for the previews

Rechecked [photography preparation](PHASE_2D_TEMPLATE_A_PHOTOGRAPHY.md), [Phase 2B](PHASE_2B_PHOTOGRAPHY_PREPARATION.md), [image manifest](../IMAGE_SLOTS.md), `docs/design.md`, the corrected architecture blueprint and the active A homepage source/styles. The current implementation takes precedence over aspirational older document descriptions.

The static preview uses the actual rendered A header/hero markup, copied compiled stylesheet, local font and official logo. These immutable review-context copies are under `assets/review/template-a/context/`; original application files are untouched. [Source snapshot](../assets/review/template-a/source-snapshot.json) and [review builder](../assets/review/template-a/build_review.py) make the composition reproducible. It includes no application or assistant runtime and no slideshow.

The desktop hero remains at least 720px high from 1024px; below that it remains at least 600px, growing as the existing copy requires. The original 1200px container, 620px copy column, 520px body measure, existing type classes, 24px group gaps and original CTA treatment are retained for the initial composition review. Desktop container padding remains 48px and mobile 24px. The original header establishes the actual photographic start position. A forced vertical scrollbar matches the full site's available content width; minor browser/device scaling produces fractional measurements.

The preview keeps these exact words as HTML rather than embedding them in the photographs:

> Fibre internet for a brighter Nigeria
>
> **Connectivity without limits.**
>
> Fibre broadband for homes, businesses and everything you do online.

“Check Coverage” and “Explore Plans” retain the coverage and Residential Plans destinations through local links to the existing app. Navigation in the composition preview is a static reference, not a new customer-journey implementation. Official logo pixels/proportions and approved typography remain unchanged.

## Desktop composition and background blending

At 1440, 1280 and 1024px the desktop photograph fills the existing photographic field. Right/top image positioning protects the head when the wider hero trims the source vertically, and protects the laptop when the 1024px frame trims the source horizontally. The woman's face remains above/right of the headline, and her activity remains recognisable.

The preview uses a continuous charcoal scrim based on `#1d1d1f`: approximately 46% at the left, 44% through 45% of the width, then transparent by 75%. The naturally shadowed wall does most of the compositional work; the CSS layer supports the final text over the nearer sofa edge without shading the face. There is no image border, card, opaque text box, baked-in title, fake fibre effect or red lighting wash.

Compare [blended desktop](../assets/review/template-a/previews/a-h01-current-1440.png) with [the same composition without the CSS scrim](../assets/review/template-a/previews/a-h01-photography-without-css-1440.png). This makes the photographic shadow and CSS contribution separately reviewable. The pale area below is a review note on A's existing parchment colour, not a proposed new homepage section.

## Tablet composition

The initial medium scene put bright upholstery and a foreground table behind part of the unchanged text. An early full-cover proof failed readability; the image was revised to remove the foreground table, strengthen the naturally dark wall/floor and bring the laptop completely inside the canvas. The [rejected cover proof](../assets/review/template-a/previews/a-h01-cover-rejected-768.png) records the earlier problem, not the selected v3 composition.

The proposed tablet background fit then places the entire 4:3 image in the rightmost 66% of the existing hero, with a soft left-edge fade over 18% of that image and a lower fade over its final 30%. It dissolves into the existing charcoal design colour without a visible rectangular frame. At 768px the photographic field is approximately 503 × 377px inside the unchanged 600px hero. This keeps the head, hands and full laptop clear of the existing text; the scene is deliberately smaller than the desktop subject.

The heading, body and actions remain at their existing tablet coordinates. This is a **review proposal for photographic background fitting**, not a deployed style change. Approve the subject scale and edge treatment, or request a different tablet composition. Do not turn the rejected full-cover attempt into a production image by applying an excessively dark universal overlay.

## Mobile composition and proposed adjustment

The separate portrait preserves the face/expression, cream outfit, believable laptop and home setting. A targeted revision brought the laptop's right edge inside the source frame. Its quiet lower foreground complements the charcoal copy field.

The initial 390px and 320px previews preserve the existing hero text placement. They are shown honestly and **fail approval**: the text crosses the portrait's human/device area and lacks reliable contrast. Moving the face into a tiny shallow strip would weaken the photographic story. More dark overlay would obscure the subject rather than solve the composition.

The proposed mobile-only alternative keeps a full-width photographic area **340px high**, then the same HTML copy below with a soft photographic fade into `#1d1d1f`. The image is positioned from its top to retain the face, hands and laptop. The existing heading size, prose, group spacing, button styling, CTA order and destinations remain intact. The copy gets 24px top and 48px bottom padding in this review proposal. The face and device are above the text, not behind it.

This grows the hero to approximately 797px at 390px width and 840px at the smallest tested width. The primary CTA text ends at approximately y789 and y827 respectively. On an 844px-high screen the primary action remains visible; the second action requires a small scroll. This is an explicit space/readability tradeoff for approval, not a silent live layout change. Preserve native scrolling instead of shrinking typography or hiding a CTA.

Compare:

| Width | Existing placement — not recommended | Proposed mobile arrangement |
| --- | --- | --- |
| 390px | [Initial portrait/copy conflict](../assets/review/template-a/previews/a-h01-current-390.png) | [Image above copy](../assets/review/template-a/previews/a-h01-proposal-390.png) |
| 320px | [Initial portrait/copy conflict](../assets/review/template-a/previews/a-h01-current-320.png) | [Image above copy](../assets/review/template-a/previews/a-h01-proposal-320.png) |

## Responsive findings and readability checks

[Responsive measurements](../assets/review/template-a/responsive-checks.json) record the actual selected files, intrinsic sizes, image/hero bounds, text rectangles and overflow results. Requested widths are listed below; the browser sometimes reports 1281 or 321 CSS pixels owing to fractional scaling.

| Requested width | Selected source / treatment | Crop and text findings | Minimum text-box contrast: eyebrow / headline / body |
| --- | --- | --- | --- |
| 1440 | Desktop v1, full cover, right/top | Face, laptop and text remain separate; no horizontal overflow | 5.81 / 7.62 / 5.75 |
| 1280 | Desktop v1, full cover, right/top | Natural wide scene; existing copy positions retained; no overflow | 5.85 / 8.57 / 6.58 |
| 1024 | Desktop v1, full cover, right/top | Tighter right crop retains principal face and device; no overflow | 5.55 / 5.78 / 4.77 |
| 768 | Medium v3, fitted/faded into charcoal | Clear upper-right interaction; existing copy remains readable; no overflow | 5.62 / 8.11 / 13.79 |
| 390 | Portrait v2, existing placement | **Reject:** subject/copy conflict; no document overflow does not mean visual approval | 1.00 / 1.31 / 1.68 |
| 320 | Portrait v2, existing placement | **Reject:** subject/copy conflict and poor contrast | 1.00 / 1.13 / 2.01 |
| 390 | Portrait v2, proposed image-above-copy | Face/laptop clear, same typography/actions; no overflow | 5.75 / 16.83 / 13.79 |
| 320 | Portrait v2, proposed image-above-copy | Face/laptop clear, readable narrow column; native vertical scroll retained | 5.75 / 16.83 / 13.79 |

Proofs were captured as viewport screenshots after fonts finished loading, preserving the full site’s scrollbar width and text wrapping. Desktop/tablet capture height is 950px and mobile capture height 1100px so the complete proposal is visible; the 844px screen discussion above describes CTA positions rather than the taller proof canvas. Contrast was checked against background-only browser screenshots with the HTML copy hidden using `visibility:hidden`, preserving its layout. The read-only [contrast checker](../assets/review/template-a/check_contrast.py) samples every background pixel within the recorded text-line rectangles, including the existing body's 90% white opacity. Thresholds are 4.5:1 for eyebrow/body and 3:1 for the large heading. [Results](../assets/review/template-a/contrast-checks.json) include the failed initial mobile cases as well as the passing recommendations. These are conservative local raster checks, not a claim of a full accessibility audit or physical-device certification. Existing button colours/styles were not redesigned or recertified.

## Photographic inspection

- Face, eyes, smile, hair and skin were visually inspected in the native outputs and page previews. The expression is relaxed and focused on the laptop; the subject is consistent across the compositions.
- Visible hands/fingers and laptop perspective were inspected. Some fingers are naturally occluded by the laptop/other hand; no obvious extra limb or impossible device construction was observed in the selected candidates. Owner review of the native files remains necessary.
- The selected tablet and portrait sources retain the laptop's outer edge; the desktop device is close to the right boundary and should retain its right-aligned crop policy. No further right crop should be applied without a proof.
- No visible embedded logo, watermark, promotional text, service metric, network graphic or customer/employee identification was observed. The room and device are illustrative, not proof of service or company ownership.
- Actual pixel dimensions, aspect ratios and original-output byte identity were verified. None of the three preferred higher-resolution source targets is marked complete.
- The review page's width controls, composition selector and blending comparison are separate from the application. No customer details are entered or submitted.

## Principles for later dark and light sections

No other template is modified by this record. For future dark sections, select or produce photographic shadows that match the actual section tokens: charcoal where appropriate, burgundy only where that template uses it. Dissolve an image's outer shadow into the surrounding surface with a shallow colour-matched gradient or mask, preserving lit faces and realistic materials. Do not apply this A scrim, its percentages or a universal black overlay to every template. Do not flatten skin into muddy shadows to match a token.

For light sections, keep naturally light neutral environments and a restrained neutral edge transition appropriate to the actual white/pearl background. Prefer text outside the photograph where that composition calls for it. Avoid white fog, cutout halos, decorative frames and unnecessary photography. Select the image for the text/image relationship in the real page, not for isolated attractiveness.

## Website preservation and approval status

All changes are new files under `assets/review/template-a/` and this new report. At baseline commit `c9c9957`, `git diff --name-only` showed no tracked-file changes after generation and preview work. No homepage source, copy, typography, navigation, logo, plans, plan carousel, customer journey, support assistant or production image has been changed. No application build or slideshow implementation was needed for static review. Templates B–E are untouched.

The candidates are not imported by the app, copied to `public_html`, committed for deployment or pushed. The local review server is the presentation environment. The existing live homepage still uses its approved production images.

- [x] Approve or revise A-H 01's subject, laughter, home setting, light and photographic grade.
- [x] Approve desktop framing and the softer charcoal blending.
- [x] Approve or revise the tablet subject scale and fitted/faded background treatment.
- [x] Approve or revise the explicitly proposed mobile image-above-copy arrangement, including its additional vertical space.
- [ ] Resolve higher-resolution source and final delivery exports before any installation.
- [x] Proceed to A-H 02 after A-H 01 approval, as instructed by the existing production sequence.

**A-H 01 checkpoint cleared by the user’s visual approval.** A-H 02 was subsequently approved; A-H 03 was subsequently approved as recorded below. No photograph has been installed; supporting photography remains unproduced.

## A-H 02 — connected-family review

**Status: visually approved on 16 October 2026.** The user replied “yes, please” after the family review. This clears the visual checkpoint and authorises A-H 03 production under the existing sequence. Resolution and installation gates remain open.

[Open the local family review](http://127.0.0.1:3021/assets/review/template-a/a-h02-review.html), or use the [saved review page](../assets/review/template-a/a-h02-review.html). The original A-H 01 review remains at `index.html` with its approved status. Neither page changes the live website.

### Production, concept and provenance

A-H 02 illustrates a Nigerian family sharing one tablet: two parents warmly engaged with their school-age daughter's delight. Faces and attention form one coherent interaction. No separate devices, staged handshake, camera-facing corporate pose or service-performance claim has been introduced.

The built-in `image_gen` tool produced the original desktop scene using the approved A-H 01 photograph as a **lighting, material and colour reference**, not as a claim that its subject is a real customer or a member of this family. Independent medium and portrait compositions use the first family output as an identity reference. The desktop was then revised photographically to keep pale upholstery/trousers out of the text area, finishing with the existing brown throw resting naturally over the mother's knee. No programmatic pixel retouching or upscaling was used. The full [production prompt set](../assets/review/template-a/a-h02-production-prompts.md) records those steps.

These are AI-generated illustrative people and surroundings. No stock library licence, real customer identity, company employee, owned premises or model/property release is asserted. Their use remains subject to the owner's visual approval and the applicable generation-account terms. They must not be labelled as documentary photographs of Ikonectt customers or staff.

### Actual selected files

| File | Native dimensions / ratio | Composition and approval status |
| --- | --- | --- |
| [a-h02-connected-family-desktop-v3.png](../assets/review/template-a/a-h02-connected-family-desktop-v3.png) | 1672 × 941; approximately 16:9 | Compact family on the right, shaded wall/floor left, textured throw over the mother's knee. Visually approved; resolution pending. |
| [a-h02-connected-family-medium-v1.png](../assets/review/template-a/a-h02-connected-family-medium-v1.png) | 1448 × 1086; exact 4:3 | Independently staged family view, all three faces and the shared tablet retained. Visually approved; resolution pending. |
| [a-h02-connected-family-mobile-v1.png](../assets/review/template-a/a-h02-connected-family-mobile-v1.png) | 941 × 1672; approximately 9:16 | Independent close family grouping in the upper part, quiet charcoal foreground below. Visually approved; resolution pending. |

The [asset register](../assets/review/template-a/asset-register.json) now contains the three approved A-H 01 visual candidates and the three visually approved A-H 02 candidates. It records native dimensions, original generation filenames, byte sizes and hashes. Selected files match their generated originals byte for byte. Superseded desktop attempts are not current candidates; a [rejected 1024px proof](../assets/review/template-a/previews/a-h02-rejected-1024-v2.png) is retained to document the contrast problem.

**Resolution gate remains open:** the same tool limits apply. The preferred source targets of 3840 × 2160, 2400 × 1800 and 1440 × 2560 were not returned. The PNGs are native review files, not final 4K/high-density masters or compressed production exports. No upscaling was used to conceal that limitation. Approval of the scene is distinct from readiness to install it.

### Desktop, tablet and mobile composition

**Desktop:** the selected image fills the existing hero at 1440, 1280 and 1024px, using right/top positioning. The three faces and tablet stay on the right; the current heading, body and actions stay at their original coordinates. Shadowed charcoal wall, warm timber, neutral upholstery and true skin tones match the approved A-H 01 grade. The framing revision and brown throw solved the tighter 1024px contrast problem within the photograph rather than increasing the overall scrim. Compare [final desktop composition](../assets/review/template-a/previews/a-h02-current-1440.png) and [1024px composition](../assets/review/template-a/previews/a-h02-current-1024.png).

**Tablet:** the independent 4:3 scene uses the same fitted/faded treatment as the A-H 01 package: the upper-right 66% photographic field dissolves into charcoal, with original copy positions below/left. All three faces, the father's holding hand, the child's shared activity and the complete tablet remain visible. The smaller group avoids a headline across a face. See [768px proof](../assets/review/template-a/previews/a-h02-current-768.png).

**Mobile:** the portrait fits the **340px full-width image-above-copy arrangement approved with A-H 01**. The parents' faces, child's face and shared tablet remain above the HTML copy; cropping removes lower foreground/legs rather than a person or device. The image fades naturally into the same charcoal surface. Typography, exact wording, comfortable gaps, CTA order and destinations are unchanged. See [390px proof](../assets/review/template-a/previews/a-h02-proposal-390.png) and [320px proof](../assets/review/template-a/previews/a-h02-proposal-320.png). This remains a review mockup; the arrangement is not installed in the application.

The original mobile text-over-photo position is retained only for comparison. It fails contrast and crosses the family interaction, reinforcing the approved image-above-copy direction. It is not proposed for installation.

### Background integration and text safety

The final previews retain the A-H 01 scrim values: left charcoal approximately 46%, through 44% at 45% width, clear by 75%. Faces stay naturally illuminated. The tablet fitting uses soft edge masks and the existing charcoal token; mobile uses a shallow lower dissolve into the copy surface. There is no photographic card, visible border, opaque rectangular text panel or text baked into an asset.

[Desktop without the CSS scrim](../assets/review/template-a/previews/a-h02-photography-without-css-1440.png) isolates the photographic contribution. The comparative shadow/light treatment follows the same dark/light integration principles documented above for later templates; no B–E code or assets are changed.

### Responsive validation

[Measurements](../assets/review/template-a/a-h02-responsive-checks.json) record all requested widths, native sources, geometry, text rectangles and overflow. The [A-H 02 contrast results](../assets/review/template-a/a-h02-contrast-checks.json) use the same conservative background-only pixel analysis as A-H 01. Fonts were loaded before viewport screenshots, retaining the site's actual scrollbar width and text wrapping. No full-page screenshot resizing was used for the final proofs.

| Requested width | Treatment | Minimum contrast: eyebrow / headline / body | Finding |
| --- | --- | --- | --- |
| 1440 | Desktop v3, original copy positions | 5.66 / 16.09 / 5.58 | Pass; full family interaction and readable copy |
| 1280 | Desktop v3, original copy positions | 5.69 / 16.47 / 5.97 | Pass; readable composition |
| 1024 | Desktop v3, original copy positions | 5.49 / 3.89 / 5.44 | Pass; final photographic correction resolves body contrast |
| 768 | Medium v1, fitted background | 5.68 / 8.04 / 13.79 | Pass; faces/device clear of text |
| 390 | Portrait v1, approved mobile arrangement | 5.75 / 16.83 / 13.79 | Pass; family above the text |
| 320 | Portrait v1, approved mobile arrangement | 5.75 / 16.83 / 13.79 | Pass; native vertical scrolling retained |

The original mobile overlay comparisons fail: at 390px the minima are 1.00 / 1.39 / 2.18; at the smallest width 1.00 / 1.34 / 4.23. They remain rejected comparisons, not passing recommendations. All eight inspected states had no document horizontal overflow. Thresholds remain 4.5:1 for eyebrow/body and 3:1 for the large heading. This is local visual/raster QA, not a full accessibility, real-device or production-performance certification.

### Inspection and preserved functionality

- All three faces, expressions, hair and skin were inspected in the generated files and responsive proofs. The child and parents look toward one shared tablet, with consistent identities across the independently staged views.
- Visible hands, fingers, tablet edges and holding/pointing gestures were inspected. Some fingers are naturally occluded; no obvious extra limb or impossible device construction was observed in the selected candidates. Native-file owner review remains part of approval.
- No visible watermarks, logos, embedded headlines, service metrics, network beams or documentary customer/staff identifiers were observed.
- All selected native PNGs were checked for dimensions and original-output byte identity. A-H 01 photographic file hashes are unchanged after approval.
- The exact approved homepage words, font classes, header/logo, CTA labels and destinations are retained in the local mockups. No customer data is entered or submitted.
- Application sources, shared runtime/styles, production image files, packaged website, build scripts, plan catalogue, assistant, customer journeys and Templates B–E remain unchanged. No slideshow, new runtime dependency, production export, commit or deployment is included in this image review.

### A-H 02 approval checkpoint

- [x] Approve or revise the family scene, expressions, warmth and photographic grade.
- [x] Approve desktop text balance, including the tight 1024px crop.
- [x] Approve tablet fitting and portrait framing within the A-H 01 mobile arrangement.
- [ ] Resolve native source targets and final compressed exports before installation.
- [x] After A-H 02 approval, continue to A-H 03 under the existing one-image-at-a-time production sequence.

**A-H 02 visual checkpoint cleared.** The A-H 03 package below was subsequently visually approved. Supporting photography is unproduced; no new photograph is installed on the live site.

## A-H 03 — business collaboration review

**Status: visually approved on 16 October 2026.** [Open the local business review](http://127.0.0.1:3021/assets/review/template-a/a-h03-review.html). The user replied “approved” after reviewing the smartphone/shared-display responsive package. This clears the third visual checkpoint. Source-resolution, delivery exports and installation remain separate outstanding steps.

### Concept and device diversity

Two illustrative Nigerian professionals collaborate through a smartphone and a shared wall-mounted office display. A bright glass-and-steel commercial environment, cool daylight, city/greenery context and standing interaction distinguish this scene from the warm residential images. The smartphone is naturally held by the man; the woman refers to a fully framed shared display. There is no laptop in the selected scene.

The owner specifically requested different backgrounds after observing the similarity between A-H 01 and A-H 02, then asked us to avoid defaulting to laptops because internet access has many interfaces. Those directions supersede the initial A-H 03 laptop exploration. The approved residential photographs remain unchanged. Future supporting briefs should vary activity, architecture, camera position and device according to the story: phones, tablets, connected televisions, shared displays or other credible connected-home/work interfaces. Do not scatter devices decoratively or generate the deferred supporting assets yet. Existing written laptop suggestions in the preparation report are historical options, not a requirement to repeat one device everywhere.

### Production, source and usage

Produced with the built-in `image_gen` tool. The smartphone/display desktop was restaged from the commercial-office exploration; its full display framing was corrected, then the left smoked-glass corridor was darkened photographically to resolve desktop eyebrow contrast. Medium and portrait files are independently generated compositions using the same people/office as reference, rather than mechanical desktop crops. The [selected prompt set](../assets/review/template-a/a-h03-smartphone-production-prompts.md) records all smartphone/display prompts and output provenance. Earlier laptop files and their prompt log are superseded exploration, not submitted candidates.

These are AI-generated illustrative people and surroundings. No real Ikonectt customer, employee or company premises is represented, and no stock licence or model/property release is asserted. Applicable generation-account terms govern usage; owner visual approval is recorded below. Do not describe these as documentary company photographs. No programmatic pixel editing or upscaling was used.

### Selected native assets

| Asset identifier / profile | File | Actual native dimensions | Preferred source target |
| --- | --- | --- | --- |
| A-H 03 / desktop | [desktop v3](../assets/review/template-a/a-h03-business-collaboration-desktop-v3.png) | 1672 × 941, approximately 16:9 | 3840 × 2160; unmet |
| A-H 03 / medium | [medium v2](../assets/review/template-a/a-h03-business-collaboration-medium-v2.png) | 1448 × 1086, exact 4:3 | 2400 × 1800; unmet |
| A-H 03 / mobile | [portrait v2](../assets/review/template-a/a-h03-business-collaboration-mobile-v2.png) | 941 × 1672, approximately 9:16 | 1440 × 2560; unmet |

The [asset register](../assets/review/template-a/asset-register.json) records all nine selected hero files, dimensions, byte sizes, SHA-256 hashes and original generated filenames. The three A-H 03 copies match their generated originals byte for byte. All six earlier approved photograph hashes remain unchanged. These are review sources, below the preferred production-resolution targets; no 4K or final compressed-delivery claim is made.

### Placement, cropping and background integration

**Desktop, 1440/1280/1024:** full-bleed photo within the existing hero, right/top image positioning and unchanged HTML copy coordinates. The two faces, phone, important hands and whole shared display remain visible to the right of the headline. Dark smoked glass provides natural text space on the left. The final lighting correction preserves subject illumination and avoids increasing the CSS overlay to compensate for bright window reflections. See [desktop](../assets/review/template-a/previews/a-h03-current-1440.png) and [small desktop](../assets/review/template-a/previews/a-h03-current-1024.png).

**Tablet, 768:** independent 4:3 image in the upper-right 66% photographic field, with horizontal/lower edge masks into the existing charcoal surface. Both faces and the shared activity remain above the original text field. The lower headline crosses only the faded legs/foreground; it does not cover a face or device. See [tablet](../assets/review/template-a/previews/a-h03-current-768.png).

**Mobile, 390/320:** independent portrait within the approved 340px image-above-copy arrangement. Both faces, smartphone, gesture and full display are retained; the tighter view discards lower legs/quiet foreground rather than the shared activity. The image dissolves into the charcoal copy surface. The heading/body/actions retain their exact wording, styling, order and destinations, with normal vertical scrolling at small widths. Both CTAs remain available without horizontal overflow. See [390px](../assets/review/template-a/previews/a-h03-proposal-390.png) and [320px](../assets/review/template-a/previews/a-h03-proposal-320.png). This is still a separate static composition preview, not an application change.

The original mobile text-over-photo arrangement is available only as a rejected comparison: it fails contrast and overlaps the people. It is not recommended. Desktop CSS retains the approved charcoal gradient (46% left, 44% through 45%, clear by 75%), tablet uses fitted soft edge masks, and mobile uses a shallow lower dissolve. No image card, baked-in copy or opaque text panel is introduced. The [desktop without CSS scrim](../assets/review/template-a/previews/a-h03-photography-without-css-1440.png) separates the photographic shadow from interface blending. Future dark/light template guidance above still applies; no B–E work is included.

### Responsive and visual validation

The [geometry record](../assets/review/template-a/a-h03-responsive-checks.json) and [contrast record](../assets/review/template-a/a-h03-contrast-checks.json) document eight inspected states across the six requested widths. Fonts were loaded before viewport screenshots; browser scrollbar/device scaling yields actual inner widths of 1281 and 321 in some requested 1280/320 states. All eight states had no document horizontal overflow. Contrast is conservatively measured across entire text-line rectangles in background-only screenshots, using thresholds 4.5:1 for small text and 3:1 for the large heading.

| Requested width | Recommended treatment | Minimum contrast, eyebrow / heading / body | Result |
| --- | --- | --- | --- |
| 1440 | Desktop v3 / existing copy | 5.15 / 14.07 / 12.21 | Pass |
| 1280 | Desktop v3 / existing copy | 5.72 / 15.08 / 12.06 | Pass |
| 1024 | Desktop v3 / existing copy | 4.95 / 14.35 / 12.43 | Pass |
| 768 | Medium v2 / fitted background | 5.68 / 4.01 / 13.79 | Pass |
| 390 | Portrait v2 / approved mobile arrangement | 5.75 / 16.83 / 13.79 | Pass |
| 320 | Portrait v2 / approved mobile arrangement | 5.75 / 16.83 / 13.79 | Pass |

The rejected original mobile overlay records minima 1.00 / 1.18 / 1.89 at 390 and 1.00 / 1.15 / 2.13 at 320. These failures remain visible in the evidence, separate from the six passing recommendations. This is local raster/visual QA, not a full accessibility, physical-device or performance certification.

Faces, visible fingers, phone construction, gesturing hand, screen frame and office perspective were visually inspected at native size and in responsive compositions. No obvious extra limb, embedded word/logo, watermark or service-performance claim was observed. Display content is illustrative project imagery/colour tiles; it does not represent a working Ikonectt product or interface. Minor pose/architectural variations across independently generated views remain for owner review. The source-resolution target is still an outstanding concern.

### Preservation and checkpoint

All work remains in the local review directory and this report. Existing application files, official logo, typography, homepage text, CTA destinations, plans, navigation, support assistant and customer journeys remain unchanged. Templates B–E are untouched. No slideshow, production export, application build, commit, push or deployment is part of this review. Existing runtime tests were not rerun because no runtime code changed; validation covers the actual new review artifacts.

- [x] Approve the distinct office setting, smartphone/display interaction, faces and photographic grade.
- [x] Approve the desktop/tablet text balance and mobile framing.
- [ ] Resolve higher-resolution source and final delivery exports before installation.
- [ ] Receive explicit authorisation for the later installation/slideshow stage.

**All three hero visual checkpoints cleared.** A-H 01, A-H 02 and A-H 03 are visually approved, including their presented responsive composition packages. Higher-resolution sources and final delivery exports remain outstanding before installation. Supporting photographs and slideshow implementation are deferred; the live website remains unchanged.
