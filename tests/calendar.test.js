/**
 * Calendar Utilities and Smart AI Weekly Schedule Tests
 *
 * Tests src/lib/calendar.ts:
 * - generateSmartAiWeeklySchedule
 * - generateGoogleCalendarUrl
 * - generateIcsCalendar
 * - parseIcsContent
 * - getExamCountdown
 * - getStreamSubjectNames
 * - DEFAULT_SUBJECT_COLORS & GCAL_COLORS
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

const PROJECT_ROOT = path.resolve('.');
const LIB_DIR = path.join(PROJECT_ROOT, 'src', 'lib');
const STORAGE_DIR = path.join(LIB_DIR, 'storage');
const CACHE_DIR = path.join(PROJECT_ROOT, 'node_modules', '.cache', 'calendar-test');

if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

// Transpile safeStorage.ts first
const safeStorageCode = fs.readFileSync(path.join(STORAGE_DIR, 'safeStorage.ts'), 'utf-8');
const safeStorageTranspiled = ts.transpileModule(safeStorageCode, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 }
}).outputText;
fs.writeFileSync(path.join(CACHE_DIR, 'safeStorage.js'), safeStorageTranspiled, 'utf-8');

// Transpile calendar.ts
let calendarCode = fs.readFileSync(path.join(LIB_DIR, 'calendar.ts'), 'utf-8');
// Fix relative import of safeStorage
calendarCode = calendarCode.replace('./storage/safeStorage', './safeStorage.js');
const calendarTranspiled = ts.transpileModule(calendarCode, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 }
}).outputText;
fs.writeFileSync(path.join(CACHE_DIR, 'calendar.js'), calendarTranspiled, 'utf-8');

// Import calendar module dynamically
const calendarUrl = pathToFileURL(path.join(CACHE_DIR, 'calendar.js')).href;
const calendarModule = await import(calendarUrl);

const {
  generateSmartAiWeeklySchedule,
  generateGoogleCalendarUrl,
  generateIcsCalendar,
  parseIcsContent,
  getExamCountdown,
  getStreamSubjectNames,
  DEFAULT_SUBJECT_COLORS,
  GCAL_COLORS,
} = calendarModule;

describe('Calendar Module & Smart AI Schedule Suite', () => {

  // =========================================================================
  // 1. generateSmartAiWeeklySchedule Functionality
  // =========================================================================
  describe('generateSmartAiWeeklySchedule', () => {
    it('returns an array of 21 study events for a 7-day week (3 events per day)', () => {
      const schedule = generateSmartAiWeeklySchedule('Biological Science', 'Biology', 'Chemistry', 'Physics');
      assert.ok(Array.isArray(schedule), 'Schedule must be an array');
      assert.strictEqual(schedule.length, 21, 'Must generate exactly 21 study blocks for a week');
    });

    it('assigns subjects accurately across the weekly slot matrix', () => {
      const sub1 = 'Biology';
      const sub2 = 'Chemistry';
      const sub3 = 'Physics';
      const schedule = generateSmartAiWeeklySchedule('Biological Science', sub1, sub2, sub3);

      // Mon (dayOffset 0): slot 0 -> sub1, slot 1 -> sub2, slot 2 -> sub3
      assert.strictEqual(schedule[0].subject, sub1);
      assert.strictEqual(schedule[1].subject, sub2);
      assert.strictEqual(schedule[2].subject, sub3);

      // Tue (dayOffset 1): slot 3 -> sub2, slot 4 -> sub3, slot 5 -> sub1
      assert.strictEqual(schedule[3].subject, sub2);
      assert.strictEqual(schedule[4].subject, sub3);
      assert.strictEqual(schedule[5].subject, sub1);

      // Wed (dayOffset 2): slot 6 -> sub3, slot 7 -> sub1, slot 8 -> sub2
      assert.strictEqual(schedule[6].subject, sub3);
      assert.strictEqual(schedule[7].subject, sub1);
      assert.strictEqual(schedule[8].subject, sub2);

      // Thu (dayOffset 3): slot 9 -> sub1, slot 10 -> sub2, slot 11 -> sub3
      assert.strictEqual(schedule[9].subject, sub1);
      assert.strictEqual(schedule[10].subject, sub2);
      assert.strictEqual(schedule[11].subject, sub3);

      // Fri (dayOffset 4): slot 12 -> sub2, slot 13 -> sub3, slot 14 -> sub1
      assert.strictEqual(schedule[12].subject, sub2);
      assert.strictEqual(schedule[13].subject, sub3);
      assert.strictEqual(schedule[14].subject, sub1);

      // Sat (dayOffset 5): slot 15 -> sub3, slot 16 -> sub1, slot 17 -> sub2
      assert.strictEqual(schedule[15].subject, sub3);
      assert.strictEqual(schedule[16].subject, sub1);
      assert.strictEqual(schedule[17].subject, sub2);

      // Sun (dayOffset 6): slot 18 -> sub1, slot 19 -> sub2, slot 20 -> sub3
      assert.strictEqual(schedule[18].subject, sub1);
      assert.strictEqual(schedule[19].subject, sub2);
      assert.strictEqual(schedule[20].subject, sub3);
    });

    it('calculates consecutive date strings in YYYY-MM-DD format starting from Monday of current week', () => {
      const schedule = generateSmartAiWeeklySchedule('Physical Science', 'Combined Maths', 'Physics', 'ICT');
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

      schedule.forEach((event, idx) => {
        assert.ok(dateRegex.test(event.date), `Event ${idx} date "${event.date}" must match YYYY-MM-DD`);
      });

      // Verify that day offsets increase monotonically by day (3 events per day)
      for (let day = 0; day < 7; day++) {
        const dayEvents = schedule.slice(day * 3, (day + 1) * 3);
        const dayDate = dayEvents[0].date;
        assert.strictEqual(dayEvents[1].date, dayDate, `Slot 1 on day ${day} must match day date`);
        assert.strictEqual(dayEvents[2].date, dayDate, `Slot 2 on day ${day} must match day date`);

        if (day > 0) {
          const prevDate = new Date(schedule[(day - 1) * 3].date);
          const currDate = new Date(dayDate);
          const diffDays = Math.round((currDate - prevDate) / (1000 * 60 * 60 * 24));
          assert.strictEqual(diffDays, 1, `Day ${day} date should be exactly 1 day after day ${day - 1}`);
        }
      }
    });

    it('calculates total weekly study hours equal to 48.5 hours based on slot durations', () => {
      const schedule = generateSmartAiWeeklySchedule('Physical Science', 'Combined Maths', 'Physics', 'Chemistry');
      const totalHours = schedule.reduce((sum, ev) => sum + ev.durationHours, 0);
      assert.strictEqual(totalHours, 48.5, 'Total schedule hours should equal 48.5');
    });

    it('assigns custom subject hex colors from DEFAULT_SUBJECT_COLORS for recognized subjects', () => {
      const schedule = generateSmartAiWeeklySchedule('Biological Science', 'Biology', 'Chemistry', 'Agriculture');

      const bioEvents = schedule.filter(e => e.subject === 'Biology');
      const chemEvents = schedule.filter(e => e.subject === 'Chemistry');
      const agriEvents = schedule.filter(e => e.subject === 'Agriculture');

      assert.strictEqual(bioEvents[0].color, DEFAULT_SUBJECT_COLORS['Biology']); // #0b8043
      assert.strictEqual(chemEvents[0].color, DEFAULT_SUBJECT_COLORS['Chemistry']); // #8e24aa
      assert.strictEqual(agriEvents[0].color, DEFAULT_SUBJECT_COLORS['Agriculture']); // #33b679
    });

    it('falls back to GCAL_COLORS palette hex for unrecognized or custom subjects', () => {
      const customSub1 = 'Geology';
      const customSub2 = 'Logic';
      const customSub3 = 'Statistics';
      const schedule = generateSmartAiWeeklySchedule('Arts', customSub1, customSub2, customSub3);

      schedule.forEach((event, idx) => {
        const expectedColor = DEFAULT_SUBJECT_COLORS[event.subject] || GCAL_COLORS[idx % GCAL_COLORS.length].hex;
        assert.strictEqual(event.color, expectedColor);
      });
    });

    it('populates all required CalendarStudyEvent properties with valid types and formats', () => {
      const schedule = generateSmartAiWeeklySchedule('Biological Science', 'Biology', 'Chemistry', 'Physics');

      schedule.forEach((ev, idx) => {
        assert.ok(ev.id.startsWith('ai_sched_'), 'ID must start with ai_sched_');
        assert.strictEqual(typeof ev.title, 'string');
        assert.ok(ev.title.includes(ev.subject), 'Title must include subject name');
        assert.strictEqual(ev.type, 'study');
        assert.ok(ev.startTime.match(/^\d{2}:\d{2}$/), 'startTime must be HH:mm');
        assert.ok(ev.endTime.match(/^\d{2}:\d{2}$/), 'endTime must be HH:mm');
        assert.ok(ev.durationHours > 0, 'durationHours must be positive');
        assert.strictEqual(typeof ev.color, 'string');
        assert.ok(ev.color.startsWith('#'), 'color must be a hex string');
        assert.ok(typeof ev.topic === 'string' && ev.topic.length > 0, 'topic must be non-empty string');
        assert.ok(ev.notes.includes(ev.subject), 'notes must reference subject');
        assert.ok(ev.studyRoomUrl.startsWith('https://meet.jit.si/studysync-'), 'studyRoomUrl must be Jitsi URL');
      });
    });
  });

  // =========================================================================
  // 2. generateGoogleCalendarUrl
  // =========================================================================
  describe('generateGoogleCalendarUrl', () => {
    it('generates valid Google Calendar render TEMPLATE URL', () => {
      const event = {
        id: 'test_1',
        title: 'Biology: Cell Division',
        subject: 'Biology',
        date: '2026-08-26',
        startTime: '08:30',
        endTime: '11:00',
        durationHours: 2.5,
        type: 'study',
        color: '#0b8043',
        topic: 'Cell Division',
        notes: 'Review past paper questions',
        studyRoomUrl: 'https://meet.jit.si/studysync-biology-0'
      };

      const url = generateGoogleCalendarUrl(event);
      assert.ok(url.startsWith('https://calendar.google.com/calendar/render?action=TEMPLATE'));
      assert.ok(url.includes('text=' + encodeURIComponent(event.title)));
      assert.ok(url.includes('dates=20260826T083000/20260826T110000'));
      assert.ok(url.includes(encodeURIComponent('StudySync Sri Lanka')));
    });

    it('handles missing startTime, endTime, and optional fields with defaults', () => {
      const event = {
        id: 'test_2',
        title: '',
        subject: 'Chemistry',
        date: '2026-09-01',
        startTime: '',
        endTime: '',
        durationHours: 2.0,
        type: 'study',
        color: '#8e24aa',
      };

      const url = generateGoogleCalendarUrl(event);
      assert.ok(url.includes('text=' + encodeURIComponent('StudySync: Chemistry')));
      assert.ok(url.includes('dates=20260901T080000/20260901T100000'));
    });
  });

  // =========================================================================
  // 3. generateIcsCalendar
  // =========================================================================
  describe('generateIcsCalendar', () => {
    it('generates valid RFC 5545 iCalendar string for study events', () => {
      const events = [
        {
          id: 'ev_101',
          title: 'Physics Mechanics',
          subject: 'Physics',
          date: '2026-08-26',
          startTime: '08:30',
          endTime: '11:00',
          durationHours: 2.5,
          type: 'study',
          color: '#039be5',
          topic: 'Mechanics',
          notes: 'Solve 10 problems',
          studyRoomUrl: 'https://meet.jit.si/studysync-physics-0'
        }
      ];

      const ics = generateIcsCalendar(events, 'My Custom Calendar');
      assert.ok(ics.startsWith('BEGIN:VCALENDAR'));
      assert.ok(ics.includes('VERSION:2.0'));
      assert.ok(ics.includes('X-WR-CALNAME:My Custom Calendar'));
      assert.ok(ics.includes('BEGIN:VEVENT'));
      assert.ok(ics.includes('UID:ev_101@studysync.app'));
      assert.ok(ics.includes('DTSTART;TZID=Asia/Colombo:20260826T083000'));
      assert.ok(ics.includes('DTEND;TZID=Asia/Colombo:20260826T110000'));
      assert.ok(ics.includes('SUMMARY:Physics Mechanics'));
      assert.ok(ics.includes('DESCRIPTION:Mechanics - Solve 10 problems'));
      assert.ok(ics.includes('URL:https://meet.jit.si/studysync-physics-0'));
      assert.ok(ics.endsWith('END:VCALENDAR'));
    });
  });

  // =========================================================================
  // 4. parseIcsContent
  // =========================================================================
  describe('parseIcsContent', () => {
    it('parses imported iCalendar VEVENT blocks into structured study event objects', () => {
      const sampleIcs = [
        'BEGIN:VCALENDAR',
        'BEGIN:VEVENT',
        'SUMMARY:Bio Essay Prep',
        'DTSTART;TZID=Asia/Colombo:20260826T083000',
        'DTEND;TZID=Asia/Colombo:20260826T103000',
        'DESCRIPTION:Genetics chapter review',
        'END:VEVENT',
        'BEGIN:VEVENT',
        'SUMMARY:Chem Organic Reactions',
        'DTSTART:20260827T140000',
        'DTEND:20260827T160000',
        'DESCRIPTION:Inorganic revision',
        'END:VEVENT',
        'END:VCALENDAR'
      ].join('\r\n');

      const parsed = parseIcsContent(sampleIcs);
      assert.strictEqual(parsed.length, 2);

      assert.strictEqual(parsed[0].title, 'Bio Essay Prep');
      assert.strictEqual(parsed[0].subject, 'Biology');
      assert.strictEqual(parsed[0].date, '2026-08-26');
      assert.strictEqual(parsed[0].startTime, '08:30');
      assert.strictEqual(parsed[0].endTime, '10:30');
      assert.strictEqual(parsed[0].notes, 'Genetics chapter review');

      assert.strictEqual(parsed[1].title, 'Chem Organic Reactions');
      assert.strictEqual(parsed[1].subject, 'Chemistry');
      assert.strictEqual(parsed[1].date, '2026-08-27');
      assert.strictEqual(parsed[1].startTime, '14:00');
      assert.strictEqual(parsed[1].endTime, '16:00');
    });
  });

  // =========================================================================
  // 5. getExamCountdown
  // =========================================================================
  describe('getExamCountdown', () => {
    it('calculates exam countdown metrics for given target exam year', () => {
      const countdown = getExamCountdown('2026');
      assert.strictEqual(countdown.targetYear, '2026');
      assert.strictEqual(countdown.examName, 'G.C.E. A/L 2026 Examination');
      assert.strictEqual(typeof countdown.daysRemaining, 'number');
      assert.strictEqual(typeof countdown.weeksRemaining, 'number');
      assert.strictEqual(typeof countdown.hoursRemaining, 'number');
      assert.strictEqual(typeof countdown.formattedDate, 'string');
      assert.strictEqual(typeof countdown.isCompleted, 'boolean');
    });

    it('respects overrideDateStr parameter when provided', () => {
      const override = '2028-12-01T08:30:00+05:30';
      const countdown = getExamCountdown('2028', override);
      assert.strictEqual(countdown.targetDate.getFullYear(), 2028);
      assert.strictEqual(countdown.targetDate.getMonth(), 11); // December (0-indexed 11)
      assert.strictEqual(countdown.targetDate.getDate(), 1);
    });
  });

  // =========================================================================
  // 6. getStreamSubjectNames
  // =========================================================================
  describe('getStreamSubjectNames', () => {
    it('returns Biological Science default and custom optional subjects', () => {
      const defaultBio = getStreamSubjectNames('Biological Science');
      assert.deepStrictEqual(defaultBio, ['Biology', 'Chemistry', 'Physics']);

      const agriBio = getStreamSubjectNames('Biological Science', 'Agriculture');
      assert.deepStrictEqual(agriBio, ['Biology', 'Chemistry', 'Agriculture']);
    });

    it('returns Physical Science default and custom optional subjects', () => {
      const defaultMaths = getStreamSubjectNames('Physical Science');
      assert.deepStrictEqual(defaultMaths, ['Combined Maths', 'Physics', 'Chemistry']);

      const ictMaths = getStreamSubjectNames('Physical Science', 'ICT');
      assert.deepStrictEqual(ictMaths, ['Combined Maths', 'Physics', 'ICT']);
    });
  });

});
