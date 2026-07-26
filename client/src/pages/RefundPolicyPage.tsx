import React from 'react';
import { RefreshCw, CheckCircle2, AlertCircle, Mail, ShieldCheck, Clock } from 'lucide-react';

export const RefundPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FFFDF8] py-12 px-4 sm:px-6 lg:px-8 text-slate-900">
      <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xl space-y-8">
        {/* Header */}
        <div className="border-b border-slate-200 pb-6 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-sky-600 uppercase tracking-wider">
            <RefreshCw className="w-4 h-4" />
            <span>Customer Protection Policy</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-4xl text-slate-900">
            Cancellation & Refund Policy
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Paytm Merchant Compliant Policy | Last Updated: July 25, 2026
          </p>
        </div>

        {/* Highlight Banner */}
        <div className="bg-sky-50 border border-sky-200 rounded-2xl p-5 flex items-start gap-4 text-sky-900">
          <ShieldCheck className="w-6 h-6 text-sky-600 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs sm:text-sm font-medium">
            <h3 className="font-bold text-sky-950">7-Day Risk-Free Money-Back Guarantee</h3>
            <p>
              We stand behind the quality of QRasoi. If you subscribe to our <strong>₹250/month Pro Outlet Plan</strong> and find that the platform does not meet your expectations, we offer a 100% full refund within 7 days of initial subscription.
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
          <section className="space-y-3">
            <h2 className="font-heading font-bold text-base sm:text-lg text-slate-900 border-l-4 border-sky-500 pl-3">
              1. 7-Day Initial Subscription Refund Terms
            </h2>
            <p>
              First-time merchant subscribers are eligible for a 100% full refund of the ₹250 subscription fee if requested within <strong>7 calendar days</strong> from the date and time of payment confirmation.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>No cancellation penalty or processing fee is deducted.</li>
              <li>Refunds are approved instantly upon receiving your request.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading font-bold text-base sm:text-lg text-slate-900 border-l-4 border-sky-500 pl-3">
              2. How to Submit a Refund Request
            </h2>
            <p>To request a refund, please follow these steps:</p>
            <ol className="list-decimal pl-5 space-y-2 text-slate-600">
              <li>Send an email to our merchant helpdesk at <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">support@qrasoi.app</code> from your registered merchant email ID.</li>
              <li>Include your <strong>Restaurant Outlet Name</strong> and <strong>Paytm Transaction Reference ID / Order ID</strong>.</li>
              <li>Our support team will verify your payment details and initiate the refund within 24 hours.</li>
            </ol>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading font-bold text-base sm:text-lg text-slate-900 border-l-4 border-sky-500 pl-3">
              3. Refund Processing Timeline & Method
            </h2>
            <p>
              Once initiated, refunds are processed directly back to the original source payment method (Paytm Wallet, UPI ID, Net Banking, or Debit/Credit Card) through <strong>Paytm Payment Gateway</strong>.
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-mono text-slate-800 space-y-1">
              <p><strong>Standard Processing Window:</strong> 5 to 7 business days</p>
              <p><strong>Refund Source:</strong> Original Paytm PG Payment Instrument</p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading font-bold text-base sm:text-lg text-slate-900 border-l-4 border-sky-500 pl-3">
              4. Subscription Cancellation Policy
            </h2>
            <p>
              Merchants may cancel their recurring SaaS subscription at any time directly through the <strong>Restaurant Settings</strong> panel inside the QRasoi Dashboard.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>Upon cancellation, your digital QR menu and live KDS will remain active until the end of your current paid billing period.</li>
              <li>No further automatic recurring debits will occur after cancellation.</li>
            </ul>
          </section>

          <section className="space-y-3 bg-slate-50 border border-slate-200 rounded-2xl p-5 mt-8">
            <h3 className="font-bold text-slate-900 text-sm">Need Assistance with a Payment or Refund?</h3>
            <p className="text-xs text-slate-600">
              If you have any questions regarding a charge on your statement or need help with cancellation:
            </p>
            <p className="text-xs text-slate-800 font-mono">
              <strong>Merchant Support Email:</strong> support@qrasoi.app<br />
              <strong>Customer Care Helpline:</strong> +91 98765 43210 (Mon-Sat, 9 AM - 7 PM IST)
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
