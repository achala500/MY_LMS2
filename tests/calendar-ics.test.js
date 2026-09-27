/**
 * StudySync Calendar & ICS Parser Test Suite
 *
 * Comprehensive unit and boundary tests for parseIcsContent
 * in src/lib/calendar.ts.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

// Transpile src/lib/calendar.ts dynamically into cache so Node ESM resolves relative imports cleanly
const CACHE_DIR = path.join(process.cwd(), 'node_modules', '.cache', 'calendar-test');
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

// Transpile safeStorage.ts
const safeStorageCode = fs.readFileSync(path.join(process.cwd(), 'src', 'lib', 'storage', 'safeStorage.ts'), 'utf-8');
const transpiledSafeStorage = ts.transpileModule(safeStorageCode, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 }
}).outputText;
fs.writeFileSync(path.join(CACHE_DIR, 'safeStorage.js'), transpiledSafeStorage, 'utf-8');

// Transpile calendar.ts
let calendarCode = fs.readFileSync(path.join(process.cwd(), 'src', 'lib', 'calendar.ts'), 'utf-8');
calendarCode = calendarCode.replace(/from\s+['"]\.\/storage\/safeStorage['"]/g, "from './safeStorage.js'");
const transpiledCalendar = ts.transpileModule(calendarCode, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 }
}).outputText;
const calendarJsPath = path.join(CACHE_DIR, 'calendar.js');
fs.writeFileSync(calendarJsPath, transpiledCalendar, 'utf-8');

const { parseIcsContent, generateIcsCalendar } = await import(pathToFileURL(calendarJsPath).href);

test('parseIcsContent: Happy Path Event Parsing', async (t) => {
  await t.test('parses a single valid VEVENT with all fields', () => {
    const icsText = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      'SUMMARY:Bio Cellular Respiration Session',
      'DTSTART;TZID=Asia/Colombo:20260826T083000',
      'DTEND;TZID=Asia/Colombo:20260826T103000',
      'DESCRIPTION:Deep dive into mitochondria and ATP synthesis',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const events = parseIcsContent(icsText);
    assert.equal(events.length, 1);

    const ev = events[0];
    assert.ok(ev.id.startsWith('import_'));
    assert.equal(ev.title, 'Bio Cellular Respiration Session');
    assert.equal(ev.subject, 'Biology');
    assert.equal(ev.date, '2026-08-26');
    assert.equal(ev.startTime, '08:30');
    assert.equal(ev.endTime, '10:30');
    assert.equal(ev.durationHours, 2.0);
    assert.equal(ev.type, 'study');
    assert.equal(ev.color, '#039be5');
    assert.equal(ev.notes, 'Deep dive into mitochondria and ATP synthesis');
  });

  await t.test('parses multiple VEVENT blocks in order with distinct IDs', () => {
    const icsText = [
      'BEGIN:VCALENDAR',
      'BEGIN:VEVENT',
      'SUMMARY:Chem Organic Reactions',
      'DTSTART:20260901T090000',
      'DTEND:20260901T110000',
      'END:VEVENT',
      'BEGIN:VEVENT',
      'SUMMARY:Phys Mechanics Vectors',
      'DTSTART:20260902T140000',
      'DTEND:20260902T160000',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\n');

    const events = parseIcsContent(icsText);
    assert.equal(events.length, 2);

    assert.equal(events[0].title, 'Chem Organic Reactions');
    assert.equal(events[0].subject, 'Chemistry');
    assert.equal(events[0].date, '2026-09-01');
    assert.equal(events[0].startTime, '09:00');
    assert.equal(events[0].endTime, '11:00');

    assert.equal(events[1].title, 'Phys Mechanics Vectors');
    assert.equal(events[1].subject, 'Physics');
    assert.equal(events[1].date, '2026-09-02');
    assert.equal(events[1].startTime, '14:00');
    assert.equal(events[1].endTime, '16:00');

    assert.notEqual(events[0].id, events[1].id);
  });
});

test('parseIcsContent: Subject Classification Engine', async (t) => {
  const testCases = [
    { summary: 'Bio Unit 1 Revision', expectedSubject: 'Biology' },
    { summary: 'Advanced Chem Lab Practice', expectedSubject: 'Chemistry' },
    { summary: 'Combined Math Calculus Drill', expectedSubject: 'Combined Maths' },
    { summary: 'Phys Electromagnetism Past Paper', expectedSubject: 'Physics' },
    { summary: 'General Knowledge & Essay Writing', expectedSubject: 'General Study' },
    { summary: 'Biochemistry Joint Session', expectedSubject: 'Biology' }, // 'Bio' substring takes priority in if-else chain
  ];

  for (const tc of testCases) {
    await t.test(`classifies "${tc.summary}" -> ${tc.expectedSubject}`, () => {
      const ics = `BEGIN:VEVENT\nSUMMARY:${tc.summary}\nDTSTART:20261010T080000\nEND:VEVENT`;
      const events = parseIcsContent(ics);
      assert.equal(events.length, 1);
      assert.equal(events[0].subject, tc.expectedSubject);
    });
  }
});

test('parseIcsContent: Optional Fields and Defaults', async (t) => {
  await t.test('applies default endTime = "10:00" when DTEND is missing', () => {
    const icsText = [
      'BEGIN:VEVENT',
      'SUMMARY:Math Integration Quiz',
      'DTSTART:20260815T083000',
      'END:VEVENT',
    ].join('\n');

    const events = parseIcsContent(icsText);
    assert.equal(events.length, 1);
    assert.equal(events[0].startTime, '08:30');
    assert.equal(events[0].endTime, '10:00');
  });

  await t.test('applies default notes when DESCRIPTION is missing', () => {
    const icsText = [
      'BEGIN:VEVENT',
      'SUMMARY:Phys Wave Optics',
      'DTSTART:20260820T100000',
      'END:VEVENT',
    ].join('\n');

    const events = parseIcsContent(icsText);
    assert.equal(events.length, 1);
    assert.equal(events[0].notes, 'Imported Google Calendar Event');
  });

  await t.test('trims SUMMARY and DESCRIPTION whitespace', () => {
    const icsText = [
      'BEGIN:VEVENT',
      'SUMMARY:   Chem Acids and Bases   ',
      'DTSTART:20260820T100000',
      'DESCRIPTION:   Chapter 4 revision with past papers   ',
      'END:VEVENT',
    ].join('\r\n');

    const events = parseIcsContent(icsText);
    assert.equal(events.length, 1);
    assert.equal(events[0].title, 'Chem Acids and Bases');
    assert.equal(events[0].notes, 'Chapter 4 revision with past papers');
  });
});

test('parseIcsContent: Edge Cases & Error Handling', async (t) => {
  await t.test('returns empty array for empty string input', () => {
    assert.deepEqual(parseIcsContent(''), []);
  });

  await t.test('returns empty array when no BEGIN:VEVENT block exists', () => {
    const icsText = 'BEGIN:VCALENDAR\nVERSION:2.0\nEND:VCALENDAR';
    assert.deepEqual(parseIcsContent(icsText), []);
  });

  await t.test('skips VEVENT blocks missing mandatory SUMMARY', () => {
    const icsText = [
      'BEGIN:VEVENT',
      'DTSTART:20260820T100000',
      'DESCRIPTION:No summary provided',
      'END:VEVENT',
    ].join('\n');

    assert.deepEqual(parseIcsContent(icsText), []);
  });

  await t.test('skips VEVENT blocks missing mandatory DTSTART', () => {
    const icsText = [
      'BEGIN:VEVENT',
      'SUMMARY:Bio Genetics',
      'DESCRIPTION:No DTSTART provided',
      'END:VEVENT',
    ].join('\n');

    assert.deepEqual(parseIcsContent(icsText), []);
  });

  await t.test('handles CRLF (\\r\\n) and LF (\\n) line endings seamlessly', () => {
    const crlfText = "BEGIN:VEVENT\r\nSUMMARY:Bio Plant Physiology\r\nDTSTART:20260826T080000\r\nEND:VEVENT";
    const lfText = "BEGIN:VEVENT\nSUMMARY:Bio Plant Physiology\nDTSTART:20260826T080000\nEND:VEVENT";

    const res1 = parseIcsContent(crlfText);
    const res2 = parseIcsContent(lfText);

    assert.equal(res1.length, 1);
    assert.equal(res2.length, 1);
    assert.equal(res1[0].title, 'Bio Plant Physiology');
    assert.equal(res2[0].title, 'Bio Plant Physiology');
  });
});

test('parseIcsContent: Roundtrip Compatibility with generateIcsCalendar', async (t) => {
  await t.test('parses content generated by generateIcsCalendar', () => {
    const sampleEvents = [
      {
        id: 'test_event_1',
        title: 'Bio Molecular Genetics',
        subject: 'Biology',
        date: '2026-11-15',
        startTime: '08:30',
        endTime: '10:30',
        durationHours: 2,
        type: 'study',
        color: '#0b8043',
        topic: 'DNA Replication',
        notes: 'Study NIE resource book chapter 5',
      },
      {
        id: 'test_event_2',
        title: 'Chem Equilibrium Calculations',
        subject: 'Chemistry',
        date: '2026-11-16',
        startTime: '14:00',
        endTime: '16:00',
        durationHours: 2,
        type: 'study',
        color: '#8e24aa',
        notes: 'Solve 2020-2024 structured essay questions',
      },
    ];

    const generatedIcs = generateIcsCalendar(sampleEvents, 'StudySync Test Schedule');
    assert.ok(generatedIcs.includes('BEGIN:VCALENDAR'));
    assert.ok(generatedIcs.includes('SUMMARY:Bio Molecular Genetics'));

    const parsedEvents = parseIcsContent(generatedIcs);
    assert.equal(parsedEvents.length, 2);

    assert.equal(parsedEvents[0].title, 'Bio Molecular Genetics');
    assert.equal(parsedEvents[0].subject, 'Biology');
    assert.equal(parsedEvents[0].date, '2026-11-15');
    assert.equal(parsedEvents[0].startTime, '08:30');
    assert.equal(parsedEvents[0].endTime, '10:30');

    assert.equal(parsedEvents[1].title, 'Chem Equilibrium Calculations');
    assert.equal(parsedEvents[1].subject, 'Chemistry');
    assert.equal(parsedEvents[1].date, '2026-11-16');
    assert.equal(parsedEvents[1].startTime, '14:00');
    assert.equal(parsedEvents[1].endTime, '16:00');
  });
});
