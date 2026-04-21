// =========================================
// API Configuration for Vercel + Railway Setup
// =========================================
//
// REQUIRED ENV VARIABLE IN VERCEL:
// VITE_BACKEND_URL=https://your-railway-app.up.railway.app

// Railway backend URL - REPLACE THIS WITH YOUR ACTUAL RAILWAY URL
const RAILWAY_BACKEND_URL = 'https://industrious-harmony-production-6331.up.railway.app';

// Get backend URL from environment
// In production Vercel, we prefer relative paths to use the proxy in vercel.json
let envBackendUrl = 
  import.meta.env?.VITE_BACKEND_URL ||
  import.meta.env?.REACT_APP_BACKEND_URL ||
  process.env.REACT_APP_BACKEND_URL;

// Sanitize: Remove trailing slash if present
if (envBackendUrl && envBackendUrl.endsWith('/')) {
  envBackendUrl = envBackendUrl.slice(0, -1);
}

export const BACKEND_URL = 
  envBackendUrl || 
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? '' : RAILWAY_BACKEND_URL);

export const API_BASE_URL = BACKEND_URL ? `${BACKEND_URL}/api` : '/api';

console.log('[API Config] Backend URL:', BACKEND_URL || '(relative)');
console.log('[API Config] API Base URL:', API_BASE_URL);

// Helper to construct full asset URLs (images, PDFs, etc.)
export const getAssetUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${BACKEND_URL}/uploads${cleanPath}`;
};

// Helper to normalize API errors to strings
export const getErrorMessage = (error, defaultMessage = 'An error occurred') => {
  // If it's already a string, return it
  if (typeof error === 'string') return error;

  // Handle network errors (backend not running)
  if (error?.code === 'ERR_NETWORK' || error?.message?.includes('Network Error')) {
    return 'Cannot connect to server. Please make sure the backend is running.';
  }

  // If it's an Axios error with response
  if (error?.response?.data) {
    const data = error.response.data;
    
    // Handle { error: 'message' }
    if (typeof data.error === 'string') return data.error;
    
    // Handle { error: { message: '...' } }
    if (typeof data.error?.message === 'string') return data.error.message;
    
    // Handle { message: '...' }
    if (typeof data.message === 'string') return data.message;

    // Handle { errors: [...] } from express-validator
    if (Array.isArray(data.errors) && data.errors.length > 0) {
      return data.errors[0].msg || data.errors[0].message || 'Validation error';
    }
    
    // Stringify the data object if it's an object but not a string
    if (typeof data === 'object' && data !== null) {
      // If it's { code, message }, return message or stringify
      if (data.message && typeof data.message === 'string') return data.message;
      // Return default message instead of JSON to avoid rendering objects
      return defaultMessage;
    }

    return String(data);
  }

  // If error has message property
  if (typeof error?.message === 'string') return error.message;
  
  // If error is an object, return default message
  if (typeof error === 'object' && error !== null) {
    return defaultMessage;
  }

  // Default fallback
  return defaultMessage;
};

export default {
  BACKEND_URL,
  API_BASE_URL,
  getAssetUrl,
  getErrorMessage
};
