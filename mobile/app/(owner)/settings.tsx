import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/useAuthStore';

export default function OwnerSettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const [restaurantName, setRestaurantName] = useState('QRasoi Bistro Outlet');
  const [tagline, setTagline] = useState('Multi-Cuisine Digital Dining');
  const [phone, setPhone] = useState('+91 9876543210');
  const [address, setAddress] = useState('Main Market Road, Block C, Connaught Place, New Delhi');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(true);
    Alert.alert('Settings Updated', 'Your restaurant outlet settings have been saved successfully.');
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Outlet Settings ⚙️</Text>
          <Text style={styles.headerSubtitle}>Manage profile, QR posters, kitchen staff PINs</Text>
        </View>

        {/* Quick Tools Row */}
        <Text style={styles.sectionTitle}>Management Shortcuts</Text>
        <View style={styles.toolsRow}>
          <TouchableOpacity onPress={() => router.push('/(owner)/qr')} style={styles.toolCard}>
            <Text style={styles.toolIcon}>📱</Text>
            <Text style={styles.toolTitle}>QR Posters</Text>
            <Text style={styles.toolSubtitle}>Table QR Generator</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/(owner)/chefs')} style={styles.toolCard}>
            <Text style={styles.toolIcon}>👨‍🍳</Text>
            <Text style={styles.toolTitle}>Chef PINs</Text>
            <Text style={styles.toolSubtitle}>Kitchen Staff Access</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Settings Form */}
        <Text style={styles.sectionTitle}>Restaurant Profile</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Restaurant Outlet Name</Text>
          <TextInput
            value={restaurantName}
            onChangeText={setRestaurantName}
            style={styles.input}
          />

          <Text style={styles.label}>Tagline</Text>
          <TextInput
            value={tagline}
            onChangeText={setTagline}
            style={styles.input}
          />

          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            style={styles.input}
          />

          <Text style={styles.label}>Full Address</Text>
          <TextInput
            value={address}
            onChangeText={setAddress}
            multiline
            numberOfLines={2}
            style={[styles.input, { height: 60 }]}
          />

          <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
            <Text style={styles.saveBtnText}>{isSaved ? '✓ Saved' : 'Save Changes'}</Text>
          </TouchableOpacity>
        </View>

        {/* Account Logout */}
        <View style={styles.logoutCard}>
          <Text style={styles.logoutEmail}>Logged in as: {user?.email || 'owner@qrasoi.app'}</Text>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <Text style={styles.logoutBtnText}>Logout Account</Text>
          </TouchableOpacity>
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
    marginBottom: 12,
  },
  toolsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  toolCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
  },
  toolIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  toolTitle: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  toolSubtitle: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 24,
  },
  label: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#0F172A',
    color: '#FFFFFF',
    padding: 14,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
    fontSize: 14,
  },
  saveBtn: {
    backgroundColor: '#EA580C',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  logoutCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
  },
  logoutEmail: {
    color: '#94A3B8',
    fontSize: 13,
    marginBottom: 12,
  },
  logoutBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: '#EF4444',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  logoutBtnText: {
    color: '#EF4444',
    fontWeight: '800',
    fontSize: 14,
  },
});
