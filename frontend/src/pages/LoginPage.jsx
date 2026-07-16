import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { InputGroup } from '../components/ui/input-group';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Building2, Mail, Lock, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { getErrorMessage, IS_NATIVE } from '../config/api';
import { Checkbox } from '../components/ui/checkbox';
import { ScrollArea } from '../components/ui/scroll-area';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: localStorage.getItem('remembered_email') || '',
    password: localStorage.getItem('remembered_password') || '',
    rememberMe: !!localStorage.getItem('remembered_email')
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(formData.email, formData.password);

      // Save credentials if Remember Me is checked
      if (formData.rememberMe) {
        localStorage.setItem('remembered_email', formData.email);
        localStorage.setItem('remembered_password', formData.password); // Note: In production, consider a token instead
      } else {
        localStorage.removeItem('remembered_email');
        localStorage.removeItem('remembered_password');
      }

      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 overflow-hidden">
      {/* Mobile Header - Only visible on small screens */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b sticky top-0 z-10 pt-safe">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-600 rounded flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span className="font-heading font-bold text-xl text-slate-900">Bill Easy</span>
        </Link>
      </div>

      {/* Left side - Form Section */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <ScrollArea className="flex-1 w-full">
          <div className="flex items-center justify-center min-h-[calc(100vh-64px)] lg:min-h-screen p-4 sm:p-8 lg:p-12">
            <div className="w-full max-w-md animate-fade-in">
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
                  <CardTitle className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">Welcome Back</CardTitle>
                  <CardDescription className="text-slate-500 mt-1.5 text-base">
                    Enter your credentials to manage your business
                  </CardDescription>
                </CardHeader>

                <CardContent className="px-5 pb-8 sm:px-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-semibold text-slate-700">Email Address</Label>
                      <InputGroup
                        id="email"
                        type="email"
                        autoComplete="email"
                        placeholder="name@company.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        leftIcon={<Mail className="w-4 h-4" />}
                        required
                        className="h-12 border-slate-200 focus-within:border-emerald-600 focus-within:ring-emerald-100"
                        data-testid="login-email-input"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center mb-1">
                        <Label htmlFor="password" className="text-sm font-semibold text-slate-700 mb-0">Password</Label>
                        <Link to="/forgot-password" className="text-xs sm:text-sm text-emerald-600 hover:text-emerald-700 hover:underline font-semibold">
                          Forgot Password?
                        </Link>
                      </div>
                      <InputGroup
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        leftIcon={<Lock className="w-4 h-4" />}
                        rightElement={
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-slate-400 hover:text-slate-600 transition-colors p-2"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        }
                        required
                        className="h-12 border-slate-200 focus-within:border-emerald-600 focus-within:ring-emerald-100"
                        data-testid="login-password-input"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="remember"
                          checked={formData.rememberMe}
                          onCheckedChange={(checked) => setFormData({ ...formData, rememberMe: checked })}
                          className="border-slate-300 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                        />
                        <label
                          htmlFor="remember"
                          className="text-sm text-slate-600 font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          Remember me
                        </label>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12 rounded-lg text-base font-bold shadow-lg shadow-emerald-100 transition-all active:scale-[0.98]"
                      disabled={loading}
                      data-testid="login-submit-btn"
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Authenticating...</span>
                        </div>
                      ) : (
                        <span>Sign In</span>
                      )}
                    </Button>
                  </form>

                  <div className="mt-8 text-center">
                    <p className="text-slate-500 text-sm">
                      Don't have an account?{' '}
                      <Link to="/register" className="text-emerald-600 hover:text-emerald-700 font-bold hover:underline ml-1" data-testid="register-link">
                        Get Started Free
                      </Link>
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Mobile Footer Spacing */}
              <div className="h-8 lg:hidden" />
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Right side - Branding (Desktop only) */}
      <div className="hidden lg:flex flex-1 hero-gradient items-center justify-center p-12 relative overflow-hidden">
        {/* Background Patterns */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-500 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-lg relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-6">
            <CheckCircle2 className="w-4 h-4" />
            <span>Trusted by 10,000+ businesses</span>
          </div>

          <h2 className="font-heading text-5xl font-bold text-white mb-6 leading-tight">
            The simplest way to <span className="text-emerald-400">manage</span> your business
          </h2>
          <p className="text-slate-400 text-xl leading-relaxed mb-10">
            Professional invoicing, inventory management, and financial tracking designed for Indian entrepreneurs.
          </p>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <p className="text-3xl font-bold text-white font-mono mb-1">10K+</p>
              <p className="text-slate-400 font-medium">Active Users</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <p className="text-3xl font-bold text-white font-mono mb-1">99.9%</p>
              <p className="text-slate-400 font-medium">Uptime Guarantee</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
