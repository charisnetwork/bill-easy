import React from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, ChevronRight, Plus } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { formatINR, daysFromToday } from '../dashboardData';

const statusOf = (invoice) => {
  if (invoice.status === 'cancelled') return 'Cancelled';
  if (invoice.paymentStatus === 'paid') return 'Paid';
  if (invoice.dueDate && daysFromToday(invoice.dueDate) < 0) return 'Overdue';
  return invoice.paymentStatus === 'partial' ? 'Partly paid' : 'Unpaid';
};

const BADGE = {
  Paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  Overdue: 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400',
  Cancelled: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
};

export const DenseInvoiceTable = ({ data }) => {
  const navigate = useNavigate();
  const invoices = data?.recentInvoices || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-900 rounded-3xl p-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden"
    >
      <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10">
            <FileText className="w-4 h-4 text-indigo-500" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Invoices</h3>
        </div>
        <Link to="/invoices" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors flex items-center gap-1">
          View All <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      {invoices.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-12 px-6">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No invoices yet</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Your latest invoices will be listed here.</p>
          <Link to="/invoices/new" className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl">
            <Plus className="w-3.5 h-3.5" /> Create Invoice
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-[520px]">
            <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              <div className="col-span-3">Invoice</div>
              <div className="col-span-4">Customer</div>
              <div className="col-span-3 text-right">Amount</div>
              <div className="col-span-2 text-center">Status</div>
            </div>
            {invoices.map((invoice) => {
              const status = statusOf(invoice);
              return (
                <div
                  key={invoice.id}
                  onClick={() => navigate(`/invoices/${invoice.id}`)}
                  className="grid grid-cols-12 gap-4 px-6 py-3 items-center border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
                >
                  <div className="col-span-3 font-bold text-slate-900 dark:text-white text-xs truncate">{invoice.number}</div>
                  <div className="col-span-4 min-w-0">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{invoice.customer || '—'}</p>
                    <p className="text-[10px] text-slate-400">{format(new Date(invoice.date), 'dd MMM yyyy')}</p>
                  </div>
                  <div className="col-span-3 text-right font-mono font-bold text-slate-900 dark:text-white text-xs">
                    {formatINR(invoice.amount)}
                  </div>
                  <div className="col-span-2 flex justify-center">
                    <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap', BADGE[status] || 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400')}>
                      {status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
};
