import React, { useState, useEffect } from 'react';
import { reportAPI } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '../components/ui/table';
import { Crown, Star, Share2, Filter, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
const formatDate = (date) => new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const reportCategories = {
  favourite: [
    { id: 'balance-sheet', title: 'Balance Sheet', tier: 'ENTERPRISE', isFavourite: true },
    { id: 'gstr-1', title: 'GSTR-1 (Sales)', tier: 'ENTERPRISE', isFavourite: true },
    { id: 'profit-loss', title: 'Profit And Loss Report', tier: 'PREMIUM', isFavourite: true },
    { id: 'sales', title: 'Sales Summary', tier: 'FREE', isFavourite: true },
  ],
  gst: [
    { id: 'gstr-2', title: 'GSTR-2 (Purchase)', tier: 'ENTERPRISE' },
    { id: 'gstr-3b', title: 'GSTR-3b', tier: 'ENTERPRISE' },
    { id: 'gst-purchase', title: 'GST Purchase (With HSN)', tier: 'PREMIUM' },
    { id: 'gst-sales', title: 'GST Sales (With HSN)', tier: 'PREMIUM' },
    { id: 'hsn-sales', title: 'HSN Wise Sales Summary', tier: 'PREMIUM' },
    { id: 'tds-tcs', title: 'TDS Payable', tier: 'ENTERPRISE' },
    { id: 'tds-tcs', title: 'TDS Receivable', tier: 'ENTERPRISE' },
    { id: 'tds-tcs', title: 'TCS Payable', tier: 'ENTERPRISE' },
    { id: 'tds-tcs', title: 'TCS Receivable', tier: 'ENTERPRISE' },
    { id: 'gst', title: 'GST Summary', tier: 'PREMIUM' }
  ],
  transaction: [
    { id: 'bill-profit', title: 'Bill Wise Profit', tier: 'PREMIUM' },
    { id: 'cash-bank', title: 'Cash and Bank Report (All Payments)', tier: 'PREMIUM' },
    { id: 'daybook', title: 'Daybook', tier: 'PREMIUM' },
    { id: 'expenses', title: 'Expense Category Report', tier: 'FREE' },
    { id: 'expenses', title: 'Expense Transaction Report', tier: 'FREE' },
    { id: 'purchases', title: 'Purchase Summary', tier: 'FREE' },
    { id: 'customer-outstanding', title: 'Customer Outstanding', tier: 'FREE' },
    { id: 'supplier-outstanding', title: 'Supplier Outstanding', tier: 'FREE' },
    { id: 'stock', title: 'Stock Report', tier: 'FREE' }
  ]
};

export const ReportsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const planName = user?.Company?.Subscription?.Plan?.plan_name || 'Free Account';
  
  const [activeReport, setActiveReport] = useState(null);
  const [activeReportDetails, setActiveReportDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState('');

  const checkAccess = (tier) => {
    if (tier === 'FREE') return true;
    if (tier === 'PREMIUM' && (planName === 'Premium' || planName === 'Enterprise')) return true;
    if (tier === 'ENTERPRISE' && planName === 'Enterprise') return true;
    return false;
  };

  const handleReportClick = (report) => {
    if (!checkAccess(report.tier)) {
      setUpgradeMessage(`The '${report.title}' requires a ${report.tier} plan.`);
      setShowUpgradeModal(true);
      return;
    }
    setActiveReportDetails(report);
    fetchReport(report.id);
  };

  const fetchReport = async (type) => {
    setLoading(true);
    setActiveReport(type);
    try {
      let response;
      switch (type) {
        case 'sales':
        case 'gstr-1':
          response = await reportAPI.getSales(dateRange);
          break;
        case 'purchases':
        case 'gstr-2':
          response = await reportAPI.getPurchases(dateRange);
          break;
        case 'expenses':
          response = await reportAPI.getExpenses(dateRange);
          break;
        case 'profit-loss':
          response = await reportAPI.getProfitLoss(dateRange);
          break;
        case 'gst':
          response = await reportAPI.getGST(dateRange);
          break;
        case 'customer-outstanding':
          response = await reportAPI.getCustomerOutstanding();
          break;
        case 'supplier-outstanding':
          response = await reportAPI.getSupplierOutstanding();
          break;
        case 'stock':
          response = await reportAPI.getStock();
          break;
        case 'daybook':
          // Using a generic get method if not in reportAPI
          response = await reportAPI.client.get('/reports/daybook', { params: dateRange });
          break;
        case 'cash-bank':
          response = await reportAPI.client.get('/reports/cash-bank', { params: dateRange });
          break;
        case 'gst-sales':
          response = await reportAPI.client.get('/reports/gst-sales', { params: dateRange });
          break;
        case 'gst-purchase':
          response = await reportAPI.client.get('/reports/gst-purchase', { params: dateRange });
          break;
        case 'hsn-sales':
          response = await reportAPI.client.get('/reports/hsn-sales', { params: dateRange });
          break;
        case 'bill-profit':
          response = await reportAPI.client.get('/reports/bill-profit', { params: dateRange });
          break;
        case 'balance-sheet':
          response = await reportAPI.client.get('/reports/balance-sheet', { params: dateRange });
          break;
        case 'gstr-3b':
          response = await reportAPI.client.get('/reports/gstr-3b', { params: dateRange });
          break;
        case 'tds-tcs':
          response = await reportAPI.client.get('/reports/tds-tcs', { params: dateRange });
          break;
        default:
          break;
      }
      setReportData(response?.data);
    } catch (error) {
      if (error.response && error.response.status === 403) {
        setUpgradeMessage(error.response.data.message || 'Upgrade required.');
        setShowUpgradeModal(true);
      } else {
        toast.error('Failed to load report');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderReportContent = () => {
    if (!activeReport || !reportData) return null;

    // Render logic for specific reports
    if (activeReport === 'sales' || activeReport === 'gstr-1' || activeReport === 'gst-sales') {
      return (
        <Card>
          <CardHeader>
            <CardTitle>{activeReportDetails?.title}</CardTitle>
            <CardDescription>
              Total: {formatCurrency(reportData.summary?.total_sales)} | 
              Tax: {formatCurrency(reportData.summary?.total_tax)}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.invoices?.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell>{inv.invoice_number}</TableCell>
                    <TableCell>{inv.Customer?.name}</TableCell>
                    <TableCell>{formatDate(inv.invoice_date)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(inv.total_amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      );
    }

    if (activeReport === 'daybook') {
      return (
        <Card>
          <CardHeader><CardTitle>Daybook</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Ref</TableHead>
                  <TableHead>Party</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(reportData) && reportData.map((tx, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{formatDate(tx.date)}</TableCell>
                    <TableCell>{tx.type}</TableCell>
                    <TableCell>{tx.ref}</TableCell>
                    <TableCell>{tx.party}</TableCell>
                    <TableCell className={`text-right ${tx.amount > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {formatCurrency(tx.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      );
    }
    
    if (activeReport === 'balance-sheet') {
      return (
        <Card>
          <CardHeader><CardTitle>Balance Sheet</CardTitle></CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold text-lg border-b pb-2 mb-4 text-slate-800">Assets</h3>
                <div className="space-y-3">
                  <div className="flex justify-between"><span>Cash & Bank</span><span className="font-mono">{formatCurrency(reportData.assets?.cashAndBank)}</span></div>
                  <div className="flex justify-between"><span>Accounts Receivable</span><span className="font-mono">{formatCurrency(reportData.assets?.accountsReceivable)}</span></div>
                  <div className="flex justify-between"><span>Inventory</span><span className="font-mono">{formatCurrency(reportData.assets?.inventory)}</span></div>
                  <div className="flex justify-between pt-3 border-t font-bold"><span>Total Assets</span><span className="font-mono text-emerald-600">{formatCurrency(reportData.assets?.totalAssets)}</span></div>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg border-b pb-2 mb-4 text-slate-800">Liabilities & Equity</h3>
                <div className="space-y-3">
                  <div className="flex justify-between"><span>Accounts Payable</span><span className="font-mono">{formatCurrency(reportData.liabilities?.accountsPayable)}</span></div>
                  <div className="flex justify-between"><span>Retained Earnings</span><span className="font-mono">{formatCurrency(reportData.equity?.retainedEarnings)}</span></div>
                  <div className="flex justify-between pt-3 border-t font-bold"><span>Total Liabilities & Equity</span><span className="font-mono text-red-600">{formatCurrency(Number(reportData.liabilities?.totalLiabilities) + Number(reportData.equity?.totalEquity))}</span></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Generic JSON renderer for others not fully mapped to table yet
    return (
      <Card>
        <CardHeader>
          <CardTitle>{activeReportDetails?.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-slate-50 p-4 rounded text-xs overflow-auto">
            {JSON.stringify(reportData, null, 2)}
          </pre>
        </CardContent>
      </Card>
    );
  };

  const renderReportList = (reports, showStar = false) => (
    <div className="space-y-1">
      {reports.map(report => (
        <div 
          key={report.id + report.title}
          onClick={() => handleReportClick(report)}
          className={`flex items-center justify-between p-3 rounded hover:bg-slate-50 cursor-pointer transition-colors ${activeReport === report.id ? 'bg-slate-50 border-l-4 border-indigo-600' : 'border-l-4 border-transparent'}`}
        >
          <span className="text-sm font-medium text-slate-700">{report.title}</span>
          <div className="flex items-center gap-2">
            {report.tier !== 'FREE' && <Crown className="w-4 h-4 text-amber-500 fill-amber-500" />}
            {report.isFavourite && <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in" data-testid="reports-page">
      {/* Header aligned to match screenshot */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <h1 className="text-xl font-semibold text-slate-800">Reports</h1>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 rounded">
          <Share2 className="w-4 h-4" /> CA Reports Sharing
        </Button>
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-4 text-sm">
        <span className="text-slate-400 flex items-center gap-1"><Filter className="w-4 h-4"/> Filter By</span>
        {['Party', 'Category', 'Payment Collection', 'Item', 'Invoice Details', 'Summary'].map(filter => (
          <div key={filter} className="px-4 py-1.5 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer">
            {filter}
          </div>
        ))}
      </div>

      {/* Reports Grid Layout */}
      <div className="grid md:grid-cols-3 gap-6 border rounded-lg bg-white overflow-hidden shadow-sm">
        <div className="border-r">
          <div className="p-4 border-b bg-slate-50/50 flex items-center gap-2 text-slate-600 font-medium">
            <Star className="w-4 h-4 text-slate-400" /> Favourite
          </div>
          <div className="p-2">
            {renderReportList(reportCategories.favourite, true)}
          </div>
        </div>
        <div className="border-r">
          <div className="p-4 border-b bg-slate-50/50 flex items-center gap-2 text-slate-600 font-medium">
            <span className="border rounded px-1.5 text-xs bg-slate-200">%</span> GST
          </div>
          <div className="p-2">
            {renderReportList(reportCategories.gst)}
          </div>
        </div>
        <div>
          <div className="p-4 border-b bg-slate-50/50 flex items-center gap-2 text-slate-600 font-medium">
            <FileTextIcon /> Transaction
          </div>
          <div className="p-2">
            {renderReportList(reportCategories.transaction)}
          </div>
        </div>
      </div>

      {/* Date Range Selector */}
      {activeReport && (
        <Card className="mt-8 bg-slate-50/50">
          <CardContent className="p-4 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Label>From:</Label>
              <Input type="date" value={dateRange.startDate} onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })} className="w-40 bg-white" />
            </div>
            <div className="flex items-center gap-2">
              <Label>To:</Label>
              <Input type="date" value={dateRange.endDate} onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })} className="w-40 bg-white" />
            </div>
            <Button onClick={() => fetchReport(activeReport)} className="bg-indigo-600 hover:bg-indigo-700">
              Refresh Data
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Report Content */}
      <div className="mt-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          renderReportContent()
        )}
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 text-center animate-fade-in-up">
            <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Premium Feature</h2>
            <p className="text-slate-600 mb-6">{upgradeMessage}</p>
            <div className="flex gap-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowUpgradeModal(false)}>Cancel</Button>
              <Button className="flex-1 bg-amber-500 hover:bg-amber-600 text-white" onClick={() => navigate('/settings/subscription')}>
                Upgrade Now
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const FileTextIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <line x1="10" y1="9" x2="8" y2="9"></line>
  </svg>
);

export default ReportsPage;
