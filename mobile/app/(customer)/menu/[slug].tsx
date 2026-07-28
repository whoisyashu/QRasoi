import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, SafeAreaView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useCartStore } from '../../../src/store/useCartStore';

export default function CustomerMenuScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { items, addItem, removeItem, getTotal } = useCartStore();

  const [categories] = useState(['All Items', 'Starters', 'Main Course', 'Breads', 'Beverages', 'Desserts']);
  const [activeCategory, setActiveCategory] = useState('All Items');

  const sampleMenu = [
    { id: '1', name: 'Paneer Butter Masala', category: 'Main Course', price: 240, isVeg: true, description: 'Rich cottage cheese in creamy tomato gravy.' },
    { id: '2', name: 'Garlic Naan', category: 'Breads', price: 60, isVeg: true, description: 'Freshly baked tandoori naan brushed with garlic butter.' },
    { id: '3', name: 'Dal Makhani', category: 'Main Course', price: 210, isVeg: true, description: 'Slow cooked black lentils with cream and spices.' },
    { id: '4', name: 'Crispy Veg Spring Roll', category: 'Starters', price: 180, isVeg: true, description: 'Golden fried rolls with spicy vegetable filling.' },
    { id: '5', name: 'Masala Chai', category: 'Beverages', price: 30, isVeg: true, description: 'Authentic Indian spiced hot tea.' },
  ];

  const filteredMenu = activeCategory === 'All Items'
    ? sampleMenu
    : sampleMenu.filter(item => item.category === activeCategory);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Banner */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>QRasoi Digital Menu 🍽️</Text>
        <Text style={styles.headerSubtitle}>Outlet: {slug || 'Sample Restaurant'}</Text>
      </View>

      {/* Category Horizontal Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll} contentContainerStyle={styles.catContent}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setActiveCategory(cat)}
            style={[styles.catPill, activeCategory === cat && styles.catPillActive]}
          >
            <Text style={[styles.catText, activeCategory === cat && styles.catTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Menu Dishes List */}
      <ScrollView style={styles.menuScroll} contentContainerStyle={styles.menuContent}>
        {filteredMenu.map((dish) => {
          const cartItem = items.find(i => i.id === dish.id);
          const quantity = cartItem?.quantity || 0;

          return (
            <View key={dish.id} style={styles.dishCard}>
              <View style={styles.dishInfo}>
                <View style={styles.vegRow}>
                  <Text style={styles.vegIcon}>🟢 VEG</Text>
                  <Text style={styles.dishCategory}>{dish.category}</Text>
                </View>
                <Text style={styles.dishName}>{dish.name}</Text>
                <Text style={styles.dishDesc}>{dish.description}</Text>
                <Text style={styles.dishPrice}>₹{dish.price}</Text>
              </View>

              <View style={styles.actionCol}>
                {quantity === 0 ? (
                  <TouchableOpacity
                    onPress={() => addItem({ id: dish.id, name: dish.name, price: dish.price, is_veg: dish.isVeg })}
                    style={styles.addButton}
                  >
                    <Text style={styles.addButtonText}>ADD +</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.qtyBox}>
                    <TouchableOpacity onPress={() => removeItem(dish.id)} style={styles.qtyBtn}>
                      <Text style={styles.qtyBtnText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.qtyVal}>{quantity}</Text>
                    <TouchableOpacity onPress={() => addItem({ id: dish.id, name: dish.name, price: dish.price, is_veg: dish.isVeg })} style={styles.qtyBtn}>
                      <Text style={styles.qtyBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Cart Drawer Sticky Bar */}
      {items.length > 0 && (
        <View style={styles.cartBar}>
          <View>
            <Text style={styles.cartCount}>{items.reduce((sum, i) => sum + i.quantity, 0)} Items</Text>
            <Text style={styles.cartTotal}>Total: ₹{getTotal()}</Text>
          </View>
          <TouchableOpacity style={styles.checkoutBtn}>
            <Text style={styles.checkoutBtnText}>View Order →</Text>
          </TouchableOpacity>
        </View>
      )}
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
    color: '#EA580C',
    fontWeight: '700',
    marginTop: 2,
  },
  catScroll: {
    maxHeight: 56,
    backgroundColor: '#0F172A',
  },
  catContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  catPill: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
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
  dishInfo: {
    flex: 1,
    paddingRight: 12,
  },
  vegRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  vegIcon: {
    fontSize: 10,
    fontWeight: '800',
    color: '#10B981',
  },
  dishCategory: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  dishName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  dishDesc: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 8,
  },
  dishPrice: {
    fontSize: 16,
    fontWeight: '900',
    color: '#EA580C',
  },
  actionCol: {
    justifyContent: 'center',
  },
  addButton: {
    backgroundColor: 'rgba(234, 88, 12, 0.2)',
    borderWidth: 1,
    borderColor: '#EA580C',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
  },
  addButtonText: {
    color: '#EA580C',
    fontWeight: '900',
    fontSize: 13,
  },
  qtyBox: {
    backgroundColor: '#EA580C',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  qtyBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  qtyBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 16,
  },
  qtyVal: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
    paddingHorizontal: 6,
  },
  cartBar: {
    backgroundColor: '#EA580C',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cartCount: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: '700',
  },
  cartTotal: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  checkoutBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  checkoutBtnText: {
    color: '#EA580C',
    fontWeight: '900',
    fontSize: 14,
  },
});
