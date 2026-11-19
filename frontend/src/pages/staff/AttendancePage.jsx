import React, { useCallback, useEffect, useState } from 'react';
import { CheckCheck, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useAuth } from '../../context/AuthContext';
import { canStaff, staffApi, errorText, todayIst, STATUS_LABELS, STATUS_TONE, WEEKDAYS } from './staffShared';

/** Daily attendance for everyone, plus one person's month. */
export default function AttendancePage() {
  const { user } = useAuth();
  const canMark = canStaff(user, 'attendance_mark');
  const [date, setDate] = useState(todayIst());
  const [day, setDay] = useState(null);
  const [rows, setRows] = useState({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = (await staffApi.day(date)).data;
      setDay(data);
      setRows(Object.fromEntries(data.staff.map((s) => [s.id, {
        status: s.record?.status || (s.weeklyOff ? 'week_off' : ''),
        check_in: s.record?.check_in || '', check_out: s.record?.check_out || '',
        overtime_hours: s.record ? Number(s.record.overtime_hours) || '' : '', notes: s.record?.notes || '',
      }])));
    } catch (error) { toast.error(errorText(error, 'Could not load attendance')); }
  }, [date]);
  useEffect(() => { load(); }, [load]);

  const set = (id, key, value) => setRows((r) => ({ ...r, [id]: { ...r[id], [key]: value } }));
  const markAllPresent = () => setRows((r) => Object.fromEntries(Object.entries(r).map(([id, row]) => [id, row.status ? row : { ...row, status: 'present' }])));
  const save = async () => {
    const entries = Object.entries(rows).filter(([, row]) => row.status).map(([staff_id, row]) => ({ staff_id, ...row, overtime_hours: row.overtime_hours === '' ? 0 : Number(row.overtime_hours) }));
    if (!entries.length) return toast.error('Choose a status for at least one person');
    setSaving(true);
    try { toast.success((await staffApi.saveDay(date, entries)).data.message); load(); }
    catch (error) { toast.error(errorText(error, 'Could not save attendance')); }
    finally { setSaving(false); }
  };

  const readOnly = !canMark || day?.locked || date > todayIst();
  const unmarked = Object.values(rows).filter((r) => !r.status).length;
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Attendance</h1>
          <p className="text-sm text-slate-500">Mark each person for the day. Weekly offs are filled in for you.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Input type="date" value={date} max={todayIst()} onChange={(e) => setDate(e.target.value)} className="w-44" />
          {!readOnly && <Button variant="outline" onClick={markAllPresent} disabled={!unmarked}><CheckCheck className="w-4 h-4 mr-2" />Mark rest present</Button>}
          {!readOnly && <Button onClick={save} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700"><Save className="w-4 h-4 mr-2" />{saving ? 'Saving…' : 'Save'}</Button>}
        </div>
      </div>
      {day?.locked && <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">This day is locked for changes. Ask the owner or an admin to correct older attendance.</p>}

      <div className="bg-white border rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="p-3 text-left">Name</th><th className="p-3 text-left">Status</th><th className="p-3 text-left">In</th><th className="p-3 text-left">Out</th><th className="p-3 text-left">Overtime (h)</th><th className="p-3 text-left">Note</th></tr></thead>
          <tbody>
            {!day ? <tr><td colSpan={6} className="p-6 text-center text-slate-500">Loading…</td></tr>
              : !day.staff.length ? <tr><td colSpan={6} className="p-6 text-center text-slate-500">No active staff. Add them on the Staff page.</td></tr>
              : day.staff.map((s) => { const row = rows[s.id] || {}; return (
                <tr key={s.id} className="border-t">
                  <td className="p-3 font-medium">{s.name}<span className="block text-xs text-slate-400">{s.role}</span></td>
                  <td className="p-3">
                    <select aria-label={`Status for ${s.name}`} disabled={readOnly} className={`h-9 rounded-md border px-2 text-sm ${row.status ? STATUS_TONE[row.status] : 'bg-white'}`} value={row.status || ''} onChange={(e) => set(s.id, 'status', e.target.value)}>
                      <option value="">Not marked</option>
                      {Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                  </td>
                  <td className="p-3"><Input type="time" disabled={readOnly} className="w-28" value={row.check_in || ''} onChange={(e) => set(s.id, 'check_in', e.target.value)} /></td>
                  <td className="p-3"><Input type="time" disabled={readOnly} className="w-28" value={row.check_out || ''} onChange={(e) => set(s.id, 'check_out', e.target.value)} /></td>
                  <td className="p-3"><Input type="number" min="0" max="16" step="0.5" disabled={readOnly} className="w-24" value={row.overtime_hours} onChange={(e) => set(s.id, 'overtime_hours', e.target.value)} /></td>
                  <td className="p-3"><Input disabled={readOnly} maxLength={500} className="min-w-[10rem]" value={row.notes || ''} onChange={(e) => set(s.id, 'notes', e.target.value)} /></td>
                </tr>); })}
          </tbody>
        </table>
      </div>

      {day?.staff?.length > 0 && <MonthView staff={day.staff} />}
    </div>
  );
}

function MonthView({ staff }) {
  const [staffId, setStaffId] = useState(staff[0]?.id || '');
  const [month, setMonth] = useState(todayIst().slice(0, 7));
  const [data, setData] = useState(null);
  useEffect(() => {
    if (!staffId) return;
    staffApi.month(staffId, month).then((r) => setData(r.data)).catch((error) => toast.error(errorText(error, 'Could not load the month')));
  }, [staffId, month]);
  const firstWeekday = data ? new Date(`${data.days[0].date}T00:00:00Z`).getUTCDay() : 0;
  return (
    <section className="bg-white border rounded-xl p-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold">Month view</h2>
        <div className="flex flex-wrap gap-2">
          <select aria-label="Staff member" className="h-10 rounded-md border px-3 text-sm" value={staffId} onChange={(e) => setStaffId(e.target.value)}>{staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
          <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="w-40" />
        </div>
      </div>
      {data && <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {WEEKDAYS.map((d) => <div key={d} className="font-semibold text-slate-500 py-1">{d}</div>)}
        {Array.from({ length: firstWeekday }, (_, i) => <div key={`blank-${i}`} />)}
        {data.days.map((d) => (
          <div key={d.date} className={`rounded-md p-1.5 min-h-[3rem] ${d.status ? STATUS_TONE[d.status] : 'bg-slate-50 text-slate-400'}`} title={d.status ? STATUS_LABELS[d.status] : 'Not marked'}>
            <div className="font-semibold">{Number(d.date.slice(8))}</div>
            <div className="truncate">{d.status ? STATUS_LABELS[d.status] : '—'}</div>
            {d.overtime_hours > 0 && <div>+{d.overtime_hours}h</div>}
          </div>
        ))}
      </div>}
    </section>
  );
}
