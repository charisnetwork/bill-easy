import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Maximize2 } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '../../../utils/formatters';

const MOCK_DATA = [
  { name: 'Jan', in: 4000, out: 2400 },
  { name: 'Feb', in: 3000, out: 1398 },
  { name: 'Mar', in: 2000, out: 9800 },
  { name: 'Apr', in: 2780, out: 3908 },
  { name: 'May', in: 1890, out: 4800 },
  { name: 'Jun', in: 2390, out: 3800 },
  { name: 'Jul', in: 3490, out: 4300 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/90 dark:bg-slate-100/90 backdrop-blur-md p-3 rounded-xl border border-slate-700/50 dark:border-slate-300/50 shadow-xl">
        <p className="text-xs font-bold text-white dark:text-slate-900 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-[11px] font-medium mt-1">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-slate-300 dark:text-slate-600">{entry.name}:</span>
            <span className="text-white dark:text-slate-900 font-bold">{formatCurrency(entry.value)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const CashFlowWidget = ({ data = MOCK_DATA }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-slate-100 dark:border-slate-800 h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Cash Flow</h3>
        </div>
        <button className="text-slate-400 hover:text-indigo-600 transition-colors">
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 min-h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#F43F5E" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-slate-800 opacity-50" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: 'currentColor', className: 'text-slate-400' }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: 'currentColor', className: 'text-slate-400' }}
              tickFormatter={(value) => `₹${value / 1000}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="in" 
              name="Money In"
              stroke="#10B981" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorIn)" 
              animationDuration={1500}
            />
            <Area 
              type="monotone" 
              dataKey="out" 
              name="Money Out"
              stroke="#F43F5E" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorOut)" 
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};
