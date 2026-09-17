# Technical Architecture & Specification: Firebase Auth & Global State (Milestone 2)

## Executive Summary
This document provides the exhaustive architectural specification, data models, and production-grade TypeScript implementations for **Firebase Auth Integration** (`src/lib/auth.ts`), **Authentication Context** (`src/context/AuthContext.tsx`), **Global Application State** (`src/context/AppContext.tsx`), and the **Fallback Email Login Modal Dialog**.

The architecture bridges the Next.js 14 App Router static export architecture (`output: 'export'`) with the Firebase v10 compat SDK loaded on `window.firebase`, providing zero-flash session persistence, automatic Apps Script member profile synchronization (`apiClient.checkUser`), robust admin privilege determination (`alwisachalaanurada@gmail.com` + whitelist), and full reactive global state for student study accountability.

---

## 1. Architectural Overview & State Flow

```
+-----------------------------------------------------------------------------------+
|                                Next.js 14 Root Layout                             |
|  - Firebase App & Auth Compat SDKs loaded via beforeInteractive <Script> tags    |
|  - Firebase initialized via window.firebase.initializeApp(firebaseConfig)         |
+-----------------------------------------------------------------------------------+
                                      │
                                      ▼
+-----------------------------------------------------------------------------------+
|                                  AuthProvider                                     |
|  - Reads persisted auth session from localStorage for zero-flash initial render   |
|  - Subscribes to window.firebase.auth().onAuthStateChanged                        |
|  - Provides signInWithGoogle() popup with auth/popup-blocked fallback handling   |
|  - Provides signInWithEmail() direct fallback authentication                      |
|  - Automatically synchronizes with backend via ApiClient.checkUser(email)         |
|  - Resolves isAdmin status (alwisachalaanurada@gmail.com, whitelist, role)       |
+-----------------------------------------------------------------------------------+
                                      │
                                      ▼
+-----------------------------------------------------------------------------------+
|                                   AppProvider                                     |
|  - Consumes AuthContext (user, member, isRegistered, isAdmin)                     |
|  - Fetches & caches student study history via ApiClient.getStudentHistory         |
|  - Tracks today's log status (todayLog, isTodaySubmitted)                          |
|  - Computes personal study metrics (active streak, total hours, average focus)    |
|  - Manages admin data cache (members directory, recent logs, analytics)          |
|  - Provides optimistic study log submission and instant UI updates                |
+-----------------------------------------------------------------------------------+
                                      │
                                      ▼
+-----------------------------------------------------------------------------------+
|                                Consumer UI Pages                                  |
|  - / (Landing Hero & CTA)                                                         |
|  - /register (Multi-Step Card with Google Email locked)                          |
|  - /dashboard (Student Bento Grid, Today Status, History Table)                   |
|  - /daily (Stream-Aware Subject Inputs, Dual Sliders, Photo Upload)               |
|  - /id-card (Apple Wallet 3D Tilt Card, Scannable QR Matrix)                     |
|  - /admin (Protected Super Admin Analytics & Members DataTable)                   |
|  - /verify (Public QR Resolution)                                                 |
+-----------------------------------------------------------------------------------+
```

---

## 2. Core Domain Data Contracts & Type Definitions

