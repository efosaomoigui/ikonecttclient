# Ikonectt Admin

Staff frontend, isolated from the public website and My Ikonectt. Branch: `codex/ikonectt-admin-crm`.

Stage 2 is integrated with the persistent development API. Use the ordinary staff sign-in form and the backend-owned local role accounts for real HTTP/database workflows. The optional simulated workspace remains separate. See [Stage 2 integration report](STAGE2_INTEGRATION_REPORT.md) and [redacted live acceptance results](docs/stage2-live-acceptance.json). No production deployment was performed.

## Run and test

From the repository root:

```powershell
npm ci --prefix admin
npm run dev --prefix admin
```

Open <http://127.0.0.1:3013/admin/>. Choose a role and **Open simulated workspace**. This development-only workspace uses in-memory sample data. Signing out or reloading resets it. It does not sign in to the backend or send sample changes to a server.

```powershell
npm test --prefix admin
npm run build --prefix admin
```

`npm test` builds the review version and runs schema, transport, permission, workflow and DOM tests against the current bundle. `npm run build` produces `admin/dist/` with simulation entry controls disabled. `npm run build:review` explicitly builds a sample-data review version; do not deploy it to production.

## Manual acceptance walkthrough

1. Enter as **Admin**. Open all navigation groups. Search Customers for `Meridian`, open the record, and inspect its related services, orders, support and external references.
2. Create a customer using a test address ending in `example.test`. Confirm the permanent UUID and the sample account number are separate fields. Edit permitted contact information and account status.
3. Open Leads, change a lead to Contacted, then use Create customer from lead. After creating the customer, edit the lead and select that customer to link it. Enquiries share this queue; they do not need a separate duplicate module.
4. Edit a sample plan. Verify price is entered in **kobo**, features are one per line, and published status is explicit. The sample plans start as drafts. Publish a residential sample plan before creating a residential sample order.
5. Open Coverage. The six sample locations show the full Nigeria hierarchy. Create a State under Nigeria; the parent selector only offers the preceding level. Edit building eligibility and eligible plan IDs. UNKNOWN means it needs review.
6. Open Payments, then `SAMPLE-TRF-1`. Review the sample reported evidence, select Confirm, enter verification evidence, tick the authorization checkbox and record the decision. Confirm the related order becomes Paid. Check that no subscription has activated. The confirmed record now offers a receipt.
7. Open Provisioning and create a request for the paid order ending in `0040`. It starts Pending. Open the request and record an evidenced Active manual result. Verify the service becomes Active and the order Completed. Sample data remains labeled simulated throughout.
8. Create a support ticket for an existing customer, send a reply, assign a staff ID, and move it through In Progress to Resolved or Closed. Messages are customer-visible; the interface does not offer private staff notes.
9. Under Staff & Roles, create a sample staff record and select one or more shared backend roles. Try disabling the only administrator: the simulator refuses. Inspect Settings for the permission matrix, Integrations for provider modes and Audit Logs for changes.
10. Sign out and repeat as **Support**, **Sales**, **Finance**, **Provisioner** and **Executive**. Support cannot create customers, verify payments or manage staff. Finance can verify payments. Executive has reporting access. Directly visiting a forbidden hash route displays an access error.
11. Test the browser at 320, 390, 768, 1024 and 1440 CSS pixels. Check mobile navigation, horizontal table scrolling, form labels, dialog focus, Escape dismissal and keyboard navigation. Browser visual QA remains a manual acceptance task; automated DOM tests do not measure rendered layout.

## Connect Agent 1's backend

The default dev proxy sends `/api/v1/*` to `http://127.0.0.1:4000`. Start Agent 1's existing backend and PostgreSQL according to its README. This frontend does not create a backend or database and ships no staff credentials.

For a different backend origin, set `IKONECTT_API_ORIGIN` before starting Vite. In production, mount `admin/dist/` at `/admin/` and reverse-proxy `/api/v1/` to the approved backend on the same origin using HTTPS. The public showcase's root build is deliberately unchanged; the Admin package builds independently and must be added to the deployment assembly when the three branches are integrated.

Staff login calls `/api/v1/auth/staff/login`; permissions come from `/admin/permissions`. Bearer tokens stay in memory. Logout calls the revocation endpoint. Forced password change uses `/auth/change-password` and returns to sign-in. There is no refresh-token endpoint or browser token persistence.

`vendor/contracts.ts` is a snapshot of Agent 1's `contracts/index.ts`. `vendor/permissions.ts` is generated from Agent 1's backend access definitions. `vendor/provenance.json` records the pinned release commit and SHA-256 hashes; `vendor/operations.json` records the supported OpenAPI operations. To update after Agent 1 publishes a change:

```powershell
npm run sync-contracts --prefix admin -- 'ABSOLUTE_PATH_TO_AGENT_1_OR_MERGED_CHECKOUT' 4f90e10fbdb9e04fb606109ac5ff3d81145ba18e
npm test --prefix admin
npm run build --prefix admin
```

Live permissions always come from the server; the generated role matrix supports simulation and the explanatory settings view. Backend guards remain authoritative for every request.

## Contract boundaries

The current API supports customer creation and a one-time setup token, current plans, coverage, leads and customer linkage, orders, manual payment reports/verification, receipts, provisioning requests/results, tickets/messages/assignment, staff roles, reports, audit and external references.

It does not support lead assignment/notes/follow-up scheduling/source metadata, ticket categories/priorities/private notes, editable operational settings, custom permission definitions, or provider credential configuration. These features are identified as unavailable in the interface. No competing domain model, price-versioning system, page builder, gateway or autonomous support agent is introduced.

Lists exhaust the API's offset/limit pages and apply search/filter/pagination locally because the current list contracts do not expose server search. Large datasets will need a backend search/filter contract before this approach should be scaled.

## Stage 2 live acceptance

The existing Vite proxy and the backend must be running. The explicit live test command reads local credentials in memory, preserves shared role passwords/fixture records, and creates isolated SIMULATED acceptance records in the helper-owned development database:

```powershell
npm run test:live --prefix admin -- --accounts 'ABSOLUTE_PATH_TO_BACKEND/.local/development/accounts-ikonectt_development.json'
```

Do not use production or unrelated account manifests. Runtime results are written to ignored `admin/test-results/`; no passwords or setup/session tokens are written to the report. Recovery/reset controls and notification metadata views now use the shared backend. New setup tokens may be issued from an authorized customer's detail dialog after explicit confirmation. The dashboard uses `/admin/reports/summary` for roles with report access and permitted backend lists for other roles.
