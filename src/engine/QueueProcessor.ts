import { supabase } from '../lib/supabase';
import { useAppStore } from '../store/appStore';
import { useProfileStore } from '../store/profileStore';
import { useVpnStore } from '../store/vpnStore';
import { useProxyStore } from '../store/proxyStore';
import { useRotationStore } from '../store/rotationStore';

export class QueueProcessor {
  private static isSyncing = false;

  /**
   * Processes the entire queue sequentially using exponential backoff retry.
   */
  static async processQueue(): Promise<boolean> {
    const appStore = useAppStore.getState();
    if (this.isSyncing || !appStore.isOnline || appStore.syncQueue.length === 0) {
      return true;
    }

    this.isSyncing = true;
    const queue = [...appStore.syncQueue];
    let allSuccess = true;

    for (const item of queue) {
      let retries = 0;
      const maxRetries = 3;
      let success = false;

      while (retries < maxRetries && !success) {
        try {
          let error;
          const { table, action, payload } = item;

          if (table === 'profiles') {
            if (action === 'CREATE') {
              const { error: err } = await supabase.from('profiles').insert(payload);
              error = err;
            } else if (action === 'UPDATE') {
              const { error: err } = await supabase.from('profiles').update(payload).eq('id', payload.id);
              error = err;
            } else if (action === 'DELETE') {
              const { error: err } = await supabase.from('profiles').delete().eq('id', payload.id);
              error = err;
            }
          } else if (table === 'vpn_profiles') {
            if (action === 'CREATE') {
              const { error: err } = await supabase.from('vpn_profiles').insert(payload);
              error = err;
            } else if (action === 'UPDATE') {
              const { error: err } = await supabase.from('vpn_profiles').update(payload).eq('id', payload.id);
              error = err;
            } else if (action === 'DELETE') {
              const { error: err } = await supabase.from('vpn_profiles').delete().eq('id', payload.id);
              error = err;
            }
          } else if (table === 'proxy_profiles') {
            if (action === 'CREATE') {
              const { error: err } = await supabase.from('proxy_profiles').insert(payload);
              error = err;
            } else if (action === 'UPDATE') {
              const { error: err } = await supabase.from('proxy_profiles').update(payload).eq('id', payload.id);
              error = err;
            } else if (action === 'DELETE') {
              const { error: err } = await supabase.from('proxy_profiles').delete().eq('id', payload.id);
              error = err;
            }
          } else if (table === 'rotation_settings') {
            const { error: err } = await supabase.from('rotation_settings').upsert(payload);
            error = err;
          }

          if (error) throw error;
          
          success = true;
          await appStore.removeFromSyncQueue(item.id);
        } catch (e: any) {
          retries++;
          console.warn(`[QueueProcessor] Failed sync turn ${retries}/${maxRetries} for item ${item.id}:`, e);
          if (retries < maxRetries) {
            // Exponential backoff wait
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000));
          } else {
            allSuccess = false;
          }
        }
      }

      if (!success) {
        // Stop execution of the rest of the queue if a blocking error occurs to preserve FIFO order
        break;
      }
    }

    this.isSyncing = false;
    return allSuccess;
  }
}
