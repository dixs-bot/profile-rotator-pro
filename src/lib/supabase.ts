import { createClient } from '@supabase/supabase-js';

// Placeholders for Supabase connection details. In production, these should be supplied
// via environment variables: EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://wselccvsmicsdvfrpfnk.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzZWxjY3ZzbWljc2R2ZnJwZm5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzMDk4NTcsImV4cCI6MjA5NTg4NTg1N30.hM_gUDiKEtUH1PeKieuklDcW2ZUPeYZHIQs9zBWO9gs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
