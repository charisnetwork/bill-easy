import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Target, MoreVertical, Plus } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../../utils/formatters';

const AnimatedNumber = ({ value }) => {
  // A true animated number would use framer-motion's useSpring and useTransform
  // For simplicity here, we assume formatCurrency handles the immediate display
  return <span>{formatCurrency(value)}</span>;
};

const KPICard = ({ title, amount, trend, target, dataKey, color, bg, sparklineData }) => {
  const isPositive = trend >= 0;
  
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-slate-100 dark:border-slate-800 relative overflow-hidden group"
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{title}</h4>
        <button className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors opacity-0 group-hover:opacity-100">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-end justify-between z-10 relative">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-2">
            <AnimatedNumber value={amount} />
          </h2>
          <div className="flex items-center gap-2">
            <span className={`flex items-center text-[11px] font-bold ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
              {isPositive ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
              {Math.abs(trend)}%
            </span>
            <span className="text-[10px] font-medium text-slate-400">vs last month</span>
          </div>
        </div>
      </div>

      {/* Target Progress Bar */}
      {target && (
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 relative z-10">
          <div className="flex justify-between text-[10px] font-bold mb-1.5">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Target className="w-3 h-3" /> Target
            </span>
            <span className="text-slate-900 dark:text-white">{target}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${target}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full ${bg} rounded-full`}
            />
          </div>
        </div>
      )}

      {/* Sparkline Background */}
      <div className="absolute bottom-0 left-0 right-0 h-16 opacity-30 group-hover:opacity-60 transition-opacity pointer-events-none">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sparklineData}>
            <defs>
              <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={color} 
              strokeWidth={2}
              fill={`url(#gradient-${dataKey})`} 
              isAnimationActive={true}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export const AdvancedKPIGrid = ({ data }) => {
  // Generate fake sparkline data if none exists
  const generateSparkline = (base) => Array.from({ length: 14 }).map((_, i) => ({ value: base + Math.random() * (base * 0.2) }));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KPICard 
        title="Total Revenue" 
        amount={data?.monthlySales || 0} 
        trend={14.2} 
        target={82}
        dataKey="revenue"
        color="#6366F1" // Indigo
        bg="bg-indigo-500"
        sparklineData={generateSparkline(1000)}
      />
      <KPICard 
        title="Gross Profit" 
        amount={data?.grossProfit || 0} 
        trend={8.4} 
        target={65}
        dataKey="profit"
        color="#8B5CF6" // Purple
        bg="bg-purple-500"
        sparklineData={generateSparkline(400)}
      />
      <KPICard 
        title="Pending Collections" 
        amount={data?.pendingPayments || 0} 
        trend={-2.1} 
        target={90}
        dataKey="pending"
        color="#06B6D4" // Cyan
        bg="bg-cyan-500"
        sparklineData={generateSparkline(800)}
      />
      <KPICard 
        title="Monthly Expenses" 
        amount={data?.monthlyExpenses || 0} 
        trend={5.4} 
        target={40}
        dataKey="expenses"
        color="#F43F5E" // Rose
        bg="bg-rose-500"
        sparklineData={generateSparkline(300)}
      />
    </div>
  );
};
