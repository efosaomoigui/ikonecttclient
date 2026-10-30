# Portal SPA navigation correction

21 October 2026. The authenticated sidebar, header and main element now remain mounted across route changes. Only the main content is replaced after the new page's data is ready. A small header status announces loading; existing content stays visible and becomes temporarily inert to prevent submitting a previous page's form during navigation. Errors remain inside the main content and keep navigation available.

Shell controls are bound once per mount, and new content controls once per page. Current-section clicks still refresh live data. Route generation checks prevent an earlier request from overwriting a later navigation, and the live adapter protects its cached snapshot from out-of-order completion or reuse after logout/sign-in.

Live navigation still validates the server session and profile. It then refreshes the resources needed for the selected section: services/orders, billing/payments/receipts, support tickets or notifications. Overview retains its complete summary. Other route-specific requests continue through the existing canonical client. Cached unrelated sections are not substituted for a failed live request; mock mode remains explicit. There are no API schema or backend changes.

Validation: **17 tests passed, 0 failed**, strict type checking passed, live and mock builds passed, whitespace check passed. New DOM regression tests verify persistent node identity/event handlers and the loading state; the HTTP test verifies fresh staff ticket data with only session/profile/ticket requests for the support list. `jsdom` is a development-only test dependency.

Actual browser smoke on the refined preview at port 4185 verified services, billing/receipt, support/conversation and profile; rapid Support → Profile navigation displayed the latest requested page; mobile navigation opened once and closed after the route loaded, with no horizontal overflow at 390px. An unknown order returned its real API error inside the preserved shell and navigation recovered to Overview. Existing development records were read without creating orders, payments or tickets. Session-expiry, mandatory-password and 401 credential-clearing tests remain passing. Screenshots are kept in ignored `.local/spa-navigation-desktop.png` and `.local/spa-navigation-mobile.png`.

The full loading view remains only for initial authenticated bootstrap when no account shell exists. The approved visuals, compact public login/footer and truthful simulated-record notices are preserved. No merge to main or deployment is included.
