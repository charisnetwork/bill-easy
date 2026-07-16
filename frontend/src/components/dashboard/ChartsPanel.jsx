import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const ChartsPanel = ({ data }) => {
  const [timeRange, setTimeRange] = useState('30D');
  
  // Dummy data fallback for visual perfection if API data is empty
  const dummyData = [
    { name: '01', sales: 4000, expenses: 2400 },
    { name: '05', sales: 3000, expenses: 1398 },
    { name: '10', sales: 2000, expenses: 9800 },
    { name: '15', sales: 2780, expenses: 3908 },
    { name: '20', sales: 1890, expenses: 4800 },
    { name: '25', sales: 2390, expenses: 3800 },
    { name: '30', sales: 3490, expenses: 4300 },
  ];

  const chartData = data?.length > 0 ? data : dummyData;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700">
          <p className="text-xs font-semibold text-slate-300 mb-2">{label} (Date)</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4 mb-1">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
                <span className="text-xs capitalize">{entry.name}</span>
              </div>
              <span className="text-sm font-bold">₹{new Intl.NumberFormat('en-IN').format(entry.value)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col h-full"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Revenue Analytics</h3>
          <p className="text-xs font-medium text-slate-500 mt-1">Sales vs Expenses overview</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          {['7D', '30D', '3M', '1Y'].map(range => (
            <button 
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${timeRange === range ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#94a3b8' }} 
              dy={10} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              tickFormatter={(val) => `₹${val/1000}k`}
              dx={-10}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="sales" 
              stroke="#6366F1" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorSales)" 
              activeDot={{ r: 6, strokeWidth: 0, fill: '#6366F1' }}
            />
            <Area 
              type="monotone" 
              dataKey="expenses" 
              stroke="#EF4444" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorExpenses)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default ChartsPanel;
