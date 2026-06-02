import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

export interface AdAnalytics {
  shown: number;
  failed: number;
  loaded: number;
  rewardsEarned: number;
  views: number;
}

export interface AdSettings {
  banner_refresh_seconds: number;
  banner_rotation_enabled: boolean;
  interstitial_cooldown_seconds: number;
  rewarded_preload_enabled: boolean;
  banner_enabled: boolean;
  interstitial_enabled: boolean;
  rewarded_enabled: boolean;
}

export interface RewardTransaction {
  id: string;
  reward_type: string;
  reward_amount: number;
  created_at: string;
}

interface AdState {
  bannerLoaded: boolean;
  interstitialLoaded: boolean;
  rewardedLoaded: boolean;
  rewardedInterstitialLoaded: boolean;
  rewardGranted: boolean;
  lastAdShown: number; // timestamp
  analytics: AdAnalytics;
  settings: AdSettings;
  activeBannerPosition: 'Dashboard' | 'Profiles' | 'Settings' | 'Analytics';
  rewardTransactions: RewardTransaction[];

  setBannerLoaded: (loaded: boolean) => void;
  setInterstitialLoaded: (loaded: boolean) => void;
  setRewardedLoaded: (loaded: boolean) => void;
  setRewardedInterstitialLoaded: (loaded: boolean) => void;
  setRewardGranted: (granted: boolean) => void;
  setLastAdShown: (timestamp: number) => void;
  incrementMetric: (metric: keyof AdAnalytics, amount?: number) => void;
  resetRewardGranted: () => void;
  setActiveBannerPosition: (position: 'Dashboard' | 'Profiles' | 'Settings' | 'Analytics') => void;
  updateSettings: (newSettings: Partial<AdSettings>) => Promise<void>;
  fetchSettings: () => Promise<void>;
  addRewardTransaction: (tx: RewardTransaction) => void;
  fetchRewardTransactions: () => Promise<void>;
  loadCachedState: () => Promise<void>;
}

const defaultAnalytics: AdAnalytics = {
  shown: 0,
  failed: 0,
  loaded: 0,
  rewardsEarned: 0,
  views: 0
};

const defaultSettings: AdSettings = {
  banner_refresh_seconds: 60,
  banner_rotation_enabled: true,
  interstitial_cooldown_seconds: 120,
  rewarded_preload_enabled: true,
  banner_enabled: true,
  interstitial_enabled: true,
  rewarded_enabled: true
};

export const useAdStore = create<AdState>((set, get) => ({
  bannerLoaded: false,
  interstitialLoaded: false,
  rewardedLoaded: false,
  rewardedInterstitialLoaded: false,
  rewardGranted: false,
  lastAdShown: 0,
  analytics: defaultAnalytics,
  settings: defaultSettings,
  activeBannerPosition: 'Dashboard',
  rewardTransactions: [],

  setBannerLoaded: (loaded) => set({ bannerLoaded: loaded }),
  setInterstitialLoaded: (loaded) => set({ interstitialLoaded: loaded }),
  setRewardedLoaded: (loaded) => set({ rewardedLoaded: loaded }),
  setRewardedInterstitialLoaded: (loaded) => set({ rewardedInterstitialLoaded: loaded }),
  setRewardGranted: (granted) => set({ rewardGranted: granted }),
  setLastAdShown: (timestamp) => {
    set({ lastAdShown: timestamp });
    AsyncStorage.setItem('@ad_last_shown', timestamp.toString()).catch(console.error);
  },
  
  incrementMetric: (metric, amount = 1) => {
    set((state) => {
      const updatedAnalytics = {
        ...state.analytics,
        [metric]: state.analytics[metric] + amount
      };
      AsyncStorage.setItem('@ad_analytics', JSON.stringify(updatedAnalytics)).catch(console.error);
      return { analytics: updatedAnalytics };
    });
  },

  resetRewardGranted: () => set({ rewardGranted: false }),

  setActiveBannerPosition: (position) => set({ activeBannerPosition: position }),

  updateSettings: async (newSettings) => {
    set((state) => {
      const updated = { ...state.settings, ...newSettings };
      AsyncStorage.setItem('@ad_settings', JSON.stringify(updated)).catch(console.error);
      return { settings: updated };
    });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('ad_settings')
          .upsert({ user_id: user.id, ...get().settings });
      }
    } catch (e) {
      console.warn('Failed to sync ad settings to Supabase', e);
    }
  },

  fetchSettings: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('ad_settings')
          .select('*')
          .single();
        if (data && !error) {
          set({ settings: { ...defaultSettings, ...data } });
          AsyncStorage.setItem('@ad_settings', JSON.stringify(data)).catch(console.error);
        }
      }
    } catch (e) {
      console.warn('Failed to fetch ad settings from Supabase, using local cached or default values', e);
    }
  },

  addRewardTransaction: (tx) => {
    set((state) => {
      const updated = [tx, ...state.rewardTransactions];
      AsyncStorage.setItem('@reward_transactions', JSON.stringify(updated)).catch(console.error);
      return { rewardTransactions: updated };
    });
  },

  fetchRewardTransactions: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('ad_rewards')
          .select('*')
          .order('created_at', { ascending: false });
        if (data && !error) {
          set({ rewardTransactions: data });
          AsyncStorage.setItem('@reward_transactions', JSON.stringify(data)).catch(console.error);
        }
      }
    } catch (e) {
      console.warn('Failed to fetch reward transactions, using cached data', e);
    }
  },

  loadCachedState: async () => {
    try {
      const cachedAnalytics = await AsyncStorage.getItem('@ad_analytics');
      const cachedLastAdShown = await AsyncStorage.getItem('@ad_last_shown');
      const cachedSettings = await AsyncStorage.getItem('@ad_settings');
      const cachedTransactions = await AsyncStorage.getItem('@reward_transactions');
      
      set({
        analytics: cachedAnalytics ? JSON.parse(cachedAnalytics) : defaultAnalytics,
        lastAdShown: cachedLastAdShown ? parseInt(cachedLastAdShown, 10) : 0,
        settings: cachedSettings ? JSON.parse(cachedSettings) : defaultSettings,
        rewardTransactions: cachedTransactions ? JSON.parse(cachedTransactions) : []
      });
    } catch (e) {
      console.error('Failed to load cached ad state', e);
    }
  }
}));
