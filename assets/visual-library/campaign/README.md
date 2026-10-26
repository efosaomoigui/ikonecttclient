# Client campaign photography

Current treatment: opaque photographs with seating and room context, with flyer advertising removed.

- `client-family-scene-v2-*`: original campaign family in a sofa/room composition, in A and E's existing Residential editorial sections.
- `client-individual-scene-v2-*`: original man, phone and red chair in a room composition, in A's existing My Ikonectt panel.
- E's My Ikonectt panel retains the approved woman with her laptop.

The people are original visible source pixels; obscured surroundings are rebuilt with generated room-only photographic plates. No people or hidden anatomy are generated. These are composites, not untouched original-location photographs. Installed files have no transparency. Small perimeter fades blend the photographs into each template's surface while retaining the room context.

Source flyers, intermediate mattes, room plates, opaque PNG masters, prompts and `scene-exports.json` are in `assets/review/client-campaign/` (excluded from production). Native scene sizes are 640×320 and 480×330. Lossless exports preserve every fully opaque native subject pixel. The small flyer sources still limit subject sharpness.

The v1 cutouts are superseded authoring intermediates; they are not the active website photographs. References are in `shared/campaign-assets.js`. Reproduce compositions with `scripts/prepare-client-campaign-scenes.cjs` using the bundled workspace Sharp runtime.

Flyer prices differ from the website catalogue. Commercial data is unchanged. See `docs/CLIENT_CAMPAIGN_PHOTOGRAPHY_INTEGRATION.md` for scope, limits and previews.