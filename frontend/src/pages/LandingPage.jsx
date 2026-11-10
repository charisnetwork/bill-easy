import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import Footer from '../components/Footer';
import { 
  FileText, Package, Users, BarChart3, Shield, Smartphone,
  CheckCircle, ArrowRight, Sparkles, Building2, Search, MessageSquareText
} from 'lucide-react';
import { usePlanCatalog } from '../hooks/usePlanCatalog';

const features = [
  {
    icon: FileText,
    title: 'GST Invoicing',
    description: 'Create professional GST-compliant invoices in seconds with automatic tax calculations.'
  },
  {
    icon: Package,
    title: 'Inventory Management',
    description: 'Track stock levels, set low-stock alerts, and move stock between godowns.'
  },
  {
    icon: Users,
    title: 'Customers & Suppliers',
    description: 'Ledgers, payment history and outstanding balances for every party.'
  },
  {
    icon: BarChart3,
    title: 'Business Reports',
    description: 'Sales, purchase, P&L, GST and stock reports, with export options.'
  },
  {
    icon: Shield,
    title: 'Secure Sign-in',
    description: 'Encrypted connections, secure sessions and staff roles that control who sees what.'
  },
  {
    icon: Smartphone,
    title: 'Works Everywhere',
    description: 'Open your business on a computer, tablet or phone. Your data stays in step.'
  }
];

const aiPoints = [
  { icon: MessageSquareText, title: 'Ask in plain words', text: 'Who owes me the most? How were sales this month?' },
  { icon: Search, title: 'Find any bill', text: 'Type an invoice number, customer or item and get the answer at once.' },
  { icon: BarChart3, title: 'Numbers without a report', text: 'Pending dues, best-selling items and low stock, straight from your own data.' },
];

const sampleInvoices = [
  { number: 'INV-1042', party: 'Sri Lakshmi Traders', amount: '₹18,450', status: 'Paid', tone: 'bg-emerald-50 text-emerald-700' },
  { number: 'INV-1041', party: 'Ravi Enterprises', amount: '₹6,200', status: 'Pending', tone: 'bg-amber-50 text-amber-700' },
  { number: 'INV-1040', party: 'Green Mart', amount: '₹20,600', status: 'Paid', tone: 'bg-emerald-50 text-emerald-700' },
];

