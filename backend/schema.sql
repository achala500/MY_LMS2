-- ============================================================================
-- StudySync — Sri Lankan G.C.E. A/L Academic Database Schema
-- Dialect: ANSI SQL (Fully compatible with PostgreSQL 14+, MySQL 8+, SQLite 3+)
-- Generated: 2026-09-05
-- Purpose: Complete Relational Schema & Migration for StudySync Backend
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. MEMBERS TABLE
-- Stores registered Sri Lankan A/L students and their stream details
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS members (
  study_id VARCHAR(32) PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  school VARCHAR(255) NOT NULL,
  stream VARCHAR(64) NOT NULL CHECK (stream IN ('Biological Science', 'Physical Science')),
  optional_subject VARCHAR(64),
  status VARCHAR(32) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Verified', 'Active', 'Suspended', 'Inactive')),
  exam_year VARCHAR(10) DEFAULT '2026',
  telegram_username VARCHAR(128),
  phone_number VARCHAR(32),
  role VARCHAR(32) DEFAULT 'student' CHECK (role IN ('student', 'admin', 'supervisor')),
  admin_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_members_stream ON members(stream);
CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);
CREATE INDEX IF NOT EXISTS idx_members_exam_year ON members(exam_year);

-- ----------------------------------------------------------------------------
-- 2. DAILY_LOGS TABLE
-- Stores daily aggregated study entries corresponding to the 19-column sheet
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS daily_logs (
  log_id VARCHAR(64) PRIMARY KEY,
  study_id VARCHAR(32) NOT NULL REFERENCES members(study_id) ON DELETE CASCADE,
  student_name VARCHAR(255),
  email VARCHAR(255) NOT NULL,
  stream VARCHAR(64) NOT NULL,
  date_of_study DATE NOT NULL,
  subject1_name VARCHAR(64),
  subject1_hours NUMERIC(5,2) DEFAULT 0.0 CHECK (subject1_hours >= 0),
  subject2_name VARCHAR(64),
  subject2_hours NUMERIC(5,2) DEFAULT 0.0 CHECK (subject2_hours >= 0),
  subject3_name VARCHAR(64),
  subject3_hours NUMERIC(5,2) DEFAULT 0.0 CHECK (subject3_hours >= 0),
  total_hours NUMERIC(5,2) NOT NULL CHECK (total_hours >= 0),
  focus_score INTEGER CHECK (focus_score BETWEEN 0 AND 10),
  productivity_score INTEGER CHECK (productivity_score BETWEEN 0 AND 10),
  notes TEXT,
  proof_photo_url TEXT,
  telegram_username VARCHAR(128),
  submission_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_student_daily_study UNIQUE (study_id, date_of_study)
);

CREATE INDEX IF NOT EXISTS idx_daily_logs_study_id ON daily_logs(study_id);
CREATE INDEX IF NOT EXISTS idx_daily_logs_date ON daily_logs(date_of_study);
CREATE INDEX IF NOT EXISTS idx_daily_logs_stream ON daily_logs(stream);

