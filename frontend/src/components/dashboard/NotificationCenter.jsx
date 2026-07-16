import React, { useState } from 'react';
import { Bell, Check, CheckCircle2, Clock, FileText, AlertTriangle, ArrowRight } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_NOTIFICATIONS = [
  { id: 1, type: 'critical', title: 'GST Filing Due', desc: 'GSTR-1 filing is due tomorrow for Apr 2026.', time: '2 hours ago', read: false },
  { id: 2, type: 'invoice', title: 'Invoice #1042 Paid', desc: 'Apex Solutions paid ₹45,200.', time: '4 hours ago', read: false },
  { id: 3, type: 'alert', title: 'Low Stock Alert', desc: 'Ultra Cement stock fell below minimum.', time: '1 day ago', read: false },
  { id: 4, type: 'system', title: 'Report Generated', desc: 'Monthly sales report is ready.', time: '2 days ago', read: true },
];

export const NotificationCenter = () => {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = (e) => {
    e.stopPropagation();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getIcon = (type) => {
    switch(type) {
      case 'critical': return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      case 'invoice': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'alert': return <Clock className="w-4 h-4 text-amber-500" />;
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
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No new notifications</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notif) => (
                <div 
                  key={notif.id}
                  className={cn(
                    "flex gap-3 p-4 border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group",
                    !notif.read ? "bg-slate-50/50 dark:bg-slate-800/20" : "opacity-75"
                  )}
                  onClick={() => {
                    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
                  }}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                    !notif.read ? "bg-white dark:bg-slate-800 ring-1 ring-slate-100 dark:ring-slate-700" : "bg-slate-100 dark:bg-slate-800"
                  )}>
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className={cn(
                        "text-sm truncate",
                        !notif.read ? "font-bold text-slate-900 dark:text-white" : "font-medium text-slate-700 dark:text-slate-300"
                      )}>
                        {notif.title}
                      </p>
                      <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap mt-0.5">
                        {notif.time}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {notif.desc}
                    </p>
                    {!notif.read && (
                      <button className="mt-2 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        View details <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-2 border-t border-slate-100 dark:border-slate-800">
          <Button variant="ghost" className="w-full text-xs font-semibold text-slate-600 dark:text-slate-400 h-8">
            View All Activity
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
