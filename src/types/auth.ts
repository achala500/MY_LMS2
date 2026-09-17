/**
 * StudySync — Authentication & Admin State Types
 */

import { AuthUser, MemberData, StreamType, GenderType, MemberStatus } from './member';
import { DailyLogEntry, StudentStats } from './logs';

export type { AuthUser, MemberData, StreamType, GenderType, MemberStatus };

export interface AdminAnalyticsData {
  totalMembers: number;
  activeMembers: number;
  totalHoursLogged: number;
  totalLogsCount: number;
  avgDailyHours?: number;
  avgGroupFocus?: number;
  avgGroupProductivity?: number;
  streamBreakdown: Record<string, { members?: number; totalHours?: number } | number>;
  topSchools?: Array<{ school: string; count: number }>;
  weeklyVolume?: Array<{ date: string; hours: number }>;
}

export interface AdminLeaderboardEntry {
  rank?: number;
  studyId: string;
  fullName: string;
  school: string;
  stream: string;
  totalHours: number;
  totalLogs?: number;
  streakCount: number;
  streak?: number;
  maxStreak?: number;
  avgFocus?: number;
  avgProductivity?: number;
}

export interface AdminDataPayload {
  members: MemberData[];
  recentLogs: DailyLogEntry[];
  analytics: AdminAnalyticsData;
  leaderboard?: AdminLeaderboardEntry[];
}
