import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/store/useAuthStore';

export default function GatewayScreen() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  const handleRoleNavigation = () => {
    if (!isAuthenticated || !user) {
      router.push('/(auth)/login');
      return;
    }

    if (user.role === 'CHEF') {
      router.replace('/(chef)');
    } else if (user.role === 'SUPER_ADMIN') {
      router.replace('/(admin)');
    } else {
      router.replace('/(owner)');
    }
  };

  return (
    <View className="flex-1 bg-slate-900 justify-center items-center p-6">
      {/* Brand Header */}
      <View className="items-center mb-10">
        <View className="w-24 h-24 bg-brand-600 rounded-3xl justify-center items-center shadow-lg mb-4">
          <Text className="text-white text-4xl font-black">QR</Text>
        </View>
        <Text className="text-white text-3xl font-black tracking-tight">QRasoi</Text>
        <Text className="text-brand-500 font-bold text-sm mt-1">Digital Menus & Restaurant POS</Text>
      </View>

      {/* Primary Action Buttons */}
      <View className="w-full max-w-sm space-y-4">
        <TouchableOpacity
          onPress={() => router.push('/(customer)/menu/dineverse')}
          className="w-full bg-brand-600 py-4 rounded-2xl items-center shadow-lg"
        >
          <Text className="text-white font-black text-lg">📱 Open Customer Digital Menu</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleRoleNavigation}
          className="w-full bg-slate-800 border border-slate-700 py-4 rounded-2xl items-center"
        >
          <Text className="text-slate-200 font-bold text-base">
            {isAuthenticated ? `Go to ${user?.role} Portal →` : '🔑 Restaurant Staff & Owner Login'}
          </Text>
        </TouchableOpacity>
      </View>

      <Text className="text-slate-500 text-xs text-center mt-12">
        Powered by QRasoi Digital Menus • www.qrasoi.netlify.app
      </Text>
    </View>
  );
}
