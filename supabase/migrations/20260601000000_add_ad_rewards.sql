-- Migration: Add ad_rewards table with full RLS security controls
-- Created: 2026-06-01

CREATE TABLE IF NOT EXISTS public.ad_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reward_type TEXT NOT NULL,
    reward_value INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.ad_rewards ENABLE ROW LEVEL SECURITY;

-- Policy: Select policy for owner
CREATE POLICY ad_rewards_owner_select_policy ON public.ad_rewards
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Policy: Insert policy for owner
CREATE POLICY ad_rewards_owner_insert_policy ON public.ad_rewards
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Policy: Update policy for owner
CREATE POLICY ad_rewards_owner_update_policy ON public.ad_rewards
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Delete policy for owner
CREATE POLICY ad_rewards_owner_delete_policy ON public.ad_rewards
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
