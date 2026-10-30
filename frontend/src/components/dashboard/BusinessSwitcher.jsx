import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Check, ChevronsUpDown, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { cn } from '../../lib/utils';

/** Switch between the owner's businesses, or add one while the plan allows it. */
export const BusinessSwitcher = () => {
  const { company, companies = [], switchCompany, maxBusinesses } = useAuth();
  const [switching, setSwitching] = useState(null);
  const navigate = useNavigate();
  const owned = companies.filter((c) => c.role === 'owner').length;
  const atLimit = maxBusinesses !== undefined && owned >= maxBusinesses;

  const choose = async (id) => {
    if (id === company?.id) return;
    setSwitching(id);
    try {
      await switchCompany(id);
      // Every screen reloads for the newly selected business.
      window.location.assign('/dashboard');
    } catch {
      toast.error('Could not switch business. Please try again.');
      setSwitching(null);
    }
  };

  const addBusiness = () => {
    if (atLimit) {
      window.dispatchEvent(new CustomEvent('UPGRADE_REQUIRED', { detail: { code: 'QUOTA_EXCEEDED', limit: maxBusinesses, used: owned, error: `Your plan allows ${maxBusinesses} business${maxBusinesses === 1 ? '' : 'es'}. Upgrade to add another.` } }));
      return;
    }
    navigate('/settings/business/new');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="w-full flex items-center gap-3 rounded-xl p-1 -m-1 text-left hover:bg-slate-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500" aria-label="Switch business">
          <div className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-slate-900 text-sm truncate">{company?.name || 'Bill Easy'}</p>
            <p className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wider truncate">
              {companies.length > 1 ? `${companies.length} businesses` : 'Business'}
            </p>
          </div>
          <ChevronsUpDown className="w-4 h-4 text-slate-400" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64 p-2 rounded-2xl">
        <DropdownMenuLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Your businesses</DropdownMenuLabel>
        <div className="max-h-60 overflow-y-auto">
          {companies.map((c) => (
            <DropdownMenuItem key={c.id} onSelect={(e) => { e.preventDefault(); choose(c.id); }}
              className={cn('flex items-center gap-3 rounded-xl px-2 py-2 cursor-pointer', c.id === company?.id && 'bg-indigo-50 text-indigo-700 font-medium')}>
              <Building2 className="w-4 h-4 text-slate-400" />
              <span className="flex-1 truncate">{c.name}</span>
              {switching === c.id ? <Loader2 className="w-4 h-4 animate-spin" /> : c.id === company?.id && <Check className="w-4 h-4 text-indigo-600" />}
            </DropdownMenuItem>
          ))}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={addBusiness} className="flex items-center gap-3 rounded-xl px-2 py-2 cursor-pointer">
          <Plus className="w-4 h-4 text-slate-500" />
          <span className="flex-1">Add business</span>
          {maxBusinesses < 1000 && <span className="text-[11px] text-slate-400">{owned} of {maxBusinesses}</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
