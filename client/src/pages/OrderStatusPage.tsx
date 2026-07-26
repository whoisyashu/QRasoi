import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle2, AlertCircle, Sparkles, UtensilsCrossed, RefreshCw, Search } from 'lucide-react';
import { useOrderStore } from '../store/useOrderStore';
import { useAuthStore } from '../store/useAuthStore';
import { formatCurrency, formatDate, getStatusConfig } from '../utils/formatters';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export const OrderStatusPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { orders, fetchPublicOrder, fetchLiveOrders, checkExpiredOrders } = useOrderStore();
  const { restaurant } = useAuthStore();

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [manualIdInput, setManualIdInput] = useState('');

  const targetId = orderId ? (orderId.startsWith('QR-') ? orderId : `QR-${orderId}`) : '';

  // Case-insensitive order resolution
  const order = orders.find(
    (o) =>
      o.id.toUpperCase() === targetId.toUpperCase() ||
      (orderId && o.id.toUpperCase() === orderId.toUpperCase())
  );

  // Sync order status from live backend API / Supabase every 3 seconds
  useEffect(() => {
    let isMounted = true;

    const syncOrder = async () => {
      if (targetId || orderId) {
        await fetchPublicOrder(targetId || orderId!);
      }
      await fetchLiveOrders();
      checkExpiredOrders();
      if (isMounted) {
        setLastUpdated(new Date());
        setIsInitialLoading(false);
      }
    };

    syncOrder();

    const interval = setInterval(() => {
      syncOrder();
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [orderId, targetId, fetchPublicOrder, fetchLiveOrders, checkExpiredOrders]);

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualIdInput.trim()) return;
    const formatted = manualIdInput.trim().startsWith('QR-')
      ? manualIdInput.trim()
      : `QR-${manualIdInput.trim()}`;
    navigate(`/order-status/${formatted}`);
  };

  // Loading Screen
  if (isInitialLoading && !order) {
    return (
      <div className="min-h-screen bg-[#FFFDF8] p-6 max-w-xl mx-auto flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
        <h2 className="text-lg font-bold text-slate-800">Locating Live Order...</h2>
        <p className="text-xs text-slate-500">Syncing real-time kitchen status for order {targetId || orderId}</p>
      </div>
    );
  }

  // Not Found State with Quick Lookup Box
  if (!order) {
    return (
      <div className="min-h-screen bg-[#FFFDF8] p-6 max-w-md mx-auto flex flex-col justify-center text-center space-y-6">
        <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-1.5">Order Not Found</h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            We could not locate order <strong className="font-mono text-orange-600">{targetId || orderId}</strong> in the live queue.
          </p>
        </div>

        <form onSubmit={handleManualSearch} className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-left">
          <label className="block text-xs font-semibold text-slate-700">Track Different Order ID:</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. QR-1082 or 1082"
              className="flex-1 px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl outline-none focus:border-orange-500 font-mono font-bold"
              value={manualIdInput}
              onChange={(e) => setManualIdInput(e.target.value)}
            />
            <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-4 rounded-xl">
              Track
            </Button>
          </div>
        </form>

        <div className="pt-2">
          <Button variant="outline" onClick={() => navigate('/')} className="w-full text-xs py-3 rounded-xl">
            Return to Digital Menu
          </Button>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(order.status);

  // Timeline steps: Pending -> Preparing -> Ready -> Completed
  const timelineSteps = [
    { key: 'pending', label: 'Payment Verification', desc: 'Visit counter to pay & confirm' },
    { key: 'preparing', label: 'Kitchen Preparing', desc: 'Chef is preparing your food' },
    { key: 'ready', label: 'Ready for Pickup', desc: 'Collect your order at counter' },
    { key: 'completed', label: 'Order Completed', desc: 'Enjoy your meal!' },
  ];

  const getStepIndex = (st: string) => {
    switch (st) {
      case 'pending':
        return 0;
      case 'preparing':
        return 1;
      case 'ready':
        return 2;
      case 'completed':
        return 3;
      default:
        return 0;
    }
  };

  const currentIndex = getStepIndex(order.status);

  return (
    <div className="min-h-screen bg-[#FFFDF8] py-8 px-4 sm:px-6 max-w-2xl mx-auto space-y-6">
      {/* Restaurant Header */}
      <div className="text-center space-y-1">
        <span className="bg-orange-50 text-orange-600 text-xs font-extrabold px-3.5 py-1 rounded-full border border-orange-200 inline-block">
          {order.restaurantName || restaurant.name || 'QRasoi Restaurant'}
        </span>
        <h1 className="font-heading font-extrabold text-3xl text-slate-900 tracking-tight">
          Live Order Status
        </h1>
        <p className="text-xs text-slate-500 flex items-center justify-center gap-1.5">
          <RefreshCw className="w-3 h-3 text-orange-500 animate-spin" />
          <span>Auto-syncing • Last updated at {lastUpdated.toLocaleTimeString()}</span>
        </p>
      </div>

      {/* Hero Order ID Card */}
      <Card className="bg-white border-2 border-orange-500/30 p-6 text-center space-y-4 shadow-lg relative overflow-hidden rounded-2xl">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-400 to-amber-500" />

        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Your Order ID</span>
          <h2 className="font-heading font-extrabold text-4xl text-orange-600 mt-1 font-mono tracking-wider">{order.id}</h2>
          <p className="text-xs text-slate-700 font-semibold mt-1">
            Customer: {order.customerName} ({order.tableNumber})
          </p>
        </div>

        <div className="inline-flex items-center justify-center">
          <Badge status={order.status}>{statusConfig.label}</Badge>
        </div>

        <p className="text-xs text-slate-600 font-medium max-w-sm mx-auto bg-slate-50 p-2.5 rounded-xl border border-slate-100">
          {order.status === 'pending' && 'Please visit the cashier counter to pay and confirm your order.'}
          {order.status === 'preparing' && 'Your food is being prepared with fresh ingredients by our chef.'}
          {order.status === 'ready' && 'Your order is ready! Please collect it from the pickup counter.'}
          {order.status === 'completed' && 'Order completed. Thank you for dining with us!'}
          {order.status === 'cancelled' && 'This order has been cancelled.'}
        </p>
      </Card>

      {/* Step Tracker Progress Bar */}
      <Card className="p-6 bg-white border border-slate-200 rounded-2xl space-y-6 shadow-xs">
        <h3 className="font-heading font-bold text-slate-800 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
          <UtensilsCrossed className="w-4 h-4 text-orange-500" /> Kitchen Preparation Progress
        </h3>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
          {timelineSteps.map((step, idx) => {
            const isFinished = idx <= currentIndex;
            const isCurrent = idx === currentIndex;

            return (
              <div key={step.key} className="relative flex items-start gap-4">
                <div
                  className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all ${
                    isFinished
                      ? 'bg-orange-600 border-orange-600 text-white'
                      : 'bg-white border-slate-300 text-slate-400'
                  }`}
                >
                  {isFinished ? '✓' : idx + 1}
                </div>

                <div className="flex-1">
                  <h4
                    className={`text-xs font-extrabold transition-colors ${
                      isCurrent ? 'text-orange-600' : isFinished ? 'text-slate-800' : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Ordered Items Breakdown */}
      <Card className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-heading font-bold text-slate-800 text-sm">Order Items Summary</h3>
          <span className="text-xs text-slate-500 font-semibold">{order.items.length} Dish(es)</span>
        </div>

        <div className="divide-y divide-slate-100">
          {order.items.map((item, index) => (
            <div key={index} className="py-3 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <div className="font-bold text-slate-800 flex items-center gap-2">
                  <span>{item.menuItem?.name || 'Dish'}</span>
                  <span className="text-slate-400 text-[11px]">× {item.quantity}</span>
                </div>
                {item.notes && <p className="text-[11px] text-orange-600 italic">Note: {item.notes}</p>}
              </div>

              <div className="font-extrabold text-slate-900 font-mono">
                {formatCurrency((item.menuItem?.price || 0) * item.quantity)}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-200 pt-3 flex items-center justify-between text-sm font-extrabold text-slate-900">
          <span>Total Paid / Payable:</span>
          <span className="text-orange-600 font-mono text-base">{formatCurrency(order.total || order.subtotal)}</span>
        </div>
      </Card>
    </div>
  );
};
