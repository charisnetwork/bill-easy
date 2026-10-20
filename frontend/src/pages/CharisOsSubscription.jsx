import React, { useCallback, useEffect, useState } from 'react';
import { subscriptionAPI } from '../services/api';
import { getErrorMessage } from '../config/api';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Check, Loader2, Tag, X } from 'lucide-react';
import { toast } from 'sonner';

// Plans, prices, coupons and payment verification come from Charis OS.
// The browser only chooses a plan/coupon; the server derives amount and customer.

const FEATURE_LABELS = {
  invoices: 'Invoices per month',
  products: 'Products',
  businesses: 'Businesses',
  gst_billing: 'GST billing',
  inventory_management: 'Inventory management',
  quotations: 'Estimates & quotations',
  reports: 'Standard reports',
  advanced_reports: 'Profit & loss and GST reports',
  enterprise_reports: 'Enterprise reports',
  eway_bills: 'E-way bills',
  multi_godowns: 'Multiple godowns',
  staff_attendance_payroll: 'Staff attendance & payroll',
  recurring_invoices: 'Recurring invoices',
  ai_assistant: 'Charis AI assistant',
  bulk_download_print_invoices: 'Bulk download & print',
};

const formatMoney = (amount, currency = 'INR') =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 2 }).format(Number(amount) || 0);

const durationLabel = (plan) => {
  const unit = plan.duration_value === 1 ? plan.duration_unit : `${plan.duration_unit}s`;
  return plan.duration_value === 1 ? `per ${unit}` : `for ${plan.duration_value} ${unit}`;
};

const featureText = (f) => {
  const label = FEATURE_LABELS[f.feature_code] || f.feature_code.replaceAll('_', ' ');
  if (!f.enabled) return label;
  if (f.limit_type === 'limited') return `${label}: ${Number(f.limit_value).toLocaleString('en-IN')}`;
  return ['invoices', 'products', 'businesses'].includes(f.feature_code) ? `${label}: Unlimited` : label;
};

const UsageCard = ({ title, entry, unit }) => (
  <Card className="bg-white border-slate-100">
    <CardContent className="p-6">
      <span className="text-sm font-medium text-slate-500">{title}</span>
      {!entry.included ? (
        <p className="mt-2 text-sm text-slate-500">Not included in your plan</p>
      ) : entry.unlimited ? (
        <p className="mt-2 text-xl font-bold text-slate-800">{entry.used} <span className="text-sm font-normal text-slate-400">{unit} · unlimited</span></p>
      ) : (
        <>
          <div className="mt-2 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full" style={{ width: `${Math.min(100, entry.percentage)}%` }} />
          </div>
          <p className="mt-2 text-xs text-slate-400 font-medium">{entry.used} / {entry.limit} {unit}</p>
        </>
      )}
    </CardContent>
  </Card>
);