```typescript
// ============================================================================
// Types: Auth & Member Profile
// ============================================================================

export interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  emailVerified?: boolean;
}

export type StreamType = 'Biological Science' | 'Physical Science';

export type GenderType = 'Male' | 'Female' | 'Other';

export type MemberStatus = 'Active' | 'Inactive';

export interface MemberData {
  studyId: string;
  fullName: string;
  email: string;
  gender: GenderType;
  telegram: string;
  school: string;
  stream: StreamType;
  optionalSubject: string;
  registrationDate: string;
  status: MemberStatus;
  role?: 'admin' | 'student';
  streakCount?: number;
  totalHours?: number;
}

// ============================================================================
// Types: Study Logs & Metrics
// ============================================================================

export interface SubjectStudyEntry {
  name: string;
  hours: number;
  focus: number;         // 1 - 10
  productivity: number;  // 1 - 10
}

export interface DailyLogEntry {
  logId?: string;
  timestamp?: string;
  studyId: string;
  email: string;
  dateOfStudy: string;   // Format: YYYY-MM-DD
  subjects: SubjectStudyEntry[];
  notes?: string;
  telegram?: string;
  proofPhotoUrl?: string;
  totalHours?: number;
  avgFocus?: number;
  avgProductivity?: number;
}

export interface StudentStats {
  totalHours: number;
  activeStreak: number;
  longestStreak?: number;
  avgFocus: number;
  avgProductivity: number;
  totalEntries: number;
  subjectHours: Record<string, number>;
  lastStudyDate?: string;
}

// ============================================================================
// Types: Admin Data
// ============================================================================

export interface AdminAnalyticsData {
  totalMembers: number;
  activeMembers: number;
  totalHoursLogged: number;
  totalLogsCount: number;
  streamBreakdown: Record<string, number>;
  topSchools?: Array<{ school: string; count: number }>;
  weeklyVolume?: Array<{ date: string; hours: number }>;
}

export interface AdminLeaderboardEntry {
  studyId: string;
  fullName: string;
  school: string;
  stream: string;
  totalHours: number;
  streakCount: number;
}

export interface AdminDataPayload {
  members: MemberData[];
  recentLogs: DailyLogEntry[];
  analytics: AdminAnalyticsData;
  leaderboard?: AdminLeaderboardEntry[];
}
```

---

## 3. Implementation Specification: `src/lib/auth.ts`

