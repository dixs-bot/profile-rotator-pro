import { create } from 'zustand';
import { Profile } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ProfileState {
  profiles: Profile[];
  activeProfile: Profile | null;
  loading: boolean;
  error: string | null;
  
  setProfiles: (profiles: Profile[]) => void;
  setActiveProfile: (profile: Profile | null) => Promise<void>;
  addProfile: (profile: Profile) => void;
  updateProfile: (profile: Profile) => void;
  deleteProfile: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  loadCachedProfiles: () => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profiles: [],
  activeProfile: null,
  loading: false,
  error: null,

  setProfiles: async (profiles) => {
    set({ profiles });
    await AsyncStorage.setItem('@profiles_cache', JSON.stringify(profiles));
  },

  setActiveProfile: async (profile) => {
    set({ activeProfile: profile });
    if (profile) {
      await AsyncStorage.setItem('@active_profile_cache', JSON.stringify(profile));
    } else {
      await AsyncStorage.removeItem('@active_profile_cache');
    }
  },

  addProfile: (profile) => {
    const updated = [...get().profiles, profile];
    get().setProfiles(updated);
  },

  updateProfile: (profile) => {
    const updated = get().profiles.map(p => p.id === profile.id ? profile : p);
    get().setProfiles(updated);
    if (get().activeProfile?.id === profile.id) {
      get().setActiveProfile(profile);
    }
  },

  deleteProfile: (id) => {
    const updated = get().profiles.filter(p => p.id !== id);
    get().setProfiles(updated);
    if (get().activeProfile?.id === id) {
      get().setActiveProfile(null);
    }
  },

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  loadCachedProfiles: async () => {
    try {
      const cached = await AsyncStorage.getItem('@profiles_cache');
      const active = await AsyncStorage.getItem('@active_profile_cache');
      if (cached) {
        set({ profiles: JSON.parse(cached) });
      }
      if (active) {
        set({ activeProfile: JSON.parse(active) });
      }
    } catch (e) {
      console.error('Failed to load profile caches', e);
    }
  }
}));