export const LandingPage = () => {
  const { plans: catalog, loading: catalogLoading, unavailable: catalogUnavailable } = usePlanCatalog();

  const formatPlanPrice = (amount, currency = 'INR') => {
    if (amount === null || amount === undefined || Number.isNaN(Number(amount))) return 'Contact us';
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(Number(amount));
  };
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200 pt-[env(safe-area-inset-top)]">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 relative z-10">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="font-heading font-bold text-xl text-slate-900">Bill Easy</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Features</a>
              <a href="#assistant" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">AI assistant</a>
              <a href="#pricing" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Pricing</a>
              <Link to="/contact" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Contact</Link>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <Link to="/login">
                <Button variant="ghost" className="text-slate-700 hover:bg-slate-100 px-3 sm:px-4 font-semibold" data-testid="login-btn">Login</Button>
              </Link>
              <Link to="/register">
                <Button className="bg-emerald-600 hover:bg-emerald-700 px-4 sm:px-5 font-semibold" data-testid="get-started-btn">
                  Start free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-[calc(env(safe-area-inset-top)+7rem)] md:pt-[calc(env(safe-area-inset-top)+9rem)] pb-20 md:pb-28 hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-emerald-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 md:px-6 max-w-7xl relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-center md:text-left animate-fade-in">
              <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-6">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-sm text-slate-300">GST billing with a built-in AI assistant</span>
              </div>
              
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight mb-6">
                GST billing,
                <span className="block text-emerald-400">made easy.</span>
              </h1>
              
              <p className="text-lg text-slate-300 mb-8 max-w-lg mx-auto md:mx-0">
                Invoices, stock, purchases, expenses and GST reports for your shop or business, 
                in one place. Make your first invoice in minutes.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link to="/register">
                  <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 w-full sm:w-auto" data-testid="hero-cta-btn">
                    Start free
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <a href="#pricing">
                  <Button size="lg" variant="outline" className="bg-transparent border-slate-500 text-white hover:bg-white/10 hover:text-white w-full sm:w-auto">
                    See pricing
                  </Button>
                </a>
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 mt-8 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Free plan, no card needed</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>GST-ready invoices</span>
                </div>
              </div>
            </div>

            <div>
              <div className="relative max-w-md mx-auto md:max-w-none">
                <div className="bg-white rounded-2xl shadow-2xl p-5 sm:p-6 text-left md:rotate-1 md:hover:rotate-0 transition-transform duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-heading font-semibold text-slate-900">Dashboard Overview</span>
                    <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded">Sample figures</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="bg-slate-50 rounded-lg p-4">
                      <p className="text-xs text-slate-500 mb-1">Today's Sales</p>
                      <p className="text-xl sm:text-2xl font-bold text-slate-900">₹45,250</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <p className="text-xs text-slate-500 mb-1">Monthly Revenue</p>
                      <p className="text-xl sm:text-2xl font-bold text-emerald-600">₹3.2L</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <p className="text-xs text-slate-500 mb-1">Pending</p>
                      <p className="text-xl sm:text-2xl font-bold text-amber-600">₹28,400</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <p className="text-xs text-slate-500 mb-1">Net Profit</p>
                      <p className="text-xl sm:text-2xl font-bold text-slate-900">₹1.8L</p>
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-slate-500 mt-5 mb-1">Recent invoices</p>
                  <ul className="divide-y divide-slate-100">
                    {sampleInvoices.map((invoice) => (
                      <li key={invoice.number} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                        <span className="min-w-0">
                          <span className="block font-medium text-slate-900 truncate">{invoice.party}</span>
                          <span className="block text-xs text-slate-500">{invoice.number}</span>
                        </span>
                        <span className="flex items-center gap-3 shrink-0">
                          <span className="font-semibold text-slate-900">{invoice.amount}</span>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${invoice.tone}`}>{invoice.status}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-50 scroll-mt-16">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Everything you need to run your business
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              From the first invoice to the GST return, without a second app.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl p-6 border border-slate-200/70 shadow-sm hover:shadow-md transition-shadow duration-200 card-hover"
                data-testid={`feature-card-${index}`}
              >
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI assistant */}
      <section id="assistant" className="py-20 bg-white scroll-mt-16">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600 mb-3">Built-in AI assistant</p>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Ask your business a question
              </h2>
              <p className="text-lg text-slate-600 mb-8">
                The assistant reads your own invoices, customers and stock, and answers from them. 
                Your plan sets how many questions you can ask each month.
              </p>
              <ul className="space-y-5">
                {aiPoints.map((point) => (
                  <li key={point.title} className="flex gap-4">
                    <span className="w-10 h-10 shrink-0 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <point.icon className="w-5 h-5" />
                    </span>
                    <span>
                      <span className="block font-semibold text-slate-900">{point.title}</span>
                      <span className="block text-slate-600">{point.text}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl bg-slate-900 p-5 sm:p-6 shadow-xl">
              <div className="flex items-center justify-between mb-5">
                <span className="flex items-center gap-2 text-sm font-semibold text-white"><Sparkles className="w-4 h-4 text-emerald-400" /> Bill Easy assistant</span>
                <span className="text-xs bg-white/10 text-slate-300 px-2 py-1 rounded">Sample conversation</span>
              </div>
              <div className="space-y-3 text-sm">
                <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-emerald-500 text-white px-4 py-2.5">Who has not paid me yet?</p>
                <div className="w-fit max-w-[90%] rounded-2xl rounded-bl-md bg-white/10 text-slate-100 px-4 py-3 space-y-1.5">
                  <p>3 customers have dues, ₹28,400 in total:</p>
                  <p className="flex justify-between gap-6"><span>Ravi Enterprises</span><span className="font-semibold">₹14,200</span></p>
                  <p className="flex justify-between gap-6"><span>Kumar Stores</span><span className="font-semibold">₹8,000</span></p>
                  <p className="flex justify-between gap-6"><span>Anand Agencies</span><span className="font-semibold">₹6,200</span></p>
                </div>
                <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-emerald-500 text-white px-4 py-2.5">INV-1041</p>
                <p className="w-fit max-w-[90%] rounded-2xl rounded-bl-md bg-white/10 text-slate-100 px-4 py-3">INV-1041 to Ravi Enterprises: ₹6,200, pending.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-slate-50 scroll-mt-16">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Start free and upgrade as your business grows. No hidden fees.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
            {catalogLoading && <p className="col-span-full text-center text-slate-500">Loading current plans…</p>}
            {catalogUnavailable && <p className="col-span-full text-center text-slate-500">Current plan information is temporarily unavailable. Please contact Bill Easy for pricing.</p>}
            {catalog?.map((plan, index) => {
              const amount = plan.price;
              const duration = plan.months;
              const featureLabels = plan.highlights;
              return (
              <div 
                key={plan.pricing_group || index}
                className={`bg-white rounded-2xl p-6 border-2 flex flex-col transition-all duration-200 ${
                  plan.recommended
                    ? 'border-emerald-500 shadow-lg shadow-emerald-100' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                data-testid={`pricing-card-${plan.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className="h-6">
                  {(plan.badge || plan.recommended) && (
                    <span className="bg-emerald-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      {plan.badge || 'Most Popular'}
                    </span>
                  )}
                </div>
                <h3 className="font-heading text-xl font-semibold text-slate-900 mt-3">{plan.name}</h3>
                <div className="flex items-baseline flex-wrap gap-x-2 gap-y-1 mt-2 mb-6">
                  {Number(plan.compare_at_price) > Number(amount) && (
                    <span className="text-xl font-semibold text-slate-400 line-through" data-testid="plan-compare-price">
                      {formatPlanPrice(plan.compare_at_price, plan.currency)}
                    </span>
                  )}
                  <span className="text-4xl font-bold text-slate-900">{formatPlanPrice(amount, plan.currency)}</span>
                  {amount > 0 && duration && <span className="text-slate-500 text-xs font-medium">{duration === 1 ? '/month' : `/${duration} months`}</span>}
                </div>
                <ul className="space-y-3 mb-6">
                  {featureLabels.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                      <CheckCircle className="w-4 h-4 mt-0.5 shrink-0 text-emerald-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link to="/register" className="mt-auto">
                  <Button 
                    className={`w-full ${plan.recommended ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                    variant={plan.recommended ? 'default' : 'outline'}
                  >
                    Get started
                  </Button>
                </Link>
              </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 hero-gradient">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to make billing easy?
          </h2>
          <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
            Start on the Free plan and move to a paid plan only when your business needs more.
          </p>
          <Link to="/register">
            <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white px-8">
              Create your free account
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <Footer />

    </div>
  );
};

export default LandingPage;
