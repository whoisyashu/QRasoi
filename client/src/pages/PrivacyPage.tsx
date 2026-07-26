import React from 'react';
import { ShieldCheck, Lock, Eye, FileText, UserCheck } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FFFDF8] py-12 px-4 sm:px-6 lg:px-8 text-slate-900">
      <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xl space-y-8">
        {/* Header */}
        <div className="border-b border-slate-200 pb-6 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Data Protection & Privacy Policy</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-4xl text-slate-900">
            Privacy Policy & Data Security Declaration
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Compliant with Indian IT Act 2000 & IT Rules 2011 | Last Updated: July 25, 2026
          </p>
        </div>

        {/* Content Body */}
        <div className="space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
          <section className="space-y-3">
            <h2 className="font-heading font-bold text-base sm:text-lg text-slate-900 border-l-4 border-emerald-500 pl-3">
              1. Overview & Commitment to Data Privacy
            </h2>
            <p>
              At <strong>QRasoi</strong> ("We", "Our", or "Us"), preserving the privacy and data security of restaurant merchants and their dining guests is a fundamental operational priority. This Privacy Policy details how we collect, process, store, and safeguard personal and business information when you use our SaaS application, merchant portal, and public QR digital menus.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading font-bold text-base sm:text-lg text-slate-900 border-l-4 border-emerald-500 pl-3">
              2. Information We Collect
            </h2>
            <p>We collect only the necessary data required to provision our digital menu and order management services:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li><strong>Merchant Account Information:</strong> Name, business email address, phone number, restaurant outlet name, physical address, and cuisine categories.</li>
              <li><strong>Order Data:</strong> Customer table numbers, selected food items, order timestamps, and order status updates.</li>
              <li><strong>Technical Data:</strong> Device IP addresses, browser types, session cookies, and system performance logs to maintain platform stability.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading font-bold text-base sm:text-lg text-slate-900 border-l-4 border-emerald-500 pl-3">
              3. Payment Processing & Third-Party Gateway Security
            </h2>
            <p>
              Subscribing to the <strong>₹250/month Pro Outlet Plan</strong> involves online payment transactions. Online payments are routed directly through authorized PCI-DSS compliant payment gateways, including <strong>Paytm Payment Gateway</strong>.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>QRasoi <strong>never</strong> collects, stores, or processes credit card numbers, debit card PINs, CVV codes, or net-banking credentials on our servers.</li>
              <li>All payment transactions are encrypted using Industry-Standard SSL/TLS 256-bit protocols.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading font-bold text-base sm:text-lg text-slate-900 border-l-4 border-emerald-500 pl-3">
              4. Data Retention, Encryption & Security Safeguards
            </h2>
            <p>
              We implement robust technical and organizational security controls to protect against unauthorized access, loss, or alteration of merchant data:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>Passwords are stored using secure <strong>bcrypt</strong> cryptographic hashing algorithms.</li>
              <li>Administrator and merchant portals support RFC 6238 TOTP Two-Factor Authentication (2FA).</li>
              <li>Database records are maintained on secure, firewalled cloud infrastructure (Supabase PostgreSQL) with automated backups.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading font-bold text-base sm:text-lg text-slate-900 border-l-4 border-emerald-500 pl-3">
              5. Merchant Data Rights & Account Deletion
            </h2>
            <p>
              Merchants maintain full control over their account data. You may inspect, update, or request permanent deletion of your account and menu records at any time by contacting our support desk at <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">support@qrasoi.app</code>.
            </p>
          </section>

          {/* Grievance Officer Section (Mandatory Paytm PG Compliance) */}
          <section className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3 mt-8">
            <h3 className="font-heading font-bold text-base text-slate-900 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-600" />
              <span>Grievance Officer & Support Escalation</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              In accordance with the Information Technology Act 2000 and rules made thereunder, the name and contact details of the Grievance Officer for data protection concerns are provided below:
            </p>
            <div className="text-xs text-slate-800 space-y-1 font-mono bg-white p-4 rounded-xl border border-slate-200">
              <p><strong>Grievance Officer:</strong> Yash Maheshwari</p>
              <p><strong>Designation:</strong> Data Protection & Security Lead</p>
              <p><strong>Email:</strong> grievance@qrasoi.app | support@qrasoi.app</p>
              <p><strong>Operating Hours:</strong> Monday to Saturday (9:00 AM – 7:00 PM IST)</p>
              <p><strong>Office Address:</strong> DLF Cyber City, Tower B, Phase 2, Gurugram, HR - 122002, India</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
