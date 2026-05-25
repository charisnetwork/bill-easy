# Bill Easy Deployment Guide

## Changes Made

### 1. Frontend API Configuration
- **File**: `frontend/src/services/api.jsx`
- **Change**: Updated `BASE_URL` to `https://billeasy-admin-backend.onrender.com`

### 2. Footer Component API Call
- **File**: `frontend/src/components/Footer.jsx`
- **Change**: Updated enquiries API endpoint to `https://billeasy-admin-backend.onrender.com/api/enquiries`

### 3. Backend CORS Configuration
- **File**: `backend/server.js`
- **Change**: Updated allowed origins to include `https://admin.charisbilleasy.store`

### 4. Render Configuration
- **File**: `render.yaml`
- **Changes**:
  - Updated service names:
    - Backend: `billeasy-admin-backend-app`
    - Frontend: `billeasy-admin-frontend-app`
  - Updated environment variables:
    - `VITE_BACKEND_URL`: `https://billeasy-admin-backend.onrender.com`
    - `REACT_APP_BACKEND_URL`: `https://billeasy-admin-backend.onrender.com`

## Deploy to Render

### Option 1: Using Render Blueprint (Recommended)

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "Blueprints" in the left sidebar
3. Click "New Blueprint Instance"
4. Connect your GitHub repository: `charisnetwork/bill-easy`
5. Render will automatically detect the `render.yaml` and create the services

### Option 2: Manual Service Creation

If you already have services created, you need to update them:

#### Backend Service:
1. Go to your backend service on Render
2. Click "Settings"
3. Update the following:
   - **Name**: `billeasy-admin-backend-app` (or keep existing)
   - **Root Directory**: `backend`
   - **Build Command**: `npm install --force --legacy-peer-deps`
   - **Start Command**: `npm start`
4. Environment Variables:
   - `DATABASE_URL`: (your PostgreSQL connection string)
   - `JWT_SECRET`: (generate a secure secret)
   - `NODE_ENV`: `production`
   - `RAZORPAY_KEY_ID`: (your Razorpay key)
   - `RAZORPAY_KEY_SECRET`: (your Razorpay secret)
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`: (your SMTP settings)

#### Frontend Service:
1. Go to your frontend service on Render
2. Click "Settings"
3. Update the following:
   - **Name**: `billeasy-admin-frontend-app` (or keep existing)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install --force --legacy-peer-deps && npm run build`
   - **Publish Directory**: `dist`
4. Environment Variables:
   - `VITE_BACKEND_URL`: `https://billeasy-admin-backend.onrender.com`
   - `REACT_APP_BACKEND_URL`: `https://billeasy-admin-backend.onrender.com`
   - `VITE_RAZORPAY_KEY_ID`: (your Razorpay key)
5. Add a rewrite rule:
   - Source: `/*`
   - Destination: `/index.html`

### Option 3: Deploy via Render Connect (Auto-deploy)

If you already have the blueprint set up:
1. Push to main branch (already done ✓)
2. Render should automatically deploy the changes
3. Check the deploy logs on Render dashboard

## After Deployment

### Verify the Deployment:

1. **Backend Health Check**:
   ```
   https://billeasy-admin-backend.onrender.com/api/health
   ```
   Should return: `{"status":"ok","timestamp":"..."}`

2. **Frontend URL**:
   ```
   https://admin.charisbilleasy.store/
   ```
   Should load the application

3. **CORS Test**:
   Open browser console on the frontend and verify API calls are working without CORS errors

### Custom Domain Setup (if needed):

If you want to use `https://admin.charisbilleasy.store/` as your custom domain:

1. Go to your frontend service on Render
2. Click "Settings" → "Custom Domains"
3. Add your domain: `admin.charisbilleasy.store`
4. Follow Render's instructions to configure DNS records
5. Wait for SSL certificate to be issued

## Troubleshooting

### Build Failures:
- Check build logs on Render dashboard
- Ensure `package.json` has correct scripts
- Check for missing dependencies

### API Connection Issues:
- Verify `VITE_BACKEND_URL` is set correctly in frontend environment
- Check backend CORS settings include the frontend URL
- Verify backend service is running

### Database Connection:
- Ensure `DATABASE_URL` environment variable is set
- Check database is accessible from Render
- Verify migrations run successfully

## Service URLs Summary

| Service | URL | Local Path |
|---------|-----|------------|
| Main Backend | https://billeasy-admin-backend.onrender.com | /backend |
| Main Frontend | https://admin.charisbilleasy.store/ | /frontend |
| Admin Backend | https://billeasy-admin-backend.onrender.com | /admin/backend |
| Admin Frontend | (existing) | /admin/frontend |

## Notes

- The admin folder is already working and was not modified for the API URLs
- Both main and admin apps share the same backend URL: `https://billeasy-admin-backend.onrender.com`
- The frontend uses Vite for building (output to `dist` folder)
