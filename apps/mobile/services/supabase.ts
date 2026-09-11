// ============================================================
// Paladeium — Supabase Client (AMD-008)
// Initialize once; import `supabase` anywhere in the app.
// Keys live in .env — EXPO_PUBLIC_ prefix makes them available
// in Expo's JS bundle via process.env.
// ============================================================

import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '[Supabase] Missing env vars. Add EXPO_PUBLIC_SUPABASE_URL and ' +
      'EXPO_PUBLIC_SUPABASE_ANON_KEY to your .env file.'
  );
}

/**
 * Singleton Supabase client for the Paladeium mobile app.
 * Session is persisted to AsyncStorage so users stay signed in
 * across app restarts. Auth is handled by Clerk; this client
 * uses the Clerk JWT (injected via setClerkToken) for RLS.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // We delegate session management to Clerk — Supabase auth
    // is used only for RLS via the custom JWT, not for sign-in.
    storage: AsyncStorage,
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

/**
 * Call this after Clerk sign-in to attach the Clerk JWT to all
 * future Supabase requests. The Supabase project must be configured
 * to accept Clerk as a custom JWT provider (JWKS URL in Supabase
 * Dashboard → Auth → JWT Settings).
 *
 * @param token - The Clerk session token (from `getToken()`)
 */
export async function setClerkToken(token: string | null): Promise<void> {
  if (token) {
    // Supabase's setSession expects access_token + refresh_token.
    // For Clerk-as-JWT-provider we only set the access token;
    // Supabase RLS will validate it against the Clerk JWKS.
    await supabase.auth.setSession({
      access_token: token,
      refresh_token: token, // unused — Clerk manages refresh
    });
  } else {
    await supabase.auth.signOut();
  }
}
