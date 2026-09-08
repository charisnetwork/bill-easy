import React, { useState, useEffect } from 'react';
import { subscriptionAPI } from '../services/api';
import { getErrorMessage } from '../config/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { CheckCircle2, XCircle, Crown, Zap, Rocket, MonitorSmartphone, Users2, Building2, Loader2, Lock, Check, X, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { usePublicCatalog } from '../hooks/usePublicCatalog';

const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);

/* ── Plan tier colour map (matches myBillBook Silver / Diamond / Platinum / Enterprise) ── */
const PLAN_TIER_COLORS = {
  free:       { border: 'border-t-slate-400',   badge: 'bg-slate-100 text-slate-700',    cta: 'bg-slate-700 text-white hover:bg-slate-800' },
  starter:    { border: 'border-t-blue-500',    badge: 'bg-blue-50 text-blue-700',       cta: 'bg-blue-600 text-white hover:bg-blue-700' },
  pro:        { border: 'border-t-emerald-500', badge: 'bg-emerald-50 text-emerald-700', cta: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/30' },
  enterprise: { border: 'border-t-amber-500',   badge: 'bg-amber-50 text-amber-700',     cta: 'bg-amber-600 text-white hover:bg-amber-700' },
};

const getPlanTierColor = (plan, index) => {
  const c = (plan.code || '').toLowerCase();
  if (c.includes('free')) return PLAN_TIER_COLORS.free;
  if (c.includes('starter') || c.includes('silver')) return PLAN_TIER_COLORS.starter;
  if (c.includes('pro') || c.includes('diamond') || c.includes('platinum')) return PLAN_TIER_COLORS.pro;
  if (c.includes('enterprise')) return PLAN_TIER_COLORS.enterprise;
  return Object.values(PLAN_TIER_COLORS)[index % 4];
};

const FEATURE_GROUPS = [
  {
    name: 'Sales Management',
    code: 'sales',
    features: [
      { code: 'create_invoice', label: 'Create GST Invoice' },
      { code: 'quotations', label: 'Estimates & Quotations' },
      { code: 'payment_in', label: 'Payment In Collections' },
      { code: 'sales_return', label: 'Sales Return & Credit Notes' },
      { code: 'pos_billing', label: 'POS Counter Billing UI' },
      { code: 'pdf_print', label: 'Custom PDF Branding & Sharing' },
    ]
  },
  {
    name: 'Purchases & Vendors',
    code: 'purchases',
    features: [
      { code: 'purchase_entry', label: 'Purchase Bill Entry' },
      { code: 'purchase_orders', label: 'Purchase Orders (PO)' },
    ]
  },
  {
    name: 'Expenses Tracker',
    code: 'expenses',
    features: [
      { code: 'expense_tracker', label: 'Categorized Expense Tracking' },
    ]
  },
  {
    name: 'Inventory & Warehouses',
    code: 'inventory',
    features: [
      { code: 'products_master', label: 'Product Catalog Master' },
      { code: 'stock_transfer', label: 'Stock Transfer (Multi-Godowns)' },
      { code: 'low_stock_alerts', label: 'Low Stock Safety Alerts' },
    ]
  },
  {
    name: 'Parties & Directory',
    code: 'directory',
    features: [
      { code: 'customers_master', label: 'Customer Master & Ledgers' },
      { code: 'suppliers_master', label: 'Supplier Master & Payables' },
    ]
  },
  {
    name: 'E-Way Bills & Tax Compliance',
    code: 'eway_bills',
    features: [
      { code: 'eway_bills_create', label: 'Generate Direct E-Way Bills' },
      { code: 'eway_bills_list', label: 'E-Way Bill History & Print' },
      { code: 'gstr_reports', label: 'GSTR-1 & GSTR-3B Tax Summaries' },
    ]
  },
  {
    name: 'Financial & Tax Reports',
    code: 'reports',
    features: [
      { code: 'sales_reports', label: 'Sales Analytics & Item Reports' },
      { code: 'purchase_reports', label: 'Purchase & Vendor Summaries' },
      { code: 'profit_loss_reports', label: 'Profit & Loss Statement (P&L)' },
      { code: 'stock_reports', label: 'Stock Valuation Reports' },
    ]
  },
  {
    name: 'AI & Intelligent Tools',
    code: 'ai_tools',
    features: [
      { code: 'ai_assistant', label: 'Charis AI Assistant Copilot' },
      { code: 'ai_insights', label: 'Automated Business Insights' },
    ]
  },
  {
    name: 'Management & System Security',
    code: 'management',
    features: [
      { code: 'multi_business', label: 'Multi-Business Workspaces' },
      { code: 'max_users_access', label: 'Team Roles & Access Control' },
      { code: 'staff_payroll', label: 'Staff Attendance & Payroll' },
      { code: 'activity_tracker', label: 'User Action Audit Tracker' },
      { code: 'tally_export', label: 'Tally Accounting Export' },
    ]
  }
];

export const SubscriptionPage = () => {
  const [plans, setPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [duration, setDuration] = useState(12); // Default 1 Year
  const { catalog, loading: catalogLoading, unavailable: catalogUnavailable } = usePublicCatalog();

  const fetchData = async () => {
    try {
      const plansRes = await subscriptionAPI.getPlans();
      const fetched = plansRes.data || [];
      setPlans(fetched);

      const subRes = await subscriptionAPI.getCurrent();
      setCurrentSubscription(subRes.data);

      const usageRes = await subscriptionAPI.getUsage();
      setUsage(usageRes.data);
    } catch (error) {
      console.error('Error loading subscription data:', error);
      toast.error(getErrorMessage(error, 'Error loading subscription details'));
    } finally {
      setLoading(false);
    }
  };

  const handleValidateCoupon = async (planId) => {
    const trimmedCode = couponCode.trim().toUpperCase();
    if (!trimmedCode) return;
    try {
      setValidatingCoupon(true);
      const res = await subscriptionAPI.validateCoupon({ code: trimmedCode, plan_id: planId, duration_months: duration });
      setAppliedCoupon({ ...res.data, planId });
      toast.success('Coupon applied successfully!');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Invalid coupon code'));
      setAppliedCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleUpgrade = async (plan) => {
    // Apply coupon to whichever plan the user subscribes to
    const couponId = appliedCoupon ? (appliedCoupon.coupon_id || appliedCoupon.id) : null;
    const basePrice = (plan.price_per_month > 0) ? (plan.price_per_month * duration) : plan.price;
    const finalPrice = couponId ? appliedCoupon.finalPrice : basePrice;

    if (basePrice === 0 || finalPrice === 0) {
      try {
        setUpgrading(true);
        await subscriptionAPI.upgrade({ 
          plan_id: plan.id,
          coupon_id: couponId,
          duration_months: duration
        });
        toast.success(`Switched to ${plan.plan_name || plan.name} successfully`);
        setAppliedCoupon(null);
        setCouponCode('');
        fetchData();
      } catch (error) {
        toast.error(getErrorMessage(error, 'Failed to switch plan'));
      } finally {
        setUpgrading(false);
      }
      return;
    }

    try {
      setUpgrading(true);
      const res = await subscriptionAPI.processPayment({ 
        plan_id: plan.id,
        coupon_id: couponId,
        duration_months: duration
      });
      const { order, key_id } = res.data;

      const options = {
        key: key_id,
        amount: order.amount,
        currency: order.currency,
        name: "BillEasy SaaS",
        description: `Upgrade to ${plan.plan_name || plan.name} Plan`,
        order_id: order.id,
        handler: async (response) => {
          try {
            await subscriptionAPI.upgrade({
              plan_id: plan.id,
              payment_id: response.razorpay_payment_id,
              order_id: response.razorpay_order_id,
              signature: response.razorpay_signature,
              payment_reference: response.razorpay_payment_id,
              coupon_id: couponId,
              duration_months: duration
            });
            toast.success(`Successfully upgraded to ${plan.plan_name || plan.name}!`);
            setAppliedCoupon(null);
            setCouponCode('');
            fetchData();
          } catch (err) {
            toast.error("Payment verification failed. Please contact support.");
          }
        },
        theme: { color: "#10b981" }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to initiate payment');
    } finally {
      setUpgrading(false);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div></div>;

  // Merge backend plans with catalog metadata
  const displayPlans = (catalog && catalog.length > 0) ? catalog : plans;

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-10 bg-[#f8fafc]">
      {/* Usage Stats Section */}
      {usage && (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <Card className="bg-white border-slate-100">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-500">Invoices Used</span>
                <span className="text-xs font-bold text-emerald-600">{Math.round(usage.invoices.percentage)}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, usage.invoices.percentage)}%` }}
                ></div>
              </div>
              <p className="mt-2 text-xs text-slate-400 font-medium">
                {usage.invoices.used} / {usage.invoices.limit} invoices this month
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white border-slate-100">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-500">Products</span>
                <span className="text-xs font-bold text-blue-600">{Math.round(usage.products.percentage)}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-500 h-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, usage.products.percentage)}%` }}
                ></div>
              </div>
              <p className="mt-2 text-xs text-slate-400 font-medium">
                {usage.products.used} / {usage.products.limit} products total
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white border-slate-100">
            <CardContent className="p-6">
              <span className="text-sm font-medium text-slate-500 block mb-1">Current Plan</span>
              <p className="text-xl font-bold text-slate-800">{currentSubscription?.Plan?.plan_name || 'Free Account'}</p>
              <p className="text-xs text-slate-400 mt-1">
                {currentSubscription?.expiry_date 
                  ? `Expires on ${new Date(currentSubscription.expiry_date).toLocaleDateString()}`
                  : 'Free Forever'}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white border-slate-100">
            <CardContent className="p-6">
              <span className="text-sm font-medium text-slate-500 block mb-1">Account Status</span>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${currentSubscription?.status === 'active' ? 'bg-emerald-500' : 'bg-orange-500'}`}></div>
                <p className="text-xl font-bold text-slate-800 capitalize">{currentSubscription?.status || 'Active'}</p>
              </div>
              <p className="text-xs text-slate-400 mt-1">Renewal auto-calculated</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-800">
          Simple &amp; Transparent Pricing Plans
        </h1>
        <p className="text-slate-500 mt-2 max-w-2xl mx-auto">
          Full control over 9 feature groups and 28 sub-features. Upgrade, downgrade, or switch plans anytime.
        </p>

        {!catalogLoading && catalogUnavailable && (
          <p className="text-center text-xs text-amber-700 mt-3">Connecting to local pricing engine...</p>
        )}
      </div>

      {/* Duration Billing Toggle */}
      <div className="flex justify-center mb-10">
        <div className="bg-slate-100 p-1.5 rounded-xl inline-flex shadow-inner">
          {[1, 3, 6, 12, 24, 36].map((m) => (
            <button
              key={m}
              onClick={() => { setDuration(m); setAppliedCoupon(null); }}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${duration === m ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' : 'text-slate-600 hover:text-slate-900'}`}
            >
              {m} {m === 1 ? 'Month' : 'Months'}
              {m === 12 && <span className="ml-1 text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold">Save 20%</span>}
            </button>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          SUBSCRIPTION PRICING CARDS  (myBillBook-style)
          ═══════════════════════════════════════════════════════ */}
      <div className="grid lg:grid-cols-4 gap-6 mb-12 items-start">
        {displayPlans.map((plan, planIdx) => {
          const isCurrent = currentSubscription?.plan_id === plan.id || currentSubscription?.Plan?.plan_name === plan.name;
          const isRecommended = plan.recommended || plan.code === 'pro';
          const monthlyPrice = plan.priceMonthly || plan.price_per_month || 0;
          const yearlyPrice = plan.priceYearly || (monthlyPrice * 12);
          const calculatedPrice = duration === 12 ? yearlyPrice : (monthlyPrice * duration);
          const tierColor = getPlanTierColor(plan, planIdx);

          // Build included / excluded feature lists from entitlements
          const included = [];
          const excluded = [];
          FEATURE_GROUPS.forEach(group => {
            group.features.forEach(f => {
              const isEnabled = plan.entitlements
                ? Boolean(plan.entitlements[f.code])
                : (planIdx >= 2); // fallback: pro+ get all
              if (isEnabled) included.push({ ...f, group: group.name });
              else excluded.push({ ...f, group: group.name });
            });
          });

          return (
            <Card
              key={plan.id || plan.code}
              className={`border-t-4 shadow-sm bg-white flex flex-col overflow-visible relative ${tierColor.border} ${
                isRecommended ? 'ring-2 ring-emerald-500/20 shadow-xl shadow-emerald-500/10' : ''
              }`}
            >
              {/* ── Floating "Most Popular" badge (like myBillBook) ── */}
              {isRecommended && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                  <span className="bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider px-4 py-1.5 rounded-full shadow-lg shadow-emerald-500/30 whitespace-nowrap">
                    Most Popular
                  </span>
                </div>
              )}

              {/* ── Card Header: Name, Description, Price, CTA ── */}
              <CardHeader className="p-6 text-left border-b border-slate-100">
                {plan.badge && !isRecommended && (
                  <Badge className={`w-fit mb-2 ${tierColor.badge} font-bold text-[10px] border-0`}>
                    {plan.badge}
                  </Badge>
                )}

                <CardTitle className="text-xl font-bold text-slate-800">
                  {plan.name}
                </CardTitle>

                <p className="text-xs text-slate-500 mt-2 min-h-[40px] leading-relaxed bg-slate-50/80 p-2.5 rounded-lg border border-slate-100 italic">
                  &ldquo;{plan.description || 'No plan description text set.'}&rdquo;
                </p>

                {/* Price Block */}
                <div className="mt-5">
                  {monthlyPrice > 0 ? (
                    <div className="space-y-1">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-black text-slate-900">
                          {formatCurrency(calculatedPrice)}
                        </span>
                        <span className="text-slate-400 text-xs font-medium">/{duration}mo</span>
                      </div>
                      <p className="text-xs text-emerald-600 font-semibold">
                        ≈ {formatCurrency(monthlyPrice)}/month
                      </p>
                    </div>
                  ) : (
                    <div className="h-[52px] flex items-baseline gap-2">
                      <span className="text-3xl font-black text-slate-900">Free</span>
                      <span className="text-slate-400 text-xs font-medium">Forever</span>
                    </div>
                  )}
                </div>

                {/* Coupon discount indicator */}
                {appliedCoupon && monthlyPrice > 0 && (
                  <div className="mt-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5">
                    <span className="text-[11px] font-semibold text-emerald-700">
                      🎉 Coupon applied: {appliedCoupon.discount_type === 'percentage'
                        ? `${appliedCoupon.discount_value}% off`
                        : `${formatCurrency(appliedCoupon.discount_value)} off`}
                    </span>
                  </div>
                )}

                {/* CTA Button */}
                <Button
                  className={`w-full mt-5 py-5 text-sm font-bold transition-all rounded-xl ${
                    isCurrent
                      ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                      : tierColor.cta
                  }`}
                  disabled={isCurrent || upgrading}
                  onClick={() => handleUpgrade(plan)}
                >
                  {upgrading
                    ? <Loader2 className="animate-spin h-5 w-5" />
                    : isCurrent
                      ? 'Current Plan'
                      : monthlyPrice > 0
                        ? `Get ${plan.name}`
                        : 'Start Free'
                  }
                </Button>
              </CardHeader>

              {/* ── Card Body: Included / Excluded Feature Lists ── */}
              <CardContent className="p-5 flex-1 space-y-5">
                {/* Included Features */}
                {included.length > 0 && (
                  <div>
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                      <span className="w-4 h-px bg-emerald-300"></span>
                      Included ({included.length})
                      <span className="flex-1 h-px bg-emerald-100"></span>
                    </p>
                    <div className="space-y-2">
                      {included.map(f => (
                        <div key={f.code} className="flex items-start gap-2">
                          <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                          <span className="text-[11px] text-slate-700 leading-snug font-medium">
                            {f.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Excluded Features */}
                {excluded.length > 0 && (
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                      <span className="w-4 h-px bg-slate-200"></span>
                      Not Included ({excluded.length})
                      <span className="flex-1 h-px bg-slate-100"></span>
                    </p>
                    <div className="space-y-2">
                      {excluded.map(f => (
                        <div key={f.code} className="flex items-start gap-2">
                          <XCircle size={14} className="text-red-300 mt-0.5 shrink-0" />
                          <span className="text-[11px] text-slate-400 leading-snug">
                            {f.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ═══════════════════════════════════════════════════════
          COUPON CODE SECTION
          ═══════════════════════════════════════════════════════ */}
      <div className="max-w-lg mx-auto mb-16">
        <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-6 shadow-sm hover:border-indigo-300 transition-colors">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Tag size={16} className="text-indigo-500" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Have a coupon?</h3>
          </div>

          <div className="flex gap-3">
            <input
              id="coupon-input"
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="Enter coupon code"
              className="flex-1 font-mono tracking-wider uppercase"
              style={{ borderRadius: '0.75rem' }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const firstPaidPlan = displayPlans.find(p => (p.priceMonthly || p.price_per_month || 0) > 0);
                  handleValidateCoupon(firstPaidPlan?.id || displayPlans[0]?.id);
                }
              }}
            />
            <Button
              id="coupon-apply-btn"
              onClick={() => {
                const firstPaidPlan = displayPlans.find(p => (p.priceMonthly || p.price_per_month || 0) > 0);
                handleValidateCoupon(firstPaidPlan?.id || displayPlans[0]?.id);
              }}
              disabled={!couponCode.trim() || validatingCoupon}
              className="bg-indigo-600 text-white hover:bg-indigo-700 px-6 rounded-xl font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {validatingCoupon ? <Loader2 className="animate-spin h-4 w-4" /> : 'Apply'}
            </Button>
          </div>

          {/* Coupon Success Banner */}
          {appliedCoupon && (
            <div className="mt-4 flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 animate-fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span className="text-sm font-semibold text-emerald-700">
                  Coupon applied — {appliedCoupon.discount_type === 'percentage'
                    ? `${appliedCoupon.discount_value}% off`
                    : `${formatCurrency(appliedCoupon.discount_value)} off`}
                </span>
              </div>
              <button
                onClick={() => { setAppliedCoupon(null); setCouponCode(''); }}
                className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"
                aria-label="Remove coupon"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          9 FEATURE GROUPS × 28 SUB-FEATURES COMPARISON MATRIX
          ═══════════════════════════════════════════════════════ */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Detailed Feature Comparison Matrix</h2>
          <p className="text-slate-500 text-sm mt-1">
            Compare all 28 sub-features across all {displayPlans.length} subscription plans
          </p>
        </div>

        {/* Plan column headers for the matrix */}
        <div className="hidden md:grid grid-cols-5 gap-4 mb-4 px-4">
          <div className="col-span-1"></div>
          <div className="col-span-4 grid grid-cols-4 gap-2 text-center">
            {displayPlans.map((plan, i) => {
              const tc = getPlanTierColor(plan, i);
              return (
                <div key={plan.id || plan.code} className={`text-xs font-bold py-2 rounded-lg ${tc.badge}`}>
                  {plan.name}
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-8">
          {FEATURE_GROUPS.map((group, groupIdx) => (
            <div key={group.code} className="border border-slate-100 rounded-2xl overflow-hidden">
              <div className="bg-slate-50 px-6 py-3 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800 tracking-wide flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-xs flex items-center justify-center font-bold">
                    {groupIdx + 1}
                  </span>
                  {group.name}
                </h3>
              </div>

              <div className="divide-y divide-slate-100">
                {group.features.map((feature) => (
                  <div key={feature.code} className="p-4 grid grid-cols-1 md:grid-cols-5 items-center gap-4 hover:bg-slate-50/50 transition-colors">
                    <div className="md:col-span-1">
                      <div className="text-sm font-semibold text-slate-800">{feature.label}</div>
                      <div className="text-[11px] font-mono text-slate-400">{feature.code}</div>
                    </div>

                    <div className="md:col-span-4 grid grid-cols-4 gap-2 text-center">
                      {displayPlans.map((plan) => {
                        const isEnabled = plan.entitlements ? Boolean(plan.entitlements[feature.code]) : true;
                        return (
                          <div key={plan.id || plan.code} className="flex justify-center items-center py-1">
                            {isEnabled ? (
                              <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full text-xs font-semibold">
                                <Check size={14} /> Included
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full text-xs">
                                <Lock size={12} /> Locked
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 text-center text-xs text-slate-400">
        Prices are exclusive of 18% GST. Priority Support Helpline: +91 9986995848
      </div>
    </div>
  );
};

export default SubscriptionPage;
