import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, AlertCircle, KeyRound, QrCode, ArrowLeft, Download, CheckCircle2, Copy, Sparkles, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginAdmin, verifyAdmin2FA, setupAdmin2FA, enableAdmin2FA, isLoading, error } = useAuthStore();

  // Stage: 1 = Password, 2 = 2FA TOTP Verification, 3 = First-Time Setup
  const [stage, setStage] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 2FA Stage State
  const [totpCode, setTotpCode] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);

  // First Time Setup State
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [tempSetupToken, setTempSetupToken] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copiedBackup, setCopiedBackup] = useState(false);

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    const res = await loginAdmin(email, password);
    if (res.requires2FA) {
      if (!res.is2FAConfigured) {
        // First-Time 2FA Setup Required
        const setupData = await setupAdmin2FA();
        if (setupData) {
          setQrCodeDataUrl(setupData.qrCodeUrl);
          setSecretKey(setupData.secret);
          setTempSetupToken(setupData.tempSetupToken);
          setBackupCodes(setupData.backupCodes);
          setStage(3);
        } else {
          setStage(2);
        }
      } else {
        setStage(2);
      }
    } else if (!res.error) {
      navigate('/system/portal/dashboard', { replace: true });
    }
  };

  const handleStep2Verify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!totpCode) return;
    const success = await verifyAdmin2FA(totpCode);
    if (success) {
      navigate('/system/portal/dashboard', { replace: true });
    }
  };

  const handleFirstTimeEnable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!totpCode || !tempSetupToken) return;

    const res = await enableAdmin2FA(tempSetupToken, totpCode);
    if (res.success) {
      if (res.backupCodes) setBackupCodes(res.backupCodes);
      const verifySuccess = await verifyAdmin2FA(totpCode);
      if (verifySuccess) {
        navigate('/system/portal/dashboard', { replace: true });
      }
    }
  };

  const copyBackupCodesToClipboard = () => {
    if (backupCodes.length > 0) {
      navigator.clipboard.writeText(backupCodes.join('\n'));
      setCopiedBackup(true);
      setTimeout(() => setCopiedBackup(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF8] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header Branding (Identical to Restaurant Login) */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-3 mb-1">
            <img
              src="/logo.png"
              alt="QRasoi Logo"
              className="h-14 w-auto object-contain"
            />
            <span className="font-heading font-extrabold text-2xl text-slate-900 tracking-tight">
              QRasoi Admin
            </span>
          </Link>
          <h1 className="text-2xl font-heading font-extrabold text-slate-900">
            System Portal Login
          </h1>
          <p className="text-sm text-slate-500">
            {stage === 1
              ? 'Restricted access for QRasoi Platform Administrators.'
              : stage === 2
              ? 'Two-Factor Authentication (Google Authenticator TOTP)'
              : 'First-Time 2FA Setup for Administrator Account'}
          </p>
        </div>

        {/* Main Card (Identical to Restaurant Login) */}
        <Card className="p-6 md:p-8 space-y-6 bg-white border border-slate-200 shadow-xl shadow-slate-200/50 rounded-3xl">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {stage === 1 && (
            /* STAGE 1: Email & Password Authentication */
            <form onSubmit={handleStep1Submit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Administrator Email *
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <Input
                    type="email"
                    placeholder="admin@qrasoi.app"
                    className="pl-10 text-sm bg-white border-slate-200 text-slate-900 focus:border-orange-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Security Password *
                  </label>
                </div>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="pl-10 text-sm bg-white border-slate-200 text-slate-900 focus:border-orange-500"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-orange-600/25 transition-all mt-2 text-xs"
              >
                {isLoading ? 'Authenticating Stage 1...' : 'Authenticate Administrator →'}
              </Button>
            </form>
          )}

          {stage === 2 && (
            /* STAGE 2: 2FA TOTP / Backup Code Verification */
            <form onSubmit={handleStep2Verify} className="space-y-5">
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-orange-600" />
                  <span className="text-xs font-bold text-slate-900">Stage 2: 2FA Mandatory</span>
                </div>
                <button
                  type="button"
                  onClick={() => setStage(1)}
                  className="text-xs text-slate-500 hover:text-slate-900 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-700 font-semibold">
                    {useBackupCode ? '10-Character Backup Recovery Code' : 'Google Authenticator 6-Digit TOTP Code'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setUseBackupCode(!useBackupCode)}
                    className="text-orange-600 hover:underline flex items-center gap-1 font-bold cursor-pointer text-xs"
                  >
                    {useBackupCode ? 'Use 6-Digit TOTP Code' : 'Use Backup Code'}
                  </button>
                </div>

                <Input
                  type="text"
                  maxLength={useBackupCode ? 10 : 6}
                  placeholder={useBackupCode ? 'e.g. A7B9-K2M4' : 'e.g. 123456'}
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value)}
                  className="bg-white border-slate-200 text-slate-900 text-center font-mono text-xl tracking-widest font-extrabold focus:border-orange-500"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-600/25 transition-all text-xs"
              >
                {isLoading ? 'Verifying TOTP Code...' : 'Verify TOTP & Access Dashboard →'}
              </Button>
            </form>
          )}

          {stage === 3 && (
            /* STAGE 3: First-Time 2FA Setup Flow with QR Code & Backup Codes */
            <form onSubmit={handleFirstTimeEnable} className="space-y-5">
              <div className="text-center space-y-3">
                <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                  1. Scan this QR code using <strong>Google Authenticator</strong> on your smartphone:
                </p>
                {qrCodeDataUrl && (
                  <div className="flex justify-center p-3 bg-white rounded-2xl w-fit mx-auto shadow-md border border-slate-200">
                    <img src={qrCodeDataUrl} alt="Google Authenticator QR Code" className="w-44 h-44 rounded-xl" />
                  </div>
                )}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Manual Setup Secret Key (Protected):</p>
                  <div className="flex items-center justify-center gap-2">
                    <code className="text-xs font-mono font-extrabold text-orange-600 bg-white px-3 py-1 rounded border border-slate-200 inline-block tracking-wider">
                      {showSecretKey ? secretKey : '••••••••••••••••'}
                    </code>
                    <button
                      type="button"
                      onClick={() => setShowSecretKey(!showSecretKey)}
                      className="text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                      title={showSecretKey ? "Hide Secret" : "Show Secret"}
                    >
                      {showSecretKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Backup Recovery Codes Display */}
              {backupCodes.length > 0 && (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">2. Single-Use Backup Recovery Codes (Save these!)</span>
                    <button
                      type="button"
                      onClick={copyBackupCodesToClipboard}
                      className="text-orange-600 hover:underline flex items-center gap-1 font-bold cursor-pointer text-[10px]"
                    >
                      {copiedBackup ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedBackup ? 'Copied!' : 'Copy Codes'}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px] font-bold text-slate-800 bg-white p-2.5 rounded-lg text-center border border-slate-200">
                    {backupCodes.map((code, idx) => (
                      <div key={idx}>{code}</div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700 text-center">
                  3. Enter 6-digit TOTP code from Google Authenticator to enable 2FA:
                </label>
                <Input
                  type="text"
                  maxLength={6}
                  placeholder="e.g. 123456"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value)}
                  className="bg-white border-slate-200 text-slate-900 text-center font-mono text-xl tracking-widest font-extrabold"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-600/25 transition-all text-xs"
              >
                {isLoading ? 'Enabling 2FA...' : 'Enable 2FA & Enter Admin Portal →'}
              </Button>
            </form>
          )}

          <p className="text-[11px] text-center text-slate-500">
            Protected by industry-standard RFC 6238 TOTP Two-Factor Authentication.
          </p>
        </Card>
      </div>
    </div>
  );
};
