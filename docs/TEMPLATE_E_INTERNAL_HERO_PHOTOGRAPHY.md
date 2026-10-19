# Template E — internal hero photography

19 October 2026. Local implementation only; nothing pushed or deployed.

The remaining abstract internal-page headers now use relevant photography with the existing Residential hero's treatment: a seamless left-to-right burgundy fade, bottom scrim, aligned HTML heading and description, and a stacked 220px image field on phones. There are no rectangular image cards. Existing Residential, Business, Installation and About photography is retained. The homepage and its real-time network are unchanged.

Review correction: Coverage uses the real licensed **Lagos skyline** street photograph by Clara Sanchiz (CC BY-SA 2.0), already present in the library. The generated neighbourhood was rejected as too artificial and is retained only as an unused historical concept. Terms and Conditions uses a quiet document-and-pen still life, replacing the rejected cable image. Privacy and account pages retain the customer-phone image.

## New imagery and page assignments

Five original images were created with the **built-in image_gen tool**, using the imagegen skill, including the retired neighbourhood concept and the later legal-document still life. The scenes are illustrative; they are not photographs of verified coverage, Ikonectt employees, customers, premises or legal documents. That provenance is recorded on E's separate Photo credits page, without captions over the images.

| Image | Pages | Composition / crop |
|---|---|---|
| Existing `lagos-skyline` photograph | Coverage, Results, Address Verification | Real Lagos street/architecture, natural lighting and ordinary city detail; same burgundy hero blend; generated neighbourhood retired |
| `support-adviser-v1` | Support, FAQs, Service Request, Contact Support, Contact | Nigerian adviser with a headset; right-side subject and open left area; desktop focal position 75% 15% protects the face/hair |
| `connected-home-plans-v1` | Residential Plans, plan details, Compare Plans | Nigerian couple sharing a tablet in a dining area; a different setting and interface from the existing homepage; desktop focal position 75% 25% |
| `customer-phone-v1` | My Ikonectt sign-in, password recovery, portal preview, Privacy | Nigerian customer with a smartphone; right-side composition, no readable screen or fake security graphics; focal position 75% 15% |
| `legal-documents-v1` | Terms and Conditions | Person-free paper documents in a burgundy folder with an unbranded pen; no cables, readable legal wording, signatures or company-document claim |

Business Plans and Quote reuse the existing contemporary workplace photograph. Troubleshooting and Report a Fault reuse the existing network patch-panel photograph. Existing Business solution heroes retain their architecture photograph.

The definitive mappings live in `option-e/visual-map.js`; generated asset metadata and focal positions live in `option-e/hero-photos.js`. All 29 internal routes receive exactly one decorative photographic hero. Photos are outside forms, pricing cards, FAQs and authentication fields. All wording, form validation, support journeys, catalogue and prices remain unchanged.

## Saved assets and prompts

- Runtime files: `option-e/images/internal/` (20 responsive WebP exports, including the four unused neighbourhood variants).
- Native originals: `assets/review/template-e-internal-heroes/` (initial four 1672 × 941; Terms still life 1672 × 940).
- [Exact generation prompts and mode](../assets/review/template-e-internal-heroes/prompts.json).
- [Terms image prompt, mode and export record](../assets/review/template-e-internal-heroes/legal-documents-v1.json).
- [Export dimensions, paths and byte sizes](../assets/review/template-e-internal-heroes/exports.json).

Each image has 480, 800, 1280 and 1600px variants, with no upscaling. Exact file sizes are listed in the export records. The browser selects one appropriate variant through `srcset`; images decode asynchronously. Only the active route's hero is requested eagerly at high priority. Native originals are in the existing review directory excluded from the public build. No external image service or new runtime dependency was added.

## Validation

- All **142 tests passed** (46.85s), including preservation of A, D, selector/shared sources, all 29 inner hero routes, original headings/descriptions, local responsive files, decorative image semantics, existing form/privacy behaviour and the homepage network controller.
- **24 live browser checks** covered Coverage, Support, Residential Plans and My Ikonectt at requested widths 1440, 1280, 1024, 768, 390 and 320px. The browser rounded two widths to 1281 and 321px. Every check found loaded images, the photographic hero treatment, no horizontal overflow and no image inside a form or plan card.
- Desktop and mobile crops were visually reviewed, including adviser hair/face visibility, both tablet users, the account customer's phone and the neighbourhood's seamless fade.
- `npm run build` passed; final E assets and modules are packaged in `public_html/option-e/`. Build-only regenerated B/C artefacts were restored.

[Responsive check data](evidence/template-e-inner-heroes/responsive-checks.json).

The follow-up Coverage/Terms correction passed all 10 focused Template E tests and the production build. Four browser checks (both pages at 1440 and 390px) confirmed loaded images and no horizontal overflow. [Correction check data](evidence/template-e-inner-heroes/review-correction-checks.json).

The subsequent document-and-pen Terms replacement passed the 10 focused tests and desktop/mobile checks. Its static modules and responsive files were copied into E's packaged output and verified locally; the global build was not rerun for this final image-only substitution. [Terms image checks](evidence/template-e-inner-heroes/terms-documents-checks.json).

## Preview and screenshots

Local preview: http://127.0.0.1:3021/public_html/option-e/#/coverage

| Page | Desktop | Mobile |
|---|---|---|
| Coverage — real photograph | [Screenshot](evidence/template-e-inner-heroes/coverage-real-desktop.png) | [Screenshot](evidence/template-e-inner-heroes/coverage-real-mobile.png) |
| Terms — documents and pen | [Screenshot](evidence/template-e-inner-heroes/terms-documents-desktop.png) | [Screenshot](evidence/template-e-inner-heroes/terms-documents-mobile.png) |
| Support | [Screenshot](evidence/template-e-inner-heroes/support-desktop.png) | [Screenshot](evidence/template-e-inner-heroes/support-mobile.png) |
| Residential Plans | [Screenshot](evidence/template-e-inner-heroes/plans-desktop.png) | [Screenshot](evidence/template-e-inner-heroes/plans-mobile.png) |
| My Ikonectt | [Screenshot](evidence/template-e-inner-heroes/account-desktop.png) | [Screenshot](evidence/template-e-inner-heroes/account-mobile.png) |
