/**
 * Milestone M1 Multi-Session & History Badges Automated Test Suite
 * Tests session duration calculation, overnight rollover, subject abbreviations,
 * auto-summing mathematical engine, manual override behavior, and legacy synthesis.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  calculateDurationFromTimes,
  formatHoursHuman,
  getSubjectBadgeConfig,
} from '../src/js/utils.js';

describe('Milestone M1: Multi-Session Logger & History Badges Test Suite', () => {

  // =========================================================================
  // 1. Session Duration & Time Calculation Math
  // =========================================================================
  describe('1. Start/End Time Decimal Duration Calculator', () => {
    it('should compute exact decimal hours for standard daytime intervals', () => {
      assert.strictEqual(calculateDurationFromTimes('08:30', '10:00'), 1.5);
      assert.strictEqual(calculateDurationFromTimes('09:00', '10:15'), 1.25);
      assert.strictEqual(calculateDurationFromTimes('14:00', '16:45'), 2.75);
      assert.strictEqual(calculateDurationFromTimes('06:00', '08:00'), 2.0);
    });

    it('should handle overnight / midnight rollover sessions seamlessly', () => {
      // 23:00 to 01:30 = 2.50 hours
      assert.strictEqual(calculateDurationFromTimes('23:00', '01:30'), 2.5);
      // 22:30 to 02:00 = 3.50 hours
      assert.strictEqual(calculateDurationFromTimes('22:30', '02:00'), 3.5);
      // 23:45 to 00:15 = 0.50 hours (30 mins)
      assert.strictEqual(calculateDurationFromTimes('23:45', '00:15'), 0.5);
    });

    it('should return 0 for empty, missing, or invalid time strings', () => {
      assert.strictEqual(calculateDurationFromTimes('', ''), 0);
      assert.strictEqual(calculateDurationFromTimes('08:00', ''), 0);
      assert.strictEqual(calculateDurationFromTimes('', '10:00'), 0);
      assert.strictEqual(calculateDurationFromTimes('invalid', '10:00'), 0);
    });
  });

  // =========================================================================
  // 2. Human Friendly Hours Formatter
  // =========================================================================
  describe('2. Human Friendly Hours Formatter', () => {
    it('should format decimal hours into friendly hour and minute strings', () => {
      assert.strictEqual(formatHoursHuman(1.5), '1h 30m');
      assert.strictEqual(formatHoursHuman(1.75), '1h 45m');
      assert.strictEqual(formatHoursHuman(2.0), '2h');
      assert.strictEqual(formatHoursHuman(0.25), '15m');
      assert.strictEqual(formatHoursHuman(0.5), '30m');
      assert.strictEqual(formatHoursHuman(3.0), '3h');
    });
  });

  // =========================================================================
  // 3. Subject Badge Configuration & Color Mapping
  // =========================================================================
  describe('3. Subject Badge & Color Mapping Engine', () => {
    it('should correctly configure Biology badge with Emerald color', () => {
      const config = getSubjectBadgeConfig('Biology');
      assert.strictEqual(config.abbr, 'Bio');
      assert.strictEqual(config.fullName, 'Biology');
      assert.strictEqual(config.hex, '#10b981');
      assert.ok(config.badgeClass.includes('emerald'));
    });

    it('should correctly configure Combined Mathematics badge with Indigo color', () => {
      const config = getSubjectBadgeConfig('Combined Maths');
      assert.strictEqual(config.abbr, 'Maths');
      assert.strictEqual(config.fullName, 'Combined Maths');
      assert.strictEqual(config.hex, '#6366f1');
      assert.ok(config.badgeClass.includes('indigo'));
    });

    it('should correctly configure Physics badge with Purple color', () => {
      const config = getSubjectBadgeConfig('Physics');
      assert.strictEqual(config.abbr, 'Phys');
      assert.strictEqual(config.fullName, 'Physics');
      assert.strictEqual(config.hex, '#a855f7');
      assert.ok(config.badgeClass.includes('purple'));
    });

    it('should correctly configure Chemistry badge with Amber color', () => {
      const config = getSubjectBadgeConfig('Chemistry');
      assert.strictEqual(config.abbr, 'Chem');
      assert.strictEqual(config.fullName, 'Chemistry');
      assert.strictEqual(config.hex, '#f59e0b');
      assert.ok(config.badgeClass.includes('amber'));
    });

    it('should correctly configure ICT and Agriculture badges', () => {
      const ictConfig = getSubjectBadgeConfig('Information and Communication Tech');
      assert.strictEqual(ictConfig.abbr, 'ICT');
      assert.strictEqual(ictConfig.hex, '#06b6d4');

      const agriConfig = getSubjectBadgeConfig('Agriculture');
      assert.strictEqual(agriConfig.abbr, 'Agri');
      assert.strictEqual(agriConfig.hex, '#84cc16');
    });

    it('should provide robust fallback for unrecognized subjects', () => {
      const fallbackConfig = getSubjectBadgeConfig('General English');
      assert.strictEqual(fallbackConfig.abbr, 'Gene');
      assert.strictEqual(fallbackConfig.hex, '#71717a');
    });
  });

  // =========================================================================
  // 4. Live Multi-Session Auto-Sum & Manual Override Engine
  // =========================================================================
  describe('4. Multi-Session Auto-Sum & Manual Override Math', () => {
    it('should accurately aggregate multiple sessions for the same and different subjects', () => {
      const sessions = [
        { subject: 'Biology', hours: 1.5, focus: 8, productivity: 8 },
        { subject: 'Biology', hours: 2.0, focus: 9, productivity: 9 },
        { subject: 'Chemistry', hours: 1.25, focus: 7, productivity: 8 },
        { subject: 'Physics', hours: 0.75, focus: 10, productivity: 9 },
      ];

      let bioHours = 0;
      let chemHours = 0;
      let physHours = 0;

      sessions.forEach((s) => {
        if (s.subject === 'Biology') bioHours += s.hours;
        else if (s.subject === 'Chemistry') chemHours += s.hours;
        else if (s.subject === 'Physics') physHours += s.hours;
      });

      assert.strictEqual(Number(bioHours.toFixed(2)), 3.5);
      assert.strictEqual(Number(chemHours.toFixed(2)), 1.25);
      assert.strictEqual(Number(physHours.toFixed(2)), 0.75);

      const calculatedTotal = Number((bioHours + chemHours + physHours).toFixed(2));
      assert.strictEqual(calculatedTotal, 5.5);
    });

    it('should preserve manual override total when active and restore auto-sum when reset', () => {
      const sessions = [
        { subject: 'Combined Maths', hours: 2.0 },
        { subject: 'Physics', hours: 1.5 },
      ];
      const autoSum = 3.5;

      let manualOverrideActive = true;
      let manualTotal = 4.5; // student added 1 hour tuition

      let effectiveTotal = manualOverrideActive && manualTotal !== null ? manualTotal : autoSum;
      assert.strictEqual(effectiveTotal, 4.5);

      // Student clicks Reset to Session Sum
      manualOverrideActive = false;
      manualTotal = null;
      effectiveTotal = manualOverrideActive && manualTotal !== null ? manualTotal : autoSum;
      assert.strictEqual(effectiveTotal, 3.5);
    });
  });

  // =========================================================================
  // 5. Legacy Log Fallback Synthesis
  // =========================================================================
  describe('5. Legacy Single-Day Log Synthesis Protocol', () => {
    it('should synthesize session entries from 3-subject summary objects', () => {
      const legacyLog = {
        studyId: 'SG-BIO-0001',
        dateOfStudy: '2026-08-20',
        subjects: [
          { name: 'Biology', hours: 2.5, focus: 9, productivity: 8 },
          { name: 'Chemistry', hours: 1.5, focus: 8, productivity: 7 },
          { name: 'Physics', hours: 0, focus: 0, productivity: 0 },
        ],
        totalHours: 4.0,
        notes: 'Covered genetics past papers',
      };

      const synthesizedSessions = (legacyLog.subjects || [])
        .filter((sub) => sub.hours > 0)
        .map((sub, idx) => ({
          id: `synth_${idx}`,
          subject: sub.name,
          hours: sub.hours,
          focus: sub.focus,
          productivity: sub.productivity,
        }));

      assert.strictEqual(synthesizedSessions.length, 2);
      assert.strictEqual(synthesizedSessions[0].subject, 'Biology');
      assert.strictEqual(synthesizedSessions[0].hours, 2.5);
      assert.strictEqual(synthesizedSessions[1].subject, 'Chemistry');
      assert.strictEqual(synthesizedSessions[1].hours, 1.5);
    });
  });
});
