# 🪐 AstroWorld — Full-Stack Vedic Astrology Monorepo

Welcome to the **AstroWorld** repository! The codebase is cleanly separated into modular workspaces for high performance, ease of maintenance, and production hosting.

---

## 📁 Repository Structure

```plaintext
astroworld/
├── frontend/                 # 🚀 React 19 + Vite SPA (Deploy to Vercel / Netlify)
│   ├── src/
│   │   ├── components/       # Vedic Kundli charts, PanchangaStrip, Header, Modals
│   │   ├── views/            # Panchanga, Overview, Services, Auth, Dasha, etc.
│   │   ├── services/         # Client API service callers (geoService, chartService)
│   │   ├── lib/              # Browser Supabase Client
│   │   └── App.tsx
│   ├── vite.config.ts        # Vite configuration with API proxy to port 3000
│   └── package.json
│
├── backend/                  # ⚙️ Express API Server (Deploy to Render / Railway / AWS)
│   ├── src/
│   │   ├── routes/           # /api/auth, /api/user/charts, /api/geo, /api/ai
│   │   ├── services/         # Supabase Admin, Gemini AI, Geo Proxies
│   │   └── server.ts         # Express server instance
│   └── package.json
│
└── shared/                   # 🌌 Shared Mathematical Astrological Engine
    ├── engine/               # Ephemeris, Canonical Charts, Panchanga, Shadbala
    ├── constants/            # Nakshatras, Zodiac signs, Dignities
    ├── types/                # TypeScript models and interfaces
    └── index.ts
```

---

## 🛠️ Quick Start & Local Development

### 1. Run Everything (Unified Full-Stack Mode)
```bash
npm run dev
```
* Serves the complete application on `http://localhost:3000`.

### 2. Run Frontend Only
```bash
npm run dev:frontend
```
* Starts the Vite frontend on `http://localhost:5173` with proxy to the backend API.

### 3. Run Backend Only
```bash
npm run dev:backend
```
* Starts the backend Express API server on `http://localhost:3000`.

---

## 🚀 Deployment & Production Hosting Guide

### Deploying Frontend to Vercel / Netlify / Cloudflare Pages
1. In your Vercel/Netlify dashboard, select **Root Directory**: `frontend` (or `./`).
2. **Build Command**: `npm run build`
3. **Output Directory**: `dist`
4. Set Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### Deploying Backend to Render / Railway / AWS
1. Set **Root Directory**: `backend` (or `./`).
2. **Build Command**: `npm run build`
3. **Start Command**: `npm run start`
4. Set Environment Variables:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GEMINI_API_KEY`
   - `GOOGLE_PLACES_API_KEY` (optional)
