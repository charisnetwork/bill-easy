import React, { useState, useEffect } from 'react';
import { subscriptionAPI } from '../services/api';
import { getErrorMessage } from '../config/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { CheckCircle2, XCircle, Crown, Zap, Rocket, MonitorSmartphone, Users2, Building2, Loader2, Lock, Check } from 'lucide-react';
import { toast } from 'sonner';
import { usePublicCatalog } from '../hooks/usePublicCatalog';

const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);

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
    if (!couponCode) return;
    try {
      setValidatingCoupon(true);
      const res = await subscriptionAPI.validateCoupon({ code: couponCode, plan_id: planId, duration_months: duration });
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
    const couponId = (appliedCoupon && appliedCoupon.planId === plan.id) ? appliedCoupon.coupon_id : null;
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
          Choose the Right Subscription Plan for Your Business
        </h1>
        <p className="text-slate-500 mt-2 max-w-2xl mx-auto">
          Full control over 9 main feature groups and 28 sub-features. Switch plans anytime.
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
              {m === 12 && <span className="ml-1 text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold">Best Value</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Subscription Pricing Cards */}
      <div className="grid lg:grid-cols-4 gap-6 mb-16">
        {displayPlans.map((plan) => {
          const isCurrent = currentSubscription?.plan_id === plan.id || currentSubscription?.Plan?.plan_name === plan.name;
          const isRecommended = plan.recommended || plan.code === 'pro';
          const monthlyPrice = plan.priceMonthly || plan.price_per_month || 0;
          const yearlyPrice = plan.priceYearly || (monthlyPrice * 12);
          const calculatedPrice = duration === 12 ? yearlyPrice : (monthlyPrice * duration);

          return (
            <Card key={plan.id || plan.code} className={`border-t-4 shadow-sm bg-white flex flex-col ${
              isRecommended ? 'border-t-emerald-500 shadow-lg ring-2 ring-emerald-500/20' : 'border-t-slate-300'
            }`}>
              <CardHeader className="p-6 text-left border-b border-slate-50 relative">
                {plan.badge && (
                  <Badge className="absolute top-4 right-4 bg-emerald-500 text-white font-bold">{plan.badge}</Badge>
                )}
                <CardTitle className="text-2xl font-bold text-slate-800">{plan.name}</CardTitle>
                
                <p className="text-xs text-slate-500 mt-2 min-h-[48px] leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
                  "{plan.description || 'No plan description text set.'}"
                </p>

                <div className="mt-6">
                  {monthlyPrice > 0 ? (
                    <div className="space-y-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-slate-900">
                          {formatCurrency(calculatedPrice)}
                        </span>
                        <span className="text-slate-500 text-xs font-medium">/{duration}m</span>
                      </div>
                      <p className="text-xs text-emerald-600 font-semibold">Equivalent to {formatCurrency(monthlyPrice)}/month</p>
                    </div>
                  ) : (
                    <div className="h-14 flex items-baseline gap-2">
                      <span className="text-3xl font-black text-slate-900">Free</span>
                      <span className="text-slate-500 text-xs font-medium">Forever</span>
                    </div>
                  )}
                </div>

                <Button 
                  className={`w-full mt-6 py-5 text-base font-bold transition-all ${
                    isCurrent 
                      ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' 
                      : isRecommended 
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/30' 
                        : 'bg-slate-800 text-white hover:bg-slate-900'
                  }`} 
                  disabled={isCurrent || upgrading}
                  onClick={() => handleUpgrade(plan)}
                >
                  {upgrading ? <Loader2 className="animate-spin h-5 w-5" /> : isCurrent ? 'Current Active Plan' : `Subscribe to ${plan.name}`}
                </Button>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {/* 9 Feature Groups & 28 Sub-Features Comparison Matrix */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Detailed Feature Comparison Matrix</h2>
          <p className="text-slate-500 text-sm mt-1">
            Compare all 28 sub-features across all 4 subscription plans
          </p>
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

