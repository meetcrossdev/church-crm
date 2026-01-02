import { createClient } from '@supabase/supabase-js';

// Vite exposes environment variables via import.meta.env
// They must be prefixed with VITE_ to be accessible on the client side.
// Fixed: Cast import.meta to any to resolve TypeScript 'Property env does not exist on type ImportMeta' error
const supabaseUrl = ((import.meta as any).env.VITE_SUPABASE_URL as string) || '';
const supabaseAnonKey = ((import.meta as any).env.VITE_SUPABASE_ANON_KEY as string) || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase credentials missing! Check your Vercel Environment Variables for VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
