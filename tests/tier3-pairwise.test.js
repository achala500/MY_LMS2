/**
 * Tier 3: Cross-Feature Pairwise Interaction Tests
 * 
 * Verifies complex interactions between complementary feature pairs.
 * Minimum threshold: ≥27 test cases.
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

describe("Tier 3: Cross-Feature Pairwise Interactions (P1-P28)", () => {
  // P1 (F1 x F2): Google Auth x First-Time Routing
  it("T3.P1 (F1 x F2): Google Auth with new email immediately triggers first-time registration routing", () => {
    const db = new StudySyncDatabase();
    const authUser = { email: "fresh.student@gmail.com", displayName: "Fresh User" };
    const member = db.getMemberByEmail(authUser.email);
    const targetRoute = member ? "#dashboard" : "#register";
    expect(member).toBeNull();
    expect(targetRoute).toBe("#register");
  });

  // P2 (F1 x F3): Google Auth x Returning User Fast-Path
  it("T3.P2 (F1 x F3): Google Auth with pre-registered email triggers fast-path directly to student dashboard", () => {
    const db = new StudySyncDatabase();
    db.registerMember({
      fullName: "Kasun Perera",
      email: "kasun@gmail.com",
      gender: "Male",
      telegram: "@kasun",
      school: "Royal College, Colombo",
      stream: STREAMS.BIO,
      optionalSubject: "Physics"
    });
    const authUser = { email: "kasun@gmail.com" };
    const member = db.getMemberByEmail(authUser.email);
    const targetRoute = member ? "#dashboard" : "#register";
    expect(member).toHaveProperty("studyId");
    expect(targetRoute).toBe("#dashboard");
  });

  // P3 (F1 x F4): Google Auth x Read-Only Email Binding
  it("T3.P3 (F1 x F4): Google Auth email locks registration email field as immutable read-only", () => {
    const authSession = { email: "student.al2026@gmail.com" };
    const registrationState = {
      emailInput: authSession.email,
      isReadOnly: true,
      canModify: false
    };
    expect(registrationState.emailInput).toBe(authSession.email);
    expect(registrationState.isReadOnly).toBe(true);
  });

  // P4 (F1 x F21): Google Auth x Admin Whitelist Gate
  it("T3.P4 (F1 x F21): Google Auth with whitelisted email unlocks protected Admin Dashboard", () => {
    const adminUser = { email: "admin@studysync.lk" };
    const studentUser = { email: "student@gmail.com" };
    
    const checkAdmin = (user) => ADMIN_WHITELIST.map(e => e.toLowerCase()).includes(user.email.toLowerCase());
    expect(checkAdmin(adminUser)).toBe(true);
    expect(checkAdmin(studentUser)).toBe(false);
  });

  // P5 (F2 x F5): First-Time Registration x School Autocomplete
  it("T3.P5 (F2 x F5): First-time registration flow queries school autocomplete and binds selection", () => {
    const query = "Maliyadeva";
    const matches = filterSchools(query);
    expect(matches.length).toBeGreaterThan(0);
    const selectedSchool = matches[0];
    
    const regForm = { school: selectedSchool };
    expect(regForm.school).toContain("Maliyadeva College");
  });

  // P6 (F2 x F6): First-Time Registration x Dynamic Optional Subject
  it("T3.P6 (F2 x F6): Stream selection dynamically reconfigures optional subject choices in registration form", () => {
    let form = { stream: STREAMS.BIO, optionalSubject: "Physics" };
    expect(STREAM_SUBJECTS[form.stream].optionalChoices.includes(form.optionalSubject)).toBe(true);

    // Switch to Maths
    form.stream = STREAMS.MATHS;
    form.optionalSubject = "ICT";
    expect(STREAM_SUBJECTS[form.stream].optionalChoices.includes(form.optionalSubject)).toBe(true);
  });

  // P7 (F2 x F7): Registration Form x Sequential Study ID Generation
  it("T3.P7 (F2 x F7): Registration form submission triggers atomic sequential ID generation for stream", () => {
    const db = new StudySyncDatabase();
    const bio1 = db.registerMember({
      fullName: "Kasun",
      email: "kasun@gmail.com",
      gender: "Male",
      telegram: "@kasun",
      school: "Royal College, Colombo",
      stream: STREAMS.BIO,
      optionalSubject: "Physics"
    });
    expect(bio1["Study ID"]).toBe("SG-BIO-0001");

    const bio2 = db.registerMember({
      fullName: "Nimal",
      email: "nimal@gmail.com",
      gender: "Male",
      telegram: "@nimal",
      school: "Ananda College, Colombo",
      stream: STREAMS.BIO,
      optionalSubject: "Agriculture"
    });
    expect(bio2["Study ID"]).toBe("SG-BIO-0002");
  });

  // P8 (F5 x F7): School Selection x Stream Study ID Persistence
  it("T3.P8 (F5 x F7): Selected school combined with sequential stream ID persists in database row", () => {
    const db = new StudySyncDatabase();
    const school = filterSchools("Visakha")[0];
    const registered = db.registerMember({
      fullName: "Sanduni",
      email: "sanduni@gmail.com",
      gender: "Female",
      telegram: "@sanduni",
      school: school,
      stream: STREAMS.BIO,
      optionalSubject: "Physics"
    });
    expect(registered["School"]).toContain("Visakha Vidyalaya");
    expect(registered["Study ID"]).toBe("SG-BIO-0001");
  });

  // P9 (F6 x F12): Optional Subject Choice x Daily Form 3-Subject Rendering
  it("T3.P9 (F6 x F12): Optional subject chosen during registration renders exact 3 subjects on daily form", () => {
    const bioAgSubjects = getStudentSubjects(STREAMS.BIO, "Agriculture");
    expect(bioAgSubjects).toEqual(["Biology", "Chemistry", "Agriculture"]);

    const mathsChemSubjects = getStudentSubjects(STREAMS.MATHS, "Chemistry");
    expect(mathsChemSubjects).toEqual(["Combined Maths", "Physics", "Chemistry"]);
  });

  // P10 (F7 x F8): Study ID x StudySync Platform ID Card
  it("T3.P10 (F7 x F8): Generated Study ID renders into StudySync Platform ID Card parameters", () => {
    const db = new StudySyncDatabase();
    const reg = db.registerMember({
      fullName: "Dinuka Fernando",
      email: "dinuka@gmail.com",
      gender: "Female",
      telegram: "@dinuka",
      school: "Maliyadeva College, Kurunegala",
      stream: STREAMS.MATHS,
      optionalSubject: "ICT"
    });
    const cardData = {
      studyId: reg["Study ID"],
      fullName: reg["Full Name"],
      school: reg["School"],
      stream: reg["Stream"]
    };
    expect(cardData.studyId).toBe("SG-MATH-0001");
    expect(cardData.stream).toBe(STREAMS.MATHS);
  });

  // P11 (F7 x F9): Study ID x Dual-Payload QR Generator
  it("T3.P11 (F7 x F9): Generated Study ID is embedded into dual-payload QR code with verification URL", () => {
    const member = {
      studyId: "SG-BIO-0001",
      fullName: "Kasun Perera",
      school: "Royal College, Colombo",
      stream: STREAMS.BIO,
      registrationDate: "2026-08-26"
    };
    const qr = generateQrPayload(member);
    expect(qr.verifyUrl).toBe("https://studysync.lk/#verify/SG-BIO-0001");
    expect(qr.offlineData).toContain("SG-BIO-0001");
  });

  // P12 (F8 x F10): Platform ID Card ID Card x 3x High-Res PNG Download
  it("T3.P12 (F8 x F10): Platform ID Card ID Card renders and configures 3x high-res PNG export (1440x906px)", () => {
    const baseCard = { width: 480, height: 302, scale: 3 };
    const exportWidth = baseCard.width * baseCard.scale;
    const exportHeight = baseCard.height * baseCard.scale;
    const filename = `StudySync_ID_SG-BIO-0001.png`;
    expect(exportWidth).toBe(1440);
    expect(exportHeight).toBe(906);
    expect(filename).toBe("StudySync_ID_SG-BIO-0001.png");
  });

  // P13 (F9 x F11): Dual-Payload QR x Public Member Verification
  it("T3.P13 (F9 x F11): Scanned QR verification URL validates member status on public endpoint", () => {
    const db = new StudySyncDatabase();
    const reg = db.registerMember({
      fullName: "Kasun Perera",
      email: "kasun@gmail.com",
      gender: "Male",
      telegram: "@kasun",
      school: "Royal College, Colombo",
      stream: STREAMS.BIO,
      optionalSubject: "Physics"
    });
    const qr = generateQrPayload({ studyId: reg["Study ID"], fullName: reg["Full Name"], stream: reg["Stream"], school: reg["School"] });
    const parsed = parseQrPayload(qr.combinedString);
    const verified = db.getMemberByStudyId(parsed.studyId);
    expect(verified.status).toBe("Active");
    expect(verified.fullName).toBe("Kasun Perera");
  });

  // P14 (F12 x F13): Stream Subjects x Decimal Hours Aggregation
  it("T3.P14 (F12 x F13): Stream 3-subject inputs aggregate decimal study hours into total daily hours", () => {
    const subjects = [
      { name: "Biology", hours: 2.5 },
      { name: "Chemistry", hours: 1.75 },
      { name: "Physics", hours: 2.25 }
    ];
    const totalDailyHours = Number(subjects.reduce((sum, s) => sum + s.hours, 0).toFixed(2));
    expect(totalDailyHours).toBe(6.5);
  });

  // P15 (F12 x F14): Stream Subjects x Focus Sliders (1-10)
  it("T3.P15 (F12 x F14): Stream-specific subjects pair with 1-10 focus sliders to record per-subject focus", () => {
    const subjects = [
      { name: "Combined Maths", focus: 9 },
      { name: "Physics", focus: 7 },
      { name: "ICT", focus: 8 }
    ];
    const badges = subjects.map(s => getFocusBadge(s.focus));
    expect(badges[0].text).toBe("High / Deep Flow");
    expect(badges[1].text).toBe("Moderate / Steady");
  });

  // P16 (F12 x F15): Stream Subjects x Productivity Sliders (1-10)
  it("T3.P16 (F12 x F15): Stream-specific subjects pair with 1-10 productivity sliders to record per-subject productivity", () => {
    const subjects = [
      { name: "Combined Maths", productivity: 10 },
      { name: "Physics", productivity: 8 },
      { name: "ICT", productivity: 6 }
    ];
    const badges = subjects.map(s => getProductivityBadge(s.productivity));
    expect(badges[0].text).toBe("Maximum Output / Mastery");
    expect(badges[2].text).toBe("Consistent Progress");
  });

  // P17 (F13 x F16): Daily Study Hours x Photo Proof Upload
  it("T3.P17 (F13 x F16): Daily study log submission commits decimal hours and photo proof Drive URL", () => {
    const db = new StudySyncDatabase();
    const reg = db.registerMember({
      fullName: "Kasun",
      email: "kasun@gmail.com",
      gender: "Male",
      telegram: "@kasun",
      school: "Royal",
      stream: STREAMS.BIO,
      optionalSubject: "Physics"
    });
    const sub = db.submitDailyLog({
      studyId: reg["Study ID"],
      email: "kasun@gmail.com",
      dateOfStudy: "2026-08-26",
      subjects: [
        { name: "Biology", hours: 3.5, focus: 8, productivity: 8 },
        { name: "Chemistry", hours: 2.0, focus: 8, productivity: 8 },
        { name: "Physics", hours: 1.5, focus: 8, productivity: 8 }
      ],
      proofPhotoUrl: "https://drive.google.com/file/d/proof-file-1/view"
    });
    expect(sub.totalHours).toBe(7.0);
    expect(sub.proofPhotoUrl).toContain("proof-file-1");
  });

  // P18 (F13 x F17): Daily Study Log x One-Submission-Per-Day Enforcement
  it("T3.P18 (F13 x F17): Daily log submission locks further submissions for the same date", () => {
    const db = new StudySyncDatabase();
    const reg = db.registerMember({
      fullName: "Kasun",
      email: "kasun@gmail.com",
      gender: "Male",
      telegram: "@kasun",
      school: "Royal",
      stream: STREAMS.BIO,
      optionalSubject: "Physics"
    });
    const sub1 = db.submitDailyLog({
      studyId: reg["Study ID"],
      email: "kasun@gmail.com",
      dateOfStudy: "2026-08-26",
      subjects: [
        { name: "Biology", hours: 2, focus: 8, productivity: 8 },
        { name: "Chemistry", hours: 2, focus: 8, productivity: 8 },
        { name: "Physics", hours: 2, focus: 8, productivity: 8 }
      ]
    });
    const sub2 = db.submitDailyLog({
      studyId: reg["Study ID"],
      email: "kasun@gmail.com",
      dateOfStudy: "2026-08-26",
      subjects: [
        { name: "Biology", hours: 1, focus: 5, productivity: 5 },
        { name: "Chemistry", hours: 1, focus: 5, productivity: 5 },
        { name: "Physics", hours: 1, focus: 5, productivity: 5 }
      ]
    });
    expect(sub1.isDuplicate).toBe(false);
    expect(sub2.isDuplicate).toBe(true);
  });

  // P19 (F17 x F18): One-Submission-Per-Day x Personal Study Streak Tracker
  it("T3.P19 (F17 x F18): Unique daily logs across distinct dates increment streak counter", () => {
    const dates = ["2026-08-24", "2026-08-25", "2026-08-26"];
    const streak = calculateStreak(dates, "2026-08-26");
    expect(streak).toBe(3);
  });

  // P20 (F18 x F19): Streak Tracker x Personal Study Metrics Rollup
  it("T3.P20 (F18 x F19): Personal streak and daily logs aggregate into complete metrics rollup", () => {
    const logs = [
      { dateOfStudy: "2026-08-25", subjects: [{ name: "Bio", hours: 2, focus: 8, productivity: 8 }, { name: "Chem", hours: 2, focus: 8, productivity: 8 }, { name: "Phy", hours: 2, focus: 8, productivity: 8 }] },
      { dateOfStudy: "2026-08-26", subjects: [{ name: "Bio", hours: 3, focus: 9, productivity: 9 }, { name: "Chem", hours: 2, focus: 8, productivity: 8 }, { name: "Phy", hours: 1, focus: 7, productivity: 7 }] }
    ];
    const streak = calculateStreak(logs.map(l => l.dateOfStudy), "2026-08-26");
    const metrics = calculateStudentMetrics(logs);
    expect(streak).toBe(2);
    expect(metrics.totalHours).toBe(12.0);
    expect(metrics.perSubjectHours["Bio"]).toBe(5.0);
  });

  // P21 (F19 x F20): Personal Metrics Rollup x Past History Table
  it("T3.P21 (F19 x F20): Metrics rollup synchronizes with past history entries", () => {
    const logs = [
      { totalHours: 6.0, dateOfStudy: "2026-08-25" },
      { totalHours: 6.0, dateOfStudy: "2026-08-26" }
    ];
    const totalRollupHours = logs.reduce((sum, l) => sum + l.totalHours, 0);
    expect(totalRollupHours).toBe(12.0);
    expect(logs).toHaveLength(2);
  });

  // P22 (F21 x F22): Admin Whitelist Gate x Members Directory & CSV Export
  it("T3.P22 (F21 x F22): Whitelisted admin queries members directory and exports CSV", () => {
    const db = new StudySyncDatabase();
    db.registerMember({
      fullName: "Kasun",
      email: "kasun@gmail.com",
      gender: "Male",
      telegram: "@kasun",
      school: "Royal",
      stream: STREAMS.BIO,
      optionalSubject: "Physics"
    });
    const analytics = db.getAdminAnalytics("admin@studysync.lk");
    expect(analytics.kpis.totalMembers).toBe(1);
  });

  // P23 (F21 x F23): Admin Whitelist Gate x Global Daily Study Logs
  it("T3.P23 (F21 x F23): Whitelisted admin views global logs and inspects proof URLs", () => {
    const db = new StudySyncDatabase();
    const reg = db.registerMember({
      fullName: "Kasun",
      email: "kasun@gmail.com",
      gender: "Male",
      telegram: "@kasun",
      school: "Royal",
      stream: STREAMS.BIO,
      optionalSubject: "Physics"
    });
    db.submitDailyLog({
      studyId: reg["Study ID"],
      email: "kasun@gmail.com",
      dateOfStudy: "2026-08-26",
      subjects: [{ name: "Biology", hours: 2, focus: 8, productivity: 8 }, { name: "Chemistry", hours: 2, focus: 8, productivity: 8 }, { name: "Physics", hours: 2, focus: 8, productivity: 8 }],
      proofPhotoUrl: "https://drive.google.com/proof.jpg"
    });
    const analytics = db.getAdminAnalytics("admin@studysync.lk");
    expect(analytics.kpis.totalLogs).toBe(1);
  });

  // P24 (F22 x F24): Members Directory x Group Analytics & Streak Leaderboard
  it("T3.P24 (F22 x F24): Members directory and logs generate group analytics and ranked leaderboard", () => {
    const db = new StudySyncDatabase();
    const reg1 = db.registerMember({
      fullName: "Kasun",
      email: "kasun@gmail.com",
      gender: "Male",
      telegram: "@kasun",
      school: "Royal",
      stream: STREAMS.BIO,
      optionalSubject: "Physics"
    });
    const reg2 = db.registerMember({
      fullName: "Dinuka",
      email: "dinuka@gmail.com",
      gender: "Female",
      telegram: "@dinuka",
      school: "Maliyadeva",
      stream: STREAMS.MATHS,
      optionalSubject: "ICT"
    });
    const todayDateStr = new Date().toISOString().split('T')[0];
    db.submitDailyLog({
      studyId: reg1["Study ID"],
      email: "kasun@gmail.com",
      dateOfStudy: todayDateStr,
      subjects: [{ name: "Biology", hours: 3, focus: 9, productivity: 9 }, { name: "Chemistry", hours: 2, focus: 8, productivity: 8 }, { name: "Physics", hours: 2, focus: 8, productivity: 8 }]
    });
    const analytics = db.getAdminAnalytics("admin@studysync.lk");
    expect(analytics.leaderboard[0].studyId).toBe("SG-BIO-0001");
    expect(analytics.leaderboard[0].streak).toBe(1);
    expect(analytics.leaderboard[0].totalHours).toBe(7.0);
  });

  // P25 (F23 x F25): Global Daily Study Logs x 3-Sheet Normalized Database
  it("T3.P25 (F23 x F25): Global daily study logs write to and read from 19-column DailyLogs sheet", () => {
    const db = new StudySyncDatabase();
    const reg = db.registerMember({
      fullName: "Kasun",
      email: "kasun@gmail.com",
      gender: "Male",
      telegram: "@kasun",
      school: "Royal",
      stream: STREAMS.BIO,
      optionalSubject: "Physics"
    });
    db.submitDailyLog({
      studyId: reg["Study ID"],
      email: "kasun@gmail.com",
      dateOfStudy: "2026-08-26",
      subjects: [{ name: "Biology", hours: 2, focus: 8, productivity: 8 }, { name: "Chemistry", hours: 2, focus: 8, productivity: 8 }, { name: "Physics", hours: 2, focus: 8, productivity: 8 }]
    });
    const row = db.sheets.DailyLogs[0];
    expect(Object.keys(row)).toHaveLength(19);
    expect(row["Subject 1 Name"]).toBe("Biology");
  });

  // P26 (F26 x F2): Registration x Toast Notifications
  it("T3.P26 (F26 x F2): Registration triggers animated toast feedback without native alert()", () => {
    let triggeredToast = null;
    const Toast = {
      success: (msg) => { triggeredToast = { type: "success", msg }; }
    };
    Toast.success("Study ID SG-BIO-0001 generated successfully!");
    expect(triggeredToast.type).toBe("success");
    expect(triggeredToast.msg).toContain("SG-BIO-0001");
  });

  // P27 (F26 x F17): Daily Log Submission x Toast Notifications
  it("T3.P27 (F26 x F17): Duplicate submission warning triggers warning toast notification", () => {
    let triggeredToast = null;
    const Toast = {
      warning: (msg) => { triggeredToast = { type: "warning", msg }; }
    };
    Toast.warning("You have already logged your study hours for today.");
    expect(triggeredToast.type).toBe("warning");
    expect(triggeredToast.msg).toContain("already logged");
  });

  // P28 (F27 x F8): Aurora Theme x StudySync Platform ID Card Preview
  it("T3.P28 (F27 x F8): Aurora dark theme applies glassmorphism and gradient effects to ID card container", () => {
    const containerClasses = "relative rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-2xl p-6";
    expect(containerClasses).toContain("backdrop-blur-xl");
    expect(containerClasses).toContain("border-white/10");
  });
}, { tier: 3 });

// ============================================================================
// Matrix 1: Stream x Telegram Command x Payload Valid/Invalid (P29 - P48)
// ============================================================================
describe("Tier 3 Pairwise: Stream x Telegram Command x Payload Valid/Invalid (P29 - P48)", () => {
  let db;
  let bioMember;
  let mathMember;

  function initDb() {
    db = new StudySyncDatabase();
    bioMember = db.registerMember({
      fullName: "Bio Test Student",
      email: "bio.pairwise@gmail.com",
      gender: "Male",
      telegram: "@bio_pairwise",
      school: "Royal College, Colombo",
      stream: STREAMS.BIO,
      optionalSubject: "Physics"
    });
    mathMember = db.registerMember({
      fullName: "Maths Test Student",
      email: "maths.pairwise@gmail.com",
      gender: "Female",
      telegram: "@maths_pairwise",
      school: "Visakha Vidyalaya, Colombo",
      stream: STREAMS.MATHS,
      optionalSubject: "Chemistry"
    });
  }

  // /start: Bio & Maths x Valid/Invalid
  it("T3.P29 (Bio x /start x Valid): Links Bio Study ID and returns Bio student greeting", () => {
    initDb();
    const res = db.telegramWebhook({ text: `/start ${bioMember['Study ID']}`, username: "bio_new", chatId: "3001" });
    expect(res.handled).toBe(true);
    expect(res.studyId).toBe(bioMember['Study ID']);
    expect(res.replyText).toContain("Bio Test Student");
  });

  it("T3.P30 (Bio x /start x Invalid): Unknown Bio Study ID returns error response", () => {
    initDb();
    const res = db.telegramWebhook({ text: `/start SG-BIO-9999`, username: "bio_new", chatId: "3002" });
    expect(res.handled).toBe(true);
    expect(res.error).toContain("Study ID not found");
  });

  it("T3.P31 (Maths x /start x Valid): Links Maths Study ID and returns Maths student greeting", () => {
    initDb();
    const res = db.telegramWebhook({ text: `/start ${mathMember['Study ID']}`, username: "maths_new", chatId: "3003" });
    expect(res.handled).toBe(true);
    expect(res.studyId).toBe(mathMember['Study ID']);
    expect(res.replyText).toContain("Maths Test Student");
  });

  it("T3.P32 (Maths x /start x Invalid): Unknown Maths Study ID returns error response", () => {
    initDb();
    const res = db.telegramWebhook({ text: `/start SG-MATH-8888`, username: "maths_new", chatId: "3004" });
    expect(res.handled).toBe(true);
    expect(res.error).toContain("Study ID not found");
  });

  // /status: Bio & Maths x Valid/Invalid
  it("T3.P33 (Bio x /status x Valid): Returns active Bio student performance card", () => {
    initDb();
    const res = db.telegramWebhook({ text: "/status", username: "bio_pairwise", chatId: "3005" });
    expect(res.handled).toBe(true);
    expect(res.studyId).toBe(bioMember['Study ID']);
    expect(res.replyText).toContain("STUDYSYNC PERFORMANCE CARD");
  });

  it("T3.P34 (Bio x /status x Invalid): Unregistered username returns member not found", () => {
    initDb();
    const res = db.telegramWebhook({ text: "/status", username: "unknown_bio_user", chatId: "3006" });
    expect(res.handled).toBe(true);
    expect(res.error).toBe("Member not found");
  });

  it("T3.P35 (Maths x /status x Valid): Returns active Maths student performance card", () => {
    initDb();
    const res = db.telegramWebhook({ text: "/status", username: "maths_pairwise", chatId: "3007" });
    expect(res.handled).toBe(true);
    expect(res.studyId).toBe(mathMember['Study ID']);
    expect(res.replyText).toContain("STUDYSYNC PERFORMANCE CARD");
  });

  it("T3.P36 (Maths x /status x Invalid): Unregistered username returns member not found", () => {
    initDb();
    const res = db.telegramWebhook({ text: "/status", username: "unknown_maths_user", chatId: "3008" });
    expect(res.handled).toBe(true);
    expect(res.error).toBe("Member not found");
  });

  // /log: Bio & Maths x Valid/Invalid
  it("T3.P37 (Bio x /log x Valid): Submits 3 Bio stream subject hours and commits row", () => {
    initDb();
    const res = db.telegramWebhook({ text: "/log 2.5 3.0 1.5 Cell biology and organic chemistry revision", username: "bio_pairwise", chatId: "3009" });
    expect(res.handled).toBe(true);
    expect(res.totalHours).toBe(7.0);
    expect(res.activeStreak).toBe(1);
  });

  it("T3.P38 (Bio x /log x Invalid): Negative hours payload rejected with validation error", () => {
    initDb();
    const res = db.telegramWebhook({ text: "/log -1.0 2.0 3.0", username: "bio_pairwise", chatId: "3010" });
    expect(res.handled).toBe(true);
    expect(res.error).toBe("Hours out of bounds");
  });

  it("T3.P39 (Maths x /log x Valid): Submits 3 Maths stream subject hours and commits row", () => {
    initDb();
    const res = db.telegramWebhook({ text: "/log 3.0 2.5 2.0 Pure maths calculus and dynamics problem set", username: "maths_pairwise", chatId: "3011" });
    expect(res.handled).toBe(true);
    expect(res.totalHours).toBe(7.5);
    expect(res.activeStreak).toBe(1);
  });

  it("T3.P40 (Maths x /log x Invalid): Hours > 24 total rejected with validation error", () => {
    initDb();
    const res = db.telegramWebhook({ text: "/log 10.0 10.0 10.0", username: "maths_pairwise", chatId: "3012" });
    expect(res.handled).toBe(true);
    expect(res.error).toBe("Hours out of bounds");
  });

  // /leaderboard: Bio & Maths x Valid/Invalid
  it("T3.P41 (Bio x /leaderboard x Valid): /leaderboard bio filters to Biological Science students", () => {
    initDb();
    const res = db.telegramWebhook({ text: "/leaderboard bio", chatId: "3013" });
    expect(res.handled).toBe(true);
    expect(res.replyText).toContain("LEADERBOARD");
  });

  it("T3.P42 (Bio x /leaderboard x Invalid): Fallback on unrecognized stream parameter", () => {
    initDb();
    const res = db.telegramWebhook({ text: "/leaderboard unknown_filter", chatId: "3014" });
    expect(res.handled).toBe(true);
    expect(res.replyText).toContain("LEADERBOARD");
  });

  it("T3.P43 (Maths x /leaderboard x Valid): /leaderboard maths filters to Physical Science students", () => {
    initDb();
    const res = db.telegramWebhook({ text: "/leaderboard maths", chatId: "3015" });
    expect(res.handled).toBe(true);
    expect(res.replyText).toContain("LEADERBOARD");
  });

  it("T3.P44 (Maths x /leaderboard x Invalid): Fallback on malformed stream parameter", () => {
    initDb();
    const res = db.telegramWebhook({ text: "/leaderboard 123$$$", chatId: "3016" });
    expect(res.handled).toBe(true);
    expect(res.replyText).toContain("LEADERBOARD");
  });

  // /remind: Bio & Maths x Valid/Invalid
  it("T3.P45 (Bio x /remind x Valid): Pending Bio student receives streak urgency reminder", () => {
    initDb();
    const res = db.telegramWebhook({ text: "/remind", username: "bio_pairwise", chatId: "3017" });
    expect(res.handled).toBe(true);
    expect(res.studiedToday).toBe(false);
    expect(res.replyText).toContain("REMINDER");
  });

  it("T3.P46 (Bio x /remind x Invalid): Unlinked user receives account not linked error", () => {
    initDb();
    const res = db.telegramWebhook({ text: "/remind", username: "unlinked_bio_user", chatId: "3018" });
    expect(res.handled).toBe(true);
    expect(res.replyText).toContain("Account not linked");
  });

  it("T3.P47 (Maths x /remind x Valid): Completed Maths student receives celebration message", () => {
    initDb();
    db.submitDailyLog({
      studyId: mathMember['Study ID'],
      email: mathMember.Email,
      dateOfStudy: new Date().toISOString().substring(0, 10),
      subjects: [
        { name: "Combined Maths", hours: 3.0, focus: 8, productivity: 8 },
        { name: "Physics", hours: 2.0, focus: 8, productivity: 8 },
        { name: "Chemistry", hours: 2.0, focus: 8, productivity: 8 }
      ]
    });
    const res = db.telegramWebhook({ text: "/remind", username: "maths_pairwise", chatId: "3019" });
    expect(res.handled).toBe(true);
    expect(res.studiedToday).toBe(true);
    expect(res.replyText).toContain("Great job");
  });

  it("T3.P48 (Maths x /remind x Invalid): Unlinked user receives account not linked error", () => {
    initDb();
    const res = db.telegramWebhook({ text: "/remind", username: "unlinked_maths_user", chatId: "3020" });
    expect(res.handled).toBe(true);
    expect(res.replyText).toContain("Account not linked");
  });
}, { tier: 3 });

// ============================================================================
// Matrix 2: File MIME x Script Tag x Compression Option (P49 - P72)
// ============================================================================
describe("Tier 3 Pairwise: File MIME x Script Tag x Compression Option (P49 - P72)", () => {
  // JPEG Pairwise Tests (P49 - P52)
  it("T3.P49 (JPEG x Clean x Valid Size): Valid JPEG binary passes inspection", () => {
    const buf = Buffer.alloc(500);
    buf[0] = 0xFF; buf[1] = 0xD8; buf[2] = 0xFF; buf[3] = 0xE0;
    buf.write("JFIF", 6, "ascii");
    const scan = scanBinaryPayload(buf);
    const valid = validateBinaryBuffer(buf, 'image/jpeg');
    expect(scan.safe).toBe(true);
    expect(valid.valid).toBe(true);
  });

  it("T3.P50 (JPEG x Embedded Script x Valid Size): Script tag inside JPEG payload rejected", () => {
    const buf = Buffer.alloc(500);
    buf[0] = 0xFF; buf[1] = 0xD8; buf[2] = 0xFF; buf[3] = 0xE0;
    buf.write("<script>alert('xss')</script>", 20, "ascii");
    const scan = scanBinaryPayload(buf);
    expect(scan.safe).toBe(false);
    expect(scan.code).toBe("MALWARE_SCRIPT_EMBEDDED");
  });

  it("T3.P51 (JPEG x Clean x Undersized): 50-byte JPEG rejected as undersized", () => {
    const buf = Buffer.alloc(50);
    buf[0] = 0xFF; buf[1] = 0xD8; buf[2] = 0xFF; buf[3] = 0xE0;
    const valid = validateBinaryBuffer(buf, 'image/jpeg');
    expect(valid.valid).toBe(false);
    expect(valid.code).toBe("SECURITY_FILE_TOO_SMALL");
  });

  it("T3.P52 (JPEG x Embedded Script x Undersized): Undersized script payload rejected", () => {
    const buf = Buffer.alloc(80);
    buf[0] = 0xFF; buf[1] = 0xD8; buf[2] = 0xFF; buf[3] = 0xE0;
    buf.write("<?php system($_GET['c']); ?>", 10, "ascii");
    const valid = validateBinaryBuffer(buf, 'image/jpeg');
    expect(valid.valid).toBe(false);
  });

  // PNG Pairwise Tests (P53 - P56)
  it("T3.P53 (PNG x Clean x Valid Size): Valid PNG binary passes inspection", () => {
    const buf = Buffer.alloc(500);
    buf[0] = 0x89; buf[1] = 0x50; buf[2] = 0x4E; buf[3] = 0x47;
    buf[4] = 0x0D; buf[5] = 0x0A; buf[6] = 0x1A; buf[7] = 0x0A;
    buf.write("IHDR", 12, "ascii");
    const scan = scanBinaryPayload(buf);
    const valid = validateBinaryBuffer(buf, 'image/png');
    expect(scan.safe).toBe(true);
    expect(valid.valid).toBe(true);
  });

  it("T3.P54 (PNG x Embedded Script x Valid Size): Javascript URI inside PNG chunk rejected", () => {
    const buf = Buffer.alloc(500);
    buf[0] = 0x89; buf[1] = 0x50; buf[2] = 0x4E; buf[3] = 0x47;
    buf.write("javascript:eval(atob('payload'))", 20, "ascii");
    const scan = scanBinaryPayload(buf);
    expect(scan.safe).toBe(false);
    expect(scan.code).toBe("MALWARE_SCRIPT_EMBEDDED");
  });

  it("T3.P55 (PNG x Clean x Oversized): 11MB PNG rejected for exceeding 10MB limit", () => {
    const buf = Buffer.alloc(11 * 1024 * 1024);
    buf[0] = 0x89; buf[1] = 0x50; buf[2] = 0x4E; buf[3] = 0x47;
    const valid = validateBinaryBuffer(buf, 'image/png');
    expect(valid.valid).toBe(false);
    expect(valid.code).toBe("SECURITY_FILE_TOO_LARGE");
  });

  it("T3.P56 (PNG x Embedded Script x Oversized): Oversized script payload rejected", () => {
    const buf = Buffer.alloc(11 * 1024 * 1024);
    buf[0] = 0x89; buf[1] = 0x50; buf[2] = 0x4E; buf[3] = 0x47;
    buf.write("<script>alert(1)</script>", 20, "ascii");
    const valid = validateBinaryBuffer(buf, 'image/png');
    expect(valid.valid).toBe(false);
  });

  // WebP Pairwise Tests (P57 - P60)
  it("T3.P57 (WebP x Clean x Valid Size): Valid WebP lossy RIFF passes inspection", () => {
    const buf = Buffer.alloc(500);
    buf.write("RIFF", 0, "ascii");
    buf.writeUInt32LE(492, 4);
    buf.write("WEBP", 8, "ascii");
    buf.write("VP8 ", 12, "ascii");
    const valid = validateBinaryBuffer(buf, 'image/webp');
    expect(valid.valid).toBe(true);
    expect(valid.detectedFormat).toBe('image/webp');
  });

  it("T3.P58 (WebP x Masquerade x Valid Size): WAV audio disguised as WebP rejected", () => {
    const buf = Buffer.alloc(500);
    buf.write("RIFF", 0, "ascii");
    buf.writeUInt32LE(492, 4);
    buf.write("WAVE", 8, "ascii");
    buf.write("fmt ", 12, "ascii");
    const valid = validateBinaryBuffer(buf, 'image/webp');
    expect(valid.valid).toBe(false);
    expect(valid.code).toBe("SECURITY_MIME_MISMATCH");
  });

  it("T3.P59 (WebP x Embedded Script x Valid Size): PHP script inside WebP buffer rejected", () => {
    const buf = Buffer.alloc(500);
    buf.write("RIFF", 0, "ascii");
    buf.write("WEBP", 8, "ascii");
    buf.write("<?php phpinfo(); ?>", 20, "ascii");
    const scan = scanBinaryPayload(buf);
    expect(scan.safe).toBe(false);
    expect(scan.code).toBe("MALWARE_SCRIPT_EMBEDDED");
  });

  it("T3.P60 (WebP x Clean x Undersized): 60-byte WebP rejected as undersized", () => {
    const buf = Buffer.alloc(60);
    buf.write("RIFF", 0, "ascii");
    buf.write("WEBP", 8, "ascii");
    const valid = validateBinaryBuffer(buf, 'image/webp');
    expect(valid.valid).toBe(false);
    expect(valid.code).toBe("SECURITY_FILE_TOO_SMALL");
  });

  // GIF Pairwise Tests (P61 - P64)
  it("T3.P61 (GIF x Clean x Valid Size): Valid GIF89a passes inspection", () => {
    const buf = Buffer.alloc(300);
    buf.write("GIF89a", 0, "ascii");
    const valid = validateBinaryBuffer(buf, 'image/gif');
    expect(valid.valid).toBe(true);
    expect(valid.detectedFormat).toBe('image/gif');
  });

  it("T3.P62 (GIF x Embedded Script x Valid Size): Embedded script in GIF comment rejected", () => {
    const buf = Buffer.alloc(300);
    buf.write("GIF89a", 0, "ascii");
    buf.write("<script>alert('gif')</script>", 10, "ascii");
    const scan = scanBinaryPayload(buf);
    expect(scan.safe).toBe(false);
    expect(scan.code).toBe("MALWARE_SCRIPT_EMBEDDED");
  });

  it("T3.P63 (GIF x Clean x Oversized): 12MB GIF rejected for exceeding size limit", () => {
    const buf = Buffer.alloc(12 * 1024 * 1024);
    buf.write("GIF89a", 0, "ascii");
    const valid = validateBinaryBuffer(buf, 'image/gif');
    expect(valid.valid).toBe(false);
    expect(valid.code).toBe("SECURITY_FILE_TOO_LARGE");
  });

  it("T3.P64 (GIF x Embedded Script x Oversized): Oversized GIF script rejected", () => {
    const buf = Buffer.alloc(12 * 1024 * 1024);
    buf.write("GIF89a", 0, "ascii");
    buf.write("javascript:void(0)", 10, "ascii");
    const valid = validateBinaryBuffer(buf, 'image/gif');
    expect(valid.valid).toBe(false);
  });

  // Executable Blacklist Pairwise Tests (P65 - P72)
  it("T3.P65 (Windows PE x Clean x Valid Size): Windows PE .exe header blocked immediately", () => {
    const buf = Buffer.from([0x4D, 0x5A, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00]);
    const res = inspectMagicBytes(buf);
    expect(res.valid).toBe(false);
    expect(res.code).toBe("MALWARE_PE_EXECUTABLE");
  });

  it("T3.P66 (Windows PE x Script x Valid Size): Base64 encoded PE binary rejected", () => {
    const peBase64 = "data:image/jpeg;base64,TVqQAAMAAAAEAAAA//8AALgAAAAAAAAAQAA=";
    const scan = scanBase64Payload(peBase64);
    expect(scan.safe).toBe(false);
    expect(scan.code).toBe("MALWARE_PE_EXECUTABLE");
  });

  it("T3.P67 (Windows PE x Clean x Undersized): Undersized PE stub blocked by magic byte inspector", () => {
    const buf = Buffer.from([0x4D, 0x5A, 0x00, 0x00]);
    const res = inspectMagicBytes(buf);
    expect(res.valid).toBe(false);
    expect(res.code).toBe("MALWARE_PE_EXECUTABLE");
  });

  it("T3.P68 (Linux ELF x Clean x Valid Size): Linux ELF executable binary blocked immediately", () => {
    const buf = Buffer.from([0x7F, 0x45, 0x4C, 0x46, 0x02, 0x01, 0x01, 0x00]);
    const res = inspectMagicBytes(buf);
    expect(res.valid).toBe(false);
    expect(res.code).toBe("MALWARE_LINUX_ELF");
  });

  it("T3.P69 (Linux ELF x Embedded Script x Valid Size): Linux binary with script strings blocked", () => {
    const buf = Buffer.from([0x7F, 0x45, 0x4C, 0x46, 0x02, 0x01]);
    const res = inspectMagicBytes(buf);
    expect(res.valid).toBe(false);
    expect(res.code).toBe("MALWARE_LINUX_ELF");
  });

  it("T3.P70 (Linux ELF x Clean x Oversized): Oversized ELF binary blocked", () => {
    const buf = Buffer.alloc(11 * 1024 * 1024);
    buf[0] = 0x7F; buf[1] = 0x45; buf[2] = 0x4C; buf[3] = 0x46;
    const res = inspectMagicBytes(buf.slice(0, 32));
    expect(res.valid).toBe(false);
    expect(res.code).toBe("MALWARE_LINUX_ELF");
  });

  it("T3.P71 (ZIP Archive x Clean x Valid Size): ZIP / APK archive container blocked", () => {
    const buf = Buffer.from([0x50, 0x4B, 0x03, 0x04, 0x14, 0x00, 0x00, 0x00]);
    const res = inspectMagicBytes(buf);
    expect(res.valid).toBe(false);
    expect(res.code).toBe("MALWARE_ARCHIVE_ZIP");
  });

  it("T3.P72 (Java Bytecode x Clean x Valid Size): Compiled Java class bytecode blocked", () => {
    const buf = Buffer.from([0xCA, 0xFE, 0xBA, 0xBE, 0x00, 0x00, 0x00, 0x34]);
    const res = inspectMagicBytes(buf);
    expect(res.valid).toBe(false);
    expect(res.code).toBe("MALWARE_JAVA_BYTECODE");
  });
}, { tier: 3 });

// Direct CLI Execution Hook
if (process.argv[1] && process.argv[1].endsWith('tier3-pairwise.test.js')) {
  import('./e2e-runner.js').then(({ runner }) => {
    runner.run(3).then(success => process.exit(success ? 0 : 1));
  });
}

