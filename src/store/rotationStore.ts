import { create } from 'zustand';
import { RotationLog, RotationSettings } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface RotationState {
  settings: RotationSettings;
  logs: RotationLog[];
  timeLeft: number; // in seconds
  
  setSettings: (settings: RotationSettings) => void;
  setRotationEnabled: (enabled: boolean) => void;
  setRotationInterval: (interval: number) => void;
  setCurrentProfileId: (id: string) => void;
  setTimeLeft: (time: number) => void;
  decrementTimeLeft: () => void;
  addLog: (log: RotationLog) => void;
  setLogs: (logs: RotationLog[]) => void;
  loadCachedRotation: () => Promise<void>;
}

const defaultSettings: RotationSettings = {
  id: 'default',
  rotation_enabled: false,
  rotation_interval: 300, // 5 minutes default
  current_profile_id: '',
  last_rotation: new Date().toISOString()
};

export const useRotationStore = create<RotationState>((set, get) => ({
  settings: defaultSettings,
  logs: [],
  timeLeft: 300,

  setSettings: async (settings) => {
    set({ settings });
    await AsyncStorage.setItem('@rotation_settings', JSON.stringify(settings));
  },

  setRotationEnabled: async (enabled) => {
    const updated = { ...get().settings, rotation_enabled: enabled };
    set({ settings: updated });
    await AsyncStorage.setItem('@rotation_settings', JSON.stringify(updated));
  },

  setRotationInterval: async (interval) => {
    const updated = { ...get().settings, rotation_interval: interval };
    set({ settings: updated, timeLeft: interval });
    await AsyncStorage.setItem('@rotation_settings', JSON.stringify(updated));
  },

  setCurrentProfileId: async (id) => {
    const updated = { ...get().settings, current_profile_id: id, last_rotation: new Date().toISOString() };
    set({ settings: updated });
    await AsyncStorage.setItem('@rotation_settings', JSON.stringify(updated));
  },

  setTimeLeft: (timeLeft) => set({ timeLeft }),
  
  decrementTimeLeft: () => set((state) => ({ timeLeft: Math.max(0, state.timeLeft - 1) })),

  addLog: async (log) => {
    const updatedLogs = [log, ...get().logs].slice(0, 100); // Limit to 100 logs
    set({ logs: updatedLogs });
    await AsyncStorage.setItem('@rotation_logs', JSON.stringify(updatedLogs));
  },

  setLogs: async (logs) => {
    set({ logs });
    await AsyncStorage.setItem('@rotation_logs', JSON.stringify(logs));
  },

  loadCachedRotation: async () => {
    try {
      const cachedSettings = await AsyncStorage.getItem('@rotation_settings');
      const cachedLogs = await AsyncStorage.getItem('@rotation_logs');
      
      if (cachedSettings) {
        const parsed = JSON.parse(cachedSettings);
        set({ settings: parsed, timeLeft: parsed.rotation_interval });
      }
      if (cachedLogs) {
        set({ logs: JSON.parse(cachedLogs) });
      }
    } catch (e) {
      console.error('Failed to load rotation cache', e);
    }
  }
}));
