import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardLayout } from './components/DashboardLayout';
import { Toaster } from './components/ui/sonner';
import { usePageTracking } from './hooks/useAnalytics';
import { App as CapacitorApp } from '@capacitor/app';
import { IS_NATIVE } from './config/api';

import './App.css';

// ─────────────────────────────────────────────────────────────
// Lazy-loaded pages — each becomes its own JS chunk at build time.
// This reduces the initial bundle from ~2MB to ~150KB,
// making the landing page load in under 1 second.
// ─────────────────────────────────────────────────────────────

// Public pages (loaded on first visit)
const MobileOnboarding    = lazy(() => import('./pages/MobileOnboarding'));
const LandingPage          = lazy(() => import('./pages/LandingPage'));
const LoginPage            = lazy(() => import('./pages/LoginPage'));
const RegisterPage         = lazy(() => import('./pages/RegisterPage'));
const ForgotPasswordPage   = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage    = lazy(() => import('./pages/ResetPasswordPage'));
const VerifyEmailPage      = lazy(() => import('./pages/VerifyEmailPage'));
const ResendVerificationPage = lazy(() => import('./pages/ResendVerificationPage'));
const BillPrivacy          = lazy(() => import('./pages/BillPrivacy'));
const BillTerms            = lazy(() => import('./pages/BillTerms'));
const ContactPage          = lazy(() => import('./pages/ContactPage'));

// App pages (loaded only when user is logged in)
const DashboardPage        = lazy(() => import('./pages/DashboardPage'));
const CustomersPage        = lazy(() => import('./pages/CustomersPage'));
const SuppliersPage        = lazy(() => import('./pages/SuppliersPage'));
const ProductsPage         = lazy(() => import('./pages/ProductsPage'));
const InvoicesPage         = lazy(() => import('./pages/InvoicesPage'));
const CreateInvoicePage    = lazy(() => import('./pages/CreateInvoicePage'));
const InvoicePreview       = lazy(() => import('./pages/InvoicePreview'));
const PurchasesPage        = lazy(() => import('./pages/PurchasesPage'));
const CreatePurchasePage   = lazy(() => import('./pages/CreatePurchasePage'));
const PurchaseOrdersPage   = lazy(() => import('./pages/PurchaseOrdersPage'));
const CreatePurchaseOrderPage = lazy(() => import('./pages/CreatePurchaseOrderPage'));
const PurchaseOrderPreview = lazy(() => import('./pages/PurchaseOrderPreview'));
const QuotationsPage       = lazy(() => import('./pages/QuotationsPage'));
const CreateQuotationPage  = lazy(() => import('./pages/CreateQuotationPage'));
const QuotationPreview     = lazy(() => import('./pages/QuotationPreview'));
const EWayBillsPage        = lazy(() => import('./pages/EWayBillsPage'));
const CreateEWayBillPage   = lazy(() => import('./pages/CreateEWayBillPage'));
const ExpensesPage         = lazy(() => import('./pages/ExpensesPage'));
const PaymentsInPage       = lazy(() => import('./pages/PaymentsInPage'));
const ReportsPage          = lazy(() => import('./pages/ReportsPage'));
const SalesReturnPage      = lazy(() => import('./pages/SalesReturnPage'));
const StockTransferPage    = lazy(() => import('./pages/StockTransferPage'));
const SubscriptionPage     = lazy(() => import('./pages/SubscriptionPage'));
const SettingsPage         = lazy(() => import('./pages/SettingsPage'));
const AddBusinessPage      = lazy(() => import('./pages/AddBusinessPage'));
const WattVisionPage       = lazy(() => import('./pages/dashboards/WattVisionPage'));
const CharisAssistant      = lazy(() => import('./components/CharisAssistant'));

