import React from 'react';
import { motion } from 'framer-motion';
import { PackageX, ShoppingCart, AlertTriangle, ArrowRight } from 'lucide-react';

const MOCK_INVENTORY = [
  { id: 1, name: 'Ultra Cement 50kg', current: 15, minimum: 50, status: 'critical', supplier: 'Ambuja Corp' },
  { id: 2, name: 'Steel TMT Bars 12mm', current: 120, minimum: 150, status: 'warning', supplier: 'Tata Steel' },
  { id: 3, name: 'Asian Paints White 20L', current: 5, minimum: 20, status: 'critical', supplier: 'Asian Paints' },
];

export const InventoryAlertPanel = () => {
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
        </div>
        <button className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors flex items-center gap-1">
          View All <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <div className="flex-1 space-y-4">
        {MOCK_INVENTORY.map((item) => {
          const isCritical = item.status === 'critical';
          const percent = Math.max(5, (item.current / item.minimum) * 100);
          
          return (
            <div key={item.id} className="group flex flex-col gap-2 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    {isCritical && <AlertTriangle className="w-3 h-3 text-rose-500" />}
                    {item.name}
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Supplier: {item.supplier}</p>
                </div>
                <button className="p-1.5 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-lg transition-colors" title="Create Purchase Order">
                  <ShoppingCart className="w-3.5 h-3.5" />
                </button>
              </div>
              
              <div>
                <div className="flex justify-between text-[10px] font-bold mb-1.5">
                  <span className={isCritical ? 'text-rose-500' : 'text-amber-500'}>{item.current} in stock</span>
                  <span className="text-slate-400">Min: {item.minimum}</span>
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
      </div>
    </motion.div>
  );
};
