import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, StyleSheet, SafeAreaView } from 'react-native';
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
        if (!chefPin.trim()) throw new Error('Please enter your Kitchen PIN.');
        await chefLogin(chefPin.trim());
        router.replace('/(chef)');
      } else {
        if (!email.trim() || !password.trim()) throw new Error('Please enter email and password.');
        await login(email.trim(), password.trim());
        router.replace('/(owner)');
      }
    } catch (err: any) {
      const errMsg = err?.response?.data?.error || err.message || 'Invalid credentials';
      Alert.alert('Authentication Failed', errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>{isChefMode ? '👨‍🍳 Kitchen Access' : '🔐 Staff Login'}</Text>
            <TouchableOpacity
              onPress={() => setIsChefMode(!isChefMode)}
              style={styles.switchButton}
            >
              <Text style={styles.switchButtonText}>
                {isChefMode ? 'Switch to Owner' : 'Switch to Chef'}
              </Text>
            </TouchableOpacity>
          </View>

          {!isChefMode ? (
            <>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="owner@restaurant.com"
                placeholderTextColor="#64748B"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />

              <Text style={styles.label}>Password</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="#64748B"
                secureTextEntry
                style={styles.input}
              />
            </>
          ) : (
            <>
              <Text style={styles.label}>Kitchen Security PIN</Text>
              <TextInput
                value={chefPin}
                onChangeText={setChefPin}
                placeholder="123456"
                placeholderTextColor="#64748B"
                keyboardType="number-pad"
                secureTextEntry
                style={[styles.input, styles.pinInput]}
              />
            </>
          )}

          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            style={styles.submitButton}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Sign In to Dashboard</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  switchButton: {
    backgroundColor: 'rgba(234, 88, 12, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(234, 88, 12, 0.4)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  switchButtonText: {
    color: '#EA580C',
    fontWeight: '700',
    fontSize: 12,
  },
  label: {
    color: '#94A3B8',
    fontWeight: '700',
    fontSize: 11,
    textTransform: 'uppercase',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#0F172A',
    color: '#FFFFFF',
    padding: 16,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
    fontSize: 15,
    fontWeight: '500',
  },
  pinInput: {
    textAlign: 'center',
    fontSize: 24,
    letterSpacing: 8,
    fontFamily: 'monospace',
  },
  submitButton: {
    backgroundColor: '#EA580C',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
});
