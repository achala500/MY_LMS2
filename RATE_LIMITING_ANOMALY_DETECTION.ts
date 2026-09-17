/**
 * RATE LIMITING & ANOMALY DETECTION ENGINE
 * 
 * Token Bucket algorithm + behavioral anomaly detection
 * Protects against:
 * - DDoS attacks (IP-level rate limiting)
 * - Brute force login attempts (user-level rate limiting)
 * - Unrealistic study logs (anomaly detection)
 * - Malicious file uploads (quarantine tracking)
 */

import { D1Database } from '@cloudflare/workers-types';

// ============================================================================
// 1. TOKEN BUCKET RATE LIMITER (Sliding Window)
// ============================================================================

interface RateLimitConfig {
  identifier: string; // IP address or user_id
  bucketType: 'ip' | 'user' | 'endpoint';
  endpoint?: string;
  maxTokens: number;
  refillRate: number; // tokens per minute
  windowSizeMinutes: number;
}

export async function checkRateLimit(
  db: D1Database,
  config: RateLimitConfig
): Promise<{ allowed: boolean; remaining: number; retryAfter?: number }> {
  const now = new Date();
  const windowStartTime = new Date(now.getTime() - config.windowSizeMinutes * 60 * 1000);

  // Get or create rate limit bucket
  let bucket = await db
    .prepare(`
      SELECT id, tokens_remaining, window_starts_at, last_request_at 
      FROM rate_limit_bucket
      WHERE identifier = ? AND bucket_type = ? AND endpoint = ?
    `)
    .bind(config.identifier, config.bucketType, config.endpoint || '')
    .first<any>();

  if (!bucket) {
    // Create new bucket
    await db
      .prepare(`
        INSERT INTO rate_limit_bucket
        (identifier, bucket_type, endpoint, tokens_remaining, window_starts_at, last_request_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `)
      .bind(config.identifier, config.bucketType, config.endpoint || '', config.maxTokens, now.toISOString(), now.toISOString())
      .run();

    return { allowed: true, remaining: config.maxTokens - 1 };
  }

  // Recalculate tokens based on time elapsed
  const windowStart = new Date(bucket.window_starts_at);
  const elapsedMinutes = (now.getTime() - windowStart.getTime()) / (60 * 1000);

  let tokensToAdd = Math.floor(elapsedMinutes * (config.refillRate / 60));
  let tokensRemaining = Math.min(bucket.tokens_remaining + tokensToAdd, config.maxTokens);

  // If window has expired, reset
  if (elapsedMinutes > config.windowSizeMinutes) {
    tokensRemaining = config.maxTokens;
  }

  // Check if request allowed
  if (tokensRemaining > 0) {
    tokensRemaining--;

    // Update bucket
    await db
      .prepare(`
        UPDATE rate_limit_bucket
        SET tokens_remaining = ?, last_request_at = ?
        WHERE identifier = ? AND bucket_type = ? AND endpoint = ?
      `)
      .bind(tokensRemaining, now.toISOString(), config.identifier, config.bucketType, config.endpoint || '')
      .run();

    return { allowed: true, remaining: tokensRemaining };
  }

  // Rate limit exceeded
  const retryAfterSeconds = Math.ceil((config.windowSizeMinutes * 60) / config.refillRate);
  return { allowed: false, remaining: 0, retryAfter: retryAfterSeconds };
}

// ============================================================================
// 2. ANOMALY DETECTION FOR STUDY LOGS
// ============================================================================

interface StudyLogAnomalyCheck {
  student_id: string;
  date_of_study: string;
  total_hours: number;
  mathematics_hours: number;
  chemistry_hours: number;
  physics_hours: number;
  biology_hours: number;
  focus_score?: number;
  productivity_score?: number;
  submitted_timestamp: Date;
}

interface AnomalyDetectionResult {
  isAnomalous: boolean;
  violations: string[];
  riskScore: number; // 0-100
}

