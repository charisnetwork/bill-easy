import React from 'react';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';

export const BusinessHealthScore = ({ data }) => {
  // Score and its parts are worked out by the server from this and last month's figures.
  const health = data?.health;
  const score = health?.score ?? 0;

  const getHealthMeta = (s) => {
    if (s >= 85) return { label: 'Excellent', color: 'text-emerald-500', bg: 'bg-emerald-500', glow: 'shadow-emerald-500/20' };
    if (s >= 65) return { label: 'Healthy', color: 'text-indigo-500', bg: 'bg-indigo-500', glow: 'shadow-indigo-500/20' };
    if (s >= 40) return { label: 'Needs Attention', color: 'text-amber-500', bg: 'bg-amber-500', glow: 'shadow-amber-500/20' };
    return { label: 'Critical', color: 'text-rose-500', bg: 'bg-rose-500', glow: 'shadow-rose-500/20' };
  };

  const meta = getHealthMeta(score);

  // SVG Circle calculations
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-slate-100 dark:border-slate-800 h-full flex flex-col relative overflow-hidden group"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800`}>
            <Activity className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Business Health</h3>
        </div>
      </div>

      {!health ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No score yet</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[220px]">
            Your score appears once you have sales this month or last. It is built from your profit margin, collections and overdue invoices.
          </p>
        </div>
      ) : (
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="relative w-32 h-32 flex items-center justify-center">
          {/* Background Track */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r={radius}
              stroke="currentColor"
              strokeWidth="10"
              fill="transparent"
              className="text-slate-100 dark:text-slate-800"
            />
            {/* Animated Progress */}
            <motion.circle
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
              cx="64"
              cy="64"
              r={radius}
              stroke="currentColor"
              strokeWidth="10"
              fill="transparent"
              strokeLinecap="round"
              className={meta.color}
              strokeDasharray={circumference}
            />
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span 
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="text-3xl font-black text-slate-900 dark:text-white tracking-tight"
            >
              {score}
            </motion.span>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-4 text-center"
        >
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${meta.bg} text-white shadow-sm ${meta.glow}`}>
            {meta.label}
          </span>
          <ul className="mt-3 space-y-1 text-left">
            {health.parts.map((part) => (
              <li key={part.key} className="flex justify-between gap-4 text-[11px] text-slate-500 dark:text-slate-400">
                <span>{part.label} <span className="font-semibold text-slate-700 dark:text-slate-300">{part.value}%</span></span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{part.points}/{part.max}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
      )}
    </motion.div>
  );
};
