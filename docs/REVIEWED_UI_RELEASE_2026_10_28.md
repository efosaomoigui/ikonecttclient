# Reviewed A/E UI release — 28 October 2026

This Git update packages the locally reviewed A/E refinements: approved plan-card layout across inner pages, supplied photography and red-cushion edits, E's city/photo slideshow and grounded signal source, compact A hero, rooftop benefit backgrounds, grey E plan-section background, consistent small-card icons, and removal of repeated review notes. Local preview routing, self-hosted fonts and vendored motion libraries are included.

The client authorised pushing the reviewed UI to GitHub after local review. No standalone deployment command was used.

Validation before push:

- All 183 automated tests passed.
- A TypeScript check passed.
- A production build passed and was copied into its packaged preview directory.
- Packaged A and E passed local browser checks for imagery, plans, copy cleanup, icons and mobile layout, with no missing asset responses or page exceptions.
- Earlier route checks cover all 29 routes in each active template. Current browser evidence is under `docs/evidence/general-polish`.

Supplied image originals and edited-photo master/prompt records are retained. Temporary working files and unused older image drafts are excluded from this release. Archived B/C source and UI changes are outside its scope.
