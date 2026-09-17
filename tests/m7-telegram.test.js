/**
 * ============================================================================
 * StudySync — Milestone M7: Telegram Bot & Real-Time Sync Engine Tests
 * ============================================================================
 * 
 * Verifies:
 * 1. Username normalization & validation edge cases (t.me URLs, @, casing, symbols)
 * 2. /start command: Study ID linking, welcome card, welcome back for linked users
 * 3. /status command: active streak 🔥, hours, today's submission status, AI recommendations
 * 4. /log command: 3-subject auto assignment, decimal parsing, duplicate lock, streak updates
 * 5. /leaderboard command: national & stream filters (bio, maths), medal awards
 * 6. /remind command: accountability alert vs completed affirmation
 * 7. broadcastDailyDigest action: admin protection, markdown structure, KPI metrics
 * 8. Live HTTP Mock Server API integration for telegramWebhook & broadcastDailyDigest
 */

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import {
  StudySyncDatabase,
  normalizeTelegramUsername,
  isValidTelegramHandle,
  formatTelegramDigest,
  STREAMS,
  ADMIN_WHITELIST
} from './test-harness.js';
import { app, CONFIG as MOCK_CONFIG } from '../server/mock-server.js';
import http from 'http';

describe('Milestone M7: Telegram Bot & Real-Time Sync Engine', () => {

  // --------------------------------------------------------------------------
  // 1. Telegram Handle Normalization & Validation Unit Tests
  // --------------------------------------------------------------------------
  describe('1. Telegram Handle Normalization & Validation', () => {
    test('normalizeTelegramUsername strips https://t.me/ prefix and lowercases', () => {
      assert.strictEqual(normalizeTelegramUsername('https://t.me/Kasun_Perera'), '@kasun_perera');
      assert.strictEqual(normalizeTelegramUsername('http://t.me/Nimali_F'), '@nimali_f');
      assert.strictEqual(normalizeTelegramUsername('https://telegram.me/chamara_al'), '@chamara_al');
      assert.strictEqual(normalizeTelegramUsername('t.me/dilani_bio'), '@dilani_bio');
    });

    test('normalizeTelegramUsername handles leading @ and removes illegal characters', () => {
      assert.strictEqual(normalizeTelegramUsername('@kasun_p'), '@kasun_p');
      assert.strictEqual(normalizeTelegramUsername('kasun_p'), '@kasun_p');
      assert.strictEqual(normalizeTelegramUsername('@KASUN_P!#$'), '@kasun_p');
      assert.strictEqual(normalizeTelegramUsername('   @Nimali_F   '), '@nimali_f');
    });

    test('normalizeTelegramUsername handles empty, whitespace, and null inputs safely', () => {
      assert.strictEqual(normalizeTelegramUsername(''), '');
      assert.strictEqual(normalizeTelegramUsername('   '), '');
      assert.strictEqual(normalizeTelegramUsername(null), '');
      assert.strictEqual(normalizeTelegramUsername(undefined), '');
      assert.strictEqual(normalizeTelegramUsername('@@@'), '');
    });

    test('isValidTelegramHandle validates handle length (3 to 32 chars) and alphanumeric + underscore', () => {
      assert.strictEqual(isValidTelegramHandle('@kasun_p'), true);
      assert.strictEqual(isValidTelegramHandle('kasun_p'), true);
      assert.strictEqual(isValidTelegramHandle('https://t.me/a_b'), true); // 3 chars: a_b
      assert.strictEqual(isValidTelegramHandle('ab'), false); // 2 chars: too short
      assert.strictEqual(isValidTelegramHandle(''), false);
      assert.strictEqual(isValidTelegramHandle(null), false);
      assert.strictEqual(isValidTelegramHandle('@' + 'a'.repeat(32)), true); // 32 chars
      assert.strictEqual(isValidTelegramHandle('@' + 'a'.repeat(33)), false); // 33 chars: too long
    });
  });

  // --------------------------------------------------------------------------
  // 2. Database Simulator Telegram Webhook Commands (/start, /status, /log, etc.)
  // --------------------------------------------------------------------------
  describe('2. In-Memory Database Telegram Webhook Commands', () => {
    let db;
    let bioMember;
    let mathMember;

    before(() => {
      db = new StudySyncDatabase();
      bioMember = db.registerMember({
        fullName: 'Kasun Perera',
        email: 'kasun.m7@gmail.com',
        gender: 'Male',
        telegram: '@kasun_m7',
        school: 'Royal College, Colombo 07',
        stream: STREAMS.BIO,
        optionalSubject: 'Physics'
      });

      mathMember = db.registerMember({
        fullName: 'Nimali Fernando',
        email: 'nimali.m7@gmail.com',
        gender: 'Female',
        telegram: '@nimali_m7',
        school: 'Visakha Vidyalaya, Colombo 05',
        stream: STREAMS.MATHS,
        optionalSubject: 'Chemistry'
      });
    });

    test('/start command links unlinked Telegram username when valid Study ID is passed', () => {
      const res = db.telegramWebhook({
        chatId: 1001,
        text: `/start ${bioMember['Study ID']}`,
        username: 'kasun_new_tg'
      });

      assert.strictEqual(res.handled, true);
      assert.strictEqual(res.command, '/start');
      assert.strictEqual(res.studyId, bioMember['Study ID']);
      assert.match(res.replyText, /Welcome to StudySync/i);

      // Verify member record was updated
      const updatedMember = db.getMemberByStudyId(bioMember['Study ID']);
      assert.strictEqual(updatedMember.telegram, '@kasun_new_tg');
    });

    test('/start command fails gracefully with invalid Study ID', () => {
      const res = db.telegramWebhook({
        chatId: 1002,
        text: `/start SG-BIO-9999`,
        username: 'random_student'
      });

      assert.strictEqual(res.handled, true);
      assert.strictEqual(res.command, '/start');
      assert.match(res.replyText, /Study ID not found/i);
      assert.strictEqual(res.error, 'Study ID not found');
    });

    test('/start command recognizes already-linked member and welcomes them back', () => {
      const res = db.telegramWebhook({
        chatId: 1003,
        text: `/start`,
        username: 'nimali_m7'
      });

      assert.strictEqual(res.handled, true);
      assert.strictEqual(res.command, '/start');
      assert.strictEqual(res.studyId, mathMember['Study ID']);
      assert.match(res.replyText, /Welcome back/i);
    });

    test('/status command returns active streak, hours, and today status for linked user', () => {
      const res = db.telegramWebhook({
        chatId: 1001,
        text: `/status`,
        username: 'kasun_new_tg'
      });

      assert.strictEqual(res.handled, true);
      assert.strictEqual(res.command, '/status');
      assert.strictEqual(res.studyId, bioMember['Study ID']);
      assert.match(res.replyText, /PERFORMANCE CARD/i);
      assert.strictEqual(res.stats.studiedToday, false);
    });

    test('/status command works when explicit Study ID is provided as argument', () => {
      const res = db.telegramWebhook({
        chatId: 9999,
        text: `/status ${mathMember['Study ID']}`,
        username: 'anyone'
      });

      assert.strictEqual(res.handled, true);
      assert.strictEqual(res.command, '/status');
      assert.strictEqual(res.studyId, mathMember['Study ID']);
      assert.match(res.replyText, /Nimali Fernando/i);
    });

    test('/log command parses decimal hours and logs study session for 3 stream subjects', () => {
      const res = db.telegramWebhook({
        chatId: 1001,
        text: `/log 2.5 1.5 2.0 Completed Genetics and Organic synthesis`,
        username: 'kasun_new_tg'
      });

      assert.strictEqual(res.handled, true);
      assert.strictEqual(res.command, '/log');
      assert.strictEqual(res.totalHours, 6.0);
      assert.strictEqual(res.activeStreak, 1);
      assert.match(res.replyText, /STUDY LOG RECORDED/i);

      // Verify the log was recorded in database
      const logs = db.getStudentLogs(bioMember['Study ID']);
      assert.strictEqual(logs.length, 1);
      assert.strictEqual(logs[0].totalHours, 6.0);
      assert.strictEqual(logs[0].subjects[0].name, 'Biology');
      assert.strictEqual(logs[0].subjects[0].hours, 2.5);
      assert.strictEqual(logs[0].subjects[1].name, 'Chemistry');
      assert.strictEqual(logs[0].subjects[1].hours, 1.5);
      assert.strictEqual(logs[0].subjects[2].name, 'Physics');
      assert.strictEqual(logs[0].subjects[2].hours, 2.0);
    });

    test('/log command rejects duplicate submission for the same day', () => {
      const dupRes = db.telegramWebhook({
        chatId: 1001,
        text: `/log 1.0 1.0 1.0 Extra revision`,
        username: 'kasun_new_tg'
      });

      assert.strictEqual(dupRes.handled, true);
      assert.strictEqual(dupRes.isDuplicate, true);
      assert.match(dupRes.replyText, /Duplicate submission/i);
    });

    test('/log command validates syntax and hours boundaries', () => {
      // Missing subject hours (< 3 numbers)
      const synRes = db.telegramWebhook({
        chatId: 1003,
        text: `/log 2.5 1.5 Only two numbers`,
        username: 'nimali_m7'
      });
      assert.strictEqual(synRes.handled, true);
      assert.strictEqual(synRes.error, 'Invalid syntax');

      // Negative hours
      const negRes = db.telegramWebhook({
        chatId: 1003,
        text: `/log 2.0 -1.0 2.0 Negative hours`,
        username: 'nimali_m7'
      });
      assert.strictEqual(negRes.handled, true);
      assert.strictEqual(negRes.error, 'Hours out of bounds');

      // Total hours > 24
      const overRes = db.telegramWebhook({
        chatId: 1003,
        text: `/log 10.0 10.0 10.0 30 hours impossible`,
        username: 'nimali_m7'
      });
      assert.strictEqual(overRes.handled, true);
      assert.strictEqual(overRes.error, 'Hours out of bounds');
    });

    test('/leaderboard command returns rankings with national and stream filters', () => {
      const allRes = db.telegramWebhook({
        chatId: 1001,
        text: `/leaderboard all`,
        username: 'kasun_new_tg'
      });
      assert.strictEqual(allRes.handled, true);
      assert.strictEqual(allRes.command, '/leaderboard');
      assert.match(allRes.replyText, /LEADERBOARD/i);

      const bioRes = db.telegramWebhook({
        chatId: 1001,
        text: `/leaderboard bio`,
        username: 'kasun_new_tg'
      });
      assert.strictEqual(bioRes.handled, true);
      assert.strictEqual(bioRes.count, 1);

      const mathRes = db.telegramWebhook({
        chatId: 1001,
        text: `/leaderboard maths`,
        username: 'kasun_new_tg'
      });
      assert.strictEqual(mathRes.handled, true);
      assert.strictEqual(mathRes.count, 1);
    });

    test('/remind command differentiates between completed and pending daily study', () => {
      // Kasun already logged today
      const kasunRemind = db.telegramWebhook({
        chatId: 1001,
        text: `/remind`,
        username: 'kasun_new_tg'
      });
      assert.strictEqual(kasunRemind.handled, true);
      assert.strictEqual(kasunRemind.studiedToday, true);
      assert.match(kasunRemind.replyText, /Great job|logged/i);

      // Nimali has not logged today
      const nimaliRemind = db.telegramWebhook({
        chatId: 1003,
        text: `/remind`,
        username: 'nimali_m7'
      });
      assert.strictEqual(nimaliRemind.handled, true);
      assert.strictEqual(nimaliRemind.studiedToday, false);
      assert.match(nimaliRemind.replyText, /REMINDER|streak is on the line/i);
    });
  });

  // --------------------------------------------------------------------------
  // 3. Daily Digest Broadcaster Formatting & Admin Execution
  // --------------------------------------------------------------------------
  describe('3. Daily Digest Broadcaster & Admin Actions', () => {
    let db;

    before(() => {
      db = new StudySyncDatabase();
      const m1 = db.registerMember({
        fullName: 'Achala Anurada',
        email: 'achala@studysync.lk',
        gender: 'Male',
        telegram: '@achala_a',
        school: 'Ananda College, Colombo 10',
        stream: STREAMS.MATHS,
        optionalSubject: 'Chemistry'
      });

      const todayStr = new Date().toISOString().substring(0, 10);
      db.submitDailyLog({
        studyId: m1['Study ID'],
        email: 'achala@studysync.lk',
        dateOfStudy: todayStr,
        subjects: [
          { name: 'Combined Maths', hours: 3.5, focus: 9, productivity: 9 },
          { name: 'Physics', hours: 2.0, focus: 8, productivity: 8 },
          { name: 'Chemistry', hours: 1.5, focus: 8, productivity: 9 }
        ],
        notes: 'Integration and Thermodynamics revision',
        telegram: '@achala_a'
      });
    });

    test('broadcastDailyDigest rejects non-whitelisted administrator', () => {
      assert.throws(() => {
        db.broadcastDailyDigest({ adminEmail: 'impostor@gmail.com' });
      }, /Access Denied/i);
    });

    test('broadcastDailyDigest formats complete markdown digest with KPIs and Streak Hall of Fame', () => {
      const digestRes = db.broadcastDailyDigest({
        adminEmail: 'admin@studysync.lk',
        chatId: 'study_sync_channel'
      });

      assert.strictEqual(digestRes.broadcastSent, true);
      assert.strictEqual(digestRes.stats.activeStudentsToday, 1);
      assert.strictEqual(digestRes.stats.totalStudyHoursToday, 7.0);

      const text = digestRes.digestText;
      assert.match(text, /STUDYSYNC DAILY ACCOUNTABILITY DIGEST/);
      assert.match(text, /COMMUNITY PULSE/);
      assert.match(text, /STREAK HALL OF FAME/);
      assert.match(text, /TODAY'S STUDY MVPS/);
      assert.match(text, /Achala Anurada/);
    });

    test('formatTelegramDigest utility produces clean, markdown-safe output', () => {
      const formatted = formatTelegramDigest({
        totalMembers: 50,
        activeToday: 42,
        totalTodayHours: 245.5,
        avgGroupFocus: 8.5,
        streamBreakdown: {
          'Biological Science': { todayHours: 120.0, activeToday: 20 },
          'Physical Science': { todayHours: 125.5, activeToday: 22 }
        }
      }, [
        { name: 'Supun Silva', studyId: 'SG-BIO-0005', streak: 14, totalHours: 85.0, school: 'Richmond College' },
        { name: 'Rashmi Perera', studyId: 'SG-MATH-0012', streak: 12, totalHours: 78.5, school: 'Devi Balika' }
      ]);

      assert.match(formatted, /Active Today:\*\s*\*42 \/ 50 \(84%\)\*/);
      assert.match(formatted, /Total Study Hours:\*\s*\*245\.5 hrs\*/);
      assert.match(formatted, /🥇 1\.\s*\*Supun Silva\*/);
      assert.match(formatted, /🔥 \*14 Days\*/);
      assert.match(formatted, /Biological Science:\*\s*\*120\.0 hrs\*/);
      assert.match(formatted, /Physical Science:\*\s*\*125\.5 hrs\*/);
    });
  });

  // --------------------------------------------------------------------------
  // 4. Live Mock Server HTTP API Integration (Parity with Code.gs)
  // --------------------------------------------------------------------------
  describe('4. Live Mock Server HTTP API Integration', () => {
    let server;
    let serverUrl;

    before((t, done) => {
      server = http.createServer(app);
      server.listen(0, '127.0.0.1', () => {
        const addr = server.address();
        serverUrl = `http://127.0.0.1:${addr.port}`;
        done();
      });
    });

    after((t, done) => {
      server.close(done);
    });

    const uniqueTag = Date.now();
    const testUsername = `chamara_${uniqueTag}`;
    const testEmail = `chamara_${uniqueTag}@gmail.com`;
    let studyId = '';

    test('POST /api with action=telegramWebhook handles /start command', async () => {
      // 1. First register a test student
      const regRes = await fetch(`${serverUrl}/api`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'registerUser',
          fullName: 'Chamara Silva',
          email: testEmail,
          gender: 'Male',
          telegram: `@${testUsername}`,
          school: 'Maliyadeva College, Kurunegala',
          stream: 'Physical Science',
          optionalSubject: 'Chemistry'
        })
      });
      const regJson = await regRes.json();
      assert.strictEqual(regJson.success, true);
      studyId = regJson.data.studyId;

      // 2. Dispatch /start webhook with Study ID
      const startRes = await fetch(`${serverUrl}/api`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'telegramWebhook',
          message: {
            chat: { id: 7771 },
            from: { username: testUsername },
            text: `/start ${studyId}`
          }
        })
      });
      const startJson = await startRes.json();
      assert.strictEqual(startJson.success, true);
      assert.strictEqual(startJson.data.handled, true);
      assert.strictEqual(startJson.data.command, '/start');
      assert.match(startJson.data.replyText, /Chamara Silva/);
    });

    test('POST /api with action=telegramWebhook handles /log command and updates streak', async () => {
      const logRes = await fetch(`${serverUrl}/api`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'telegramWebhook',
          message: {
            chat: { id: 7771 },
            from: { username: testUsername },
            text: `/log 3.0 2.0 1.5 2024 Past paper practice`
          }
        })
      });

      const logJson = await logRes.json();
      assert.strictEqual(logJson.success, true);
      assert.strictEqual(logJson.data.handled, true);
      assert.strictEqual(logJson.data.command, '/log');
      assert.strictEqual(logJson.data.totalHours, 6.5);
      assert.strictEqual(logJson.data.activeStreak, 1);
      assert.match(logJson.data.replyText, /STUDY LOG RECORDED/);
    });

    test('POST /api with action=telegramWebhook handles /status command with AI recommendation', async () => {
      const statusRes = await fetch(`${serverUrl}/api`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'telegramWebhook',
          message: {
            chat: { id: 7771 },
            from: { username: testUsername },
            text: `/status`
          }
        })
      });

      const statusJson = await statusRes.json();
      assert.strictEqual(statusJson.success, true);
      assert.strictEqual(statusJson.data.handled, true);
      assert.strictEqual(statusJson.data.command, '/status');
      assert.match(statusJson.data.replyText, /Active Streak:\*\s*\*1 Days\*/);
      assert.match(statusJson.data.replyText, /AI Prescription/);
    });

    test('POST /api with action=broadcastDailyDigest executes for whitelisted admin', async () => {
      const digestRes = await fetch(`${serverUrl}/api`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'broadcastDailyDigest',
          adminEmail: 'admin@studysync.lk',
          chatId: 'test_telegram_channel'
        })
      });

      const digestJson = await digestRes.json();
      assert.strictEqual(digestJson.success, true);
      assert.strictEqual(digestJson.data.broadcastSent, true);
      assert.match(digestJson.data.digestText, /DAILY ACCOUNTABILITY DIGEST/);
    });

    test('POST /webhook native Telegram update endpoint auto-detects telegramWebhook action', async () => {
      const hookRes = await fetch(`${serverUrl}/webhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          update_id: 998811,
          message: {
            message_id: 42,
            chat: { id: 7771 },
            from: { username: testUsername },
            text: `/remind`
          }
        })
      });

      const hookJson = await hookRes.json();
      assert.strictEqual(hookJson.success, true);
      assert.strictEqual(hookJson.data.handled, true);
      assert.strictEqual(hookJson.data.command, '/remind');
      assert.strictEqual(hookJson.data.studiedToday, true);
    });
  });
});
