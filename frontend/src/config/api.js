// =========================================
// API Configuration for Vercel + Railway Setup
// =========================================
// 
// DEPLOYMENT SETUP:
// - Frontend: Vercel (https://your-app.vercel.app)
// - Backend: Railway (https://your-app.up.railway.app)
//
// REQUIRED ENV VARIABLE IN VERCEL:
// VITE_BACKEND_URL=https://your-railway-app.up.railway.app
//
// OPTIONAL (for custom domain):
// VITE_BACKEND_URL=https://api.yourdomain.com

// Fallback Railway backend URL (update this with your actual Railway URL)
const RAILWAY_BACKEND_URL = 'https://your-app.up.railway.app';

// Get backend URL from environment or use fallback
export const BACKEND_URL = 
  import.meta.env?.VITE_BACKEND_URL || 
  process.env.REACT_APP_BACKEND_URL || 
  RAILWAY_BACKEND_URL;

export const API_BASE_URL = `${BACKEND_URL}/api`;

// Helper to construct full asset URLs (images, PDFs, etc.)
export const getAssetUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${BACKEND_URL}/uploads${cleanPath}`;
};

export default {
  BACKEND_URL,
  API_BASE_URL,
  getAssetUrl
};
