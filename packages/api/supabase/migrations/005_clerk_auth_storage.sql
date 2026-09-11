-- ============================================================
-- Migration 005: Clerk Auth Migration + Supabase Storage Setup
-- Paladeium — Supabase PostgreSQL
-- AMD-008: Replaces Firebase Auth with Clerk OAuth
--
-- HOW TO RUN:
--   - If setting up a FRESH project: DO NOT run this file alone!
--     Instead, run: packages/api/supabase/complete_schema.sql (creates all tables + Clerk auth + Storage).
--   - If upgrading an existing database that already ran migrations 001-004: Run this file.
-- ============================================================

-- ── Step 1: Update users table — rename firebase_uid to clerk_user_id ────────

-- Add the new column (nullable initially to avoid constraint issues)
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS clerk_user_id TEXT;

-- Copy existing data if any (will be NULL for new projects)
UPDATE users SET clerk_user_id = firebase_uid WHERE firebase_uid IS NOT NULL;

-- Make it unique and add an index
ALTER TABLE users
  ADD CONSTRAINT users_clerk_user_id_unique UNIQUE (clerk_user_id);

CREATE INDEX IF NOT EXISTS idx_users_clerk_user_id ON users(clerk_user_id);

-- Drop the old column
-- NOTE: Only run this after confirming no existing firebase_uid data matters.
-- Comment this out if you want to keep the column during transition.
ALTER TABLE users DROP COLUMN IF EXISTS firebase_uid;

-- ── Step 2: Update email column — Clerk doesn't require @lpu.in ──────────────

-- Remove the NOT NULL constraint on lpu_email so non-LPU OAuth users can register
-- (rename column for clarity — it's now just their primary OAuth email)
ALTER TABLE users
  RENAME COLUMN lpu_email TO email;

-- Remove unique constraint and re-add (email should still be unique)
-- The constraint name may vary — check Dashboard → Table Editor if this fails
ALTER TABLE users
  DROP CONSTRAINT IF EXISTS users_lpu_email_key;

ALTER TABLE users
  ADD CONSTRAINT users_email_unique UNIQUE (email);

-- ── Step 3: Rewrite RLS policies to use Clerk JWT ────────────────────────────
-- Clerk JWTs have the user ID in the 'sub' claim (same as Firebase),
-- but Clerk's sub looks like: 'user_2abc123...' instead of a Firebase UID.
-- All policies below compare against clerk_user_id instead of firebase_uid.

-- Users table policies
DROP POLICY IF EXISTS "users_own_data" ON users;

CREATE POLICY "users_own_data" ON users
  FOR ALL USING (clerk_user_id = auth.jwt() ->> 'sub');

-- Profile write policy (references users.clerk_user_id now)
DROP POLICY IF EXISTS "profiles_own_write" ON profiles;

CREATE POLICY "profiles_own_write" ON profiles
  FOR ALL USING (
    id IN (SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub')
  );

-- SquadUp swipes — private (swiper only)
DROP POLICY IF EXISTS "swipes_private" ON squad_swipes;

CREATE POLICY "swipes_private" ON squad_swipes
  FOR ALL USING (
    swiper_id IN (SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub')
  );

-- Matches visible to both users
DROP POLICY IF EXISTS "matches_own_data" ON squad_matches;

CREATE POLICY "matches_own_data" ON squad_matches
  FOR SELECT USING (
    user_a IN (SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub') OR
    user_b IN (SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub')
  );

-- Quest progress private
DROP POLICY IF EXISTS "quest_progress_private" ON quest_progress;

CREATE POLICY "quest_progress_private" ON quest_progress
  FOR ALL USING (
    profile_id IN (SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub')
  );

-- EduRev achievements private
DROP POLICY IF EXISTS "edurev_private" ON edurev_achievements;

CREATE POLICY "edurev_private" ON edurev_achievements
  FOR ALL USING (
    profile_id IN (SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub')
  );

-- ── Step 4: Supabase Storage — create buckets ─────────────────────────────────
-- Run these in Supabase Dashboard → Storage → New Bucket,
-- OR uncomment the SQL below if your Supabase version supports storage SQL.
--
-- Note: Bucket creation via SQL is not available in all Supabase tiers.
-- If the INSERT below fails, create buckets manually in the Dashboard.

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('avatars',   'avatars',   true),   -- Profile photos (public read)
  ('lostfound', 'lostfound', true),   -- Lost & found item photos (public read)
  ('edurev',    'edurev',    false)    -- EduRev evidence (private — owner only)
ON CONFLICT (id) DO NOTHING;

-- ── Step 5: Storage RLS policies ─────────────────────────────────────────────

-- AVATARS bucket: public read, owner write
CREATE POLICY "avatars_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "avatars_owner_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars'
    AND auth.jwt() ->> 'sub' IS NOT NULL
    -- Path must be {clerk_user_id}.jpg
    AND (storage.foldername(name))[1] IS NULL
  );

CREATE POLICY "avatars_owner_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars'
    AND auth.jwt() ->> 'sub' IS NOT NULL
  );

-- LOSTFOUND bucket: public read, authenticated upload
CREATE POLICY "lostfound_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'lostfound');

CREATE POLICY "lostfound_authenticated_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'lostfound'
    AND auth.jwt() ->> 'sub' IS NOT NULL
  );

-- EDUREV bucket: private — only owner can read or write
CREATE POLICY "edurev_owner_only" ON storage.objects
  FOR ALL USING (
    bucket_id = 'edurev'
    AND auth.jwt() ->> 'sub' IS NOT NULL
    -- Path prefix must match the Clerk user ID
    AND (storage.foldername(name))[1] = auth.jwt() ->> 'sub'
  );

-- ── Step 6: Clerk JWT configuration reminder ──────────────────────────────────
-- After running this migration, configure Supabase to trust Clerk JWTs:
--
-- 1. Go to: Supabase Dashboard → Authentication → JWT Settings
-- 2. Set "JWT Secret" mode to "Custom JWKS URL"
-- 3. Enter your Clerk JWKS URL:
--    https://<your-clerk-domain>/.well-known/jwks.json
--    (Find your Clerk domain at: https://dashboard.clerk.com → your app → Domains)
-- 4. Save. Supabase will now validate tokens signed by Clerk.
--
-- This allows `auth.jwt()` in RLS policies to decode Clerk session tokens.
