import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { recurringAPI, customerAPI, productAPI } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Checkbox } from '../components/ui/checkbox';
import { getErrorMessage } from '../config/api';
import {
  Plus, Trash2, ArrowLeft, Loader2, Save, Repeat, IndianRupee
} from 'lucide-react';
import { toast } from 'sonner';

export const CreateRecurringSubscriptionPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    profile_name: '',
    customer_id: '',
    frequency: 'monthly',
    billing_interval: 1,
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    next_issue_date: new Date().toISOString().split('T')[0],
    auto_send_email: true,
    auto_send_whatsapp: false,
    notes: '',
    terms: ''
  });

  const [items, setItems] = useState([
    { product_id: '', quantity: 1, unit_price: 0, tax_rate: 18, discount: 0, description: '' }
  ]);

  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        const [custRes, prodRes] = await Promise.all([
          customerAPI.getAll({ limit: 500 }),
          productAPI.getAll({ limit: 500 })
        ]);
        setCustomers(custRes.data?.customers || custRes.data || []);
        setProducts(prodRes.data?.products || prodRes.data || []);

        if (isEdit) {
          const subRes = await recurringAPI.get(id);
          const sub = subRes.data;
          setFormData({
            profile_name: sub.profile_name || '',
            customer_id: sub.customer_id || '',
            frequency: sub.frequency || 'monthly',
            billing_interval: sub.billing_interval || 1,
            start_date: sub.start_date || '',
            end_date: sub.end_date || '',
            next_issue_date: sub.next_issue_date || '',
            auto_send_email: sub.auto_send_email ?? true,
            auto_send_whatsapp: sub.auto_send_whatsapp ?? false,
            notes: sub.notes || '',
            terms: sub.terms || ''
          });

          if (sub.items && sub.items.length) {
            setItems(sub.items.map(i => ({
              product_id: i.product_id,
              quantity: i.quantity,
              unit_price: i.unit_price,
              tax_rate: i.tax_rate || 0,
              discount: i.discount || 0,
              description: i.description || ''
            })));
          }
        }
      } catch (err) {
        toast.error(getErrorMessage(err, 'Failed to load initial data'));
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, [id, isEdit]);

  const handleProductSelect = (index, productId) => {
    const prod = products.find(p => p.id === productId);
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      product_id: productId,
      unit_price: prod ? parseFloat(prod.sale_price || 0) : 0,
      tax_rate: prod ? parseFloat(prod.gst_rate || 0) : 0,
      description: prod ? prod.description || prod.name : ''
    };
    setItems(newItems);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const addItemRow = () => {
    setItems([...items, { product_id: '', quantity: 1, unit_price: 0, tax_rate: 18, discount: 0, description: '' }]);
  };

  const removeItemRow = (index) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => {
      const q = parseFloat(item.quantity) || 0;
      const p = parseFloat(item.unit_price) || 0;
      const d = parseFloat(item.discount) || 0;
      return sum + (q * p) - d;
    }, 0);
  };

  const calculateTotalTax = () => {
    return items.reduce((sum, item) => {
      const q = parseFloat(item.quantity) || 0;
      const p = parseFloat(item.unit_price) || 0;
      const d = parseFloat(item.discount) || 0;
      const rate = parseFloat(item.tax_rate) || 0;
      const lineSubtotal = (q * p) - d;
      return sum + (lineSubtotal * rate) / 100;
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.profile_name.trim()) {
      toast.error('Please enter a profile name');
      return;
    }
    if (!formData.customer_id) {
      toast.error('Please select a customer');
      return;
    }
    const invalidItem = items.find(i => !i.product_id || parseFloat(i.quantity) <= 0);
    if (invalidItem) {
      toast.error('Please select a valid product and quantity for all item rows');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        items
      };

      if (isEdit) {
        await recurringAPI.update(id, payload);
        toast.success('Subscription profile updated successfully');
      } else {
        await recurringAPI.create(payload);
        toast.success('Recurring subscription created successfully');
      }
      navigate('/recurring');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to save recurring subscription'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  const subtotal = calculateSubtotal();
  const taxTotal = calculateTotalTax();
  const grandTotal = subtotal + taxTotal;

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/recurring')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-heading text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Repeat className="w-6 h-6 text-indigo-600" />
              {isEdit ? 'Edit Recurring Profile' : 'New Recurring Subscription'}
            </h1>
            <p className="text-slate-600 text-sm">Configure automatic invoice generation parameters</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">General Subscription Settings</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Profile Name *</Label>
              <Input
                placeholder="e.g. Monthly Maintenance Retainer"
                value={formData.profile_name}
                onChange={(e) => setFormData({ ...formData, profile_name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Select Customer *</Label>
              <Select
                value={formData.customer_id}
                onValueChange={(val) => setFormData({ ...formData, customer_id: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose Customer..." />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} {c.phone ? `(${c.phone})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Billing Frequency</Label>
              <Select
                value={formData.frequency}
                onValueChange={(val) => setFormData({ ...formData, frequency: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="annually">Annually</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Billing Interval</Label>
              <Input
                type="number"
                min="1"
                placeholder="e.g. 1 (Every month)"
                value={formData.billing_interval}
                onChange={(e) => setFormData({ ...formData, billing_interval: parseInt(e.target.value) || 1 })}
              />
            </div>

            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>First / Next Issue Date</Label>
              <Input
                type="date"
                value={formData.next_issue_date}
                onChange={(e) => setFormData({ ...formData, next_issue_date: e.target.value })}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>End Date (Optional)</Label>
              <Input
                type="date"
                placeholder="Leave blank for infinite retainer"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Line Items */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold">Recurring Line Items</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addItemRow}>
              <Plus className="w-4 h-4 mr-1" /> Add Line Item
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-64">Product / Service</TableHead>
                  <TableHead className="w-24">Qty</TableHead>
                  <TableHead className="w-32">Rate (₹)</TableHead>
                  <TableHead className="w-24">Tax %</TableHead>
                  <TableHead className="w-28">Discount (₹)</TableHead>
                  <TableHead className="w-32 text-right">Total (₹)</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, idx) => {
                  const q = parseFloat(item.quantity) || 0;
                  const p = parseFloat(item.unit_price) || 0;
                  const d = parseFloat(item.discount) || 0;
                  const taxR = parseFloat(item.tax_rate) || 0;
                  const sub = (q * p) - d;
                  const rowTotal = sub + (sub * taxR / 100);

                  return (
                    <TableRow key={idx}>
                      <TableCell>
                        <Select
                          value={item.product_id}
                          onValueChange={(val) => handleProductSelect(idx, val)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select product..." />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((prod) => (
                              <SelectItem key={prod.id} value={prod.id}>
                                {prod.name} (₹{prod.sale_price})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0.1"
                          step="any"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="any"
                          value={item.unit_price}
                          onChange={(e) => handleItemChange(idx, 'unit_price', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="any"
                          value={item.tax_rate}
                          onChange={(e) => handleItemChange(idx, 'tax_rate', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="any"
                          value={item.discount}
                          onChange={(e) => handleItemChange(idx, 'discount', e.target.value)}
                        />
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold">
                        ₹{rowTotal.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-red-600"
                          onClick={() => removeItemRow(idx)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            <div className="p-4 bg-slate-50 border-t flex flex-col items-end gap-1 font-mono text-sm">
              <div className="flex justify-between w-64 text-slate-600">
                <span>Subtotal:</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between w-64 text-slate-600">
                <span>Tax Total:</span>
                <span>₹{taxTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between w-64 font-bold text-base text-slate-900 border-t pt-1 mt-1">
                <span>Total Per Cycle:</span>
                <span className="text-indigo-600">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery & Dispatch Preferences */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Dispatch & Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="auto_send_email"
                checked={formData.auto_send_email}
                onCheckedChange={(checked) => setFormData({ ...formData, auto_send_email: Boolean(checked) })}
              />
              <Label htmlFor="auto_send_email" className="font-normal cursor-pointer">
                Automatically email invoice PDF to customer when generated
              </Label>
            </div>

            <div className="space-y-2 pt-2">
              <Label>Subscription Notes / Internal Memo</Label>
              <Input
                placeholder="Internal references, contract numbers, etc."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-4 pt-2">
          <Button type="button" variant="outline" onClick={() => navigate('/recurring')}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-32">
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {isEdit ? 'Update Profile' : 'Save Subscription'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateRecurringSubscriptionPage;
