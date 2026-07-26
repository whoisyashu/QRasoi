import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { QrCode, Lock, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginOwner, isLoading, error } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const registeredMessage = (location.state as any)?.registeredMessage;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    const success = await loginOwner(email, password);
    if (success) {
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF8] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
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
            Restaurant Owner Login
          </h1>
          <p className="text-sm text-slate-500">
            Access your restaurant dashboard, orders & digital menu.
          </p>
        </div>

        <Card className="p-6 md:p-8 space-y-6">
          {registeredMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{registeredMessage}</span>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-xs space-y-2">
              <div className="flex items-start gap-2 font-bold text-sm text-red-700">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>

              {(error.toLowerCase().includes('admin verification') || error.toLowerCase().includes('suspended') || error.toLowerCase().includes('expired')) && (
                <div className="pt-2 border-t border-red-200/60 space-y-1 font-semibold text-slate-800">
                  <p className="font-extrabold text-slate-900">Contact QRasoi Administrator for Activation:</p>
                  <p className="flex items-center justify-between">
                    <span>WhatsApp Support:</span>
                    <a href="https://wa.me/919368967944" target="_blank" rel="noreferrer" className="text-orange-600 font-bold hover:underline">
                      +91 9368967944
                    </a>
                  </p>
                  <p className="flex items-center justify-between">
                    <span>Email Helpdesk:</span>
                    <a href="mailto:whoisyashu04@gmail.com" className="text-orange-600 font-bold hover:underline">
                      whoisyashu04@gmail.com
                    </a>
                  </p>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Owner Email
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <Input
                  type="email"
                  placeholder="owner@restaurant.com"
                  className="pl-10 text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs font-semibold text-orange-600 hover:text-orange-700">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="pl-10 text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-orange-600/25 transition-all mt-2"
            >
              {isLoading ? 'Authenticating...' : 'Sign In to Dashboard'}
            </Button>
          </form>

          <div className="text-center text-xs text-slate-500 border-t border-slate-100 pt-4 space-y-2">
            <p>
              Don't have a restaurant account?{' '}
              <Link to="/register" className="font-bold text-orange-600 hover:underline">
                Register Restaurant
              </Link>
            </p>
            <p className="pt-1 text-slate-400">
              Are you a Chef?{' '}
              <Link to="/chef/login" className="font-semibold text-amber-600 hover:underline">
                Chef Login
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
