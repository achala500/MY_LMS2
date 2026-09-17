'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import {
  calculateStreak,
  calculateStats,
  formatDate,
  getTodayDateString,
  normalizeDateString,
  isToday,
  extractLogDate,
  extractLogHours,
} from '@/lib/utils';
import { localDb } from '@/lib/storage/localDb';
import { DailyLogEntry } from '@/types/logs';
import { TestMarkEntry } from '@/types/testMarks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { PhotoProofModal } from '@/components/ui/PhotoProofModal';
import { AcademicReportModal } from '@/components/dashboard/AcademicReportModal';
import { EditProfileModal } from '@/components/dashboard/EditProfileModal';
import { SessionDetailDrawer } from '@/components/dashboard/SessionDetailDrawer';
import { VaultPanel } from '@/components/vault/VaultPanel';
import { SnapPaperNotesDrawer } from '@/components/dashboard/SnapPaperNotesDrawer';
import { safeStorage } from '@/lib/storage/safeStorage';
import { AcademicRhythmIllustration, EmptyLogsIllustration } from '@/components/illustrations';
import { getExamCountdown, saveStoredExamDates } from '@/lib/calendar';
import { isStudentVerified } from '@/lib/utils';
import { calculateCompositeZScore } from '@/lib/analytics/dataEngineering';
import { getTimeGreeting } from '@/lib/templates';
import { StudyTrendChart } from '@/components/dashboard/StudyTrendChart';
import { ScrollReveal, CountUp, StaggerContainer } from '@/components/animation/MotionWrappers';
import {
  Flame,
  Clock,
  BookOpen,
  Target,
  Sparkles,
  ArrowRight,
  Play,
  Camera,
  Copy,
  Check,
  Calendar,
  Search,
  RefreshCw,
  Eye,
  CheckCircle2,
  ExternalLink,
  Shield,
  FileText,
  Download,
  BrainCircuit,
  TrendingUp,
  Layers,
  ChevronDown,
  Award,
  Plus,
  FolderOpen,
  X,
  Lock,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, member, loading: authLoading, isAdmin } = useAuth();
  const { logs, setLogs, refreshHistory, recordDailyLogOptimistic } = useApp();

  const [testMarks, setTestMarks] = useState<TestMarkEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [selectedProofUrl, setSelectedProofUrl] = useState<string | null>(null);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [editProfileModalOpen, setEditProfileModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'vault' | 'history'>('overview');
  const [quickLogModalOpen, setQuickLogModalOpen] = useState(false);
  const [snapDrawerOpen, setSnapDrawerOpen] = useState(false);

  // M1 Session Drawer State
  const [selectedDrawerLog, setSelectedDrawerLog] = useState<DailyLogEntry | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Quick Session Logging State
  const [quickSubject, setQuickSubject] = useState('');
  const [quickHours, setQuickHours] = useState('2.0');
  const [quickFocus, setQuickFocus] = useState(9);
  const [quickTopics, setQuickTopics] = useState('');
  const [submittingQuickLog, setSubmittingQuickLog] = useState(false);

  // Manual refresh that clears cache and hits Google Sheets directly
  const handleManualRefresh = async () => {
    if (!member?.studyId || !user?.email) return;
    setIsManualRefreshing(true);
    try {
      api.clearCache();
      const res = await api.getStudentHistory(member.studyId, user.email, true);
      const historyList = res.data?.logs || res.data?.history;
      if (res.success && Array.isArray(historyList)) {
        setLogs(historyList);
      }

      const marksRes = await api.getTestMarks(member.studyId, user.email, true);
      if (marksRes.success && Array.isArray(marksRes.data?.testMarks)) {
        setTestMarks(marksRes.data.testMarks);
        const cacheKey = `studysync_testmarks_${user.email}`;
        safeStorage.setItem(cacheKey, JSON.stringify(marksRes.data.testMarks));
      }

      toast.success('Data refreshed live from Google Sheets!');
    } catch (err: any) {
      toast.error('Failed to refresh data: ' + (err?.message || 'Network error'));
    } finally {
      setIsManualRefreshing(false);
    }
  };

  // Determine subjects for breakdown and stream analytics
  const isBio =
    member?.stream === 'Biological Science' ||
    String(member?.stream || '').toLowerCase().includes('bio');

  const sub1Name = isBio ? 'Biology' : 'Combined Maths';
  const sub2Name = isBio ? 'Chemistry' : 'Physics';
  const sub3Name = member?.optionalSubject || (isBio ? 'Physics' : 'Chemistry');

  const streamSubjects = useMemo(() => {
    return [sub1Name, sub2Name, sub3Name];
  }, [sub1Name, sub2Name, sub3Name]);

  useEffect(() => {
    if (!quickSubject) {
      setQuickSubject(streamSubjects[0]);
    }
  }, [streamSubjects, quickSubject]);

  // Load history and test marks
  useEffect(() => {
    if (member && member.studyId && user?.email) {
      api
        .getStudentHistory(member.studyId, user.email)
        .then((res) => {
          const historyList = res.data?.logs || res.data?.history;
          if (res.success && Array.isArray(historyList)) {
            setLogs(historyList);
          }
        })
        .catch((err) => console.error('Error fetching student history:', err));

      const cacheKey = `studysync_testmarks_${user.email}`;
      api
        .getTestMarks(member.studyId, user.email)
        .then((res) => {
          if (res.success && Array.isArray(res.data?.testMarks)) {
            setTestMarks(res.data.testMarks);
            safeStorage.setItem(cacheKey, JSON.stringify(res.data.testMarks));
          } else {
            const cached = safeStorage.getItem(cacheKey);
            if (cached) {
              try {
                setTestMarks(JSON.parse(cached));
              } catch (e) {
                setTestMarks([]);
              }
            }
          }
        })
        .catch(() => {
          const cached = safeStorage.getItem(cacheKey);
          if (cached) {
            try {
              setTestMarks(JSON.parse(cached));
            } catch (e) {
              setTestMarks([]);
            }
          }
        });
    }
  }, [member, user, setLogs]);

  // Calculate personal metrics
  const stats = useMemo(() => calculateStats(logs), [logs]);
  const streakResult = useMemo(() => calculateStreak(logs), [logs]);
  const streak = typeof streakResult === 'number' ? streakResult : (streakResult?.currentStreak || 0);
  const todayStr = getTodayDateString();

  const todayLog = useMemo(() => {
    return logs.find((l) => {
      const d = l.dateOfStudy || l.date;
      return d && String(d).startsWith(todayStr);
    });
  }, [logs, todayStr]);

  const todayHours = Number(todayLog?.totalHours || 0);
  const todayHoursInt = Math.floor(todayHours);
  const todayMins = Math.round((todayHours - todayHoursInt) * 60);
  const todayGoal = 5.0;
  const todayPercent = Math.min(Math.round((todayHours / todayGoal) * 100), 100);
  const remainingTodayHours = Math.max(0, todayGoal - todayHours);

  // Weekly Volume calculation
  const weeklyHours = (stats as any).weekHours || stats.totalHours || 0;
  const weeklyGoal = 35.0;
  const weeklyPercent = Math.min(Math.round((weeklyHours / weeklyGoal) * 100), 100);
  const remainingWeeklyHours = Math.max(0, weeklyGoal - weeklyHours);

  // Exam Countdown calculation
  const examYear = member?.examYear || '2026';
  const [countdown, setCountdown] = useState(() => getExamCountdown(examYear));

  useEffect(() => {
    let isMounted = true;
    setCountdown(getExamCountdown(examYear));
    api.getExamDates().then((res) => {
      if (res.success && res.data?.examDates && isMounted) {
        saveStoredExamDates(res.data.examDates);
        setCountdown(getExamCountdown(examYear));
      }
    }).catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [examYear]);

  const isVerified = useMemo(() => {
    return isStudentVerified(member);
  }, [member]);

  const studentDistrict = (member as any)?.district || 'Colombo';
  const hasTestMarks = testMarks && testMarks.length > 0;

  const liveForecast = useMemo(() => {
    if (!hasTestMarks) return null;
    return calculateCompositeZScore(streamSubjects, testMarks);
  }, [hasTestMarks, streamSubjects, testMarks]);

  const projectedZ = hasTestMarks && liveForecast ? liveForecast.compositeZScore : null;

  const targetFacultyLabel = useMemo(() => {
    if (projectedZ === null) return hasTestMarks ? 'Analyzing test results' : 'Log test marks to forecast';
    if (isBio) {
      if (projectedZ >= 2.05) return 'Colombo / Peradeniya Medicine Safe';
      if (projectedZ >= 1.80) return 'State Medical Faculty In Reach';
      if (projectedZ >= 1.45) return 'Applied Sciences & Bio In Reach';
      return 'State University Benchmark';
    } else {
      if (projectedZ >= 2.05) return 'Moratuwa / Peradeniya Engineering Safe';
      if (projectedZ >= 1.80) return 'State Engineering In Reach';
      if (projectedZ >= 1.45) return 'Physical Sciences & Computing In Reach';
      return 'State University Benchmark';
    }
  }, [projectedZ, hasTestMarks, isBio]);

  // Subject balance calculation
  const subjectBreakdown = useMemo(() => {
    const totals: Record<string, number> = {
      [sub1Name]: 0,
      [sub2Name]: 0,
      [sub3Name]: 0,
    };
    logs.forEach((log) => {
      const subs = log.subjects || log.sessions;
      if (subs && Array.isArray(subs) && subs.length > 0) {
        subs.forEach((s: any, idx: number) => {
          const sName = s?.name || s?.subject || '';
          const sHours = Number(s?.hours || s?.totalHours || 0);
          if (sName && totals[sName] !== undefined) {
            totals[sName] += sHours;
          } else if (idx === 0) {
            totals[sub1Name] += sHours;
          } else if (idx === 1) {
            totals[sub2Name] += sHours;
          } else if (idx === 2) {
            totals[sub3Name] += sHours;
          }
        });
      } else {
        totals[sub1Name] += Number(log.sub1Hours || log.hoursSubject1 || log.subject1Hours || 0);
        totals[sub2Name] += Number(log.sub2Hours || log.hoursSubject2 || log.subject2Hours || 0);
        totals[sub3Name] += Number(log.sub3Hours || log.hoursSubject3 || log.subject3Hours || 0);
      }
    });
    return totals;
  }, [logs, sub1Name, sub2Name, sub3Name]);

  // Weekly Rhythm chart data: last 7 days (Mon-Sun)
  const rhythmDays = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const now = new Date();
    // Monday of current week
    const dayOfWeek = (now.getDay() + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - dayOfWeek);

    return days.map((dayName, idx) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + idx);
      const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      
      const dayLogs = logs.filter((l) => {
        const lDate = extractLogDate(l);
        return lDate === dStr;
      });

      const hours = dayLogs.reduce((acc, l) => acc + extractLogHours(l), 0);

      return {
        day: dayName,
        date: dStr,
        hours: Number(hours.toFixed(1)),
        percent: Math.min(Math.round((hours / 6.0) * 100), 100),
        isToday: dStr === todayStr,
      };
    });
  }, [logs, todayStr]);

  // Filter logs by search query
  const filteredLogs = useMemo(() => {
    if (!searchQuery.trim()) return logs;
    const q = searchQuery.toLowerCase();
    return logs.filter((log) => {
      const date = extractLogDate(log);
      const topics = (log.subjects || []).map((s: any) => s.topics || s.topic || s.name || s.subject).join(' ');
      const notes = log.notes || '';
      return (
        date.toLowerCase().includes(q) ||
        topics.toLowerCase().includes(q) ||
        notes.toLowerCase().includes(q)
      );
    });
  }, [logs, searchQuery]);

  const handleCopyStudyId = () => {
    if (!member?.studyId) return;
    navigator.clipboard.writeText(member.studyId);
    setCopied(true);
    toast.success('Study ID copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleQuickLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member?.studyId || !user?.email) {
      toast.error('Authentication session expired. Please sign in again.');
      return;
    }
    const hrs = parseFloat(quickHours);
    if (isNaN(hrs) || hrs <= 0) {
      toast.error('Please enter valid study hours');
      return;
    }

    const optimisticEntry: DailyLogEntry = {
      id: 'log-' + Date.now(),
      studyId: member.studyId,
      dateOfStudy: todayStr,
      date: todayStr,
      hoursSubject1: quickSubject === sub1Name ? hrs : 0,
      hoursSubject2: quickSubject === sub2Name ? hrs : 0,
      hoursSubject3: quickSubject === sub3Name ? hrs : 0,
      totalHours: hrs,
      focusScore: quickFocus,
      productivityScore: quickFocus * 10,
      notes: quickTopics || 'Quick study session logged via Dashboard.',
      subjects: [
        {
          name: quickSubject,
          hours: hrs,
          focus: quickFocus,
          productivity: quickFocus * 10,
        },
      ],
      timestamp: new Date().toISOString(),
    };
    recordDailyLogOptimistic(optimisticEntry);
    localDb.saveDailyLog(optimisticEntry);

    setSubmittingQuickLog(true);
    try {
      const payload = {
        action: 'submitDailyLog' as const,
        studyId: member.studyId,
        email: user.email,
        fullName: member.fullName,
        stream: member.stream,
        dateOfStudy: todayStr,
        totalHours: hrs,
        focusScore: quickFocus,
        productivityScore: quickFocus * 10,
        subjects: [
          {
            name: quickSubject,
            hours: hrs,
            focus: quickFocus,
            productivity: quickFocus * 10,
            topics: quickTopics || 'Focused revision',
          },
        ],
        notes: quickTopics || 'Quick study session logged via Dashboard.',
      };

      const res = await api.submitDailyLog(payload);
      if (res.success) {
        toast.success(`Logged ${hrs}h of ${quickSubject} successfully!`);
        setQuickLogModalOpen(false);
        setQuickTopics('');
        handleManualRefresh();
      } else {
        toast.error(res.error || 'Failed to submit study log');
      }
    } catch (err: any) {
      toast.error('Submission error: ' + (err?.message || 'Network error'));
    } finally {
      setSubmittingQuickLog(false);
    }
  };

  // Real scholar name
  const studentFirstName = member?.fullName
    ? member.fullName.split(' ')[0]
    : user?.displayName
    ? user.displayName.split(' ')[0]
    : 'Scholar';

  const greetingText = getTimeGreeting(studentFirstName);

  return (
    <div className="w-full flex-1 bg-[#fef8f4] text-[#1d1b19] font-sans antialiased selection:bg-[#c85a32]/20 selection:text-[#1d1b19] pb-10">
      
      {/* Secondary Quick Action / Refresh Bar */}
      <div className="max-w-[1360px] mx-auto px-6 pt-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-mono text-[#4a3b35]">
          <span className="w-2 h-2 rounded-full bg-[#456644] animate-pulse" />
          <span>LEDGER SYNCED â€¢ A/L {examYear}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleManualRefresh}
            disabled={isManualRefreshing}
            className="px-3 py-1.5 rounded-full bg-[#f8f2ef] border border-[#e7e1de] text-[#2d2420] hover:text-[#1d1b19] hover:bg-[#ede7e3] text-xs font-mono flex items-center gap-1.5 transition-colors disabled:opacity-50"
            title="Refresh ledger from Google Sheets"
          >
            <RefreshCw className={`w-3 h-3 ${isManualRefreshing ? 'animate-spin text-[#c85a32]' : ''}`} />
            <span>Sync Sheets</span>
          </button>
          <button
            onClick={() => setEditProfileModalOpen(true)}
            className="w-7 h-7 rounded-full bg-[#bf542c] text-white flex items-center justify-center text-xs font-bold font-mono shadow-xs hover:opacity-90 transition-opacity"
            title="Edit Scholar Profile"
          >
            {studentFirstName.slice(0, 2).toUpperCase()}
          </button>
        </div>
      </div>

      {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
          2. MAIN CONTENT AREA
         â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <main className="max-w-[1360px] mx-auto px-6 py-8">
        
        {/* Top Greeting Banner (Stitch Sanctuary Aesthetic) */}
        <ScrollReveal>
          <div className="relative w-full rounded-2xl bg-[#ffffff] border border-[#e7e1de] p-6 sm:p-8 shadow-sm mb-8 overflow-hidden">
            <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-[#ffdbcf]/40 blur-3xl pointer-events-none" />
            <div className="absolute right-1/3 bottom-0 w-56 h-56 rounded-full bg-[#ffdcbc]/30 blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f3ede9] text-[#2d2420] text-xs font-mono uppercase tracking-wider mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c85a32] animate-pulse" />
                  <span>{member?.school || 'Sri Lankan National A/L Cohort'} &middot; {member?.stream || 'Science Stream'}</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-serif text-[#1d1b19] font-medium tracking-tight mt-1">
                  {greetingText}
                </h1>
                <p className="text-sm sm:text-base text-[#2d2420] mt-1.5 max-w-2xl font-normal leading-relaxed">
                  You have <span className="font-semibold text-[#1d1b19] font-mono">{countdown.daysRemaining} days</span> until your G.C.E. Advanced Level examination. Keep this steady rhythm going today.
                </p>
              </div>

              {/* 3 Quick Action Buttons */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full xl:w-auto shrink-0">
                <button
                  onClick={() => setQuickLogModalOpen(true)}
                  className="px-5 py-2.5 rounded-full bg-[#c85a32] text-white text-xs font-semibold shadow-sm hover:bg-[#b04b25] active:scale-[0.98] transition-all flex items-center gap-2"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start a Study Session</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSnapDrawerOpen(true)}
                  className="px-4 py-2.5 rounded-full bg-[#f8f2ef] hover:bg-[#ede7e3] text-[#1d1b19] text-xs font-medium transition-colors flex items-center gap-2 border border-[#e7e1de]"
                >
                  <Camera className="w-3.5 h-3.5 text-[#4a3b35]" />
                  <span>Snap Paper Notes</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('vault')}
                  className="px-4 py-2.5 rounded-full bg-[#ffffff] hover:bg-[#f8f2ef] text-[#1d1b19] text-xs font-medium transition-colors flex items-center gap-2 border border-[#e7e1de]"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-[#4a3b35]" />
                  <span>Open Past Papers</span>
                </button>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
            3. KPI ROW: 3 QUIET EDITORIAL METRIC CARDS
           â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* Metric 1: Today's Hours */}
          <ScrollReveal delay={50}>
            <div className="rounded-2xl bg-[#ffffff] border border-[#e7e1de] p-6 shadow-sm flex flex-col justify-between h-full">
              <div className="flex items-center justify-between text-[#4a3b35] text-xs font-mono uppercase tracking-wider">
                <span>Hours Logged Today</span>
                <Clock className="w-4 h-4 text-[#c85a32]" />
              </div>
              <div className="my-4 flex items-baseline gap-2">
                <span className="text-3xl font-serif font-semibold text-[#1d1b19] tabular-nums">
                  {todayHoursInt}h {todayMins}m
                </span>
                <span className="text-xs text-[#2d2420] font-mono">/ 5h 00m goal</span>
              </div>
              <div>
                <div className="w-full h-2 rounded-full bg-[#f3ede9] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#c85a32] transition-all duration-500"
                    style={{ width: `${todayPercent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2 text-xs font-mono">
                  <span className="text-[#1d1b19] font-medium">{todayPercent}% done for today</span>
                  <span className="text-[#4a3b35]">
                    {remainingTodayHours > 0 ? `${remainingTodayHours.toFixed(1)}h to wrap` : 'Goal achieved!'}
                  </span>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Metric 2: This Week's Volume */}
          <ScrollReveal delay={100}>
            <div className="rounded-2xl bg-[#ffffff] border border-[#e7e1de] p-6 shadow-sm flex flex-col justify-between h-full">
              <div className="flex items-center justify-between text-[#4a3b35] text-xs font-mono uppercase tracking-wider">
                <span>This Week's Volume</span>
                <Calendar className="w-4 h-4 text-[#854f00]" />
              </div>
              <div className="my-4 flex items-baseline gap-2">
                <span className="text-3xl font-serif font-semibold text-[#1d1b19] tabular-nums">
                  <CountUp value={weeklyHours} decimals={1} /> hrs
                </span>
                <span className="text-xs text-[#2d2420] font-mono">/ 35.0 hrs target</span>
              </div>
              <div>
                <div className="w-full h-2 rounded-full bg-[#f3ede9] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#c85a32] to-[#854f00] transition-all duration-500"
                    style={{ width: `${weeklyPercent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2 text-xs font-mono">
                  <span className="text-[#1d1b19] font-medium">{weeklyPercent}% of 35h quota</span>
                  <span className="text-[#4a3b35]">
                    {remainingWeeklyHours > 0 ? `${remainingWeeklyHours.toFixed(1)}h remaining` : 'Target met!'}
                  </span>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Metric 3: Active Habit Streak */}
          <ScrollReveal delay={150}>
            <div className="rounded-2xl bg-[#ffffff] border border-[#e7e1de] p-6 shadow-sm flex flex-col justify-between h-full">
              <div className="flex items-center justify-between text-[#4a3b35] text-xs font-mono uppercase tracking-wider">
                <span>Habit Continuity</span>
                <Flame className="w-4 h-4 text-[#c85a32]" />
              </div>
              <div className="my-4 flex items-baseline gap-2">
                <span className="text-3xl font-serif font-semibold text-[#1d1b19] tabular-nums">
                  <CountUp value={streak} /> days
                </span>
                <span className="text-sm"></span>
              </div>
              <div>
                <div className="w-full h-2 rounded-full bg-[#f3ede9] overflow-hidden">
                  <div className="h-full rounded-full bg-[#456644] w-full" />
                </div>
                <div className="flex items-center justify-between mt-2 text-xs font-mono">
                  <span className="text-[#456644] font-medium">Daily study verified &middot; Consistent</span>
                  <span className="text-[#4a3b35]">Keep steady</span>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
            4. RESOURCE VAULT TAB (If active)
           â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {activeTab === 'vault' && (
          <ScrollReveal>
            <div className="rounded-2xl bg-[#ffffff] border border-[#e7e1de] p-6 sm:p-8 shadow-sm mb-8">
              <div className="flex items-center justify-between pb-4 border-b border-[#e7e1de] mb-6">
                <div>
                  <h2 className="text-2xl font-serif text-[#1d1b19]">Academic Resource Vault</h2>
                  <p className="text-xs text-[#2d2420] mt-1">
                    Store past papers, marking schemes, and revision PDFs offline in your browser.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('overview')}
                  className="text-xs font-semibold text-[#c85a32] hover:underline"
                >
                  &larr; Back to Overview
                </button>
              </div>
              <VaultPanel studyId={member?.studyId || 'GUEST-SCHOLAR'} />
            </div>
          </ScrollReveal>
        )}

        {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
            5. MAIN DYNAMIC GRID: ASYMMETRIC 45% / 55% LAYOUT
           â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Multi-Period Interactive Study Volume & Subject Allocation Graph */}
            <ScrollReveal delay={50}>
              <StudyTrendChart
                logs={logs}
                sub1Name={sub1Name}
                sub2Name={sub2Name}
                sub3Name={sub3Name}
                onRefresh={handleManualRefresh}
                isRefreshing={isManualRefreshing}
              />
            </ScrollReveal>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: Rhythm Chart & Subject Balance (~45%) */}
            <div className="lg:col-span-5 space-y-8">
              
              {/* Monolinear Weekly Rhythm Bar Chart */}
              <ScrollReveal delay={100}>
                <div className="rounded-2xl bg-[#ffffff] border border-[#e7e1de] p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="text-lg font-serif text-[#1d1b19] font-medium">Study Rhythm This Week</h2>
                    <span className="text-[11px] font-mono text-[#4a3b35] uppercase">Mon &ndash; Sun</span>
                  </div>
                  <p className="text-xs text-[#2d2420] mb-6 font-normal">
                    Calculated from your verified daily logs and proof submissions.
                  </p>

                  {/* SVG Monolinear Bar Chart */}
                  <div className="w-full bg-[#f8f2ef] rounded-xl p-4 mb-3 border border-[#e7e1de]">
                    <div className="flex items-end justify-between h-44 gap-2 pt-4 px-2">
                      {rhythmDays.map((item, idx) => (
                        <div key={idx} className="flex flex-col items-center flex-1 h-full justify-end group">
                          <span className="text-[10px] font-mono text-[#1d1b19] font-semibold mb-1 tabular-nums transition-colors">
                            {item.hours > 0 ? `${item.hours.toFixed(1)}h` : 'â€”'}
                          </span>
                          <div className="w-full max-w-[28px] h-32 bg-[#ede7e3] rounded-t-lg relative overflow-hidden flex items-end border border-[#dec0b7]/40 p-0.5">
                            <div
                              className={`w-full rounded-t-md transition-all duration-300 ${
                                item.isToday
                                  ? 'bg-[#9f3c16] shadow-sm'
                                  : item.hours > 0
                                  ? 'bg-[#c85a32] group-hover:bg-[#9f3c16]'
                                  : 'bg-[#dec0b7]/60'
                              }`}
                              style={{ height: `${item.hours > 0 ? Math.max(item.percent, 14) : 8}%` }}
                            />
                          </div>
                          <span className={`text-[11px] font-mono mt-2 ${item.isToday ? 'font-bold text-[#9f3c16]' : 'text-[#4a3b35]'}`}>
                            {item.day}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#4a3b35] font-mono pt-2">
                    <span>Average: {(weeklyHours / 7).toFixed(1)}h / day</span>
                    <span className="text-[#456644] font-semibold">Equilibrium: Satisfied</span>
                  </div>
                </div>
              </ScrollReveal>

              {/* 3-Subject Equilibrium Card */}
              <ScrollReveal delay={150}>
                <div className="rounded-2xl bg-[#ffffff] border border-[#e7e1de] p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-lg font-serif text-[#1d1b19] font-medium">3-Subject Distribution</h3>
                    <span className="text-xs font-mono text-[#c85a32] font-semibold">Target: 35h</span>
                  </div>
                  <p className="text-xs text-[#2d2420] font-normal mb-6">
                    Maintain balanced coverage to prevent single-subject score deficits.
                  </p>

                  <div className="space-y-4">
                    {streamSubjects.map((sub, idx) => {
                      const hrs = subjectBreakdown[sub] || 0;
                      const target = idx === 0 ? 14 : idx === 1 ? 11 : 10;
                      const pct = Math.min(Math.round((hrs / target) * 100), 100);
                      const colors = ['bg-[#c85a32]', 'bg-[#456644]', 'bg-[#854f00]'];

                      return (
                        <div key={sub} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-[#1d1b19]">{sub}</span>
                            <span className="font-mono text-[#2d2420]">{hrs.toFixed(1)}h / {target}h ({pct}%)</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-[#f3ede9] overflow-hidden">
                            <div className={`h-full rounded-full ${colors[idx % 3]}`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#e7e1de] flex items-center justify-between text-xs">
                    <Link
                      href="/tests"
                      className="text-[#c85a32] font-semibold hover:underline flex items-center gap-1"
                    >
                      <span>Simulate Z-Score Impact</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                    <span className="font-mono text-[#4a3b35]">Z-Weight: Standardized</span>
                  </div>
                </div>
              </ScrollReveal>

              {/* Digital Student Pass Mini Preview Card */}
              <ScrollReveal delay={200}>
                <div className="rounded-2xl bg-[#ffffff] border border-[#e7e1de] p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-[#456644]" />
                      <span className="text-xs font-mono uppercase tracking-wider text-[#1d1b19] font-semibold">
                        Digital Student Pass
                      </span>
                    </div>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#c6edc1] text-[#022106] font-semibold">
                      VERIFIED PASS
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#f8f2ef] border border-[#e7e1de] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-[#4a3b35] block uppercase">Candidate Study ID</span>
                      <span className="text-sm font-mono font-bold text-[#c85a32]">
                        {member?.studyId || 'SS-2026-PENDING'}
                      </span>
                      <span className="text-xs text-[#2d2420] block mt-0.5">{member?.school || 'National Candidate'}</span>
                    </div>
                    <button
                      onClick={handleCopyStudyId}
                      className="p-2 rounded-lg bg-white border border-[#e7e1de] text-[#2d2420] hover:text-[#1d1b19] transition-colors"
                      title="Copy Study ID"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <Link
                      href="/id-card"
                      className="text-xs font-semibold text-[#c85a32] hover:underline flex items-center gap-1"
                    >
                      <span>View 300 DPI Security Pass</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                    <button
                      onClick={() => setReportModalOpen(true)}
                      className="text-xs text-[#2d2420] hover:text-[#1d1b19]"
                    >
                      Academic Report
                    </button>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* RIGHT COLUMN: Recent History & Verified Logs (~55%) */}
            <div className="lg:col-span-7 space-y-8">
              
              {/* Study History Card */}
              <ScrollReveal delay={150}>
                <div className="rounded-2xl bg-[#ffffff] border border-[#e7e1de] p-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e7e1de]">
                    <div>
                      <h2 className="text-xl font-serif text-[#1d1b19] font-medium">Recent Study Logs</h2>
                      <p className="text-xs text-[#2d2420] mt-0.5">
                        {filteredLogs.length} verified submissions in your ledger
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href="/daily"
                        className="px-3.5 py-1.5 rounded-full bg-[#c85a32] text-white text-xs font-semibold hover:bg-[#b04b25] transition-colors flex items-center gap-1.5 shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Log Hours</span>
                      </Link>
                    </div>
                  </div>

                  {/* Logs Feed */}
                  {filteredLogs.length === 0 ? (
                    <div className="py-10 text-center flex flex-col items-center justify-center">
                      <EmptyLogsIllustration size={160} className="mx-auto mb-2" />
                      <h4 className="text-base font-serif font-semibold text-[#1d1b19] mt-2">No study logs found</h4>
                      <p className="text-xs text-[#2d2420] mt-1 max-w-sm mx-auto leading-relaxed">
                        Start logging your daily hours with proof photos to build your streak and unlock Z-score predictions.
                      </p>
                      <button
                        onClick={() => setQuickLogModalOpen(true)}
                        className="mt-4 px-5 py-2.5 rounded-full bg-[#c85a32] hover:bg-[#b04b25] text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
                      >
                        Log Your First Session
                      </button>
                    </div>
                  ) : (
                    <div className="divide-y divide-[#e7e1de] mt-2">
                      {filteredLogs.slice(0, 8).map((log, idx) => {
                        const dateVal = log.dateOfStudy || log.date || '';
                        const hrs = Number(log.totalHours || 0);
                        const proofUrl = log.photoProofBase64 || log.proofPhotoUrl;
                        const subjectNames = (log.subjects || []).map(s => s.name).filter(Boolean);

                        return (
                          <div
                            key={idx}
                            className="py-4 flex items-center justify-between gap-4 hover:bg-[#f8f2ef]/60 px-2 rounded-xl transition-colors group"
                          >
                            <div className="flex items-center gap-3.5 min-w-0">
                              {/* Proof Thumbnail or Subject Icon */}
                              {proofUrl ? (
                                <button
                                  onClick={() => setSelectedProofUrl(proofUrl)}
                                  className="w-11 h-11 rounded-xl bg-[#f3ede9] border border-[#e7e1de] overflow-hidden shrink-0 group-hover:border-[#c85a32] transition-colors relative"
                                  title="View photo proof"
                                >
                                  <img
                                    src={proofUrl}
                                    alt="Proof"
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <Eye className="w-3.5 h-3.5 text-white" />
                                  </div>
                                </button>
                              ) : (
                                <div className="w-11 h-11 rounded-xl bg-[#f8f2ef] border border-[#e7e1de] flex items-center justify-center text-[#c85a32] shrink-0 font-serif font-bold text-sm">
                                  {hrs.toFixed(0)}h
                                </div>
                              )}

                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-semibold text-[#1d1b19]">
                                    {formatDate(dateVal)}
                                  </span>
                                  {isToday(dateVal) && (
                                    <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-[#c85a32] text-white">
                                      Today
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5 mt-0.5 text-xs text-[#2d2420]">
                                  <span>{subjectNames.length > 0 ? subjectNames.join(', ') : streamSubjects.join(', ')}</span>
                                  <span>&middot;</span>
                                  <span className="font-mono text-[#1d1b19] font-medium">{hrs.toFixed(1)} hrs</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {log.isVerified || (log as any).status === 'Verified' || (log as any).verified ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-[#c6edc1] text-[#022106]">
                                  <CheckCircle2 className="w-3 h-3 text-[#456644]" />
                                  Verified
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-[#f3ede9] text-[#854f00]">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#854f00]" />
                                  Pending Audit
                                </span>
                              )}
                              <button
                                onClick={() => {
                                  setSelectedDrawerLog(log);
                                  setDrawerOpen(true);
                                }}
                                className="w-8 h-8 rounded-full bg-[#f8f2ef] hover:bg-[#ede7e3] flex items-center justify-center text-[#2d2420] hover:text-[#1d1b19]"
                                title="Inspect Session Details"
                              >
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {filteredLogs.length > 8 && (
                    <div className="pt-4 border-t border-[#e7e1de] text-center">
                      <Link
                        href="/daily"
                        className="text-xs font-semibold text-[#c85a32] hover:underline"
                      >
                        View all {filteredLogs.length} study sessions &rarr;
                      </Link>
                    </div>
                  )}
                </div>
              </ScrollReveal>

              {/* Z-Score Trajectory & Test Marks Forecast Banner */}
              <ScrollReveal delay={200}>
                <div className="rounded-2xl bg-gradient-to-br from-[#ffffff] to-[#f8f2ef] border border-[#e7e1de] p-6 shadow-sm">
                  <div className="flex items-center justify-between pb-3 border-b border-[#e7e1de]">
                    <div className="flex items-center gap-2">
                      <BrainCircuit className="w-4 h-4 text-[#c85a32]" />
                      <h3 className="text-base font-serif text-[#1d1b19] font-medium">
                        Z-Score &amp; National Cut-Off Prediction
                      </h3>
                    </div>
                    <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[#c6edc1] text-[#022106] font-semibold">
                      {hasTestMarks ? (liveForecast?.targetTier || 'National Benchmark') : 'Awaiting Paper Marks'}
                    </span>
                  </div>

                  <div className="my-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-3 rounded-xl bg-white border border-[#e7e1de]">
                      <span className="text-[10px] font-mono uppercase text-[#4a3b35] block">Projected Z-Score</span>
                      <span className="text-2xl font-serif font-bold text-[#c85a32] block mt-0.5 tabular-nums">
                        {projectedZ !== null ? (projectedZ >= 0 ? `+${projectedZ.toFixed(3)}` : projectedZ.toFixed(3)) : 'â€”'}
                      </span>
                      <span className="text-[11px] text-[#456644] font-medium truncate block">
                        {targetFacultyLabel}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-[#e7e1de]">
                      <span className="text-[10px] font-mono uppercase text-[#4a3b35] block">Papers Logged</span>
                      <span className="text-2xl font-serif font-bold text-[#1d1b19] block mt-0.5 tabular-nums">
                        {hasTestMarks ? `${testMarks.length} Sat` : '0 Sat'}
                      </span>
                      <span className="text-[11px] text-[#4a3b35]">
                        {hasTestMarks ? 'Standardized term tests' : 'No test marks recorded'}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-[#e7e1de]">
                      <span className="text-[10px] font-mono uppercase text-[#4a3b35] block">District Benchmark</span>
                      <span className="text-2xl font-serif font-bold text-[#456644] block mt-0.5 tabular-nums">
                        {isBio ? '+1.920' : '+1.980'}
                      </span>
                      <span className="text-[11px] text-[#4a3b35]">{studentDistrict} Target</span>
                    </div>
                  </div>

                  <Link
                    href="/tests"
                    className="w-full py-2.5 px-4 rounded-xl bg-[#f3ede9] hover:bg-[#ede7e3] text-[#1d1b19] text-xs font-semibold flex items-center justify-between transition-colors"
                  >
                    <span>Launch What-If Score Simulator</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#c85a32]" />
                  </Link>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
        )}
      </main>

      {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
          6. MODALS & DRAWERS
         â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      
      {/* Quick Session Log Modal */}
      {quickLogModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60  p-4">
          <div className="relative w-full max-w-md rounded-2xl border border-[#e7e1de] bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#e7e1de] mb-4">
              <h3 className="text-lg font-serif text-[#1d1b19] font-medium">Quick Study Session</h3>
              <button
                onClick={() => setQuickLogModalOpen(false)}
                className="w-7 h-7 rounded-full bg-[#f8f2ef] flex items-center justify-center text-[#2d2420] hover:text-[#1d1b19]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleQuickLogSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-mono text-[#2d2420] uppercase mb-1">Subject</label>
                <select
                  value={quickSubject}
                  onChange={(e) => setQuickSubject(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#e7e1de] bg-[#f8f2ef] text-[#1d1b19] outline-none"
                >
                  {streamSubjects.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#2d2420] uppercase mb-1">Hours Logged</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="16"
                  value={quickHours}
                  onChange={(e) => setQuickHours(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#e7e1de] bg-[#f8f2ef] text-[#1d1b19] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#2d2420] uppercase mb-1">Focus Score (1 - 10)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={quickFocus}
                    onChange={(e) => setQuickFocus(Number(e.target.value))}
                    className="w-full accent-[#c85a32]"
                  />
                  <span className="font-mono font-bold text-sm text-[#c85a32] w-6">{quickFocus}</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#2d2420] uppercase mb-1">Topics / Exercises Covered</label>
                <input
                  type="text"
                  placeholder="e.g. 2018 Past Paper Question 3 (Vectors)"
                  value={quickTopics}
                  onChange={(e) => setQuickTopics(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#e7e1de] bg-[#f8f2ef] text-[#1d1b19] outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={submittingQuickLog}
                className="w-full h-11 rounded-xl bg-[#c85a32] text-white font-semibold text-xs hover:bg-[#b04b25] active:scale-95 transition-all shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
              >
                <span>{submittingQuickLog ? 'Syncing to Ledger...' : 'Save Session'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Photo Proof Fullscreen Modal */}
      <PhotoProofModal
        open={selectedProofUrl !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedProofUrl(null);
        }}
        proofUrl={selectedProofUrl}
      />

      {/* Academic PDF Report Modal */}
      {member && (
        <AcademicReportModal
          open={reportModalOpen}
          onOpenChange={setReportModalOpen}
          member={member}
          logs={logs}
          stats={stats}
          sub1Name={sub1Name}
          sub2Name={sub2Name}
          sub3Name={sub3Name}
          sub1Hours={subjectBreakdown[sub1Name] || 0}
          sub2Hours={subjectBreakdown[sub2Name] || 0}
          sub3Hours={subjectBreakdown[sub3Name] || 0}
          balanceScore={88}
        />
      )}

      {/* Edit Profile Modal */}
      <EditProfileModal
        open={editProfileModalOpen}
        onOpenChange={setEditProfileModalOpen}
      />

      {/* Snap Paper Notes Mobile Upload Drawer */}
      <SnapPaperNotesDrawer
        isOpen={snapDrawerOpen}
        onClose={() => setSnapDrawerOpen(false)}
        stream={member?.stream}
        studyId={member?.studyId}
        onUploadSuccess={handleManualRefresh}
      />
    </div>
  );
}
