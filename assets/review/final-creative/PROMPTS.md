# Final creative image production

26 October 2026. Built-in `image_gen` tool, not CLI. Source masters here are excluded from deployment by the existing `assets/review` packaging rule. Responsive, non-upscaled WebP exports are under `assets/visual-library/creative/`. Original files and all official wordmark assets remain unchanged.

## City retouch: `lagos-clean-v1.png`

Input edit target: `assets/review/phase-3/lagos-skyline.jpg`, Clara Sanchiz, CC BY-SA 2.0. The derivative retains that licence. AI-assisted retouching also changes some photographic detail; it must not be represented as an untouched documentary image. Output native dimensions: 1725 × 912.

Prompt:

> Use case: precise-object-edit. Edit target: the supplied full-resolution Lagos skyline photograph. Create a faithful professionally retouched version, preserving the entire camera view, all buildings, sky, roadway, perspective, natural photographic textures, original light and architectural details. Remove every conspicuous third-party corporate brand, advertisement and word/sign from the architecture: especially the large blue Union Bank horse emblem on the tall left tower, lettering on its roof, the NATI billboard and food advertising, UAC circles/words, and any other commercial signs or company names. Replace each sign area seamlessly with plausible matching plain facade material, panels, windows or clean blank architectural surfaces; retain real details and avoid any blur patches, smears or dark painted rectangles. Do not add any Ikonectt branding, text, icons or network decorations. Do not change the scene to a different city, time, camera position or building arrangement. Keep this as a high-quality real city photograph with subtle local retouching only. Preserve the wide 3726:1970 composition; output at the highest available resolution, ideally at least 3000 pixels wide. No watermark.

## Commercial architecture: `commercial-architecture-v1.png`

Original generated illustration, not a photograph of verified company premises or an identified bank. Output native dimensions: 1086 × 1448. This replaces the exact tower image identified by the client, rather than merely concealing the sign.

Prompt:

> Use case: photorealistic-natural. Asset: a premium vertical commercial architecture photograph for a Nigerian fibre broadband website, to REPLACE a specific branded green-glass tower photograph entirely. Generate an original believable contemporary commercial office building in Lagos-inspired urban surroundings, not a replica of any identifiable landmark or bank building. Architecture: elegant broad charcoal and bronze glass facades, horizontal floor bands, pale stone podium, a few restrained tropical palms and a clean urban approach. No central spire, no green-glass pointed tower, no Union Bank building, no Civic Centre Towers. Camera: refined architectural photography from street level looking gently upward, realistic straight vertical lines, full building silhouette visible in portrait 3:4 composition. Soft late afternoon daylight with subtle warm interiors, physically plausible materials and window reflections, crisp but not oversharpened. Building sits centrally/right, generous subdued sky at top and left so existing website text overlays read naturally. Lower part can blend into a dark burgundy scrim without losing essential facade details. No people necessary. NO letters, signs, company names, logos, billboards, watermarks, network graphics or UI. High-quality commercial photographic realism, not futuristic CGI or an AI fantasy skyline. Output the highest available resolution, portrait.

## Official brand symbol

`assets/brand/ikonectt-i-mask.png` is deterministic asset preparation from the supplied `assets/logos/iKonectt Logo Color Variants.png`, crop x91/y240/w59/h221. Red coverage supplies the alpha mask. The official dot-and-lightning geometry is preserved without a font, tracing, distortion or generated logo. It is used only as an aria-hidden, non-interactive watermark. The primary wordmark is untouched.
