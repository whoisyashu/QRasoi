import React, { useEffect, useState } from 'react';
import { useOrderStore } from '../store/useOrderStore';
import { formatCurrency, formatDate } from '../utils/formatters';
import { OrderStatus } from '../types';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Search, Filter, CheckCircle2, XCircle } from 'lucide-react';

export const OrdersManagementPage: React.FC = () => {
  const { orders, fetchLiveOrders, verifyPayment, updateOrderStatus, cancelOrder } = useOrderStore();

  const [selectedTab, setSelectedTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchLiveOrders();
    const interval = setInterval(() => {
      fetchLiveOrders();
    }, 3000);
    return () => clearInterval(interval);
  }, [fetchLiveOrders]);

  const filterTabs = [
    { id: 'all', label: 'All Orders', count: orders.length },
    { id: 'pending', label: 'Pending Payment', count: orders.filter((o) => o.status === 'pending').length },
    { id: 'preparing', label: 'Preparing', count: orders.filter((o) => o.status === 'preparing').length },
    { id: 'ready', label: 'Ready', count: orders.filter((o) => o.status === 'ready').length },
    { id: 'completed', label: 'Completed', count: orders.filter((o) => o.status === 'completed').length },
    { id: 'expired', label: 'Expired', count: orders.filter((o) => o.status === 'expired').length },
  ];

  const filteredOrders = orders.filter((order) => {
    const matchesTab = selectedTab === 'all' ? true : order.status === selectedTab;
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.tableNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading font-extrabold text-2xl text-[#334155]">Orders Queue & Verification</h2>
        <p className="text-xs text-[#6B7280]">
          Verify cash/UPI payments at counter, manage live order flow, or cancel orders.
        </p>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedTab === tab.id
                  ? 'bg-[#F97316] text-white shadow-sm'
                  : 'bg-white text-[#334155] border border-[#E5E7EB] hover:bg-slate-50'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  selectedTab === tab.id ? 'bg-white text-[#F97316]' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-3 text-[#6B7280]" />
          <input
            type="text"
            placeholder="Search Order ID or customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-3 text-xs bg-white border border-[#E5E7EB] rounded-2xl outline-none focus:border-[#F97316]"
          />
        </div>
      </div>

      {/* Orders List Grid */}
      {filteredOrders.length === 0 ? (
        <Card className="p-12 text-center text-sm text-[#6B7280]">
          No orders found matching your selected status or search.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="p-5 flex flex-col justify-between space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-heading font-extrabold text-lg text-[#F97316]">{order.id}</h4>
                  <p className="text-xs font-bold text-[#334155]">
                    {order.customerName} ({order.tableNumber})
                  </p>
                  <p className="text-[11px] text-[#6B7280]">{formatDate(order.createdAt)}</p>
                </div>
                <Badge status={order.status} />
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-[#334155]">
                    <span>
                      {item.quantity}x {item.menuItem.name}
                    </span>
                    <span className="font-semibold">{formatCurrency(item.menuItem.price * item.quantity)}</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm text-[#111827]">
                  <span>Total</span>
                  <span className="text-[#F97316] font-heading">{formatCurrency(order.total)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2">
                {order.status === 'pending' && (
                  <>
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-1 font-bold"
                      onClick={() => verifyPayment(order.id)}
                    >
                      Verify Payment
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-300 text-red-600 hover:bg-red-50"
                      onClick={() => cancelOrder(order.id)}
                    >
                      Cancel
                    </Button>
                  </>
                )}

                {order.status === 'preparing' && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => updateOrderStatus(order.id, 'ready')}
                  >
                    Mark Ready for Pickup
                  </Button>
                )}

                {order.status === 'ready' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-emerald-500 text-emerald-700 hover:bg-emerald-50"
                    onClick={() => updateOrderStatus(order.id, 'completed')}
                  >
                    Mark Completed
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
