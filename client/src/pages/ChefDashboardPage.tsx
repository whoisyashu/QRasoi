import React, { useEffect, useRef } from 'react';
import { ChefHat, Clock, CheckCircle2, Flame, RefreshCw, Check } from 'lucide-react';
import { useOrderStore } from '../store/useOrderStore';
import { formatDate } from '../utils/formatters';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { triggerNotification } from '../utils/notificationSound';

export const ChefDashboardPage: React.FC = () => {
  const { orders, fetchLiveOrders, updateOrderStatus, updateOrderItemStatus } = useOrderStore();
  const prevPreparingRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    fetchLiveOrders();
    const interval = setInterval(() => {
      fetchLiveOrders();
    }, 3000);
    return () => clearInterval(interval);
  }, [fetchLiveOrders]);

  // Chef ONLY sees payment-verified orders (Rule 18)
  const paidOrders = orders.filter((o) => o.isPaymentVerified && o.status !== 'cancelled');

  // Orders currently preparing (or orders with items still being cooked)
  const preparingOrders = paidOrders.filter(
    (o) => o.status === 'preparing' || (o.status === 'pending' && o.isPaymentVerified)
  );

  // Notify chef when an order enters kitchen preparing queue
  useEffect(() => {
    const currentPreparingIds = new Set(preparingOrders.map((o) => o.id));

    if (prevPreparingRef.current.size > 0) {
      const newlyArrived = preparingOrders.filter((o) => !prevPreparingRef.current.has(o.id));
      if (newlyArrived.length > 0) {
        const target = newlyArrived[0];
        triggerNotification(
          '👨‍🍳 New Order Ready to Cook!',
          `Order ${target.id} (${target.tableNumber}) payment verified. Start preparing!`
        );
      }
    }

    prevPreparingRef.current = currentPreparingIds;
  }, [preparingOrders]);

  // Orders where ALL items are marked ready
  const readyOrders = paidOrders.filter((o) => o.status === 'ready');

  // Orders marked completed
  const completedOrders = paidOrders.filter((o) => o.status === 'completed');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-800 p-4 sm:p-6 rounded-2xl border border-slate-700">
        <div>
          <h2 className="font-heading font-extrabold text-2xl text-white flex items-center gap-2">
            <ChefHat className="w-6 h-6 text-orange-400" />
            Kitchen Order Execution Board (KDS)
          </h2>
          <p className="text-xs text-slate-400">
            Real-time itemized cooking queue. Mark individual dishes ready as they finish cooking.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-bold">
          <span className="bg-blue-500/20 text-blue-300 px-3 py-1.5 rounded-full border border-blue-500/40">
            Preparing: {preparingOrders.length}
          </span>
          <span className="bg-emerald-500/20 text-emerald-300 px-3 py-1.5 rounded-full border border-emerald-500/40">
            Ready for Counter: {readyOrders.length}
          </span>
          <button
            onClick={() => fetchLiveOrders()}
            className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors cursor-pointer"
            title="Refresh KDS Queue"
          >
            <RefreshCw className="w-4 h-4 text-orange-400" />
          </button>
        </div>
      </div>

      {/* 3 Column KDS Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Column 1: Preparing in Kitchen (Item-by-Item Cooking) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-blue-900/40 border border-blue-700/50 p-3.5 rounded-2xl text-blue-200">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Flame className="w-4 h-4 text-blue-400" />
              <span>1. Preparing in Kitchen</span>
            </h3>
            <span className="bg-blue-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
              {preparingOrders.length}
            </span>
          </div>

          {preparingOrders.length === 0 ? (
            <div className="p-8 text-center bg-slate-800/50 border border-slate-700 rounded-2xl text-xs text-slate-400">
              No active cooking orders right now.
            </div>
          ) : (
            preparingOrders.map((order) => {
              const readyItemsCount = order.items.filter((i) => i.status === 'ready').length;
              const totalItemsCount = order.items.length;

              return (
                <Card
                  key={order.id}
                  className="bg-slate-800 border-2 border-blue-500 text-white p-5 space-y-4 shadow-xl"
                >
                  <div className="flex items-start justify-between border-b border-slate-700 pb-3">
                    <div>
                      <span className="font-heading font-extrabold text-2xl text-orange-400">
                        {order.id}
                      </span>
                      <p className="text-xs text-slate-300 font-semibold">{order.tableNumber}</p>
                      <p className="text-[10px] text-slate-400">{formatDate(order.createdAt, 'hh:mm a')}</p>
                    </div>
                    <span className="px-2.5 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-bold border border-blue-400/40">
                      {readyItemsCount}/{totalItemsCount} Items Ready
                    </span>
                  </div>

                  {/* Individual Items List */}
                  <div className="space-y-2">
                    {order.items.map((item, idx) => {
                      const isItemReady = item.status === 'ready';
                      const itemId = item.id || item.menuItem.id;

                      return (
                        <div
                          key={idx}
                          className={`p-3 rounded-xl flex items-center justify-between gap-2 transition-all ${
                            isItemReady
                              ? 'bg-emerald-950/60 border border-emerald-800/60 text-emerald-200'
                              : 'bg-slate-900 border border-slate-700 text-white'
                          }`}
                        >
                          <div className="space-y-0.5">
                            <div className="text-sm font-bold flex items-center gap-1.5">
                              <span className="text-orange-400 font-extrabold text-base">
                                {item.quantity}x
                              </span>
                              <span className={isItemReady ? 'line-through opacity-80' : ''}>
                                {item.menuItem.name}
                              </span>
                            </div>
                            {item.notes && (
                              <p className="text-[11px] text-amber-300 font-medium">Note: {item.notes}</p>
                            )}
                          </div>

                          {isItemReady ? (
                            <span className="px-2.5 py-1 bg-emerald-600/30 text-emerald-300 rounded-lg text-xs font-bold flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" /> Ready
                            </span>
                          ) : (
                            <button
                              onClick={() => updateOrderItemStatus(order.id, itemId, 'ready')}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer whitespace-nowrap"
                            >
                              Mark Ready ✓
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Quick Option to Mark Whole Order Ready */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-blue-500 text-blue-300 hover:bg-blue-900/40 font-bold"
                    onClick={() => updateOrderStatus(order.id, 'ready')}
                  >
                    Mark All Dishes Ready →
                  </Button>
                </Card>
              );
            })
          )}
        </div>

        {/* Column 2: Ready for Pickup / Counter */}
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-emerald-900/40 border border-emerald-700/50 p-3.5 rounded-2xl text-emerald-200">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>2. Ready for Pickup</span>
            </h3>
            <span className="bg-emerald-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
              {readyOrders.length}
            </span>
          </div>

          {readyOrders.length === 0 ? (
            <div className="p-8 text-center bg-slate-800/50 border border-slate-700 rounded-2xl text-xs text-slate-400">
              No orders waiting for counter pickup.
            </div>
          ) : (
            readyOrders.map((order) => (
              <Card
                key={order.id}
                className="bg-slate-800 border-2 border-emerald-500 text-white p-5 space-y-4 shadow-xl"
              >
                <div className="flex items-start justify-between border-b border-slate-700 pb-3">
                  <div>
                    <span className="font-heading font-extrabold text-2xl text-emerald-400">
                      {order.id}
                    </span>
                    <p className="text-xs text-slate-300 font-semibold">{order.tableNumber}</p>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-bold border border-emerald-400/40">
                    All Dishes Ready
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-emerald-300">
                      <span>
                        {item.quantity}x {item.menuItem.name}
                      </span>
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  ))}
                </div>

                <Button
                  variant="primary"
                  size="md"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 font-bold"
                  onClick={() => updateOrderStatus(order.id, 'completed')}
                >
                  Complete Order ✓
                </Button>
              </Card>
            ))
          )}
        </div>

        {/* Column 3: Recently Completed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-800 border border-slate-700 p-3.5 rounded-2xl text-slate-300">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>3. Recently Completed</span>
            </h3>
            <span className="bg-slate-700 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
              {completedOrders.length}
            </span>
          </div>

          {completedOrders.length === 0 ? (
            <div className="p-8 text-center bg-slate-800/50 border border-slate-700 rounded-2xl text-xs text-slate-400">
              No completed orders yet.
            </div>
          ) : (
            completedOrders.slice(0, 8).map((order) => (
              <div key={order.id} className="bg-slate-800/60 border border-slate-700 p-4 rounded-2xl space-y-1 text-xs text-slate-400">
                <div className="flex justify-between font-bold text-slate-300 text-sm">
                  <span>{order.id}</span>
                  <span>{order.tableNumber}</span>
                </div>
                <p className="text-[11px] text-emerald-400">Completed & Served</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
