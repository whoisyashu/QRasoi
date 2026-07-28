import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useOrderStore } from '../../src/store/useOrderStore';
import { useAuthStore } from '../../src/store/useAuthStore';
import { socketService } from '../../src/services/socket.service';

export default function ChefKDSScreen() {
  const { user, logout } = useAuthStore();
  const { orders, fetchLiveOrders, updateOrderItemStatus, isLoading } = useOrderStore();
  const restaurantId = user?.restaurantId || 'demo-restaurant-id';

  useEffect(() => {
    fetchLiveOrders(restaurantId);
    socketService.joinRestaurantRoom(restaurantId);

    socketService.onOrderCreated(() => fetchLiveOrders(restaurantId));
    socketService.onOrderStatusUpdated(() => fetchLiveOrders(restaurantId));
  }, [restaurantId]);

  const activeOrders = orders.filter((o) => o.status === 'pending' || o.status === 'preparing');

  return (
    <ScrollView
      className="flex-1 bg-slate-900 p-4"
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => fetchLiveOrders(restaurantId)} tintColor="#EA580C" />}
    >
      <View className="flex-row justify-between items-center mb-6 pt-4">
        <View>
          <Text className="text-white text-2xl font-black">👨‍🍳 Kitchen Display System</Text>
          <Text className="text-slate-400 text-xs">Real-time Order Processing</Text>
        </View>
        <View className="flex-row items-center space-x-2">
          <View className="bg-brand-600 px-4 py-2 rounded-full">
            <Text className="text-white font-bold">{activeOrders.length} Active Tickets</Text>
          </View>
          <TouchableOpacity onPress={logout} className="bg-slate-800 border border-slate-700 px-3 py-2 rounded-xl">
            <Text className="text-slate-300 font-bold text-xs">Exit</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-row flex-wrap justify-between">
        {activeOrders.map((order) => (
          <View key={order.id} className="w-full md:w-[48%] bg-slate-800 rounded-2xl p-5 mb-5 border border-slate-700 shadow-lg">
            <View className="flex-row justify-between items-center border-b border-slate-700 pb-3 mb-4">
              <View>
                <Text className="text-brand-500 font-mono font-bold text-lg">{order.id}</Text>
                <Text className="text-slate-400 text-xs">Customer: {order.customerName}</Text>
              </View>
              <View className="bg-slate-700 px-3 py-1 rounded-lg">
                <Text className="text-white font-black text-sm">Table {order.tableNumber}</Text>
              </View>
            </View>

            {order.items.map((item) => {
              const isReady = item.status === 'ready' || item.notes?.includes('[STATUS:READY]');
              return (
                <View key={item.id} className="flex-row justify-between items-center py-3 border-b border-slate-700/50">
                  <View className="flex-1 pr-3">
                    <Text className="text-white font-bold text-base">{item.quantity}x {item.menuItem?.name || 'Dish'}</Text>
                    {item.notes ? <Text className="text-brand-500 italic text-xs mt-1">Note: {item.notes}</Text> : null}
                  </View>

                  <TouchableOpacity
                    onPress={() => updateOrderItemStatus(order.id, item.id, isReady ? 'preparing' : 'ready')}
                    className={`px-4 py-3 rounded-xl ${isReady ? 'bg-emerald-600' : 'bg-brand-600'}`}
                  >
                    <Text className="text-white font-bold text-sm">
                      {isReady ? 'Ready ✓' : 'Mark Ready'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
