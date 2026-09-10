-- ============================================================
-- Migration 001: Users, Profiles, Skills
-- Campus Pulse — Supabase PostgreSQL
-- Run: supabase db push (or paste in Supabase SQL Editor)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- For geo queries

-- ---- Users (authentication layer) ----
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lpu_email TEXT UNIQUE NOT NULL,
  phone TEXT,
  firebase_uid TEXT UNIQUE,
  is_id_verified BOOLEAN DEFAULT false,
  is_phone_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  deactivation_date TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---- Profiles (public-facing data) ----
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---- Skills master list ----
CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  category TEXT CHECK (category IN ('Tech', 'Design', 'Business', 'Research', 'Sports', 'Arts')),
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---- Profile <-> Skills join ----
CREATE TABLE IF NOT EXISTS profile_skills (
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  proficiency TEXT DEFAULT 'intermediate' CHECK (proficiency IN ('beginner', 'intermediate', 'expert')),
  PRIMARY KEY (profile_id, skill_id)
);

-- ---- Indexes ----
CREATE INDEX IF NOT EXISTS idx_profiles_department ON profiles(department);
CREATE INDEX IF NOT EXISTS idx_profiles_xp ON profiles(campus_xp DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_handle ON profiles(handle);
CREATE INDEX IF NOT EXISTS idx_profile_skills_profile ON profile_skills(profile_id);

-- ---- Row Level Security ----
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_skills ENABLE ROW LEVEL SECURITY;

-- Users can only read/update their own data
CREATE POLICY "users_own_data" ON users
  FOR ALL USING (firebase_uid = auth.jwt() ->> 'sub');

-- Profiles are readable by all authenticated users
CREATE POLICY "profiles_read_all" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "profiles_own_write" ON profiles
  FOR ALL USING (id IN (SELECT id FROM users WHERE firebase_uid = auth.jwt() ->> 'sub'));

-- ---- Seed skills ----
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
  ('Marketing', 'Business'), ('Finance', 'Business'), ('Consulting', 'Business'),
  ('Research', 'Research'), ('R Language', 'Research'), ('MATLAB', 'Research'),
  ('Photography', 'Arts'), ('Music', 'Arts'), ('Dance', 'Arts'),
  ('Public Speaking', 'Arts'), ('Cricket', 'Sports'), ('Badminton', 'Sports')
ON CONFLICT (name) DO NOTHING;
