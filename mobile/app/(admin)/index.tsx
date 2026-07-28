import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../../src/store/useAuthStore';

export default function AdminDashboardScreen() {
  const { user, logout } = useAuthStore();

  return (
    <ScrollView className="flex-1 bg-slate-900 p-5">
      <View className="flex-row justify-between items-center mb-6 pt-4">
        <View>
          <Text className="text-white text-2xl font-black">Super Admin 🛡️</Text>
          <Text className="text-slate-400 text-xs">Global QRasoi SaaS Metrics</Text>
        </View>
        <TouchableOpacity onPress={logout} className="bg-slate-800 border border-slate-700 px-3 py-2 rounded-xl">
          <Text className="text-slate-300 font-bold text-xs">Logout</Text>
        </TouchableOpacity>
      </View>

      <View className="bg-slate-800 border border-slate-700 p-5 rounded-2xl mb-4">
        <Text className="text-slate-400 font-bold text-xs uppercase mb-1">Active Platform Restaurants</Text>
        <Text className="text-brand-500 font-black text-3xl">1</Text>
      </View>

      <View className="bg-slate-800 border border-slate-700 p-5 rounded-2xl mb-4">
        <Text className="text-slate-400 font-bold text-xs uppercase mb-1">System Health & API Gateways</Text>
        <Text className="text-emerald-400 font-bold text-base">🟢 100% Operational (Socket.IO + Supabase)</Text>
      </View>
    </ScrollView>
  );
}
