/**
 * CRON DAEMON 1: STREAK EVALUATOR & FREEZE PROCESSOR
 * 
 * Runs every morning at 04:00 AM Asia/Colombo Time (UTC+5:30)
 * Cloudflare Workers Cron Trigger or AWS Lambda scheduled event
 * 
 * Logic:
 * 1. Check if student logged between yesterday 04:00 AM and today 04:00 AM
 * 2. If YES: +1 streak, update timestamp
 * 3. If NO: consume freeze OR reset streak to 0
 */

import { D1Database } from '@cloudflare/workers-types';

interface StreakEvaluationResult {
  processed: number;
  streakIncremented: number;
  streakReset: number;
  freezeUsed: number;
}

export async function evaluateStreaksAndFreezes(db: D1Database): Promise<StreakEvaluationResult> {
  const result: StreakEvaluationResult = {
    processed: 0,
    streakIncremented: 0,
    streakReset: 0,
    freezeUsed: 0,
  };

  // Get all ACTIVE students
  const allStudents = await db
    .prepare('SELECT id, study_id FROM students WHERE status = ?')
    .bind('Active')
    .all();

  if (!allStudents.success || !allStudents.results) {
    console.error('[Daemon 1] Failed to fetch students');
    return result;
  }

  // Today at 04:00 AM Asia/Colombo time
  const colomboTimeZone = 'Asia/Colombo';
  const now = new Date();
  const colomboDate = new Date(now.toLocaleString('en-US', { timeZone: colomboTimeZone }));
  colomboDate.setHours(4, 0, 0, 0);

  // Yesterday 04:00 AM
  const yesterdayStart = new Date(colomboDate);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  // Format for database query (YYYY-MM-DD)
  const yesterdayStr = formatDate(yesterdayStart);
  const todayStr = formatDate(new Date(colomboDate));

  for (const student of allStudents.results) {
    result.processed++;

    // Check if student logged between yesterday 04:00 AM and today 04:00 AM
    const logCheck = await db
      .prepare(`
        SELECT COUNT(*) as count FROM study_logs 
        WHERE student_id = ? 
        AND date_of_study = ?
        AND total_hours > 0
      `)
      .bind(student.id, yesterdayStr)
      .first<{ count: number }>();

    const hasValidLog = logCheck && logCheck.count > 0;

    if (hasValidLog) {
      // Increment streak
      await db
        .prepare(`
          UPDATE student_metrics
          SET 
            current_streak = current_streak + 1,
            last_valid_log_date = ?,
            last_daily_update_at = CURRENT_TIMESTAMP
          WHERE student_id = ?
        `)
        .bind(todayStr, student.id)
        .run();

      // Also update longest_streak if current exceeds longest
      const metrics = await db
        .prepare('SELECT current_streak, longest_streak FROM student_metrics WHERE student_id = ?')
        .bind(student.id)
        .first<{ current_streak: number; longest_streak: number }>();

      if (metrics && metrics.current_streak > metrics.longest_streak) {
        await db
          .prepare('UPDATE student_metrics SET longest_streak = ? WHERE student_id = ?')
          .bind(metrics.current_streak, student.id)
          .run();
      }

      result.streakIncremented++;

      // Log to audit trail
      await auditLog(db, 'STREAK_INCREMENTED', 'student_metrics', student.id, {
        reason: 'valid_log_found',
        date: yesterdayStr,
      });
    } else {
      // No valid log: check freeze balance
      const metrics = await db
        .prepare(
          `SELECT available_freeze_tokens, current_streak FROM student_metrics 
         WHERE student_id = ?`
        )
        .bind(student.id)
        .first<{ available_freeze_tokens: number; current_streak: number }>();

      if (metrics && metrics.available_freeze_tokens > 0) {
        // Consume freeze, preserve streak
        await db
          .prepare(`
            UPDATE student_metrics
            SET 
              available_freeze_tokens = available_freeze_tokens - 1,
              last_streak_freeze_used_at = CURRENT_TIMESTAMP,
              last_daily_update_at = CURRENT_TIMESTAMP
            WHERE student_id = ?
          `)
          .bind(student.id)
          .run();

        result.freezeUsed++;

        await auditLog(db, 'STREAK_FREEZE_USED', 'student_metrics', student.id, {
          reason: 'no_valid_log',
          date: yesterdayStr,
          previous_streak: metrics.current_streak,
        });
      } else {
        // No freezes: reset streak
        await db
          .prepare(`
            UPDATE student_metrics
            SET 
              current_streak = 0,
              last_daily_update_at = CURRENT_TIMESTAMP
            WHERE student_id = ?
          `)
          .bind(student.id)
          .run();

        result.streakReset++;

        await auditLog(db, 'STREAK_RESET', 'student_metrics', student.id, {
          reason: 'no_valid_log_and_no_freezes',
          date: yesterdayStr,
          previous_streak: metrics?.current_streak,
        });
      }
    }
  }

  console.log('[Daemon 1 - Streak Evaluator] Results:', result);
  return result;
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function auditLog(
  db: D1Database,
  action: string,
  resourceType: string,
  resourceId: string,
  details: any
): Promise<void> {
  await db
    .prepare(`
      INSERT INTO audit_log (action, resource_type, resource_id, details, status)
      VALUES (?, ?, ?, ?, ?)
    `)
    .bind(action, resourceType, resourceId, JSON.stringify(details), 'success')
    .run()
    .catch((err) => console.error(`[Audit] Failed to log ${action}:`, err));
}

// ============================================================================
// CLOUDFLARE WORKERS CRON TRIGGER
// ============================================================================
// Add to wrangler.toml:
// 
// [[triggers.crons]]
// crons = ["0 4 * * *"]  # 04:00 AM UTC (adjust for your timezone via code)
//
// In your handler:
// if (request.url.includes('/cron/streak-evaluator')) {
//   return new Response(JSON.stringify(await evaluateStreaksAndFreezes(db)), { status: 200 });
// }
