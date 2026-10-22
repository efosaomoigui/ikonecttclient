# IKONECTT — SUPERVISED CLIENT DEMONSTRATION SCRIPT

22 October 2026. Keep the private login guide off screen. This script shows existing development functionality; every payment/provider example below is SIMULATED. Do not use unrelated accounts or approve real financial reports.

## Preflight

1. In the consolidated checkout run `npm run platform:status`: API4000, Admin3013 and portal4175 must be healthy. If stopped, run `npm run platform:dev` and keep the terminal open. Do not run migrations/seeds/reset tools.
2. In the separate website checkout keep `npm start` (3000) and `npm --prefix option-a run dev` (3001) running.
3. Open website `http://127.0.0.1:3000/`, Admin `http://127.0.0.1:3013/admin/` and portal `http://127.0.0.1:4175/#/login` in separate tabs/windows. Use dedicated private-guide identities. Do not select “Open simulated workspace”: the real demo uses authenticated sessions against the development API.
4. Sign in once per role and retain separate tabs when possible. Authentication is limited to 8 attempts per route/IP per minute. Avoid repeated refresh/sign-in bursts. Wait if rate-limited; do not disable protection. A full page reload clears in-memory sessions and may require login.
5. Verify the current wallet balance and quote before every operation. Stop if another operator has changed the scenario. Existing report confirmations/renewals are not reversible by resetting the database.

## Explain the boundary first

“Admin and My Ikonectt use the same persistent development API/database. Payment evidence and ISP responses in this demonstration are simulated. The public website is an approved-design preview track; its coverage and enquiry forms are not connected to the operational database yet.”

## Screen-by-screen story

| Step | Application and screen | Action / what to show |
|---|---|---|
| 1 | Website selector3000 | Compare A and E; open A at3001. Preserve the shortlist rather than implying a final production design was chosen. |
| 2 | A Homepage → Explore Plans → Check Coverage | Show catalogue and progressive address form using synthetic details; choose a demonstration scenario. Point out preview pricing and “not a live coverage decision.” Do not claim an enquiry was delivered to CRM. |
| 3 | Admin → Customers | Open dedicated Customer B from the private guide. Show account number/identity and existing initial order; do not create duplicate accounts. Explain staff owns account creation/setup. |
| 4 | Portal → Customer B → Overview / My Services | Show matching account, plan, service and existing order. Initial connection/order/payment/service were prepared through approved HTTP development mechanisms before rehearsal. |
| 5 | Portal → Wallet → Top-up reports | The next replay report `SIMULATED-PRESENTATION-REPLAY-20261022` is REPORTED for NGN25,000. Current available balance is NGN5,500; pending funds are not spendable. Optional: explain Top Up Wallet → review → consent → Confirm payment report; this exact form flow was rehearsed. Do not submit duplicate reports. |
| 6 | Admin, FINANCE → Wallet Top-ups | Search the exact replay reference. Review evidence and SIMULATED badge. “Review wallet top-up” → verification evidence clearly saying SIMULATED → authorization checkbox → Record wallet decision. Never select an unrelated report. This replay confirmation is prepared but not executed during readiness. |
| 7 | Portal B → Wallet → View Transactions | Navigate away/back to refresh. Expected after this replay confirmation: NGN30,500 available, no hold. Show separate ledger credit. Bank settlement is not being claimed. |
| 8 | Separate portal window, Customer A → Overview | Show NGN25,000 wallet credit and “No services linked.” “Funding does not activate service.” A is not an expired subscription and has no eligible service to renew. Return to B; do not mix identities. |
| 9 | Portal B → My Services → View service → Renew Plan | Show current expiry21Dec2026; backend quote NGN19,500, expected next expiry20Jan2027 if unchanged. Read the actual quote rather than hardcoding a promise. Check explicit consent → Confirm and reserve funds. |
| 10 | Portal B renewal detail | Expected after replay reservation: NGN11,000 available / NGN19,500 held, RESERVED, no new confirmed expiry. Customer action alone is not completed renewal. |
| 11 | Admin FINANCE → Wallet Renewals | Show same new renewal. Finance can review but cannot process provisioning. |
| 12 | Admin PROVISIONER → Wallet Renewals | Open that exact new RESERVED renewal → Process reserved renewal → authorization → Process renewal. Explicitly say “simulated ISP outcome,” not physical activation. Do not process any prior uncertain fixture. |
| 13 | Portal B renewal detail → Refresh status | Expected simulated success: SUCCEEDED, NGN11,000 available / no hold and confirmed new expiry matching the quote. Show Admin customer wallet and related order/subscription as the same records. |
| 14 | Portal B → Support | Open existing resolved rehearsal ticket to show conversation, or New support request to create another clearly simulated presentation request. |
| 15 | Admin SUPPORT → Support Tickets | Open same ticket, reply and update status. Portal → Support → reopen ticket to show synchronization. Replies are customer-visible; no private internal notes are supported. Support cannot confirm payment or provision. |
| 16 | Finish | Show gap matrix: client data/content and provider/infrastructure approvals still needed. No production-readiness claim. |

## Already completed rehearsal versus next replay

The first rehearsal is complete: B started at NGN0, Finance confirmed NGN25,000, customer reserved NGN19,500 (NGN5,500 available), Provisioner simulated success cleared the hold and extended 21Nov to21Dec2026. One credit/reserve/capture each was independently verified; support reply/status synchronized.

The second replay top-up is pending now. Its future amounts above assume no intervening records: 5,500 +25,000 =30,500, then 30,500 −19,500 =11,000. **Those future confirmation/renewal steps are a presentation script, not another passed test.** Ledger history is additive; repeating the demonstration changes future balances and dates. Read current backend state and quote every time.

## Truthful alternatives and stopping rules

- Exact expired-customer renewal was verified in isolated backend tests, not through today's browser; the current HTTP/UI has no supported way to backdate a service. Show funded inactive A plus explicit active B renewal. Do not edit dates or clocks.
- Use supervised desktop for today's live operational demo. Real390px login layouts were visually inspected, but full authenticated mobile interactions were not completed because browser frame input could not submit. Do not claim full mobile acceptance.
- If a provider timeout/review state appears, retain the hold, show REQUIRES_REVIEW and stop; do not label acknowledgement as success or retry an ambiguous financial intent with a new identity.
- If API/navigation fails, show the actual error and the captured credential-free rehearsal evidence. Do not switch silently to local mock success.
- Setup/recovery forms are available, but production message delivery is unconnected. Never expose one-time codes/passwords on the projector, and never reset an existing demo password mid-presentation.

## Cleanup after the presentation

Sign out of each account. Keep the database and ledger/history intact. Stop the supervised local services only when the presentation is finished; no merge or production deployment is part of this script.
