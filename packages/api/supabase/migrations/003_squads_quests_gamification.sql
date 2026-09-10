-- ============================================================
-- Migration 003: SquadUp, Quests & Gamification
-- Campus Pulse — Supabase PostgreSQL
-- ============================================================

-- ---- SquadUp: Teams ----
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

-- ---- SquadUp: Swipes & Matches ----
CREATE TABLE IF NOT EXISTS squad_swipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  swiper_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  swiped_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('like', 'pass', 'super')),
  context TEXT DEFAULT 'general' CHECK (context IN ('hackathon', 'project', 'general', 'internship')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(swiper_id, swiped_id)
);

CREATE TABLE IF NOT EXISTS squad_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user_b UUID REFERENCES profiles(id) ON DELETE CASCADE,
  matched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  team_id UUID REFERENCES teams(id),
  status TEXT DEFAULT 'matched' CHECK (status IN ('matched', 'teamed', 'archived')),
  UNIQUE(user_a, user_b)
);

-- ---- Quests ----
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

-- ---- Badges ----
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

-- ---- EduRevolution ----
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

-- ---- Lost & Found ----
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

-- ---- Indexes ----
CREATE INDEX IF NOT EXISTS idx_swipes_swiper ON squad_swipes(swiper_id);
CREATE INDEX IF NOT EXISTS idx_swipes_swiped ON squad_swipes(swiped_id);
CREATE INDEX IF NOT EXISTS idx_matches_user_a ON squad_matches(user_a);
CREATE INDEX IF NOT EXISTS idx_matches_user_b ON squad_matches(user_b);
CREATE INDEX IF NOT EXISTS idx_quests_type ON quests(type);
CREATE INDEX IF NOT EXISTS idx_quest_progress_profile ON quest_progress(profile_id);
CREATE INDEX IF NOT EXISTS idx_edurev_profile ON edurev_achievements(profile_id);
CREATE INDEX IF NOT EXISTS idx_lost_items_category ON lost_items(category);

-- ---- RLS ----
ALTER TABLE squad_swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE squad_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE quest_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE edurev_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE lost_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE found_items ENABLE ROW LEVEL SECURITY;

-- Swipes are PRIVATE — only the swiper can see their own swipes
CREATE POLICY "swipes_private" ON squad_swipes
  FOR ALL USING (swiper_id IN (SELECT id FROM users WHERE firebase_uid = auth.jwt() ->> 'sub'));

-- Matches visible to both users
CREATE POLICY "matches_own_data" ON squad_matches
  FOR SELECT USING (
    user_a IN (SELECT id FROM users WHERE firebase_uid = auth.jwt() ->> 'sub') OR
    user_b IN (SELECT id FROM users WHERE firebase_uid = auth.jwt() ->> 'sub')
  );

-- Quest progress private
CREATE POLICY "quest_progress_private" ON quest_progress
  FOR ALL USING (profile_id IN (SELECT id FROM users WHERE firebase_uid = auth.jwt() ->> 'sub'));

-- EduRev private
CREATE POLICY "edurev_private" ON edurev_achievements
  FOR ALL USING (profile_id IN (SELECT id FROM users WHERE firebase_uid = auth.jwt() ->> 'sub'));

-- Lost & Found readable by all (for matching)
CREATE POLICY "lost_items_read_all" ON lost_items FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "found_items_read_all" ON found_items FOR SELECT USING (auth.role() = 'authenticated');

-- ---- Seed badges ----
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
