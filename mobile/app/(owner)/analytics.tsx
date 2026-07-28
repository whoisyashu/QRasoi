import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { useOrderStore } from '../../src/store/useOrderStore';

export default function OwnerAnalyticsScreen() {
  const { orders } = useOrderStore();

  const completedOrders = orders.filter(o => o.status === 'completed' || o.payment_status === 'paid');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.total_amount || o.total || 0), 0);
  const avgOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;

  const topDishes = [
    { name: 'Paneer Butter Masala', count: 48, revenue: 11520 },
    { name: 'Garlic Naan', count: 92, revenue: 5520 },
    { name: 'Dal Makhani', count: 36, revenue: 7560 },
    { name: 'Crispy Spring Roll', count: 24, revenue: 4320 },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Sales Analytics 📈</Text>
          <Text style={styles.headerSubtitle}>Real-time sales performance & revenue breakdown</Text>
        </View>

        {/* Revenue Summary Cards */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Sales Revenue</Text>
          <Text style={styles.summaryValue}>₹{totalRevenue.toFixed(0)}</Text>
          <Text style={styles.summarySubtext}>Based on {completedOrders.length} verified orders</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Completed Orders</Text>
            <Text style={styles.statValue}>{completedOrders.length}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Avg Order Value</Text>
            <Text style={styles.statValue}>₹{avgOrderValue.toFixed(0)}</Text>
          </View>
        </View>

        {/* Payment Breakdown */}
        <Text style={styles.sectionTitle}>Payment Method Breakdown</Text>
        <View style={styles.card}>
          <View style={styles.payRow}>
            <Text style={styles.payLabel}>📲 UPI / QR Direct Payment</Text>
            <Text style={styles.payValue}>78%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: '78%' }]} />
          </View>

          <View style={[styles.payRow, { marginTop: 14 }]}>
            <Text style={styles.payLabel}>💵 Cash at Counter</Text>
            <Text style={styles.payValue}>22%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFillCash, { width: '22%' }]} />
          </View>
        </View>

        {/* Top Dishes */}
        <Text style={styles.sectionTitle}>Top Selling Dishes 🌟</Text>
        {topDishes.map((dish, idx) => (
          <View key={idx} style={styles.dishRankCard}>
            <View style={styles.rankBadge}>
              <Text style={styles.rankText}>#{idx + 1}</Text>
            </View>
            <View style={styles.dishRankInfo}>
              <Text style={styles.dishRankName}>{dish.name}</Text>
              <Text style={styles.dishRankCount}>{dish.count} orders sold</Text>
            </View>
            <Text style={styles.dishRankRevenue}>₹{dish.revenue}</Text>
          </View>
        ))}
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
    marginBottom: 20,
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
  },
  summaryCard: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#334155',
    borderLeftWidth: 6,
    borderLeftColor: '#EA580C',
    marginBottom: 14,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  summarySubtext: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  statLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '700',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#EA580C',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 24,
  },
  payRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  payLabel: {
    color: '#CBD5E1',
    fontWeight: '700',
    fontSize: 13,
  },
  payValue: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 13,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#0F172A',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#EA580C',
    borderRadius: 4,
  },
  progressBarFillCash: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  dishRankCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(234, 88, 12, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    color: '#EA580C',
    fontWeight: '900',
    fontSize: 14,
  },
  dishRankInfo: {
    flex: 1,
  },
  dishRankName: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  dishRankCount: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  dishRankRevenue: {
    color: '#10B981',
    fontWeight: '900',
    fontSize: 15,
  },
});
