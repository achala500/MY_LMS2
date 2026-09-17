/**
 * STUDYSYNC CLOUDFLARE DEPLOYMENT GUIDE
 * 
 * FREE TIER HOSTING STRATEGY:
 * - Cloudflare Workers: Serverless backend (100,000 requests/day free)
 * - Cloudflare D1: SQLite database (free tier included)
 * - Cloudflare R2: Object storage ($0.015/GB, 50GB free trial)
 * - Cloudflare Pages: Static frontend (unlimited free)
 * 
 * COST: $0/month until you scale beyond free tier limits
 */

// ============================================================================
// WRANGLER.TOML CONFIGURATION (Root of project)
// ============================================================================

/*
name = "studysync-backend"
main = "src/index.ts"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]

# CLOUDFLARE WORKERS
[env.production]
route = "https://api.studysync.lk/*"
zone_id = "YOUR_ZONE_ID"

# CLOUDFLARE D1 DATABASE (Serverless SQL)
[[d1_databases]]
binding = "DB"
database_name = "studysync-prod"
database_id = "YOUR_DATABASE_ID"

# CLOUDFLARE R2 BUCKET (Object Storage)
[[r2_buckets]]
binding = "R2_QUARANTINE"
bucket_name = "studysync-quarantine"
jurisdiction = "eu"

[[r2_buckets]]
binding = "R2_VERIFIED"
bucket_name = "studysync-verified"
jurisdiction = "eu"

# ENVIRONMENT VARIABLES
[env.production.vars]
TELEGRAM_BOT_TOKEN = "YOUR_BOT_TOKEN"
WEBHOOK_URL = "https://api.studysync.lk"
ALLOWED_ORIGINS = "https://studysync.lk,https://app.studysync.lk"

# CRON TRIGGERS (Scheduled background jobs)
[triggers]
crons = [
  "0 4 * * *",   # 04:00 AM UTC (adjust for Asia/Colombo = UTC+5:30)
  "30 4 * * *"   # 04:30 AM UTC
]

# SERVICE BINDINGS (Optional: for internal service-to-service calls)
[[services]]
binding = "TELEGRAM_SERVICE"
service = "studysync-telegram-worker"
environment = "production"
*/

// ============================================================================
// STEP 1: LOCAL DEVELOPMENT & PREVIEW
// ============================================================================

/*
TERMINAL COMMANDS:

# Install Wrangler CLI
npm install -g wrangler

# Create project structure
wrangler init studysync-backend

# Create D1 database locally
wrangler d1 create studysync-dev

# Create R2 buckets locally
wrangler r2 bucket create studysync-quarantine --jurisdiction eu

# Run locally with hot-reload
wrangler dev --local

# Deploy to staging
wrangler deploy --env staging

# Deploy to production
wrangler deploy --env production

# Monitor logs in real-time
wrangler tail

# Check D1 database
wrangler d1 execute studysync-prod --command "SELECT COUNT(*) FROM students"
*/

// ============================================================================
// STEP 2: HONO.JS BACKEND SETUP (Cloudflare Workers)
// ============================================================================

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

interface Env {
  DB: D1Database;
  R2_QUARANTINE: R2Bucket;
  R2_VERIFIED: R2Bucket;
  TELEGRAM_BOT_TOKEN: string;
  WEBHOOK_URL: string;
  ALLOWED_ORIGINS: string;
}

const app = new Hono<{ Bindings: Env }>();

// Middleware
app.use('*', logger());
app.use(
  '*',
  cors({
    origin: ['https://studysync.lk', 'https://app.studysync.lk', 'http://localhost:3000'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  })
);

// ========================================================================
// HEALTH CHECK
// ========================================================================
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    region: c.req.cf?.colo || 'unknown',
  });
});

