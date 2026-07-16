import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Sidebar } from './dashboard/Sidebar';
import { Header } from './dashboard/Header';
import { CommandPalette } from './dashboard/CommandPalette';
import Footer from './Footer';
import { Plus, FileText, ShoppingCart, Truck } from 'lucide-react';
import { cn } from '../lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { motion } from 'framer-motion';

export const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cmdkOpen, setCmdkOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
      <CommandPalette open={cmdkOpen} setOpen={setCmdkOpen} />
      
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative w-full min-w-0">
        
        <Header setSidebarOpen={setSidebarOpen} setCmdkOpen={setCmdkOpen} />

        <main className="flex-1 overflow-y-auto flex flex-col relative pb-20 md:pb-0 scrollbar-thin scrollbar-thumb-slate-200">
          {/* Animated Page Transitions wrapper */}
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="p-4 md:p-6 lg:p-8 flex-1"
          >
            {children}
          </motion.div>

          <div className="mt-auto shrink-0 px-4 md:px-8 pb-4">
            <Footer />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar - keeping it but restyling slightly for premium feel */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-200/60 z-50 pb-safe shadow-[0_-8px_30px_-15px_rgba(0,0,0,0.1)]">
        <div className="flex items-center justify-around h-16 px-2">
          <Link to="/dashboard" className={cn("flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors", location.pathname === '/dashboard' ? "text-indigo-600" : "text-slate-500 hover:text-slate-900")}>
            <div className={cn("p-1.5 rounded-lg", location.pathname === '/dashboard' && "bg-indigo-50")}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
            </div>
            <span className="text-[10px] font-bold">Home</span>
          </Link>
          <Link to="/invoices" className={cn("flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors", location.pathname.startsWith('/invoices') ? "text-indigo-600" : "text-slate-500 hover:text-slate-900")}>
            <div className={cn("p-1.5 rounded-lg", location.pathname.startsWith('/invoices') && "bg-indigo-50")}>
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold">Invoices</span>
          </Link>
          
          <div className="relative -top-5 flex justify-center w-full">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center justify-center w-14 h-14 bg-indigo-600 hover:bg-indigo-700 transition-colors text-white rounded-full shadow-lg shadow-indigo-600/30 ring-4 ring-slate-50 active:scale-95">
                  <Plus className="w-6 h-6 stroke-[3px]" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" sideOffset={15} className="w-56 rounded-2xl shadow-xl p-2 border-slate-100 mb-2">
                <DropdownMenuLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 py-1.5">Quick Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/invoices/new')} className="py-3 cursor-pointer rounded-xl hover:bg-indigo-50 focus:bg-indigo-50 text-indigo-700">
                  <FileText className="w-4 h-4 mr-3" />
                  <span className="font-semibold">Create Invoice</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/purchases/new')} className="py-3 cursor-pointer rounded-xl hover:bg-purple-50 focus:bg-purple-50 text-purple-700">
                  <ShoppingCart className="w-4 h-4 mr-3" />
                  <span className="font-semibold">Create Purchase</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/eway-bills/new')} className="py-3 cursor-pointer rounded-xl hover:bg-emerald-50 focus:bg-emerald-50 text-emerald-700">
                  <Truck className="w-4 h-4 mr-3" />
                  <span className="font-semibold">Create E-Way Bill</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Link to="/products" className={cn("flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors", location.pathname.startsWith('/products') ? "text-indigo-600" : "text-slate-500 hover:text-slate-900")}>
            <div className={cn("p-1.5 rounded-lg", location.pathname.startsWith('/products') && "bg-indigo-50")}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16.5 9.4 7.5 4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.29 7 12 12 20.71 7"/><polyline points="12 22 12 12"/></svg>
            </div>
            <span className="text-[10px] font-bold">Items</span>
          </Link>
          <button onClick={() => setSidebarOpen(true)} className={cn("flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors", sidebarOpen ? "text-indigo-600" : "text-slate-500 hover:text-slate-900")}>
            <div className={cn("p-1.5 rounded-lg", sidebarOpen && "bg-indigo-50")}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
            </div>
            <span className="text-[10px] font-bold">Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
