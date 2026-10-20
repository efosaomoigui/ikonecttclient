# Admin Stage 4 integrated browser acceptance

Date: 20 October 2026 (Africa/Lagos). Run: d4e66e52. Status: ASSIGNED ADMIN BROWSER STAGES COMPLETE. Independent portal evidence and final consolidated recovery checks remain under the lead/portal owners.

## Runtime and ownership

Integrated checkout: `C:/Users/Efe-Dev/.codex/worktrees/ikonectt-platform-stage4/ikonectt`, branch `integration/ikonectt-platform-stage4`, initial merge `196a309bcdb774185d0c810fa0dd6b24244ffd53`. Admin files matched reviewed owner commit `9ebec44` before smoke. API v1.0.1 and canonical contract `4f90e10fbdb9e04fb606109ac5ff3d81145ba18e` retained.

Development Admin: http://127.0.0.1:3013/admin/. Compiled production Admin: http://127.0.0.1:3014/admin/. Both used the live API on4000 and shared development database. Agent3 performed only assigned staff actions. Agent2 owns portal actions; Agent1 coordinates their sequence and separately reports HTTP adapter acceptance.

Evidence screenshots are in `docs/stage4-d4e66e52/`; none contain credentials or setup tokens. Existing SIMULATED staff credentials were loaded from ignored local configuration in memory and were not written into evidence.

## Safe browser journey identifiers

| Entity | Reference |
| --- | --- |
| Customer | c8c6a143-4319-44a3-84ab-0b21672a6e10; account81117181; SIMULATED Stage4 browser d4e66e52 |
| Plan | 51201d97-a053-4c70-b8f7-2adb242a4be5; published; NGN19,500;80Mbps;30days |
| Building | 7ff56965-b620-4a9e-b863-29a45b3c4802; AVAILABLE; plan mapped |
| Customer-created order | 800fce40-5220-4a40-a575-9bbf55752ffc |
| Customer-reported payment | e816902e-9e22-4c36-b96a-56e54a5260f1; SIMULATED-STAGE4-BROWSER-d4e66e52 |
| Separate provisioning | 91d6a031-4e6b-4a69-8768-86deaacd6dd5; ACTIVE; simulated |
| Resulting subscription | 5f0b3a79-9019-425e-893c-5abb7352f5c7; ACTIVE; simulated |
| Customer-created support ticket | f599f85b-c0ea-4600-b685-6a202938394c; RESOLVED; two messages |

These are isolated simulated development records. No real bank movement or ISP service activation is claimed.

## Executed Admin browser checks

- Reloaded the integrated runtime and signed in with existing ADMIN credentials. Actual summary and six-card dashboard rendered with shared-backend and simulated-data notices. Read the intended customer ID/account, initially0orders/0subscriptions. No customer creation or credential change was performed in this browser run; the lead prepared its fresh customer through the API.
- Read the published NGN19,500 plan and AVAILABLE building with matching eligible plan ID. Both explicitly identified simulated data.
- Desktop and mobile390/320 CSS pixels: tables scrolled in their containers; document width stayed within viewport. Narrow detail dialog bounds were left12/right308 in320 pixels. Tab wrapped inside the dialog, Escape closed it, and navigation toggle worked. All six overview cards remained present; amount width and scroll width matched at96pixels on narrow mobile.
- SUPPORT could inspect a REPORTED fixture payment but had no Review payment action. Direct provisioning route was denied for SUPPORT and FINANCE. Fixture records were not modified.
- Read Agent2's single customer-created order in Admin: correct customer/plan/building, NEW_CONNECTION, NGN19,500, PENDING_PAYMENT and no subscription. Screenshots recorded before payment verification.
- Read Agent2's single reported payment in FINANCE: REPORTED, matching order/customer/amount/reference, no receipt and explicit simulated evidence.
- After lead assignment, FINANCE confirmed only that payment via the interface with reviewed evidence and required authorization checkbox. Read back CONFIRMED, verifier identity/time/evidence and correct receipt.
- Read the same order as PAID with subscription absent. Subscription list filtered to the browser customer showed0records. Stopped before provisioning for the independent portal PAID/no-service readback.

## Production build smoke

The separate compiled production entry at3014 had neither Open simulated workspace nor Preview staff role controls. Existing ADMIN login succeeded, real shared summary loaded and the same browser order/customer/plan/building/amount was readable. Sign-out followed by protected orders route required login and exposed no table. No production-entry business mutations were performed.

## Pending and evidence boundaries

- Independent portal-side identity, plan/coverage, order/payment results and mobile screenshots belong to Agent2's report; they are not inferred from Admin evidence.
- After independent portal PAID/no-service readback was confirmed by the lead, PROVISIONER submitted only the assigned paid order with the required review checkbox. Actual request91d6a031-4e6b-4a69-8768-86deaacd6dd5 returned ACTIVE with mode simulated and Simulated data source. Matching subscription5f0b3a79-9019-425e-893c-5abb7352f5c7 was ACTIVE/Simulated, linked to the correct customer/plan/building, with20October start and19November end. Order became COMPLETED and linked that subscription. No manual result override was offered or attempted. Independent portal subscription readback belongs to Agent2.
- SUPPORT opened the exact customer-created ticketf599f85b-c0ea-4600-b685-6a202938394c while OPEN, read its explicit simulated initial message, sent one explicitly simulated reply and set RESOLVED through Edit ticket. Fresh detail readback showed exactly two persisted messages with customer/staff authors and resolved status. No private staff notes or external message delivery were claimed. Independent portal conversation readback belongs to Agent2.
- Customer isolation and customer session checks require the portal/API owner's evidence. Admin route restrictions are verified above.
- Prior Stage3A remains partial. This fresh run does not retroactively mark that earlier account's journey passed.
- The subscription detail exposed two concatenated fallback labels, Startsat and Externalserviceid. The owner branch changes only their display labels to Starts and External service ID; functionality and contracts remain unchanged. On the exact wording follow-up source, npm test --prefix admin passed all36tests with0failures and npm run build --prefix admin passed TypeScript/Vite production compilation. Final integrated label recheck follows the lead's integration of that follow-up. No merge or deployment was performed by Agent3.

## Evidence files so far

`desktop-dashboard.jpg`, `desktop-customer-identity.jpg`, `desktop-building-eligible.jpg`, `mobile-390-customer-table.jpg`, `mobile-320-dashboard.jpg`, `support-no-payment-review.jpg`, `support-provisioning-denied.jpg`, `customer-order-admin-readback.jpg`, `payment-reported-admin-readback.jpg`, `finance-confirmed-payment.jpg`, `finance-confirmed-receipt.jpg`, `finance-paid-no-subscription.jpg`, `finance-no-active-service.jpg`, `production-dashboard.jpg`, `production-order-readback.jpg`, `provisioner-simulated-active.jpg`, `provisioner-active-subscription.jpg`, `provisioner-completed-order.jpg`, `support-resolved-two-message-conversation.jpg`.

## Final scope limits

The Admin browser stages above are directly executed observations. Portal login/setup, customer ownership and portal readbacks are not counted as Agent3 browser tests. The lead confirmed independent portal PAID/no-service readback before authorizing provisioning; later portal service/support observations must be linked from Agent2. Final cold startup/recovery and integrated follow-up-label checks occur after this handoff. Original Stage3 records were not changed. No merge, main update or deployment was performed by Agent3.
