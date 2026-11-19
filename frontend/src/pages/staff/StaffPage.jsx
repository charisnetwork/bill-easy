import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, CalendarCheck, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { useAuth } from '../../context/AuthContext';
import { canStaff, staffApi, errorText, rupees, SALARY_UNIT, WEEKDAYS } from './staffShared';

const EMPTY = { name: '', phone: '', email: '', role: '', department: '', joining_date: '', salary_type: 'monthly', salary: '', weekly_offs: [0], notes: '', is_active: true };

/** Staff records: separate from app logins (Settings → Team members). */
export default function StaffPage() {
  const { user } = useAuth();
  const admin = ['owner', 'admin'].includes(user?.role);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInactive, setShowInactive] = useState(false);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null); // null closed, {} new, row = edit
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setStaff((await staffApi.list(showInactive)).data); }
    catch (error) { toast.error(errorText(error, 'Could not load staff')); }
    finally { setLoading(false); }
  }, [showInactive]);
  useEffect(() => { load(); }, [load]);

  const open = (row) => {
    setEditing(row || {});
    setForm(row ? { ...EMPTY, ...row, salary: row.salary ?? '', joining_date: row.joining_date || '', phone: row.phone || '', email: row.email || '', role: row.role || '', department: row.department || '', notes: row.notes || '' } : EMPTY);
  };
  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const toggleOff = (day) => set('weekly_offs', form.weekly_offs.includes(day) ? form.weekly_offs.filter((d) => d !== day) : [...form.weekly_offs, day]);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = { ...form, salary: Number(form.salary || 0), joining_date: form.joining_date || null };
      if (editing?.id) await staffApi.update(editing.id, body); else await staffApi.create(body);
      toast.success(editing?.id ? 'Staff member updated' : 'Staff member added');
      setEditing(null);
      load();
    } catch (error) { toast.error(errorText(error, 'Could not save')); }
    finally { setSaving(false); }
  };
  const remove = async (row) => {
    if (!window.confirm(`Remove ${row.name}? Their attendance and payments are kept.`)) return;
    try { await staffApi.remove(row.id); toast.success('Removed'); load(); }
    catch (error) { toast.error(errorText(error, 'Could not remove')); }
  };

  const shown = staff.filter((s) => !search || `${s.name} ${s.role || ''} ${s.department || ''} ${s.phone || ''}`.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Staff</h1>
          <p className="text-sm text-slate-500">Your team's records, salary and weekly offs. App logins are in Settings → Team members.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild><Link to="/attendance"><CalendarCheck className="w-4 h-4 mr-2" />Attendance</Link></Button>
          {canStaff(user, 'payroll_view') && <Button variant="outline" asChild><Link to="/payroll"><Wallet className="w-4 h-4 mr-2" />Payroll</Link></Button>}
          {admin && <Button onClick={() => open(null)} className="bg-indigo-600 hover:bg-indigo-700"><Plus className="w-4 h-4 mr-2" />Add staff</Button>}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Input placeholder="Search name, designation, department, phone" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
        <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} />Show inactive</label>
      </div>

      <div className="bg-white border rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr><th className="p-3 text-left">Name</th><th className="p-3 text-left">Designation</th><th className="p-3 text-left">Phone</th>{canStaff(user, 'payroll_view') && <th className="p-3 text-right">Salary</th>}<th className="p-3 text-left">Weekly off</th><th className="p-3" /></tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={6} className="p-6 text-center text-slate-500">Loading…</td></tr>
              : !shown.length ? <tr><td colSpan={6} className="p-6 text-center text-slate-500">{staff.length ? 'No match.' : admin ? 'No staff yet. Add your first team member.' : 'No staff yet.'}</td></tr>
              : shown.map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="p-3 font-medium">{s.name}{s.is_active === false && <span className="ml-2 text-xs text-slate-400">inactive</span>}<span className="block text-xs text-slate-400">{s.department}</span></td>
                  <td className="p-3">{s.role || '—'}</td>
                  <td className="p-3">{s.phone || '—'}</td>
                  {canStaff(user, 'payroll_view') && <td className="p-3 text-right font-mono">{rupees(s.salary)} <span className="text-xs text-slate-400">{SALARY_UNIT[s.salary_type]}</span></td>}
                  <td className="p-3 text-xs">{(s.weekly_offs || []).map((d) => WEEKDAYS[d]).join(', ') || 'None'}</td>
                  <td className="p-3 text-right whitespace-nowrap">
                    {admin && <>
                      <Button variant="ghost" size="icon" aria-label={`Edit ${s.name}`} onClick={() => open(s)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" aria-label={`Remove ${s.name}`} onClick={() => remove(s)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                    </>}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing?.id ? `Edit ${editing.name}` : 'Add staff member'}</DialogTitle></DialogHeader>
          <form onSubmit={save} className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2"><Label>Name *</Label><Input required minLength={2} maxLength={120} value={form.name} onChange={(e) => set('name', e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Phone</Label><Input inputMode="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Designation</Label><Input value={form.role} onChange={(e) => set('role', e.target.value)} placeholder="e.g. Cashier" /></div>
            <div className="space-y-1.5"><Label>Department</Label><Input value={form.department} onChange={(e) => set('department', e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Joining date</Label><Input type="date" value={form.joining_date} onChange={(e) => set('joining_date', e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Salary type</Label>
              <select className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm" value={form.salary_type} onChange={(e) => set('salary_type', e.target.value)}>
                <option value="monthly">Monthly salary</option><option value="daily">Daily wage</option><option value="hourly">Hourly rate</option>
              </select>
            </div>
            <div className="space-y-1.5"><Label>Amount (₹ {SALARY_UNIT[form.salary_type]})</Label><Input type="number" min="0" step="0.01" value={form.salary} onChange={(e) => set('salary', e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Weekly off</Label>
              <div className="flex flex-wrap gap-1.5">{WEEKDAYS.map((d, i) => <button type="button" key={d} onClick={() => toggleOff(i)} className={`px-2.5 py-1 rounded-md border text-xs ${form.weekly_offs.includes(i) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600'}`}>{d}</button>)}</div>
              <p className="text-xs text-slate-500">Weekly offs are paid for monthly salaries and filled in automatically.</p>
            </div>
            <div className="space-y-1.5 sm:col-span-2"><Label>Notes</Label><Input maxLength={1000} value={form.notes} onChange={(e) => set('notes', e.target.value)} /></div>
            {editing?.id && <label className="flex items-center gap-2 text-sm sm:col-span-2"><input type="checkbox" checked={form.is_active} onChange={(e) => set('is_active', e.target.checked)} />Active (inactive staff are hidden from attendance)</label>}
            <DialogFooter className="sm:col-span-2"><Button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-700">{saving ? 'Saving…' : 'Save'}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
