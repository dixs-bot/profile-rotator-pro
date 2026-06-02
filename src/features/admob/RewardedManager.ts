import { useAdStore } from '../../store/adStore';
import AdAnalyticsEngine from './AdAnalyticsEngine';

const REWARDED_ID = process.env.EXPO_PUBLIC_ADMOB_REWARDED_ID || 'ca-app-pub-3940256099942544/5224354917';

export class RewardedManager {
  private static instance: RewardedManager | null = null;
  private isPreloading = false;
  private preloadErrorCount = 0;

  private constructor() {}

  public static getInstance(): RewardedManager {
    if (!RewardedManager.instance) {
      RewardedManager.instance = new RewardedManager();
    }
    return RewardedManager.instance;
  }

  public async preload(): Promise<void> {
    const store = useAdStore.getState();
    if (!store.settings.rewarded_preload_enabled) return;
    if (store.rewardedLoaded || this.isPreloading) return;

    this.isPreloading = true;
    const startTime = Date.now();

    try {
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() < 0.05) {
            reject(new Error('Preloading video timed out.'));
          } else {
            resolve(true);
          }
        }, 1500);
      });

      store.setRewardedLoaded(true);
      this.isPreloading = false;
      this.preloadErrorCount = 0;

      const loadTime = Date.now() - startTime;
      await AdAnalyticsEngine.trackEvent('REWARDED', 'LOADED', REWARDED_ID, loadTime);
    } catch (error: any) {
      this.isPreloading = false;
      this.preloadErrorCount++;
      const loadTime = Date.now() - startTime;
      await AdAnalyticsEngine.trackEvent('REWARDED', 'FAILED', REWARDED_ID, loadTime, error?.message);

      const wait = Math.min(60000, Math.pow(2, this.preloadErrorCount) * 2000);
      setTimeout(() => this.preload(), wait);
    }
  }

  public async showRewarded(onRewardGranted?: (rewardType: string, amount: number) => void): Promise<boolean> {
    const store = useAdStore.getState();

    if (!store.rewardedLoaded) {
      this.preload();
      return false;
    }

    try {
      store.setRewardedLoaded(false);
      store.setRewardGranted(true);
      store.setLastAdShown(Date.now());

      await AdAnalyticsEngine.trackEvent('REWARDED', 'SHOWN', REWARDED_ID);

      const type = 'PREMIUM_CREDIT';
      const amount = 10;
      await AdAnalyticsEngine.trackReward(type, amount, 'REWARDED');

      if (onRewardGranted) {
        onRewardGranted(type, amount);
      }

      // Chain next background preload
      this.preload();
      return true;
    } catch (error: any) {
      await AdAnalyticsEngine.trackEvent('REWARDED', 'FAILED', REWARDED_ID, undefined, error?.message);
      return false;
    }
  }
}

export default RewardedManager.getInstance();
