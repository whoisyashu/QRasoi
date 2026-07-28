import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useAuthStore } from '../../src/store/useAuthStore';
import { useOrderStore } from '../../src/store/useOrderStore';

export default function ChefKDSScreen() {
  const { user, logout } = useAuthStore();
  const { orders, fetchLiveOrders, toggleItemReady } = useOrderStore();

  useEffect(() => {
    if (user?.restaurantId) {
      fetchLiveOrders(user.restaurantId);
    }
  }, [user]);

  const preparingOrders = orders.filter(o => ['pending', 'preparing'].includes(o.status));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Kitchen KDS 👨‍🍳</Text>
            <Text style={styles.headerSubtitle}>Touch tickets to mark items ready</Text>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {preparingOrders.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>🎉 All Orders Completed!</Text>
            <Text style={styles.emptySubtitle}>No pending kitchen tickets right now.</Text>
          </View>
        ) : (
          preparingOrders.map((order) => (
            <View key={order.id} style={styles.ticketCard}>
              <View style={styles.ticketHeader}>
                <View>
                  <Text style={styles.orderRef}>Order #{order.order_ref || order.id.slice(0, 6)}</Text>
                  <Text style={styles.tableText}>Table: {order.table_number || 'Counter'}</Text>
                </View>
                <View style={styles.timerPill}>
                  <Text style={styles.timerText}>🔥 KITCHEN TICKET</Text>
                </View>
              </View>

              <View style={styles.itemsContainer}>
                {order.items?.map((item, idx) => {
                  const isReady = item.is_ready || order.notes?.includes(`[STATUS:READY:${item.item_name || item.name}]`);
                  return (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => toggleItemReady(order.id, idx)}
                      style={[styles.itemRow, isReady && styles.itemReadyRow]}
                    >
                      <View style={styles.itemInfo}>
                        <Text style={[styles.itemQty, isReady && styles.itemReadyText]}>{item.quantity}x</Text>
                        <Text style={[styles.itemName, isReady && styles.itemReadyText]}>
                          {item.item_name || item.name}
                        </Text>
                      </View>
                      <Text style={[styles.readyBadge, isReady ? styles.readyBadgeActive : styles.readyBadgePending]}>
                        {isReady ? 'READY ✓' : 'TAP READY'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {order.notes && !order.notes.includes('[STATUS:') && (
                <View style={styles.notesBox}>
                  <Text style={styles.notesTitle}>Special Instructions:</Text>
                  <Text style={styles.notesText}>{order.notes}</Text>
                </View>
              )}
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
  emptyCard: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 36,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#10B981',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#94A3B8',
  },
  ticketCard: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#EA580C',
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  orderRef: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  tableText: {
    fontSize: 13,
    color: '#F59E0B',
    fontWeight: '700',
    marginTop: 2,
  },
  timerPill: {
    backgroundColor: 'rgba(234, 88, 12, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EA580C',
  },
  timerText: {
    color: '#EA580C',
    fontWeight: '800',
    fontSize: 11,
  },
  itemsContainer: {
    gap: 8,
  },
  itemRow: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  itemReadyRow: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10B981',
  },
  itemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  itemQty: {
    fontSize: 16,
    fontWeight: '900',
    color: '#EA580C',
  },
  itemName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  itemReadyText: {
    color: '#10B981',
    textDecorationLine: 'line-through',
  },
  readyBadge: {
    fontWeight: '800',
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    overflow: 'hidden',
  },
  readyBadgePending: {
    backgroundColor: '#334155',
    color: '#CBD5E1',
  },
  readyBadgeActive: {
    backgroundColor: '#10B981',
    color: '#FFFFFF',
  },
  notesBox: {
    marginTop: 14,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  notesTitle: {
    color: '#F59E0B',
    fontWeight: '800',
    fontSize: 12,
    marginBottom: 2,
  },
  notesText: {
    color: '#FEF3C7',
    fontSize: 13,
    fontWeight: '600',
  },
});
