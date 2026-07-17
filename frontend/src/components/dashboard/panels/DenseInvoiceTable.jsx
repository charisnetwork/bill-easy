import React, { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { FileText, MoreVertical, Download, Mail, ChevronRight } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';
import { cn } from '../../../lib/utils';

// Generate 1000 mock rows for virtualization test
const MOCK_INVOICES = Array.from({ length: 1000 }).map((_, i) => ({
  id: `INV-${2000 + i}`,
  customer: `Customer ${i + 1} Corp`,
  amount: Math.floor(Math.random() * 50000) + 1000,
  status: Math.random() > 0.3 ? 'Paid' : (Math.random() > 0.5 ? 'Overdue' : 'Pending'),
  date: new Date(Date.now() - Math.floor(Math.random() * 10000000000))
}));

export const DenseInvoiceTable = () => {
  const parentRef = useRef(null);

  const rowVirtualizer = useVirtualizer({
    count: MOCK_INVOICES.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48, // Fixed row height of 48px
    overscan: 5,
  });

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Paid': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400';
      case 'Overdue': return 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400';
      default: return 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-900 rounded-3xl p-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-slate-100 dark:border-slate-800 flex flex-col h-[400px] overflow-hidden"
    >
      <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md z-10 relative">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10">
            <FileText className="w-4 h-4 text-indigo-500" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Invoices</h3>
          <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full ml-2">
            1000+
          </span>
        </div>
        <button className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors flex items-center gap-1">
          View All <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest sticky top-0 z-10 shadow-sm">
        <div className="col-span-2">Invoice</div>
        <div className="col-span-4">Customer</div>
        <div className="col-span-2 text-right">Amount</div>
        <div className="col-span-2 text-center">Status</div>
        <div className="col-span-2 text-right">Actions</div>
      </div>

      {/* Virtualized Body */}
      <div 
        ref={parentRef}
        className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700 bg-white dark:bg-slate-900"
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const invoice = MOCK_INVOICES[virtualRow.index];
            return (
              <div
                key={virtualRow.index}
                className="absolute top-0 left-0 w-full flex items-center px-6 border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group cursor-pointer"
                style={{
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <div className="grid grid-cols-12 gap-4 w-full items-center">
                  <div className="col-span-2 font-bold text-slate-900 dark:text-white text-xs">
                    {invoice.id}
                  </div>
                  <div className="col-span-4">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{invoice.customer}</p>
                    <p className="text-[10px] text-slate-400">{format(invoice.date, 'dd MMM yyyy')}</p>
                  </div>
                  <div className="col-span-2 text-right font-mono font-bold text-slate-900 dark:text-white text-xs">
                    {formatCurrency(invoice.amount)}
                  </div>
                  <div className="col-span-2 flex justify-center">
                    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-transparent dark:border-current/10", getStatusBadge(invoice.status))}>
                      {invoice.status}
                    </span>
                  </div>
                  <div className="col-span-2 flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 text-slate-400 hover:text-indigo-600 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm transition-all">
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1.5 text-slate-400 hover:text-indigo-600 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm transition-all">
                      <Mail className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};
