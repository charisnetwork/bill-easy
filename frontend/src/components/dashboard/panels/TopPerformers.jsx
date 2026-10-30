import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Package } from 'lucide-react';
import { formatINR } from '../dashboardData';

// Best-selling products this month by invoiced value.
export const TopPerformers = ({ data }) => {
  const products = data?.topProducts || [];
  const best = products[0]?.revenue || 0;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-slate-100 dark:border-slate-800 h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10">
            <Trophy className="w-4 h-4 text-indigo-500" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Top Products</h3>
        </div>
        <span className="text-[10px] font-medium text-slate-400">This month</span>
      </div>

      <div className="flex-1 space-y-4">
        {products.map((item, index) => (
          <div key={item.id} className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 w-3 text-center">{index + 1}</span>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{item.name}</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                    <Package className="w-3 h-3" /> {item.quantity} sold
                  </p>
                </div>
              </div>
              <p className="text-xs font-black text-slate-900 dark:text-white">{formatINR(item.revenue)}</p>
            </div>
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden ml-5" style={{ width: 'calc(100% - 1.25rem)' }}>
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${best > 0 ? (item.revenue / best) * 100 : 0}%` }}
                transition={{ duration: 1 }}
                className="h-full bg-indigo-500 rounded-full"
              />
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <p className="text-xs text-slate-500 dark:text-slate-400 py-6 text-center">Your best-selling products this month will show up here.</p>
        )}
      </div>
    </motion.div>
  );
};
