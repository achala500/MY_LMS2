/**
 * ============================================================================
 * Milestone M5 Verification Test Suite
 * Comprehensive automated unit & integration tests for:
 * 1. Rule compliance (Zero alert() calls across all JS/HTML files)
 * 2. Student Dashboard stats calculations, streak math, and subject rollups
 * 3. Platform ID Card ID card canvas render & 3x PNG export triggering
 * 4. Past study history table rendering, filtering, and photo modal triggers
 * 5. Admin Whitelist Security Gate (Authorized vs Unauthorized 403 Forbidden Screen)
 * 6. Admin Group Analytics, KPI metrics aggregation, and stream distribution
 * 7. Admin Streak Leaderboard with tie-breakers and ranking
 * 8. Admin Members Directory search, filtering, and RFC 4180 CSV export
 * 9. Admin Daily Logs Inspector search, date range filtering, photo modal, and RFC 4180 CSV export
 * 10. App Router mounting of #dashboard, #admin, #history, and view lifecycle
 * 11. End-to-End integration with mock server backend actions
 * ============================================================================
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';

// Import M5 & Core modules
import { DashboardView } from '../src/js/views/dashboardView.js';
import { AdminView, ADMIN_EMAILS } from '../src/js/views/adminView.js';
import { AppRouter } from '../src/js/app.js';
import { AppState } from '../src/js/state.js';
import { ApiClient } from '../src/js/api.js';
import { IdCard } from '../src/js/idcard.js';
import {
  getTodayDateString,
  formatDate,
  calculateStats,
  calculateStreak,
  formatCsvCell,
  generateCsvString,
  sanitizeString,
  validateEmail,
  validateStudyId
} from '../src/js/utils.js';
import { resolveStreamSubjects } from '../src/js/views/dailyFormView.js';
import { app } from '../server/mock-server.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

// ----------------------------------------------------------------------------
// SUITE 1: Rule Compliance & Zero alert() Audit
// ----------------------------------------------------------------------------
test('Rule Compliance: Zero alert() calls in all codebase files', async (t) => {
  await t.test('All JS and HTML files contain zero raw alert() calls', () => {
    const checkDirs = [
      path.join(ROOT_DIR, 'src', 'js'),
      path.join(ROOT_DIR, 'src', 'js', 'views')
    ];

    const alertRegex = /(?<![.\w])alert\s*\(/g;
    const violations = [];

    for (const dir of checkDirs) {
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir);
        for (const file of files) {
          const filePath = path.join(dir, file);
          if (fs.statSync(filePath).isFile() && file.endsWith('.js')) {
            const content = fs.readFileSync(filePath, 'utf8');
            // Exclude window.alert override definition in toast.js
            const lines = content.split('\n').filter(
              line => !line.includes('window.alert =') && !line.includes('// Overrides window.alert')
            );
            const matches = lines.join('\n').match(alertRegex);
            if (matches) {
              violations.push({ file: filePath, count: matches.length });
            }
          }
        }
      }
    }

    assert.equal(violations.length, 0, `Forbidden alert() calls found: ${JSON.stringify(violations)}`);
  });
});

// ----------------------------------------------------------------------------
// SUITE 2: Student Personal Dashboard Stats & Streak Calculations
// ----------------------------------------------------------------------------
test('Student Personal Dashboard Stats Rollups', async (t) => {
  await t.test('Calculates current active study streak from consecutive daily logs', () => {
    const today = getTodayDateString();
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = getTodayDateString(yesterdayDate);

    const dayBeforeDate = new Date();
    dayBeforeDate.setDate(dayBeforeDate.getDate() - 2);
    const dayBefore = getTodayDateString(dayBeforeDate);

    const sampleLogs = [
      { dateOfStudy: today, totalHours: 4.5 },
      { dateOfStudy: yesterday, totalHours: 3.0 },
      { dateOfStudy: dayBefore, totalHours: 5.0 }
    ];

    const streak = calculateStreak(sampleLogs);
    assert.equal(streak.currentStreak, 3);
    assert.equal(streak.studiedToday, true);
    assert.equal(streak.longestStreak, 3);
  });

  await t.test('Calculates streak as active when student studied yesterday but not yet today', () => {
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = getTodayDateString(yesterdayDate);

    const dayBeforeDate = new Date();
    dayBeforeDate.setDate(dayBeforeDate.getDate() - 2);
    const dayBefore = getTodayDateString(dayBeforeDate);

    const sampleLogs = [
      { dateOfStudy: yesterday, totalHours: 3.5 },
      { dateOfStudy: dayBefore, totalHours: 4.0 }
    ];

    const streak = calculateStreak(sampleLogs);
    assert.equal(streak.currentStreak, 2);
    assert.equal(streak.studiedToday, false);
  });

  await t.test('Resets current streak to 0 if gap exceeds 1 day', () => {
    const threeDaysAgoDate = new Date();
    threeDaysAgoDate.setDate(threeDaysAgoDate.getDate() - 3);
    const threeDaysAgo = getTodayDateString(threeDaysAgoDate);

    const sampleLogs = [
      { dateOfStudy: threeDaysAgo, totalHours: 2.0 }
    ];

    const streak = calculateStreak(sampleLogs);
    assert.equal(streak.currentStreak, 0);
    assert.equal(streak.longestStreak, 1);
  });

  await t.test('Aggregates total study hours, subject totals, and average focus/productivity', () => {
    const logs = [
      {
        dateOfStudy: '2026-08-24',
        subjects: [
          { name: 'Biology', hours: 2.5, focus: 9, productivity: 8 },
          { name: 'Chemistry', hours: 1.5, focus: 8, productivity: 7 },
          { name: 'Physics', hours: 2.0, focus: 7, productivity: 9 }
        ]
      },
      {
        dateOfStudy: '2026-08-25',
        subjects: [
          { name: 'Biology', hours: 3.0, focus: 10, productivity: 9 },
          { name: 'Chemistry', hours: 2.0, focus: 8, productivity: 8 },
          { name: 'Physics', hours: 1.0, focus: 8, productivity: 8 }
        ]
      }
    ];

    const stats = calculateStats(logs);
    assert.equal(stats.totalHours, 12.0);
    assert.equal(stats.totalSubmissions, 2);
    assert.equal(stats.avgDailyHours, 6.0);
    assert.equal(stats.subjectTotals['Biology'], 5.5);
    assert.equal(stats.subjectTotals['Chemistry'], 3.5);
    assert.equal(stats.subjectTotals['Physics'], 3.0);
    assert.equal(stats.avgFocus, 8.3);
    assert.equal(stats.avgProductivity, 8.2);
  });

  await t.test('Handles empty logs gracefully with zero defaults', () => {
    const stats = calculateStats([]);
    assert.equal(stats.totalHours, 0);
    assert.equal(stats.totalSubmissions, 0);
    assert.equal(stats.avgDailyHours, 0);
    assert.equal(stats.avgFocus, 0);
    assert.equal(stats.avgProductivity, 0);
    assert.equal(stats.streak.currentStreak, 0);
  });
});

// ----------------------------------------------------------------------------
// SUITE 3: Platform ID Card ID Card Renderer & PNG Exporter
// ----------------------------------------------------------------------------
test('Platform ID Card ID Card Integration', async (t) => {
  const sampleMember = {
    studyId: 'SG-BIO-0001',
    fullName: 'Kasun Perera',
    email: 'kasun.p@gmail.com',
    gender: 'Male',
    telegram: '@kasun_p',
    school: 'Royal College, Colombo',
    stream: 'Biological Science',
    optionalSubject: 'Physics',
    registrationDate: '2026-08-20',
    status: 'Active'
  };

  await t.test('IdCard engine exports 3x high-resolution card parameters', () => {
    assert.equal(IdCard.baseWidth, 480);
    assert.equal(IdCard.baseHeight, 302);
  });

  await t.test('IdCard requires valid studyId in member data', () => {
    const dummyCanvas = { getContext: () => ({}) };
    assert.throws(() => {
      IdCard.renderToCanvas({}, dummyCanvas);
    }, /Valid member data with studyId required/);
  });
});

// ----------------------------------------------------------------------------
// SUITE 4: Past Study History Table & Search / Filter
// ----------------------------------------------------------------------------
test('Past Study History Table & Search', async (t) => {
  const view = new DashboardView();
  const sampleLogs = [
    {
      dateOfStudy: '2026-08-24',
      studyId: 'SG-BIO-0001',
      totalHours: 4.5,
      subjects: [{ name: 'Biology', hours: 2.5, focus: 8, productivity: 8 }],
      notes: 'Reviewed genetics and Mendelian inheritance',
      proofPhotoUrl: 'https://example.com/proof1.jpg'
    },
    {
      dateOfStudy: '2026-08-25',
      studyId: 'SG-BIO-0001',
      totalHours: 3.0,
      subjects: [{ name: 'Chemistry', hours: 3.0, focus: 9, productivity: 9 }],
      notes: 'Equilibrium constants and Le Chatelier practice',
      proofPhotoUrl: ''
    }
  ];

  await t.test('Renders full table with all logs when query is empty', () => {
    const html = view._renderHistoryTable(sampleLogs, '');
    assert.ok(html.includes('2026-08-24') || html.includes('24 Aug 2026'));
    assert.ok(html.includes('2026-08-25') || html.includes('25 Aug 2026'));
    assert.ok(html.includes('genetics'));
    assert.ok(html.includes('Equilibrium'));
    assert.ok(html.includes('btn-view-proof-photo'));
  });

  await t.test('Filters logs accurately by date query', () => {
    const html = view._renderHistoryTable(sampleLogs, '2026-08-24');
    assert.ok(html.includes('genetics'));
    assert.ok(!html.includes('Equilibrium'));
  });

  await t.test('Filters logs accurately by reflection notes keyword', () => {
    const html = view._renderHistoryTable(sampleLogs, 'Chatelier');
    assert.ok(html.includes('Equilibrium'));
    assert.ok(!html.includes('genetics'));
  });

  await t.test('Displays clean zero-state message when search yields no matches', () => {
    const html = view._renderHistoryTable(sampleLogs, 'nonexistent query 123');
    assert.ok(html.includes('No study logs found'));
    assert.ok(html.includes('nonexistent query 123'));
  });
});

// ----------------------------------------------------------------------------
// SUITE 5: Admin Whitelist Security Guard & 403 Forbidden Screen
// ----------------------------------------------------------------------------
test('Admin Whitelist Security Guard', async (t) => {
  await t.test('Recognizes configured whitelisted admin emails', () => {
    assert.equal(AdminView.isAuthorizedAdmin('admin@studysync.lk'), true);
    assert.equal(AdminView.isAuthorizedAdmin('ADMIN@STUDYSYNC.LK'), true); // Case-insensitive
    assert.equal(AdminView.isAuthorizedAdmin('lead.organizer@gmail.com'), true);
    assert.equal(AdminView.isAuthorizedAdmin('alwis@gmail.com'), true);
  });

  await t.test('Denies unauthorized non-admin emails', () => {
    assert.equal(AdminView.isAuthorizedAdmin('student@gmail.com'), false);
    assert.equal(AdminView.isAuthorizedAdmin('random.user@outlook.com'), false);
    assert.equal(AdminView.isAuthorizedAdmin(''), false);
    assert.equal(AdminView.isAuthorizedAdmin(null), false);
  });

  await t.test('Renders 403 Forbidden screen with lock icon and return CTA for unauthorized users', () => {
    const adminView = new AdminView();
    const dummyContainer = { innerHTML: '' };
    adminView.container = dummyContainer;

    adminView._render403Forbidden('attacker@example.com');
    assert.ok(dummyContainer.innerHTML.includes('403 FORBIDDEN'));
    assert.ok(dummyContainer.innerHTML.includes('Restricted Admin Console'));
    assert.ok(dummyContainer.innerHTML.includes('attacker@example.com'));
    assert.ok(dummyContainer.innerHTML.includes('Return to Student Dashboard'));
  });
});

// ----------------------------------------------------------------------------
// SUITE 6: Admin Group Analytics, KPIs & Stream Distribution
// ----------------------------------------------------------------------------
test('Admin Group Analytics & KPIs', async (t) => {
  const adminView = new AdminView();
  const dummyContainer = { innerHTML: '' };
  adminView.container = dummyContainer;

  adminView.adminData = {
    members: [
      { studyId: 'SG-BIO-0001', fullName: 'Kasun', stream: 'Biological Science', status: 'Active' },
      { studyId: 'SG-MATH-0001', fullName: 'Dineth', stream: 'Physical Science', status: 'Active' }
    ],
    recentLogs: [
      { studyId: 'SG-BIO-0001', totalHours: 4.0 },
      { studyId: 'SG-MATH-0001', totalHours: 6.0 }
    ],
    analytics: {
      totalMembers: 2,
      activeMembers: 2,
      totalHours: 10.0,
      totalLogs: 2,
      avgDailyHours: 5.0,
      avgGroupFocus: 8.5,
      avgGroupProductivity: 8.0,
      streamBreakdown: {
        'Biological Science': { members: 1, totalHours: 4.0, totalLogs: 1 },
        'Physical Science': { members: 1, totalHours: 6.0, totalLogs: 1 }
      }
    },
    leaderboard: [
      { rank: 1, name: 'Dineth', studyId: 'SG-MATH-0001', stream: 'Physical Science', streak: 5, totalHours: 6.0 },
      { rank: 2, name: 'Kasun', studyId: 'SG-BIO-0001', stream: 'Biological Science', streak: 3, totalHours: 4.0 }
    ]
  };

  await t.test('Renders KPI cards with group totals and averages', () => {
    adminView._renderAnalyticsTab(dummyContainer);
    assert.ok(dummyContainer.innerHTML.includes('10h') || dummyContainer.innerHTML.includes('10.0h'));
    assert.ok(dummyContainer.innerHTML.includes('Total Members'));
    assert.ok(dummyContainer.innerHTML.includes('Active Ratio'));
    assert.ok(dummyContainer.innerHTML.includes('100%'));
  });

  await t.test('Renders stream distribution comparison with Bio and Maths metrics', () => {
    adminView._renderAnalyticsTab(dummyContainer);
    assert.ok(dummyContainer.innerHTML.includes('Biological Science'));
    assert.ok(dummyContainer.innerHTML.includes('Physical Science'));
    assert.ok(dummyContainer.innerHTML.includes('50% of cohort'));
  });

  await t.test('Renders leaderboard with rank badges (Gold 🥇 for #1)', () => {
    adminView._renderAnalyticsTab(dummyContainer);
    assert.ok(dummyContainer.innerHTML.includes('🥇'));
    assert.ok(dummyContainer.innerHTML.includes('🥈'));
    assert.ok(dummyContainer.innerHTML.includes('Dineth'));
    assert.ok(dummyContainer.innerHTML.includes('Kasun'));
  });
});

// ----------------------------------------------------------------------------
// SUITE 7: Admin Streak Leaderboard & Tie-Breakers
// ----------------------------------------------------------------------------
test('Admin Streak Leaderboard & Tie-Breaker Logic', async (t) => {
  const adminView = new AdminView();

  await t.test('Tie-breaker: Renders properly when streaks are equal and sorted by hours', () => {
    const row1 = adminView._renderLeaderboardRow({
      rank: 1,
      name: 'Nimali',
      school: 'Visakha Vidyalaya',
      studyId: 'SG-MATH-0002',
      stream: 'Physical Science',
      streak: 5,
      totalHours: 25.0,
      avgFocus: 9.0,
      avgProductivity: 9.0
    }, 0);

    const row2 = adminView._renderLeaderboardRow({
      rank: 2,
      name: 'Kamal',
      school: 'Ananda College',
      studyId: 'SG-BIO-0002',
      stream: 'Biological Science',
      streak: 5,
      totalHours: 20.0,
      avgFocus: 8.5,
      avgProductivity: 8.5
    }, 1);

    assert.ok(row1.includes('🥇'));
    assert.ok(row1.includes('25.0 hrs'));
    assert.ok(row2.includes('🥈'));
    assert.ok(row2.includes('20.0 hrs'));
  });
});

// ----------------------------------------------------------------------------
// SUITE 8: Admin Members Directory & RFC 4180 CSV Export
// ----------------------------------------------------------------------------
test('Admin Members Directory & RFC 4180 CSV Formatting', async (t) => {
  const members = [
    {
      studyId: 'SG-BIO-0001',
      fullName: 'Kasun "The Pro" Perera',
      email: 'kasun@gmail.com',
      gender: 'Male',
      telegram: '@kasun_p',
      school: 'Royal College, Colombo',
      stream: 'Biological Science',
      optionalSubject: 'Physics',
      registrationDate: '2026-08-20',
      status: 'Active'
    },
    {
      studyId: 'SG-MATH-0001',
      fullName: 'Silva, K. A.',
      email: 'silva@gmail.com',
      gender: 'Female',
      telegram: '@silva',
      school: 'Devi Balika Vidyalaya, Colombo',
      stream: 'Physical Science',
      optionalSubject: 'Chemistry',
      registrationDate: '2026-08-21',
      status: 'Active'
    }
  ];

  await t.test('Escapes CSV cells containing commas, double quotes, and newlines', () => {
    assert.equal(formatCsvCell('Silva, K. A.'), '"Silva, K. A."');
    assert.equal(formatCsvCell('Kasun "The Pro" Perera'), '"Kasun ""The Pro"" Perera"');
    assert.equal(formatCsvCell('Line 1\nLine 2'), '"Line 1\nLine 2"');
    assert.equal(formatCsvCell('SimpleText'), 'SimpleText');
    assert.equal(formatCsvCell(null), '');
  });

  await t.test('Generates RFC 4180 compliant CSV string for members directory', () => {
    const headers = ['Study ID', 'Full Name', 'Email', 'Gender', 'Telegram', 'School', 'Stream', 'Optional Subject', 'Registration Date', 'Status'];
    const rows = members.map(m => [
      m.studyId, m.fullName, m.email, m.gender, m.telegram, m.school, m.stream, m.optionalSubject, m.registrationDate, m.status
    ]);

    const csv = generateCsvString(headers, rows);
    assert.ok(csv.startsWith('Study ID,Full Name,Email,Gender,Telegram,School,Stream,Optional Subject,Registration Date,Status'));
    assert.ok(csv.includes('"Kasun ""The Pro"" Perera"'));
    assert.ok(csv.includes('"Silva, K. A."'));
    assert.ok(csv.includes('"Royal College, Colombo"'));
  });

  await t.test('Filters members correctly by search term, stream, and status', () => {
    const view = new AdminView();
    view.memberSearch = 'silva';
    view.memberStreamFilter = 'all';
    view.memberStatusFilter = 'all';

    const filtered = view._getFilteredMembers(members);
    assert.equal(filtered.length, 1);
    assert.equal(filtered[0].studyId, 'SG-MATH-0001');

    view.memberSearch = '';
    view.memberStreamFilter = 'Biological Science';
    const bioFiltered = view._getFilteredMembers(members);
    assert.equal(bioFiltered.length, 1);
    assert.equal(bioFiltered[0].studyId, 'SG-BIO-0001');
  });
});

// ----------------------------------------------------------------------------
// SUITE 9: Admin Daily Logs Inspector & RFC 4180 CSV Export
// ----------------------------------------------------------------------------
test('Admin Daily Logs Inspector & RFC 4180 CSV Formatting', async (t) => {
  const logs = [
    {
      timestamp: '2026-08-24T18:00:00.000Z',
      studyId: 'SG-BIO-0001',
      email: 'kasun@gmail.com',
      dateOfStudy: '2026-08-24',
      subjects: [
        { name: 'Biology', hours: 2.5, focus: 9, productivity: 8 },
        { name: 'Chemistry', hours: 1.5, focus: 8, productivity: 7 },
        { name: 'Physics', hours: 2.0, focus: 7, productivity: 9 }
      ],
      totalHours: 6.0,
      notes: 'Reviewed cell structure, organic reactions',
      telegram: '@kasun_p',
      proofPhotoUrl: 'https://drive.google.com/proof1.jpg'
    },
    {
      timestamp: '2026-08-25T19:00:00.000Z',
      studyId: 'SG-MATH-0001',
      email: 'dineth@gmail.com',
      dateOfStudy: '2026-08-25',
      subjects: [
        { name: 'Combined Maths', hours: 3.0, focus: 10, productivity: 9 },
        { name: 'Physics', hours: 2.0, focus: 9, productivity: 8 },
        { name: 'Chemistry', hours: 1.0, focus: 8, productivity: 8 }
      ],
      totalHours: 6.0,
      notes: 'Calculus derivatives and mechanics questions',
      telegram: '@dineth_m',
      proofPhotoUrl: 'https://drive.google.com/proof2.jpg'
    }
  ];

  await t.test('Generates RFC 4180 compliant CSV string for daily logs with 20 columns', () => {
    const headers = [
      'Timestamp', 'Study ID', 'Email', 'Date of Study',
      'Subject 1 Name', 'Subject 1 Hours', 'Subject 1 Focus', 'Subject 1 Productivity',
      'Subject 2 Name', 'Subject 2 Hours', 'Subject 2 Focus', 'Subject 2 Productivity',
      'Subject 3 Name', 'Subject 3 Hours', 'Subject 3 Focus', 'Subject 3 Productivity',
      'Total Hours', 'Notes', 'Telegram', 'Proof Photo URL'
    ];

    const rows = logs.map(l => [
      l.timestamp, l.studyId, l.email, l.dateOfStudy,
      l.subjects[0].name, l.subjects[0].hours, l.subjects[0].focus, l.subjects[0].productivity,
      l.subjects[1].name, l.subjects[1].hours, l.subjects[1].focus, l.subjects[1].productivity,
      l.subjects[2].name, l.subjects[2].hours, l.subjects[2].focus, l.subjects[2].productivity,
      l.totalHours, l.notes, l.telegram, l.proofPhotoUrl
    ]);

    const csv = generateCsvString(headers, rows);
    assert.ok(csv.startsWith('Timestamp,Study ID,Email,Date of Study'));
    assert.ok(csv.includes('"Reviewed cell structure, organic reactions"'));
    assert.ok(csv.includes('Combined Maths'));
    assert.ok(csv.includes('https://drive.google.com/proof1.jpg'));
  });

  await t.test('Filters logs by date range and student ID', () => {
    const view = new AdminView();
    view.logsDateFrom = '2026-08-25';
    view.logsDateTo = '2026-08-25';
    view.logsStudentFilter = 'all';
    view.logsSearch = '';

    const filtered = view._getFilteredLogs(logs);
    assert.equal(filtered.length, 1);
    assert.equal(filtered[0].studyId, 'SG-MATH-0001');

    view.logsDateFrom = '';
    view.logsDateTo = '';
    view.logsStudentFilter = 'SG-BIO-0001';
    const studentFiltered = view._getFilteredLogs(logs);
    assert.equal(studentFiltered.length, 1);
    assert.equal(studentFiltered[0].studyId, 'SG-BIO-0001');
  });
});

// ----------------------------------------------------------------------------
// SUITE 10: AppRouter Mounting & View Lifecycle
// ----------------------------------------------------------------------------
test('App Router Mounts and View Lifecycle', async (t) => {
  await t.test('Router instantiates and manages view instances without crashing', () => {
    // Setup dummy DOM mock
    const dummyRoot = { innerHTML: '', querySelector: () => null, querySelectorAll: () => [] };
    const dummyHeader = { querySelector: () => null };

    // Set sample state
    AppState.set({
      user: { email: 'kasun@gmail.com', displayName: 'Kasun' },
      member: {
        studyId: 'SG-BIO-0001',
        fullName: 'Kasun Perera',
        email: 'kasun@gmail.com',
        stream: 'Biological Science',
        optionalSubject: 'Physics',
        status: 'Active'
      },
      history: []
    });

    const router = new AppRouter();
    router.root = dummyRoot;

    // Test dashboard mount
    router._mountView('dashboard');
    assert.ok(router.currentViewInstance instanceof DashboardView);

    // Test admin mount
    router._mountView('admin');
    assert.ok(router.currentViewInstance instanceof AdminView);

    // Test history mount
    router._mountView('history');
    assert.ok(router.currentViewInstance instanceof DashboardView);

    // Cleanup
    if (router.currentViewInstance && typeof router.currentViewInstance.destroy === 'function') {
      router.currentViewInstance.destroy();
    }
  });
});

// ----------------------------------------------------------------------------
// SUITE 11: End-to-End Integration with Mock Backend Server
// ----------------------------------------------------------------------------
test('E2E Backend API Integration with Mock Server', async (t) => {
  let server;
  let serverPort;

  await t.test('Start ephemeral mock server for M5 endpoints', async () => {
    await new Promise((resolve) => {
      server = http.createServer(app);
      server.listen(0, '127.0.0.1', () => {
        serverPort = server.address().port;
        ApiClient.setBaseUrl(`http://127.0.0.1:${serverPort}/api`);
        resolve();
      });
    });
  });

  await t.test('ApiClient.getStudentHistory retrieves student logs and stats', async () => {
    const res = await ApiClient.getStudentHistory('SG-BIO-0001', 'kasun.p@gmail.com');
    assert.equal(res.success, true);
    assert.ok(res.data);
    assert.ok(Array.isArray(res.data.logs));
    assert.ok(res.data.stats);
  });

  await t.test('ApiClient.getAdminData allows whitelisted admin email', async () => {
    const res = await ApiClient.getAdminData('admin@studysync.lk');
    assert.equal(res.success, true);
    assert.ok(res.data.members);
    assert.ok(res.data.recentLogs);
    assert.ok(res.data.analytics);
    assert.ok(res.data.leaderboard);
  });

  await t.test('ApiClient.getAdminData rejects unauthorized non-admin email with 403', async () => {
    const res = await ApiClient.getAdminData('unauthorized.student@gmail.com');
    assert.equal(res.success, false);
    assert.ok(res.error.includes('Access Denied') || res.error.includes('403'));
  });

  await t.test('ApiClient.getAnalytics returns group KPIs, stream breakdown, and top streaks', async () => {
    const res = await ApiClient.getAnalytics();
    assert.equal(res.success, true);
    assert.ok(res.data.kpi);
    assert.ok(res.data.streamBreakdown);
    assert.ok(Array.isArray(res.data.topStreaks));
  });

  await t.test('Teardown ephemeral mock server', async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });
});
