
import { createClient } from '@supabase/supabase-js';

// Accessing environment variables via process.env which is the standard in this environment
const supabaseUrl = (process.env.VITE_SUPABASE_URL as string) || '';
const supabaseAnonKey = (process.env.VITE_SUPABASE_ANON_KEY as string) || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase credentials missing in process.env! Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your environment.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
