/**
 * StudySync — Google Calendar Integration & Study Schedule Utilities
 */

import { safeStorage } from './storage/safeStorage';

export interface CalendarStudyEvent {
  id: string;
  title: string;
  subject: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  durationHours: number;
  type: 'study' | 'assignment' | 'exam' | 'past_log';
  color: string; // Google Calendar color hex
  notes?: string;
  topic?: string;
  studyRoomUrl?: string;
  isPast?: boolean;
  completed?: boolean;
}

// Google Calendar 10-Color Palette
export const GCAL_COLORS = [
  { name: 'Tomato', hex: '#d50000', bg: 'bg-[#d50000]', text: 'text-white' },
  { name: 'Flamingo', hex: '#e67c73', bg: 'bg-[#e67c73]', text: 'text-zinc-900' },
  { name: 'Tangerine', hex: '#f4511e', bg: 'bg-[#f4511e]', text: 'text-white' },
  { name: 'Banana', hex: '#f6bf26', bg: 'bg-[#f6bf26]', text: 'text-zinc-900' },
  { name: 'Sage', hex: '#33b679', bg: 'bg-[#33b679]', text: 'text-white' },
  { name: 'Basil', hex: '#0b8043', bg: 'bg-[#0b8043]', text: 'text-white' },
  { name: 'Peacock', hex: '#039be5', bg: 'bg-[#039be5]', text: 'text-white' },
  { name: 'Blueberry', hex: '#3f51b5', bg: 'bg-[#3f51b5]', text: 'text-white' },
  { name: 'Lavender', hex: '#7986cb', bg: 'bg-[#7986cb]', text: 'text-white' },
  { name: 'Grape', hex: '#8e24aa', bg: 'bg-[#8e24aa]', text: 'text-white' },
];

export const DEFAULT_SUBJECT_COLORS: Record<string, string> = {
  'Biology': '#0b8043',        // Basil
  'Chemistry': '#8e24aa',      // Grape
  'Combined Maths': '#3f51b5',  // Blueberry
  'Physics': '#039be5',        // Peacock
  'ICT': '#f4511e',            // Tangerine
  'Agriculture': '#33b679',    // Sage
};

/**
 * Generate 1-click Google Calendar Web Add URL
 */
