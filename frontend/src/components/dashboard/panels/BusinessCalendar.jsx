import React from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, AlertCircle } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { cn } from '../../../lib/utils';

const MOCK_EVENTS = [
  { id: 1, title: 'GSTR-1 Filing', date: addDays(new Date(), 3), type: 'tax', urgency: 'high' },
  { id: 2, title: 'Payroll Processing', date: addDays(new Date(), 5), type: 'admin', urgency: 'medium' },
  { id: 3, title: 'Supplier Payments Due', date: addDays(new Date(), 8), type: 'finance', urgency: 'medium' },
];

export const BusinessCalendar = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-slate-100 dark:border-slate-800 h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-500/10">
            <CalendarIcon className="w-4 h-4 text-blue-500" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Business Calendar</h3>
        </div>
      </div>

      <div className="flex-1 space-y-3">
        {MOCK_EVENTS.map((event) => {
          const isUrgent = event.urgency === 'high';
          
          return (
            <div key={event.id} className="group flex items-start gap-3 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 shrink-0 border border-slate-100 dark:border-slate-700">
                <span className="text-[10px] font-bold text-slate-500 uppercase">{format(event.date, 'MMM')}</span>
                <span className={cn("text-lg font-black tracking-tight leading-none", isUrgent ? 'text-rose-500' : 'text-slate-900 dark:text-white')}>
                  {format(event.date, 'dd')}
                </span>
              </div>
              
              <div className="flex-1 pt-1">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  {isUrgent && <AlertCircle className="w-3 h-3 text-rose-500" />}
                  {event.title}
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Due in {Math.ceil((event.date - new Date()) / (1000 * 60 * 60 * 24))} days
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};
