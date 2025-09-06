import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Environment check:');
console.log('Supabase URL:', supabaseUrl ? 'Present' : 'Missing');
console.log('Supabase Key:', supabaseAnonKey ? 'Present' : 'Missing');

// Don't throw error immediately - handle gracefully
let supabase: any = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
  console.log('✅ Supabase initialized successfully');
} else {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please create .env.local file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

export { supabase };
export default supabase;
