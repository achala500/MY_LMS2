import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { STREAMS, STREAM_SUBJECTS } from './constants';
import type { DailyLogEntry, StudentStats, StreakResult, SubjectLog } from '@/types/logs';
import { sanitizeCsvFormula, sanitizeUrl, evaluatePasswordSecurity, generateHighEntropyPassword } from './security';

export { sanitizeCsvFormula, sanitizeUrl, evaluatePasswordSecurity, generateHighEntropyPassword };



/**
 * Merges Tailwind CSS classes with clsx conditionals and resolves class conflicts
 * using tailwind-merge.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ==========================================
// 1. DATE HELPERS
// ==========================================

export function getTodayDateString(d: Date = new Date()): string {
  try {
    // Enforce Sri Lanka timezone (Asia/Colombo, UTC+05:30)
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Colombo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(d); // Returns YYYY-MM-DD
  } catch (e) {
    const utcTime = d.getTime() + d.getTimezoneOffset() * 60000;
    const slDate = new Date(utcTime + 5.5 * 3600000);
    const year = slDate.getFullYear();
    const month = String(slDate.getMonth() + 1).padStart(2, '0');
    const day = String(slDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

/**
 * Normalize any date input (YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY, ISO) to standard 'YYYY-MM-DD'
 */
export function normalizeDateString(str?: string | Date | null): string {
  if (!str) return '';
  if (str instanceof Date) {
    if (isNaN(str.getTime())) return '';
    return getTodayDateString(str);
  }
  const s = String(str).trim();
  if (!s) return '';

  // Match YYYY-MM-DD or YYYY/MM/DD
  const isoMatch = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (isoMatch) {
    const y = isoMatch[1];
    const m = isoMatch[2].padStart(2, '0');
    const d = isoMatch[3].padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // Match DD/MM/YYYY, MM/DD/YYYY, or DD-MM-YYYY
  const slashMatch = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
  if (slashMatch) {
    const part1 = parseInt(slashMatch[1], 10);
    const part2 = parseInt(slashMatch[2], 10);
    const y = slashMatch[3];
    let d: string;
    let m: string;

    if (part1 > 12) {
      // Clearly DD/MM/YYYY
      d = String(part1).padStart(2, '0');
      m = String(part2).padStart(2, '0');
    } else if (part2 > 12) {
      // Clearly MM/DD/YYYY
      m = String(part1).padStart(2, '0');
      d = String(part2).padStart(2, '0');
    } else {
      // Ambiguous (both <= 12): assume DD/MM/YYYY (Sri Lanka default standard)
      d = String(part1).padStart(2, '0');
      m = String(part2).padStart(2, '0');
    }
    return `${y}-${m}-${d}`;
  }

  // Fallback to JS Date parse
  const parsed = new Date(s);
  if (!isNaN(parsed.getTime())) {
    return getTodayDateString(parsed);
  }
  return s.substring(0, 10);
}

/**
 * Universal helper to extract standard YYYY-MM-DD date from any daily log object
 */
export function extractLogDate(log: any): string {
  if (!log) return '';
  const candidate =
    log.dateOfStudy ||
    log.date ||
    log.DateOfStudy ||
    log.Date ||
    log.studyDate ||
    log.date_of_study ||
    log.timestamp ||
    log.createdAt ||
    log.created_at;
  return normalizeDateString(candidate);
}

/**
 * Universal helper to extract total study hours from any daily log format
 */
export function extractLogHours(log: any): number {
  if (!log) return 0;

  // 1. Direct explicit totalHours
  const explicit = Number(log.totalHours || log.total || 0);
  if (explicit > 0) return explicit;

  // 2. Sum sessions array
  if (Array.isArray(log.sessions) && log.sessions.length > 0) {
    const sum = log.sessions.reduce((acc: number, s: any) => acc + Number(s?.hours || s?.totalHours || 0), 0);
    if (sum > 0) return sum;
  }

  // 3. Sum subjects array
  if (Array.isArray(log.subjects) && log.subjects.length > 0) {
    const sum = log.subjects.reduce((acc: number, s: any) => acc + Number(s?.hours || s?.totalHours || 0), 0);
    if (sum > 0) return sum;
  }

  // 4. Flat columns
  const flatSum =
    Number(log.hoursSubject1 || log.subject1Hours || log.sub1Hours || 0) +
    Number(log.hoursSubject2 || log.subject2Hours || log.sub2Hours || 0) +
    Number(log.hoursSubject3 || log.subject3Hours || log.sub3Hours || 0);

  return flatSum > 0 ? flatSum : 0;
}

/**
 * Parse YYYY-MM-DD or standard ISO date string safely without timezone offset issues
 */
export function parseDateString(str?: string | Date | null): Date {
  if (!str) return new Date();
  if (str instanceof Date) return str;

  const normalized = normalizeDateString(str);
  const parts = normalized.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      return new Date(year, month, day, 12, 0, 0);
    }
  }

  const fallback = new Date(str);
  return isNaN(fallback.getTime()) ? new Date() : fallback;
}

/**
 * Format date string into human-readable format
 */
export function formatDate(
  dateVal?: string | Date | null,
  style: 'short' | 'medium' | 'long' | 'iso' = 'medium'
): string {
  if (!dateVal) return '';
  const d = typeof dateVal === 'string' ? parseDateString(dateVal) : dateVal;
  if (isNaN(d.getTime())) return String(dateVal);

  if (style === 'iso') {
    return getTodayDateString(d);
  }

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fullMonths = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const day = d.getDate();
  const monthIndex = d.getMonth();
  const year = d.getFullYear();

  if (style === 'short') {
    return `${day} ${months[monthIndex]} ${year}`;
  } else if (style === 'long') {
    return `${days[d.getDay()]}, ${fullMonths[monthIndex]} ${day}, ${year}`;
  }

  // medium default
  return `${months[monthIndex]} ${day}, ${year}`;
}

