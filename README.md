# PIE.ai — Interactive Demo (alpha)

Elegant, interactive demo site that opens with a cinematic animation and then lets users explore the **OSINT Framework** graph with smooth, curved connectors.

> This is the very first cut so we can iterate quickly. It already includes the video-like auto-play, manual controls, and expandable graph.

## ✨ What you get

- **Elegant theme**: tasteful gradients, glass, Inter + Plex Mono fonts.
- **Cinematic flow**: big gradient input ➜ bursts into **33 nodes** ➜ nodes drift left ➜ **interactive OSINT graph**.
- **Video-like timeline**: auto-play with Pause/Next; users can still interact at any time.
- **Curvy lines**: graph uses bezier/smooth connectors and a left→right hierarchical layout.
- **Data source**: we load `arf.json` (the OSINT Framework dataset). A small snapshot is bundled as a fallback.

## 🧱 Stack

- React + Vite (TypeScript)
- Framer Motion (animations)
- React Flow + Dagre (graph + layout)
- Tiny Express API for reliable `arf.json` fetching

## ▶️ Run it locally

```bash
# Requirements: Node 18+
npm install
npm run dev
```

This starts both the Vite dev server and the local API on two ports. Your browser should open automatically (http://localhost:5173).

> On first install, we try to **download the latest `arf.json`** from the official sources.
> If the fetch fails, the app will still work using a **small built‑in snapshot**. You can also drop your own `arf.json` in `public/`.

## 🧭 Interacting with the demo

- Type into the central **PIE.ai** circle and submit → watch it glow and burst into 33 smaller circles.
- The circles drift to the left edge, making space for the graph.
- The **OSINT graph** appears.
  - **Click a node** to expand/collapse its children.
  - Use the **controls** in the bottom-right to pan/zoom or the `Pause/Next` buttons at the top-right to step the sequence.
  - The footer callout reminds the user: “Select a node to expand or click the ▶︎ button to go forward.”

## 📁 Project layout

```text
pie-ai-demo/
├─ public/
│  └─ arf.json                 # downloaded on install (if possible)
├─ scripts/
│  └─ fetch-arf.mjs            # grabs arf.json from official sources
├─ server/
│  └─ index.mjs                # tiny API; serves /api/arf with fallbacks
└─ src/
   ├─ components/              # UI building blocks
   ├─ data/osint-snapshot.json # tiny local fallback
   ├─ lib/                     # hooks/utils (future)
   ├─ App.tsx, main.tsx, styles.css
```

## 📝 Notes about OSINT data

- The OSINT Framework project is MIT-licensed and maintained at **lockfale/OSINT-Framework**. We either download `public/arf.json` on install or proxy it at runtime.
- If you want this demo to **always ship with a full, fixed snapshot**, paste a copy of `arf.json` into `public/` and commit it. Otherwise we’ll keep pulling the latest on dev runs.

## 🧩 Next steps (suggested)

- Replace the left drift with a **timeline scrubber** (so the user can scrub the sequence like a video).
- **Node details panel** when you click a leaf (open the URL in a new tab, show tags like (T) (D) (R) (M)).
- **Search spotlight** to filter graph nodes by name.
- **Theming** switch (dark / dim / high-contrast).
- Add a **PIE.ai orchestration** stub to simulate actions per node (e.g., run “Shodan → domain.com”).

---

© Yours to adapt. Built for iteration.
