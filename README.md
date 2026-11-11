# Bill Easy

AI-powered GST billing, inventory and business insights for Indian small businesses, by
IE Tech (a brand of Immanuel Enterprises).

- `backend/` — Node/Express API on PostgreSQL
- `frontend/` — React (Vite) web app; `frontend/android/` wraps it as the Android app
- Plans, coupons and payments come from **Charis OS** (`CHARIS_OS_INTEGRATION.md`)

## Run locally

Easiest: the self-hosted stack in `../charis_deploy` builds Charis OS and Bill Easy from these
folders (`docker compose up -d --build`).

Without Docker:

```sh
cd backend && cp .env.example .env   # fill DATABASE_URL, JWT_*, CHARIS_OS_*, NVIDIA_*
npm install && npm start             # http://localhost:8001
cd ../frontend && cp .env.example .env && npm install && npm start
```

Tests: `cd backend && npm test`. Deployment: `DEPLOYMENT.md`.
