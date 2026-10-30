import React, { useEffect, useState } from 'react';
import { companyAPI } from '../services/api';
import { Label } from './ui/label';

/**
 * Which godown the stock goes in or out of. Hidden for a business with one godown: the
 * backend then uses the default godown.
 */
export const GodownSelect = ({ value, onChange, label = 'Godown', className = 'space-y-2' }) => {
  const [godowns, setGodowns] = useState([]);

  useEffect(() => {
    let cancelled = false;
    companyAPI.getGodowns().then((res) => { if (!cancelled) setGodowns(res.data || []); }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  if (godowns.length < 2) return null;
  const selected = value || godowns.find((g) => g.is_default)?.id || '';
  return (
    <div className={className}>
      <Label htmlFor="godown-select">{label}</Label>
      <select
        id="godown-select"
        value={selected}
        onChange={(e) => onChange(e.target.value)}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {godowns.map((g) => <option key={g.id} value={g.id}>{g.name}{g.is_default ? ' (default)' : ''}</option>)}
      </select>
    </div>
  );
};
