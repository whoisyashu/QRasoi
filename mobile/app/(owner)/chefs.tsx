import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Alert, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';

interface ChefStaff {
  id: string;
  name: string;
  pin: string;
  role: string;
  status: 'active' | 'revoked';
}

export default function ChefManagementScreen() {
  const router = useRouter();
  const [chefs, setChefs] = useState<ChefStaff[]>([
    { id: '1', name: 'Chef Ramesh Kumar', pin: '123456', role: 'Head Chef', status: 'active' },
    { id: '2', name: 'Chef Vikram Singh', pin: '654321', role: 'Sous Chef', status: 'active' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPin, setNewPin] = useState('');

  const handleAddChef = () => {
    if (!newName.trim() || newPin.length < 4) {
      Alert.alert('Validation Error', 'Please enter Chef Name and a valid 4 to 6-digit Security PIN.');
      return;
    }

    const newChef: ChefStaff = {
      id: `chef-${Date.now()}`,
      name: newName.trim(),
      pin: newPin.trim(),
      role: 'Line Chef',
      status: 'active',
    };

    setChefs(prev => [newChef, ...prev]);
    setIsModalOpen(false);
    setNewName('');
    setNewPin('');
    Alert.alert('Chef Added', `${newChef.name} can now log into Kitchen KDS using PIN: ${newChef.pin}`);
  };

  const handleRevoke = (id: string, name: string) => {
    Alert.alert('Revoke Access', `Are you sure you want to revoke PIN access for ${name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Revoke Access',
        style: 'destructive',
        onPress: () => setChefs(prev => prev.filter(c => c.id !== id)),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Back to Settings</Text>
          </TouchableOpacity>
          <View style={styles.titleRow}>
            <View>
              <Text style={styles.headerTitle}>Kitchen Staff PINs 👨‍🍳</Text>
              <Text style={styles.headerSubtitle}>Manage Security PINs for Kitchen KDS access</Text>
            </View>
            <TouchableOpacity onPress={() => setIsModalOpen(true)} style={styles.addBtn}>
              <Text style={styles.addBtnText}>+ Add Chef</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Chefs List */}
        {chefs.map(chef => (
          <View key={chef.id} style={styles.chefCard}>
            <View style={styles.chefInfo}>
              <Text style={styles.chefName}>{chef.name}</Text>
              <Text style={styles.chefRole}>{chef.role}</Text>
              <View style={styles.pinBox}>
                <Text style={styles.pinLabel}>PIN:</Text>
                <Text style={styles.pinValue}>{chef.pin}</Text>
              </View>
            </View>

            <TouchableOpacity onPress={() => handleRevoke(chef.id, chef.name)} style={styles.revokeBtn}>
              <Text style={styles.revokeText}>Revoke PIN</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Add Chef Modal */}
      <Modal visible={isModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Kitchen Staff 👨‍🍳</Text>

            <Text style={styles.formLabel}>Chef Full Name</Text>
            <TextInput
              value={newName}
              onChangeText={setNewName}
              placeholder="e.g. Chef Suresh Sharma"
              placeholderTextColor="#64748B"
              style={styles.formInput}
            />

            <Text style={styles.formLabel}>Kitchen Security PIN (4-6 Digits)</Text>
            <TextInput
              value={newPin}
              onChangeText={setNewPin}
              placeholder="123456"
              placeholderTextColor="#64748B"
              keyboardType="number-pad"
              maxLength={6}
              secureTextEntry
              style={[styles.formInput, styles.pinInput]}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setIsModalOpen(false)} style={styles.cancelModalBtn}>
                <Text style={styles.cancelModalText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAddChef} style={styles.saveModalBtn}>
                <Text style={styles.saveModalText}>Create Access</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  },
  addBtn: {
    backgroundColor: '#EA580C',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  chefCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  chefInfo: {
    flex: 1,
  },
  chefName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  chefRole: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
    marginBottom: 8,
  },
  pinBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0F172A',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  pinLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
  },
  pinValue: {
    color: '#EA580C',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 2,
  },
  revokeBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  revokeText: {
    color: '#EF4444',
    fontWeight: '800',
    fontSize: 11,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  formLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  formInput: {
    backgroundColor: '#0F172A',
    color: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
    fontSize: 14,
  },
  pinInput: {
    textAlign: 'center',
    fontSize: 22,
    letterSpacing: 6,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelModalBtn: {
    flex: 1,
    backgroundColor: '#0F172A',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  cancelModalText: {
    color: '#94A3B8',
    fontWeight: '700',
  },
  saveModalBtn: {
    flex: 1,
    backgroundColor: '#EA580C',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  saveModalText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
