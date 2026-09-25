import { useEffect, useState } from 'react';

const CACHE_KEY = 'billeasy_public_catalog';
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

const catalogBaseUrl = () => {
  const configured = import.meta.env?.VITE_PUBLIC_CONTROL_CENTER_URL || '';
  return configured ? configured.replace(/\/$/, '') : 'https://chariscontrol-production.up.railway.app';
};

const normalizeCatalog = (payload) => {
  let plans = Array.isArray(payload) ? payload : (payload?.plans || payload?.data?.plans || []);
  if ((!plans || plans.length === 0) && payload?.subscriptionModels?.[0]?.plans) {
    plans = payload.subscriptionModels[0].plans;
  }
  const normalizedPlans = (plans || []).map((plan) => {
    // Build entitlements map from either flat object or features array
    let entitlements = plan.entitlements || null;
    if (!entitlements && Array.isArray(plan.features) && plan.features.length > 0 && plan.features[0]?.code) {
      entitlements = {};
      plan.features.forEach(f => { entitlements[f.code] = Boolean(f.isEnabled); });
    }

    const explicitPrices = plan.prices || plan.priceOptions || plan.durationPricing || [];
    const fallbackMonthlyPrice = plan.priceMonthly ?? plan.monthlyPrice;
    const prices = explicitPrices.length > 0 || fallbackMonthlyPrice === undefined || fallbackMonthlyPrice === null
      ? explicitPrices
      : [{ durationMonths: 1, currency: plan.currency || 'INR', amount: fallbackMonthlyPrice }];

    return {
      id: plan.id || plan.planId || plan.code,
      code: plan.code || '',
      name: plan.name || plan.title || plan.displayName || plan.code || 'Plan',
      description: plan.publicDescription || plan.description || '',
      badge: plan.badge || null,
      recommended: Boolean(plan.recommended || plan.isRecommended),
      entitlements,
      features: plan.features || [],
      limits: plan.limits || {},
      perks: plan.perks || [],
      pricingMatrix: plan.pricingMatrix || {},
      priceMonthly: plan.priceMonthly || 0,
      priceYearly: plan.priceYearly || 0,
      currency: plan.currency || 'INR',
      prices
    };
  });

  // A stale or duplicated product mapping must not result in duplicate checkout
  // choices. Test-only catalog rows are never customer-facing pricing offers.
  const uniquePlans = new Map();
  for (const plan of normalizedPlans) {
    const key = plan.name.trim().toLowerCase();
    if (!key || key === 'test') continue;
    const existing = uniquePlans.get(key);
    const planPrice = Number(plan.prices[0]?.amount ?? plan.priceMonthly ?? 0);
    const existingPrice = Number(existing?.prices[0]?.amount ?? existing?.priceMonthly ?? 0);
    const planCompleteness = plan.features.length + (planPrice > 0 ? 1 : 0);
    const existingCompleteness = (existing?.features.length || 0) + (existingPrice > 0 ? 1 : 0);
    if (!existing || planCompleteness > existingCompleteness) uniquePlans.set(key, plan);
  }
  const planOrder = ['free account', 'starter plan', 'pro plan', 'enterprise plan'];
  return Array.from(uniquePlans.values()).sort((left, right) => {
    const leftIndex = planOrder.indexOf(left.name.trim().toLowerCase());
    const rightIndex = planOrder.indexOf(right.name.trim().toLowerCase());
    return (leftIndex === -1 ? planOrder.length : leftIndex) - (rightIndex === -1 ? planOrder.length : rightIndex);
  });
};

/**
 * Try to load catalog from sessionStorage cache.
 * Returns null if expired or unavailable.
 */
function loadCachedCatalog() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { catalog, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp > CACHE_TTL_MS) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }
    return catalog;
  } catch {
    return null;
  }
}

function saveCatalogToCache(catalog) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ catalog, timestamp: Date.now() }));
  } catch {
    // sessionStorage full or unavailable — ignore
  }
}

/** Fetches the unauthenticated Control Centre catalog without sending credentials. */
export function usePublicCatalog(applicationSlug = 'billeasy') {
  const [state, setState] = useState(() => {
    const cached = loadCachedCatalog();
    if (cached) return { loading: false, catalog: cached, unavailable: false };
    return { loading: true, catalog: null, unavailable: false };
  });

  useEffect(() => {
    // If we already have cached data, skip fetch
    const cached = loadCachedCatalog();
    if (cached) {
      setState({ loading: false, catalog: cached, unavailable: false });
      return undefined;
    }

    const baseUrl = catalogBaseUrl();
    if (!baseUrl) {
      setState({ loading: false, catalog: null, unavailable: true });
      return undefined;
    }

    const controller = new AbortController();
    const MAX_RETRIES = 2;
    let attempt = 0;

    const fetchCatalog = () => {
      attempt++;
      fetch(`${baseUrl}/api/public/catalog/${encodeURIComponent(applicationSlug)}`, { 
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      })
        .then(async (response) => {
          if (!response.ok) throw new Error(`Catalog HTTP ${response.status}`);
          return normalizeCatalog(await response.json());
        })
        .then((catalog) => {
          saveCatalogToCache(catalog);
          setState({ loading: false, catalog, unavailable: false });
        })
        .catch((error) => {
          if (error.name === 'AbortError') return;
          if (attempt < MAX_RETRIES) {
            // Exponential backoff: 1s, 2s
            const delay = Math.pow(2, attempt - 1) * 1000;
            setTimeout(fetchCatalog, delay);
          } else {
            // All retries exhausted — mark as unavailable, use local plans
            setState({ loading: false, catalog: null, unavailable: true });
          }
        });
    };

    fetchCatalog();
    return () => controller.abort();
  }, [applicationSlug]);

  return state;
}
