import React from 'react';
import { motion } from 'framer-motion';
import { Receipt, FileText, Users, Box, Check, MoreHorizontal } from 'lucide-react';
import { cn } from '../../../lib/utils';

const MOCK_ACTIVITY = [
  { id: 1, type: 'invoice', user: 'Alex Rivera', action: 'created Invoice', target: '#1045', time: '10 mins ago', icon: FileText, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
  { id: 2, type: 'payment', user: 'System', action: 'received payment for', target: '#1042', time: '2 hours ago', icon: Receipt, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
  { id: 3, type: 'customer', user: 'Sarah Chen', action: 'added new customer', target: 'Apex Corp', time: '4 hours ago', icon: Users, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-500/10' },
  { id: 4, type: 'product', user: 'Alex Rivera', action: 'updated stock for', target: 'Ultra Cement', time: '1 day ago', icon: Box, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' },
];

export const RecentActivityFeed = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-slate-100 dark:border-slate-800 h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800">
            <Check className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Activity Feed</h3>
        </div>
        <button className="text-slate-400 hover:text-indigo-600 transition-colors">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 relative">
        {/* Vertical Line */}
        <div className="absolute left-4 top-2 bottom-2 w-px bg-slate-100 dark:bg-slate-800"></div>
        
        <div className="space-y-6">
          {MOCK_ACTIVITY.map((activity, idx) => (
            <motion.div 
              key={activity.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="relative flex gap-4 group"
            >
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 relative z-10 ring-4 ring-white dark:ring-slate-900", activity.bg)}>
                <activity.icon className={cn("w-4 h-4", activity.color)} />
              </div>
              <div className="flex-1 pt-1.5">
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-tight">
                  <span className="font-bold text-slate-900 dark:text-white">{activity.user}</span>{' '}
                  {activity.action}{' '}
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline">{activity.target}</span>
                </p>
                <p className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-wider">
                  {activity.time}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
      <button className="mt-6 w-full py-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors rounded-xl">
        View All Activity
      </button>
    </motion.div>
  );
};
