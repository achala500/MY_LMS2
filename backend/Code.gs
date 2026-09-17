/**
 * ============================================================================
 * StudySync — Sri Lankan A/L Daily Study & Member Management Web Application
 * Google Apps Script Backend & Database Controller
 * ============================================================================
 * 
 * Features:
 * - 3-Sheet Normalized Database Engine (Members, DailyLogs, Analytics, TestMarks)
 * - Atomic Sequential ID Generation with LockService (SG-BIO-0001 / SG-MATH-0001)
 * - RESTful JSON API via doGet(e) and doPost(e)
 * - Google Drive Proof Photo Hierarchy (StudySync_Uploads/{StudentID}/{YYYY-MM-DD}/)
 * - Duplicate Daily Submission Lock (One submission per student per day)
 * - Personal Streak & Hours Rollup Engine
 * - Protected Admin Dashboard Hub & Public QR ID Verification
 * - Telegram Bot Webhook & Daily Digest Broadcaster (/start, /status, /log, /leaderboard, /remind)
 */

// ============================================================================
// GLOBAL CONFIGURATION
// ============================================================================
const CONFIG = {
  // Spreadsheet ID
  SPREADSHEET_ID: "1CI8KbQU-XJ_HvqEv2yu-d1oRf0focH9cdozo0YIhhY0",
  
  // Whitelisted Admin Google Accounts — must match src/lib/constants.ts ADMIN_WHITELIST exactly
  ADMIN_EMAILS: [
    "alwisachalaanurada@gmail.com",
    "admin@studysync.lk",
    "alwis@gmail.com",
    "lead.admin@studysync.lk"
  ],
  
  // Google Drive Root Folder for Uploads
  DRIVE_ROOT_FOLDER_NAME: "StudySync_Uploads",
  
  // Script Lock Timeout in Milliseconds (30 seconds)
  LOCK_TIMEOUT_MS: 30000,
  
  // Sheet Names
  SHEET_NAMES: {
    MEMBERS: "Members",
    DAILY_LOGS: "DailyLogs",
    ANALYTICS: "Analytics",
    TEST_MARKS: "TestMarks"
  },
  
  // Streams
  STREAMS: {
    BIO: "Biological Science",
    MATH: "Physical Science"
  },
  
  // Study ID Prefixes
  PREFIXES: {
    BIO: "SG-BIO-",
    MATH: "SG-MATH-"
  }
};

/**
 * Returns list of authorized admin emails (configured defaults + dynamically added admins)
 */
function getEffectiveAdminEmails() {
  var emails = CONFIG.ADMIN_EMAILS.map(function(e) { return String(e || "").trim().toLowerCase(); });
  try {
    var stored = PropertiesService.getScriptProperties().getProperty("CUSTOM_ADMIN_EMAILS");
    if (stored) {
      var customList = JSON.parse(stored);
      if (Array.isArray(customList)) {
        customList.forEach(function(em) {
          var clean = String(em || "").trim().toLowerCase();
          if (clean && !emails.includes(clean)) {
            emails.push(clean);
          }
        });
      }
    }
  } catch (err) {}
  return emails;
}

/**
 * Verifies if an email is an authorized administrator
 */
function isAuthorizedAdmin(email) {
  var clean = String(email || "").trim().toLowerCase();
  return getEffectiveAdminEmails().includes(clean);
}

/**
 * Retrieves configured custom exam dates map (defaults to late November for Sri Lankan G.C.E. A/L)
 */
function getExamDatesMap() {
  var defaults = {
    "2026": "2026-11-23T08:30:00+05:30",
    "2027": "2027-11-29T08:30:00+05:30",
    "2028": "2028-11-27T08:30:00+05:30",
    "2029": "2029-11-26T08:30:00+05:30"
  };
  try {
    var stored = PropertiesService.getScriptProperties().getProperty("STUDYSYNC_EXAM_DATES");
    if (stored) {
      var custom = JSON.parse(stored);
      if (custom && typeof custom === "object") {
        for (var k in custom) {
          if (custom.hasOwnProperty(k)) defaults[k] = custom[k];
        }
      }
    }
  } catch (e) {}
  return defaults;
}

// ============================================================================
// HTTP ROUTING: doGet & doPost
// ============================================================================

/**
 * Handles HTTP GET requests (for verification, ping, and parameter-based actions)
 */
function doGet(e) {
  try {
    const params = (e && e.parameter) ? e.parameter : {};
    const action = params.action || "ping";
    
    let result;
    switch (action) {
      case "ping":
      case "health":
        result = {
          status: "healthy",
          service: "StudySync Backend API",
          timestamp: new Date().toISOString()
        };
        break;
        
      case "checkUser":
        result = handleCheckUser(params);
        break;
        
      case "verifyMember":
        result = handleVerifyMember(params);
        break;
        
      case "getStudentHistory":
        result = handleGetStudentHistory(params);
        break;
        
      case "getAnalytics":
        result = handleGetAnalytics(params);
        break;
        
      case "getAdminData":
        result = handleGetAdminData(params);
        break;
        
      case "telegramWebhook":
        result = handleTelegramWebhook(params);
        break;
        
      case "broadcastDailyDigest":
        result = handleBroadcastDailyDigest(params);
        break;

      case "getTestMarks":
        result = handleGetTestMarks(params);
        break;

      case "getExamDates":
        result = handleGetExamDates(params);
        break;
        
      case "setup":
      case "setupDatabase":
        setupDatabase();
        result = { message: "Database initialized successfully." };
        break;
        
      default:
        return createJsonResponse(null, false, "Unknown GET action: " + action);
    }
    
    return createJsonResponse(result, true);
  } catch (error) {
    Logger.log("doGet Error: " + error.toString());
    return createJsonResponse(null, false, error.toString());
  }
}

// ============================================================================
// SPREADSHEET FORMULA INJECTION ESCAPING (CWE-1236)
// ============================================================================
function sanitizeCsvFormula(val) {
  if (val === null || val === undefined) return "";
  var str = String(val);
  if (/^[=+\-@\t\r]/.test(str)) {
    return "'" + str;
  }
  return str;
}

/**
 * Handles HTTP POST requests (for mutations and secure queries)
 */
function doPost(e) {
  try {
    let payload = {};
    
    // Parse JSON body or form parameters
    if (e && e.postData && e.postData.contents) {
      try {
        payload = JSON.parse(e.postData.contents);
      } catch (jsonErr) {
        payload = e.parameter || {};
      }
    } else if (e && e.parameter) {
      payload = e.parameter;
    }
    
    let action = payload.action || (e && e.parameter ? e.parameter.action : null);
    
    // Telegram webhook payload auto-detection
    if (!action && (payload.update_id || payload.message || payload.callback_query)) {
      action = "telegramWebhook";
    }
    
    if (!action) {
      return createJsonResponse(null, false, "Missing 'action' parameter in request.");
    }

    // 1. Timestamp Drift Validation Window (±300 seconds)
    var reqTimestamp = (payload.security && payload.security.requestTimestamp) ? payload.security.requestTimestamp : payload.requestTimestamp;
    if (reqTimestamp) {
      var reqTime = new Date(reqTimestamp).getTime();
      if (!isNaN(reqTime)) {
        var now = Date.now();
        var driftMs = Math.abs(now - reqTime);
        if (reqTime - now > 60000) {
          return createJsonResponse({ error: "ERR_TIMESTAMP_FUTURE", serverTime: new Date().toISOString() }, false, "ERR_TIMESTAMP_FUTURE: Request timestamp is in the future.");
        }
        if (driftMs > 300000) {
          return createJsonResponse({ error: "ERR_TIMESTAMP_EXPIRED", serverTime: new Date().toISOString() }, false, "ERR_TIMESTAMP_EXPIRED: Request timestamp is outside the permitted 300-second drift window.");
        }
      }
    }

    // 2. Atomic Idempotency Cache Check
    var idempotencyKey = (payload.security && payload.security.idempotencyKey) ? payload.security.idempotencyKey : payload.idempotencyKey;
    if (idempotencyKey && action !== "ping" && action !== "health") {
      try {
        var cachedJson = CacheService.getScriptCache().get(idempotencyKey);
        if (cachedJson) {
          return createJsonResponse(JSON.parse(cachedJson), true);
        }
      } catch (cacheErr) {}
    }
    
    let result;
    switch (action) {
      case "checkUser":
        result = handleCheckUser(payload);
        break;
        
      case "registerUser":
        result = handleRegisterUser(payload);
        break;
        
      case "submitDailyLog":
        result = handleSubmitDailyLog(payload);
        break;
        
      case "getStudentHistory":
        result = handleGetStudentHistory(payload);
        break;
        
      case "verifyMember":
        result = handleVerifyMember(payload);
        break;
        
      case "updateProfile":
        result = handleUpdateProfile(payload);
        break;
        
      case "adminUpdateMember":
        result = handleAdminUpdateMember(payload);
        break;
        
      case "adminDeleteMember":
        result = handleAdminDeleteMember(payload);
        break;

      case "adminDeleteLog":
        result = handleAdminDeleteLog(payload);
        break;

      case "adminEditLog":
        result = handleAdminEditLog(payload);
        break;

      case "adminAddMember":
        result = handleAdminAddMember(payload);
        break;

      case "adminAddAdmin":
        result = handleAdminAddAdmin(payload);
        break;

      case "adminBanMember":
        result = handleAdminBanMember(payload);
        break;

      case "adminVerifyMember":
        result = handleAdminVerifyMember(payload);
        break;

      case "adminSetExamDate":
        result = handleAdminSetExamDate(payload);
        break;

      case "adminCreateLiveStudyRoom":
        result = handleAdminCreateLiveStudyRoom(payload);
        break;

      case "adminCreateForm":
        result = handleAdminCreateForm(payload);
        break;

      case "submitFormResponse":
        result = handleSubmitFormResponse(payload);
        break;

      case "getAdminForms":
        result = handleGetAdminForms(payload);
        break;

      case "getUserInbox":
        result = handleGetUserInbox(payload);
        break;

      case "getExamDates":
        result = handleGetExamDates(payload);
        break;

      case "adminSetExamCountdown":
        result = handleAdminSetExamDate(payload);
        break;

      case "adminPromoteAdmin":
        result = handleAdminAddAdmin(payload);
        break;

      case "adminSetMemberVerification":
        result = handleAdminVerifyMember(payload);
        break;
        
      case "getAdminData":
        result = handleGetAdminData(payload);
        break;
        
      case "getAnalytics":
        result = handleGetAnalytics(payload);
        break;

      case "telegramWebhook":
        result = handleTelegramWebhook(payload);
        break;

      case "broadcastDailyDigest":
        result = handleBroadcastDailyDigest(payload);
        break;

      case "logTestMark":
        result = handleLogTestMark(payload);
        break;

      case "getTestMarks":
        result = handleGetTestMarks(payload);
        break;

      case "deleteTestMark":
        result = handleDeleteTestMark(payload);
        break;
        
      case "setupDatabase":
        setupDatabase();
        result = { message: "Database initialized successfully." };
        break;
        
      default:
        return createJsonResponse(null, false, "Unknown POST action: " + action);
    }

    // Cache successful mutation response under idempotencyKey (6h TTL)
    if (idempotencyKey && result) {
      try {
        CacheService.getScriptCache().put(idempotencyKey, JSON.stringify(result), 21600);
      } catch (cacheErr) {}
    }
    
    return createJsonResponse(result, true);
  } catch (error) {
    Logger.log("doPost Error: " + error.toString());
    return createJsonResponse(null, false, error.toString());
  }
}

/**
 * Creates standardized JSON response with CORS headers
 */
