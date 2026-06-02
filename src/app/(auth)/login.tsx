import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert(
        'Validation Error',
        'Please enter your email and password.'
      );
      return;
    }

    try {
      setLoading(true);

      await signIn(email.trim(), password);

      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert(
        'Authentication Failed',
        error?.message || 'Unable to login.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#0F172A',
      }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <View
          style={{
            backgroundColor: '#1E293B',
            borderRadius: 24,
            padding: 24,
          }}
        >
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: 28,
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: 8,
            }}
          >
            PROFILE ROTATOR PRO
          </Text>

          <Text
            style={{
              color: '#94A3B8',
              textAlign: 'center',
              marginBottom: 30,
            }}
          >
            Secure Browser Rotation Platform
          </Text>

          <Text
            style={{
              color: '#FFFFFF',
              fontWeight: '600',
              marginBottom: 8,
            }}
          >
            EMAIL ADDRESS
          </Text>

          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="operator@rotator.pro"
            placeholderTextColor="#64748B"
            keyboardType="email-address"
            autoCapitalize="none"
            style={{
              backgroundColor: '#334155',
              color: '#FFFFFF',
              borderRadius: 12,
              padding: 14,
              marginBottom: 20,
            }}
          />

          <Text
            style={{
              color: '#FFFFFF',
              fontWeight: '600',
              marginBottom: 8,
            }}
          >
            SECRET ACCESS KEY
          </Text>

          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••••••"
            placeholderTextColor="#64748B"
            secureTextEntry
            style={{
              backgroundColor: '#334155',
              color: '#FFFFFF',
              borderRadius: 12,
              padding: 14,
            }}
          />

          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            style={{
              backgroundColor: '#2563EB',
              paddingVertical: 16,
              borderRadius: 12,
              marginTop: 24,
              alignItems: 'center',
            }}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text
                style={{
                  color: '#FFFFFF',
                  fontWeight: 'bold',
                  fontSize: 16,
                }}
              >
                AUTHENTICATE OPERATOR
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(auth)/register')}
            style={{
              marginTop: 20,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                color: '#60A5FA',
                fontWeight: '600',
              }}
            >
              Deploy New Operator Instance
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}