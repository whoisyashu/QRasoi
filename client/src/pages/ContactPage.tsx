import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, Building, MessageSquare } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    restaurantName: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#FFFDF8] py-12 px-4 sm:px-6 lg:px-8 text-slate-900">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 border border-orange-200 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <Building className="w-4 h-4" />
            <span>Merchant Support & Helpdesk</span>
          </div>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-slate-900">
            Contact QRasoi Team
          </h1>
          <p className="text-sm text-slate-600 font-medium">
            Have questions about digital menus, onboarding, or Paytm payments? We're here to help!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Official Contact Details (Paytm PG Audit Requirement) */}
          <div className="lg:col-span-5 space-y-6 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-lg">
            <h2 className="font-heading font-extrabold text-xl text-slate-900 border-b border-slate-100 pb-4">
              Registered Office & Helpdesk
            </h2>

            <div className="space-y-6 text-xs sm:text-sm text-slate-700 font-medium">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 border border-orange-100">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-xs text-slate-400 uppercase tracking-wider">Email Support</h3>
                  <p className="text-slate-900 font-bold text-sm">support@qrasoi.app</p>
                  <p className="text-slate-500 text-xs">For sales, technical & refund queries</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-xs text-slate-400 uppercase tracking-wider">Helpline Number</h3>
                  <p className="text-slate-900 font-bold text-sm">+91 98765 43210</p>
                  <p className="text-slate-500 text-xs">Merchant Support Hotline</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-xs text-slate-400 uppercase tracking-wider">Operating Hours</h3>
                  <p className="text-slate-900 font-bold text-sm">Mon - Sat: 9:00 AM – 7:00 PM IST</p>
                  <p className="text-slate-500 text-xs">Closed on Sunday & National Holidays</p>
                </div>
              </div>

              <div className="flex items-start gap-4 border-t border-slate-100 pt-5">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-xs text-slate-400 uppercase tracking-wider">Registered Office</h3>
                  <p className="text-slate-900 font-bold text-sm">QRasoi Digital Technologies</p>
                  <p className="text-slate-600 text-xs leading-relaxed mt-1">
                    DLF Cyber City, Building 10, Tower B, Phase 2, Gurugram, Haryana - 122002, India
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Support Form */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-lg">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-heading font-extrabold text-2xl text-slate-900">Message Received!</h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  Thank you for reaching out. Our merchant support team will review your inquiry and get back to you within 2 business hours.
                </p>
                <Button onClick={() => setSubmitted(false)} variant="outline" className="mt-4 text-xs font-bold">
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h2 className="font-heading font-extrabold text-xl text-slate-900 border-b border-slate-100 pb-4">
                  Send Us a Message
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Your Name *</label>
                    <Input
                      type="text"
                      placeholder="e.g. Ramesh Kumar"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address *</label>
                    <Input
                      type="email"
                      placeholder="ramesh@restaurant.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Phone Number *</label>
                    <Input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Restaurant Name</label>
                    <Input
                      type="text"
                      placeholder="Royal Dhaba"
                      value={formData.restaurantName}
                      onChange={(e) => setFormData({ ...formData, restaurantName: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Message / Inquiry Details *</label>
                  <textarea
                    rows={4}
                    placeholder="Tell us about your restaurant requirements or payment inquiry..."
                    className="w-full text-xs sm:text-sm bg-white border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-orange-500"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-extrabold py-3.5 rounded-2xl shadow-md text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Inquiry</span>
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
