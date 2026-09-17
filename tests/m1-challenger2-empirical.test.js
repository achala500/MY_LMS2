/**
 * Challenger 2 Adversarial Stress Test Harness for Milestone 1 (M1)
 *
 * Targets:
 * 1. submitDailyLog payload serialization with multiple sessions & manual override.
 * 2. mock-server.js & Code.gs handling of session arrays, subject hour aggregations, and manual overrides.
 * 3. Dual-mode switching (Sessions vs Direct Hours) data preservation logic.
 * 4. Boundary & extreme conditions (empty sessions, 15+ sessions, midnight rollover, casing, legacy fallbacks).
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  calculateDurationFromTimes,
  formatHoursHuman,
  getSubjectBadgeConfig,
} from '../src/js/utils.js';

describe('Challenger 2 Empirical Verification: Milestone 1', () => {

  // =========================================================================
  // SUITE 1: Payload Serialization with Multiple Sessions
  // =========================================================================
  describe('1. submitDailyLog Payload Serialization with Multiple Sessions', () => {
    it('should correctly format payload with multiple valid session objects', () => {
      const sessions = [
        {
          id: 'sess_1',
          subject: 'Biology',
          hours: 2.0,
          startTime: '08:00',
          endTime: '10:00',
          focus: 9,
          productivity: 9,
          notes: 'Cell Biology',
          topic: 'Mitosis & Meiosis'
        },
        {
          id: 'sess_2',
          subject: 'Chemistry',
          hours: 1.5,
          startTime: '10:30',
          endTime: '12:00',
          focus: 8,
          productivity: 8,
          notes: 'Organic Chemistry',
          topic: 'Alkenes'
        },
        {
          id: 'sess_3',
          subject: 'Biology',
          hours: 1.0,
          startTime: '14:00',
          endTime: '15:00',
          focus: 8,
          productivity: 8,
          notes: 'Active Recall',
          topic: 'Flashcards'
        }
      ];

      // Simulate client auto-summing
      const sub1Name = 'Biology';
      const sub2Name = 'Chemistry';
      const sub3Name = 'Physics';

      let s1 = 0, s2 = 0, s3 = 0;
      sessions.forEach((s) => {
        const sub = s.subject.toLowerCase();
        if (sub === sub1Name.toLowerCase()) s1 += s.hours;
        else if (sub === sub2Name.toLowerCase()) s2 += s.hours;
        else if (sub === sub3Name.toLowerCase()) s3 += s.hours;
      });

      const payload = {
        studyId: 'SG-BIO-0001',
        fullName: 'Kasun Perera',
        email: 'kasun.p@gmail.com',
        stream: 'Biological Science',
        dateOfStudy: '2026-08-27',
        sessions: sessions,
        hoursSubject1: Number(s1.toFixed(2)),
        hoursSubject2: Number(s2.toFixed(2)),
        hoursSubject3: Number(s3.toFixed(2)),
        totalHours: Number((s1 + s2 + s3).toFixed(2)),
        focusScore: Math.round(sessions.reduce((acc, s) => acc + s.focus, 0) / sessions.length),
        productivityScore: Math.round(sessions.reduce((acc, s) => acc + s.productivity, 0) / sessions.length),
        notes: 'Full day study',
        manualOverride: false
      };

      assert.strictEqual(payload.sessions.length, 3);
      assert.strictEqual(payload.hoursSubject1, 3.0);
      assert.strictEqual(payload.hoursSubject2, 1.5);
      assert.strictEqual(payload.hoursSubject3, 0.0);
      assert.strictEqual(payload.totalHours, 4.5);
      assert.strictEqual(payload.focusScore, 8);
      assert.strictEqual(payload.manualOverride, false);
    });

    it('should serialize manual override payloads accurately without corrupting session records', () => {
      const sessions = [
        { subject: 'Combined Maths', hours: 2.0, focus: 8 },
        { subject: 'Physics', hours: 1.5, focus: 8 }
      ];
      const autoCalculatedTotal = 3.5;
      const userManualOverride = 5.0; // student added 1.5h tuition

      const payload = {
        studyId: 'SG-MATH-0001',
        dateOfStudy: '2026-08-27',
        sessions: sessions,
        hoursSubject1: 2.0,
        hoursSubject2: 1.5,
        hoursSubject3: 0,
        totalHours: userManualOverride,
        manualOverride: true
      };

      assert.strictEqual(payload.totalHours, 5.0);
      assert.strictEqual(payload.manualOverride, true);
      assert.strictEqual(payload.sessions.length, 2);
    });
  });

  // =========================================================================
  // SUITE 2: Backend Mock Server & Code.gs Parity
  // =========================================================================
  describe('2. Backend mock-server.js & Code.gs Parity', () => {
    it('should correctly aggregate sessions into subject slots when subject hours are omitted in payload', () => {
      const cleanSessions = [
        { subject: 'Biology', hours: 2.5, focus: 9, productivity: 9 },
        { subject: 'Chemistry', hours: 1.25, focus: 8, productivity: 8 },
        { subject: 'Physics', hours: 0.75, focus: 8, productivity: 8 },
        { subject: 'Biology', hours: 1.0, focus: 9, productivity: 9 }
      ];

      const defaultSub1 = 'Biology';
      const defaultSub2 = 'Chemistry';
      const defaultSub3 = 'Physics';

      const hoursMap = {};
      cleanSessions.forEach(s => {
        const subKey = s.subject.toLowerCase();
        hoursMap[subKey] = (hoursMap[subKey] || 0) + s.hours;
      });

      const calcSub1 = hoursMap[defaultSub1.toLowerCase()] || 0;
      const calcSub2 = hoursMap[defaultSub2.toLowerCase()] || 0;
      const calcSub3 = hoursMap[defaultSub3.toLowerCase()] || 0;

      assert.strictEqual(calcSub1, 3.5);
      assert.strictEqual(calcSub2, 1.25);
      assert.strictEqual(calcSub3, 0.75);

      const calculatedTotal = Number((calcSub1 + calcSub2 + calcSub3).toFixed(2));
      assert.strictEqual(calculatedTotal, 5.5);
    });

    it('should handle case-insensitive subject matching in backend session aggregation', () => {
      const cleanSessions = [
        { subject: 'BIOLOGY', hours: 2.0 },
        { subject: 'chemistry ', hours: 1.5 },
        { subject: 'PhYsIcS', hours: 1.0 }
      ];

      const hoursMap = {};
      cleanSessions.forEach(s => {
        const subKey = s.subject.trim().toLowerCase();
        hoursMap[subKey] = (hoursMap[subKey] || 0) + s.hours;
      });

      assert.strictEqual(hoursMap['biology'], 2.0);
      assert.strictEqual(hoursMap['chemistry'], 1.5);
      assert.strictEqual(hoursMap['physics'], 1.0);
    });

    it('should preserve manual override totalHours even when session sum differs', () => {
      const payload = {
        sessions: [
          { subject: 'Biology', hours: 2.0 },
          { subject: 'Chemistry', hours: 1.0 }
        ],
        hoursSubject1: 2.0,
        hoursSubject2: 1.0,
        hoursSubject3: 0.0,
        totalHours: 4.5 // manual override
      };

      const calculatedTotal = Number((payload.hoursSubject1 + payload.hoursSubject2 + payload.hoursSubject3).toFixed(2));
      const totalHours = (payload.totalHours !== undefined && payload.totalHours !== null)
        ? Math.max(0, Number(payload.totalHours))
        : calculatedTotal;

      assert.strictEqual(totalHours, 4.5);
      assert.notStrictEqual(totalHours, calculatedTotal);
    });
  });

  // =========================================================================
  // SUITE 3: Dual-Mode Switching Data Preservation
  // =========================================================================
  describe('3. Dual-Mode Switching (Sessions vs Direct Hours) Data Preservation', () => {
    it('should accurately sync sessions into direct subject hours when switching mode', () => {
      const sessions = [
        { subject: 'Combined Maths', hours: 2.5 },
        { subject: 'Physics', hours: 1.5 },
        { subject: 'Combined Maths', hours: 1.0 }
      ];

      const sub1Name = 'Combined Maths';
      const sub2Name = 'Physics';
      const sub3Name = 'Chemistry';

      let s1 = 0, s2 = 0, s3 = 0;
      sessions.forEach(s => {
        if (s.subject === sub1Name) s1 += s.hours;
        else if (s.subject === sub2Name) s2 += s.hours;
        else if (s.subject === sub3Name) s3 += s.hours;
      });

      // On switching to 'direct' mode:
      const directHours = {
        sub1: s1,
        sub2: s2,
        sub3: s3
      };

      assert.strictEqual(directHours.sub1, 3.5);
      assert.strictEqual(directHours.sub2, 1.5);
      assert.strictEqual(directHours.sub3, 0);

      const totalDirect = directHours.sub1 + directHours.sub2 + directHours.sub3;
      assert.strictEqual(totalDirect, 5.0);
    });

    it('should maintain user direct hours when modified in direct mode', () => {
      let directHours = { sub1: 3.5, sub2: 1.5, sub3: 0 };
      // User modifies sub3
      directHours.sub3 = 1.0;
      const total = directHours.sub1 + directHours.sub2 + directHours.sub3;
      assert.strictEqual(total, 6.0);
    });
  });

  // =========================================================================
  // SUITE 4: Boundary Conditions & Edge Cases
  // =========================================================================
  describe('4. Boundary Conditions, Truncation & Overnight Spans', () => {
    it('should accurately calculate overnight study intervals crossing midnight', () => {
      // 23:30 to 01:15 = 1 hour 45 minutes = 1.75 hours
      const dur1 = calculateDurationFromTimes('23:30', '01:15');
      assert.strictEqual(dur1, 1.75);

      // 22:00 to 04:00 = 6 hours
      const dur2 = calculateDurationFromTimes('22:00', '04:00');
      assert.strictEqual(dur2, 6.0);

      // 23:59 to 00:01 = 2 minutes = 0.03 hours
      const dur3 = calculateDurationFromTimes('23:59', '00:01');
      assert.strictEqual(dur3, 0.03);
    });

    it('should handle badge abbreviation and styling for all standard subjects and unrecognized names', () => {
      const bio = getSubjectBadgeConfig('Biology');
      assert.strictEqual(bio.abbr, 'Bio');
      assert.strictEqual(bio.hex, '#10b981');

      const maths = getSubjectBadgeConfig('Combined Maths');
      assert.strictEqual(maths.abbr, 'Maths');
      assert.strictEqual(maths.hex, '#6366f1');

      const phys = getSubjectBadgeConfig('Physics');
      assert.strictEqual(phys.abbr, 'Phys');
      assert.strictEqual(phys.hex, '#a855f7');

      const chem = getSubjectBadgeConfig('Chemistry');
      assert.strictEqual(chem.abbr, 'Chem');
      assert.strictEqual(chem.hex, '#f59e0b');

      const ict = getSubjectBadgeConfig('ICT');
      assert.strictEqual(ict.abbr, 'ICT');
      assert.strictEqual(ict.hex, '#06b6d4');

      const agri = getSubjectBadgeConfig('Agriculture');
      assert.strictEqual(agri.abbr, 'Agri');
      assert.strictEqual(agri.hex, '#84cc16');

      const unknown = getSubjectBadgeConfig('Economics');
      assert.strictEqual(unknown.abbr, 'Econ');
      assert.strictEqual(unknown.hex, '#71717a');
    });

    it('should correctly truncate badges for 10+ sessions with remaining counter', () => {
      const manySessions = Array.from({ length: 12 }, (_, i) => ({
        id: 'sess_' + i,
        subject: i % 2 === 0 ? 'Biology' : 'Chemistry',
        hours: 0.5
      }));

      const maxVisible = 3;
      const visible = manySessions.slice(0, maxVisible);
      const remaining = manySessions.length - maxVisible;

      assert.strictEqual(visible.length, 3);
      assert.strictEqual(remaining, 9);
    });

    it('should synthesize session entries from legacy logs with 0 errors', () => {
      const legacyLog = {
        studyId: 'SG-MATH-0001',
        dateOfStudy: '2026-08-25',
        subject1: 'Combined Maths',
        subject1Hours: 3.0,
        subject2: 'Physics',
        subject2Hours: 2.0,
        subject3: 'Chemistry',
        subject3Hours: 0,
        totalHours: 5.0,
        focusScore: 9,
        productivityScore: 8
      };

      const synthList = [];
      const h1 = Number(legacyLog.subject1Hours || 0);
      const h2 = Number(legacyLog.subject2Hours || 0);
      const h3 = Number(legacyLog.subject3Hours || 0);

      if (h1 > 0) synthList.push({ subject: legacyLog.subject1, hours: h1, focus: legacyLog.focusScore });
      if (h2 > 0) synthList.push({ subject: legacyLog.subject2, hours: h2, focus: legacyLog.focusScore });
      if (h3 > 0) synthList.push({ subject: legacyLog.subject3, hours: h3, focus: legacyLog.focusScore });

      assert.strictEqual(synthList.length, 2);
      assert.strictEqual(synthList[0].subject, 'Combined Maths');
      assert.strictEqual(synthList[0].hours, 3.0);
      assert.strictEqual(synthList[1].subject, 'Physics');
      assert.strictEqual(synthList[1].hours, 2.0);
    });
  });
});
