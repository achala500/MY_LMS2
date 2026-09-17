/**
 * StudySync â€” Utilities Module
 * Date helpers, streak math algorithm, personal analytics rollups, client-side Canvas image compression pipeline, and input sanitizers.
 */

// ==========================================
// 1. DATE HELPERS
// ==========================================

/**
 * Get current date string formatted as YYYY-MM-DD in local timezone
 * @param {Date} [d=new Date()]
 * @returns {string} e.g. "2026-08-26"
 */
export function getTodayDateString(d = new Date()) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format date string into human-readable format
 * @param {string|Date} dateVal 
 * @param {'short'|'medium'|'long'|'iso'} [style='medium'] 
 * @returns {string}
 */
export function formatDate(dateVal, style = 'medium') {
  if (!dateVal) return '';
  const d = typeof dateVal === 'string' ? parseDateString(dateVal) : dateVal;
  if (isNaN(d.getTime())) return String(dateVal);

  if (style === 'iso') {
    return getTodayDateString(d);
  }

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fullMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
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
 * Parse YYYY-MM-DD or standard ISO date string safely
 * @param {string} str 
 * @returns {Date}
 */
export function parseDateString(str) {
  if (!str) return new Date();
  if (str instanceof Date) return str;

  // Handle YYYY-MM-DD format explicitly to avoid UTC timezone off-by-one shifts
  const parts = str.split('T')[0].split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return new Date(year, month, day, 12, 0, 0);
  }

  return new Date(str);
}

/**
 * Check if a date string is today
 * @param {string} dateStr 
 * @returns {boolean}
 */
export function isToday(dateStr) {
  if (!dateStr) return false;
  return getTodayDateString(parseDateString(dateStr)) === getTodayDateString();
}

/**
 * Check if a date string is in the future
 * @param {string} dateStr 
 * @returns {boolean}
 */
export function isFutureDate(dateStr) {
  if (!dateStr) return false;
  const target = getTodayDateString(parseDateString(dateStr));
  const today = getTodayDateString();
  return target > today;
}

/**
 * Calculate difference in calendar days between two dates (d2 - d1)
 * @param {string|Date} d1 
 * @param {string|Date} d2 
 * @returns {number}
 */
export function daysBetween(d1, d2) {
  const date1 = parseDateString(d1);
  const date2 = parseDateString(d2);
  const ut1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const ut2 = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());
  return Math.floor((ut2 - ut1) / (1000 * 60 * 60 * 24));
}

// ==========================================
// 2. STREAK MATH ALGORITHM
// ==========================================

/**
 * Calculate consecutive daily study streak from an array of study logs
 * @param {Array<Object>} logs - Array of logs with `dateOfStudy` or `date` field
 * @returns {{ currentStreak: number, longestStreak: number, studiedToday: boolean, lastStudyDate: string|null }}
 */