/**
 * Check if a date string represents today
 */
export function isToday(dateStr?: string | null): boolean {
  if (!dateStr) return false;
  return getTodayDateString(parseDateString(dateStr)) === getTodayDateString();
}

/**
 * Check if a date string is in the future
 */
export function isFutureDate(dateStr?: string | null): boolean {
  if (!dateStr) return false;
  const target = getTodayDateString(parseDateString(dateStr));
  const today = getTodayDateString();
  return target > today;
}

/**
 * Calculate difference in calendar days between two dates (d2 - d1)
 */
export function daysBetween(d1: string | Date, d2: string | Date): number {
  const date1 = parseDateString(d1);
  const date2 = parseDateString(d2);
  const ut1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const ut2 = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());
  return Math.floor((ut2 - ut1) / (1000 * 60 * 60 * 24));
}

// ==========================================
// 2. STREAM & SUBJECT HELPERS
// ==========================================

/**
 * Returns the exact 3 subjects for a student given their stream and optional subject choice.
 */
export function getStudentSubjects(stream: string, optionalSubject: string): string[] {
  const streamKey = stream as keyof typeof STREAM_SUBJECTS;
  const streamDef = STREAM_SUBJECTS[streamKey];
  if (!streamDef) {
    throw new Error(`Invalid stream: ${stream}`);
  }

  const choices = streamDef.optionalChoices as readonly string[];
  if (!choices.includes(optionalSubject)) {
    throw new Error(
      `Invalid optional subject '${optionalSubject}' for stream '${stream}'. Allowed: ${choices.join(', ')}`
    );
  }

  return [...streamDef.mandatory, optionalSubject];
}

/**
 * Qualitative Badge Formatter for Focus Sliders (1-10)
 */
export function getFocusBadge(level: number | string): { text: string; color: string; level: number } {
  const val = Math.round(Number(level));
  if (val < 1 || val > 10 || isNaN(val)) {
    throw new Error(`Focus level must be integer 1-10, got ${level}`);
  }
  if (val <= 3) return { text: 'Distracted / Low', color: 'rose', level: val };
  if (val <= 7) return { text: 'Moderate / Steady', color: 'amber', level: val };
  return { text: 'High / Deep Flow', color: 'emerald', level: val };
}

/**
 * Qualitative Badge Formatter for Productivity Sliders (1-10)
 */
export function getProductivityBadge(level: number | string): { text: string; color: string; level: number } {
  const val = Math.round(Number(level));
  if (val < 1 || val > 10 || isNaN(val)) {
    throw new Error(`Productivity level must be integer 1-10, got ${level}`);
  }
  if (val <= 3) return { text: 'Slow Progress', color: 'rose', level: val };
  if (val <= 7) return { text: 'Consistent Progress', color: 'amber', level: val };
  return { text: 'Maximum Output / Mastery', color: 'emerald', level: val };
}

// ==========================================
// 3. STREAK & METRICS CALCULATORS
// ==========================================

/**
 * Calculate consecutive daily study streak from an array of logs or date strings.
 */
