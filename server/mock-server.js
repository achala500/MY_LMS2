/**
 * ============================================================================
 * StudySync — Local Development & E2E Testing Mock Server
 * ============================================================================
 * 
 * Replicates 100% of Google Apps Script backend functionality:
 * - RESTful JSON API envelope matching Code.gs
 * - Atomic sequential Study ID generation (SG-BIO-XXXX / SG-MATH-XXXX)
 * - 3-sheet in-memory & file-backed database (Members, DailyLogs, Analytics, TestMarks)
 * - Drive hierarchical file storage simulator (server/mock_uploads/{ID}/{Date}/)
 * - One-submission-per-day duplicate locking
 * - Personal streak & study hours aggregation engine
 * - Protected admin dashboard query with email whitelist
 * - Public QR verification endpoint
 * - Telegram Bot Webhook handler (/start, /status, /log, /leaderboard, /remind)
 * - Automated Daily Digest & Streak Leaderboard broadcast generator
 */

import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================================
// CONFIGURATION & CONSTANTS
// ============================================================================
const CONFIG = {
  ADMIN_EMAILS: [
    'admin@studysync.lk',
    'lead.organizer@gmail.com',
    'studysync.admin@gmail.com',
    'alwis@gmail.com',
    'alwisachalaanurada@gmail.com',
    'testadmin@studysync.lk'
  ],
  STREAMS: {
    BIO: 'Biological Science',
    MATH: 'Physical Science'
  },
  PREFIXES: {
    BIO: 'SG-BIO-',
    MATH: 'SG-MATH-'
  },
  DEFAULT_EXAM_DATES: {
    '2026': '2026-11-23T08:30:00+05:30',
    '2027': '2027-11-29T08:30:00+05:30',
    '2028': '2028-11-27T08:30:00+05:30',
    '2029': '2029-11-26T08:30:00+05:30'
  },
  EXAM_DATES: {
    '2026': '2026-11-23T08:30:00+05:30',
    '2027': '2027-11-29T08:30:00+05:30',
    '2028': '2028-11-27T08:30:00+05:30',
    '2029': '2029-11-26T08:30:00+05:30'
  },
  DB_DIR: path.join(__dirname, 'mock_db'),
  UPLOADS_DIR: path.join(__dirname, 'mock_uploads')
};

// Ensure directories exist
if (!fs.existsSync(CONFIG.DB_DIR)) {
  fs.mkdirSync(CONFIG.DB_DIR, { recursive: true });
}
if (!fs.existsSync(CONFIG.UPLOADS_DIR)) {
  fs.mkdirSync(CONFIG.UPLOADS_DIR, { recursive: true });
}

// ============================================================================
// MIDDLEWARE
// ============================================================================
app.use(cors());

