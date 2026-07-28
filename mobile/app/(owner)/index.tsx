import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useOrderStore } from '../../src/store/useOrderStore';
import { useAuthStore } from '../../src/store/useAuthStore';

export default function OwnerDashboardScreen() {
  const { user, logout } = useAuthStore();
  const { orders, fetchLiveOrders, isLoading } = useOrderStore();
  const restaurantId = user?.restaurantId || 'demo-restaurant-id';

  useEffect(() => {
    fetchLiveOrders(restaurantId);
  }, [restaurantId]);

  const totalRevenue = orders.reduce((sum, o) => sum + (o.paymentStatus === 'paid' ? o.total : 0), 0);
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;

  return (
    <ScrollView
      className="flex-1 bg-slate-900 p-5"
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => fetchLiveOrders(restaurantId)} tintColor="#EA580C" />}
    >
      <View className="flex-row justify-between items-center mb-6 pt-10">
        <View>
          <Text className="text-white text-2xl font-black">Owner Dashboard 📊</Text>
          <Text className="text-slate-400 text-xs">Welcome back, {user?.name || 'Owner'}</Text>
        </View>
        <TouchableOpacity onPress={logout} className="bg-slate-800 border border-slate-700 px-3 py-2 rounded-xl">
          <Text className="text-slate-300 font-bold text-xs">Logout</Text>
        </TouchableOpacity>
      </View>

      {/* KPI Cards */}
      <View className="flex-row justify-between mb-6">
        <View className="w-[48%] bg-slate-800 border border-slate-700 p-5 rounded-2xl">
          <Text className="text-slate-400 font-bold text-xs uppercase mb-1">Today's Revenue</Text>
          <Text className="text-brand-500 font-black text-2xl">₹{totalRevenue.toFixed(2)}</Text>
        </View>

        <View className="w-[48%] bg-slate-800 border border-slate-700 p-5 rounded-2xl">
          <Text className="text-slate-400 font-bold text-xs uppercase mb-1">Pending Orders</Text>
          <Text className="text-white font-black text-2xl">{pendingOrders}</Text>
        </View>
      </View>

      {/* Recent Orders List */}
      <Text className="text-white font-bold text-lg mb-4">Live Restaurant Orders</Text>
      {orders.length === 0 ? (
        <View className="bg-slate-800 border border-slate-700 p-8 rounded-2xl items-center">
          <Text className="text-slate-400 font-bold">No active orders right now ✨</Text>
        </View>
      ) : (
        orders.map((order) => (
          <View key={order.id} className="bg-slate-800 border border-slate-700 p-4 rounded-xl mb-3 flex-row justify-between items-center">
            <View>
              <Text className="text-white font-bold">{order.id} • Table {order.tableNumber}</Text>
              <Text className="text-slate-400 text-xs mt-1">{order.items.length} Items • ₹{order.total.toFixed(2)}</Text>
            </View>
            <View className="bg-brand-600/20 border border-brand-500/40 px-3 py-1 rounded-full">
              <Text className="text-brand-500 font-bold text-xs uppercase">{order.status}</Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}
