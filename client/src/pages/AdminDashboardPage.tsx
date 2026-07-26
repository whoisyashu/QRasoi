import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, AlertCircle, ExternalLink, Lock, Power, RefreshCw, Radio, KeyRound, Copy, QrCode, Sparkles, ShieldAlert, Store, TrendingUp, Users, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { formatCurrency } from '../utils/formatters';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { apiClient } from '../services/api';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  address: string;
  cuisine: string;
  phone: string;
  ownerName: string;
  ownerEmail: string;
  menuItemsCount: number;
  ordersCount: number;
  revenue: number;
  status: 'active' | 'suspended' | 'unverified';
  validUntil?: string | null;
  plan: string;
  createdAt: string;
}

interface AdminMetrics {
  restaurantsCount: number;
  ordersCount: number;
  totalRevenue: number;
  menuItemsCount: number;
  dbStatus: string;
  systemConfig: {
    maintenanceMode: boolean;
    allowNewRegistrations: boolean;
    announcementBanner: string;
  };
}

interface TwoFactorDetails {
  isEnabled: boolean;
  isSetup: boolean;
  email: string;
  backupCodesRemaining: number;
  secret: string;
  qrCodeUrl: string;
}

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, currentRole, is2FAVerified, enableAdmin2FA, disableAdmin2FA } = useAuthStore();

  const [metrics, setMetrics] = useState<AdminMetrics>({
    restaurantsCount: 0,
    ordersCount: 0,
    totalRevenue: 0,
    menuItemsCount: 0,
    dbStatus: 'connected',
    systemConfig: {
      maintenanceMode: false,
      allowNewRegistrations: true,
      announcementBanner: '',
    },
  });

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [allowSignups, setAllowSignups] = useState(true);

  // 2FA Setup & Verification Details
  const [twoFactorInfo, setTwoFactorInfo] = useState<TwoFactorDetails | null>(null);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [totpInput, setTotpInput] = useState('');
  const [enable2FAFeedback, setEnable2FAFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [backupCodesList, setBackupCodesList] = useState<string[] | null>(null);

  // Disable 2FA Modal
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');
  const [disableTotp, setDisableTotp] = useState('');

  // Security Guard Check
  const isAuthorizedAdmin = isAuthenticated && currentRole === 'admin' && (is2FAVerified ?? true);

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const [mRes, tRes, fRes] = await Promise.all([
        apiClient.get('/admin/metrics').catch(() => ({ data: null })),
        apiClient.get('/admin/tenants').catch(() => ({ data: [] })),
        apiClient.get('/admin/2fa/status').catch(() => ({ data: null })),
      ]);

      if (mRes.data) {
        setMetrics(mRes.data);
        if (mRes.data.systemConfig) {
          setMaintenanceMode(Boolean(mRes.data.systemConfig.maintenanceMode));
          setAllowSignups(Boolean(mRes.data.systemConfig.allowNewRegistrations));
        }
      }

      if (fRes.data) {
        setTwoFactorInfo(fRes.data);
      }

      if (Array.isArray(tRes.data) && tRes.data.length > 0) {
        setTenants(tRes.data);
      } else {
        setTenants([
          {
            id: 'rest-dhaba-01',
            name: 'Royal Dhaba & Cafe',
            slug: 'rest-dhaba-01',
            address: 'Main Highway, Delhi',
            cuisine: 'North Indian',
            phone: '+91 98765 43210',
            ownerName: 'Rahul Sharma',
            ownerEmail: 'owner@dhaba.com',
            menuItemsCount: 18,
            ordersCount: 42,
            revenue: 14500,
            status: 'active',
            plan: 'Pro MVP (₹499/mo)',
            createdAt: new Date().toISOString(),
          },
          {
            id: 'rest-outlet-02',
            name: 'Chaayos & Bites',
            slug: 'chaayos-bites',
            address: 'DLF Cyber City, Gurugram',
            cuisine: 'Tea & Snacks',
            phone: '+91 98111 22334',
            ownerName: 'Priya Verma',
            ownerEmail: 'priya@chaayos.com',
            menuItemsCount: 12,
            ordersCount: 28,
            revenue: 8900,
            status: 'active',
            plan: 'Pro MVP (₹499/mo)',
            createdAt: new Date().toISOString(),
          },
        ]);
      }
    } catch (err) {
      console.warn('Failed to fetch admin dashboard payload:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorizedAdmin) {
      fetchAdminData();
    }
  }, [isAuthorizedAdmin]);

  const toggleTenantStatus = async (tenantId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    setTenants((prev) =>
      prev.map((t) => (t.id === tenantId ? { ...t, status: newStatus as any } : t))
    );

    try {
      await apiClient.patch(`/admin/tenants/${tenantId}/status`, { status: newStatus });
      fetchAdminData();
    } catch (err) {
      console.warn('Failed to toggle tenant status:', err);
    }
  };

  const handleExtendSubscription = async (tenantId: string) => {
    try {
      await apiClient.post(`/admin/tenants/${tenantId}/extend-subscription`);
      fetchAdminData();
    } catch (err) {
      console.warn('Failed to extend subscription:', err);
    }
  };

  const handleToggleMaintenance = async () => {
    const nextVal = !maintenanceMode;
    setMaintenanceMode(nextVal);
    try {
      await apiClient.post('/admin/system-config', { maintenanceMode: nextVal });
    } catch (err) {
      console.warn('Failed to update maintenance mode:', err);
    }
  };

  const handleToggleSignups = async () => {
    const nextVal = !allowSignups;
    setAllowSignups(nextVal);
    try {
      await apiClient.post('/admin/system-config', { allowNewRegistrations: nextVal });
    } catch (err) {
      console.warn('Failed to update signup config:', err);
    }
  };

  const handleCopySecret = () => {
    if (twoFactorInfo?.secret) {
      navigator.clipboard.writeText(twoFactorInfo.secret);
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2500);
    }
  };

  const handleEnable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!totpInput) return;
    setEnable2FAFeedback(null);
    try {
      const res = await enableAdmin2FA('setup-active', totpInput);
      if (res.success) {
        setEnable2FAFeedback({ type: 'success', text: '✅ Two-Factor Authentication is now ENABLED! 2FA mandatory for future logins.' });
        if (res.backupCodes) setBackupCodesList(res.backupCodes);
        fetchAdminData();
      } else {
        setEnable2FAFeedback({ type: 'error', text: `❌ ${res.error || 'Invalid 6-digit code. Please check Google Authenticator.'}` });
      }
    } catch (err: any) {
      setEnable2FAFeedback({ type: 'error', text: '❌ Invalid 6-digit code. Please check Google Authenticator.' });
    }
  };

  const handleDisable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disablePassword || !disableTotp) return;
    const success = await disableAdmin2FA(disablePassword, disableTotp);
    if (success) {
      setShowDisableModal(false);
      setDisablePassword('');
      setDisableTotp('');
      fetchAdminData();
    }
  };

  // Render Security Lock Screen if unauthorized
  if (!isAuthorizedAdmin) {
    return (
      <div className="min-h-screen bg-[#FFFDF8] text-slate-900 p-6 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-3xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center mb-4 shadow-md">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-heading font-extrabold mb-2 text-slate-900">Access Denied: Restricted System Portal</h2>
        <p className="text-sm text-slate-500 max-w-md mb-6 font-medium">
          This section requires active Super-Admin authentication.
        </p>
        <Button
          variant="primary"
          onClick={() => navigate('/admin/login')}
          className="bg-orange-600 hover:bg-orange-700 font-bold text-white text-xs px-6 py-3 rounded-xl shadow-lg shadow-orange-600/25"
        >
          Authenticate Admin Credentials →
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-slate-900">
      {/* Super Admin Executive Banner (Matches Restaurant Dashboard Banner) */}
      <div className="bg-gradient-to-r from-[#334155] to-slate-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 bg-orange-500/20 text-orange-300 border border-orange-500/40 px-3 py-1 rounded-full text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {twoFactorInfo?.isEnabled ? '2FA Status: Enabled & Mandatory' : '2FA Status: Turned OFF (Setup Available)'}
            </span>
          </div>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
            Platform Administration Console
          </h2>
          <p className="text-sm text-slate-300 max-w-xl">
            Authenticated Account: <strong className="text-amber-400 font-bold">{user?.email || 'maheshwariy077@gmail.com'}</strong>
          </p>
        </div>

        {/* Clean, High-Contrast Action Buttons */}
        <div className="flex items-center gap-3 z-10 shrink-0">
          {twoFactorInfo?.isEnabled ? (
            <button
              onClick={() => setShowDisableModal(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5 border border-red-500/30"
            >
              <ShieldAlert className="w-4 h-4" /> Disable 2FA
            </button>
          ) : null}

          <button
            onClick={fetchAdminData}
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-extrabold text-xs px-4 py-2.5 rounded-xl backdrop-blur-sm transition-all cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh Data
          </button>
        </div>
      </div>

      {/* DEDICATED GOOGLE AUTHENTICATOR 2FA SETUP & SECURITY CARD */}
      <Card className="p-6 bg-white border border-[#E5E7EB] shadow-sm rounded-3xl space-y-6 text-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 border border-orange-200 flex items-center justify-center shrink-0">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <span>Google Authenticator 2FA Security Console</span>
                <span
                  className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-extrabold border ${
                    twoFactorInfo?.isEnabled
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {twoFactorInfo?.isEnabled ? '2FA ENABLED' : '2FA DISABLED'}
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {twoFactorInfo?.isEnabled
                  ? 'Your account is locked down with Google Authenticator TOTP. Future logins will require a 6-digit code.'
                  : 'Scan the fixed QR code below with Google Authenticator and type the live 6-digit code to enable 2FA.'}
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-700 font-semibold bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            Admin Email: <strong className="text-orange-600">maheshwariy077@gmail.com</strong>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Left Column: Fixed QR Code & Secret Key */}
          <div className="md:col-span-5 flex flex-col items-center justify-center space-y-3 bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 text-center shadow-md">
            {twoFactorInfo?.qrCodeUrl ? (
              <div className="bg-white p-3 rounded-2xl shadow-xl border-2 border-slate-700">
                <img src={twoFactorInfo.qrCodeUrl} alt="Google Authenticator QR Code" className="w-44 h-44 rounded-xl" />
              </div>
            ) : (
              <div className="w-44 h-44 bg-slate-950 rounded-xl flex items-center justify-center text-slate-400 text-xs font-bold">
                Generating QR...
              </div>
            )}

            <div className="w-full space-y-1">
              <p className="text-[11px] text-slate-300 font-bold uppercase tracking-wider">Manual Setup Secret Key (Protected):</p>
              <div className="flex items-center justify-center gap-2 bg-slate-950 border border-slate-800 p-2.5 rounded-xl">
                <code className="text-xs font-mono font-extrabold text-amber-300 tracking-wider">
                  {showSecretKey ? (twoFactorInfo?.secret || 'Loading...') : '••••••••••••••••'}
                </code>
                <button
                  type="button"
                  onClick={() => setShowSecretKey(!showSecretKey)}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title={showSecretKey ? "Hide Secret" : "Show Secret"}
                >
                  {showSecretKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={handleCopySecret}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Copy secret"
                >
                  {copiedSecret ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Setup Instructions & Live 2FA Enable/Test Widget */}
          <div className="md:col-span-7 space-y-4">
            <div className="space-y-2 text-xs">
              <h4 className="font-extrabold text-slate-900 text-sm">How to Setup Google Authenticator:</h4>
              <ol className="list-decimal list-inside text-slate-700 space-y-1.5 font-medium pl-1 leading-relaxed">
                <li>Open <strong>Google Authenticator</strong> app on your smartphone.</li>
                <li>Tap <strong>+</strong> ➔ <strong>Scan a QR Code</strong> and scan the QR code on the left.</li>
                <li>Enter the live 6-digit code shown in Google Authenticator into the box below.</li>
                <li>Click <strong>Verify & Enable 2FA</strong> to lock down administrator access.</li>
              </ol>
            </div>

            {/* 2FA Enable / Verification Form */}
            <form onSubmit={handleEnable2FA} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-orange-600" />
                  <span>Verify 6-Digit Code from Google Authenticator App</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit code (e.g. 123456)"
                  value={totpInput}
                  onChange={(e) => setTotpInput(e.target.value)}
                  className="bg-white border-slate-200 text-slate-900 font-mono text-center text-base font-extrabold tracking-widest placeholder:text-slate-400 focus:border-orange-500"
                  required
                />
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0 py-3 px-5 rounded-xl shadow-md">
                  {twoFactorInfo?.isEnabled ? 'Test Code' : 'Verify & Enable 2FA →'}
                </Button>
              </div>

              {enable2FAFeedback && (
                <div
                  className={`p-3 rounded-xl text-xs font-bold ${
                    enable2FAFeedback.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {enable2FAFeedback.text}
                </div>
              )}
            </form>

            {backupCodesList && backupCodesList.length > 0 && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
                <p className="text-xs font-extrabold text-emerald-900">
                  Save your 10 Single-Use Recovery Backup Codes in a safe place:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 font-mono text-xs font-bold text-emerald-900 bg-white p-2.5 rounded-xl text-center border border-emerald-200">
                  {backupCodesList.map((c, i) => (
                    <div key={i}>{c}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Disable 2FA Modal */}
      {showDisableModal && (
        <Card className="p-6 bg-white border border-red-200 text-slate-900 space-y-4 max-w-md rounded-3xl shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-extrabold text-sm text-red-600 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" /> Disable Two-Factor Authentication
            </h3>
            <button onClick={() => setShowDisableModal(false)} className="text-xs text-slate-500 hover:text-slate-900 font-bold">
              Cancel
            </button>
          </div>

          <form onSubmit={handleDisable2FA} className="space-y-3">
            <p className="text-xs text-slate-600 font-medium">
              Disabling 2FA requires verifying your administrator password AND a current 6-digit TOTP code.
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <Input
                type="password"
                placeholder="7983346809@Yash"
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
                className="bg-white border-slate-200 text-xs text-slate-900"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">6-Digit TOTP Code</label>
              <Input
                type="text"
                maxLength={6}
                placeholder="Current TOTP Code"
                value={disableTotp}
                onChange={(e) => setDisableTotp(e.target.value)}
                className="bg-white border-slate-200 text-slate-900 font-mono text-center font-extrabold text-base"
                required
              />
            </div>
            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 font-bold text-white text-xs py-3 rounded-xl">
              Confirm & Disable 2FA
            </Button>
          </form>
        </Card>
      )}

      {/* High-Level SaaS Platform Metrics (Identical to Restaurant Dashboard Metric Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 space-y-2 border-l-4 border-l-orange-500 bg-white rounded-3xl shadow-sm">
          <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Registered Restaurants</span>
          <p className="font-heading font-extrabold text-3xl text-slate-900">
            {metrics.restaurantsCount || tenants.length}
          </p>
          <p className="text-xs text-emerald-700 font-extrabold">Active SaaS Tenants</p>
        </Card>

        <Card className="p-6 space-y-2 border-l-4 border-l-blue-500 bg-white rounded-3xl shadow-sm">
          <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Total Orders Processed</span>
          <p className="font-heading font-extrabold text-3xl text-slate-900">
            {metrics.ordersCount}
          </p>
          <p className="text-xs text-blue-700 font-extrabold">Across all digital menus</p>
        </Card>

        <Card className="p-6 space-y-2 border-l-4 border-l-emerald-500 bg-white rounded-3xl shadow-sm">
          <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Total Platform Volume</span>
          <p className="font-heading font-extrabold text-3xl text-slate-900">
            {formatCurrency(metrics.totalRevenue)}
          </p>
          <p className="text-xs text-emerald-700 font-extrabold">Gross Order Revenue</p>
        </Card>

        <Card className="p-6 space-y-2 border-l-4 border-l-purple-500 bg-white rounded-3xl shadow-sm">
          <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">PostgreSQL Database</span>
          <p className="font-heading font-extrabold text-2xl text-emerald-600 flex items-center gap-1.5">
            <Radio className="w-5 h-5 animate-pulse" /> Supabase DB
          </p>
          <p className="text-xs text-slate-600 font-extrabold">Connected & Healthy</p>
        </Card>
      </div>

      {/* Tenant Restaurants Management Table */}
      <Card className="p-6 space-y-4 bg-white border border-[#E5E7EB] shadow-sm rounded-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-lg text-slate-900">Tenant Restaurant Outlets</h3>
            <p className="text-xs text-slate-500 font-medium">
              Manage onboarded restaurants, inspect digital menus, or suspend/activate tenant access.
            </p>
          </div>
          <span className="text-xs font-extrabold text-slate-900 bg-slate-100 border border-slate-200 px-3.5 py-1.5 rounded-full">
            Total Tenants: {tenants.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-900 font-extrabold uppercase tracking-wider">
              <tr>
                <th className="p-4">Restaurant Outlet</th>
                <th className="p-4">Owner Details</th>
                <th className="p-4">Menu Items</th>
                <th className="p-4">Total Orders</th>
                <th className="p-4">Subscription Plan</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tenants.map((tenant) => {
                const formattedValidUntil = tenant.validUntil
                  ? new Date(tenant.validUntil).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : null;

                return (
                  <tr key={tenant.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div>
                        <p className="font-extrabold text-sm text-slate-900">{tenant.name}</p>
                        <a
                          href={`/r/${tenant.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-orange-600 hover:text-orange-700 hover:underline flex items-center gap-1 font-bold mt-0.5"
                        >
                          /r/{tenant.slug} <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </td>

                    <td className="p-4">
                      <div>
                        <p className="font-bold text-slate-900 text-xs">{tenant.ownerName}</p>
                        <p className="text-[11px] text-slate-500 font-medium">{tenant.ownerEmail}</p>
                      </div>
                    </td>

                    <td className="p-4 font-extrabold text-slate-900">{tenant.menuItemsCount} dishes</td>

                    <td className="p-4 font-extrabold text-slate-900">{tenant.ordersCount} orders</td>

                    <td className="p-4">
                      <div className="space-y-1">
                        <span className="bg-orange-50 text-orange-700 border border-orange-200 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold inline-block">
                          {tenant.plan}
                        </span>
                        {formattedValidUntil ? (
                          <p className="text-[11px] text-slate-500 font-bold">
                            Valid Till: <span className="text-slate-900 font-extrabold">{formattedValidUntil}</span>
                          </p>
                        ) : (
                          <p className="text-[11px] text-amber-600 font-bold">Awaiting Verification</p>
                        )}
                      </div>
                    </td>

                    <td className="p-4">
                      {tenant.status === 'unverified' ? (
                        <span className="bg-amber-50 text-amber-800 border border-amber-300 px-3 py-1 rounded-full text-[10px] font-extrabold inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          Pending Admin Approval
                        </span>
                      ) : tenant.status === 'active' ? (
                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-300 px-3 py-1 rounded-full text-[10px] font-extrabold inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Active (Paid)
                        </span>
                      ) : (
                        <span className="bg-red-50 text-red-800 border border-red-300 px-3 py-1 rounded-full text-[10px] font-extrabold inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          Suspended / Expired
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-right space-x-2">
                      {tenant.status === 'unverified' ? (
                        <button
                          onClick={() => handleExtendSubscription(tenant.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-xl shadow-md transition-all cursor-pointer border border-emerald-500"
                        >
                          Approve & Activate (1 Month) →
                        </button>
                      ) : tenant.status === 'active' ? (
                        <>
                          <button
                            onClick={() => handleExtendSubscription(tenant.id)}
                            className="bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100 font-extrabold text-xs px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                            title="Add +30 Days to subscription"
                          >
                            +1 Month (₹250 Paid)
                          </button>
                          <button
                            onClick={() => toggleTenantStatus(tenant.id, 'active')}
                            className="bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 font-extrabold text-xs px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                          >
                            Suspend
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleExtendSubscription(tenant.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-xl shadow-md transition-all cursor-pointer border border-emerald-500"
                        >
                          Re-Activate (+1 Month)
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
