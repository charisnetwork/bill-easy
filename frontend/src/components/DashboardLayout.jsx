import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, Package, FileText, ShoppingCart,
  Wallet, BarChart3, Settings, LogOut, Menu, X, CreditCard,
  Building2, ChevronDown, Bell, Search, Truck, Plus, Shield, Zap
} from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { cn } from '../lib/utils';
import { getAssetUrl } from '../config/api';
import Footer from './Footer';

export const DashboardLayout = ({ children }) => {

  const { user, company, companies, logout, switchCompany, hasFeature, subscription, maxBusinesses } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [salesOpen, setSalesOpen] = useState(location.pathname.startsWith('/invoices') || location.pathname.startsWith('/quotations') || location.pathname.startsWith('/sales-return'));
  const [inventoryOpen, setInventoryOpen] = useState(location.pathname.startsWith('/stock-transfer') || location.pathname.startsWith('/products'));
  const [purchasesOpen, setPurchasesOpen] = useState(location.pathname.startsWith('/purchase'));

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/customers', icon: Users, label: 'Customers' },
    { path: '/suppliers', icon: Truck, label: 'Suppliers' },
    { 
      label: 'Inventory', 
      icon: Package, 
      isDropdown: true,
      isOpen: inventoryOpen,
      toggle: () => setInventoryOpen(!inventoryOpen),
      subItems: [
        { path: '/products', label: 'All Items', key: 'all-items' },
        { 
          path: '/stock-transfer', 
          label: 'Stock Transfer',
          key: 'stock-transfer',
          hidden: !hasFeature('multi_godowns')
        },
        { 
          path: '/settings?tab=godowns', 
          label: 'Manage Godowns',
          key: 'manage-godowns',
          hidden: !hasFeature('multi_godowns')
        },
      ].filter(s => !s.hidden)
    },
    { 
      label: 'Sales', 
      icon: FileText, 
      isDropdown: true,
      isOpen: salesOpen,
      toggle: () => setSalesOpen(!salesOpen),
      subItems: [
        { path: '/invoices', label: 'Sales Invoices', key: 'sales-invoices' },
        { path: '/quotations', label: 'Quotation / Estimate', key: 'quotation-estimate' },
        { path: '/payments-in', label: 'Payment In', key: 'payment-in' },
        { path: '/sales-return', label: 'Sales Return', key: 'sales-return' },
      ]
    },
    { 
      path: '/eway-bills', 
      icon: Truck, 
      label: 'E-Way Bills',
      hidden: !hasFeature('eway_bills')
    },
    { 
      label: 'Purchases', 
      icon: ShoppingCart, 
      isDropdown: true,
      isOpen: purchasesOpen,
      toggle: () => setPurchasesOpen(!purchasesOpen),
      subItems: [
        { path: '/purchases', label: 'Purchase Entry', key: 'purchase-entry' },
        { path: '/purchase/po-list', label: 'PO Order', key: 'po-order' },
      ]
    },
    { path: '/expenses', icon: Wallet, label: 'Expenses' },
    { path: '/reports', icon: BarChart3, label: 'Reports' },
    { path: '/subscription', icon: CreditCard, label: 'Subscription' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ].filter(item => !item.hidden);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCompanyChange = (companyId) => {
    if (switchCompany) {
      switchCompany(companyId);
    }
  };

  const canAddBusiness = user?.role === 'owner' && companies.length < (maxBusinesses || 1);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out print:hidden pt-safe",
        location.pathname.startsWith('/settings') ? "hidden" : "md:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>

        <div className="flex flex-col h-full">

          {/* Company Section */}
          <div className="p-4 border-b border-slate-200">

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center justify-between w-full text-left">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-emerald-600" />
                    <span className="font-semibold text-slate-900">
                      {company?.name || 'Select Company'}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 py-1.5">
                  Switch Business
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-[300px] overflow-y-auto">
                  {companies.map((c) => (
                    <DropdownMenuItem
                      key={c.id}
                      onClick={() => handleCompanyChange(c.id)}
                      className={cn(
                        "flex items-center gap-2 cursor-pointer transition-colors",
                        c.id === company?.id && "bg-emerald-50 text-emerald-700 font-medium"
                      )}
                    >
                      <Building2 className={cn("w-4 h-4", c.id === company?.id ? "text-emerald-600" : "text-slate-400")} />
                      <span className="truncate">{c.name}</span>
                    </DropdownMenuItem>
                  ))}
                </div>
                {canAddBusiness && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => navigate('/settings/business/new')}
                      className="cursor-pointer text-emerald-600 focus:text-emerald-700 focus:bg-emerald-50"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Business
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Tagline */}
            {company?.tagline && (
              <div className="mt-3 px-1">
                <p className="text-[10px] italic text-slate-500 font-medium leading-relaxed line-clamp-2">
                  "{company.tagline}"
                </p>
              </div>
            )}

          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            <ul className="space-y-1">

              {menuItems.map((item, idx) => {
                if (item.isDropdown) {
                  const isAnySubItemActive = item.subItems.some(sub => 
                    location.pathname === sub.path || location.pathname.startsWith(sub.path)
                  );

                  return (
                    <li key={`dropdown-${idx}`}>
                      <button
                        onClick={item.toggle}
                        className={cn(
                          "sidebar-item w-full justify-between",
                          isAnySubItemActive && "text-emerald-700 bg-emerald-50 font-medium"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <item.icon className="w-5 h-5" />
                          <span>{item.label}</span>
                        </div>
                        <ChevronDown className={cn(
                          "w-4 h-4 transition-transform duration-200",
                          item.isOpen && "rotate-180"
                        )} />
                      </button>
                      
                      {item.isOpen && (
                        <ul className="mt-1 ml-9 space-y-1">
                          {item.subItems.map((sub) => {
                            const isSubActive = location.pathname === sub.path || location.pathname.startsWith(sub.path);
                            return (
                              <li key={sub.key || sub.path}>
                                <Link
                                  to={sub.path}
                                  className={cn(
                                    "flex items-center py-2 px-3 text-sm rounded-lg transition-colors",
                                    isSubActive 
                                      ? "text-emerald-700 bg-emerald-50/50 font-medium" 
                                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                                  )}
                                  onClick={() => setSidebarOpen(false)}
                                >
                                  {sub.label}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                }

                const isActive =
                  location.pathname === item.path ||
                  (item.path !== '/dashboard' &&
                    location.pathname.startsWith(item.path));

                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={cn(
                        "sidebar-item",
                        isActive && "active"
                      )}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );

              })}

            </ul>
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-slate-200">

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                <span className="text-emerald-700 font-semibold">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {user?.email}
                </p>
              </div>

            </div>

          </div>

        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <header className="min-h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shrink-0 print:hidden pt-safe">

          <div className="flex items-center gap-4">

            <button
              className="hidden p-2 hover:bg-slate-100 rounded-lg"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="hidden md:flex flex-col">
              <h2 className="text-lg font-bold text-slate-800 leading-tight">
                {(() => {
                  const lastPart = location.pathname.split('/').pop();
                  // Check if last part is a UUID
                  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(lastPart);
                  
                  if (isUUID) {
                    if (location.pathname.includes('/invoices/')) return 'Invoice Details';
                    if (location.pathname.includes('/quotations/')) return 'Quotation Details';
                    if (location.pathname.includes('/purchases/')) return 'Purchase Details';
                    return 'Details';
                  }
                  
                  return lastPart.charAt(0).toUpperCase() + lastPart.slice(1).replace('-', ' ') || 'Dashboard';
                })()}
              </h2>
              <p className="text-xs text-slate-500">Welcome back, {user?.name}</p>
            </div>

          </div>

          <div className="flex items-center gap-6">

            {/* Company Quick Info */}
            <div className="hidden lg:flex items-center gap-4 pr-6 border-r border-slate-200">
              <div className="text-right max-w-[300px]">
                {company?.tagline && (
                  <p className="text-xs italic text-slate-500 font-medium line-clamp-2 leading-relaxed">
                    "{company.tagline}"
                  </p>
                )}
              </div>
              
              <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shadow-sm">
                {company?.logo ? (
                  <img 
                    src={getAssetUrl(company.logo)} 
                    alt="Logo" 
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  <Building2 className="w-6 h-6 text-emerald-600" />
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="p-2.5 hover:bg-slate-100 rounded-xl relative transition-colors">
                <Bell className="w-5 h-5 text-slate-600" />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-12 gap-3 px-2 hover:bg-slate-50 rounded-xl">
                    <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-md shadow-emerald-100">
                      <span className="text-white text-sm font-bold">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="hidden md:flex flex-col items-start">
                      <span className="text-sm font-bold text-slate-800 leading-none">
                        {user?.name}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium mt-1">
                        {user?.role?.toUpperCase()}
                      </span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl shadow-xl border-slate-200">
                  <DropdownMenuItem 
                    onClick={() => navigate('/settings')}
                    className="rounded-lg py-2.5 cursor-pointer"
                  >
                    <Settings className="w-4 h-4 mr-3 text-slate-500" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Settings</span>
                      <span className="text-[10px] text-slate-400">Account & Preferences</span>
                    </div>
                  </DropdownMenuItem>

                  {user?.email === 'pachu.mgd@gmail.com' && (
                    <DropdownMenuItem 
                      onClick={() => window.open(import.meta.env.VITE_ADMIN_PORTAL_URL || 'http://localhost:3021/admin-portal/', '_blank')}
                      className="rounded-lg py-2.5 cursor-pointer text-indigo-600 focus:text-indigo-700"
                    >
                      <Shield className="w-4 h-4 mr-3" />
                      <div className="flex flex-col">
                        <span className="text-sm font-bold">Platform Admin</span>
                        <span className="text-[10px] opacity-70">Developer Control Center</span>
                      </div>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator className="my-2" />

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-rose-600 rounded-lg py-2.5 cursor-pointer focus:bg-rose-50 focus:text-rose-700"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    <span className="text-sm font-medium">Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

          </div>

        </header>

        {/* Page */}
        <main className="flex-1 overflow-y-auto flex flex-col print:overflow-visible print:bg-white relative pb-20 md:pb-0">
          <div className="p-4 md:p-6 lg:p-8 print:p-0">
            {children}
          </div>
          <div className="mt-auto print:hidden shrink-0">
            <Footer />
          </div>
        </main>

      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-around h-16 px-2">
          <Link to="/dashboard" className={cn("flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors", location.pathname === '/dashboard' ? "text-emerald-600" : "text-slate-500 hover:text-slate-900")}>
            <LayoutDashboard className={cn("w-5 h-5", location.pathname === '/dashboard' && "fill-emerald-100")} />
            <span className="text-[10px] font-bold">Home</span>
          </Link>
          <Link to="/invoices" className={cn("flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors", location.pathname.startsWith('/invoices') ? "text-emerald-600" : "text-slate-500 hover:text-slate-900")}>
            <FileText className={cn("w-5 h-5", location.pathname.startsWith('/invoices') && "fill-emerald-100")} />
            <span className="text-[10px] font-bold">Invoices</span>
          </Link>
          
          <div className="relative -top-5 flex justify-center w-full">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center justify-center w-14 h-14 bg-emerald-500 hover:bg-emerald-600 transition-colors text-white rounded-full shadow-lg shadow-emerald-500/40 ring-4 ring-slate-50 active:scale-95">
                  <Plus className="w-6 h-6 stroke-[3px]" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" sideOffset={15} className="w-56 rounded-2xl shadow-xl p-2 border-slate-100 mb-2">
                <DropdownMenuLabel className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 py-1.5">Quick Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/invoices/new')} className="py-3 cursor-pointer rounded-xl hover:bg-emerald-50 focus:bg-emerald-50">
                  <FileText className="w-4 h-4 mr-3 text-emerald-600" />
                  <span className="font-semibold text-slate-700">Create Invoice</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/purchases/new')} className="py-3 cursor-pointer rounded-xl hover:bg-blue-50 focus:bg-blue-50">
                  <ShoppingCart className="w-4 h-4 mr-3 text-blue-600" />
                  <span className="font-semibold text-slate-700">Create Purchase</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/eway-bills/new')} className="py-3 cursor-pointer rounded-xl hover:bg-indigo-50 focus:bg-indigo-50">
                  <Truck className="w-4 h-4 mr-3 text-indigo-600" />
                  <span className="font-semibold text-slate-700">Create E-Way Bill</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Link to="/products" className={cn("flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors", location.pathname.startsWith('/products') ? "text-emerald-600" : "text-slate-500 hover:text-slate-900")}>
            <Package className={cn("w-5 h-5", location.pathname.startsWith('/products') && "fill-emerald-100")} />
            <span className="text-[10px] font-bold">Items</span>
          </Link>
          <button onClick={() => setSidebarOpen(true)} className={cn("flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors", sidebarOpen ? "text-emerald-600" : "text-slate-500 hover:text-slate-900")}>
            <Menu className="w-5 h-5" />
            <span className="text-[10px] font-bold">Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
