import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;

  initializeAuth: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isAuthenticated: false,
  loading: true,
  error: null,

  initializeAuth: async () => {
    set({ loading: true });
    try {
      // Get initial session
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;

      if (session) {
        set({
          session,
          user: session.user,
          isAuthenticated: true,
          loading: false,
        });
      } else {
        set({ session: null, user: null, isAuthenticated: false, loading: false });
      }

      // Listen for auth state changes
      supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session) {
          set({
            session,
            user: session.user,
            isAuthenticated: true,
            loading: false,
          });
        } else {
          set({ session: null, user: null, isAuthenticated: false, loading: false });
          // Clear other store caches and reset states on logout
          const { useProfileStore } = await import('./profileStore');
          const { useVpnStore } = await import('./vpnStore');
          const { useRotationStore } = await import('./rotationStore');
          const { useAdStore } = await import('./adStore');

          useProfileStore.getState().setProfiles([]);
          useProfileStore.getState().setActiveProfile(null);
          useVpnStore.getState().setVpnProfiles([]);
          useVpnStore.getState().setActiveVpn(null);
          
          await AsyncStorage.multiRemove([
            '@profiles_cache',
            '@active_profile_cache',
            '@vpn_profiles',
            '@active_vpn',
            '@rotation_settings',
            '@rotation_logs',
            '@ad_analytics',
            '@ad_settings',
            '@reward_transactions'
          ]);
        }
      });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  signUp: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      set({ session: data.session, user: data.user, isAuthenticated: !!data.session, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  signIn: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      set({ session: data.session, user: data.user, isAuthenticated: true, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  signOut: async () => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
