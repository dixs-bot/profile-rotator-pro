import { createClient } from '@supabase/supabase-js';

// Placeholders for Supabase connection details. In production, these should be supplied
// via environment variables: EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://YOUR PASTE.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiXXXX..JPASTE-ANON';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