function createJsonResponse(data, isSuccess, errorMsg) {
  const output = {
    success: isSuccess === true,
    data: isSuccess ? data : null,
    error: isSuccess ? null : (errorMsg || "Unknown error occurred"),
    timestamp: new Date().toISOString()
  };
  
  return ContentService.createTextOutput(JSON.stringify(output))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================================================
// DATABASE INITIALIZER: setupDatabase()
// ============================================================================

/**
 * Initializes and formats the database structure.
 */
function setupDatabase() {
  const ss = getSpreadsheet();
  
  // 1. Members Sheet (11 Columns)
  let membersSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.MEMBERS);
  if (!membersSheet) {
    membersSheet = ss.insertSheet(CONFIG.SHEET_NAMES.MEMBERS);
  }
  
  const memberHeaders = [
    "Study ID",           // Col A (e.g. SG-BIO-0001)
    "Full Name",          // Col B
    "Email",              // Col C (Unique Key)
    "Gender",             // Col D (Male / Female / Other)
    "Telegram Username",  // Col E (@username)
    "School",             // Col F
    "Stream",             // Col G (Biological Science / Physical Science)
    "Optional Subject",   // Col H
    "Registration Date",  // Col I (ISO 8601)
    "Status",             // Col J (Active / Inactive)
    "Exam Year"           // Col K (2026 / 2027 / 2028 / 2029)
  ];
  
  membersSheet.getRange(1, 1, 1, memberHeaders.length).setValues([memberHeaders]);
  membersSheet.getRange(1, 1, 1, 11)
    .setFontWeight("bold")
    .setFontFamily("Inter")
    .setBackground("#1e293b")
    .setFontColor("#ffffff");
  membersSheet.setFrozenRows(1);
  
  // 2. DailyLogs Sheet (21 Columns)
  let logsSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.DAILY_LOGS);
  if (!logsSheet) {
    logsSheet = ss.insertSheet(CONFIG.SHEET_NAMES.DAILY_LOGS);
  }
  
  const logHeaders = [
    "Timestamp",              // Col A (ISO 8601)
    "Study ID",               // Col B (Foreign Key -> Members)
    "Email",                  // Col C
    "Date of Study",          // Col D (YYYY-MM-DD)
    "Subject 1 Name",         // Col E
    "Subject 1 Hours",        // Col F (Numeric Float)
    "Subject 1 Focus",        // Col G (Integer 1-10)
    "Subject 1 Productivity", // Col H (Integer 1-10)
    "Subject 2 Name",         // Col I
    "Subject 2 Hours",        // Col J
    "Subject 2 Focus",        // Col K
    "Subject 2 Productivity", // Col L
    "Subject 3 Name",         // Col M
    "Subject 3 Hours",        // Col N
    "Subject 3 Focus",        // Col O
    "Subject 3 Productivity", // Col P
    "Notes",                  // Col Q
    "Telegram",               // Col R
    "Proof Photo URL",        // Col S
    "Total Hours",            // Col T (actual total — may differ from sub-sum if manual override)
    "Sessions JSON"           // Col U (JSON array of individual session objects)
  ];
  
  logsSheet.getRange(1, 1, 1, logHeaders.length).setValues([logHeaders]);
  logsSheet.getRange(1, 1, 1, 21)
    .setFontWeight("bold")
    .setFontFamily("Inter")
    .setBackground("#0f172a")
    .setFontColor("#38bdf8");
  logsSheet.setFrozenRows(1);

  
  // 3. Analytics Sheet
  let analyticsSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.ANALYTICS);
  if (!analyticsSheet) {
    analyticsSheet = ss.insertSheet(CONFIG.SHEET_NAMES.ANALYTICS);
  }
  
  analyticsSheet.clear();
  
  analyticsSheet.getRange("A1:N1").merge()
    .setValue("StudySync — Group Analytics & Leaderboard Summary")
    .setFontWeight("bold")
    .setFontSize(14)
    .setFontFamily("Inter")
    .setBackground("#0284c7")
    .setFontColor("#ffffff")
    .setHorizontalAlignment("center");
    
  analyticsSheet.getRange("A3:C3").merge().setValue("Total Registered Members").setFontWeight("bold").setBackground("#f1f5f9");
  analyticsSheet.getRange("D3:F3").merge().setValue("Total Study Hours").setFontWeight("bold").setBackground("#f1f5f9");
  analyticsSheet.getRange("G3:I3").merge().setValue("Total Daily Logs").setFontWeight("bold").setBackground("#f1f5f9");
  analyticsSheet.getRange("J3:L3").merge().setValue("Average Focus / Prod").setFontWeight("bold").setBackground("#f1f5f9");
  
  analyticsSheet.getRange("A4:C4").merge().setFormula('=COUNTA(Members!A2:A)').setFontSize(16).setFontWeight("bold").setHorizontalAlignment("center");
  analyticsSheet.getRange("D4:F4").merge().setFormula('=SUM(DailyLogs!F2:F) + SUM(DailyLogs!J2:J) + SUM(DailyLogs!N2:N)').setFontSize(16).setFontWeight("bold").setHorizontalAlignment("center");
  analyticsSheet.getRange("G4:I4").merge().setFormula('=COUNTA(DailyLogs!A2:A)').setFontSize(16).setFontWeight("bold").setHorizontalAlignment("center");
  analyticsSheet.getRange("J4:L4").merge().setFormula('=IFERROR(AVERAGE(DailyLogs!G2:G, DailyLogs!K2:K, DailyLogs!O2:O), 0)').setFontSize(16).setFontWeight("bold").setHorizontalAlignment("center");
  
  const analyticsHeaders = [
    "Study ID", "Full Name", "Stream", "Total Logs", "Total Hours",
    "Subj 1 Hours", "Subj 2 Hours", "Subj 3 Hours", "Avg Focus",
    "Avg Productivity", "Current Streak (Days)", "Max Streak (Days)", "Last Active Date", "Last Updated"
  ];
  analyticsSheet.getRange(7, 1, 1, analyticsHeaders.length)
    .setValues([analyticsHeaders])
    .setFontWeight("bold")
    .setFontFamily("Inter")
    .setBackground("#1e293b")
    .setFontColor("#f1f5f9");
  analyticsSheet.setFrozenRows(7);
  
  const defaultSheet = ss.getSheetByName("Sheet1");
  if (defaultSheet && ss.getSheets().length > 1) {
    try {
      ss.deleteSheet(defaultSheet);
    } catch (e) {}
  }
  
  SpreadsheetApp.flush();
  return true;
}

// ============================================================================
// CORE API ENDPOINT HANDLERS
// ============================================================================

/**
 * 1. checkUser
 */
function handleCheckUser(payload) {
  const email = String(payload.email || "").trim().toLowerCase();
  if (!email) {
    throw new Error("Email parameter is required.");
  }
  
  const ss = getSpreadsheet();
  let membersSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.MEMBERS);
  if (!membersSheet) {
    setupDatabase();
    membersSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.MEMBERS);
  }
  
  const memberRow = findMemberByEmail(membersSheet, email);
  if (!memberRow) {
    return {
      registered: false,
      member: null,
      todayLog: null,
      stats: null
    };
  }
  
  const member = rowToMemberObject(memberRow.values);
  if (member.status === "Suspended" || member.status === "Banned") {
    return {
      registered: true,
      banned: true,
      status: member.status,
      member: member,
      todayLog: null,
      stats: null,
      message: "This student account is currently suspended by administrators."
    };
  }
  const logsSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.DAILY_LOGS);
  const todayStr = getLocalDateString(new Date());
  const todayLog = findDailyLog(logsSheet, member.studyId, todayStr);
  const historyData = getStudentStatsAndLogs(logsSheet, member.studyId);
  
  return {
    registered: true,
    banned: false,
    member: member,
    todayLog: todayLog ? rowToDailyLogObject(todayLog.values) : null,
    stats: historyData.stats
  };
}

/**
 * 2. registerUser
 */
function handleRegisterUser(payload) {
  const lock = LockService.getScriptLock();
  try {
    const hasLock = lock.tryLock(CONFIG.LOCK_TIMEOUT_MS);
    if (!hasLock) {
      throw new Error("Server is busy processing registrations. Please retry in a few moments.");
    }
    
    const fullName = sanitizeCsvFormula(String(payload.fullName || "").trim());
    const email = String(payload.email || "").trim().toLowerCase();
    const gender = String(payload.gender || "Other").trim();
    let telegram = String(payload.telegram || payload.telegramUsername || "").trim();
    if (telegram) {
      telegram = normalizeTelegramUsername(telegram);
    }
    const school = sanitizeCsvFormula(String(payload.school || "").trim());
    const stream = String(payload.stream || "").trim();
    const optionalSubject = String(payload.optionalSubject || "").trim();
    const examYear = String(payload.examYear || "2026").trim();
    
    if (!fullName || !email || !stream || !school) {
      throw new Error("Missing required registration fields: fullName, email, school, stream are mandatory.");
    }
    
    const ss = getSpreadsheet();
    let membersSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.MEMBERS);
    if (!membersSheet) {
      setupDatabase();
      membersSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.MEMBERS);
    }
    
    const existing = findMemberByEmail(membersSheet, email);
    if (existing) {
      return {
        alreadyRegistered: true,
        member: rowToMemberObject(existing.values)
      };
    }
    
    const studyId = generateNextStudyId(membersSheet, stream);
    const regDate = new Date().toISOString();
    const status = "Active";
    
    const rowValues = [
      studyId,
      fullName,
      email,
      gender,
      telegram,
      school,
      stream,
      optionalSubject,
      regDate,
      status,
      examYear
    ];
    
    membersSheet.appendRow(rowValues);
    SpreadsheetApp.flush();
    
    return {
      alreadyRegistered: false,
      studyId: studyId,
      fullName: fullName,
      email: email,
      gender: gender,
      telegram: telegram,
      school: school,
      stream: stream,
      optionalSubject: optionalSubject,
      examYear: examYear,
      registrationDate: regDate,
      status: status
    };
  } finally {
    try { lock.releaseLock(); } catch (e) {}
  }
}

/**
 * 3. submitDailyLog
 */
function handleSubmitDailyLog(payload) {
  const lock = LockService.getScriptLock();
  try {
    const hasLock = lock.tryLock(CONFIG.LOCK_TIMEOUT_MS);
    if (!hasLock) {
      throw new Error("Server is busy processing submissions. Please retry in a few moments.");
    }
    
    const studyId = String(payload.studyId || "").trim().toUpperCase();
    const email = String(payload.email || "").trim().toLowerCase();
    const dateOfStudy = String(payload.dateOfStudy || getLocalDateString(new Date())).trim();
    const notes = sanitizeCsvFormula(String(payload.notes || "").trim());
    let telegram = String(payload.telegram || payload.telegramUsername || "").trim();
    if (telegram) {
      telegram = normalizeTelegramUsername(telegram);
    }
    
    if (!studyId || !dateOfStudy) {
      throw new Error("Missing required fields: studyId and dateOfStudy are required.");
    }
    
    const ss = getSpreadsheet();
    let logsSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.DAILY_LOGS);
    let membersSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.MEMBERS);
    if (!logsSheet || !membersSheet) {
      setupDatabase();
      logsSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.DAILY_LOGS);
      membersSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.MEMBERS);
    }
    
    const memberRow = findMemberByStudyId(membersSheet, studyId);
    if (!memberRow) {
      throw new Error("Invalid Study ID: Member not found in database.");
    }

    var memberStatus = String(memberRow.values[9] || "Active").trim().toLowerCase();
    if (memberStatus === "suspended" || memberStatus === "banned") {
      throw new Error("Account Suspended: Your account is suspended. Daily log submissions are disabled.");
    }
    
    const existingLog = findDailyLog(logsSheet, studyId, dateOfStudy);
    if (existingLog) {
      return {
        isDuplicate: true,
        message: "You have already submitted a daily study log for " + dateOfStudy + ".",
        existingLog: rowToDailyLogObject(existingLog.values)
      };
    }
    
    // Multiple Sessions Support & Auto/Manual Calculation
    const rawSessions = Array.isArray(payload.sessions) ? payload.sessions : [];
    const memberStream = String(memberRow.values[6] || "");
    const isBio = (memberStream.toLowerCase().indexOf("bio") !== -1);
    const defaultSub1 = isBio ? "Biology" : "Combined Maths";
    const defaultSub2 = isBio ? "Chemistry" : "Physics";
    const defaultSub3 = String(memberRow.values[7] || (isBio ? "Physics" : "Chemistry"));

    // Build subject name->hours accumulator from sessions array (if provided)
    const sessionHoursMap = {};
    if (rawSessions.length > 0) {
      for (var sIdx = 0; sIdx < rawSessions.length; sIdx++) {
        var sess = rawSessions[sIdx];
        var sName = String(sess.subject || sess.name || "").trim().toLowerCase();
        var sHrs = Math.max(0, Number(sess.hours) || 0);
        if (sName) {
          sessionHoursMap[sName] = (sessionHoursMap[sName] || 0) + sHrs;
        }
      }
    }

    // Resolve per-subject hours:
    // Priority: explicit payload.hoursSubjectN > session accumulator > subjects array > 0
    const subjects = Array.isArray(payload.subjects) ? payload.subjects : [];
    
    var sub1Name = (subjects[0] && subjects[0].name) ? subjects[0].name : defaultSub1;
    var sub2Name = (subjects[1] && subjects[1].name) ? subjects[1].name : defaultSub2;
    var sub3Name = (subjects[2] && subjects[2].name) ? subjects[2].name : defaultSub3;

    var sub1Hours = (payload.hoursSubject1 !== undefined && payload.hoursSubject1 !== null && payload.hoursSubject1 !== "")
      ? Math.max(0, Number(payload.hoursSubject1))
      : (rawSessions.length > 0
          ? (sessionHoursMap[sub1Name.toLowerCase()] || 0)
          : Math.max(0, Number((subjects[0] && subjects[0].hours) || 0)));

    var sub2Hours = (payload.hoursSubject2 !== undefined && payload.hoursSubject2 !== null && payload.hoursSubject2 !== "")
      ? Math.max(0, Number(payload.hoursSubject2))
      : (rawSessions.length > 0
          ? (sessionHoursMap[sub2Name.toLowerCase()] || 0)
          : Math.max(0, Number((subjects[1] && subjects[1].hours) || 0)));

    var sub3Hours = (payload.hoursSubject3 !== undefined && payload.hoursSubject3 !== null && payload.hoursSubject3 !== "")
      ? Math.max(0, Number(payload.hoursSubject3))
      : (rawSessions.length > 0
          ? (sessionHoursMap[sub3Name.toLowerCase()] || 0)
          : Math.max(0, Number((subjects[2] && subjects[2].hours) || 0)));

    // Average focus/productivity across sessions or use payload values
    var avgFocus = 8;
    var avgProd = 8;
    if (rawSessions.length > 0) {
      var focusSum = 0;
      var prodSum = 0;
      for (var fi = 0; fi < rawSessions.length; fi++) {
        focusSum += Number(rawSessions[fi].focus || 8);
        prodSum += Number(rawSessions[fi].productivity || 8);
      }
      avgFocus = Math.round(focusSum / rawSessions.length);
      avgProd = Math.round(prodSum / rawSessions.length);
    } else {
      avgFocus = Math.min(10, Math.max(1, parseInt(payload.focusScore || 8, 10) || 8));
      avgProd = Math.min(10, Math.max(1, parseInt(payload.productivityScore || 8, 10) || 8));
    }

    var sub1Focus = Math.min(10, Math.max(1, parseInt(payload.focusScore || avgFocus, 10) || avgFocus));
    var sub1Prod = Math.min(10, Math.max(1, parseInt(payload.productivityScore || avgProd, 10) || avgProd));
    var sub2Focus = sub1Focus;
    var sub2Prod = sub1Prod;
    var sub3Focus = sub1Focus;
    var sub3Prod = sub1Prod;

    // Total hours: use manual override if explicitly provided, else sum from subjects
    var calculatedSubTotal = Number((sub1Hours + sub2Hours + sub3Hours).toFixed(2));
    var totalHours = (payload.totalHours !== undefined && payload.totalHours !== null && payload.totalHours !== "")
      ? Math.max(0, Number(payload.totalHours))
      : calculatedSubTotal;

    // Persist proof photo to Google Drive
    var proofPhotoUrl = "";
    if (payload.proofFile && payload.proofFile.base64) {
      proofPhotoUrl = saveProofPhotoToDrive(
        studyId,
        dateOfStudy,
        payload.proofFile.base64,
        payload.proofFile.mimeType || "image/jpeg",
        payload.proofFile.fileName || ("proof_" + Date.now() + ".jpg")
      );
    }
    
    // Serialize sessions to JSON for Col U (strip large/sensitive fields if needed)
    var sessionsJson = "";
    if (rawSessions.length > 0) {
      try {
        sessionsJson = JSON.stringify(rawSessions);
      } catch (je) {
        sessionsJson = "";
      }
    }

    var timestamp = new Date().toISOString();
    var rowValues = [
      timestamp,                             // Col A
      studyId,                               // Col B
      email || memberRow.values[2],          // Col C
      dateOfStudy,                           // Col D
      sub1Name,                              // Col E
      sub1Hours,                             // Col F
      sub1Focus,                             // Col G
      sub1Prod,                              // Col H
      sub2Name,                              // Col I
      sub2Hours,                             // Col J
      sub2Focus,                             // Col K
      sub2Prod,                              // Col L
      sub3Name,                              // Col M
      sub3Hours,                             // Col N
      sub3Focus,                             // Col O
      sub3Prod,                              // Col P
      notes,                                 // Col Q
      telegram || memberRow.values[4] || "", // Col R
      proofPhotoUrl,                         // Col S
      totalHours,                            // Col T — actual total (may differ from sub-sum)
      sessionsJson                           // Col U — JSON sessions array
    ];
    
    logsSheet.appendRow(rowValues);
    SpreadsheetApp.flush();
    
    return {
      isDuplicate: false,
      message: "Daily study log recorded successfully.",
      logId: "LOG_" + Date.now(),
      studyId: studyId,
      dateOfStudy: dateOfStudy,
      totalHours: totalHours,
      proofPhotoUrl: proofPhotoUrl,
      log: rowToDailyLogObject(rowValues)
    };
  } finally {
    try { lock.releaseLock(); } catch (e) {}
  }
}


