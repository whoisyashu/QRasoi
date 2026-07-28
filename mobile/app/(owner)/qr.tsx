import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';

export default function TableQRScreen() {
  const router = useRouter();
  const [selectedTable, setSelectedTable] = useState('Table 1');
  const tables = ['Table 1', 'Table 2', 'Table 3', 'Table 4', 'Table 5', 'Takeaway Counter'];

  const targetUrl = `https://qrasoi.netlify.app/r/sample-cafe?table=${encodeURIComponent(selectedTable)}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(targetUrl)}`;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Back to Settings</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Table QR Generator 📱</Text>
          <Text style={styles.headerSubtitle}>Instant QR posters for dining tables</Text>
        </View>

        {/* Table Selector Pills */}
        <Text style={styles.sectionTitle}>Select Table Number</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tablesScroll} contentContainerStyle={styles.tablesContent}>
          {tables.map((tbl) => (
            <TouchableOpacity
              key={tbl}
              onPress={() => setSelectedTable(tbl)}
              style={[styles.tblPill, selectedTable === tbl && styles.tblPillActive]}
            >
              <Text style={[styles.tblText, selectedTable === tbl && styles.tblTextActive]}>{tbl}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Poster Card Preview */}
        <View style={styles.posterCard}>
          <Text style={styles.posterHeader}>SCAN FOR DIGITAL MENU</Text>
          <Text style={styles.posterSubHeader}>QRasoi Contactless Dining</Text>

          <View style={styles.qrContainer}>
            <Image
              source={{ uri: qrImageUrl }}
              style={styles.qrImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.tableBadge}>
            <Text style={styles.tableBadgeText}>{selectedTable.toUpperCase()}</Text>
          </View>

          <Text style={styles.urlText}>{targetUrl}</Text>
        </View>
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
  backBtn: {
    marginBottom: 12,
  },
  backBtnText: {
    color: '#EA580C',
    fontWeight: '700',
    fontSize: 14,
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  tablesScroll: {
    maxHeight: 52,
    marginBottom: 20,
  },
  tablesContent: {
    gap: 8,
  },
  tblPill: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#334155',
  },
  tblPillActive: {
    backgroundColor: '#EA580C',
    borderColor: '#EA580C',
  },
  tblText: {
    color: '#94A3B8',
    fontWeight: '700',
    fontSize: 12,
  },
  tblTextActive: {
    color: '#FFFFFF',
  },
  posterCard: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 24,
    borderWidth: 2,
    borderColor: '#EA580C',
    alignItems: 'center',
  },
  posterHeader: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
    textAlign: 'center',
  },
  posterSubHeader: {
    fontSize: 12,
    color: '#EA580C',
    fontWeight: '700',
    marginTop: 2,
    marginBottom: 20,
  },
  qrContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
  },
  qrImage: {
    width: 200,
    height: 200,
  },
  tableBadge: {
    backgroundColor: '#EA580C',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 12,
  },
  tableBadgeText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 16,
  },
  urlText: {
    color: '#64748B',
    fontSize: 11,
    textAlign: 'center',
  },
});
