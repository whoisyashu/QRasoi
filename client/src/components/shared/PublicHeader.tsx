import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { LogIn, Menu, X, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';

export const PublicHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isLandingPage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    if (!isLandingPage) {
      navigate(`/#${id}`);
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled || isMobileMenuOpen || !isLandingPage
          ? 'bg-white/95 backdrop-blur-md border-b border-[#E5E7EB] shadow-xs py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <img
            src="/logo.png"
            alt="QRasoi Logo"
            className="h-10 md:h-12 w-auto object-contain group-hover:scale-105 transition-transform"
          />
          <div className="flex flex-col">
            <span className="font-heading font-extrabold text-xl text-[#334155] leading-none tracking-tight">
              QRasoi
            </span>
            <span className="text-[10px] text-[#6B7280] font-semibold tracking-wider uppercase">
              Digital Menus
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#334155]">
          <button
            onClick={() => scrollToSection('features')}
            className="hover:text-[#F97316] transition-colors cursor-pointer"
          >
            Features
          </button>
          <button
            onClick={() => scrollToSection('how-it-works')}
            className="hover:text-[#F97316] transition-colors cursor-pointer"
          >
            How It Works
          </button>
          <Link
            to="/pricing"
            className="hover:text-[#F97316] transition-colors cursor-pointer"
          >
            Pricing (₹250/mo)
          </Link>
          <Link
            to="/contact"
            className="hover:text-[#F97316] transition-colors cursor-pointer"
          >
            Contact Us
          </Link>
        </nav>

        {/* Desktop Production CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="font-semibold text-[#334155]"
            leftIcon={<LogIn className="w-4 h-4 text-[#F97316]" />}
            onClick={() => navigate('/login')}
          >
            Sign In
          </Button>

          <Button
            variant="primary"
            size="sm"
            className="font-bold px-4"
            rightIcon={<ArrowRight className="w-4 h-4" />}
            onClick={() => navigate('/register')}
          >
            Get Started
          </Button>
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 text-[#334155] hover:text-[#F97316] rounded-xl transition-colors cursor-pointer"
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-[#E5E7EB] px-4 pt-3 pb-6 space-y-4 shadow-lg animate-in slide-in-from-top duration-200">
          {isLandingPage && (
            <div className="flex flex-col gap-3 font-semibold text-[#334155] text-sm pb-3 border-b border-slate-100">
              <button
                onClick={() => scrollToSection('features')}
                className="text-left py-1.5 hover:text-[#F97316]"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="text-left py-1.5 hover:text-[#F97316]"
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection('pricing')}
                className="text-left py-1.5 hover:text-[#F97316]"
              >
                Pricing
              </button>
              <button
                onClick={() => scrollToSection('faq')}
                className="text-left py-1.5 hover:text-[#F97316]"
              >
                FAQ
              </button>
            </div>
          )}

          <div className="flex flex-col gap-2 pt-1">
            <Button
              variant="outline"
              size="md"
              className="w-full justify-center font-semibold"
              leftIcon={<LogIn className="w-4 h-4 text-[#F97316]" />}
              onClick={() => {
                setIsMobileMenuOpen(false);
                navigate('/login');
              }}
            >
              Sign In
            </Button>

            <Button
              variant="primary"
              size="md"
              className="w-full justify-center font-bold"
              rightIcon={<ArrowRight className="w-4 h-4" />}
              onClick={() => {
                setIsMobileMenuOpen(false);
                navigate('/register');
              }}
            >
              Get Started
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};
