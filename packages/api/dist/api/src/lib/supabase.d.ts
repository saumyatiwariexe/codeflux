/**
 * Service-role Supabase client. Runs on the backend only — bypasses RLS,
 * so every route must enforce its own authorization (see lib/auth.ts).
 */
export declare const supabase: import("@supabase/supabase-js").SupabaseClient<any, "public", "public", any, any>;
//# sourceMappingURL=supabase.d.ts.map