import { useAdStore } from '../../store/adStore';
import AdAnalyticsEngine from './AdAnalyticsEngine';

const BANNER_ID = process.env.EXPO_PUBLIC_ADMOB_BANNER_ID || 'ca-app-pub-3940256099942544/6300978111';

// Real MobileAds events simulation / mock mapping to actual platform Native implementation
export class BannerRotationEngine {
  private static instance: BannerRotationEngine | null = null;
  private intervalId: NodeJS.Timeout | null = null;
  private positions: Array<'Dashboard' | 'Profiles' | 'Settings' | 'Analytics'> = [
    'Dashboard',
    'Profiles',
    'Settings',
    'Analytics'
  ];
  private currentIdx = 0;

  private constructor() {}

  public static getInstance(): BannerRotationEngine {
    if (!BannerRotationEngine.instance) {
      BannerRotationEngine.instance = new BannerRotationEngine();
    }
    return BannerRotationEngine.instance;
  }

  public startEngine(): void {
    if (this.intervalId) return;

    const runEngineTick = async () => {
      const store = useAdStore.getState();
      if (!store.settings.banner_enabled) return;

      if (store.settings.banner_rotation_enabled) {
        this.currentIdx = (this.currentIdx + 1) % this.positions.length;
        const newPosition = this.positions[this.currentIdx];
        store.setActiveBannerPosition(newPosition);
      }

      const startTime = Date.now();
      try {
        store.setBannerLoaded(false);
        // Simulate lifecycle destroys of existing banner frames and loading of new ones
        await new Promise((resolve) => setTimeout(resolve, 800));
        
        store.setBannerLoaded(true);
        const loadTime = Date.now() - startTime;
        await AdAnalyticsEngine.trackEvent('BANNER', 'LOADED', BANNER_ID, loadTime);
        await AdAnalyticsEngine.trackEvent('BANNER', 'SHOWN', BANNER_ID);
      } catch (error: any) {
        const loadTime = Date.now() - startTime;
        await AdAnalyticsEngine.trackEvent('BANNER', 'FAILED', BANNER_ID, loadTime, error?.message);
      }
    };

    const store = useAdStore.getState();
    const refreshMs = (store.settings.banner_refresh_seconds || 60) * 1000;
    
    runEngineTick();
    this.intervalId = setInterval(() => {
      runEngineTick();
    }, refreshMs);
  }

  public stopEngine(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  public async forceRefresh(): Promise<void> {
    const startTime = Date.now();
    try {
      const store = useAdStore.getState();
      store.setBannerLoaded(false);
      await new Promise((resolve) => setTimeout(resolve, 500));
      store.setBannerLoaded(true);
      await AdAnalyticsEngine.trackEvent('BANNER', 'LOADED', BANNER_ID, Date.now() - startTime);
    } catch (e: any) {
      await AdAnalyticsEngine.trackEvent('BANNER', 'FAILED', BANNER_ID, Date.now() - startTime, e?.message);
    }
  }
}

export default BannerRotationEngine.getInstance();
