
import { createClient } from '@supabase/supabase-js';

// Using process.env to avoid ImportMeta errors and comply with standard environment variable access
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
