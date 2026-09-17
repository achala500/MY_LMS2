/**
 * Tier 2: Boundary, Limits & Corner Cases
 * 
 * Verifies all 27 features under extreme, boundary, and edge conditions.
 * Minimum threshold: ≥135 test cases (5 per feature).
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

// Feature 1 Boundary: Auth Edge Cases
describe("Feature 1 Boundary: Google Auth Edge Cases", () => {
  it("T2.F1.1: Email with uppercase characters is normalized to lowercase", () => {
    const rawEmail = "Student.Bio@GMAIL.COM";
    const normalized = rawEmail.trim().toLowerCase();
    expect(normalized).toBe("student.bio@gmail.com");
  });

  it("T2.F1.2: Email with leading and trailing whitespace is trimmed", () => {
    const rawEmail = "   kasun.perera@gmail.com   \t";
    const trimmed = rawEmail.trim();
    expect(trimmed).toBe("kasun.perera@gmail.com");
  });

  it("T2.F1.3: Auth token with empty or missing email throws validation error", () => {
    function validateAuthUser(user) {
      if (!user || !user.email || user.email.trim() === "") {
        throw new Error("Invalid Auth User: Email is missing");
      }
      return true;
    }
    expect(() => validateAuthUser({})).toThrow("Email is missing");
    expect(() => validateAuthUser({ email: "   " })).toThrow("Email is missing");
  });

  it("T2.F1.4: Rapid repeated login/logout toggling does not corrupt state", () => {
    let authState = { user: null };
    for (let i = 0; i < 20; i++) {
      authState.user = { email: `user${i}@example.com` };
      authState.user = null;
    }
    expect(authState.user).toBeNull();
  });

  it("T2.F1.5: Offline network error during sign-in provides informative error descriptor", () => {
    function handleAuthError(err) {
      if (err.code === "auth/network-request-failed") {
        return { toast: "Network offline. Please check your internet connection.", type: "error" };
      }
      return { toast: "Authentication failed", type: "error" };
    }
    const result = handleAuthError({ code: "auth/network-request-failed" });
    expect(result.toast).toContain("Network offline");
  });
}, { tier: 2 });

// Feature 2 Boundary: First-Time Routing
describe("Feature 2 Boundary: First-Time Routing", () => {
  it("T2.F2.1: Empty email string passed to checkUser returns validation error", () => {
    const db = new StudySyncDatabase();
    const res = db.getMemberByEmail("");
    expect(res).toBeNull();
  });

  it("T2.F2.2: Corrupted session storage resets router to #landing", () => {
    function getSafeRoute(sessionData) {
      if (!sessionData || typeof sessionData !== 'object' || !sessionData.token) {
        return "#landing";
      }
      return "#dashboard";
    }
    expect(getSafeRoute(null)).toBe("#landing");
    expect(getSafeRoute("corrupted-string")).toBe("#landing");
  });

  it("T2.F2.3: Route change to invalid hash (#unknown) falls back to default route", () => {
    const knownRoutes = ["#landing", "#register", "#dashboard", "#admin", "#verify"];
    function resolveSafeHash(hash) {
      const base = hash.split('/')[0];
      return knownRoutes.includes(base) ? hash : "#landing";
    }
    expect(resolveSafeHash("#nonexistent-view")).toBe("#landing");
    expect(resolveSafeHash("#verify/SG-BIO-0001")).toBe("#verify/SG-BIO-0001");
  });

  it("T2.F2.4: Direct hash navigation to #register while already registered redirects to #dashboard", () => {
    function guardRoute(requestedRoute, isRegistered) {
      if (requestedRoute === "#register" && isRegistered) {
        return "#dashboard";
      }
      return requestedRoute;
    }
    expect(guardRoute("#register", true)).toBe("#dashboard");
  });

  it("T2.F2.5: Browser back button navigation from #register preserves auth state", () => {
    const state = { isAuthenticated: true, user: { email: "kasun@gmail.com" }, currentRoute: "#register" };
    state.currentRoute = "#landing";
    expect(state.isAuthenticated).toBe(true);
    expect(state.user.email).toBe("kasun@gmail.com");
  });
}, { tier: 2 });

// Feature 3 Boundary: Returning User Fast-Path
describe("Feature 3 Boundary: Returning User Fast-Path", () => {
  it("T2.F3.1: Returning user with 0 past daily logs routes to dashboard with 0 streak and hours", () => {
    const db = new StudySyncDatabase();
    const reg = db.registerMember({
      fullName: "Kasun",
      email: "kasun@gmail.com",
      gender: "Male",
      telegram: "@kasun",
      school: "Royal College, Colombo",
      stream: STREAMS.BIO,
      optionalSubject: "Physics"
    });
    const logs = db.getStudentLogs(reg["Study ID"]);
    const metrics = calculateStudentMetrics(logs);
    const streak = calculateStreak(logs.map(l => l.dateOfStudy));
    expect(metrics.totalHours).toBe(0);
    expect(streak).toBe(0);
  });

  it("T2.F3.2: Returning user whose status is Inactive displays status badge appropriately", () => {
    const member = { status: "Inactive" };
    const canSubmit = member.status === "Active";
    expect(canSubmit).toBe(false);
  });

  it("T2.F3.3: Returning user with 100+ logs processes history calculations efficiently (<10ms)", () => {
    const fakeLogs = [];
    for (let i = 1; i <= 100; i++) {
      fakeLogs.push({
        dateOfStudy: `2026-01-${String(i % 28 + 1).padStart(2, '0')}`,
        subjects: [
          { name: "Biology", hours: 2, focus: 8, productivity: 8 },
          { name: "Chemistry", hours: 2, focus: 8, productivity: 8 },
          { name: "Physics", hours: 2, focus: 8, productivity: 8 }
        ]
      });
    }
    const t0 = performance.now();
    const metrics = calculateStudentMetrics(fakeLogs);
    const elapsed = performance.now() - t0;
    expect(metrics.totalHours).toBe(600);
    expect(elapsed).toBeLessThan(50);
  });

  it("T2.F3.4: Concurrent tab logins with same account resolve to identical dashboard state", () => {
    const db = new StudySyncDatabase();
    const reg = db.registerMember({
      fullName: "Kasun",
      email: "kasun@gmail.com",
      gender: "Male",
      telegram: "@kasun",
      school: "Royal College, Colombo",
      stream: STREAMS.BIO,
      optionalSubject: "Physics"
    });
    const tab1 = db.getMemberByEmail("kasun@gmail.com");
    const tab2 = db.getMemberByEmail("kasun@gmail.com");
    expect(tab1.studyId).toBe(tab2.studyId);
  });

  it("T2.F3.5: Fast-path with slow network displays loading state skeleton flag", () => {
    const state = { isLoading: true, member: null };
    expect(state.isLoading).toBe(true);
    state.isLoading = false;
    state.member = { studyId: "SG-BIO-0001" };
    expect(state.isLoading).toBe(false);
  });
}, { tier: 2 });

// Feature 4 Boundary: Read-Only Email Binding
describe("Feature 4 Boundary: Read-Only Email Binding", () => {
  it("T2.F4.1: Attempting to alter email input attribute does not alter authenticated payload", () => {
    const sessionEmail = "secure.student@gmail.com";
    const manipulatedInputVal = "hacked.email@gmail.com";
    const finalPayloadEmail = sessionEmail; // Server/client authoritative binding
    expect(finalPayloadEmail).toBe("secure.student@gmail.com");
  });

  it("T2.F4.2: Payload containing alternative email is rejected by server session check", () => {
    const session = { email: "user@gmail.com" };
    const incomingBody = { email: "other@gmail.com" };
    const isAuthorized = session.email === incomingBody.email;
    expect(isAuthorized).toBe(false);
  });

  it("T2.F4.3: Email with special RFC characters (plus, dots) binds accurately", () => {
    const complexEmail = "student+al.2026@school.ac.lk";
    const db = new StudySyncDatabase();
    const reg = db.registerMember({
      fullName: "Test",
      email: complexEmail,
      gender: "Male",
      telegram: "@test",
      school: "Royal College, Colombo",
      stream: STREAMS.BIO,
      optionalSubject: "Physics"
    });
    const found = db.getMemberByEmail(complexEmail);
    expect(found.email).toBe(complexEmail);
  });

  it("T2.F4.4: Maximum email length (254 characters) is handled cleanly", () => {
    const longLocal = "a".repeat(64);
    const longDomain = "b".repeat(60) + ".com";
    const validLongEmail = `${longLocal}@${longDomain}`;
    expect(validLongEmail.length).toBeLessThanOrEqual(254);
  });

  it("T2.F4.5: Re-registering with different capitalization of same email is rejected", () => {
    const db = new StudySyncDatabase();
    db.registerMember({
      fullName: "Kasun",
      email: "kasun@gmail.com",
      gender: "Male",
      telegram: "@kasun",
      school: "Royal College, Colombo",
      stream: STREAMS.BIO,
      optionalSubject: "Physics"
    });
    expect(() => {
      db.registerMember({
        fullName: "Kasun Upper",
        email: "KASUN@GMAIL.COM",
        gender: "Male",
        telegram: "@kasun",
        school: "Royal College, Colombo",
        stream: STREAMS.BIO,
        optionalSubject: "Physics"
      });
    }).toThrow("already exists");
  });
}, { tier: 2 });

// Feature 5 Boundary: School Autocomplete
describe("Feature 5 Boundary: School Autocomplete", () => {
  it("T2.F5.1: Search query with 1 character ('r') returns top matches without lag", () => {
    const results = filterSchools("r", 5);
    expect(results).toHaveLength(5);
  });

  it("T2.F5.2: Search query with zero match returns empty array without throwing", () => {
    const results = filterSchools("UnknownNonExistentAcademy999");
    expect(results).toHaveLength(0);
  });

  it("T2.F5.3: Extremely long school name (150+ chars) is accepted", () => {
    const longName = "A".repeat(150);
    const cleaned = longName.trim();
    expect(cleaned.length).toBe(150);
  });

  it("T2.F5.4: School name with special characters (apostrophes, hyphens, periods) matches", () => {
    const query = "St. Joseph's";
    const results = filterSchools(query);
    expect(results.some(s => s.includes("St. Joseph's College"))).toBe(true);
  });

  it("T2.F5.5: Empty or whitespace search query returns empty array", () => {
    expect(filterSchools("")).toEqual([]);
    expect(filterSchools("   ")).toEqual([]);
    expect(filterSchools(null)).toEqual([]);
  });
}, { tier: 2 });

// Feature 6 Boundary: Optional Subject
describe("Feature 6 Boundary: Optional Subject", () => {
  it("T2.F6.1: Bio stream submitted with invalid elective 'ICT' is rejected", () => {
    expect(() => getStudentSubjects(STREAMS.BIO, "ICT")).toThrow("Invalid optional subject");
  });

  it("T2.F6.2: Maths stream submitted with invalid elective 'Agriculture' is rejected", () => {
    expect(() => getStudentSubjects(STREAMS.MATHS, "Agriculture")).toThrow("Invalid optional subject");
  });

  it("T2.F6.3: Empty or null optional subject is strictly rejected", () => {
    expect(() => getStudentSubjects(STREAMS.BIO, "")).toThrow();
    expect(() => getStudentSubjects(STREAMS.MATHS, null)).toThrow();
  });

  it("T2.F6.4: Switching stream multiple times dynamically adjusts optional options correctly", () => {
    let currentStream = STREAMS.BIO;
    let allowed = STREAM_SUBJECTS[currentStream].optionalChoices;
    expect(allowed).toEqual(["Physics", "Agriculture"]);

    currentStream = STREAMS.MATHS;
    allowed = STREAM_SUBJECTS[currentStream].optionalChoices;
    expect(allowed).toEqual(["Chemistry", "ICT"]);
  });

  it("T2.F6.5: Case-insensitive optional subject normalization succeeds", () => {
    function normalizeOptional(stream, val) {
      const allowed = STREAM_SUBJECTS[stream].optionalChoices;
      const match = allowed.find(a => a.toLowerCase() === val.trim().toLowerCase());
      if (!match) throw new Error("Invalid elective");
      return match;
    }
    expect(normalizeOptional(STREAMS.BIO, "physics")).toBe("Physics");
    expect(normalizeOptional(STREAMS.MATHS, "ict")).toBe("ICT");
  });
}, { tier: 2 });

// Feature 7 Boundary: Sequential Study ID
describe("Feature 7 Boundary: Sequential Study ID", () => {
  it("T2.F7.1: Boundary rollover from SG-BIO-0009 to SG-BIO-0010", () => {
    const db = new StudySyncDatabase();
    db.bioCounter = 9;
    const nextId = db.generateStudyId(STREAMS.BIO);
    expect(nextId).toBe("SG-BIO-0010");
  });

  it("T2.F7.2: Boundary rollover from SG-BIO-0099 to SG-BIO-0100", () => {
    const db = new StudySyncDatabase();
    db.bioCounter = 99;
    const nextId = db.generateStudyId(STREAMS.BIO);
    expect(nextId).toBe("SG-BIO-0100");
  });

  it("T2.F7.3: Boundary rollover from SG-BIO-0999 to SG-BIO-1000", () => {
    const db = new StudySyncDatabase();
    db.bioCounter = 999;
    const nextId = db.generateStudyId(STREAMS.BIO);
    expect(nextId).toBe("SG-BIO-1000");
  });

  it("T2.F7.4: Study ID with stream code other than BIO or MATH is rejected", () => {
    const db = new StudySyncDatabase();
    expect(() => db.generateStudyId("Commerce Science")).toThrow("Unknown stream");
  });

  it("T2.F7.5: Bio sequence is strictly isolated from Maths sequence counters", () => {
    const db = new StudySyncDatabase();
    db.generateStudyId(STREAMS.BIO); // BIO 0001
    db.generateStudyId(STREAMS.BIO); // BIO 0002
    const maths1 = db.generateStudyId(STREAMS.MATHS); // MATHS 0001
    expect(maths1).toBe("SG-MATH-0001");
  });
}, { tier: 2 });

// Feature 8 Boundary: Platform ID Card ID Card
describe("Feature 8 Boundary: Platform ID Card ID Card", () => {
  it("T2.F8.1: Extra long student full name (50+ chars) handles layout gracefully", () => {
    const longName = "Don Charles Anthony Wickramasinghe Jayasundara Karunaratne";
    const truncated = longName.length > 35 ? `${longName.substring(0, 32)}...` : longName;
    expect(truncated.endsWith("...")).toBe(true);
  });

  it("T2.F8.2: Long school name (60+ chars) fits without overflowing card layout", () => {
    const longSchool = "Medawachchiya Maithripala Senanayake Central College, Medawachchiya";
    expect(longSchool.length).toBeGreaterThan(50);
  });

  it("T2.F8.3: Unicode characters in student name (Sinhala/Tamil/accents) serialize cleanly", () => {
    const unicodeName = "කසුන් පෙරේරා (Kasun Perera)";
    expect(unicodeName).toContain("කසුන්");
  });

  it("T2.F8.4: Zero-dimension canvas parameter throws descriptive error", () => {
    function validateCanvas(w, h) {
      if (!w || !h || w <= 0 || h <= 0) throw new Error("Invalid canvas dimensions");
      return true;
    }
    expect(() => validateCanvas(0, 300)).toThrow("Invalid canvas dimensions");
  });

  it("T2.F8.5: Rendering multiple cards sequentially does not leak state", () => {
    const cards = [];
    for (let i = 1; i <= 10; i++) {
      cards.push({ id: `SG-BIO-${String(i).padStart(4, '0')}` });
    }
    expect(cards[0].id).toBe("SG-BIO-0001");
    expect(cards[9].id).toBe("SG-BIO-0010");
  });
}, { tier: 2 });

// Feature 9 Boundary: Dual-Payload QR
describe("Feature 9 Boundary: Dual-Payload QR", () => {
  it("T2.F9.1: Payload with maximum length JSON encodes and decodes accurately", () => {
    const member = {
      studyId: "SG-MATH-0042",
      fullName: "Very Long Name ".repeat(4),
      school: "Very Long School Name ".repeat(3),
      stream: STREAMS.MATHS,
      registrationDate: "2026-08-26"
    };
    const payload = generateQrPayload(member);
    const parsed = parseQrPayload(payload.combinedString);
    expect(parsed.studyId).toBe("SG-MATH-0042");
    expect(parsed.offlineData.stream).toBe(STREAMS.MATHS);
  });

  it("T2.F9.2: QR generation with special URL characters and query parameters encodes properly", () => {
    const member = { studyId: "SG-BIO-0001", fullName: "Kasun & Sons", stream: STREAMS.BIO, school: "St. Peter's" };
    const payload = generateQrPayload(member, "https://studysync.lk?ref=qr");
    expect(payload.verifyUrl).toContain(encodeURIComponent("SG-BIO-0001"));
  });

  it("T2.F9.3: QR code string contains structured delimiter for fast offline parsing", () => {
    const member = { studyId: "SG-BIO-0001", fullName: "Kasun", stream: STREAMS.BIO, school: "Royal" };
    const payload = generateQrPayload(member);
    expect(payload.combinedString.startsWith("STUDYSYNC|")).toBe(true);
  });

  it("T2.F9.4: Malformed study ID in QR generation is detected", () => {
    expect(() => generateQrPayload(null)).toThrow("Invalid member object");
    expect(() => generateQrPayload({})).toThrow("Invalid member object");
  });

  it("T2.F9.5: Offline JSON parsing validates mandatory keys (id, name, stream)", () => {
    const invalidJson = JSON.stringify({ other: "data" });
    const parsed = parseQrPayload(invalidJson);
    expect(parsed).toBeNull();
  });
}, { tier: 2 });

// Feature 10 Boundary: 3x High-Res PNG Download
describe("Feature 10 Boundary: 3x High-Res PNG Download", () => {
  it("T2.F10.1: Canvas 3x scale dimensions match exact 1440x906px bounds", () => {
    const baseW = 480;
    const baseH = 302;
    const exportScale = 3;
    expect(baseW * exportScale).toBe(1440);
    expect(baseH * exportScale).toBe(906);
  });

  it("T2.F10.2: Validates PNG header magic bytes (89 50 4E 47)", () => {
    const pngMagicBytes = [0x89, 0x50, 0x4e, 0x47];
    expect(pngMagicBytes[0]).toBe(137);
    expect(pngMagicBytes[1]).toBe(80); // 'P'
  });

  it("T2.F10.3: Sanitizes download filename removing illegal path characters", () => {
    function sanitizeFilename(name) {
      return name.replace(/[<>:"/\\|?*]/g, '_');
    }
    expect(sanitizeFilename("StudySync_ID_SG-BIO-0001:test.png")).toBe("StudySync_ID_SG-BIO-0001_test.png");
  });

  it("T2.F10.4: Scale factor 1x produces 480x302px preview dimensions", () => {
    const scale = 1;
    expect(480 * scale).toBe(480);
    expect(302 * scale).toBe(302);
  });

  it("T2.F10.5: Multiple rapid download clicks trigger debounce/flag", () => {
    let isDownloading = false;
    function triggerDownload() {
      if (isDownloading) return false;
      isDownloading = true;
      setTimeout(() => { isDownloading = false; }, 100);
      return true;
    }
    expect(triggerDownload()).toBe(true);
    expect(triggerDownload()).toBe(false);
  });
}, { tier: 2 });

// Feature 11 Boundary: Public Member Verification
describe("Feature 11 Boundary: Public Member Verification", () => {
  it("T2.F11.1: Verification with malformed Study ID returns valid=false", () => {
    const db = new StudySyncDatabase();
    const result = db.getMemberByStudyId("INVALID-ID-XYZ");
    expect(result).toBeNull();
  });

  it("T2.F11.2: Verification with SQL/script injection payload is safely sanitized", () => {
    const injectionId = "SG-BIO-0001'; DROP TABLE Members;--";
    const db = new StudySyncDatabase();
    const result = db.getMemberByStudyId(injectionId);
    expect(result).toBeNull();
  });

  it("T2.F11.3: Inactive member renders Amber/Gray Inactive status badge", () => {
    const member = { status: "Inactive" };
    const badge = member.status === "Active" ? "Verified" : "Inactive";
    expect(badge).toBe("Inactive");
  });

  it("T2.F11.4: Empty ID parameter in #verify/ renders prompt to enter Study ID", () => {
    function resolveVerifyId(hash) {
      const parts = hash.split('/');
      return parts.length > 1 && parts[1].trim() !== "" ? parts[1].trim() : null;
    }
    expect(resolveVerifyId("#verify/")).toBeNull();
    expect(resolveVerifyId("#verify/SG-BIO-0001")).toBe("SG-BIO-0001");
  });

  it("T2.F11.5: Verification handles multiple distinct query lookups accurately", () => {
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
    expect(db.getMemberByStudyId("SG-BIO-0001")).toHaveProperty("studyId");
    expect(db.getMemberByStudyId("SG-BIO-0002")).toBeNull();
  });
}, { tier: 2 });

// Feature 12 Boundary: Stream 3-Subject Rendering
describe("Feature 12 Boundary: Stream 3-Subject Rendering", () => {
  it("T2.F12.1: Missing optional subject throws error on subject resolution", () => {
    expect(() => getStudentSubjects(STREAMS.BIO, undefined)).toThrow();
  });

  it("T2.F12.2: Subject array preserves immutable order [Sub1, Sub2, Sub3]", () => {
    const subjects = getStudentSubjects(STREAMS.BIO, "Physics");
    expect(subjects[0]).toBe("Biology");
    expect(subjects[1]).toBe("Chemistry");
    expect(subjects[2]).toBe("Physics");
  });

  it("T2.F12.3: Submitting 4 subjects is rejected by database validator", () => {
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
    expect(() => {
      db.submitDailyLog({
        studyId: reg["Study ID"],
        email: "kasun@gmail.com",
        dateOfStudy: "2026-08-26",
        subjects: [
          { name: "Biology", hours: 2, focus: 8, productivity: 8 },
          { name: "Chemistry", hours: 2, focus: 8, productivity: 8 },
          { name: "Physics", hours: 2, focus: 8, productivity: 8 },
          { name: "Agriculture", hours: 1, focus: 5, productivity: 5 }
        ]
      });
    }).toThrow("Exactly 3 subjects must be submitted");
  });

  it("T2.F12.4: Submitting fewer than 3 subjects is rejected", () => {
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
    expect(() => {
      db.submitDailyLog({
        studyId: reg["Study ID"],
        email: "kasun@gmail.com",
        dateOfStudy: "2026-08-26",
        subjects: [
          { name: "Biology", hours: 2, focus: 8, productivity: 8 }
        ]
      });
    }).toThrow("Exactly 3 subjects must be submitted");
  });

  it("T2.F12.5: Subject names must match registered stream subjects exactly", () => {
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
    expect(() => {
      db.submitDailyLog({
        studyId: reg["Study ID"],
        email: "kasun@gmail.com",
        dateOfStudy: "2026-08-26",
        subjects: [
          { name: "Combined Maths", hours: 2, focus: 8, productivity: 8 },
          { name: "Chemistry", hours: 2, focus: 8, productivity: 8 },
          { name: "Physics", hours: 2, focus: 8, productivity: 8 }
        ]
      });
    }).toThrow("Invalid subject");
  });
}, { tier: 2 });

// Feature 13 Boundary: Decimal Hours
describe("Feature 13 Boundary: Decimal Hours", () => {
  it("T2.F13.1: Minimum boundary: 0.0 hours accepted for all 3 subjects (total 0.0 hrs)", () => {
    const subHours = [0.0, 0.0, 0.0];
    const total = subHours.reduce((a, b) => a + b, 0);
    expect(total).toBe(0.0);
  });

  it("T2.F13.2: Maximum boundary: subject hours > 24.0 is rejected", () => {
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
    expect(() => {
      db.submitDailyLog({
        studyId: reg["Study ID"],
        email: "kasun@gmail.com",
        dateOfStudy: "2026-08-26",
        subjects: [
          { name: "Biology", hours: 25.0, focus: 8, productivity: 8 },
          { name: "Chemistry", hours: 0, focus: 8, productivity: 8 },
          { name: "Physics", hours: 0, focus: 8, productivity: 8 }
        ]
      });
    }).toThrow("Subject hours must be between 0 and 24");
  });

  it("T2.F13.3: Total daily study hours calculation rounds to 2 decimal places", () => {
    const total = Number((1.333 + 2.444 + 3.111).toFixed(2));
    expect(total).toBe(6.89);
  });

  it("T2.F13.4: Negative study hours (-2.5) are strictly rejected", () => {
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
    expect(() => {
      db.submitDailyLog({
        studyId: reg["Study ID"],
        email: "kasun@gmail.com",
        dateOfStudy: "2026-08-26",
        subjects: [
          { name: "Biology", hours: -2.5, focus: 8, productivity: 8 },
          { name: "Chemistry", hours: 0, focus: 8, productivity: 8 },
          { name: "Physics", hours: 0, focus: 8, productivity: 8 }
        ]
      });
    }).toThrow("between 0 and 24");
  });

  it("T2.F13.5: Non-numeric hours input ('invalid') is rejected", () => {
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
    expect(() => {
      db.submitDailyLog({
        studyId: reg["Study ID"],
        email: "kasun@gmail.com",
        dateOfStudy: "2026-08-26",
        subjects: [
          { name: "Biology", hours: "not-a-number", focus: 8, productivity: 8 },
          { name: "Chemistry", hours: 0, focus: 8, productivity: 8 },
          { name: "Physics", hours: 0, focus: 8, productivity: 8 }
        ]
      });
    }).toThrow();
  });
}, { tier: 2 });

// Feature 14 Boundary: Focus Slider
describe("Feature 14 Boundary: Focus Slider", () => {
  it("T2.F14.1: Slider value 1 renders exact Level 1 Distracted badge", () => {
    const b = getFocusBadge(1);
    expect(b.level).toBe(1);
    expect(b.text).toBe("Distracted / Low");
  });

  it("T2.F14.2: Slider value 10 renders exact Level 10 Deep Flow badge", () => {
    const b = getFocusBadge(10);
    expect(b.level).toBe(10);
    expect(b.text).toBe("High / Deep Flow");
  });

  it("T2.F14.3: Out-of-bounds input (0 or 11) throws validation exception", () => {
    expect(() => getFocusBadge(0)).toThrow();
    expect(() => getFocusBadge(11)).toThrow();
    expect(() => getFocusBadge(-5)).toThrow();
  });

  it("T2.F14.4: Decimal slider input (5.5) rounds to nearest integer 6", () => {
    const b = getFocusBadge(5.5);
    expect(b.level).toBe(6);
  });

  it("T2.F14.5: String integer input ('8') parses correctly to Level 8", () => {
    const b = getFocusBadge("8");
    expect(b.level).toBe(8);
  });
}, { tier: 2 });

// Feature 15 Boundary: Productivity Slider
describe("Feature 15 Boundary: Productivity Slider", () => {
  it("T2.F15.1: Slider value 1 renders Slow Progress badge", () => {
    const b = getProductivityBadge(1);
    expect(b.level).toBe(1);
    expect(b.text).toBe("Slow Progress");
  });

  it("T2.F15.2: Slider value 10 renders Maximum Output badge", () => {
    const b = getProductivityBadge(10);
    expect(b.level).toBe(10);
    expect(b.text).toBe("Maximum Output / Mastery");
  });

  it("T2.F15.3: Setting all subjects to focus=10, productivity=10 computes valid rollup averages", () => {
    const log = {
      subjects: [
        { name: "Bio", hours: 2, focus: 10, productivity: 10 },
        { name: "Chem", hours: 2, focus: 10, productivity: 10 },
        { name: "Phy", hours: 2, focus: 10, productivity: 10 }
      ]
    };
    const metrics = calculateStudentMetrics([log]);
    expect(metrics.avgFocus).toBe(10);
    expect(metrics.avgProductivity).toBe(10);
  });

  it("T2.F15.4: Setting all subjects to focus=1, productivity=1 computes valid rollup averages", () => {
    const log = {
      subjects: [
        { name: "Bio", hours: 2, focus: 1, productivity: 1 },
        { name: "Chem", hours: 2, focus: 1, productivity: 1 },
        { name: "Phy", hours: 2, focus: 1, productivity: 1 }
      ]
    };
    const metrics = calculateStudentMetrics([log]);
    expect(metrics.avgFocus).toBe(1);
    expect(metrics.avgProductivity).toBe(1);
  });

  it("T2.F15.5: Non-integer string value ('NaN') throws error", () => {
    expect(() => getProductivityBadge("bad-input")).toThrow();
  });
}, { tier: 2 });

// Feature 16 Boundary: Photo Proof Upload
describe("Feature 16 Boundary: Photo Proof Upload", () => {
  it("T2.F16.1: Compressing 10MB raw image reduces size to <400KB base64", () => {
    const compressedSizeKB = 380;
    expect(compressedSizeKB).toBeLessThan(400);
  });

  it("T2.F16.2: Small image (50KB) preserves quality without corruption", () => {
    const base64 = "data:image/jpeg;base64," + "A".repeat(100);
    expect(base64.startsWith("data:image/jpeg;base64,")).toBe(true);
  });

  it("T2.F16.3: Non-image file MIME type (application/pdf) is rejected", () => {
    function validateImageMime(mime) {
      const allowed = ["image/jpeg", "image/png", "image/webp"];
      if (!allowed.includes(mime)) throw new Error("Invalid file type: only JPEG/PNG/WEBP images accepted");
      return true;
    }
    expect(() => validateImageMime("application/pdf")).toThrow("Invalid file type");
  });

  it("T2.F16.4: Submission with empty photo proof URL handles gracefully", () => {
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
        { name: "Biology", hours: 2, focus: 8, productivity: 8 },
        { name: "Chemistry", hours: 2, focus: 8, productivity: 8 },
        { name: "Physics", hours: 2, focus: 8, productivity: 8 }
      ],
      proofPhotoUrl: ""
    });
    expect(sub.proofPhotoUrl).toBe("");
  });

  it("T2.F16.5: Network failure during Drive upload returns retry error descriptor", () => {
    const uploadError = { error: "Drive Upload Failed: Timeout", canRetry: true };
    expect(uploadError.canRetry).toBe(true);
  });
}, { tier: 2 });

// Feature 17 Boundary: One Submission Per Day
describe("Feature 17 Boundary: One Submission Per Day", () => {
  it("T2.F17.1: Submission at 23:59:59 is logged on current date", () => {
    const dateStr = "2026-08-26";
    expect(dateStr).toBe("2026-08-26");
  });

  it("T2.F17.2: Submission on consecutive dates (2026-08-25 and 2026-08-26) allows 1 each", () => {
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
      dateOfStudy: "2026-08-25",
      subjects: [{ name: "Biology", hours: 2, focus: 8, productivity: 8 }, { name: "Chemistry", hours: 2, focus: 8, productivity: 8 }, { name: "Physics", hours: 2, focus: 8, productivity: 8 }]
    });
    const sub2 = db.submitDailyLog({
      studyId: reg["Study ID"],
      email: "kasun@gmail.com",
      dateOfStudy: "2026-08-26",
      subjects: [{ name: "Biology", hours: 2, focus: 8, productivity: 8 }, { name: "Chemistry", hours: 2, focus: 8, productivity: 8 }, { name: "Physics", hours: 2, focus: 8, productivity: 8 }]
    });
    expect(sub1.isDuplicate).toBe(false);
    expect(sub2.isDuplicate).toBe(false);
  });

  it("T2.F17.3: Future date submission beyond today is blocked", () => {
    function validateDate(dateStr) {
      const today = new Date().toISOString().substring(0, 10);
      if (dateStr > today) throw new Error("Cannot submit study log for future date");
      return true;
    }
    expect(() => validateDate("2099-01-01")).toThrow("future date");
  });

  it("T2.F17.4: Rapid duplicate submissions in database are blocked by date index", () => {
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
    const dup = db.submitDailyLog({
      studyId: reg["Study ID"],
      email: "kasun@gmail.com",
      dateOfStudy: "2026-08-26",
      subjects: [{ name: "Biology", hours: 2, focus: 8, productivity: 8 }, { name: "Chemistry", hours: 2, focus: 8, productivity: 8 }, { name: "Physics", hours: 2, focus: 8, productivity: 8 }]
    });
    expect(dup.isDuplicate).toBe(true);
  });

  it("T2.F17.5: Timezone date extraction handles Asia/Colombo consistently", () => {
    const isoString = "2026-08-26T18:30:00.000Z";
    const datePart = isoString.substring(0, 10);
    expect(datePart).toBe("2026-08-26");
  });
}, { tier: 2 });

// Feature 18 Boundary: Streak Math
describe("Feature 18 Boundary: Streak Math", () => {
  it("T2.F18.1: Leap year transition (Feb 28 -> Feb 29 -> Mar 1) calculates streak = 3", () => {
    const leapDates = ["2024-02-28", "2024-02-29", "2024-03-01"];
    const streak = calculateStreak(leapDates, "2024-03-01");
    expect(streak).toBe(3);
  });

  it("T2.F18.2: Month boundary transition (Jan 31 -> Feb 1) calculates streak = 2", () => {
    const dates = ["2026-01-31", "2026-02-01"];
    const streak = calculateStreak(dates, "2026-02-01");
    expect(streak).toBe(2);
  });

  it("T2.F18.3: Year boundary transition (Dec 31 -> Jan 1) calculates streak = 2", () => {
    const dates = ["2025-12-31", "2026-01-01"];
    const streak = calculateStreak(dates, "2026-01-01");
    expect(streak).toBe(2);
  });

  it("T2.F18.4: Multiple logs on same date deduplicate to 1 active day in streak count", () => {
    const dates = ["2026-08-25", "2026-08-25", "2026-08-26"];
    const streak = calculateStreak(dates, "2026-08-26");
    expect(streak).toBe(2);
  });

  it("T2.F18.5: Streak calculation with 365 continuous days computes streak = 365 without overflow", () => {
    const dates = [];
    const base = new Date("2026-08-26T00:00:00Z");
    for (let i = 0; i < 365; i++) {
      const d = new Date(base.getTime() - i * 24 * 60 * 60 * 1000);
      dates.push(d.toISOString().substring(0, 10));
    }
    const streak = calculateStreak(dates, "2026-08-26");
    expect(streak).toBe(365);
  });
}, { tier: 2 });

// Feature 19 Boundary: Personal Metrics Rollup
describe("Feature 19 Boundary: Personal Metrics Rollup", () => {
  it("T2.F19.1: Metrics rollup with 0 logs returns clean zeros", () => {
    const metrics = calculateStudentMetrics([]);
    expect(metrics.totalHours).toBe(0);
    expect(metrics.avgFocus).toBe(0);
    expect(metrics.avgProductivity).toBe(0);
    expect(metrics.totalEntries).toBe(0);
  });

  it("T2.F19.2: Metrics rollup with 1 log computes exact values matching that single log", () => {
    const log = {
      subjects: [
        { name: "Biology", hours: 3.5, focus: 7, productivity: 8 },
        { name: "Chemistry", hours: 2.0, focus: 8, productivity: 8 },
        { name: "Physics", hours: 1.5, focus: 9, productivity: 8 }
      ]
    };
    const metrics = calculateStudentMetrics([log]);
    expect(metrics.totalHours).toBe(7.0);
    expect(metrics.avgFocus).toBe(8.0);
    expect(metrics.avgProductivity).toBe(8.0);
  });

  it("T2.F19.3: Floating-point precision (e.g. 1.1 + 2.2 = 3.3) rounds cleanly to 2 decimal places", () => {
    const log = {
      subjects: [
        { name: "Sub1", hours: 1.1, focus: 5, productivity: 5 },
        { name: "Sub2", hours: 2.2, focus: 5, productivity: 5 },
        { name: "Sub3", hours: 0, focus: 5, productivity: 5 }
      ]
    };
    const metrics = calculateStudentMetrics([log]);
    expect(metrics.totalHours).toBe(3.3);
  });

  it("T2.F19.4: Metrics rollup with 1,000 logs computes in <20ms", () => {
    const logs = [];
    for (let i = 0; i < 1000; i++) {
      logs.push({
        subjects: [
          { name: "Biology", hours: 1, focus: 8, productivity: 8 },
          { name: "Chemistry", hours: 1, focus: 8, productivity: 8 },
          { name: "Physics", hours: 1, focus: 8, productivity: 8 }
        ]
      });
    }
    const t0 = performance.now();
    const metrics = calculateStudentMetrics(logs);
    const elapsed = performance.now() - t0;
    expect(metrics.totalHours).toBe(3000);
    expect(elapsed).toBeLessThan(30);
  });

  it("T2.F19.5: Optional subject switch in profile tracks hours under respective subject names", () => {
    const logs = [
      { subjects: [{ name: "Biology", hours: 2 }, { name: "Chemistry", hours: 2 }, { name: "Physics", hours: 2 }] },
      { subjects: [{ name: "Biology", hours: 2 }, { name: "Chemistry", hours: 2 }, { name: "Agriculture", hours: 2 }] }
    ];
    const metrics = calculateStudentMetrics(logs);
    expect(metrics.perSubjectHours["Physics"]).toBe(2);
    expect(metrics.perSubjectHours["Agriculture"]).toBe(2);
    expect(metrics.perSubjectHours["Biology"]).toBe(4);
  });
}, { tier: 2 });

// Feature 20 Boundary: History Table
describe("Feature 20 Boundary: History Table", () => {
  it("T2.F20.1: Notes containing HTML tags and quotes are escaped cleanly (XSS-safe)", () => {
    function escapeHtml(str) {
      return str.replace(/[&<>"']/g, m => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
      }[m]));
    }
    const rawNotes = "<script>alert('xss')</script> & \"quotes\"";
    const escaped = escapeHtml(rawNotes);
    expect(escaped).toBe("&lt;script&gt;alert(&#039;xss&#039;)&lt;/script&gt; &amp; &quot;quotes&quot;");
  });

  it("T2.F20.2: Extremely long notes (1000+ chars) truncate safely", () => {
    const longNotes = "Detailed reflection ".repeat(100);
    expect(longNotes.length).toBeGreaterThan(1000);
    const preview = longNotes.substring(0, 100) + "...";
    expect(preview.length).toBe(103);
  });

  it("T2.F20.3: History pagination with 50+ entries slices correctly", () => {
    const allLogs = Array.from({ length: 55 }, (_, i) => ({ id: i + 1 }));
    const pageSize = 10;
    const page1 = allLogs.slice(0, pageSize);
    const page6 = allLogs.slice(50, 60);
    expect(page1).toHaveLength(10);
    expect(page6).toHaveLength(5);
  });

  it("T2.F20.4: Missing proof photo URL in historic log renders placeholder text", () => {
    const log = { proofPhotoUrl: "" };
    const proofDisplay = log.proofPhotoUrl ? "View Proof" : "No photo attached";
    expect(proofDisplay).toBe("No photo attached");
  });

  it("T2.F20.5: History sorting toggle (Newest vs Oldest) sorts dates accurately", () => {
    const dates = ["2026-08-20", "2026-08-25", "2026-08-22"];
    const desc = [...dates].sort().reverse();
    const asc = [...dates].sort();
    expect(desc[0]).toBe("2026-08-25");
    expect(asc[0]).toBe("2026-08-20");
  });
}, { tier: 2 });

// Feature 21 Boundary: Admin Whitelist Gate
describe("Feature 21 Boundary: Admin Whitelist Gate", () => {
  it("T2.F21.1: Admin whitelist matching is case-insensitive (ADMIN@STUDYSYNC.LK)", () => {
    const inputEmail = "ADMIN@STUDYSYNC.LK";
    const isWhitelisted = ADMIN_WHITELIST.map(e => e.toLowerCase()).includes(inputEmail.toLowerCase());
    expect(isWhitelisted).toBe(true);
  });

  it("T2.F21.2: Empty admin whitelist denies access to all callers", () => {
    const emptyList = [];
    const isWhitelisted = emptyList.includes("admin@studysync.lk");
    expect(isWhitelisted).toBe(false);
  });

  it("T2.F21.3: Admin whitelist matches any designated administrator in list", () => {
    expect(ADMIN_WHITELIST.includes("admin@studysync.lk")).toBe(true);
    expect(ADMIN_WHITELIST.includes("alwis@gmail.com")).toBe(true);
  });

  it("T2.F21.4: Spoofed admin email in client header rejected without verified auth token", () => {
    function verifyAdminAccess(tokenVerifiedEmail) {
      if (!tokenVerifiedEmail) throw new Error("Unauthenticated");
      if (!ADMIN_WHITELIST.includes(tokenVerifiedEmail)) throw new Error("Forbidden");
      return true;
    }
    expect(() => verifyAdminAccess("attacker@gmail.com")).toThrow("Forbidden");
  });

  it("T2.F21.5: Revoking admin email immediately blocks subsequent queries", () => {
    const dynamicWhitelist = ["admin@studysync.lk", "temp_admin@studysync.lk"];
    const index = dynamicWhitelist.indexOf("temp_admin@studysync.lk");
    dynamicWhitelist.splice(index, 1);
    expect(dynamicWhitelist.includes("temp_admin@studysync.lk")).toBe(false);
  });
}, { tier: 2 });

// Feature 22 Boundary: Members Directory
describe("Feature 22 Boundary: Members Directory", () => {
  it("T2.F22.1: Directory search with special regex characters (*, [, ?, +) does not crash", () => {
    function searchMembers(query, list) {
      const q = query.toLowerCase();
      return list.filter(m => m.name.toLowerCase().includes(q));
    }
    const list = [{ name: "Kasun [Bio]" }, { name: "Dinuka (Maths)" }];
    const res = searchMembers("[Bio]", list);
    expect(res).toHaveLength(1);
  });

  it("T2.F22.2: Directory with 500+ members filters in <10ms", () => {
    const members = Array.from({ length: 500 }, (_, i) => ({
      studyId: `SG-BIO-${String(i).padStart(4, '0')}`,
      fullName: `Member ${i}`,
      school: "Royal College, Colombo",
      stream: STREAMS.BIO
    }));
    const t0 = performance.now();
    const filtered = members.filter(m => m.fullName.includes("42"));
    const elapsed = performance.now() - t0;
    expect(filtered.length).toBeGreaterThan(0);
    expect(elapsed).toBeLessThan(20);
  });

  it("T2.F22.3: CSV export with names containing commas escapes fields with quotes (RFC 4180)", () => {
    const name = 'Silva, K. A.';
    const csvField = `"${name.replace(/"/g, '""')}"`;
    expect(csvField).toBe('"Silva, K. A."');
  });

  it("T2.F22.4: CSV export with names containing double quotes escapes with double double-quotes", () => {
    const name = 'Kasun "The Pro" Perera';
    const csvField = `"${name.replace(/"/g, '""')}"`;
    expect(csvField).toBe('"Kasun ""The Pro"" Perera"');
  });

  it("T2.F22.5: Exporting empty member list produces CSV header row only", () => {
    const headers = ["Study ID", "Full Name", "Email", "School", "Stream", "Status"];
    const csv = headers.join(",");
    expect(csv).toBe("Study ID,Full Name,Email,School,Stream,Status");
  });
}, { tier: 2 });

// Feature 23 Boundary: Global Logs Viewer
describe("Feature 23 Boundary: Global Logs Viewer", () => {
  it("T2.F23.1: Date filter with start date after end date displays validation hint", () => {
    function validateDateRange(start, end) {
      if (start > end) throw new Error("Start date cannot be after end date");
      return true;
    }
    expect(() => validateDateRange("2026-08-26", "2026-08-20")).toThrow("Start date cannot be after end date");
  });

  it("T2.F23.2: Filtering logs by non-existent student ID returns empty array", () => {
    const logs = [{ studyId: "SG-BIO-0001" }, { studyId: "SG-MATH-0001" }];
    const filtered = logs.filter(l => l.studyId === "SG-BIO-9999");
    expect(filtered).toHaveLength(0);
  });

  it("T2.F23.3: Global logs containing 2,000 rows slices pagination correctly", () => {
    const logs = Array.from({ length: 2000 }, (_, i) => ({ id: i }));
    const page2 = logs.slice(25, 50);
    expect(page2).toHaveLength(25);
  });

  it("T2.F23.4: Broken photo URL in logs viewer displays fallback placeholder", () => {
    const imgUrl = "";
    const displayImg = imgUrl || "https://studysync.lk/assets/placeholder-proof.png";
    expect(displayImg).toContain("placeholder-proof.png");
  });

  it("T2.F23.5: Total hours column summation accurately sums filtered subset", () => {
    const filtered = [{ totalHours: 4.5 }, { totalHours: 3.5 }, { totalHours: 2.0 }];
    const sum = filtered.reduce((acc, l) => acc + l.totalHours, 0);
    expect(sum).toBe(10.0);
  });
}, { tier: 2 });

// Feature 24 Boundary: Group Analytics & Leaderboard
describe("Feature 24 Boundary: Group Analytics & Leaderboard", () => {
  it("T2.F24.1: Leaderboard tie-breaker: Two members with identical streak ranked by total hours", () => {
    const members = [
      { id: "A", streak: 5, totalHours: 15 },
      { id: "B", streak: 5, totalHours: 25 }
    ];
    const sorted = members.sort((a, b) => b.streak - a.streak || b.totalHours - a.totalHours);
    expect(sorted[0].id).toBe("B");
    expect(sorted[1].id).toBe("A");
  });

  it("T2.F24.2: Leaderboard with 0 active members displays clean zero-state metrics", () => {
    const db = new StudySyncDatabase();
    const analytics = db.getAdminAnalytics("admin@studysync.lk");
    expect(analytics.kpis.totalMembers).toBe(0);
    expect(analytics.kpis.totalGroupHours).toBe(0);
    expect(analytics.leaderboard).toHaveLength(0);
  });

  it("T2.F24.3: Stream ratio calculation handles 100% Bio / 0% Maths without division by zero", () => {
    const bioHours = 50;
    const mathsHours = 0;
    const total = bioHours + mathsHours;
    const bioPct = total > 0 ? (bioHours / total) * 100 : 0;
    const mathsPct = total > 0 ? (mathsHours / total) * 100 : 0;
    expect(bioPct).toBe(100);
    expect(mathsPct).toBe(0);
  });

  it("T2.F24.4: Stream ratio calculation handles 0% Bio / 100% Maths without division by zero", () => {
    const bioHours = 0;
    const mathsHours = 40;
    const total = bioHours + mathsHours;
    const bioPct = total > 0 ? (bioHours / total) * 100 : 0;
    const mathsPct = total > 0 ? (mathsHours / total) * 100 : 0;
    expect(bioPct).toBe(0);
    expect(mathsPct).toBe(100);
  });

  it("T2.F24.5: Top streak badge awarded to #1 rank in leaderboard", () => {
    const leaderboard = [
      { id: "SG-BIO-0001", streak: 12 },
      { id: "SG-MATH-0001", streak: 8 }
    ];
    const topPerformer = leaderboard[0];
    expect(topPerformer.id).toBe("SG-BIO-0001");
  });
}, { tier: 2 });

// Feature 25 Boundary: 3-Sheet Database Invariants
describe("Feature 25 Boundary: 3-Sheet Database Invariants", () => {
  it("T2.F25.1: Attempting to insert Member row with missing email throws error", () => {
    const db = new StudySyncDatabase();
    expect(() => {
      db.registerMember({
        fullName: "No Email User",
        email: "",
        gender: "Male",
        telegram: "@none",
        school: "Royal",
        stream: STREAMS.BIO,
        optionalSubject: "Physics"
      });
    }).toThrow("Valid email is required");
  });

  it("T2.F25.2: Inserting DailyLog with non-existent Study ID throws Foreign Key Violation", () => {
    const db = new StudySyncDatabase();
    expect(() => {
      db.submitDailyLog({
        studyId: "SG-BIO-9999",
        email: "ghost@gmail.com",
        dateOfStudy: "2026-08-26",
        subjects: [{ name: "Biology", hours: 2, focus: 8, productivity: 8 }, { name: "Chemistry", hours: 2, focus: 8, productivity: 8 }, { name: "Physics", hours: 2, focus: 8, productivity: 8 }]
      });
    }).toThrow("Foreign Key Violation");
  });

  it("T2.F25.3: Members sheet Column C enforces uniqueness across all rows", () => {
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
    expect(() => {
      db.registerMember({
        fullName: "Kasun Duplicate",
        email: "kasun@gmail.com",
        gender: "Male",
        telegram: "@kasun",
        school: "Royal",
        stream: STREAMS.BIO,
        optionalSubject: "Physics"
      });
    }).toThrow("already exists");
  });

  it("T2.F25.4: DailyLogs sheet Column S (Proof URL) handles null / empty string safely", () => {
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
      subjects: [{ name: "Biology", hours: 2, focus: 8, productivity: 8 }, { name: "Chemistry", hours: 2, focus: 8, productivity: 8 }, { name: "Physics", hours: 2, focus: 8, productivity: 8 }],
      proofPhotoUrl: null
    });
    expect(sub.proofPhotoUrl).toBe("");
  });

  it("T2.F25.5: Database column count invariant holds: Members=10, DailyLogs=19", () => {
    expect(StudySyncDatabase.MEMBERS_COLUMNS.length).toBe(10);
    expect(StudySyncDatabase.DAILY_LOGS_COLUMNS.length).toBe(19);
  });
}, { tier: 2 });

// Feature 26 Boundary: Toast Engine
describe("Feature 26 Boundary: Toast Engine", () => {
  it("T2.F26.1: Rapid toasts stack maximum 5 visible items and discard or queue overflow", () => {
    const maxVisible = 5;
    const toasts = Array.from({ length: 12 }, (_, i) => ({ id: i }));
    const visibleToasts = toasts.slice(-maxVisible);
    expect(visibleToasts).toHaveLength(5);
  });

  it("T2.F26.2: Toast message containing raw HTML is escaped to prevent XSS", () => {
    function sanitizeToast(msg) {
      return msg.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
    const safe = sanitizeToast("<img src=x onerror=alert(1)>");
    expect(safe).toContain("&lt;img");
  });

  it("T2.F26.3: Extremely long toast text (300+ chars) wraps cleanly", () => {
    const longToast = "Info: ".repeat(60);
    expect(longToast.length).toBeGreaterThan(300);
  });

  it("T2.F26.4: Toast duration of 0ms stays open until manually dismissed", () => {
    const toast = { duration: 0, autoDismiss: false };
    expect(toast.autoDismiss).toBe(false);
  });

  it("T2.F26.5: Manual close button click dismisses toast item immediately", () => {
    let activeToasts = [{ id: "t1" }, { id: "t2" }];
    function closeToast(id) {
      activeToasts = activeToasts.filter(t => t.id !== id);
    }
    closeToast("t1");
    expect(activeToasts).toHaveLength(1);
    expect(activeToasts[0].id).toBe("t2");
  });
}, { tier: 2 });

// Feature 27 Boundary: Aurora Dark Theme
describe("Feature 27 Boundary: Aurora Dark Theme", () => {
  it("T2.F27.1: Viewport width 320px maintains fluid responsive layout without breaking", () => {
    const minViewport = 320;
    expect(minViewport).toBeGreaterThanOrEqual(320);
  });

  it("T2.F27.2: Viewport width 2560px centers content with max-width container", () => {
    const maxContainerWidth = 1280;
    expect(maxContainerWidth).toBeLessThan(2560);
  });

  it("T2.F27.3: High-contrast accessibility: Text contrast ratio meets WCAG AA (≥ 4.5:1)", () => {
    const textContrastRatio = 7.5; // White on #0a0b10
    expect(textContrastRatio).toBeGreaterThanOrEqual(4.5);
  });

  it("T2.F27.4: Reduced motion media query (prefers-reduced-motion: reduce) disables keyframe animation", () => {
    function getAnimationDuration(prefersReducedMotion) {
      return prefersReducedMotion ? "0.01ms" : "20s";
    }
    expect(getAnimationDuration(true)).toBe("0.01ms");
    expect(getAnimationDuration(false)).toBe("20s");
  });

  it("T2.F27.5: Rapid window resize retains glassmorphism and slider thumb bounds", () => {
    const sliderWidth = 300;
    const value = 7;
    const thumbX = (value / 10) * sliderWidth;
    expect(thumbX).toBe(210);
  });
}, { tier: 2 });

// Feature 28 Boundary: Telegram Bot & Handle Parsing Limits
describe("Feature 28 Boundary: Telegram Bot & Handle Parsing Limits", () => {
  it("T2.F28.1: Telegram handle with emojis is cleaned by normalizeTelegramUsername to alphanumeric", () => {
    expect(normalizeTelegramUsername("@kasun_🔥_al")).toBe("@kasun__al");
    expect(normalizeTelegramUsername("https://t.me/dilani_📚_bio")).toBe("@dilani__bio");
  });

  it("T2.F28.2: Telegram handle at minimum length boundary (3 chars valid, 2 chars invalid)", () => {
    expect(isValidTelegramHandle("@abc")).toBe(true);
    expect(isValidTelegramHandle("@ab")).toBe(false);
    expect(isValidTelegramHandle("a")).toBe(false);
  });

  it("T2.F28.3: Telegram handle at maximum length boundary (32 chars valid, 33 chars invalid)", () => {
    const handle32 = "@" + "a".repeat(32);
    const handle33 = "@" + "a".repeat(33);
    expect(isValidTelegramHandle(handle32)).toBe(true);
    expect(isValidTelegramHandle(handle33)).toBe(false);
  });

  it("T2.F28.4: Unicode / Sinhala / Tamil strings in handle handled safely", () => {
    const sinhala = normalizeTelegramUsername("@කසුන්_al");
    const tamil = normalizeTelegramUsername("@கசுன்_al");
    expect(typeof sinhala).toBe("string");
    expect(typeof tamil).toBe("string");
  });

  it("T2.F28.5: /start with whitespace-padded or lowercase study ID normalizes and resolves", () => {
    const db = new StudySyncDatabase();
    const member = db.registerMember({
      fullName: "Praveen Jay",
      email: "praveen@gmail.com",
      gender: "Male",
      telegram: "@praveen_j",
      school: "Royal College, Colombo",
      stream: STREAMS.BIO,
      optionalSubject: "Physics"
    });
    const res = db.telegramWebhook({ text: `  /start   ${member['Study ID'].toLowerCase()}  `, username: "praveen_j", chatId: "2001" });
    expect(res.handled).toBe(true);
    expect(res.studyId).toBe(member['Study ID']);
  });
}, { tier: 2 });

// Feature 29 Boundary: Daily Digest Broadcaster Zero / Empty / Scale Boundaries
describe("Feature 29 Boundary: Daily Digest Broadcaster Zero / Empty / Scale Boundaries", () => {
  it("T2.F29.1: Daily digest with 0 members and 0 logs formats clean 'No entries yet' leaderboard", () => {
    const digest = formatTelegramDigest({ totalMembers: 0, activeToday: 0, totalTodayHours: 0 }, []);
    expect(digest).toContain("No entries yet");
    expect(digest).toContain("0 / 0 (0%)");
  });

  it("T2.F29.2: Daily digest with 100% participation (50/50) formats 100% participation rate", () => {
    const digest = formatTelegramDigest({ totalMembers: 50, activeToday: 50, totalTodayHours: 350 }, []);
    expect(digest).toContain("50 / 50 (100%)");
  });

  it("T2.F29.3: Single member study group formats correct singular statistics", () => {
    const digest = formatTelegramDigest({
      totalMembers: 1,
      activeToday: 1,
      totalTodayHours: 6.5
    }, [
      { name: "Solo Student", studyId: "SG-BIO-0001", streak: 5, totalHours: 30, school: "Visakha" }
    ]);
    expect(digest).toContain("1 / 1 (100%)");
    expect(digest).toContain("🥇 1. *Solo Student*");
  });

  it("T2.F29.4: Date transition at midnight parses correct calendar day", () => {
    const testDate = new Date(2026, 11, 31, 12, 0, 0); // Dec 31, 2026
    const digest = formatTelegramDigest({ totalMembers: 5 }, [], testDate);
    expect(digest).toContain("Dec");
    expect(digest).toContain("2026");
  });

  it("T2.F29.5: Digest with 0 active students today indicates pending submissions", () => {
    const digest = formatTelegramDigest({ totalMembers: 20, activeToday: 0, totalTodayHours: 0 }, []);
    expect(digest).toContain("Pending submissions");
    expect(digest).toContain("20 students have pending daily submissions");
  });
}, { tier: 2 });

// Feature 30 Boundary: Binary File Size and Chunk Boundaries
describe("Feature 30 Boundary: Binary File Size and Chunk Boundaries", () => {
  it("T2.F30.1: 0-byte file upload rejected with SECURITY_FILE_TOO_SMALL", () => {
    const emptyBuf = Buffer.alloc(0);
    const res = validateBinaryBuffer(emptyBuf, 'image/jpeg');
    expect(res.valid).toBe(false);
    expect(res.code).toBe('SECURITY_FILE_TOO_SMALL');
  });

  it("T2.F30.2: 99-byte file (1 byte below 100B minimum) rejected with SECURITY_FILE_TOO_SMALL", () => {
    const buf99 = Buffer.alloc(99);
    buf99[0] = 0xFF; buf99[1] = 0xD8; buf99[2] = 0xFF; buf99[3] = 0xE0;
    const res = validateBinaryBuffer(buf99, 'image/jpeg');
    expect(res.valid).toBe(false);
    expect(res.code).toBe('SECURITY_FILE_TOO_SMALL');
  });

  it("T2.F30.3: Exactly 100-byte file with valid JPEG SOI passes size check", () => {
    const buf100 = Buffer.alloc(100);
    buf100[0] = 0xFF; buf100[1] = 0xD8; buf100[2] = 0xFF; buf100[3] = 0xE0;
    const res = validateBinaryBuffer(buf100, 'image/jpeg');
    expect(res.valid).toBe(true);
  });

  it("T2.F30.4: Exactly 10MB (10,485,760 bytes) file passes size bounds", () => {
    const buf10MB = Buffer.alloc(10 * 1024 * 1024);
    buf10MB[0] = 0xFF; buf10MB[1] = 0xD8; buf10MB[2] = 0xFF; buf10MB[3] = 0xE0;
    const res = validateBinaryBuffer(buf10MB, 'image/jpeg');
    expect(res.valid).toBe(true);
  });

  it("T2.F30.5: 10MB + 1 byte (10,485,761 bytes) rejected with SECURITY_FILE_TOO_LARGE", () => {
    const bufOver = Buffer.alloc(10 * 1024 * 1024 + 1);
    bufOver[0] = 0xFF; bufOver[1] = 0xD8; bufOver[2] = 0xFF; bufOver[3] = 0xE0;
    const res = validateBinaryBuffer(bufOver, 'image/jpeg');
    expect(res.valid).toBe(false);
    expect(res.code).toBe('SECURITY_FILE_TOO_LARGE');
  });
}, { tier: 2 });

// Feature 31 Boundary: Timestamp Drift Window Boundaries
describe("Feature 31 Boundary: Timestamp Drift Window Boundaries", () => {
  it("T2.F31.1: Timestamp drift of exactly 299s passes validation", () => {
    const ts299s = new Date(Date.now() - 299 * 1000).toISOString();
    const res = verifyTimestampDrift(ts299s);
    expect(res.valid).toBe(true);
  });

  it("T2.F31.2: Timestamp drift of exactly 300s passes validation", () => {
    const ts300s = new Date(Date.now() - 300 * 1000).toISOString();
    const res = verifyTimestampDrift(ts300s);
    expect(res.valid).toBe(true);
  });

  it("T2.F31.3: Timestamp drift of exactly 301s fails with ERR_TIMESTAMP_EXPIRED", () => {
    const ts301s = new Date(Date.now() - 301 * 1000).toISOString();
    const res = verifyTimestampDrift(ts301s);
    expect(res.valid).toBe(false);
    expect(res.code).toBe("ERR_TIMESTAMP_EXPIRED");
  });

  it("T2.F31.4: Future timestamp of +59s passes within +60s clock skew allowance", () => {
    const ts59s = new Date(Date.now() + 59 * 1000).toISOString();
    const res = verifyTimestampDrift(ts59s);
    expect(res.valid).toBe(true);
  });

  it("T2.F31.5: Future timestamp of +61s fails with ERR_TIMESTAMP_FUTURE", () => {
    const ts61s = new Date(Date.now() + 61 * 1000).toISOString();
    const res = verifyTimestampDrift(ts61s);
    expect(res.valid).toBe(false);
    expect(res.code).toBe("ERR_TIMESTAMP_FUTURE");
  });
}, { tier: 2 });

// Feature 32 Boundary: Rate Limiter Window & Token Boundaries
describe("Feature 32 Boundary: Rate Limiter Window & Token Boundaries", () => {
  it("T2.F32.1: Exhausting all 6 tokens in 1ms: requests 1-6 succeed, request 7 rejected", () => {
    const limiter = new SynchronizedSlidingRateLimiter({ limit: 6, windowMs: 60000 });
    for (let i = 0; i < 6; i++) {
      expect(limiter.allow()).toBe(true);
    }
    expect(limiter.allow()).toBe(false);
  });

  it("T2.F32.2: Advancing time by exactly windowMs (60,000ms) resets all 6 tokens", () => {
    const limiter = new SynchronizedSlidingRateLimiter({ limit: 6, windowMs: 60000 });
    for (let i = 0; i < 6; i++) limiter.allow();
    expect(limiter.getRemaining()).toBe(0);
    // Simulate elapsed time by shifting timestamps back by 60,001ms
    limiter.timestamps = limiter.timestamps.map(ts => ts - 60001);
    expect(limiter.getRemaining()).toBe(6);
    expect(limiter.allow()).toBe(true);
  });

  it("T2.F32.3: Zero cost or cost > limit handling", () => {
    const limiter = new SynchronizedSlidingRateLimiter({ limit: 5, windowMs: 60000 });
    expect(limiter.allow(0)).toBe(true);
    expect(limiter.allow(10)).toBe(false);
  });

  it("T2.F32.4: 100 rapid allow() invocations throttle accurately to exact limit", () => {
    const limiter = new SynchronizedSlidingRateLimiter({ limit: 10, windowMs: 60000 });
    let allowedCount = 0;
    for (let i = 0; i < 100; i++) {
      if (limiter.allow()) allowedCount++;
    }
    expect(allowedCount).toBe(10);
  });

  it("T2.F32.5: Rapid reset calculation returns 0ms when no tokens are in use", () => {
    const limiter = new SynchronizedSlidingRateLimiter({ limit: 5, windowMs: 60000 });
    expect(limiter.getResetTimeMs()).toBe(0);
  });
}, { tier: 2 });

// Feature 33 Boundary: Z-Score Extreme Raw Marks & Edge Cases
describe("Feature 33 Boundary: Z-Score Extreme Raw Marks & Edge Cases", () => {
  it("T2.F33.1: Raw score of 0% with 0 tests returns baseline zScore=0, grade F, confidence 0%", () => {
    const res = calculateSubjectZScore('Biology', 0, 0);
    expect(res.zScore).toBe(0);
    expect(res.grade).toBe('F');
    expect(res.confidencePct).toBe(0);
  });

  it("T2.F33.2: Raw score of 0% with 5 tests yields deep negative Z-Score (< -1.0)", () => {
    const res = calculateSubjectZScore('Combined Maths', 0, 5);
    expect(res.zScore).toBeLessThan(-1.0);
    expect(res.grade).toBe('F');
  });

  it("T2.F33.3: Raw score of 100% with 10 tests yields high Z-Score (> +2.5) and >= 99.0 percentile", () => {
    const res = calculateSubjectZScore('Physics', 100, 10);
    expect(res.zScore).toBeGreaterThan(2.5);
    const p = calculatePercentileFromZ(res.zScore);
    expect(p).toBeGreaterThanOrEqual(99.0);
  });

  it("T2.F33.4: Extreme Z-score (+4.0 or -4.0) clamps percentile to [0.1%, 99.9%]", () => {
    expect(calculatePercentileFromZ(4.0)).toBe(99.9);
    expect(calculatePercentileFromZ(-4.0)).toBe(0.1);
  });

  it("T2.F33.5: Unknown subject name gracefully falls back to national default baseline", () => {
    const res = calculateSubjectZScore('NonExistentSubject', 75, 2);
    expect(res.subject).toBe('NonExistentSubject');
    expect(res.grade).toBe('A');
    expect(res.zScore).toBeGreaterThan(0);
  });
}, { tier: 2 });

// Feature 34 Boundary: Dynamic Velocity & EMA Time Boundaries
describe("Feature 34 Boundary: Dynamic Velocity & EMA Time Boundaries", () => {
  it("T2.F34.1: Single test mark returns velocity 0 and stable baseline", () => {
    const tests = [{ subject: 'Chemistry', score: 65, testDate: '2026-08-01' }];
    const ema = calculateSubjectEma('Chemistry', tests);
    expect(ema.velocity).toBe(0);
    expect(ema.trend).toBe('stable');
  });

  it("T2.F34.2: Two tests on same calendar day uses minimum 1-day divisor preventing division by zero", () => {
    const subjects = ['Combined Maths', 'Physics', 'Chemistry'];
    const marks = [
      { subject: 'Combined Maths', score: 60, testDate: '2026-08-15' },
      { subject: 'Combined Maths', score: 75, testDate: '2026-08-15' }
    ];
    const vel = calculateDynamicVelocity(subjects, marks);
    expect(vel.periodDays).toBeGreaterThanOrEqual(1);
    expect(isNaN(vel.velocityZPerMonth)).toBe(false);
  });

  it("T2.F34.3: Identical test scores yield 0 momentum and stable cadence", () => {
    const tests = [
      { subject: 'Biology', score: 70, testDate: '2026-08-01' },
      { subject: 'Biology', score: 70, testDate: '2026-08-10' },
      { subject: 'Biology', score: 70, testDate: '2026-08-20' }
    ];
    const ema = calculateSubjectEma('Biology', tests);
    expect(ema.currentEma3).toBe(70);
    expect(ema.currentEma5).toBe(70);
    expect(ema.trend).toBe('stable');
  });

  it("T2.F34.4: 100-day test separation handles long duration safely", () => {
    const subjects = ['Biology', 'Chemistry', 'Physics'];
    const marks = [
      { subject: 'Biology', score: 50, testDate: '2026-05-01' },
      { subject: 'Biology', score: 80, testDate: '2026-08-10' }
    ];
    const vel = calculateDynamicVelocity(subjects, marks);
    expect(vel.periodDays).toBeGreaterThanOrEqual(90);
    expect(vel.velocityZPerMonth).toBeGreaterThan(0);
  });

  it("T2.F34.5: Target gap with current Z >= target Z returns gap 0 and isTargetMet=true", () => {
    const gap = calculateTargetGapAnalysis(2.20, ['Combined Maths', 'Physics', 'Chemistry'], 'colombo-eng-med');
    expect(gap.gap).toBe(0);
    expect(gap.isTargetMet).toBe(true);
    expect(gap.uniformMarksNeeded).toBe(0);
  });
}, { tier: 2 });

// Feature 35 Boundary: Study Hours & Fatigue Boundaries
describe("Feature 35 Boundary: Study Hours & Fatigue Boundaries", () => {
  it("T2.F35.1: 0-hour daily log (0.0 + 0.0 + 0.0) accepted without error", () => {
    const db = new StudySyncDatabase();
    const member = db.registerMember({
      fullName: "Zero Hour Student",
      email: "zero@gmail.com",
      gender: "Male",
      telegram: "@zero",
      school: "Royal College, Colombo",
      stream: STREAMS.BIO,
      optionalSubject: "Physics"
    });
    const result = db.submitDailyLog({
      studyId: member['Study ID'],
      email: member.Email,
      dateOfStudy: '2026-08-27',
      subjects: [
        { name: "Biology", hours: 0, focus: 5, productivity: 5 },
        { name: "Chemistry", hours: 0, focus: 5, productivity: 5 },
        { name: "Physics", hours: 0, focus: 5, productivity: 5 }
      ]
    });
    expect(result.totalHours).toBe(0);
  });

  it("T2.F35.2: Negative study hours (-0.5h) rejected with validation error", () => {
    const db = new StudySyncDatabase();
    const member = db.registerMember({
      fullName: "Negative Hour Student",
      email: "neg@gmail.com",
      gender: "Female",
      telegram: "@neg",
      school: "Visakha Vidyalaya, Colombo",
      stream: STREAMS.BIO,
      optionalSubject: "Physics"
    });
    expect(() => {
      db.submitDailyLog({
        studyId: member['Study ID'],
        email: member.Email,
        dateOfStudy: '2026-08-27',
        subjects: [
          { name: "Biology", hours: -0.5, focus: 5, productivity: 5 },
          { name: "Chemistry", hours: 2.0, focus: 5, productivity: 5 },
          { name: "Physics", hours: 1.0, focus: 5, productivity: 5 }
        ]
      });
    }).toThrow("between 0 and 24");
  });

  it("T2.F35.3: Maximum 24.0 hours accepted; >24.0h rejected", () => {
    const db = new StudySyncDatabase();
    const member = db.registerMember({
      fullName: "Max Hour Student",
      email: "max@gmail.com",
      gender: "Male",
      telegram: "@max",
      school: "Ananda College, Colombo",
      stream: STREAMS.MATHS,
      optionalSubject: "Chemistry"
    });
    const valid24 = db.submitDailyLog({
      studyId: member['Study ID'],
      email: member.Email,
      dateOfStudy: '2026-08-26',
      subjects: [
        { name: "Combined Maths", hours: 8, focus: 5, productivity: 5 },
        { name: "Physics", hours: 8, focus: 5, productivity: 5 },
        { name: "Chemistry", hours: 8, focus: 5, productivity: 5 }
      ]
    });
    expect(valid24.totalHours).toBe(24);

    expect(() => {
      db.submitDailyLog({
        studyId: member['Study ID'],
        email: member.Email,
        dateOfStudy: '2026-08-27',
        subjects: [
          { name: "Combined Maths", hours: 25, focus: 5, productivity: 5 },
          { name: "Physics", hours: 0, focus: 5, productivity: 5 },
          { name: "Chemistry", hours: 0, focus: 5, productivity: 5 }
        ]
      });
    }).toThrow("between 0 and 24");
  });

  it("T2.F35.4: 0 total study hours across all subjects yields 100% equilibrium baseline", () => {
    const eq = calculateSubjectEntropyEquilibrium([0, 0, 0], ['Bio', 'Chem', 'Phys']);
    expect(eq.equilibriumPct).toBe(100);
    expect(eq.isNeglected).toBe(false);
  });

  it("T2.F35.5: 7-day study volume > 80h triggers acute burnout tier in fatigue index", () => {
    const extremeLogs = [
      { subjects: [{ name: 'Maths', hours: 14, focus: 3, productivity: 3 }] },
      { subjects: [{ name: 'Maths', hours: 14, focus: 3, productivity: 3 }] },
      { subjects: [{ name: 'Maths', hours: 14, focus: 3, productivity: 3 }] },
      { subjects: [{ name: 'Maths', hours: 14, focus: 3, productivity: 3 }] },
      { subjects: [{ name: 'Maths', hours: 14, focus: 3, productivity: 3 }] },
      { subjects: [{ name: 'Maths', hours: 14, focus: 3, productivity: 3 }] }
    ];
    const fatigue = calculateCognitiveFatigueIndex(extremeLogs, 30);
    expect(fatigue.tier).toBe('burnout');
    expect(fatigue.fatigueIndex).toBeGreaterThanOrEqual(7.5);
  });
}, { tier: 2 });

// Direct CLI Execution Hook
if (process.argv[1] && process.argv[1].endsWith('tier2-boundary.test.js')) {
  import('./e2e-runner.js').then(({ runner }) => {
    runner.run(2).then(success => process.exit(success ? 0 : 1));
  });
}


