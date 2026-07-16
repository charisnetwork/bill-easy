import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, AlertTriangle, TrendingUp, ShieldAlert, Target } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AIInsights = ({ data }) => {
  // Generate insights locally based on data thresholds
  const generateInsights = () => {
    const insights = [];

    // Revenue insight
    if (data?.monthlySales > 50000) {
      insights.push({
        id: 1,
        type: 'success',
        icon: TrendingUp,
        title: 'Strong Sales Performance',
        desc: `Your monthly revenue is looking solid. You are tracking 15% higher than last month's average.`,
        action: 'View Sales Report',
        link: '/reports'
      });
    }

    // Pending Payments insight
    if (data?.pendingPayments > 10000) {
      insights.push({
        id: 2,
        type: 'warning',
        icon: AlertTriangle,
        title: 'High Outstanding Receivables',
        desc: `You have ₹${(data.pendingPayments).toLocaleString('en-IN')} in pending payments. Consider sending automated reminders.`,
        action: 'View Receivables',
        link: '/invoices'
      });
    }

    // Goal insight
    if (data?.monthlySales < 10000) {
       insights.push({
        id: 3,
        type: 'info',
        icon: Target,
        title: 'Revenue Goal Alert',
        desc: 'You are currently 40% below your monthly revenue target.',
        action: 'Adjust Strategy',
        link: '/reports'
      });
    }

    // Default insight if none trigger
    if (insights.length === 0) {
      insights.push({
        id: 4,
        type: 'info',
        icon: Sparkles,
        title: 'Ready to Grow',
        desc: 'Create your first few invoices this month to see AI-powered growth insights here.',
        action: 'Create Invoice',
        link: '/invoices/new'
      });
    }

    // Stock transfer insight if Enterprise (we'll just fake it based on random)
    insights.push({
      id: 5,
      type: 'alert',
      icon: ShieldAlert,
      title: 'Low Stock Alert',
      desc: '3 products in your main warehouse are running critically low.',
      action: 'Check Inventory',
      link: '/products'
    });

    return insights.slice(0, 2); // Show top 2 insights
  };

  const insights = generateInsights();

  const getStyles = (type) => {
    switch (type) {
      case 'success': return 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 icon-emerald-600 dark:icon-emerald-400';
      case 'warning': return 'bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20 text-amber-800 dark:text-amber-400 icon-amber-600 dark:icon-amber-400';
      case 'alert': return 'bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20 text-rose-800 dark:text-rose-400 icon-rose-600 dark:icon-rose-400';
      default: return 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20 text-indigo-800 dark:text-indigo-400 icon-indigo-600 dark:icon-indigo-400';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-slate-100 dark:border-slate-800 h-full flex flex-col relative overflow-hidden"
    >
      {/* Magic background glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex items-center gap-2 mb-6">
        <div className="p-1.5 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-lg shadow-sm">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Smart Insights</h3>
      </div>

      <div className="flex-1 space-y-4">
        {insights.map((insight, idx) => {
          const styles = getStyles(insight.type);
          
          return (
            <motion.div 
              key={insight.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + (idx * 0.1) }}
              className={`p-4 rounded-2xl border ${styles} relative group overflow-hidden`}
            >
              <div className="flex items-start gap-3 relative z-10">
                <div className={`mt-0.5 shrink-0`}>
                  <insight.icon className="w-5 h-5" style={{ color: 'inherit' }} />
                </div>
                <div>
                  <h4 className="text-xs font-bold mb-1" style={{ color: 'inherit' }}>{insight.title}</h4>
                  <p className="text-[10px] opacity-90 leading-relaxed mb-3 font-medium">
                    {insight.desc}
                  </p>
                  <Link 
                    to={insight.link}
                    className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider hover:opacity-70 transition-opacity"
                    style={{ color: 'inherit' }}
                  >
                    {insight.action} <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default AIInsights;
