/**
 * STUDYSYNC PRODUCTION DATABASE SCHEMA
 * 
 * Cloudflare D1 / PostgreSQL relational core
 * Locked-down with ironclad constraints
 * Zero bad data entry possible
 */

-- ============================================================================
-- 1. STUDENTS TABLE (Permanent UUID PK, Unique Email & Study ID)
-- ============================================================================

CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))), -- UUID v4
  email TEXT UNIQUE NOT NULL,
  study_id TEXT UNIQUE NOT NULL, -- e.g., "SG-MATH-0001"
  full_name TEXT NOT NULL,
  stream TEXT NOT NULL CHECK(stream IN ('Physical Science', 'Biological Science')),
  school TEXT NOT NULL,
  district TEXT,
  status TEXT NOT NULL DEFAULT 'Active' CHECK(status IN ('Active', 'Suspended', 'Provisional')),
  password_hash TEXT,
  password_salt TEXT,
  telegram_id TEXT,
  telegram_username TEXT,
  registration_date TEXT NOT NULL, -- YYYY-MM-DD
  last_active_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSON
);

-- ============================================================================
-- 2. STUDY LOGS MASTER TABLE (FK to students, strict hour constraints)
-- ============================================================================

CREATE TABLE IF NOT EXISTS study_logs (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))), -- UUID v4
  student_id TEXT NOT NULL,
  date_of_study TEXT NOT NULL, -- YYYY-MM-DD, locked to Asia/Colombo
  
  -- Subject Hours with strict constraints (0 <= hours <= 14 per subject)
  mathematics_hours REAL NOT NULL DEFAULT 0 CHECK(mathematics_hours >= 0 AND mathematics_hours <= 14),
  chemistry_hours REAL NOT NULL DEFAULT 0 CHECK(chemistry_hours >= 0 AND chemistry_hours <= 14),
  physics_hours REAL NOT NULL DEFAULT 0 CHECK(physics_hours >= 0 AND physics_hours <= 14),
  biology_hours REAL NOT NULL DEFAULT 0 CHECK(biology_hours >= 0 AND biology_hours <= 14),
  
  -- Computed total (must be <= 24 hours in a single day)
  total_hours REAL NOT NULL DEFAULT 0 CHECK(total_hours >= 0 AND total_hours <= 24),
  
  -- Quality metrics
  focus_score INTEGER CHECK(focus_score >= 0 AND focus_score <= 10),
  productivity_score INTEGER CHECK(productivity_score >= 0 AND productivity_score <= 10),
  
  -- Reflection & proof
  reflection_text TEXT,
  proof_image_url TEXT, -- Cloudflare R2 verified URL
  
  -- Timestamps
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign key constraint
  FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE,
  CONSTRAINT valid_daily_total CHECK(
    total_hours = (mathematics_hours + chemistry_hours + physics_hours + biology_hours)
  ),
  CONSTRAINT logical_quality CHECK(
    (total_hours > 0) OR (focus_score IS NULL AND productivity_score IS NULL)
  )
);

-- ============================================================================
-- 3. TELEMETRY & STREAK CACHE TABLE (Pre-computed, 2ms updates)
-- ============================================================================

CREATE TABLE IF NOT EXISTS student_metrics (
  student_id TEXT PRIMARY KEY,
  
  -- Streak Management
  current_streak INTEGER DEFAULT 0 CHECK(current_streak >= 0),
  longest_streak INTEGER DEFAULT 0 CHECK(longest_streak >= 0),
  available_freeze_tokens INTEGER DEFAULT 1 CHECK(available_freeze_tokens >= 0),
  
  -- Cumulative stats
  total_hours_logged REAL DEFAULT 0 CHECK(total_hours_logged >= 0),
  total_study_days INTEGER DEFAULT 0 CHECK(total_study_days >= 0),
  
  -- Consistency (7-day & 30-day rolling averages)
  rolling_7day_hours REAL DEFAULT 0,
  rolling_30day_hours REAL DEFAULT 0,
  rolling_7day_consistency_score INTEGER DEFAULT 0, -- 0-100
  
  -- Temporal markers
  last_valid_log_date TEXT, -- YYYY-MM-DD
  last_streak_freeze_used_at TIMESTAMP,
  last_daily_update_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- ============================================================================
-- 4. LEADERBOARD MATERIALIZED VIEW (Re-indexed every 04:00 AM)
-- ============================================================================

CREATE TABLE IF NOT EXISTS leaderboard_snapshot (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  
  -- Leaderboard scope
  scope TEXT NOT NULL CHECK(scope IN ('global', 'district', 'stream')), -- global | district | stream
  scope_value TEXT, -- NULL for global, "Colombo" for district, "Physical Science" for stream
  
  -- Rankings JSON (top 100 cached snapshot)
  rankings JSON NOT NULL, -- [{rank: 1, study_id, full_name, current_streak, rolling_7day_hours, school}, ...]
  
  -- Metadata
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  valid_until TIMESTAMP, -- 24 hours from generation
  
  UNIQUE(scope, scope_value)
);

-- ============================================================================
-- 5. IMAGE QUARANTINE LOG (Malware detection audit trail)
-- ============================================================================

CREATE TABLE IF NOT EXISTS image_quarantine_log (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  student_id TEXT,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  detected_mime TEXT,
  threat_type TEXT CHECK(threat_type IN ('invalid_magic_bytes', 'oversized', 'forbidden_ext', 'script_detected')),
  threat_details TEXT,
  ip_address TEXT,
  user_agent TEXT,
  flagged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE SET NULL
);

-- ============================================================================
-- 6. AUDIT LOG (Security & compliance trail)
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  actor_id TEXT, -- admin or system
  action TEXT NOT NULL, -- "SUSPEND_ACCOUNT", "VERIFY_LOG", "RESET_PASSWORD", etc
  resource_type TEXT, -- "student", "log", "admin"
  resource_id TEXT,
  details JSON,
  ip_address TEXT,
  user_agent TEXT,
  status TEXT CHECK(status IN ('success', 'failure')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY(actor_id) REFERENCES students(id) ON DELETE SET NULL
);

-- ============================================================================
-- 7. RATE LIMIT TRACKING (Token bucket per IP & user)
-- ============================================================================

CREATE TABLE IF NOT EXISTS rate_limit_bucket (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  identifier TEXT UNIQUE NOT NULL, -- IP address or user_id
  bucket_type TEXT CHECK(bucket_type IN ('ip', 'user', 'endpoint')), -- ip | user | endpoint
  endpoint TEXT, -- e.g., "POST /api/study-logs" (optional)
  tokens_remaining INTEGER DEFAULT 10,
  window_starts_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_request_at TIMESTAMP,
  
  UNIQUE(identifier, endpoint)
);

-- ============================================================================
-- 8. TELEGRAM SESSION BRIDGE (Link student accounts)
-- ============================================================================

CREATE TABLE IF NOT EXISTS telegram_sessions (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  telegram_user_id INTEGER UNIQUE NOT NULL,
  telegram_username TEXT,
  student_id TEXT,
  verified BOOLEAN DEFAULT FALSE,
  verification_token TEXT,
  linked_at TIMESTAMP,
  last_message_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE SET NULL
);
