import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAssetUrl } from '../../config/api';
import { 
  Search, Bell, Sparkles, Moon, Sun, 
  HelpCircle, ChevronDown, Menu, Building2,
  Shield, LogOut, Settings, Calendar
} from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

import { useTheme } from 'next-themes';
import { NotificationCenter } from './NotificationCenter';

export const Header = ({ setSidebarOpen, setCmdkOpen }) => {
  const { user, company, companies, logout, switchCompany, maxBusinesses } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    const lastPart = path.split('/').filter(Boolean).pop();
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(lastPart);
    if (isUUID) {
      if (path.includes('/invoices/')) return 'Invoices / Details';
      if (path.includes('/quotations/')) return 'Quotations / Details';
      if (path.includes('/purchases/')) return 'Purchases / Details';
      return 'Details';
    }
    const formatted = lastPart.charAt(0).toUpperCase() + lastPart.slice(1).replace('-', ' ');
    return `${formatted}`;
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/70 border-b border-slate-200/60 shadow-sm transition-all duration-200 px-4 md:px-8 h-16 flex items-center justify-between">
      
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <button
          className="p-2 hover:bg-slate-100 rounded-lg md:hidden"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="w-5 h-5 text-slate-600" />
        </button>

        <div className="hidden md:flex flex-col">
          <div className="flex items-center text-[11px] font-medium text-slate-400 mb-0.5">
            Bill Easy <span className="mx-1.5">•</span> {company?.name || 'Workspace'}
          </div>
          <h2 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-2">
            {getBreadcrumbs()}
          </h2>
        </div>
      </div>

      {/* Middle Section: Search (Ctrl+K) */}
      <div className="hidden md:flex flex-1 max-w-md mx-6">
        <button 
          onClick={() => setCmdkOpen(true)}
          className="w-full flex items-center gap-3 px-4 py-2 bg-slate-100/50 hover:bg-slate-100 border border-slate-200/60 rounded-full text-sm text-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        >
          <Search className="w-4 h-4 text-slate-400" />
          <span className="flex-1 text-left">Search anything...</span>
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white border border-slate-200 rounded font-semibold text-slate-500 shadow-sm">Ctrl</kbd>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white border border-slate-200 rounded font-semibold text-slate-500 shadow-sm">K</kbd>
          </div>
        </button>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-1.5 md:gap-3">
        
        {/* Date Filter (Desktop Only) */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-full mr-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-600">{format(new Date(), 'MMM d, yyyy')}</span>
        </div>

        {/* Action Icons */}
        <button className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors hidden sm:block relative group" title="AI Assistant">
          <Sparkles className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-indigo-500 rounded-full border-2 border-white scale-0 group-hover:scale-100 transition-transform"></span>
        </button>
        
        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors hidden sm:block" 
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <button className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors hidden sm:block" title="Help Center">
          <HelpCircle className="w-5 h-5" />
        </button>

        <NotificationCenter />

        <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block"></div>

        {/* Profile / Company Switcher Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-slate-100 transition-colors focus:outline-none">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-white">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
            </button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl shadow-xl border-slate-100 mt-2">
            <div className="px-3 py-2">
              <p className="text-sm font-bold text-slate-900">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
            
            <DropdownMenuSeparator className="my-1" />
            
            <DropdownMenuLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 py-1.5">
              Workspaces
            </DropdownMenuLabel>
            
            <div className="max-h-40 overflow-y-auto scrollbar-thin">
              {companies.map((c) => (
                <DropdownMenuItem
                  key={c.id}
                  onClick={() => switchCompany && switchCompany(c.id)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-colors",
                    c.id === company?.id ? "bg-indigo-50 text-indigo-700 font-medium" : "text-slate-700 hover:bg-slate-50"
                  )}
                >
                  <Building2 className={cn("w-4 h-4", c.id === company?.id ? "text-indigo-600" : "text-slate-400")} />
                  <span className="truncate flex-1">{c.name}</span>
                  {c.id === company?.id && (
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                  )}
                </DropdownMenuItem>
              ))}
            </div>

            <DropdownMenuSeparator className="my-1" />

            <DropdownMenuItem onClick={() => navigate('/settings')} className="rounded-xl py-2 px-3 cursor-pointer text-slate-700 hover:bg-slate-50">
              <Settings className="w-4 h-4 mr-3 text-slate-400" />
              <span className="font-medium">Account Settings</span>
            </DropdownMenuItem>

            {user?.email === 'pachu.mgd@gmail.com' && (
              <DropdownMenuItem 
                onClick={() => window.open(import.meta.env.VITE_ADMIN_PORTAL_URL || 'http://localhost:3021/admin-portal/', '_blank')}
                className="rounded-xl py-2 px-3 cursor-pointer text-indigo-600 focus:text-indigo-700 focus:bg-indigo-50"
              >
                <Shield className="w-4 h-4 mr-3" />
                <span className="font-bold">Platform Admin</span>
              </DropdownMenuItem>
            )}

            <DropdownMenuItem
              onClick={handleLogout}
              className="text-rose-600 rounded-xl py-2 px-3 cursor-pointer focus:bg-rose-50 focus:text-rose-700 mt-1"
            >
              <LogOut className="w-4 h-4 mr-3" />
              <span className="font-medium">Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

      </div>
    </header>
  );
};

export default Header;