// Custom text parser to handle Apps Script text/plain JSON payloads
app.use(express.text({ type: ['text/plain', 'text/*'], limit: '50mb' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static file serving for simulated Google Drive uploads
app.use('/uploads', express.static(CONFIG.UPLOADS_DIR));

// Helper: Standardized JSON Response
function createJsonResponse(res, data, isSuccess = true, errorMsg = null, statusCode = 200) {
  const payload = {
    success: isSuccess === true,
    data: data !== undefined ? data : null,
    error: isSuccess ? null : (errorMsg || 'Unknown error occurred'),
    timestamp: new Date().toISOString()
  };
  return res.status(statusCode).json(payload);
}

// ============================================================================
// PERSISTENT / IN-MEMORY DATABASE STORAGE
// ============================================================================
function loadDb(tableName, defaultVal = []) {
  const filePath = path.join(CONFIG.DB_DIR, `${tableName}.json`);
  if (!fs.existsSync(filePath)) {
    saveDb(tableName, defaultVal);
    return defaultVal;
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return defaultVal;
  }
}

function saveDb(tableName, data) {
  const filePath = path.join(CONFIG.DB_DIR, `${tableName}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// Initialize / Seed sample data if database is empty
function initializeSeedData() {
  let members = loadDb('members', []);
  let dailyLogs = loadDb('daily_logs', []);
  
  if (members.length === 0) {
    members = [
      {
        studyId: 'SG-BIO-0001',
        fullName: 'Kasun Perera',
        email: 'kasun.p@gmail.com',
        gender: 'Male',
        telegram: '@kasun_p',
        telegramUsername: '@kasun_p',
        school: 'Royal College, Colombo 07',
        stream: 'Biological Science',
        optionalSubject: 'Physics',
        registrationDate: '2026-08-20T08:00:00.000Z',
        status: 'Active',
        examYear: '2026'
      },
      {
        studyId: 'SG-MATH-0001',
        fullName: 'Nimali Fernando',
        email: 'nimali.f@gmail.com',
        gender: 'Female',
        telegram: '@nimali_f',
        telegramUsername: '@nimali_f',
        school: 'Visakha Vidyalaya, Colombo 05',
        stream: 'Physical Science',
        optionalSubject: 'Chemistry',
        registrationDate: '2026-08-21T09:30:00.000Z',
        status: 'Active',
        examYear: '2026'
      }
    ];
    saveDb('members', members);
  }
  
  if (dailyLogs.length === 0) {
    dailyLogs = [
      {
        timestamp: '2026-08-24T15:00:00.000Z',
        studyId: 'SG-BIO-0001',
        email: 'kasun.p@gmail.com',
        dateOfStudy: '2026-08-24',
        subjects: [
          { name: 'Biology', hours: 2.5, focus: 8, productivity: 8 },
          { name: 'Chemistry', hours: 2.0, focus: 7, productivity: 8 },
          { name: 'Physics', hours: 1.5, focus: 9, productivity: 9 }
        ],
        totalHours: 6.0,
        notes: 'Covered Cell Biology and Organic Reaction Mechanisms.',
        telegram: '@kasun_p',
        proofPhotoUrl: ''
      },
      {
        timestamp: '2026-08-25T16:30:00.000Z',
        studyId: 'SG-BIO-0001',
        email: 'kasun.p@gmail.com',
        dateOfStudy: '2026-08-25',
        subjects: [
          { name: 'Biology', hours: 3.0, focus: 9, productivity: 9 },
          { name: 'Chemistry', hours: 1.5, focus: 8, productivity: 8 },
          { name: 'Physics', hours: 2.0, focus: 8, productivity: 8 }
        ],
        totalHours: 6.5,
        notes: 'Genetics essay questions & thermo physics revision.',
        telegram: '@kasun_p',
        proofPhotoUrl: ''
      }
    ];
    saveDb('daily_logs', dailyLogs);
  }
}

initializeSeedData();

// ============================================================================
// STREAK & ANALYTICS HELPERS (Parity with Code.gs)
// ============================================================================

function getLocalDateString(date = new Date()) {
  const d = date instanceof Date && !isNaN(date.getTime()) ? date : new Date();
  const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
  const slDate = new Date(utc + (3600000 * 5.5)); // UTC+05:30
  const yyyy = slDate.getFullYear();
  const mm = String(slDate.getMonth() + 1).padStart(2, '0');
  const dd = String(slDate.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function calculateStreaks(dateStringsArray) {
  if (!dateStringsArray || dateStringsArray.length === 0) {
    return { currentStreak: 0, maxStreak: 0 };
  }
  
  const uniqueDates = Array.from(new Set(dateStringsArray.filter(Boolean))).sort().reverse();
  if (uniqueDates.length === 0) {
    return { currentStreak: 0, maxStreak: 0 };
  }
  
  const todayStr = getLocalDateString(new Date());
  const yesterdayStr = getLocalDateString(new Date(Date.now() - 86400000));
  
  let currentStreak = 0;
  let maxStreak = 0;
  
  const latestDate = uniqueDates[0];
  const isStreakActive = (latestDate === todayStr || latestDate === yesterdayStr);
  
  if (isStreakActive) {
    let parts = latestDate.split('-');
    let checkDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    for (let i = 0; i < uniqueDates.length; i++) {
      const expY = checkDate.getFullYear();
      const expM = String(checkDate.getMonth() + 1).padStart(2, '0');
      const expD = String(checkDate.getDate()).padStart(2, '0');
      const expectedStr = `${expY}-${expM}-${expD}`;
      
      if (uniqueDates.includes(expectedStr)) {
        currentStreak++;
        checkDate = new Date(checkDate.getTime() - 86400000);
      } else {
        break;
      }
    }
  }
  
  // Calculate max streak across full timeline
  const sortedAsc = Array.from(new Set(dateStringsArray.filter(Boolean))).sort();
  let tempStreak = 0;
  let prevDate = null;
  
  for (let j = 0; j < sortedAsc.length; j++) {
    const p = sortedAsc[j].split('-');
    const curDate = new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10));
    if (!prevDate) {
      tempStreak = 1;
    } else {
      const diffMs = curDate.getTime() - prevDate.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
    }
    if (tempStreak > maxStreak) {
      maxStreak = tempStreak;
    }
    prevDate = curDate;
  }
  
  return {
    currentStreak: currentStreak,
    maxStreak: Math.max(maxStreak, currentStreak)
  };
}

function getStudentPersonalStats(studyId, dailyLogs) {
  const studentLogs = dailyLogs.filter(l => l.studyId === studyId);
  const dateStrings = studentLogs.map(l => l.dateOfStudy);
  
  let totalHours = 0;
  const subjectHours = {};
  let totalFocusSum = 0;
  let totalProdSum = 0;
  let totalSubjectEntries = 0;
  
  studentLogs.forEach(log => {
    totalHours += (log.totalHours || 0);
    if (Array.isArray(log.subjects)) {
      log.subjects.forEach(sub => {
        if (sub.name) {
          subjectHours[sub.name] = (subjectHours[sub.name] || 0) + (Number(sub.hours) || 0);
          totalFocusSum += (Number(sub.focus) || 0);
          totalProdSum += (Number(sub.productivity) || 0);
          totalSubjectEntries++;
        }
      });
    }
  });
  
  const streaks = calculateStreaks(dateStrings);
  const avgFocus = totalSubjectEntries > 0 ? Number((totalFocusSum / totalSubjectEntries).toFixed(1)) : 0;
  const avgProductivity = totalSubjectEntries > 0 ? Number((totalProdSum / totalSubjectEntries).toFixed(1)) : 0;
  
  return {
    currentStreak: streaks.currentStreak,
    maxStreak: streaks.maxStreak,
    totalHours: Number(totalHours.toFixed(2)),
    subjectHours: subjectHours,
    avgFocus: avgFocus,
    avgProductivity: avgProductivity,
    totalLogs: studentLogs.length
  };
}

function computeGroupAnalytics(members, dailyLogs) {
  let totalHours = 0;
  let bioHours = 0;
  let bioCount = 0;
  let bioLogs = 0;
  let mathHours = 0;
  let mathCount = 0;
  let mathLogs = 0;
  
  let totalFocusSum = 0;
  let totalProdSum = 0;
  let totalSubEntries = 0;
  
  const memberMap = {};
  members.forEach(m => {
    memberMap[m.studyId] = m;
    if (m.stream === CONFIG.STREAMS.BIO) bioCount++;
    else if (m.stream === CONFIG.STREAMS.MATH) mathCount++;
  });
  
  dailyLogs.forEach(l => {
    const hrs = l.totalHours || 0;
    totalHours += hrs;
    
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
    
    if (Array.isArray(l.subjects)) {
      l.subjects.forEach(s => {
        if (s.focus > 0) {
          totalFocusSum += Number(s.focus);
          totalSubEntries++;
        }
        if (s.productivity > 0) {
          totalProdSum += Number(s.productivity);
        }
      });
    }
  });
  
  const activeCount = members.filter(m => m.status === 'Active').length;
  
  return {
    totalMembers: members.length,
    activeMembers: activeCount,
    totalHours: Number(totalHours.toFixed(2)),
    totalLogs: dailyLogs.length,
    avgDailyHours: activeCount > 0 ? Number((totalHours / activeCount).toFixed(2)) : 0,
    avgGroupFocus: totalSubEntries > 0 ? Number((totalFocusSum / totalSubEntries).toFixed(1)) : 0,
    avgGroupProductivity: totalSubEntries > 0 ? Number((totalProdSum / totalSubEntries).toFixed(1)) : 0,
    streamBreakdown: {
      'Biological Science': {
        members: bioCount,
        totalHours: Number(bioHours.toFixed(2)),
        totalLogs: bioLogs
      },
      'Physical Science': {
        members: mathCount,
        totalHours: Number(mathHours.toFixed(2)),
        totalLogs: mathLogs
      }
    }
  };
}

function computeLeaderboard(members, dailyLogs) {
  const map = {};
  members.forEach(m => {
    map[m.studyId] = {
      member: m,
      totalHours: 0,
      totalLogs: 0,
      dates: [],
      focusSum: 0,
      prodSum: 0,
      subCount: 0
    };
  });
  
  dailyLogs.forEach(l => {
    if (map[l.studyId]) {
      const item = map[l.studyId];
      item.totalHours += (l.totalHours || 0);
      item.totalLogs++;
      item.dates.push(l.dateOfStudy);
      
      if (Array.isArray(l.subjects)) {
        l.subjects.forEach(s => {
          if (s.focus > 0) {
            item.focusSum += Number(s.focus);
            item.subCount++;
          }
          if (s.productivity > 0) {
            item.prodSum += Number(s.productivity);
          }
        });
      }
    }
  });
  
  const leaderboardList = members.map(m => {
    const item = map[m.studyId];
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
  
  leaderboardList.sort((a, b) => {
    if (b.streak !== a.streak) return b.streak - a.streak;
    return b.totalHours - a.totalHours;
  });
  
  leaderboardList.forEach((item, index) => {
    item.rank = index + 1;
  });
  
  return leaderboardList;
}

// Sequential Study ID Generator
function generateNextStudyId(members, stream) {
  const isBio = (stream === CONFIG.STREAMS.BIO || String(stream).toLowerCase().includes('bio'));
  const prefix = isBio ? CONFIG.PREFIXES.BIO : CONFIG.PREFIXES.MATH;
  
  let maxSeq = 0;
  members.forEach(m => {
    const id = String(m.studyId || '');
    if (id.startsWith(prefix)) {
      const num = parseInt(id.replace(prefix, ''), 10);
      if (!isNaN(num) && num > maxSeq) {
        maxSeq = num;
      }
    }
  });
  
  const nextSeq = maxSeq + 1;
  return prefix + ('0000' + nextSeq).slice(-4);
}

// Save Proof Image to Mock Uploads Directory
function saveProofPhotoLocally(studyId, dateOfStudy, base64Data, mimeType, fileName, hostUrl) {
  try {
    const subfolder = path.join(CONFIG.UPLOADS_DIR, studyId, dateOfStudy);
    if (!fs.existsSync(subfolder)) {
      fs.mkdirSync(subfolder, { recursive: true });
    }
    
    const safeName = (studyId + '_' + dateOfStudy + '_' + (fileName || 'proof.jpg'))
      .replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = path.join(subfolder, safeName);
    
    const cleanBase64 = String(base64Data).replace(/^data:[^;]+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');
    fs.writeFileSync(filePath, buffer);
    
    return `${hostUrl}/uploads/${encodeURIComponent(studyId)}/${encodeURIComponent(dateOfStudy)}/${encodeURIComponent(safeName)}`;
  } catch (err) {
    console.error('Mock proof upload error:', err);
    return '';
  }
}

// ============================================================================
// TELEGRAM BOT HELPERS
// ============================================================================

function normalizeTelegramUsername(handle) {
  if (!handle) return '';
  let str = String(handle).trim();
  str = str.replace(/^(https?:\/\/)?(www\.)?(t\.me|telegram\.me)\//i, '');
  if (str.startsWith('@')) {
    str = str.substring(1);
  }
  str = str.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
  return str.length > 0 ? `@${str}` : '';
}

function findMemberByTelegram(members, handle) {
  const target = normalizeTelegramUsername(handle);
  if (!target) return null;
  return members.find(m => normalizeTelegramUsername(m.telegram || m.telegramUsername) === target) || null;
}

function generateAiRecommendation(member, stats) {
  const stream = member.stream || '';
  const streak = stats.streak || stats.currentStreak || 0;
  const totalHours = stats.totalHours || 0;
  const subHours = stats.subjectHours || {};
  
  if (stream === 'Biological Science' || stream.includes('Bio')) {
    const bioHrs = subHours['Biology'] || 0;
    const chemHrs = subHours['Chemistry'] || 0;
    const physHrs = subHours['Physics'] || subHours['Agriculture'] || 0;
    
    if (totalHours === 0) {
      return 'Begin with 2.0h of Biology active recall & 1.5h Chemistry problem solving to ignite your initial streak.';
    }
    if (bioHrs < chemHrs * 0.5) {
      return 'Biology volume is lagging. Dedicate your peak cognitive morning slot to high-yield Plant Physiology or Genetics.';
    }
    if (physHrs < totalHours * 0.2) {
      return `Ensure your optional subject (${member.optionalSubject || 'Physics'}) gets at least 25% of weekly study time to avoid Z-score drag.`;
    }
    if (streak >= 7) {
      return 'Superb consistency! Shift 30% of daily time into timed essay paper practice under exam conditions.';
    }
    return `Maintain balanced daily coverage across Biology, Chemistry, and ${member.optionalSubject || 'Physics'} to maximize retention.`;
  } else {
    const mathHrs = subHours['Combined Maths'] || 0;
    
    if (totalHours === 0) {
      return 'Start with 2.5h of Combined Maths integration/mechanics problems to establish your daily problem-solving rhythm.';
    }
    if (mathHrs < totalHours * 0.35) {
      return 'Combined Maths requires high volume. Aim for at least 40% of daily time on pure maths & applied problem sets.';
    }
    if (streak >= 7) {
      return 'Excellent momentum! Work through 2018-2024 structured essay past papers in Physics and Chemistry/ICT.';
    }
    return 'Focus on step-by-step mathematical derivations and timed mechanics problem solving today.';
  }
}

// Spreadsheet formula injection sanitizer (CWE-1236)
function sanitizeCsvFormula(val) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (/^[=+\-@\t\r]/.test(str)) {
    return `'${str}`;
  }
  return str;
}

// ============================================================================
// CORE CONTROLLER ACTION DISPATCHER
// ============================================================================
function handleApiAction(action, payload, hostUrl, req, res) {
  let members = loadDb('members', []);
  let dailyLogs = loadDb('daily_logs', []);
  let testMarks = loadDb('test_marks', []);
  
  // 1. Timestamp Drift Validation Window (±300 seconds)
  const reqTimestamp = (payload && payload.security && payload.security.requestTimestamp) || (payload && payload.requestTimestamp);
  if (reqTimestamp) {
    const reqTime = new Date(reqTimestamp).getTime();
    if (!isNaN(reqTime)) {
      const now = Date.now();
      const driftMs = Math.abs(now - reqTime);
      if (reqTime - now > 60000) {
        return createJsonResponse(res, { error: 'ERR_TIMESTAMP_FUTURE', serverTime: new Date().toISOString() }, false, 'ERR_TIMESTAMP_FUTURE: Request timestamp is in the future.', 400);
      }
      if (driftMs > 300000) {
        return createJsonResponse(res, { error: 'ERR_TIMESTAMP_EXPIRED', serverTime: new Date().toISOString() }, false, 'ERR_TIMESTAMP_EXPIRED: Request timestamp is outside the permitted 300-second drift window.', 400);
      }
    }
  }

  // 2. Idempotency Envelope Check & Caching
  const idempotencyKey = (payload && payload.security && payload.security.idempotencyKey) || (payload && payload.idempotencyKey);
  let idempotencyCache = loadDb('idempotency_cache', {});
  if (idempotencyKey && action !== 'ping' && action !== 'health') {
    if (idempotencyCache[idempotencyKey]) {
      const cached = idempotencyCache[idempotencyKey];
      return createJsonResponse(res, cached.data, cached.success, cached.error, cached.statusCode || 200);
    }
  }

  function respond(data, isSuccess = true, errorMsg = null, statusCode = 200) {
    if (idempotencyKey && isSuccess) {
      try {
        idempotencyCache = loadDb('idempotency_cache', {});
        idempotencyCache[idempotencyKey] = { data, success: isSuccess, error: errorMsg, statusCode, cachedAt: new Date().toISOString() };
        saveDb('idempotency_cache', idempotencyCache);
      } catch (e) {}
    }
    return createJsonResponse(res, data, isSuccess, errorMsg, statusCode);
  }

  switch (action) {
    case 'ping':
    case 'health':
      return respond({
        status: 'healthy',
        service: 'StudySync Mock Server API',
        timestamp: new Date().toISOString()
      });
      
    case 'checkUser': {
      const email = String(payload.email || '').trim().toLowerCase();
      if (!email) {
        return respond(null, false, 'Email parameter is required.', 400);
      }
      
      const member = members.find(m => m.email.toLowerCase() === email) || null;
      if (!member) {
        return respond({
          registered: false,
          member: null,
          todayLog: null,
          stats: null
        });
      }
      
      const todayStr = getLocalDateString(new Date());
      const todayLog = dailyLogs.find(l => l.studyId === member.studyId && l.dateOfStudy === todayStr) || null;
      const stats = getStudentPersonalStats(member.studyId, dailyLogs);
      
      return respond({
        registered: true,
        member,
        todayLog,
        stats
      });
    }
    
    case 'registerUser': {
      const fullName = sanitizeCsvFormula(String(payload.fullName || '').trim());
      const email = String(payload.email || '').trim().toLowerCase();
      const gender = String(payload.gender || 'Other').trim();
      let telegram = String(payload.telegram || payload.telegramUsername || '').trim();
      if (telegram) {
        telegram = normalizeTelegramUsername(telegram);
      }
      const school = sanitizeCsvFormula(String(payload.school || '').trim());
      const stream = String(payload.stream || '').trim();
      const optionalSubject = String(payload.optionalSubject || '').trim();
      const examYear = String(payload.examYear || '2026').trim();
      
      if (!fullName || !email || !stream || !school) {
        return respond(null, false, 'Missing required registration fields (fullName, email, school, stream).', 400);
      }
      
      const existing = members.find(m => m.email.toLowerCase() === email);
      if (existing) {
        return respond({
          alreadyRegistered: true,
          member: existing
        });
      }
      
      const studyId = generateNextStudyId(members, stream);
      const regDate = new Date().toISOString();
      const newMember = {
        studyId,
        fullName,
        email,
        gender,
        telegram,
        telegramUsername: telegram,
        school,
        stream,
        optionalSubject,
        registrationDate: regDate,
        status: 'Active',
        examYear
      };
      
      members.push(newMember);
      saveDb('members', members);
      
      return respond({
        alreadyRegistered: false,
        ...newMember
      });
    }
    
    case 'submitDailyLog': {
      const studyId = String(payload.studyId || '').trim().toUpperCase();
      const email = String(payload.email || '').trim().toLowerCase();
      const dateOfStudy = String(payload.dateOfStudy || getLocalDateString(new Date())).trim();
      const notes = sanitizeCsvFormula(String(payload.notes || '').trim());
      let telegram = String(payload.telegram || payload.telegramUsername || '').trim();
      if (telegram) {
        telegram = normalizeTelegramUsername(telegram);
      }
      
      if (!studyId || !dateOfStudy) {
        return respond(null, false, 'Missing required fields: studyId and dateOfStudy are required.', 400);
      }
      
      const member = members.find(m => m.studyId.toUpperCase() === studyId.toUpperCase());
      if (!member) {
        return respond(null, false, `Invalid Study ID: Member not found.`, 404);
      }
      
      // Duplicate check for dateOfStudy
      const existingLog = dailyLogs.find(l => l.studyId.toUpperCase() === studyId.toUpperCase() && l.dateOfStudy === dateOfStudy);
      if (existingLog) {
        return respond({
          isDuplicate: true,
          message: `You have already submitted a daily study log for ${dateOfStudy}.`,
          existingLog
        }, false, `Duplicate daily submission for date: ${dateOfStudy}`, 400);
      }
      
      // Multiple Sessions Support & Auto/Manual Calculation
      const rawSessions = Array.isArray(payload.sessions) ? payload.sessions : [];
      const cleanSessions = rawSessions.map((s, idx) => ({
        id: s.id || `sess_${Date.now()}_${idx}`,
        subject: String(s.subject || s.name || '').trim(),
        hours: Math.max(0, Number(s.hours) || 0),
        startTime: s.startTime || '',
        endTime: s.endTime || '',
        focus: Math.min(10, Math.max(1, parseInt(s.focus, 10) || 8)),
        productivity: Math.min(10, Math.max(1, parseInt(s.productivity, 10) || 8)),
        notes: sanitizeCsvFormula(String(s.notes || '').trim()),
        topic: sanitizeCsvFormula(String(s.topic || '').trim()),
      }));

      // Stream default subject names
      const isBio = (member.stream === CONFIG.STREAMS.BIO || String(member.stream).toLowerCase().includes('bio'));
      const defaultSub1 = isBio ? 'Biology' : 'Combined Maths';
      const defaultSub2 = isBio ? 'Chemistry' : 'Physics';
      const defaultSub3 = member.optionalSubject || (isBio ? 'Physics' : 'Chemistry');

      const subjectsPayload = Array.isArray(payload.subjects) ? payload.subjects : [];
      let sub1 = subjectsPayload[0] || { name: defaultSub1, hours: payload.hoursSubject1 || 0, focus: payload.focusScore || 8, productivity: payload.productivityScore || 8 };
      let sub2 = subjectsPayload[1] || { name: defaultSub2, hours: payload.hoursSubject2 || 0, focus: payload.focusScore || 8, productivity: payload.productivityScore || 8 };
      let sub3 = subjectsPayload[2] || { name: defaultSub3, hours: payload.hoursSubject3 || 0, focus: payload.focusScore || 8, productivity: payload.productivityScore || 8 };

      // If sessions are provided and subject hours were not manually specified
      if (cleanSessions.length > 0) {
        const hoursMap = {};
        cleanSessions.forEach(s => {
          const subKey = s.subject.toLowerCase();
          hoursMap[subKey] = (hoursMap[subKey] || 0) + s.hours;
        });

        // Match sessions to the 3 subjects
        const calcSub1 = hoursMap[defaultSub1.toLowerCase()] || hoursMap[sub1.name.toLowerCase()] || 0;
        const calcSub2 = hoursMap[defaultSub2.toLowerCase()] || hoursMap[sub2.name.toLowerCase()] || 0;
        const calcSub3 = hoursMap[defaultSub3.toLowerCase()] || hoursMap[sub3.name.toLowerCase()] || 0;

        // If not manually overridden, auto-populate subject hours from sessions
        if (!payload.hoursSubject1 && payload.hoursSubject1 !== 0 && (!sub1.hours || sub1.hours === 0)) {
          sub1.hours = Number(calcSub1.toFixed(2));
        }
        if (!payload.hoursSubject2 && payload.hoursSubject2 !== 0 && (!sub2.hours || sub2.hours === 0)) {
          sub2.hours = Number(calcSub2.toFixed(2));
        }
        if (!payload.hoursSubject3 && payload.hoursSubject3 !== 0 && (!sub3.hours || sub3.hours === 0)) {
          sub3.hours = Number(calcSub3.toFixed(2));
        }
      }

      const sub1Hours = Math.max(0, Number(payload.hoursSubject1 !== undefined ? payload.hoursSubject1 : sub1.hours) || 0);
      const sub2Hours = Math.max(0, Number(payload.hoursSubject2 !== undefined ? payload.hoursSubject2 : sub2.hours) || 0);
      const sub3Hours = Math.max(0, Number(payload.hoursSubject3 !== undefined ? payload.hoursSubject3 : sub3.hours) || 0);
      
      // Calculate or accept manual total hours
      const calculatedTotal = Number((sub1Hours + sub2Hours + sub3Hours).toFixed(2));
      const totalHours = payload.totalHours !== undefined && payload.totalHours !== null
        ? Math.max(0, Number(payload.totalHours))
        : calculatedTotal;
      
      let proofPhotoUrl = '';
      if (payload.proofFile && payload.proofFile.base64) {
        proofPhotoUrl = saveProofPhotoLocally(
          studyId,
          dateOfStudy,
          payload.proofFile.base64,
          payload.proofFile.mimeType || 'image/jpeg',
          payload.proofFile.fileName || 'proof.jpg',
          hostUrl
        );
      }
      
      const timestamp = new Date().toISOString();
      const logEntry = {
        timestamp,
        studyId,
        email: email || member.email,
        dateOfStudy,
        sessions: cleanSessions,
        subjects: [
          {
            name: sub1.name || defaultSub1,
            hours: sub1Hours,
            focus: Math.min(10, Math.max(0, parseInt(payload.focusScore || sub1.focus, 10) || 8)),
            productivity: Math.min(10, Math.max(0, parseInt(payload.productivityScore || sub1.productivity, 10) || 8))
          },
          {
            name: sub2.name || defaultSub2,
            hours: sub2Hours,
            focus: Math.min(10, Math.max(0, parseInt(payload.focusScore || sub2.focus, 10) || 8)),
            productivity: Math.min(10, Math.max(0, parseInt(payload.productivityScore || sub2.productivity, 10) || 8))
          },
          {
            name: sub3.name || defaultSub3,
            hours: sub3Hours,
            focus: Math.min(10, Math.max(0, parseInt(payload.focusScore || sub3.focus, 10) || 8)),
            productivity: Math.min(10, Math.max(0, parseInt(payload.productivityScore || sub3.productivity, 10) || 8))
          }
        ],
        subject1Hours: sub1Hours,
        subject2Hours: sub2Hours,
        subject3Hours: sub3Hours,
        hoursSubject1: sub1Hours,
        hoursSubject2: sub2Hours,
        hoursSubject3: sub3Hours,
        focusScore: parseInt(payload.focusScore, 10) || 8,
        productivityScore: parseInt(payload.productivityScore, 10) || 8,
        totalHours,
        notes,
        telegram: telegram || member.telegram,
        proofPhotoUrl
      };
      
      dailyLogs.push(logEntry);
      saveDb('daily_logs', dailyLogs);
      
      return respond({
        isDuplicate: false,
        logId: timestamp,
        studyId,
        dateOfStudy,
        totalHours,
        proofPhotoUrl,
        log: logEntry
      });
    }
    
    case 'getStudentHistory': {
      const studyId = String(payload.studyId || '').trim();
      const email = String(payload.email || '').trim().toLowerCase();
      
      let targetStudyId = studyId;
      if (!targetStudyId && email) {
        const mem = members.find(m => m.email.toLowerCase() === email);
        if (mem) {
          targetStudyId = mem.studyId;
        } else {
          return createJsonResponse(res, null, false, `Member not found for email: ${email}`, 404);
        }
      }
      
      if (!targetStudyId) {
        return createJsonResponse(res, null, false, 'Either studyId or email parameter is required.', 400);
      }
      
      const logs = dailyLogs
        .filter(l => l.studyId.toUpperCase() === targetStudyId.toUpperCase())
        .sort((a, b) => new Date(b.dateOfStudy).getTime() - new Date(a.dateOfStudy).getTime());
        
      const stats = getStudentPersonalStats(targetStudyId, dailyLogs);
      
      return createJsonResponse(res, {
        studyId: targetStudyId,
        logs,
        stats
      });
    }
    
    case 'verifyMember': {
      const studyId = String(payload.studyId || payload.id || '').trim();
      if (!studyId) {
        return createJsonResponse(res, null, false, 'Study ID parameter is required.', 400);
      }
      
      const member = members.find(m => m.studyId.toUpperCase() === studyId.toUpperCase());
      if (!member) {
        return createJsonResponse(res, {
          valid: false,
          message: `No member found matching Study ID: ${studyId}`
        });
      }
      
      return createJsonResponse(res, {
        valid: true,
        member: {
          studyId: member.studyId,
          fullName: member.fullName,
          school: member.school,
          stream: member.stream,
          optionalSubject: member.optionalSubject,
          registrationDate: member.registrationDate,
          status: member.status,
          examYear: member.examYear || '2026'
        }
      });
    }

    case 'updateProfile': {
      const email = String(payload.email || '').trim().toLowerCase();
      const studyId = String(payload.studyId || '').trim().toUpperCase();
      
      const member = members.find(m => (email && m.email.toLowerCase() === email) || (studyId && m.studyId.toUpperCase() === studyId));
      if (!member) {
        return createJsonResponse(res, null, false, 'Member not found.', 404);
      }
      
      if (payload.fullName) member.fullName = String(payload.fullName).trim();
      if (payload.gender) member.gender = String(payload.gender).trim();
      if (payload.telegram || payload.telegramUsername) {
        member.telegram = normalizeTelegramUsername(payload.telegram || payload.telegramUsername);
        member.telegramUsername = member.telegram;
      }
      if (payload.school) member.school = String(payload.school).trim();
      if (payload.stream) member.stream = String(payload.stream).trim();
      if (payload.optionalSubject) member.optionalSubject = String(payload.optionalSubject).trim();
      if (payload.status) member.status = String(payload.status).trim();
      if (payload.examYear) member.examYear = String(payload.examYear).trim();
      
      saveDb('members', members);
      return createJsonResponse(res, { updated: true, member });
    }

    case 'adminUpdateMember': {
      const adminEmail = String(payload.adminEmail || '').trim().toLowerCase();
      const isWhitelisted = CONFIG.ADMIN_EMAILS.some(e => e.toLowerCase() === adminEmail) || adminEmail === 'alwisachalaanurada@gmail.com';
      if (!isWhitelisted) {
        return createJsonResponse(res, null, false, `Access Denied: Email '${adminEmail}' is not authorized as an administrator.`, 403);
      }
      
      const studyId = String(payload.studyId || '').trim().toUpperCase();
      const member = members.find(m => m.studyId.toUpperCase() === studyId);
      if (!member) {
        return createJsonResponse(res, null, false, `Member ${studyId} not found.`, 404);
      }
      
      if (payload.fullName) member.fullName = String(payload.fullName).trim();
      if (payload.school) member.school = String(payload.school).trim();
      if (payload.stream) member.stream = String(payload.stream).trim();
      if (payload.optionalSubject) member.optionalSubject = String(payload.optionalSubject).trim();
      if (payload.status) member.status = String(payload.status).trim();
      if (payload.examYear) member.examYear = String(payload.examYear).trim();
      if (payload.telegram || payload.telegramUsername) {
        member.telegram = normalizeTelegramUsername(payload.telegram || payload.telegramUsername);
        member.telegramUsername = member.telegram;
      }
      
      saveDb('members', members);
      return createJsonResponse(res, { updated: true, member });
    }

    case 'adminDeleteMember': {
      const adminEmail = String(payload.adminEmail || '').trim().toLowerCase();
      const isWhitelisted = CONFIG.ADMIN_EMAILS.some(e => e.toLowerCase() === adminEmail) || adminEmail === 'alwisachalaanurada@gmail.com';
      if (!isWhitelisted) {
        return createJsonResponse(res, null, false, `Access Denied: Email '${adminEmail}' is not authorized as an administrator.`, 403);
      }
      const studyId = String(payload.studyId || '').trim().toUpperCase();
      members = members.filter(m => m.studyId.toUpperCase() !== studyId);
      saveDb('members', members);
      return createJsonResponse(res, { success: true, deletedStudyId: studyId });
    }

    case 'adminDeleteLog': {
      const adminEmail = String(payload.adminEmail || '').trim().toLowerCase();
      const isWhitelisted = CONFIG.ADMIN_EMAILS.some(e => e.toLowerCase() === adminEmail) || adminEmail === 'alwisachalaanurada@gmail.com';
      if (!isWhitelisted) {
        return createJsonResponse(res, null, false, `Access Denied: Email '${adminEmail}' is not authorized as an administrator.`, 403);
      }
      const studyId = String(payload.studyId || '').trim().toUpperCase();
      const dateOfStudy = String(payload.dateOfStudy || '').trim();
      dailyLogs = dailyLogs.filter(l => !(l.studyId.toUpperCase() === studyId && l.dateOfStudy === dateOfStudy));
      saveDb('daily_logs', dailyLogs);
      return createJsonResponse(res, { success: true, deletedLog: { studyId, dateOfStudy } });
    }

    case 'adminEditLog': {
      const adminEmail = String(payload.adminEmail || '').trim().toLowerCase();
      const isWhitelisted = CONFIG.ADMIN_EMAILS.some(e => e.toLowerCase() === adminEmail) || adminEmail === 'alwisachalaanurada@gmail.com';
      if (!isWhitelisted) {
        return createJsonResponse(res, null, false, `Access Denied: Email '${adminEmail}' is not authorized as an administrator.`, 403);
      }
      const studyId = String(payload.studyId || '').trim().toUpperCase();
      const dateOfStudy = String(payload.dateOfStudy || '').trim();
      const log = dailyLogs.find(l => (l.studyId || '').toUpperCase() === studyId && (l.dateOfStudy === dateOfStudy || l.date === dateOfStudy));
      if (!log) {
        return createJsonResponse(res, null, false, `Daily log for ${studyId} on ${dateOfStudy} not found.`, 404);
      }
      if (payload.subject1Hours !== undefined) log.subject1Hours = Number(payload.subject1Hours);
      if (payload.subject2Hours !== undefined) log.subject2Hours = Number(payload.subject2Hours);
      if (payload.subject3Hours !== undefined) log.subject3Hours = Number(payload.subject3Hours);
      if (payload.totalHours !== undefined) log.totalHours = Number(payload.totalHours);
      if (payload.notes !== undefined) log.notes = String(payload.notes).trim();
      saveDb('daily_logs', dailyLogs);
      return createJsonResponse(res, { success: true, updated: true, log });
    }

    case 'adminAddMember': {
      return handleApiAction('registerUser', payload, hostUrl, req, res);
    }

    case 'adminVerifyMember':
    case 'adminSetMemberVerification': {
      const adminEmail = String(payload.adminEmail || '').trim().toLowerCase();
      const isWhitelisted = CONFIG.ADMIN_EMAILS.some(e => e.toLowerCase() === adminEmail) || adminEmail === 'alwisachalaanurada@gmail.com';
      if (!isWhitelisted) {
        return createJsonResponse(res, null, false, `Access Denied: Email '${adminEmail}' is not authorized as an administrator.`, 403);
      }
      const studyId = String(payload.studyId || '').trim().toUpperCase();
      const newStatus = String(payload.status || payload.verificationStatus || 'Verified').trim();
      const member = members.find(m => m.studyId.toUpperCase() === studyId);
      if (!member) {
        return createJsonResponse(res, null, false, `Member ${studyId} not found.`, 404);
      }
      member.status = newStatus;
      saveDb('members', members);
      return createJsonResponse(res, { success: true, studyId, status: newStatus, message: `Member ${studyId} verification status updated to ${newStatus}` });
    }

    case 'adminBanMember': {
      const adminEmail = String(payload.adminEmail || '').trim().toLowerCase();
      const isWhitelisted = CONFIG.ADMIN_EMAILS.some(e => e.toLowerCase() === adminEmail) || adminEmail === 'alwisachalaanurada@gmail.com';
      if (!isWhitelisted) {
        return createJsonResponse(res, null, false, `Access Denied: Email '${adminEmail}' is not authorized as an administrator.`, 403);
      }
      const studyId = String(payload.studyId || '').trim().toUpperCase();
      const member = members.find(m => m.studyId.toUpperCase() === studyId);
      if (!member) {
        return createJsonResponse(res, null, false, `Member ${studyId} not found.`, 404);
      }
      member.status = 'Suspended';
      saveDb('members', members);
      return createJsonResponse(res, { success: true, studyId, status: 'Suspended', message: `Member ${studyId} suspended.` });
    }

    case 'adminAddAdmin':
    case 'adminPromoteAdmin': {
      const adminEmail = String(payload.adminEmail || '').trim().toLowerCase();
      const isWhitelisted = CONFIG.ADMIN_EMAILS.some(e => e.toLowerCase() === adminEmail) || adminEmail === 'alwisachalaanurada@gmail.com';
      if (!isWhitelisted) {
        return createJsonResponse(res, null, false, `Access Denied: Email '${adminEmail}' is not authorized as an administrator.`, 403);
      }
      const targetEmail = String(payload.targetEmail || payload.email || payload.newAdminEmail || '').trim().toLowerCase();
      if (!targetEmail || !targetEmail.includes('@')) {
        return createJsonResponse(res, null, false, 'Invalid target email address.', 400);
      }
      if (!CONFIG.ADMIN_EMAILS.some(e => e.toLowerCase() === targetEmail)) {
        CONFIG.ADMIN_EMAILS.push(targetEmail);
      }
      return createJsonResponse(res, { success: true, targetEmail, admins: CONFIG.ADMIN_EMAILS, message: `${targetEmail} promoted to administrator.` });
    }

    case 'adminSetExamCountdown':
    case 'adminSetExamDate': {
      const adminEmail = String(payload.adminEmail || '').trim().toLowerCase();
      const isWhitelisted = CONFIG.ADMIN_EMAILS.some(e => e.toLowerCase() === adminEmail) || adminEmail === 'alwisachalaanurada@gmail.com';
      if (!isWhitelisted) {
        return createJsonResponse(res, null, false, `Access Denied: Email '${adminEmail}' is not authorized as an administrator.`, 403);
      }
      const year = String(payload.year || payload.examYear || '2026').trim();
      const targetDate = String(payload.targetDate || payload.date || '').trim();
      if (!targetDate) {
        return createJsonResponse(res, null, false, 'targetDate parameter is required.', 400);
      }
      if (!CONFIG.EXAM_DATES) CONFIG.EXAM_DATES = { ...CONFIG.DEFAULT_EXAM_DATES };
      CONFIG.EXAM_DATES[year] = targetDate;
      return createJsonResponse(res, { success: true, year, targetDate, examDates: CONFIG.EXAM_DATES, message: `Exam countdown date for ${year} updated.` });
    }

    case 'getExamDates': {
      return createJsonResponse(res, { success: true, examDates: CONFIG.EXAM_DATES || CONFIG.DEFAULT_EXAM_DATES });
    }

    case 'adminCreateLiveStudyRoom': {
      const adminEmail = String(payload.adminEmail || '').trim().toLowerCase();
      const isWhitelisted = CONFIG.ADMIN_EMAILS.some(e => e.toLowerCase() === adminEmail) || adminEmail === 'alwisachalaanurada@gmail.com';
      if (!isWhitelisted) {
        return createJsonResponse(res, null, false, `Access Denied: Email '${adminEmail}' is not authorized as an administrator.`, 403);
      }
      const platform = String(payload.platform || 'google_meet').toLowerCase();
      const topic = String(payload.topic || payload.title || 'Sri Lanka A/L StudySync Live Study Hall').trim();
      let roomUrl = '';
      let roomCode = '';
      if (platform === 'zoom') {
        const zoomId = Math.floor(8000000000 + Math.random() * 1999999999).toString();
        const pwd = Math.floor(100000 + Math.random() * 900000).toString();
        roomUrl = `https://zoom.us/j/${zoomId}?pwd=${pwd}`;
        roomCode = zoomId;
      } else {
        const letters = 'abcdefghijklmnopqrstuvwxyz';
        const randLetters = (n) => Array.from({ length: n }, () => letters.charAt(Math.floor(Math.random() * letters.length))).join('');
        roomCode = `${randLetters(3)}-${randLetters(4)}-${randLetters(3)}`;
        roomUrl = `https://meet.google.com/${roomCode}`;
      }
      const inviteText = `🎓 STUDYSYNC LIVE A/L STUDY SESSION\n📌 ${topic}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n🔗 Join Room: ${roomUrl}\n📱 Platform: ${platform === 'zoom' ? 'Zoom Meeting' : 'Google Meet'}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n👉 Open StudySync: https://studysync-al-2026.web.app`;
      return createJsonResponse(res, { success: true, platform, topic, roomUrl, roomCode, inviteText, createdAt: new Date().toISOString() });
    }
    
    case 'getAdminData': {
      const adminEmail = String(payload.adminEmail || payload.email || '').trim().toLowerCase();
      const isWhitelisted = CONFIG.ADMIN_EMAILS.some(e => e.toLowerCase() === adminEmail) || adminEmail === 'alwisachalaanurada@gmail.com';
      
      if (!isWhitelisted) {
        return createJsonResponse(res, null, false, `Access Denied: Email '${adminEmail}' is not authorized as an administrator.`, 403);
      }
      
      const sortedLogs = [...dailyLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      const analytics = computeGroupAnalytics(members, dailyLogs);
      const leaderboard = computeLeaderboard(members, dailyLogs);
      
      return createJsonResponse(res, {
        members,
        logs: sortedLogs,
        recentLogs: sortedLogs,
        analytics,
        leaderboard,
        admins: CONFIG.ADMIN_EMAILS,
        examDates: CONFIG.EXAM_DATES || CONFIG.DEFAULT_EXAM_DATES
      });
    }
    
    case 'getAnalytics': {
      const analytics = computeGroupAnalytics(members, dailyLogs);
      const leaderboard = computeLeaderboard(members, dailyLogs);
      
      return createJsonResponse(res, {
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
        examDates: CONFIG.EXAM_DATES || CONFIG.DEFAULT_EXAM_DATES
      });
    }

    case 'adminCreateForm': {
      const adminEmail = String(payload.adminEmail || '').trim().toLowerCase();
      const isWhitelisted = CONFIG.ADMIN_EMAILS.some(e => e.toLowerCase() === adminEmail) || adminEmail === 'alwisachalaanurada@gmail.com';
      if (!isWhitelisted) {
        return createJsonResponse(res, null, false, `Access Denied: Email '${adminEmail}' is not authorized as an administrator.`, 403);
      }
      const title = String(payload.title || '').trim();
      if (!title) {
        return createJsonResponse(res, null, false, 'Form title is required.', 400);
      }
      const forms = loadDb('forms', []);
      const formId = `FORM-${Date.now()}`;
      const newForm = {
        formId,
        title,
        description: String(payload.description || '').trim(),
        targetAudience: payload.targetAudience || 'all',
        fields: Array.isArray(payload.fields) ? payload.fields : [],
        createdBy: adminEmail,
        createdAt: new Date().toISOString(),
        isActive: true,
        responseCount: 0
      };
      forms.unshift(newForm);
      saveDb('forms', forms);

      // Dispatch to matching student inboxes
      const inboxes = loadDb('inboxes', {});
      const targetAudience = newForm.targetAudience;
      members.forEach(m => {
        const isMatch = targetAudience === 'all' || m.stream === targetAudience;
        if (isMatch && m.studyId) {
          const sId = m.studyId.toUpperCase();
          if (!inboxes[sId]) inboxes[sId] = [];
          inboxes[sId].unshift({
            id: `MSG-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            type: 'form',
            title: `New Survey: ${newForm.title}`,
            sender: 'StudySync Administration',
            body: newForm.description || 'Please complete this academic review form.',
            form: newForm,
            date: new Date().toISOString(),
            read: false,
            responded: false
          });
        }
      });
      saveDb('inboxes', inboxes);

      return createJsonResponse(res, { success: true, form: newForm });
    }

    case 'submitFormResponse': {
      const formId = String(payload.formId || '').trim();
      const studyId = String(payload.studyId || '').trim().toUpperCase();
      if (!formId || !studyId) {
        return createJsonResponse(res, null, false, 'formId and studyId are required.', 400);
      }
      const responses = loadDb('form_responses', []);
      const responseId = `RESP-${Date.now()}-${studyId}`;
      const newResp = {
        responseId,
        formId,
        studyId,
        studentName: String(payload.studentName || '').trim(),
        studentEmail: String(payload.studentEmail || '').trim(),
        answers: payload.answers || {},
        submittedAt: new Date().toISOString()
      };
      responses.unshift(newResp);
      saveDb('form_responses', responses);

      // Update form response count
      const forms = loadDb('forms', []);
      const form = forms.find(f => f.formId === formId);
      if (form) {
        form.responseCount = (form.responseCount || 0) + 1;
        saveDb('forms', forms);
      }

      // Mark inbox form as responded
      const inboxes = loadDb('inboxes', {});
      if (inboxes[studyId]) {
        const msg = inboxes[studyId].find(m => m.form && m.form.formId === formId);
        if (msg) {
          msg.responded = true;
          msg.read = true;
          saveDb('inboxes', inboxes);
        }
      }

      return createJsonResponse(res, { success: true, responseId, message: 'Response submitted successfully.' });
    }

    case 'getAdminForms': {
      const adminEmail = String(payload.adminEmail || '').trim().toLowerCase();
      const isWhitelisted = CONFIG.ADMIN_EMAILS.some(e => e.toLowerCase() === adminEmail) || adminEmail === 'alwisachalaanurada@gmail.com';
      if (!isWhitelisted) {
        return createJsonResponse(res, null, false, `Access Denied: Email '${adminEmail}' is not authorized as an administrator.`, 403);
      }
      const forms = loadDb('forms', []);
      const responses = loadDb('form_responses', []);
      return createJsonResponse(res, { success: true, forms, responses });
    }

    case 'getUserInbox': {
      const studyId = String(payload.studyId || '').trim().toUpperCase();
      if (!studyId) {
        return createJsonResponse(res, null, false, 'studyId is required.', 400);
      }
      const inboxes = loadDb('inboxes', {});
      const userMessages = inboxes[studyId] || [];
      return createJsonResponse(res, { success: true, messages: userMessages });
    }

    // ========================================================================
    // TELEGRAM BOT WEBHOOK ACTION
    // ========================================================================
    case 'telegramWebhook': {
      const message = payload.message || payload.edited_message || (payload.callback_query ? payload.callback_query.message : null);
      const chatId = message && message.chat ? message.chat.id : (payload.chatId || 'mock_chat_id');
      const text = (message && message.text ? message.text : (payload.text || '')).trim();
      
      const parts = text.split(/\s+/);
      const rawCommand = parts[0] || (payload.command || '');
      const command = rawCommand.split('@')[0].toLowerCase();
      const args = parts.slice(1);
      
      const senderUsername = message && message.from && message.from.username ? message.from.username : (payload.username || '');
      const normalizedSender = normalizeTelegramUsername(senderUsername);
      
      switch (command) {
        case '/start': {
          const studyIdArg = args.length > 0 ? args[0].trim().toUpperCase() : '';
          
          if (studyIdArg && (studyIdArg.startsWith('SG-BIO-') || studyIdArg.startsWith('SG-MATH-') || /^SG-[A-Z]+-\d+$/i.test(studyIdArg))) {
            const member = members.find(m => m.studyId.toUpperCase() === studyIdArg);
            if (!member) {
              const notFoundMsg = `❌ *Study ID not found: ${studyIdArg}*\n\nPlease check your Study ID or register at https://studysync-al-2026.web.app/register`;
              return createJsonResponse(res, { handled: true, command: '/start', chatId, replyText: notFoundMsg, error: 'Study ID not found' });
            }
            
            if (normalizedSender) {
              member.telegram = normalizedSender;
              member.telegramUsername = normalizedSender;
              saveDb('members', members);
            }
            
            const welcomeMsg = [
              `🎓 *Welcome to StudySync, ${member.fullName}!*`,
              `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
              `🆔 *Study ID:* \`${member.studyId}\``,
              `📚 *Stream:* ${member.stream}${member.optionalSubject ? ` (${member.optionalSubject})` : ''}`,
              `🏫 *School:* ${member.school}`,
              `📅 *Exam Year:* ${member.examYear || '2026'}`,
              normalizedSender ? `✅ *Telegram Linked:* \`${normalizedSender}\`` : `⚠️ *Note:* Set a Telegram @username to enable 1-click /log.`,
              ``,
              `🚀 *Quick Commands:*`,
              `• \`/status\` — View your active streak & performance card`,
              `• \`/log <h1\\> <h2\\> <h3\\> [notes]\` — Submit daily study hours`,
              `• \`/leaderboard\` — Community streak rankings`,
              `• \`/remind\` — Check today's study submission status`,
              `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
              `👉 *Student Portal:* https://studysync-al-2026.web.app/dashboard`
            ].join('\n');
            
            return createJsonResponse(res, { handled: true, command: '/start', chatId, replyText: welcomeMsg, member, studyId: member.studyId });
          }
          
          if (normalizedSender) {
            const member = findMemberByTelegram(members, normalizedSender);
            if (member) {
              const stats = getStudentPersonalStats(member.studyId, dailyLogs);
              const linkedWelcome = [
                `🎓 *Welcome back, ${member.fullName}!*`,
                `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
                `🆔 *Study ID:* \`${member.studyId}\``,
                `📚 *Stream:* ${member.stream}`,
                `🔥 *Active Streak:* *${stats.currentStreak} Days*`,
                `⏱️ *Total Hours:* *${stats.totalHours.toFixed(1)} hrs*`,
                ``,
                `Use \`/status\` for your full study breakdown or \`/log\` to record today's sessions.`,
                `👉 *Dashboard:* https://studysync-al-2026.web.app/dashboard`
              ].join('\n');
              return createJsonResponse(res, { handled: true, command: '/start', chatId, replyText: linkedWelcome, member, studyId: member.studyId });
            }
          }
          
          const unlinkedMsg = [
            `👋 *Welcome to StudySync A/L Accountability Bot!*`,
            `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
            `Track your daily Sri Lankan A/L study hours, maintain unbroken streaks, and compete on the national leaderboard.`,
            ``,
            `🔗 *How to Link Your Account:*`,
            `If you already have a Study ID:`,
            `👉 \`/start <YOUR_STUDY_ID>\` (e.g. \`/start SG-BIO-0001\`)`,
            ``,
            `📝 *Not registered yet?*`,
            `Register online in 30 seconds:`,
            `👉 https://studysync-al-2026.web.app/register`
          ].join('\n');
          return createJsonResponse(res, { handled: true, command: '/start', chatId, replyText: unlinkedMsg });
        }
        
        case '/status': {
          const studyIdArg = args.length > 0 ? args[0].trim().toUpperCase() : '';
          let member = null;
          if (studyIdArg) {
            member = members.find(m => m.studyId.toUpperCase() === studyIdArg);
          } else if (normalizedSender) {
            member = findMemberByTelegram(members, normalizedSender);
          }
          
          if (!member) {
            const errorMsg = [
              `❌ *Student account not found.*`,
              ``,
              studyIdArg 
                ? `No member matching Study ID \`${studyIdArg}\` was found.` 
                : `Your Telegram handle (\`${normalizedSender || 'unknown'}\`) is not linked to any student record.`,
              ``,
              `👉 Link your account with: \`/start <YOUR_STUDY_ID>\``,
              `👉 Or check your status with: \`/status <YOUR_STUDY_ID>\` (e.g. \`/status SG-BIO-0001\`)`,
              `👉 Register: https://studysync-al-2026.web.app/register`
            ].join('\n');
            return createJsonResponse(res, { handled: true, command: '/status', chatId, replyText: errorMsg, error: 'Member not found' });
          }
          
          const stats = getStudentPersonalStats(member.studyId, dailyLogs);
          const todayDateStr = getLocalDateString(new Date());
          const todayLog = dailyLogs.find(l => l.studyId.toUpperCase() === member.studyId.toUpperCase() && l.dateOfStudy === todayDateStr);
          
          const todayStatusText = todayLog 
            ? `✅ Completed (${todayLog.totalHours.toFixed(1)} hrs)` 
            : `⏳ Pending (Submit before 23:59)`;
            
          const subKeys = Object.keys(stats.subjectHours || {});
          let subjectsBreakdown = '';
          if (subKeys.length > 0) {
            subjectsBreakdown = subKeys.map(k => `• *${k}:* ${(stats.subjectHours[k] || 0).toFixed(1)} hrs`).join('\n');
          } else {
            subjectsBreakdown = '• _No study hours logged yet_';
          }
          
          const aiSnippet = generateAiRecommendation(member, {
            streak: stats.currentStreak,
            totalHours: stats.totalHours,
            avgFocus: stats.avgFocus,
            subjectHours: stats.subjectHours,
            studiedToday: !!todayLog
          });
          
          const statusCard = [
            `📊 *STUDYSYNC PERFORMANCE CARD*`,
            `👤 *Student:* *${member.fullName}* (\`${member.studyId}\`)`,
            `🏫 *School:* ${member.school}`,
            `📚 *Stream:* ${member.stream}${member.optionalSubject ? ` (${member.optionalSubject})` : ''}`,
            `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
            `🔥 *Active Streak:* *${stats.currentStreak} Days* (Max: ${stats.maxStreak} Days)`,
            `⏱️ *Total Study Hours:* *${stats.totalHours.toFixed(1)} hrs* (${stats.totalLogs} sessions)`,
            `⚡ *Average Focus:* *${stats.avgFocus > 0 ? stats.avgFocus.toFixed(1) + ' / 10' : 'N/A'}*`,
            `📅 *Today's Status:* ${todayStatusText}`,
            ``,
            `📖 *Subject Breakdown:*`,
            subjectsBreakdown,
            ``,
            `💡 *AI Prescription & Insight:*`,
            aiSnippet,
            `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
            `👉 *Student Portal:* https://studysync-al-2026.web.app/dashboard`
          ].join('\n');
          
          return createJsonResponse(res, { handled: true, command: '/status', chatId, replyText: statusCard, member, studyId: member.studyId });
        }
        
        case '/log': {
          if (!normalizedSender) {
            const noHandleMsg = '❌ *Telegram Username Required:* Please configure a Telegram username in Telegram Settings and link your account with `/start <STUDY_ID>` before logging hours.';
            return createJsonResponse(res, { handled: true, command: '/log', chatId, replyText: noHandleMsg, error: 'No telegram username' });
          }
          
          const member = findMemberByTelegram(members, normalizedSender);
          if (!member) {
            const unlinkedMsg = `❌ *Account not linked.* We could not find a student record for \`${normalizedSender}\`.\n\nPlease link your Study ID first: \`/start <YOUR_STUDY_ID>\` (e.g. \`/start SG-BIO-0001\`)`;
            return createJsonResponse(res, { handled: true, command: '/log', chatId, replyText: unlinkedMsg, error: 'Account not linked' });
          }
          
          const numMatches = [];
          let notesStartIndex = -1;
          for (let i = 0; i < args.length; i++) {
            const parsedNum = parseFloat(args[i]);
            if (!isNaN(parsedNum) && /^-?\d+(\.\d+)?$/.test(args[i]) && numMatches.length < 3) {
              numMatches.push(parsedNum);
            } else {
              notesStartIndex = i;
              break;
            }
          }
          
          if (numMatches.length < 3) {
            const syntaxMsg = [
              `❌ *Invalid /log syntax.*`,
              ``,
              `👉 *Usage:* \`/log <h1\\> <h2\\> <h3\\> [optional notes]\``,
              `👉 *Example:* \`/log 2.5 2.0 1.5 Completed 2022 past papers\``,
              ``,
              `Your 3 registered subjects for ${member.stream}:`,
              `1. ${member.stream === 'Biological Science' ? 'Biology' : 'Combined Maths'}`,
              `2. ${member.stream === 'Biological Science' ? 'Chemistry' : 'Physics'}`,
              `3. ${member.optionalSubject || 'Optional Subject'}`
            ].join('\n');
            return createJsonResponse(res, { handled: true, command: '/log', chatId, replyText: syntaxMsg, error: 'Invalid syntax' });
          }
          
          const [h1, h2, h3] = numMatches;
          const totalToday = Number((h1 + h2 + h3).toFixed(2));
          
          if (h1 < 0 || h2 < 0 || h3 < 0 || totalToday > 24) {
            const boundErrorMsg = `❌ *Invalid hours:* Each subject must be >= 0 and total daily hours cannot exceed 24.0. Got: ${totalToday} hrs.`;
            return createJsonResponse(res, { handled: true, command: '/log', chatId, replyText: boundErrorMsg, error: 'Hours out of bounds' });
          }
          
          const notes = notesStartIndex >= 0 ? args.slice(notesStartIndex).join(' ') : '';
          const todayDateStr = getLocalDateString(new Date());
          
          const existingLog = dailyLogs.find(l => l.studyId.toUpperCase() === member.studyId.toUpperCase() && l.dateOfStudy === todayDateStr);
          if (existingLog) {
            const dupMsg = `⚠️ *Duplicate Submission:* You have already submitted a daily study log for today (${todayDateStr}).\n\nUse \`/status\` to view your summary.`;
            return createJsonResponse(res, { handled: true, command: '/log', chatId, replyText: dupMsg, isDuplicate: true });
          }
          
          const sub1Name = member.stream === 'Biological Science' ? 'Biology' : 'Combined Maths';
          const sub2Name = member.stream === 'Biological Science' ? 'Chemistry' : 'Physics';
          const sub3Name = member.optionalSubject || (member.stream === 'Biological Science' ? 'Physics' : 'Chemistry');
          
          const timestamp = new Date().toISOString();
          const logEntry = {
            timestamp,
            studyId: member.studyId,
            email: member.email,
            dateOfStudy: todayDateStr,
            subjects: [
              { name: sub1Name, hours: h1, focus: 8, productivity: 8 },
              { name: sub2Name, hours: h2, focus: 8, productivity: 8 },
              { name: sub3Name, hours: h3, focus: 8, productivity: 8 }
            ],
            totalHours: totalToday,
            notes,
            telegram: normalizedSender,
            proofPhotoUrl: ''
          };
          
          dailyLogs.push(logEntry);
          saveDb('daily_logs', dailyLogs);
          
          const stats = getStudentPersonalStats(member.studyId, dailyLogs);
          
          const receiptMsg = [
            `✅ *STUDY LOG RECORDED SUCCESSFULLY!*`,
            `📅 *Date:* ${todayDateStr}`,
            `👤 *Student:* *${member.fullName}* (\`${member.studyId}\`)`,
            `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
            `• 📘 *${sub1Name}:* ${h1.toFixed(1)} hrs`,
            `• 📗 *${sub2Name}:* ${h2.toFixed(1)} hrs`,
            `• 📙 *${sub3Name}:* ${h3.toFixed(1)} hrs`,
            `⏱️ *Total Today:* *${totalToday.toFixed(1)} hrs*`,
            `🔥 *Active Streak:* *${stats.currentStreak} Days* (Max: ${stats.maxStreak} Days)`,
            notes ? `📝 *Notes:* _${notes}_` : '',
            `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
            `🎉 Keep up the daily discipline!`,
            `👉 *Dashboard:* https://studysync-al-2026.web.app/dashboard`
          ].filter(Boolean).join('\n');
          
          return createJsonResponse(res, {
            handled: true,
            command: '/log',
            chatId,
            replyText: receiptMsg,
            member,
            studyId: member.studyId,
            totalHours: totalToday,
            activeStreak: stats.currentStreak
          });
        }
        
        case '/leaderboard': {
          const streamFilter = args.length > 0 ? args[0].toLowerCase() : 'all';
          const fullLeaderboard = computeLeaderboard(members, dailyLogs);
          
          let filtered = fullLeaderboard;
          let streamTitle = 'All Streams (National)';
          if (streamFilter.startsWith('bio')) {
            filtered = fullLeaderboard.filter(e => e.stream === 'Biological Science');
            streamTitle = 'Biological Science Stream 🧬';
          } else if (streamFilter.startsWith('math') || streamFilter.startsWith('phys')) {
            filtered = fullLeaderboard.filter(e => e.stream === 'Physical Science');
            streamTitle = 'Physical Science Stream 📐';
          }
          
          const top10 = filtered.slice(0, 10);
          const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
          
          const listRows = [];
          if (top10.length === 0) {
            listRows.push('• _No active study streaks recorded yet_');
          } else {
            top10.forEach((item, idx) => {
              const medal = medals[idx] || `${idx + 1}.`;
              listRows.push(`${medal} *${item.name}* (\`${item.studyId}\`)\n   🔥 *${item.streak} Days* • ⏱️ ${item.totalHours.toFixed(1)}h • ${item.school || 'A/L'}`);
            });
          }
          
          const leaderboardCard = [
            `🏆 *STUDYSYNC STREAK LEADERBOARD*`,
            `📌 *${streamTitle}*`,
            `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
            listRows.join('\n'),
            `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
            `👥 *Total Active Members:* ${filtered.length}`,
            `👉 *Full Dashboard:* https://studysync-al-2026.web.app/admin`
          ].join('\n');
          
          return createJsonResponse(res, { handled: true, command: '/leaderboard', chatId, replyText: leaderboardCard, count: top10.length });
        }
        
        case '/remind': {
          if (!normalizedSender) {
            const msg = '❌ *Telegram Username Required:* Please set up a Telegram username and link your account with `/start <STUDY_ID>`.';
            return createJsonResponse(res, { handled: true, command: '/remind', chatId, replyText: msg });
          }
          
          const member = findMemberByTelegram(members, normalizedSender);
          if (!member) {
            const msg = '❌ *Account not linked.* Link your Study ID first: `/start <YOUR_STUDY_ID>`';
            return createJsonResponse(res, { handled: true, command: '/remind', chatId, replyText: msg });
          }
          
          const todayDateStr = getLocalDateString(new Date());
          const todayLog = dailyLogs.find(l => l.studyId.toUpperCase() === member.studyId.toUpperCase() && l.dateOfStudy === todayDateStr);
          const stats = getStudentPersonalStats(member.studyId, dailyLogs);
          
          let replyText = '';
          if (todayLog) {
            replyText = [
              `🎉 *You are all set for today, ${member.fullName}!*`,
              `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
              `✅ Today's study session has been logged.`,
              `🔥 *Active Streak:* *${stats.currentStreak} Days*`,
              `⏱️ *Total Hours:* *${stats.totalHours.toFixed(1)} hrs*`,
              ``,
              `Rest well, recover your cognitive energy, and be ready for tomorrow's revision!`,
              `👉 *Dashboard:* https://studysync-al-2026.web.app/dashboard`
            ].join('\n');
          } else {
            replyText = [
              `⏰ *STUDYSYNC ACCOUNTABILITY REMINDER*`,
              `Hey *${member.fullName}*! Your 🔥 *${stats.currentStreak}-Day Streak* is on the line!`,
              `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
              `You have not submitted your study hours for today (*${todayDateStr}*).`,
              ``,
              `👉 *Quick Log:* \`/log <h1\\> <h2\\> <h3\\> [notes]\``,
              `👉 *Online Portal:* https://studysync-al-2026.web.app/daily`,
              ``,
              `⏳ Submit before 23:59 Sri Lanka Time to keep your streak alive!`
            ].join('\n');
          }
          
          return createJsonResponse(res, { handled: true, command: '/remind', chatId, replyText, studiedToday: !!todayLog });
        }
        
        default: {
          if (command.startsWith('/')) {
            const unknownText = `❓ *Unknown command:* \`${command}\`\n\nUse \`/help\` to see the list of available commands.`;
            return createJsonResponse(res, { handled: true, command, chatId, replyText: unknownText });
          }
          const defaultText = `👋 Welcome to *StudySync Bot*! Use \`/start\` to begin or \`/status\` to check your study streaks.`;
          return createJsonResponse(res, { handled: true, command: 'none', chatId, replyText: defaultText });
        }
      }
    }

    // ========================================================================
    // BROADCAST DAILY DIGEST ACTION
    // ========================================================================
    case 'broadcastDailyDigest': {
      const adminEmail = String(payload.adminEmail || '').trim().toLowerCase();
      const isWhitelisted = CONFIG.ADMIN_EMAILS.some(e => e.toLowerCase() === adminEmail) || adminEmail === 'alwisachalaanurada@gmail.com';
      
      if (!isWhitelisted) {
        return createJsonResponse(res, null, false, `Access Denied: Email '${adminEmail}' is not authorized.`, 403);
      }
      
      const activeMembers = members.filter(m => m.status === 'Active');
      const todayDateStr = getLocalDateString(new Date());
      const todayLogs = dailyLogs.filter(l => l.dateOfStudy === todayDateStr);
      
      let totalTodayHours = 0;
      let bioHours = 0;
      let bioCount = 0;
      let mathHours = 0;
      let mathCount = 0;
      let focusSum = 0;
      let focusCount = 0;
      
      const studentTodayHoursMap = {};
      
      todayLogs.forEach(l => {
        const mem = members.find(m => m.studyId === l.studyId);
        const stream = mem ? mem.stream : '';
        const hrs = l.totalHours || 0;
        totalTodayHours += hrs;
        
        studentTodayHoursMap[l.studyId] = {
          studyId: l.studyId,
          name: mem ? mem.fullName : l.studyId,
          hours: hrs,
          focus: l.subjects && l.subjects[0] ? l.subjects[0].focus : 8
        };
        
        if (stream === 'Biological Science') {
          bioHours += hrs;
          bioCount++;
        } else if (stream === 'Physical Science') {
          mathHours += hrs;
          mathCount++;
        }
        
        if (Array.isArray(l.subjects)) {
          l.subjects.forEach(s => {
            if (s.focus > 0) {
              focusSum += s.focus;
              focusCount++;
            }
          });
        }
      });
      
      const activeStudentsToday = todayLogs.length;
      const totalActiveMembers = activeMembers.length;
      const participationRate = totalActiveMembers > 0 ? Math.round((activeStudentsToday / totalActiveMembers) * 100) : 0;
      const avgHoursPerStudent = activeStudentsToday > 0 ? (totalTodayHours / activeStudentsToday) : 0;
      const avgGroupFocus = focusCount > 0 ? (focusSum / focusCount) : 8.0;
      
      const leaderboard = computeLeaderboard(members, dailyLogs);
      const top5 = leaderboard.slice(0, 5);
      
      const medals = ['🥇 1.', '🥈 2.', '🥉 3.', '4️⃣ 4.', '5️⃣ 5.'];
      const leaderboardLines = [];
      if (top5.length === 0) {
        leaderboardLines.push('• _No active study streaks recorded yet_');
      } else {
        top5.forEach((item, idx) => {
          const medal = medals[idx] || `${idx + 1}.`;
          leaderboardLines.push(`${medal} *${item.name}* (\`${item.studyId}\`) — 🔥 *${item.streak} Days* (${item.totalHours.toFixed(1)}h) • ${item.school || 'A/L'}`);
        });
      }
      
      const todayStudentsList = Object.values(studentTodayHoursMap);
      todayStudentsList.sort((a, b) => b.hours - a.hours);
      const mvpVolume = todayStudentsList[0] || (top5[0] ? { name: top5[0].name, hours: top5[0].totalHours } : null);
      
      const mvpFocusList = [...todayStudentsList].sort((a, b) => b.focus - a.focus);
      const mvpFocus = mvpFocusList[0] || (top5[0] ? { name: top5[0].name, focus: 9 } : null);
      
      const pendingCount = Math.max(0, totalActiveMembers - activeStudentsToday);
      
      const dateObj = new Date();
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayOfWeek = days[dateObj.getDay()];
      
      const digestText = [
        `📢 *STUDYSYNC DAILY ACCOUNTABILITY DIGEST*`,
        `📅 *Date:* ${dayOfWeek}, ${todayDateStr}`,
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        ``,
        `📊 *COMMUNITY PULSE*`,
        `• 👥 *Active Today:* *${activeStudentsToday} / ${totalActiveMembers} (${participationRate}%)*`,
        `• ⏱️ *Total Study Hours:* *${totalTodayHours.toFixed(1)} hrs*`,
        `• 📈 *Average Study Time:* *${avgHoursPerStudent.toFixed(2)} hrs / student*`,
        `• 🧬 *Biological Science:* *${bioHours.toFixed(1)} hrs* (${bioCount} students)`,
        `• 📐 *Physical Science:* *${mathHours.toFixed(1)} hrs* (${mathCount} students)`,
        `• ⚡ *Group Focus Index:* *${avgGroupFocus.toFixed(1)} / 10*`,
        ``,
        `🔥 *STREAK HALL OF FAME (TOP 5)*`,
        leaderboardLines.join('\n'),
        ``,
        `🌟 *TODAY'S STUDY MVPS*`,
        mvpVolume ? `👑 *Highest Volume:* *${mvpVolume.name}* (*${Number(mvpVolume.hours || 0).toFixed(1)} hrs*)` : `👑 *Highest Volume:* _Pending submissions_`,
        mvpFocus ? `🎯 *Deep Flow:* *${mvpFocus.name}* (*${Number(mvpFocus.focus || 0).toFixed(1)}/10 Focus*)` : `🎯 *Deep Flow:* _Pending submissions_`,
        ``,
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        `⚠️ *Streak Alert:* ${pendingCount} students have pending daily submissions.`,
        `Submit before 23:59 to keep your streak alive!`,
        `👉 *Log Study Hours:* https://studysync-al-2026.web.app/daily`
      ].join('\n');
      
      const chatId = payload.chatId || 'mock_channel_id';
      
      return createJsonResponse(res, {
        broadcastSent: true,
        chatId,
        digestText,
        stats: {
          activeStudentsToday,
          totalActiveMembers,
          totalStudyHoursToday: Number(totalTodayHours.toFixed(1)),
          topStreakDays: top5[0] ? top5[0].streak : 0,
          bioHours: Number(bioHours.toFixed(1)),
          mathHours: Number(mathHours.toFixed(1)),
          avgGroupFocus: Number(avgGroupFocus.toFixed(1))
        }
      });
    }

    // ========================================================================
    // TEST MARKS ACTIONS
    // ========================================================================
    case 'logTestMark': {
      const testId = String(payload.id || `test_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`);
      const studyId = String(payload.studyId || '').trim();
      const email = String(payload.studentEmail || payload.email || '').trim().toLowerCase();
      const testDate = String(payload.testDate || getLocalDateString(new Date())).trim();
      const examType = String(payload.examType || 'Model Paper').trim();
      const subject = String(payload.subject || '').trim();
      const paperTitle = sanitizeCsvFormula(String(payload.paperTitle || '').trim());
      const score = Number(payload.score || 0);
      const rank = payload.rank ? parseInt(payload.rank, 10) : null;
      const difficulty = Number(payload.difficultyRating || 3);
      const notes = sanitizeCsvFormula(String(payload.notes || '').trim());
      const timestamp = new Date().toISOString();

      const newMark = {
        id: testId,
        studyId,
        studentEmail: email,
        testDate,
        examType,
        subject,
        paperTitle,
        score,
        rank,
        difficultyRating: difficulty,
        notes,
        createdAt: timestamp
      };

      testMarks.push(newMark);
      saveDb('test_marks', testMarks);

      return respond({ success: true, testMark: newMark });
    }

    case 'getTestMarks': {
      const studyId = String(payload.studyId || '').trim().toUpperCase();
      const email = String(payload.email || payload.studentEmail || '').trim().toLowerCase();

      let filtered = testMarks;
      if (studyId || email) {
        filtered = testMarks.filter(m => (studyId && m.studyId.toUpperCase() === studyId) || (email && m.studentEmail.toLowerCase() === email));
      }
      filtered.sort((a, b) => new Date(b.testDate).getTime() - new Date(a.testDate).getTime());

      return respond({ testMarks: filtered });
    }

    case 'deleteTestMark': {
      const testId = String(payload.id || payload.testId || '').trim();
      if (!testId) {
        return respond(null, false, 'testId is required.', 400);
      }
      testMarks = testMarks.filter(m => m.id !== testId);
      saveDb('test_marks', testMarks);
      return respond({ success: true, deletedId: testId });
    }
    
    case 'resetDatabase':
    case 'reset': {
      saveDb('members', []);
      saveDb('daily_logs', []);
      saveDb('test_marks', []);
      initializeSeedData();
      return createJsonResponse(res, { message: 'Database reset and re-seeded successfully.' });
    }
    
    default:
      return createJsonResponse(res, null, false, `Unknown action: ${action}`, 404);
  }
}

// Helper to extract payload from request (supports JSON body, query string, text/plain JSON)
function extractPayload(req) {
  if (typeof req.body === 'string' && req.body.trim()) {
    try {
      return JSON.parse(req.body);
    } catch (e) {
      // not json string
    }
  }
  if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
    return req.body;
  }
  return req.query || {};
}

// Unified API Handler for /api and /
app.all('/api', (req, res) => {
  const payload = extractPayload(req);
  let action = payload.action || req.query.action;
  if (!action && (payload.update_id || payload.message || payload.callback_query)) {
    action = 'telegramWebhook';
  }
  action = action || 'health';
  const hostUrl = `${req.protocol}://${req.get('host')}`;
  return handleApiAction(action, payload, hostUrl, req, res);
});

app.all('/api/:action', (req, res) => {
  const payload = extractPayload(req);
  const action = req.params.action || payload.action;
  const hostUrl = `${req.protocol}://${req.get('host')}`;
  return handleApiAction(action, payload, hostUrl, req, res);
});

app.post('/webhook', (req, res) => {
  const payload = extractPayload(req);
  const hostUrl = `${req.protocol}://${req.get('host')}`;
  return handleApiAction('telegramWebhook', payload, hostUrl, req, res);
});

app.get('/', (req, res) => {
  if (req.query.action) {
    const payload = extractPayload(req);
    const hostUrl = `${req.protocol}://${req.get('host')}`;
    return handleApiAction(req.query.action, payload, hostUrl, req, res);
  }
  res.json({
    name: 'StudySync Local Mock API Server',
    status: 'running',
    endpoints: [
      'POST /api { action: "checkUser", email: "..." }',
      'POST /api { action: "registerUser", ... }',
      'POST /api { action: "submitDailyLog", ... }',
      'GET/POST /api { action: "getStudentHistory", studyId: "..." }',
      'GET/POST /api { action: "verifyMember", studyId: "..." }',
      'POST /api { action: "getAdminData", adminEmail: "..." }',
      'GET/POST /api { action: "getAnalytics" }',
      'POST /api { action: "telegramWebhook", update_id: ..., message: ... }',
      'POST /api { action: "broadcastDailyDigest", adminEmail: "..." }'
    ]
  });
});

// Export app and CONFIG for testing and direct usage
export { app, CONFIG };
export default app;

const isDirectRun = process.argv[1] && (
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url)) ||
  process.argv[1].endsWith('mock-server.js')
);

if (isDirectRun && process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`========================================================`);
    console.log(` StudySync Mock Server listening on http://localhost:${PORT}`);
    console.log(` Mock Uploads folder: ${CONFIG.UPLOADS_DIR}`);
    console.log(` Mock DB folder:      ${CONFIG.DB_DIR}`);
    console.log(`========================================================`);
  });
}
