# Comprehensive Plan & Specification: Typed API Client & Data Models (Milestone 2)

## 1. Executive Summary & Architecture Overview

The StudySync application connects to a live Google Apps Script Web App backed by Google Sheets and Google Drive.
This document details the architectural blueprint and exact TypeScript specifications for:
- Data Models (`src/types/member.ts`, `src/types/logs.ts`)
- API Contract & Envelope Types (`src/types/api.ts`)
- The Unified Typed API Client (`src/lib/api.ts`)

### Key Architecture Principles
1. **Live Google Apps Script Integration**: 100% live Google Apps Script Web App endpoint communication with zero mock data.
2. **CORS & Redirect Safe HTTP Pattern**: All POST requests to Google Apps Script (`script.google.com`) strictly use `Content-Type: text/plain;charset=utf-8` with JSON stringified bodies. This prevents browser preflight `OPTIONS` requests (which Google Apps Script cannot handle) and permits seamless 302 redirect traversal by the browser `fetch()` API.
3. **Resilience & Timeout Handling**: Standard 30-second timeout with `AbortController`, graceful error handling for non-JSON responses, structured error messaging, and environment fallback support for testing.
4. **Strict Typing**: Full TypeScript typing across all 9 authoritative actions, payloads, response envelopes, and domain models.

---

## 2. Live Backend Specifications & Constraints

- **Endpoint URL**: `https://script.google.com/macros/s/AKfycbwA5AQwT7cOipModhNXrWBQOOTkvv_RVHRkuxpS6iFyu_t_n6x0wo1YDkKemzC0cGPO/exec`
- **Spreadsheet ID**: `1CI8KbQU-XJ_HvqEv2yu-d1oRf0focH9cdozo0YIhhY0`
- **Admin Email**: `alwisachalaanurada@gmail.com` (and whitelisted aliases)
- **Timezone**: `Asia/Colombo` (UTC+05:30)

### Response Envelope Standard
Every Apps Script endpoint returns a standard JSON envelope:
```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "timestamp": "2026-08-26T10:00:00.000Z"
}
```

---

## 3. Data Models Specification

### 3.1 `src/types/member.ts`

```typescript
/**
 * StudySync Member Domain Models & Types
 */

export type StreamType = 'Biological Science' | 'Physical Science';

export type GenderType = 'Male' | 'Female' | 'Other';

export type MemberStatus = 'Active' | 'Inactive';

/**
 * Full Member record representing a row in the 10-column Google Sheet 'Members'
 */
export interface MemberData {
  studyId: string;           // Col A: e.g. "SG-BIO-0001" or "SG-MATH-0001"
  fullName: string;          // Col B: Student Full Name
  email: string;             // Col C: Unique Email Key
  gender: GenderType | string; // Col D: Gender
  telegram: string;          // Col E: Telegram Handle (e.g. "@student")
  school: string;            // Col F: School Name
  stream: StreamType | string; // Col G: Stream
  optionalSubject: string;   // Col H: 3rd Subject (e.g. "Physics", "Chemistry", "ICT", "Agriculture")
  registrationDate: string;  // Col I: ISO 8601 string or YYYY-MM-DD
  status: MemberStatus | string; // Col J: "Active" or "Inactive"
}

/**
 * Sanitized Public Member record for Digital ID & QR Verification
 * (Omits sensitive email and telegram handles)
 */
export interface VerifiedMember {
  studyId: string;
  fullName: string;
  school: string;
  stream: StreamType | string;
  optionalSubject: string;
  registrationDate: string;
  status: MemberStatus | string;
}

/**
 * Partial update payload for profile / member updates
 */
export interface UpdateMemberPayload {
  fullName?: string;
  gender?: GenderType | string;
  telegram?: string;
  school?: string;
  stream?: StreamType | string;
  optionalSubject?: string;
  status?: MemberStatus | string;
}
```

---

### 3.2 `src/types/logs.ts`

```typescript
/**
 * StudySync Daily Study Logs & Analytics Types
 */

/**
 * Individual subject study session entry
 */
export interface SubjectLog {
  name: string;             // e.g. "Biology", "Chemistry", "Combined Maths", "Physics", "ICT", "Agriculture"
  hours: number;            // Numeric hours (decimal, e.g. 2.5)
  focus: number;            // Rating 1 - 10
  productivity: number;     // Rating 1 - 10
}

/**
 * Complete Daily Log Entry corresponding to the 19-column Google Sheet 'DailyLogs'
 */
export interface DailyLogEntry {
  timestamp: string;        // Col A: ISO 8601 submission timestamp
  studyId: string;          // Col B: Foreign key to Member studyId
  email: string;            // Col C: Student email
  dateOfStudy: string;      // Col D: Study date in YYYY-MM-DD format
  subjects: [SubjectLog, SubjectLog, SubjectLog] | SubjectLog[]; // Exactly 3 subjects
  totalHours: number;       // Sum of hours across 3 subjects
  notes: string;            // Col Q: Study notes / remarks
  telegram: string;         // Col R: Telegram handle
  proofPhotoUrl: string;    // Col S: Drive URL or mock URL for proof photo
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
  currentStreak: number;
  maxStreak: number;
  totalHours: number;
  subjectHours: Record<string, number>;
  avgFocus: number;
  avgProductivity: number;
  totalLogs: number;
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
```

