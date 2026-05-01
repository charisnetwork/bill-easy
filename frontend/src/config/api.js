// =========================================
// API Configuration for Vercel + Railway Setup
// =========================================

// Get backend URL from environment
let envBackendUrl = 
  import.meta.env?.VITE_BACKEND_URL ||
  import.meta.env?.REACT_APP_BACKEND_URL;

// Sanitize: Remove trailing slash if present
if (envBackendUrl && envBackendUrl.endsWith('/')) {
  envBackendUrl = envBackendUrl.slice(0, -1);
}

// In production, force use of the environment variable
export const BACKEND_URL = envBackendUrl || '';
export const API_BASE_URL = `${BACKEND_URL}/api`;

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

  // Mask internal errors in production for security and privacy
  if (error?.code === 'ERR_NETWORK' || error?.message?.includes('Network Error')) {
    return 'Server connection failed. Please check your internet or contact support.';
  }

  if (error?.response?.status === 404) {
    return 'Requested resource not found.';
  }

  // If it's an Axios error with response
  if (error?.response?.data) {
    const data = error.response.data;
    if (typeof data.error === 'string') return data.error;
    if (typeof data.message === 'string') return data.message;
    return defaultMessage;
  }

  return error?.message || defaultMessage;
};

export default {
  BACKEND_URL,
  API_BASE_URL,
  getAssetUrl,
  getErrorMessage
};
