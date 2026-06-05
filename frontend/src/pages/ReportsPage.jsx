import React, { useState, useEffect } from 'react';
import { reportAPI } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '../components/ui/table';
import { Share2, Filter, Lock, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
const formatDate = (date) => new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const reportCategories = {
  taxCompliance: [
    { id: 'gstr-1', title: 'GSTR-1 (Sales)', tier: 'ENTERPRISE' },
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
  businessActivities: [
    { id: 'balance-sheet', title: 'Balance Sheet', tier: 'ENTERPRISE' },
    { id: 'profit-loss', title: 'Profit And Loss Report', tier: 'PREMIUM' },
    { id: 'sales', title: 'Sales Summary', tier: 'FREE' },
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
  const { user, subscription } = useAuth();
  const navigate = useNavigate();
  const planName = subscription?.plan?.plan_name || 'Free Account';
  
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
  const [searchQuery, setSearchQuery] = useState('');

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

    if (activeReport === 'customer-outstanding' || activeReport === 'supplier-outstanding') {
      const parties = activeReport === 'customer-outstanding' ? reportData.customers : reportData.suppliers;
      return (
        <Card>
          <CardHeader><CardTitle>{activeReportDetails?.title}</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead className="text-right">Outstanding</TableHead>
                    <TableHead className="text-right">Wallet Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parties?.map((party) => (
                    <TableRow key={party.id}>
                      <TableCell className="font-medium">{party.name}</TableCell>
                      <TableCell>{party.phone || '-'}</TableCell>
                      <TableCell>{party.city || '-'}</TableCell>
                      <TableCell className={`text-right font-mono font-bold ${activeReport === 'customer-outstanding' ? 'text-amber-600' : 'text-red-600'}`}>{formatCurrency(party.outstanding_balance)}</TableCell>
                      <TableCell className="text-right font-mono text-emerald-600">{formatCurrency(party.wallet_balance || 0)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Dynamic Table Fallback for any other reports
    const dataToRender = Array.isArray(reportData) ? reportData : (reportData.data || reportData.items || reportData.products || reportData.expenses || reportData.invoices || []);
    
    if (Array.isArray(dataToRender) && dataToRender.length > 0) {
      const sampleItem = dataToRender[0];
      const keys = Object.keys(sampleItem).filter(k => typeof sampleItem[k] !== 'object' && !k.endsWith('_id') && k !== 'id' && k !== 'createdAt' && k !== 'updatedAt');
      
      return (
        <Card>
          <CardHeader>
            <CardTitle>{activeReportDetails?.title}</CardTitle>
            {reportData.summary && (
              <CardDescription className="flex gap-4 flex-wrap mt-2">
                {Object.entries(reportData.summary).map(([k, v]) => (
                  <span key={k} className="bg-slate-100 px-2 py-1 rounded text-slate-700 capitalize font-medium">
                    {k.replace(/_/g, ' ')}: {typeof v === 'number' ? formatCurrency(v) : v}
                  </span>
                ))}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto max-h-[600px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    {keys.map(k => <TableHead key={k} className="capitalize whitespace-nowrap">{k.replace(/_/g, ' ')}</TableHead>)}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dataToRender.map((row, idx) => (
                    <TableRow key={idx}>
                      {keys.map(k => {
                        const val = row[k];
                        const isMoney = (k.includes('balance') || k.includes('amount') || k.includes('price') || k.includes('total') || k.includes('tax'));
                        return (
                          <TableCell key={k} className={isMoney ? "font-mono whitespace-nowrap" : "whitespace-nowrap"}>
                            {typeof val === 'number' && isMoney ? formatCurrency(val) : String(val || '-')}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Generic JSON renderer if empty or unrecognizable
    return (
      <Card>
        <CardHeader>
          <CardTitle>{activeReportDetails?.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500 bg-slate-50 rounded border border-dashed">
            No data found for this period.
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderReportList = (reports) => {
    const filteredReports = reports.filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (filteredReports.length === 0) {
      return <div className="text-sm text-slate-500 py-4 px-2">No reports match your search.</div>;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredReports.map(report => (
          <div 
            key={report.id + report.title}
            onClick={() => handleReportClick(report)}
            className={`flex items-center justify-between p-4 rounded-lg border hover:bg-slate-50 cursor-pointer transition-colors ${activeReport === report.id ? 'bg-indigo-50 border-indigo-300' : 'bg-white border-slate-200'}`}
          >
            <span className="text-sm font-medium text-slate-700">{report.title}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in" data-testid="reports-page">
      {/* Header aligned to match screenshot */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <h1 className="text-xl font-semibold text-slate-800">Reports</h1>
        <Button onClick={() => navigate('/settings?section=send-to-ca')} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 rounded">
          <Share2 className="w-4 h-4" /> CA Reports Sharing
        </Button>
      </div>

      {/* Search Filter */}
      <div className="flex items-center gap-2 text-sm max-w-md bg-white border border-slate-200 rounded-md px-3 shadow-sm">
        <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
        <Input 
          placeholder="Search reports..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border-0 focus-visible:ring-0 shadow-none px-2 h-11 w-full"
        />
      </div>

      {/* Reports Row Layout */}
      <div className="space-y-6">
        
        {/* Tax & Compliance Section */}
        <div className="border rounded-lg bg-slate-50/50 overflow-hidden shadow-sm">
          <div className="p-4 border-b bg-white flex items-center gap-2 text-slate-800 font-semibold">
            <span className="border rounded px-1.5 py-0.5 text-xs bg-slate-100 text-slate-600">%</span> Tax & Compliance
          </div>
          <div className="p-4">
            {renderReportList(reportCategories.taxCompliance)}
          </div>
        </div>

        {/* Business Activities Section */}
        <div className="border rounded-lg bg-slate-50/50 overflow-hidden shadow-sm">
          <div className="p-4 border-b bg-white flex items-center gap-2 text-slate-800 font-semibold">
            <FileTextIcon /> Business Activities
          </div>
          <div className="p-4">
            {renderReportList(reportCategories.businessActivities)}
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
