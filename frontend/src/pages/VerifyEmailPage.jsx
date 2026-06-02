import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Building2, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { authAPI } from '../services/api';

export const VerifyEmailPage = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');
  const hasAttempted = useRef(false);

  useEffect(() => {
    const verifyToken = async () => {
      if (hasAttempted.current) return;
      hasAttempted.current = true;
      
      try {
        const response = await authAPI.verifyEmail(token);
        setStatus('success');
        setMessage(response.data.message || 'Your email has been successfully verified.');
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.error || 'Verification failed. The link may be invalid or expired.');
      }
    };

    if (token) {
      verifyToken();
    }
  }, [token]);

  return (
    <div className="min-h-screen flex">
      {/* Left side - Status Card */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-6 sm:mb-8 justify-center">
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="font-heading font-bold text-2xl text-slate-900">Bill Easy</span>
          </Link>

          <Card className="glass-card p-2 sm:p-4 text-center">
            <CardHeader className="px-4 sm:px-6">
              <div className="flex justify-center mb-4">
                {status === 'verifying' && <Loader2 className="w-16 h-16 text-emerald-600 animate-spin" />}
                {status === 'success' && <CheckCircle2 className="w-16 h-16 text-emerald-600" />}
                {status === 'error' && <XCircle className="w-16 h-16 text-rose-600" />}
              </div>
              <CardTitle className="font-heading text-2xl">
                {status === 'verifying' && 'Verifying Email...'}
                {status === 'success' && 'Email Verified!'}
                {status === 'error' && 'Verification Failed'}
              </CardTitle>
              <CardDescription className="text-base mt-2">
                {status === 'verifying' && 'Please wait while we verify your email address.'}
                {status !== 'verifying' && message}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="px-4 sm:px-6">
              {status !== 'verifying' && (
                <div className="mt-4">
                  <Link to="/login">
                    <Button className="w-full btn-primary h-11">
                      Proceed to Login
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right side - Branding */}
      <div className="hidden lg:flex flex-1 hero-gradient items-center justify-center p-12">
        <div className="max-w-md text-center">
          <h2 className="font-heading text-3xl font-bold text-white mb-4">
            Secure & Verified
          </h2>
          <p className="text-slate-300 text-lg">
            Verifying your email keeps your account safe and ensures you never lose access.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
