// Centralized API configuration
// Uses VITE_BACKEND_URL for Vite environments, with fallback to Railway production URL

const RAILWAY_BACKEND_URL = 'https://industrious-harmony-production-1525.up.railway.app';

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
