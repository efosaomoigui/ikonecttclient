# Client brand feedback — local review, 29 October 2026

- E's official hero i is now red, fully visible above the road edge and 132px tall on desktop / 100px on mobile. Its base remains bottom-left with a ground shadow, while existing signal paths still connect to the same building anchors. The pause control is offset to avoid covering the mark.
- E's coverage locator uses the official dot-and-lightning i mask in red, with a white location pin inside the dot. Existing grid and ground rings remain subtle.
- The coverage heading uses smaller responsive typography and fits on one line at all five checked widths: 1440, 1024, 768, 390 and 320px.
- The approved lowercase spelling `ikonectt` is applied to visible copy, buttons, navigation, metadata and accessible labels in A/E and the two-design selector. Original wordmark artwork is retained. Form values, user messages, routes, customer logic and catalogue data are preserved.

Evidence is under `docs/evidence/brand-feedback/`. Browser checks cover all 29 E routes and previously completed A route checks, with screenshots for E's five responsive sizes. The new brand-copy preservation check, source positioning/render checks, selector checks and E refinement checks pass. The broad run passed 183 checks with one old capitalisation expectation; that expectation was updated for the client's approved spelling and the affected module then passed all its checks.

Preview: http://127.0.0.1:3021/public_html/option-e/?review=brand-feedback#/home

No production build or push was performed. Main's last published Git commit remains `70ae105`. A runs from its current local source at http://127.0.0.1:3001/.
