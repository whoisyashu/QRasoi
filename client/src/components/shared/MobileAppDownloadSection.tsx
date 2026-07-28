import React, { useState, useEffect } from 'react';
import { Smartphone, Download, QrCode, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '../ui/Button';

export const MobileAppDownloadSection: React.FC = () => {
  const [deviceType, setDeviceType] = useState<'android' | 'ios' | 'other'>('other');

  useEffect(() => {
    const ua = navigator.userAgent || navigator.vendor || (window as any).opera || '';
    if (/android/i.test(ua)) {
      setDeviceType('android');
    } else if (/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream) {
      setDeviceType('ios');
    }
  }, []);

  const handleAndroidDownload = () => {
    // Direct link to download generated APK or latest GitHub release APK
    const apkUrl = 'https://github.com/whoisyashu/QRasoi/releases/latest/download/QRasoi.apk';
    const link = document.createElement('a');
    link.href = apkUrl;
    link.download = 'QRasoi.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleIosDownload = () => {
    // TestFlight or Expo Client fallback for iOS
    window.open('https://expo.dev/@whoisyashu/qrasoi-mobile', '_blank');
  };

  return (
    <section id="mobile-app" className="py-16 bg-gradient-to-b from-slate-900 to-slate-950 text-white relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-600/10 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-8 sm:p-12 shadow-2xl backdrop-blur-md">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 font-bold text-xs">
                <Zap className="w-4 h-4 text-orange-400" />
                <span>QRasoi Mobile App for Owners & Kitchen Staff</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Manage Your Restaurant On The Go. <br />
                <span className="text-orange-500">Available for Android & iOS.</span>
              </h2>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Get instant order sound alerts, manage kitchen tickets with touch-friendly KDS, toggle dish availability, and track daily sales revenue directly from your smartphone.
              </p>

              {/* Feature Bullet Points */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm font-medium text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Real-Time Kitchen Sound Alerts</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Touch KDS for Kitchen Staff</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Instant Dish Out-of-Stock Toggle</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Offline Session Recovery</span>
                </div>
              </div>

              {/* Device Detected Banner */}
              {deviceType !== 'other' && (
                <div className="bg-orange-500/15 border border-orange-500/30 rounded-xl p-3 text-xs text-orange-300 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-orange-400 shrink-0" />
                  <span>
                    Detected <strong>{deviceType === 'android' ? 'Android Device' : 'iOS Device'}</strong>. Tap below to download the app!
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                {/* Android Download Button */}
                <button
                  onClick={handleAndroidDownload}
                  className={`flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl font-bold text-sm transition-all cursor-pointer shadow-lg ${
                    deviceType === 'android'
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:opacity-95 ring-2 ring-orange-400/50'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  <Download className="w-5 h-5" />
                  <div className="text-left">
                    <div className="text-[10px] uppercase opacity-80 leading-none">Download Direct</div>
                    <div className="text-sm font-extrabold leading-tight">Android APK (.apk)</div>
                  </div>
                </button>

                {/* iOS Download Button */}
                <button
                  onClick={handleIosDownload}
                  className={`flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl font-bold text-sm transition-all cursor-pointer border ${
                    deviceType === 'ios'
                      ? 'bg-white text-slate-900 border-white hover:bg-slate-100 ring-2 ring-white/50'
                      : 'bg-slate-700/80 hover:bg-slate-700 text-white border-slate-600'
                  }`}
                >
                  <Smartphone className="w-5 h-5 text-orange-400" />
                  <div className="text-left">
                    <div className="text-[10px] uppercase opacity-80 leading-none">Available On</div>
                    <div className="text-sm font-extrabold leading-tight">iOS TestFlight & Expo</div>
                  </div>
                </button>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center gap-2 pt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>100% Virus-Free & Safe. Built with Expo SDK & React Native.</span>
              </div>
            </div>

            {/* Right Graphic QR Code Card */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 text-center space-y-4 shadow-xl w-full max-w-sm">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center mx-auto">
                  <QrCode className="w-7 h-7" />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white">Scan to Install App</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Scan with your smartphone camera to download QRasoi Mobile App directly.
                  </p>
                </div>

                {/* Scannable App QR Code SVG Placeholder */}
                <div className="bg-white p-4 rounded-2xl inline-block shadow-inner">
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://qrasoi.netlify.app/download-app"
                    alt="Scan to Download QRasoi App"
                    className="w-40 h-40 object-contain mx-auto"
                  />
                </div>

                <div className="text-[11px] text-slate-400 font-mono">
                  Compatible with Android 8.0+ & iOS 14+
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
