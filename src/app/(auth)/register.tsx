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

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      Alert.alert(
        'Validation Error',
        'All fields are mandatory.'
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        'Validation Error',
        'Secret access keys do not match.'
      );
      return;
    }

    try {
      setLoading(true);

      await signUp(email.trim(), password);

      Alert.alert(
        'Verification Required',
        'A verification message was dispatched to your email address.',
        [
          {
            text: 'OK',
            onPress: () =>
              router.replace('/(auth)/login'),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        'Registration Failed',
        error?.message ||
          'Verification initialization error.'
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
            NEW OPERATOR REGISTRATION
          </Text>

          <Text
            style={{
              color: '#94A3B8',
              textAlign: 'center',
              marginBottom: 30,
            }}
          >
            Setup localized access credentials
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
            CONFIRM SECRET KEY
          </Text>

          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
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
            onPress={handleRegister}
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
                DEPLOY CLIENT NODE
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              router.push('/(auth)/login')
            }
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
              Already registered? Log in.
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}