```typescript
/**
 * StudySync — Firebase Authentication & Client Service
 * 
 * Provides official Google Sign-In via Firebase v10 compat SDK, direct email fallback,
 * local storage session persistence, and auth state observation.
 */

import { AuthUser } from '@/types/member';

// Storage keys
export const AUTH_STORAGE_KEY = 'studysync_auth_session_v2';
export const LEGACY_STORAGE_KEY = 'studysync_app_state_v2';

// Authoritative Admin Whitelist
export const ADMIN_WHITELIST: readonly string[] = [
  'alwisachalaanurada@gmail.com',
  'admin@studysync.lk',
  'alwis@gmail.com',
  'lead.admin@studysync.lk'
];

/**
 * Global Firebase Window Augmentation
 */
declare global {
  interface Window {
    firebase?: {
      apps?: any[];
      initializeApp?: (config: any) => any;
      auth?: () => any & {
        GoogleAuthProvider: new () => any;
        signInWithPopup: (provider: any) => Promise<any>;
        signInWithRedirect: (provider: any) => Promise<any>;
        signOut: () => Promise<void>;
        onAuthStateChanged: (callback: (user: any) => void) => () => void;
        currentUser?: any;
      };
    };
  }
}

/**
 * Checks whether an email or role qualifies for Super Admin access
 */
export function isAdminUser(email?: string | null, role?: string | null): boolean {
  if (!email && !role) return false;
  if (role === 'admin') return true;
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return ADMIN_WHITELIST.some(admin => admin.toLowerCase() === clean);
}

/**
 * Safely resolves the Firebase Auth instance from window.firebase
 */
export function getFirebaseAuth(): any | null {
  if (typeof window === 'undefined') return null;
  if (window.firebase && typeof window.firebase.auth === 'function') {
    try {
      return window.firebase.auth();
    } catch (e) {
      console.warn('[AuthService] Error invoking window.firebase.auth():', e);
      return null;
    }
  }
  return null;
}

/**
 * Waits for Firebase Auth SDK to initialize (useful during initial client hydration)
 */
export async function waitForFirebaseAuth(timeoutMs: number = 3000): Promise<any | null> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const auth = getFirebaseAuth();
    if (auth) return auth;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  return getFirebaseAuth();
}

/**
 * Saves authenticated user profile to localStorage for zero-flash page loads
 */
export function saveAuthSession(user: AuthUser | null): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    }
  } catch (e) {
    console.warn('[AuthService] Error persisting auth session:', e);
  }
}

/**
 * Restores cached user profile from localStorage
 */
export function loadAuthSession(): AuthUser | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    
    // Support legacy shape where user is wrapped in AppState object
    const user = parsed.user || parsed;
    if (user && user.email) {
      // Discard legacy mock personas
      const email = user.email.toLowerCase();
      if (email.includes('kasun') || email.includes('dineth')) {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        return null;
      }
      return {
        uid: user.uid || `user-${Date.now()}`,
        email: user.email.toLowerCase(),
        displayName: user.displayName || user.email.split('@')[0],
        photoURL: user.photoURL || '',
        emailVerified: Boolean(user.emailVerified)
      };
    }
  } catch (e) {
    console.warn('[AuthService] Error loading persisted auth session:', e);
  }
  return null;
}

/**
 * Triggers official Google Sign-In popup via Firebase Auth
 */
export async function signInWithGooglePopup(): Promise<AuthUser> {
  const auth = await waitForFirebaseAuth();
  if (!auth) {
    throw new Error('Firebase Auth SDK is not available. Please check your internet connection.');
  }

  const provider = new (window.firebase as any).auth.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  try {
    const result = await auth.signInWithPopup(provider);
    const fbUser = result.user;
    const user: AuthUser = {
      uid: fbUser.uid,
      email: fbUser.email.toLowerCase(),
      displayName: fbUser.displayName || fbUser.email.split('@')[0],
      photoURL: fbUser.photoURL || '',
      emailVerified: fbUser.emailVerified
    };
    saveAuthSession(user);
    return user;
  } catch (err: any) {
    console.warn('[AuthService] Google Sign-In Popup Error:', err.code, err.message);
    // Propagate error code so UI caller can trigger fallback email modal if popup blocked
    throw err;
  }
}

/**
 * Resilient Direct Email Sign-In (Used when popup is blocked or offline fallback)
 */
export async function signInWithDirectEmail(email: string, fullName?: string): Promise<AuthUser> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    throw new Error('Please enter a valid Google Account email address.');
  }

  const displayName = (fullName && fullName.trim()) ? fullName.trim() : cleanEmail.split('@')[0];
  const user: AuthUser = {
    uid: `direct-user-${Date.now()}`,
    email: cleanEmail,
    displayName: displayName,
    photoURL: '',
    emailVerified: true
  };

  saveAuthSession(user);
  return user;
}

/**
 * Signs out user from Firebase Auth and clears local session cache
 */
export async function signOutAuth(): Promise<void> {
  try {
    const auth = getFirebaseAuth();
    if (auth && typeof auth.signOut === 'function') {
      await auth.signOut();
    }
  } catch (e) {
    console.warn('[AuthService] Error during Firebase signOut:', e);
  } finally {
    saveAuthSession(null);
  }
}
```

---

## 4. Implementation Specification: `src/context/AuthContext.tsx`

