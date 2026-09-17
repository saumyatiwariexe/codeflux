import { createClient } from '@supabase/supabase-js';

/**
 * Service-role Supabase client. Runs on the backend only — bypasses RLS,
 * so every route must enforce its own authorization (see lib/auth.ts).
 */
export const supabase = createClient(
  process.env.SUPABASE_URL ?? '',
  process.env.SUPABASE_SERVICE_KEY ?? '',
  { auth: { persistSession: false } }
);