-- ----------------------------------------------------------------------------
-- 3. STUDY_SESSIONS TABLE
-- Granular multi-session breakdown per study day
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS study_sessions (
  session_id VARCHAR(64) PRIMARY KEY,
  study_id VARCHAR(32) NOT NULL REFERENCES members(study_id) ON DELETE CASCADE,
  date_of_study DATE NOT NULL,
  subject VARCHAR(64) NOT NULL,
  hours NUMERIC(4,2) NOT NULL CHECK (hours > 0),
  start_time VARCHAR(16),
  end_time VARCHAR(16),
  focus_rating INTEGER CHECK (focus_rating BETWEEN 1 AND 10),
  productivity_rating INTEGER CHECK (productivity_rating BETWEEN 1 AND 10),
  topic VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sessions_student_date ON study_sessions(study_id, date_of_study);
CREATE INDEX IF NOT EXISTS idx_sessions_subject ON study_sessions(subject);

-- ----------------------------------------------------------------------------
-- 4. TEST_MARKS TABLE
-- Term test marks and model exam results for A/L Z-Score tracking
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS test_marks (
  test_id VARCHAR(64) PRIMARY KEY,
  study_id VARCHAR(32) NOT NULL REFERENCES members(study_id) ON DELETE CASCADE,
  test_name VARCHAR(255) NOT NULL,
  test_type VARCHAR(64) DEFAULT 'Term Test' CHECK (test_type IN ('Term Test', 'School Exam', 'Tuition Model Paper', 'Past Paper Revision')),
  term VARCHAR(32) DEFAULT 'Term 1',
  subject VARCHAR(64) NOT NULL,
  marks NUMERIC(5,2) NOT NULL CHECK (marks >= 0),
  max_marks NUMERIC(5,2) DEFAULT 100.0,
  percentage NUMERIC(5,2) GENERATED ALWAYS AS (ROUND((marks / NULLIF(max_marks, 0)) * 100, 2)) STORED,
  grade VARCHAR(4),
  date_recorded DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_test_marks_student ON test_marks(study_id);
CREATE INDEX IF NOT EXISTS idx_test_marks_subject ON test_marks(subject);

-- ----------------------------------------------------------------------------
-- 5. ADMIN_USERS TABLE
-- Whitelisted administrators with RBAC permissions
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_users (
  admin_id VARCHAR(64) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(32) DEFAULT 'Admin' CHECK (role IN ('Primary Admin', 'Admin', 'Moderator')),
  is_active BOOLEAN DEFAULT TRUE,
  granted_by VARCHAR(255),
  granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Initial Primary Administrators
INSERT INTO admin_users (admin_id, email, role, is_active, granted_by) VALUES
  ('ADM-001', 'alwisachalaanurada@gmail.com', 'Primary Admin', TRUE, 'System Setup'),
  ('ADM-002', 'admin@studysync.lk', 'Admin', TRUE, 'Primary Admin'),
  ('ADM-003', 'lead.admin@studysync.lk', 'Admin', TRUE, 'Primary Admin')
ON CONFLICT (email) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 6. EXAM_TARGET_DATES TABLE
-- Customizable A/L examination countdown targets set by administrators
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS exam_target_dates (
  exam_year VARCHAR(10) PRIMARY KEY,
  target_date TIMESTAMP NOT NULL,
  title VARCHAR(255) NOT NULL,
  is_official BOOLEAN DEFAULT TRUE,
  updated_by VARCHAR(255),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Official Exam Targets
INSERT INTO exam_target_dates (exam_year, target_date, title, is_official) VALUES
  ('2026', '2026-11-25 08:30:00', '2026 G.C.E. Advanced Level Examination', TRUE),
  ('2027', '2027-11-25 08:30:00', '2027 G.C.E. Advanced Level Examination', TRUE),
  ('2028', '2028-11-25 08:30:00', '2028 G.C.E. Advanced Level Examination', TRUE),
  ('2029', '2029-11-25 08:30:00', '2029 G.C.E. Advanced Level Examination', TRUE)
ON CONFLICT (exam_year) DO UPDATE SET target_date = EXCLUDED.target_date;

-- ----------------------------------------------------------------------------
-- 7. LIVE_STUDY_ROOMS TABLE
-- Virtual Google Meet and Zoom study rooms created by administrators
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS live_study_rooms (
  room_id VARCHAR(64) PRIMARY KEY,
  platform VARCHAR(32) NOT NULL CHECK (platform IN ('google_meet', 'zoom', 'jitsi')),
  room_url TEXT NOT NULL,
  topic VARCHAR(255) NOT NULL,
  created_by VARCHAR(255) NOT NULL,
  invite_text TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 8. ADMIN_FORMS TABLE
-- Dynamic Google Forms-style surveys created by administrators
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_forms (
  form_id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  target_audience VARCHAR(64) DEFAULT 'all',
  created_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(32) DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  fields_json JSON NOT NULL
);

-- ----------------------------------------------------------------------------
-- 9. FORM_RESPONSES TABLE
-- Student submissions to admin forms and surveys
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS form_responses (
  response_id VARCHAR(64) PRIMARY KEY,
  form_id VARCHAR(64) NOT NULL REFERENCES admin_forms(form_id) ON DELETE CASCADE,
  study_id VARCHAR(32) NOT NULL REFERENCES members(study_id) ON DELETE CASCADE,
  student_name VARCHAR(255),
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  answers_json JSON NOT NULL,
  CONSTRAINT uq_form_student_response UNIQUE (form_id, study_id)
);

CREATE INDEX IF NOT EXISTS idx_form_responses_form ON form_responses(form_id);
CREATE INDEX IF NOT EXISTS idx_form_responses_student ON form_responses(study_id);

-- ----------------------------------------------------------------------------
-- 10. USER_INBOX TABLE
-- Direct messages and dispatched surveys delivered to student inboxes
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_inbox (
  message_id VARCHAR(64) PRIMARY KEY,
  study_id VARCHAR(32) NOT NULL REFERENCES members(study_id) ON DELETE CASCADE,
  sender VARCHAR(255) DEFAULT 'System Admin',
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  message_type VARCHAR(32) DEFAULT 'announcement' CHECK (message_type IN ('form', 'announcement', 'alert', 'verification')),
  form_id VARCHAR(64) REFERENCES admin_forms(form_id) ON DELETE SET NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_inbox_student ON user_inbox(study_id);
CREATE INDEX IF NOT EXISTS idx_inbox_is_read ON user_inbox(is_read);

-- ----------------------------------------------------------------------------
-- 11. ANALYTICAL VIEWS
-- ----------------------------------------------------------------------------

-- View: Student Leaderboard & Total Effort Rollup
CREATE OR REPLACE VIEW v_student_leaderboard AS
SELECT
  m.study_id,
  m.full_name,
  m.email,
  m.school,
  m.stream,
  m.status,
  COUNT(l.log_id) AS total_logged_days,
  COALESCE(SUM(l.total_hours), 0.0) AS total_study_hours,
  COALESCE(ROUND(AVG(l.total_hours), 2), 0.0) AS avg_hours_per_day,
  COALESCE(ROUND(AVG(l.focus_score), 1), 0.0) AS avg_focus_rating,
  MAX(l.date_of_study) AS last_study_date
FROM members m
LEFT JOIN daily_logs l ON m.study_id = l.study_id
GROUP BY m.study_id, m.full_name, m.email, m.school, m.stream, m.status
ORDER BY total_study_hours DESC;

-- View: Stream Distribution Summary
CREATE OR REPLACE VIEW v_stream_summary AS
SELECT
  stream,
  COUNT(*) AS total_students,
  COUNT(CASE WHEN status = 'Verified' THEN 1 END) AS verified_students,
  COUNT(CASE WHEN status = 'Pending' THEN 1 END) AS pending_students,
  COUNT(CASE WHEN status = 'Suspended' THEN 1 END) AS suspended_students
FROM members
GROUP BY stream;
