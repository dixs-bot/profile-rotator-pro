import { useAdStore } from '../../store/adStore';
import AdAnalyticsEngine from './AdAnalyticsEngine';

const INTERSTITIAL_ID = process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID || 'ca-app-pub-3940256099942544/1033173712';

export class InterstitialManager {
  private static instance: InterstitialManager | null = null;
  private isPreloading = false;
  private preloadErrorCount = 0;
  private adExpirationTime = 3600000; // 1 hour expiration

  private constructor() {}

  public static getInstance(): InterstitialManager {
    if (!InterstitialManager.instance) {
      InterstitialManager.instance = new InterstitialManager();
    }
    return InterstitialManager.instance;
  }

  public async preload(): Promise<void> {
    const store = useAdStore.getState();
    if (store.interstitialLoaded || this.isPreloading) return;

    this.isPreloading = true;
    const startTime = Date.now();

    try {
      // Simulate real listener callbacks and loading state machine
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() < 0.05) { // 5% simulated fail rate
            reject(new Error('Network timeouts or empty fills from AdMob mediation'));
          } else {
            resolve(true);
          }
        }, 1200);
      });

      store.setInterstitialLoaded(true);
      this.isPreloading = false;
      this.preloadErrorCount = 0;

      const loadTime = Date.now() - startTime;
      await AdAnalyticsEngine.trackEvent('INTERSTITIAL', 'LOADED', INTERSTITIAL_ID, loadTime);
    } catch (error: any) {
      this.isPreloading = false;
      this.preloadErrorCount++;
      const loadTime = Date.now() - startTime;
      await AdAnalyticsEngine.trackEvent('INTERSTITIAL', 'FAILED', INTERSTITIAL_ID, loadTime, error?.message);

      // Recursive backoff retry
      const wait = Math.min(60000, Math.pow(2, this.preloadErrorCount) * 2000);
      setTimeout(() => this.preload(), wait);
    }
  }

  public async showInterstitial(): Promise<boolean> {
    const store = useAdStore.getState();
    const now = Date.now();
    const cooldownMs = (store.settings.interstitial_cooldown_seconds || 120) * 1000;
    const elapsed = now - store.lastAdShown;

    if (elapsed < cooldownMs) {
      return false;
    }

    if (!store.interstitialLoaded) {
      this.preload();
      return false;
    }

    try {
      store.setInterstitialLoaded(false);
      store.setLastAdShown(now);

      await AdAnalyticsEngine.trackEvent('INTERSTITIAL', 'SHOWN', INTERSTITIAL_ID);
      
      // Auto-trigger next preloader
      this.preload();
      return true;
    } catch (e: any) {
      await AdAnalyticsEngine.trackEvent('INTERSTITIAL', 'FAILED', INTERSTITIAL_ID, undefined, e?.message);
      return false;
    }
  }
}

export default InterstitialManager.getInstance();
