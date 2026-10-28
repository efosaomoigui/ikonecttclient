# Client photography — local review

The authoritative people-photo folder is:
C:/Users/Efe-Dev/Documents/business News/ikonectt/Ikonectt_Connectivity_Image_Library/newimages

Only client-supplied photographs were used. No imagery was generated or content retouched. Six originals were inventoried and left byte-identical; proportional WebP exports and one documented family portrait crop are stored separately. Existing assets remain available.

## Installed placements

| Supplied file | Placement |
| --- | --- |
| Family_using_tablet_together_1ab2422c.jpg | A hero, fourth slide. Original Residential, Connected Family and Business Collaboration slides remain in their original order. |
| Family_using_tablet_together_1b1ddf84.jpg | E Residential top hero. |
| image.png_5d67509c.jpg | A homepage Residential tile; E Residential editorial section. |
| make_the_stand_suit_guys_20261027180922.jpg | A homepage Business tile, replacing the standing pair in this supporting tile; E Business editorial section and SME hero. |
| Men_playing_video_games_together_467cdb85.jpg | A Residential editorial section. |
| Red_acrylic_emblem_on_table_22960efd.jpg | Catalogued and visible in the review gallery; reserved for a suitable brand/editorial placement. It does not replace the official logo. |

A's approved My Ikonectt man and E's approved woman remain. E's homepage city, network, room and architecture photographs remain. No plan data, customer journeys, validation, support engine, escalation or session handling changed.

## Vivid image treatment

E's internal hero and editorial photographs now retain full opacity and natural colour, with one narrow transition at the text edge. Broad stacked white scrims and lower fades have been removed. On mobile, scenes are displayed clearly beneath the text, with only a short edge blend. The portal woman's photograph is clearer. The city photograph is brighter while its dark text scrim, oval opening and slower signals remain.

All images remain flush with their image fields. Source-specific object positions keep heads clear. Responsive checks include the portrait family crop and gaming photograph's upper edge.

## Images to design next

These are useful next additions; no placeholder people photos were generated.

| Priority / position | Suggested scene | Composition |
| --- | --- | --- |
| 1 — future A solo-home hero alternative | Individual using a phone at a kitchen counter, window seat or terrace; a different setting from the existing sofa scene. | Wide image, subject in right half, left 40% calm for the headline. Separate close mobile composition. |
| 1 — future A family hero alternative | Connected family enjoying a television or smart-home activity in a distinct room. | People together on the right; retain the room and a small natural red detail. Avoid repeating the current couch. |
| 2 — My Ikonectt alternative | Individual checking an account on a phone or tablet in a distinct environment. | Subject on the right, quiet space on left. This would let us vary the account photography later. |
| 2 — support/contact | Friendly support professional or team helping a customer by phone. | Clear expressions and hands; room context; right-side subject for desktop. |
| 2 — installation/coverage | Technician assisting at a home entrance or checking equipment in a neighbourhood. | Realistic full scene with a simple left text-safe area; landscape plus a closer mobile version. |
| 3 — enterprise/SME variety | A small business owner, retail team or professionals in a different workplace from the conference room. | Different devices and a small red accent; enough surrounding space for cropping. |

For wide heroes, aim for at least 2560 × 1440px. Supporting landscape scenes work well at 2000px wide or higher. A mobile crop around 1200 × 1500px is useful when the group cannot fit a landscape crop. Keep full furniture/environment context and avoid baking headings, prices or decorative campaign graphics into the photo.

## Local review

- Gallery and placement map: http://127.0.0.1:3021/assets/review/client-library/index.html
- A live source preview: http://127.0.0.1:3001/?review=client-library#/home
- E Residential: http://127.0.0.1:3021/public_html/option-e/?review=vivid-library#/residential
- E homepage: http://127.0.0.1:3021/public_html/option-e/?review=vivid-library#/home

A is served by Vite on port 3001 so these source changes can be reviewed without a production build. The older compiled A snapshot on port 3021 has not been regenerated. E's native files were copied directly into its local preview.

Validation: the existing 177-test suite passed. Two additional image-library tests passed, verifying original hashes, export limits and preservation of the three original A hero profiles. The affected campaign tests also passed after the final crop adjustment. Real-browser checks passed at 1440, 1280, 1024, 768, 390 and 320px, with no failed requests, browser exceptions or page overflow. Coverage navigation, plan-card presence, fourth-slide wraparound and photo decoding remain functional.

Evidence: docs/evidence/client-library/local/. Asset export records: assets/review/client-library/exports.json.

Nothing was built for production, pushed or deployed.

## Connected design preview correction

The normal local A entrypoints now redirect to the current live source when the showcase server is launched with IKONECTT_A_DEV_URL=http://127.0.0.1:3001/. This corrects the older compiled preview remaining visible in the existing A tab and design selector. Without that optional environment setting, packaged/static delivery stays unchanged.

A local-only page-context bridge preserves the current route when switching A and E across the two development-server origins. Browser verification covers the original A entrypoint, the selector iframe, the supplied fourth hero slide, new photo tiles and Residential route preservation in both directions. Seven targeted tests passed. Evidence: docs/evidence/client-library/local/connected-preview-checks.json.

To see the new family immediately from the first A hero slide, use the previous-slide arrow: the new photo is slide four. The conference-room photo appears in the homepage Business section.
