import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { subscriptionAPI } from '../services/api';
import { getErrorMessage } from '../config/api';
import { Card, CardContent } from '../components/ui/card';
import { Check, ChevronDown, Crown, Loader2, Tag, X } from 'lucide-react';
import { toast } from 'sonner';

// Plans, prices, coupons and payment verification come from Charis OS.
// The browser only chooses a plan/coupon; the server derives amount and customer.
// Feature names and groups are published by this app to OS (BILLEASY_FEATURES).

const money = (amount, currency = 'INR') =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: Number(amount) % 1 ? 2 : 0 }).format(Number(amount) || 0);
const PERIODS = { month: 'Monthly', year: 'Yearly' };
const RESET = { total: '', monthly: '/month', daily: '/day', yearly: '/year', billing_cycle: '/term' };
const ACCENTS = ['text-orange-600', 'text-indigo-700', 'text-emerald-600', 'text-sky-700'];
// A card stands for a tier; drop the period word when monthly/yearly share one card.
const tierName = (plan, grouped) => (grouped ? plan.name.replace(/\s+(monthly|yearly|annual|annually)$/i, '') : plan.name);
// Per-month equivalents of yearly prices are shown rounded; the yearly total is exact.
const perMonth = (amount) => Math.round(amount / 12);

const featureLine = (f) => {
  const period = RESET[f.reset_period] && !/month|year|day/i.test(f.name) ? ` ${RESET[f.reset_period].replace('/', 'per ')}` : '';
  // "1 Business", not "1 Businesses".
  const singular = (word) => (/esses$/.test(word) ? word.replace(/esses$/, 'ess') : word.replace(/([^s])s$/, '$1'));
  const name = Number(f.limit_value) === 1 ? singular(f.name) : f.name;
  if (f.limit_type === 'limited') return { strong: Number(f.limit_value).toLocaleString('en-IN'), text: `${name}${period}` };
  if (f.limit_type === 'unlimited' && ['invoices', 'products', 'businesses'].includes(f.feature_code)) return { strong: 'Unlimited', text: f.name };
  return { strong: null, text: f.name };
};

/** Group monthly/yearly versions of a tier into one card. */
function useCards(plans, period) {
  return useMemo(() => {
    const groups = new Map();
    for (const plan of plans) groups.set(plan.pricing_group, [...(groups.get(plan.pricing_group) || []), plan]);
    return [...groups.values()].map((variants) => ({ ...(variants.find((p) => p.duration_unit === period && p.duration_value === 1) || variants[0]), grouped: variants.length > 1 }));
  }, [plans, period]);
}

const UsageCard = ({ title, entry, unit }) => (
  <Card className="bg-white border-slate-100">
    <CardContent className="p-5">
      <span className="text-sm font-medium text-slate-500">{title}</span>
      {!entry.included ? <p className="mt-2 text-sm text-slate-500">Not included in your plan</p>
        : entry.unlimited ? <p className="mt-2 text-xl font-bold text-slate-800">{entry.used} <span className="text-sm font-normal text-slate-400">{unit} · unlimited</span></p>
          : <>
            <div className="mt-2 w-full bg-slate-100 h-2 rounded-full overflow-hidden"><div className={`h-full ${entry.percentage >= 90 ? 'bg-orange-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, entry.percentage)}%` }} /></div>
            <p className="mt-2 text-xs text-slate-500 font-medium">{entry.used} / {entry.limit} {unit}</p>
          </>}
    </CardContent>
  </Card>
);

const PriceBlock = ({ plan, quote }) => {
  const yearly = plan.duration_unit === 'year' && plan.duration_value === 1;
  const final = quote ? Number(quote.final_price) : plan.price;
  const was = quote && Number(quote.discount_amount) > 0 ? plan.price : plan.compare_at_price;
  if (plan.price === 0) return <p className="text-4xl font-extrabold text-slate-900">Free</p>;
  return (
    <div>
      <p className="flex items-baseline gap-2 flex-wrap">
        {was ? <span className="text-2xl font-bold text-slate-400 line-through">{money(yearly ? perMonth(was) : was, plan.currency)}</span> : null}
        <span className="text-4xl font-extrabold text-slate-900">{money(yearly ? perMonth(final) : final, plan.currency)}</span>
        <span className="text-slate-500">/{yearly ? 'month' : plan.duration_value === 1 ? plan.duration_unit : `${plan.duration_value} ${plan.duration_unit}s`}</span>
      </p>
      {yearly && <p className="mt-1 text-sm text-slate-600">Pay {was ? <span className="line-through text-slate-400">{money(was, plan.currency)}</span> : null} {money(final, plan.currency)}/year. Billed annually</p>}
      {quote && Number(quote.discount_amount) > 0 && <p className="mt-1 text-xs font-semibold text-emerald-700">Code {quote.coupon_code}: you save {money(quote.discount_amount, plan.currency)}</p>}
    </div>
  );
};

