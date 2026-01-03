
import { createClient } from '@supabase/supabase-js';

// Helper to get environment variables from either process.env or import.meta.env
const getEnv = (key: string): string => {
  const env = (import.meta as any).env;
  return (process.env?.[key] || env?.[key]) || '';
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase configuration missing! Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in environment variables.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
