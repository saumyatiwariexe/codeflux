-- ============================================================
-- Migration 004: Hinge-style Profile Photos & Prompts (SquadUp)
-- ============================================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS photos JSONB DEFAULT '[]'::jsonb;
-- photos: [{ "url": "...", "position": 0 }, ...] — up to 6, first is the primary card image

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS prompts JSONB DEFAULT '[]'::jsonb;
-- prompts: [{ "prompt": "My simple pleasures...", "answer": "..." }, ...] — up to 3, Hinge-style
