import { Profile, RotationSettings, VpnProfile, RotationLog, SyncQueueItem } from './index';

export interface AdReward {
  id: string;
  user_id: string;
  reward_type: string;
  reward_value: number;
  created_at: string;
}

export * from './index';