// ─────────────────────────────────────────────────────────────
// Loading fallback shown while a chunk is being fetched
// ─────────────────────────────────────────────────────────────
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-slate-500 font-medium">Loading…</p>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
// Inner component that has access to router context (for GA tracking)
// ─────────────────────────────────────────────────────────────
function AppRoutes() {
  usePageTracking(); // Tracks every page navigation to GA4
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Handle Android Back Button
    const backHandler = CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      if (location.pathname === '/' || location.pathname === '/dashboard' || location.pathname === '/onboarding') {
        // If we are at root, dashboard or onboarding, exit the app
        CapacitorApp.exitApp();
      } else {
        // Otherwise, go back in history
        navigate(-1);
      }
    });

    return () => {
      backHandler.then(h => h.remove());
    };
  }, [location, navigate]);

  useEffect(() => {
    // Mobile Redirect Logic
    if (IS_NATIVE && location.pathname === '/') {
      const hasSeenOnboarding = localStorage.getItem('onboarding_complete');
      if (!hasSeenOnboarding) {
        navigate('/onboarding', { replace: true });
      }
    }
  }, [location.pathname, navigate]);

  return (
    <Routes>
      {/* ── Mobile Specific ── */}
      <Route path="/onboarding"           element={<MobileOnboarding />} />

      {/* ── Public Routes ── */}
      <Route path="/"                     element={<LandingPage />} />
      <Route path="/login"                element={<LoginPage />} />
      <Route path="/register"             element={<RegisterPage />} />
      <Route path="/forgot-password"      element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      <Route path="/verify-email/:token"  element={<VerifyEmailPage />} />
      <Route path="/resend-verification"  element={<ResendVerificationPage />} />
      <Route path="/privacy"              element={<BillPrivacy />} />
      <Route path="/terms"                element={<BillTerms />} />
      <Route path="/contact"              element={<ContactPage />} />

      {/* ── Protected Routes ── */}
      <Route path="/dashboard"      element={<ProtectedRoute><DashboardLayout><DashboardPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/customers"      element={<ProtectedRoute><DashboardLayout><CustomersPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/suppliers"      element={<ProtectedRoute><DashboardLayout><SuppliersPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/products"       element={<ProtectedRoute><DashboardLayout><ProductsPage /></DashboardLayout></ProtectedRoute>} />

      <Route path="/invoices"           element={<ProtectedRoute><DashboardLayout><InvoicesPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/invoices/new"       element={<ProtectedRoute><DashboardLayout><CreateInvoicePage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/invoices/:id"       element={<ProtectedRoute><DashboardLayout><InvoicePreview /></DashboardLayout></ProtectedRoute>} />
      <Route path="/invoices/:id/edit"  element={<ProtectedRoute><DashboardLayout><CreateInvoicePage isEdit={true} /></DashboardLayout></ProtectedRoute>} />

      <Route path="/purchases"           element={<ProtectedRoute><DashboardLayout><PurchasesPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/purchases/new"       element={<ProtectedRoute><DashboardLayout><CreatePurchasePage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/purchases/:id/edit"  element={<ProtectedRoute><DashboardLayout><CreatePurchasePage isEdit={true} /></DashboardLayout></ProtectedRoute>} />

      <Route path="/purchase/po-list"            element={<ProtectedRoute><DashboardLayout><PurchaseOrdersPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/purchase/po-list/new"        element={<ProtectedRoute><DashboardLayout><CreatePurchaseOrderPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/purchase/po-list/:id"        element={<ProtectedRoute><DashboardLayout><PurchaseOrderPreview /></DashboardLayout></ProtectedRoute>} />
      <Route path="/purchase/po-list/:id/edit"   element={<ProtectedRoute><DashboardLayout><CreatePurchaseOrderPage isEdit={true} /></DashboardLayout></ProtectedRoute>} />

      <Route path="/quotations"          element={<ProtectedRoute><DashboardLayout><QuotationsPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/quotations/new"      element={<ProtectedRoute><DashboardLayout><CreateQuotationPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/quotations/:id"      element={<ProtectedRoute><DashboardLayout><QuotationPreview /></DashboardLayout></ProtectedRoute>} />
      <Route path="/quotations/:id/edit" element={<ProtectedRoute><DashboardLayout><CreateQuotationPage isEdit={true} /></DashboardLayout></ProtectedRoute>} />

      <Route path="/eway-bills"     element={<ProtectedRoute><DashboardLayout><EWayBillsPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/eway-bills/new" element={<ProtectedRoute><DashboardLayout><CreateEWayBillPage /></DashboardLayout></ProtectedRoute>} />

      <Route path="/expenses"      element={<ProtectedRoute><DashboardLayout><ExpensesPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/payments-in"   element={<ProtectedRoute><DashboardLayout><PaymentsInPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/reports"       element={<ProtectedRoute><DashboardLayout><ReportsPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/sales-return"  element={<ProtectedRoute><DashboardLayout><SalesReturnPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/stock-transfer" element={<ProtectedRoute><DashboardLayout><StockTransferPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/subscription"  element={<ProtectedRoute><DashboardLayout><SubscriptionPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/settings"      element={<ProtectedRoute><DashboardLayout><SettingsPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/settings/business/new" element={<ProtectedRoute><DashboardLayout><AddBusinessPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/wattvision"    element={<ProtectedRoute><DashboardLayout><WattVisionPage /></DashboardLayout></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <AppRoutes />
            <CharisAssistant />
          </Suspense>
        </BrowserRouter>
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
