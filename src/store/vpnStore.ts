import { create } from 'zustand';
import { VpnProfile } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface VpnState {
  vpnProfiles: VpnProfile[];
  activeVpn: VpnProfile | null;
  isConnected: boolean;
  isConnecting: boolean;
  
  setVpnProfiles: (profiles: VpnProfile[]) => void;
  setActiveVpn: (vpn: VpnProfile | null) => Promise<void>;
  setIsConnected: (connected: boolean) => void;
  setIsConnecting: (connecting: boolean) => void;
  addVpnProfile: (vpn: VpnProfile) => void;
  updateVpnProfile: (vpn: VpnProfile) => void;
  deleteVpnProfile: (id: string) => void;
  loadCachedVpn: () => Promise<void>;
}

export const useVpnStore = create<VpnState>((set, get) => ({
  vpnProfiles: [],
  activeVpn: null,
  isConnected: false,
  isConnecting: false,

  setVpnProfiles: async (vpnProfiles) => {
    set({ vpnProfiles });
    await AsyncStorage.setItem('@vpn_profiles', JSON.stringify(vpnProfiles));
  },

  setActiveVpn: async (activeVpn) => {
    set({ activeVpn });
    if (activeVpn) {
      await AsyncStorage.setItem('@active_vpn', JSON.stringify(activeVpn));
    } else {
      await AsyncStorage.removeItem('@active_vpn');
      set({ isConnected: false });
    }
  },

  setIsConnected: (isConnected) => set({ isConnected }),
  setIsConnecting: (isConnecting) => set({ isConnecting }),

  addVpnProfile: (vpn) => {
    const updated = [...get().vpnProfiles, vpn];
    get().setVpnProfiles(updated);
  },

  updateVpnProfile: (vpn) => {
    const updated = get().vpnProfiles.map(v => v.id === vpn.id ? vpn : v);
    get().setVpnProfiles(updated);
    if (get().activeVpn?.id === vpn.id) {
      get().setActiveVpn(vpn);
    }
  },

  deleteVpnProfile: (id) => {
    const updated = get().vpnProfiles.filter(v => v.id !== id);
    get().setVpnProfiles(updated);
    if (get().activeVpn?.id === id) {
      get().setActiveVpn(null);
    }
  },

  loadCachedVpn: async () => {
    try {
      const cached = await AsyncStorage.getItem('@vpn_profiles');
      const active = await AsyncStorage.getItem('@active_vpn');
      if (cached) {
        set({ vpnProfiles: JSON.parse(cached) });
      }
      if (active) {
        set({ activeVpn: JSON.parse(active) });
      }
    } catch (e) {
      console.error('Failed to load VPN cache', e);
    }
  }
}));
