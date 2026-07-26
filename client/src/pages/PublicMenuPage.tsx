import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Search, ShoppingBag, Flame, Clock, Plus, Minus, MapPin, Phone, ShieldAlert } from 'lucide-react';
import { useMenuStore } from '../store/useMenuStore';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { formatCurrency } from '../utils/formatters';
import { Button } from '../components/ui/Button';

export const PublicMenuPage: React.FC = () => {
  const navigate = useNavigate();
  const { restaurantSlug } = useParams<{ restaurantSlug?: string; restaurantId?: string }>();
  const { restaurant } = useAuthStore();
  const { categories, items, publicRestaurant, isSuspended, fetchMenuItems, fetchPublicMenu, searchQuery, setSearchQuery, selectedCategory, setSelectedCategory } =
    useMenuStore();
  const { items: cartItems, addItem, updateQuantity, getSubtotal, getTotalItems } = useCartStore();

  const [dietaryFilter, setDietaryFilter] = useState<'all' | 'veg' | 'non-veg'>('all');

  const displayRestaurant = {
    name:
      publicRestaurant?.name && publicRestaurant.name !== 'Your Restaurant Name'
        ? publicRestaurant.name
        : restaurant.name && restaurant.name !== 'Your Restaurant Name'
        ? restaurant.name
        : 'DineVerse Bistro',
    tagline: publicRestaurant?.tagline || restaurant.tagline || 'Digital Menu & QR Ordering',
    address:
      publicRestaurant?.address && publicRestaurant.address !== 'Update address in Settings'
        ? publicRestaurant.address
        : restaurant.address && restaurant.address !== 'Update address in Settings'
        ? restaurant.address
        : 'Flat No.13A, Bankey Bihari Enclave',
    phone:
      publicRestaurant?.phone && publicRestaurant.phone !== '+91 90000 00000'
        ? publicRestaurant.phone
        : restaurant.phone && restaurant.phone !== '+91 90000 00000'
        ? restaurant.phone
        : '+91 9368967944',
    logo: publicRestaurant?.logo || restaurant.logo || '/logo.png',
    coverImage:
      publicRestaurant?.coverImage ||
      restaurant.coverImage ||
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80',
  };

  useEffect(() => {
    if (restaurantSlug) {
      fetchPublicMenu(restaurantSlug);
    } else {
      fetchMenuItems();
    }
  }, [restaurantSlug, fetchPublicMenu, fetchMenuItems]);

  const filteredItems = items.filter((item) => {
    // Search query filter
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());

    // Category filter
    let matchesCategory = true;
    if (selectedCategory === 'cat-popular') {
      matchesCategory = !!item.isPopular;
    } else if (selectedCategory !== 'cat-all') {
      const selectedCategoryObj = categories.find((c) => c.id === selectedCategory);
      if (selectedCategoryObj) {
        matchesCategory = item.category.toLowerCase() === selectedCategoryObj.name.toLowerCase();
      }
    }

    // Dietary filter
    let matchesDietary = true;
    if (dietaryFilter === 'veg') matchesDietary = item.dietary === 'veg';
    if (dietaryFilter === 'non-veg') matchesDietary = item.dietary === 'non-veg';

    return matchesSearch && matchesCategory && matchesDietary;
  });

  const getCartQuantity = (itemId: string) => {
    const found = cartItems.find((ci) => ci.menuItem.id === itemId);
    return found ? found.quantity : 0;
  };

  if (isSuspended) {
    return (
      <div className="min-h-screen bg-[#FFFDF8] flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white border border-orange-200 shadow-xl rounded-3xl p-8 space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto shadow-md">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-heading font-extrabold text-slate-900">
              Digital Menu Unavailable
            </h2>
            <p className="text-xs text-amber-700 font-extrabold bg-amber-50 px-3 py-1 rounded-full border border-amber-200 inline-block">
              Pending Admin Verification / Renewal
            </p>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            This restaurant outlet account is currently <strong>Awaiting Admin Verification</strong> or subscription renewal. Public digital ordering is paused.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2 text-xs">
            <p className="font-extrabold text-slate-900">Contact QRasoi Administrator for Activation:</p>
            <div className="space-y-1 font-semibold text-slate-700">
              <p className="flex items-center justify-between">
                <span>WhatsApp Support:</span>
                <a href="https://wa.me/919368967944" target="_blank" rel="noreferrer" className="text-orange-600 font-bold hover:underline">
                  +91 9368967944
                </a>
              </p>
              <p className="flex items-center justify-between">
                <span>Email Helpdesk:</span>
                <a href="mailto:whoisyashu04@gmail.com" className="text-orange-600 font-bold hover:underline">
                  whoisyashu04@gmail.com
                </a>
              </p>
            </div>
          </div>

          <div className="pt-2">
            <Button
              onClick={() => navigate('/')}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-orange-600/25"
            >
              Return to Homepage
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF8] pb-28">
      {/* Restaurant Header Banner */}
      <div className="relative bg-slate-900 text-white">
        <div className="absolute inset-0 opacity-25 overflow-hidden">
          <img
            src={displayRestaurant.coverImage}
            alt={displayRestaurant.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 py-8 sm:px-6 flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <img
            src={displayRestaurant.logo}
            alt={displayRestaurant.name}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-orange-500 shadow-lg shrink-0"
          />
          <div className="space-y-1.5 flex-1">
            <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Accepting Orders • Table & Dine-in</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-white">
              {displayRestaurant.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium">{displayRestaurant.tagline}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-400 pt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-orange-400" />
                {displayRestaurant.address}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-orange-400" />
                {displayRestaurant.phone}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6">
        {/* Sticky Search & Dietary Filter */}
        <div className="sticky top-16 z-20 bg-[#FFFDF8]/95 backdrop-blur-md pt-2 pb-4 space-y-3">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3.5 top-3 text-[#6B7280]" />
            <input
              type="text"
              placeholder="Search food items, categories, or descriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-11 pr-4 bg-white border border-[#E5E7EB] rounded-2xl text-sm outline-none focus:border-[#F97316] focus:ring-2 focus:ring-orange-500/20 transition-all shadow-sm"
            />
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar py-1">
            <div className="flex items-center gap-2">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-[#F97316] text-white shadow-sm'
                        : 'bg-white text-[#334155] border border-[#E5E7EB] hover:bg-slate-50'
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>

            {/* Veg / Non-Veg Toggle Filter */}
            <div className="flex items-center gap-1 bg-white border border-[#E5E7EB] p-1 rounded-full text-xs font-medium shrink-0">
              <button
                onClick={() => setDietaryFilter('all')}
                className={`px-2.5 py-1 rounded-full transition-colors cursor-pointer ${
                  dietaryFilter === 'all' ? 'bg-slate-800 text-white font-bold' : 'text-slate-600'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setDietaryFilter('veg')}
                className={`px-2.5 py-1 rounded-full transition-colors flex items-center gap-1 cursor-pointer ${
                  dietaryFilter === 'veg' ? 'bg-emerald-600 text-white font-bold' : 'text-emerald-700'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> Veg
              </button>
              <button
                onClick={() => setDietaryFilter('non-veg')}
                className={`px-2.5 py-1 rounded-full transition-colors flex items-center gap-1 cursor-pointer ${
                  dietaryFilter === 'non-veg' ? 'bg-red-600 text-white font-bold' : 'text-red-700'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-red-400" /> Non-Veg
              </button>
            </div>
          </div>
        </div>

        {/* Menu Items List (Clean Text Layout without Food Images) */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-white border border-[#E5E7EB] rounded-2xl my-6">
            <p className="text-base font-bold text-[#334155] mb-1">No food items found</p>
            <p className="text-sm text-[#6B7280] mb-4">
              Try adjusting your search query or dietary filters.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('cat-all');
                setDietaryFilter('all');
              }}
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="space-y-4 my-4">
            {filteredItems.map((item) => {
              const qty = getCartQuantity(item.id);
              return (
                <div
                  key={item.id}
                  className={`bg-white border border-[#E5E7EB] rounded-2xl p-4 sm:p-5 shadow-qrasoi transition-all flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between ${
                    !item.isAvailable ? 'opacity-60 bg-slate-50' : ''
                  }`}
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      {/* Veg/Non-Veg Badge Dot */}
                      <span
                        className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center shrink-0 ${
                          item.dietary === 'veg'
                            ? 'border-emerald-600'
                            : 'border-red-600'
                        }`}
                        title={item.dietary === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            item.dietary === 'veg' ? 'bg-emerald-600' : 'bg-red-600'
                          }`}
                        />
                      </span>

                      <h3 className="font-heading font-bold text-base text-[#334155]">
                        {item.name}
                      </h3>

                      {item.isPopular && (
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                          <Flame className="w-3 h-3 text-amber-600" /> Bestseller
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[#6B7280] line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="flex items-center gap-3 pt-1">
                      <span className="font-heading font-bold text-lg text-[#111827]">
                        {formatCurrency(item.price)}
                      </span>
                      <span className="text-xs text-[#6B7280] flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {item.preparationTimeMinutes} mins
                      </span>
                    </div>
                  </div>

                  {/* Quantity Controller / Add Button */}
                  <div className="w-full sm:w-auto flex justify-end shrink-0 pt-2 sm:pt-0">
                    {!item.isAvailable ? (
                      <span className="text-xs text-red-500 font-bold px-3 py-1.5 bg-red-50 rounded-xl">
                        Unavailable
                      </span>
                    ) : qty === 0 ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-28 border-[#F97316] text-[#F97316] hover:bg-orange-50 font-bold"
                        onClick={() => addItem(item)}
                      >
                        Add +
                      </Button>
                    ) : (
                      <div className="flex items-center bg-orange-50 border border-orange-200 rounded-2xl p-1 gap-3">
                        <button
                          onClick={() => updateQuantity(item.id, qty - 1)}
                          className="w-8 h-8 rounded-xl bg-white text-[#F97316] flex items-center justify-center font-bold shadow-xs hover:bg-orange-100 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-heading font-bold text-sm text-[#F97316] w-4 text-center">
                          {qty}
                        </span>
                        <button
                          onClick={() => addItem(item)}
                          className="w-8 h-8 rounded-xl bg-[#F97316] text-white flex items-center justify-center font-bold shadow-xs hover:bg-[#EA580C] transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Cart Sticky Bar */}
      {getTotalItems() > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-2xl mx-auto z-40">
          <div className="bg-[#334155] text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4 border border-slate-700">
            <div className="flex items-center gap-3">
              <div className="relative p-2.5 bg-[#F97316] text-white rounded-xl">
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute -top-1.5 -right-1.5 bg-white text-[#F97316] text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                  {getTotalItems()}
                </span>
              </div>
              <div>
                <p className="text-xs text-slate-300">Total Cart Amount</p>
                <p className="font-heading font-bold text-lg text-white">
                  {formatCurrency(getSubtotal())}
                </p>
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              className="font-bold text-sm px-5"
              onClick={() => navigate('/cart')}
            >
              View Cart & Checkout →
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
