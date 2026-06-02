import { BannerRotationEngine } from './BannerRotationEngine';
import { InterstitialManager } from './InterstitialManager';
import { RewardedManager } from './RewardedManager';
import { useAdStore } from '../../store/adStore';

export class AdManager {
  private static instance: AdManager | null = null;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): AdManager {
    if (!AdManager.instance) {
      AdManager.instance = new AdManager();
    }
    return AdManager.instance;
  }

  /**
   * Main entry point orchestrating initialization, preloading, and starting engines.
   */
  public async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    console.log('[AdManager] Initializing Smart AdMob Refresh & Rotation System...');
    
    try {
      // 1. Load cached states and settings in Zustand store
      const store = useAdStore.getState();
      await store.loadCachedState();
      
      // 2. Fetch fresh settings from Supabase
      await store.fetchSettings();

      // 3. Retrieve transactions list
      await store.fetchRewardTransactions();

      // 4. Preload interstitial and rewarded ads
      const interstitial = InterstitialManager.getInstance();
      const rewarded = RewardedManager.getInstance();
      
      await Promise.all([
        interstitial.preload(),
        rewarded.preload()
      ]);

      // 5. Start Banner Rotation Engine
      const bannerEngine = BannerRotationEngine.getInstance();
      bannerEngine.startEngine();

      this.isInitialized = true;
      console.log('[AdManager] Initialization Complete!');
      return true;
    } catch (error) {
      console.error('[AdManager] Critical error during initialization:', error);
      this.isInitialized = false;
      return false;
    }
  }

  /**
   * Shuts down running processes like banner rotation timers.
   */
  public shutdown(): void {
    BannerRotationEngine.getInstance().stopEngine();
    this.isInitialized = false;
    console.log('[AdManager] Ad System Shutdown Completed.');
  }
}

export default AdManager.getInstance();
