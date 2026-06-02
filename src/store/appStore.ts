import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SyncQueueItem } from '../types';

interface AppState {
  isDarkMode: boolean;
  isOnline: boolean;
  syncQueue: SyncQueueItem[];
  toggleDarkMode: () => void;
  setOnlineStatus: (status: boolean) => void;
  addToSyncQueue: (item: Omit<SyncQueueItem, 'id' | 'created_at'>) => Promise<void>;
  clearSyncQueue: () => Promise<void>;
  removeFromSyncQueue: (id: string) => Promise<void>;
  loadAppState: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  isDarkMode: false,
  isOnline: true,
  syncQueue: [],

  toggleDarkMode: async () => {
    const nextMode = !get().isDarkMode;
    set({ isDarkMode: nextMode });
    await AsyncStorage.setItem('@app_dark_mode', JSON.stringify(nextMode));
  },

  setOnlineStatus: (status) => set({ isOnline: status }),

  addToSyncQueue: async (item) => {
    const newItem: SyncQueueItem = {
      ...item,
      id: Math.random().toString(36).substring(7),
      created_at: new Date().toISOString(),
    };
    const updatedQueue = [...get().syncQueue, newItem];
    set({ syncQueue: updatedQueue });
    await AsyncStorage.setItem('@app_sync_queue', JSON.stringify(updatedQueue));
  },

  clearSyncQueue: async () => {
    set({ syncQueue: [] });
    await AsyncStorage.removeItem('@app_sync_queue');
  },

  removeFromSyncQueue: async (id) => {
    const updatedQueue = get().syncQueue.filter((item) => item.id !== id);
    set({ syncQueue: updatedQueue });
    await AsyncStorage.setItem('@app_sync_queue', JSON.stringify(updatedQueue));
  },

  loadAppState: async () => {
    try {
      const storedDarkMode = await AsyncStorage.getItem('@app_dark_mode');
      const storedQueue = await AsyncStorage.getItem('@app_sync_queue');
      
      set({
        isDarkMode: storedDarkMode ? JSON.parse(storedDarkMode) : false,
        syncQueue: storedQueue ? JSON.parse(storedQueue) : [],
      });
    } catch (error) {
      console.error('Failed to load application state:', error);
    }
  },
}));
