/**
 * Google Analytics 4 integration
 *
 * Usage:
 *   1. Set VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX in your Cloudflare/Vercel env vars.
 *   2. Call usePageTracking() inside BrowserRouter in App.jsx.
 *   3. Use trackEvent() anywhere in the app for custom events.
 *
 * No tracking happens if VITE_GA_MEASUREMENT_ID is not set.
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const GA_ID = 'G-HMTBF15XC3';

// Push to GA4's dataLayer queue (gtag.js loaded in index.html)
const gtag = (...args) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag(...args);
  }
};

/**
 * Track custom events (e.g. button clicks, plan upgrades, invoice created)
 *
 * @param {string} eventName - GA4 event name (snake_case recommended)
 * @param {Object} params    - Additional parameters (value, currency, etc.)
 *
 * @example
 *   trackEvent('invoice_created', { plan: 'Premium', invoice_count: 5 });
 *   trackEvent('plan_upgrade', { from: 'Free', to: 'Premium', value: 499 });
 */
export const trackEvent = (eventName, params = {}) => {
  if (!GA_ID) return;
  gtag('event', eventName, params);
};

/**
 * Auto-tracks page views on every route change.
 * Call this ONCE inside <BrowserRouter> in App.jsx.
 */
export const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    if (!GA_ID) return;

    gtag('config', GA_ID, {
      page_path: location.pathname + location.search,
      page_title: document.title
    });
  }, [location]);
};
