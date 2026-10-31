import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Users, Phone, ArrowRight, AlertCircle, Clock } from 'lucide-react';
import { formatINR, plural, daysFromToday } from '../dashboardData';

export const ReceivablesWidget = ({ data }) => {
  const customers = data?.receivables?.topCustomers || [];

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
        <Link to="/reports" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors flex items-center gap-1">
          Reports <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="flex-1 space-y-3">
        {customers.map((item) => {
          const days = item.oldestDue ? -daysFromToday(item.oldestDue) : null;
          return (
            <div key={item.id} className="group flex items-center justify-between p-3 rounded-2xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-sm shrink-0">
                  {item.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{item.name}</h4>
                  {days !== null && days > 0 ? (
                    <p className="text-[10px] text-rose-500 font-medium flex items-center gap-1 mt-0.5">
                      <AlertCircle className="w-3 h-3" /> {plural(days, 'day')} overdue
                    </p>
                  ) : (
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" /> {plural(item.invoices, 'unpaid invoice')}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-xs font-black text-slate-900 dark:text-white">{formatINR(item.amount)}</p>
                {item.phone && (
                  <a href={`tel:${item.phone}`} className="p-1.5 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-lg transition-colors" title={`Call ${item.phone}`}>
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
        {customers.length === 0 && (
          <p className="text-xs text-slate-500 dark:text-slate-400 py-6 text-center">No money waiting to be collected.</p>
        )}
      </div>
    </motion.div>
  );
};
