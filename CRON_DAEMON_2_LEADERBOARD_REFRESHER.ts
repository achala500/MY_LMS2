/**
 * CRON DAEMON 2: LEADERBOARD MATERIALIZED VIEW REFRESHER
 * 
 * Runs at 04:30 AM Asia/Colombo (after Daemon 1 completes)
 * Re-indexes global, district, and stream leaderboards
 * Caches top-100 JSON snapshots on edge CDN (zero DB queries during peak traffic)
 */

import { D1Database } from '@cloudflare/workers-types';

interface LeaderboardEntry {
  rank: number;
  study_id: string;
  full_name: string;
  school: string;
  current_streak: number;
  rolling_7day_hours: number;
  rolling_7day_consistency_score: number;
}

interface LeaderboardRefreshResult {
  global: number;
  byDistrict: number;
  byStream: number;
  totalGenerated: number;
}

export async function refreshLeaderboardSnapshots(db: D1Database): Promise<LeaderboardRefreshResult> {
  const result: LeaderboardRefreshResult = {
    global: 0,
    byDistrict: 0,
    byStream: 0,
    totalGenerated: 0,
  };

  const now = new Date();
  const validUntil = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

  // ========================================================================
  // 1. GLOBAL LEADERBOARD (Top 100 by rolling 7-day hours)
  // ========================================================================
  const globalTop100 = await db
    .prepare(`
      SELECT 
        s.study_id,
        s.full_name,
        s.school,
        m.current_streak,
        m.rolling_7day_hours,
        m.rolling_7day_consistency_score,
        ROW_NUMBER() OVER (ORDER BY m.rolling_7day_hours DESC, m.current_streak DESC) as rank
      FROM v_student_profile s
      JOIN student_metrics m ON s.id = m.student_id
      WHERE s.status = 'Active'
      ORDER BY rank
      LIMIT 100
    `)
    .all<LeaderboardEntry>();

  if (globalTop100.success && globalTop100.results) {
    const rankings = (globalTop100.results as any[]).map((r, idx) => ({
      rank: idx + 1,
      study_id: r.study_id,
      full_name: r.full_name,
      school: r.school,
      current_streak: r.current_streak,
      rolling_7day_hours: r.rolling_7day_hours,
      rolling_7day_consistency_score: r.rolling_7day_consistency_score,
    }));

    await db
      .prepare(
        `
        INSERT INTO leaderboard_snapshot (scope, scope_value, rankings, generated_at, valid_until)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(scope, scope_value) DO UPDATE SET
          rankings = excluded.rankings,
          generated_at = excluded.generated_at,
          valid_until = excluded.valid_until
      `
      )
      .bind('global', null, JSON.stringify(rankings), now.toISOString(), validUntil.toISOString())
      .run();

    result.global = rankings.length;
    result.totalGenerated += rankings.length;
    console.log(`[Daemon 2] Global leaderboard: ${rankings.length} entries cached`);
  }

  // ========================================================================
  // 2. DISTRICT LEADERBOARDS (Top 100 per district)
  // ========================================================================
  const districts = await db
    .prepare(
      `
      SELECT DISTINCT district FROM students 
      WHERE status = 'Active' AND district IS NOT NULL
    `
    )
    .all<{ district: string }>();

  if (districts.success && districts.results) {
    for (const { district } of districts.results as any[]) {
      const districtTop100 = await db
        .prepare(
          `
          SELECT 
            s.study_id, s.full_name, s.school,
            m.current_streak, m.rolling_7day_hours, m.rolling_7day_consistency_score,
            ROW_NUMBER() OVER (ORDER BY m.rolling_7day_hours DESC, m.current_streak DESC) as rank
          FROM v_student_profile s
          JOIN student_metrics m ON s.id = m.student_id
          WHERE s.status = 'Active' AND s.district = ?
          ORDER BY rank
          LIMIT 100
        `
        )
        .bind(district)
        .all<LeaderboardEntry>();

      if (districtTop100.success && districtTop100.results) {
        const rankings = (districtTop100.results as any[]).map((r, idx) => ({
          rank: idx + 1,
          study_id: r.study_id,
          full_name: r.full_name,
          school: r.school,
          current_streak: r.current_streak,
          rolling_7day_hours: r.rolling_7day_hours,
          rolling_7day_consistency_score: r.rolling_7day_consistency_score,
        }));

        await db
          .prepare(
            `
            INSERT INTO leaderboard_snapshot (scope, scope_value, rankings, generated_at, valid_until)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(scope, scope_value) DO UPDATE SET
              rankings = excluded.rankings,
              generated_at = excluded.generated_at,
              valid_until = excluded.valid_until
          `
          )
          .bind('district', district, JSON.stringify(rankings), now.toISOString(), validUntil.toISOString())
          .run();

        result.byDistrict += rankings.length;
        result.totalGenerated += rankings.length;
      }
    }
  }

  // ========================================================================
  // 3. STREAM LEADERBOARDS (Top 100 per stream)
  // ========================================================================
  const streams = ['Physical Science', 'Biological Science'];
  for (const stream of streams) {
    const streamTop100 = await db
      .prepare(
        `
        SELECT 
          s.study_id, s.full_name, s.school,
          m.current_streak, m.rolling_7day_hours, m.rolling_7day_consistency_score,
          ROW_NUMBER() OVER (ORDER BY m.rolling_7day_hours DESC, m.current_streak DESC) as rank
        FROM v_student_profile s
        JOIN student_metrics m ON s.id = m.student_id
        WHERE s.status = 'Active' AND s.stream = ?
        ORDER BY rank
        LIMIT 100
      `
      )
      .bind(stream)
      .all<LeaderboardEntry>();

    if (streamTop100.success && streamTop100.results) {
      const rankings = (streamTop100.results as any[]).map((r, idx) => ({
        rank: idx + 1,
        study_id: r.study_id,
        full_name: r.full_name,
        school: r.school,
        current_streak: r.current_streak,
        rolling_7day_hours: r.rolling_7day_hours,
        rolling_7day_consistency_score: r.rolling_7day_consistency_score,
      }));

      await db
        .prepare(
          `
          INSERT INTO leaderboard_snapshot (scope, scope_value, rankings, generated_at, valid_until)
          VALUES (?, ?, ?, ?, ?)
          ON CONFLICT(scope, scope_value) DO UPDATE SET
            rankings = excluded.rankings,
            generated_at = excluded.generated_at,
            valid_until = excluded.valid_until
        `
        )
        .bind('stream', stream, JSON.stringify(rankings), now.toISOString(), validUntil.toISOString())
        .run();

      result.byStream += rankings.length;
      result.totalGenerated += rankings.length;
    }
  }

  console.log('[Daemon 2 - Leaderboard Refresher] Results:', result);
  return result;
}
