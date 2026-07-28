import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, StyleSheet, SafeAreaView } from 'react-native';
import { useOrderStore } from '../../src/store/useOrderStore';
import { useAuthStore } from '../../src/store/useAuthStore';

export default function OwnerOrdersScreen() {
  const { user } = useAuthStore();
  const { orders, fetchLiveOrders, updateOrderItemStatus, cancelOrder } = useOrderStore();

  const [selectedTab, setSelectedTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user?.restaurantId) {
      fetchLiveOrders(user.restaurantId);
      const interval = setInterval(() => {
        fetchLiveOrders(user.restaurantId!);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const filterTabs = [
    { id: 'all', label: 'All', count: orders.length },
    { id: 'pending', label: 'Pending', count: orders.filter(o => o.status === 'pending').length },
    { id: 'preparing', label: 'Preparing', count: orders.filter(o => o.status === 'preparing').length },
    { id: 'ready', label: 'Ready', count: orders.filter(o => o.status === 'ready').length },
    { id: 'completed', label: 'Completed', count: orders.filter(o => o.status === 'completed').length },
    { id: 'cancelled', label: 'Cancelled', count: orders.filter(o => o.status === 'cancelled').length },
  ];

  const filteredOrders = orders.filter((order) => {
    const matchesTab = selectedTab === 'all' ? true : order.status === selectedTab;
    const matchesSearch =
      (order.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.customerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.tableNumber || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleCancelOrder = (orderId: string) => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order ticket?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => cancelOrder(orderId),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Orders Queue 🧾</Text>
        <Text style={styles.headerSubtitle}>Real-time counter & table order verification</Text>

        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search Order ID, customer, or table..."
          placeholderTextColor="#64748B"
          style={styles.searchInput}
        />
      </View>

      {/* Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll} contentContainerStyle={styles.tabsContent}>
        {filterTabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            onPress={() => setSelectedTab(tab.id)}
            style={[styles.tabPill, selectedTab === tab.id && styles.tabPillActive]}
          >
            <Text style={[styles.tabText, selectedTab === tab.id && styles.tabTextActive]}>
              {tab.label} ({tab.count})
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Orders List */}
      <ScrollView style={styles.ordersScroll} contentContainerStyle={styles.ordersContent}>
        {filteredOrders.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No orders match your filter criteria.</Text>
          </View>
        ) : (
          filteredOrders.map((order) => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <View>
                  <Text style={styles.orderRef}>Order #{order.order_ref || order.id.slice(0, 6)}</Text>
                  <Text style={styles.customerText}>
                    {order.customerName || 'Guest'} • {order.tableNumber || order.table_number || 'Counter'}
                  </Text>
                </View>

                <View style={styles.statusPill}>
                  <Text style={styles.statusText}>{order.status.toUpperCase()}</Text>
                </View>
              </View>

              {/* Items List */}
              <View style={styles.itemsBox}>
                {order.items?.map((item, idx) => (
                  <View key={idx} style={styles.itemRow}>
                    <Text style={styles.itemName}>
                      {item.quantity}x {item.item_name || item.name}
                    </Text>
                    <Text style={styles.itemPrice}>₹{(item.price || 0) * item.quantity}</Text>
                  </View>
                ))}
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total Amount</Text>
                  <Text style={styles.totalValue}>₹{order.total_amount || order.total || 0}</Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionsRow}>
                {order.status === 'pending' && (
                  <TouchableOpacity
                    onPress={() => handleCancelOrder(order.id)}
                    style={styles.cancelBtn}
                  >
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    padding: 20,
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: '#0F172A',
    color: '#FFFFFF',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
    fontSize: 13,
  },
  tabsScroll: {
    maxHeight: 52,
    backgroundColor: '#0F172A',
  },
  tabsContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  tabPill: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#334155',
  },
  tabPillActive: {
    backgroundColor: '#EA580C',
    borderColor: '#EA580C',
  },
  tabText: {
    color: '#94A3B8',
    fontWeight: '700',
    fontSize: 12,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  ordersScroll: {
    flex: 1,
  },
  ordersContent: {
    padding: 16,
  },
  emptyCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  orderCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderRef: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  customerText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 2,
  },
  statusPill: {
    backgroundColor: 'rgba(234, 88, 12, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(234, 88, 12, 0.4)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    color: '#EA580C',
    fontWeight: '800',
    fontSize: 11,
  },
  itemsBox: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  itemName: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '500',
  },
  itemPrice: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  totalLabel: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  totalValue: {
    color: '#EA580C',
    fontWeight: '900',
    fontSize: 15,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
  },
  cancelBtnText: {
    color: '#EF4444',
    fontWeight: '800',
    fontSize: 13,
  },
});
