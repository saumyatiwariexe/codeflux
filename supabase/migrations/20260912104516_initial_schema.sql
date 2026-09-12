-- Users & Profiles
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lpu_email TEXT UNIQUE NOT NULL,
  phone TEXT,
  firebase_uid TEXT UNIQUE,
  is_id_verified BOOLEAN DEFAULT false,
  is_phone_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES users(id),
  handle TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  department TEXT,
  year INTEGER,
  degree_level TEXT,
  hostel_block TEXT,
  is_day_scholar BOOLEAN DEFAULT false,
  campus_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  squad_visibility TEXT DEFAULT 'all',
  onboarding_complete BOOLEAN DEFAULT false
);

CREATE TABLE skills (
  id UUID PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  category TEXT,
  icon TEXT
);

CREATE TABLE profile_skills (
  profile_id UUID REFERENCES profiles(id),
  skill_id UUID REFERENCES skills(id),
  proficiency TEXT DEFAULT 'intermediate',
  PRIMARY KEY (profile_id, skill_id)
);

-- SquadUp Engine
CREATE TABLE squad_swipes (
  id UUID PRIMARY KEY,
  swiper_id UUID REFERENCES profiles(id),
  swiped_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,           -- 'like' | 'pass'
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(swiper_id, swiped_id)
);

CREATE TABLE squad_matches (
  id UUID PRIMARY KEY,
  user_a UUID REFERENCES profiles(id),
  user_b UUID REFERENCES profiles(id),
  matched_at TIMESTAMP DEFAULT NOW(),
  status TEXT DEFAULT 'matched'
);

CREATE TABLE teams (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  goal TEXT,
  creator_id UUID REFERENCES profiles(id),
  max_members INTEGER DEFAULT 5,
  status TEXT DEFAULT 'forming',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Events & Ticketing
CREATE TABLE events (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  organizer_id UUID,
  organizer_type TEXT,
  location_name TEXT,
  location_coords JSONB,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  category TEXT,
  max_attendees INTEGER,
  poster_url TEXT,
  status TEXT DEFAULT 'upcoming',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE tickets (
  id UUID PRIMARY KEY,
  event_id UUID REFERENCES events(id),
  holder_id UUID REFERENCES profiles(id),
  qr_code TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'active',
  purchased_at TIMESTAMP DEFAULT NOW()
);

-- Quests & Gamification
CREATE TABLE quests (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT,
  xp_reward INTEGER NOT NULL,
  location_required BOOLEAN DEFAULT false,
  target_location JSONB,
  completion_criteria JSONB,
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE quest_progress (
  id UUID PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id),
  quest_id UUID REFERENCES quests(id),
  status TEXT DEFAULT 'in_progress',
  progress_data JSONB,
  completed_at TIMESTAMP,
  xp_awarded INTEGER,
  UNIQUE(profile_id, quest_id)
);