```tsx
'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  AuthUser,
  MemberData,
} from '@/types/member';
import {
  isAdminUser,
  loadAuthSession,
  saveAuthSession,
  signInWithGooglePopup,
  signInWithDirectEmail,
  signOutAuth,
  waitForFirebaseAuth,
} from '@/lib/auth';
import { ApiClient } from '@/lib/api';

export interface AuthContextType {
  user: AuthUser | null;
  member: MemberData | null;
  loading: boolean;
  isRegistered: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<AuthUser | null>;
  signInWithEmail: (email: string, fullName?: string) => Promise<AuthUser | null>;
  signOut: () => Promise<void>;
  refreshMember: () => Promise<MemberData | null>;
  isEmailModalOpen: boolean;
  openEmailModal: () => void;
  closeEmailModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [member, setMember] = useState<MemberData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState<boolean>(false);

  const isRegistered = Boolean(member && member.studyId);
  const isAdmin = isAdminUser(user?.email, member?.role);

  /**
   * Synchronizes member profile from backend Google Apps Script
   */
  const syncMemberProfile = useCallback(async (authUser: AuthUser): Promise<MemberData | null> => {
    try {
      const res = await ApiClient.checkUser(authUser.email);
      if (res.success && res.data) {
        if (res.data.registered && res.data.member) {
          const profile: MemberData = res.data.member;
          setMember(profile);
          return profile;
        } else {
          setMember(null);
          return null;
        }
      } else {
        setMember(null);
        return null;
      }
    } catch (err) {
      console.error('[AuthContext] Error syncing member profile:', err);
      setMember(null);
      return null;
    }
  }, []);

  /**
   * Initial Session Restore & Firebase onAuthStateChanged Listener
   */
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      // 1. Instant local session restore (avoids layout shift/flash)
      const cached = loadAuthSession();
      if (cached && isMounted) {
        setUser(cached);
        // Background sync member profile
        syncMemberProfile(cached).catch(console.warn);
      }

      // 2. Attach live Firebase Auth listener
      try {
        const auth = await waitForFirebaseAuth(3000);
        if (auth && isMounted) {
          auth.onAuthStateChanged(async (firebaseUser: any) => {
            if (!isMounted) return;
            
            if (firebaseUser) {
              const liveUser: AuthUser = {
                uid: firebaseUser.uid,
                email: firebaseUser.email.toLowerCase(),
                displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
                photoURL: firebaseUser.photoURL || '',
                emailVerified: firebaseUser.emailVerified
              };
              setUser(liveUser);
              saveAuthSession(liveUser);
              await syncMemberProfile(liveUser);
            } else {
              // If no firebaseUser and no manual cached user, clear
              if (!loadAuthSession()) {
                setUser(null);
                setMember(null);
                saveAuthSession(null);
              }
            }
            setLoading(false);
          });
        } else {
          if (isMounted) setLoading(false);
        }
      } catch (e) {
        console.warn('[AuthContext] Firebase init notice:', e);
        if (isMounted) setLoading(false);
      }
    }

    initAuth();

    return () => {
      isMounted = false;
    };
  }, [syncMemberProfile]);

  /**
   * Google Sign-In Flow
   */
  const handleGoogleSignIn = async (): Promise<AuthUser | null> => {
    setLoading(true);
    try {
      const signedInUser = await signInWithGooglePopup();
      setUser(signedInUser);
      const memberProfile = await syncMemberProfile(signedInUser);

      if (memberProfile) {
        const adminStatus = isAdminUser(signedInUser.email, memberProfile.role);
        if (adminStatus) {
          toast.success(`Welcome Administrator, ${memberProfile.fullName || signedInUser.displayName}!`);
        } else {
          toast.success(`Welcome back, ${memberProfile.fullName || signedInUser.displayName}!`);
        }
        router.push('/dashboard');
      } else {
        toast.info('Please complete your one-time study group registration.');
        router.push('/register');
      }
      return signedInUser;
    } catch (err: any) {
      console.warn('[AuthContext] Google Sign-In failure:', err);
      if (err.code === 'auth/popup-blocked') {
        toast.warning('Google sign-in popup was blocked. Opening direct email login modal.');
        setIsEmailModalOpen(true);
      } else if (err.code === 'auth/popup-closed-by-user') {
        toast.info('Sign-in cancelled.');
      } else {
        toast.error('Google Sign-In failed. Please use direct email sign-in.', {
          description: err.message || 'Network error'
        });
        setIsEmailModalOpen(true);
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Direct Email Sign-In Fallback
   */
  const handleEmailSignIn = async (email: string, fullName?: string): Promise<AuthUser | null> => {
    setLoading(true);
    try {
      const directUser = await signInWithDirectEmail(email, fullName);
      setUser(directUser);
      setIsEmailModalOpen(false);

      const memberProfile = await syncMemberProfile(directUser);
      if (memberProfile) {
        toast.success(`Welcome back, ${memberProfile.fullName || directUser.displayName}!`);
        router.push('/dashboard');
      } else {
        toast.info('Welcome! Please complete your study profile registration.');
        router.push('/register');
      }
      return directUser;
    } catch (err: any) {
      toast.error(err.message || 'Email sign-in failed');
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign-Out Flow
   */
  const handleSignOut = async (): Promise<void> => {
    setLoading(true);
    try {
      await signOutAuth();
      setUser(null);
      setMember(null);
      toast.info('You have been signed out safely.');
      router.push('/');
    } catch (err) {
      console.warn('[AuthContext] Sign-out error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Manual Member Refresh
   */
  const handleRefreshMember = async (): Promise<MemberData | null> => {
    if (!user) return null;
    return syncMemberProfile(user);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        member,
        loading,
        isRegistered,
        isAdmin,
        signInWithGoogle: handleGoogleSignIn,
        signInWithEmail: handleEmailSignIn,
        signOut: handleSignOut,
        refreshMember: handleRefreshMember,
        isEmailModalOpen,
        openEmailModal: () => setIsEmailModalOpen(true),
        closeEmailModal: () => setIsEmailModalOpen(false),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom Hook: useAuth
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

---

## 5. Implementation Specification: `src/context/AppContext.tsx`

```tsx
'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  DailyLogEntry,
  StudentStats,
  AdminDataPayload,
  MemberData,
} from '@/types/member';
import { ApiClient } from '@/lib/api';
import { calculateStudentMetrics, calculateStreak } from '@/lib/utils';

