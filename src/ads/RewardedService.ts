import AdManager from './AdManager';
import { supabase } from '../lib/supabase';
import { ErrorService } from '../services/ErrorService';

export class RewardedService {
  static async showAdAndGrantReward(userId?: string): Promise<boolean> {
    return await AdManager.showRewarded(async (type, amount) => {
      console.log(`[RewardedService] Granting ${amount} ${type} to user ${userId || 'anonymous'}`);
      
      if (userId) {
        try {
          const { error } = await supabase.from('ad_rewards').insert({
            user_id: userId,
            reward_type: type,
            reward_value: amount,
            created_at: new Date().toISOString()
          });
          if (error) throw error;
          console.log('[RewardedService] Ad reward successfully logged to Cloud Database.');
        } catch (e) {
          const errorMessage = e instanceof Error ? e.message : 'Unknown error';
          ErrorService.logError(errorMessage, 'ADMOB', e);
        }
      }
    });
  }

  static reload() {
    AdManager.loadRewarded();
  }
}
