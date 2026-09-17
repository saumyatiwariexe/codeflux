-- ============================================================
-- Paladeium — Complete Supabase Database Schema (AMD-008)
-- One-click setup: Paste this entire file into Supabase Dashboard
-- -> SQL Editor -> Click 'Run'.
-- ============================================================

-- ── 1. Extensions ─────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- Enable PostGIS for spatial queries (CampusVerse / GTA5 map fog / proximity)
-- If your Supabase instance doesn't have PostGIS enabled in extensions,
-- you can enable it in Dashboard -> Database -> Extensions -> postgis
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ── 2. Users & Profiles (Clerk Authentication Layer) ──────────
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  is_id_verified BOOLEAN DEFAULT false,
  is_phone_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  deactivation_date TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_clerk_user_id ON users(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  handle TEXT UNIQUE NOT NULL CHECK (handle ~ '^[a-z0-9_]{3,30}$'),
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT CHECK (char_length(bio) <= 300),
  department TEXT,
  year INTEGER CHECK (year BETWEEN 1 AND 6),
  degree_level TEXT CHECK (degree_level IN ('UG', 'PG', 'PhD')),
  stream TEXT,
  pronouns TEXT,
  hostel_block TEXT,
  is_day_scholar BOOLEAN DEFAULT false,
  campus_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  squad_visibility TEXT DEFAULT 'all' CHECK (squad_visibility IN ('all', 'dept', 'off')),
  onboarding_complete BOOLEAN DEFAULT false,
  photos JSONB DEFAULT '[]'::jsonb,   -- Up to 6 photos: [{url, position}]
  prompts JSONB DEFAULT '[]'::jsonb,  -- Up to 3 Hinge-style prompts: [{prompt, answer}]
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_department ON profiles(department);
CREATE INDEX IF NOT EXISTS idx_profiles_xp ON profiles(campus_xp DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_handle ON profiles(handle);

-- ── 3. Skills Master & Join ───────────────────────────────────
CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  category TEXT CHECK (category IN ('Tech', 'Design', 'Business', 'Research', 'Sports', 'Arts')),
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profile_skills (
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  proficiency TEXT DEFAULT 'intermediate' CHECK (proficiency IN ('beginner', 'intermediate', 'expert')),
  PRIMARY KEY (profile_id, skill_id)
);

CREATE INDEX IF NOT EXISTS idx_profile_skills_profile ON profile_skills(profile_id);

-- ── 4. Events & Ticketing ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  organizer_id UUID NOT NULL,
  organizer_type TEXT CHECK (organizer_type IN ('club', 'user', 'admin')),
  location_name TEXT,
  location_coords JSONB,             -- {lat, lng}
  block_reference TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  category TEXT CHECK (category IN ('hackathon', 'workshop', 'cultural', 'sports', 'academic')),
  max_attendees INTEGER,
  registration_deadline TIMESTAMP WITH TIME ZONE,
  poster_url TEXT,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed', 'cancelled')),
  is_team_event BOOLEAN DEFAULT false,
  min_team_size INTEGER DEFAULT 1,
  max_team_size INTEGER DEFAULT 4,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);

CREATE TABLE IF NOT EXISTS ticket_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price DECIMAL(10,2) DEFAULT 0,
  quantity INTEGER,
  perks JSONB,                        -- ["Front row", "T-shirt"]
  sold_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_id UUID REFERENCES ticket_tiers(id),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  holder_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  team_id UUID,
  qr_code TEXT UNIQUE NOT NULL,
  booking_id TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'redeemed', 'refunded', 'expired')),
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  redeemed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_tickets_holder ON tickets(holder_id);
CREATE INDEX IF NOT EXISTS idx_tickets_event ON tickets(event_id);

-- ── 5. Clubs & Memberships ────────────────────────────────────
CREATE TABLE IF NOT EXISTS clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('tech', 'cultural', 'sports', 'academic', 'social')),
  logo_url TEXT,
  banner_url TEXT,
  member_count INTEGER DEFAULT 0,
  is_recruiting BOOLEAN DEFAULT false,
  application_deadline TIMESTAMP WITH TIME ZONE,
  social_links JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clubs_slug ON clubs(slug);

CREATE TABLE IF NOT EXISTS club_memberships (
  club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'coordinator', 'president', 'faculty_advisor')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (club_id, profile_id)
);

