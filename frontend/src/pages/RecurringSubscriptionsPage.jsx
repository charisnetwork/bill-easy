import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { recurringAPI } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { InputGroup } from '../components/ui/input-group';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '../components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { getErrorMessage } from '../config/api';
import {
  Plus,
  Search,
  Repeat,
  Zap,
  PauseCircle,
  PlayCircle,
  Pencil,
  Trash2,
  Calendar,
  IndianRupee,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";
import { toast } from 'sonner';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount || 0);
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

const StatusBadge = ({ status }) => {
  const styles = {
    active: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    paused: 'bg-amber-100 text-amber-700 border-amber-300',
    cancelled: 'bg-red-100 text-red-700 border-red-300',
    completed: 'bg-blue-100 text-blue-700 border-blue-300'
  };
  return (
    <Badge className={`${styles[status] || 'bg-slate-100 text-slate-700'} border capitalize px-2 py-0.5 text-xs font-semibold`}>
      {status}
    </Badge>
  );
};

export const RecurringSubscriptionsPage = () => {
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;
      const response = await recurringAPI.getAll(params);
      setSubscriptions(response.data || []);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load recurring subscriptions'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [search, statusFilter]);

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      setActionLoadingId(id);
      const newStatus = currentStatus === 'active' ? 'paused' : 'active';
      await recurringAPI.toggleStatus(id, newStatus);
      toast.success(`Subscription ${newStatus === 'active' ? 'activated' : 'paused'}`);
      fetchSubscriptions();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to update status'));
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleTriggerNow = async (id, profileName) => {
    if (!window.confirm(`Generate invoice now for profile "${profileName}"?`)) return;
    try {
      setActionLoadingId(id);
      const response = await recurringAPI.triggerNow(id);
      toast.success(`Invoice ${response.data?.invoice?.invoice_number || ''} generated successfully!`);
      fetchSubscriptions();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to trigger invoice generation'));
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id, profileName) => {
    if (!window.confirm(`Are you sure you want to delete subscription "${profileName}"?`)) return;
    try {
      setActionLoadingId(id);
      await recurringAPI.delete(id);
      toast.success('Subscription deleted');
      fetchSubscriptions();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Delete failed'));
    } finally {
      setActionLoadingId(null);
    }
  };

  // Metrics
  const activeCount = subscriptions.filter(s => s.status === 'active').length;
  const totalValue = subscriptions.reduce((acc, sub) => {
    const subTotal = (sub.items || []).reduce((sum, item) => {
      const q = parseFloat(item.quantity) || 0;
      const p = parseFloat(item.unit_price) || 0;
      return sum + (q * p);
    }, 0);
    return acc + subTotal;
  }, 0);

  return (
    <div className="space-y-6 animate-fade-in" data-testid="recurring-subscriptions-page">
      <TooltipProvider>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Repeat className="w-7 h-7 text-indigo-600" />
              <h1 className="font-heading text-2xl md:text-3xl font-bold text-slate-900">
                Recurring Subscriptions & Retainers
              </h1>
            </div>
            <p className="text-slate-600 mt-1">
              Automate monthly retainers and recurring billing schedules for your clients
            </p>
          </div>
          <Link to="/recurring/new">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md">
              <Plus className="w-4 h-4 mr-2" />
              New Subscription Profile
            </Button>
          </Link>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-indigo-900 flex items-center justify-between">
                Active Profiles
                <Repeat className="w-4 h-4 text-indigo-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-950">{activeCount}</div>
              <p className="text-xs text-indigo-600 mt-1">Generating auto-invoices</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-emerald-900 flex items-center justify-between">
                Total Subscription Value
                <IndianRupee className="w-4 h-4 text-emerald-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-950">{formatCurrency(totalValue)}</div>
              <p className="text-xs text-emerald-600 mt-1">Per billing cycle sum</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-900 flex items-center justify-between">
                Total Profiles Configured
                <Calendar className="w-4 h-4 text-blue-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-950">{subscriptions.length}</div>
              <p className="text-xs text-blue-600 mt-1">All frequencies</p>
            </CardContent>
          </Card>
        </div>

        {/* Table & Filters */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1 max-w-sm">
                <InputGroup
                  placeholder="Search profile or customer..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  leftIcon={<Search className="w-4 h-4" />}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              </div>
            ) : subscriptions.length === 0 ? (
              <div className="text-center py-12">
                <Repeat className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-700 font-medium">No recurring subscriptions found</p>
                <p className="text-sm text-slate-500 mt-1">Set up a recurring retainer to automatically issue invoices</p>
                <Link to="/recurring/new" className="inline-block mt-4">
                  <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Profile
                  </Button>
                </Link>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Profile Name</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Next Issue Date</TableHead>
                    <TableHead>Last Issued</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell className="font-semibold text-slate-900">
                        {sub.profile_name}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-slate-900">{sub.Customer?.name || '—'}</div>
                        {sub.Customer?.phone && (
                          <div className="text-xs text-slate-500">{sub.Customer.phone}</div>
                        )}
                      </TableCell>
                      <TableCell className="capitalize text-sm text-slate-700 font-medium">
                        {sub.billing_interval > 1 ? `Every ${sub.billing_interval} ${sub.frequency}s` : sub.frequency}
                      </TableCell>
                      <TableCell className="text-sm text-slate-700 font-mono">
                        {formatDate(sub.next_issue_date)}
                      </TableCell>
                      <TableCell className="text-sm text-slate-500">
                        {formatDate(sub.last_issued_date)}
                      </TableCell>
                      <TableCell className="text-center">
                        <StatusBadge status={sub.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Manual Trigger Now */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-indigo-600 hover:bg-indigo-50"
                                disabled={actionLoadingId === sub.id}
                                onClick={() => handleTriggerNow(sub.id, sub.profile_name)}
                              >
                                {actionLoadingId === sub.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Zap className="w-4 h-4 fill-indigo-600" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Trigger Invoice Now</p></TooltipContent>
                          </Tooltip>

                          {/* Pause / Resume */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className={`h-8 w-8 ${sub.status === 'active' ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                                disabled={actionLoadingId === sub.id}
                                onClick={() => handleToggleStatus(sub.id, sub.status)}
                              >
                                {sub.status === 'active' ? (
                                  <PauseCircle className="w-4 h-4" />
                                ) : (
                                  <PlayCircle className="w-4 h-4" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{sub.status === 'active' ? 'Pause Subscription' : 'Resume Subscription'}</p>
                            </TooltipContent>
                          </Tooltip>

                          {/* Edit */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-500 hover:text-blue-600"
                                onClick={() => navigate(`/recurring/${sub.id}/edit`)}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Edit Profile</p></TooltipContent>
                          </Tooltip>

                          {/* Delete */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50"
                                disabled={actionLoadingId === sub.id}
                                onClick={() => handleDelete(sub.id, sub.profile_name)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Delete Profile</p></TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </TooltipProvider>
    </div>
  );
};

export default RecurringSubscriptionsPage;
