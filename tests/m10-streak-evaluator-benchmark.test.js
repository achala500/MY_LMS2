import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateStreaksAndFreezes } from '../CRON_DAEMON_1_STREAK_EVALUATOR.ts';

function createMockD1Database(studentCount = 500) {
  let queryCount = 0;

  // Setup mock data
  const students = [];
  const studyLogs = [];
  const studentMetrics = new Map();
  const auditLogs = [];

  // Yesterday's date string matching Asia/Colombo calculation
  const colomboTimeZone = 'Asia/Colombo';
  const now = new Date();
  const colomboDate = new Date(now.toLocaleString('en-US', { timeZone: colomboTimeZone }));
  colomboDate.setHours(4, 0, 0, 0);
  const yesterdayStart = new Date(colomboDate);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  const year = yesterdayStart.getFullYear();
  const month = String(yesterdayStart.getMonth() + 1).padStart(2, '0');
  const day = String(yesterdayStart.getDate()).padStart(2, '0');
  const yesterdayStr = `${year}-${month}-${day}`;

  for (let i = 1; i <= studentCount; i++) {
    const studentId = `student-${i}`;
    students.push({ id: studentId, study_id: `STUDY-${i}` });

    // Half of the students logged yesterday
    if (i % 2 === 0) {
      studyLogs.push({
        student_id: studentId,
        date_of_study: yesterdayStr,
        total_hours: 3.5,
      });
    }

    // Freeze tokens for odd students without logs (even freeze tokens for some, 0 for others)
    studentMetrics.set(studentId, {
      student_id: studentId,
      current_streak: 5,
      longest_streak: 10,
      available_freeze_tokens: i % 4 === 1 ? 1 : 0,
    });
  }

  const db = {
    getQueryCount: () => queryCount,
    resetQueryCount: () => { queryCount = 0; },
    prepare(sql) {
      const normalizedSql = sql.replace(/\s+/g, ' ').trim();
      return {
        bind(...args) {
          return {
            async all() {
              queryCount++;
              if (normalizedSql.includes('FROM students WHERE status = ?')) {
                return { success: true, results: students };
              }
              if (normalizedSql.includes('SELECT DISTINCT student_id FROM study_logs')) {
                const dateArg = args[0];
                const matchingLogs = studyLogs.filter(
                  (l) => l.date_of_study === dateArg && l.total_hours > 0
                );
                const uniqueIds = Array.from(new Set(matchingLogs.map((l) => l.student_id)));
                return {
                  success: true,
                  results: uniqueIds.map((id) => ({ student_id: id })),
                };
              }
              return { success: true, results: [] };
            },
            async first() {
              queryCount++;
              if (normalizedSql.includes('SELECT COUNT(*) as count FROM study_logs')) {
                const [studentId, dateOfStudy] = args;
                const count = studyLogs.filter(
                  (l) =>
                    l.student_id === studentId &&
                    l.date_of_study === dateOfStudy &&
                    l.total_hours > 0
                ).length;
                return { count };
              }
              if (normalizedSql.includes('SELECT current_streak, longest_streak FROM student_metrics')) {
                const [studentId] = args;
                const m = studentMetrics.get(studentId);
                return m ? { current_streak: m.current_streak, longest_streak: m.longest_streak } : null;
              }
              if (normalizedSql.includes('SELECT available_freeze_tokens, current_streak FROM student_metrics')) {
                const [studentId] = args;
                const m = studentMetrics.get(studentId);
                return m
                  ? {
                      available_freeze_tokens: m.available_freeze_tokens,
                      current_streak: m.current_streak,
                    }
                  : null;
              }
              return null;
            },
            async run() {
              queryCount++;
              if (normalizedSql.includes('INSERT INTO audit_log')) {
                auditLogs.push(args);
              }
              return { success: true };
            },
          };
        },
      };
    },
  };

  return db;
}

test('Streak Evaluator Benchmark & Correctness Verification', async () => {
  const studentCount = 500;
  const mockDb = createMockD1Database(studentCount);

  const startTime = performance.now();
  const result = await evaluateStreaksAndFreezes(mockDb);
  const duration = performance.now() - startTime;

  console.log(`[BENCHMARK RESULT] Students: ${studentCount}`);
  console.log(`[BENCHMARK RESULT] Queries Executed: ${mockDb.getQueryCount()}`);
  console.log(`[BENCHMARK RESULT] Execution Time: ${duration.toFixed(2)}ms`);
  console.log(`[BENCHMARK RESULT] Result metrics:`, result);

  assert.equal(result.processed, studentCount);
  assert.equal(result.streakIncremented, 250); // half logged
  assert.equal(result.freezeUsed, 125); // 1 in 4 had a freeze
  assert.equal(result.streakReset, 125); // remaining 1 in 4 had no freeze
});