export const CharisOsSubscription = ({ current: initialCurrent }) => {
  const [current, setCurrent] = useState(initialCurrent);
  const [catalog, setCatalog] = useState({ plans: [], features: [], checkout_enabled: false });
  const [usage, setUsage] = useState(null);
  const [checkout, setCheckout] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponFor, setCouponFor] = useState(null);
  const [quote, setQuote] = useState(null);
  const [busyPlan, setBusyPlan] = useState(null);
  const [period, setPeriod] = useState('year');
  const [showCompare, setShowCompare] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const [plans, cur, use] = await Promise.all([subscriptionAPI.getPlans(), subscriptionAPI.getCurrent(), subscriptionAPI.getUsage()]);
      setCatalog(plans.data);
      setCurrent(cur.data);
      setUsage(use.data);
      try { setCheckout((await subscriptionAPI.getCheckout()).data); } catch { setCheckout(null); } // Owners only.
    } catch (error) {
      toast.error(getErrorMessage(error, 'Subscription details are temporarily unavailable'));
    }
  }, []);
  useEffect(() => { refresh(); }, [refresh]);

  const periods = useMemo(() => [...new Set(catalog.plans.filter((p) => p.price > 0 && p.duration_value === 1).map((p) => p.duration_unit))].filter((u) => PERIODS[u]), [catalog.plans]);
  useEffect(() => { if (periods.length && !periods.includes(period)) setPeriod(periods[0]); }, [periods, period]);
  const cards = useCards(catalog.plans, period);

  const applyCoupon = async (plan) => {
    const code = couponCode.trim().toUpperCase();
    if (!code) return;
    try {
      setBusyPlan(plan.id);
      const res = await subscriptionAPI.quote({ plan_id: plan.id, coupon_code: code });
      setQuote({ ...res.data, plan_id: plan.id });
      toast.success(`Coupon ${res.data.coupon_code} applied`);
    } catch (error) {
      setQuote(null);
      toast.error(getErrorMessage(error, 'This coupon cannot be used for this plan'));
    } finally {
      setBusyPlan(null);
    }
  };

  const openPayment = (order, plan) => new Promise((resolve) => {
    if (!window.Razorpay) { toast.error('Payment window could not load. Check your connection and retry.'); resolve(); return; }
    const rzp = new window.Razorpay({
      key: order.key_id, amount: order.amount_minor, currency: order.currency, order_id: order.order_id,
      name: 'Bill Easy', description: `${plan?.name || 'Plan'} subscription`, theme: { color: '#4f46e5' },
      handler: async (response) => {
        try {
          const res = await subscriptionAPI.verifyPayment({ razorpay_order_id: response.razorpay_order_id, razorpay_payment_id: response.razorpay_payment_id, razorpay_signature: response.razorpay_signature });
          if (res.data.checkout?.status === 'paid') toast.success('Payment verified. Your plan is active.');
          else toast.info('Payment received. It is being reviewed; you will not be charged again.');
        } catch (error) {
          toast.error(getErrorMessage(error, 'Payment received but not yet verified. Do not pay again; refresh in a minute.'));
        } finally {
          await refresh();
          resolve();
        }
      },
      modal: { ondismiss: () => resolve() },
    });
    rzp.on?.('payment.failed', (event) => toast.error(event?.error?.description || 'Payment failed. No money was taken; please try again.'));
    rzp.open();
  });

  const choose = async (plan) => {
    const term = checkout?.current_term;
    const activeTerm = term && ['active', 'suspended'].includes(term.status) && (!term.ends_at || new Date(term.ends_at) > new Date());
    if (activeTerm && term.plan_id === plan.id) { toast.info('This plan is already active.'); return; }
    if (activeTerm && plan.price > 0 && !window.confirm(`Switch to ${plan.name} now? Your current plan ends immediately and the new plan starts for a full term. Unused time is not credited.`)) return;
    const coupon = quote?.plan_id === plan.id ? quote.coupon_code : null;
    try {
      setBusyPlan(plan.id);
      const res = await subscriptionAPI.createOrder({
        plan_id: plan.id, idempotency_key: crypto.randomUUID(), coupon_code: coupon,
        ...(term ? { previous_subscription_id: term.id, previous_version: term.version, replacement_acknowledged: Boolean(activeTerm) } : {}),
      });
      if (!res.data.checkout) { toast.success(`${plan.name} is now active.`); await refresh(); return; }
      await openPayment(res.data.checkout, plan);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not start checkout'));
      await refresh();
    } finally {
      setBusyPlan(null);
    }
  };

  const pending = (checkout?.checkouts || []).find((c) => c.status === 'ready');
  const status = current?.status;
  const groups = useMemo(() => {
    const map = new Map();
    for (const f of catalog.features || []) map.set(f.group || 'Other', [...(map.get(f.group || 'Other') || []), f]);
    return [...map.entries()];
  }, [catalog.features]);
  const cell = (plan, code) => {
    const f = plan.features.find((x) => x.feature_code === code);
    if (!f?.enabled) return <X className="w-4 h-4 text-slate-300 mx-auto" />;
    if (f.limit_type === 'limited') return <span className="font-semibold text-slate-800">{Number(f.limit_value).toLocaleString('en-IN')}{RESET[f.reset_period] || ''}</span>;
    return <Check className="w-5 h-5 text-emerald-600 mx-auto" />;
  };

  return (
    <div className="max-w-[1300px] mx-auto p-4 md:p-10 bg-[#f6f7fb] min-h-full">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-white border-slate-100"><CardContent className="p-5">
          <span className="text-sm font-medium text-slate-500 block mb-1">Current plan</span>
          <p className="text-xl font-bold text-slate-800 flex items-center gap-2"><Crown className="w-5 h-5 text-amber-500" />{current?.plan_name || 'No plan yet'}</p>
          <p className="text-xs text-slate-500 mt-1">{current?.ends_at ? `Valid until ${new Date(current.ends_at).toLocaleDateString('en-IN')}` : status === 'active' ? 'No expiry' : ''}{current?.shared_from_primary_business ? ' · shared from your first business' : ''}</p>
        </CardContent></Card>
        <Card className="bg-white border-slate-100"><CardContent className="p-5">
          <span className="text-sm font-medium text-slate-500 block mb-1">Status</span>
          <p className="text-xl font-bold text-slate-800 capitalize flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${status === 'active' ? 'bg-emerald-500' : 'bg-orange-500'}`} />{status || '…'}</p>
          {status && status !== 'active' && <p className="text-xs text-orange-600 mt-1">Choose a plan below to continue creating records.</p>}
        </CardContent></Card>
        {usage && <UsageCard title="Invoices this month" entry={usage.invoices} unit="invoices" />}
        {usage && <UsageCard title="Products" entry={usage.products} unit="products" />}
      </div>

      {pending && <Card className="mb-8 border-amber-200 bg-amber-50"><CardContent className="p-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-amber-900">You have an unfinished payment of {money(pending.amount_minor / 100)}. Resume it instead of starting a new one.</p>
        <button onClick={() => openPayment(pending, null)} className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700">Resume payment</button>
      </CardContent></Card>}

      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">Choose the right plan for your business</h1>
        <p className="mt-2 text-slate-600">Upgrade any time. Every price shown is the final amount charged.</p>
        {periods.length > 1 && <div className="mt-6 inline-flex rounded-xl bg-indigo-600 p-1">
          {periods.map((p) => <button key={p} onClick={() => setPeriod(p)} className={`px-6 py-2 rounded-lg text-sm font-semibold transition ${period === p ? 'bg-white text-indigo-700 shadow' : 'text-white'}`}>{PERIODS[p]}</button>)}
        </div>}
        {!catalog.checkout_enabled && <p className="mt-3 text-xs text-orange-600">Online payment is not enabled yet. Free plans can still be activated.</p>}
      </div>

      <div className={`grid gap-6 ${cards.length >= 3 ? 'lg:grid-cols-3' : 'md:grid-cols-2'} max-w-6xl mx-auto`}>
        {cards.map((plan, index) => {
          const isCurrent = current?.plan_id === plan.id && status === 'active';
          const planQuote = quote?.plan_id === plan.id ? quote : null;
          const freeLocked = plan.price === 0 && status === 'active' && !isCurrent;
          const highlight = Boolean(plan.badge || plan.recommended);
          const included = plan.features.filter((f) => f.enabled);
          const excluded = plan.features.filter((f) => !f.enabled);
          return (
            <div key={plan.pricing_group} className={`relative flex flex-col rounded-2xl bg-white p-7 ${highlight ? 'border-2 border-indigo-400 shadow-xl' : 'border border-slate-200 shadow-sm'}`}>
              {(plan.badge || plan.recommended) && <span className="absolute -top-3 right-6 rounded-full bg-orange-600 px-3 py-1 text-xs font-bold text-white">{plan.badge || 'Recommended'}</span>}
              <Crown className={`w-5 h-5 ${ACCENTS[index % ACCENTS.length]}`} />
              <h3 className={`mt-1 text-2xl font-extrabold ${ACCENTS[index % ACCENTS.length]}`}>{tierName(plan, plan.grouped)}</h3>
              <p className="mt-1 min-h-[1.5rem] text-sm font-medium text-indigo-700">{plan.tagline || plan.description}</p>
              <div className="mt-5 min-h-[5.5rem]"><PriceBlock plan={plan} quote={planQuote} /></div>
              <button disabled={isCurrent || freeLocked || (plan.price > 0 && !catalog.checkout_enabled) || Boolean(busyPlan) || Boolean(pending)} onClick={() => choose(plan)}
                className={`mt-2 w-full rounded-xl py-3 text-sm font-semibold transition disabled:opacity-50 ${highlight ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'border border-slate-300 text-indigo-700 hover:bg-indigo-50'}`}>
                {busyPlan === plan.id ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : isCurrent ? 'Current plan' : freeLocked ? 'Available after your plan ends' : plan.price === 0 ? 'Use free plan' : 'Choose plan'}
              </button>
              {plan.price > 0 && <div className="mt-3">
                {couponFor === plan.id ? <div className="flex gap-2">
                  <input value={couponCode} onChange={(e) => { setCouponCode(e.target.value); setQuote(null); }} placeholder="Coupon or partner code" aria-label="Coupon code" className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm uppercase" />
                  <button onClick={() => applyCoupon(plan)} disabled={!couponCode.trim() || Boolean(busyPlan)} className="rounded-lg bg-slate-800 px-3 text-sm font-semibold text-white disabled:opacity-40">Apply</button>
                </div> : <button onClick={() => { setCouponFor(plan.id); setQuote(null); }} className="text-sm text-indigo-700 hover:underline inline-flex items-center gap-1"><Tag className="w-3.5 h-3.5" />Have a coupon code?</button>}
              </div>}
              <hr className="my-6 border-slate-200" />
              <ul className="space-y-3 flex-1">
                {included.map((f) => { const line = featureLine(f); return <li key={f.feature_code} className="flex gap-3 text-[15px] text-slate-700"><Check className="w-5 h-5 text-emerald-600 shrink-0" /><span>{line.strong && <b>{line.strong} </b>}{line.text}</span></li>; })}
                {excluded.map((f) => <li key={f.feature_code} className="flex gap-3 text-[15px] text-slate-400"><X className="w-5 h-5 shrink-0" /><span>{f.name}</span></li>)}
              </ul>
            </div>
          );
        })}
      </div>
      {catalog.plans.length === 0 && <p className="text-center text-slate-500 py-10">No plans are published yet.</p>}

      {cards.length > 0 && (catalog.features || []).length > 0 && <div className="max-w-6xl mx-auto mt-12">
        <button onClick={() => setShowCompare((v) => !v)} className="mx-auto flex items-center gap-2 text-indigo-700 font-semibold">Compare all features <ChevronDown className={`w-4 h-4 transition ${showCompare ? 'rotate-180' : ''}`} /></button>
        {showCompare && <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50"><th className="p-4 text-left font-semibold text-slate-700">Features</th>{cards.map((p) => <th key={p.id} className="p-4 text-center font-bold text-slate-800">{tierName(p, p.grouped)}</th>)}</tr></thead>
            <tbody>{groups.map(([group, features]) => (
              <React.Fragment key={group}>
                <tr><td colSpan={cards.length + 1} className="bg-indigo-50/60 px-4 py-2 text-xs font-bold uppercase tracking-wider text-indigo-800">{group}</td></tr>
                {features.map((f) => <tr key={f.code} className="border-t border-slate-100"><td className="p-4 text-slate-700">{f.name}{f.description && <span className="block text-xs text-slate-400">{f.description}</span>}</td>{cards.map((p) => <td key={p.id} className="p-4 text-center">{cell(p, f.code)}</td>)}</tr>)}
              </React.Fragment>
            ))}</tbody>
          </table>
        </div>}
      </div>}
      <p className="text-xs text-slate-400 mt-8 text-center">Plan changes start a new full term immediately; unused time is not credited. Payments are processed securely by Razorpay.</p>
    </div>
  );
};

export default CharisOsSubscription;
