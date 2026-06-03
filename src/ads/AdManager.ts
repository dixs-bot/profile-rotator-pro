import { useAdStore } from '../store/adStore';
import { ErrorService } from '../services/ErrorService';

// Fallback configuration for Test Ad Unit IDs if env variables are empty
const APP_ID = process.env.EXPO_PUBLIC_ADMOB_APP_ID || 'ca-app-pub-3940256099942544~3347511713';
const BANNER_ID = process.env.EXPO_PUBLIC_ADMOB_BANNER_ID || 'ca-app-pub-9104547576623729/5105939285';
const INTERSTITIAL_ID = process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID || 'ca-app-pub-9104547576623729/2127736391';
const REWARDED_ID = process.env.EXPO_PUBLIC_ADMOB_REWARDED_ID || 'ca-app-pub-9104547576623729/7145249039';
const REWARDED_INTERSTITIAL_ID = process.env.EXPO_PUBLIC_ADMOB_REWARDED_INTERSTITIAL_ID || 'ca-app-pub-9104547576623729/9814654729';

// Frequency cap limit: 1 interstitial ad every 2 minutes (120,000 milliseconds)
export const FREQUENCY_CAP_MS = 120000;

export class AdManager {
  private static instance: AdManager | null = null;
  private isInitialized = false;
  private autoRetryCount = 0;
  private maxRetries = 3;

  private constructor() {}

  public static getInstance(): AdManager {
    if (!AdManager.instance) {
      AdManager.instance = new AdManager();
    }
    return AdManager.instance;
  }

  public async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;
    try {
      // In a real environment, you would require and initialize MobileAds:
      // import MobileAds from 'react-native-google-mobile-ads';
      // await MobileAds().initialize();
      
      console.log('[AdManager] Initializing Google Mobile Ads SDK with App ID:', APP_ID);
      this.isInitialized = true;
      this.autoRetryCount = 0;
      
      // Load initial batch of ads
      this.loadBanner();
      this.loadInterstitial();
      this.loadRewarded();
      this.loadRewardedInterstitial();
      
      return true;
    } catch (error) {
      ErrorService.logError('[AdManager] Initialization failed', 'ADMOB', error);
      this.isInitialized = false;
      return false;
    }
  }

  // --- Banner Ads ---
  public loadBanner() {
    const store = useAdStore.getState();
    console.log('[AdManager] Loading Banner Ad...', BANNER_ID);
    
    // Simulating loading callback
    setTimeout(() => {
      store.setBannerLoaded(true);
      store.incrementMetric('loaded');
    }, 1000);
  }

  // --- Interstitial Ads ---
  public loadInterstitial() {
    const store = useAdStore.getState();
    console.log('[AdManager] Loading Interstitial Ad...', INTERSTITIAL_ID);
    
    setTimeout(() => {
      store.setInterstitialLoaded(true);
      store.incrementMetric('loaded');
    }, 1500);
  }

  public async showInterstitial(): Promise<boolean> {
    const store = useAdStore.getState();
    const now = Date.now();
    const timeSinceLastAd = now - store.lastAdShown;

    // Verify Frequency Cap
    if (timeSinceLastAd < FREQUENCY_CAP_MS) {
      const waitTimeSec = Math.ceil((FREQUENCY_CAP_MS - timeSinceLastAd) / 1000);
      ErrorService.logWarning(`[AdManager] Interstitial request rate-limited. Wait ${waitTimeSec}s.`);
      return false;
    }

    if (!store.interstitialLoaded) {
      console.log('[AdManager] Interstitial Ad not loaded yet. Retrying load...');
      store.incrementMetric('failed');
      this.loadInterstitial();
      return false;
    }

    // Simulate Interstitial Display
    console.log('[AdManager] Showing Interstitial Ad!');
    store.setInterstitialLoaded(false);
    store.incrementMetric('shown');
    store.incrementMetric('views');
    store.setLastAdShown(now);

    // Auto-reload the next ad for caching
    setTimeout(() => this.loadInterstitial(), 2000);
    return true;
  }

  // --- Rewarded Ads ---
  public loadRewarded() {
    const store = useAdStore.getState();
    console.log('[AdManager] Loading Rewarded Ad...', REWARDED_ID);

    setTimeout(() => {
      store.setRewardedLoaded(true);
      store.incrementMetric('loaded');
    }, 2000);
  }

  public async showRewarded(onRewardEarned: (rewardType: string, amount: number) => void): Promise<boolean> {
    const store = useAdStore.getState();
    
    if (!store.rewardedLoaded) {
      console.log('[AdManager] Rewarded Ad not loaded yet. Reloading...');
      store.incrementMetric('failed');
      this.loadRewarded();
      return false;
    }

    console.log('[AdManager] Showing Rewarded Ad!');
    store.setRewardedLoaded(false);
    store.incrementMetric('shown');
    store.incrementMetric('views');
    store.setLastAdShown(Date.now());

    // Grant reward simulation
    setTimeout(() => {
      store.setRewardGranted(true);
      store.incrementMetric('rewardsEarned');
      onRewardEarned('COINS', 100);
      // Reload next ad
      this.loadRewarded();
    }, 1000);

    return true;
  }

  // --- Rewarded Interstitial Ads ---
  public loadRewardedInterstitial() {
    const store = useAdStore.getState();
    console.log('[AdManager] Loading Rewarded Interstitial Ad...', REWARDED_INTERSTITIAL_ID);

    setTimeout(() => {
      store.setRewardedInterstitialLoaded(true);
      store.incrementMetric('loaded');
    }, 1800);
  }

  public async showRewardedInterstitial(onRewardEarned: (rewardType: string, amount: number) => void): Promise<boolean> {
    const store = useAdStore.getState();

    if (!store.rewardedInterstitialLoaded) {
      console.log('[AdManager] Rewarded Interstitial Ad not loaded yet. Reloading...');
      store.incrementMetric('failed');
      this.loadRewardedInterstitial();
      return false;
    }

    console.log('[AdManager] Showing Rewarded Interstitial Ad!');
    store.setRewardedInterstitialLoaded(false);
    store.incrementMetric('shown');
    store.incrementMetric('views');
    store.setLastAdShown(Date.now());

    setTimeout(() => {
      store.setRewardGranted(true);
      store.incrementMetric('rewardsEarned');
      onRewardEarned('PREMIUM_ROTATION', 5);
      this.loadRewardedInterstitial();
    }, 1000);

    return true;
  }
}
export default AdManager.getInstance();