export async function detectStudyLogAnomalies(
  db: D1Database,
  log: StudyLogAnomalyCheck
): Promise<AnomalyDetectionResult> {
  const violations: string[] = [];
  let riskScore = 0;

  // ========================================================================
  // RULE 1: Maximum 14 hours per subject per day
  // ========================================================================
  const subjectHours = [
    { name: 'Mathematics', hours: log.mathematics_hours },
    { name: 'Chemistry', hours: log.chemistry_hours },
    { name: 'Physics', hours: log.physics_hours },
    { name: 'Biology', hours: log.biology_hours },
  ];

  for (const subject of subjectHours) {
    if (subject.hours > 14) {
      violations.push(`${subject.name} exceeds 14-hour daily limit (${subject.hours}h)`);
      riskScore += 25;
    }
  }

  // ========================================================================
  // RULE 2: Maximum 24 hours total per day
  // ========================================================================
  if (log.total_hours > 24) {
    violations.push(`Total hours exceed 24-hour daily limit (${log.total_hours}h)`);
    riskScore += 30;
  }

  // ========================================================================
  // RULE 3: Quality scores only when hours > 0
  // ========================================================================
  if (log.total_hours === 0 && (log.focus_score !== undefined || log.productivity_score !== undefined)) {
    violations.push('Quality scores provided but total hours = 0 (logical inconsistency)');
    riskScore += 15;
  }

  // ========================================================================
  // RULE 4: Subject balance check (don't let one subject dominate)
  // ========================================================================
  if (log.total_hours > 0) {
    const percentages = subjectHours.map((s) => ({
      name: s.name,
      percent: (s.hours / log.total_hours) * 100,
    }));

    const maxPercent = Math.max(...percentages.map((p) => p.percent));
    if (maxPercent > 85) {
      const dominantSubject = percentages.find((p) => p.percent === maxPercent);
      violations.push(`Subject imbalance: ${dominantSubject?.name} is ${maxPercent.toFixed(1)}% of total`);
      riskScore += 10;
    }
  }

  // ========================================================================
  // RULE 5: Timestamp freshness (logs > 24 hours old are suspicious)
  // ========================================================================
  const hoursOld = (Date.now() - log.submitted_timestamp.getTime()) / (1000 * 60 * 60);
  if (hoursOld > 24) {
    violations.push(`Log submitted ${Math.floor(hoursOld)} hours after date_of_study (possible backdating)`);
    riskScore += 20;
  }

  // ========================================================================
  // RULE 6: Burst detection (student suddenly logs 20+ hours after inactivity)
  // ========================================================================
  const recentLogs = await db
    .prepare(`
      SELECT total_hours FROM study_logs 
      WHERE student_id = ? 
      AND date_of_study BETWEEN DATE(?) AND DATE('now')
      ORDER BY date_of_study DESC
      LIMIT 7
    `)
    .bind(log.student_id, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
    .all<{ total_hours: number }>();

  if (recentLogs.success && recentLogs.results) {
    const avgHours = (recentLogs.results as any[]).reduce((sum, l) => sum + l.total_hours, 0) / (recentLogs.results.length || 1);
    const deviation = Math.abs(log.total_hours - avgHours);

    if (deviation > avgHours * 2 && avgHours > 0) {
      // More than 2x normal usage
      violations.push(`Burst spike: ${log.total_hours}h vs average ${avgHours.toFixed(1)}h (${(deviation / avgHours).toFixed(1)}x deviation)`);
      riskScore += 15;
    }
  }

  return {
    isAnomalous: violations.length > 0,
    violations,
    riskScore: Math.min(riskScore, 100),
  };
}

// ============================================================================
// 3. IP-BASED RATE LIMITING (DDoS Protection)
// ============================================================================

export async function applyIpRateLimit(db: D1Database, ip: string): Promise<boolean> {
  const result = await checkRateLimit(db, {
    identifier: ip,
    bucketType: 'ip',
    maxTokens: 100, // 100 requests per 5-minute window
    refillRate: 20, // 20 tokens per minute = ~300 per 5 min
    windowSizeMinutes: 5,
  });

  return result.allowed;
}

// ============================================================================
// 4. USER-BASED RATE LIMITING (Brute Force Protection)
// ============================================================================

export async function applyUserRateLimit(
  db: D1Database,
  userId: string,
  endpoint: string
): Promise<{ allowed: boolean; retryAfter?: number }> {
  // Different limits per endpoint
  const limits: { [key: string]: RateLimitConfig } = {
    'POST /api/auth/login': {
      identifier: userId,
      bucketType: 'user',
      endpoint: 'POST /api/auth/login',
      maxTokens: 5, // 5 login attempts
      refillRate: 1, // per minute
      windowSizeMinutes: 5,
    },
    'POST /api/study-logs': {
      identifier: userId,
      bucketType: 'user',
      endpoint: 'POST /api/study-logs',
      maxTokens: 10, // 10 submissions
      refillRate: 2, // per minute (so ~120 per hour)
      windowSizeMinutes: 60,
    },
    'POST /api/upload/presigned-url': {
      identifier: userId,
      bucketType: 'user',
      endpoint: 'POST /api/upload/presigned-url',
      maxTokens: 5, // 5 upload requests
      refillRate: 1, // per minute
      windowSizeMinutes: 60,
    },
  };

  const config = limits[endpoint] || limits['POST /api/study-logs'];
  const result = await checkRateLimit(db, config);

  return {
    allowed: result.allowed,
    retryAfter: result.retryAfter,
  };
}

// ============================================================================
// 5. SECURITY AUDIT & LOGGING
// ============================================================================

export async function logSecurityEvent(
  db: D1Database,
  event: {
    type: 'rate_limit_exceeded' | 'anomaly_detected' | 'malware_quarantined' | 'suspicious_upload';
    studentId?: string;
    ipAddress: string;
    userAgent?: string;
    details: any;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }
): Promise<void> {
  const actionMap = {
    rate_limit_exceeded: 'RATE_LIMIT_EXCEEDED',
    anomaly_detected: 'ANOMALY_DETECTED',
    malware_quarantined: 'MALWARE_QUARANTINED',
    suspicious_upload: 'SUSPICIOUS_UPLOAD',
  };

  await db
    .prepare(`
      INSERT INTO audit_log (action, resource_type, resource_id, details, ip_address, user_agent, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    .bind(
      actionMap[event.type],
      'security_event',
      event.studentId || event.ipAddress,
      JSON.stringify({ ...event.details, severity: event.severity }),
      event.ipAddress,
      event.userAgent,
      'flagged'
    )
    .run()
    .catch((err) => console.error('[Audit] Failed to log security event:', err));
}

// ============================================================================
// MIDDLEWARE INTEGRATION
// ============================================================================

export async function securityMiddleware(
  request: Request,
  db: D1Database
): Promise<{ allowed: boolean; message?: string; headers?: Record<string, string> }> {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const userAgent = request.headers.get('User-Agent') || 'unknown';

  // 1. IP-level rate limiting
  const ipAllowed = await applyIpRateLimit(db, ip);
  if (!ipAllowed) {
    await logSecurityEvent(db, {
      type: 'rate_limit_exceeded',
      ipAddress: ip,
      userAgent,
      details: { reason: 'IP_RATE_LIMIT' },
      severity: 'medium',
    });

    return {
      allowed: false,
      message: 'Too many requests from your IP address',
      headers: { 'Retry-After': '300' },
    };
  }

  return { allowed: true };
}
