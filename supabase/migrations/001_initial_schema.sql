-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PROFILES TABLE
-- ============================================================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  settings JSONB DEFAULT '{
    "theme": "system",
    "timezone": "UTC"
  }'::jsonb
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- NOTIFICATION SETTINGS TABLE
-- ============================================================================
CREATE TABLE notification_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  browser_notifications_enabled BOOLEAN DEFAULT TRUE,
  in_app_notifications_enabled BOOLEAN DEFAULT TRUE,
  sound_enabled BOOLEAN DEFAULT FALSE,
  timing_options TEXT[] DEFAULT ARRAY['15min', '5min'],
  custom_timing INTEGER,
  quiet_hours_enabled BOOLEAN DEFAULT FALSE,
  quiet_hours_start TEXT DEFAULT '22:00',
  quiet_hours_end TEXT DEFAULT '08:00',
  weekend_notifications_enabled BOOLEAN DEFAULT TRUE,
  daily_summary_enabled BOOLEAN DEFAULT FALSE,
  daily_summary_time TEXT DEFAULT '09:00',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

-- Notification settings policies
CREATE POLICY "Users can manage their own notification settings"
  ON notification_settings FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- TASK SERIES TABLE (for recurring tasks)
-- ============================================================================
CREATE TABLE task_series (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  recurrence JSONB NOT NULL,
  priority TEXT CHECK (priority IN ('high', 'medium', 'low')) DEFAULT 'medium',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  end_date TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE task_series ENABLE ROW LEVEL SECURITY;

-- Task series policies
CREATE POLICY "Users can manage their own task series"
  ON task_series FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- TASKS TABLE
-- ============================================================================
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  series_id UUID REFERENCES task_series(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ NOT NULL,
  due_time TEXT,
  all_day BOOLEAN DEFAULT FALSE,
  priority TEXT CHECK (priority IN ('high', 'medium', 'low')) DEFAULT 'medium',
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  is_recurring_instance BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Full-text search
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''))
  ) STORED
);

-- Indexes for performance
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_completed ON tasks(completed);
CREATE INDEX idx_tasks_series_id ON tasks(series_id);
CREATE INDEX idx_tasks_user_due_date ON tasks(user_id, due_date);
CREATE INDEX idx_tasks_search ON tasks USING GIN(search_vector);

-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Tasks policies
CREATE POLICY "Users can view their own tasks"
  ON tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks"
  ON tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks"
  ON tasks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks"
  ON tasks FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- NOTIFICATIONS TABLE
-- ============================================================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'task-due-soon', 'task-due-now', 'task-overdue',
    'task-completed', 'streak', 'recurring-reminder',
    'daily-summary', 'info', 'task-shared'
  )),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT CHECK (priority IN ('high', 'medium', 'low')),
  read BOOLEAN DEFAULT FALSE,
  action_label TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Notifications policies
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- TASK ACTIVITY TABLE (for analytics)
-- ============================================================================
CREATE TABLE task_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'created', 'completed', 'uncompleted', 'updated', 'deleted', 'viewed'
  )),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_task_activity_user_id ON task_activity(user_id);
CREATE INDEX idx_task_activity_created_at ON task_activity(created_at);
CREATE INDEX idx_task_activity_type ON task_activity(user_id, activity_type);

-- Enable RLS
ALTER TABLE task_activity ENABLE ROW LEVEL SECURITY;

-- Activity policies
CREATE POLICY "Users can view their own activity"
  ON task_activity FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity"
  ON task_activity FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- TASK SHARES TABLE
-- ============================================================================
CREATE TABLE task_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  shared_with_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  permission_level TEXT CHECK (permission_level IN ('read', 'write')) DEFAULT 'read',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  UNIQUE(task_id, shared_with_user_id)
);

-- Indexes
CREATE INDEX idx_task_shares_shared_with ON task_shares(shared_with_user_id);
CREATE INDEX idx_task_shares_task_id ON task_shares(task_id);

-- Enable RLS
ALTER TABLE task_shares ENABLE ROW LEVEL SECURITY;

-- Task shares policies
CREATE POLICY "Users can view shares they own or are recipient of"
  ON task_shares FOR SELECT
  USING (
    auth.uid() = owner_id
    OR
    auth.uid() = shared_with_user_id
  );

CREATE POLICY "Task owners can create shares"
  ON task_shares FOR INSERT
  WITH CHECK (
    auth.uid() = owner_id
    AND EXISTS (
      SELECT 1 FROM tasks WHERE tasks.id = task_id AND tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Task owners can delete shares"
  ON task_shares FOR DELETE
  USING (auth.uid() = owner_id);

CREATE POLICY "Task owners can update shares"
  ON task_shares FOR UPDATE
  USING (auth.uid() = owner_id);

-- Update tasks policies to include shared tasks
CREATE POLICY "Users can view shared tasks"
  ON tasks FOR SELECT
  USING (
    auth.uid() = user_id
    OR
    EXISTS (
      SELECT 1 FROM task_shares
      WHERE task_shares.task_id = tasks.id
      AND task_shares.shared_with_user_id = auth.uid()
    )
  );

CREATE POLICY "Users with write permission can update shared tasks"
  ON tasks FOR UPDATE
  USING (
    auth.uid() = user_id
    OR
    EXISTS (
      SELECT 1 FROM task_shares
      WHERE task_shares.task_id = tasks.id
      AND task_shares.shared_with_user_id = auth.uid()
      AND task_shares.permission_level = 'write'
    )
  );

-- ============================================================================
-- TASK ATTACHMENTS TABLE
-- ============================================================================
CREATE TABLE task_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE task_attachments ENABLE ROW LEVEL SECURITY;

-- Attachments policies
CREATE POLICY "Users can view attachments of their tasks or shared tasks"
  ON task_attachments FOR SELECT
  USING (
    auth.uid() = user_id
    OR
    EXISTS (
      SELECT 1 FROM tasks t
      JOIN task_shares ts ON ts.task_id = t.id
      WHERE t.id = task_attachments.task_id
      AND ts.shared_with_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert attachments to their own tasks"
  ON task_attachments FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM tasks WHERE tasks.id = task_id AND tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own attachments"
  ON task_attachments FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- DATABASE FUNCTIONS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to relevant tables
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_task_series_updated_at
  BEFORE UPDATE ON task_series
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_settings_updated_at
  BEFORE UPDATE ON notification_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_task_shares_updated_at
  BEFORE UPDATE ON task_shares
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'avatar_url'
  );

  -- Create default notification settings
  INSERT INTO public.notification_settings (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auto-profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
