# Independent client previews — deployment preparation

No deployment is authorized or performed by this task. These settings are for a later approved preview deployment from the reviewed integration revision, not `main` or the public website project.

## Project separation

| Setting | Staff demonstration | Customer demonstration |
| --- | --- | --- |
| Suggested project name | `ikonectt-admin-demo` | `my-ikonectt-demo` |
| Root Directory | `admin` | `my-ikonectt` |
| Framework Preset | Other | Other |
| Install Command | `npm ci --include=dev` | `npm ci --include=dev` |
| Build Command | `npm run build:demo` | `npm run build:demo` |
| Output Directory | `dist-demo` | `dist-demo` |
| Environment variables | None | None |
| Backend / database / provider | None | None |

Use a supported Node version compatible with the repository's tests. Do not import production environment variables or link these projects to the integrated applications' credentials. Build from each app's committed dependency lockfile. Neither project needs access to files outside its own root for normal contract compilation.

Each application has its own demo-oriented `vercel.json`. The repository-root `vercel.json` remains the existing public website configuration. Do not replace it with either demo config. Do not use the root public website build command for these projects.

Vercel supports separate projects for applications in a monorepo. Project-level root/build/output settings and repository configuration must agree. See [Vercel monorepos](https://vercel.com/docs/monorepos), [build configuration](https://vercel.com/docs/builds/configure-a-build) and [static configuration](https://vercel.com/docs/project-configuration/vercel-json).

## Access and indexing

Before sharing, configure Vercel Authentication / Deployment Protection for the preview environment. Prefer access granted to the intended client, or a deliberately controlled shareable link when appropriate for the account. Inspect the actual project's protection settings and account capabilities; this task does not claim that account-specific protection has been configured. See [Deployment Protection](https://vercel.com/docs/deployment-protection) and [Vercel Authentication](https://vercel.com/docs/deployment-protection/methods-to-protect-deployments/vercel-authentication).

The demo configuration sends `X-Robots-Tag: noindex, nofollow, noarchive` independently of Vercel's default preview no-index behavior. Indexing directives are not access control. See [Vercel preview indexing guidance](https://vercel.com/kb/guide/are-vercel-preview-deployment-indexed-by-search-engines).

## Post-authorization hosting verification

After a later authorized preview deployment, check both protected URLs in an unauthenticated browser, grant intended client access, then repeat entry, theme, role/profile selection, asset, refresh and mobile checks on the hosted origins. Confirm `Content-Security-Policy` blocks connections and form navigation, and confirm the no-index response header. Review build logs for unintended environment injection. Do not promote either demonstration to the real platform's production project or domain.

The applications use hash routes. Preserve the Admin `/admin/` prefix and the root redirect specified by its config; client navigation links include the appropriate hash. Customer routes start from the independent project root. No API proxy or rewrite to the development backend is permitted.

## Local artifact verification

From the integration checkout, build each demo and run:

```powershell
node scripts/check-demo-artifacts.mjs
```

Start static-only previews in separate terminals:

```powershell
node scripts/demo-preview.mjs admin
```

```powershell
node scripts/demo-preview.mjs my-ikonectt
```

Default local URLs are `http://127.0.0.1:4186/` and `http://127.0.0.1:4187/`. These servers serve deployment output only; API paths return 404 and mutation requests return 405. The healthy integrated platform can remain running on its existing ports.
