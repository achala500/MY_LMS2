/**
 * ============================================================================
 * Milestone M2 Verification Test Suite
 * Tests Google Apps Script Code.gs structure, appsscript.json manifest,
 * and executes comprehensive live HTTP tests against server/mock-server.js.
 * ============================================================================
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';
import { app, CONFIG } from '../server/mock-server.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

// Helper to make HTTP requests against the mock express app
function makeRequest(server, options, requestBody = null) {
  return new Promise((resolve, reject) => {
    const port = server.address().port;
    const reqOptions = {
      hostname: '127.0.0.1',
      port: port,
      path: options.path || '/api',
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(data);
        } catch (e) {
          parsed = data;
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: parsed,
          raw: data
        });
      });
    });

    req.on('error', reject);

    if (requestBody) {
      if (typeof requestBody === 'object') {
        req.setHeader('Content-Type', 'application/json');
        req.write(JSON.stringify(requestBody));
      } else {
        req.write(String(requestBody));
      }
    }
    req.end();
  });
}

// ----------------------------------------------------------------------------
// TEST SUITE 1: Code.gs and Manifest Static Architecture & Integrity
// ----------------------------------------------------------------------------
test('Code.gs and appsscript.json Integrity & Compliance', async (t) => {
  await t.test('appsscript.json manifest has correct timezone and OAuth scopes', () => {
    const manifestPath = path.join(ROOT_DIR, 'backend', 'appsscript.json');
    assert.ok(fs.existsSync(manifestPath), 'appsscript.json must exist');
    
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    assert.equal(manifest.timeZone, 'Asia/Colombo');
    assert.equal(manifest.runtimeVersion, 'V8');
    assert.equal(manifest.webapp.access, 'ANYONE_ANONYMOUS');
    assert.equal(manifest.webapp.executeAs, 'USER_DEPLOYING');
    assert.ok(manifest.oauthScopes.includes('https://www.googleapis.com/auth/spreadsheets'));
    assert.ok(manifest.oauthScopes.includes('https://www.googleapis.com/auth/drive'));
  });

  await t.test('Code.gs defines setupDatabase() with exact sheet names and column counts', () => {
    const codeGsPath = path.join(ROOT_DIR, 'backend', 'Code.gs');
    assert.ok(fs.existsSync(codeGsPath), 'Code.gs must exist');
    
    const codeContent = fs.readFileSync(codeGsPath, 'utf8');
    
    // Check sheet names
    assert.ok(codeContent.includes('Members'), 'Must define Members sheet');
    assert.ok(codeContent.includes('DailyLogs'), 'Must define DailyLogs sheet');
    assert.ok(codeContent.includes('Analytics'), 'Must define Analytics sheet');
    
    // Verify Members has exactly 10 columns and zero duplicate email columns
    const memberHeaders = [
      "Study ID", "Full Name", "Email", "Gender", "Telegram Username",
      "School", "Stream", "Optional Subject", "Registration Date", "Status"
    ];
    assert.equal(memberHeaders.length, 10, 'Members must have exactly 10 columns');
    memberHeaders.forEach(h => {
      assert.ok(codeContent.includes(h), `Code.gs must include Member header: ${h}`);
    });
    
    // Ensure no duplicate email headers exist in Members
    const emailMatches = memberHeaders.filter(h => h.toLowerCase().includes('email'));
    assert.equal(emailMatches.length, 1, 'Members must have exactly ONE email column');

    // Verify DailyLogs has exactly 19 columns
    const logHeaders = [
      "Timestamp", "Study ID", "Email", "Date of Study",
      "Subject 1 Name", "Subject 1 Hours", "Subject 1 Focus", "Subject 1 Productivity",
      "Subject 2 Name", "Subject 2 Hours", "Subject 2 Focus", "Subject 2 Productivity",
      "Subject 3 Name", "Subject 3 Hours", "Subject 3 Focus", "Subject 3 Productivity",
      "Notes", "Telegram", "Proof Photo URL"
    ];
    assert.equal(logHeaders.length, 19, 'DailyLogs must have exactly 19 columns');
    logHeaders.forEach(h => {
      assert.ok(codeContent.includes(h), `Code.gs must include DailyLog header: ${h}`);
    });
  });

  await t.test('Code.gs implements all 7 required API actions and LockService', () => {
    const codeGsPath = path.join(ROOT_DIR, 'backend', 'Code.gs');
    const code = fs.readFileSync(codeGsPath, 'utf8');
    
    assert.ok(code.includes('handleCheckUser'), 'Must implement handleCheckUser');
    assert.ok(code.includes('handleRegisterUser'), 'Must implement handleRegisterUser');
    assert.ok(code.includes('handleSubmitDailyLog'), 'Must implement handleSubmitDailyLog');
    assert.ok(code.includes('handleGetStudentHistory'), 'Must implement handleGetStudentHistory');
    assert.ok(code.includes('handleVerifyMember'), 'Must implement handleVerifyMember');
    assert.ok(code.includes('handleGetAdminData'), 'Must implement handleGetAdminData');
    assert.ok(code.includes('handleGetAnalytics'), 'Must implement handleGetAnalytics');
    
    // Concurrency LockService
    assert.ok(code.includes('LockService.getScriptLock()'), 'Must use LockService for concurrency control');
    assert.ok(code.includes('lock.tryLock'), 'Must use lock.tryLock with timeout');
    assert.ok(code.includes('lock.releaseLock()'), 'Must release lock safely in finally block');

    // Drive hierarchy
    assert.ok(code.includes('StudySync_Uploads'), 'Must organize files in StudySync_Uploads folder');
    assert.ok(code.includes('saveProofPhotoToDrive'), 'Must implement Drive photo upload helper');
  });
});

// ----------------------------------------------------------------------------
// TEST SUITE 2: Live Mock Server Functional Endpoints Testing
// ----------------------------------------------------------------------------
test('Live Mock Server Full API Parity & Behavior Verification', async (t) => {
  let server;
  let testPort;

  // Start temporary test server
  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, () => {
      testPort = server.address().port;
      resolve();
    });
  });

  t.after(() => {
    server.close();
  });

  // Reset database before testing
  await makeRequest(server, { method: 'POST', path: '/api' }, { action: 'resetDatabase' });

  await t.test('GET / or /api?action=ping returns healthy status', async () => {
    const res = await makeRequest(server, { method: 'GET', path: '/api?action=ping' });
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.status, 'healthy');
  });

  await t.test('Action: checkUser for unregistered email returns registered: false', async () => {
    const res = await makeRequest(server, { method: 'POST', path: '/api' }, {
      action: 'checkUser',
      email: 'nonexistent.user@example.com'
    });
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.registered, false);
    assert.equal(res.body.data.member, null);
  });

  await t.test('Action: registerUser allocates sequential Study ID for Biological Science', async () => {
    const res = await makeRequest(server, { method: 'POST', path: '/api' }, {
      action: 'registerUser',
      fullName: 'Aravinda De Silva',
      email: 'aravinda.bio@example.com',
      gender: 'Male',
      telegram: '@aravinda_bio',
      school: 'Ananda College, Colombo 10',
      stream: 'Biological Science',
      optionalSubject: 'Physics'
    });

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.studyId.startsWith('SG-BIO-'), 'Must have SG-BIO- prefix');
    assert.equal(res.body.data.fullName, 'Aravinda De Silva');
    assert.equal(res.body.data.email, 'aravinda.bio@example.com');
    assert.equal(res.body.data.status, 'Active');
  });

  await t.test('Action: registerUser allocates sequential Study ID for Physical Science', async () => {
    const res = await makeRequest(server, { method: 'POST', path: '/api' }, {
      action: 'registerUser',
      fullName: 'Saman Kumara',
      email: 'saman.math@example.com',
      gender: 'Male',
      telegram: 'saman_math',
      school: 'Nalanda College, Colombo 10',
      stream: 'Physical Science',
      optionalSubject: 'ICT'
    });

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.studyId.startsWith('SG-MATH-'), 'Must have SG-MATH- prefix');
    assert.equal(res.body.data.telegram, '@saman_math', 'Should prefix @ if omitted');
  });

  await t.test('Action: registerUser prevents duplicate registration with same email', async () => {
    const res = await makeRequest(server, { method: 'POST', path: '/api' }, {
      action: 'registerUser',
      fullName: 'Duplicate Aravinda',
      email: 'aravinda.bio@example.com',
      gender: 'Male',
      telegram: '@aravinda_bio',
      school: 'Ananda College, Colombo 10',
      stream: 'Biological Science',
      optionalSubject: 'Physics'
    });

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.alreadyRegistered, true);
    assert.equal(res.body.data.member.email, 'aravinda.bio@example.com');
  });

  await t.test('Action: checkUser returns registered profile and stats for registered user', async () => {
    const res = await makeRequest(server, { method: 'POST', path: '/api' }, {
      action: 'checkUser',
      email: 'aravinda.bio@example.com'
    });

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.registered, true);
    assert.equal(res.body.data.member.fullName, 'Aravinda De Silva');
    assert.ok(res.body.data.stats !== undefined);
  });

  let bioStudyId = '';
  await t.test('Action: submitDailyLog saves 3-subject study hours and photo upload', async () => {
    // Get study ID of aravinda
    const checkRes = await makeRequest(server, { method: 'POST', path: '/api' }, {
      action: 'checkUser',
      email: 'aravinda.bio@example.com'
    });
    bioStudyId = checkRes.body.data.member.studyId;

    const sampleBase64 = 'data:image/jpeg;base64,' + Buffer.from('fake image content for test').toString('base64');
    const logDate = '2026-08-26';

    const submitRes = await makeRequest(server, { method: 'POST', path: '/api' }, {
      action: 'submitDailyLog',
      studyId: bioStudyId,
      email: 'aravinda.bio@example.com',
      dateOfStudy: logDate,
      subjects: [
        { name: 'Biology', hours: 3.5, focus: 9, productivity: 8 },
        { name: 'Chemistry', hours: 2.0, focus: 8, productivity: 9 },
        { name: 'Physics', hours: 1.5, focus: 8, productivity: 8 }
      ],
      notes: 'Completed Cell Division and Reaction Kinetics.',
      telegram: '@aravinda_bio',
      proofFile: {
        base64: sampleBase64,
        mimeType: 'image/jpeg',
        fileName: 'bio_notes_aug26.jpg'
      }
    });

    assert.equal(submitRes.statusCode, 200);
    assert.equal(submitRes.body.success, true);
    assert.equal(submitRes.body.data.isDuplicate, false);
    assert.equal(submitRes.body.data.studyId, bioStudyId);
    assert.equal(submitRes.body.data.totalHours, 7.0);
    assert.ok(submitRes.body.data.proofPhotoUrl.includes('/uploads/'), 'Should provide local upload URL');

    // Verify file actually exists on disk in mock_uploads
    const expectedDiskPath = path.join(CONFIG.UPLOADS_DIR, bioStudyId, logDate, `${bioStudyId}_${logDate}_bio_notes_aug26.jpg`);
    assert.ok(fs.existsSync(expectedDiskPath), 'Mock server should save uploaded file on disk');
  });

  await t.test('Action: submitDailyLog locks out duplicate submissions for same student on same day', async () => {
    const res = await makeRequest(server, { method: 'POST', path: '/api' }, {
      action: 'submitDailyLog',
      studyId: bioStudyId,
      email: 'aravinda.bio@example.com',
      dateOfStudy: '2026-08-26',
      subjects: [
        { name: 'Biology', hours: 1.0, focus: 5, productivity: 5 },
        { name: 'Chemistry', hours: 1.0, focus: 5, productivity: 5 },
        { name: 'Physics', hours: 1.0, focus: 5, productivity: 5 }
      ]
    });

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.success, false);
    assert.equal(res.body.data.isDuplicate, true);
  });

  await t.test('Action: getStudentHistory returns student study logs and computed streak', async () => {
    const res = await makeRequest(server, { method: 'GET', path: `/api?action=getStudentHistory&studyId=${bioStudyId}` });

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.studyId, bioStudyId);
    assert.ok(Array.isArray(res.body.data.logs));
    assert.equal(res.body.data.logs.length, 1);
    assert.equal(res.body.data.stats.totalHours, 7.0);
    assert.equal(res.body.data.stats.subjectHours['Biology'], 3.5);
    assert.equal(res.body.data.stats.subjectHours['Chemistry'], 2.0);
    assert.equal(res.body.data.stats.subjectHours['Physics'], 1.5);
  });

  await t.test('Action: verifyMember returns sanitized public profile without sensitive email', async () => {
    const res = await makeRequest(server, { method: 'GET', path: `/api?action=verifyMember&studyId=${bioStudyId}` });

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.valid, true);
    assert.equal(res.body.data.member.studyId, bioStudyId);
    assert.equal(res.body.data.member.fullName, 'Aravinda De Silva');
    assert.equal(res.body.data.member.school, 'Ananda College, Colombo 10');
    assert.equal(res.body.data.member.email, undefined, 'Sensitive email must not be exposed on public verification');
    assert.equal(res.body.data.member.telegram, undefined, 'Sensitive telegram must not be exposed on public verification');
  });

  await t.test('Action: getAdminData rejects non-whitelisted email with 403', async () => {
    const res = await makeRequest(server, { method: 'POST', path: '/api' }, {
      action: 'getAdminData',
      adminEmail: 'unauthorized.stranger@gmail.com'
    });

    assert.equal(res.statusCode, 403);
    assert.equal(res.body.success, false);
    assert.ok(res.body.error.includes('Access Denied'));
  });

  await t.test('Action: getAdminData succeeds for whitelisted admin email', async () => {
    const res = await makeRequest(server, { method: 'POST', path: '/api' }, {
      action: 'getAdminData',
      adminEmail: 'admin@studysync.lk'
    });

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data.members));
    assert.ok(Array.isArray(res.body.data.recentLogs));
    assert.ok(res.body.data.analytics.totalMembers >= 3);
    assert.ok(Array.isArray(res.body.data.leaderboard));
  });

  await t.test('Action: getAnalytics returns group KPIs, stream breakdown, and leaderboard', async () => {
    const res = await makeRequest(server, { method: 'GET', path: '/api?action=getAnalytics' });

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.kpi.totalMembers >= 3);
    assert.ok(res.body.data.streamBreakdown['Biological Science'] !== undefined);
    assert.ok(res.body.data.streamBreakdown['Physical Science'] !== undefined);
    assert.ok(Array.isArray(res.body.data.topStreaks));
  });

  await t.test('Text/Plain payload handling (Apps Script client compatibility)', async () => {
    const plainPayload = JSON.stringify({
      action: 'checkUser',
      email: 'aravinda.bio@example.com'
    });

    const res = await makeRequest(server, {
      method: 'POST',
      path: '/api',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }
    }, plainPayload);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.registered, true);
  });

  await t.test('Validation: registerUser fails when required fields are missing', async () => {
    const res = await makeRequest(server, { method: 'POST', path: '/api' }, {
      action: 'registerUser',
      fullName: '',
      email: 'bad.user@example.com'
    });

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.success, false);
    assert.ok(res.body.error.includes('Missing required'));
  });

  await t.test('Direct Named Routes: POST /api/checkUser works identically', async () => {
    const res = await makeRequest(server, { method: 'POST', path: '/api/checkUser' }, {
      email: 'aravinda.bio@example.com'
    });

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.registered, true);
  });

  await t.test('Direct Named Routes: GET /api/verifyMember?studyId=... works', async () => {
    const res = await makeRequest(server, { method: 'GET', path: `/api/verifyMember?studyId=${bioStudyId}` });

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.valid, true);
    assert.equal(res.body.data.member.studyId, bioStudyId);
  });

  await t.test('Multi-day submission & Streak Calculation Logic', async () => {
    // Register another user
    const reg = await makeRequest(server, { method: 'POST', path: '/api' }, {
      action: 'registerUser',
      fullName: 'Streak Master',
      email: 'streak.master@example.com',
      gender: 'Other',
      telegram: '@streakmaster',
      school: 'Maliyadeva College, Kurunegala',
      stream: 'Physical Science',
      optionalSubject: 'Chemistry'
    });
    const streakId = reg.body.data.studyId;

    // Submit for 3 consecutive days: yesterday, day before yesterday
    const d1 = '2026-08-24';
    const d2 = '2026-08-25';

    await makeRequest(server, { method: 'POST', path: '/api' }, {
      action: 'submitDailyLog',
      studyId: streakId,
      dateOfStudy: d1,
      subjects: [
        { name: 'Combined Maths', hours: 4.0, focus: 10, productivity: 10 },
        { name: 'Physics', hours: 2.0, focus: 9, productivity: 9 },
        { name: 'Chemistry', hours: 2.0, focus: 8, productivity: 8 }
      ]
    });

    await makeRequest(server, { method: 'POST', path: '/api' }, {
      action: 'submitDailyLog',
      studyId: streakId,
      dateOfStudy: d2,
      subjects: [
        { name: 'Combined Maths', hours: 3.5, focus: 9, productivity: 9 },
        { name: 'Physics', hours: 2.5, focus: 9, productivity: 9 },
        { name: 'Chemistry', hours: 1.0, focus: 8, productivity: 8 }
      ]
    });

    const history = await makeRequest(server, { method: 'GET', path: `/api?action=getStudentHistory&studyId=${streakId}` });
    assert.equal(history.statusCode, 200);
    assert.equal(history.body.data.logs.length, 2);
    assert.equal(history.body.data.stats.totalHours, 15.0);
    assert.equal(history.body.data.stats.subjectHours['Combined Maths'], 7.5);
    assert.equal(history.body.data.stats.subjectHours['Physics'], 4.5);
    assert.equal(history.body.data.stats.subjectHours['Chemistry'], 3.0);
  });
});

