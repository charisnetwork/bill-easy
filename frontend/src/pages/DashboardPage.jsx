import React, { useState, useEffect } from 'react';
import { reportAPI, authAPI } from '../services/api';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Send, Loader2, LayoutGrid, Check } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useDashboardLayout } from '../hooks/useDashboardLayout';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { SortableWidget } from '../components/dashboard/panels/SortableWidget';

// Widgets
import { HeroSection } from '../components/dashboard/HeroSection';
import { AdvancedKPIGrid } from '../components/dashboard/panels/AdvancedKPIGrid';
import { ActionCenter } from '../components/dashboard/panels/ActionCenter';
import { TodaysTasks } from '../components/dashboard/panels/TodaysTasks';
import { BusinessHealthScore } from '../components/dashboard/panels/BusinessHealthScore';
import { RecentActivityFeed } from '../components/dashboard/panels/RecentActivityFeed';
import { DenseInvoiceTable } from '../components/dashboard/panels/DenseInvoiceTable';
import { AIInsights } from '../components/dashboard/AIInsights';
import { CashFlowWidget } from '../components/dashboard/panels/CashFlowWidget';
import { ReceivablesWidget } from '../components/dashboard/panels/ReceivablesWidget';
import { InventoryAlertPanel } from '../components/dashboard/panels/InventoryAlertPanel';
import { TopPerformers } from '../components/dashboard/panels/TopPerformers';
import { BusinessCalendar } from '../components/dashboard/panels/BusinessCalendar';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [resending, setResending] = useState(false);
  const [dashboardData, setDashboardData] = useState({});

  const { layout, visibleWidgets, isEditMode, setIsEditMode, handleDragEnd, toggleWidgetVisibility, resetLayout } = useDashboardLayout(user?.id);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

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
      toast.error(error.response?.data?.error || 'Failed to send verification email.');
    } finally {
      setResending(false);
    }
  };

  const renderWidget = (id) => {
    switch (id) {
      case 'kpi-grid': return <AdvancedKPIGrid data={dashboardData} />;
      case 'business-health': return <BusinessHealthScore data={dashboardData} />;
      case 'todays-tasks': return <TodaysTasks data={dashboardData} />;
      case 'smart-insights': return <AIInsights data={dashboardData} />;
      case 'action-center': return <ActionCenter />;
      case 'recent-activity': return <RecentActivityFeed />;
      case 'recent-invoices': return <DenseInvoiceTable />;
      case 'cash-flow': return <CashFlowWidget data={dashboardData.salesChartData} />;
      case 'receivables': return <ReceivablesWidget />;
      case 'inventory-alerts': return <InventoryAlertPanel />;
      case 'top-performers': return <TopPerformers />;
      case 'business-calendar': return <BusinessCalendar />;
      default: return null; 
    }
  };

  const getColSpan = (id) => {
    switch (id) {
      case 'kpi-grid': return 'col-span-1 md:col-span-2 lg:col-span-4';
      case 'recent-invoices': return 'col-span-1 md:col-span-2 lg:col-span-3';
      case 'cash-flow': return 'col-span-1 md:col-span-2 lg:col-span-2';
      case 'action-center': return 'col-span-1 md:col-span-2 lg:col-span-3';
      default: return 'col-span-1 md:col-span-1 lg:col-span-1';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] space-y-4">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="text-slate-500 font-bold tracking-widest uppercase text-[10px] animate-pulse">
          Initializing OS...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full pb-12 relative">
      
      {/* Edit Mode Toolbar */}
      <AnimatePresence>
        {isEditMode && (
          <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="sticky top-20 z-40 bg-slate-900/90 dark:bg-slate-100/90 backdrop-blur-xl rounded-2xl p-4 shadow-2xl flex items-center justify-between border border-slate-700/50"
          >
            <div className="flex items-center gap-3 text-white dark:text-slate-900">
              <LayoutGrid className="w-5 h-5" />
              <div>
                <h3 className="text-sm font-bold">Personalize Dashboard</h3>
                <p className="text-[10px] opacity-80">Drag to reorder, click X to hide.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={resetLayout} variant="ghost" size="sm" className="text-white hover:bg-white/20 dark:text-slate-900 dark:hover:bg-black/10 text-xs">
                Reset Default
              </Button>
              <Button onClick={() => setIsEditMode(false)} size="sm" className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl shadow-sm text-xs px-6">
                <Check className="w-4 h-4 mr-1.5" /> Save Layout
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section stays static */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <HeroSection data={dashboardData} />
        </div>
        {!isEditMode && (
          <Button 
            onClick={() => setIsEditMode(true)}
            variant="outline" 
            className="hidden lg:flex rounded-xl bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
          >
            <LayoutGrid className="w-4 h-4 mr-2" />
            Customize
          </Button>
        )}
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={visibleWidgets.map(w => w.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 auto-rows-min">
            {visibleWidgets.map((widget) => {
              const content = renderWidget(widget.id);
              if (!content) return null; // Skip if not implemented yet

              return (
                <div key={widget.id} className={getColSpan(widget.id)}>
                  <SortableWidget id={widget.id} isEditMode={isEditMode} onHide={toggleWidgetVisibility}>
                    {content}
                  </SortableWidget>
                </div>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default DashboardPage;