---

### 3.3 `src/types/api.ts`

```typescript
/**
 * StudySync API Request & Response Types for Google Apps Script Backend
 */

import { MemberData, VerifiedMember, GenderType, StreamType, MemberStatus } from './member';
import { DailyLogEntry, SubjectLog, ProofFileUpload, StudentStats } from './logs';

/**
 * Authoritative API Action Names
 */
export type ApiAction =
  | 'checkUser'
  | 'registerUser'
  | 'submitDailyLog'
  | 'getStudentHistory'
  | 'verifyMember'
  | 'getAdminData'
  | 'adminUpdateMember'
  | 'getAnalytics'
  | 'ping'
  | 'updateProfile';

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
  todayLog: DailyLogEntry | null;
  stats: StudentStats | null;
}

// ----------------------------------------------------------------------------
// 2. registerUser
// ----------------------------------------------------------------------------
export interface RegisterUserPayload {
  action?: 'registerUser';
  fullName: string;
  email: string;
  gender: GenderType | string;
  telegram: string;
  school: string;
  stream: StreamType | string;
  optionalSubject?: string;
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
  registrationDate?: string;
  status?: string;
  member?: MemberData; // populated if alreadyRegistered is true
}

// ----------------------------------------------------------------------------
// 3. submitDailyLog
// ----------------------------------------------------------------------------
export interface SubmitDailyLogPayload {
  action?: 'submitDailyLog';
  studyId: string;
  email: string;
  dateOfStudy: string; // YYYY-MM-DD
  subjects: Array<{
    name: string;
    hours: number;
    focus: number;
    productivity: number;
  }>;
  notes?: string;
  telegram?: string;
  proofFile?: ProofFileUpload;
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
  name: string;
  school: string;
  stream: string;
  totalHours: number;
  totalLogs: number;
  streak: number;
  maxStreak: number;
  avgFocus: number;
  avgProductivity: number;
}

export interface AdminDataResponseData {
  members: MemberData[];
  recentLogs: DailyLogEntry[];
  analytics: GroupAnalytics;
  leaderboard: LeaderboardEntry[];
}

// ----------------------------------------------------------------------------
// 7. adminUpdateMember
// ----------------------------------------------------------------------------
export interface AdminUpdateMemberPayload {
  action?: 'adminUpdateMember';
  adminEmail: string;
  studyId: string;
  fullName?: string;
  school?: string;
  stream?: StreamType | string;
  optionalSubject?: string;
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
  status?: MemberStatus | string;
}

export interface UpdateProfileResponseData {
  updated: boolean;
  member: MemberData;
}
```

---

## 4. `src/lib/api.ts` Implementation Design

### Complete Code Specification for `src/lib/api.ts`

