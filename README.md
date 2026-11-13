# HIMAVAT — The Descent | Indian Himalaya Field Atlas

An Awwwards-grade, 100% free and open-source scroll-driven trekking atlas for the Indian Himalayas (**Uttarakhand, Himachal Pradesh, Ladakh, Sikkim, West Bengal / Singalila, Jammu & Kashmir**). Built with zero paid APIs, zero proprietary fonts, zero unverified images, and adaptive WebGL/scroll choreography engineered to perform smoothly across mid-range desktops and low-end mobile phones.

---

## Core Architecture & Features

- **The Descent Scrollytelling (`/`)**: Continuous scroll narrative moving from dawn snow ridge (**5,300 m**) down through glacial moraines, braided alpine rivers, a scroll-scrubbed WebGL cascading waterfall shader + velocity-reactive splash particles (`OGL`), sandstone gorges, deodar pine forest, and starry night base camp (**2,400 m**).
- **18 Verified Indian Trek Dossiers (`/treks` & `/treks/:slug`)**: Kedarkantha, Hampta Pass, Valley of Flowers, Triund, Kheerganga, Roopkund, Brahmatal, Har Ki Dun, Dayara Bugyal, Chopta–Tungnath–Chandrashila, Sandakphu, Goecha La, Markha Valley, Stok Kangri, Pin Parvati Pass, Buran Ghati, Kashmir Great Lakes, and Kuari Pass — with active regulatory bans & permit quotas flagged upfront.
- **Budget DIY Trek Planner (`/planner`)**: Choose trail, group size (`1–10`), month, guide choice, and rental toggle to generate an itemized independent itinerary (`transport`, `stay`, `food`, `permits`, `guide split`, `gear rental`) compared side-by-side against commercial operator medians (*approximate, checked Nov 13, 2026*).
- **Side-by-Side Comparison Matrix (`/compare`)**: Compare 2 to 3 routes across a normalized SVG elevation overlay and specification table.
- **Conservative Alpine Safety Hub (`/safety`)**: Wilderness Medical Society (2024) AMS/HAPE/HACE protocols, interactive packing checklist persisted locally, 6-week conditioning plan, state-wise ILP/PAP/Forest permits table, emergency rescue phone numbers, and Leave No Trace guidelines.
- **12-Month Seasons Calendar (`/seasons`)**, **Transparency & Attributions (`/credits`)**, **Methodology (`/about`)**, and **Field Update Dispatch (`/contact`)**.

## Adaptive Performance Engineering

- **Hardware + Live FPS Governor**: Classifies `high`, `medium`, or `low` at boot using CPU cores, RAM, screen width, Save-Data, `prefers-reduced-motion`, and self-hosted `detect-gpu` benchmarks (`public/gpu-benchmarks/`), with automatic downgrade below ~45 FPS and manual toggle in the navbar.
- **Single Canvas Discipline**: One shared OGL WebGL canvas paused cleanly when off-screen or tab-hidden, capped at DPR `1.5`, disabled completely in `low` tier and `reduced-motion`.
- **Subset Fonts & Multi-Width Media**: Self-hosted subset WOFF2 (`Montserrat 900/700`, `Cormorant Garamond 400i/600i`, `DM Sans 400/500/700`) with only headline `montserrat-900.woff2` preloaded (`font-display: swap`). All 25 photographs compiled via Sharp into `480 / 960 / 1920` AVIF + WebP (`3840` hero-only on high-tier wide displays) with inline base64 WebP LQIPs.
- **Route-Split Bundles**: React lazy routes keep initial JS gzip payload small.

---

## Local Setup

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
npm run preview
```

Regenerate responsive AVIF/WebP image pyramid from `/tmp/master_media_plan.json` (requires `sharp` devDependency):

```bash
node scripts/build-media.mjs
```

---

## Free Zero-Cost Deployment Guides

### 1. GitHub Pages (Included via `.github/workflows/deploy.yml`)
1. Push repository to GitHub (`main` branch).
2. Enable **Settings → Pages → Source: GitHub Actions**.
3. Workflow compiles with `VITE_BASE_PATH=/<repo-name>/` and mirrors `index.html` to `404.html` for seamless client routing.

### 2. Cloudflare Pages
1. Connect repository in Cloudflare Pages Dashboard.
2. Build command: `npm run build` (uses default `VITE_BASE_PATH=/`).
3. Output directory: `dist` (`public/_headers` and `public/_redirects` apply automatically).

### 3. Netlify
1. Connect repository in Netlify Dashboard or `npx netlify-cli deploy --prod --dir=dist`.
2. Build command: `npm run build`
3. Publish directory: `dist` (`_redirects` & `_headers` already included in `public/`).
