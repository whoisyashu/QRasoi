import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Alert, StyleSheet, SafeAreaView } from 'react-native';
import { MenuItem } from '../../src/types';

export default function OwnerMenuScreen() {
  const [categories] = useState(['All', 'Starters', 'Main Course', 'Breads', 'Beverages', 'Desserts']);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    { id: '1', name: 'Paneer Butter Masala', categoryId: 'Main Course', price: 240, isVeg: true, isAvailable: true, description: 'Rich cottage cheese in tomato gravy.' },
    { id: '2', name: 'Garlic Naan', categoryId: 'Breads', price: 60, isVeg: true, isAvailable: true, description: 'Baking in clay oven with butter.' },
    { id: '3', name: 'Dal Makhani', categoryId: 'Main Course', price: 210, isVeg: true, isAvailable: true, description: 'Slow cooked black lentils.' },
    { id: '4', name: 'Crispy Veg Spring Roll', categoryId: 'Starters', price: 180, isVeg: true, isAvailable: false, description: 'Golden fried rolls with vegetables.' },
    { id: '5', name: 'Chicken Tikka', categoryId: 'Starters', price: 280, isVeg: false, isAvailable: true, description: 'Charcoal grilled spicy chicken chunks.' },
  ]);

  // Modal Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Main Course');
  const [newPrice, setNewPrice] = useState('');
  const [newIsVeg, setNewIsVeg] = useState(true);

  const toggleAvailability = (id: string) => {
    setMenuItems(prev =>
      prev.map(item => (item.id === id ? { ...item, isAvailable: !item.isAvailable } : item))
    );
  };

  const handleAddDish = () => {
    if (!newName.trim() || !newPrice.trim()) {
      Alert.alert('Validation Error', 'Please enter Dish Name and Price.');
      return;
    }

    const newItem: MenuItem = {
      id: `dish-${Date.now()}`,
      name: newName.trim(),
      categoryId: newCategory,
      price: Number(newPrice),
      isVeg: newIsVeg,
      isAvailable: true,
      description: 'Freshly prepared specialty dish.',
    };

    setMenuItems(prev => [newItem, ...prev]);
    setIsModalOpen(false);
    setNewName('');
    setNewPrice('');
  };

  const handleDeleteDish = (id: string, name: string) => {
    Alert.alert('Delete Dish', `Are you sure you want to delete ${name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => setMenuItems(prev => prev.filter(i => i.id !== id)),
      },
    ]);
  };

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = activeCategory === 'All' ? true : item.categoryId === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.headerTitle}>Menu Management 🍕</Text>
            <Text style={styles.headerSubtitle}>Manage dishes & toggle stock availability</Text>
          </View>
          <TouchableOpacity onPress={() => setIsModalOpen(true)} style={styles.addBtn}>
            <Text style={styles.addBtnText}>+ Add Dish</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search menu dishes..."
          placeholderTextColor="#64748B"
          style={styles.searchInput}
        />
      </View>

      {/* Category Pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll} contentContainerStyle={styles.catContent}>
        {categories.map(cat => (
          <TouchableOpacity
            key={cat}
            onPress={() => setActiveCategory(cat)}
            style={[styles.catPill, activeCategory === cat && styles.catPillActive]}
          >
            <Text style={[styles.catText, activeCategory === cat && styles.catTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Menu List */}
      <ScrollView style={styles.menuScroll} contentContainerStyle={styles.menuContent}>
        {filteredItems.map(item => (
          <View key={item.id} style={styles.dishCard}>
            <View style={styles.dishDetails}>
              <View style={styles.badgeRow}>
                <Text style={item.isVeg ? styles.vegBadge : styles.nonVegBadge}>
                  {item.isVeg ? '🟢 VEG' : '🔴 NON-VEG'}
                </Text>
                <Text style={styles.categoryText}>{item.categoryId}</Text>
              </View>

              <Text style={styles.dishName}>{item.name}</Text>
              <Text style={styles.dishPrice}>₹{item.price}</Text>
            </View>

            <View style={styles.actionCol}>
              <TouchableOpacity
                onPress={() => toggleAvailability(item.id)}
                style={[styles.stockBtn, item.isAvailable ? styles.inStockBtn : styles.outOfStockBtn]}
              >
                <Text style={[styles.stockBtnText, item.isAvailable ? styles.inStockText : styles.outOfStockText]}>
                  {item.isAvailable ? 'In Stock ✓' : 'Out of Stock ✕'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleDeleteDish(item.id, item.name)}
                style={styles.deleteBtn}
              >
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Add Dish Modal */}
      <Modal visible={isModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Menu Item 🍲</Text>

            <Text style={styles.formLabel}>Dish Name</Text>
            <TextInput
              value={newName}
              onChangeText={setNewName}
              placeholder="e.g. Kadai Paneer"
              placeholderTextColor="#64748B"
              style={styles.formInput}
            />

            <Text style={styles.formLabel}>Price (₹)</Text>
            <TextInput
              value={newPrice}
              onChangeText={setNewPrice}
              placeholder="220"
              placeholderTextColor="#64748B"
              keyboardType="number-pad"
              style={styles.formInput}
            />

            <Text style={styles.formLabel}>Dietary Type</Text>
            <View style={styles.dietaryRow}>
              <TouchableOpacity
                onPress={() => setNewIsVeg(true)}
                style={[styles.dietaryBtn, newIsVeg && styles.dietaryBtnActive]}
              >
                <Text style={styles.dietaryText}>🟢 Vegetarian</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setNewIsVeg(false)}
                style={[styles.dietaryBtn, !newIsVeg && styles.dietaryBtnActiveNonVeg]}
              >
                <Text style={styles.dietaryText}>🔴 Non-Veg</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setIsModalOpen(false)} style={styles.cancelModalBtn}>
                <Text style={styles.cancelModalText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAddDish} style={styles.saveModalBtn}>
                <Text style={styles.saveModalText}>Save Dish</Text>
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
  header: {
    padding: 20,
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
  searchInput: {
    backgroundColor: '#0F172A',
    color: '#FFFFFF',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
    fontSize: 13,
  },
  catScroll: {
    maxHeight: 52,
    backgroundColor: '#0F172A',
  },
  catContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  catPill: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#334155',
  },
  catPillActive: {
    backgroundColor: '#EA580C',
    borderColor: '#EA580C',
  },
  catText: {
    color: '#94A3B8',
    fontWeight: '700',
    fontSize: 12,
  },
  catTextActive: {
    color: '#FFFFFF',
  },
  menuScroll: {
    flex: 1,
  },
  menuContent: {
    padding: 16,
  },
  dishCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  dishDetails: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  vegBadge: {
    color: '#10B981',
    fontWeight: '800',
    fontSize: 10,
  },
  nonVegBadge: {
    color: '#EF4444',
    fontWeight: '800',
    fontSize: 10,
  },
  categoryText: {
    color: '#64748B',
    fontWeight: '600',
    fontSize: 11,
  },
  dishName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  dishPrice: {
    fontSize: 16,
    fontWeight: '900',
    color: '#EA580C',
  },
  actionCol: {
    gap: 8,
    alignItems: 'flex-end',
  },
  stockBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  inStockBtn: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10B981',
  },
  outOfStockBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: '#EF4444',
  },
  stockBtnText: {
    fontSize: 11,
    fontWeight: '800',
  },
  inStockText: {
    color: '#10B981',
  },
  outOfStockText: {
    color: '#EF4444',
  },
  deleteBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  deleteText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
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
  dietaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  dietaryBtn: {
    flex: 1,
    backgroundColor: '#0F172A',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  dietaryBtnActive: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  dietaryBtnActiveNonVeg: {
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  dietaryText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
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