-- ── 6. SquadUp (Teams, Swipes & Matches) ──────────────────────
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  goal TEXT,
  competition_id UUID REFERENCES events(id),
  creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  max_members INTEGER DEFAULT 5,
  status TEXT DEFAULT 'forming' CHECK (status IN ('forming', 'complete', 'competing', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS team_members (
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (team_id, profile_id)
);

CREATE TABLE IF NOT EXISTS squad_swipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  swiper_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  swiped_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('like', 'pass', 'super')),
  context TEXT DEFAULT 'general' CHECK (context IN ('hackathon', 'project', 'general', 'internship')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(swiper_id, swiped_id)
);

CREATE INDEX IF NOT EXISTS idx_swipes_swiper ON squad_swipes(swiper_id);
CREATE INDEX IF NOT EXISTS idx_swipes_swiped ON squad_swipes(swiped_id);

CREATE TABLE IF NOT EXISTS squad_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user_b UUID REFERENCES profiles(id) ON DELETE CASCADE,
  matched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  team_id UUID REFERENCES teams(id),
  status TEXT DEFAULT 'matched' CHECK (status IN ('matched', 'teamed', 'archived')),
  UNIQUE(user_a, user_b)
);

CREATE INDEX IF NOT EXISTS idx_matches_user_a ON squad_matches(user_a);
CREATE INDEX IF NOT EXISTS idx_matches_user_b ON squad_matches(user_b);

-- ── 7. CampusVerse Quests & Gamification ──────────────────────
CREATE TABLE IF NOT EXISTS quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('explorer', 'academic', 'social', 'daily', 'weekly')),
  xp_reward INTEGER NOT NULL,
  badge_id UUID,
  edurev_linkage BOOLEAN DEFAULT false,
  location_required BOOLEAN DEFAULT false,
  target_location JSONB,             -- {lat, lng, radius_meters}
  completion_criteria JSONB,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quests_type ON quests(type);

CREATE TABLE IF NOT EXISTS quest_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  quest_id UUID REFERENCES quests(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'expired')),
  progress_data JSONB,
  completed_at TIMESTAMP WITH TIME ZONE,
  xp_awarded INTEGER,
  UNIQUE(profile_id, quest_id)
);

CREATE INDEX IF NOT EXISTS idx_quest_progress_profile ON quest_progress(profile_id);

CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  rarity TEXT CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  criteria TEXT
);

CREATE TABLE IF NOT EXISTS profile_badges (
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
  awarded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (profile_id, badge_id)
);

-- ── 8. EduRevolution (LPU Policy Integration) ─────────────────
CREATE TABLE IF NOT EXISTS edurev_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('RESEARCH_PAPER', 'COMPETITION_WIN', 'CERTIFICATION', 'PATENT', 'INTERNSHIP', 'STARTUP', 'MOOC')),
  proof_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'submitted')),
  attendance_relaxation NUMERIC(5,2),
  grade_benefit TEXT,
  xp_awarded INTEGER,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_note TEXT
);

CREATE INDEX IF NOT EXISTS idx_edurev_profile ON edurev_achievements(profile_id);

-- ── 9. LostPulse (Lost & Found) ───────────────────────────────
CREATE TABLE IF NOT EXISTS lost_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('electronics', 'bag', 'wallet', 'id_card', 'keys', 'clothing', 'books', 'other')),
  last_seen_location TEXT,
  last_seen_at TIMESTAMP WITH TIME ZONE,
  image_url TEXT,
  image_embedding JSONB,             -- CLIP vector for AI matching
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'matched', 'resolved')),
  reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS found_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('electronics', 'bag', 'wallet', 'id_card', 'keys', 'clothing', 'books', 'other')),
  found_location TEXT,
  found_at TIMESTAMP WITH TIME ZONE,
  image_url TEXT,
  image_embedding JSONB,
  status TEXT DEFAULT 'unclaimed' CHECK (status IN ('unclaimed', 'matched', 'returned')),
  reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lost_items_category ON lost_items(category);

-- ── 10. Row Level Security (RLS) ──────────────────────────────
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE squad_swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE squad_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE quest_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE edurev_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE lost_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE found_items ENABLE ROW LEVEL SECURITY;

-- Helper query: gets current user's profile ID based on Clerk JWT sub
-- auth.jwt() ->> 'sub' yields the Clerk User ID: 'user_2...'

CREATE POLICY "users_own_data" ON users
  FOR ALL USING (clerk_user_id = auth.jwt() ->> 'sub');

CREATE POLICY "profiles_read_all" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated' OR auth.jwt() ->> 'sub' IS NOT NULL);