export function calculateStreak(
  logsOrDates: Array<any>,
  referenceDate: string | Date = new Date()
): StreakResult {
  if (!Array.isArray(logsOrDates) || logsOrDates.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      studiedToday: false,
      lastStudyDate: null,
    };
  }

  // Extract unique sorted date strings (YYYY-MM-DD)
  const dateSet = new Set<string>();
  for (const item of logsOrDates) {
    if (!item) continue;
    if (typeof item === 'string') {
      const norm = normalizeDateString(item);
      if (norm) dateSet.add(norm);
    } else if (item instanceof Date) {
      dateSet.add(getTodayDateString(item));
    } else if (typeof item === 'object') {
      const norm = extractLogDate(item);
      if (norm) dateSet.add(norm);
    }
  }

  const uniqueDates = Array.from(dateSet).sort((a, b) => b.localeCompare(a));
  if (uniqueDates.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      studiedToday: false,
      lastStudyDate: null,
    };
  }

  const refIso = typeof referenceDate === 'string'
    ? normalizeDateString(referenceDate)
    : getTodayDateString(referenceDate);

  const studiedToday = uniqueDates.includes(refIso);
  const lastStudyDate = uniqueDates[0];

  const diffFromRef = daysBetween(lastStudyDate, refIso);

  let currentStreak = 0;
  if (diffFromRef <= 1) {
    currentStreak = 1;
    for (let i = 0; i < uniqueDates.length - 1; i++) {
      const current = uniqueDates[i];
      const prev = uniqueDates[i + 1];
      const diff = daysBetween(prev, current);
      if (diff === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // Calculate longest streak across all history
  let longestStreak = 0;
  let runningStreak = 0;
  const chronologicalDates = Array.from(dateSet).sort((a, b) => a.localeCompare(b));
  let prevDate: string | null = null;

  for (const dStr of chronologicalDates) {
    if (!prevDate) {
      runningStreak = 1;
    } else {
      const diff = daysBetween(prevDate, dStr);
      if (diff === 1) {
        runningStreak++;
      } else if (diff > 1) {
        runningStreak = 1;
      }
    }
    if (runningStreak > longestStreak) {
      longestStreak = runningStreak;
    }
    prevDate = dStr;
  }

  return {
    currentStreak,
    longestStreak,
    studiedToday,
    lastStudyDate,
  };
}

/**
 * Calculate comprehensive student study metrics rollup from an array of daily logs
 */
export function calculateStudentMetrics(
  logs: Array<DailyLogEntry | any>,
  referenceDate: string | Date = new Date()
): StudentStats {
  if (!Array.isArray(logs) || logs.length === 0) {
    return {
      totalHours: 0,
      activeStreak: 0,
      currentStreak: 0,
      maxStreak: 0,
      longestStreak: 0,
      avgFocus: 0,
      avgProductivity: 0,
      totalEntries: 0,
      totalLogs: 0,
      subjectHours: {},
      perSubjectHours: {},
      lastStudyDate: null,
    };
  }

  let totalHours = 0;
  const perSubjectHours: Record<string, number> = {};
  let totalFocus = 0;
  let totalProductivity = 0;
  let subjectCount = 0;

  for (const log of logs) {
    if (!log) continue;
    if (Array.isArray(log.subjects) && log.subjects.length > 0) {
      for (const sub of log.subjects) {
        if (!sub) continue;
        const name = String(sub.name || 'Subject').trim();
        const hours = Number(sub.hours) || 0;
        const focus = Number(sub.focus) || 0;
        const prod = Number(sub.productivity) || 0;

        totalHours += hours;
        perSubjectHours[name] = (perSubjectHours[name] || 0) + hours;

        if (focus > 0) {
          totalFocus += focus;
          subjectCount++;
        }
        if (prod > 0) {
          totalProductivity += prod;
        }
      }
    } else if (Array.isArray(log.sessions) && log.sessions.length > 0) {
      for (const s of log.sessions) {
        if (!s) continue;
        const name = String(s.subject || s.name || 'Subject').trim();
        const hours = Number(s.hours) || 0;
        const focus = Number(s.focus) || 0;
        const prod = Number(s.productivity) || 0;

        totalHours += hours;
        perSubjectHours[name] = (perSubjectHours[name] || 0) + hours;

        if (focus > 0) {
          totalFocus += focus;
          subjectCount++;
        }
        if (prod > 0) {
          totalProductivity += prod;
        }
      }
    } else {
      // Flat sheet column support or direct properties
      let logAdded = false;
      for (let i = 1; i <= 3; i++) {
        const name = log[`Subject ${i} Name`] || log[`subject${i}Name`] || log[`subject${i}`] || `Subject ${i}`;
        const hours = Number(
          log[`Subject ${i} Hours`] ??
          log[`subject${i}Hours`] ??
          log[`hoursSubject${i}`] ??
          log[`sub${i}Hours`] ??
          0
        );
        const focus = Number(log[`Subject ${i} Focus`] ?? log[`subject${i}Focus`] ?? log.focusScore ?? 0);
        const prod = Number(log[`Subject ${i} Productivity`] ?? log[`subject${i}Productivity`] ?? log.productivityScore ?? 0);

        if (hours > 0) {
          logAdded = true;
          const sName = String(name).trim();
          totalHours += hours;
          perSubjectHours[sName] = (perSubjectHours[sName] || 0) + hours;
          if (focus > 0) {
            totalFocus += focus;
            subjectCount++;
          }
          if (prod > 0) {
            totalProductivity += prod;
          }
        }
      }

      if (!logAdded && Number(log.totalHours || 0) > 0) {
        const th = Number(log.totalHours);
        totalHours += th;
        perSubjectHours['General Study'] = (perSubjectHours['General Study'] || 0) + th;
        const f = Number(log.focusScore || log.focus || 0);
        if (f > 0) {
          totalFocus += f;
          subjectCount++;
        }
        const p = Number(log.productivityScore || log.productivity || 0);
        if (p > 0) {
          totalProductivity += p;
        }
      }
    }
  }

  const streakInfo = calculateStreak(logs, referenceDate);

  const roundedHours = Number(totalHours.toFixed(2));
  const roundedSubjectHours: Record<string, number> = {};
  for (const [k, v] of Object.entries(perSubjectHours)) {
    roundedSubjectHours[k] = Number(v.toFixed(2));
  }

  const avgFocus = subjectCount > 0 ? Number((totalFocus / subjectCount).toFixed(2)) : 0;
  const avgProductivity = subjectCount > 0 ? Number((totalProductivity / subjectCount).toFixed(2)) : 0;

  return {
    totalHours: roundedHours,
    activeStreak: streakInfo.currentStreak,
    currentStreak: streakInfo.currentStreak,
    maxStreak: streakInfo.longestStreak,
    longestStreak: streakInfo.longestStreak,
    avgFocus,
    avgProductivity,
    totalEntries: logs.length,
    totalLogs: logs.length,
    subjectHours: roundedSubjectHours,
    perSubjectHours: roundedSubjectHours,
    lastStudyDate: streakInfo.lastStudyDate,
  };
}

export const calculateStats = calculateStudentMetrics;

// ==========================================
// 4. CLIENT-SIDE CANVAS IMAGE COMPRESSION
// ==========================================

export interface CompressedImageResult {
  base64: string;
  dataUrl: string;
  blob: Blob;
  originalSize: number;
  compressedSize: number;
  mimeType: string;
  width: number;
  height: number;
  fileName: string;
}

export interface CompressImageOptions {
  maxDimension?: number;
  maxWidthOrHeight?: number;
  quality?: number;
  maxSizeMB?: number;
}

/**
 * Compress an image file on the client using HTML5 Canvas before uploading to Drive.
 * Downscales images exceeding maxDimension and compresses to JPEG quality 0.75 (< 400KB target).
 */
export async function compressImage(
  file: File | Blob,
  maxDimensionOrOptions: number | CompressImageOptions = 1600,
  qualityArg: number = 0.75
): Promise<CompressedImageResult> {
  if (!file) throw new Error('[compressImage] No file provided');

  let maxDimension = 1600;
  let quality = 0.75;

  if (typeof maxDimensionOrOptions === 'number') {
    maxDimension = maxDimensionOrOptions;
    quality = qualityArg;
  } else if (typeof maxDimensionOrOptions === 'object' && maxDimensionOrOptions !== null) {
    maxDimension = maxDimensionOrOptions.maxDimension || maxDimensionOrOptions.maxWidthOrHeight || 1600;
    quality = maxDimensionOrOptions.quality || 0.75;
  }

  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      return reject(new Error('Canvas compression only available in browser environment'));
    }

    const reader = new FileReader();


    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // Calculate proportional scale
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Failed to create canvas 2d context'));
        }

        ctx.drawImage(img, 0, 0, width, height);

        const mimeType = 'image/jpeg';
        const dataUrl = canvas.toDataURL(mimeType, quality);
        const base64 = dataUrl.split(',')[1];

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return reject(new Error('Failed to create JPEG blob from canvas'));
            }
            const origFileName = (file as File).name || 'proof.jpg';
            resolve({
              base64,
              dataUrl,
              blob,
              originalSize: file.size,
              compressedSize: blob.size,
              mimeType,
              width,
              height,
              fileName: origFileName.replace(/\.[^/.]+$/, '') + '.jpg',
            });
          },
          mimeType,
          quality
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image for canvas compression'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file for compression'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Format bytes into human-readable string (e.g. 340 KB, 1.2 MB)
 */