export const CharisOsSubscription = ({ current: initialCurrent }) => {
  const [current, setCurrent] = useState(initialCurrent);
  const [catalog, setCatalog] = useState({ plans: [], checkout_enabled: false });
  const [usage, setUsage] = useState(null);
  const [checkout, setCheckout] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [quote, setQuote] = useState(null);
  const [busyPlan, setBusyPlan] = useState(null);

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
      key: order.key_id,
      amount: order.amount_minor,
      currency: order.currency,
      order_id: order.order_id,
      name: 'Bill Easy',
      description: `${plan?.name || 'Plan'} subscription`,
      theme: { color: '#10b981' },
      handler: async (response) => {
        try {
          const res = await subscriptionAPI.verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          const status = res.data.checkout?.status;
          if (status === 'paid') toast.success('Payment verified. Your plan is active.');
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
        plan_id: plan.id,
        idempotency_key: crypto.randomUUID(),
        coupon_code: coupon,
        ...(term ? { previous_subscription_id: term.id, previous_version: term.version, replacement_acknowledged: Boolean(activeTerm) } : {}),
      });
      if (!res.data.checkout) {
        toast.success(`${plan.name} is now active.`);
        await refresh();
        return;
      }
      await openPayment(res.data.checkout, plan);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not start checkout'));
      await refresh();
    } finally {
      setBusyPlan(null);
    }
  };

  const pending = (checkout?.checkouts || []).find(c => c.status === 'ready');
  const status = current?.status;

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-10 bg-[#f8fafc]">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <Card className="bg-white border-slate-100">
          <CardContent className="p-6">
            <span className="text-sm font-medium text-slate-500 block mb-1">Current plan</span>
            <p className="text-xl font-bold text-slate-800">{current?.plan_name || 'No plan yet'}</p>
            <p className="text-xs text-slate-400 mt-1">
              {current?.ends_at ? `Valid until ${new Date(current.ends_at).toLocaleDateString('en-IN')}` : status === 'active' ? 'No expiry' : ''}
              {current?.shared_from_primary_business ? ' · shared from your first business' : ''}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-100">
          <CardContent className="p-6">
            <span className="text-sm font-medium text-slate-500 block mb-1">Status</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${status === 'active' ? 'bg-emerald-500' : 'bg-orange-500'}`} />
              <p className="text-xl font-bold text-slate-800 capitalize">{status || '…'}</p>
            </div>
            {status && status !== 'active' && <p className="text-xs text-orange-600 mt-1">Choose a plan below to continue creating records.</p>}
          </CardContent>
        </Card>
        {usage && <UsageCard title="Invoices this month" entry={usage.invoices} unit="invoices" />}
        {usage && <UsageCard title="Products" entry={usage.products} unit="products" />}
      </div>

      {pending && (
        <Card className="mb-8 border-amber-200 bg-amber-50">
          <CardContent className="p-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-amber-900">You have an unfinished payment of {formatMoney(pending.amount_minor / 100)}. Resume it instead of starting a new one.</p>
            <Button onClick={() => openPayment(pending, null)} className="bg-amber-600 hover:bg-amber-700 text-white">Resume payment</Button>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2">
          <Tag className="w-4 h-4 text-slate-400" />
          <input value={couponCode} onChange={(e) => { setCouponCode(e.target.value); setQuote(null); }} placeholder="Coupon or partner code" className="outline-none text-sm uppercase w-48" aria-label="Coupon code" />
        </div>
        <p className="text-xs text-slate-500">Enter a code, then press “Apply” on the plan you want.</p>
        {!catalog.checkout_enabled && <p className="text-xs text-orange-600">Online payment is not enabled yet. Free plans can still be activated.</p>}
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
        {catalog.plans.map((plan) => {
          const isCurrent = current?.plan_id === plan.id && status === 'active';
          const planQuote = quote?.plan_id === plan.id ? quote : null;
          const payable = plan.price === 0 || catalog.checkout_enabled;
          // OS only activates a free plan when no plan is currently active.
          const freeLocked = plan.price === 0 && status === 'active' && !isCurrent;
          return (
            <Card key={plan.id} className={`bg-white border-t-4 ${plan.recommended ? 'border-t-emerald-500 shadow-lg' : 'border-t-slate-300'}`}>
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-800">{plan.name}</h3>
                  {plan.recommended && <Badge className="bg-emerald-50 text-emerald-700">Recommended</Badge>}
                  {isCurrent && <Badge className="bg-slate-100 text-slate-700">Current</Badge>}
                </div>
                {plan.description && <p className="text-xs text-slate-500 mt-1">{plan.description}</p>}
                <div className="mt-4">
                  {planQuote && Number(planQuote.discount_amount) > 0 ? (
                    <>
                      <span className="text-sm line-through text-slate-400 mr-2">{formatMoney(plan.price, plan.currency)}</span>
                      <span className="text-3xl font-bold text-emerald-700">{formatMoney(planQuote.final_price, plan.currency)}</span>
                    </>
                  ) : (
                    <span className="text-3xl font-bold text-slate-900">{plan.price === 0 ? 'Free' : formatMoney(plan.price, plan.currency)}</span>
                  )}
                  {plan.price > 0 && <span className="text-sm text-slate-500 ml-1">{durationLabel(plan)}</span>}
                </div>
                <ul className="mt-5 space-y-2 flex-1">
                  {plan.features.map((f) => (
                    <li key={f.feature_code} className={`flex items-start gap-2 text-sm ${f.enabled ? 'text-slate-700' : 'text-slate-400'}`}>
                      {f.enabled ? <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" /> : <X className="w-4 h-4 mt-0.5 shrink-0" />}
                      {featureText(f)}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 space-y-2">
                  {plan.price > 0 && couponCode.trim() && (
                    <Button variant="outline" className="w-full" disabled={busyPlan === plan.id} onClick={() => applyCoupon(plan)}>Apply code</Button>
                  )}
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" disabled={isCurrent || freeLocked || !payable || Boolean(busyPlan) || Boolean(pending)} onClick={() => choose(plan)}>
                    {busyPlan === plan.id ? <Loader2 className="w-4 h-4 animate-spin" /> : isCurrent ? 'Current plan' : freeLocked ? 'Available after your plan ends' : plan.price === 0 ? 'Use free plan' : 'Choose plan'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      {catalog.plans.length === 0 && <p className="text-center text-slate-500 py-10">No plans are published yet.</p>}
      <p className="text-xs text-slate-400 mt-8">Prices include the final amount charged. Plan changes start a new full term immediately; unused time is not credited.</p>
    </div>
  );
};

export default CharisOsSubscription;
