/**
 * Milestone M1 Automated Verification Test Suite
 * Tests static datasets, alert elimination, slider mathematics, state management, and utility functions.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

// Import M1 modules
import { SRI_LANKAN_SCHOOLS, searchSchools, highlightMatch } from '../src/js/schools.js';
import { CustomSlider } from '../src/js/slider.js';
import { AppState } from '../src/js/state.js';
import {
  getTodayDateString,
  formatDate,
  parseDateString,
  isToday,
  isFutureDate,
  daysBetween,
  calculateStreak,
  calculateStats,
  formatTelegramUsername,
  validateEmail,
  validateStudyId,
  formatBytes,
  sanitizeString
} from '../src/js/utils.js';

describe('Milestone M1 Verification', () => {

  // ==========================================
  // 1. ZERO ALERT() AUDIT
  // ==========================================
  describe('Rule Compliance: Zero alert() calls in codebase', () => {
    it('should have zero raw alert() calls in src/ and root html files', () => {
      const targetDirs = ['src/js', 'src/css'];
      const targetFiles = ['index.html', 'verify.html'];
      
      const alertRegex = /(?<![.\w])alert\s*\(/g;
      const foundAlerts = [];

      for (const dir of targetDirs) {
        if (fs.existsSync(dir)) {
          const files = fs.readdirSync(dir);
          for (const file of files) {
            const filePath = path.join(dir, file);
            if (fs.statSync(filePath).isFile()) {
              const content = fs.readFileSync(filePath, 'utf-8');
              // Exclude the intentional window.alert override safeguard in toast.js
              const filtered = content.split('\n').filter(line => !line.includes('window.alert =') && !line.includes('// Overrides window.alert'));
              const joined = filtered.join('\n');
              const matches = joined.match(alertRegex);
              if (matches) {
                foundAlerts.push({ file: filePath, count: matches.length });
              }
            }
          }
        }
      }

      for (const file of targetFiles) {
        if (fs.existsSync(file)) {
          const content = fs.readFileSync(file, 'utf-8');
          const matches = content.match(alertRegex);
          if (matches) {
            foundAlerts.push({ file, count: matches.length });
          }
        }
      }

      assert.strictEqual(foundAlerts.length, 0, `Found illegal alert() calls: ${JSON.stringify(foundAlerts)}`);
    });
  });

  // ==========================================
  // 2. SRI LANKAN SCHOOLS DATASET
  // ==========================================
  describe('Sri Lankan Schools Dataset & Autocomplete', () => {
    it('should contain >= 200 schools (actual count >= 250)', () => {
      assert.ok(Array.isArray(SRI_LANKAN_SCHOOLS));
      assert.ok(SRI_LANKAN_SCHOOLS.length >= 200, `Expected >= 200 schools, got ${SRI_LANKAN_SCHOOLS.length}`);
      assert.ok(SRI_LANKAN_SCHOOLS.length >= 250, `Comprehensive coverage check: ${SRI_LANKAN_SCHOOLS.length}`);
    });

    it('should cover all 9 Sri Lankan provinces', () => {
      const provinces = new Set(SRI_LANKAN_SCHOOLS.map(s => s.province));
      const requiredProvinces = [
        'Western', 'Central', 'Southern', 'Northern', 'Eastern',
        'North Western', 'North Central', 'Uva', 'Sabaragamuwa'
      ];
      for (const p of requiredProvinces) {
        assert.ok(provinces.has(p), `Missing province: ${p}`);
      }
    });

    it('should cover major districts across Sri Lanka', () => {
      const districts = new Set(SRI_LANKAN_SCHOOLS.map(s => s.district));
      const keyDistricts = ['Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Galle', 'Matara', 'Jaffna', 'Kurunegala', 'Anuradhapura', 'Badulla', 'Ratnapura'];
      for (const d of keyDistricts) {
        assert.ok(districts.has(d), `Missing key district: ${d}`);
      }
    });

    it('should perform fuzzy search accurately', () => {
      const royalResults = searchSchools('Royal College');
      assert.ok(royalResults.length > 0);
      assert.ok(royalResults.some(s => s.name.includes('Royal College, Colombo')));

      const kandyResults = searchSchools('Kandy');
      assert.ok(kandyResults.length > 0);
      assert.ok(kandyResults.every(s => s.district === 'Kandy' || s.name.includes('Kandy')));

      const emptyResults = searchSchools('');
      assert.strictEqual(emptyResults.length, 0);
    });

    it('should highlight matched substrings', () => {
      const highlighted = highlightMatch('Royal College, Colombo', 'Royal');
      assert.ok(highlighted.includes('<mark class="bg-indigo-500/40 text-indigo-200 font-semibold px-0.5 rounded">Royal</mark>'));
    });

    it('should sanitize HTML special characters in highlightMatch to prevent DOM XSS', () => {
      const xssInput = '<script>alert("xss")</script> College & "Co"';
      const result = highlightMatch(xssInput, 'College');
      assert.ok(!result.includes('<script>'), 'Raw script tags must be escaped');
      assert.ok(result.includes('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x27;script&gt;'), 'HTML tags must be escaped');
      assert.ok(result.includes('<mark class="bg-indigo-500/40 text-indigo-200 font-semibold px-0.5 rounded">College</mark>'), 'Match must be highlighted');

      const xssQuery = '<img src=x onerror=alert(1)>';
      const result2 = highlightMatch('Royal College', xssQuery);
      assert.ok(!result2.includes('<img'), 'Query HTML tags must be escaped');
    });
  });

  // ==========================================
  // 3. CUSTOM GRADIENT SLIDER MATH & TIERS
  // ==========================================
  describe('Custom Gradient Slider Logic', () => {
    it('should assign correct color tones and qualitative badges for 1-10 scores', () => {
      // 1-3: Distracted / Struggling (danger / red)
      for (let v = 1; v <= 3; v++) {
        const tier = CustomSlider.getScoreTier(v);
        assert.strictEqual(tier.tone, 'danger');
        assert.ok(tier.status.includes('Distracted'));
        assert.strictEqual(tier.primaryColor, '#ef4444');
      }

      // 4-6: Moderate / Steady (warning / yellow)
      for (let v = 4; v <= 6; v++) {
        const tier = CustomSlider.getScoreTier(v);
        assert.strictEqual(tier.tone, 'warning');
        assert.ok(tier.status.includes('Moderate'));
        assert.strictEqual(tier.primaryColor, '#eab308');
      }

      // 7-8: High / Productive (success / emerald)
      for (let v = 7; v <= 8; v++) {
        const tier = CustomSlider.getScoreTier(v);
        assert.strictEqual(tier.tone, 'success');
        assert.ok(tier.status.includes('High'));
        assert.strictEqual(tier.primaryColor, '#10b981');
      }

      // 9-10: Deep Flow State (purple / cyan)
      for (let v = 9; v <= 10; v++) {
        const tier = CustomSlider.getScoreTier(v);
        assert.strictEqual(tier.tone, 'purple');
        assert.ok(tier.status.includes('Flow'));
        assert.strictEqual(tier.primaryColor, '#06b6d4');
      }
    });
  });

  // ==========================================
  // 4. REACTIVE STATE STORE (AppState)
  // ==========================================
  describe('AppState Reactive Store', () => {
    it('should initialize with default state and allow updates', () => {
      const state = AppState.get();
      assert.strictEqual(state.theme, 'dark');
      assert.strictEqual(typeof state.route, 'string');

      let notified = false;
      let receivedState = null;

      const unsubscribe = AppState.subscribe((s) => {
        notified = true;
        receivedState = s;
      });

      AppState.set({ route: 'dashboard' });
      assert.strictEqual(AppState.get().route, 'dashboard');
      assert.strictEqual(receivedState.route, 'dashboard');

      unsubscribe();
    });
  });

  // ==========================================
  // 5. UTILITY FUNCTIONS & STREAK ALGORITHM
  // ==========================================
  describe('Study Streak Algorithm & Analytics', () => {
    it('should calculate consecutive streak accurately', () => {
      const today = getTodayDateString();
      const d1 = new Date();
      d1.setDate(d1.getDate() - 1);
      const yesterday = getTodayDateString(d1);

      const d2 = new Date();
      d2.setDate(d2.getDate() - 2);
      const dayBefore = getTodayDateString(d2);

      const d3 = new Date();
      d3.setDate(d3.getDate() - 3);
      const threeDaysAgo = getTodayDateString(d3);

      // Continuous 4-day streak
      const mockLogs = [
        { dateOfStudy: today, subjects: [{ name: 'Biology', hours: 2, focus: 8, productivity: 8 }] },
        { dateOfStudy: yesterday, subjects: [{ name: 'Biology', hours: 3, focus: 9, productivity: 9 }] },
        { dateOfStudy: dayBefore, subjects: [{ name: 'Chemistry', hours: 1.5, focus: 7, productivity: 7 }] },
        { dateOfStudy: threeDaysAgo, subjects: [{ name: 'Physics', hours: 2, focus: 8, productivity: 8 }] }
      ];

      const streak = calculateStreak(mockLogs);
      assert.strictEqual(streak.currentStreak, 4);
      assert.strictEqual(streak.longestStreak, 4);
      assert.strictEqual(streak.studiedToday, true);
    });

    it('should handle broken streaks with historical longest streak', () => {
      const d10 = new Date(); d10.setDate(d10.getDate() - 10);
      const d11 = new Date(); d11.setDate(d11.getDate() - 11);
      const d12 = new Date(); d12.setDate(d12.getDate() - 12);
      const d13 = new Date(); d13.setDate(d13.getDate() - 13);
      const d14 = new Date(); d14.setDate(d14.getDate() - 14);

      // Past 5-day streak, but student did not study recently
      const brokenLogs = [
        { dateOfStudy: getTodayDateString(d10) },
        { dateOfStudy: getTodayDateString(d11) },
        { dateOfStudy: getTodayDateString(d12) },
        { dateOfStudy: getTodayDateString(d13) },
        { dateOfStudy: getTodayDateString(d14) }
      ];

      const streak = calculateStreak(brokenLogs);
      assert.strictEqual(streak.currentStreak, 0);
      assert.strictEqual(streak.longestStreak, 5);
      assert.strictEqual(streak.studiedToday, false);
    });

    it('should compute aggregated metrics correctly', () => {
      const mockLogs = [
        {
          dateOfStudy: '2026-08-25',
          subjects: [
            { name: 'Biology', hours: 2.5, focus: 8, productivity: 8 },
            { name: 'Chemistry', hours: 1.5, focus: 6, productivity: 6 },
            { name: 'Physics', hours: 2.0, focus: 7, productivity: 7 }
          ]
        },
        {
          dateOfStudy: '2026-08-26',
          subjects: [
            { name: 'Biology', hours: 3.0, focus: 9, productivity: 9 },
            { name: 'Chemistry', hours: 2.0, focus: 8, productivity: 8 },
            { name: 'Physics', hours: 1.0, focus: 8, productivity: 8 }
          ]
        }
      ];

      const stats = calculateStats(mockLogs);
      assert.strictEqual(stats.totalHours, 12);
      assert.strictEqual(stats.totalSubmissions, 2);
      assert.strictEqual(stats.avgDailyHours, 6);
      assert.strictEqual(stats.subjectTotals['Biology'], 5.5);
      assert.strictEqual(stats.subjectTotals['Chemistry'], 3.5);
      assert.strictEqual(stats.subjectTotals['Physics'], 3.0);
      assert.strictEqual(stats.avgFocus, 7.7);
      assert.strictEqual(stats.avgProductivity, 7.7);
    });

    it('should validate inputs, dates, emails, and Study IDs', () => {
      assert.strictEqual(validateEmail('student@gmail.com'), true);
      assert.strictEqual(validateEmail('not-an-email'), false);

      assert.strictEqual(validateStudyId('SG-BIO-0001'), true);
      assert.strictEqual(validateStudyId('SG-MATH-0042'), true);
      assert.strictEqual(validateStudyId('AL-MATH-2376'), false); // Legacy bad format rejected

      assert.strictEqual(formatTelegramUsername('kasun_p'), '@kasun_p');
      assert.strictEqual(formatTelegramUsername('@kasun_p'), '@kasun_p');

      assert.strictEqual(formatBytes(1024), '1 KB');
      assert.strictEqual(formatBytes(500 * 1024), '500 KB');

      assert.strictEqual(sanitizeString('<b>Kasun</b> & "Friends"'), '&lt;b&gt;Kasun&lt;/b&gt; &amp; &quot;Friends&quot;');
    });
  });

});