export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

// ==========================================
// 5. INPUT SANITIZERS & VALIDATORS
// ==========================================

/**
 * Escape HTML special characters to prevent XSS
 */
export function sanitizeString(str?: string | null): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Normalizes a Telegram username or URL handle:
 * - Strips URL prefixes (https://t.me/, t.me/, etc.)
 * - Strips leading '@'
 * - Strips invalid characters (keeps [a-zA-Z0-9_])
 * - Lowercases the handle
 * - Prepends '@' if result has length >= 1
 */
export function normalizeTelegramUsername(handle?: string | null): string {
  if (!handle) return '';
  let str = String(handle).trim();
  str = str.replace(/^(https?:\/\/)?(www\.)?(t\.me|telegram\.me)\//i, '');
  if (str.startsWith('@')) {
    str = str.substring(1);
  }
  str = str.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
  return str.length > 0 ? `@${str}` : '';
}

/**
 * Checks if a string is a valid Telegram handle
 */
export function isValidTelegramHandle(handle?: string | null): boolean {
  if (!handle) return false;
  const normalized = normalizeTelegramUsername(handle);
  if (!normalized || !normalized.startsWith('@')) return false;
  const raw = normalized.substring(1);
  return raw.length >= 3 && raw.length <= 32;
}

/**
 * Formats a clean Telegram markdown daily digest summary
 */
export function formatTelegramDigest(
  analytics: any = {},
  leaderboard: any[] = [],
  dateVal: Date = new Date()
): string {
  const dayOfWeek = formatDate(dateVal, 'long').split(',')[0];
  const formattedDate = formatDate(dateVal, 'medium');

  const totalMembers = analytics?.totalMembers || analytics?.kpi?.totalMembers || (Array.isArray(leaderboard) ? leaderboard.length : 0);
  const activeToday = analytics?.activeToday || analytics?.todayActiveCount || (Array.isArray(leaderboard) ? leaderboard.filter((l: any) => (l.todayHours && l.todayHours > 0) || l.studiedToday).length : 0);
  const participationRate = totalMembers > 0 ? ((activeToday / totalMembers) * 100).toFixed(0) : '0';
  
  const totalTodayHours = Number(analytics?.totalTodayHours || analytics?.todayHours || 0);
  const avgHoursPerStudent = activeToday > 0 ? totalTodayHours / activeToday : 0;
  
  const bioStats = analytics?.streamBreakdown?.['Biological Science'] || analytics?.streamBreakdown?.bio || { totalHours: 0, members: 0 };
  const mathStats = analytics?.streamBreakdown?.['Physical Science'] || analytics?.streamBreakdown?.maths || { totalHours: 0, members: 0 };
  
  const bioHours = Number(bioStats.todayHours ?? bioStats.totalHours ?? 0);
  const bioCount = Number(bioStats.activeToday ?? bioStats.members ?? 0);
  const mathHours = Number(mathStats.todayHours ?? mathStats.totalHours ?? 0);
  const mathCount = Number(mathStats.activeToday ?? mathStats.members ?? 0);
  
  const avgGroupFocus = Number(analytics?.avgGroupFocus || analytics?.kpi?.avgGroupFocus || 8.0);
  
  const topList = Array.isArray(leaderboard) ? leaderboard.slice(0, 5) : [];
  const medals = [' 1.', ' 2.', ' 3.', '4️⃣ 4.', '5️⃣ 5.'];
  
  let leaderboardText = '';
  if (topList.length === 0) {
    leaderboardText = '• _No entries yet_';
  } else {
    leaderboardText = topList.map((entry: any, idx: number) => {
      const medal = medals[idx] || `${idx + 1}.`;
      const name = entry.name || entry.fullName || 'Student';
      const id = entry.studyId || '';
      const streak = entry.streak ?? entry.activeStreak ?? 0;
      const hours = Number(entry.totalHours || 0).toFixed(1);
      const school = entry.school || 'A/L Candidate';
      return `${medal} *${name}* (\`${id}\`) —  *${streak} Days* (${hours}h) • ${school}`;
    }).join('\n');
  }

  // MVPs
  const mvpVolume = analytics?.mvpVolume || (topList[0] ? { name: topList[0].name || topList[0].fullName, hours: topList[0].todayHours || topList[0].totalHours } : null);
  const mvpFocus = analytics?.mvpFocus || (topList[0] ? { name: topList[0].name || topList[0].fullName, focus: topList[0].avgFocus || 9 } : null);

  const pendingCount = Math.max(0, totalMembers - activeToday);

  return [
    ` *STUDYSYNC DAILY ACCOUNTABILITY DIGEST*`,
    ` *Date:* ${dayOfWeek}, ${formattedDate}`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    ``,
    ` *COMMUNITY PULSE*`,
    `•  *Active Today:* *${activeToday} / ${totalMembers} (${participationRate}%)*`,
    `• ⏱️ *Total Study Hours:* *${totalTodayHours.toFixed(1)} hrs*`,
    `•  *Average Study Time:* *${avgHoursPerStudent.toFixed(2)} hrs / student*`,
    `•  *Biological Science:* *${bioHours.toFixed(1)} hrs* (${bioCount} students)`,
    `•  *Physical Science:* *${mathHours.toFixed(1)} hrs* (${mathCount} students)`,
    `•  *Group Focus Index:* *${avgGroupFocus.toFixed(1)} / 10*`,
    ``,
    ` *STREAK HALL OF FAME (TOP 5)*`,
    leaderboardText,
    ``,
    ` *TODAY'S STUDY MVPS*`,
    mvpVolume ? ` *Highest Volume:* *${mvpVolume.name}* (*${Number(mvpVolume.hours || 0).toFixed(1)} hrs*)` : ` *Highest Volume:* _Pending submissions_`,
    mvpFocus ? ` *Deep Flow:* *${mvpFocus.name}* (*${Number(mvpFocus.focus || 0).toFixed(1)}/10 Focus*)` : ` *Deep Flow:* _Pending submissions_`,
    ``,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    ` *Streak Alert:* ${pendingCount} students have pending daily submissions.`,
    `Submit before 23:59 to keep your streak alive!`,
    ` *Log Study Hours:* https://studysync-al-2026.web.app/daily`
  ].join('\n');
}

/**
 * Sanitize and format Telegram username with '@' prefix
 */
export function formatTelegramUsername(username?: string | null): string {
  return normalizeTelegramUsername(username);
}

/**
 * Standard email validation regex
 */
export function validateEmail(email?: string | null): boolean {
  if (!email || typeof email !== 'string') return false;
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email.trim());
}

/**
 * Validate Study ID format: SG-BIO-0001 or SG-MATH-0001
 */
export function validateStudyId(studyId?: string | null): boolean {
  if (!studyId || typeof studyId !== 'string') return false;
  const re = /^SG-(BIO|MATH)-\d{4}$/;
  return re.test(studyId.trim().toUpperCase());
}

// ==========================================
// 6. RFC 4180 CSV EXPORT HELPERS
// ==========================================

/**
 * Format a single CSV cell value according to RFC 4180 with spreadsheet formula injection protection
 */
export function formatCsvCell(val: any): string {
  if (val === null || val === undefined) return '';
  const str = sanitizeCsvFormula(String(val));
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Generate an RFC 4180 compliant CSV string from headers and 2D row array
 */
export function generateCsvString(headers: string[], rows: any[][]): string {
  const headerLine = headers.map(formatCsvCell).join(',');
  const rowLines = (rows || []).map((row) => (row || []).map(formatCsvCell).join(','));
  return [headerLine, ...rowLines].join('\r\n');
}

/**
 * Trigger client-side browser file download for a CSV string
 */
export function downloadCsvFile(filename: string, csvContent: string): void {
  if (typeof document === 'undefined') return;
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ==========================================
// 7. QR CODE PAYLOAD ENGINE
// ==========================================

export function generateQrPayload(member: any, baseUrl: string = 'https://studysync-al-2026.web.app') {
  if (!member || !member.studyId) {
    throw new Error('Invalid member object for QR generation');
  }

  const cleanId = String(member.studyId).trim().toUpperCase();
  const verifyUrl = `${baseUrl}/verify.html?id=${encodeURIComponent(cleanId)}`;

  const offlineJson = JSON.stringify({
    id: cleanId,
    name: member.fullName,
    stream: member.stream,
    school: member.school,
    regDate: member.registrationDate,
  });

  return {
    offlineData: offlineJson,
    verifyUrl: verifyUrl,
    combinedString: `STUDYSYNC|${cleanId}|${verifyUrl}|${offlineJson}`,
  };
}

export function parseQrPayload(payloadString: string): any {
  if (!payloadString || typeof payloadString !== 'string') return null;

  if (payloadString.startsWith('STUDYSYNC|')) {
    const parts = payloadString.split('|');
    try {
      return {
        type: 'STUDYSYNC_DUAL',
        studyId: parts[1],
        verifyUrl: parts[2],
        offlineData: JSON.parse(parts.slice(3).join('|')),
      };
    } catch (e) {
      return null;
    }
  }

  try {
    const parsed = JSON.parse(payloadString);
    if (parsed.id) {
      return {
        type: 'STUDYSYNC_JSON',
        studyId: parsed.id,
        offlineData: parsed,
        verifyUrl: `https://studysync-al-2026.web.app/verify.html?id=${parsed.id}`,
      };
    }
  } catch (e) {
    // not JSON
  }

  return null;
}

// ==========================================
// 8. GOOGLE DRIVE IMAGE STREAM CONVERTER
// ==========================================

/**
 * Extracts Google Drive file ID from any drive link format:
 * - https://drive.google.com/file/d/FILE_ID/view...
 * - https://drive.google.com/open?id=FILE_ID
 * - https://drive.google.com/uc?id=FILE_ID
 * - https://drive.google.com/thumbnail?id=FILE_ID
 */
export function getDriveFileId(url?: string | null): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  // Match /file/d/FILE_ID or /d/FILE_ID
  const dMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]{20,})/);
  if (dMatch && dMatch[1]) return dMatch[1];

  // Match id=FILE_ID
  const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]{20,})/);
  if (idMatch && idMatch[1]) return idMatch[1];

  return null;
}

