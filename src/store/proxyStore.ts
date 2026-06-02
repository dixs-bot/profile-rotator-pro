import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

export interface ProxyProfile {
  id: string;
  name: string;
  provider: 'BrightData' | 'IPRoyal' | 'Oxylabs' | 'Webshare' | 'Custom';
  host: string;
  port: number;
  username?: string;
  password?: string;
  is_active: boolean;
  created_at: string;
}

interface ProxyState {
  proxies: ProxyProfile[];
  activeProxy: ProxyProfile | null;
  loading: boolean;
  error: string | null;

  setProxies: (proxies: ProxyProfile[]) => void;
  setActiveProxy: (proxy: ProxyProfile | null) => Promise<void>;
  addProxy: (proxy: ProxyProfile) => void;
  updateProxy: (proxy: ProxyProfile) => void;
  deleteProxy: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  loadCachedProxies: () => Promise<void>;
}

export const useProxyStore = create<ProxyState>((set, get) => ({
  proxies: [],
  activeProxy: null,
  loading: false,
  error: null,

  setProxies: async (proxies) => {
    set({ proxies });
    await AsyncStorage.setItem('@proxies_cache', JSON.stringify(proxies));
  },

  setActiveProxy: async (proxy) => {
    set({ activeProxy: proxy });
    if (proxy) {
      await AsyncStorage.setItem('@active_proxy_cache', JSON.stringify(proxy));
    } else {
      await AsyncStorage.removeItem('@active_proxy_cache');
    }
  },

  addProxy: (proxy) => {
    const updated = [...get().proxies, proxy];
    get().setProxies(updated);
  },

  updateProxy: (proxy) => {
    const updated = get().proxies.map(p => p.id === proxy.id ? proxy : p);
    get().setProxies(updated);
    if (get().activeProxy?.id === proxy.id) {
      get().setActiveProxy(proxy);
    }
  },

  deleteProxy: (id) => {
    const updated = get().proxies.filter(p => p.id !== id);
    get().setProxies(updated);
    if (get().activeProxy?.id === id) {
      get().setActiveProxy(null);
    }
  },

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  loadCachedProxies: async () => {
    try {
      const cached = await AsyncStorage.getItem('@proxies_cache');
      const active = await AsyncStorage.getItem('@active_proxy_cache');
      if (cached) {
        set({ proxies: JSON.parse(cached) });
      }
      if (active) {
        set({ activeProxy: JSON.parse(active) });
      }
    } catch (e) {
      console.error('Failed to load proxy cache', e);
    }
  }
}));
