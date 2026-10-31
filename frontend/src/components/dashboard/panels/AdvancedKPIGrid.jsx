import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts';
import { formatINR } from '../dashboardData';

// Month-on-month change. Hidden when last month has nothing to compare against.
const Trend = ({ change, upIsGood = true }) => {
  if (change === null || change === undefined) {
    return <span className="text-[10px] font-medium text-slate-400">No figures last month to compare</span>;
  }
  const up = change >= 0;
  const good = up === upIsGood;
  return (
    <div className="flex items-center gap-2">
      <span className={`flex items-center text-[11px] font-bold ${good ? 'text-emerald-500' : 'text-rose-500'}`}>
        {up ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
        {Math.abs(change)}%
      </span>
      <span className="text-[10px] font-medium text-slate-400">vs last month</span>
    </div>
  );
};

const KPICard = ({ title, figure, upIsGood, dataKey, color, sparklineData }) => (
  <motion.div
    whileHover={{ y: -4 }}
    className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-slate-100 dark:border-slate-800 relative overflow-hidden group min-h-[132px]"
  >
    <div className="flex justify-between items-start mb-2">
      <h4 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{title}</h4>
      <span className="text-[10px] font-medium text-slate-400">This month</span>
    </div>

    <div className="z-10 relative">
      <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-2">
        {formatINR(figure?.current)}
      </h2>
      <Trend change={figure?.change} upIsGood={upIsGood} />
      {figure?.previous !== 0 && figure?.previous !== undefined && (
        <p className="text-[10px] text-slate-400 mt-1">Last month {formatINR(figure.previous)}</p>
      )}
    </div>

    {/* Last 14 days, only when there were sales to draw */}
    {sparklineData && (
      <div className="absolute bottom-0 left-0 right-0 h-16 opacity-30 group-hover:opacity-60 transition-opacity">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sparklineData}>
            <defs>
              <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Tooltip
              cursor={false}
              content={({ active, payload }) => active && payload?.length ? (
                <div className="bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-md">
                  {payload[0].payload.date}: {formatINR(payload[0].value)}
                </div>
              ) : null}
            />
            <Area type="monotone" dataKey="sales" stroke={color} strokeWidth={2} fill={`url(#gradient-${dataKey})`} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    )}
  </motion.div>
);

export const AdvancedKPIGrid = ({ data }) => {
  const c = data?.comparison || {};
  const daily = data?.dailySales || [];
  const sparkline = daily.some((d) => d.sales > 0) ? daily : null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KPICard title="Sales" figure={c.sales} dataKey="sales" color="#6366F1" sparklineData={sparkline} />
      <KPICard title="Net Profit" figure={c.profit} dataKey="profit" color="#8B5CF6" />
      <KPICard title="Collections" figure={c.collections} dataKey="collections" color="#06B6D4" />
      <KPICard title="Expenses" figure={c.expenses} upIsGood={false} dataKey="expenses" color="#F43F5E" />
    </div>
  );
};
