import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { InputGroup } from '../components/ui/input-group';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Building2, Mail, Lock, User, Phone, Eye, EyeOff, MapPin, Hash, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { getErrorMessage, IS_NATIVE } from '../config/api';
import { cn } from '../lib/utils';
import { ScrollArea } from '../components/ui/scroll-area';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    gstNumber: '',
    address: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await register(formData);
      toast.success('Account created successfully!');
      navigate('/settings?firstTime=true');
    } catch (error) {
      const message = getErrorMessage(error, 'Registration failed');
      toast.error(message);
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 overflow-hidden">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b sticky top-0 z-10 pt-safe">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-600 rounded flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span className="font-heading font-bold text-xl text-slate-900">Bill Easy</span>
        </Link>
      </div>

      {/* Left side - Branding (Desktop Only) */}
      <div className="hidden lg:flex flex-1 hero-gradient items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-500 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-md text-center relative z-10">
          <h2 className="font-heading text-4xl font-bold text-white mb-6">
            Start Your Business Journey
          </h2>
          <p className="text-slate-400 text-lg mb-10">
            Join thousands of businesses using Bill Easy to streamline their billing and inventory management.
          </p>
          
          <div className="space-y-4 text-left">
            {[
              { t: "Create Your Account", d: "Enter your business details" },
              { t: "Set Up Your Products", d: "Add your inventory items" },
              { t: "Start Creating Invoices", d: "Generate professional bills instantly" }
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-white font-bold">{i+1}</span>
                </div>
                <div>
                  <p className="font-semibold text-white">{step.t}</p>
                  <p className="text-sm text-slate-400">{step.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <ScrollArea className="flex-1 w-full">
          <div className="flex items-center justify-center min-h-[calc(100vh-64px)] lg:min-h-screen p-4 sm:p-8 lg:p-12">
            <div className="w-full max-w-2xl animate-fade-in">
              <Link to="/" className="hidden lg:flex items-center gap-2 mb-8">
                <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-200">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <span className="font-heading font-bold text-2xl text-slate-900">Bill Easy</span>
              </Link>

              {/* Glassmorphism Card */}
              <Card className={cn(
                "border-none shadow-xl sm:shadow-2xl overflow-hidden",
                IS_NATIVE ? "bg-white" : "glass-card"
              )}>
                <div className="h-1.5 w-full bg-emerald-600" />
                <CardHeader className="px-5 pt-7 pb-4 sm:px-8">
                  <CardTitle className="font-heading text-2xl sm:text-3xl font-bold">Create account</CardTitle>
                  <CardDescription className="text-slate-500 mt-1">Start your 14-day free trial today</CardDescription>
                </CardHeader>

                <CardContent className="px-5 pb-8 sm:px-8">
                  <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">

                      <div className="sm:col-span-2 space-y-2">
                        <Label htmlFor="companyName" className="text-sm font-semibold text-slate-700">
                          Company Name <span className="text-red-500">*</span>
                        </Label>
                        <InputGroup
                          id="companyName"
                          placeholder="Your Company Pvt Ltd"
                          value={formData.companyName}
                          onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                          leftIcon={<Building2 className="w-4 h-4" />}
                          required
                          className="h-11 border-slate-200 focus-within:border-emerald-600 focus-within:ring-emerald-100"
                          data-testid="register-company-input"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-semibold text-slate-700">
                          Your Name <span className="text-red-500">*</span>
                        </Label>
                        <InputGroup
                          id="name"
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          leftIcon={<User className="w-4 h-4" />}
                          required
                          className="h-11 border-slate-200 focus-within:border-emerald-600 focus-within:ring-emerald-100"
                          data-testid="register-name-input"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-semibold text-slate-700">
                          Email <span className="text-red-500">*</span>
                        </Label>
                        <InputGroup
                          id="email"
                          type="email"
                          placeholder="you@company.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          leftIcon={<Mail className="w-4 h-4" />}
                          required
                          className="h-11 border-slate-200 focus-within:border-emerald-600 focus-within:ring-emerald-100"
                          data-testid="register-email-input"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm font-semibold text-slate-700">Phone</Label>
                        <InputGroup
                          id="phone"
                          type="tel"
                          placeholder="9876543210"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          leftIcon={<Phone className="w-4 h-4" />}
                          className="h-11 border-slate-200 focus-within:border-emerald-600 focus-within:ring-emerald-100"
                          data-testid="register-phone-input"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="gstNumber" className="text-sm font-semibold text-slate-700">
                          GST Number <span className="text-slate-400 font-normal ml-1">(Optional)</span>
                        </Label>
                        <InputGroup
                          id="gstNumber"
                          placeholder="22AAAAA0000A1Z5"
                          value={formData.gstNumber}
                          onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                          leftIcon={<Hash className="w-4 h-4" />}
                          className="h-11 border-slate-200 focus-within:border-emerald-600 focus-within:ring-emerald-100"
                          data-testid="register-gst-input"
                        />
                      </div>

                      <div className="sm:col-span-2 space-y-2">
                        <Label htmlFor="password" className="text-sm font-semibold text-slate-700">Password <span className="text-red-500">*</span></Label>
                        <InputGroup
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Min 6 characters"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          leftIcon={<Lock className="w-4 h-4" />}
                          rightElement={
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="text-slate-400 hover:text-slate-600 transition-colors p-2"
                              aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          }
                          required
                          minLength={6}
                          className="h-11 border-slate-200 focus-within:border-emerald-600 focus-within:ring-emerald-100"
                          data-testid="register-password-input"
                        />
                      </div>

                      <div className="sm:col-span-2 space-y-2">
                        <Label htmlFor="address" className="text-sm font-semibold text-slate-700">Business Address</Label>
                        <InputGroup
                          id="address"
                          placeholder="123 Business Street, City, State - PIN"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          leftIcon={<MapPin className="w-4 h-4" />}
                          className="h-11 border-slate-200 focus-within:border-emerald-600 focus-within:ring-emerald-100"
                          data-testid="register-address-input"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12 rounded-lg text-base font-bold shadow-lg shadow-emerald-100 mt-8 transition-all active:scale-[0.98]"
                      disabled={loading}
                      data-testid="register-submit-btn"
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Creating Account...</span>
                        </div>
                      ) : (
                        <span>Create Account</span>
                      )}
                    </Button>
                  </form>

                  <div className="mt-8 text-center">
                    <p className="text-slate-500 text-sm">
                      Already have an account?{' '}
                      <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-bold hover:underline ml-1" data-testid="login-link">
                        Sign in
                      </Link>
                    </p>
                  </div>
                </CardContent>
              </Card>
              <div className="h-8 lg:hidden" />
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default RegisterPage;
