import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, ShieldCheck, RefreshCw, Eye, EyeOff, Lock } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { apiClient } from '../services/api';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();

  // Wizard Stage: 1 = Email, 2 = Verify 6-Digit OTP, 3 = New Password
  const [stage, setStage] = useState<1 | 2 | 3>(1);

  // Form State
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status & Feedback State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Countdown Timer State (10 minutes = 600s)
  const [timeLeft, setTimeLeft] = useState(600);
  const [resendCooldown, setResendCooldown] = useState(30);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    let timer: any;
    if (stage === 2 && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [stage, timeLeft]);

  useEffect(() => {
    let timer: any;
    if (stage === 2 && resendCooldown > 0) {
      timer = setInterval(() => setResendCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [stage, resendCooldown]);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Step 1: Request 6-Digit Email OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await apiClient.post<{ success: boolean; message: string }>(
        '/auth/forgot-password/request-otp',
        { email: email.trim() }
      );

      setIsLoading(false);
      setStage(2);
      setTimeLeft(600);
      setResendCooldown(30);
      setSuccessMsg(res.data.message);
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.response?.data?.error || 'Failed to dispatch OTP email. Please check your address.');
    }
  };

  // Step 2: Verify 6-Digit OTP Code
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim() || otp.length < 6) {
      setError('Please enter the full 6-digit OTP code sent to your email.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await apiClient.post<{ success: boolean; message: string; resetToken: string }>(
        '/auth/forgot-password/verify-otp',
        { email: email.trim(), otp: otp.trim() }
      );

      setIsLoading(false);
      setResetToken(res.data.resetToken);
      setStage(3);
      setSuccessMsg('OTP verified successfully! Please set your new password below.');
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.response?.data?.error || 'Invalid or expired OTP code.');
    }
  };

  // Resend OTP Handler
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient.post<{ success: boolean; message: string }>(
        '/auth/forgot-password/request-otp',
        { email: email.trim() }
      );
      setIsLoading(false);
      setTimeLeft(600);
      setResendCooldown(30);
      setSuccessMsg(res.data.message || 'A new 6-digit OTP code has been dispatched to your email.');
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.response?.data?.error || 'Failed to resend OTP.');
    }
  };

  // Step 3: Save New Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await apiClient.post<{ success: boolean; message: string }>(
        '/auth/forgot-password/reset-password',
        { email: email.trim(), resetToken, newPassword }
      );

      setIsLoading(false);
      setIsCompleted(true);
      setSuccessMsg(res.data.message);

      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 3500);
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.response?.data?.error || 'Failed to reset password. Please try requesting a new OTP.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF8] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-3 mb-2">
            <img
              src="/logo.png"
              alt="QRasoi Logo"
              className="h-14 w-auto object-contain"
            />
            <span className="font-heading font-extrabold text-2xl text-slate-900 tracking-tight">
              QRasoi
            </span>
          </Link>
          <h1 className="text-2xl font-heading font-extrabold text-slate-900">
            {stage === 1 && 'Reset Account Password'}
            {stage === 2 && 'Enter Email OTP'}
            {stage === 3 && !isCompleted && 'Create New Password'}
            {isCompleted && 'Password Reset Complete!'}
          </h1>
          <p className="text-sm text-slate-500">
            {stage === 1 && 'Enter your registered email address to receive a 6-digit OTP verification code.'}
            {stage === 2 && `Enter the 6-digit code sent to ${email}`}
            {stage === 3 && !isCompleted && 'Choose a secure new password for your restaurant owner account.'}
            {isCompleted && 'Your password has been successfully updated.'}
          </p>
        </div>

        {/* Wizard Steps Progress Indicator */}
        <div className="flex items-center justify-center gap-2">
          <div className={`h-2 rounded-full transition-all ${stage >= 1 ? 'w-8 bg-orange-600' : 'w-2 bg-slate-200'}`} />
          <div className={`h-2 rounded-full transition-all ${stage >= 2 ? 'w-8 bg-orange-600' : 'w-2 bg-slate-200'}`} />
          <div className={`h-2 rounded-full transition-all ${stage >= 3 ? 'w-8 bg-orange-600' : 'w-2 bg-slate-200'}`} />
        </div>

        <Card className="p-6 md:p-8 space-y-6 shadow-sm border border-slate-200">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-semibold">
              {error}
            </div>
          )}

          {successMsg && !isCompleted && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 text-xs font-semibold">
              {successMsg}
            </div>
          )}

          {/* STAGE 1: Request Email OTP */}
          {stage === 1 && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Registered Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <Input
                    type="email"
                    placeholder="owner@restaurant.com"
                    className="pl-10 text-sm h-12"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-orange-600/25 transition-all text-xs"
              >
                {isLoading ? 'Sending Verification OTP...' : 'Send 6-Digit Email OTP →'}
              </Button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
                </Link>
              </div>
            </form>
          )}

          {/* STAGE 2: Enter 6-Digit Email OTP */}
          {stage === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    6-Digit Verification OTP *
                  </label>
                  <span className="text-xs font-mono font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
                    Expires: {formatTimer(timeLeft)}
                  </span>
                </div>
                <div className="relative">
                  <ShieldCheck className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="e.g. 482915"
                    className="w-full h-12 pl-10 pr-4 text-center tracking-[0.4em] font-mono font-bold text-lg bg-white border border-slate-200 rounded-xl outline-none focus:border-orange-500 text-slate-900"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading || otp.length < 6}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-orange-600/25 transition-all text-xs"
              >
                {isLoading ? 'Verifying OTP...' : 'Verify OTP Code →'}
              </Button>

              <div className="flex items-center justify-between pt-2 text-xs">
                <button
                  type="button"
                  onClick={() => setStage(1)}
                  className="text-slate-500 hover:text-slate-700 font-medium cursor-pointer"
                >
                  ← Change Email
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || isLoading}
                  className={`font-semibold flex items-center gap-1 cursor-pointer ${
                    resendCooldown > 0 ? 'text-slate-400 cursor-not-allowed' : 'text-orange-600 hover:underline'
                  }`}
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>{resendCooldown > 0 ? `Resend OTP (${resendCooldown}s)` : 'Resend OTP'}</span>
                </button>
              </div>
            </form>
          )}

          {/* STAGE 3: Set New Password */}
          {stage === 3 && !isCompleted && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  New Password *
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="At least 6 characters"
                    className="pl-10 pr-10 text-sm h-12"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Re-enter new password"
                    className="pl-10 text-sm h-12"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !newPassword || !confirmPassword}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-orange-600/25 transition-all text-xs"
              >
                {isLoading ? 'Updating Password...' : 'Save New Password & Login'}
              </Button>
            </form>
          )}

          {/* STAGE 3 SUCCESS */}
          {isCompleted && (
            <div className="text-center space-y-4 py-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-heading font-extrabold text-lg text-slate-900">Password Reset Complete!</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Your password has been successfully updated. Redirecting you to login screen in a moment...
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 px-5 py-2.5 rounded-xl shadow-md transition-all mt-2"
              >
                Go to Login Now →
              </Link>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