export function calculateStreak(logs) {
  if (!Array.isArray(logs) || logs.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      studiedToday: false,
      lastStudyDate: null
    };
  }

  // Extract unique sorted date strings (YYYY-MM-DD descending)
  const dateSet = new Set();
  for (const log of logs) {
    const rawDate = log.dateOfStudy || log.date || log.Date || log.timestamp;
    if (rawDate) {
      const formatted = getTodayDateString(parseDateString(String(rawDate)));
      dateSet.add(formatted);
    }
  }

  const uniqueDates = Array.from(dateSet).sort((a, b) => b.localeCompare(a));
  if (uniqueDates.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      studiedToday: false,
      lastStudyDate: null
    };
  }

  const todayStr = getTodayDateString();
  const studiedToday = uniqueDates.includes(todayStr);
  const lastStudyDate = uniqueDates[0];

  // Calculate current streak
  let currentStreak = 0;
  
  // A streak is active if the student studied today OR yesterday
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getTodayDateString(yesterday);

  if (studiedToday || uniqueDates[0] === yesterdayStr) {
    let checkDate = parseDateString(studiedToday ? todayStr : yesterdayStr);
    
    while (true) {
      const checkStr = getTodayDateString(checkDate);
      if (dateSet.has(checkStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Calculate longest streak across all history
  let longestStreak = 0;
  let runningStreak = 0;
  
  // Sort ascending for chronological traversal
  const chronologicalDates = Array.from(dateSet).sort((a, b) => a.localeCompare(b));
  let prevDate = null;

  for (const dStr of chronologicalDates) {
    const currDate = parseDateString(dStr);
    if (!prevDate) {
      runningStreak = 1;
    } else {
      const diff = daysBetween(prevDate, currDate);
      if (diff === 1) {
        runningStreak++;
      } else if (diff > 1) {
        runningStreak = 1;
      }
    }
    if (runningStreak > longestStreak) {
      longestStreak = runningStreak;
    }
    prevDate = currDate;
  }

  return {
    currentStreak,
    longestStreak,
    studiedToday,
    lastStudyDate
  };
}

// ==========================================
// 3. PERSONAL & GROUP ANALYTICS ROLLUPS
// ==========================================

/**
 * Compute aggregate metrics and subject breakdowns from an array of study logs
 * @param {Array<Object>} logs 
 * @returns {Object}
 */
export function calculateStats(logs) {
  if (!Array.isArray(logs) || logs.length === 0) {
    return {
      totalHours: 0,
      totalSubmissions: 0,
      avgDailyHours: 0,
      avgFocus: 0,
      avgProductivity: 0,
      subjectTotals: {},
      subjectAverages: {},
      streak: { currentStreak: 0, longestStreak: 0, studiedToday: false, lastStudyDate: null }
    };
  }

  let totalHours = 0;
  let totalFocusScore = 0;
  let totalFocusCount = 0;
  let totalProdScore = 0;
  let totalProdCount = 0;

  const subjectTotals = {};
  const subjectFocus = {};
  const subjectProd = {};

  for (const log of logs) {
    // 1. Process subject array format: log.subjects = [{name, hours, focus, productivity}]
    if (Array.isArray(log.subjects)) {
      for (const subj of log.subjects) {
        if (!subj || !subj.name) continue;
        const name = String(subj.name).trim();
        const hours = parseFloat(subj.hours) || 0;
        const focus = parseFloat(subj.focus) || 0;
        const prod = parseFloat(subj.productivity) || 0;

        totalHours += hours;
        subjectTotals[name] = (subjectTotals[name] || 0) + hours;

        if (focus > 0) {
          totalFocusScore += focus;
          totalFocusCount++;
          if (!subjectFocus[name]) subjectFocus[name] = { sum: 0, count: 0 };
          subjectFocus[name].sum += focus;
          subjectFocus[name].count++;
        }

        if (prod > 0) {
          totalProdScore += prod;
          totalProdCount++;
          if (!subjectProd[name]) subjectProd[name] = { sum: 0, count: 0 };
          subjectProd[name].sum += prod;
          subjectProd[name].count++;
        }
      }
    } else {
      // 2. Process flat sheet column format: subject1Name, subject1Hours, etc.
      for (let i = 1; i <= 3; i++) {
        const name = log[`subject${i}Name`] || log[`Subject ${i} Name`];
        const hours = parseFloat(log[`subject${i}Hours`] || log[`Subject ${i} Hours`]) || 0;
        const focus = parseFloat(log[`subject${i}Focus`] || log[`Subject ${i} Focus`]) || 0;
        const prod = parseFloat(log[`subject${i}Productivity`] || log[`Subject ${i} Productivity`]) || 0;

        if (name) {
          const sName = String(name).trim();
          totalHours += hours;
          subjectTotals[sName] = (subjectTotals[sName] || 0) + hours;

          if (focus > 0) {
            totalFocusScore += focus;
            totalFocusCount++;
          }
          if (prod > 0) {
            totalProdScore += prod;
            totalProdCount++;
          }
        }
      }
    }
  }

  const totalSubmissions = logs.length;
  const avgDailyHours = totalSubmissions > 0 ? parseFloat((totalHours / totalSubmissions).toFixed(1)) : 0;
  const avgFocus = totalFocusCount > 0 ? parseFloat((totalFocusScore / totalFocusCount).toFixed(1)) : 0;
  const avgProductivity = totalProdCount > 0 ? parseFloat((totalProdScore / totalProdCount).toFixed(1)) : 0;

  return {
    totalHours: parseFloat(totalHours.toFixed(1)),
    totalSubmissions,
    avgDailyHours,
    avgFocus,
    avgProductivity,
    subjectTotals,
    streak: calculateStreak(logs)
  };
}

// ==========================================
// 4. CLIENT-SIDE CANVAS IMAGE COMPRESSION
// ==========================================

/**
 * Compress an image file on the client using HTML5 Canvas before uploading to Drive.
 * Downscales images exceeding maxDimension and compresses to JPEG quality 0.75 (< 400KB target).
 * 
 * @param {File|Blob} file 
 * @param {number} [maxDimension=1600] 
 * @param {number} [quality=0.75] 
 * @returns {Promise<{ base64: string, dataUrl: string, blob: Blob, originalSize: number, compressedSize: number, mimeType: string, width: number, height: number }>}
 */
export async function compressImage(file, maxDimension = 1600, quality = 0.75) {
  if (!file) throw new Error('[compressImage] No file provided');

  return new Promise((resolve, reject) => {
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

        // Draw to off-screen Canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Export to JPEG Data URL
        const mimeType = 'image/jpeg';
        const dataUrl = canvas.toDataURL(mimeType, quality);
        const base64 = dataUrl.split(',')[1];

        // Also convert to Blob for size checking
        canvas.toBlob((blob) => {
          resolve({
            base64,
            dataUrl,
            blob,
            originalSize: file.size,
            compressedSize: blob.size,
            mimeType,
            width,
            height,
            fileName: (file.name || 'proof.jpg').replace(/\.[^/.]+$/, "") + '.jpg'
          });
        }, mimeType, quality);
      };

      img.onerror = () => {
        reject(new Error('Failed to load image for canvas compression'));
      };

      img.src = e.target.result;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file for compression'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Format bytes into human-readable string (e.g. 340 KB, 1.2 MB)
 * @param {number} bytes 
 * @param {number} [decimals=1] 
 * @returns {string}
 */
export function formatBytes(bytes, decimals = 1) {
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
 * @param {string} str 
 * @returns {string}
 */
export function sanitizeString(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Sanitize and format Telegram username with '@' prefix
 * @param {string} username 
 * @returns {string}
 */
export function formatTelegramUsername(username) {
  if (!username) return '';
  let cleaned = String(username).trim();
  if (cleaned.startsWith('@')) {
    cleaned = cleaned.substring(1);
  }
  // Allow alphanumeric and underscore
  cleaned = cleaned.replace(/[^a-zA-Z0-9_]/g, '');
  return cleaned.length > 0 ? `@${cleaned}` : '';
}

/**
 * RFC 5322 standard email validation regex
 * @param {string} email 
 * @returns {boolean}
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email.trim());
}

/**
 * Validate Study ID format: SG-BIO-0001 or SG-MATH-0001
 * @param {string} studyId 
 * @returns {boolean}
 */
export function validateStudyId(studyId) {
  if (!studyId || typeof studyId !== 'string') return false;
  const re = /^SG-(BIO|MATH)-\d{4}$/;
  return re.test(studyId.trim().toUpperCase());
}

// ==========================================
// 6. RFC 4180 CSV EXPORT HELPERS
// ==========================================

export function sanitizeCsvFormula(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.length === 0) return '';
  if (/^[=+\-@\t\r]/.test(str)) {
    return `'${str}`;
  }
  return str;
}

/**
 * Format a single CSV cell value according to RFC 4180
 * (escapes fields with commas, quotes, or newlines)
 * @param {*} val 
 * @returns {string}
 */
export function formatCsvCell(val) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Generate an RFC 4180 compliant CSV string from headers and 2D row array
 * @param {Array<string>} headers 
 * @param {Array<Array<*>>} rows 
 * @returns {string}
 */
export function generateCsvString(headers, rows) {
  const headerLine = headers.map(formatCsvCell).join(',');
  const rowLines = (rows || []).map(row => (row || []).map(formatCsvCell).join(','));
  return [headerLine, ...rowLines].join('\r\n');
}

/**
 * Trigger client-side browser file download for a CSV string
 * @param {string} filename 
 * @param {string} csvContent 
 */
export function downloadCsvFile(filename, csvContent) {
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

function escapeXml(str) {
  if (str === null || str === undefined) return '';
  const s = sanitizeCsvFormula(String(str));
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function generateExcelXmlString(members = [], logs = []) {
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

function escapeSql(val) {
  if (val === null || val === undefined) return 'NULL';
  const str = String(val).replace(/'/g, "''");
  return `'${str}'`;
}

export function generateSqlDump(members = [], logs = []) {
  const timestamp = new Date().toISOString();
  let sql = `-- StudySync Academic Database Dump\n`;
  sql += `CREATE TABLE IF NOT EXISTS members (study_id VARCHAR(32) PRIMARY KEY, full_name VARCHAR(255) NOT NULL, email VARCHAR(255) UNIQUE NOT NULL, school VARCHAR(255), stream VARCHAR(64) NOT NULL, optional_subject VARCHAR(64), exam_year VARCHAR(10) DEFAULT '2026', telegram_username VARCHAR(128), registration_date TIMESTAMP, status VARCHAR(32) DEFAULT 'Active');\n`;
  sql += `CREATE TABLE IF NOT EXISTS daily_logs (log_id VARCHAR(64) PRIMARY KEY, study_id VARCHAR(32) NOT NULL, student_name VARCHAR(255), stream VARCHAR(64), date_of_study DATE NOT NULL, subject1_hours NUMERIC(5,2) DEFAULT 0, subject2_hours NUMERIC(5,2) DEFAULT 0, subject3_hours NUMERIC(5,2) DEFAULT 0, total_hours NUMERIC(5,2) NOT NULL, focus_score INTEGER, productivity_score INTEGER, notes TEXT, proof_url TEXT, created_at TIMESTAMP);\n\n`;

  if (members.length > 0) {
    for (const m of members) {
      sql += `INSERT INTO members (study_id, full_name, email, school, stream, optional_subject, exam_year, telegram_username, registration_date, status) VALUES (${escapeSql(m.studyId)}, ${escapeSql(m.fullName || m.name)}, ${escapeSql(m.email)}, ${escapeSql(m.school)}, ${escapeSql(m.stream)}, ${escapeSql(m.optionalSubject || null)}, ${escapeSql(m.examYear || '2026')}, ${escapeSql(m.telegramUsername || m.telegram || null)}, ${escapeSql(m.registrationDate || timestamp)}, ${escapeSql(m.status || 'Active')});\n`;
    }
  }

  if (logs.length > 0) {
    logs.forEach((l, idx) => {
      const subs = l.subjects || [];
      const h1 = Number(subs[0]?.hours ?? l.subject1Hours ?? 0);
      const h2 = Number(subs[1]?.hours ?? l.subject2Hours ?? 0);
      const h3 = Number(subs[2]?.hours ?? l.subject3Hours ?? 0);
      const tot = Number(l.totalHours || h1 + h2 + h3 || 0);
      const focus = Number(subs[0]?.focus ?? l.focusScore ?? 0);
      const prod = Number(subs[0]?.productivity ?? l.productivityScore ?? 0);

      sql += `INSERT INTO daily_logs (log_id, study_id, student_name, stream, date_of_study, subject1_hours, subject2_hours, subject3_hours, total_hours, focus_score, productivity_score, notes, proof_url, created_at) VALUES (${escapeSql(l.logId || `LOG-${l.studyId}-${idx}`)}, ${escapeSql(l.studyId)}, ${escapeSql(l.fullName || l.name || null)}, ${escapeSql(l.stream || null)}, ${escapeSql(l.dateOfStudy || l.date)}, ${h1}, ${h2}, ${h3}, ${tot}, ${focus}, ${prod}, ${escapeSql(l.notes || null)}, ${escapeSql(l.proofPhotoUrl || l.proofUrl || null)}, ${escapeSql(l.timestamp || timestamp)});\n`;
    });
  }

  return sql;
}

/**
 * Calculates decimal duration in hours between two HH:MM strings.
 * Accurately handles overnight spans (e.g. 23:00 to 01:30 = 2.5 hours).
 */
export function calculateDurationFromTimes(start, end) {
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
export function formatHoursHuman(hours) {
  const totalMins = Math.round((Number(hours) || 0) * 60);
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/**
 * Returns subject badge configuration including abbreviation, colors, and hex values
 */
export function getSubjectBadgeConfig(subjectName) {
  const normalized = (subjectName || '').trim().toLowerCase();

  if (normalized.includes('bio')) {
    return {
      abbr: 'Bio',
      fullName: 'Biology',
      badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25',
      dotColor: 'bg-emerald-400',
      borderColor: 'border-emerald-500/30',
      hex: '#10b981',
    };
  }
  if (normalized.includes('math') || normalized.includes('comb')) {
    return {
      abbr: 'Maths',
      fullName: 'Combined Maths',
      badgeClass: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/25',
      dotColor: 'bg-indigo-400',
      borderColor: 'border-indigo-500/30',
      hex: '#6366f1',
    };
  }
  if (normalized.includes('phys')) {
    return {
      abbr: 'Phys',
      fullName: 'Physics',
      badgeClass: 'bg-purple-500/15 text-purple-300 border-purple-500/30 hover:bg-purple-500/25',
      dotColor: 'bg-purple-400',
      borderColor: 'border-purple-500/30',
      hex: '#a855f7',
    };
  }
  if (normalized.includes('chem')) {
    return {
      abbr: 'Chem',
      fullName: 'Chemistry',
      badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/25',
      dotColor: 'bg-amber-400',
      borderColor: 'border-amber-500/30',
      hex: '#f59e0b',
    };
  }
  if (normalized.includes('ict') || normalized.includes('info') || normalized.includes('tech')) {
    return {
      abbr: 'ICT',
      fullName: 'ICT',
      badgeClass: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/25',
      dotColor: 'bg-cyan-400',
      borderColor: 'border-cyan-500/30',
      hex: '#06b6d4',
    };
  }
  if (normalized.includes('agri')) {
    return {
      abbr: 'Agri',
      fullName: 'Agriculture',
      badgeClass: 'bg-lime-500/15 text-lime-300 border-lime-500/30 hover:bg-lime-500/25',
      dotColor: 'bg-lime-400',
      borderColor: 'border-lime-500/30',
      hex: '#84cc16',
    };
  }

  const shortName = subjectName ? (subjectName.length > 5 ? subjectName.slice(0, 4) : subjectName) : 'Sub';
  return {
    abbr: shortName,
    fullName: subjectName || 'Other Subject',
    badgeClass: 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700/80',
    dotColor: 'bg-zinc-400',
    borderColor: 'border-zinc-700',
    hex: '#71717a',
  };
}

export default {
  getTodayDateString,
  formatDate,
  parseDateString,
  isToday,
  isFutureDate,
  daysBetween,
  calculateStreak,
  calculateStats,
  compressImage,
  formatBytes,
  sanitizeString,
  sanitizeCsvFormula,
  formatTelegramUsername,
  validateEmail,
  validateStudyId,
  formatCsvCell,
  generateCsvString,
  downloadCsvFile,
  generateExcelXmlString,
  generateSqlDump,
  calculateDurationFromTimes,
  formatHoursHuman,
  getSubjectBadgeConfig,
};