export function generateGoogleCalendarUrl(event: CalendarStudyEvent): string {
  const startDateStr = event.date.replace(/-/g, '');
  const startH = (event.startTime || '08:00').replace(':', '') + '00';
  const endH = (event.endTime || '10:00').replace(':', '') + '00';
  
  const startIso = `${startDateStr}T${startH}`;
  const endIso = `${startDateStr}T${endH}`;
  
  const title = encodeURIComponent(event.title || `StudySync: ${event.subject}`);
  const details = encodeURIComponent(`${event.topic ? 'Topic: ' + event.topic + '\n' : ''}${event.notes || 'A/L Study Session'}${event.studyRoomUrl ? '\nJoin Study Room: ' + event.studyRoomUrl : ''}`);
  
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}&details=${details}&add=${encodeURIComponent('StudySync Sri Lanka')}`;
}

/**
 * Generate RFC 5545 .ics iCalendar content
 */
export function generateIcsCalendar(events: CalendarStudyEvent[], calendarName = 'StudySync A/L Schedule'): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//StudySync//Sri Lankan AL Study Planner//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${calendarName}`,
    'X-WR-TIMEZONE:Asia/Colombo',
  ];

  events.forEach((ev) => {
    const startDateStr = ev.date.replace(/-/g, '');
    const startH = (ev.startTime || '08:00').replace(':', '') + '00';
    const endH = (ev.endTime || '10:00').replace(':', '') + '00';
    const dtStamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${ev.id}@studysync.app`);
    lines.push(`DTSTAMP:${dtStamp}`);
    lines.push(`DTSTART;TZID=Asia/Colombo:${startDateStr}T${startH}`);
    lines.push(`DTEND;TZID=Asia/Colombo:${startDateStr}T${endH}`);
    lines.push(`SUMMARY:${ev.title || ev.subject}`);
    lines.push(`DESCRIPTION:${ev.topic ? ev.topic + ' - ' : ''}${ev.notes || 'Study Session'}`);
    if (ev.studyRoomUrl) {
      lines.push(`URL:${ev.studyRoomUrl}`);
    }
    lines.push('STATUS:CONFIRMED');
    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

/**
 * Download .ics file in browser
 */
export function downloadIcsFile(events: CalendarStudyEvent[], filename = 'studysync-schedule.ics') {
  if (typeof window === 'undefined') return;
  const icsContent = generateIcsCalendar(events);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Parse imported .ics content into study events
 */
export function parseIcsContent(icsText: string): Partial<CalendarStudyEvent>[] {
  const events: Partial<CalendarStudyEvent>[] = [];
  const eventBlocks = icsText.split('BEGIN:VEVENT');
  
  for (let i = 1; i < eventBlocks.length; i++) {
    const block = eventBlocks[i].split('END:VEVENT')[0];
    const summaryMatch = block.match(/SUMMARY:(.*?)(\r?\n|$)/);
    const startMatch = block.match(/DTSTART[^:]*:(?:(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2}))/);
    const endMatch = block.match(/DTEND[^:]*:(?:(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2}))/);
    const descMatch = block.match(/DESCRIPTION:(.*?)(\r?\n|$)/);

    if (summaryMatch && startMatch) {
      const summary = summaryMatch[1].trim();
      const date = `${startMatch[1]}-${startMatch[2]}-${startMatch[3]}`;
      const startTime = `${startMatch[4]}:${startMatch[5]}`;
      let endTime = '10:00';
      if (endMatch) {
        endTime = `${endMatch[4]}:${endMatch[5]}`;
      }

      events.push({
        id: 'import_' + Date.now() + '_' + i,
        title: summary,
        subject: summary.includes('Bio') ? 'Biology' : summary.includes('Chem') ? 'Chemistry' : summary.includes('Math') ? 'Combined Maths' : summary.includes('Phys') ? 'Physics' : 'General Study',
        date,
        startTime,
        endTime,
        durationHours: 2.0,
        type: 'study',
        color: '#039be5',
        notes: descMatch ? descMatch[1].trim() : 'Imported Google Calendar Event',
      });
    }
  }

  return events;
}

/**
 * Smart AI Weekly Schedule Generator
 * Generates an optimal 7-day study distribution tailored to stream and exam year
 */
export function generateSmartAiWeeklySchedule(
  stream: string,
  sub1: string,
  sub2: string,
  sub3: string,
  targetWeeklyHours = 35
): CalendarStudyEvent[] {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 is Sunday
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - dayOfWeek + 1); // Monday

  const subjects = [sub1, sub2, sub3];

  const scheduleSlots = [
    // Mon
    { dayOffset: 0, sub: subjects[0], start: '08:30', end: '11:00', hrs: 2.5, topic: 'Theory & Core Fundamentals' },
    { dayOffset: 0, sub: subjects[1], start: '14:00', end: '16:30', hrs: 2.5, topic: 'Worked Examples & Calculation Practice' },
    { dayOffset: 0, sub: subjects[2], start: '19:30', end: '21:30', hrs: 2.0, topic: 'Summary Notes & Flashcard Review' },

    // Tue
    { dayOffset: 1, sub: subjects[1], start: '08:30', end: '11:00', hrs: 2.5, topic: 'Organic & Inorganic Chemistry Revision' },
    { dayOffset: 1, sub: subjects[2], start: '14:00', end: '16:30', hrs: 2.5, topic: 'Structured Essay Questions (Past Papers)' },
    { dayOffset: 1, sub: subjects[0], start: '19:30', end: '21:30', hrs: 2.0, topic: 'Timed MCQ Drill (25 Questions)' },

    // Wed
    { dayOffset: 2, sub: subjects[2], start: '08:30', end: '11:00', hrs: 2.5, topic: 'Mechanics & Applied Physics Derivations' },
    { dayOffset: 2, sub: subjects[0], start: '14:00', end: '16:30', hrs: 2.5, topic: 'Essay Writing & Diagram Accuracy' },
    { dayOffset: 2, sub: subjects[1], start: '19:30', end: '21:30', hrs: 2.0, topic: 'Physical Chemistry Calculations' },

    // Thu
    { dayOffset: 3, sub: subjects[0], start: '08:30', end: '11:30', hrs: 3.0, topic: 'Full Past Paper 2 Model Exam' },
    { dayOffset: 3, sub: subjects[1], start: '14:30', end: '16:30', hrs: 2.0, topic: 'Marking Scheme Self-Correction' },
    { dayOffset: 3, sub: subjects[2], start: '19:30', end: '21:30', hrs: 2.0, topic: 'Formula Memorization & Short Notes' },

    // Fri
    { dayOffset: 4, sub: subjects[1], start: '08:30', end: '11:30', hrs: 3.0, topic: 'Full Past Paper 2 Model Exam' },
    { dayOffset: 4, sub: subjects[2], start: '14:30', end: '16:30', hrs: 2.0, topic: 'Marking Scheme Self-Correction' },
    { dayOffset: 4, sub: subjects[0], start: '19:30', end: '21:30', hrs: 2.0, topic: 'Resource Book & Teacher Guide Review' },

    // Sat
    { dayOffset: 5, sub: subjects[2], start: '08:30', end: '11:30', hrs: 3.0, topic: 'Full Past Paper 2 Model Exam' },
    { dayOffset: 5, sub: subjects[0], start: '14:00', end: '16:30', hrs: 2.5, topic: 'Difficult Model Paper Analysis' },
    { dayOffset: 5, sub: subjects[1], start: '19:30', end: '21:30', hrs: 2.0, topic: 'Speed Test & 50 MCQ Paper 1 Simulation' },

    // Sun
    { dayOffset: 6, sub: subjects[0], start: '09:00', end: '11:00', hrs: 2.0, topic: 'Weekly Weak Area Reinforcement' },
    { dayOffset: 6, sub: subjects[1], start: '14:00', end: '16:00', hrs: 2.0, topic: 'Weekly Weak Area Reinforcement' },
    { dayOffset: 6, sub: subjects[2], start: '17:00', end: '19:00', hrs: 2.0, topic: 'Weekly Progress Review & Goal Setting' },
  ];

  return scheduleSlots.map((slot, idx) => {
    const eventDate = new Date(startOfWeek);
    eventDate.setDate(startOfWeek.getDate() + slot.dayOffset);
    const yyyy = eventDate.getFullYear();
    const mm = String(eventDate.getMonth() + 1).padStart(2, '0');
    const dd = String(eventDate.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

    const color = DEFAULT_SUBJECT_COLORS[slot.sub] || GCAL_COLORS[idx % GCAL_COLORS.length].hex;

    return {
      id: `ai_sched_${Date.now()}_${idx}`,
      title: `${slot.sub}: ${slot.topic}`,
      subject: slot.sub,
      date: dateStr,
      startTime: slot.start,
      endTime: slot.end,
      durationHours: slot.hrs,
      type: 'study',
      color,
      topic: slot.topic,
      notes: `Smart AI-generated study block for ${slot.sub}`,
      studyRoomUrl: `https://meet.jit.si/studysync-${slot.sub.toLowerCase().replace(/\s+/g, '-')}-${idx}`,
    };
  });
}

