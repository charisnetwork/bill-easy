import React, { useState, useEffect } from 'react';
import { reportAPI } from '../services/api';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

import FreeDashboard from './dashboards/FreeDashboard';
import PremiumDashboard from './dashboards/PremiumDashboard';
import EnterpriseDashboard from './dashboards/EnterpriseDashboard';
import { AlertCircle, Send } from 'lucide-react';
import { Button } from '../components/ui/button';
import { authAPI } from '../services/api';

export const DashboardPage = () => {
  const { subscription, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [resending, setResending] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    todaySales: 0,
    monthlySales: 0,
    pendingPayments: 0,
    monthlyExpenses: 0,
    grossProfit: 0,
    netProfit: 0,
    salesChartData: []
  });

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await reportAPI.getDashboard();
        setDashboardData(response.data);
      } catch (error) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const handleResendVerification = async () => {
    setResending(true);
    try {
      await authAPI.resendVerification({ email: user.email });
      toast.success('Verification email sent! Please check your inbox.');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send verification email. Please try again later.');
    } finally {
      setResending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-black italic tracking-widest uppercase text-xs animate-pulse">Synchronizing Cloud Data...</p>
      </div>
    );
  }

  const plan = subscription?.plan || subscription?.Plan;
  const planName = plan?.plan_name || 'Zero Account';

  let DashboardComponent;
  if (planName === 'Enterprise') DashboardComponent = <EnterpriseDashboard data={dashboardData} />;
  else if (planName === 'Premium') DashboardComponent = <PremiumDashboard data={dashboardData} />;
  else DashboardComponent = <FreeDashboard data={dashboardData} />;

  return (
    <div className="space-y-4">
      {user && user.email_verified === false && (
        <div className="bg-rose-500 text-white px-4 py-3 rounded-lg shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-medium">Please verify your email address</p>
              <p className="text-sm text-rose-100">Check your inbox for a verification link to secure your account.</p>
            </div>
          </div>
          <Button 
            variant="secondary" 
            size="sm" 
            className="bg-white text-rose-600 hover:bg-rose-50 shrink-0 border-0"
            onClick={handleResendVerification}
            disabled={resending}
          >
            {resending ? 'Sending...' : (
              <>
                <Send className="w-4 h-4 mr-2 inline" />
                Resend Email
              </>
            )}
          </Button>
        </div>
      )}
      {DashboardComponent}
    </div>
  );
};

export default DashboardPage;
