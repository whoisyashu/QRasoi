import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, User, Phone, Utensils, AlertCircle, ShieldCheck } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useOrderStore } from '../store/useOrderStore';
import { useAuthStore } from '../store/useAuthStore';
import { formatCurrency } from '../utils/formatters';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';

const checkoutSchema = z.object({
  customerName: z.string().min(2, 'Please enter your full name'),
  customerPhone: z.string().min(10, 'Please enter a valid 10-digit mobile number'),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, getSubtotal, clearCart } = useCartStore();
  const { createOrder } = useOrderStore();
  const { restaurant } = useAuthStore();

  const [tableNumber, setTableNumber] = useState('Table 4');
  const subtotal = getSubtotal();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: '',
      customerPhone: '',
    },
  });

  const onSubmit = async (data: CheckoutFormData) => {
    const createdOrder = await createOrder({
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      tableNumber,
      items,
      subtotal,
      restaurantSlug: restaurant.slug || 'rest-dhaba-01',
    });

    clearCart();
    // Redirect to live order status page (Rule 12)
    navigate(`/order-status/${createdOrder.id.replace('QR-', '')}`);
  };

  return (
    <div className="min-h-screen bg-[#FFFDF8] py-6 px-4 sm:px-6 max-w-2xl mx-auto space-y-6">
      <button
        onClick={() => navigate('/cart')}
        className="flex items-center gap-2 text-sm font-semibold text-[#334155] hover:text-[#F97316] transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Cart</span>
      </button>

      <div className="space-y-1">
        <h1 className="font-heading font-extrabold text-2xl text-[#334155]">Order Checkout</h1>
        <p className="text-xs text-[#6B7280]">No login required for customers. Enter details to generate your Order ID.</p>
      </div>

      {/* Prominent Physical Payment Warning Banner per Rule 14 & 15 */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-amber-900">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-bold text-amber-900">Pay at Counter Notice</p>
          <p className="text-amber-800 leading-relaxed">
            QRasoi does not collect payments online. After placing your order, please show your Order ID at the restaurant counter to pay via Cash or UPI and confirm your order for the kitchen.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="p-6 space-y-4">
          <h3 className="font-bold text-base text-[#334155] flex items-center gap-2">
            <User className="w-4 h-4 text-[#F97316]" />
            <span>Customer Information</span>
          </h3>

          <Input
            label="Your Full Name *"
            placeholder="e.g. Rahul Sharma"
            {...register('customerName')}
            error={errors.customerName?.message}
            leftIcon={<User className="w-4 h-4 text-slate-400" />}
          />

          <Input
            label="Mobile Number (For SMS updates) *"
            placeholder="e.g. 9876543210"
            type="tel"
            maxLength={10}
            {...register('customerPhone')}
            error={errors.customerPhone?.message}
            leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#334155]">Table / Token Number</label>
            <div className="grid grid-cols-3 gap-2">
              {['Table 4', 'Table 9', 'Takeaway Token'].map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setTableNumber(t)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    tableNumber === t
                      ? 'border-[#F97316] bg-orange-50 text-[#F97316]'
                      : 'border-[#E5E7EB] bg-white text-[#334155]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Order Items Review */}
        <Card className="p-6 space-y-3 bg-slate-50/50">
          <h3 className="font-bold text-sm text-[#334155]">Order Items Summary</h3>
          <div className="divide-y divide-slate-200 text-xs">
            {items.map(({ menuItem, quantity }) => (
              <div key={menuItem.id} className="py-2 flex justify-between items-center text-[#334155]">
                <span>
                  {quantity}x {menuItem.name}
                </span>
                <span className="font-bold">{formatCurrency(menuItem.price * quantity)}</span>
              </div>
            ))}
            <div className="pt-3 flex justify-between items-center font-bold text-base text-[#111827]">
              <span>Total Payable</span>
              <span className="text-[#F97316] font-heading">{formatCurrency(subtotal)}</span>
            </div>
          </div>
        </Card>

        <Button
          variant="primary"
          size="lg"
          type="submit"
          isLoading={isSubmitting}
          className="w-full font-bold text-base"
        >
          Place Order & Generate Order ID
        </Button>
      </form>
    </div>
  );
};
