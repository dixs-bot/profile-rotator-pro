-- Supabase Migration SQL Script
-- Upgrade ad_settings table to support Smart AdMob Refresh & Rotation Engine

-- Add new columns if they do not exist
ALTER TABLE public.ad_settings
ADD COLUMN IF NOT EXISTS banner_refresh_seconds INTEGER DEFAULT 60,
ADD COLUMN IF NOT EXISTS banner_rotation_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS interstitial_cooldown_seconds INTEGER DEFAULT 120,
ADD COLUMN IF NOT EXISTS rewarded_preload_enabled BOOLEAN DEFAULT true;

-- Ensure that Row Level Security (RLS) is enabled
ALTER TABLE public.ad_settings ENABLE ROW LEVEL SECURITY;

-- Note: Existing triggers such as trg_update_ad_settings_updated_at and trg_audit_ad_settings will remain intact
-- and will fire correctly on updates since they are defined ON UPDATE of public.ad_settings.
