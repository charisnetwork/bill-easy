// =========================================
// API Configuration — Web + Android (Capacitor)
// =========================================
//
// Priority:
//   1. VITE_BACKEND_URL env var (set in Cloudflare / Capacitor build)
//   2. Auto-detect if running as native Android app → use production URL
//   3. Fallback to localhost for local dev

import { Capacitor } from '@capacitor/core';

let envBackendUrl =
  import.meta.env?.VITE_BACKEND_URL ||
  import.meta.env?.REACT_APP_BACKEND_URL ||
  '';

// Sanitize: Remove trailing slash
if (envBackendUrl && envBackendUrl.endsWith('/')) {
  envBackendUrl = envBackendUrl.slice(0, -1);
}

// Ensure URL has protocol
if (envBackendUrl && !envBackendUrl.startsWith('http')) {
  envBackendUrl = 'https://' + envBackendUrl;
}

// When running as a native Android/iOS app, 'localhost' doesn't point to a server.
// Always use the production Railway URL in native context.
const isNative = Capacitor.isNativePlatform();

if (isNative && (!envBackendUrl || envBackendUrl.includes('localhost'))) {
  // Fallback to production if env not set in native build
  // Set VITE_BACKEND_URL in your capacitor build env to override this
  envBackendUrl = 'https://bill-easy-production.up.railway.app';
  console.warn('[API] Native platform detected — using production backend. Set VITE_BACKEND_URL to override.');
} else if (!envBackendUrl || envBackendUrl.includes('localhost:')) {
  envBackendUrl = 'http://localhost:8001';
}

export const IS_NATIVE = isNative;
export const BACKEND_URL = envBackendUrl;
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

  // Handle network errors (backend not running)
  if (error?.code === 'ERR_NETWORK' || error?.message?.includes('Network Error')) {
    return isNative
      ? 'Cannot connect to server. Check your internet connection.'
      : 'Cannot connect to server. Please make sure the backend is running.';
  }

  // Handle 404 errors specifically
  if (error?.response?.status === 404) {
    const url = error.config?.url || 'unknown endpoint';
    return `API endpoint not found: ${url}. Please check the backend URL configuration.`;
  }

  // If it's an Axios error with response
  if (error?.response?.data) {
    const data = error.response.data;

    if (typeof data.error === 'string') return data.error;
    if (typeof data.error?.message === 'string') return data.error.message;
    if (typeof data.message === 'string') return data.message;

    if (Array.isArray(data.errors) && data.errors.length > 0) {
      return data.errors[0].msg || data.errors[0].message || 'Validation error';
    }

    if (typeof data === 'object' && data !== null) {
      if (data.message && typeof data.message === 'string') return data.message;
      return defaultMessage;
    }

    return String(data);
  }

  if (typeof error?.message === 'string') return error.message;
  if (typeof error === 'object' && error !== null) return defaultMessage;

  return defaultMessage;
};

export default {
  BACKEND_URL,
  API_BASE_URL,
  IS_NATIVE,
  getAssetUrl,
  getErrorMessage
};