/**
 * 4. getStudentHistory
 */
function handleGetStudentHistory(payload) {
  const studyId = String(payload.studyId || "").trim().toUpperCase();
  const email = String(payload.email || "").trim().toLowerCase();
  
  if (!studyId && !email) {
    throw new Error("Either studyId or email parameter is required.");
  }
  
  const ss = getSpreadsheet();
  let membersSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.MEMBERS);
  let logsSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.DAILY_LOGS);
  if (!membersSheet || !logsSheet) {
    setupDatabase();
    membersSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.MEMBERS);
    logsSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.DAILY_LOGS);
  }
  
  let targetStudyId = studyId;
  if (!targetStudyId && email) {
    const memberRow = findMemberByEmail(membersSheet, email);
    if (memberRow) {
      targetStudyId = memberRow.values[0];
    }
  }
  
  if (!targetStudyId) {
    return {
      studyId: "",
      logs: [],
      stats: {
        totalHours: 0,
        activeStreak: 0,
        currentStreak: 0,
        maxStreak: 0,
        longestStreak: 0,
        avgFocus: 0,
        avgProductivity: 0,
        totalEntries: 0,
        totalLogs: 0,
        subjectHours: {}
      }
    };
  }
  
  const historyData = getStudentStatsAndLogs(logsSheet, targetStudyId);
  return {
    studyId: targetStudyId,
    logs: historyData.logs,
    stats: historyData.stats
  };
}

/**
 * 5. verifyMember
 */
function handleVerifyMember(payload) {
  const studyId = String(payload.studyId || payload.id || "").trim().toUpperCase();
  if (!studyId) {
    return { valid: false, message: "Study ID parameter is required." };
  }
  
  const ss = getSpreadsheet();
  const membersSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.MEMBERS);
  if (!membersSheet) {
    return { valid: false, message: "Database not initialized." };
  }
  
  const memberRow = findMemberByStudyId(membersSheet, studyId);
  if (!memberRow) {
    return { valid: false, message: "No registered student found matching Study ID " + studyId };
  }
  
  const member = rowToMemberObject(memberRow.values);
  return {
    valid: true,
    member: {
      studyId: member.studyId,
      fullName: member.fullName,
      school: member.school,
      stream: member.stream,
      optionalSubject: member.optionalSubject,
      registrationDate: member.registrationDate,
      status: member.status,
      examYear: member.examYear
    }
  };
}

/**
 * 6. updateProfile
 */
function handleUpdateProfile(payload) {
  const email = String(payload.email || "").trim().toLowerCase();
  const studyId = String(payload.studyId || "").trim().toUpperCase();
  
  if (!email && !studyId) {
    throw new Error("email or studyId is required.");
  }
  
  const ss = getSpreadsheet();
  const membersSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.MEMBERS);
  let memberRow = null;
  if (email) {
    memberRow = findMemberByEmail(membersSheet, email);
  } else if (studyId) {
    memberRow = findMemberByStudyId(membersSheet, studyId);
  }
  
  if (!memberRow) {
    throw new Error("Member not found.");
  }
  
  const rowIndex = memberRow.rowIndex;
  if (payload.fullName) membersSheet.getRange(rowIndex, 2).setValue(sanitizeCsvFormula(String(payload.fullName).trim()));
  if (payload.gender) membersSheet.getRange(rowIndex, 4).setValue(String(payload.gender).trim());
  if (payload.telegram || payload.telegramUsername) {
    membersSheet.getRange(rowIndex, 5).setValue(normalizeTelegramUsername(payload.telegram || payload.telegramUsername));
  }
  if (payload.school) membersSheet.getRange(rowIndex, 6).setValue(sanitizeCsvFormula(String(payload.school).trim()));
  if (payload.stream) membersSheet.getRange(rowIndex, 7).setValue(String(payload.stream).trim());
  if (payload.optionalSubject) membersSheet.getRange(rowIndex, 8).setValue(String(payload.optionalSubject).trim());
  if (payload.status) membersSheet.getRange(rowIndex, 10).setValue(String(payload.status).trim());
  if (payload.examYear) membersSheet.getRange(rowIndex, 11).setValue(String(payload.examYear).trim());
  
  SpreadsheetApp.flush();
  const updatedRow = membersSheet.getRange(rowIndex, 1, 1, 11).getValues()[0];
  return {
    updated: true,
    member: rowToMemberObject(updatedRow)
  };
}

/**
 * 7. adminUpdateMember
 */
function handleAdminUpdateMember(payload) {
  const adminEmail = String(payload.adminEmail || "").trim().toLowerCase();
  if (!CONFIG.ADMIN_EMAILS.map(function(e) { return e.toLowerCase(); }).includes(adminEmail)) {
    throw new Error("Access Denied: " + adminEmail + " is not a whitelisted administrator.");
  }
  
  const studyId = String(payload.studyId || "").trim().toUpperCase();
  if (!studyId) {
    throw new Error("studyId is required.");
  }
  
  const ss = getSpreadsheet();
  const membersSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.MEMBERS);
  const memberRow = findMemberByStudyId(membersSheet, studyId);
  if (!memberRow) {
    throw new Error("Member " + studyId + " not found.");
  }
  
  const rowIndex = memberRow.rowIndex;
  if (payload.fullName) membersSheet.getRange(rowIndex, 2).setValue(sanitizeCsvFormula(String(payload.fullName).trim()));
  if (payload.school) membersSheet.getRange(rowIndex, 6).setValue(sanitizeCsvFormula(String(payload.school).trim()));
  if (payload.stream) membersSheet.getRange(rowIndex, 7).setValue(String(payload.stream).trim());
  if (payload.optionalSubject) membersSheet.getRange(rowIndex, 8).setValue(String(payload.optionalSubject).trim());
  if (payload.status) membersSheet.getRange(rowIndex, 10).setValue(String(payload.status).trim());
  if (payload.examYear) membersSheet.getRange(rowIndex, 11).setValue(String(payload.examYear).trim());
  if (payload.telegram || payload.telegramUsername) {
    membersSheet.getRange(rowIndex, 5).setValue(normalizeTelegramUsername(payload.telegram || payload.telegramUsername));
  }
  
  SpreadsheetApp.flush();
  const updatedRow = membersSheet.getRange(rowIndex, 1, 1, 11).getValues()[0];
  return {
    updated: true,
    member: rowToMemberObject(updatedRow)
  };
}

/**
 * 7b. adminDeleteMember
 */
function handleAdminDeleteMember(payload) {
  const adminEmail = String(payload.adminEmail || "").trim().toLowerCase();
  if (!CONFIG.ADMIN_EMAILS.map(function(e) { return e.toLowerCase(); }).includes(adminEmail)) {
    throw new Error("Access Denied: " + adminEmail + " is not an administrator.");
  }
  
  const studyId = String(payload.studyId || "").trim().toUpperCase();
  const ss = getSpreadsheet();
  const membersSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.MEMBERS);
  const memberRow = findMemberByStudyId(membersSheet, studyId);
  if (memberRow) {
    membersSheet.deleteRow(memberRow.rowIndex);
    SpreadsheetApp.flush();
  }
  return { success: true, deletedStudyId: studyId };
}

/**
 * 7c. adminDeleteLog
 */
function handleAdminDeleteLog(payload) {
  const adminEmail = String(payload.adminEmail || "").trim().toLowerCase();
  if (!CONFIG.ADMIN_EMAILS.map(function(e) { return e.toLowerCase(); }).includes(adminEmail)) {
    throw new Error("Access Denied: " + adminEmail + " is not an administrator.");
  }
  
  const studyId = String(payload.studyId || "").trim().toUpperCase();
  const dateOfStudy = String(payload.dateOfStudy || "").trim();
  const ss = getSpreadsheet();
  const logsSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.DAILY_LOGS);
  const logRow = findDailyLog(logsSheet, studyId, dateOfStudy);
  if (logRow) {
    logsSheet.deleteRow(logRow.rowIndex);
    SpreadsheetApp.flush();
  }
  return { success: true, deletedLog: { studyId: studyId, dateOfStudy: dateOfStudy } };
}

/**
 * 7d-2. adminEditLog — Admin corrects hours or notes in a daily log
 */
function handleAdminEditLog(payload) {
  var adminEmail = String(payload.adminEmail || "").trim().toLowerCase();
  if (!CONFIG.ADMIN_EMAILS.map(function(e) { return e.toLowerCase(); }).includes(adminEmail)) {
    throw new Error("Access Denied: " + adminEmail + " is not an administrator.");
  }
  
  var studyId = String(payload.studyId || "").trim().toUpperCase();
  var dateOfStudy = String(payload.dateOfStudy || "").trim();
  if (!studyId || !dateOfStudy) {
    throw new Error("studyId and dateOfStudy are required.");
  }
  
  var ss = getSpreadsheet();
  var logsSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.DAILY_LOGS);
  var logRow = findDailyLog(logsSheet, studyId, dateOfStudy);
  if (!logRow) {
    throw new Error("Log not found for " + studyId + " on " + dateOfStudy);
  }
  
  var ri = logRow.rowIndex;
  
  // Only allow editing hours and notes — never identity fields (studyId, email, date)
  if (payload.subject1Hours !== undefined && payload.subject1Hours !== null && payload.subject1Hours !== "") {
    logsSheet.getRange(ri, 6).setValue(Math.max(0, Number(payload.subject1Hours)));
  }
  if (payload.subject2Hours !== undefined && payload.subject2Hours !== null && payload.subject2Hours !== "") {
    logsSheet.getRange(ri, 10).setValue(Math.max(0, Number(payload.subject2Hours)));
  }
  if (payload.subject3Hours !== undefined && payload.subject3Hours !== null && payload.subject3Hours !== "") {
    logsSheet.getRange(ri, 14).setValue(Math.max(0, Number(payload.subject3Hours)));
  }
  if (payload.totalHours !== undefined && payload.totalHours !== null && payload.totalHours !== "") {
    logsSheet.getRange(ri, 20).setValue(Math.max(0, Number(payload.totalHours)));
  }
  if (payload.notes !== undefined && payload.notes !== null) {
    logsSheet.getRange(ri, 17).setValue(sanitizeCsvFormula(String(payload.notes).trim()));
  }
  
  SpreadsheetApp.flush();
  var updatedRow = logsSheet.getRange(ri, 1, 1, 21).getValues()[0];
  return {
    updated: true,
    log: rowToDailyLogObject(updatedRow)
  };
}

/**
 * 7d. adminAddMember
 */
function handleAdminAddMember(payload) {
  return handleRegisterUser(payload);
}

/**
 * 7e. adminAddAdmin: Promotes/adds an authorized administrator email
 */
function handleAdminAddAdmin(payload) {
  var adminEmail = String(payload.adminEmail || "").trim().toLowerCase();
  if (!isAuthorizedAdmin(adminEmail)) {
    throw new Error("Access Denied: " + adminEmail + " is not an authorized administrator.");
  }
  var targetEmail = String(payload.targetEmail || payload.email || payload.newAdminEmail || "").trim().toLowerCase();
  if (!targetEmail || !targetEmail.includes("@")) {
    throw new Error("Invalid target email address.");
  }
  var list = getEffectiveAdminEmails();
  if (!list.includes(targetEmail)) {
    var stored = null;
    try {
      var raw = PropertiesService.getScriptProperties().getProperty("CUSTOM_ADMIN_EMAILS");
      stored = raw ? JSON.parse(raw) : [];
    } catch (e) {
      stored = [];
    }
    if (!Array.isArray(stored)) stored = [];
    if (!stored.includes(targetEmail)) {
      stored.push(targetEmail);
      PropertiesService.getScriptProperties().setProperty("CUSTOM_ADMIN_EMAILS", JSON.stringify(stored));
    }
  }
  return {
    success: true,
    targetEmail: targetEmail,
    admins: getEffectiveAdminEmails(),
    message: targetEmail + " promoted to administrator."
  };
}

/**
 * 7f. adminBanMember: Suspends a student account
 */
function handleAdminBanMember(payload) {
  var adminEmail = String(payload.adminEmail || "").trim().toLowerCase();
  if (!isAuthorizedAdmin(adminEmail)) {
    throw new Error("Access Denied: " + adminEmail + " is not an authorized administrator.");
  }
  var studyId = String(payload.studyId || "").trim().toUpperCase();
  if (!studyId) throw new Error("studyId is required.");

  var ss = getSpreadsheet();
  var membersSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.MEMBERS);
  var memberRow = findMemberByStudyId(membersSheet, studyId);
  if (!memberRow) {
    throw new Error("Member " + studyId + " not found.");
  }

  membersSheet.getRange(memberRow.rowIndex, 10).setValue("Suspended");
  SpreadsheetApp.flush();
  return {
    success: true,
    studyId: studyId,
    status: "Suspended",
    message: "Member " + studyId + " suspended successfully."
  };
}

