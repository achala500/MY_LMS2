/**
 * StudySync â€” API Request & Response Types for Google Apps Script Backend
 */

import { MemberData, VerifiedMember, GenderType, StreamType, MemberStatus } from './member';
import { DailyLogEntry, SubjectLog, ProofFileUpload, StudentStats } from './logs';

/**
 * Authoritative API Action Names supported by Google Apps Script backend
 */
export type ApiAction =
  | 'checkUser'
  | 'registerUser'
  | 'submitDailyLog'
  | 'getStudentHistory'
  | 'verifyMember'
  | 'getAdminData'
  | 'adminUpdateMember'
  | 'adminDeleteMember'
  | 'adminDeleteLog'
  | 'adminAddMember'
  | 'getAnalytics'
  | 'ping'
  | 'updateProfile'
  | 'telegramWebhook'
  | 'broadcastDailyDigest'
  | 'logTestMark'
  | 'getTestMarks'
  | 'deleteTestMark';

/**
 * Universal JSON response envelope returned by backend
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data: T | null;
  error: string | null;
  timestamp: string;
}

// ----------------------------------------------------------------------------
// 1. checkUser
// ----------------------------------------------------------------------------
export interface CheckUserPayload {
  action?: 'checkUser';
  email: string;
}

export interface CheckUserResponseData {
  registered: boolean;
  member: MemberData | null;
  todayLog: DailyLogEntry | { data?: DailyLogEntry; [key: string]: any } | null;
  stats: StudentStats | null;
}

// ----------------------------------------------------------------------------
// 2. registerUser
// ----------------------------------------------------------------------------
export interface RegisterUserPayload {
  action?: 'registerUser';
  fullName: string;
  email: string;
  gender?: GenderType | string;
  telegram?: string;
  telegramUsername?: string;
  school: string;
  stream: StreamType | string;
  optionalSubject?: string;
  examYear?: string;
}

export interface RegisterUserResponseData {
  alreadyRegistered: boolean;
  studyId?: string;
  fullName?: string;
  email?: string;
  gender?: string;
  telegram?: string;
  school?: string;
  stream?: string;
  optionalSubject?: string;
  examYear?: string;
  registrationDate?: string;
  status?: string;
  member?: MemberData;
}

// ----------------------------------------------------------------------------
// 3. submitDailyLog
// ----------------------------------------------------------------------------
export interface SubmitDailyLogPayload {
  action?: 'submitDailyLog';
  studyId: string;
  email: string;
  fullName?: string;
  stream?: string;
  dateOfStudy: string; // YYYY-MM-DD
  sessions?: import('./logs').StudySession[]; // Multiple individual study sessions
  subjects?: Array<{
    name: string;
    hours: number;
    focus: number;
    productivity: number;
  }>;
  hoursSubject1?: number;
  hoursSubject2?: number;
  hoursSubject3?: number;
  totalHours?: number;
  focusScore?: number;
  productivityScore?: number;
  notes?: string;
  telegram?: string;
  telegramUsername?: string;
  proofFile?: ProofFileUpload;
  photoProofBase64?: string;
  proofPhotoUrl?: string;
  proofUrl?: string;
  manualOverride?: boolean;
}


export interface SubmitDailyLogResponseData {
  isDuplicate: boolean;
  message?: string;
  logId?: string;
  studyId?: string;
  dateOfStudy?: string;
  totalHours?: number;
  proofPhotoUrl?: string;
  log?: DailyLogEntry;
  existingLog?: DailyLogEntry;
  rawRow?: any;
}

// ----------------------------------------------------------------------------
// 4. getStudentHistory
// ----------------------------------------------------------------------------
export interface StudentHistoryPayload {
  action?: 'getStudentHistory';
  studyId?: string;
  email?: string;
}

export interface StudentHistoryResponseData {
  studyId: string;
  logs: DailyLogEntry[];
  history?: DailyLogEntry[];
  stats: StudentStats;
}


// ----------------------------------------------------------------------------
// 5. verifyMember
// ----------------------------------------------------------------------------
export interface VerifyMemberPayload {
  action?: 'verifyMember';
  studyId?: string;
  id?: string;
}

export interface VerifyMemberResponseData {
  valid: boolean;
  member?: VerifiedMember;
  message?: string;
  error?: string;
}

// ----------------------------------------------------------------------------
// 6. getAdminData
// ----------------------------------------------------------------------------
export interface GetAdminDataPayload {
  action?: 'getAdminData';
  adminEmail: string;
}

export interface StreamStats {
  members: number;
  totalHours: number;
  totalLogs?: number;
}

export interface GroupAnalytics {
  totalMembers: number;
  activeMembers: number;
  totalHours: number;
  totalLogs: number;
  avgDailyHours: number;
  avgGroupFocus: number;
  avgGroupProductivity: number;
  streamBreakdown: {
    'Biological Science': StreamStats;
    'Physical Science': StreamStats;
    [key: string]: StreamStats;
  };
}

export interface LeaderboardEntry {
  rank?: number;
  studyId: string;
  name?: string;
  fullName?: string;
  school: string;
  stream: string;
  totalHours: number;
  totalLogs?: number;
  streak: number;
  maxStreak?: number;
  avgFocus: number;
  avgProductivity: number;
}

export interface AdminDataResponseData {
  members: MemberData[];
  recentLogs: DailyLogEntry[];
  logs?: DailyLogEntry[];
  analytics: GroupAnalytics;
  leaderboard: LeaderboardEntry[];
  admins?: string[];
  examDates?: Record<string, string>;
}

// ----------------------------------------------------------------------------
// 7. adminUpdateMember
// ----------------------------------------------------------------------------
export interface AdminUpdateMemberPayload {
  action?: 'adminUpdateMember';
  adminEmail: string;
  studyId: string;
  email?: string;
  fullName?: string;
  school?: string;
  stream?: StreamType | string;
  optionalSubject?: string;
  examYear?: string;
  telegram?: string;
  telegramUsername?: string;
  status?: MemberStatus | string;
}


export interface AdminUpdateMemberResponseData {
  updated: boolean;
  member: MemberData;
}

// ----------------------------------------------------------------------------
// 8. getAnalytics
// ----------------------------------------------------------------------------
export interface GetAnalyticsPayload {
  action?: 'getAnalytics';
}

export interface KPIStats {
  totalMembers: number;
  activeMembers: number;
  totalStudyHours: number;
  totalLogs: number;
  avgDailyHours: number;
  avgGroupFocus: number;
  avgGroupProductivity: number;
}

export interface AnalyticsResponseData {
  kpi: KPIStats;
  streamBreakdown: {
    'Biological Science': StreamStats;
    'Physical Science': StreamStats;
    [key: string]: StreamStats;
  };
  topStreaks: LeaderboardEntry[];
  examDates?: Record<string, string>;
  admins?: string[];
}

// ----------------------------------------------------------------------------
// 9. ping
// ----------------------------------------------------------------------------
export interface PingResponseData {
  status: string;
  service: string;
  timestamp: string;
}

// ----------------------------------------------------------------------------
// 10. updateProfile
// ----------------------------------------------------------------------------
export interface UpdateProfilePayload {
  action?: 'updateProfile';
  email?: string;
  studyId?: string;
  fullName?: string;
  gender?: GenderType | string;
  telegram?: string;
  school?: string;
  stream?: StreamType | string;
  optionalSubject?: string;
  examYear?: string;
  district?: string;
  targetWeeklyHours?: number;
  status?: MemberStatus | string;
}

export interface UpdateProfileResponseData {
  updated: boolean;
  member: MemberData;
}

// ----------------------------------------------------------------------------
// 11. telegramWebhook
// ----------------------------------------------------------------------------
export interface TelegramWebhookPayload {
  action?: 'telegramWebhook';
  update_id?: number;
  message?: {
    message_id?: number;
    from?: {
      id?: number;
      is_bot?: boolean;
      first_name?: string;
      last_name?: string;
      username?: string;
      language_code?: string;
    };
    chat?: {
      id: number | string;
      type?: 'private' | 'group' | 'supergroup' | 'channel' | string;
      title?: string;
      username?: string;
      first_name?: string;
      last_name?: string;
    };
    date?: number;
    text?: string;
    [key: string]: any;
  };
  callback_query?: any;
  [key: string]: any;
}

export interface TelegramWebhookResponseData {
  handled: boolean;
  command: string;
  chatId: number | string;
  replyText?: string;
  member?: any;
  studyId?: string;
  error?: string;
}

// ----------------------------------------------------------------------------
// 12. broadcastDailyDigest
// ----------------------------------------------------------------------------
export interface BroadcastDailyDigestPayload {
  action?: 'broadcastDailyDigest';
  adminEmail: string;
  chatId?: string | number;
  previewOnly?: boolean;
}

export interface BroadcastDailyDigestResponseData {
  broadcastSent: boolean;
  chatId: string | number;
  digestText: string;
  stats: {
    activeStudentsToday: number;
    totalActiveMembers: number;
    totalStudyHoursToday: number;
    topStreakDays: number;
    bioHours?: number;
    mathHours?: number;
    avgGroupFocus?: number;
  };
}

