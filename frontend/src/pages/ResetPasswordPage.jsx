import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { InputGroup } from '../components/ui/input-group';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Building2, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { authAPI } from '../services/api';
import { getErrorMessage } from '../config/api';

export const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    // Basic complexity check
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.resetPassword(token, { password: formData.password });
      toast.success(response.data.message || 'Password reset successfully!');
      setIsSuccess(true);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to reset password. Token may be expired.'));
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
              <CardTitle className="font-heading text-2xl">Create New Password</CardTitle>
              <CardDescription>
                Please enter and confirm your new password below.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              {!isSuccess ? (
                <form onSubmit={handleSubmit} className="space-y-5">
                  
                  <div className="form-field">
                    <Label htmlFor="password" className="form-label">New Password</Label>
                    <InputGroup
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      leftIcon={<Lock className="w-4 h-4" />}
                      rightElement={
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      }
                      required
                    />
                    <p className="text-xs text-slate-500 mt-2">Must be at least 8 characters long</p>
                  </div>

                  <div className="form-field">
                    <Label htmlFor="confirmPassword" className="form-label">Confirm Password</Label>
                    <InputGroup
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      leftIcon={<Lock className="w-4 h-4" />}
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full btn-primary h-11 mt-2 flex items-center justify-center gap-2"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : 'Reset Password'}
                  </Button>
                </form>
              ) : (
                <div className="text-center p-4">
                  <p className="text-slate-600 mb-6">Your password has been successfully reset. You can now use your new password to log in.</p>
                  <Button 
                    className="w-full btn-primary h-11"
                    onClick={() => navigate('/login')}
                  >
                    Proceed to Login
                  </Button>
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
            Secure Password Recovery
          </h2>
          <p className="text-slate-300 text-lg">
            You're almost there! Create a strong password to protect your account.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
