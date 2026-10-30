# Unified website and application presentation — 30 October 2026

The client authorised combining the latest A/E branding corrections and the existing Admin/customer demonstrations on main, using the existing stable Vercel project and domain.

The root two-design selector remains exactly the approved 70ae105 version. Both templates retain the new red hero mark, branded coverage locator, compact coverage heading and lowercase ikonectt text. Existing My ikonectt links/buttons open `/my-ikonectt/#/` in a separate tab at the customer welcome home. A secondary Admin link opens `/admin/` in a separate tab. Desktop and mobile navigation both retain these links.

The app source and packaging were imported selectively from presentation/vercel-demo f7e122f; the obsolete four-card landing was not imported. No real backend, database, payment or ISP integration is introduced. Demo state is isolated and resettable. Existing app restrictions and explicit demo providers are retained.

The root Vercel build now uses `build:presentation`, installs both app dependencies and generates both app paths with their scoped static security headers. There is one maintained production branch and one existing stable domain; older preview deployment URLs are not the main client link.

Validation: unified build passed; 187 website tests, 64 Admin tests and 38 customer tests passed. Artifact checks verified no embedded local API origins or secret patterns. A local HTTP check verified all five entry paths, assets, private-path exclusions and application policies. Actual browser clicks in both templates opened separate customer and Admin tabs while leaving the website open; mobile links and no-overflow checks passed. Evidence: `docs/evidence/unified-release/browser.json`.

Release destination: https://ikonecttclient-kappa.vercel.app/option-a/#/home
