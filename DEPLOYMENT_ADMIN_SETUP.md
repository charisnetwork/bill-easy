# Admin Panel - Separate Deployment Setup

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        USER (YOU)                           │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
    ┌──────────▼──────────┐      ┌───────────▼────────────┐
    │  Admin Frontend     │      │  Main SaaS Frontend    │
    │  (Vercel)           │      │  (Vercel)              │
    │  admin.charisb...   │      │  charisbilleasy.store  │
    └──────────┬──────────┘      └───────────┬────────────┘
               │                              │
    ┌──────────▼──────────┐      ┌───────────▼────────────┐
    │  Admin Backend      │      │  Main SaaS Backend     │
    │  (Railway)          │      │  (Railway)             │
    │  Port: 3001         │      │  Port: 8001            │
    └──────────┬──────────┘      └───────────┬────────────┘
               │                              │
               └──────────────┬───────────────┘
                              │
                    ┌─────────▼──────────┐
                    │   SaaS Database    │
                    │   (PostgreSQL)     │
                    │   Shared DB        │
                    └────────────────────┘
```

## Key Points

1. **Shared Database**: Admin and Main SaaS use the SAME database
   - Changes in Admin reflect immediately on Main SaaS
   - Subscription updates, plan changes, user management all sync instantly

2. **Separate Services**: 
   - Different Railway services (independent scaling)
   - Different Vercel projects (independent deployment)
   - Admin only accessible by YOU (via ADMIN_SECRET)

3. **Security**:
   - Admin uses `ADMIN_SECRET` for authentication
   - Main SaaS uses JWT tokens
   - CORS restricted to specific domains

---

## Environment Variables

### 1. Main SaaS Backend (Railway)

```env
# Database (Same as admin)
DATABASE_URL=postgresql://user:pass@host:5432/saas_db

# Security
JWT_SECRET=your_jwt_secret_here
FRONTEND_URL=https://charisbilleasy.store

# Server
PORT=8001
NODE_ENV=production
```

### 2. Admin Backend (Railway) - NEW SERVICE

```env
# Database (SAME as main SaaS - this is key!)
DATABASE_URL=postgresql://user:pass@host:5432/saas_db
DATABASE_URL_SaaS=postgresql://user:pass@host:5432/saas_db

# Security (CRITICAL - Only you know this!)
ADMIN_SECRET=your_super_secret_key_here
JWT_SECRET=your_jwt_secret_here

# CORS
ADMIN_FRONTEND_URL=https://admin.charisbilleasy.store

# Connection Links (optional - for logging)
RAILWAY_SAAS_LINK=https://bill-easy-production.up.railway.app
VERCEL_SAAS_LINK=https://charisbilleasy.store

# Server
PORT=3001
NODE_ENV=production
```

### 3. Main SaaS Frontend (Vercel)

```env
VITE_BACKEND_URL=https://bill-easy-production.up.railway.app
```

### 4. Admin Frontend (Vercel) - NEW PROJECT

```env
VITE_ADMIN_API_URL=https://your-admin-backend.up.railway.app
VITE_ADMIN_SECRET=your_super_secret_key_here
```

---

## Deployment Steps

### Step 1: Create Admin Backend Service (Railway)

1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your `bill-easy` repo
4. **CRITICAL**: Set Root Directory to `admin/backend`
5. Add Environment Variables (from section above)
6. Deploy

**Result**: `https://admin-bill-easy-production.up.railway.app`

### Step 2: Create Admin Frontend Project (Vercel)

1. Go to https://vercel.com
2. Click "Add New Project"
3. Import your `bill-easy` repo
4. **CRITICAL**: 
   - Root Directory: `admin/frontend`
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add Environment Variables:
   ```
   VITE_ADMIN_API_URL=https://admin-bill-easy-production.up.railway.app
   VITE_ADMIN_SECRET=your_super_secret_key_here
   ```
6. Deploy

**Result**: `https://admin-bill-easy.vercel.app`

### Step 3: Add Custom Domain (Optional but Recommended)

In Vercel Admin Project:
1. Go to Settings → Domains
2. Add `admin.charisbilleasy.store`
3. Update DNS (CNAME to Vercel)

---

## Access Control (Only YOU)

### How Admin Authentication Works

1. **Admin Frontend** sends `x-admin-secret` header with every request
2. **Admin Backend** validates against `ADMIN_SECRET` env variable
3. **If secret matches**: Access granted
4. **If secret missing/invalid**: 403 Forbidden

### Example API Call

```javascript
fetch('https://admin-backend.up.railway.app/api/dashboard/summary', {
  headers: {
    'x-admin-secret': 'your_super_secret_key_here',
    'Content-Type': 'application/json'
  }
})
```

---

## Features That Sync Between Admin ↔ Main SaaS

| Feature | Admin Changes | Reflects on Main SaaS |
|---------|--------------|----------------------|
| Plans/Pricing | ✅ Edit plans | ✅ Immediate update |
| Subscriptions | ✅ Upgrade/Downgrade | ✅ Immediate update |
| Users | ✅ Activate/Deactivate | ✅ Immediate update |
| Coupons | ✅ Create/Edit | ✅ Immediate update |
| Companies | ✅ Manage | ✅ Immediate update |
| Reports | ✅ View analytics | ✅ Real-time data |

---

## Troubleshooting

### Admin shows different data than Main SaaS?
- Check both services use SAME `DATABASE_URL`
- Verify no connection pooling issues

### Can't access admin?
- Verify `ADMIN_SECRET` is set in both Railway and Vercel
- Check CORS settings include your admin frontend URL
- Check browser console for errors

### Subscription changes not reflecting?
- Both services must connect to same DB
- Check `saasDB` connection in admin logs
- Verify no caching issues

---

## Security Checklist

- [ ] `ADMIN_SECRET` is strong (min 32 chars, random)
- [ ] `ADMIN_SECRET` never committed to git
- [ ] Admin frontend on separate domain
- [ ] Admin backend CORS restricted to admin frontend only
- [ ] Main SaaS doesn't expose admin routes
- [ ] Database credentials rotated regularly
