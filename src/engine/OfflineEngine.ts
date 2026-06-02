import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppStore } from '../store/appStore';
import { SyncEngine } from './SyncEngine';

export class OfflineEngine {
  private static instance: OfflineEngine | null = null;
  private isProcessing = false;

  private constructor() {}

  public static getInstance(): OfflineEngine {
    if (!OfflineEngine.instance) {
      OfflineEngine.instance = new OfflineEngine();
    }
    return OfflineEngine.instance;
  }

  /**
   * Periodically triggered to check offline queue and process sync actions
   */
  public async triggerSyncCycle(): Promise<void> {
    const appStore = useAppStore.getState();
    if (!appStore.isOnline || this.isProcessing) return;

    this.isProcessing = true;
    try {
      console.log('[OfflineEngine] Network connection is online. Initiating background sync processor...');
      const success = await SyncEngine.retrySync();
      if (success) {
        console.log('[OfflineEngine] Synchronization queue cleared successfully.');
      } else {
        console.warn('[OfflineEngine] Background sync partially completed; network backoff active.');
      }
    } catch (error) {
      console.error('[OfflineEngine] Synchronization run crashed:', error);
    } finally {
      this.isProcessing = false;
    }
  }
}

export default OfflineEngine.getInstance();
