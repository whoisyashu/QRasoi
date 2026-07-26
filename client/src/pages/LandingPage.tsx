import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import gsap from 'gsap';
import {
  QrCode,
  Smartphone,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Button } from '../components/ui/Button';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(badgeRef.current, {
        opacity: 0,
        y: -20,
        duration: 0.6,
        ease: 'power2.out',
      });

      gsap.from(titleRef.current, {
        opacity: 0,
        y: 30,
        duration: 0.8,
        delay: 0.2,
        ease: 'power3.out',
      });

      gsap.from(ctaRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.6,
        delay: 0.4,
        ease: 'power2.out',
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const features = [
    {
      icon: QrCode,
      title: 'Digital QR Menu',
      description: 'Replace printed menus instantly. Customers scan a single QR code to view your food menu.',
    },
    {
      icon: Smartphone,
      title: 'Direct Ordering',
      description: 'Customers place orders straight from their phone browser. No app installation or account sign-up required.',
    },
    {
      icon: Clock,
      title: 'Live Order Tracking',
      description: 'Customers watch order progress in real-time while kitchen staff receive verified orders immediately.',
    },
    {
      icon: TrendingUp,
      title: 'Instant Menu Control',
      description: 'Mark items out-of-stock or change prices in seconds from your restaurant portal.',
    },
  ];

  const steps = [
    {
      step: '01',
      title: 'Customer Scans QR',
      desc: 'Placed on table or counter. Opens your digital menu instantly in any mobile browser.',
    },
    {
      step: '02',
      title: 'Browse & Order',
      desc: 'Select dishes with clear Veg/Non-Veg indicators and custom cooking instructions.',
    },
    {
      step: '03',
      title: 'Pay & Collect Food',
      desc: 'Customer pays physically at counter. Owner verifies order and kitchen prepares it.',
    },
  ];

  const faqs = [
    {
      q: 'Does QRasoi require my customers to download an app?',
      a: 'No! Customers simply scan the QR code with their phone camera and the digital menu opens instantly in their web browser without any app download or account creation.',
    },
    {
      q: 'How long does it take to set up my restaurant?',
      a: 'Under 10 minutes. Enter your outlet details, add your food categories and items, download your custom QR poster, and you are ready to accept digital orders.',
    },
    {
      q: 'Does QRasoi process online payments?',
      a: 'No. To keep setup simple and avoid extra commission fees, customers pay physically at your counter using cash or your existing UPI QR scanner.',
    },
    {
      q: 'Can I mark dishes out of stock during peak hours?',
      a: 'Yes. With one tap on your menu management page, any item can be marked "Out of Stock" instantly so customers cannot order unavailable dishes.',
    },
  ];

  return (
    <div className="bg-[#FFFDF8] text-[#111827] overflow-hidden">
      {/* Hero Section */}
      <section ref={heroRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 text-center">
        <div ref={badgeRef} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100/80 text-[#F97316] font-semibold text-xs mb-6 border border-orange-200">
          <Sparkles className="w-4 h-4" />
          <span>Built for Cafés, Dhabas, Bakeries & Fast Food Outlets</span>
        </div>

        <h1
          ref={titleRef}
          className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl text-[#334155] max-w-4xl mx-auto leading-tight tracking-tight mb-6"
        >
          Simple Digital Menus & Order Management for Every Restaurant.
        </h1>

        <p className="text-lg sm:text-xl text-[#6B7280] max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          Replace paper menus. Allow your customers to browse, order, and track live status right from their phones in under 60 seconds.
        </p>

        {/* Production CTAs */}
        <div ref={ctaRef} className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-16">
          <Button
            variant="primary"
            size="lg"
            className="w-full sm:w-auto font-bold text-base px-8"
            rightIcon={<ArrowRight className="w-5 h-5" />}
            onClick={() => navigate('/register')}
          >
            Get Started
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full sm:w-auto font-semibold text-base px-8"
            onClick={() => navigate('/login')}
          >
            Sign In
          </Button>
        </div>

        {/* Hero Product Graphic Showcase */}
        <div className="relative max-w-4xl mx-auto bg-white border border-[#E5E7EB] rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden text-left">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500" />
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#F97316] bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
                Modern SaaS Solution
              </span>
              <h3 className="text-2xl font-bold text-[#334155]">Scan. Order. Collect.</h3>
              <p className="text-sm text-[#6B7280] leading-relaxed">
                Experience how effortlessly your customers browse your dishes, choose customized items, and receive a unique Order ID to present at your counter.
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-[#334155]">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> No App Download
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Zero Customer Signup
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Instant Setup
                </div>
              </div>
            </div>

            <div className="w-full md:w-64 bg-slate-900 text-white rounded-2xl p-5 text-center flex flex-col items-center gap-3 shrink-0 shadow-lg border border-slate-800">
              <div className="w-16 h-16 rounded-2xl bg-[#F97316] text-white flex items-center justify-center font-bold text-2xl shadow-md">
                <QrCode className="w-10 h-10" />
              </div>
              <div>
                <p className="font-bold text-white text-sm">QR Code Digital Menu</p>
                <p className="text-xs text-slate-400">Scannable Table & Counter Poster</p>
              </div>
              <Button
                variant="primary"
                size="sm"
                className="w-full text-xs font-bold"
                onClick={() => navigate('/register')}
              >
                Register Your Restaurant
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-20 border-t border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#334155] mb-4">
              Everything Your Outlet Needs.
            </h2>
            <p className="text-base text-[#6B7280]">
              QRasoi eliminates unnecessary complexity so you can focus on serving delicious food.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="bg-[#FFFDF8] border border-[#E5E7EB] rounded-2xl p-6 shadow-qrasoi hover:shadow-qrasoi-hover transition-all flex flex-col items-start"
                >
                  <div className="p-3 rounded-2xl bg-orange-50 text-[#F97316] mb-5 border border-orange-100">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[#334155] mb-2">{f.title}</h3>
                  <p className="text-sm text-[#6B7280] leading-relaxed">{f.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#334155] mb-4">
            How QRasoi Works in 3 Simple Steps
          </h2>
          <p className="text-base text-[#6B7280]">
            From QR scan to fresh food served—here is the friction-free ordering workflow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((s, idx) => (
            <div key={idx} className="bg-white border border-[#E5E7EB] rounded-2xl p-8 shadow-qrasoi relative">
              <span className="text-4xl font-extrabold font-heading text-orange-300 mb-4 block">
                {s.step}
              </span>
              <h3 className="text-xl font-bold text-[#334155] mb-3">{s.title}</h3>
              <p className="text-sm text-[#6B7280] leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="bg-white py-20 border-t border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#334155] mb-4">
              Simple Transparent Pricing
            </h2>
            <p className="text-base text-[#6B7280]">
              No hidden fees, no per-order commissions. Just one fixed price for unlimited digital orders.
            </p>
          </div>

          <div className="max-w-md mx-auto bg-[#FFFDF8] border-2 border-[#F97316] rounded-3xl p-8 shadow-xl relative text-center">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#F97316] text-white px-4 py-1 rounded-full text-xs font-bold tracking-wider uppercase shadow-xs">
              All-In-One SaaS Plan
            </div>

            <h3 className="text-2xl font-bold text-[#334155] mb-2">Pro Outlet</h3>
            <p className="text-sm text-[#6B7280] mb-6">Perfect for small restaurants, dhabas, tea shops & cafes</p>

            <div className="mb-8">
              <span className="text-5xl font-extrabold font-heading text-[#334155]">₹250</span>
              <span className="text-sm text-[#6B7280]"> / month</span>
            </div>

            <ul className="space-y-3.5 text-left text-sm text-[#334155] mb-8">
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>Unlimited Digital Menu Items & Categories</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>Printable High-Res QR Poster Download</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>Live Order Management & Kitchen KDS</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>Daily Sales Analytics & Cloudinary Media CDN</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>0% Commission on Customer Orders</span>
              </li>
            </ul>

            <Button
              variant="primary"
              size="lg"
              className="w-full font-bold"
              onClick={() => navigate('/register')}
            >
              Get Started Now
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#334155] mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-base text-[#6B7280]">
            Everything you need to know about QRasoi.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-qrasoi"
            >
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full p-6 text-left flex items-center justify-between gap-4 font-bold text-[#334155] text-base hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-[#6B7280] transition-transform duration-200 ${
                    openFaq === index ? 'rotate-180 text-[#F97316]' : ''
                  }`}
                />
              </button>
              {openFaq === index && (
                <div className="px-6 pb-6 text-sm text-[#6B7280] leading-relaxed border-t border-[#F3F4F6] pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="bg-[#334155] text-white py-16 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-white mb-4">
            Ready to Upgrade Your Restaurant Menu?
          </h2>
          <p className="text-slate-300 text-base mb-8 max-w-xl mx-auto">
            Set up your digital QR menu in under 10 minutes and make ordering effortless for your guests.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              variant="primary"
              size="lg"
              className="font-bold text-base px-8"
              onClick={() => navigate('/register')}
            >
              Get Started
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="bg-white/10 text-white border-white/20 hover:bg-white/20 px-8"
              onClick={() => navigate('/login')}
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Professional Footer (Paytm PG Audit Compliant) */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <img
                src="/logo.png"
                alt="QRasoi Logo"
                className="h-9 w-auto object-contain"
              />
              <span className="font-heading font-extrabold text-white text-xl">QRasoi</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Simple, commission-free digital menu SaaS platform for Indian restaurants, dhabas, tea shops, and cafes.
            </p>
            <p className="text-slate-500 text-[11px] pt-2">© 2026 QRasoi Digital Technologies. All rights reserved.</p>
          </div>

          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">SaaS Product</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <Link to="/pricing" className="hover:text-orange-400 transition-colors">
                  Pricing (₹250/mo)
                </Link>
              </li>
              <li>
                <button onClick={() => navigate('/#features')} className="hover:text-orange-400 transition-colors cursor-pointer">
                  Features & KDS
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/#how-it-works')} className="hover:text-orange-400 transition-colors cursor-pointer">
                  How It Works
                </button>
              </li>
              <li>
                <Link to="/register" className="hover:text-orange-400 transition-colors">
                  Merchant Registration
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Merchant Compliance</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <Link to="/terms" className="hover:text-orange-400 transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-orange-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/refund-policy" className="hover:text-orange-400 transition-colors">
                  Cancellation & Refund Policy
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-orange-400 transition-colors">
                  Contact Us & Helpdesk
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Paytm Merchant Support</h4>
            <p className="text-slate-400 text-xs leading-relaxed mb-2">
              For billing, payment gateway assistance, or merchant support:
            </p>
            <p className="text-slate-200 font-mono text-xs">
              <strong>Email:</strong> support@qrasoi.app<br />
              <strong>Helpline:</strong> +91 98765 43210
            </p>
            <p className="text-slate-500 text-[11px] mt-3">
              Operating Hours: Mon - Sat, 9:00 AM - 7:00 PM IST
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
