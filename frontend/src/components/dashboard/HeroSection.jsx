import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { formatINR } from './dashboardData';

export const HeroSection = ({ data }) => {
  const { user } = useAuth();

  const greeting = (() => {
    const hour = new Date(Date.now() + 330 * 60 * 1000).getUTCHours(); // India time
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  })();

  const stats = [
    { label: "Today's Sales", value: formatINR(data?.todaySales) },
    { label: 'Sales This Month', value: formatINR(data?.thisMonth?.sales ?? data?.monthlySales) },
    { label: 'Pending Collections', value: formatINR(data?.receivables?.pendingAmount ?? data?.pendingPayments) },
    { label: 'Overdue', value: formatINR(data?.receivables?.overdueAmount), isAlert: data?.receivables?.overdueAmount > 0 },
  ];

  const hasActivity = (data?.monthly || []).some((m) => m.sales > 0) || data?.recentInvoices?.length > 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative w-full rounded-[2rem] overflow-hidden bg-slate-900 text-white shadow-2xl p-8 lg:p-10"
    >
      {/* Animated Background Gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4 animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />

      <div className="relative z-10 flex flex-col lg:flex-row justify-between gap-8 lg:items-end">
        
        {/* Left Content */}
        <div className="space-y-2">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200 mb-2 border border-white/10"
          >
            Business Summary
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight"
          >
            {greeting}, <br className="hidden md:block lg:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-purple-200">
              {user?.name?.split(' ')[0] || 'there'} 👋
            </span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-slate-300 font-medium text-sm md:text-base max-w-lg mt-2"
          >
            {hasActivity
              ? "Here's where your business stands today."
              : 'Create your first invoice and your sales, collections and profit will show up here.'}
          </motion.p>
        </div>

        {/* Right Stats (Glassmorphism) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-2 gap-3 lg:gap-4 shrink-0"
        >
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 min-w-[140px]">
              <p className="text-[10px] font-semibold text-indigo-200 uppercase tracking-wider mb-1">{stat.label}</p>
              <div className="flex items-end gap-2">
                <p className={`text-lg md:text-xl font-bold ${stat.isAlert ? 'text-rose-300' : 'text-white'}`}>{stat.value}</p>
              </div>
            </div>
          ))}
        </motion.div>

      </div>
    </motion.div>
  );
};

export default HeroSection;
