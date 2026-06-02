import { supabase } from '../lib/supabase';
import { useAdStore } from '../store/adStore';
import { useRotationStore } from '../store/rotationStore';

export class AnalyticsService {
  private static instance: AnalyticsService | null = null;

  private constructor() {}

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  /**
   * Directly pulls real aggregate statistics from Supabase database tables,
   * without mock data fallbacks, adhering strictly to production auditing guidelines.
   */
  public async fetchRealTimeAnalytics(): Promise<{
    totalAdImpressions: number;
    adClicks: number;
    estimatedRevenue: number;
    totalRotationCount: number;
    averageAdLoadTimeMs: number;
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated for analytics fetch.');
      }

      // 1. Compute aggregate ad analytics from the real DB records
      const { data: adStats, error: adErr } = await supabase
        .from('ad_analytics')
        .select('impressions, clicks, revenue')
        .eq('user_id', user.id);

      if (adErr) throw adErr;

      let totalAdImpressions = 0;
      let adClicks = 0;
      let estimatedRevenue = 0;

      if (adStats && adStats.length > 0) {
        adStats.forEach(row => {
          totalAdImpressions += row.impressions || 0;
          adClicks += row.clicks || 0;
          estimatedRevenue += parseFloat(row.revenue || '0');
        });
      }

      // 2. Fetch aggregate count of rotation successes
      const { count: rotationCount, error: rotErr } = await supabase
        .from('rotation_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'SUCCESS');

      if (rotErr) throw rotErr;

      // 3. Compute real-time average ad load time
      const { data: adEvents, error: eventErr } = await supabase
        .from('ad_events')
        .select('load_time_ms')
        .eq('user_id', user.id)
        .not('load_time_ms', 'is', null);

      if (eventErr) throw eventErr;

      let averageAdLoadTimeMs = 0;
      if (adEvents && adEvents.length > 0) {
        const totalLoadTime = adEvents.reduce((sum, item) => sum + (item.load_time_ms || 0), 0);
        averageAdLoadTimeMs = Math.round(totalLoadTime / adEvents.length);
      }

      return {
        totalAdImpressions,
        adClicks,
        estimatedRevenue,
        totalRotationCount: rotationCount || 0,
        averageAdLoadTimeMs
      };
    } catch (error) {
      console.error('[AnalyticsService] Failed to pull real database analytics:', error);
      // Fail loudly to avoid silent fallback mismatches
      throw error;
    }
  }
}

export default AnalyticsService.getInstance();
