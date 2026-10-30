import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { PackageX, AlertTriangle, ArrowRight } from 'lucide-react';

export const InventoryAlertPanel = ({ data }) => {
  const items = data?.lowStock?.items || [];
  const count = data?.lowStock?.count || 0;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-slate-100 dark:border-slate-800 h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-500/10">
            <PackageX className="w-4 h-4 text-rose-500" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Inventory Alerts</h3>
          {count > 0 && (
            <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{count}</span>
          )}
        </div>
        <Link to="/products" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors flex items-center gap-1">
          View All <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="flex-1 space-y-4">
        {items.map((item) => {
          const isCritical = item.stock <= 0 || item.stock <= item.minimum / 2;
          const percent = item.minimum > 0 ? Math.max(5, Math.min(100, (item.stock / item.minimum) * 100)) : 5;
          return (
            <div key={item.id} className="flex flex-col gap-2 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                {isCritical && <AlertTriangle className="w-3 h-3 text-rose-500" />}
                {item.name}
              </h4>
              <div>
                <div className="flex justify-between text-[10px] font-bold mb-1.5">
                  <span className={isCritical ? 'text-rose-500' : 'text-amber-500'}>{item.stock} {item.unit} in stock</span>
                  <span className="text-slate-400">Alert at {item.minimum}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 1 }}
                    className={`h-full rounded-full ${isCritical ? 'bg-rose-500' : 'bg-amber-500'}`}
                  />
                </div>
              </div>
            </div>
          );
        })}
        {items.length === 0 && (
          <p className="text-xs text-slate-500 dark:text-slate-400 py-6 text-center">
            {data?.productsCount > 0 ? 'Every product is above its low-stock level.' : 'Add products to track their stock here.'}
          </p>
        )}
      </div>
    </motion.div>
  );
};
