import React, { useState, useEffect } from 'react';
import { reportAPI } from '../services/api';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

import FreeDashboard from './dashboards/FreeDashboard';
import PremiumDashboard from './dashboards/PremiumDashboard';
import EnterpriseDashboard from './dashboards/EnterpriseDashboard';

export const DashboardPage = () => {
  const { subscription } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    todaySales: 0,
    monthlySales: 0,
    pendingPayments: 0,
    monthlyExpenses: 0,
    grossProfit: 0,
    netProfit: 0,
    salesChartData: [],
    invoicesCount: 0,
    productsCount: 0
  });

  useEffect(() => {
    let isMounted = true;
    const fetchDashboard = async () => {
      try {
        const response = await reportAPI.getDashboard();
        if (isMounted) {
          setDashboardData(response.data || dashboardData);
        }
      } catch (error) {
        console.error('Dashboard load error:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDashboard();
    return () => { isMounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-black italic tracking-widest uppercase text-xs animate-pulse">Synchronizing Cloud Data...</p>
      </div>
    );
  }

  // Robust plan name detection
  const plan = subscription?.plan || subscription?.Plan;
  const planName = plan?.plan_name || 'Free Account';

  try {
    if (planName === 'Enterprise') return <EnterpriseDashboard data={dashboardData} />;
    if (planName === 'Premium') return <PremiumDashboard data={dashboardData} />;
    return <FreeDashboard data={dashboardData} />;
  } catch (err) {
    console.error('Dashboard Render Error:', err);
    return (
      <div className="p-8 text-center bg-white rounded-3xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Something went wrong while rendering the dashboard.</h2>
        <p className="text-slate-500">Please try refreshing the page or contact support.</p>
      </div>
    );
  }
};

export default DashboardPage;
