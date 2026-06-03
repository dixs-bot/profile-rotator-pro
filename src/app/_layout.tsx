import React, { useEffect } from 'react';
import { Stack, Redirect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { ActivityIndicator, View } from 'react-native';

import { ErrorBoundary } from '../components/ErrorBoundary';
import { useAuthStore } from '../store/authStore';

const queryClient = new QueryClient();

function AuthGate() {
  const {
    initializeAuth,
    isAuthenticated,
    loading,
  } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, []);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#0F172A',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator
          size="large"
          color="#2563EB"
        />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" />

        <AuthGate />

        <Toast />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}