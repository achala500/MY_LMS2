import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  calculateXp,
  calculateLevelProgression,
  evaluateBadges,
  getGamificationState,
  LEVEL_TIERS,
} from '../src/js/gamification.js';
import {
  generateExcelXmlString,
  generateSqlDump,
  sanitizeCsvFormula,
  daysBetween,
} from '../src/js/utils.js';

describe('Gamification Engine & Progression Model Tests', () => {
  it('calculateXp should accurately sum hours, streak, and session bonuses', () => {
    // 10.5 hours * 100 = 1050 XP
    // 7 streak * 50 = 350 XP
    // 5 sessions * 25 = 125 XP
    // Total = 1525 XP
    const xp = calculateXp(10.5, 7, 5);
    assert.strictEqual(xp, 1525);
  });

  it('calculateLevelProgression should map XP to accurate levels and rank titles', () => {
    const l1 = calculateLevelProgression(150);
    assert.strictEqual(l1.level, 1);
    assert.strictEqual(l1.rankTitle, 'Novice');
    assert.strictEqual(l1.levelProgressPct, 50); // 150 / 300 = 50%

    const l2 = calculateLevelProgression(550);
    assert.strictEqual(l2.level, 2);
    assert.strictEqual(l2.rankTitle, 'Apprentice');

    const l3 = calculateLevelProgression(1200);
    assert.strictEqual(l3.level, 3);
    assert.strictEqual(l3.rankTitle, 'Scholar');

    const l7 = calculateLevelProgression(8000);
    assert.strictEqual(l7.level, 7);
    assert.strictEqual(l7.rankTitle, 'Grandmaster');
    assert.strictEqual(l7.levelProgressPct, 100);
  });

  it('evaluateBadges should correctly evaluate unlock status for streak, hours, mastery, and habits', () => {
    const sampleLogs = [
      {
        dateOfStudy: '2026-08-20',
        timestamp: '2026-08-20T06:30:00Z',
        totalHours: 12,
        notes: 'Early morning session Combined Maths past paper',
      },
      {
        dateOfStudy: '2026-08-21',
        timestamp: '2026-08-21T21:45:00Z',
        totalHours: 15,
        notes: 'Late night revision Physics mechanics',
      },
      {
        dateOfStudy: '2026-08-22',
        timestamp: '2026-08-22T10:00:00Z',
        totalHours: 25,
        notes: 'Full syllabus balance test',
      },
    ];

    // streak 15, totalHours 52, balance 90
    const badges = evaluateBadges(15, 52, 90, sampleLogs);
    assert.strictEqual(badges.length, 8);

    const b7 = badges.find((b) => b.id === 'streak-7');
    assert.strictEqual(b7?.unlocked, true);

    const b14 = badges.find((b) => b.id === 'streak-14');
    assert.strictEqual(b14?.unlocked, true);

    const b30 = badges.find((b) => b.id === 'streak-30');
    assert.strictEqual(b30?.unlocked, false);
    assert.strictEqual(b30?.progress, 50); // 15/30 = 50%

    const b50 = badges.find((b) => b.id === 'hours-50');
    assert.strictEqual(b50?.unlocked, true);

    const b100 = badges.find((b) => b.id === 'hours-100');
    assert.strictEqual(b100?.unlocked, false);

    const bEq = badges.find((b) => b.id === 'equilibrium-master');
    assert.strictEqual(bEq?.unlocked, true);

    const bEarly = badges.find((b) => b.id === 'early-bird');
    assert.strictEqual(bEarly?.unlocked, true);

    const bNight = badges.find((b) => b.id === 'night-owl');
    assert.strictEqual(bNight?.unlocked, true);
  });

  it('getGamificationState should provide complete unified state', () => {
    const state = getGamificationState(8, 60, 88, []);
    assert.ok(state.totalXp > 0);
    assert.ok(state.level >= 1);
    assert.ok(typeof state.rankTitle === 'string');
    assert.strictEqual(state.badges.length, 8);
    assert.ok(state.unlockedBadgesCount >= 2);
  });
});

describe('Multi-Format Export Engine Tests (Excel XML & SQL Dump)', () => {
  const sampleMembers = [
    {
      studyId: 'SG-MATH-0001',
      fullName: 'Kasun Bandara',
      email: 'kasun@gmail.com',
      school: 'Ananda College',
      stream: 'Physical Science',
      optionalSubject: 'Chemistry',
      examYear: '2026',
      telegramUsername: '@kasun_al',
      registrationDate: '2026-08-01T08:00:00Z',
      status: 'Active',
    },
    {
      studyId: 'SG-BIO-0002',
      fullName: 'Chamari Silva',
      email: 'chamari@gmail.com',
      school: 'Visakha Vidyalaya',
      stream: 'Biological Science',
      optionalSubject: 'Physics',
      examYear: '2026',
      telegramUsername: '@chamari_al',
      registrationDate: '2026-08-02T08:00:00Z',
      status: 'Active',
    },
  ];

  const sampleLogs = [
    {
      logId: 'LOG-001',
      studyId: 'SG-MATH-0001',
      fullName: 'Kasun Bandara',
      stream: 'Physical Science',
      dateOfStudy: '2026-08-26',
      subject1Hours: 2.5,
      subject2Hours: 2.0,
      subject3Hours: 1.5,
      totalHours: 6.0,
      focusScore: 9,
      productivityScore: 8,
      notes: '=SUM(1,2) test formula injection',
      proofUrl: 'https://drive.google.com/file/d/test12345/view',
    },
  ];

  it('generateExcelXmlString should generate valid Microsoft XML Spreadsheet with typed cells and escaped formulas', () => {
    const xml = generateExcelXmlString(sampleMembers, sampleLogs);

    assert.ok(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>'), 'Must have XML header');
    assert.ok(xml.includes('urn:schemas-microsoft-com:office:spreadsheet'), 'Must include Excel XML schema');
    assert.ok(xml.includes('<Worksheet ss:Name="Members Directory">'), 'Must contain Members worksheet');
    assert.ok(xml.includes('<Worksheet ss:Name="Daily Study Logs">'), 'Must contain Daily Study Logs worksheet');
    assert.ok(xml.includes('Kasun Bandara'), 'Must contain member record');
    assert.ok(xml.includes('Visakha Vidyalaya'), 'Must contain member school');

    // Formula injection verification: =SUM(1,2) must be escaped to '=SUM(1,2)
    assert.ok(xml.includes("&apos;=SUM(1,2)"), 'Formula injection characters must be neutralized in XML');
  });

  it('generateSqlDump should generate standard ANSI DDL and DML statements with SQL escaping', () => {
    const sql = generateSqlDump(sampleMembers, sampleLogs);

    assert.ok(sql.includes('CREATE TABLE IF NOT EXISTS members'), 'Must contain CREATE TABLE for members');
    assert.ok(sql.includes('CREATE TABLE IF NOT EXISTS daily_logs'), 'Must contain CREATE TABLE for daily_logs');
    assert.ok(sql.includes('INSERT INTO members'), 'Must contain INSERT statements for members');
    assert.ok(sql.includes('INSERT INTO daily_logs'), 'Must contain INSERT statements for daily_logs');
    assert.ok(sql.includes("'SG-MATH-0001'"), 'Must contain escaped study ID');
    assert.ok(sql.includes("'kasun@gmail.com'"), 'Must contain escaped email');
  });
});
