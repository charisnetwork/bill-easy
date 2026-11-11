import React, { useState } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { authAPI } from '../../services/api';
import { getErrorMessage } from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

/** Settings → Profile: delete the login and every business this user owns, for good. */
export const DeleteAccount = () => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [deleting, setDeleting] = useState(false);
  const owner = user?.role === 'owner';

  const reset = () => { setOpen(false); setPassword(''); setConfirmation(''); };
  const submit = async (event) => {
    event.preventDefault();
    setDeleting(true);
    try {
      await authAPI.deleteAccount({ password, confirmation });
      toast.success('Your account has been deleted');
      await logout();
      window.location.assign('/');
    } catch (error) {
      toast.error(getErrorMessage(error) || 'Could not delete the account');
      setDeleting(false);
    }
  };

  return (
    <section className="mt-10 rounded-xl border border-rose-200 p-6">
      <h3 className="text-base font-bold text-rose-700">Delete account</h3>
      <p className="mt-2 text-sm text-slate-600">
        {owner
          ? 'This deletes your login and every business you own, with all their invoices, items, customers, suppliers, payments and reports. Staff logins of those businesses are removed too. This is immediate and cannot be undone. Download any reports you need first.'
          : 'This deletes your login. The business you work for keeps the records you entered.'}
      </p>
      {!open ? (
        <Button type="button" variant="outline" className="mt-4 gap-2 border-rose-300 text-rose-700 hover:bg-rose-50" onClick={() => setOpen(true)}>
          <Trash2 className="h-4 w-4" /> Delete my account
        </Button>
      ) : (
        <form onSubmit={submit} className="mt-4 max-w-sm space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="delete-password">Your password</Label>
            <Input id="delete-password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="delete-confirm">Type DELETE to confirm</Label>
            <Input id="delete-confirm" autoComplete="off" required value={confirmation} onChange={(e) => setConfirmation(e.target.value)} />
          </div>
          <div className="flex flex-wrap gap-3">
            <Button type="submit" className="gap-2 bg-rose-600 hover:bg-rose-700" disabled={deleting || !password || confirmation !== 'DELETE'}>
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Delete permanently
            </Button>
            <Button type="button" variant="outline" onClick={reset} disabled={deleting}>Cancel</Button>
          </div>
        </form>
      )}
    </section>
  );
};

export default DeleteAccount;
