import { useEffect, useState } from 'react';
import { subscriptionAPI } from '../services/api';

/** Months covered by one plan term, for "per month" display. */
const termMonths = (plan) => {
  const n = Number(plan.duration_value) || 1;
  if (plan.duration_unit === 'year') return n * 12;
  if (plan.duration_unit === 'month') return n;
  return null;
};

/**
 * Public plan cards for the landing page, from Charis OS via Bill Easy's backend.
 * Monthly and yearly versions of a tier share a pricing group and become one card.
 */
export function usePlanCatalog() {
  const [state, setState] = useState({ loading: true, plans: [], unavailable: false });

  useEffect(() => {
    let cancelled = false;
    subscriptionAPI.getPlans()
      .then(({ data }) => {
        const groups = new Map();
        for (const plan of data.plans || []) groups.set(plan.pricing_group, [...(groups.get(plan.pricing_group) || []), plan]);
        const plans = [...groups.values()].map((terms) => {
          const monthly = terms.find((p) => termMonths(p) === 1) || terms[0];
          return { ...monthly, months: termMonths(monthly) };
        });
        if (!cancelled) setState({ loading: false, plans, unavailable: plans.length === 0 });
      })
      .catch(() => { if (!cancelled) setState({ loading: false, plans: [], unavailable: true }); });
    return () => { cancelled = true; };
  }, []);

  return state;
}
