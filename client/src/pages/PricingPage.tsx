import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ShieldCheck, HelpCircle, ArrowRight, Zap, RefreshCw, CreditCard, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const PricingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FFFDF8] py-12 px-4 sm:px-6 lg:px-8 text-slate-900">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 border border-orange-200 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span>Fair & Transparent Pricing</span>
          </div>
          <h1 className="font-heading font-extrabold text-3xl sm:text-5xl text-slate-900 tracking-tight">
            Simple Digital Menu SaaS Plan
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-medium">
            One flat monthly subscription rate for your entire restaurant. No hidden charges, zero per-order commissions, and no setup fees.
          </p>
        </div>

        {/* Pricing Card */}
        <div className="max-w-md mx-auto bg-white border-2 border-orange-500 rounded-3xl p-8 sm:p-10 shadow-2xl relative text-center">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-600 to-amber-600 text-white px-5 py-1 rounded-full text-xs font-extrabold tracking-wider uppercase shadow-md">
            Most Popular SaaS Plan
          </div>

          <div className="space-y-2 mb-6 pt-2">
            <h2 className="text-2xl font-extrabold text-slate-900 font-heading">Pro Outlet Subscription</h2>
            <p className="text-xs text-slate-500 font-medium">
              Designed for Restaurants, Cafes, Dhabas, Food Courts & Cloud Kitchens
            </p>
          </div>

          {/* Pricing Amount */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-8 text-center">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-lg font-bold text-slate-500">₹</span>
              <span className="text-5xl font-extrabold font-heading text-slate-900">250</span>
              <span className="text-sm font-bold text-slate-500"> / month</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-semibold">Inclusive of all taxes & instant deployment</p>
          </div>

          {/* Included Features */}
          <ul className="space-y-4 text-left text-xs sm:text-sm text-slate-700 mb-8 font-medium">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Unlimited Menu Items & Categories</strong> — Update prices and items live anytime.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>High-Resolution Printable QR Posters</strong> — Instant PDF generation for tables.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Kitchen KDS & Live Order Display</strong> — Real-time audio alerts for preparing/ready items.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>0% Commission on Customer Orders</strong> — You keep 100% of your restaurant revenue.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Multi-Staff & Chef Roles</strong> — Dedicated credentials for kitchen cooks and staff.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>7-Day Full Money-Back Guarantee</strong> — Risk-free trial with instant refund support.</span>
            </li>
          </ul>

          <Button
            onClick={() => navigate('/register')}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-extrabold py-4 rounded-2xl shadow-lg shadow-orange-600/30 text-sm uppercase tracking-wider"
          >
            Start Your Restaurant Setup →
          </Button>

          <p className="text-[11px] text-slate-400 mt-4 font-medium">
            Cancel anytime with 1-click inside your restaurant dashboard.
          </p>
        </div>

        {/* Commercial Terms Breakdown */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm max-w-3xl mx-auto">
          <h3 className="font-heading font-extrabold text-xl text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4">
            <CreditCard className="w-5 h-5 text-orange-600" />
            <span>Billing & Payment Terms</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-slate-600 leading-relaxed font-medium">
            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-900 text-sm">Monthly Subscription Billing</h4>
              <p>
                Subscription is billed at <strong>₹250 per month</strong> per restaurant outlet. Payments are processed securely via Paytm Payment Gateway.
              </p>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-900 text-sm">Instant Account Activation</h4>
              <p>
                Upon payment confirmation, your digital QR menu and live dashboard are activated immediately without manual waiting.
              </p>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-900 text-sm">7-Day Money-Back Policy</h4>
              <p>
                If you are not satisfied with QRasoi within the first 7 days of subscription, contact us for a 100% full refund with no questions asked.
              </p>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-900 text-sm">Cancel Anytime</h4>
              <p>
                You can cancel your subscription at any time. Your account will remain active until the end of your paid billing cycle.
              </p>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="max-w-3xl mx-auto space-y-4">
          <h3 className="font-heading font-extrabold text-xl text-slate-900 text-center mb-6">
            Frequently Asked Pricing Questions
          </h3>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 shadow-xs">
            <h4 className="font-bold text-slate-900 text-sm">Is there any setup fee or maintenance charge?</h4>
            <p className="text-xs text-slate-600 font-medium">
              No. The ₹250/month fee is all-inclusive. There are no hidden onboarding, maintenance, or software upgrade fees.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 shadow-xs">
            <h4 className="font-bold text-slate-900 text-sm">How does the 7-day money-back guarantee work?</h4>
            <p className="text-xs text-slate-600 font-medium">
              Simply send an email to support@qrasoi.app within 7 days of subscribing. We will refund the complete ₹250 directly to your original Paytm payment method within 5–7 business days.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