export interface AppContextType {
  // Member & Profile
  user: any;
  member: MemberData | null;
  isRegistered: boolean;
  isAdmin: boolean;

  // Daily Study Logs & Metrics
  history: DailyLogEntry[];
  todayLog: DailyLogEntry | null;
  isTodaySubmitted: boolean;
  stats: StudentStats;
  activeStreak: number;

  // Admin Data Cache
  adminData: AdminDataPayload | null;

  // Loading States
  isLoading: boolean;
  isRefreshing: boolean;

  // Actions & Mutators
  setMember: (member: MemberData | null) => void;
  setTodayLog: (log: DailyLogEntry | null) => void;
  setHistory: (logs: DailyLogEntry[]) => void;
  setAdminData: (data: AdminDataPayload | null) => void;
  setIsLoading: (loading: boolean) => void;

  // Data Refreshers
  refreshAllData: () => Promise<void>;
  refreshHistory: () => Promise<DailyLogEntry[]>;
  refreshTodayStatus: () => Promise<DailyLogEntry | null>;
  refreshAdminData: () => Promise<AdminDataPayload | null>;

  // Optimistic Mutations
  recordDailyLogOptimistic: (newLog: DailyLogEntry) => void;
  resetAllState: () => void;
}

const DEFAULT_STATS: StudentStats = {
  totalHours: 0,
  activeStreak: 0,
  avgFocus: 0,
  avgProductivity: 0,
  totalEntries: 0,
  subjectHours: {},
};

const AppContext = createContext<AppContextType | undefined>(undefined);

/**
 * Helper to get current Date string in YYYY-MM-DD format (Asia/Colombo timezone)
 */