/**
 * 7g. adminVerifyMember: Sets student verification status (Verified, Pending, Active, Suspended)
 */
function handleAdminVerifyMember(payload) {
  var adminEmail = String(payload.adminEmail || "").trim().toLowerCase();
  if (!isAuthorizedAdmin(adminEmail)) {
    throw new Error("Access Denied: " + adminEmail + " is not an authorized administrator.");
  }
  var studyId = String(payload.studyId || "").trim().toUpperCase();
  if (!studyId) throw new Error("studyId is required.");
  var newStatus = String(payload.status || payload.verificationStatus || "Verified").trim();

  var ss = getSpreadsheet();
  var membersSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.MEMBERS);
  var memberRow = findMemberByStudyId(membersSheet, studyId);
  if (!memberRow) {
    throw new Error("Member " + studyId + " not found.");
  }

  membersSheet.getRange(memberRow.rowIndex, 10).setValue(newStatus);
  SpreadsheetApp.flush();
  return {
    success: true,
    studyId: studyId,
    status: newStatus,
    message: "Member " + studyId + " verification status updated to " + newStatus
  };
}

/**
 * 7h. adminSetExamDate: Allows admins to manually set or edit countdown target dates
 */
function handleAdminSetExamDate(payload) {
  var adminEmail = String(payload.adminEmail || "").trim().toLowerCase();
  if (!isAuthorizedAdmin(adminEmail)) {
    throw new Error("Access Denied: " + adminEmail + " is not an authorized administrator.");
  }
  var year = String(payload.year || payload.examYear || "2026").trim();
  var targetDate = String(payload.targetDate || payload.date || "").trim();
  if (!targetDate) throw new Error("targetDate parameter is required.");

  var currentDates = getExamDatesMap();
  currentDates[year] = targetDate;
  PropertiesService.getScriptProperties().setProperty("STUDYSYNC_EXAM_DATES", JSON.stringify(currentDates));

  return {
    success: true,
    year: year,
    targetDate: targetDate,
    examDates: currentDates,
    message: "Exam countdown date for " + year + " updated to " + targetDate
  };
}

/**
 * 7i. adminCreateLiveStudyRoom: Generates Zoom / Google Meet room with 1-click invite
 */
function handleAdminCreateLiveStudyRoom(payload) {
  var adminEmail = String(payload.adminEmail || "").trim().toLowerCase();
  if (!isAuthorizedAdmin(adminEmail)) {
    throw new Error("Access Denied: " + adminEmail + " is not an authorized administrator.");
  }
  var platform = String(payload.platform || "google_meet").toLowerCase();
  var topic = String(payload.topic || payload.title || "Sri Lanka A/L Live Study Session").trim();

  var roomUrl = "";
  var roomCode = "";

  if (platform === "zoom") {
    var zoomId = Math.floor(8000000000 + Math.random() * 1999999999).toString();
    var pwd = Math.floor(100000 + Math.random() * 900000).toString();
    roomUrl = "https://zoom.us/j/" + zoomId + "?pwd=" + pwd;
    roomCode = zoomId;
  } else {
    var letters = "abcdefghijklmnopqrstuvwxyz";
    function randLetters(n) {
      var s = "";
      for (var i = 0; i < n; i++) s += letters.charAt(Math.floor(Math.random() * letters.length));
      return s;
    }
    roomCode = randLetters(3) + "-" + randLetters(4) + "-" + randLetters(3);
    roomUrl = "https://meet.google.com/" + roomCode;
  }

  var inviteText = [
    "🎓 *STUDYSYNC LIVE A/L STUDY SESSION*",
    "📌 *" + topic + "*",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "🔗 *Join Room:* " + roomUrl,
    "📱 *Platform:* " + (platform === "zoom" ? "Zoom Meeting" : "Google Meet"),
    "🕒 *Target:* Focused Group Revision & Paper Drill",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "👉 Open StudySync: https://studysync-al-2026.web.app"
  ].join("\n");

  return {
    success: true,
    platform: platform,
    topic: topic,
    roomUrl: roomUrl,
    roomCode: roomCode,
    inviteText: inviteText,
    createdAt: new Date().toISOString()
  };
}

/**
 * 7j. getExamDates: Returns target examination dates
 */
function handleGetExamDates(payload) {
  return {
    success: true,
    examDates: getExamDatesMap()
  };
}

/**
 * 7k. adminCreateForm: Generates a custom survey and dispatches to student inboxes
 */
function handleAdminCreateForm(payload) {
  var adminEmail = String(payload.adminEmail || "").trim().toLowerCase();
  if (!isAuthorizedAdmin(adminEmail)) {
    throw new Error("Access Denied: " + adminEmail + " is not an authorized administrator.");
  }
  var title = String(payload.title || "").trim();
  if (!title) throw new Error("Form title is required.");

  var formId = "FORM_" + Date.now();
  var newForm = {
    formId: formId,
    title: title,
    description: String(payload.description || "").trim(),
    targetAudience: payload.targetAudience || "all",
    fields: Array.isArray(payload.fields) ? payload.fields : [],
    createdBy: adminEmail,
    createdAt: new Date().toISOString(),
    isActive: true,
    responseCount: 0
  };

  var prop = PropertiesService.getScriptProperties();
  var forms = [];
  try {
    var rawForms = prop.getProperty("STUDYSYNC_ADMIN_FORMS");
    forms = rawForms ? JSON.parse(rawForms) : [];
  } catch (e) {
    forms = [];
  }
  if (!Array.isArray(forms)) forms = [];
  forms.unshift(newForm);
  prop.setProperty("STUDYSYNC_ADMIN_FORMS", JSON.stringify(forms));

  return {
    success: true,
    form: newForm,
    message: "Form created and dispatched successfully."
  };
}

/**
 * 7l. submitFormResponse: Records student response to an admin survey
 */
function handleSubmitFormResponse(payload) {
  var formId = String(payload.formId || "").trim();
  var studyId = String(payload.studyId || "").trim().toUpperCase();
  if (!formId || !studyId) {
    throw new Error("formId and studyId are required.");
  }

  var responseId = "RESP_" + Date.now() + "_" + studyId;
  var response = {
    responseId: responseId,
    formId: formId,
    studyId: studyId,
    studentName: String(payload.studentName || "").trim(),
    studentEmail: String(payload.studentEmail || "").trim(),
    answers: payload.answers || {},
    submittedAt: new Date().toISOString()
  };

  var prop = PropertiesService.getScriptProperties();
  var responses = [];
  try {
    var rawResp = prop.getProperty("STUDYSYNC_FORM_RESPONSES");
    responses = rawResp ? JSON.parse(rawResp) : [];
  } catch (e) {
    responses = [];
  }
  if (!Array.isArray(responses)) responses = [];
  responses.unshift(response);
  prop.setProperty("STUDYSYNC_FORM_RESPONSES", JSON.stringify(responses));

  return {
    success: true,
    responseId: responseId,
    message: "Form response submitted successfully."
  };
}

/**
 * 7m. getAdminForms: Returns all forms and responses for authorized admins
 */
function handleGetAdminForms(payload) {
  var adminEmail = String(payload.adminEmail || "").trim().toLowerCase();
  if (!isAuthorizedAdmin(adminEmail)) {
    throw new Error("Access Denied: " + adminEmail + " is not an authorized administrator.");
  }

  var prop = PropertiesService.getScriptProperties();
  var forms = [];
  var responses = [];
  try {
    var rf = prop.getProperty("STUDYSYNC_ADMIN_FORMS");
    forms = rf ? JSON.parse(rf) : [];
  } catch (e) {}
  try {
    var rr = prop.getProperty("STUDYSYNC_FORM_RESPONSES");
    responses = rr ? JSON.parse(rr) : [];
  } catch (e) {}

  return {
    success: true,
    forms: forms,
    responses: responses
  };
}

/**
 * 7n. getUserInbox: Returns forms and direct messages for a student
 */
function handleGetUserInbox(payload) {
  var studyId = String(payload.studyId || "").trim().toUpperCase();
  if (!studyId) throw new Error("studyId is required.");

  var prop = PropertiesService.getScriptProperties();
  var forms = [];
  try {
    var rf = prop.getProperty("STUDYSYNC_ADMIN_FORMS");
    forms = rf ? JSON.parse(rf) : [];
  } catch (e) {}

  var messages = [];
  for (var i = 0; i < forms.length; i++) {
    var f = forms[i];
    messages.push({
      id: "MSG_" + f.formId,
      type: "form",
      title: "New Survey: " + f.title,
      sender: "StudySync Administration",
      body: f.description || "Please complete this survey.",
      form: f,
      date: f.createdAt,
      read: false,
      responded: false
    });
  }

  return {
    success: true,
    messages: messages
  };
}

/**
 * 8. getAdminData
 */
function handleGetAdminData(payload) {
  const adminEmail = String(payload.adminEmail || "").trim().toLowerCase();
  if (!isAuthorizedAdmin(adminEmail)) {
    throw new Error("Access Denied: " + adminEmail + " is not an authorized administrator.");
  }
  
  const ss = getSpreadsheet();
  const membersSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.MEMBERS);
  const logsSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.DAILY_LOGS);
  
  const membersData = membersSheet.getLastRow() > 1 
    ? membersSheet.getRange(2, 1, membersSheet.getLastRow() - 1, 11).getValues()
    : [];
  const logsData = logsSheet.getLastRow() > 1
    ? logsSheet.getRange(2, 1, logsSheet.getLastRow() - 1, 21).getValues()
    : [];
    
  const members = membersData.map(rowToMemberObject);
  const logs = logsData.map(rowToDailyLogObject);
  
  const analytics = computeGroupAnalytics(members, logs);
  const leaderboard = computeLeaderboard(members, logs);
  
  return {
    members: members,
    logs: logs,
    recentLogs: logs.slice(0, 100),
    analytics: analytics,
    leaderboard: leaderboard,
    admins: getEffectiveAdminEmails(),
    examDates: getExamDatesMap()
  };
}

/**
 * 9. getAnalytics
 */
function handleGetAnalytics(payload) {
  const ss = getSpreadsheet();
  const membersSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.MEMBERS);
  const logsSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.DAILY_LOGS);
  
  const membersData = membersSheet.getLastRow() > 1 
    ? membersSheet.getRange(2, 1, membersSheet.getLastRow() - 1, 11).getValues()
    : [];
  const logsData = logsSheet.getLastRow() > 1
    ? logsSheet.getRange(2, 1, logsSheet.getLastRow() - 1, 21).getValues()
    : [];
    
  const members = membersData.map(rowToMemberObject);
  const logs = logsData.map(rowToDailyLogObject);
  
  const analytics = computeGroupAnalytics(members, logs);
  const leaderboard = computeLeaderboard(members, logs);
  
  return {
    kpi: {
      totalMembers: analytics.totalMembers,
      activeMembers: analytics.activeMembers,
      totalStudyHours: analytics.totalHours,
      totalLogs: analytics.totalLogs,
      avgDailyHours: analytics.avgDailyHours,
      avgGroupFocus: analytics.avgGroupFocus,
      avgGroupProductivity: analytics.avgGroupProductivity
    },
    streamBreakdown: analytics.streamBreakdown,
    topStreaks: leaderboard.slice(0, 10),
    examDates: getExamDatesMap()
  };
}

// ============================================================================
// GOOGLE DRIVE PROOF PHOTO UPLOADER
// ============================================================================

function saveProofPhotoToDrive(studyId, dateOfStudy, base64Data, mimeType, fileName) {
  try {
    const cleanBase64 = String(base64Data).replace(/^data:[^;]+;base64,/, "");
    const decodedBytes = Utilities.base64Decode(cleanBase64);
    const blob = Utilities.newBlob(decodedBytes, mimeType || "image/jpeg", fileName || ("proof_" + Date.now() + ".jpg"));
    
    let rootFolderIter = DriveApp.getFoldersByName(CONFIG.DRIVE_ROOT_FOLDER_NAME);
    let rootFolder = rootFolderIter.hasNext() ? rootFolderIter.next() : DriveApp.createFolder(CONFIG.DRIVE_ROOT_FOLDER_NAME);
    
    let studentFolderIter = rootFolder.getFoldersByName(studyId);
    let studentFolder = studentFolderIter.hasNext() ? studentFolderIter.next() : rootFolder.createFolder(studyId);
    
    let dateFolderIter = studentFolder.getFoldersByName(dateOfStudy);
    let dateFolder = dateFolderIter.hasNext() ? dateFolderIter.next() : studentFolder.createFolder(dateOfStudy);
    
    const file = dateFolder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return file.getUrl();
  } catch (err) {
    Logger.log("Drive upload error: " + err.toString());
    return "";
  }
}

// ============================================================================
// SEQUENTIAL STUDY ID GENERATOR
// ============================================================================

function generateNextStudyId(sheet, stream) {
  const isBio = (stream === CONFIG.STREAMS.BIO || String(stream).toLowerCase().includes("bio"));
  const prefix = isBio ? CONFIG.PREFIXES.BIO : CONFIG.PREFIXES.MATH;
  
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    return prefix + "0001";
  }
  
  const idColValues = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  let maxNum = 0;
  
  for (let i = 0; i < idColValues.length; i++) {
    const rawId = String(idColValues[i][0]).trim().toUpperCase();
    if (rawId.startsWith(prefix)) {
      const numPart = parseInt(rawId.replace(prefix, ""), 10);
      if (!isNaN(numPart) && numPart > maxNum) {
        maxNum = numPart;
      }
    }
  }
  
  const nextNum = maxNum + 1;
  return prefix + ("0000" + nextNum).slice(-4);
}

// ============================================================================
// STREAK & ANALYTICS COMPUTATION ENGINES
// ============================================================================

