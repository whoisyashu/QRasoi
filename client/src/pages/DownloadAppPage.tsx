import React from 'react';
import { MobileAppDownloadSection } from '../components/shared/MobileAppDownloadSection';
import { ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DownloadAppPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>

      <MobileAppDownloadSection />

      {/* Installation Instructions */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-orange-400" />
            <span>How to Install Android APK Directly</span>
          </h3>

          <ol className="space-y-4 text-sm text-slate-300 list-decimal list-inside">
            <li className="leading-relaxed">
              Tap the <strong>Android APK (.apk)</strong> button above to download `QRasoi.apk`.
            </li>
            <li className="leading-relaxed">
              When prompted by your browser, tap <strong>Download Anyway</strong> or <strong>Open File</strong>.
            </li>
            <li className="leading-relaxed">
              If your phone shows <i>"Install unknown apps"</i> permission, toggle <strong>Allow from this source</strong> in Settings.
            </li>
            <li className="leading-relaxed">
              Tap <strong>Install</strong> and open QRasoi to access your Owner or Chef KDS dashboard instantly!
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};