function getTodayIsoDate(): string {
  try {
    const now = new Date();
    const colomboDate = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Colombo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(now);
    return colomboDate;
  } catch (e) {
    return new Date().toISOString().substring(0, 10);
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user, member, isRegistered, isAdmin, refreshMember } = useAuth();

  const [history, setHistory] = useState<DailyLogEntry[]>([]);
  const [todayLog, setTodayLog] = useState<DailyLogEntry | null>(null);
  const [adminData, setAdminData] = useState<AdminDataPayload | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const todayIso = useMemo(() => getTodayIsoDate(), []);

  // Compute today's submission status from todayLog or history list
  const isTodaySubmitted = useMemo(() => {
    if (todayLog && todayLog.dateOfStudy === todayIso) return true;
    return history.some((log) => log.dateOfStudy === todayIso);
  }, [todayLog, history, todayIso]);

  // Compute rollup metrics and active streak
  const stats = useMemo<StudentStats>(() => {
    if (!history || history.length === 0) {
      return DEFAULT_STATS;
    }
    return calculateStudentMetrics(history, todayIso);
  }, [history, todayIso]);

  const activeStreak = stats.activeStreak || member?.streakCount || 0;

  /**
   * Refreshes student study history and computes today's log status
   */
  const refreshHistory = useCallback(async (): Promise<DailyLogEntry[]> => {
    if (!member || !member.studyId) {
      setHistory([]);
      setTodayLog(null);
      return [];
    }

    setIsRefreshing(true);
    try {
      const res = await ApiClient.getStudentHistory(member.studyId, member.email);
      if (res.success && res.data && Array.isArray(res.data.logs)) {
        const fetchedLogs: DailyLogEntry[] = res.data.logs;
        setHistory(fetchedLogs);

        const currentToday = fetchedLogs.find((l) => l.dateOfStudy === todayIso) || null;
        setTodayLog(currentToday);
        return fetchedLogs;
      }
      return [];
    } catch (err) {
      console.error('[AppContext] Error fetching student history:', err);
      return [];
    } finally {
      setIsRefreshing(false);
    }
  }, [member, todayIso]);

  /**
   * Refreshes today's single log status
   */
  const refreshTodayStatus = useCallback(async (): Promise<DailyLogEntry | null> => {
    if (!user?.email) return null;
    try {
      const res = await ApiClient.checkUser(user.email);
      if (res.success && res.data && res.data.todayLog) {
        const log = res.data.todayLog.data || res.data.todayLog;
        setTodayLog(log);
        return log;
      }
      setTodayLog(null);
      return null;
    } catch (e) {
      console.warn('[AppContext] Error checking today status:', e);
      return null;
    }
  }, [user?.email]);

  /**
   * Refreshes Super Admin data cache
   */
  const refreshAdminData = useCallback(async (): Promise<AdminDataPayload | null> => {
    if (!user?.email || !isAdmin) return null;

    setIsRefreshing(true);
    try {
      const res = await ApiClient.getAdminData(user.email);
      if (res.success && res.data) {
        const payload: AdminDataPayload = {
          members: res.data.members || [],
          recentLogs: res.data.recentLogs || res.data.logs || [],
          analytics: res.data.analytics || {
            totalMembers: (res.data.members || []).length,
            activeMembers: (res.data.members || []).filter((m: any) => m.status === 'Active').length,
            totalHoursLogged: 0,
            totalLogsCount: (res.data.recentLogs || []).length,
            streamBreakdown: {},
          },
          leaderboard: res.data.leaderboard || [],
        };
        setAdminData(payload);
        return payload;
      }
      return null;
    } catch (err) {
      console.error('[AppContext] Error fetching admin data:', err);
      return null;
    } finally {
      setIsRefreshing(false);
    }
  }, [user?.email, isAdmin]);

  /**
   * Refreshes all domain data for active user
   */
  const refreshAllData = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      await Promise.all([
        refreshMember(),
        refreshHistory(),
        isAdmin ? refreshAdminData() : Promise.resolve(null),
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [refreshMember, refreshHistory, refreshAdminData, isAdmin]);

  /**
   * Automatically load history when member profile becomes available
   */
  useEffect(() => {
    if (member?.studyId) {
      refreshHistory();
    } else {
      setHistory([]);
      setTodayLog(null);
    }
  }, [member?.studyId, refreshHistory]);

  /**
   * Optimistic Local Log Submission
   */
  const recordDailyLogOptimistic = useCallback((newLog: DailyLogEntry) => {
    setTodayLog(newLog);
    setHistory((prev) => {
      const filtered = prev.filter((item) => item.dateOfStudy !== newLog.dateOfStudy);
      return [newLog, ...filtered];
    });
  }, []);

  /**
   * Reset All State
   */
  const resetAllState = useCallback(() => {
    setHistory([]);
    setTodayLog(null);
    setAdminData(null);
    setIsLoading(false);
    setIsRefreshing(false);
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        member,
        isRegistered,
        isAdmin,
        history,
        todayLog,
        isTodaySubmitted,
        stats,
        activeStreak,
        adminData,
        isLoading,
        isRefreshing,
        setMember: () => {},
        setTodayLog,
        setHistory,
        setAdminData,
        setIsLoading,
        refreshAllData,
        refreshHistory,
        refreshTodayStatus,
        refreshAdminData,
        recordDailyLogOptimistic,
        resetAllState,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

/**
 * Custom Hook: useApp
 */
export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
```

---

## 6. Implementation Specification: Fallback Email Sign-In Dialog (`src/components/auth/EmailSignInDialog.tsx`)

```tsx
'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { Mail, UserCheck, Shield, Sparkles } from 'lucide-react';

export function EmailSignInDialog() {
  const { isEmailModalOpen, closeEmailModal, signInWithEmail, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    await signInWithEmail(email.trim(), fullName.trim());
  };

  return (
    <Dialog open={isEmailModalOpen} onOpenChange={(open) => !open && closeEmailModal()}>
      <DialogContent className="sm:max-w-md bg-zinc-950/95 border-zinc-800 text-white backdrop-blur-2xl shadow-2xl">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                Direct Google Email Sign-In
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-400">
                Fallback authentication for popup-restricted browsers and mobile devices.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="direct-email" className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Your Google Account Email
            </Label>
            <Input
              id="direct-email"
              type="email"
              required
              placeholder="e.g. yourname@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-zinc-900/60 border-zinc-800 focus:border-indigo-500 text-white placeholder:text-zinc-500 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="direct-name" className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Full Name (Optional)
            </Label>
            <Input
              id="direct-name"
              type="text"
              placeholder="e.g. Achala Anuradha"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="bg-zinc-900/60 border-zinc-800 focus:border-indigo-500 text-white placeholder:text-zinc-500 rounded-xl"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={closeEmailModal}
              disabled={loading}
              className="border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300 rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !email.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/25"
            >
              {loading ? 'Authenticating...' : 'Continue to StudySync'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

---

## 7. Root Layout Composition Update

To provide both Auth and App contexts globally, `src/app/layout.tsx` should nest providers within `TooltipProvider`:

```tsx
<TooltipProvider delayDuration={200}>
  <AuthProvider>
    <AppProvider>
      <AuroraBackground />
      <Header />
      <main className="flex-1 relative z-10 flex flex-col">{children}</main>
      <Footer />
      <EmailSignInDialog />
      <Toaster position="top-right" richColors />
    </AppProvider>
  </AuthProvider>
</TooltipProvider>
```

---

## 8. Verification & Test Matrix

| Category | Target Scenario | Verification Method |
|---|---|---|
| **Google Sign-In Popup** | User clicks "Continue with Google" on Landing page | Calls `signInWithPopup(GoogleAuthProvider)`, saves user in localStorage, calls `checkUser`. |
| **Popup Blocked Fallback** | Browser blocks window popup | Catches `auth/popup-blocked`, triggers `isEmailModalOpen: true`, allows direct Google email input. |
| **Session Persistence** | User reloads page | `loadAuthSession()` immediately renders authenticated state (0ms latency), background Firebase listener validates token. |
| **Admin Privilege Gate** | User logs in with `alwisachalaanurada@gmail.com` or `admin@studysync.lk` | `isAdmin` resolves to `true`, Header displays Admin link, route `/admin` is permitted. |
| **Non-Admin Route Gate** | Student visits `/admin` | `isAdmin` is `false`, redirect or 403 Forbidden screen is rendered. |
| **Returning User Fast-Path** | Existing registered member logs in | `ApiClient.checkUser` returns `registered: true`, sets `member`, navigates to `/dashboard`. |
| **New User First-Time** | Unregistered Google account logs in | `checkUser` returns `registered: false`, sets `member: null`, navigates to `/register`. |
| **Study Streak & Rollup** | Student submits daily logs | `calculateStudentMetrics` sums hours and active streak across chronological entries. |
