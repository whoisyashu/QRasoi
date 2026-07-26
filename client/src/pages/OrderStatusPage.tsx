import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle2, AlertCircle, Sparkles, UtensilsCrossed } from 'lucide-react';
import { useOrderStore } from '../store/useOrderStore';
import { useAuthStore } from '../store/useAuthStore';
import { formatCurrency, formatDate, getStatusConfig } from '../utils/formatters';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export const OrderStatusPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { orders, getOrderById, fetchLiveOrders, checkExpiredOrders } = useOrderStore();
  const { restaurant } = useAuthStore();

  const rawId = orderId ? (orderId.startsWith('QR-') ? orderId : `QR-${orderId}`) : 'QR-1082';
  const order = getOrderById(rawId) || orders.find((o) => o.id === orderId) || orders[0];

  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Real-time live status synchronization from Supabase database
  useEffect(() => {
    fetchLiveOrders();
    const interval = setInterval(() => {
      checkExpiredOrders();
      fetchLiveOrders();
      setLastUpdated(new Date());
    }, 3000);
    return () => clearInterval(interval);
  }, [fetchLiveOrders, checkExpiredOrders]);

  if (!order) {
    return (
      <div className="min-h-screen bg-[#FFFDF8] p-6 max-w-xl mx-auto flex flex-col justify-center text-center">
        <h2 className="text-2xl font-bold text-[#334155] mb-2">Order Not Found</h2>
        <p className="text-sm text-[#6B7280] mb-6">We could not locate this order ID in the live queue.</p>
        <Button variant="primary" onClick={() => navigate('/')}>
          Return to Menu
        </Button>
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
        <span className="bg-orange-50 text-[#F97316] text-xs font-bold px-3 py-1 rounded-full border border-orange-200">
          {restaurant.name}
        </span>
        <h1 className="font-heading font-extrabold text-3xl text-[#334155] tracking-tight">
          Live Order Status
        </h1>
        <p className="text-xs text-[#6B7280]">
          Auto-updating from Supabase DB • Last synced at {lastUpdated.toLocaleTimeString()}
        </p>
      </div>

      {/* Hero Order ID Card */}
      <Card className="bg-white border-2 border-orange-500/30 p-6 text-center space-y-4 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-400 to-amber-500" />

        <div>
          <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Your Order ID</span>
          <h2 className="font-heading font-extrabold text-4xl text-[#F97316] mt-1">{order.id}</h2>
          <p className="text-xs text-[#334155] font-semibold mt-1">
            Customer: {order.customerName} ({order.tableNumber})
          </p>
        </div>

        <div className="inline-flex items-center justify-center">
          <Badge status={order.status}>{statusConfig.label}</Badge>
        </div>

        {order.status === 'pending' && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-left text-xs text-amber-900 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-900">Counter Action Required</p>
              <p className="text-amber-800 leading-relaxed mt-0.5">
                Please proceed to the restaurant counter with Order ID <strong className="font-bold">{order.id}</strong> to complete payment. Once verified by the owner, your order will instantly reach the kitchen chef!
              </p>
            </div>
          </div>
        )}

        {order.status === 'ready' && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-center text-xs text-emerald-900 space-y-1">
            <Sparkles className="w-5 h-5 text-emerald-600 mx-auto animate-bounce" />
            <p className="font-bold text-emerald-900 text-sm">Your Food is Fresh & Ready!</p>
            <p className="text-emerald-800">Please collect your dishes at the counter now.</p>
          </div>
        )}
      </Card>

      {/* Visual Progress Timeline */}
      <Card className="p-6 space-y-6">
        <h3 className="font-bold text-sm text-[#334155] flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#F97316]" />
          <span>Live Order Progress</span>
        </h3>

        <div className="relative pl-6 border-l-2 border-[#E5E7EB] space-y-6">
          {timelineSteps.map((step, idx) => {
            const isDone = idx < currentIndex || order.status === 'completed';
            const isCurrent = idx === currentIndex && order.status !== 'completed';

            return (
              <div key={step.key} className="relative">
                {/* Status indicator node */}
                <div
                  className={`absolute -left-[31px] top-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    isDone
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : isCurrent
                      ? 'bg-[#F97316] border-[#F97316] text-white animate-pulse'
                      : 'bg-white border-slate-300 text-transparent'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>

                <div>
                  <h4
                    className={`font-bold text-sm ${
                      isCurrent ? 'text-[#F97316]' : isDone ? 'text-emerald-700' : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </h4>
                  <p className="text-xs text-[#6B7280]">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Order Summary Receipt with Itemized Kitchen Preparation Progress */}
      <Card className="p-6 space-y-4">
        <h3 className="font-bold text-sm text-[#334155]">Order Itemized Progress & Receipt</h3>

        <div className="divide-y divide-slate-100 text-xs space-y-2">
          {order.items.map(({ menuItem, quantity, notes, status: itemStatus }, i) => (
            <div key={i} className="pt-2 flex justify-between items-center text-[#334155]">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm">
                    {quantity}x {menuItem.name}
                  </p>
                  {order.status === 'preparing' && (
                    itemStatus === 'ready' ? (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Ready
                      </span>
                    ) : (
                      <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Cooking...
                      </span>
                    )
                  )}
                </div>
                {notes && <p className="text-[11px] text-orange-600 font-medium">Note: {notes}</p>}
              </div>
              <span className="font-bold text-sm">{formatCurrency(menuItem.price * quantity)}</span>
            </div>
          ))}

          <div className="pt-3 flex justify-between items-center font-bold text-base text-[#111827]">
            <span>Total Paid / Payable</span>
            <span className="text-[#F97316] font-heading">{formatCurrency(order.total)}</span>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between text-xs text-[#6B7280] border-t border-[#F3F4F6]">
          <span>Placed: {formatDate(order.createdAt)}</span>
          <span>Estimated Prep: {order.estimatedTimeMinutes} mins</span>
        </div>
      </Card>

      {/* Footer Navigation */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="outline"
          className="w-full font-bold"
          leftIcon={<UtensilsCrossed className="w-4 h-4 text-[#F97316]" />}
          onClick={() => navigate('/')}
        >
          Return to Digital Menu
        </Button>
      </div>
    </div>
  );
};
