import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { InputGroup } from '../components/ui/input-group';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Building2, Mail, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { authAPI } from '../services/api';
import { getErrorMessage } from '../config/api';

export const ForgotPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.forgotPassword({ email });
      toast.success(response.data.message || 'Reset link sent!');
      setIsSent(true);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to send reset link'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-6 sm:mb-8">
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="font-heading font-bold text-2xl text-slate-900">Bill Easy</span>
          </Link>

          <Card className="glass-card p-2 sm:p-4">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="font-heading text-2xl">Reset Password</CardTitle>
              <CardDescription>
                {isSent 
                  ? "Check your email for the reset link."
                  : "Enter your email address and we'll send you a link to reset your password."}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              {!isSent ? (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="form-field">
                    <Label htmlFor="email" className="form-label">Email</Label>
                    <InputGroup
                      id="email"
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      leftIcon={<Mail className="w-4 h-4" />}
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full btn-primary h-11 flex items-center justify-center gap-2"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : 'Send Reset Link'}
                  </Button>
                </form>
              ) : (
                <div className="text-center p-4">
                  <p className="text-slate-600 mb-6">If an account exists for <b>{email}</b>, you will receive a reset link shortly.</p>
                  <Button 
                    variant="outline" 
                    className="w-full h-11"
                    onClick={() => setIsSent(false)}
                  >
                    Try another email
                  </Button>
                </div>
              )}

              <div className="mt-6 text-center">
                <Link to="/login" className="text-sm text-slate-600 hover:text-slate-900 inline-flex items-center gap-2 font-medium transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                  Back to sign in
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right side - Branding */}
      <div className="hidden lg:flex flex-1 hero-gradient items-center justify-center p-12">
        <div className="max-w-md text-center">
          <h2 className="font-heading text-3xl font-bold text-white mb-4">
            Secure Password Recovery
          </h2>
          <p className="text-slate-300 text-lg">
            Regain access to your Bill Easy account quickly and securely.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
