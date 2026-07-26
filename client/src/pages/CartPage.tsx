import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag, ArrowRight, MessageSquare } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { formatCurrency } from '../utils/formatters';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/shared/EmptyState';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, clearCart, getSubtotal, getTotalItems } = useCartStore();

  const subtotal = getSubtotal();
  const totalItems = getTotalItems();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#FFFDF8] p-4 sm:p-6 max-w-2xl mx-auto flex flex-col justify-center">
        <EmptyState
          icon={<ShoppingBag className="w-10 h-10" />}
          title="Your Cart is Empty"
          description="Browse our digital menu and add your favorite dishes before proceeding to checkout."
          actionLabel="Browse Digital Menu"
          onAction={() => navigate(-1)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF8] py-6 px-4 sm:px-6 max-w-3xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-semibold text-[#334155] hover:text-[#F97316] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Menu</span>
        </button>

        <button
          onClick={clearCart}
          className="text-xs text-red-500 hover:text-red-700 font-semibold flex items-center gap-1 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Cart</span>
        </button>
      </div>

      <div className="space-y-1">
        <h1 className="font-heading font-extrabold text-2xl text-[#334155]">Your Food Order</h1>
        <p className="text-xs text-[#6B7280]">Review your items before proceeding to counter checkout</p>
      </div>

      {/* Cart Items List */}
      <div className="space-y-3">
        {items.map(({ menuItem, quantity, notes }) => (
          <Card key={menuItem.id} className="p-4 sm:p-5 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={menuItem.image}
                  alt={menuItem.name}
                  className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        menuItem.dietary === 'veg' ? 'bg-emerald-600' : 'bg-red-600'
                      }`}
                    />
                    <h3 className="font-bold text-sm text-[#334155]">{menuItem.name}</h3>
                  </div>
                  <p className="text-xs text-[#6B7280] font-medium mt-0.5">
                    {formatCurrency(menuItem.price)} each
                  </p>
                </div>
              </div>

              {/* Item Total */}
              <div className="text-right">
                <span className="font-heading font-bold text-base text-[#111827]">
                  {formatCurrency(menuItem.price * quantity)}
                </span>
              </div>
            </div>

            {/* Quantity Controls & Notes */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#F3F4F6]">
              <div className="flex items-center gap-1 text-xs text-[#6B7280]">
                <MessageSquare className="w-3.5 h-3.5 text-orange-400" />
                <span>{notes || 'No special notes'}</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => removeItem(menuItem.id)}
                  className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                  title="Remove Item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="flex items-center bg-orange-50 border border-orange-200 rounded-xl p-0.5 gap-2">
                  <button
                    onClick={() => updateQuantity(menuItem.id, quantity - 1)}
                    className="w-7 h-7 rounded-lg bg-white text-[#F97316] flex items-center justify-center font-bold text-xs shadow-xs hover:bg-orange-100"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-bold text-xs text-[#F97316] w-4 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(menuItem.id, quantity + 1)}
                    className="w-7 h-7 rounded-lg bg-[#F97316] text-white flex items-center justify-center font-bold text-xs shadow-xs hover:bg-[#EA580C]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Bill Summary Card */}
      <Card className="bg-slate-50/50 p-6 space-y-4">
        <h3 className="font-bold text-base text-[#334155]">Order Summary</h3>

        <div className="space-y-2 text-sm text-[#6B7280]">
          <div className="flex justify-between">
            <span>Items Count</span>
            <span className="font-medium text-[#111827]">{totalItems} items</span>
          </div>
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-medium text-[#111827]">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Platform & Service Fee</span>
            <span className="font-bold text-emerald-600">FREE (₹0)</span>
          </div>
          <div className="pt-3 border-t border-[#E5E7EB] flex justify-between items-center font-bold text-[#111827] text-lg">
            <span>Total Payable</span>
            <span className="text-[#F97316] font-heading">{formatCurrency(subtotal)}</span>
          </div>
        </div>

        <Button
          variant="primary"
          size="lg"
          className="w-full font-bold text-base"
          rightIcon={<ArrowRight className="w-5 h-5" />}
          onClick={() => navigate('/checkout')}
        >
          Proceed to Checkout
        </Button>
      </Card>
    </div>
  );
};
