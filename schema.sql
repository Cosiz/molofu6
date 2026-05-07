-- Molofu6 Database Schema (Idempotent — safe to re-run)
-- Supabase (PostgreSQL) with Row Level Security

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES (IF NOT EXISTS for idempotency)
-- ============================================

CREATE TABLE IF NOT EXISTS families (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  preferred_language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS family_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('commander', 'helper', 'observer')),
  display_name TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'invited')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS kids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  birth_date DATE,
  school_name TEXT,
  school_address TEXT,
  school_lat NUMERIC,
  school_lng NUMERIC,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  kid_id UUID REFERENCES kids(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  location_name TEXT,
  location_address TEXT,
  location_lat NUMERIC,
  location_lng NUMERIC,
  activity_type TEXT DEFAULT 'other' CHECK (activity_type IN ('pickup', 'dropoff', 'lesson', 'tutor', 'medical', 'social', 'other')),
  assigned_to UUID REFERENCES family_members(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
  is_offline_available BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activity_checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  member_id UUID REFERENCES family_members(id) ON DELETE SET NULL,
  checkin_type TEXT NOT NULL CHECK (checkin_type IN ('arrival', 'departure', 'completed')),
  arrived_at TIMESTAMPTZ,
  departed_at TIMESTAMPTZ,
  photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  notification_type TEXT DEFAULT 'info' CHECK (notification_type IN ('info', 'reminder', 'alert', 'critical')),
  is_critical BOOLEAN DEFAULT FALSE,
  is_read BOOLEAN DEFAULT FALSE,
  related_activity_id UUID REFERENCES activities(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS timeline_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  author_member_id UUID REFERENCES family_members(id) ON DELETE SET NULL,
  post_type TEXT DEFAULT 'update' CHECK (post_type IN ('update', 'photo', 'milestone', 'alert')),
  content TEXT,
  photo_url TEXT,
  related_activity_id UUID REFERENCES activities(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES (IF NOT EXISTS for idempotency)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_activities_family_date ON activities(family_id, date);
CREATE INDEX IF NOT EXISTS idx_activities_assigned ON activities(assigned_to, date);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_family ON notifications(family_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_timeline_family ON timeline_posts(family_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_family_members_family ON family_members(family_id);
CREATE INDEX IF NOT EXISTS idx_checkins_activity ON activity_checkins(activity_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE kids ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_posts ENABLE ROW LEVEL SECURITY;

-- Families
DROP POLICY IF EXISTS "family_members_read" ON families;
CREATE POLICY "family_members_read" ON families FOR SELECT USING (
  id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid())
);
DROP POLICY IF EXISTS "commander_manage" ON families;
CREATE POLICY "commander_manage" ON families FOR ALL USING (
  id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid() AND role = 'commander')
);

-- Profiles
DROP POLICY IF EXISTS "own_profile_rw" ON profiles;
CREATE POLICY "own_profile_rw" ON profiles FOR ALL USING (id = auth.uid());

-- Family Members
DROP POLICY IF EXISTS "family_roster_read" ON family_members;
CREATE POLICY "family_roster_read" ON family_members FOR SELECT USING (
  family_id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid())
);
DROP POLICY IF EXISTS "commander_manage_members" ON family_members;
CREATE POLICY "commander_manage_members" ON family_members FOR ALL USING (
  family_id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid() AND role = 'commander')
);

-- Kids
DROP POLICY IF EXISTS "family_kids_read" ON kids;
CREATE POLICY "family_kids_read" ON kids FOR SELECT USING (
  family_id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid())
);
DROP POLICY IF EXISTS "commander_kids_manage" ON kids;
CREATE POLICY "commander_kids_manage" ON kids FOR ALL USING (
  family_id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid() AND role = 'commander')
);

-- Activities
DROP POLICY IF EXISTS "family_activities_read" ON activities;
CREATE POLICY "family_activities_read" ON activities FOR SELECT USING (
  family_id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid())
);
DROP POLICY IF EXISTS "family_activities_insert" ON activities FOR INSERT WITH CHECK (
  family_id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid() AND role IN ('commander', 'helper'))
);
DROP POLICY IF EXISTS "commander_activities_manage" ON activities;
CREATE POLICY "commander_activities_manage" ON activities FOR ALL USING (
  family_id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid() AND role = 'commander')
);

-- Activity Check-ins
DROP POLICY IF EXISTS "family_checkins_read" ON activity_checkins;
CREATE POLICY "family_checkins_read" ON activity_checkins FOR SELECT USING (
  activity_id IN (SELECT id FROM activities WHERE family_id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid()))
);
DROP POLICY IF EXISTS "family_checkins_insert" ON activity_checkins FOR INSERT WITH CHECK (
  activity_id IN (SELECT id FROM activities WHERE family_id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid()))
);

-- Notifications
DROP POLICY IF EXISTS "user_notifications_read" ON notifications;
CREATE POLICY "user_notifications_read" ON notifications FOR SELECT USING (
  user_id = auth.uid() OR user_id IS NULL
);
DROP POLICY IF EXISTS "commander_notifications_send" ON notifications;
CREATE POLICY "commander_notifications_send" ON notifications FOR INSERT WITH CHECK (
  family_id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid() AND role = 'commander')
);

-- Timeline
DROP POLICY IF EXISTS "family_timeline_read" ON timeline_posts;
CREATE POLICY "family_timeline_read" ON timeline_posts FOR SELECT USING (
  family_id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid())
);
DROP POLICY IF EXISTS "family_timeline_insert" ON timeline_posts;
CREATE POLICY "family_timeline_insert" ON timeline_posts FOR INSERT WITH CHECK (
  family_id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid())
);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers (safe to re-run)
DROP TRIGGER IF EXISTS tr_families_updated_at ON families;
DROP TRIGGER IF EXISTS tr_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS tr_activities_updated_at ON activities;
DROP TRIGGER IF EXISTS tr_notify_notification ON notifications;

-- Recreate triggers
CREATE TRIGGER tr_families_updated_at BEFORE UPDATE ON families FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_activities_updated_at BEFORE UPDATE ON activities FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Realtime notification trigger
CREATE OR REPLACE FUNCTION notify_notification()
RETURNS TRIGGER AS $$
BEGIN PERFORM pg_notify('new_notification', row_to_json(NEW)::text); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_notify_notification AFTER INSERT ON notifications FOR EACH ROW EXECUTE FUNCTION notify_notification();