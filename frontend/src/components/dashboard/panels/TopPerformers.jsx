import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Package } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';

const MOCK_PERFORMERS = [
  { id: 1, name: 'Ultra Cement 50kg', type: 'Product', revenue: 125000, percentage: 85 },
  { id: 2, name: 'Steel TMT Bars 12mm', type: 'Product', revenue: 98000, percentage: 65 },
  { id: 3, name: 'Apex Solutions', type: 'Customer', revenue: 85000, percentage: 55 },
];

export const TopPerformers = () => {
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
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Top Performers</h3>
        </div>
      </div>

      <div className="flex-1 space-y-4">
        {MOCK_PERFORMERS.map((item, index) => (
          <div key={item.id} className="group flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 w-3 text-center">{index + 1}</span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                    {item.name}
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                    {item.type === 'Product' ? <Package className="w-3 h-3" /> : <Trophy className="w-3 h-3" />}
                    {item.type}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-black text-slate-900 dark:text-white">{formatCurrency(item.revenue)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 w-full pl-5">
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${item.percentage}%` }}
                  transition={{ duration: 1 }}
                  className="h-full bg-indigo-500 rounded-full"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
