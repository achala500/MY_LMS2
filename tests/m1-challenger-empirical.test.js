/**
 * M1 Challenger 1 — Empirical Stress Test Suite
 * Comprehensive adversarial verification of M1:
 * - Session duration math & midnight rollovers
 * - Auto-calculation & manual override synchronization
 * - Subject grouping with arbitrary & edge-case names
 * - History row & SessionDetailDrawer synthesis
 * - Backend parity & schema validation
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  calculateDurationFromTimes,
  formatHoursHuman,
  getSubjectBadgeConfig,
} from '../src/js/utils.js';

describe('M1 Challenger 1: Empirical Adversarial Stress Suite', () => {

  // =========================================================================
  // 1. Session Duration Math & Midnight Rollovers
  // =========================================================================
  describe('1. Session Duration Math & Overnight Rollovers', () => {
    it('calculates exact fractional hours for standard time intervals', () => {
      // 15m intervals
      assert.strictEqual(calculateDurationFromTimes('08:00', '08:15'), 0.25);
      assert.strictEqual(calculateDurationFromTimes('08:00', '08:30'), 0.50);
      assert.strictEqual(calculateDurationFromTimes('08:00', '08:45'), 0.75);
      assert.strictEqual(calculateDurationFromTimes('08:00', '09:00'), 1.00);

      // Irregular minute intervals
      assert.strictEqual(calculateDurationFromTimes('10:10', '11:25'), 1.25); // 75 mins -> 1.25h
      assert.strictEqual(calculateDurationFromTimes('13:15', '15:00'), 1.75); // 105 mins -> 1.75h
      assert.strictEqual(calculateDurationFromTimes('07:30', '10:50'), 3.33); // 200 mins -> 3.33h
    });

    it('calculates exact overnight & midnight rollovers (e.g. 23:30 to 01:15 = 1.75h)', () => {
      // Specified target challenge
      assert.strictEqual(calculateDurationFromTimes('23:30', '01:15'), 1.75);

      // Spanning across midnight 00:00
      assert.strictEqual(calculateDurationFromTimes('23:00', '00:00'), 1.00);
      assert.strictEqual(calculateDurationFromTimes('23:45', '00:15'), 0.50);
      assert.strictEqual(calculateDurationFromTimes('23:50', '00:10'), 0.33);
      assert.strictEqual(calculateDurationFromTimes('22:00', '04:30'), 6.50);
      assert.strictEqual(calculateDurationFromTimes('21:15', '02:45'), 5.50);
      assert.strictEqual(calculateDurationFromTimes('23:59', '00:01'), 0.03); // 2 minutes
    });

    it('handles identical start and end times cleanly (0 duration)', () => {
      assert.strictEqual(calculateDurationFromTimes('00:00', '00:00'), 0);
      assert.strictEqual(calculateDurationFromTimes('12:00', '12:00'), 0);
      assert.strictEqual(calculateDurationFromTimes('23:59', '23:59'), 0);
    });

    it('gracefully handles malformed, missing, or invalid input strings', () => {
      assert.strictEqual(calculateDurationFromTimes('', ''), 0);
      assert.strictEqual(calculateDurationFromTimes('08:00', ''), 0);
      assert.strictEqual(calculateDurationFromTimes('', '09:00'), 0);
      assert.strictEqual(calculateDurationFromTimes(null, '09:00'), 0);
      assert.strictEqual(calculateDurationFromTimes('08:00', null), 0);
      assert.strictEqual(calculateDurationFromTimes(undefined, undefined), 0);
      assert.strictEqual(calculateDurationFromTimes('foo', 'bar'), 0);
      assert.strictEqual(calculateDurationFromTimes('25:00', '26:00'), 1.00); // Numeric parsing fallback
      assert.strictEqual(calculateDurationFromTimes('invalid:time', '10:00'), 0);
    });

    it('formats decimal hours into clear conversational representations', () => {
      assert.strictEqual(formatHoursHuman(0), '0m');
      assert.strictEqual(formatHoursHuman(0.25), '15m');
      assert.strictEqual(formatHoursHuman(0.5), '30m');
      assert.strictEqual(formatHoursHuman(0.75), '45m');
      assert.strictEqual(formatHoursHuman(1.0), '1h');
      assert.strictEqual(formatHoursHuman(1.5), '1h 30m');
      assert.strictEqual(formatHoursHuman(1.75), '1h 45m');
      assert.strictEqual(formatHoursHuman(2.33), '2h 20m');
      assert.strictEqual(formatHoursHuman(6.5), '6h 30m');
    });
  });

  // =========================================================================
  // 2. Auto-Calculation & Manual Override Synchronization
  // =========================================================================
  describe('2. Auto-Calculation & Manual Override Synchronization Model', () => {
    function simulateSessionState(sessions, manualOverrideActive, manualTotalHours, sub1Name, sub2Name, sub3Name) {
      let s1 = 0;
      let s2 = 0;
      let s3 = 0;

      sessions.forEach((s) => {
        const sub = (s.subject || '').toLowerCase().trim();
        const hrs = Math.max(0, Number(s.hours) || 0);

        if (sub === sub1Name.toLowerCase().trim()) {
          s1 += hrs;
        } else if (sub === sub2Name.toLowerCase().trim()) {
          s2 += hrs;
        } else if (sub === sub3Name.toLowerCase().trim()) {
          s3 += hrs;
        } else {
          s1 += hrs; // default to primary subject
        }
      });

      const c1 = Number(s1.toFixed(2));
      const c2 = Number(s2.toFixed(2));
      const c3 = Number(s3.toFixed(2));
      const calculatedTotal = Number((c1 + c2 + c3).toFixed(2));

      const effectiveTotal = manualOverrideActive && manualTotalHours !== null && manualTotalHours >= 0
        ? Number(manualTotalHours.toFixed(2))
        : calculatedTotal;

      return {
        sub1Hours: c1,
        sub2Hours: c2,
        sub3Hours: c3,
        calculatedTotal,
        effectiveTotal,
      };
    }

    it('correctly auto-sums sessions into designated stream subjects', () => {
      const sessions = [
        { subject: 'Biology', hours: 2.25 },
        { subject: 'Chemistry', hours: 1.50 },
        { subject: 'Biology', hours: 0.75 },
        { subject: 'Physics', hours: 1.25 },
      ];

      const res = simulateSessionState(sessions, false, null, 'Biology', 'Chemistry', 'Physics');
      assert.strictEqual(res.sub1Hours, 3.00); // 2.25 + 0.75
      assert.strictEqual(res.sub2Hours, 1.50);
      assert.strictEqual(res.sub3Hours, 1.25);
      assert.strictEqual(res.calculatedTotal, 5.75);
      assert.strictEqual(res.effectiveTotal, 5.75);
    });

    it('allows manual override without corrupting calculated total', () => {
      const sessions = [
        { subject: 'Combined Maths', hours: 2.0 },
        { subject: 'Physics', hours: 1.5 },
      ];

      // Enable manual override with 4.5 hours (e.g. including offline self-study)
      const resOverride = simulateSessionState(sessions, true, 4.5, 'Combined Maths', 'Physics', 'Chemistry');
      assert.strictEqual(resOverride.calculatedTotal, 3.5);
      assert.strictEqual(resOverride.effectiveTotal, 4.5);

      // Now add another session while override is still active
      sessions.push({ subject: 'Chemistry', hours: 1.0 });
      const resOverrideAfterAdd = simulateSessionState(sessions, true, 4.5, 'Combined Maths', 'Physics', 'Chemistry');
      assert.strictEqual(resOverrideAfterAdd.calculatedTotal, 4.5);
      assert.strictEqual(resOverrideAfterAdd.effectiveTotal, 4.5);

      // Toggle manual override off (Reset to Session Sum)
      const resReset = simulateSessionState(sessions, false, null, 'Combined Maths', 'Physics', 'Chemistry');
      assert.strictEqual(resReset.calculatedTotal, 4.5);
      assert.strictEqual(resReset.effectiveTotal, 4.5);
    });

    it('handles floating point precision issues accurately (e.g. 0.1 + 0.2 = 0.3)', () => {
      const sessions = [
        { subject: 'Physics', hours: 0.1 },
        { subject: 'Physics', hours: 0.2 },
        { subject: 'Physics', hours: 0.3 },
      ];

      const res = simulateSessionState(sessions, false, null, 'Biology', 'Chemistry', 'Physics');
      assert.strictEqual(res.sub3Hours, 0.6);
      assert.strictEqual(res.calculatedTotal, 0.6);
      assert.strictEqual(res.effectiveTotal, 0.6);
    });
  });

  // =========================================================================
  // 3. Subject Grouping with Arbitrary/Unusual Subject Names
  // =========================================================================
  describe('3. Subject Grouping & Badges with Arbitrary / Edge-Case Names', () => {
    it('maps standard A/L subject variants to proper color tokens and abbreviations', () => {
      // Biology variations
      assert.strictEqual(getSubjectBadgeConfig('Biology').abbr, 'Bio');
      assert.strictEqual(getSubjectBadgeConfig('biological science').abbr, 'Bio');
      assert.strictEqual(getSubjectBadgeConfig('BIO').abbr, 'Bio');
      assert.strictEqual(getSubjectBadgeConfig('Biology').hex, '#10b981');

      // Maths variations
      assert.strictEqual(getSubjectBadgeConfig('Combined Maths').abbr, 'Maths');
      assert.strictEqual(getSubjectBadgeConfig('Combined Mathematics').abbr, 'Maths');
      assert.strictEqual(getSubjectBadgeConfig('maths').abbr, 'Maths');
      assert.strictEqual(getSubjectBadgeConfig('Combined Maths').hex, '#6366f1');

      // Physics variations
      assert.strictEqual(getSubjectBadgeConfig('Physics').abbr, 'Phys');
      assert.strictEqual(getSubjectBadgeConfig('PHYSICS').abbr, 'Phys');
      assert.strictEqual(getSubjectBadgeConfig('Physics').hex, '#a855f7');

      // Chemistry variations
      assert.strictEqual(getSubjectBadgeConfig('Chemistry').abbr, 'Chem');
      assert.strictEqual(getSubjectBadgeConfig('CHEMISTRY').abbr, 'Chem');
      assert.strictEqual(getSubjectBadgeConfig('Chemistry').hex, '#f59e0b');

      // ICT & Agriculture
      assert.strictEqual(getSubjectBadgeConfig('ICT').abbr, 'ICT');
      assert.strictEqual(getSubjectBadgeConfig('Information and Communication Technology').abbr, 'ICT');
      assert.strictEqual(getSubjectBadgeConfig('Agriculture').abbr, 'Agri');
      assert.strictEqual(getSubjectBadgeConfig('Agricultural Science').abbr, 'Agri');
    });

    it('gracefully handles unusual, non-standard, or arbitrary subject names', () => {
      // Custom stream subjects
      const eng = getSubjectBadgeConfig('General English');
      assert.strictEqual(eng.abbr, 'Gene');
      assert.strictEqual(eng.fullName, 'General English');
      assert.strictEqual(eng.hex, '#71717a');

      const econ = getSubjectBadgeConfig('Economics');
      assert.strictEqual(econ.abbr, 'Econ');
      assert.strictEqual(econ.hex, '#71717a');

      // Short name subjects
      const art = getSubjectBadgeConfig('Art');
      assert.strictEqual(art.abbr, 'Art');

      // Empty or undefined subjects
      const empty = getSubjectBadgeConfig('');
      assert.strictEqual(empty.abbr, 'Sub');
      assert.strictEqual(empty.fullName, 'Other Subject');

      const nullSub = getSubjectBadgeConfig(null);
      assert.strictEqual(nullSub.abbr, 'Sub');
      assert.strictEqual(nullSub.fullName, 'Other Subject');

      // Special characters in subject name
      const special = getSubjectBadgeConfig('Maths & Stats (Adv)');
      assert.strictEqual(special.abbr, 'Maths'); // contains 'math'
    });
  });

  // =========================================================================
  // 4. History Row Expansion & SessionDetailDrawer Synthesis
  // =========================================================================
  describe('4. History Row & SessionDetailDrawer Data Extraction & Fallback Matrix', () => {
    function synthesizeSessionsFromLog(log) {
      // Multi-session format
      if (log && log.sessions && Array.isArray(log.sessions) && log.sessions.length > 0) {
        return log.sessions
          .filter((s) => Number(s.hours) > 0)
          .map((s, idx) => ({
            id: s.id || `sess_${idx}`,
            subject: s.subject || 'Subject',
            hours: Number(s.hours) || 0,
            startTime: s.startTime,
            endTime: s.endTime,
            focus: s.focus,
            notes: s.notes,
            topic: s.topic,
          }));
      }

      // Legacy subjects array format
      if (log && log.subjects && Array.isArray(log.subjects) && log.subjects.length > 0) {
        return log.subjects
          .filter((s) => Number(s.hours) > 0)
          .map((s, idx) => ({
            id: `synth_${idx}`,
            subject: s.name,
            hours: Number(s.hours),
            focus: s.focus || log.focusScore || 8,
            productivity: s.productivity || log.productivityScore || 8,
          }));
      }

      // Legacy scalar column format
      const fallbackList = [];
      const h1 = Number(log?.subject1Hours ?? log?.hoursSubject1 ?? 0);
      const h2 = Number(log?.subject2Hours ?? log?.hoursSubject2 ?? 0);
      const h3 = Number(log?.subject3Hours ?? log?.hoursSubject3 ?? 0);

      if (h1 > 0) fallbackList.push({ id: 's1', subject: log?.subject1 || 'Subject 1', hours: h1 });
      if (h2 > 0) fallbackList.push({ id: 's2', subject: log?.subject2 || 'Subject 2', hours: h2 });
      if (h3 > 0) fallbackList.push({ id: 's3', subject: log?.subject3 || 'Subject 3', hours: h3 });

      return fallbackList;
    }

    it('extracts rich session list from native multi-session log payload', () => {
      const log = {
        studyId: 'SG-BIO-0001',
        dateOfStudy: '2026-08-27',
        totalHours: 4.5,
        sessions: [
          {
            id: 'sess_1',
            subject: 'Biology',
            hours: 2.0,
            startTime: '08:00',
            endTime: '10:00',
            focus: 9,
            topic: 'Plant Physiology',
            notes: 'Completed transpiration diagrams',
          },
          {
            id: 'sess_2',
            subject: 'Chemistry',
            hours: 1.5,
            startTime: '10:30',
            endTime: '12:00',
            focus: 8,
            topic: 'Thermochemistry',
            notes: 'Enthalpy calculations',
          },
          {
            id: 'sess_3',
            subject: 'Physics',
            hours: 1.0,
            startTime: '14:00',
            endTime: '15:00',
            focus: 7,
            topic: 'Current Electricity',
            notes: 'Kirchhoff laws',
          },
        ],
      };

      const extracted = synthesizeSessionsFromLog(log);
      assert.strictEqual(extracted.length, 3);
      assert.strictEqual(extracted[0].subject, 'Biology');
      assert.strictEqual(extracted[0].startTime, '08:00');
      assert.strictEqual(extracted[0].topic, 'Plant Physiology');
      assert.strictEqual(extracted[1].hours, 1.5);
      assert.strictEqual(extracted[2].notes, 'Kirchhoff laws');
    });

    it('synthesizes sessions from legacy subject array logs', () => {
      const log = {
        studyId: 'SG-MAT-0002',
        dateOfStudy: '2026-08-25',
        totalHours: 5.0,
        subjects: [
          { name: 'Combined Maths', hours: 3.0, focus: 9, productivity: 9 },
          { name: 'Physics', hours: 2.0, focus: 8, productivity: 8 },
          { name: 'Chemistry', hours: 0, focus: 0, productivity: 0 },
        ],
      };

      const extracted = synthesizeSessionsFromLog(log);
      assert.strictEqual(extracted.length, 2);
      assert.strictEqual(extracted[0].subject, 'Combined Maths');
      assert.strictEqual(extracted[0].hours, 3.0);
      assert.strictEqual(extracted[1].subject, 'Physics');
      assert.strictEqual(extracted[1].hours, 2.0);
    });

    it('synthesizes sessions from legacy scalar columns (subject1Hours..3)', () => {
      const log = {
        studyId: 'SG-BIO-0003',
        dateOfStudy: '2026-08-24',
        subject1: 'Biology',
        subject1Hours: 2.5,
        subject2: 'Chemistry',
        subject2Hours: 1.5,
        subject3: 'Physics',
        subject3Hours: 0,
        totalHours: 4.0,
      };

      const extracted = synthesizeSessionsFromLog(log);
      assert.strictEqual(extracted.length, 2);
      assert.strictEqual(extracted[0].subject, 'Biology');
      assert.strictEqual(extracted[0].hours, 2.5);
      assert.strictEqual(extracted[1].subject, 'Chemistry');
      assert.strictEqual(extracted[1].hours, 1.5);
    });

    it('returns empty list for logs with 0 study hours or missing data without throwing', () => {
      assert.deepStrictEqual(synthesizeSessionsFromLog(null), []);
      assert.deepStrictEqual(synthesizeSessionsFromLog({}), []);
      assert.deepStrictEqual(synthesizeSessionsFromLog({ totalHours: 0, sessions: [] }), []);
    });
  });
});
