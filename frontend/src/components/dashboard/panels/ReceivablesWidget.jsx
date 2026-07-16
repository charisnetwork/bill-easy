import React from 'react';
import { motion } from 'framer-motion';
import { Users, Phone, ArrowRight, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';

const MOCK_RECEIVABLES = [
  { id: 1, name: 'Apex Solutions', amount: 45000, daysOverdue: 15, contact: '+91 9876543210' },
  { id: 2, name: 'Global Traders', amount: 28500, daysOverdue: 8, contact: '+91 9876543211' },
  { id: 3, name: 'TechVision Inc', amount: 12000, daysOverdue: 3, contact: '+91 9876543212' },
];

export const ReceivablesWidget = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-slate-100 dark:border-slate-800 h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/10">
            <Users className="w-4 h-4 text-amber-500" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Top Receivables</h3>
        </div>
        <button className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors flex items-center gap-1">
          View Aging <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <div className="flex-1 space-y-3">
        {MOCK_RECEIVABLES.map((item) => (
          <div key={item.id} className="group flex items-center justify-between p-3 rounded-2xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                {item.name.charAt(0)}
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">{item.name}</h4>
                <p className="text-[10px] text-rose-500 font-medium flex items-center gap-1 mt-0.5">
                  <AlertCircle className="w-3 h-3" /> {item.daysOverdue} days overdue
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs font-black text-slate-900 dark:text-white">{formatCurrency(item.amount)}</p>
              </div>
              <button className="p-1.5 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-lg transition-colors opacity-0 group-hover:opacity-100" title={`Call ${item.contact}`}>
                <Phone className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
