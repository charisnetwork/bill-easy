import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar as CalendarIcon, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../../../lib/utils';
import { formatINR, dueInText, daysFromToday } from '../dashboardData';

// Real upcoming dates: GST returns (for GST-registered businesses) and unpaid invoices/bills due in the next two weeks.
export const BusinessCalendar = ({ data }) => {
  const gstRegistered = Boolean(data?.gst?.registered);
  const events = [
    ...(gstRegistered ? (data.gst.dueDates || []).map((g) => ({
      id: `gst-${g.form}`,
      title: `${g.form} filing`,
      detail: `For ${g.period_label}`,
      date: new Date(`${g.due_date}T00:00:00+05:30`),
      days: g.days_left,
    })) : []),
    ...(data?.upcomingDues || []).map((d) => ({
      id: `${d.kind}-${d.id}`,
      title: d.kind === 'receivable' ? `Payment due from ${d.party || 'customer'}` : `Pay ${d.party || 'supplier'}`,
      detail: `${d.ref} · ${formatINR(d.amount)}`,
      date: new Date(d.dueDate),
      days: daysFromToday(d.dueDate),
    })),
  ].sort((a, b) => a.days - b.days).slice(0, 5);

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
        {events.map((event) => {
          const isUrgent = event.days <= 3;
          return (
            <div key={event.id} className="group flex items-start gap-3 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 shrink-0 border border-slate-100 dark:border-slate-700">
                <span className="text-[10px] font-bold text-slate-500 uppercase">{format(event.date, 'MMM')}</span>
                <span className={cn("text-lg font-black tracking-tight leading-none", isUrgent ? 'text-rose-500' : 'text-slate-900 dark:text-white')}>
                  {format(event.date, 'dd')}
                </span>
              </div>
              <div className="flex-1 pt-1 min-w-0">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
                  {isUrgent && <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />}
                  {event.title}
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 truncate">{event.detail}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {dueInText(event.days)}
                </p>
              </div>
            </div>
          );
        })}

        {events.length === 0 && (
          <p className="text-xs text-slate-500 dark:text-slate-400 py-6 text-center">
            Nothing due in the next two weeks.
          </p>
        )}
        {!gstRegistered && (
          <p className="text-[10px] text-slate-400 text-center">
            GST filing dates appear here once you add your GSTIN in{' '}
            <Link to="/settings" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">Settings</Link>.
          </p>
        )}
      </div>
    </motion.div>
  );
};
