import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

export const HeroSection = ({ data }) => {
  const { user } = useAuth();

  // Helper for formatting
  const format = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

  const stats = [
    { label: "Today's Revenue", value: format(data?.todaySales) },
    { label: "Today's Profit", value: format((data?.todaySales || 0) * 0.2) }, // Derived for UI sake if not in API
    { label: "Monthly Growth", value: "+12.5%", isPositive: true },
    { label: "Pending Collections", value: format(data?.pendingPayments) },
  ];

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
            Good Morning, <br className="hidden md:block lg:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-purple-200">
              {user?.name?.split(' ')[0] || 'Prashanth'} 👋
            </span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-slate-300 font-medium text-sm md:text-base max-w-lg mt-2"
          >
            Here's a quick overview of your business performance today. You're doing great!
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
                <p className="text-lg md:text-xl font-bold text-white">{stat.value}</p>
                {stat.isPositive && <span className="text-emerald-400 text-xs font-bold mb-1">↑</span>}
              </div>
            </div>
          ))}
        </motion.div>

      </div>
    </motion.div>
  );
};

export default HeroSection;