```typescript
/**
 * StudySync — Unified Typed ApiClient Engine
 * 
 * Provides 100% genuine Google Apps Script Web App communication for all 9 authoritative endpoints.
 * Enforces strict HTTP POST `Content-Type: text/plain;charset=utf-8` payload pattern to bypass
 * CORS preflight issues and support Google Apps Script 302 redirects.
 */

import type {
  ApiResponse,
  ApiAction,
  CheckUserResponseData,
  RegisterUserPayload,
  RegisterUserResponseData,
  SubmitDailyLogPayload,
  SubmitDailyLogResponseData,
  StudentHistoryResponseData,
  VerifyMemberResponseData,
  AdminDataResponseData,
  AdminUpdateMemberPayload,
  AdminUpdateMemberResponseData,
  AnalyticsResponseData,
  PingResponseData,
  UpdateProfilePayload,
  UpdateProfileResponseData
} from '@/types/api';

// Live Google Apps Script Web App Endpoint URL
export const DEFAULT_API_URL =
  'https://script.google.com/macros/s/AKfycbwA5AQwT7cOipModhNXrWBQOOTkvv_RVHRkuxpS6iFyu_t_n6x0wo1YDkKemzC0cGPO/exec';

export class ApiClientEngine {
  private baseUrl: string;
  private timeoutMs: number;

  constructor(customUrl?: string, timeoutMs: number = 30000) {
    if (customUrl) {
      this.baseUrl = customUrl;
    } else {
      const storedUrl = typeof window !== 'undefined' ? window.localStorage.getItem('STUDYSYNC_API_URL') : null;
      const globalUrl = typeof window !== 'undefined' ? (window as any).STUDYSYNC_API_URL : null;
      this.baseUrl = storedUrl || globalUrl || DEFAULT_API_URL;
    }
    this.timeoutMs = timeoutMs;
  }

  /**
   * Set dynamic base URL (useful for test harness or environment switching)
   */
  public setBaseUrl(url: string): void {
    if (url && typeof url === 'string') {
      this.baseUrl = url.trim();
    }
  }

  /**
   * Get current base URL
   */
  public getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Core request dispatcher implementing the strict text/plain POST pattern
   */
  public async request<T>(
    action: ApiAction | string,
    payload: Record<string, any> = {},
    method: 'GET' | 'POST' = 'POST'
  ): Promise<ApiResponse<T>> {
    const isGet = method.toUpperCase() === 'GET';
    let url = this.baseUrl;
    const requestPayload = { action, ...payload };

    const headers: Record<string, string> = {
      Accept: 'application/json'
    };

    const fetchOptions: RequestInit = {
      method: isGet ? 'GET' : 'POST',
      headers
    };

    if (isGet) {
      const queryParams = new URLSearchParams();
      queryParams.set('action', action);
      for (const [key, val] of Object.entries(payload)) {
        if (val !== undefined && val !== null) {
          queryParams.set(key, String(val));
        }
      }
      url = `${url}${url.includes('?') ? '&' : '?'}${queryParams.toString()}`;
    } else {
      // For Google Apps Script Web App, text/plain;charset=utf-8 prevents CORS preflight OPTIONS failure
      // while allowing JSON payload parsing on the server.
      headers['Content-Type'] = 'text/plain;charset=utf-8';
      fetchOptions.body = JSON.stringify(requestPayload);
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);
      fetchOptions.signal = controller.signal;

      const response = await fetch(url, fetchOptions);
      clearTimeout(timeoutId);

      const rawText = await response.text();
      let resJson: any = null;

      try {
        resJson = JSON.parse(rawText);
      } catch (jsonErr) {
        return {
          success: false,
          data: null,
          error: `Non-JSON response from server (HTTP ${response.status}): ${rawText.substring(0, 150)}`,
          timestamp: new Date().toISOString()
        };
      }

      // If backend returned standard envelope { success, data, error, timestamp }
      if (typeof resJson.success === 'boolean') {
        return resJson as ApiResponse<T>;
      }

      // Fallback normalization
      return {
        success: response.ok,
        data: resJson as T,
        error: response.ok ? null : (resJson.error || `HTTP ${response.status}`),
        timestamp: new Date().toISOString()
      };
    } catch (err: any) {
      const errorMsg =
        err.name === 'AbortError'
          ? 'Request timed out. Please check your network connection.'
          : (err.message || 'Network request failed');

      console.warn(`[ApiClient] Request failed for action '${action}':`, errorMsg);
      return {
        success: false,
        data: null,
        error: errorMsg,
        timestamp: new Date().toISOString()
      };
    }
  }

  // ==========================================================================
  // AUTHORITATIVE ENDPOINT METHODS
  // ==========================================================================

  /**
   * 1. checkUser: Checks if user email is registered; returns profile + today's log + personal stats
   */
  public async checkUser(email: string): Promise<ApiResponse<CheckUserResponseData>> {
    if (!email || !email.trim()) {
      return {
        success: false,
        data: null,
        error: 'Email is required.',
        timestamp: new Date().toISOString()
      };
    }
    return this.request<CheckUserResponseData>('checkUser', { email: email.trim().toLowerCase() });
  }

  /**
   * 2. registerUser: Atomic registration generating sequential Study ID
   */
  public async registerUser(payload: RegisterUserPayload): Promise<ApiResponse<RegisterUserResponseData>> {
    return this.request<RegisterUserResponseData>('registerUser', payload);
  }

  /**
   * 3. submitDailyLog: Submits daily study log with 3 stream subjects and photo proof
   */
  public async submitDailyLog(payload: SubmitDailyLogPayload): Promise<ApiResponse<SubmitDailyLogResponseData>> {
    return this.request<SubmitDailyLogResponseData>('submitDailyLog', payload);
  }

  /**
   * 4. getStudentHistory: Retrieves study log history and computed streaks/stats for a student
   */
  public async getStudentHistory(studyId?: string, email?: string): Promise<ApiResponse<StudentHistoryResponseData>> {
    return this.request<StudentHistoryResponseData>('getStudentHistory', { studyId, email });
  }

  /**
   * 5. verifyMember: Public verification endpoint returning sanitized member card data
   */
  public async verifyMember(studyId: string): Promise<ApiResponse<VerifyMemberResponseData>> {
    if (!studyId || !studyId.trim()) {
      return {
        success: false,
        data: { valid: false },
        error: 'Study ID is required for verification.',
        timestamp: new Date().toISOString()
      };
    }
    return this.request<VerifyMemberResponseData>('verifyMember', { studyId: studyId.trim().toUpperCase() });
  }

  /**
   * 6. getAdminData: Protected admin query returning members, logs, group analytics, and leaderboard
   */
  public async getAdminData(adminEmail: string): Promise<ApiResponse<AdminDataResponseData>> {
    return this.request<AdminDataResponseData>('getAdminData', { adminEmail });
  }

  /**
   * 7. adminUpdateMember: Protected admin action updating member status, school, or stream
   */
  public async adminUpdateMember(payload: AdminUpdateMemberPayload): Promise<ApiResponse<AdminUpdateMemberResponseData>> {
    return this.request<AdminUpdateMemberResponseData>('adminUpdateMember', payload);
  }

  /**
   * 8. getAnalytics: Public or dashboard group KPI statistics and top streak leaderboard
   */
  public async getAnalytics(): Promise<ApiResponse<AnalyticsResponseData>> {
    return this.request<AnalyticsResponseData>('getAnalytics', {});
  }

  /**
   * 9. ping: Backend health check
   */
  public async ping(): Promise<ApiResponse<PingResponseData>> {
    return this.request<PingResponseData>('ping', {}, 'GET');
  }

  /**
   * 10. updateProfile: Updates student profile fields
   */
  public async updateProfile(payload: UpdateProfilePayload): Promise<ApiResponse<UpdateProfileResponseData>> {
    return this.request<UpdateProfileResponseData>('updateProfile', payload);
  }
}

// Export singleton instance and class
export const ApiClient = new ApiClientEngine();
export default ApiClient;
```

