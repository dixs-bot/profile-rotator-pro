import { supabase } from '../lib/supabase';
import { useAppStore } from '../store/appStore';
import { ErrorService } from '../services/ErrorService';
import { ProfileEngine } from './ProfileEngine';
import { VpnEngine } from './VpnEngine';
import { QueueProcessor } from './QueueProcessor';

export class SyncEngine {
  static async syncProfiles() {
    await ProfileEngine.loadProfiles();
  }

  static async syncRotation() {
    const appStore = useAppStore.getState();
    if (!appStore.isOnline) return;

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
        const { useRotationStore } = await import('../store/rotationStore');
        const rotationStore = useRotationStore.getState();
        rotationStore.setSettings({
          id: data.id,
          rotation_enabled: data.rotation_enabled,
          rotation_interval: data.rotation_interval,
          current_profile_id: data.current_profile_id,
          last_rotation: data.last_rotation,
        });
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to sync rotation settings with cloud';
      ErrorService.logError(message, 'SYNC', e);
    }
  }

  static async retrySync(): Promise<boolean> {
    return QueueProcessor.processQueue();
  }
}
