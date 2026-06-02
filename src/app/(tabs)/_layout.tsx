import React from 'react';
import { Tabs } from 'expo-router';
import { useAppStore } from '../../store/appStore';
import { Text } from 'react-native';

export default function TabsLayout() {
  const { isDarkMode } = useAppStore();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
          borderTopColor: isDarkMode ? '#334155' : '#E2E8F0',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: isDarkMode ? '#94A3B8' : '#64748B',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 18, fontWeight: 'bold' }}>⌂</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="profiles"
        options={{
          title: 'Profiles',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 18, fontWeight: 'bold' }}>☰</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="rotation"
        options={{
          title: 'Rotation',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 18, fontWeight: 'bold' }}>↻</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="vpn"
        options={{
          title: 'VPN Config',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 18, fontWeight: 'bold' }}>🔒</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="monetization"
        options={{
          title: 'Monetize',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 18, fontWeight: 'bold' }}>💰</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 18, fontWeight: 'bold' }}>⚙</Text>
          ),
        }}
      />
    </Tabs>
  );
}