/**
 * A/L Examination Target Dates & Countdown Calculator
 */
export interface ExamCountdown {
  targetYear: string;
  examName: string;
  targetDate: Date;
  daysRemaining: number;
  weeksRemaining: number;
  hoursRemaining: number;
  formattedDate: string;
  isCompleted: boolean;
}

export const DEFAULT_EXAM_DATES: Record<string, string> = {
  '2026': '2026-11-23T08:30:00+05:30', // Official Sri Lankan G.C.E. A/L late November target
  '2027': '2027-11-29T08:30:00+05:30',
  '2028': '2028-11-27T08:30:00+05:30',
  '2029': '2029-11-26T08:30:00+05:30',
};

export function getStoredExamDates(): Record<string, string> {
  const stored = safeStorage.getJson<Record<string, string> | null>('STUDYSYNC_EXAM_DATES', null)
    || safeStorage.getJson<Record<string, string> | null>('studysync_exam_dates', null);
  if (stored) {
    return { ...DEFAULT_EXAM_DATES, ...stored };
  }
  return { ...DEFAULT_EXAM_DATES };
}

export function saveStoredExamDates(dates: Record<string, string>): void {
  safeStorage.setJson('STUDYSYNC_EXAM_DATES', dates);
  safeStorage.setJson('studysync_exam_dates', dates);
}

export function getExamCountdown(examYear = '2026', overrideDateStr?: string): ExamCountdown {
  const yearNum = parseInt(examYear, 10) || 2026;
  
  // Check for admin-configured custom date or passed override
  let examDate: Date | null = null;
  if (overrideDateStr) {
    const parsed = new Date(overrideDateStr);
    if (!isNaN(parsed.getTime())) examDate = parsed;
  }
  
  if (!examDate) {
    const datesMap = getStoredExamDates();
    const str = datesMap[String(yearNum)] || DEFAULT_EXAM_DATES[String(yearNum)];
    if (str) {
      const parsed = new Date(str);
      if (!isNaN(parsed.getTime())) examDate = parsed;
    }
  }

  // Fallback to late November of target year (4th Monday: Nov 23)
  if (!examDate) {
    examDate = new Date(yearNum, 10, 23, 8, 30, 0);
  }
  
  const now = new Date();
  const diffMs = examDate.getTime() - now.getTime();
  const isCompleted = diffMs <= 0;
  
  const totalHours = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
  const totalDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  const totalWeeks = Math.max(0, Math.floor(totalDays / 7));

  return {
    targetYear: String(yearNum),
    examName: `G.C.E. A/L ${yearNum} Examination`,
    targetDate: examDate,
    daysRemaining: totalDays,
    weeksRemaining: totalWeeks,
    hoursRemaining: totalHours,
    formattedDate: examDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
    isCompleted,
  };
}

/**
 * Returns the exact 3 subjects for a student given their stream
 */
export function getStreamSubjectNames(stream?: string, optionalSubject?: string): [string, string, string] {
  const isBio = String(stream || '').toLowerCase().includes('bio');
  const sub1 = isBio ? 'Biology' : 'Combined Maths';
  const sub2 = isBio ? 'Chemistry' : 'Physics';
  const sub3 = optionalSubject || (isBio ? 'Physics' : 'Chemistry');
  return [sub1, sub2, sub3];
}

