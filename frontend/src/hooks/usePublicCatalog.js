import { useEffect, useState } from 'react';

const catalogBaseUrl = () => {
  const configured = import.meta.env?.VITE_PUBLIC_CONTROL_CENTER_URL || '';
  return configured ? configured.replace(/\/$/, '') : null;
};

const normalizeCatalog = (payload) => {
  const plans = Array.isArray(payload) ? payload : payload?.plans || payload?.data?.plans || [];
  return plans.map((plan) => ({
    id: plan.id || plan.planId || plan.code,
    code: plan.code || '',
    name: plan.name || plan.title || plan.displayName || plan.code || 'Plan',
    description: plan.publicDescription || plan.description || '',
    badge: plan.badge || null,
    recommended: Boolean(plan.recommended),
    features: plan.features || [],
    limits: plan.limits || {},
    perks: plan.perks || [],
    prices: plan.prices || plan.priceOptions || plan.durationPricing || []
  }));
};

/** Fetches the unauthenticated Control Centre catalog without sending credentials. */
export function usePublicCatalog(applicationSlug = 'billeasy') {
  const [state, setState] = useState({ loading: true, catalog: null, unavailable: false });

  useEffect(() => {
    const baseUrl = catalogBaseUrl();
    if (!baseUrl) {
      setState({ loading: false, catalog: null, unavailable: true });
      return undefined;
    }

    const controller = new AbortController();
    fetch(`${baseUrl}/api/public/catalog/${encodeURIComponent(applicationSlug)}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error('Public catalog is unavailable');
        return normalizeCatalog(await response.json());
      })
      .then((catalog) => setState({ loading: false, catalog, unavailable: false }))
      .catch((error) => {
        if (error.name !== 'AbortError') setState({ loading: false, catalog: null, unavailable: true });
      });

    return () => controller.abort();
  }, [applicationSlug]);

  return state;
}
