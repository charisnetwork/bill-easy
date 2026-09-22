import React, { useState, useEffect } from 'react';
import { reportAPI } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { getErrorMessage } from '../config/api';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Receipt,
  FileCheck2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  Loader2,
  PieChart,
  BarChart3,
  IndianRupee,
  RefreshCw
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from 'recharts';
import { toast } from 'sonner';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount || 0);
};

export const CashFlowTaxDashboard = () => {
  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('this_month');

  const getPeriodDates = (selectedPeriod) => {
    const now = new Date();
    let start, end = new Date();

    if (selectedPeriod === 'this_month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (selectedPeriod === 'this_quarter') {
      const qMonth = Math.floor(now.getMonth() / 3) * 3;
      start = new Date(now.getFullYear(), qMonth, 1);
    } else if (selectedPeriod === 'last_quarter') {
      const qMonth = Math.floor(now.getMonth() / 3) * 3 - 3;
      start = new Date(now.getFullYear(), qMonth, 1);
      end = new Date(now.getFullYear(), qMonth + 3, 0);
    } else if (selectedPeriod === 'ytd') {
      start = new Date(now.getFullYear(), 0, 1);
    }
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    };
  };

  const fetchSnapshot = async () => {
    try {
      setLoading(true);
      const params = getPeriodDates(period);
      const response = await reportAPI.getCashFlowTaxSnapshot(params);
      setSnapshot(response.data);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load cash flow & tax snapshot'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSnapshot();
  }, [period]);

  if (loading || !snapshot) {
    return (
      <div className="flex flex-col items-center justify-center h-80 gap-3">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Calculating financial metrics & tax liability...</p>
      </div>
    );
  }

  const { realizedRevenue, receivablesAging, taxSnapshot, cashFlowTrend } = snapshot;

  const agingData = [
    { range: '0-30 Days', amount: receivablesAging.current, color: '#10B981' },
    { range: '31-60 Days', amount: receivablesAging.thirtyToSixty, color: '#F59E0B' },
    { range: '61-90 Days', amount: receivablesAging.sixtyToNinety, color: '#EF4444' },
    { range: '90+ Days Overdue', amount: receivablesAging.overNinety, color: '#881337' }
  ];

  const taxData = [
    { name: 'Output GST (Sales)', value: taxSnapshot.outputGST, fill: '#6366F1' },
    { name: 'Input Tax Credit (Purchases)', value: taxSnapshot.inputITC, fill: '#10B981' },
    { name: 'Net GST Payable', value: taxSnapshot.netGSTPayable, fill: '#F59E0B' }
  ];

  return (
    <div className="space-y-6 animate-fade-in" data-testid="cashflow-tax-dashboard">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-7 h-7 text-emerald-600" />
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-slate-900">
              Cash Flow & Tax Snapshot
            </h1>
          </div>
          <p className="text-slate-600 mt-1">
            Real-time financial metrics, receivables aging, and estimated GST tax breakdown
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-44 bg-white shadow-sm border-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this_month">This Month</SelectItem>
              <SelectItem value="this_quarter">This Quarter</SelectItem>
              <SelectItem value="last_quarter">Last Quarter</SelectItem>
              <SelectItem value="ytd">Year To Date</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" onClick={fetchSnapshot} className="bg-white">
            <RefreshCw className="w-4 h-4 text-slate-600" />
          </Button>
        </div>
      </div>

      {/* Top Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Realized Revenue */}
        <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md border-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-100 flex items-center justify-between">
              Realized Revenue
              <DollarSign className="w-5 h-5 text-emerald-200" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(realizedRevenue)}</div>
            <p className="text-xs text-emerald-100 mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> Cash collected in period
            </p>
          </CardContent>
        </Card>

        {/* Pending Receivables */}
        <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md border-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-100 flex items-center justify-between">
              Pending Receivables
              <Clock className="w-5 h-5 text-amber-200" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(receivablesAging.totalOutstanding)}</div>
            <p className="text-xs text-amber-100 mt-1 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" /> Total outstanding balance
            </p>
          </CardContent>
        </Card>

        {/* GST Tax Due */}
        <Card className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-md border-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-indigo-100 flex items-center justify-between">
              Est. Net GST Liability
              <Receipt className="w-5 h-5 text-indigo-200" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(taxSnapshot.netGSTPayable)}</div>
            <p className="text-xs text-indigo-100 mt-1">
              {taxSnapshot.itcCreditBalance > 0
                ? `ITC Credit Carryforward: ${formatCurrency(taxSnapshot.itcCreditBalance)}`
                : 'Output GST minus Input ITC'}
            </p>
          </CardContent>
        </Card>

        {/* Input Tax Credit */}
        <Card className="bg-gradient-to-br from-blue-600 to-cyan-700 text-white shadow-md border-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-100 flex items-center justify-between">
              Input Tax Credit (ITC)
              <FileCheck2 className="w-5 h-5 text-blue-200" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(taxSnapshot.inputITC)}</div>
            <p className="text-xs text-blue-100 mt-1">Eligible GST on purchases & expenses</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cash Flow Trend (2 cols) */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              6-Month Cash Flow Trend (Inflow vs Outflow)
            </CardTitle>
            <CardDescription>Comparison of monthly payments collected vs expenditures</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cashFlowTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCashIn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorCashOut" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                  <YAxis stroke="#64748B" fontSize={12} tickFormatter={(val) => `₹${val / 1000}k`} />
                  <Tooltip
                    formatter={(val) => [formatCurrency(val), '']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #CBD5E1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="cashIn" name="Cash Inflow (Sales)" stroke="#10B981" fillOpacity={1} fill="url(#colorCashIn)" />
                  <Area type="monotone" dataKey="cashOut" name="Cash Outflow (Purchases & Expenses)" stroke="#EF4444" fillOpacity={1} fill="url(#colorCashOut)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* GST Liability Breakdown (1 col) */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Receipt className="w-5 h-5 text-indigo-600" />
              GST Tax Breakdown
            </CardTitle>
            <CardDescription>Output Tax vs Input Tax Credit</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={taxData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={10} interval={0} />
                  <YAxis stroke="#64748B" fontSize={12} tickFormatter={(val) => `₹${val / 1000}k`} />
                  <Tooltip formatter={(val) => [formatCurrency(val), 'Amount']} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {taxData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Receivables Aging Breakdown Chart */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            Accounts Receivable Aging Analysis
          </CardTitle>
          <CardDescription>Distribution of unpaid customer balances by overdue days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agingData} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                <XAxis type="number" stroke="#64748B" fontSize={12} tickFormatter={(val) => `₹${val}`} />
                <YAxis type="category" dataKey="range" stroke="#64748B" fontSize={12} />
                <Tooltip formatter={(val) => [formatCurrency(val), 'Outstanding Balance']} />
                <Bar dataKey="amount" radius={[0, 6, 6, 0]}>
                  {agingData.map((entry, index) => (
                    <Cell key={`cell-aging-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CashFlowTaxDashboard;