/**
 * Converts any Google Drive web URL or base64 into a high-res direct image stream URL
 */
export function getDisplayableImageUrl(url?: string | null): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();

  // Data URLs or direct image extensions pass directly
  if (trimmed.startsWith('data:image/') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  const driveId = getDriveFileId(trimmed);
  if (driveId) {
    // High-res Google user content direct thumbnail
    return `https://lh3.googleusercontent.com/d/${driveId}=w1200`;
  }

  return trimmed;
}

// ==========================================
// 9. MULTI-FORMAT EXPORT ENGINES (EXCEL & SQL)
// ==========================================

function escapeXml(str: any): string {
  if (str === null || str === undefined) return '';
  const s = sanitizeCsvFormula(String(str));
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generate Microsoft XML Spreadsheet 2003 string containing Members Directory and Daily Study Logs.
 */
export function generateExcelXmlString(members: any[] = [], logs: any[] = []): string {
  const sanitize = escapeXml;

  let memberRows = '';
  memberRows += `
    <Row ss:StyleID="HeaderStyle">
      <Cell><Data ss:Type="String">Study ID</Data></Cell>
      <Cell><Data ss:Type="String">Full Name</Data></Cell>
      <Cell><Data ss:Type="String">Email</Data></Cell>
      <Cell><Data ss:Type="String">School</Data></Cell>
      <Cell><Data ss:Type="String">Stream</Data></Cell>
      <Cell><Data ss:Type="String">Optional Subject</Data></Cell>
      <Cell><Data ss:Type="String">Exam Year</Data></Cell>
      <Cell><Data ss:Type="String">Telegram</Data></Cell>
      <Cell><Data ss:Type="String">Registration Date</Data></Cell>
      <Cell><Data ss:Type="String">Status</Data></Cell>
    </Row>`;

  for (const m of members) {
    memberRows += `
    <Row>
      <Cell><Data ss:Type="String">${sanitize(m.studyId)}</Data></Cell>
      <Cell><Data ss:Type="String">${sanitize(m.fullName || m.name)}</Data></Cell>
      <Cell><Data ss:Type="String">${sanitize(m.email)}</Data></Cell>
      <Cell><Data ss:Type="String">${sanitize(m.school)}</Data></Cell>
      <Cell><Data ss:Type="String">${sanitize(m.stream)}</Data></Cell>
      <Cell><Data ss:Type="String">${sanitize(m.optionalSubject || '')}</Data></Cell>
      <Cell><Data ss:Type="String">${sanitize(m.examYear || '2026')}</Data></Cell>
      <Cell><Data ss:Type="String">${sanitize(m.telegramUsername || m.telegram || '')}</Data></Cell>
      <Cell><Data ss:Type="String">${sanitize(m.registrationDate)}</Data></Cell>
      <Cell><Data ss:Type="String">${sanitize(m.status || 'Active')}</Data></Cell>
    </Row>`;
  }

  let logRows = '';
  logRows += `
    <Row ss:StyleID="HeaderStyle">
      <Cell><Data ss:Type="String">Date of Study</Data></Cell>
      <Cell><Data ss:Type="String">Study ID</Data></Cell>
      <Cell><Data ss:Type="String">Student Name</Data></Cell>
      <Cell><Data ss:Type="String">Stream</Data></Cell>
      <Cell><Data ss:Type="String">Subject 1 Hours</Data></Cell>
      <Cell><Data ss:Type="String">Subject 2 Hours</Data></Cell>
      <Cell><Data ss:Type="String">Subject 3 Hours</Data></Cell>
      <Cell><Data ss:Type="String">Total Hours</Data></Cell>
      <Cell><Data ss:Type="String">Focus Score</Data></Cell>
      <Cell><Data ss:Type="String">Productivity Score</Data></Cell>
      <Cell><Data ss:Type="String">Notes</Data></Cell>
    </Row>`;

  for (const l of logs) {
    const subs = l.subjects || [];
    const h1 = Number(subs[0]?.hours ?? l.subject1Hours ?? 0);
    const h2 = Number(subs[1]?.hours ?? l.subject2Hours ?? 0);
    const h3 = Number(subs[2]?.hours ?? l.subject3Hours ?? 0);
    const tot = Number(l.totalHours || h1 + h2 + h3 || 0);
    const focus = Number(subs[0]?.focus ?? l.focusScore ?? 0);
    const prod = Number(subs[0]?.productivity ?? l.productivityScore ?? 0);

    logRows += `
    <Row>
      <Cell><Data ss:Type="String">${sanitize(l.dateOfStudy || l.date)}</Data></Cell>
      <Cell><Data ss:Type="String">${sanitize(l.studyId)}</Data></Cell>
      <Cell><Data ss:Type="String">${sanitize(l.fullName || l.name || '')}</Data></Cell>
      <Cell><Data ss:Type="String">${sanitize(l.stream || '')}</Data></Cell>
      <Cell><Data ss:Type="Number">${h1}</Data></Cell>
      <Cell><Data ss:Type="Number">${h2}</Data></Cell>
      <Cell><Data ss:Type="Number">${h3}</Data></Cell>
      <Cell><Data ss:Type="Number">${tot}</Data></Cell>
      <Cell><Data ss:Type="Number">${focus}</Data></Cell>
      <Cell><Data ss:Type="Number">${prod}</Data></Cell>
      <Cell><Data ss:Type="String">${sanitize(l.notes || '')}</Data></Cell>
    </Row>`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:x="urn:schemas-microsoft-com:office:excel"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:html="http://www.w3.org/TR/REC-html40">
  <Styles>
    <Style ss:ID="Default" ss:Name="Normal">
      <Alignment ss:Vertical="Center"/>
      <Borders/>
      <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#000000"/>
      <Interior/>
      <NumberFormat/>
      <Protection/>
    </Style>
    <Style ss:ID="HeaderStyle">
      <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#FFFFFF" ss:Bold="1"/>
      <Interior ss:Color="#4F46E5" ss:Pattern="Solid"/>
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
    </Style>
  </Styles>
  <Worksheet ss:Name="Members Directory">
    <Table>
      ${memberRows}
    </Table>
  </Worksheet>
  <Worksheet ss:Name="Daily Study Logs">
    <Table>
      ${logRows}
    </Table>
  </Worksheet>
</Workbook>`;
}

export function downloadExcelFile(filename: string, xmlString: string): void {
  if (typeof document === 'undefined') return;
  const blob = new Blob([xmlString], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeSql(val: any): string {
  if (val === null || val === undefined) return 'NULL';
  const str = String(val).replace(/'/g, "''");
  return `'${str}'`;
}

/**
 * Generate standard Relational SQL Dump (DDL schema + DML INSERT statements).
 */
export function generateSqlDump(members: any[] = [], logs: any[] = []): string {
  const timestamp = new Date().toISOString();
  let sql = `-- ============================================================================
-- StudySync Sri Lankan A/L Academic Database Dump
-- Generated: ${timestamp}
-- Dialect: ANSI SQL (Compatible with PostgreSQL, MySQL, SQLite)
-- ============================================================================

-- Table Structure: members
CREATE TABLE IF NOT EXISTS members (
  study_id VARCHAR(32) PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  school VARCHAR(255),
  stream VARCHAR(64) NOT NULL,
  optional_subject VARCHAR(64),
  exam_year VARCHAR(10) DEFAULT '2026',
  telegram_username VARCHAR(128),
  registration_date TIMESTAMP,
  status VARCHAR(32) DEFAULT 'Pending'
);

-- Table Structure: daily_logs
CREATE TABLE IF NOT EXISTS daily_logs (
  log_id VARCHAR(64) PRIMARY KEY,
  study_id VARCHAR(32) NOT NULL REFERENCES members(study_id) ON DELETE CASCADE,
  student_name VARCHAR(255),
  stream VARCHAR(64),
  date_of_study DATE NOT NULL,
  subject1_hours NUMERIC(5,2) DEFAULT 0,
  subject2_hours NUMERIC(5,2) DEFAULT 0,
  subject3_hours NUMERIC(5,2) DEFAULT 0,
  total_hours NUMERIC(5,2) NOT NULL,
  focus_score INTEGER,
  productivity_score INTEGER,
  notes TEXT,
  proof_url TEXT,
  created_at TIMESTAMP
);

-- Table Structure: admin_users
CREATE TABLE IF NOT EXISTS admin_users (
  email VARCHAR(255) PRIMARY KEY,
  role VARCHAR(32) DEFAULT 'Admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table Structure: exam_target_dates
CREATE TABLE IF NOT EXISTS exam_target_dates (
  exam_year VARCHAR(10) PRIMARY KEY,
  target_date TIMESTAMP NOT NULL,
  title VARCHAR(255) NOT NULL
);

-- Table Structure: test_marks
CREATE TABLE IF NOT EXISTS test_marks (
  test_id VARCHAR(64) PRIMARY KEY,
  study_id VARCHAR(32) NOT NULL,
  subject VARCHAR(64) NOT NULL,
  test_name VARCHAR(255) NOT NULL,
  score NUMERIC(5,2) NOT NULL,
  date_recorded DATE NOT NULL
);

`;

  // Admin users records
  sql += `-- Data Insertion: admin_users\n`;
  sql += `INSERT INTO admin_users (email, role) VALUES ('alwisachalaanurada@gmail.com', 'Primary Admin') ON CONFLICT DO NOTHING;\n`;
  sql += `INSERT INTO admin_users (email, role) VALUES ('admin@studysync.lk', 'Admin') ON CONFLICT DO NOTHING;\n`;
  sql += `INSERT INTO admin_users (email, role) VALUES ('lead.admin@studysync.lk', 'Admin') ON CONFLICT DO NOTHING;\n\n`;

  // Exam target dates
  sql += `-- Data Insertion: exam_target_dates\n`;
  sql += `INSERT INTO exam_target_dates (exam_year, target_date, title) VALUES ('2026', '2026-11-25 08:30:00', '2026 G.C.E. A/L Exam') ON CONFLICT DO NOTHING;\n`;
  sql += `INSERT INTO exam_target_dates (exam_year, target_date, title) VALUES ('2027', '2027-11-25 08:30:00', '2027 G.C.E. A/L Exam') ON CONFLICT DO NOTHING;\n`;
  sql += `INSERT INTO exam_target_dates (exam_year, target_date, title) VALUES ('2028', '2028-11-25 08:30:00', '2028 G.C.E. A/L Exam') ON CONFLICT DO NOTHING;\n`;
  sql += `INSERT INTO exam_target_dates (exam_year, target_date, title) VALUES ('2029', '2029-11-25 08:30:00', '2029 G.C.E. A/L Exam') ON CONFLICT DO NOTHING;\n\n`;

  // Member records
  if (members.length > 0) {
    sql += `-- Data Insertion: members (${members.length} records)\n`;
    for (const m of members) {
      const studyId = escapeSql(m.studyId);
      const fullName = escapeSql(m.fullName || m.name);
      const email = escapeSql(m.email);
      const school = escapeSql(m.school);
      const stream = escapeSql(m.stream);
      const opt = escapeSql(m.optionalSubject || null);
      const examYear = escapeSql(m.examYear || '2026');
      const telegram = escapeSql(m.telegramUsername || m.telegram || null);
      const regDate = escapeSql(m.registrationDate || timestamp);
      const status = escapeSql(m.status || 'Active');

      sql += `INSERT INTO members (study_id, full_name, email, school, stream, optional_subject, exam_year, telegram_username, registration_date, status) VALUES (${studyId}, ${fullName}, ${email}, ${school}, ${stream}, ${opt}, ${examYear}, ${telegram}, ${regDate}, ${status});\n`;
    }
    sql += '\n';
  }

  // Daily log records
  if (logs.length > 0) {
    sql += `-- Data Insertion: daily_logs (${logs.length} records)\n`;
    logs.forEach((l, idx) => {
      const logId = escapeSql(l.logId || `LOG-${l.studyId}-${l.dateOfStudy || l.date || idx}`);
      const studyId = escapeSql(l.studyId);
      const name = escapeSql(l.fullName || l.name || null);
      const stream = escapeSql(l.stream || null);
      const date = escapeSql(l.dateOfStudy || l.date);
      const subs = l.subjects || [];
      const h1 = Number(subs[0]?.hours ?? l.subject1Hours ?? 0);
      const h2 = Number(subs[1]?.hours ?? l.subject2Hours ?? 0);
      const h3 = Number(subs[2]?.hours ?? l.subject3Hours ?? 0);
      const tot = Number(l.totalHours || h1 + h2 + h3 || 0);
      const focus = Number(subs[0]?.focus ?? l.focusScore ?? 0);
      const prod = Number(subs[0]?.productivity ?? l.productivityScore ?? 0);
      const notes = escapeSql(l.notes || null);
      const proof = escapeSql(l.proofPhotoUrl || l.proofUrl || null);
      const createdAt = escapeSql(l.timestamp || timestamp);

      sql += `INSERT INTO daily_logs (log_id, study_id, student_name, stream, date_of_study, subject1_hours, subject2_hours, subject3_hours, total_hours, focus_score, productivity_score, notes, proof_url, created_at) VALUES (${logId}, ${studyId}, ${name}, ${stream}, ${date}, ${h1}, ${h2}, ${h3}, ${tot}, ${focus}, ${prod}, ${notes}, ${proof}, ${createdAt});\n`;
    });
    sql += '\n';
  }

  return sql;
}

export function downloadSqlFile(filename: string, sqlString: string): void {
  if (typeof document === 'undefined') return;
  const blob = new Blob([sqlString], { type: 'application/sql;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Calculates decimal duration in hours between two HH:MM strings.
 * Accurately handles overnight spans (e.g. 23:00 to 01:30 = 2.5 hours).
 */
export function calculateDurationFromTimes(start: string, end: string): number {
  if (!start || !end) return 0;
  const [h1, m1] = start.split(':').map(Number);
  const [h2, m2] = end.split(':').map(Number);
  if (isNaN(h1) || isNaN(m1) || isNaN(h2) || isNaN(m2)) return 0;

  let mins = (h2 * 60 + m2) - (h1 * 60 + m1);
  if (mins < 0) mins += 24 * 60; // Overnight rollover
  return Number((mins / 60).toFixed(2));
}

/**
 * Formats decimal hours into a friendly human string (e.g. 1.75 -> "1h 45m").
 */
export function formatHoursHuman(hours: number): string {
  const totalMins = Math.round((Number(hours) || 0) * 60);
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/**
 * Determines whether a student account is verified by administration.
 * Restricts unverified, pending, or suspended accounts.
 */
export function isStudentVerified(member?: any): boolean {
  if (!member) return false;
  const status = String(member.status || '').trim().toLowerCase();
  if (status === 'pending' || status === 'unverified' || status === 'suspended' || status === 'inactive' || status === 'banned') {
    return false;
  }
  if (member.adminVerified === false) {
    return false;
  }
  if (member.adminVerified === true || status === 'verified') {
    return true;
  }
  // Newly registered or general 'active' accounts must be explicitly approved/verified by administrator
  return false;
}

/**
 * Returns formatted verification badge metadata for UI displays.
 */
export function getVerificationStatusInfo(status?: string): {
  label: string;
  color: 'emerald' | 'amber' | 'rose' | 'zinc';
  isVerified: boolean;
  description: string;
} {
  const s = String(status || 'Pending').trim().toLowerCase();
  if (s === 'verified') {
    return {
      label: 'Verified Member',
      color: 'emerald',
      isVerified: true,
      description: 'Account officially approved and verified by administrator.',
    };
  }
  if (s === 'suspended' || s === 'banned') {
    return {
      label: 'Suspended',
      color: 'rose',
      isVerified: false,
      description: 'Account access and public verification currently suspended.',
    };
  }
  return {
    label: 'Pending Verification',
    color: 'amber',
    isVerified: false,
    description: 'Account registered and currently awaiting administrator review.',
  };
}