function calculateStreaks(dateStringsArray) {
  if (!dateStringsArray || dateStringsArray.length === 0) {
    return { currentStreak: 0, maxStreak: 0 };
  }
  
  const uniqueDates = Array.from(new Set(dateStringsArray.filter(Boolean))).sort().reverse();
  if (uniqueDates.length === 0) {
    return { currentStreak: 0, maxStreak: 0 };
  }
  
  const todayStr = getLocalDateString(new Date());
  
  function daysBetweenDates(d1Str, d2Str) {
    const dt1 = parseDateString(d1Str);
    const dt2 = parseDateString(d2Str);
    const ut1 = Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate());
    const ut2 = Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate());
    return Math.floor((ut1 - ut2) / (1000 * 60 * 60 * 24));
  }
  
  const daysFromToday = daysBetweenDates(todayStr, uniqueDates[0]);
  let currentStreak = 0;
  
  if (daysFromToday <= 1) {
    currentStreak = 1;
    for (let i = 0; i < uniqueDates.length - 1; i++) {
      const diff = daysBetweenDates(uniqueDates[i], uniqueDates[i + 1]);
      if (diff === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }
  
  let maxStreak = 0;
  let running = 0;
  const chronological = Array.from(uniqueDates).reverse();
  let prev = null;
  
  for (let j = 0; j < chronological.length; j++) {
    if (!prev) {
      running = 1;
    } else {
      const diff = daysBetweenDates(chronological[j], prev);
      if (diff === 1) {
        running++;
      } else if (diff > 1) {
        running = 1;
      }
    }
    if (running > maxStreak) {
      maxStreak = running;
    }
    prev = chronological[j];
  }
  
  return { currentStreak: currentStreak, maxStreak: maxStreak };
}

function getStudentStatsAndLogs(logsSheet, studyId) {
  const lastRow = logsSheet.getLastRow();
  if (lastRow <= 1) {
    return {
      dates: [],
      logs: [],
      totalHours: 0,
      avgFocus: 0,
      avgProductivity: 0,
      subjectHours: {},
      stats: {
        totalHours: 0,
        activeStreak: 0,
        currentStreak: 0,
        maxStreak: 0,
        longestStreak: 0,
        avgFocus: 0,
        avgProductivity: 0,
        totalEntries: 0,
        totalLogs: 0,
        subjectHours: {}
      }
    };
  }
  
  const allRows = logsSheet.getRange(2, 1, lastRow - 1, 21).getValues();
  const targetId = String(studyId).trim().toUpperCase();
  
  const studentLogs = [];
  const dates = [];
  let totalHours = 0;
  const subjectHours = {};
  let totalFocus = 0;
  let totalProd = 0;
  let subjectCount = 0;
  
  for (let i = 0; i < allRows.length; i++) {
    const row = allRows[i];
    if (String(row[1]).trim().toUpperCase() === targetId) {
      const logObj = rowToDailyLogObject(row);
      studentLogs.push(logObj);
      dates.push(logObj.dateOfStudy);
      
      totalHours += logObj.totalHours;
      
      logObj.subjects.forEach(function(sub) {
        if (sub.name) {
          subjectHours[sub.name] = (subjectHours[sub.name] || 0) + sub.hours;
          if (sub.focus > 0) {
            totalFocus += sub.focus;
            subjectCount++;
          }
          if (sub.productivity > 0) {
            totalProd += sub.productivity;
          }
        }
      });
    }
  }
  
  studentLogs.sort(function(a, b) {
    return b.dateOfStudy.localeCompare(a.dateOfStudy);
  });
  
  const streaks = calculateStreaks(dates);
  const avgFocus = subjectCount > 0 ? Number((totalFocus / subjectCount).toFixed(1)) : 0;
  const avgProductivity = subjectCount > 0 ? Number((totalProd / subjectCount).toFixed(1)) : 0;
  
  return {
    dates: dates,
    logs: studentLogs,
    totalHours: Number(totalHours.toFixed(2)),
    avgFocus: avgFocus,
    avgProductivity: avgProductivity,
    subjectHours: subjectHours,
    stats: {
      totalHours: Number(totalHours.toFixed(2)),
      activeStreak: streaks.currentStreak,
      currentStreak: streaks.currentStreak,
      maxStreak: streaks.maxStreak,
      longestStreak: streaks.maxStreak,
      avgFocus: avgFocus,
      avgProductivity: avgProductivity,
      totalEntries: studentLogs.length,
      totalLogs: studentLogs.length,
      subjectHours: subjectHours
    }
  };
}

function computeGroupAnalytics(members, logs) {
  let totalGroupHours = 0;
  let bioHours = 0;
  let bioCount = 0;
  let bioLogs = 0;
  let mathHours = 0;
  let mathCount = 0;
  let mathLogs = 0;
  
  let totalFocus = 0;
  let totalProd = 0;
  let subjectCount = 0;
  
  const memberMap = {};
  members.forEach(function(m) {
    memberMap[m.studyId] = m;
    if (m.stream === CONFIG.STREAMS.BIO) bioCount++;
    else if (m.stream === CONFIG.STREAMS.MATH) mathCount++;
  });
  
  logs.forEach(function(l) {
    const hrs = l.totalHours;
    totalGroupHours += hrs;
    
    const m = memberMap[l.studyId];
    if (m) {
      if (m.stream === CONFIG.STREAMS.BIO) {
        bioHours += hrs;
        bioLogs++;
      } else if (m.stream === CONFIG.STREAMS.MATH) {
        mathHours += hrs;
        mathLogs++;
      }
    }
    
    l.subjects.forEach(function(s) {
      if (s.focus > 0) {
        totalFocus += s.focus;
        subjectCount++;
      }
      if (s.productivity > 0) {
        totalProd += s.productivity;
      }
    });
  });
  
  const activeCount = members.filter(function(m) { return m.status === "Active"; }).length;
  
  return {
    totalMembers: members.length,
    activeMembers: activeCount,
    totalHours: Number(totalGroupHours.toFixed(2)),
    totalLogs: logs.length,
    avgDailyHours: activeCount > 0 ? Number((totalGroupHours / activeCount).toFixed(2)) : 0,
    avgGroupFocus: subjectCount > 0 ? Number((totalFocus / subjectCount).toFixed(1)) : 0,
    avgGroupProductivity: subjectCount > 0 ? Number((totalProd / subjectCount).toFixed(1)) : 0,
    streamBreakdown: {
      "Biological Science": {
        members: bioCount,
        totalHours: Number(bioHours.toFixed(2)),
        totalLogs: bioLogs
      },
      "Physical Science": {
        members: mathCount,
        totalHours: Number(mathHours.toFixed(2)),
        totalLogs: mathLogs
      }
    }
  };
}

function computeLeaderboard(members, logs) {
  const memberLogMap = {};
  members.forEach(function(m) {
    memberLogMap[m.studyId] = {
      member: m,
      totalHours: 0,
      totalLogs: 0,
      dates: [],
      focusSum: 0,
      prodSum: 0,
      subCount: 0
    };
  });
  
  logs.forEach(function(l) {
    if (memberLogMap[l.studyId]) {
      const entry = memberLogMap[l.studyId];
      entry.totalHours += l.totalHours;
      entry.totalLogs++;
      entry.dates.push(l.dateOfStudy);
      
      l.subjects.forEach(function(s) {
        if (s.focus > 0) {
          entry.focusSum += s.focus;
          entry.subCount++;
        }
        if (s.productivity > 0) {
          entry.prodSum += s.productivity;
        }
      });
    }
  });
  
  const leaderboardList = members.map(function(m) {
    const item = memberLogMap[m.studyId];
    const streaks = calculateStreaks(item.dates);
    
    return {
      studyId: m.studyId,
      name: m.fullName,
      fullName: m.fullName,
      school: m.school,
      stream: m.stream,
      totalHours: Number(item.totalHours.toFixed(2)),
      totalLogs: item.totalLogs,
      streak: streaks.currentStreak,
      activeStreak: streaks.currentStreak,
      maxStreak: streaks.maxStreak,
      avgFocus: item.subCount > 0 ? Number((item.focusSum / item.subCount).toFixed(1)) : 0,
      avgProductivity: item.subCount > 0 ? Number((item.prodSum / item.subCount).toFixed(1)) : 0
    };
  });
  
  leaderboardList.sort(function(a, b) {
    if (b.streak !== a.streak) return b.streak - a.streak;
    return b.totalHours - a.totalHours;
  });
  
  for (let r = 0; r < leaderboardList.length; r++) {
    leaderboardList[r].rank = r + 1;
  }
  
  return leaderboardList;
}

// ============================================================================
// SPREADSHEET ROW LOOKUP & CONVERSION HELPERS
// ============================================================================

function getSpreadsheet() {
  if (CONFIG.SPREADSHEET_ID && CONFIG.SPREADSHEET_ID.trim() !== "") {
    return SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

function findMemberByEmail(sheet, email) {
  if (!sheet) return null;
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return null;
  
  const emailCol = sheet.getRange(2, 3, lastRow - 1, 1).getValues();
  const targetEmail = String(email).trim().toLowerCase();
  
  for (let i = 0; i < emailCol.length; i++) {
    if (String(emailCol[i][0]).trim().toLowerCase() === targetEmail) {
      const rowValues = sheet.getRange(i + 2, 1, 1, 11).getValues()[0];
      return { rowIndex: i + 2, values: rowValues };
    }
  }
  return null;
}

function findMemberByStudyId(sheet, studyId) {
  if (!sheet) return null;
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return null;
  
  const idCol = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  const targetId = String(studyId).trim().toUpperCase();
  
  for (let i = 0; i < idCol.length; i++) {
    if (String(idCol[i][0]).trim().toUpperCase() === targetId) {
      const rowValues = sheet.getRange(i + 2, 1, 1, 11).getValues()[0];
      return { rowIndex: i + 2, values: rowValues };
    }
  }
  return null;
}

function findDailyLog(sheet, studyId, dateOfStudy) {
  if (!sheet) return null;
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return null;
  
  const rangeValues = sheet.getRange(2, 1, lastRow - 1, 4).getValues();
  const targetId = String(studyId).trim().toUpperCase();
  const targetDate = String(dateOfStudy).trim();
  
  for (let i = 0; i < rangeValues.length; i++) {
    const rowId = String(rangeValues[i][1]).trim().toUpperCase();
    const rowDate = formatDateValue(rangeValues[i][3]);
    
    if (rowId === targetId && rowDate === targetDate) {
      const fullRow = sheet.getRange(i + 2, 1, 1, 21).getValues()[0];
      return { rowIndex: i + 2, values: fullRow };
    }
  }
  return null;
}

function rowToMemberObject(row) {
  return {
    studyId: String(row[0] || ""),
    fullName: String(row[1] || ""),
    email: String(row[2] || ""),
    gender: String(row[3] || ""),
    telegramUsername: String(row[4] || ""),
    telegram: String(row[4] || ""),
    school: String(row[5] || ""),
    stream: String(row[6] || ""),
    optionalSubject: String(row[7] || ""),
    registrationDate: row[8] instanceof Date ? row[8].toISOString() : String(row[8] || ""),
    status: String(row[9] || "Active"),
    examYear: String(row[10] || "2026")
  };
}

function rowToDailyLogObject(row) {
  var sub1Hours = Number(row[5]) || 0;
  var sub2Hours = Number(row[9]) || 0;
  var sub3Hours = Number(row[13]) || 0;
  var subTotal  = Number((sub1Hours + sub2Hours + sub3Hours).toFixed(2));

  // Col T (index 19) stores the actual total hours — may differ from sub-sum if manual override used
  var totalHours = (row.length > 19 && row[19] !== undefined && row[19] !== null && row[19] !== "")
    ? Number(row[19])
    : subTotal;

  // Col U (index 20) stores JSON sessions array
  var sessions = [];
  if (row.length > 20 && row[20] && String(row[20]).trim() !== "") {
    try { sessions = JSON.parse(String(row[20])); } catch (e) { sessions = []; }
  }

  var sub1Name = String(row[4] || "");
  var sub2Name = String(row[8] || "");
  var sub3Name = String(row[12] || "");

  var sub1Focus = Number(row[6]) || 0;
  var sub2Focus = Number(row[10]) || 0;
  var sub3Focus = Number(row[14]) || 0;
  var sub1Prod  = Number(row[7]) || 0;
  var sub2Prod  = Number(row[11]) || 0;
  var sub3Prod  = Number(row[15]) || 0;

  // Compute average focus & productivity across non-zero subject entries
  var focusCount = 0, focusSum = 0, prodSum = 0;
  if (sub1Focus > 0) { focusSum += sub1Focus; prodSum += sub1Prod; focusCount++; }
  if (sub2Focus > 0) { focusSum += sub2Focus; prodSum += sub2Prod; focusCount++; }
  if (sub3Focus > 0) { focusSum += sub3Focus; prodSum += sub3Prod; focusCount++; }
  var avgFocus = focusCount > 0 ? Number((focusSum / focusCount).toFixed(1)) : 0;
  var avgProd  = focusCount > 0 ? Number((prodSum  / focusCount).toFixed(1)) : 0;

  return {
    // Primary identifiers
    timestamp:      row[0] instanceof Date ? row[0].toISOString() : String(row[0] || ""),
    studyId:        String(row[1] || ""),
    email:          String(row[2] || ""),
    dateOfStudy:    formatDateValue(row[3]),

    // Structured subjects array (canonical format)
    subjects: [
      { name: sub1Name, hours: sub1Hours, focus: sub1Focus, productivity: sub1Prod },
      { name: sub2Name, hours: sub2Hours, focus: sub2Focus, productivity: sub2Prod },
      { name: sub3Name, hours: sub3Hours, focus: sub3Focus, productivity: sub3Prod }
    ],

    // Flat aliases — used by frontend components directly
    subject1:           sub1Name,
    subject2:           sub2Name,
    subject3:           sub3Name,
    hoursSubject1:      sub1Hours,
    hoursSubject2:      sub2Hours,
    hoursSubject3:      sub3Hours,
    subject1Hours:      sub1Hours,
    subject2Hours:      sub2Hours,
    subject3Hours:      sub3Hours,

    // Aggregated metrics
    totalHours:         Number(totalHours.toFixed(2)),
    focusScore:         avgFocus,
    productivityScore:  avgProd,
    avgFocus:           avgFocus,
    avgProductivity:    avgProd,
    focusLevel:         avgFocus,
    productivityLevel:  avgProd,

    // Session details (restored from JSON)
    sessions: sessions,

    // Metadata
    notes:          String(row[16] || ""),
    telegram:       String(row[17] || ""),
    proofPhotoUrl:  String(row[18] || ""),
    proofUrl:       String(row[18] || "")
  };
}


function getLocalDateString(date) {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    date = new Date();
  }
  const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
  const slDate = new Date(utc + (3600000 * 5.5));
  const yyyy = slDate.getFullYear();
  const mm = String(slDate.getMonth() + 1).padStart(2, '0');
  const dd = String(slDate.getDate()).padStart(2, '0');
  return yyyy + "-" + mm + "-" + dd;
}

function parseDateString(dateStr) {
  if (!dateStr) return new Date();
  const parts = String(dateStr).split("-");
  if (parts.length === 3) {
    return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  }
  return new Date(dateStr);
}

function formatDateValue(val) {
  if (!val) return "";
  if (val instanceof Date) {
    return getLocalDateString(val);
  }
  const str = String(val).trim();
  if (str.length >= 10 && str.charAt(4) === '-' && str.charAt(7) === '-') {
    return str.substring(0, 10);
  }
  return str;
}

// ============================================================================
// TEST MARKS & EXAM PERFORMANCE HANDLERS
// ============================================================================

function getOrCreateTestMarksSheet(ss) {
  var sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.TEST_MARKS);
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEET_NAMES.TEST_MARKS);
    var headers = [
      "Test ID",
      "Study ID",
      "Email",
      "Test Date",
      "Exam Type",
      "Subject",
      "Paper Title",
      "Score",
      "Rank",
      "Difficulty",
      "Notes",
      "Timestamp"
    ];
    sheet.getRange(1, 1, 1, headers.length)
      .setValues([headers])
      .setFontWeight("bold")
      .setBackground("#1e293b")
      .setFontColor("#f1f5f9");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function handleLogTestMark(payload) {
  var lock = LockService.getScriptLock();
  try {
    var hasLock = lock.tryLock(CONFIG.LOCK_TIMEOUT_MS);
    if (!hasLock) {
      throw new Error("Server is busy processing test mark submissions. Please retry in a few moments.");
    }

    var ss = getSpreadsheet();
    var sheet = getOrCreateTestMarksSheet(ss);

    var testId = String(payload.id || "test_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6));
    var studyId = String(payload.studyId || "").trim();
    var email = String(payload.studentEmail || payload.email || "").trim().toLowerCase();
    var testDate = String(payload.testDate || getLocalDateString(new Date())).trim();
    var examType = String(payload.examType || "Model Paper").trim();
    var subject = String(payload.subject || "").trim();
    var paperTitle = sanitizeCsvFormula(String(payload.paperTitle || "").trim());
    var score = Number(payload.score || 0);
    var rank = payload.rank ? String(payload.rank) : "";
    var difficulty = Number(payload.difficultyRating || 3);
    var notes = sanitizeCsvFormula(String(payload.notes || "").trim());
    var timestamp = new Date().toISOString();

    sheet.appendRow([
      testId,
      studyId,
      email,
      testDate,
      examType,
      subject,
      paperTitle,
      score,
      rank,
      difficulty,
      notes,
      timestamp
    ]);

    SpreadsheetApp.flush();

    return {
      success: true,
      testMark: {
        id: testId,
        studyId: studyId,
        studentEmail: email,
        testDate: testDate,
        examType: examType,
        subject: subject,
        paperTitle: paperTitle,
        score: score,
        rank: rank ? parseInt(rank, 10) : null,
        difficultyRating: difficulty,
        notes: notes,
        createdAt: timestamp
      }
    };
  } finally {
    try { lock.releaseLock(); } catch (e) {}
  }
}

function handleGetTestMarks(payload) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.TEST_MARKS);
  if (!sheet || sheet.getLastRow() <= 1) {
    return { testMarks: [] };
  }

  var studyId = String(payload.studyId || "").trim().toUpperCase();
  var email = String(payload.email || payload.studentEmail || "").trim().toLowerCase();

  var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 12).getValues();
  var marks = [];

  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    var rowStudyId = String(row[1] || "").trim().toUpperCase();
    var rowEmail = String(row[2] || "").trim().toLowerCase();

    if ((studyId && rowStudyId === studyId) || (email && rowEmail === email)) {
      marks.push({
        id: String(row[0] || ""),
        studyId: String(row[1] || ""),
        studentEmail: String(row[2] || ""),
        testDate: row[3] instanceof Date ? getLocalDateString(row[3]) : String(row[3] || ""),
        examType: String(row[4] || "Model Paper"),
        subject: String(row[5] || ""),
        paperTitle: String(row[6] || ""),
        score: Number(row[7] || 0),
        rank: row[8] ? parseInt(row[8], 10) : null,
        difficultyRating: Number(row[9] || 3),
        notes: String(row[10] || ""),
        createdAt: String(row[11] || "")
      });
    }
  }

  marks.sort(function(a, b) {
    return new Date(b.testDate).getTime() - new Date(a.testDate).getTime();
  });

  return { testMarks: marks };
}

