# Cloudflare Pages Deployment Guide

## Overview

Deploy your **frontend only** (Main SaaS + Admin) to Cloudflare Pages for the fastest global CDN and unlimited bandwidth.

```
┌─────────────────────────────────────────────────────────────┐
│                      CLOUDFLARE PAGES                       │
│  ┌─────────────────────┐    ┌─────────────────────────────┐ │
│  │  Main Frontend      │    │  Admin Frontend             │ │
│  │  charisbilleasy.store    │    │  admin.charisbilleasy.store │ │
│  └──────────┬──────────┘    └──────────────┬──────────────┘ │
└─────────────┼──────────────────────────────┼────────────────┘
              │                              │
    ┌─────────▼──────────┐      ┌────────────▼─────────────┐
    │  Main Backend      │      │  Admin Backend           │
    │  (Railway)         │      │  (Railway)               │
    │  8001              │      │  3001                    │
    └────────────────────┘      └──────────────────────────┘
              │                              │
              └──────────────┬───────────────┘
                             │
                    ┌────────▼─────────┐
                    │  PostgreSQL DB   │
                    │  (Railway)       │
                    └──────────────────┘
```

**Note:** Cloudflare Pages hosts **frontend only**. Backends remain on Railway.

---

## Why Cloudflare Pages?

| Feature | Vercel (Free) | Cloudflare Pages (Free) |
|---------|---------------|-------------------------|
| **Bandwidth** | 100GB/month | **Unlimited** |
| **Build Minutes** | 6,000/month | 500/month |
| **Edge Locations** | 100+ | **300+** |
| **Requests** | 1M/month | **Unlimited** |
| **Analytics** | Basic | **Advanced** |
| **Functions** | Edge | **Workers (10ms cold start)** |

---

## Step 1: Main SaaS Frontend Deployment

### 1.1 Create Cloudflare Account
1. Go to https://dash.cloudflare.com/sign-up
2. Verify email
3. No need to add a domain yet

### 1.2 Create Pages Project
1. Go to **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**
2. Connect your GitHub account
3. Select your `bill-easy` repository
4. **Build settings:**

| Setting | Value |
|---------|-------|
| **Project name** | `billeasy-main` |
| **Production branch** | `main` |
| **Framework preset** | `Vite` |
| **Build command** | `cd frontend && npm install && npm run build` |
| **Build output directory** | `frontend/dist` |
| **Root directory** | `/` (leave empty) |

### 1.3 Environment Variables

Add these in Cloudflare Dashboard → Project → Settings → Environment variables:

```
MAIN_SAAS_BACKEND=https://bill-easy-production.up.railway.app
VITE_SAAS_URL=https://charisbilleasy.store
```

**Important:** In Cloudflare Pages, ALL env vars are exposed to the browser by default (unlike Vite). Use `MAIN_SAAS_BACKEND` (no `VITE_` prefix).

### 1.4 Deploy
1. Click **Save and Deploy**
2. Wait for build (~2-3 minutes)
3. Your site will be at: `https://billeasy-main.pages.dev`

---

## Step 2: Admin Frontend Deployment

### 2.1 Create Second Pages Project
1. Go to **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**
2. Select same repository
3. **Build settings:**

| Setting | Value |
|---------|-------|
| **Project name** | `billeasy-admin` |
| **Production branch** | `main` |
| **Framework preset** | `Vite` |
| **Build command** | `cd admin/frontend && npm install && npm run build` |
| **Build output directory** | `admin/frontend/dist` |
| **Root directory** | `/` (leave empty) |

### 2.2 Environment Variables

```
ADMIN_BACKEND_KEY=https://respectful-youth-production-581b.up.railway.app
VITE_SAAS_URL=https://charisbilleasy.store
```

### 2.3 Deploy
- Your admin site will be at: `https://billeasy-admin.pages.dev`

---

## Step 3: Custom Domain Setup

### 3.1 Add Domain to Cloudflare
1. Go to Cloudflare Dashboard → **Websites** → **Add a Site**
2. Enter: `charisbilleasy.store`
3. Select **Free Plan**
4. Follow DNS setup instructions (change nameservers at your registrar)

