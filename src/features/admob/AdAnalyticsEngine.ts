import { supabase } from '../../lib/supabase';
import { useAdStore } from '../../store/adStore';

export class AdAnalyticsEngine {
  private static instance: AdAnalyticsEngine | null = null;

  private constructor() {}

  public static getInstance(): AdAnalyticsEngine {
    if (!AdAnalyticsEngine.instance) {
      AdAnalyticsEngine.instance = new AdAnalyticsEngine();
    }
    return AdAnalyticsEngine.instance;
  }

  /**
   * Tracks an ad-related event (loaded, shown, failed) and sends it to Supabase.
   */
  public async trackEvent(
    adType: 'BANNER' | 'INTERSTITIAL' | 'REWARDED' | 'REWARDED_INTERSTITIAL' | 'APP_OPEN',
    status: 'LOADED' | 'SHOWN' | 'FAILED' | 'CLICKED' | 'DISMISSED',
    adUnitId: string,
    loadTimeMs?: number,
    errorMessage?: string
  ): Promise<void> {
    const store = useAdStore.getState();
    
    // Update local metrics store
    if (status === 'LOADED') {
      store.incrementMetric('loaded');
    } else if (status === 'SHOWN') {
      store.incrementMetric('shown');
      store.incrementMetric('views');
    } else if (status === 'FAILED') {
      store.incrementMetric('failed');
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Send to public.ad_events
        await supabase.from('ad_events').insert({
          user_id: user.id,
          ad_type: adType,
          status,
          ad_unit_id: adUnitId,
          load_time_ms: loadTimeMs || null,
          error_message: errorMessage || null,
          created_at: new Date().toISOString()
        });

        // Upsert summary to public.ad_analytics for the current day
        const todayStr = new Date().toISOString().split('T')[0];
        
        // Fetch existing analytics row for today or create one
        const { data: existing } = await supabase
          .from('ad_analytics')
          .select('*')
          .eq('user_id', user.id)
          .eq('date', todayStr)
          .single();

        const updates: any = {
          user_id: user.id,
          date: todayStr,
          impressions: (existing?.impressions || 0) + (status === 'SHOWN' ? 1 : 0),
          clicks: (existing?.clicks || 0) + (status === 'CLICKED' ? 1 : 0),
          revenue: (existing?.revenue || 0.0) + (status === 'SHOWN' ? 0.0015 : 0.0) // Mock estimated revenue per impression
        };

        await supabase.from('ad_analytics').upsert(updates, { onConflict: 'user_id,date' });
      }
    } catch (e) {
      console.warn('[AdAnalyticsEngine] Sync event failed', e);
    }
  }

  /**
   * Tracks and records when a user successfully completes a rewarded ad.
   */
  public async trackReward(
    rewardType: string,
    rewardAmount: number,
    sourceAdType: 'REWARDED' | 'REWARDED_INTERSTITIAL'
  ): Promise<void> {
    const store = useAdStore.getState();
    store.incrementMetric('rewardsEarned');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const txId = Math.random().toString(36).substring(2, 15);
        const newTx = {
          id: txId,
          user_id: user.id,
          reward_type: rewardType,
          reward_amount: rewardAmount,
          source_ad_type: sourceAdType,
          created_at: new Date().toISOString()
        };

        // Insert to Supabase ad_rewards
        await supabase.from('ad_rewards').insert(newTx);
        
        // Update local store transactions list
        store.addRewardTransaction({
          id: txId,
          reward_type: rewardType,
          reward_amount: rewardAmount,
          created_at: new Date().toISOString()
        });
      }
    } catch (e) {
      console.warn('[AdAnalyticsEngine] Sync reward failed', e);
    }
  }
}

export default AdAnalyticsEngine.getInstance();
