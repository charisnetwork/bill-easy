import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, Clock, FileText, AlertTriangle, ArrowRight, PackageX } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { useAuth } from '../../context/AuthContext';
import { reportAPI } from '../../services/api';
import { buildAlerts } from './dashboardData';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// Alerts come from the business's own figures (overdue invoices, low stock, GST returns due this week).
// The header mounts on every page, so the figures are cached for a few minutes.
let cache = { at: 0, companyId: null, alerts: null };
const CACHE_MS = 5 * 60 * 1000;

export const NotificationCenter = () => {
  const navigate = useNavigate();
  const { company } = useAuth();
  const companyId = company?.id;
  const [notifications, setNotifications] = useState(() =>
    cache.alerts && cache.companyId === companyId ? cache.alerts : []);
  const [seen, setSeen] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('seen_alerts') || '[]'); } catch { return []; }
  });

  useEffect(() => {
    if (cache.alerts && cache.companyId === companyId && Date.now() - cache.at < CACHE_MS) return;
    let cancelled = false;
    reportAPI.getDashboard()
      .then(({ data }) => {
        const alerts = buildAlerts(data);
        cache = { at: Date.now(), companyId, alerts };
        if (!cancelled) setNotifications(alerts);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [companyId]);

  const remember = (ids) => {
    const next = Array.from(new Set([...seen, ...ids]));
    setSeen(next);
    try { sessionStorage.setItem('seen_alerts', JSON.stringify(next)); } catch { /* ignore */ }
  };
  const isRead = (n) => seen.includes(`${n.id}:${n.desc}`);

  const unreadCount = notifications.filter(n => !isRead(n)).length;

  const markAllAsRead = (e) => {
    e.stopPropagation();
    remember(notifications.map(n => `${n.id}:${n.desc}`));
  };

  const getIcon = (type) => {
    switch(type) {
      case 'gst': return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      case 'overdue': return <Clock className="w-4 h-4 text-amber-500" />;
      case 'stock': return <PackageX className="w-4 h-4 text-rose-500" />;
      default: return <FileText className="w-4 h-4 text-indigo-500" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors relative focus:outline-none">
          <Bell className="w-5 h-5" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900"
              />
            )}
          </AnimatePresence>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 sm:w-96 p-0 rounded-2xl shadow-xl dark:bg-slate-900 dark:border-slate-800">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button 
              onClick={markAllAsRead}
              className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors flex items-center gap-1"
            >
              <Check className="w-3 h-3" /> Mark all read
            </button>
          )}
        </div>
        
        <div className="max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
          {notifications.length === 0 ? (
            <div className="py-8 text-center px-4">
              <Bell className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">You're all caught up</p>
              <p className="text-xs text-slate-400 mt-1">Overdue invoices, low stock and GST due dates show up here.</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notif) => (
                <div 
                  key={notif.id}
                  className={cn(
                    "flex gap-3 p-4 border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group",
                    !isRead(notif) ? "bg-slate-50/50 dark:bg-slate-800/20" : "opacity-75"
                  )}
                  onClick={() => {
                    remember([`${notif.id}:${notif.desc}`]);
                    navigate(notif.route);
                  }}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                    !isRead(notif) ? "bg-white dark:bg-slate-800 ring-1 ring-slate-100 dark:ring-slate-700" : "bg-slate-100 dark:bg-slate-800"
                  )}>
                    {getIcon(notif.kind)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className={cn(
                        "text-sm truncate",
                        !isRead(notif) ? "font-bold text-slate-900 dark:text-white" : "font-medium text-slate-700 dark:text-slate-300"
                      )}>
                        {notif.title}
                      </p>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {notif.desc}
                    </p>
                    <span className="mt-2 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      Open <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