CREATE POLICY "profiles_own_write" ON profiles
  FOR ALL USING (id IN (SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'));

CREATE POLICY "profile_skills_read" ON profile_skills FOR SELECT USING (true);
CREATE POLICY "profile_skills_own_write" ON profile_skills
  FOR ALL USING (profile_id IN (SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'));

CREATE POLICY "events_read_all" ON events FOR SELECT USING (true);

CREATE POLICY "tickets_own_data" ON tickets
  FOR ALL USING (holder_id IN (SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'));

CREATE POLICY "clubs_read_all" ON clubs FOR SELECT USING (true);

-- Swipes are strictly private to the swiper
CREATE POLICY "swipes_private" ON squad_swipes
  FOR ALL USING (swiper_id IN (SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'));

-- Matches visible to both participants
CREATE POLICY "matches_own_data" ON squad_matches
  FOR SELECT USING (
    user_a IN (SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub') OR
    user_b IN (SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub')
  );

CREATE POLICY "quest_progress_private" ON quest_progress
  FOR ALL USING (profile_id IN (SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'));

CREATE POLICY "edurev_private" ON edurev_achievements
  FOR ALL USING (profile_id IN (SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'));

CREATE POLICY "lost_items_read_all" ON lost_items FOR SELECT USING (true);
CREATE POLICY "found_items_read_all" ON found_items FOR SELECT USING (true);

CREATE POLICY "lost_items_own_insert" ON lost_items
  FOR INSERT WITH CHECK (reporter_id IN (SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'));

CREATE POLICY "found_items_own_insert" ON found_items
  FOR INSERT WITH CHECK (reporter_id IN (SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'));

-- ── 11. Supabase Storage Setup ─────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('avatars',   'avatars',   true),
  ('lostfound', 'lostfound', true),
  ('edurev',    'edurev',    false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
CREATE POLICY "avatars_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "avatars_owner_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars'
    AND auth.jwt() ->> 'sub' IS NOT NULL
  );

CREATE POLICY "avatars_owner_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars'
    AND auth.jwt() ->> 'sub' IS NOT NULL
  );

CREATE POLICY "lostfound_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'lostfound');

CREATE POLICY "lostfound_authenticated_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'lostfound'
    AND auth.jwt() ->> 'sub' IS NOT NULL
  );

CREATE POLICY "edurev_owner_only" ON storage.objects
  FOR ALL USING (
    bucket_id = 'edurev'
    AND auth.jwt() ->> 'sub' IS NOT NULL
    AND (storage.foldername(name))[1] = auth.jwt() ->> 'sub'
  );

-- ── 12. Seed Data ──────────────────────────────────────────────
INSERT INTO skills (name, category) VALUES
  ('React', 'Tech'), ('React Native', 'Tech'), ('Next.js', 'Tech'),
  ('Node.js', 'Tech'), ('Python', 'Tech'), ('TypeScript', 'Tech'),
  ('PyTorch', 'Tech'), ('TensorFlow', 'Tech'), ('NLP', 'Tech'),
  ('Computer Vision', 'Tech'), ('Scikit-Learn', 'Tech'), ('FastAPI', 'Tech'),
  ('Docker', 'Tech'), ('Kubernetes', 'Tech'), ('AWS', 'Tech'),
  ('GCP', 'Tech'), ('Azure', 'Tech'), ('Solidity', 'Tech'),
  ('Unity', 'Tech'), ('C#', 'Tech'), ('C++', 'Tech'),
  ('Rust', 'Tech'), ('Go', 'Tech'), ('ROS', 'Tech'),
  ('Embedded Systems', 'Tech'), ('VLSI', 'Tech'), ('Arduino', 'Tech'),
  ('Penetration Testing', 'Tech'), ('Bioinformatics', 'Tech'),
  ('Figma', 'Design'), ('Adobe XD', 'Design'), ('Illustrator', 'Design'),
  ('Motion Design', 'Design'), ('Branding', 'Design'), ('3D Modeling', 'Design'),
  ('Product Management', 'Business'), ('Pitching', 'Business'),
  ('Financial Modeling', 'Business'), ('Market Research', 'Business'),
  ('Content Strategy', 'Business'),
  ('CRISPR / Gene Editing', 'Research'), ('Quantum Computing', 'Research'),
  ('Academic Writing', 'Research'), ('Statistical Analysis', 'Research')
ON CONFLICT (name) DO NOTHING;

INSERT INTO badges (name, description, rarity, criteria) VALUES
  ('First Steps', 'Completed onboarding and set up your profile', 'common', 'onboarding_complete'),
  ('Campus Explorer', 'Revealed 10 zones on the CampusVerse map', 'rare', 'zones_revealed_10'),
  ('Squad Founder', 'Formed your first team on SquadUp', 'rare', 'team_created'),
  ('HackLPU Finalist', 'Reached the finals of HackLPU', 'epic', 'hacklpu_finalist'),
  ('EduRev Pioneer', 'Logged your first EduRevolution achievement', 'common', 'edurev_first'),
  ('Legend of the Campus', 'Reached Level 10 with 25,000 XP', 'legendary', 'level_10'),
  ('Streak Master', 'Maintained a 30-day daily quest streak', 'epic', 'streak_30'),
  ('Lost & Found Hero', 'Successfully returned 3 lost items', 'rare', 'lostfound_3')
ON CONFLICT DO NOTHING;
