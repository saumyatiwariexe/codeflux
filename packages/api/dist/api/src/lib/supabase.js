"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
/**
 * Service-role Supabase client. Runs on the backend only — bypasses RLS,
 * so every route must enforce its own authorization (see lib/auth.ts).
 */
exports.supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL ?? '', process.env.SUPABASE_SERVICE_KEY ?? '', { auth: { persistSession: false } });
//# sourceMappingURL=supabase.js.map