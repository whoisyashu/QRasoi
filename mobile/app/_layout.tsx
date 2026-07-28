import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../src/store/useAuthStore';
import { socketService } from '../src/services/socket.service';

export default function RootLayout() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
    socketService.connect();
    return () => socketService.disconnect();
  }, []);

  return (
    <>
      <StatusBar style="light" backgroundColor="#0F172A" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#0F172A' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: 'bold' },
          contentStyle: { backgroundColor: '#0F172A' }
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/login" options={{ title: 'Staff Login' }} />
        <Stack.Screen name="(customer)/menu/[slug]" options={{ title: 'Digital Menu', headerShown: false }} />
        <Stack.Screen name="(owner)" options={{ headerShown: false }} />
        <Stack.Screen name="(chef)" options={{ title: 'Kitchen KDS', headerLeft: () => null }} />
        <Stack.Screen name="(admin)" options={{ title: 'Super Admin Dashboard' }} />
      </Stack>
    </>
  );
}
