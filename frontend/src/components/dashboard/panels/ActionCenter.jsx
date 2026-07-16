import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Receipt, FileText, Users, Box, TrendingUp, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ACTIONS = [
  { id: 'invoice', label: 'Create Invoice', icon: FileText, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10', route: '/invoices/new', shortcut: 'I' },
  { id: 'payment', label: 'Receive Payment', icon: Receipt, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', route: '/payments-in', shortcut: 'P' },
  { id: 'expense', label: 'Record Expense', icon: TrendingUp, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10', route: '/expenses', shortcut: 'E' },
  { id: 'customer', label: 'Add Customer', icon: Users, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-500/10', route: '/customers', shortcut: 'C' },
  { id: 'product', label: 'Add Product', icon: Box, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10', route: '/products', shortcut: 'O' },
];

export const ActionCenter = () => {
  const navigate = useNavigate();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-slate-100 dark:border-slate-800 h-full flex flex-col"
    >
      <div className="flex items-center gap-2 mb-6">
        <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800">
          <Zap className="w-4 h-4 text-amber-500" />
        </div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Action Center</h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 flex-1">
        {ACTIONS.map((action, idx) => (
          <motion.button
            key={action.id}
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(action.route)}
            className="relative flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-white dark:hover:bg-slate-800 transition-all group overflow-hidden"
          >
            <div className={`w-10 h-10 rounded-xl ${action.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
              <action.icon className={`w-5 h-5 ${action.color}`} />
            </div>
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 tracking-tight text-center">
              {action.label}
            </span>
            
            {/* Keyboard Shortcut Hint (Visible on hover) */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <kbd className="px-1.5 py-0.5 text-[9px] font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-slate-400 shadow-sm">
                {action.shortcut}
              </kbd>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};
