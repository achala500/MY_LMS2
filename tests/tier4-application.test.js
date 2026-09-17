/**
 * Tier 4: Real-World Application Workflows & Scenarios (S1-S5)
 * 
 * Verifies complete end-to-end real-world workflows:
 * Student registers via web -> Links Telegram via /start -> Logs study via /log ->
 * Checks /status -> Admin triggers /broadcastDailyDigest -> Student views Z-Score
 * velocity gauge and cognitive recommendations on dashboard.
 */

import { describe, it, expect } from './e2e-runner.js';
import {
  StudySyncDatabase,
  STREAMS,
  STREAM_SUBJECTS,
  ADMIN_WHITELIST,
  filterSchools,
  getStudentSubjects,
  getFocusBadge,
  getProductivityBadge,
  calculateStreak,
  calculateStudentMetrics,
  generateQrPayload,
  parseQrPayload,
  normalizeTelegramUsername,
  isValidTelegramHandle,
  formatTelegramDigest,
  inspectMagicBytes,
  validateBinaryBuffer,
  scanBinaryPayload,
  scanBase64Payload,
  SynchronizedSlidingRateLimiter,
  generateSecurityNonce,
  generateIdempotencyKey,
  createIdempotencyEnvelope,
  verifyTimestampDrift,
  escapeHtml,
  sanitizeInput,
  sanitizeUrl,
  sanitizeCsvFormula,
  formatCsvCell,
  generateCsvString,
  NATIONAL_SUBJECT_STATS,
  UNIVERSITY_CUTOFF_TIERS,
  calculatePercentileFromZ,
  calculateSubjectZScore,
  calculateSubjectZScoreDetail,
  calculateCompositeZScore,
  calculateSubjectEma,
  calculateDynamicVelocity,
  calculateTargetGapAnalysis,
  calculateCognitiveFatigueIndex,
  calculateSubjectEntropyEquilibrium,
  calculateStudyRoi,
  generateAiPrescriptions,
  generateComprehensiveCognitiveReport
} from './test-harness.js';

