# Local A+C preview restoration

19 October 2026. Local server fix only; no deployment or template-design changes.

The selector still contained A+C, D and E. A+C's source and compiled output were intact. The plain Node static server was serving `option-a/index.html`, which expects Vite to transform `/src/main.tsx`. That entry cannot render when opened through the standalone static server on port 3021.

The server now resolves `/option-a/` and the other React template paths to their existing `public_html/` builds, including scripts, styles and images. Requests for a directory without its trailing slash redirect to the canonical URL so relative asset paths work. Existing `/public_html/...` URLs and standalone D/E routes remain available. No A+C homepage, internal-page source, D design, E design, selector or shared journey module was changed.

Run the standalone preview in PowerShell:

```powershell
$env:PORT='3021'
npm start
```

Open http://127.0.0.1:3021/?design=a&route=%23%2Fhome . The older port-3000 development workflow in the README expects the separate Vite process on port 3001; it is not the standalone compiled-preview workflow.

Validation:

- 15 tests passed across the new HTTP server regression test, shortlist tests and Template E preservation/lifecycle tests.
- The HTTP regression launches the actual server on an ephemeral port and verifies compiled A/B/C HTML, served JavaScript bytes/MIME types, D/E availability, the existing public-output A URL, and canonical directory redirects.
- Browser checks confirmed local A+C homepage rendering inside the selector, the Residential internal page, and switching to D and E and back to A+C.
- The live A+C page and the live selector also rendered successfully, with no captured browser errors. The live site was inspected without making any changes or deploying.

[Local selector screenshot](evidence/shortlist-restoration/local-selector.png) · [Live selector screenshot](evidence/shortlist-restoration/live-selector.png)
