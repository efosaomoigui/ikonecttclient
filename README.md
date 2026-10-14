# iKonectt — Client Presentation & Dual-Option Architecture Showcase

This repository (`ikonecttclient`) contains the unified client-facing digital experience proposals for **iKonectt** (flagship broadband brand of **Intelivision Technologies Limited**).

It brings together:
1. **Interactive Comparison Hub (`index.html`)**: Executive portal allowing the client to view and toggle between Option A and Option B side-by-side, test responsive viewports (Desktop, Tablet, Mobile), and review feature matrices.
2. **Option A (`option-a/`)**: Editorial photography-first layout, multi-page journey (Home, Residential, Business, Coverage, Support, About), React 19 + TypeScript.
3. **Option B (`option-b/`)**: Panoramic velocity, photography-led art direction, multi-column mega menus, integrated AI Concierge.
4. **Static Showcase Pages (`residential.html`, `business.html`, `coverage.html`)**: High-fidelity standalone views.
5. **Design & Content Governance**: [`design.md`](./design.md) and [`Ikonectt_content (1).md`](./Ikonectt_content%20(1).md).

---

## 🚀 Live Preview (Local)

| Target | URL | Description |
| :--- | :--- | :--- |
| **Presentation Hub** | **[http://localhost:3000](http://localhost:3000)** | Executive showcase with interactive preview switcher, comparison matrix, and device viewports. |
| **Option A (Ikonectt 1)** | **[http://localhost:3001](http://localhost:3001)** | Clean editorial layout, multi-page journey, React 19 + TypeScript. |
| **Option B (Ikonectt 2)** | **[http://localhost:3002](http://localhost:3002)** | Panoramic velocity, photography-led direction, multi-column mega menus. |

---

## ☁️ Deployment on Vercel

This repository is pre-configured for automatic single-click deployment on **Vercel**:

1. **Push to GitHub**:
   ```bash
   git push -u origin main
   ```
2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
   - Import the `ikonecttclient` repository.
   - Keep **Root Directory** at the repository root and **Framework Preset** set to **Other**.
   - The included [`vercel.json`](./vercel.json) and root build script (`npm run build`) automatically:
     - Installs each option's locked dependencies with `npm ci --include=dev`, including Vite and the build plugins
     - Builds Option A into `public_html/option-a/`
     - Builds Option B into `public_html/option-b/`
     - Builds Option C into `public_html/option-c/`
     - Bundles the showcase hub, assets, and static pages into `public_html/`
   - Click **Deploy**.

Once deployed, the client can access the live showcase URL (e.g. `https://ikonecttclient.vercel.app`) and interactively explore both Option A and Option B seamlessly from any device without running local servers.

---

## 🛠 Local Commands

```bash
# Install dependencies for all three options before the first build
npm ci --prefix option-a --include=dev
npm ci --prefix option-b --include=dev
npm ci --prefix option-c --include=dev

# Build the entire production showcase (Option A + Option B + Hub)
npm run build

# Start presentation hub server (port 3000)
npm run dev

# Run Option A dev server (port 3001)
npm --prefix option-a run dev

# Run Option B dev server (port 3002)
npm --prefix option-b run dev
```
