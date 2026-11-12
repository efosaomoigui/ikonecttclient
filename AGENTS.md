# One canonical Ikonectt project

- Work in `C:/Users/Efe-Dev/Documents/business News/ikonectt` on `main` for the current Option E frontend. All collaborating chats and agents use this same checkout. Do not create another working copy or worktree unless the user explicitly requests one.
- Edit the authoritative sources in `option-e/`, `shared/`, and the relevant build scripts. `dist-public/` is generated public output; never edit it directly. `public_html/` is legacy showcase/presentation output, not the current public site; do not manually mirror frontend changes there.
- `npm run build` generates the public site from these sources. `npm run build:public-demo` includes the existing isolated Admin/customer demo applications when reviewing the same build Vercel uses. `npm run dev` rebuilds that public-demo output before starting the canonical server on port 3000. Rebuild and restart after source changes.
- Validate the generated public artifact in the browser, including the homepage section order. Do not use `server.js` or another worktree's preview as the public preview.
- Coordinate writes and Git operations. One agent owns the commit; a delegated publishing agent may push that checked commit from this checkout. Do not overwrite unrelated dirty work or force-push.
- Testimonials without approved quotes keep a visible, truthful empty state in both local and public builds. Never convert illustrative quotes into approved customer endorsements.
