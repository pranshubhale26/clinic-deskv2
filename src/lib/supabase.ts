import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error(
    'Missing VITE_SUPABASE_URL. Add it to your environment variables.'
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    'Missing VITE_SUPABASE_ANON_KEY. Add it to your environment variables.'
  );
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);

// Supabase is now mandatory for production.
export const isSupabaseConfigured = true;