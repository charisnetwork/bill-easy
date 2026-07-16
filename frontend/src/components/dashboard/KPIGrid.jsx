import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, IndianRupee, FileText, Package, Users } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';

// Dummy sparkline data for aesthetics
const generateSparkline = (isPositive) => {
  return Array.from({ length: 7 }, (_, i) => ({
    val: isPositive ? 10 + (i * 2) + Math.random() * 5 : 25 - (i * 2) + Math.random() * 5,
  }));
};

const KPICard = ({ title, value, prefix = '₹', isCurrency = true, isPositive, percentage, icon: Icon, colorClass, index }) => {
  const sparklineData = React.useMemo(() => generateSparkline(isPositive), [isPositive]);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * index, duration: 0.4 }}
      className="bg-white rounded-[1.25rem] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow duration-300 group relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-500 pointer-events-none">
        <Icon className={`w-24 h-24 ${colorClass}`} />
      </div>

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="space-y-1">
          <p className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight flex items-baseline gap-1">
            {isCurrency && <span className="text-sm font-semibold text-slate-500">{prefix}</span>}
            {value}
          </h3>
        </div>
        <div className={`p-2.5 rounded-xl ${colorClass.replace('text-', 'bg-').replace('-500', '-50')} ${colorClass}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-end justify-between relative z-10 mt-6">
        <div className="flex items-center gap-1.5">
          <div className={`flex items-center gap-1 text-xs font-bold px-1.5 py-0.5 rounded-md ${isPositive ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'}`}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {percentage}%
          </div>
          <span className="text-[10px] font-medium text-slate-400">vs last month</span>
        </div>
        
        {/* Sparkline */}
        <div className="w-16 h-8 opacity-70 group-hover:opacity-100 transition-opacity">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparklineData}>
              <defs>
                <linearGradient id={`color-${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isPositive ? '#10B981' : '#EF4444'} stopOpacity={0.2}/>
                  <stop offset="95%" stopColor={isPositive ? '#10B981' : '#EF4444'} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey="val" 
                stroke={isPositive ? '#10B981' : '#EF4444'} 
                fill={`url(#color-${title})`} 
                strokeWidth={2} 
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
};

export const KPIGrid = ({ data }) => {
  const format = (val) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(val || 0);

  const kpis = [
    { title: "Monthly Revenue", value: format(data?.monthlySales), isPositive: true, percentage: "18.2", icon: IndianRupee, colorClass: "text-indigo-500" },
    { title: "Net Profitability", value: format(data?.netProfit), isPositive: true, percentage: "12.4", icon: TrendingUp, colorClass: "text-purple-500" },
    { title: "Receivables", value: format(data?.pendingPayments), isPositive: false, percentage: "4.1", icon: FileText, colorClass: "text-cyan-500" },
    { title: "Total Customers", value: "1,248", isCurrency: false, isPositive: true, percentage: "8.1", icon: Users, colorClass: "text-emerald-500" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6 w-full">
      {kpis.map((kpi, idx) => (
        <KPICard key={kpi.title} {...kpi} index={idx} />
      ))}
    </div>
  );
};

export default KPIGrid;
