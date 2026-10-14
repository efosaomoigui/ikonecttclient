# iKonectt Broadband — Client Presentation & Design Options

This workspace contains both interactive website proposals for the client review:

---

## 🚀 Live Servers & Presentation Links

| Target | URL | Description |
| :--- | :--- | :--- |
| **Client Presentation Hub** | **[http://localhost:3000](http://localhost:3000)** | Executive showcase portal with interactive side-by-side preview arena, comparison matrix, and device viewports. |
| **Option A (Ikonectt 1)** | **[http://localhost:3001](http://localhost:3001)** | Clean editorial layout, multi-page journey (Home, Residential, Business, Coverage, Support, About), React 19 + TypeScript. |
| **Option B (Ikonectt 2)** | **[http://localhost:3002](http://localhost:3002)** | Panoramic velocity, photography-led art direction, multi-column mega menus, integrated Gemini AI Concierge, built-in Option 1 comparison toggle. |

---

## 📁 Directory Structure

```text
ikonectt/
├── index.html                 # Executive Client Showcase & Comparison Portal
├── server.js                  # Presentation hub dev server (port 3000)
├── option-a/                  # Option A: React 19 + Vite (port 3001)
│   ├── src/components/pages/  # HomePage, ResidentialPage, BusinessPage, CoveragePage...
│   ├── package.json
│   └── vite.config.ts
├── option-b/                  # Option B: Reimagined Experience + AI (port 3002)
│   ├── src/components/option2/# Option2Experience, ResidentialLanding, BusinessLanding...
│   ├── server.ts              # Express + Gemini AI backend
│   └── package.json
└── README.md
```

---

## 🛠 Commands

* **Option A**: `npm --prefix option-a run dev` (Runs on `http://localhost:3001`)
* **Option B**: `npm --prefix option-b run dev` (Runs on `http://localhost:3002`)
* **Showcase Hub**: `node server.js` (Runs on `http://localhost:3000`)
