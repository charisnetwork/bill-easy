// =========================================
// API Configuration — Web + Android (Capacitor)
// =========================================
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

const isNative = Capacitor.isNativePlatform();

// Fallback logic for Native
if (isNative && (!envBackendUrl || envBackendUrl.includes('localhost'))) {
  // If no valid URL is found in .env, fallback to production
  envBackendUrl = 'https://bill-easy-production-v4.up.railway.app';
}

export const IS_NATIVE = isNative;
export const BACKEND_URL = envBackendUrl;
export const API_BASE_URL = `${BACKEND_URL}/api`;

export const getAssetUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${BACKEND_URL}/uploads${cleanPath}`;
};

export const getErrorMessage = (error, defaultMessage = 'An error occurred') => {
  if (typeof error === 'string') return error;

  if (error?.code === 'ERR_NETWORK' || error?.message?.includes('Network Error')) {
    return isNative
      ? `Cannot connect to server at ${BACKEND_URL}. Check your internet connection or IP address.`
      : 'Cannot connect to server. Please make sure the backend is running.';
  }

  if (error?.response?.data) {
    const data = error.response.data;
    if (typeof data.error === 'string') return data.error;
    if (data.message && typeof data.message === 'string') return data.message;
    return defaultMessage;
  }

  return error?.message || defaultMessage;
};

export default {
  BACKEND_URL,
  API_BASE_URL,
  IS_NATIVE,
  getAssetUrl,
  getErrorMessage
};
