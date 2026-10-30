import React from 'react';
import { motion } from 'framer-motion';
import { Receipt, FileText, Users, ShoppingCart, Wallet, Check, ArrowUpRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '../../../lib/utils';
import { formatINR } from '../dashboardData';

const KINDS = {
  invoice: { icon: FileText, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-500/10', text: (a) => ['Invoice', a.ref, a.party && `for ${a.party}`] },
  payment_in: { icon: Receipt, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: (a) => ['Payment received', null, a.party && `from ${a.party}`] },
  payment_out: { icon: ArrowUpRight, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-500/10', text: (a) => ['Payment made', null, a.party && `to ${a.party}`] },
  purchase: { icon: ShoppingCart, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10', text: (a) => ['Purchase bill', a.ref, a.party && `from ${a.party}`] },
  expense: { icon: Wallet, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-500/10', text: (a) => ['Expense', a.ref, null] },
  customer: { icon: Users, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-500/10', text: (a) => ['New customer', a.party, null] },
};

export const RecentActivityFeed = ({ data }) => {
  const activity = (data?.recentActivity || []).filter((a) => KINDS[a.type]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-slate-100 dark:border-slate-800 h-full flex flex-col"
    >
      <div className="flex items-center gap-2 mb-6">
        <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800">
          <Check className="w-4 h-4 text-slate-500 dark:text-slate-400" />
        </div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Activity Feed</h3>
      </div>

      {activity.length === 0 ? (
        <p className="flex-1 flex items-center justify-center text-center text-xs text-slate-500 dark:text-slate-400 py-6">
          Invoices, payments, purchases and new customers will appear here as you add them.
        </p>
      ) : (
        <div className="flex-1 relative">
          <div className="absolute left-4 top-2 bottom-2 w-px bg-slate-100 dark:bg-slate-800"></div>
          <div className="space-y-6">
            {activity.map((item, idx) => {
              const kind = KINDS[item.type];
              const [label, ref, party] = kind.text(item);
              return (
                <motion.div
                  key={`${item.type}-${item.id}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="relative flex gap-4"
                >
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 relative z-10 ring-4 ring-white dark:ring-slate-900", kind.bg)}>
                    <kind.icon className={cn("w-4 h-4", kind.color)} />
                  </div>
                  <div className="flex-1 pt-1.5 min-w-0">
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-tight">
                      <span className="font-bold text-slate-900 dark:text-white">{label}</span>
                      {ref && <> <span className="font-bold text-indigo-600 dark:text-indigo-400">{ref}</span></>}
                      {party && <> {party}</>}
                      {item.amount !== null && <> · {formatINR(item.amount)}</>}
                    </p>
                    <p className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-wider">
                      {formatDistanceToNow(new Date(item.at), { addSuffix: true })}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
};
