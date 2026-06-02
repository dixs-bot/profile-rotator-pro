import { supabase } from '../lib/supabase';
import { useProfileStore } from '../store/profileStore';
import { useRotationStore } from '../store/rotationStore';
import { useVpnStore } from '../store/vpnStore';
import { useProxyStore } from '../store/proxyStore';
import { VpnEngine } from './VpnEngine';
import { ProfileEngine } from './ProfileEngine';
import { ProxyEngine } from './ProxyEngine';
import { InterstitialManager } from '../features/admob/InterstitialManager';

export class RotationEngine {
  static async rotate(): Promise<boolean> {
    const profileStore = useProfileStore.getState();
    const rotationStore = useRotationStore.getState();
    const vpnStore = useVpnStore.getState();
    const proxyStore = useProxyStore.getState();
    
    const profiles = profileStore.profiles;
    if (profiles.length === 0) {
      await this.logRotationToDb('None', 'None', 'None', 'WARNING', 'No active profiles found to rotate.');
      return false;
    }

    const currentActive = profileStore.activeProfile;
    const currentIndex = currentActive ? profiles.findIndex(p => p.id === currentActive.id) : -1;
    
    const nextIndex = (currentIndex + 1) % profiles.length;
    const nextProfile = profiles[nextIndex];

    const oldStateName = currentActive ? currentActive.name : 'None';
    const originalVpnName = vpnStore.activeVpn?.name || 'Disconnected';
    const originalProxyName = proxyStore.activeProxy?.name || 'None';

    // TRIGGER AD FOR MONETIZATION
    try {
      await InterstitialManager.getInstance().showInterstitial();
    } catch (e) {
      console.warn('[RotationEngine] AdMob trigger failed during rotation', e);
    }

    try {
      // 1. Disconnect VPN and Proxy
      if (vpnStore.isConnected) {
        await VpnEngine.disconnectVPN();
      }

      // 2. Select Next VPN Server
      const vpnProfiles = vpnStore.vpnProfiles;
      let nextVpn = vpnStore.activeVpn;
      if (vpnProfiles.length > 0) {
        const currentVpnIndex = nextVpn ? vpnProfiles.findIndex(v => v.id === nextVpn?.id) : -1;
        const nextVpnIndex = (currentVpnIndex + 1) % vpnProfiles.length;
        nextVpn = vpnProfiles[nextVpnIndex];
        await vpnStore.setActiveVpn(nextVpn);
      }

      // 3. Connect VPN
      if (nextVpn) {
        await VpnEngine.connectVPN(nextVpn.id);
      }

      // 4. Select Next Proxy Server
      const proxyProfiles = proxyStore.proxies;
      let nextProxy = proxyStore.activeProxy;
      if (proxyProfiles.length > 0) {
        const currentProxyIdx = nextProxy ? proxyProfiles.findIndex(p => p.id === nextProxy?.id) : -1;
        const nextProxyIdx = (currentProxyIdx + 1) % proxyProfiles.length;
        nextProxy = proxyProfiles[nextProxyIdx];
        await ProxyEngine.setActiveProxy(nextProxy.id);
      }

      // 5. Update and Activate Profile
      await ProfileEngine.setActiveProfile(nextProfile.id);
      
      // Update store settings for rotation sync
      rotationStore.setCurrentProfileId(nextProfile.id);
      rotationStore.setTimeLeft(rotationStore.settings.rotation_interval);

      // Write Rotation settings back to db
      await this.syncRotationSettingsToDb(nextProfile.id);

      // Log Success
      await this.logRotationToDb(
        nextProfile.name,
        nextVpn?.name || 'Disconnected',
        nextProxy?.name || 'None',
        'SUCCESS',
        `Rotated successfully from ${oldStateName} to ${nextProfile.name}`
      );

      return true;
    } catch (e: any) {
      await this.logRotationToDb(
        nextProfile?.name || 'Unknown',
        vpnStore.activeVpn?.name || 'Disconnected',
        proxyStore.activeProxy?.name || 'None',
        'ERROR',
        e?.message || 'Unknown rotation crash'
      );
      return false;
    }
  }

  static async start() {
    const rotationStore = useRotationStore.getState();
    rotationStore.setRotationEnabled(true);
    rotationStore.setTimeLeft(rotationStore.settings.rotation_interval);
    await this.syncRotationSettingsToDb(rotationStore.settings.current_profile_id, true);
  }

  static async stop() {
    const rotationStore = useRotationStore.getState();
    rotationStore.setRotationEnabled(false);
    await this.syncRotationSettingsToDb(rotationStore.settings.current_profile_id, false);
  }

  private static async syncRotationSettingsToDb(currentProfileId: string, enabled?: boolean) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const rotationStore = useRotationStore.getState();
      const payload = {
        user_id: user.id,
        rotation_enabled: enabled !== undefined ? enabled : rotationStore.settings.rotation_enabled,
        rotation_interval: rotationStore.settings.rotation_interval,
        current_profile_id: currentProfileId || null,
        last_rotation: new Date().toISOString()
      };

      await supabase.from('rotation_settings').upsert(payload);
    } catch (e) {
      console.error('[RotationEngine] Failed to sync settings to Supabase:', e);
    }
  }

  private static async logRotationToDb(
    profileName: string,
    vpnName: string,
    proxyName: string,
    status: 'SUCCESS' | 'WARNING' | 'ERROR',
    message: string
  ) {
    const rotationStore = useRotationStore.getState();
    const logId = Math.random().toString(36).substring(7);

    const logItem = {
      id: logId,
      profile_name: profileName,
      vpn_profile_name: vpnName,
      old_state: rotationStore.settings.current_profile_id || 'None',
      new_state: profileName,
      rotation_time: new Date().toISOString(),
      status
    };

    rotationStore.addLog(logItem);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('rotation_logs').insert({
        id: logId,
        user_id: user.id,
        profile_name: profileName,
        vpn_profile_name: vpnName,
        proxy_profile_name: proxyName,
        status,
        message,
        created_at: new Date().toISOString()
      });
    } catch (e) {
      console.warn('[RotationEngine] Offline - rotation log saved locally.', e);
    }
  }

  /**
   * Recovers settings and state from Supabase on app start
   */
  static async recoverState(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('rotation_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        const rotationStore = useRotationStore.getState();
        rotationStore.setSettings({
          id: data.id,
          rotation_enabled: data.rotation_enabled,
          rotation_interval: data.rotation_interval,
          current_profile_id: data.current_profile_id || '',
          last_rotation: data.last_rotation
        });

        if (data.rotation_enabled) {
          const { SchedulerEngine } = await import('./SchedulerEngine');
          SchedulerEngine.startScheduler();
        }
      }
    } catch (e) {
      console.warn('[RotationEngine] Failed to recover active state from cloud', e);
    }
  }
}
