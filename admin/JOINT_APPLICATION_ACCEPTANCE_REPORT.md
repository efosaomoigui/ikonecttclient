# IKONECTT - JOINT APPLICATION ACCEPTANCE REPORT

Status: IN PROGRESS - human reports setup complete; connected portal sign-in pending verification. Last updated 20 October 2026 (Africa/Lagos). No joint workflow is marked passed before execution.

## 1. Environment and contract versions

Admin http://127.0.0.1:3013/admin/; My Ikonectt http://127.0.0.1:4175/; API http://127.0.0.1:4000/api/v1; database ikonectt_development. API v1.0.1 contract commit 4f90e10fbdb9e04fb606109ac5ff3d81145ba18e. Backend health returned database connected during this run.

Admin baseline 082cdf3 retains accepted 4f5215c. Agent 2 reported clean portal baseline c3e5aa9 and 11 passing tests/build. These are preflight results; final validation follows corrections.

Agent 3 owns Admin actions/source; Agent 2 owns portal actions/source. No backend support request has been needed. No merge/deployment or other agent source modification.

## 2. Customer onboarding results

Verified the existing customer 83505969 / 5f115958-4194-4f7b-822f-cbd8c0aa6714 through Admin details, with related active subscription 1609838c-7c8f-4a11-87d5-89a104b42f59. Existing ticket d7cdac54-237f-47a2-9a6a-61891ed5a74b was opened and confirmed RESOLVED with persisted messages.

Created fresh customer through the real Admin interface:
- Name: SIMULATED Joint Customer stage3a-mvfn1j1e
- Customer UUID: 8ba319fe-dc0d-45a0-8eef-dd8b4c00aa20
- Account number: 83655382
- Synthetic email: joint.stage3a-mvfn1j1e@example.test
- Building: 927378d7-0d6d-4b4c-aabd-f5e30406a4bb

The single-use setup token was displayed in Admin for direct human handoff. No agent extracted, logged, photographed or sent it in chat. The human copied it and subsequently reported done. The Admin setup dialog is now closed. Successful customer identity/sign-in has not yet been observed in a connected portal browser, so onboarding is not marked passed. The portal login page has been made visible and the app navigated to it for the human to finish sign-in. No agent entered or submitted new credentials.

## 3. Plan and coverage consistency

Admin readback verified published plan 3df15596-ab4d-4cea-8599-144149ae979f at NGN 19,000, 80 Mbps, 30 days. Building 927378d7-0d6d-4b4c-aabd-f5e30406a4bb is AVAILABLE and mapped to that plan. Portal readback remains pending sign-in/journey execution.

## 4. Order/payment consistency

Pending. Customer portal must create the joint order and report its sample payment. Admin must read the same IDs, Finance must confirm it, and the portal must show PAID without automatic activation. Prior Stage 2 records are historical evidence only.

## 5. Provisioning results

Pending joint order/payment. Provider remains simulated. Provisioner must request fulfillment separately and the portal must show the returned subscription with simulation identified.

## 6. Support conversation synchronization

Pending. Customer-created ticket, staff reply/status and customer readback have not been executed for this fresh joint account.

## 7. Permission and session checks

New real-browser checks passed: Support was denied the provisioning route; an actual REPORTED fixture payment showed no Review payment action for Support; sign-out followed by a protected payment route showed login and no protected table. Fixture data was inspected only.

New API supplement passed, distinct from browser evidence: Support payment-verification request to a nonexistent record returned 403; Finance provisioning request for a nonexistent order returned 403; both logged-out staff sessions subsequently returned 401 from /auth/session. These requests changed no business record. Evidence: docs/stage3a-mvfn1j1e/security-api-evidence.json.

Customer ownership isolation and customer revoked-session behavior remain pending the portal run. No browser expiry/network-disconnect pass is claimed.

## 8. Browser and responsive results

Existing-record, plan/building and fresh-customer Admin actions above used the real desktop browser. After refinements, the customer table and details were rechecked at desktop1440 and mobile390/320 CSS pixels: document width remained within viewport, table scrolled independently, detail actions remained available and labels rendered clearly. Stage 3A customer-side mobile journey remains pending. Stage 2 desktop/mobile results are documented separately and are not substituted for the joint journey.

## 9. UI wording/readability refinements

Admin applied bounded contrast/table striping rules in src/readability.css and cleared concatenated detail labels (Order, Subscription, Building / address, Eligible plans, Verification evidence, Verified by, Updated). Currency choices retain NGN capitalization; provisioning reference is labeled Provider reference. Staff description is shorter. Table headers increased from10 to11px; header contrast on white improved2.57:1 to4.95:1, body table text3.68:1 to5.43:1. Alternating rows use subtle #fafbfc. Desktop/mobile browser checks confirmed the refinements. Approved base stylesheet, logo/font assets, layout, navigation, spacing and purposeful font variations remain preserved.

Agent 2 owns portal refinements. It corrected stale password-form warnings, added field-specific password/code feedback and native length bounds. Source review confirmed that the observed Please check token message was local canonical code-shape validation before the API request, not a backend password rejection. These source fixes have automated coverage but are not yet verified by a successful human browser setup. No portal files have been edited by Agent 3.

## 10. Defects corrected

Agent 2 corrected persistent obsolete password-form errors and ambiguous setup-code validation feedback in the portal. The human-used form was not reloaded or submitted by an agent. Successful live setup remains pending. Agent 2 also identified a possible stale summary after Admin-only changes; it must be demonstrated during cross-application readback before a fix/pass is claimed.

## 11. Tests and builds

Stage 2 Admin: 35 tests and production build passed at 082cdf3 (historical). Agent 2 preflight: 11 tests/build passed at c3e5aa9 (reported). Agent 2 subsequently reported 13 passing tests, strict typecheck, production build and whitespace check after the validation corrections. The new tests cover password boundaries and canonical setup-code length feedback. Admin final refinements check: 36 automated tests passed, including a new network-failure read/write test proving no mock fallback or fixture mutation; production build and visual-preservation test passed. Completed joint browser scenarios remain pending.

## 12. Remaining limitations

Connected customer portal sign-in is the current dependency. Human reports setup complete, but neither connected browser exposed a signed-in customer session. The app was navigated directly to Agent 2 and its visible login tab to remove chat/tab confusion. Do not recover an old setup token from logs. If setup actually failed and the code expires, use the authorized reissue workflow with required confirmation. Simulated activation is not ISP service, sample payment is not a money transfer, and queued/simulated notifications are not confirmed delivery.

## 13. Readiness for controlled branch integration

NOT YET ACCEPTED. Existing Admin acceptance is preserved, but joint identity/order/payment/provisioning/support/security readbacks and final browser/test evidence remain outstanding. Do not merge or deploy on the basis of this in-progress report.
