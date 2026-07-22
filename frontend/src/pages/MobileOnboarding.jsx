import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import {
  Building2, ShieldCheck, MapPin, Smartphone,
  ArrowRight, CheckCircle2, Lock, ChevronRight
} from 'lucide-react';
import { cn } from '../lib/utils';
import { IS_NATIVE } from '../config/api';

const MobileOnboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [permissions, setPermissions] = useState({
    storage: false,
    location: false,
    phone: false
  });

  // Redirect if not native (this is a mobile-only experience)
  useEffect(() => {
    if (!IS_NATIVE) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const handleGrantPermission = (type) => {
    // In a real app, this would trigger Capacitor.Permissions
    setPermissions(prev => ({ ...prev, [type]: true }));
  };

  const allPermissionsGranted = Object.values(permissions).every(Boolean);

  const steps = [
    {
      title: "Welcome to Bill Easy",
      description: "The complete billing and inventory solution for your business.",
      icon: <Building2 className="w-12 h-12 text-white" />,
      color: "from-emerald-500 to-teal-600"
    },
    {
      title: "Secure & Reliable",
      description: "Your data is encrypted and backed up automatically in the cloud.",
      icon: <ShieldCheck className="w-12 h-12 text-white" />,
      color: "from-blue-500 to-indigo-600"
    },
    {
      title: "Required Permissions",
      description: "We need a few permissions to provide the best experience.",
      icon: <Lock className="w-12 h-12 text-white" />,
      color: "from-purple-500 to-pink-600"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col overflow-hidden">
      {/* Background patterns */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-emerald-400 rounded-full blur-[80px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-blue-400 rounded-full blur-[80px]" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        {step < 3 ? (
          /* Introduction Steps */
          <div className="w-full max-w-sm text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className={cn(
              "w-24 h-24 mx-auto rounded-3xl flex items-center justify-center shadow-2xl mb-8 transition-all duration-500 bg-gradient-to-br",
              steps[step-1].color
            )}>
              {steps[step-1].icon}
            </div>

            <h1 className="font-heading text-3xl font-bold text-slate-900 mb-4 leading-tight">
              {steps[step-1].title}
            </h1>
            <p className="text-slate-600 text-lg mb-12 px-4">
              {steps[step-1].description}
            </p>

            <div className="flex justify-center gap-2 mb-12">
              {[1, 2, 3].map(i => (
                <div key={i} className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  step === i ? "w-8 bg-emerald-600" : "w-2 bg-slate-200"
                )} />
              ))}
            </div>

            <Button
              size="lg"
              className="w-full bg-slate-900 hover:bg-slate-800 h-14 rounded-2xl text-lg font-bold flex items-center justify-center gap-2 shadow-xl shadow-slate-200"
              onClick={() => setStep(step + 1)}
            >
              Continue
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        ) : (
          /* Permission & Auth Step */
          <div className="w-full max-w-sm animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="bg-white rounded-[32px] p-8 shadow-2xl shadow-slate-200 border border-slate-100 mb-8">
              <h2 className="font-heading text-2xl font-bold text-slate-900 mb-2">Almost there!</h2>
              <p className="text-slate-500 mb-8">Grant these permissions to start using the app.</p>

              <div className="space-y-4 mb-8">
                {[
                  { id: 'storage', label: 'Storage Access', desc: 'To save & export PDF invoices', icon: <Smartphone className="w-5 h-5" /> },
                  { id: 'location', label: 'Location Services', desc: 'For compliant E-Way bills', icon: <MapPin className="w-5 h-5" /> },
                  { id: 'phone', label: 'Phone Status', desc: 'To verify your account security', icon: <Smartphone className="w-5 h-5" /> }
                ].map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleGrantPermission(p.id)}
                    className={cn(
                      "w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-300",
                      permissions[p.id]
                        ? "bg-emerald-50 border-emerald-100 text-emerald-900"
                        : "bg-slate-50 border-slate-100 text-slate-700 hover:border-slate-200"
                    )}
                  >
                    <div className="flex items-center gap-4 text-left">
                      <div className={cn(
                        "p-2 rounded-lg",
                        permissions[p.id] ? "bg-emerald-200" : "bg-slate-200"
                      )}>
                        {p.icon}
                      </div>
                      <div>
                        <p className="font-bold text-sm leading-none mb-1">{p.label}</p>
                        <p className="text-xs opacity-70">{p.desc}</p>
                      </div>
                    </div>
                    {permissions[p.id] ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                    )}
                  </button>
                ))}
              </div>

              {!allPermissionsGranted ? (
                <p className="text-xs text-center text-slate-400">
                  Tap each item above to grant permissions
                </p>
              ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700 h-14 rounded-2xl text-lg font-bold shadow-lg shadow-emerald-100"
                    onClick={() => navigate('/register')}
                  >
                    New User? Register
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full h-14 rounded-2xl text-slate-600 font-bold border-2 border-slate-100 hover:bg-slate-50"
                    onClick={() => navigate('/login')}
                  >
                    Existing User? Login
                  </Button>
                </div>
              )}
            </div>

            <div className="text-center">
              <p className="text-xs text-slate-400">
                By continuing, you agree to our Terms and Privacy Policy.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Brand Watermark */}
      <div className="p-8 mt-auto flex justify-center opacity-30 grayscale pointer-events-none">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          <span className="font-heading font-bold text-lg">Bill Easy</span>
        </div>
      </div>
    </div>
  );
};

export default MobileOnboarding;
