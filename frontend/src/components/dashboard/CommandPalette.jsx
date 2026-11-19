import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Command } from 'cmdk';
import { useNavigate } from 'react-router-dom';
import { 
  Search, FileText, Users, Package, ShoppingCart, 
  Wallet, BarChart3, Settings, Truck 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const CommandPalette = ({ open, setOpen }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [setOpen]);

  // Live results from this business's records (customers, suppliers, products, invoices, quotations).
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  useEffect(() => {
    if (!open) { setQuery(''); setResults(null); return undefined; }
    const text = query.trim();
    if (text.length < 2) { setResults(null); return undefined; }
    let cancelled = false;
    const timer = setTimeout(() => {
      api.get('/search', { params: { q: text } }).then((res) => { if (!cancelled) setResults(res.data); }).catch(() => { if (!cancelled) setResults(null); });
    }, 250);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [query, open]);

  const runCommand = (command) => {
    setOpen(false);
    command();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="fixed inset-0 z-[70] flex items-start justify-center pt-[10vh] pointer-events-none"
          >
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden pointer-events-auto border border-slate-100 flex flex-col mx-4">
              <Command className="w-full flex flex-col bg-transparent" loop>
                <div className="flex items-center px-4 border-b border-slate-100 bg-slate-50/50">
                  <Search className="w-5 h-5 text-indigo-500 shrink-0" />
                  <Command.Input 
                    value={query}
                    onValueChange={setQuery}
                    placeholder="Search invoices, customers, products, settings..." 
                    className="flex-1 px-4 py-4 bg-transparent outline-none text-slate-800 placeholder:text-slate-400 font-medium"
                    autoFocus
                  />
                  <div className="px-2 py-1 bg-slate-200/60 rounded text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">
                    ESC
                  </div>
                </div>

                <Command.List className="max-h-[60vh] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-200">
                  <Command.Empty className="py-12 text-center text-sm text-slate-500 font-medium">
                    No results found.
                  </Command.Empty>

                  {results && [
                    ['Customers', results.customers, (r) => r.name, (r) => r.phone, (r) => `/customers?search=${encodeURIComponent(r.name)}`],
                    ['Suppliers', results.suppliers, (r) => r.name, (r) => r.phone, (r) => `/suppliers?search=${encodeURIComponent(r.name)}`],
                    ['Products', results.products, (r) => r.name, (r) => r.sku, (r) => `/products?search=${encodeURIComponent(r.name)}`],
                    ['Invoices', results.invoices, (r) => r.invoice_number, (r) => `₹${Number(r.total_amount || 0).toLocaleString('en-IN')}`, (r) => `/invoices/${r.id}`],
                    ['Quotations', results.quotations, (r) => r.quotation_number, (r) => `₹${Number(r.total_amount || 0).toLocaleString('en-IN')}`, (r) => `/quotations/${r.id}`],
                  ].filter(([, rows]) => rows?.length).map(([heading, rows, title, detail, to]) => (
                    <Command.Group key={heading} heading={heading} className="px-2 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {rows.map((row) => (
                        <Command.Item key={row.id} value={`${heading} ${title(row)} ${detail(row) || ''} ${row.id}`} onSelect={() => runCommand(() => navigate(to(row)))} className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm text-slate-700 rounded-xl cursor-pointer aria-selected:bg-indigo-50 aria-selected:text-indigo-700 normal-case tracking-normal">
                          <span className="font-medium">{title(row)}</span>
                          {detail(row) && <span className="text-xs text-slate-400">{detail(row)}</span>}
                        </Command.Item>
                      ))}
                    </Command.Group>
                  ))}

                  <Command.Group heading="Quick Actions" className="px-2 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <Command.Item onSelect={() => runCommand(() => navigate('/invoices/new'))} className="flex items-center gap-3 px-3 py-3 text-sm text-slate-700 rounded-xl cursor-pointer aria-selected:bg-indigo-50 aria-selected:text-indigo-700 transition-colors">
                      <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100">
                        <FileText className="w-4 h-4 text-indigo-600" />
                      </div>
                      <span className="font-medium">Create Invoice</span>
                    </Command.Item>
                    <Command.Item onSelect={() => runCommand(() => navigate('/customers'))} className="flex items-center gap-3 px-3 py-3 text-sm text-slate-700 rounded-xl cursor-pointer aria-selected:bg-indigo-50 aria-selected:text-indigo-700 transition-colors">
                      <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100">
                        <Users className="w-4 h-4 text-indigo-600" />
                      </div>
                      <span className="font-medium">Add Customer</span>
                    </Command.Item>
                    <Command.Item onSelect={() => runCommand(() => navigate('/products'))} className="flex items-center gap-3 px-3 py-3 text-sm text-slate-700 rounded-xl cursor-pointer aria-selected:bg-indigo-50 aria-selected:text-indigo-700 transition-colors">
                      <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100">
                        <Package className="w-4 h-4 text-indigo-600" />
                      </div>
                      <span className="font-medium">Add Product</span>
                    </Command.Item>
                  </Command.Group>

                  <Command.Group heading="Navigation" className="px-2 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mt-2 border-t border-slate-100 pt-4">
                    {[
                      { icon: FileText, label: 'Invoices', path: '/invoices' },
                      { icon: Users, label: 'Customers', path: '/customers' },
                      { icon: Truck, label: 'Suppliers', path: '/suppliers' },
                      { icon: Package, label: 'Products', path: '/products' },
                      { icon: ShoppingCart, label: 'Purchases', path: '/purchases' },
                      { icon: Wallet, label: 'Expenses', path: '/expenses' },
                      { icon: BarChart3, label: 'Reports', path: '/reports' },
                      { icon: Settings, label: 'Settings', path: '/settings' },
                    ].map((item) => (
                      <Command.Item 
                        key={item.path}
                        onSelect={() => runCommand(() => navigate(item.path))} 
                        className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-700 rounded-xl cursor-pointer aria-selected:bg-slate-100 transition-colors"
                      >
                        <item.icon className="w-4 h-4 text-slate-400" />
                        <span className="font-medium">{item.label}</span>
                      </Command.Item>
                    ))}
                  </Command.Group>
                </Command.List>
              </Command>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
