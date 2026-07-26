import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Store, User, Mail, Lock, Phone, MapPin, Utensils, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { registerRestaurant, isLoading, error } = useAuthStore();

  const [formData, setFormData] = useState({
    ownerName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    restaurantName: '',
    address: '',
    cuisine: '',
    category: 'Restaurant',
  });

  const [formError, setFormError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setFormError('Password must be at least 6 characters long.');
      return;
    }

    const result = await registerRestaurant({
      ownerName: formData.ownerName,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      restaurantName: formData.restaurantName,
      address: formData.address,
      cuisine: formData.cuisine,
      category: formData.category,
    });

    if (result.success) {
      // Redirect user to Login. Never automatically log users in after registration.
      navigate('/login', {
        state: { registeredMessage: 'Registration successful! Your restaurant account is currently Pending Admin Verification. Please contact QRasoi Admin to activate your outlet.' },
        replace: true,
      });
    } else {
      setFormError(result.error || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF8] flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-xl space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-3 mb-2">
            <img
              src="/logo.png"
              alt="QRasoi Logo"
              className="h-14 w-auto object-contain"
            />
            <span className="font-heading font-extrabold text-2xl text-slate-900 tracking-tight">
              QRasoi
            </span>
          </Link>
          <h1 className="text-2xl font-heading font-extrabold text-slate-900">
            Register Your Restaurant
          </h1>
          <p className="text-sm text-slate-500">
            Start accepting digital QR orders in minutes.
          </p>
        </div>

        <Card className="p-6 md:p-8 space-y-6">
          {(formError || error) && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <span>{formError || error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Restaurant Name *
                </label>
                <div className="relative">
                  <Store className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    name="restaurantName"
                    placeholder="e.g. Royal Dhaba"
                    className="pl-10 text-sm"
                    value={formData.restaurantName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Owner Full Name *
                </label>
                <div className="relative">
                  <User className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    name="ownerName"
                    placeholder="e.g. Rajesh Kumar"
                    className="pl-10 text-sm"
                    value={formData.ownerName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    type="email"
                    name="email"
                    placeholder="owner@restaurant.com"
                    className="pl-10 text-sm"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    type="tel"
                    name="phone"
                    placeholder="+91 98765 43210"
                    className="pl-10 text-sm"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    className="pl-10 text-sm"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    type="password"
                    name="confirmPassword"
                    placeholder="••••••••"
                    className="pl-10 text-sm"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Restaurant Address *
              </label>
              <div className="relative">
                <MapPin className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  name="address"
                  placeholder="Shop No. 12, Main Market, Sector 15"
                  className="pl-10 text-sm"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cuisine Specialty
              </label>
              <div className="relative">
                <Utensils className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  name="cuisine"
                  placeholder="e.g. North Indian, Fast Food, South Indian"
                  className="pl-10 text-sm"
                  value={formData.cuisine}
                  onChange={handleChange}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-orange-600/25 transition-all mt-4"
            >
              {isLoading ? 'Creating Restaurant Account...' : 'Complete Registration'}
            </Button>
          </form>

          <p className="text-center text-xs text-slate-500 border-t border-slate-100 pt-4">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-orange-600 hover:underline">
              Sign In Here
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
};
