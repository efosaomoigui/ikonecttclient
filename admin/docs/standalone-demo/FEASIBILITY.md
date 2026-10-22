# Admin standalone demonstration — Stage A findings

22 October 2026. Read-only inspection completed before implementation. Approved source baseline is `3b0060c5dcdc0df121cc4aa7dd95ab796edd62a2`, including the approved themes, accordion/active-parent navigation, single simulation banner and gray independent scrollbar.

**Feasible without a new backend or major architecture change.** Implement in this isolated managed worktree/branch `codex/ikonectt-admin-standalone-demo`, without changing or restarting the consolidated environment.

## Existing capability

- Review the application offers ADMIN, SUPPORT, SALES, FINANCE, PROVISIONER and EXECUTIVE.
- `WorkspaceApi.preview(role)` creates a clearly simulated in-memory principal and role permissions, resets fictional fixtures and bypasses HTTP only within explicit mock branches.
- Core lists/details, filtering/pagination, catalogue/coverage, sample customer/order CRUD, order-payment reporting/verification, separate manual provisioning, support replies/status and basic reports have local paths.
- Wallet summaries/ledger/top-up/renewal records can be read locally. Financial wallet mutations deliberately reject in preview; keep this read-only boundary rather than pretend they succeeded.
- Memory resets on exit/reload/re-entry; theme preference is the only saved preference. No actual auth sessions/customer database are needed for preview.
- Approved UI/theme files, fonts/logos and hash navigation already build with Vite. Normal production currently hides preview; review mode enables it.

## Gaps and smallest changes

1. Add explicit `demo` build mode with separate `dist-demo` output and a compile-time standalone flag. Keep normal `build`/live transport unchanged.
2. Guard `WorkspaceApi.request` before transport for the standalone artifact, irrespective of mutable runtime mode. Do not add network-failure fallback. This covers sign-in, recovery and unimplemented calls as well as preview screens.
3. Disable credential entry/submission on standalone login/recovery/setup and guide visitors to the existing role entry. Keep approved visual structure.
4. Preserve role-specific navigation and supported actions; keep backend-required wallet actions honestly read-only. Clarify that this independently stateful frontend does not share a database with the separately hosted customer demo.
5. Align dedicated fictional A/B examples in demo-only fixtures where practical: Ada Okafor residential expired service/NGN30,000 available/NGN19,500 renewal; Meridian Studio business active service/NGN0 available. Real/dev fixtures remain unchanged.
6. Package under `dist-demo/admin/` so existing `/admin/` asset/base paths work without stylesheet/logo rewrites. Include demo-only noindex/robots/CSP headers and `admin/vercel.json` with root redirect to `/admin/`. No API proxy or backend hostname is needed.
7. Refresh/deep-link routes should load the entry again with reset sample state; permitted hash route can reopen after role selection. Do not persist simulated tokens or masquerade as live authentication.

## Risks and verification

- A review build alone is insufficient: login/recovery can still call the real transport, and production currently removes entry. Use explicit demo guard plus compiled-artifact tests with a throwing fetch spy.
- Demo CSP should prevent connections/forms; allow only local static script/font/image/style assets needed by the existing app. Validate real browser console, all six roles, every permitted major screen, refresh/deep links and both themes.
- Vercel project root must be `admin`, command `npm run build:demo`, output `dist-demo`; never replace the integrated build artifact. Production build must still exclude the preview entry and retain real error/session behaviour.
- No provider/credential/database operation, no integrated runtime restart, no production deployment or unrelated merge is required.
- Public noindex is not access control. Configure Deployment Protection for the separate preview project when deployment is later authorized; settings/access entitlement must be confirmed then.

References: [Vercel static configuration](https://vercel.com/docs/project-configuration/vercel-json), [Deployment Protection](https://vercel.com/docs/deployment-protection). No deployment has been performed.
