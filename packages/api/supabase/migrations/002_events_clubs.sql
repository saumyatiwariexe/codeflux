-- ============================================================
-- Migration 002: Events & Ticketing
-- Campus Pulse — Supabase PostgreSQL
-- ============================================================

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
  team_id UUID,                       -- FK to teams (added in migration 003)
  qr_code TEXT UNIQUE NOT NULL,
  booking_id TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'redeemed', 'refunded', 'expired')),
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  redeemed_at TIMESTAMP WITH TIME ZONE
);

-- ---- Clubs ----
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

CREATE TABLE IF NOT EXISTS club_memberships (
  club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'coordinator', 'president', 'faculty_advisor')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (club_id, profile_id)
);

-- ---- Indexes ----
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);
CREATE INDEX IF NOT EXISTS idx_tickets_holder ON tickets(holder_id);
CREATE INDEX IF NOT EXISTS idx_tickets_event ON tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_clubs_slug ON clubs(slug);

-- ---- RLS ----
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "events_read_all" ON events FOR SELECT USING (true);
CREATE POLICY "tickets_own_data" ON tickets FOR ALL USING (holder_id IN (
  SELECT id FROM users WHERE firebase_uid = auth.jwt() ->> 'sub'
));
CREATE POLICY "clubs_read_all" ON clubs FOR SELECT USING (true);
