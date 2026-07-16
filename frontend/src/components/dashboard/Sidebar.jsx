import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, Package, FileText, ShoppingCart,
  Wallet, BarChart3, Settings, Truck, ChevronDown, 
  Building2, Plus, ArrowLeftRight
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export const Sidebar = ({ open, setOpen }) => {
  const { user, company, companies, switchCompany, hasFeature } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [expandedSections, setExpandedSections] = useState({
    inventory: location.pathname.startsWith('/stock-transfer') || location.pathname.startsWith('/products'),
    sales: location.pathname.startsWith('/invoices') || location.pathname.startsWith('/quotations') || location.pathname.startsWith('/sales-return'),
    purchases: location.pathname.startsWith('/purchase')
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const menuSections = [
    {
      title: 'Overview',
      items: [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      ]
    },
    {
      title: 'Business',
      items: [
        {
          label: 'Sales',
          icon: FileText,
          key: 'sales',
          subItems: [
            { path: '/invoices', label: 'Invoices' },
            { path: '/quotations', label: 'Estimates' },
            { path: '/payments-in', label: 'Payment In' },
            { path: '/sales-return', label: 'Sales Return' },
          ]
        },
        {
          label: 'Purchases',
          icon: ShoppingCart,
          key: 'purchases',
          subItems: [
            { path: '/purchases', label: 'Purchase Entry' },
            { path: '/purchase/po-list', label: 'PO Order' },
          ]
        },
        { path: '/expenses', icon: Wallet, label: 'Expenses' },
      ]
    },
    {
      title: 'Directory',
      items: [
        { path: '/customers', icon: Users, label: 'Customers' },
        { path: '/suppliers', icon: Truck, label: 'Suppliers' },
        {
          label: 'Inventory',
          icon: Package,
          key: 'inventory',
          subItems: [
            { path: '/products', label: 'All Items' },
            { path: '/stock-transfer', label: 'Stock Transfer', hidden: !hasFeature('multi_godowns') },
          ]
        },
      ]
    },
    {
      title: 'Management',
      items: [
        { path: '/eway-bills', icon: Truck, label: 'E-Way Bills', hidden: !hasFeature('eway_bills') },
        { path: '/reports', icon: BarChart3, label: 'Reports' },
        { path: '/settings', icon: Settings, label: 'Settings' },
      ]
    }
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside 
        className={cn(
          "fixed md:sticky top-0 left-0 z-50 h-screen shrink-0 transition-transform duration-300 md:translate-x-0 w-[280px]",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-full py-4 pl-4 pr-0">
          <div className="h-full bg-white rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-200/20 flex flex-col overflow-hidden relative">
            
            {/* Top Logo / Workspace Area */}
            <div className="p-5 border-b border-slate-100/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="font-bold text-slate-900 text-sm truncate">{company?.name || 'Bill Easy'}</h1>
                  <p className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wider truncate">Workspace</p>
                </div>
                <button className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-lg transition-colors">
                  <ArrowLeftRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 py-4 px-3 space-y-6">
              {menuSections.map((section, idx) => (
                <div key={idx} className="space-y-1">
                  <h3 className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">
                    {section.title}
                  </h3>
                  
                  {section.items.filter(item => !item.hidden).map((item) => {
                    
                    if (item.subItems) {
                      const isExpanded = expandedSections[item.key];
                      const isActive = item.subItems.some(sub => location.pathname === sub.path || location.pathname.startsWith(`${sub.path}/`));
                      
                      return (
                        <div key={item.key} className="space-y-0.5">
                          <button
                            onClick={() => toggleSection(item.key)}
                            className={cn(
                              "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                              isActive ? "text-indigo-700 bg-indigo-50/50" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <item.icon className={cn("w-4 h-4", isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600")} />
                              {item.label}
                            </div>
                            <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform duration-200", isExpanded && "rotate-180")} />
                          </button>
                          
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="pl-10 pr-2 py-1 space-y-1 relative before:absolute before:left-[21px] before:top-0 before:bottom-0 before:w-px before:bg-slate-100">
                                  {item.subItems.filter(sub => !sub.hidden).map(sub => {
                                    const isSubActive = location.pathname === sub.path || location.pathname.startsWith(`${sub.path}/`);
                                    return (
                                      <Link
                                        key={sub.path}
                                        to={sub.path}
                                        onClick={() => setOpen(false)}
                                        className={cn(
                                          "block px-3 py-2 rounded-lg text-xs font-medium transition-colors relative",
                                          isSubActive 
                                            ? "text-indigo-700 bg-indigo-50 before:absolute before:left-[-20px] before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-1 before:rounded-full before:bg-indigo-600" 
                                            : "text-slate-500 hover:text-slate-900 hover:bg-slate-50/80"
                                        )}
                                      >
                                        {sub.label}
                                      </Link>
                                    );
                                  })}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    }

                    const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(`${item.path}/`));
                    
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative",
                          isActive ? "text-indigo-700 bg-indigo-50/80 shadow-sm shadow-indigo-100/50" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        )}
                      >
                        {isActive && (
                          <motion.div 
                            layoutId="activeIndicator"
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-600 rounded-r-full"
                          />
                        )}
                        <item.icon className={cn("w-4 h-4", isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600")} />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              ))}
            </nav>

            {/* Bottom Profile Card */}
            <div className="p-4 border-t border-slate-100/50 bg-slate-50/50">
              <div className="flex items-center gap-3 p-2 hover:bg-white rounded-xl transition-colors cursor-pointer border border-transparent hover:border-slate-200/60 shadow-sm hover:shadow-md">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                  <span className="text-indigo-700 font-bold text-sm">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
                  <p className="text-[10px] text-slate-500 truncate font-medium">{user?.role?.toUpperCase() || 'USER'}</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
