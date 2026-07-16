import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Clock, ChevronRight, PackageX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../../lib/utils';

export const TodaysTasks = ({ data }) => {
  const navigate = useNavigate();

  // Generate tasks based on data
  const tasks = [];

  if (data?.pendingPayments > 10000) {
    tasks.push({
      id: 1,
      title: 'Follow up on overdue invoices',
      desc: `₹${data.pendingPayments.toLocaleString('en-IN')} outstanding`,
      icon: Clock,
      color: 'text-amber-500',
      bg: 'bg-amber-50 dark:bg-amber-500/10',
      route: '/invoices',
      priority: 'high'
    });
  }

  // Mocked for demo
  tasks.push({
    id: 2,
    title: 'Low stock items require reorder',
    desc: '3 items below minimum threshold',
    icon: PackageX,
    color: 'text-rose-500',
    bg: 'bg-rose-50 dark:bg-rose-500/10',
    route: '/products',
    priority: 'high'
  });

  tasks.push({
    id: 3,
    title: 'GSTR-1 Filing approaching',
    desc: 'Due in 4 days',
    icon: AlertCircle,
    color: 'text-indigo-500',
    bg: 'bg-indigo-50 dark:bg-indigo-500/10',
    route: '/reports',
    priority: 'medium'
  });

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-slate-100 dark:border-slate-800 h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Today's Tasks</h3>
        </div>
        <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>

      <div className="flex-1 space-y-3">
        {tasks.map((task) => (
          <div 
            key={task.id}
            onClick={() => navigate(task.route)}
            className="group flex items-center justify-between p-3 rounded-2xl border border-slate-100 dark:border-slate-800/60 hover:border-indigo-100 dark:hover:border-indigo-500/30 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", task.bg)}>
                <task.icon className={cn("w-4 h-4", task.color)} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {task.title}
                </p>
                <p className="text-[10px] font-medium text-slate-500 dark:text-slate-500 mt-0.5">
                  {task.desc}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 transition-colors transform group-hover:translate-x-1" />
          </div>
        ))}

        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mb-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            </div>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">All caught up!</p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Enjoy the rest of your day.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
