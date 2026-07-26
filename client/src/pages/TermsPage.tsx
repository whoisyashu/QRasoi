import React from 'react';
import { Shield, FileText, Scale, Lock, Clock, HelpCircle } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FFFDF8] py-12 px-4 sm:px-6 lg:px-8 text-slate-900">
      <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xl space-y-8">
        {/* Header */}
        <div className="border-b border-slate-200 pb-6 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-orange-600 uppercase tracking-wider">
            <Scale className="w-4 h-4" />
            <span>Legal Documentation & Merchant Terms</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-4xl text-slate-900">
            Terms of Service & Merchant Agreement
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Effective Date: January 1, 2026 | Last Updated: July 25, 2026
          </p>
        </div>

        {/* Content Body */}
        <div className="space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
          <section className="space-y-3">
            <h2 className="font-heading font-bold text-base sm:text-lg text-slate-900 border-l-4 border-orange-500 pl-3">
              1. Acceptance of Terms & Service Scope
            </h2>
            <p>
              Welcome to <strong>QRasoi</strong> ("Platform", "We", "Us", or "Our"), a Software-as-a-Service (SaaS) provider offering digital QR menu generation, kitchen order management systems (KDS), and restaurant order tracking tools for merchant establishments across India.
            </p>
            <p>
              By registering an account, accessing our portal, or subscribing to our service, you ("Merchant", "Restaurant Owner", or "User") agree to be bound by these Terms of Service, our Privacy Policy, and our Cancellation & Refund Policy. If you do not agree to these terms, you may not access or use the Platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading font-bold text-base sm:text-lg text-slate-900 border-l-4 border-orange-500 pl-3">
              2. Merchant Account Registration & Account Security
            </h2>
            <p>
              To utilize QRasoi, merchants must register with valid business details, including a operational email address, mobile number, restaurant name, and physical address. You are solely responsible for maintaining the confidentiality of your account login credentials and for all activities that occur under your account.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>Merchants must provide accurate, current, and complete business information.</li>
              <li>You must immediately notify QRasoi of any unauthorized account access or security breach.</li>
              <li>QRasoi reserves the right to suspend or terminate accounts that contain false or misleading information.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading font-bold text-base sm:text-lg text-slate-900 border-l-4 border-orange-500 pl-3">
              3. Subscription Pricing, Commercial Terms & Payments
            </h2>
            <p>
              QRasoi offers a flat-rate monthly SaaS subscription plan priced at <strong>₹250 per month</strong> per restaurant establishment (inclusive of applicable taxes).
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li><strong>Billing Cycle:</strong> Subscriptions are billed on a recurring monthly basis from the date of activation.</li>
              <li><strong>Payment Processing:</strong> Online payment transactions are securely processed through authorized Payment Gateways (including Paytm Payment Gateway). QRasoi does not store raw credit card numbers or UPI PINs.</li>
              <li><strong>0% Commission:</strong> QRasoi does not charge per-order commissions on food items ordered by customers at your establishment.</li>
              <li><strong>Fee Changes:</strong> Any price adjustment will be communicated to merchants with a minimum 30 days prior notice via email.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading font-bold text-base sm:text-lg text-slate-900 border-l-4 border-orange-500 pl-3">
              4. Merchant Food Quality & Public Menu Content
            </h2>
            <p>
              Merchants retain full ownership and liability for all menu items, descriptions, prices, food hygiene, allergen notices, and order fulfillment offered to their patrons through the QRasoi digital menu. QRasoi acts strictly as a software tool provider and is not a food aggregator, delivery partner, or food preparation party.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading font-bold text-base sm:text-lg text-slate-900 border-l-4 border-orange-500 pl-3">
              5. Service Level Agreement & System Availability
            </h2>
            <p>
              We strive to maintain a 99.9% uptime for our public digital menus and cloud backend infrastructure. However, service may occasionally be interrupted for planned maintenance, security updates, or emergency server repairs. QRasoi is not liable for indirect loss of revenue resulting from temporary network outages beyond our reasonable control.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading font-bold text-base sm:text-lg text-slate-900 border-l-4 border-orange-500 pl-3">
              6. Intellectual Property Rights
            </h2>
            <p>
              All software code, trademarks, logos, UI designs, and database structures relating to the QRasoi platform remain the exclusive property of QRasoi. Merchants are granted a limited, non-exclusive, non-transferable license to access the Platform during their active subscription term.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading font-bold text-base sm:text-lg text-slate-900 border-l-4 border-orange-500 pl-3">
              7. Governing Law & Dispute Resolution
            </h2>
            <p>
              These Terms of Service are governed by and construed in accordance with the laws of the Republic of India. Any disputes or legal proceedings arising out of or in connection with these terms shall be subject to the exclusive jurisdiction of the competent courts in New Delhi / Gurugram, India.
            </p>
          </section>

          <section className="space-y-3 bg-slate-50 border border-slate-200 rounded-2xl p-5 mt-8">
            <h3 className="font-bold text-slate-900 text-sm">Contact Information & Helpdesk</h3>
            <p className="text-xs text-slate-600">
              For any questions regarding these Terms of Service or merchant operations, please contact us at:
            </p>
            <p className="text-xs text-slate-800 font-mono">
              <strong>Email:</strong> support@qrasoi.app | <strong>Phone:</strong> +91 98765 43210<br />
              <strong>Operating Address:</strong> DLF Cyber City, Tower B, Phase 2, Gurugram, Haryana - 122002, India
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
