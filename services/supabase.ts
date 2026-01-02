import { createClient } from '@supabase/supabase-js';

// Fix: Access environment variables via process.env to resolve TypeScript errors with import.meta.env
// and maintain consistency with the environment's configuration guidelines.
const supabaseUrl = (process.env.VITE_SUPABASE_URL as string) || '';
const supabaseAnonKey = (process.env.VITE_SUPABASE_ANON_KEY as string) || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials missing. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in Vercel.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);