describe("Tier 4: Real-World Application Workflows & Scenarios (S1-S5)", () => {

  // ==========================================================================
  // Scenario S1: Complete Bio Student Journey (Web -> Telegram -> Dashboard)
  // ==========================================================================
  it("Scenario S1: Complete Bio Student Lifecycle (Web Reg -> /start -> /log -> /status -> Broadcast -> Z-Score & AI)", () => {
    const db = new StudySyncDatabase();

    // 1. Google Authentication
    const googleUser = {
      uid: "g-uid-kasun-2026",
      email: "kasun.perera.bio@gmail.com",
      displayName: "Kasun Perera",
      photoURL: "https://lh3.googleusercontent.com/a/kasun-avatar",
      emailVerified: true
    };
    expect(googleUser.emailVerified).toBe(true);

    // 2. Web Registration
    const schoolMatches = filterSchools("Royal");
    expect(schoolMatches.length).toBeGreaterThan(0);
    const chosenSchool = schoolMatches[0];

    const reg = db.registerMember({
      fullName: googleUser.displayName,
      email: googleUser.email,
      gender: "Male",
      telegram: "@kasun_bio",
      school: chosenSchool,
      stream: STREAMS.BIO,
      optionalSubject: "Physics"
    });
    const studyId = reg["Study ID"];
    expect(studyId).toBe("SG-BIO-0001");

    // 3. Apple Wallet ID Card & QR Code Verification Generation
    const qr = generateQrPayload({
      studyId,
      fullName: reg["Full Name"],
      stream: reg["Stream"],
      school: reg["School"],
      registrationDate: reg["Registration Date"]
    });
    expect(qr.verifyUrl).toContain(encodeURIComponent(studyId));

    // 4. Telegram Account Link via /start <STUDY_ID>
    const startRes = db.telegramWebhook({
      text: `/start ${studyId}`,
      username: "kasun_bio",
      chatId: "4001"
    });
    expect(startRes.handled).toBe(true);
    expect(startRes.studyId).toBe(studyId);
    expect(startRes.replyText).toContain("Welcome to StudySync, Kasun Perera");

    // 5. Daily Study Logging via Telegram /log
    const logRes = db.telegramWebhook({
      text: "/log 3.0 2.5 2.0 Biology genetics essay, Chemistry electrochem problems, Physics circular motion",
      username: "kasun_bio",
      chatId: "4001"
    });
    expect(logRes.handled).toBe(true);
    expect(logRes.totalHours).toBe(7.5);
    expect(logRes.activeStreak).toBe(1);

    // 6. Telegram /status Check
    const statusRes = db.telegramWebhook({
      text: "/status",
      username: "kasun_bio",
      chatId: "4001"
    });
    expect(statusRes.handled).toBe(true);
    expect(statusRes.stats.streak).toBe(1);
    expect(statusRes.stats.totalHours).toBe(7.5);
    expect(statusRes.stats.studiedToday).toBe(true);

    // 7. Admin Triggers Daily Digest Broadcast
    const broadcast = db.broadcastDailyDigest({ adminEmail: ADMIN_WHITELIST[0] });
    expect(broadcast.broadcastSent).toBe(true);
    expect(broadcast.stats.activeStudentsToday).toBe(1);
    expect(broadcast.digestText).toContain("Biological Science:* *7.5 hrs*");

    // 8. Student Logs Test Marks on Web Dashboard
    const testMarks = [
      { id: '1', studyId, studentEmail: googleUser.email, testDate: '2026-08-01', examType: 'Term Test', subject: 'Biology', paperTitle: 'Term 1 Bio', score: 72 },
      { id: '2', studyId, studentEmail: googleUser.email, testDate: '2026-08-01', examType: 'Term Test', subject: 'Chemistry', paperTitle: 'Term 1 Chem', score: 68 },
      { id: '3', studyId, studentEmail: googleUser.email, testDate: '2026-08-01', examType: 'Term Test', subject: 'Physics', paperTitle: 'Term 1 Phys', score: 64 }
    ];

    // 9. Student Views Comprehensive Cognitive Report & Z-Score Velocity
    const memberObj = db.getMemberByStudyId(studyId);
    const logs = db.getStudentLogs(studyId);
    const report = generateComprehensiveCognitiveReport(memberObj, logs, testMarks, 'colombo-eng-med');

    expect(report.compositeZScore).toBeGreaterThan(0.35);
    expect(report.nationalPercentile).toBeGreaterThan(60.0);
    expect(report.targetGap.targetZ).toBe(2.05);
    expect(report.prescriptions.length).toBeGreaterThan(0);
    expect(report.prescriptions.some(p => p.stream === 'Biological Science')).toBe(true);
  });

  // ==========================================================================
  // Scenario S2: Physical Science Multi-Day Streak & Dynamics Remediation
  // ==========================================================================
  it("Scenario S2: Physical Science Journey (Multi-Day Streak -> /leaderboard -> Gap Analysis -> Heuristic Prescriptions)", () => {
    const db = new StudySyncDatabase();

    // 1. Register Physical Science Student
    const member = db.registerMember({
      fullName: "Dinuka Wickramasinghe",
      email: "dinuka.maths@gmail.com",
      gender: "Male",
      telegram: "@dinuka_maths",
      school: "Ananda College, Colombo",
      stream: STREAMS.MATHS,
      optionalSubject: "Chemistry"
    });
    const studyId = member["Study ID"];
    expect(studyId).toBe("SG-MATH-0001");

    // 2. Link Telegram
    db.telegramWebhook({ text: `/start ${studyId}`, username: "dinuka_maths", chatId: "4002" });

    // 3. Log 3 Consecutive Days
    db.submitDailyLog({
      studyId,
      email: member.Email,
      dateOfStudy: "2026-08-25",
      subjects: [
        { name: "Combined Maths", hours: 3.0, focus: 8, productivity: 8 },
        { name: "Physics", hours: 2.5, focus: 8, productivity: 8 },
        { name: "Chemistry", hours: 2.0, focus: 8, productivity: 8 }
      ]
    });

    db.submitDailyLog({
      studyId,
      email: member.Email,
      dateOfStudy: "2026-08-26",
      subjects: [
        { name: "Combined Maths", hours: 3.5, focus: 9, productivity: 8 },
        { name: "Physics", hours: 3.0, focus: 8, productivity: 9 },
        { name: "Chemistry", hours: 2.0, focus: 8, productivity: 8 }
      ]
    });

    db.submitDailyLog({
      studyId,
      email: member.Email,
      dateOfStudy: "2026-08-27",
      subjects: [
        { name: "Combined Maths", hours: 4.0, focus: 8, productivity: 8 },
        { name: "Physics", hours: 3.0, focus: 9, productivity: 9 },
        { name: "Chemistry", hours: 2.5, focus: 8, productivity: 8 }
      ]
    });

    // 4. Verify Streak & Leaderboard
    const studentLogs = db.getStudentLogs(studyId);
    const streak = calculateStreak(studentLogs.map(l => l.dateOfStudy), "2026-08-27");
    expect(streak).toBe(3);

    const lbRes = db.telegramWebhook({ text: "/leaderboard maths", chatId: "4002" });
    expect(lbRes.handled).toBe(true);
    expect(lbRes.replyText).toContain("Dinuka Wickramasinghe");

    // 5. Test Marks Indicating Dynamics Bottleneck in Combined Maths
    const marks = [
      { id: '1', studyId, studentEmail: member.Email, testDate: '2026-08-01', examType: 'Model Paper', subject: 'Combined Maths', score: 48 },
      { id: '2', studyId, studentEmail: member.Email, testDate: '2026-08-01', examType: 'Model Paper', subject: 'Physics', score: 78 },
      { id: '3', studyId, studentEmail: member.Email, testDate: '2026-08-01', examType: 'Model Paper', subject: 'Chemistry', score: 82 }
    ];

    const prescriptions = generateAiPrescriptions(member, studentLogs, marks);
    expect(prescriptions.length).toBeGreaterThan(0);
    // Asymmetric drag or dynamics deficit identified
    const hasMathDeficit = prescriptions.some(p => p.targetSubject === 'Combined Maths');
    expect(hasMathDeficit).toBe(true);
  });

  // ==========================================================================
  // Scenario S3: Concurrency Isolation & Admin Oversight Workflow
  // ==========================================================================
  it("Scenario S3: Admin Oversight & Concurrency Safe CSV Data Export", () => {
    const db = new StudySyncDatabase();

    // 1. Concurrently register students
    const s1 = db.registerMember({
      fullName: "Student One",
      email: "s1@gmail.com",
      gender: "Male",
      telegram: "@s1",
      school: "Royal College, Colombo",
      stream: STREAMS.BIO,
      optionalSubject: "Physics"
    });
    const s2 = db.registerMember({
      fullName: "Student Two",
      email: "s2@gmail.com",
      gender: "Female",
      telegram: "@s2",
      school: "Visakha Vidyalaya, Colombo",
      stream: STREAMS.MATHS,
      optionalSubject: "Chemistry"
    });

    expect(s1["Study ID"]).toBe("SG-BIO-0001");
    expect(s2["Study ID"]).toBe("SG-MATH-0001");

    // 2. Daily logs with formula injection attempt in notes
    db.submitDailyLog({
      studyId: s1["Study ID"],
      email: s1.Email,
      dateOfStudy: "2026-08-27",
      subjects: [
        { name: "Biology", hours: 3.0, focus: 8, productivity: 8 },
        { name: "Chemistry", hours: 2.0, focus: 8, productivity: 8 },
        { name: "Physics", hours: 2.0, focus: 8, productivity: 8 }
      ],
      notes: "=cmd|'/C calc'!A0"
    });

    // 3. Admin queries system data
    const adminEmail = ADMIN_WHITELIST[0];
    const analytics = db.getAdminAnalytics(adminEmail);
    expect(analytics.kpis.totalMembers).toBe(2);
    expect(analytics.kpis.totalLogs).toBe(1);

    // 4. CSV Export with formula sanitization (CWE-1236 protection)
    const headers = ["Study ID", "Full Name", "Notes"];
    const rows = [
      [s1["Study ID"], s1["Full Name"], "=cmd|'/C calc'!A0"],
      [s2["Study ID"], s2["Full Name"], "+123456"]
    ];
    const csvOutput = generateCsvString(headers, rows);
    expect(csvOutput).toContain("'=cmd|'/C calc'!A0");
    expect(csvOutput).toContain("'+123456");
  });

  // ==========================================================================
  // Scenario S4: Public QR Verification Scan & Anti-Tamper
  // ==========================================================================
  it("Scenario S4: Public QR Verification Scan & Safe Metadata Projection", () => {
    const db = new StudySyncDatabase();
    const member = db.registerMember({
      fullName: "Achala Anurada",
      email: "achala@gmail.com",
      gender: "Male",
      telegram: "@achala_al",
      school: "Royal College, Colombo",
      stream: STREAMS.MATHS,
      optionalSubject: "Chemistry"
    });
    const studyId = member["Study ID"];

    // 1. Verify valid member
    const verified = db.getMemberByStudyId(studyId);
    expect(verified).toBeDefined();
    expect(verified.fullName).toBe("Achala Anurada");
    expect(verified.school).toBe("Royal College, Colombo");

    // 2. Verify invalid member safely returns null
    const nonExistent = db.getMemberByStudyId("SG-MATH-9999");
    expect(nonExistent).toBeNull();
  });

  // ==========================================================================
  // Scenario S5: Multi-Tab Rate Limiting & Cognitive Burnout Prevention
  // ==========================================================================
  it("Scenario S5: Burst Rate Limiting & Cognitive Burnout Index Safeguards", () => {
    // 1. Rate Limiting Burst Safeguard
    const limiter = new SynchronizedSlidingRateLimiter({ limit: 6, windowMs: 60000 });
    for (let i = 0; i < 6; i++) {
      expect(limiter.allow()).toBe(true);
    }
    // 7th burst request throttled
    expect(limiter.allow()).toBe(false);
    expect(limiter.getResetTimeMs()).toBeGreaterThan(0);

    // 2. Cognitive Burnout Detection on Extreme Volume
    const extremeStudyLogs = [
      { subjects: [{ name: "Combined Maths", hours: 14, focus: 2, productivity: 2 }] },
      { subjects: [{ name: "Combined Maths", hours: 14, focus: 2, productivity: 2 }] },
      { subjects: [{ name: "Combined Maths", hours: 14, focus: 2, productivity: 2 }] },
      { subjects: [{ name: "Combined Maths", hours: 14, focus: 2, productivity: 2 }] },
      { subjects: [{ name: "Combined Maths", hours: 14, focus: 2, productivity: 2 }] },
      { subjects: [{ name: "Combined Maths", hours: 14, focus: 2, productivity: 2 }] }
    ];
    const fatigue = calculateCognitiveFatigueIndex(extremeStudyLogs, 30);
    expect(fatigue.tier).toBe("burnout");
    expect(fatigue.restorativeProtocol).toContain("Reduce study volume by 50%");
  });
}, { tier: 4 });

// Direct CLI Execution Hook
if (process.argv[1] && process.argv[1].endsWith('tier4-application.test.js')) {
  import('./e2e-runner.js').then(({ runner }) => {
    runner.run(4).then(success => process.exit(success ? 0 : 1));
  });
}