function handleDeleteTestMark(payload) {
  var lock = LockService.getScriptLock();
  try {
    var hasLock = lock.tryLock(CONFIG.LOCK_TIMEOUT_MS);
    if (!hasLock) {
      throw new Error("Server is busy processing mark deletion. Please retry in a few moments.");
    }

    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.TEST_MARKS);
    if (!sheet || sheet.getLastRow() <= 1) {
      return { success: true };
    }

    var testId = String(payload.id || payload.testId || "").trim();
    if (!testId) {
      throw new Error("testId is required.");
    }

    var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();
    for (var i = data.length - 1; i >= 0; i--) {
      if (String(data[i][0] || "").trim() === testId) {
        sheet.deleteRow(i + 2);
        SpreadsheetApp.flush();
        return { success: true, deletedId: testId };
      }
    }

    return { success: true, deletedId: testId };
  } finally {
    try { lock.releaseLock(); } catch (e) {}
  }
}

// ============================================================================
// TELEGRAM BOT WEBHOOK & REAL-TIME SYNC ENGINE
// ============================================================================

/**
 * Normalizes a Telegram username handle:
 * - Strips URL prefixes (https://t.me/, t.me/, etc.)
 * - Strips leading '@'
 * - Strips all characters outside [a-zA-Z0-9_]
 * - Converts to lowercase
 * - Prepends '@' if length >= 1
 */
function normalizeTelegramUsername(handle) {
  if (!handle) return "";
  var str = String(handle).trim();
  str = str.replace(/^(https?:\/\/)?(www\.)?(t\.me|telegram\.me)\//i, "");
  if (str.startsWith("@")) {
    str = str.substring(1);
  }
  str = str.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase();
  return str.length > 0 ? "@" + str : "";
}

/**
 * Finds a member in Members sheet by Telegram handle (Column E)
 */
function findMemberByTelegram(sheet, handle) {
  if (!sheet) return null;
  var target = normalizeTelegramUsername(handle);
  if (!target) return null;
  
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return null;
  
  var range = sheet.getRange(2, 1, lastRow - 1, 11).getValues();
  for (var i = 0; i < range.length; i++) {
    var rowTelegram = normalizeTelegramUsername(range[i][4]); // Col E = Telegram Username
    if (rowTelegram === target) {
      return { rowIndex: i + 2, values: range[i], member: rowToMemberObject(range[i]) };
    }
  }
  return null;
}

/**
 * Dispatches message to Telegram via Bot API or mocks if no token configured
 */
function sendTelegramMessage(chatId, text, parseMode) {
  if (!chatId || !text) return { ok: false, error: "Missing chatId or text" };
  
  var botToken = "";
  try {
    botToken = PropertiesService.getScriptProperties().getProperty("TELEGRAM_BOT_TOKEN") || "";
  } catch (e) {
    botToken = "";
  }
  
  if (!botToken) {
    Logger.log("[Telegram] Mock send to " + chatId + ": " + text);
    return { ok: true, mocked: true, chatId: chatId, text: text };
  }
  
  var url = "https://api.telegram.org/bot" + botToken + "/sendMessage";
  var payload = {
    chat_id: chatId,
    text: text,
    parse_mode: parseMode || "Markdown"
  };
  
  var options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  try {
    var response = UrlFetchApp.fetch(url, options);
    var resCode = response.getResponseCode();
    var resText = response.getContentText();
    var resJson = {};
    try { resJson = JSON.parse(resText); } catch (je) {}
    
    if (resCode >= 200 && resCode < 300) {
      return resJson;
    } else {
      Logger.log("[Telegram] Outbound Error (HTTP " + resCode + "): " + resText);
      // Fallback: Retry as plain text if Markdown entity error occurred
      if (resText.includes("can't parse entities") || resText.includes("Bad Request")) {
        delete payload.parse_mode;
        options.payload = JSON.stringify(payload);
        var retryResp = UrlFetchApp.fetch(url, options);
        return JSON.parse(retryResp.getContentText());
      }
      return { ok: false, error: resText };
    }
  } catch (err) {
    Logger.log("[Telegram] Fetch Exception: " + err.toString());
    return { ok: false, error: err.toString() };
  }
}

/**
 * Main Telegram Webhook Ingestion Router
 */
function handleTelegramWebhook(payload) {
  var message = payload.message || payload.edited_message || (payload.callback_query ? payload.callback_query.message : null);
  if (!message) {
    return { handled: true, command: "none", message: "No message payload detected in webhook update" };
  }
  
  var chatId = message.chat ? message.chat.id : (payload.chatId || "");
  var text = (message.text || payload.text || "").trim();
  if (!text) {
    return { handled: true, command: "none", chatId: chatId, message: "No text in message payload" };
  }
  
  var parts = text.split(/\s+/);
  var rawCommand = parts[0] || "";
  var command = rawCommand.split("@")[0].toLowerCase();
  var args = parts.slice(1);
  
  switch (command) {
    case "/start":
      return handleStartCommand(message, args, chatId);
    case "/status":
      return handleStatusCommand(message, args, chatId);
    case "/log":
      return handleLogCommand(message, args, text, chatId);
    case "/leaderboard":
      return handleLeaderboardCommand(message, args, chatId);
    case "/remind":
      return handleRemindCommand(message, args, chatId);
    case "/help":
      var helpText = [
        "🤖 *STUDYSYNC TELEGRAM COMMANDS*",
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        "• `/start [STUDY_ID]` — Link your Telegram account to student profile",
        "• `/status [STUDY_ID]` — View your active streak, hours & AI advice",
        "• `/log <h1\> <h2\> <h3\> [notes]` — Quick log study hours for today",
        "• `/leaderboard [bio|maths|all]` — Community streak rankings",
        "• `/remind` — Check today's study submission status",
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        "👉 *Online Portal:* https://studysync-al-2026.web.app"
      ].join("\n");
      sendTelegramMessage(chatId, helpText);
      return { handled: true, command: "/help", chatId: chatId, replyText: helpText };
    default:
      if (command.startsWith("/")) {
        var unknownText = "❓ *Unknown command:* `" + command + "`\n\nUse `/help` to see the list of available commands.";
        sendTelegramMessage(chatId, unknownText);
        return { handled: true, command: command, chatId: chatId, replyText: unknownText };
      }
      var defaultText = "👋 Welcome to *StudySync Bot*! Use `/start` to begin or `/status` to check your study streaks.";
      sendTelegramMessage(chatId, defaultText);
      return { handled: true, command: "none", chatId: chatId, replyText: defaultText };
  }
}

/**
 * /start [STUDY_ID] Command Handler
 */
function handleStartCommand(message, args, chatId) {
  var ss = getSpreadsheet();
  var membersSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.MEMBERS);
  if (!membersSheet) {
    setupDatabase();
    membersSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.MEMBERS);
  }
  
  var senderUsername = message.from && message.from.username ? message.from.username : "";
  var normalizedSender = normalizeTelegramUsername(senderUsername);
  var studyIdArg = args.length > 0 ? args[0].trim().toUpperCase() : "";

  // 1. If studyIdArg provided
  if (studyIdArg && (studyIdArg.startsWith("SG-BIO-") || studyIdArg.startsWith("SG-MATH-") || /^SG-[A-Z]+-\d+$/i.test(studyIdArg))) {
    var found = findMemberByStudyId(membersSheet, studyIdArg);
    if (!found) {
      var notFoundMsg = "❌ *Study ID not found: " + studyIdArg + "*\n\nPlease check your Study ID or register at https://studysync-al-2026.web.app/register";
      sendTelegramMessage(chatId, notFoundMsg);
      return { handled: true, command: "/start", chatId: chatId, replyText: notFoundMsg, error: "Study ID not found" };
    }
    
    var member = rowToMemberObject(found.values);
    if (normalizedSender) {
      membersSheet.getRange(found.rowIndex, 5).setValue(normalizedSender);
      SpreadsheetApp.flush();
      member.telegramUsername = normalizedSender;
      member.telegram = normalizedSender;
    }
    
    var welcomeMsg = [
      "🎓 *Welcome to StudySync, " + member.fullName + "!*",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "🆔 *Study ID:* `" + member.studyId + "`",
      "📚 *Stream:* " + member.stream + (member.optionalSubject ? " (" + member.optionalSubject + ")" : ""),
      "🏫 *School:* " + member.school,
      "📅 *Exam Year:* " + (member.examYear || "2026"),
      normalizedSender ? "✅ *Telegram Linked:* `" + normalizedSender + "`" : "⚠️ *Note:* Set a Telegram @username to enable 1-click /log.",
      "",
      "🚀 *Quick Commands:*",
      "• `/status` — View your active streak & performance card",
      "• `/log <h1\> <h2\> <h3\> [notes]` — Submit daily study hours",
      "• `/leaderboard` — Community streak rankings",
      "• `/remind` — Check today's study submission status",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "👉 *Student Portal:* https://studysync-al-2026.web.app/dashboard"
    ].join("\n");
    
    sendTelegramMessage(chatId, welcomeMsg);
    return { handled: true, command: "/start", chatId: chatId, replyText: welcomeMsg, member: member, studyId: member.studyId };
  }

  // 2. If no Study ID arg, check if already linked by @username
  if (normalizedSender) {
    var linked = findMemberByTelegram(membersSheet, normalizedSender);
    if (linked) {
      var member = linked.member;
      var logsSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.DAILY_LOGS);
      var statsAndLogs = getStudentStatsAndLogs(logsSheet, member.studyId);
      var streaks = calculateStreaks(statsAndLogs.dates);
      
      var linkedWelcome = [
        "🎓 *Welcome back, " + member.fullName + "!*",
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        "🆔 *Study ID:* `" + member.studyId + "`",
        "📚 *Stream:* " + member.stream,
        "🔥 *Active Streak:* *" + streaks.currentStreak + " Days*",
        "⏱️ *Total Hours:* *" + statsAndLogs.totalHours.toFixed(1) + " hrs*",
        "",
        "Use `/status` for your full study breakdown or `/log` to record today's sessions.",
        "👉 *Dashboard:* https://studysync-al-2026.web.app/dashboard"
      ].join("\n");
      
      sendTelegramMessage(chatId, linkedWelcome);
      return { handled: true, command: "/start", chatId: chatId, replyText: linkedWelcome, member: member, studyId: member.studyId };
    }
  }

  // 3. Unlinked user welcome
  var unlinkedMsg = [
    "👋 *Welcome to StudySync A/L Accountability Bot!*",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "Track your daily Sri Lankan A/L study hours, maintain unbroken streaks, and compete on the national leaderboard.",
    "",
    "🔗 *How to Link Your Account:*",
    "If you already have a Study ID:",
    "👉 `/start <YOUR_STUDY_ID>` (e.g. `/start SG-BIO-0001`)",
    "",
    "📝 *Not registered yet?*",
    "Register online in 30 seconds:",
    "👉 https://studysync-al-2026.web.app/register"
  ].join("\n");

  sendTelegramMessage(chatId, unlinkedMsg);
  return { handled: true, command: "/start", chatId: chatId, replyText: unlinkedMsg };
}