// ========================================================================
// AUTHENTICATION ROUTES
// ========================================================================
app.post('/api/auth/login', async (c) => {
  const { email, password } = await c.req.json();

  try {
    const student = await c.env.DB.prepare(
      `SELECT id, email, password_hash, password_salt, status FROM students WHERE email = ?`
    )
      .bind(email)
      .first();

    if (!student) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    // Verify password (use bcrypt in production)
    const isValid = await verifyPassword(password, student.password_hash, student.password_salt);

    if (!isValid || student.status !== 'Active') {
      return c.json({ error: 'Invalid credentials or account suspended' }, 401);
    }

    // Generate JWT token
    const token = await generateJWT({
      id: student.id,
      email: student.email,
    });

    return c.json({ token, user: { id: student.id, email } });
  } catch (error) {
    console.error('[Auth] Login failed:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ========================================================================
// STUDY LOG SUBMISSION
// ========================================================================
app.post('/api/study-logs', async (c) => {
  const auth = c.req.header('Authorization');
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const { student_id, date_of_study, mathematics_hours, chemistry_hours, physics_hours, biology_hours, focus_score, productivity_score, reflection_text } = await c.req.json();

  try {
    // Validate total hours
    const total_hours = mathematics_hours + chemistry_hours + physics_hours + biology_hours;
    if (total_hours > 24) {
      return c.json({ error: 'Total hours exceed 24-hour limit' }, 400);
    }

    // Insert study log
    const result = await c.env.DB.prepare(
      `
      INSERT INTO study_logs 
      (student_id, date_of_study, mathematics_hours, chemistry_hours, physics_hours, biology_hours, total_hours, focus_score, productivity_score, reflection_text)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    )
      .bind(
        student_id,
        date_of_study,
        mathematics_hours,
        chemistry_hours,
        physics_hours,
        biology_hours,
        total_hours,
        focus_score || null,
        productivity_score || null,
        reflection_text || null
      )
      .run();

    return c.json({ success: true, logId: result.meta.last_row_id });
  } catch (error) {
    console.error('[StudyLog] Submission failed:', error);
    return c.json({ error: 'Failed to submit study log' }, 500);
  }
});

// ========================================================================
// UPLOAD PRESIGNED URL ENDPOINT
// ========================================================================
app.post('/api/upload/presigned-url', async (c) => {
  const { study_id, date_of_study } = await c.req.json();

  try {
    // Generate presigned URL valid for 60 seconds
    const uploadUrl = await c.env.R2_QUARANTINE.createSignedUrl(
      `uploads/quarantine/${study_id}/${date_of_study}/${Date.now()}.bin`,
      60, // 60 second expiry
      { httpMethod: 'PUT' }
    );

    return c.json({ presignedUrl: uploadUrl });
  } catch (error) {
    console.error('[Upload] Failed:', error);
    return c.json({ error: 'Failed to generate upload URL' }, 500);
  }
});

// ========================================================================
// STUDENT PROFILE & METRICS
// ========================================================================
app.get('/api/profile/:study_id', async (c) => {
  const { study_id } = c.req.param();

  try {
    const profile = await c.env.DB.prepare(
      `
      SELECT s.*, m.current_streak, m.rolling_7day_hours, m.rolling_7day_consistency_score
      FROM students s
      JOIN student_metrics m ON s.id = m.student_id
      WHERE s.study_id = ?
    `
    )
      .bind(study_id)
      .first();

    if (!profile) {
      return c.json({ error: 'Student not found' }, 404);
    }

    return c.json(profile);
  } catch (error) {
    console.error('[Profile] Fetch failed:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ========================================================================
// LEADERBOARD ENDPOINTS
// ========================================================================
app.get('/api/leaderboard/:scope/:scope_value?', async (c) => {
  const { scope, scope_value } = c.req.param();

  try {
    const snapshot = await c.env.DB.prepare(
      `SELECT rankings FROM leaderboard_snapshot WHERE scope = ? AND (scope_value = ? OR ? IS NULL)`
    )
      .bind(scope, scope_value || null, scope_value || null)
      .first();

    if (!snapshot) {
      return c.json({ error: 'Leaderboard not found' }, 404);
    }

    return c.json(JSON.parse(snapshot.rankings));
  } catch (error) {
    console.error('[Leaderboard] Fetch failed:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ========================================================================
// CRON JOB HANDLERS
// ========================================================================
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Streak Evaluator (04:00 AM)
    if (url.pathname === '/cron/streak-evaluator') {
      ctx.waitUntil(evaluateStreaksAndFreezes(env.DB));
      return new Response('Streak evaluation started', { status: 202 });
    }

    // Leaderboard Refresher (04:30 AM)
    if (url.pathname === '/cron/leaderboard-refresher') {
      ctx.waitUntil(refreshLeaderboardSnapshots(env.DB));
      return new Response('Leaderboard refresh started', { status: 202 });
    }

    // Telegram Reminders (20:00 PM)
    if (url.pathname === '/cron/telegram-reminders') {
      ctx.waitUntil(sendTelegramReminders(env.DB, env.TELEGRAM_BOT_TOKEN));
      return new Response('Telegram reminders started', { status: 202 });
    }

    return app.fetch(request, env, ctx);
  },
};

// ============================================================================
// STEP 3: DATABASE INITIALIZATION SCRIPT
// ============================================================================

/*
FILE: scripts/init-db.ts

Run this ONCE to set up your D1 database:

wrangler d1 execute studysync-prod --file=scripts/init-db.ts

*/

export async function initializeDatabase(db: D1Database): Promise<void> {
  console.log('[Init] Creating database tables...');

  // Run all CREATE TABLE statements
  const statements = [
    // students table
    `CREATE TABLE IF NOT EXISTS students (...)`,
    // study_logs table
    `CREATE TABLE IF NOT EXISTS study_logs (...)`,
    // Indexes for performance
    `CREATE INDEX IF NOT EXISTS idx_study_logs_student ON study_logs(student_id)`,
    `CREATE INDEX IF NOT EXISTS idx_study_logs_date ON study_logs(date_of_study)`,
    `CREATE INDEX IF NOT EXISTS idx_student_metrics_streak ON student_metrics(current_streak DESC)`,
  ];

  for (const statement of statements) {
    await db.exec(statement);
  }

  console.log('[Init] Database initialized successfully!');
}

// ============================================================================
// STEP 4: GITHUB ACTIONS CI/CD (Auto-deploy on push)
// ============================================================================

/*
FILE: .github/workflows/deploy.yml

name: Deploy to Cloudflare

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Cloudflare
        run: npx wrangler deploy
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
*/

// ============================================================================
// STEP 5: ENVIRONMENT SETUP (SECRETS)
// ============================================================================

/*
Run these commands to set secrets:

wrangler secret put TELEGRAM_BOT_TOKEN
# Paste your Telegram bot token from @BotFather

wrangler secret put DATABASE_URL
# Your Cloudflare D1 connection string

wrangler secret put JWT_SECRET
# Generate: openssl rand -base64 32
*/

// ============================================================================
// MONITORING & LOGGING (Cloudflare Analytics)
// ============================================================================

/*
VIEW LOGS IN REAL-TIME:
wrangler tail

ANALYTICS DASHBOARD:
- Cloudflare Workers dashboard: https://dash.cloudflare.com/
- Filter by route, method, status code
- View request/response times, errors
- Monitor D1 query performance
- Track R2 bandwidth and storage

SET UP ALERTS:
- Cloudflare Workers Analytics Engine
- Alert on error rates > 1%
- Alert on response time > 1000ms
- Alert on D1 query timeouts
*/

// ============================================================================
// COST BREAKDOWN (First Year)
// ============================================================================

/*
CLOUDFLARE WORKERS:
- Free: 100,000 requests/day
- After free: $0.15/10M requests
- Estimate: $0/month for MVP

CLOUDFLARE D1:
- Free: 3GB storage, unlimited queries
- After free: $0.75/month per GB
- Estimate: $0-2/month for typical usage

CLOUDFLARE R2:
- Free: 50GB storage trial for 90 days
- After free: $0.015/GB + $0.005/1M requests
- Estimate: $0-5/month for image uploads

CLOUDFLARE PAGES (Frontend):
- Free: Unlimited deployments, bandwidth
- Estimate: $0/month

TELEGRAM BOT:
- Free: Unlimited messages to subscribers
- Estimate: $0/month

TOTAL ESTIMATE: $0-7/month until you reach high scale
At 10K monthly active users, you might spend $20-30/month
*/

// ============================================================================
// QUICK START CHECKLIST
// ============================================================================

/*
☐ Step 1: npm install -g wrangler
☐ Step 2: wrangler init
☐ Step 3: Create Cloudflare D1 database
  wrangler d1 create studysync-prod
☐ Step 4: Create Cloudflare R2 buckets
  wrangler r2 bucket create studysync-quarantine
  wrangler r2 bucket create studysync-verified
☐ Step 5: Add wrangler.toml configuration
☐ Step 6: Initialize database schema
  wrangler d1 execute studysync-prod --file=scripts/init-db.ts
☐ Step 7: Set secrets
  wrangler secret put TELEGRAM_BOT_TOKEN
  wrangler secret put JWT_SECRET
☐ Step 8: Deploy
  wrangler deploy
☐ Step 9: Configure Telegram webhook
  POST https://api.telegram.org/botTOKEN/setWebhook
  with url=https://api.studysync.lk/telegram/webhook
☐ Step 10: Set up cron triggers in wrangler.toml
*/

// ============================================================================
// PREVIEW MODE (Local Testing)
// ============================================================================

/*
TEST LOCALLY:
$ wrangler dev --local

This starts:
- Local HTTP server on http://localhost:8787
- Local D1 database (in-memory SQLite)
- Local R2 bucket emulation
- Hot reload on file changes

TEST ENDPOINTS:
curl http://localhost:8787/health

curl -X POST http://localhost:8787/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

PRODUCTION PREVIEW (Staging):
wrangler deploy --env staging
# Tests changes before going live
*/
