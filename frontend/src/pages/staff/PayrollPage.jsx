import React, { useCallback, useEffect, useState } from 'react';
import { Download, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { useAuth } from '../../context/AuthContext';
import { staffApi, errorText, rupees, todayIst, SALARY_UNIT, STATUS_LABELS } from './staffShared';

/** Monthly payroll calculated by the server from attendance; advances and salary payments. */
export default function PayrollPage() {
  const { user, company } = useAuth();
  const admin = ['owner', 'admin'].includes(user?.role);
  const [month, setMonth] = useState(todayIst().slice(0, 7));
  const [data, setData] = useState(null);
  const [paying, setPaying] = useState(null); // { row, type }
  const [form, setForm] = useState({ amount: '', date: todayIst(), payment_method: 'Cash', notes: '' });
  const [payslip, setPayslip] = useState(null);

  const load = useCallback(async () => {
    try { setData((await staffApi.payroll(month)).data); }
    catch (error) { setData(null); toast.error(errorText(error, 'Could not calculate payroll')); }
  }, [month]);
  useEffect(() => { load(); }, [load]);

  const exportCsv = async () => {
    try {
      const response = await staffApi.exportPayroll(month);
      const url = URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }));
      const link = document.createElement('a'); link.href = url; link.download = `payroll-${month}.csv`; link.click(); URL.revokeObjectURL(url);
    } catch (error) { toast.error(errorText(error, 'Could not export')); }
  };
  const openPay = (row, type) => { setPaying({ row, type }); setForm({ amount: type === 'salary' ? String(row.due || '') : '', date: todayIst(), payment_method: 'Cash', notes: '' }); };
  const pay = async (e) => {
    e.preventDefault();
    try {
      await staffApi.pay({ staff_id: paying.row.staff.id, type: paying.type, month, amount: Number(form.amount), date: form.date, payment_method: form.payment_method, notes: form.notes });
      toast.success(paying.type === 'salary' ? 'Salary payment recorded (also added to Expenses)' : 'Advance recorded');
      setPaying(null); load();
    } catch (error) { toast.error(errorText(error, 'Could not record the payment')); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payroll</h1>
          <p className="text-sm text-slate-500">Worked out from attendance: monthly salaries pro-rata on payable days, daily wages per day, hourly by hours, plus overtime, minus advances.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="w-40" />
          <Button variant="outline" onClick={exportCsv}><Download className="w-4 h-4 mr-2" />Export CSV</Button>
        </div>
      </div>

      {data && <div className="grid grid-cols-2 md:grid-cols-4 gap-3 print:hidden">
        {[['Gross', data.totals.gross], ['Overtime', data.totals.overtime], ['Advances', data.totals.advances], ['Still to pay', data.totals.due]].map(([label, value]) => (
          <div key={label} className="bg-white border rounded-xl p-4"><p className="text-xs text-slate-500">{label}</p><p className="text-xl font-bold mt-1">{rupees(value)}</p></div>
        ))}
      </div>}

      <div className="bg-white border rounded-xl overflow-x-auto print:hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="p-3 text-left">Name</th><th className="p-3 text-right">Payable days</th><th className="p-3 text-right">Not marked</th><th className="p-3 text-right">Gross</th><th className="p-3 text-right">Overtime</th><th className="p-3 text-right">Advances</th><th className="p-3 text-right">Net</th><th className="p-3 text-right">Paid</th><th className="p-3" /></tr></thead>
          <tbody>
            {!data ? <tr><td colSpan={9} className="p-6 text-center text-slate-500">Loading…</td></tr>
              : !data.rows.length ? <tr><td colSpan={9} className="p-6 text-center text-slate-500">No staff this month.</td></tr>
              : data.rows.map((r) => (
                <tr key={r.staff.id} className="border-t">
                  <td className="p-3 font-medium">{r.staff.name}<span className="block text-xs text-slate-400">{rupees(r.staff.salary)} {SALARY_UNIT[r.staff.salary_type]}</span></td>
                  <td className="p-3 text-right">{r.staff.salary_type === 'hourly' ? `${r.hours} h` : r.payableDays}</td>
                  <td className={`p-3 text-right ${r.counts.not_marked ? 'text-amber-700 font-semibold' : 'text-slate-400'}`}>{r.counts.not_marked}</td>
                  <td className="p-3 text-right font-mono">{rupees(r.gross)}</td>
                  <td className="p-3 text-right font-mono">{rupees(r.overtime)}</td>
                  <td className="p-3 text-right font-mono">{rupees(r.advances)}</td>
                  <td className="p-3 text-right font-mono font-semibold">{rupees(r.net)}</td>
                  <td className="p-3 text-right font-mono">{rupees(r.paid)}{r.due > 0 && <span className="block text-xs text-amber-700">{rupees(r.due)} due</span>}</td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <Button variant="ghost" size="sm" onClick={() => setPayslip(r)}><Printer className="w-4 h-4 mr-1" />Payslip</Button>
                    {admin && <>
                      <Button variant="ghost" size="sm" onClick={() => openPay(r, 'advance')}>Advance</Button>
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => openPay(r, 'salary')}>Pay</Button>
                    </>}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {data?.rows.some((r) => r.counts.not_marked) && <p className="text-sm text-amber-700 print:hidden">Some days are not marked. They are not paid until attendance is marked.</p>}

      <Dialog open={paying !== null} onOpenChange={(o) => !o && setPaying(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{paying?.type === 'salary' ? `Pay salary · ${paying?.row.staff.name}` : `Advance · ${paying?.row.staff.name}`}</DialogTitle></DialogHeader>
          <form onSubmit={pay} className="space-y-3">
            <label className="block text-sm font-medium">Amount (₹)<Input required type="number" min="1" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></label>
            <label className="block text-sm font-medium">Date<Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></label>
            <label className="block text-sm font-medium">Paid by
              <select className="h-10 w-full rounded-md border px-3 text-sm" value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })}>
                {['Cash', 'UPI', 'Bank Transfer', 'Cheque'].map((m) => <option key={m}>{m}</option>)}
              </select>
            </label>
            <label className="block text-sm font-medium">Note<Input maxLength={500} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></label>
            {paying?.type === 'salary' && <p className="text-xs text-slate-500">Also recorded as a "Salary" expense for {month}.</p>}
            <DialogFooter><Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">Save</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {payslip && <Payslip row={payslip} month={month} company={company} onClose={() => setPayslip(null)} />}
    </div>
  );
}

/** Printable payslip (Ctrl+P / Print button prints only the slip). */
function Payslip({ row, month, company, onClose }) {
  const label = new Date(`${month}-01T00:00:00Z`).toLocaleDateString('en-IN', { month: 'long', year: 'numeric', timeZone: 'UTC' });
  return (
    <div className="fixed inset-0 z-[80] bg-slate-900/50 flex items-start justify-center p-4 overflow-y-auto print:static print:bg-white print:p-0">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-xl p-6 space-y-4 print:shadow-none print:max-w-none">
        <div className="flex justify-between gap-4 border-b pb-3">
          <div><p className="text-lg font-bold">{company?.name}</p><p className="text-sm text-slate-500">Payslip · {label}</p></div>
          <div className="text-right"><p className="font-semibold">{row.staff.name}</p><p className="text-sm text-slate-500">{row.staff.role}</p></div>
        </div>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
          {Object.entries(STATUS_LABELS).map(([key, text]) => <React.Fragment key={key}><dt className="text-slate-500">{text}</dt><dd className="text-right">{row.counts[key]}</dd></React.Fragment>)}
          <dt className="text-slate-500">Payable days</dt><dd className="text-right">{row.payableDays}</dd>
          {row.staff.salary_type === 'hourly' && <><dt className="text-slate-500">Hours</dt><dd className="text-right">{row.hours}</dd></>}
          <dt className="text-slate-500">Overtime hours</dt><dd className="text-right">{row.overtimeHours}</dd>
        </dl>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm border-t pt-3">
          <dt>Gross ({rupees(row.staff.salary)} {SALARY_UNIT[row.staff.salary_type]})</dt><dd className="text-right font-mono">{rupees(row.gross)}</dd>
          <dt>Overtime</dt><dd className="text-right font-mono">{rupees(row.overtime)}</dd>
          <dt>Less advances</dt><dd className="text-right font-mono">− {rupees(row.advances)}</dd>
          <dt className="font-bold">Net pay</dt><dd className="text-right font-mono font-bold">{rupees(row.net)}</dd>
          <dt>Paid</dt><dd className="text-right font-mono">{rupees(row.paid)}</dd>
          <dt>Balance</dt><dd className="text-right font-mono">{rupees(row.due)}</dd>
        </dl>
        <div className="flex justify-end gap-2 print:hidden">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={() => window.print()} className="bg-indigo-600 hover:bg-indigo-700"><Printer className="w-4 h-4 mr-2" />Print</Button>
        </div>
      </div>
    </div>
  );
}