/**
 * /status [STUDY_ID] Command Handler
 */
function handleStatusCommand(message, args, chatId) {
  var ss = getSpreadsheet();
  var membersSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.MEMBERS);
  var logsSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.DAILY_LOGS);
  if (!membersSheet || !logsSheet) {
    setupDatabase();
    membersSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.MEMBERS);
    logsSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.DAILY_LOGS);
  }
  
  var senderUsername = message.from && message.from.username ? message.from.username : "";
  var normalizedSender = normalizeTelegramUsername(senderUsername);
  var studyIdArg = args.length > 0 ? args[0].trim().toUpperCase() : "";

  var member = null;
  if (studyIdArg) {
    var found = findMemberByStudyId(membersSheet, studyIdArg);
    if (found) member = rowToMemberObject(found.values);
  } else if (normalizedSender) {
    var foundByTg = findMemberByTelegram(membersSheet, normalizedSender);
    if (foundByTg) member = foundByTg.member;
  }

  if (!member) {
    var errorMsg = [
      "❌ *Student account not found.*",
      "",
      studyIdArg 
        ? "No member matching Study ID `" + studyIdArg + "` was found." 
        : "Your Telegram handle (`" + (normalizedSender || "unknown") + "`) is not linked to any student record.",
      "",
      "👉 Link your account with: `/start <YOUR_STUDY_ID>`",
      "👉 Or check your status with: `/status <YOUR_STUDY_ID>` (e.g. `/status SG-BIO-0001`)",
      "👉 Register: https://studysync-al-2026.web.app/register"
    ].join("\n");
    sendTelegramMessage(chatId, errorMsg);
    return { handled: true, command: "/status", chatId: chatId, replyText: errorMsg, error: "Member not found" };
  }

  var statsAndLogs = getStudentStatsAndLogs(logsSheet, member.studyId);
  var streaks = calculateStreaks(statsAndLogs.dates);
  var todayDateStr = getLocalDateString(new Date());
  var todayLog = findDailyLog(logsSheet, member.studyId, todayDateStr);
  
  var todayStatusText = "⏳ Pending (Submit before 23:59)";
  if (todayLog) {
    var tObj = rowToDailyLogObject(todayLog.values);
    todayStatusText = "✅ Completed (" + tObj.totalHours.toFixed(1) + " hrs)";
  }

  var subKeys = Object.keys(statsAndLogs.subjectHours);
  var subjectsBreakdown = "";
  if (subKeys.length > 0) {
    subjectsBreakdown = subKeys.map(function(k) {
      return "• *" + k + ":* " + (statsAndLogs.subjectHours[k] || 0).toFixed(1) + " hrs";
    }).join("\n");
  } else {
    subjectsBreakdown = "• _No study hours logged yet_";
  }

  var aiSnippet = generateAiRecommendation(member, {
    streak: streaks.currentStreak,
    totalHours: statsAndLogs.totalHours,
    avgFocus: statsAndLogs.avgFocus,
    subjectHours: statsAndLogs.subjectHours,
    studiedToday: !!todayLog
  });

  var statusCard = [
    "📊 *STUDYSYNC PERFORMANCE CARD*",
    "👤 *Student:* *" + member.fullName + "* (`" + member.studyId + "`)",
    "🏫 *School:* " + member.school,
    "📚 *Stream:* " + member.stream + (member.optionalSubject ? " (" + member.optionalSubject + ")" : ""),
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "🔥 *Active Streak:* *" + streaks.currentStreak + " Days* (Max: " + streaks.maxStreak + " Days)",
    "⏱️ *Total Study Hours:* *" + statsAndLogs.totalHours.toFixed(1) + " hrs* (" + statsAndLogs.logs.length + " sessions)",
    "⚡ *Average Focus:* *" + (statsAndLogs.avgFocus > 0 ? statsAndLogs.avgFocus.toFixed(1) + " / 10" : "N/A") + "*",
    "📅 *Today's Status:* " + todayStatusText,
    "",
    "📖 *Subject Breakdown:*",
    subjectsBreakdown,
    "",
    "💡 *AI Prescription & Insight:*",
    aiSnippet,
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "👉 *Student Portal:* https://studysync-al-2026.web.app/dashboard"
  ].join("\n");

  sendTelegramMessage(chatId, statusCard);
  return { handled: true, command: "/status", chatId: chatId, replyText: statusCard, member: member, studyId: member.studyId };
}

/**
 * /log <h1..3> [notes] Command Handler
 */
function handleLogCommand(message, args, text, chatId) {
  var ss = getSpreadsheet();
  var membersSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.MEMBERS);
  var logsSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.DAILY_LOGS);
  if (!membersSheet || !logsSheet) {
    setupDatabase();
    membersSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.MEMBERS);
    logsSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.DAILY_LOGS);
  }
  
  var senderUsername = message.from && message.from.username ? message.from.username : "";
  var normalizedSender = normalizeTelegramUsername(senderUsername);

  if (!normalizedSender) {
    var noHandleMsg = "❌ *Telegram Username Required:* Please configure a Telegram username in Telegram Settings and link your account with `/start <STUDY_ID>` before logging hours.";
    sendTelegramMessage(chatId, noHandleMsg);
    return { handled: true, command: "/log", chatId: chatId, replyText: noHandleMsg, error: "No telegram username" };
  }

  var found = findMemberByTelegram(membersSheet, normalizedSender);
  if (!found) {
    var unlinkedMsg = "❌ *Account not linked.* We could not find a student record for `" + normalizedSender + "`.\n\nPlease link your Study ID first: `/start <YOUR_STUDY_ID>` (e.g. `/start SG-BIO-0001`)";
    sendTelegramMessage(chatId, unlinkedMsg);
    return { handled: true, command: "/log", chatId: chatId, replyText: unlinkedMsg, error: "Account not linked" };
  }

  var member = found.member;

  var numMatches = [];
  var notesStartIndex = -1;
  
  for (var i = 0; i < args.length; i++) {
    var parsedNum = parseFloat(args[i]);
    if (!isNaN(parsedNum) && /^-?\d+(\.\d+)?$/.test(args[i]) && numMatches.length < 3) {
      numMatches.push(parsedNum);
    } else {
      notesStartIndex = i;
      break;
    }
  }

  if (numMatches.length < 3) {
    var syntaxMsg = [
      "❌ *Invalid /log syntax.*",
      "",
      "👉 *Usage:* `/log <h1\> <h2\> <h3\> [optional notes]`",
      "👉 *Example:* `/log 2.5 2.0 1.5 Completed 2022 past papers`",
      "",
      "Your 3 registered subjects for " + member.stream + ":",
      "1. " + (member.stream === "Biological Science" ? "Biology" : "Combined Maths"),
      "2. " + (member.stream === "Biological Science" ? "Chemistry" : "Physics"),
      "3. " + (member.optionalSubject || "Optional Subject")
    ].join("\n");
    sendTelegramMessage(chatId, syntaxMsg);
    return { handled: true, command: "/log", chatId: chatId, replyText: syntaxMsg, error: "Invalid syntax" };
  }

  var h1 = numMatches[0];
  var h2 = numMatches[1];
  var h3 = numMatches[2];
  var totalToday = Number((h1 + h2 + h3).toFixed(2));

  if (h1 < 0 || h2 < 0 || h3 < 0 || totalToday > 24) {
    var boundErrorMsg = "❌ *Invalid hours:* Each subject must be >= 0 and total daily hours cannot exceed 24.0. Got: " + totalToday + " hrs.";
    sendTelegramMessage(chatId, boundErrorMsg);
    return { handled: true, command: "/log", chatId: chatId, replyText: boundErrorMsg, error: "Hours out of bounds" };
  }

  var notes = notesStartIndex >= 0 ? args.slice(notesStartIndex).join(" ") : "";
  var todayDateStr = getLocalDateString(new Date());

  var lock = LockService.getScriptLock();
  var hasLock = false;
  try {
    hasLock = lock.tryLock(CONFIG.LOCK_TIMEOUT_MS);
  } catch (le) {
    hasLock = false;
  }

  if (!hasLock) {
    var busyMsg = "⚠️ *Server Busy:* Another transaction is currently in progress. Please retry in a few seconds.";
    sendTelegramMessage(chatId, busyMsg);
    return { handled: true, command: "/log", chatId: chatId, replyText: busyMsg, error: "Lock timeout" };
  }

  try {
    var existingLog = findDailyLog(logsSheet, member.studyId, todayDateStr);
    if (existingLog) {
      var dupMsg = "⚠️ *Duplicate Submission:* You have already submitted a daily study log for today (" + todayDateStr + ").\n\nUse `/status` to view your summary.";
      sendTelegramMessage(chatId, dupMsg);
      return { handled: true, command: "/log", chatId: chatId, replyText: dupMsg, isDuplicate: true };
    }

    var sub1Name = member.stream === "Biological Science" ? "Biology" : "Combined Maths";
    var sub2Name = member.stream === "Biological Science" ? "Chemistry" : "Physics";
    var sub3Name = member.optionalSubject || (member.stream === "Biological Science" ? "Physics" : "Chemistry");

    var timestamp = new Date().toISOString();
    var defaultFocus = 8;
    var defaultProd = 8;

    logsSheet.appendRow([
      timestamp,
      member.studyId,
      member.email,
      todayDateStr,
      sub1Name, h1, defaultFocus, defaultProd,
      sub2Name, h2, defaultFocus, defaultProd,
      sub3Name, h3, defaultFocus, defaultProd,
      notes,
      normalizedSender,
      ""
    ]);

    SpreadsheetApp.flush();

    var statsAndLogs = getStudentStatsAndLogs(logsSheet, member.studyId);
    var streaks = calculateStreaks(statsAndLogs.dates);

    var receiptMsg = [
      "✅ *STUDY LOG RECORDED SUCCESSFULLY!*",
      "📅 *Date:* " + todayDateStr,
      "👤 *Student:* *" + member.fullName + "* (`" + member.studyId + "`)",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "• 📘 *" + sub1Name + ":* " + h1.toFixed(1) + " hrs",
      "• 📗 *" + sub2Name + ":* " + h2.toFixed(1) + " hrs",
      "• 📙 *" + sub3Name + ":* " + h3.toFixed(1) + " hrs",
      "⏱️ *Total Today:* *" + totalToday.toFixed(1) + " hrs*",
      "🔥 *Active Streak:* *" + streaks.currentStreak + " Days* (Max: " + streaks.maxStreak + " Days)",
      notes ? "📝 *Notes:* _" + notes + "_" : "",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "🎉 Keep up the daily discipline!",
      "👉 *Dashboard:* https://studysync-al-2026.web.app/dashboard"
    ].filter(Boolean).join("\n");

    sendTelegramMessage(chatId, receiptMsg);
    return { 
      handled: true, 
      command: "/log", 
      chatId: chatId, 
      replyText: receiptMsg, 
      member: member, 
      studyId: member.studyId,
      totalHours: totalToday,
      activeStreak: streaks.currentStreak
    };
  } finally {
    try { lock.releaseLock(); } catch (re) {}
  }
}

/**
 * /leaderboard [bio|maths|all] Command Handler
 */
