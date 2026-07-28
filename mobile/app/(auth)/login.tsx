import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/useAuthStore';

export default function LoginScreen() {
  const router = useRouter();
  const { login, chefLogin } = useAuthStore();
  const [isChefMode, setIsChefMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [chefPin, setChefPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      if (isChefMode) {
        if (!chefPin) throw new Error('Please enter your Kitchen PIN.');
        await chefLogin(chefPin);
        router.replace('/(chef)');
      } else {
        if (!email || !password) throw new Error('Please enter email and password.');
        await login(email, password);
        router.replace('/(owner)');
      }
    } catch (err: any) {
      Alert.alert('Login Failed', err || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-slate-900 justify-center p-6">
      <View className="bg-slate-800 border border-slate-700 p-6 rounded-3xl shadow-xl">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-white text-2xl font-black">{isChefMode ? '👨‍🍳 Chef Access' : '🔐 Staff Login'}</Text>
          <TouchableOpacity
            onPress={() => setIsChefMode(!isChefMode)}
            className="bg-brand-600/20 border border-brand-500/40 px-3 py-1.5 rounded-full"
          >
            <Text className="text-brand-500 font-bold text-xs">
              {isChefMode ? 'Switch to Owner' : 'Switch to Chef'}
            </Text>
          </TouchableOpacity>
        </View>

        {!isChefMode ? (
          <>
            <Text className="text-slate-400 font-bold text-xs uppercase mb-1">Email Address</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="owner@restaurant.com"
              placeholderTextColor="#64748B"
              keyboardType="email-address"
              autoCapitalize="none"
              className="bg-slate-900 text-white p-4 rounded-xl mb-4 border border-slate-700 font-medium"
            />

            <Text className="text-slate-400 font-bold text-xs uppercase mb-1">Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor="#64748B"
              secureTextEntry
              className="bg-slate-900 text-white p-4 rounded-xl mb-6 border border-slate-700 font-medium"
            />
          </>
        ) : (
          <>
            <Text className="text-slate-400 font-bold text-xs uppercase mb-1">Kitchen Security PIN</Text>
            <TextInput
              value={chefPin}
              onChangeText={setChefPin}
              placeholder="123456"
              placeholderTextColor="#64748B"
              keyboardType="number-pad"
              secureTextEntry
              className="bg-slate-900 text-white text-center text-2xl font-mono tracking-widest p-4 rounded-xl mb-6 border border-slate-700"
            />
          </>
        )}

        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading}
          className="bg-brand-600 py-4 rounded-xl items-center shadow-lg"
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white font-black text-base">Sign In to Dashboard</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
