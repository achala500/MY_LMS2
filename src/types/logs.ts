/**
 * StudySync — Daily Study Logs & Analytics Types
 */

/**
 * Individual subject study session entry (within a day)
 */
export interface StudySession {
  id?: string;
  subject: string;          // e.g. "Biology", "Chemistry", "Combined Maths", "Physics", "ICT"
  hours: number;            // Numeric hours (decimal, e.g. 1.5)
  startTime?: string;       // e.g. "08:30"
  endTime?: string;         // e.g. "10:00"
  focus?: number;           // Rating 1 - 10
  productivity?: number;    // Rating 1 - 10
  notes?: string;           // Session-specific topics or notes
  topic?: string;           // Specific topic studied
  color?: string;           // Optional calendar block color
}

export interface SubjectLog {
  name: string;             // e.g. "Biology", "Chemistry", "Combined Maths", "Physics", "ICT", "Agriculture"
  hours: number;            // Numeric hours (decimal, e.g. 2.5)
  focus: number;            // Rating 1 - 10
  productivity: number;     // Rating 1 - 10
}

export type SubjectStudyEntry = SubjectLog;

/**
 * Complete Daily Log Entry corresponding to the 19-column Google Sheet 'DailyLogs'
 */
export interface DailyLogEntry {
  logId?: string;
  timestamp?: string;        // Col A: ISO 8601 submission timestamp
  studyId: string;          // Col B: Foreign key to Member studyId
  fullName?: string;
  name?: string;
  stream?: string;
  email?: string;            // Col C: Student email
  dateOfStudy?: string;      // Col D: Study date in YYYY-MM-DD format
  date?: string;
  Date?: string;
  sessions?: StudySession[]; // Multiple individual study sessions logged for this day
  subjects?: [SubjectLog, SubjectLog, SubjectLog] | SubjectLog[]; // Exactly 3 subjects
  subject1?: string;
  subject2?: string;
  subject3?: string;
  subject1Hours?: number;
  subject2Hours?: number;
  subject3Hours?: number;
  hoursSubject1?: number;
  hoursSubject2?: number;
  hoursSubject3?: number;
  totalHours: number;       // Sum of hours across 3 subjects
  focusScore?: number;
  focusLevel?: number;
  productivityScore?: number;
  productivityLevel?: number;
  notes?: string;           // Col Q: Study notes / remarks
  telegram?: string;        // Col R: Telegram handle
  telegramUsername?: string;
  proofPhotoUrl?: string;   // Col S: Drive URL or mock URL for proof photo
  proofUrl?: string;
  proofImage?: string;
  avgFocus?: number;
  avgProductivity?: number;
  [key: string]: any;
}


/**
 * Client-side Proof Photo upload payload
 */
export interface ProofFileUpload {
  base64: string;           // Base64 encoded file string (with or without data URL prefix)
  mimeType?: string;        // e.g. "image/jpeg"
  fileName?: string;        // e.g. "proof_2026-08-26.jpg"
}

/**
 * Student Personal Analytics and Rollup Statistics
 */
export interface StudentStats {
  currentStreak?: number;
  activeStreak: number;
  maxStreak?: number;
  longestStreak?: number;
  totalHours: number;
  subjectHours?: Record<string, number>;
  perSubjectHours?: Record<string, number>;
  avgFocus: number;
  avgProductivity: number;
  totalLogs?: number;
  totalEntries: number;
  lastStudyDate?: string | null;
}

/**
 * Study Streak calculation result
 */
export interface StreakResult {
  currentStreak: number;
  longestStreak: number;
  studiedToday: boolean;
  lastStudyDate: string | null;
}
