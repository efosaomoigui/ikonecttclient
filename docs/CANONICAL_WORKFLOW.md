# One Ikonectt working copy and release flow

The authoritative checkout is `C:/Users/Efe-Dev/Documents/business News/ikonectt`, on `main`. The frontend and publishing chats now use that checkout. The old Option E worktree preview is stopped; it is retained only as recoverable history.

Edit `option-e/` and `shared/`. Do not edit or manually synchronize generated copies. `dist-public/` is the current generated public artifact; `public_html/` is historical showcase output, not the public release source.

## Commands

- `npm test`: builds the standalone public artifact and runs the test suite.
- `npm run dev`: rebuilds the public artifact with the existing isolated Admin/customer demos, using the same build option as Vercel, then serves it on port 3000.
- `npm run build:public-demo`: rebuilds that artifact after edits. Restart the server when changing server code. The local server sends `Cache-Control: no-store` so reviewed styles do not linger in browser cache.
- Preview: http://localhost:3000/option-e/
- Publish from this checkout by committing the checked changes on `main` and coordinating one push. Do not force-push or publish a different worktree's files.

## Reconciliation on 12 November 2026

The original checkout was at `b10c760`, while the publishing worktree had already pushed `7e26641` to `origin/main`. All dirty and untracked work was backed up outside the repository before the original checkout was fast-forwarded. The overlapping pre-sync state remains in a recovery stash; it was not blindly reapplied over newer files.

The latest user-requested flush audience sections and the device strip between Home and Business were preserved. Existing unrelated changes, legacy generated files and evidence were not discarded or included indiscriminately in the new commit.

## Missing testimonials

The section previously depended on a localhost-only review-data fetch. Approved customer quotes are still absent, so the public build omitted it. Option E now renders the same testimonial section locally and publicly, with a truthful empty state until approved quotes are supplied. Illustrative samples are not published as genuine customer endorsements; approved records still render normally.

## Latest visual adjustments

- Device image slots and label sizes/positions are preserved; only the image artwork is scaled down to 90%. All labels share the same baseline.
- The strip has the heading “More ways to stay connected.”
- Inactive homepage plan price ribbons and primary buttons use the same charcoal as the audience buttons. The active card retains red; colours update as the carousel selection moves.

## Verification

All 197 tests passed. The rebuilt publishing artifact was inspected at 1440, 1024, 768, 390 and 320px: all intended sections present, correct audience/device order, aligned labels, 90% artwork size, correct active/inactive plan colours before and after scrolling, no page overflow or failed asset responses, and working isolated application entry points.

Local review screenshots and detailed checks are under `docs/evidence/canonical-sync/`. Root `AGENTS.md` records these working-copy rules for future agents.
