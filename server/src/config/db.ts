import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ENV } from './env.js';

export let db: SupabaseClient | null = null;

if (ENV.SUPABASE_URL && ENV.SUPABASE_SERVICE_ROLE_KEY) {
  try {
    db = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });
    console.log('✅ Supabase PostgreSQL Database client connected.');
  } catch (err) {
    console.warn('⚠️ Supabase Database client initialization warning:', err);
  }
} else {
  console.log('ℹ️ Supabase environment keys missing; running in standalone API mode.');
}
