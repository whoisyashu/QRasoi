import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, TextInput, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { apiClient } from '../../../src/services/api.service';
import { MenuItem, Category } from '../../../src/types';
import { useCartStore } from '../../../src/store/useCartStore';

export default function CustomerMenuScreen() {
  const { slug } = useLocalSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const { items, addItem, removeItem, updateQuantity, getTotal, tableNumber } = useCartStore();

  useEffect(() => {
    fetchMenuData();
  }, [slug]);

  const fetchMenuData = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/public/menu/${slug || 'dineverse'}`);
      setCategories(res.data.data.categories || []);
      setMenuItems(res.data.data.menuItems || []);
    } catch (err) {
      console.log('Failed to fetch public menu:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory === 'ALL' || item.categoryId === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <View className="flex-1 bg-slate-900 pt-12">
      {/* Header */}
      <View className="px-5 pb-3 border-b border-slate-800 flex-row justify-between items-center">
        <View>
          <Text className="text-brand-500 font-bold text-xs uppercase tracking-wider">TAX INVOICE MENU</Text>
          <Text className="text-white text-2xl font-black">DineVerse Bistro</Text>
          <Text className="text-slate-400 text-xs mt-0.5">{tableNumber} • Contactless Ordering</Text>
        </View>
        <View className="bg-brand-600/20 border border-brand-500/30 px-3 py-1.5 rounded-full">
          <Text className="text-brand-500 font-bold text-xs">Live Menu</Text>
        </View>
      </View>

      {/* Search Input */}
      <View className="px-5 my-3">
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search dishes..."
          placeholderTextColor="#64748B"
          className="bg-slate-800 text-white px-4 py-3 rounded-xl border border-slate-700 font-medium"
        />
      </View>

      {/* Categories Horizontal Scroll */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-5 mb-3 flex-grow-0">
        <TouchableOpacity
          onPress={() => setSelectedCategory('ALL')}
          className={`px-4 py-2 rounded-xl mr-2 ${selectedCategory === 'ALL' ? 'bg-brand-600' : 'bg-slate-800 border border-slate-700'}`}
        >
          <Text className={`font-bold text-xs ${selectedCategory === 'ALL' ? 'text-white' : 'text-slate-300'}`}>All Items</Text>
        </TouchableOpacity>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            onPress={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-xl mr-2 ${selectedCategory === cat.id ? 'bg-brand-600' : 'bg-slate-800 border border-slate-700'}`}
          >
            <Text className={`font-bold text-xs ${selectedCategory === cat.id ? 'text-white' : 'text-slate-300'}`}>{cat.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Dish Items Grid */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#EA580C" />
        </View>
      ) : (
        <ScrollView className="flex-1 px-5">
          {filteredItems.map((item) => {
            const cartItem = items.find((i) => i.menuItem.id === item.id);
            return (
              <View key={item.id} className="bg-slate-800 border border-slate-700/80 p-4 rounded-2xl mb-4 flex-row justify-between items-center">
                <View className="flex-1 pr-3">
                  <View className="flex-row items-center mb-1">
                    <View className={`w-3 h-3 rounded-full mr-2 ${item.isVeg ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    <Text className="text-white font-bold text-base">{item.name}</Text>
                  </View>
                  <Text className="text-slate-400 text-xs mb-2">{item.description || 'Delicious freshly prepared dish'}</Text>
                  <Text className="text-brand-500 font-black text-base">₹{item.price.toFixed(2)}</Text>
                </View>

                {cartItem ? (
                  <View className="flex-row items-center bg-slate-900 border border-slate-700 rounded-xl px-2 py-1">
                    <TouchableOpacity onPress={() => updateQuantity(item.id, -1)} className="px-2 py-1">
                      <Text className="text-brand-500 font-bold text-lg">-</Text>
                    </TouchableOpacity>
                    <Text className="text-white font-bold px-2">{cartItem.quantity}</Text>
                    <TouchableOpacity onPress={() => updateQuantity(item.id, 1)} className="px-2 py-1">
                      <Text className="text-brand-500 font-bold text-lg">+</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={() => addItem(item)}
                    className="bg-brand-600 px-4 py-2.5 rounded-xl"
                  >
                    <Text className="text-white font-bold text-xs uppercase">ADD +</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Cart Floating Bar */}
      {items.length > 0 ? (
        <View className="bg-slate-800 border-t border-slate-700 p-4 flex-row justify-between items-center">
          <View>
            <Text className="text-slate-400 text-xs font-bold">{items.length} Items Selected</Text>
            <Text className="text-white font-black text-xl">₹{getTotal().toFixed(2)}</Text>
          </View>

          <TouchableOpacity className="bg-brand-600 px-6 py-3 rounded-xl shadow-lg">
            <Text className="text-white font-black text-sm uppercase">Proceed to Checkout →</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}