---

## 5. Integration Verification Matrix

| Action | HTTP Method | Header Content-Type | Expected Payload Keys | Backend Handler in Code.gs |
|---|---|---|---|---|
| `checkUser` | POST | `text/plain;charset=utf-8` | `{ action, email }` | `handleCheckUser` |
| `registerUser` | POST | `text/plain;charset=utf-8` | `{ action, fullName, email, gender, telegram, school, stream, optionalSubject }` | `handleRegisterUser` |
| `submitDailyLog` | POST | `text/plain;charset=utf-8` | `{ action, studyId, email, dateOfStudy, subjects, notes, telegram, proofFile }` | `handleSubmitDailyLog` |
| `getStudentHistory` | POST | `text/plain;charset=utf-8` | `{ action, studyId, email }` | `handleGetStudentHistory` |
| `verifyMember` | POST / GET | `text/plain;charset=utf-8` | `{ action, studyId }` | `handleVerifyMember` |
| `getAdminData` | POST | `text/plain;charset=utf-8` | `{ action, adminEmail }` | `handleGetAdminData` |
| `adminUpdateMember` | POST | `text/plain;charset=utf-8` | `{ action, adminEmail, studyId, ...fields }` | `handleAdminUpdateMember` |
| `getAnalytics` | POST / GET | `text/plain;charset=utf-8` | `{ action }` | `handleGetAnalytics` |
| `ping` | GET / POST | `text/plain;charset=utf-8` | `{ action }` | `doGet / ping` |
| `updateProfile` | POST | `text/plain;charset=utf-8` | `{ action, email, studyId, ...fields }` | `handleUpdateProfile` |

---

## 6. Downstream Consumer Alignment

1. **AuthContext (`src/context/AuthContext.tsx`)**:
   - Calls `ApiClient.checkUser(user.email)` on auth state change.
   - Sets `member` and `isAdmin` (`alwisachalaanurada@gmail.com`).
2. **Registration Page (`src/app/register/page.tsx`)**:
   - Calls `ApiClient.registerUser(payload)`.
   - On success, updates AuthContext and redirects to `/dashboard`.
3. **Student Dashboard (`src/app/dashboard/page.tsx`)**:
   - Uses `checkUser` response stats or calls `ApiClient.getStudentHistory(studyId, email)`.
4. **Daily Study Form (`src/app/daily/page.tsx`)**:
   - Calls `ApiClient.submitDailyLog(payload)` with compressed photo proof.
5. **Admin Dashboard (`src/app/admin/page.tsx`)**:
   - Calls `ApiClient.getAdminData(adminEmail)` and `ApiClient.adminUpdateMember(payload)`.
6. **Public Verification (`src/app/verify/page.tsx`)**:
   - Calls `ApiClient.verifyMember(studyId)`.
