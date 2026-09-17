'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import type { MemberData } from '@/types/member';
import type { DailyLogEntry, StudentStats } from '@/types/logs';
import type { AdminDataPayload } from '@/types/auth';
import { ApiClient } from '@/lib/api';
import { calculateStudentMetrics, getTodayDateString, extractLogDate } from '@/lib/utils';
import { localDb } from '@/lib/storage/localDb';

export interface AppContextType {
  // Member & Profile
  user: any;
  member: MemberData | null;
  isRegistered: boolean;
  isAdmin: boolean;

  // Daily Study Logs & Metrics
  history: DailyLogEntry[];
  logs: DailyLogEntry[];
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
  setLogs: (logs: DailyLogEntry[]) => void;

  setAdminData: (data: AdminDataPayload | null) => void;
  setIsLoading: (loading: boolean) => void;

  // Data Refreshers
  refreshAllData: () => Promise<void>;
  refreshHistory: (skipCache?: boolean) => Promise<DailyLogEntry[]>;
  refreshTodayStatus: () => Promise<DailyLogEntry | null>;
  refreshAdminData: () => Promise<AdminDataPayload | null>;

  // Optimistic Mutations
  recordDailyLogOptimistic: (newLog: DailyLogEntry) => void;
  resetAllState: () => void;
}

const DEFAULT_STATS: StudentStats = {
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

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user, member, isRegistered, isAdmin, refreshMember } = useAuth();

  const [history, setHistory] = useState<DailyLogEntry[]>([]);
  const [todayLog, setTodayLog] = useState<DailyLogEntry | null>(null);
  const [adminData, setAdminData] = useState<AdminDataPayload | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const todayIso = useMemo(() => getTodayDateString(), []);

  // Compute today's submission status from todayLog or history list
  const isTodaySubmitted = useMemo(() => {
    if (todayLog && extractLogDate(todayLog) === todayIso) return true;
    return history.some((log) => extractLogDate(log) === todayIso);
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
  const refreshHistory = useCallback(async (skipCache = false): Promise<DailyLogEntry[]> => {
    if (!member || !member.studyId) {
      setHistory([]);
      setTodayLog(null);
      return [];
    }

    setIsRefreshing(true);
    try {
      const res = await ApiClient.getStudentHistory(member.studyId, member.email, skipCache);
      let fetchedLogs: DailyLogEntry[] = [];
      if (res.success && res.data && Array.isArray(res.data.logs) && res.data.logs.length > 0) {
        fetchedLogs = res.data.logs;
      } else {
        fetchedLogs = localDb.getStudentLogs(member.studyId, member.email);
      }

      setHistory(fetchedLogs);

      const currentToday = fetchedLogs.find((l) => extractLogDate(l) === todayIso) || null;
      setTodayLog(currentToday);
      return fetchedLogs;
    } catch (err) {
      console.error('[AppContext] Error fetching student history:', err);
      const fallback = localDb.getStudentLogs(member.studyId, member.email);
      setHistory(fallback);
      return fallback;
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
        const rawLog: any = res.data.todayLog;
        const log: DailyLogEntry = rawLog.data || rawLog;
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
        const rawData: any = res.data;
        const payload: AdminDataPayload = {
          members: rawData.members || [],
          recentLogs: rawData.recentLogs || rawData.logs || [],
          analytics: rawData.analytics || {
            totalMembers: (rawData.members || []).length,
            activeMembers: (rawData.members || []).filter((m: any) => m.status === 'Active').length,
            totalHoursLogged: 0,
            totalLogsCount: (rawData.recentLogs || rawData.logs || []).length,
            streamBreakdown: {},
          },
          leaderboard: rawData.leaderboard || [],
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
   * Continuous sync listener for real-time log updates across components
   */
  useEffect(() => {
    const handleLogsUpdated = () => {
      refreshHistory(true);
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('studysync_logs_updated', handleLogsUpdated);
      return () => {
        window.removeEventListener('studysync_logs_updated', handleLogsUpdated);
      };
    }
  }, [refreshHistory]);

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
        logs: history,
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
        setLogs: setHistory,
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

import { Header } from '@/components/layout/Header';

/**
 * Connected Header component automatically wired to AuthContext and AppContext
 */
export function ConnectedHeader() {
  const { user, member, isAdmin, signOut, signInWithGoogle } = useAuth();
  const { activeStreak } = useApp();

  return (
    <Header
      user={user}
      member={member}
      streak={activeStreak}
      isAdmin={isAdmin}
      onSignOut={signOut}
    />
  );
}

