import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';

/**
 * Shown whenever the backend refuses an action because of the plan (403 with upgradeRequired).
 * Limits carry { limit, used } and show how much of this month's allowance is used.
 */
export const UpgradeDialog = () => {
  const [detail, setDetail] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const show = (e) => setDetail(e.detail || {});
    window.addEventListener('UPGRADE_REQUIRED', show);
    return () => window.removeEventListener('UPGRADE_REQUIRED', show);
  }, []);

  if (!detail) return null;
  const isLimit = detail.code === 'QUOTA_EXCEEDED' && Number.isFinite(detail.limit);
  const message = detail.message || detail.error || 'This feature is not included in your current plan.';
  const close = () => setDetail(null);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200" role="dialog" aria-modal="true" aria-labelledby="upgrade-title">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-indigo-100 text-center space-y-5">
        <div className="w-16 h-16 bg-amber-500/10 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
          <Lock className="w-7 h-7" />
        </div>
        <div className="space-y-2">
          <h3 id="upgrade-title" className="text-xl font-bold text-slate-900">{isLimit ? 'Plan limit reached' : 'Upgrade to unlock'}</h3>
          <p className="text-sm text-slate-600 font-medium leading-relaxed">{message}</p>
        </div>
        {isLimit && (
          <div className="space-y-1.5 text-left">
            <div className="flex justify-between text-xs font-semibold text-slate-500">
              <span>Used</span><span>{detail.used ?? detail.limit} of {detail.limit}</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden"><div className="h-full w-full bg-amber-500" /></div>
          </div>
        )}
        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <button onClick={close} className="w-full sm:w-1/2 py-3 px-4 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors">
            Not now
          </button>
          <button onClick={() => { close(); navigate('/subscription'); }} className="w-full sm:w-1/2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all">
            View plans
          </button>
        </div>
      </div>
    </div>
  );
};
