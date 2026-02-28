-- Run this in your Supabase SQL editor
-- Dashboard → SQL Editor → New query → paste → Run

CREATE TABLE IF NOT EXISTS waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  agency_name TEXT,
  stripe_session_id TEXT UNIQUE,
  amount_paid INTEGER,
  status TEXT DEFAULT 'paid',
  answers JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_insert_waitlist" ON waitlist FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "service_all_applications" ON applications FOR ALL TO service_role USING (true);

CREATE INDEX IF NOT EXISTS idx_applications_stripe ON applications(stripe_session_id);
