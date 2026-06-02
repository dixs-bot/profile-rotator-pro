import { supabase } from '../lib/supabase';
import { useVpnStore } from '../store/vpnStore';
import { useAppStore } from '../store/appStore';
import { VpnProfile } from '../types';
import { ErrorService } from '../services/ErrorService';

export class VpnEngine {
  static async loadVpnProfiles() {
    const vpnStore = useVpnStore.getState();
    const appStore = useAppStore.getState();
    
    try {
      if (appStore.isOnline) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
          .from('vpn_profiles')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        const mappedData: VpnProfile[] = (data || []).map(v => ({
          id: v.id,
          name: v.name,
          country: v.country,
          server_name: v.server_name,
          server_id: v.server_id,
          notes: v.notes,
          created_at: v.created_at
        }));

        await vpnStore.setVpnProfiles(mappedData);
      } else {
        await vpnStore.loadCachedVpn();
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to fetch VPN configurations';
      ErrorService.logError(message, 'SUPABASE', e);
      await vpnStore.loadCachedVpn();
    }
  }

  static async createVpnProfile(vpn: Omit<VpnProfile, 'id' | 'created_at'>) {
    const vpnStore = useVpnStore.getState();
    const appStore = useAppStore.getState();

    const newVpn: VpnProfile = {
      ...vpn,
      id: Math.random().toString(36).substring(7),
      created_at: new Date().toISOString()
    };

    vpnStore.addVpnProfile(newVpn);

    try {
      if (appStore.isOnline) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { error } = await supabase.from('vpn_profiles').insert({
          ...newVpn,
          user_id: user.id
        });
        if (error) throw error;
      } else {
        await appStore.addToSyncQueue({
          action: 'CREATE',
          table: 'vpn_profiles',
          payload: newVpn
        });
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to sync created VPN profile';
      ErrorService.logError(message, 'SUPABASE', e);
    }
  }

  static async updateVpnProfile(vpn: VpnProfile) {
    const vpnStore = useVpnStore.getState();
    const appStore = useAppStore.getState();

    vpnStore.updateVpnProfile(vpn);

    try {
      if (appStore.isOnline) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { error } = await supabase
          .from('vpn_profiles')
          .update({ ...vpn, user_id: user.id })
          .eq('id', vpn.id);
        if (error) throw error;
      } else {
        await appStore.addToSyncQueue({
          action: 'UPDATE',
          table: 'vpn_profiles',
          payload: vpn
        });
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to sync updated VPN profile';
      ErrorService.logError(message, 'SUPABASE', e);
    }
  }

  static async deleteVpnProfile(id: string) {
    const vpnStore = useVpnStore.getState();
    const appStore = useAppStore.getState();

    vpnStore.deleteVpnProfile(id);

    try {
      if (appStore.isOnline) {
        const { error } = await supabase
          .from('vpn_profiles')
          .delete()
          .eq('id', id);
        if (error) throw error;
      } else {
        await appStore.addToSyncQueue({
          action: 'DELETE',
          table: 'vpn_profiles',
          payload: { id }
        });
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to sync VPN deletion';
      ErrorService.logError(message, 'SUPABASE', e);
    }
  }

  static async connectVPN(vpnId: string): Promise<boolean> {
    const vpnStore = useVpnStore.getState();
    const vpn = vpnStore.vpnProfiles.find(v => v.id === vpnId);
    if (!vpn) return false;

    vpnStore.setIsConnecting(true);
    await vpnStore.setActiveVpn(vpn);

    return new Promise((resolve) => {
      setTimeout(() => {
        vpnStore.setIsConnecting(false);
        vpnStore.setIsConnected(true);
        resolve(true);
      }, 1200);
    });
  }

  static async disconnectVPN(): Promise<boolean> {
    const vpnStore = useVpnStore.getState();
    vpnStore.setIsConnecting(true);

    return new Promise((resolve) => {
      setTimeout(() => {
        vpnStore.setIsConnecting(false);
        vpnStore.setIsConnected(false);
        resolve(true);
      }, 600);
    });
  }
}
