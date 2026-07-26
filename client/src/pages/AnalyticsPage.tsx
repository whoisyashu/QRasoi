import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
} from 'recharts';
import { TrendingUp, DollarSign, ShoppingBag, BarChart3 } from 'lucide-react';
import { useOrderStore } from '../store/useOrderStore';
import { formatCurrency } from '../utils/formatters';
import { Card } from '../components/ui/Card';

export const AnalyticsPage: React.FC = () => {
  const { orders } = useOrderStore();

  const completedOrders = orders.filter((o) => o.status !== 'cancelled' && o.status !== 'expired');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);
  const totalOrdersCount = completedOrders.length;
  const avgOrderValue = totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;

  // Build real dynamic dish sales counts
  const dishSalesMap: Record<string, number> = {};
  completedOrders.forEach((order) => {
    order.items.forEach((item) => {
      dishSalesMap[item.menuItem.name] = (dishSalesMap[item.menuItem.name] || 0) + item.quantity;
    });
  });

  const topDishesData = Object.entries(dishSalesMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-heading font-extrabold text-2xl text-[#334155]">Sales & Menu Analytics</h2>
        <p className="text-xs text-[#6B7280]">
          Track verified sales performance, top selling dishes, and revenue trends in real-time.
        </p>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="p-6 space-y-2 border-l-4 border-l-[#F97316]">
          <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Total Sales Revenue</span>
          <p className="font-heading font-extrabold text-3xl text-[#334155]">
            {formatCurrency(totalRevenue)}
          </p>
          <p className="text-xs text-emerald-600 font-semibold">Verified counter payments</p>
        </Card>

        <Card className="p-6 space-y-2 border-l-4 border-l-blue-500">
          <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Total Verified Orders</span>
          <p className="font-heading font-extrabold text-3xl text-[#334155]">
            {totalOrdersCount} Orders
          </p>
          <p className="text-xs text-blue-600 font-semibold">Avg {formatCurrency(avgOrderValue)} per order</p>
        </Card>

        <Card className="p-6 space-y-2 border-l-4 border-l-emerald-500">
          <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Top Bestselling Dish</span>
          <p className="font-heading font-extrabold text-2xl text-[#334155]">
            {topDishesData.length > 0 ? topDishesData[0].name : 'No sales yet'}
          </p>
          <p className="text-xs text-emerald-600 font-semibold">
            {topDishesData.length > 0 ? `${topDishesData[0].count} orders sold` : 'Awaiting first order'}
          </p>
        </Card>
      </div>

      {/* Bestselling Dishes Chart & Empty State */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-[#334155] flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#F97316]" />
            <span>Top Selling Dishes by Quantity</span>
          </h3>
        </div>

        {topDishesData.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 border border-slate-200 rounded-2xl">
            <BarChart3 className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <p className="font-bold text-sm text-[#334155]">Analytics Will Appear Here</p>
            <p className="text-xs text-[#6B7280] max-w-sm mx-auto mt-1">
              Once customers place orders and you verify payments at your counter, real sales charts will render automatically.
            </p>
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topDishesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
                <YAxis stroke="#6B7280" fontSize={12} />
                <RechartsTooltip />
                <Bar dataKey="count" fill="#F97316" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
    </div>
  );
};
