import { createClient } from '@supabase/supabase-js';

/**
 * Anon-key Supabase client for the mobile app.
 * This is safe to expose — it only has public read access (RLS enforced server-side).
 * For writes requiring auth, call the Fastify API which uses the service-role key.
 */
export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
);
