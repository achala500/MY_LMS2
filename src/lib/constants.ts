/**
 * StudySync â€” Authoritative Application Constants
 */

// Google Apps Script Web App Endpoint URL
export const DEFAULT_API_URL =
  'https://script.google.com/macros/s/AKfycbwA5AQwT7cOipModhNXrWBQOOTkvv_RVHRkuxpS6iFyu_t_n6x0wo1YDkKemzC0cGPO/exec';

// Google Sheet Database ID
export const SPREADSHEET_ID = '1CI8KbQU-XJ_HvqEv2yu-d1oRf0focH9cdozo0YIhhY0';

// Primary Super Administrator Email
export const SUPER_ADMIN_EMAIL = 'alwisachalaanurada@gmail.com';

// Whitelisted Administrator Emails
export const ADMIN_WHITELIST: readonly string[] = [
  'alwisachalaanurada@gmail.com',
  'admin@studysync.lk',
  'alwis@gmail.com',
  'lead.admin@studysync.lk',
] as const;
export const ADMIN_EMAILS = ADMIN_WHITELIST;


// Firebase Client Configuration (Compat SDK v10)
export const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyAjK2y49ia3YnDY3L1bMhwasAQGRikvAHA',
  authDomain: 'studysync-al-2026.firebaseapp.com',
  projectId: 'studysync-al-2026',
  storageBucket: 'studysync-al-2026.firebasestorage.app',
  messagingSenderId: '99176264496',
  appId: '1:99176264496:web:1a6a69567c0f7619a98ef5',
} as const;

// A/L Stream Definitions
export const STREAMS = {
  BIO: 'Biological Science',
  MATHS: 'Physical Science',
} as const;

// A/L Target Exam Batches / Years
export const EXAM_YEARS = ['2026', '2027', '2028', '2029'] as const;
export const DEFAULT_EXAM_YEAR = '2026';


// Stream Mandatory & Optional Subject Configurations
export const STREAM_SUBJECTS = {
  'Biological Science': {
    mandatory: ['Biology', 'Chemistry'],
    optionalChoices: ['Physics', 'Agriculture'],
  },
  'Physical Science': {
    mandatory: ['Combined Maths', 'Physics'],
    optionalChoices: ['Chemistry', 'ICT'],
  },
} as const;

// LocalStorage Persistence Keys
export const STORAGE_KEYS = {
  AUTH_SESSION: 'studysync_auth_session_v2',
  APP_STATE: 'studysync_app_state_v2',
  API_URL: 'STUDYSYNC_API_URL',
} as const;

// Visual Theme Color Tokens
export const THEME_COLORS = {
  background: '#07090E',
  card: 'rgba(24, 24, 27, 0.6)',
  border: 'rgba(39, 39, 42, 0.8)',
  primary: '#6366F1', // Indigo
  success: '#10B981', // Emerald
  warning: '#F59E0B', // Amber
  destructive: '#EF4444', // Rose
} as const;