### 3.2 Connect Custom Domain to Pages

**For Main Frontend:**
1. Go to your `billeasy-main` project
2. **Custom domains** → **Set up a custom domain**
3. Enter: `charisbilleasy.store`
4. Follow verification steps

**For Admin Frontend:**
1. Go to your `billeasy-admin` project
2. **Custom domains** → **Set up a custom domain**
3. Enter: `admin.charisbilleasy.store`

---

## Step 4: Update Backend CORS

Your Railway backends need to allow Cloudflare Pages domains.

### 4.1 Main Backend CORS
In Railway (Main Backend), update environment variables:

```env
FRONTEND_URL=https://charisbilleasy.store,https://billeasy-main.pages.dev
```

### 4.2 Admin Backend CORS
In Railway (Admin Backend), update environment variables:

```env
ADMIN_FRONTEND_URL=https://admin.charisbilleasy.store,https://billeasy-admin.pages.dev
```

---

## Build Configuration Files

### `frontend/.nvmrc` (optional but recommended)
```
18
```

### `frontend/package.json` build script
Ensure this exists:
```json
{
  "scripts": {
    "build": "vite build"
  }
}
```

---

## Preview Deployments

Cloudflare Pages automatically creates preview deployments for:
- Pull requests
- Non-production branches

Access them at: `https://<branch-name>.billeasy-main.pages.dev`

---

## Troubleshooting

### Build Fails: "Cannot find module"
```bash
# Solution: Clear build cache
# In Cloudflare Dashboard → Project → Settings → Builds & deployments
# Click "Retry deploy with clear cache"
```

### 404 Errors on Refresh
Add `frontend/public/_redirects` file:
```
/* /index.html 200
```

Or add to `frontend/vite.config.js`:
```js
export default {
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
      },
    },
  },
}
```

### Environment Variables Not Working
- Cloudflare Pages exposes all env vars to browser
- Don't use `VITE_` prefix (not needed)
- Redeploy after adding env vars

### API Connection Errors
1. Check CORS in Railway backend includes Cloudflare domain
2. Verify `MAIN_SAAS_BACKEND` or `ADMIN_BACKEND_KEY` is set correctly
3. Check browser console for exact error

---

## Performance Optimization

### Enable Auto Minify
Cloudflare Dashboard → **Speed** → **Optimization**:
- ✅ Auto Minify (CSS, JS, HTML)
- ✅ Brotli compression
- ✅ Early Hints

### Caching Rules
Add Page Rule for static assets:
```
URL: *charisbilleasy.store/static/*
Cache Level: Cache Everything
Edge Cache TTL: 1 month
```

---

## Migration Checklist (Vercel → Cloudflare)

- [ ] Create Cloudflare account
- [ ] Connect GitHub repo
- [ ] Deploy Main Frontend
- [ ] Deploy Admin Frontend
- [ ] Add environment variables
- [ ] Update backend CORS
- [ ] Test API connections
- [ ] Add custom domains
- [ ] Update DNS nameservers
- [ ] Verify SSL certificates
- [ ] Test all functionality
- [ ] (Optional) Delete Vercel projects

---

## Pricing Comparison

| Plan | Cloudflare Pages | Vercel |
|------|------------------|--------|
| **Free** | Unlimited bandwidth, 500 builds/mo | 100GB bandwidth, 6,000 builds/mo |
| **Pro** | $5/worker/month | $20/project/month |
| **Business** | $200/month | N/A |

**For high-traffic SaaS:** Cloudflare Pages is significantly cheaper.

---

## Summary

| Component | Hosted On | URL |
|-----------|-----------|-----|
| Main Frontend | **Cloudflare Pages** | `charisbilleasy.store` |
| Admin Frontend | **Cloudflare Pages** | `admin.charisbilleasy.store` |
| Main Backend | **Railway** | `bill-easy-production.up.railway.app` |
| Admin Backend | **Railway** | `respectful-youth-production-581b.up.railway.app` |
| Database | **Railway** | PostgreSQL |

**Result:** Fastest global frontend + scalable backend = optimal setup.
