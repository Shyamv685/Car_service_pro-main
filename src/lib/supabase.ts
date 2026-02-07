
import { createClient } from '@supabase/supabase-js';

// REPLACE THESE WITH YOUR ACTUAL SUPABASE CREDENTIALS
// You can find these in your Supabase Dashboard -> Project Settings -> API
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://YOUR_PROJECT_ID.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY';

// Flag to check if real credentials have been provided
export const isSupabaseConfigured = !supabaseUrl.includes('YOUR_PROJECT_ID');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
