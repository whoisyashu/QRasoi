import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IndianRupee,
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Utensils,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useOrderStore } from '../store/useOrderStore';
import { useAuthStore } from '../store/useAuthStore';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

import { useEffect } from 'react';
import { socketClient } from '../services/socket';

export const DashboardHomePage: React.FC = () => {
  const navigate = useNavigate();
  const { orders, fetchLiveOrders, initRealtimeSubscription, verifyPayment, updateOrderStatus } = useOrderStore();
  const { restaurant } = useAuthStore();

  useEffect(() => {
    fetchLiveOrders();
    initRealtimeSubscription();
    const restId = restaurant?.id || 'rest-dineverse-bistro-q4zpbu';
    socketClient.joinRestaurant(restId);
    console.log('⚡ [Owner Overview] Joined real-time restaurant room:', restId);
  }, [fetchLiveOrders, initRealtimeSubscription, restaurant?.id]);

  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled' && o.status !== 'expired')
    .reduce((sum, o) => sum + o.total, 0);

  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const preparingOrders = orders.filter((o) => o.status === 'preparing');
  const readyOrders = orders.filter((o) => o.status === 'ready');

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#334155] to-slate-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 bg-orange-500/20 text-orange-300 border border-orange-500/40 px-3 py-1 rounded-full text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Operational Mode: Active</span>
          </div>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
            Welcome back, {restaurant.name}!
          </h2>
          <p className="text-sm text-slate-300 max-w-xl">
            You have <strong className="text-amber-400 font-bold">{pendingOrders.length} pending orders</strong> awaiting counter payment verification.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 z-10 shrink-0">
          <Button
            variant="primary"
            size="md"
            leftIcon={<QrCode className="w-4 h-4" />}
            onClick={() => navigate('/dashboard/qr')}
          >
            Download QR Poster
          </Button>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 space-y-2 border-l-4 border-l-[#F97316]">
          <div className="flex items-center justify-between text-[#6B7280]">
            <span className="text-xs font-bold uppercase tracking-wider">Today's Revenue</span>
            <div className="p-2 bg-orange-50 text-[#F97316] rounded-xl">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <p className="font-heading font-extrabold text-3xl text-[#334155]">
            {formatCurrency(totalRevenue)}
          </p>
          <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
            Real-time calculated revenue
          </p>
        </Card>

        <Card className="p-6 space-y-2 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between text-[#6B7280]">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Payment</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <p className="font-heading font-extrabold text-3xl text-[#334155]">
            {pendingOrders.length}
          </p>
          <p className="text-xs text-amber-700 font-semibold">Needs owner verification</p>
        </Card>

        <Card className="p-6 space-y-2 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between text-[#6B7280]">
            <span className="text-xs font-bold uppercase tracking-wider">Preparing in Kitchen</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <p className="font-heading font-extrabold text-3xl text-[#334155]">
            {preparingOrders.length}
          </p>
          <p className="text-xs text-blue-700 font-semibold">Live in Chef queue</p>
        </Card>

        <Card className="p-6 space-y-2 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between text-[#6B7280]">
            <span className="text-xs font-bold uppercase tracking-wider">Ready for Pickup</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="font-heading font-extrabold text-3xl text-[#334155]">
            {readyOrders.length}
          </p>
          <p className="text-xs text-emerald-700 font-semibold">Ready at counter</p>
        </Card>
      </div>

      {/* Action Required Queue (Payment Verification) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading font-bold text-xl text-[#334155]">
              Incoming Orders Queue
            </h3>
            <p className="text-xs text-[#6B7280]">
              Verify payment at counter to push orders to the Chef (Rule 17)
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            rightIcon={<ArrowRight className="w-4 h-4" />}
            onClick={() => navigate('/dashboard/orders')}
          >
            View All Orders
          </Button>
        </div>

        {orders.length === 0 ? (
          <Card className="p-8 text-center text-sm text-[#6B7280]">
            <p className="font-bold text-[#334155] text-base mb-1">No orders received yet</p>
            <p className="text-xs text-[#6B7280]">
              Orders placed by customers via your digital QR menu will appear here in real-time.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {orders.slice(0, 4).map((order) => (
              <Card
                key={order.id}
                className={`p-5 flex flex-col justify-between gap-4 border-l-4 ${
                  order.status === 'pending'
                    ? 'border-l-amber-500 bg-amber-50/30'
                    : order.status === 'preparing'
                    ? 'border-l-blue-500'
                    : order.status === 'ready'
                    ? 'border-l-emerald-500'
                    : 'border-l-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-heading font-extrabold text-lg text-[#F97316]">
                        {order.id}
                      </h4>
                      <Badge status={order.status} />
                    </div>
                    <p className="text-xs text-[#334155] font-semibold mt-1">
                      {order.customerName} • {order.tableNumber}
                    </p>
                    <p className="text-[11px] text-[#6B7280]">{formatDate(order.createdAt)}</p>
                  </div>
                  <span className="font-heading font-bold text-lg text-[#111827]">
                    {formatCurrency(order.total)}
                  </span>
                </div>

                <div className="bg-white/80 border border-slate-200 rounded-xl p-3 text-xs space-y-1">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-[#334155]">
                      <span>
                        {item.quantity}x {item.menuItem.name}
                      </span>
                      <span className="font-semibold">
                        {formatCurrency(item.menuItem.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Status Action Buttons */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                  {order.status === 'pending' && (
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full font-bold"
                      onClick={() => verifyPayment(order.id)}
                    >
                      Verify Payment & Send to Chef →
                    </Button>
                  )}
                  {order.status === 'preparing' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={() => updateOrderStatus(order.id, 'ready')}
                    >
                      Mark Ready for Counter
                    </Button>
                  )}
                  {order.status === 'ready' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-emerald-500 text-emerald-700 hover:bg-emerald-50"
                      onClick={() => updateOrderStatus(order.id, 'completed')}
                    >
                      Complete Order
                    </Button>
                  )}
                  {order.status === 'completed' && (
                    <span className="text-xs text-slate-500 font-medium">Order Completed</span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
