import api from '../../services/api';
import { getErrorMessage } from '../../config/api';

// Owner/admin can do everything; a staff login only what its permissions tick.
export const canStaff = (user, key) => ['owner', 'admin'].includes(user?.role) || user?.permissions?.[key] === true;

export const STATUS_LABELS = {
  present: 'Present',
  absent: 'Absent',
  half_day: 'Half day',
  paid_leave: 'Paid leave',
  unpaid_leave: 'Unpaid leave',
  week_off: 'Week off',
  holiday: 'Holiday',
};
export const STATUS_TONE = {
  present: 'bg-emerald-100 text-emerald-800',
  absent: 'bg-red-100 text-red-800',
  half_day: 'bg-amber-100 text-amber-800',
  paid_leave: 'bg-sky-100 text-sky-800',
  unpaid_leave: 'bg-orange-100 text-orange-800',
  week_off: 'bg-slate-100 text-slate-600',
  holiday: 'bg-violet-100 text-violet-800',
};
export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const SALARY_UNIT = { monthly: '/ month', daily: '/ day', hourly: '/ hour' };

export const todayIst = () => new Date(Date.now() + 330 * 60_000).toISOString().slice(0, 10);
export const rupees = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

export const staffApi = {
  list: (includeInactive) => api.get('/staff', { params: includeInactive ? { include: 'inactive' } : {} }),
  create: (data) => api.post('/staff', data),
  update: (id, data) => api.put(`/staff/${id}`, data),
  remove: (id) => api.delete(`/staff/${id}`),
  day: (date) => api.get('/staff/attendance', { params: { date } }),
  saveDay: (date, entries) => api.put('/staff/attendance', { date, entries }),
  month: (id, month) => api.get(`/staff/${id}/attendance`, { params: { month } }),
  payroll: (month) => api.get('/staff/payroll', { params: { month } }),
  exportPayroll: (month) => api.get('/staff/payroll/export', { params: { month }, responseType: 'blob' }),
  payments: (month) => api.get('/staff/payments', { params: { month } }),
  pay: (data) => api.post('/staff/payments', data),
};

export const errorText = (error, fallback) => getErrorMessage(error, fallback);
