import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useAuthStore } from '../../src/store/useAuthStore';
import { useOrderStore } from '../../src/store/useOrderStore';

export default function OwnerDashboardScreen() {
  const { user, logout } = useAuthStore();
  const { orders, fetchLiveOrders } = useOrderStore();

  useEffect(() => {
    if (user?.restaurantId) {
      fetchLiveOrders(user.restaurantId);
    }
  }, [user]);

  const activeOrdersCount = orders.filter(o => ['pending', 'preparing', 'ready'].includes(o.status)).length;
  const totalRevenue = orders
    .filter(o => o.status === 'completed' || o.payment_status === 'paid')
    .reduce((sum, o) => sum + (o.total_amount || 0), 0);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Owner Dashboard 📊</Text>
            <Text style={styles.headerSubtitle}>Logged in as {user?.name || user?.email}</Text>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.orangeCard]}>
            <Text style={styles.statLabel}>Active Live Orders</Text>
            <Text style={styles.statValueOrange}>{activeOrdersCount}</Text>
          </View>

          <View style={[styles.statCard, styles.emeraldCard]}>
            <Text style={styles.statLabel}>Today's Revenue</Text>
            <Text style={styles.statValueEmerald}>₹{totalRevenue.toFixed(0)}</Text>
          </View>
        </View>

        {/* Live Orders Section */}
        <Text style={styles.sectionTitle}>Recent Live Tickets ({orders.length})</Text>

        {orders.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No live order tickets yet today.</Text>
          </View>
        ) : (
          orders.map((order) => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderRef}>Order #{order.order_ref || order.id.slice(0, 6)}</Text>
                <View style={styles.statusPill}>
                  <Text style={styles.statusText}>{order.status.toUpperCase()}</Text>
                </View>
              </View>

              <Text style={styles.tableText}>Table: {order.table_number || 'Takeaway/Counter'}</Text>
              
              <View style={styles.itemsList}>
                {order.items?.map((item, idx) => (
                  <Text key={idx} style={styles.itemText}>
                    • {item.quantity}x {item.item_name || item.name} (₹{item.price})
                  </Text>
                ))}
              </View>

              <View style={styles.orderFooter}>
                <Text style={styles.totalText}>Total: ₹{order.total_amount}</Text>
                <Text style={styles.paymentText}>
                  {order.payment_status === 'paid' ? '✅ Paid' : '⏳ Counter Cash'}
                </Text>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  logoutText: {
    color: '#CBD5E1',
    fontWeight: '700',
    fontSize: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#334155',
  },
  orangeCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#EA580C',
  },
  emeraldCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  statLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  statValueOrange: {
    fontSize: 28,
    fontWeight: '900',
    color: '#EA580C',
  },
  statValueEmerald: {
    fontSize: 28,
    fontWeight: '900',
    color: '#10B981',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 16,
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
    fontWeight: '500',
  },
  orderCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderRef: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statusPill: {
    backgroundColor: 'rgba(234, 88, 12, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(234, 88, 12, 0.4)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#EA580C',
    fontWeight: '800',
    fontSize: 11,
  },
  tableText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
  },
  itemsList: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  itemText: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 4,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  paymentText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
  },
});
