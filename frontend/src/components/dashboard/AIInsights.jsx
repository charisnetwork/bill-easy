import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, AlertTriangle, TrendingUp, TrendingDown, ShieldAlert, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatINR, plural } from './dashboardData';

export const AIInsights = ({ data }) => {
  // Plain rules over the business's own figures (no AI call): only facts the data supports.
  const generateInsights = () => {
    const insights = [];
    const sales = data?.comparison?.sales;
    const receivables = data?.receivables;

    if (sales?.change !== null && sales?.change !== undefined) {
      const up = sales.change >= 0;
      insights.push({
        id: 'sales-trend',
        type: up ? 'success' : 'warning',
        icon: up ? TrendingUp : TrendingDown,
        title: up ? 'Sales are up this month' : 'Sales are down this month',
        desc: `${formatINR(sales.current)} so far this month against ${formatINR(sales.previous)} last month (${up ? '+' : ''}${sales.change}%).`,
        action: 'View Sales Report',
        link: '/reports'
      });
    }

    if (receivables?.overdueCount > 0) {
      insights.push({
        id: 'overdue',
        type: 'warning',
        icon: AlertTriangle,
        title: 'Overdue receivables',
        desc: `${plural(receivables.overdueCount, 'invoice')} worth ${formatINR(receivables.overdueAmount)} ${receivables.overdueCount === 1 ? 'is' : 'are'} past the due date.`,
        action: 'View Invoices',
        link: '/invoices'
      });
    }

    if (data?.lowStock?.count > 0) {
      const first = data.lowStock.items?.[0];
      insights.push({
        id: 'low-stock',
        type: 'alert',
        icon: ShieldAlert,
        title: 'Low stock',
        desc: `${plural(data.lowStock.count, 'product')} at or below the low-stock level${first ? `, including ${first.name} (${first.stock} ${first.unit || ''} left)` : ''}.`,
        action: 'Check Inventory',
        link: '/products'
      });
    }

    const top = data?.topProducts?.[0];
    if (top) {
      insights.push({
        id: 'top-product',
        type: 'info',
        icon: Trophy,
        title: 'Best seller this month',
        desc: `${top.name} has brought in ${formatINR(top.revenue)} this month.`,
        action: 'View Products',
        link: '/products'
      });
    }

    if (insights.length === 0) {
      const hasInvoices = (data?.recentInvoices?.length || 0) > 0;
      insights.push({
        id: 'start',
        type: 'info',
        icon: Sparkles,
        title: hasInvoices ? 'Insights build up as you bill' : 'Create your first invoice',
        desc: hasInvoices
          ? 'Once you have a month of sales to compare, trends and reminders will show up here.'
          : 'Your sales trends, overdue reminders and stock alerts will show up here as you use Bill Easy.',
        action: 'Create Invoice',
        link: '/invoices/new'
      });
    }

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
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Insights</h3>
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