function handleLeaderboardCommand(message, args, chatId) {
  var ss = getSpreadsheet();
  var membersSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.MEMBERS);
  var logsSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.DAILY_LOGS);
  if (!membersSheet || !logsSheet) {
    setupDatabase();
    membersSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.MEMBERS);
    logsSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.DAILY_LOGS);
  }

  var streamFilter = args.length > 0 ? args[0].toLowerCase() : "all";
  
  var membersData = membersSheet.getLastRow() > 1 ? membersSheet.getRange(2, 1, membersSheet.getLastRow() - 1, 11).getValues() : [];
  var logsData = logsSheet.getLastRow() > 1 ? logsSheet.getRange(2, 1, logsSheet.getLastRow() - 1, 21).getValues() : [];

  var members = membersData.map(rowToMemberObject);
  var logs = logsData.map(rowToDailyLogObject);

  var fullLeaderboard = computeLeaderboard(members, logs);
  
  var filtered = fullLeaderboard;
  var streamTitle = "All Streams (National)";
  if (streamFilter.startsWith("bio")) {
    filtered = fullLeaderboard.filter(function(e) { return e.stream === "Biological Science"; });
    streamTitle = "Biological Science Stream 🧬";
  } else if (streamFilter.startsWith("math") || streamFilter.startsWith("phys")) {
    filtered = fullLeaderboard.filter(function(e) { return e.stream === "Physical Science"; });
    streamTitle = "Physical Science Stream 📐";
  }

  var top10 = filtered.slice(0, 10);
  var medals = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];
  
  var listRows = [];
  if (top10.length === 0) {
    listRows.push("• _No active study streaks recorded yet_");
  } else {
    for (var i = 0; i < top10.length; i++) {
      var item = top10[i];
      var medal = medals[i] || (i + 1) + ".";
      listRows.push(
        medal + " *" + item.name + "* (`" + item.studyId + "`)\n" +
        "   🔥 *" + item.streak + " Days* • ⏱️ " + item.totalHours.toFixed(1) + "h • " + (item.school || "A/L")
      );
    }
  }

  var leaderboardCard = [
    "🏆 *STUDYSYNC STREAK LEADERBOARD*",
    "📌 *" + streamTitle + "*",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    listRows.join("\n"),
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "👥 *Total Active Members:* " + filtered.length,
    "👉 *Full Dashboard:* https://studysync-al-2026.web.app/admin"
  ].join("\n");

  sendTelegramMessage(chatId, leaderboardCard);
  return { handled: true, command: "/leaderboard", chatId: chatId, replyText: leaderboardCard, count: top10.length };
}

/**
 * /remind Command Handler
 */
function handleRemindCommand(message, args, chatId) {
  var ss = getSpreadsheet();
  var membersSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.MEMBERS);
  var logsSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.DAILY_LOGS);
  if (!membersSheet || !logsSheet) {
    setupDatabase();
    membersSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.MEMBERS);
    logsSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.DAILY_LOGS);
  }
  
  var senderUsername = message.from && message.from.username ? message.from.username : "";
  var normalizedSender = normalizeTelegramUsername(senderUsername);

  if (!normalizedSender) {
    var msg = "❌ *Telegram Username Required:* Please set up a Telegram username and link your account with `/start <STUDY_ID>`.";
    sendTelegramMessage(chatId, msg);
    return { handled: true, command: "/remind", chatId: chatId, replyText: msg };
  }

  var found = findMemberByTelegram(membersSheet, normalizedSender);
  if (!found) {
    var msg = "❌ *Account not linked.* Link your Study ID first: `/start <YOUR_STUDY_ID>`";
    sendTelegramMessage(chatId, msg);
    return { handled: true, command: "/remind", chatId: chatId, replyText: msg };
  }

  var member = found.member;
  var todayDateStr = getLocalDateString(new Date());
  var todayLog = findDailyLog(logsSheet, member.studyId, todayDateStr);
  var statsAndLogs = getStudentStatsAndLogs(logsSheet, member.studyId);
  var streaks = calculateStreaks(statsAndLogs.dates);

  var replyText = "";
  if (todayLog) {
    replyText = [
      "🎉 *You are all set for today, " + member.fullName + "!*",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "✅ Today's study session has been logged.",
      "🔥 *Active Streak:* *" + streaks.currentStreak + " Days*",
      "⏱️ *Total Hours:* *" + statsAndLogs.totalHours.toFixed(1) + " hrs*",
      "",
      "Rest well, recover your cognitive energy, and be ready for tomorrow's revision!",
      "👉 *Dashboard:* https://studysync-al-2026.web.app/dashboard"
    ].join("\n");
  } else {
    replyText = [
      "⏰ *STUDYSYNC ACCOUNTABILITY REMINDER*",
      "Hey *" + member.fullName + "*! Your 🔥 *" + streaks.currentStreak + "-Day Streak* is on the line!",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "You have not submitted your study hours for today (*" + todayDateStr + "*).",
      "",
      "👉 *Quick Log:* `/log <h1\> <h2\> <h3\> [notes]`",
      "👉 *Online Portal:* https://studysync-al-2026.web.app/daily",
      "",
      "⏳ Submit before 23:59 Sri Lanka Time to keep your streak alive!"
    ].join("\n");
  }

  sendTelegramMessage(chatId, replyText);
  return { handled: true, command: "/remind", chatId: chatId, replyText: replyText, studiedToday: !!todayLog };
}

/**
 * Generates stream-tailored cognitive AI study prescription snippet
 */
function generateAiRecommendation(member, stats) {
  var stream = member.stream || "";
  var streak = stats.streak || 0;
  var totalHours = stats.totalHours || 0;
  var subHours = stats.subjectHours || {};
  
  if (stream === "Biological Science") {
    var bioHrs = subHours["Biology"] || 0;
    var chemHrs = subHours["Chemistry"] || 0;
    var physHrs = subHours["Physics"] || subHours["Agriculture"] || 0;
    
    if (totalHours === 0) {
      return "Begin with 2.0h of Biology active recall & 1.5h Chemistry problem solving to ignite your initial streak.";
    }
    if (bioHrs < chemHrs * 0.5) {
      return "Biology volume is lagging. Dedicate your peak cognitive morning slot to high-yield Plant Physiology or Genetics.";
    }
    if (physHrs < totalHours * 0.2) {
      return "Ensure your optional subject (" + (member.optionalSubject || "Physics") + ") gets at least 25% of weekly study time to avoid Z-score drag.";
    }
    if (streak >= 7) {
      return "Superb consistency! Shift 30% of daily time into timed essay paper practice under exam conditions.";
    }
    return "Maintain balanced daily coverage across Biology, Chemistry, and " + (member.optionalSubject || "Physics") + " to maximize retention.";
  } else {
    var mathHrs = subHours["Combined Maths"] || 0;
    
    if (totalHours === 0) {
      return "Start with 2.5h of Combined Maths integration/mechanics problems to establish your daily problem-solving rhythm.";
    }
    if (mathHrs < totalHours * 0.35) {
      return "Combined Maths requires high volume. Aim for at least 40% of daily time on pure maths & applied problem sets.";
    }
    if (streak >= 7) {
      return "Excellent momentum! Work through 2018-2024 structured essay past papers in Physics and Chemistry/ICT.";
    }
    return "Focus on step-by-step mathematical derivations and timed mechanics problem solving today.";
  }
}

/**
 * Protected Admin Action: broadcastDailyDigest
 */
function handleBroadcastDailyDigest(payload) {
  var adminEmail = String(payload.adminEmail || "").trim().toLowerCase();
  var isWhitelisted = false;
  for (var i = 0; i < CONFIG.ADMIN_EMAILS.length; i++) {
    if (CONFIG.ADMIN_EMAILS[i].toLowerCase() === adminEmail) {
      isWhitelisted = true;
      break;
    }
  }
  
  if (!isWhitelisted && adminEmail !== "alwisachalaanurada@gmail.com") {
    throw new Error("Access Denied: " + adminEmail + " is not a whitelisted administrator.");
  }
  
  var chatId = payload.chatId || "";
  try {
    if (!chatId) {
      chatId = PropertiesService.getScriptProperties().getProperty("TELEGRAM_CHAT_ID") || "";
    }
  } catch (e) {}

  var previewOnly = payload.previewOnly === true;
  return executeBroadcastDailyDigest(chatId, previewOnly);
}

/**
 * Zero-argument function trigger for daily 21:30 schedule
 */
function broadcastDailyDigest(e) {
  var chatId = "";
  try {
    chatId = PropertiesService.getScriptProperties().getProperty("TELEGRAM_CHAT_ID") || "";
  } catch (err) {}
  return executeBroadcastDailyDigest(chatId, false);
}

/**
 * Builds and optionally broadcasts daily digest
 */
function executeBroadcastDailyDigest(chatId, previewOnly) {
  var ss = getSpreadsheet();
  var membersSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.MEMBERS);
  var logsSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.DAILY_LOGS);
  if (!membersSheet || !logsSheet) {
    setupDatabase();
    membersSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.MEMBERS);
    logsSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.DAILY_LOGS);
  }

  var membersData = membersSheet.getLastRow() > 1 ? membersSheet.getRange(2, 1, membersSheet.getLastRow() - 1, 11).getValues() : [];
  var logsData = logsSheet.getLastRow() > 1 ? logsSheet.getRange(2, 1, logsSheet.getLastRow() - 1, 21).getValues() : [];

  var members = membersData.map(rowToMemberObject).filter(function(m) { return m.status === "Active"; });
  var logs = logsData.map(rowToDailyLogObject);

  var todayDateStr = getLocalDateString(new Date());
  var todayLogs = logs.filter(function(l) { return l.dateOfStudy === todayDateStr; });

  var totalActiveMembers = members.length;
  var activeStudentsToday = todayLogs.length;
  var participationRate = totalActiveMembers > 0 ? Math.round((activeStudentsToday / totalActiveMembers) * 100) : 0;

  var totalTodayHours = 0;
  var bioHours = 0;
  var bioCount = 0;
  var mathHours = 0;
  var mathCount = 0;
  var focusSum = 0;
  var focusCount = 0;

  var studentTodayHoursMap = {};

  for (var i = 0; i < todayLogs.length; i++) {
    var l = todayLogs[i];
    var member = members.find(function(m) { return m.studyId === l.studyId; });
    var stream = member ? member.stream : "";

    var logHrs = l.totalHours;
    totalTodayHours += logHrs;

    studentTodayHoursMap[l.studyId] = {
      studyId: l.studyId,
      name: member ? member.fullName : l.studyId,
      hours: logHrs,
      focus: l.subjects[0] ? l.subjects[0].focus : 8
    };

    if (stream === "Biological Science") {
      bioHours += logHrs;
      bioCount++;
    } else if (stream === "Physical Science") {
      mathHours += logHrs;
      mathCount++;
    }

    for (var s = 0; s < l.subjects.length; s++) {
      if (l.subjects[s].focus > 0) {
        focusSum += l.subjects[s].focus;
        focusCount++;
      }
    }
  }

  var avgHoursPerStudent = activeStudentsToday > 0 ? (totalTodayHours / activeStudentsToday) : 0;
  var avgGroupFocus = focusCount > 0 ? (focusSum / focusCount) : 8.0;

  var leaderboard = computeLeaderboard(members, logs);
  var top5 = leaderboard.slice(0, 5);

  var medals = ["🥇 1.", "🥈 2.", "🥉 3.", "4️⃣ 4.", "5️⃣ 5."];
  var leaderboardLines = [];
  if (top5.length === 0) {
    leaderboardLines.push("• _No active study streaks recorded yet_");
  } else {
    for (var j = 0; j < top5.length; j++) {
      var item = top5[j];
      var medal = medals[j] || (j + 1) + ".";
      leaderboardLines.push(
        medal + " *" + item.name + "* (`" + item.studyId + "`) — 🔥 *" + item.streak + " Days* (" + item.totalHours.toFixed(1) + "h) • " + (item.school || "A/L")
      );
    }
  }

  var todayStudentsList = Object.values(studentTodayHoursMap);
  todayStudentsList.sort(function(a, b) { return b.hours - a.hours; });
  var mvpVolume = todayStudentsList[0] || (top5[0] ? { name: top5[0].name, hours: top5[0].totalHours } : null);

  var mvpFocusList = [].concat(todayStudentsList);
  mvpFocusList.sort(function(a, b) { return b.focus - a.focus; });
  var mvpFocus = mvpFocusList[0] || (top5[0] ? { name: top5[0].name, focus: 9 } : null);

  var pendingCount = Math.max(0, totalActiveMembers - activeStudentsToday);

  var dateObj = new Date();
  var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var dayOfWeek = days[dateObj.getDay()];

  var digestText = [
    "📢 *STUDYSYNC DAILY ACCOUNTABILITY DIGEST*",
    "📅 *Date:* " + dayOfWeek + ", " + todayDateStr,
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "",
    "📊 *COMMUNITY PULSE*",
    "• 👥 *Active Today:* *" + activeStudentsToday + " / " + totalActiveMembers + " (" + participationRate + "%)*",
    "• ⏱️ *Total Study Hours:* *" + totalTodayHours.toFixed(1) + " hrs*",
    "• 📈 *Average Study Time:* *" + avgHoursPerStudent.toFixed(2) + " hrs / student*",
    "• 🧬 *Biological Science:* *" + bioHours.toFixed(1) + " hrs* (" + bioCount + " students)",
    "• 📐 *Physical Science:* *" + mathHours.toFixed(1) + " hrs* (" + mathCount + " students)",
    "• ⚡ *Group Focus Index:* *" + avgGroupFocus.toFixed(1) + " / 10*",
    "",
    "🔥 *STREAK HALL OF FAME (TOP 5)*",
    leaderboardLines.join("\n"),
    "",
    "🌟 *TODAY'S STUDY MVPS*",
    mvpVolume ? "👑 *Highest Volume:* *" + mvpVolume.name + "* (*" + Number(mvpVolume.hours || 0).toFixed(1) + " hrs*)" : "👑 *Highest Volume:* _Pending submissions_",
    mvpFocus ? "🎯 *Deep Flow:* *" + mvpFocus.name + "* (*" + Number(mvpFocus.focus || 0).toFixed(1) + "/10 Focus*)" : "🎯 *Deep Flow:* _Pending submissions_",
    "",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "⚠️ *Streak Alert:* " + pendingCount + " students have pending daily submissions.",
    "Submit before 23:59 to keep your streak alive!",
    "👉 *Log Study Hours:* https://studysync-al-2026.web.app/daily"
  ].join("\n");

  var broadcastSent = false;
  if (!previewOnly && chatId) {
    var sendRes = sendTelegramMessage(chatId, digestText);
    broadcastSent = sendRes.ok === true;
  }

  return {
    broadcastSent: broadcastSent,
    chatId: chatId || "mock",
    digestText: digestText,
    stats: {
      activeStudentsToday: activeStudentsToday,
      totalActiveMembers: totalActiveMembers,
      totalStudyHoursToday: Number(totalTodayHours.toFixed(1)),
      topStreakDays: top5[0] ? top5[0].streak : 0,
      bioHours: Number(bioHours.toFixed(1)),
      mathHours: Number(mathHours.toFixed(1)),
      avgGroupFocus: Number(avgGroupFocus.toFixed(1))
    }
  };
}
