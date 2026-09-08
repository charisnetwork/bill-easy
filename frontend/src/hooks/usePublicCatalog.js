import { useEffect, useState } from 'react';

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
  return Array.from(uniquePlans.values());
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
