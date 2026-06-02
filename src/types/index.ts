export interface Profile {
  id: string;
  name: string;
  brand: string;
  model: string;
  android_version: string;
  user_agent: string;
  language: string;
  timezone: string;
  country: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
}

export interface RotationSettings {
  id: string;
  rotation_enabled: boolean;
  rotation_interval: number; // in seconds
  current_profile_id: string;
  last_rotation: string;
}

export interface VpnProfile {
  id: string;
  name: string;
  country: string;
  server_name: string;
  server_id: string;
  notes?: string;
  created_at: string;
}

export interface RotationLog {
  id: string;
  profile_name: string;
  vpn_profile_name: string;
  old_state: string;
  new_state: string;
  rotation_time: string;
  status: 'SUCCESS' | 'WARNING' | 'ERROR';
}

export interface SyncQueueItem {
  id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  table: 'profiles' | 'vpn_profiles' | 'proxy_profiles' | 'rotation_settings';
  payload: any;
  created_at: string;
}
