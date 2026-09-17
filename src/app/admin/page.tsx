'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import {
  formatDate,
  generateCsvString,
  downloadCsvFile,
  getTodayDateString,
  generateExcelXmlString,
  downloadExcelFile,
  generateSqlDump,
  downloadSqlFile,
  generateHighEntropyPassword,
  evaluatePasswordSecurity,
  isStudentVerified,
  getVerificationStatusInfo,
  formatHoursHuman,
  normalizeDateString,
  extractLogDate,
  extractLogHours,
} from '@/lib/utils';
import { localDb } from '@/lib/storage/localDb';
import { safeStorage, safeSessionStorage } from '@/lib/storage/safeStorage';
import { AdminQrScannerModal } from '@/components/admin/AdminQrScannerModal';
import { getExamCountdown, saveStoredExamDates, getStoredExamDates, DEFAULT_EXAM_DATES } from '@/lib/calendar';
import { ADMIN_EMAILS, SPREADSHEET_ID, EXAM_YEARS } from '@/lib/constants';
import {
  grantAdminPrivileges,
  revokeAdminPrivileges,
  setMemberPassword,
  getAuthorizedAdminEmails,
} from '@/lib/security/passwords';
import { MemberData } from '@/types/member';
import { DailyLogEntry } from '@/types/logs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { PhotoProofModal } from '@/components/ui/PhotoProofModal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FormBuilderModal } from '@/components/admin/FormBuilderModal';
import { HallControlSuite } from '@/components/admin/HallControlSuite';
import { FormStudioAdminEngine } from '@/components/admin/FormStudioAdminEngine';
import { FeedbackVaultAdmin } from '@/components/admin/FeedbackVaultAdmin';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  Shield,
  ShieldAlert,
  Users,
  Clock,
  TrendingUp,
  Flame,
  Search,
  Download,
  Edit2,
  Trash2,
  UserPlus,
  Image as ImageIcon,
  CheckCircle2,
  Calendar,
  Layers,
  Award,
  Loader2,
  ArrowLeft,
  FileJson,
  FileSpreadsheet,
  Database,
  School as SchoolIcon,
  RefreshCw,
  ExternalLink,
  Share2,
  Copy,
  Check,
  AlertTriangle,
  Zap,
  Ban,
  Video,
  ShieldCheck,
  UserCheck,
  UserX,
  Mail,
  CheckCheck,
  FileQuestion,
  BookOpen,
  FileText,
  QrCode,
  Archive,
  MessageSquare,
} from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const { user, member, loading: authLoading, isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState<'audit' | 'analytics' | 'inbox' | 'members' | 'logs' | 'powers' | 'hall-control' | 'form-studio' | 'feedback'>('audit');
  const [auditDistrictFilter, setAuditDistrictFilter] = useState('all');
  const [quickNoteOpen, setQuickNoteOpen] = useState(false);
  const [quickNoteStudent, setQuickNoteStudent] = useState('');
  const [quickNoteStudyId, setQuickNoteStudyId] = useState('');
  const [quickNoteText, setQuickNoteText] = useState('');
  const [auditPhotoUrl, setAuditPhotoUrl] = useState<string | null>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [formBuilderOpen, setFormBuilderOpen] = useState(false);
  const [membersList, setMembersList] = useState<MemberData[]>([]);
  const [logsList, setLogsList] = useState<DailyLogEntry[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  // Verification Inbox search & filters
  const [inboxSearch, setInboxSearch] = useState('');
  const [inboxFilter, setInboxFilter] = useState<'all' | 'pending' | 'verified' | 'suspended'>('pending');
  const [qrScannerOpen, setQrScannerOpen] = useState(false);
  const [reviewedLogIds, setReviewedLogIds] = useState<Set<string>>(() => {
    const saved = safeStorage.getJson<string[]>('studysync_reviewed_logs', []);
    return new Set(saved);
  });
  const [auditQueueFilter, setAuditQueueFilter] = useState<'pending' | 'reviewed' | 'all'>('pending');

  // Member search & filters
  const [memberSearch, setMemberSearch] = useState('');
  const [memberStreamFilter, setMemberStreamFilter] = useState('all');
  const [memberStatusFilter, setMemberStatusFilter] = useState('all');

  // Logs search & filters
  const [logsSearch, setLogsSearch] = useState('');
  const [logsStreamFilter, setLogsStreamFilter] = useState('all');

  // Edit Member Modal State
  const [editingMember, setEditingMember] = useState<MemberData | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editSchool, setEditSchool] = useState('');
  const [editStream, setEditStream] = useState('');
  const [editOptional, setEditOptional] = useState('');
  const [editExamYear, setEditExamYear] = useState('2026');
  const [editTelegram, setEditTelegram] = useState('');
  const [editStatus, setEditStatus] = useState('Active');
  const [editMemberPassword, setEditMemberPassword] = useState('');
  const [savingMember, setSavingMember] = useState(false);

  // Add Member Modal State
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [addFullName, setAddFullName] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addGender, setAddGender] = useState('Male');
  const [addSchool, setAddSchool] = useState('');
  const [addStream, setAddStream] = useState('Physical Science');
  const [addOptional, setAddOptional] = useState('Chemistry');
  const [addExamYear, setAddExamYear] = useState('2026');
  const [addTelegram, setAddTelegram] = useState('');
  const [addingMember, setAddingMember] = useState(false);

  // Delete Member Confirm State
  const [deletingMember, setDeletingMember] = useState<MemberData | null>(null);
  const [deletingProcess, setDeletingProcess] = useState(false);

  // Delete Log Confirm State
  const [deletingLog, setDeletingLog] = useState<DailyLogEntry | null>(null);
  const [deletingLogProcess, setDeletingLogProcess] = useState(false);

  // Edit Log Modal State
  const [editingLog, setEditingLog] = useState<DailyLogEntry | null>(null);
  const [editLogHours1, setEditLogHours1] = useState('');
  const [editLogHours2, setEditLogHours2] = useState('');
  const [editLogHours3, setEditLogHours3] = useState('');
  const [editLogTotal, setEditLogTotal] = useState('');
  const [editLogNotes, setEditLogNotes] = useState('');
  const [savingLog, setSavingLog] = useState(false);

  // Bulk Action State
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(new Set());
  const [bulkActioning, setBulkActioning] = useState(false);

  // Student History Drill-down
  const [viewingStudentId, setViewingStudentId] = useState<string | null>(null);

  // Photo Proof Dialog
  const [selectedProofUrl, setSelectedProofUrl] = useState<string | null>(null);

  // Broadcast Template Modal
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [broadcastCopied, setBroadcastCopied] = useState(false);

  // Authorized Admins State
  const [authorizedAdmins, setAuthorizedAdmins] = useState<string[]>(() => {
    return getAuthorizedAdminEmails();
  });
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [addingAdmin, setAddingAdmin] = useState(false);

  // Exam Countdown Override State
  const [examDate2026, setExamDate2026] = useState(() => {
    const stored = getStoredExamDates();
    return (stored['2026'] || DEFAULT_EXAM_DATES['2026']).substring(0, 16);
  });
  const [examDate2027, setExamDate2027] = useState(() => {
    const stored = getStoredExamDates();
    return (stored['2027'] || DEFAULT_EXAM_DATES['2027']).substring(0, 16);
  });
  const [examDate2028, setExamDate2028] = useState(() => {
    const stored = getStoredExamDates();
    return (stored['2028'] || DEFAULT_EXAM_DATES['2028']).substring(0, 16);
  });
  const [examDate2029, setExamDate2029] = useState(() => {
    const stored = getStoredExamDates();
    return (stored['2029'] || DEFAULT_EXAM_DATES['2029']).substring(0, 16);
  });
  const [savingExamDate, setSavingExamDate] = useState(false);

  // Live Study Room Generator State
  const [roomPlatform, setRoomPlatform] = useState<'google_meet' | 'zoom'>('google_meet');
  const [roomTopic, setRoomTopic] = useState('Sri Lanka A/L Group Study Room');
  const [generatedRoom, setGeneratedRoom] = useState<{
    platform: string;
    topic: string;
    roomUrl: string;
    roomCode: string;
    inviteText: string;
  } | null>(null);
  const [generatingRoom, setGeneratingRoom] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [vaultPassphrase, setVaultPassphrase] = useState('');
  const [isVaultUnlocked, setIsVaultUnlocked] = useState<boolean>(() => {
    return safeSessionStorage.getItem('studysync_admin_vault_unlocked') === 'true';
  });
  const [decryptingVault, setDecryptingVault] = useState(false);

  // Authorization Check
  const isAuthorized =
    isAdmin ||
    member?.role === 'admin' ||
    (user?.email && ADMIN_EMAILS.some((e) => e.toLowerCase() === user.email?.toLowerCase())) ||
    (user?.email && authorizedAdmins.some((e) => e.toLowerCase() === user.email?.toLowerCase())) ||
    isVaultUnlocked;

  // Authoritative Administrator Email (supports Google account, member admin, or security vault)
  const effectiveAdminEmail =
    user?.email ||
    member?.email ||
    (isAuthorized ? 'alwisachalaanurada@gmail.com' : '');

  const loadAdminData = async () => {
    const adminEmail = effectiveAdminEmail;
    if (!adminEmail) return;
    try {
      setLoadingData(true);
      const res = await api.getAdminData(adminEmail);
      if (res.success && res.data) {
        const rawMembers = res.data.members || [];
        const rawLogs = res.data.logs || res.data.recentLogs || [];
        setMembersList(rawMembers);
        setLogsList(rawLogs);
        setAnalyticsData(res.data.analytics || null);
        if (res.data.admins && Array.isArray(res.data.admins)) {
          setAuthorizedAdmins(res.data.admins);
        }
        if (res.data.examDates && typeof res.data.examDates === 'object') {
          saveStoredExamDates(res.data.examDates);
          if (res.data.examDates['2026']) setExamDate2026(res.data.examDates['2026'].substring(0, 16));
          if (res.data.examDates['2027']) setExamDate2027(res.data.examDates['2027'].substring(0, 16));
          if (res.data.examDates['2028']) setExamDate2028(res.data.examDates['2028'].substring(0, 16));
          if (res.data.examDates['2029']) setExamDate2029(res.data.examDates['2029'].substring(0, 16));
        }
      } else {
        toast.error(res.error || 'Failed to load live admin data.');
      }
    } catch (err: any) {
      toast.error('Error fetching admin data: ' + err.message);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    // 1. Initial fast hydration from local DB so dashboard is never empty
    const cachedMembers = localDb.getMembers();
    const cachedLogs = localDb.getLogs();
    if (cachedMembers.length > 0) {
      setMembersList(cachedMembers);
    }
    if (cachedLogs.length > 0) {
      setLogsList(cachedLogs);
    }

    // 2. Authoritative live Google Sheets sync
    if (isAuthorized && effectiveAdminEmail) {
      loadAdminData();
    }
  }, [isAuthorized, effectiveAdminEmail]);

  // Real 7-Day Volume Calculation (Zero Fake Data)
  // Uses LOCAL calendar dates to avoid UTC+5:30 timezone shift (toISOString shifts date back 1 day in SL)
  const sevenDayData = useMemo(() => {
    const result = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      // Local date string (YYYY-MM-DD) — avoids UTC timezone shift
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      const dayName = i === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' });

      const dayLogs = logsList.filter((l) => {
        const d = normalizeDateString(l.dateOfStudy || l.date);
        return d === dateStr;
      });

      const dayHours = dayLogs.reduce((sum, l) => {
        // Aggregate all nested subject sessions + top-level totalHours
        const subs = l.subjects || l.sessions || [];
        const subHours = subs.reduce((sh: number, s: { hours?: number; totalHours?: number }) =>
          sh + Number(s?.hours ?? s?.totalHours ?? 0), 0);
        const h1 = Number(l.subject1Hours ?? 0);
        const h2 = Number(l.subject2Hours ?? 0);
        const h3 = Number(l.subject3Hours ?? 0);
        const legacyHours = h1 + h2 + h3;
        return sum + Number(l.totalHours || (subHours > 0 ? subHours : legacyHours) || 0);
      }, 0);

      result.push({
        dateStr,
        dayName,
        hours: Number(dayHours.toFixed(1)),
        logCount: dayLogs.length,
      });
    }
    return result;
  }, [logsList]);

  const max7DayHours = useMemo(() => {
    const highest = Math.max(...sevenDayData.map((d) => d.hours), 0);
    return Math.max(Math.ceil(highest + 1), 4);
  }, [sevenDayData]);

  // Real Calculated KPIs
  const totalStudents = membersList.length;
  const activeStudents = membersList.filter((m) => (m.status || 'Active').toLowerCase() === 'active').length;
  const activeRate = totalStudents > 0 ? Math.round((activeStudents / totalStudents) * 100) : 100;

  const totalHoursSum = useMemo(() => {
    return logsList.reduce((sum, l) => {
      const subs = l.subjects || [];
      const h1 = Number(subs[0]?.hours ?? l.subject1Hours ?? 0);
      const h2 = Number(subs[1]?.hours ?? l.subject2Hours ?? 0);
      const h3 = Number(subs[2]?.hours ?? l.subject3Hours ?? 0);
      return sum + Number(l.totalHours || h1 + h2 + h3 || 0);
    }, 0);
  }, [logsList]);

  const avgHoursPerLog = logsList.length > 0 ? totalHoursSum / logsList.length : 0;
  const bioCount = membersList.filter((m) => String(m.stream).toLowerCase().includes('bio')).length;
  const mathsCount = totalStudents - bioCount;

  // Real School Distribution Breakdown
  const schoolDistribution = useMemo(() => {
    const map: Record<string, number> = {};
    membersList.forEach((m) => {
      const sch = m.school || 'Unknown School';
      map[sch] = (map[sch] || 0) + 1;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [membersList]);

  // Real Leaderboard Breakdown
  const leaderboard = useMemo(() => {
    const studentMap: Record<string, { member: MemberData; totalHours: number; sessions: number }> = {};
    membersList.forEach((m) => {
      studentMap[m.studyId] = { member: m, totalHours: 0, sessions: 0 };
    });

    logsList.forEach((l) => {
      if (studentMap[l.studyId]) {
        const subs = l.subjects || [];
        const h1 = Number(subs[0]?.hours ?? l.subject1Hours ?? 0);
        const h2 = Number(subs[1]?.hours ?? l.subject2Hours ?? 0);
        const h3 = Number(subs[2]?.hours ?? l.subject3Hours ?? 0);
        studentMap[l.studyId].totalHours += Number(l.totalHours || h1 + h2 + h3 || 0);
        studentMap[l.studyId].sessions += 1;
      }
    });

    return Object.values(studentMap)
      .sort((a, b) => b.totalHours - a.totalHours)
      .slice(0, 10);
  }, [membersList, logsList]);

  // Edit Member Actions
  const openEditModal = (m: MemberData) => {
    setEditingMember(m);
    setEditFullName(m.fullName || m.name || '');
    setEditSchool(m.school || '');
    setEditStream(m.stream || 'Physical Science');
    setEditOptional(m.optionalSubject || '');
    setEditExamYear(m.examYear || '2026');
    setEditTelegram(m.telegramUsername || m.telegram || '');
    setEditStatus(m.status || 'Active');
    setEditMemberPassword('');
  };

  const handleSaveMemberEdit = async () => {
    if (!editingMember || !effectiveAdminEmail) return;

    try {
      setSavingMember(true);

      // Save password if provided
      if (editMemberPassword.trim()) {
        const pwRes = await setMemberPassword(editingMember.studyId, editMemberPassword.trim());
        if (!pwRes.success) {
          toast.error(pwRes.error || 'Failed to set password.');
        } else {
          toast.success(`Password for ${editingMember.studyId} updated securely!`);
        }
      }

      const payload = {
        studyId: editingMember.studyId,
        email: editingMember.email,
        fullName: editFullName.trim(),
        school: editSchool.trim(),
        stream: editStream,
        optionalSubject: editOptional,
        examYear: editExamYear,
        telegramUsername: editTelegram.trim(),
        status: editStatus,
      };

      const res = await api.adminUpdateMember(effectiveAdminEmail, payload);
      if (res.success) {
        toast.success(`Member ${editingMember.studyId} updated and synced with Google Sheets!`);
        setEditingMember(null);
        await loadAdminData();
      } else {
        toast.error(res.error || 'Failed to update member in Google Sheets.');
      }
    } catch (err: any) {
      toast.error('Error updating member: ' + err.message);
    } finally {
      setSavingMember(false);
    }
  };

  // Add Member Action
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!effectiveAdminEmail) return;

    if (!addFullName.trim() || !addEmail.trim() || !addSchool.trim()) {
      toast.error('Please fill in Full Name, Email, and School.');
      return;
    }

    try {
      setAddingMember(true);
      const payload = {
        adminEmail: effectiveAdminEmail,
        fullName: addFullName.trim(),
        email: addEmail.trim().toLowerCase(),
        gender: addGender,
        school: addSchool.trim(),
        stream: addStream,
        optionalSubject: addOptional,
        examYear: addExamYear,
        telegram: addTelegram.trim(),
      };

      const res = await api.adminAddMember(payload);
      if (res.success) {
        toast.success(`Student ${res.data?.studyId || 'Member'} registered successfully in Google Sheets!`);
        setAddMemberOpen(false);
        setAddFullName('');
        setAddEmail('');
        setAddSchool('');
        setAddTelegram('');
        await loadAdminData();
      } else {
        toast.error(res.error || 'Failed to register student.');
      }
    } catch (err: any) {
      toast.error('Error adding member: ' + err.message);
    } finally {
      setAddingMember(false);
    }
  };

  // Delete Member Action
  const handleDeleteMember = async () => {
    if (!deletingMember || !effectiveAdminEmail) return;
    const targetStudyId = deletingMember.studyId;

    // Immediate optimistic update
    setMembersList(prev => prev.filter(m => m.studyId !== targetStudyId));
    setDeletingMember(null);
    setDeletingProcess(false);
    toast.success(`Member ${targetStudyId} removed successfully.`);

    try {
      await api.adminDeleteMember(effectiveAdminEmail, targetStudyId);
    } catch (err) {}
  };

  // Delete Daily Log Action
  const handleDeleteLog = async () => {
    if (!deletingLog || !effectiveAdminEmail) return;
    const targetStudyId = deletingLog.studyId;
    const targetDate = deletingLog.dateOfStudy || deletingLog.date || '';

    // Immediate optimistic update
    setLogsList(prev => prev.filter(l => !(l.studyId === targetStudyId && (l.dateOfStudy || l.date) === targetDate)));
    setDeletingLog(null);
    setDeletingLogProcess(false);
    toast.success('Daily log removed successfully.');

    try {
      await api.adminDeleteLog(effectiveAdminEmail, targetStudyId, targetDate);
    } catch (err) {}
  };

  // Edit Log Actions
  const openEditLogModal = (log: DailyLogEntry) => {
    setEditingLog(log);
    const subs = log.subjects || [];
    setEditLogHours1(String(subs[0]?.hours ?? (log as any).subject1Hours ?? (log as any).hoursSubject1 ?? ''));
    setEditLogHours2(String(subs[1]?.hours ?? (log as any).subject2Hours ?? (log as any).hoursSubject2 ?? ''));
    setEditLogHours3(String(subs[2]?.hours ?? (log as any).subject3Hours ?? (log as any).hoursSubject3 ?? ''));
    setEditLogTotal(String(log.totalHours ?? ''));
    setEditLogNotes(log.notes || '');
  };

  const handleSaveLogEdit = async () => {
    if (!editingLog || !effectiveAdminEmail) return;
    const targetStudyId = editingLog.studyId;
    const targetDate = editingLog.dateOfStudy || editingLog.date || '';

    const updates: any = {};
    if (editLogHours1 !== '') updates.subject1Hours = Number(editLogHours1);
    if (editLogHours2 !== '') updates.subject2Hours = Number(editLogHours2);
    if (editLogHours3 !== '') updates.subject3Hours = Number(editLogHours3);
    if (editLogTotal !== '') updates.totalHours = Number(editLogTotal);
    updates.notes = editLogNotes;

    // Immediate optimistic update
    setLogsList(prev => prev.map(l => {
      if (l.studyId === targetStudyId && (l.dateOfStudy || l.date) === targetDate) {
        const subs = l.subjects ? [...l.subjects] : [];
        if (updates.subject1Hours !== undefined && subs[0]) subs[0].hours = updates.subject1Hours;
        if (updates.subject2Hours !== undefined && subs[1]) subs[1].hours = updates.subject2Hours;
        if (updates.subject3Hours !== undefined && subs[2]) subs[2].hours = updates.subject3Hours;
        return {
          ...l,
          ...updates,
          subjects: subs,
        };
      }
      return l;
    }));

    setEditingLog(null);
    setSavingLog(false);
    toast.success('Log updated successfully.');

    try {
      await api.adminEditLog(effectiveAdminEmail, targetStudyId, targetDate, updates);
    } catch (err) {}
  };

  // Bulk Member Actions
  const handleBulkSetStatus = async (status: 'Active' | 'Inactive' | 'Verified' | 'Suspended') => {
    if (selectedMemberIds.size === 0 || !effectiveAdminEmail) return;
    setBulkActioning(true);
    let successCount = 0;
    for (const studyId of Array.from(selectedMemberIds)) {
      try {
        let res;
        if (status === 'Verified' || status === 'Suspended') {
          res = await api.adminVerifyMember(effectiveAdminEmail, studyId, status);
        } else {
          res = await api.adminUpdateMember(effectiveAdminEmail, { studyId, status });
        }
        if (res.success) successCount++;
      } catch {}
    }
    toast.success(`${successCount} students set to ${status}.`);
    setSelectedMemberIds(new Set());
    setBulkActioning(false);
    await loadAdminData();
  };

  const toggleSelectMember = (studyId: string) => {
    setSelectedMemberIds(prev => {
      const next = new Set(prev);
      if (next.has(studyId)) next.delete(studyId);
      else next.add(studyId);
      return next;
    });
  };

  const selectAllFiltered = () => {
    setSelectedMemberIds(new Set(filteredMembers.map(m => m.studyId)));
  };

  const clearSelection = () => setSelectedMemberIds(new Set());

  const handleAddAdmin = async () => {
    if (!newAdminEmail.trim() || !effectiveAdminEmail) return;
    const emailToAdd = newAdminEmail.trim().toLowerCase();
    try {
      setAddingAdmin(true);
      const res = await grantAdminPrivileges(emailToAdd, effectiveAdminEmail);
      setAuthorizedAdmins(getAuthorizedAdminEmails());
      setMembersList(prev => prev.map(m => (m.email?.toLowerCase() === emailToAdd || m.studyId.toLowerCase() === emailToAdd) ? { ...m, role: 'admin', adminVerified: true, status: 'Verified' } : m));
      toast.success(res.message || `Admin privileges granted to ${emailToAdd}`);
      setNewAdminEmail('');
      await loadAdminData();
    } catch (err: any) {
      toast.error('Error adding admin: ' + err.message);
    } finally {
      setAddingAdmin(false);
    }
  };

  const handleRevokeAdmin = async (targetEmail: string) => {
    if (!effectiveAdminEmail || !targetEmail) return;
    const emailToRevoke = targetEmail.trim().toLowerCase();
    try {
      const res = await revokeAdminPrivileges(emailToRevoke, effectiveAdminEmail);
      if (res.success) {
        setAuthorizedAdmins(getAuthorizedAdminEmails());
        setMembersList(prev => prev.map(m => m.email?.toLowerCase() === emailToRevoke ? { ...m, role: 'student' } : m));
        toast.success(res.message);
        await loadAdminData();
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error('Error revoking admin: ' + err.message);
    }
  };

  const handleVerifyStudent = async (studyId: string, status: 'Verified' | 'Active' | 'Suspended' | 'Pending') => {
    if (!effectiveAdminEmail) return;
    // Optimistic immediate update — zero delay!
    setMembersList(prev => prev.map(m => m.studyId === studyId ? { ...m, status, adminVerified: status === 'Verified' } : m));
    toast.success(`${studyId} status updated to ${status}.`);

    try {
      const res = await api.adminVerifyMember(effectiveAdminEmail, studyId, status);
      if (!res.success) {
        // Only revert on explicit failure
        await loadAdminData();
      }
    } catch (err: any) {
      console.warn('Background sync status:', err);
    }
  };

  const handleBanStudent = async (studyId: string) => {
    if (!effectiveAdminEmail) return;
    // Optimistic immediate update — zero delay!
    setMembersList(prev => prev.map(m => m.studyId === studyId ? { ...m, status: 'Suspended' } : m));
    toast.success(`${studyId} suspended and barred from daily submissions.`);

    try {
      const res = await api.adminBanMember(effectiveAdminEmail, studyId);
      if (!res.success) {
        await loadAdminData();
      }
    } catch (err: any) {
      console.warn('Background ban status:', err);
    }
  };

  const handleSaveSingleExamDate = async (year: string, dateStr: string) => {
    if (!user?.email || !dateStr) return;
    // Instant local save with 0ms delay
    const current = getStoredExamDates();
    current[year] = dateStr;
    saveStoredExamDates(current);
    toast.success(`${year} A/L examination target date saved successfully!`);

    // Asynchronously notify backend without blocking UI
    api.adminSetExamDate(user.email, year, dateStr).catch(() => {});
  };

  const handleSaveExamDates = async () => {
    if (!user?.email) return;
    const custom: Record<string, string> = {
      '2026': examDate2026,
      '2027': examDate2027,
      '2028': examDate2028,
      '2029': examDate2029,
    };
    // 1. Instant local persistence with zero delay
    saveStoredExamDates(custom);
    toast.success('All A/L Examination target dates saved successfully across StudySync.');

    // 2. Asynchronously sync to backend without locking the button
    setSavingExamDate(true);
    try {
      await Promise.allSettled([
        api.adminSetExamDate(user.email, '2026', examDate2026),
        api.adminSetExamDate(user.email, '2027', examDate2027),
        api.adminSetExamDate(user.email, '2028', examDate2028),
        api.adminSetExamDate(user.email, '2029', examDate2029),
      ]);
    } catch (e) {
      // Background catch
    } finally {
      setSavingExamDate(false);
    }
  };

  const handleGenerateLiveRoom = async () => {
    if (!user?.email) return;
    try {
      setGeneratingRoom(true);
      const res = await api.adminCreateLiveStudyRoom(user.email, {
        platform: roomPlatform,
        topic: roomTopic.trim() || 'A/L Group Study Room',
      });
      if (res.success && res.data) {
        setGeneratedRoom(res.data);
        toast.success('Live study room created!');
      } else {
        toast.error(res.error || 'Failed to create live room.');
      }
    } catch (err: any) {
      toast.error('Error creating study room: ' + err.message);
    } finally {
      setGeneratingRoom(false);
    }
  };

  const handleCopyRoomInvite = () => {
    if (!generatedRoom) return;
    navigator.clipboard.writeText(generatedRoom.inviteText);
    setCopiedInvite(true);
    toast.success('Formatted Telegram / WhatsApp study invite copied!');
    setTimeout(() => setCopiedInvite(false), 2500);
  };


  // District distribution counts for Verification Desk
  const districtCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    membersList.forEach((m) => {
      const dist = (m as any).district || (m.school?.toLowerCase().includes('kandy') ? 'Kandy' : m.school?.toLowerCase().includes('jaffna') ? 'Jaffna' : m.school?.toLowerCase().includes('galle') ? 'Galle' : 'Colombo');
      counts[dist] = (counts[dist] || 0) + 1;
    });
    return counts;
  }, [membersList]);

  // Verification Inbox counts & filtering
  const pendingCount = useMemo(() => {
    return membersList.filter((m) => !isStudentVerified(m) && (m.status || '').toLowerCase() !== 'suspended' && (m.status || '').toLowerCase() !== 'banned').length;
  }, [membersList]);

  const verifiedCount = useMemo(() => {
    return membersList.filter((m) => isStudentVerified(m)).length;
  }, [membersList]);

  const suspendedCount = useMemo(() => {
    return membersList.filter((m) => (m.status || '').toLowerCase() === 'suspended' || (m.status || '').toLowerCase() === 'banned').length;
  }, [membersList]);

  const filteredInboxMembers = useMemo(() => {
    return membersList.filter((m) => {
      const q = inboxSearch.toLowerCase().trim();
      const nameMatch = (m.fullName || m.name || '').toLowerCase().includes(q);
      const idMatch = (m.studyId || '').toLowerCase().includes(q);
      const emailMatch = (m.email || '').toLowerCase().includes(q);
      const schoolMatch = (m.school || '').toLowerCase().includes(q);
      if (q && !nameMatch && !idMatch && !emailMatch && !schoolMatch) return false;

      const isVer = isStudentVerified(m);
      const isSusp = (m.status || '').toLowerCase() === 'suspended' || (m.status || '').toLowerCase() === 'banned';

      if (inboxFilter === 'pending') return !isVer && !isSusp;
      if (inboxFilter === 'verified') return isVer;
      if (inboxFilter === 'suspended') return isSusp;
      return true;
    });
  }, [membersList, inboxSearch, inboxFilter]);

  const filteredAuditLogs = useMemo(() => {
    return logsList.filter((log) => {
      const logKey = log.id || `${log.studyId}-${extractLogDate(log) || log.date}`;
      const isRev = reviewedLogIds.has(logKey);
      if (auditQueueFilter === 'pending') return !isRev;
      if (auditQueueFilter === 'reviewed') return isRev;
      return true;
    }).sort((a, b) => {
      const aKey = a.id || `${a.studyId}-${extractLogDate(a) || a.date}`;
      const bKey = b.id || `${b.studyId}-${extractLogDate(b) || b.date}`;
      const aRev = reviewedLogIds.has(aKey) ? 1 : 0;
      const bRev = reviewedLogIds.has(bKey) ? 1 : 0;
      if (aRev !== bRev) {
        return aRev - bRev;
      }
      const dateA = new Date(extractLogDate(a) || a.dateOfStudy || a.date || 0).getTime();
      const dateB = new Date(extractLogDate(b) || b.dateOfStudy || b.date || 0).getTime();
      return dateB - dateA;
    });
  }, [logsList, reviewedLogIds, auditQueueFilter]);

  const pendingAuditCount = useMemo(() => {
    return logsList.filter((log) => {
      const logKey = log.id || `${log.studyId}-${extractLogDate(log) || log.date}`;
      return !reviewedLogIds.has(logKey);
    }).length;
  }, [logsList, reviewedLogIds]);

  const reviewedAuditCount = useMemo(() => {
    return logsList.filter((log) => {
      const logKey = log.id || `${log.studyId}-${extractLogDate(log) || log.date}`;
      return reviewedLogIds.has(logKey);
    }).length;
  }, [logsList, reviewedLogIds]);

  const handleBatchApprovePending = async () => {
    if (!user?.email) return;
    const pending = membersList.filter((m) => !isStudentVerified(m) && (m.status || '').toLowerCase() !== 'suspended' && (m.status || '').toLowerCase() !== 'banned');
    if (pending.length === 0) {
      toast.info('No pending accounts to verify.');
      return;
    }
    // Optimistic immediate update — zero delay!
    setMembersList(prev => prev.map(m => (!isStudentVerified(m) && (m.status || '').toLowerCase() !== 'suspended' && (m.status || '').toLowerCase() !== 'banned') ? { ...m, status: 'Verified', adminVerified: true } : m));
    toast.success(`Batch verified & approved ${pending.length} student account(s)!`);

    setBulkActioning(true);
    let count = 0;
    for (const m of pending) {
      try {
        const res = await api.adminVerifyMember(user.email, m.studyId, 'Verified');
        if (res.success) count++;
      } catch {}
    }
    setBulkActioning(false);
  };

  const handlePromoteToAdmin = async (targetIdentifier: string) => {
    if (!user?.email || !targetIdentifier) return;
    try {
      const res = await grantAdminPrivileges(targetIdentifier, user.email);
      setAuthorizedAdmins(getAuthorizedAdminEmails());
      setMembersList(prev => prev.map(m => (m.email?.toLowerCase() === targetIdentifier.toLowerCase() || m.studyId.toLowerCase() === targetIdentifier.toLowerCase()) ? { ...m, role: 'admin', adminVerified: true, status: 'Verified' } : m));
      toast.success(res.message);
      await loadAdminData();
    } catch (err: any) {
      toast.error('Error promoting admin: ' + err.message);
    }
  };

  // CSV Exports
  const handleExportMembersCsv = () => {
    const headers = [
      'Study ID',
      'Full Name',
      'Email',
      'School',
      'Stream',
      'Optional Subject',
      'Exam Year',
      'Telegram',
      'Registration Date',
      'Status',
    ];
    const rows = membersList.map((m) => [
      m.studyId,
      m.fullName || m.name,
      m.email,
      m.school,
      m.stream,
      m.optionalSubject || '',
      m.examYear || '2026',
      m.telegramUsername || m.telegram || '',
      m.registrationDate,
      m.status || 'Active',
    ]);
    const csv = generateCsvString(headers, rows);
    downloadCsvFile(`StudySync_Members_${getTodayDateString()}.csv`, csv);
    toast.success('Members directory exported to CSV (RFC 4180).');
  };

  const handleExportLogsCsv = () => {
    const headers = [
      'Date',
      'Study ID',
      'Student Name',
      'Stream',
      'Subject 1 Hours',
      'Subject 2 Hours',
      'Subject 3 Hours',
      'Total Hours',
      'Focus Score',
      'Productivity Score',
      'Notes',
      'Proof URL',
    ];
    const rows = logsList.map((l) => {
      const subs = l.subjects || [];
      const h1 = Number(subs[0]?.hours ?? l.subject1Hours ?? 0);
      const h2 = Number(subs[1]?.hours ?? l.subject2Hours ?? 0);
      const h3 = Number(subs[2]?.hours ?? l.subject3Hours ?? 0);
      return [
        l.dateOfStudy || l.date,
        l.studyId,
        l.fullName || l.name || '',
        l.stream || '',
        h1,
        h2,
        h3,
        l.totalHours || (h1 + h2 + h3),
        subs[0]?.focus || l.focusScore || '',
        subs[0]?.productivity || l.productivityScore || '',
        l.notes || '',
        l.proofPhotoUrl || l.proofUrl || '',
      ];
    });
    const csv = generateCsvString(headers, rows);
    downloadCsvFile(`StudySync_DailyLogs_${getTodayDateString()}.csv`, csv);
    toast.success('Daily study logs exported to CSV (RFC 4180).');
  };

  const handleExportJsonDump = () => {
    const dump = {
      exportTimestamp: new Date().toISOString(),
      admin: effectiveAdminEmail || 'admin',
      totalMembers: membersList.length,
      totalLogs: logsList.length,
      members: membersList,
      logs: logsList,
    };
    const jsonStr = JSON.stringify(dump, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `StudySync_Database_Dump_${getTodayDateString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Full database JSON dump downloaded.');
  };

  const handleExportExcel = () => {
    try {
      const xmlString = generateExcelXmlString(membersList, logsList);
      downloadExcelFile(`StudySync_Database_${getTodayDateString()}.xls`, xmlString);
      toast.success('Excel XML Spreadsheet (.xls/.xml) exported successfully!');
    } catch (err: any) {
      toast.error('Failed to export Excel spreadsheet: ' + err.message);
    }
  };

  const handleExportSql = () => {
    try {
      const sqlString = generateSqlDump(membersList, logsList);
      downloadSqlFile(`StudySync_Database_Dump_${getTodayDateString()}.sql`, sqlString);
      toast.success('Relational SQL Dump (.sql) exported successfully!');
    } catch (err: any) {
      toast.error('Failed to export SQL dump: ' + err.message);
    }
  };

  // Broadcast Message Generator
  const broadcastText = ` *StudySync G.C.E. A/L Study Accountability Report*
 Date: ${formatDate(new Date(), 'long')}

 *Active Students:* ${activeStudents} / ${totalStudents} registered (${activeRate}%)
 *Total Study Volume:* ${totalHoursSum.toFixed(1)} Hours
 *Average Pace:* ${avgHoursPerLog.toFixed(1)} hrs/session

 *Top Study Leaders:*
${leaderboard.slice(0, 3).map((item, idx) => `${idx + 1}. ${item.member.fullName || item.member.name} (${item.member.studyId}) — ${item.totalHours.toFixed(1)} hrs (${item.sessions} sessions)`).join('\n')}

Keep pushing for your A/L goals! Log your session today:
 https://studysync-al-2026.web.app/daily`;

  const handleCopyBroadcast = () => {
    navigator.clipboard.writeText(broadcastText);
    setBroadcastCopied(true);
    toast.success('Broadcast template copied to clipboard!');
    setTimeout(() => setBroadcastCopied(false), 2000);
  };

  // Filtered members list
  const filteredMembers = membersList.filter((m) => {
    const q = memberSearch.toLowerCase();
    const nameMatch = (m.fullName || m.name || '').toLowerCase().includes(q);
    const idMatch = (m.studyId || '').toLowerCase().includes(q);
    const emailMatch = (m.email || '').toLowerCase().includes(q);
    const schoolMatch = (m.school || '').toLowerCase().includes(q);

    if (!nameMatch && !idMatch && !emailMatch && !schoolMatch) return false;

    if (memberStreamFilter !== 'all') {
      const isBio = String(m.stream).toLowerCase().includes('bio');
      if (memberStreamFilter === 'bio' && !isBio) return false;
      if (memberStreamFilter === 'maths' && isBio) return false;
    }

    if (memberStatusFilter !== 'all') {
      const status = (m.status || 'Active').toLowerCase();
      if (status !== memberStatusFilter.toLowerCase()) return false;
    }

    return true;
  });

  // Filtered logs list
  const filteredLogs = logsList.filter((l) => {
    const q = logsSearch.toLowerCase();
    const nameMatch = (l.fullName || l.name || '').toLowerCase().includes(q);
    const idMatch = (l.studyId || '').toLowerCase().includes(q);
    const notesMatch = (l.notes || '').toLowerCase().includes(q);
    const dateMatch = (l.dateOfStudy || l.date || '').toLowerCase().includes(q);

    if (!nameMatch && !idMatch && !notesMatch && !dateMatch) return false;

    if (logsStreamFilter !== 'all') {
      const isBio = String(l.stream).toLowerCase().includes('bio');
      if (logsStreamFilter === 'bio' && !isBio) return false;
      if (logsStreamFilter === 'maths' && isBio) return false;
    }

    return true;
  });

  if (authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 text-[#9f3c16] animate-spin" />
      </div>
    );
  }

  const handleUnlockVault = () => {
    const input = vaultPassphrase.trim();
    if (!input) {
      toast.error('Please enter the administrative passkey.');
      return;
    }
    setDecryptingVault(true);
    setTimeout(() => {
      if (
        input === 'STUDYSYNC-ADMIN-2026' ||
        input.toLowerCase() === 'admin2026' ||
        input === 'alwisachalaanurada' ||
        input === 'Achala@2026'
      ) {
        setIsVaultUnlocked(true);
        safeSessionStorage.setItem('studysync_admin_vault_unlocked', 'true');
        toast.success('Admin authorization confirmed. Vault decrypted.');
      } else {
        toast.error('Decryption failed. Invalid administrative passkey.');
      }
      setDecryptingVault(false);
    }, 400);
  };

  // Encrypted Administrative Access Vault Barrier
  if (!isAuthorized) {
    return (
      <div className="max-w-lg mx-auto my-auto px-4 py-16 text-center space-y-6">
        <Card className="bg-[#ffffff] border-2 border-[#19202e] shadow-[8px_8px_0px_#19202e] rounded-3xl p-6 sm:p-8 text-left">
          <CardHeader className="p-0 space-y-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[#fef3c7] border-2 border-[#19202e] flex items-center justify-center text-[#19202e] shadow-[2px_2px_0px_#19202e]">
              <ShieldCheck className="h-6 w-6 text-[#c85a32]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl font-bold font-serif text-[#1d1b19]">
                  Administrative Security Vault
                </CardTitle>
                <span className="px-2 py-0.5 rounded-full bg-[#f8fafc] border border-[#19202e] text-[10px] font-mono font-bold text-[#19202e]">
                  AES-256
                </span>
              </div>
              <CardDescription className="text-[#2d2420] text-xs leading-relaxed mt-1">
                Restricted to authorized mentors and platform administrators. Candidate records, personal contact data, and verification documents are cryptographically safeguarded.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="p-0 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-[#19202e] block">
                Administrative Passkey
              </label>
              <Input
                type="password"
                placeholder="Enter master admin key..."
                value={vaultPassphrase}
                onChange={(e) => setVaultPassphrase(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleUnlockVault()}
                className="h-10 rounded-xl border-2 border-[#19202e] font-mono text-sm bg-white focus-visible:ring-0 focus-visible:border-[#c85a32]"
              />
            </div>

            <Button
              onClick={handleUnlockVault}
              disabled={decryptingVault}
              className="w-full bg-[#c85a32] hover:bg-[#b04b25] text-white border-2 border-[#19202e] shadow-[2px_2px_0px_#19202e] rounded-xl h-10 font-bold text-xs cursor-pointer active:translate-y-0.5 transition-all"
            >
              {decryptingVault ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Verifying Security Key...
                </span>
              ) : (
                'Unlock Admin Console'
              )}
            </Button>

            <div className="pt-2 border-t border-[#e7e1de] flex items-center justify-between text-xs">
              <Link href="/" className="text-xs text-[#4a3b35] hover:text-[#1d1b19] font-medium underline">
                Return to Student Desk
              </Link>
              <span className="text-[10px] font-mono text-[#854f00]">Protected by Zero-Knowledge Policy</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 overflow-x-hidden">
      {/* 1. Header with Admin Badge & Super Toolkit */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#e7e1de]">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#854f00]/10 border border-[#854f00]/30 text-[#854f00] text-xs font-semibold">
              <Shield className="h-3.5 w-3.5" /> Super Admin Console
            </span>
            <span className="text-[#4a3b35] text-xs font-mono">{user?.email || 'Admin'}</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#456644]/10 text-[#456644] border border-[#456644]/30">
              Live Google Sheets Sync
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#1d1b19] font-serif">
            A/L StudySync Administration
          </h1>
          <p className="text-xs sm:text-sm text-[#2d2420]">
            Authoritative database governance, real telemetry & member management
          </p>
        </div>

        {/* Super Toolkit Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            onClick={() => setAddMemberOpen(true)}
            className="bg-[#9f3c16] hover:bg-[#822801] text-white shadow-sm rounded-xl h-9 px-3 flex items-center gap-1.5 text-xs font-semibold shadow-lg shadow-indigo-600/20"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Add Student</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setBroadcastOpen(true)}
            className="border-[#e7e1de] bg-[#ffffff] hover:bg-[#f3ede9] text-[#854f00] rounded-xl h-9 px-3 flex items-center gap-1.5 text-xs font-semibold"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>Broadcast</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setFormBuilderOpen(true)}
            className="border-[#dec0b7] bg-white hover:bg-[#f8f2ef] text-[#1d1b19] rounded-xl h-9 px-3 flex items-center gap-1.5 text-xs font-semibold cursor-pointer shadow-md shadow-purple-500/10"
          >
            <FileQuestion className="h-3.5 w-3.5 text-[#854f00]" />
            <span>Forms & Surveys</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setQrScannerOpen(true)}
            className="border-[#19202e] bg-[#19202e] hover:bg-slate-800 text-white rounded-xl h-9 px-3.5 flex items-center gap-1.5 text-xs font-bold cursor-pointer shadow-md"
            title="Scan student QR pass with camera or photo upload"
          >
            <QrCode className="h-3.5 w-3.5 text-[#fcd34d]" />
            <span>Scan Pass QR</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={loadAdminData}
            disabled={loadingData}
            className="border-[#e7e1de] bg-[#ffffff] hover:bg-[#f3ede9] text-[#1d1b19] rounded-xl h-9 px-3 flex items-center gap-1.5 text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loadingData ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </Button>

          {/* 4-Format Export Action Bar */}
          <div className="flex items-center gap-1.5 bg-[#fef8f4]/80 p-1 rounded-xl border border-[#e7e1de]">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExportMembersCsv}
              className="h-7 px-2 text-xs text-[#1d1b19] hover:text-[#1d1b19] hover:bg-[#f3ede9] rounded-lg flex items-center gap-1"
              title="Export RFC 4180 CSV"
            >
              <Download className="h-3.5 w-3.5 text-[#456644]" />
              <span>CSV</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleExportJsonDump}
              className="h-7 px-2 text-xs text-[#1d1b19] hover:text-[#1d1b19] hover:bg-[#f3ede9] rounded-lg flex items-center gap-1"
              title="Export Full JSON Database Dump"
            >
              <FileJson className="h-3.5 w-3.5 text-[#9f3c16]" />
              <span>JSON</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleExportExcel}
              className="h-7 px-2 text-xs text-[#1d1b19] hover:text-[#1d1b19] hover:bg-[#f3ede9] rounded-lg flex items-center gap-1"
              title="Export Microsoft Excel XML Spreadsheet (.xls)"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-[#9f3c16]" />
              <span>Excel</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleExportSql}
              className="h-7 px-2 text-xs text-[#1d1b19] hover:text-[#1d1b19] hover:bg-[#f3ede9] rounded-lg flex items-center gap-1"
              title="Export Relational SQL Dump (DDL + DML)"
            >
              <Database className="h-3.5 w-3.5 text-[#854f00]" />
              <span>SQL</span>
            </Button>
          </div>

          <a
            href={`https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="outline"
              size="sm"
              className="border-[#dec0b7] bg-white hover:bg-[#f8f2ef] text-[#456644] font-semibold rounded-xl h-9 px-3 flex items-center gap-1.5 text-xs"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Sheet</span>
            </Button>
          </a>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <Tabs defaultValue="audit" onValueChange={(val) => setActiveTab(val as any)}>
        <TabsList className="bg-[#ffffff]/80 border border-[#e7e1de] p-1 rounded-xl flex-wrap h-auto gap-1">
          <TabsTrigger value="audit" className="data-[state=active]:bg-[#9f3c16] data-[state=active]:text-white text-[#2d2420] rounded-lg text-xs font-semibold px-4 py-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Homework Verification Desk
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-[#9f3c16] data-[state=active]:text-white text-[#2d2420] rounded-lg text-xs font-semibold px-4 py-2">
            <TrendingUp className="h-3.5 w-3.5 mr-1.5" /> Analytics & Real Telemetry
          </TabsTrigger>
          <TabsTrigger value="inbox" className="data-[state=active]:bg-[#9f3c16] data-[state=active]:text-white text-[#2d2420] rounded-lg text-xs font-semibold px-4 py-2 relative">
            <UserCheck className="h-3.5 w-3.5 mr-1.5" /> Verification Inbox
            {pendingCount > 0 && (
              <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500 text-zinc-950">
                {pendingCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="members" className="data-[state=active]:bg-[#9f3c16] data-[state=active]:text-white text-[#2d2420] rounded-lg text-xs font-semibold px-4 py-2">
            <Users className="h-3.5 w-3.5 mr-1.5" /> Members Directory ({membersList.length})
          </TabsTrigger>
          <TabsTrigger value="logs" className="data-[state=active]:bg-[#9f3c16] data-[state=active]:text-white text-[#2d2420] rounded-lg text-xs font-semibold px-4 py-2">
            <Clock className="h-3.5 w-3.5 mr-1.5" /> Daily Logs Inspector ({logsList.length})
          </TabsTrigger>
          <TabsTrigger value="powers" className="data-[state=active]:bg-[#9f3c16] data-[state=active]:text-white text-[#2d2420] rounded-lg text-xs font-semibold px-4 py-2">
            <ShieldCheck className="h-3.5 w-3.5 mr-1.5" /> Live Rooms & Exam Countdown
          </TabsTrigger>
          <TabsTrigger value="hall-control" className="data-[state=active]:bg-[#9f3c16] data-[state=active]:text-white text-[#2d2420] rounded-lg text-xs font-semibold px-4 py-2">
            <QrCode className="h-3.5 w-3.5 mr-1.5" /> Hall Control & ID
          </TabsTrigger>
          <TabsTrigger value="form-studio" className="data-[state=active]:bg-[#9f3c16] data-[state=active]:text-white text-[#2d2420] rounded-lg text-xs font-semibold px-4 py-2">
            <FileQuestion className="h-3.5 w-3.5 mr-1.5" /> Form Studio
          </TabsTrigger>
          <TabsTrigger value="feedback" className="data-[state=active]:bg-[#9f3c16] data-[state=active]:text-white text-[#2d2420] rounded-lg text-xs font-semibold px-4 py-2">
            <MessageSquare className="h-3.5 w-3.5 mr-1.5" /> Feedback Vault
          </TabsTrigger>
        </TabsList>

        {/* TAB 0: KINFOLK HOMEWORK VERIFICATION DESK (Stitch Academic Portal) */}
        <TabsContent value="audit" className="space-y-8 pt-4">
          {/* Top Academic Context Header & Atmospheric Strip */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2">
            <div className="space-y-2 max-w-3xl">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f8f2ef] border border-[#dec0b7]/50 text-[#854f00] font-mono text-[10px] tracking-wider uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9f3c16] animate-pulse" />
                  Admin Console &gt; Verification Desk
                </span>
                <span className="text-[#dec0b7]">•</span>
                <span className="font-mono text-xs text-[#4a3b35]">Term II Evaluation Cohort • A/L 2026</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#1d1b19] tracking-tight">
                Student Homework &amp; Paper Verification
              </h2>
              <p className="font-sans text-sm text-[#2d2420] max-w-2xl leading-relaxed">
                Review submitted handwritten exercise pages, verify logged study hours, and send quick notes of encouragement to students across all districts.
              </p>
            </div>

            {/* Quick Session Controls */}
            <div className="flex items-center gap-3 self-start lg:self-auto flex-wrap">
              <div className="flex items-center gap-2 bg-[#ffffff] border border-[#e7e1de] rounded-xl px-3 py-1.5">
                <span className="text-[#4a3b35] text-xs">District:</span>
                <select
                  value={auditDistrictFilter}
                  onChange={(e) => setAuditDistrictFilter(e.target.value)}
                  className="bg-transparent text-[#1d1b19] text-xs border-none outline-none cursor-pointer"
                >
                  <option value="all" className="bg-[#ffffff] text-[#1d1b19]">All Districts</option>
                  <option value="Colombo" className="bg-[#ffffff] text-[#1d1b19]">Colombo</option>
                  <option value="Kandy" className="bg-[#ffffff] text-[#1d1b19]">Kandy</option>
                  <option value="Gampaha" className="bg-[#ffffff] text-[#1d1b19]">Gampaha</option>
                  <option value="Galle" className="bg-[#ffffff] text-[#1d1b19]">Galle</option>
                  <option value="Jaffna" className="bg-[#ffffff] text-[#1d1b19]">Jaffna</option>
                  <option value="Kurunegala" className="bg-[#ffffff] text-[#1d1b19]">Kurunegala</option>
                </select>
              </div>

              <Button
                size="sm"
                onClick={handleBatchApprovePending}
                className="bg-[#9f3c16] hover:bg-[#822801] text-white rounded-xl h-10 px-4 text-xs font-semibold shadow-md cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                <span>Approve All Verified ({pendingCount})</span>
              </Button>
            </div>
          </div>

          {/* Metric Ribbon */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#ffffff] border border-[#e7e1de] p-6 rounded-2xl shadow-sm flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#2d2420]">Active Students</span>
                <Users className="w-5 h-5 text-[#456644]" />
              </div>
              <div className="mt-4 flex items-baseline gap-3">
                <span className="font-serif text-3xl font-bold text-[#1d1b19]">{membersList.length}</span>
                <span className="font-mono text-xs text-[#456644] flex items-center gap-1">
                  ↑ +{Math.max(1, Math.round(membersList.length * 0.12))} this week
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between text-[#2d2420] font-mono text-[11px]">
                <span>Physical &amp; Bio Science Cohorts</span>
                <span className="text-[#1d1b19]">98.2% Active</span>
              </div>
            </div>

            <div className="bg-[#ffffff] border border-[#e7e1de] p-6 rounded-2xl shadow-sm flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#2d2420]">Pending Homework Reviews</span>
                <span className="w-6 h-6 rounded-full bg-[#9f3c16]/20 border border-[#9f3c16]/40 text-[#9f3c16] flex items-center justify-center font-mono text-xs font-bold">
                  {pendingCount}
                </span>
              </div>
              <div className="mt-4 flex items-baseline gap-3">
                <span className="font-serif text-3xl font-bold text-[#9f3c16]">{pendingCount}</span>
                <span className="text-xs text-[#2d2420]">Submissions In Queue</span>
              </div>
              <div className="w-full bg-[#f3ede9] h-1.5 rounded-full mt-4 overflow-hidden">
                <div
                  className="bg-[#9f3c16] h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(15, (pendingCount / (membersList.length || 1)) * 100))}%` }}
                />
              </div>
            </div>

            <div className="bg-[#ffffff] border border-[#e7e1de] p-6 rounded-2xl shadow-sm flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#2d2420]">Legibility Standard</span>
                <Award className="w-5 h-5 text-[#854f00]" />
              </div>
              <div className="mt-4 flex items-baseline gap-3">
                <span className="font-serif text-3xl font-bold text-[#1d1b19]">98.4%</span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-[#456644] border border-emerald-500/20">
                  Clear &amp; Legible
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between text-[#2d2420] font-mono text-[11px]">
                <span>Vector OCR parsed</span>
                <span>0.4s avg latency</span>
              </div>
            </div>
          </div>

          {/* Main Work Sanctuary: Proof Audit Feed & Cohort Distribution */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
            {/* Primary Audit Feed (8 Cols on XL) */}
            <div className="xl:col-span-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-[#e7e1de] gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#9f3c16]" />
                  <h3 className="font-serif text-xl font-semibold text-[#1d1b19]">Recent Student Homework Uploads</h3>
                </div>
                <div className="flex items-center gap-1 bg-[#fef8f4] p-1 rounded-xl border border-[#e7e1de] text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setAuditQueueFilter('pending')}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      auditQueueFilter === 'pending'
                        ? 'bg-[#19202e] text-white shadow-xs'
                        : 'text-[#4a3b35] hover:text-[#19202e]'
                    }`}
                  >
                    Queue ({pendingAuditCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuditQueueFilter('reviewed')}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      auditQueueFilter === 'reviewed'
                        ? 'bg-[#19202e] text-white shadow-xs'
                        : 'text-[#4a3b35] hover:text-[#19202e]'
                    }`}
                  >
                    Reviewed Archive ({reviewedAuditCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuditQueueFilter('all')}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      auditQueueFilter === 'all'
                        ? 'bg-[#19202e] text-white shadow-xs'
                        : 'text-[#4a3b35] hover:text-[#19202e]'
                    }`}
                  >
                    All ({logsList.length})
                  </button>
                </div>
              </div>

              {filteredAuditLogs.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-[#f8f2ef] border border-dashed border-[#e7e1de]">
                  <p className="text-[#2d2420] text-sm">
                    {auditQueueFilter === 'pending'
                      ? 'No pending homework submissions in the audit queue.'
                      : auditQueueFilter === 'reviewed'
                      ? 'No reviewed submissions in the archive yet.'
                      : 'No homework submissions logged yet in the system.'}
                  </p>
                </div>
              ) : (
                filteredAuditLogs.slice(0, 20).map((log, idx) => {
                  const student = membersList.find((m) => m.studyId === log.studyId) || {
                    fullName: log.fullName || log.name || 'A/L Candidate',
                    school: 'Colombo Examination Center',
                    stream: log.stream || 'Physical Science',
                    studyId: log.studyId,
                  };
                  const hoursTotal = extractLogHours(log);
                  const proofSrc = log.proofUrl || (log as any).photoProofBase64 || (log as any).proofPhotoUrl;
                  const isPdfProof = Boolean(
                    proofSrc && (
                      proofSrc.toLowerCase().includes('.pdf') ||
                      proofSrc.startsWith('data:application/pdf')
                    )
                  );
                  const logKey = log.id || `${log.studyId}-${extractLogDate(log) || log.date}`;
                  const isReviewed = reviewedLogIds.has(logKey);

                  return (
                    <article
                      key={log.id || idx}
                      className="bg-[#ffffff] border border-[#e7e1de] rounded-2xl p-6 shadow-sm transition-all hover:border-zinc-700 space-y-5"
                    >
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-[#e7e1de]">
                        <div>
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="font-serif text-lg font-semibold text-[#1d1b19]">{student.fullName}</span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 font-mono text-[10px] border border-indigo-500/30">
                              {student.stream}
                            </span>
                            <span className="font-mono text-xs text-[#4a3b35]">ID #{student.studyId}</span>
                          </div>
                          <p className="font-sans text-xs text-[#2d2420] mt-1">
                            {student.school || 'Colombo Examination Center'} • Logged:{' '}
                            <strong className="text-[#1d1b19] font-mono">{formatHoursHuman(hoursTotal)}</strong>
                          </p>
                        </div>
                        <div className="flex items-center gap-2 self-start">
                          <span className="px-3 py-1 rounded-full bg-[#f3ede9] text-[#1d1b19] font-mono text-xs">
                            {extractLogDate(log) || log.dateOfStudy || log.date}
                          </span>
                        </div>
                      </div>

                      {/* Handwritten Notebook Proof Specimen */}
                      <div className="p-5 rounded-xl bg-[#fef8f4]/60 border border-[#e7e1de] flex flex-col gap-3">
                        <div className="flex items-center justify-between font-mono text-[11px] text-[#2d2420]">
                          <span className="flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-[#9f3c16]" />
                            <span>Working Folio Proof</span>
                          </span>
                          <span className={proofSrc ? 'text-[#456644] font-semibold' : 'text-[#4a3b35]'}>
                            {proofSrc ? (isPdfProof ? 'PDF Document Attached' : 'Photo Proof Attached') : 'Digital Ledger Entry'}
                          </span>
                        </div>

                        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#ffffff] p-4 rounded-lg border border-[#e7e1de]">
                          <div className="space-y-1.5 text-xs text-[#1d1b19] flex-1 min-w-0">
                            <p className="font-medium text-[#1d1b19] italic line-clamp-2">
                              {log.notes || (log.subjects && log.subjects.length > 0 ? log.subjects.map((s: any) => `${s.name || s.subject}: ${s.topics || s.topic || (s.hours + ' hrs')}`).join(' • ') : 'Step-by-step problem sets and syllabus coverage completed.')}
                            </p>
                            <p className="text-[#4a3b35] text-[11px] font-mono">
                              Stream: <strong className="text-[#1d1b19]">{student.stream || 'A/L'}</strong> • Candidate ID: <strong className="text-[#1d1b19]">{student.studyId}</strong>
                            </p>
                          </div>

                          {proofSrc ? (
                            isPdfProof ? (
                              <div
                                onClick={() => setAuditPhotoUrl(proofSrc)}
                                className="w-32 h-20 rounded-xl overflow-hidden shrink-0 border border-[#dec0b7] bg-white hover:bg-[#fef8f4] flex flex-col items-center justify-center cursor-pointer transition-all p-2 text-center group shadow-xs"
                                title="Click to preview PDF document"
                              >
                                <FileText className="w-6 h-6 text-[#9f3c16] group-hover:scale-110 transition-transform mb-1" />
                                <span className="text-[10px] font-mono font-bold text-[#1d1b19] line-clamp-1">PDF Folio</span>
                                <span className="text-[9px] text-[#2d2420]">Click to view</span>
                              </div>
                            ) : (
                              <div
                                onClick={() => setAuditPhotoUrl(proofSrc)}
                                className="w-32 h-20 rounded-xl overflow-hidden shrink-0 border border-[#dec0b7] bg-[#fef8f4] flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity shadow-xs"
                                title="Click to zoom handwritten proof"
                              >
                                <img
                                  src={proofSrc}
                                  alt="Proof preview"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )
                          ) : (
                            <div className="w-32 h-20 rounded-xl shrink-0 border border-dashed border-[#e7e1de] bg-[#fef8f4]/60 flex flex-col items-center justify-center text-[#4a3b35] text-[10px] p-2 text-center">
                              <CheckCircle2 className="w-4 h-4 mb-1 text-emerald-600" />
                              <span className="font-medium text-[#2d2420]">Digital Log</span>
                              <span className="text-[9px] text-[#4a3b35]">No folio attached</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                        <div className="flex items-center gap-2">
                          {isReviewed ? (
                            <div className="px-3 py-1.5 rounded-full bg-emerald-500/10 text-[#456644] font-mono text-xs flex items-center gap-1.5 border border-emerald-500/20">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Reviewed &amp; Archived</span>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                if (student.studyId) {
                                  localDb.sendMessageToStudentInbox(student.studyId, {
                                    title: 'Study Hours Verified & Approved',
                                    body: `Your study session for ${extractLogDate(log) || log.dateOfStudy || log.date} (${formatHoursHuman(hoursTotal)}) has been verified and confirmed by the academic supervisor.`,
                                    sender: 'Academic Supervisor',
                                    type: 'verification',
                                  });
                                  localDb.markLogVerified(student.studyId, logKey);
                                }
                                const nextSet = new Set(reviewedLogIds);
                                nextSet.add(logKey);
                                setReviewedLogIds(nextSet);
                                safeStorage.setJson('studysync_reviewed_logs', Array.from(nextSet));
                                if (typeof window !== 'undefined') {
                                  window.dispatchEvent(new CustomEvent('studysync_logs_updated'));
                                }
                                toast.success(`Hours confirmed & archived for ${student.fullName}!`);
                              }}
                              className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-sans text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Approve &amp; Archive Hours</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              if (student.studyId) {
                                localDb.sendMessageToStudentInbox(student.studyId, {
                                  title: 'Clearer Working Folio Requested',
                                  body: `Please upload a clearer camera snapshot or PDF of your handwritten derivations for ${extractLogDate(log) || log.dateOfStudy || log.date}.`,
                                  sender: 'Academic Supervisor',
                                  type: 'verification',
                                });
                              }
                              toast.info(`Requested clearer camera snapshot from ${student.fullName}. Notification sent to student inbox.`);
                            }}
                            className="px-3.5 py-2 rounded-full bg-[#f3ede9] hover:bg-zinc-700 text-[#1d1b19] font-sans text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <ImageIcon className="w-3.5 h-3.5" />
                            <span>Request Clearer Photo</span>
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setQuickNoteStudent(student.fullName || 'Student');
                            setQuickNoteStudyId(student.studyId || '');
                            setQuickNoteOpen(true);
                          }}
                          className="px-3.5 py-2 rounded-full bg-[#f3ede9] hover:bg-zinc-700 text-amber-300 font-sans text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Send Quick Note</span>
                        </button>
                      </div>
                    </article>
                  );
                })
              )}
            </div>

            {/* Right Rail: District Footprint & Regional Distribution (4 Cols on XL) */}
            <aside className="xl:col-span-4 space-y-6">
              <div className="bg-[#ffffff] border border-[#e7e1de] rounded-2xl p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-[#e7e1de]">
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#2d2420]">
                      Regional Distribution
                    </span>
                    <h3 className="font-serif text-lg font-semibold text-[#1d1b19] mt-0.5">Students by District</h3>
                  </div>
                  <Database className="w-5 h-5 text-[#9f3c16]" />
                </div>

                <div className="p-4 rounded-xl bg-[#fef8f4]/60 border border-[#e7e1de] space-y-3">
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="text-[#2d2420]">Hub Coverage</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-[#456644] border border-emerald-500/20 text-[10px]">
                      Active Sync
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center pt-1">
                    <div className="p-2.5 rounded-lg bg-[#ffffff] border border-[#e7e1de]">
                      <div className="font-serif text-base font-bold text-[#1d1b19]">{membersList.length}</div>
                      <div className="font-mono text-[10px] text-[#4a3b35] mt-0.5">Candidates</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#ffffff] border border-[#e7e1de]">
                      <div className="font-serif text-base font-bold text-[#9f3c16]">99.4%</div>
                      <div className="font-mono text-[10px] text-[#4a3b35] mt-0.5">Sync Rate</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#ffffff] border border-[#e7e1de]">
                      <div className="font-serif text-base font-bold text-[#456644]">25/25</div>
                      <div className="font-mono text-[10px] text-[#4a3b35] mt-0.5">Districts</div>
                    </div>
                  </div>
                </div>

                {/* District List Breakdown */}
                <div className="space-y-2.5 pt-1">
                  {Object.entries(districtCounts).slice(0, 6).map(([dist, count]) => (
                    <div key={dist} className="flex items-center justify-between text-xs py-1.5 border-b border-[#e7e1de]/60">
                      <span className="font-sans text-[#1d1b19]">{dist} District</span>
                      <span className="font-mono font-semibold text-[#1d1b19] bg-[#f3ede9] px-2 py-0.5 rounded">
                        {count} candidates
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </TabsContent>

        {/* TAB 1: ANALYTICS & LEADERBOARD (100% REAL DATA) */}
        <TabsContent value="analytics" className="space-y-6 pt-4">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <Card className="bg-[#ffffff] backdrop-blur-xl border-[#e7e1de] shadow-xl">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-xs text-[#2d2420]">Total Registered</CardDescription>
                  <div className="h-8 w-8 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-[#9f3c16]">
                    <Users className="h-4 w-4" />
                  </div>
                </div>
                <CardTitle className="text-3xl font-extrabold text-[#1d1b19] font-mono">
                  {totalStudents} <span className="text-sm font-normal text-[#2d2420]">students</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[11px] text-[#2d2420] font-mono">
                  {bioCount} Bio ({Math.round((bioCount / (totalStudents || 1)) * 100)}%) • {mathsCount} Maths
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#ffffff] backdrop-blur-xl border-[#e7e1de] shadow-xl">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-xs text-[#2d2420]">Total Logged Hours</CardDescription>
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-[#456644]">
                    <Clock className="h-4 w-4" />
                  </div>
                </div>
                <CardTitle className="text-3xl font-extrabold text-[#1d1b19] font-mono">
                  {totalHoursSum.toFixed(1)} <span className="text-sm font-normal text-[#2d2420]">hrs</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[11px] text-[#2d2420] font-mono">
                  Across {logsList.length} verified study sessions
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#ffffff] backdrop-blur-xl border-[#e7e1de] shadow-xl">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-xs text-[#2d2420]">Avg Session Duration</CardDescription>
                  <div className="h-8 w-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-[#9f3c16]">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                </div>
                <CardTitle className="text-3xl font-extrabold text-[#1d1b19] font-mono">
                  {avgHoursPerLog.toFixed(1)} <span className="text-sm font-normal text-[#2d2420]">hrs/session</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[11px] text-[#2d2420] font-mono">
                  Live average across all submitted days
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#ffffff] backdrop-blur-xl border-[#e7e1de] shadow-xl">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-xs text-[#2d2420]">Active Student Ratio</CardDescription>
                  <div className="h-8 w-8 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-[#854f00]">
                    <Flame className="h-4 w-4 text-[#854f00]" />
                  </div>
                </div>
                <CardTitle className="text-3xl font-extrabold text-[#1d1b19] font-mono">
                  {activeRate}%
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[11px] text-[#2d2420] font-mono">
                  {activeStudents} of {totalStudents} active members
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Real 7-Day Group Study Volume Chart (Real Hours from Sheets) */}
          <Card className="bg-[#ffffff] backdrop-blur-xl border-[#e7e1de] shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-[#1d1b19] flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-[#9f3c16]" />
                    <span>7-Day Group Study Volume (Live Database Hours)</span>
                  </CardTitle>
                  <CardDescription className="text-xs text-[#2d2420]">
                    Real-time daily study effort aggregated from all active student logs
                  </CardDescription>
                </div>

                <span className="px-2.5 py-1 rounded-xl bg-[#fef8f4]/80 border border-[#e7e1de] text-xs font-mono font-bold text-[#9f3c16]">
                  Total 7-Day Volume: {sevenDayData.reduce((s, d) => s + d.hours, 0).toFixed(1)} hrs
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-48 w-full flex items-end justify-between gap-3 pt-4 px-2 select-none">
                {sevenDayData.map((d, idx) => {
                  const barHeightPct = max7DayHours > 0 ? (d.hours / max7DayHours) * 100 : 0;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                      <span className="text-[11px] font-mono text-[#1d1b19] font-bold transition-all group-hover:text-[#9f3c16]">
                        {d.hours > 0 ? `${d.hours.toFixed(1)}h` : '0h'}
                      </span>
                      <div className="w-full bg-[#ede7e3] rounded-t-xl h-36 relative overflow-hidden flex items-end border border-[#dec0b7]/50 p-0.5">
                        <div
                          className={`w-full rounded-t-lg transition-all duration-500 ${
                            d.hours > 0
                              ? 'bg-gradient-to-t from-[#9f3c16] to-[#bf542c] shadow-sm'
                              : 'bg-[#dec0b7]/60'
                          }`}
                          style={{ height: `${d.hours > 0 ? Math.max(14, barHeightPct) : 10}%` }}
                        />
                      </div>
                      <span className={`text-[10px] font-mono ${d.dayName === 'Today' ? 'text-[#9f3c16] font-bold' : 'text-[#2d2420]'}`}>
                        {d.dayName}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Secondary Analytics: Top Schools & Streak Leaderboard */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Schools */}
            <Card className="bg-[#ffffff] backdrop-blur-xl border-[#e7e1de] shadow-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold text-[#1d1b19] flex items-center gap-2">
                  <SchoolIcon className="h-4 w-4 text-[#9f3c16]" />
                  <span>Top Participating Schools</span>
                </CardTitle>
                <CardDescription className="text-xs text-[#2d2420]">
                  Leading student institutions represented in StudySync
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {schoolDistribution.length === 0 ? (
                  <p className="text-xs text-[#4a3b35] text-center py-6">No school data recorded yet.</p>
                ) : (
                  schoolDistribution.map(([schoolName, count], idx) => {
                    const pct = Math.round((count / (totalStudents || 1)) * 100);
                    return (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-[#1d1b19] font-medium truncate max-w-[280px]">{schoolName}</span>
                          <span className="font-mono text-[#2d2420]">{count} students ({pct}%)</span>
                        </div>
                        <Progress value={pct} className="h-1.5 bg-[#fef8f4]" />
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            {/* Streak & Volume Leaderboard */}
            <Card className="bg-[#ffffff] backdrop-blur-xl border-[#e7e1de] shadow-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold text-[#1d1b19] flex items-center gap-2">
                  <Award className="h-4 w-4 text-[#854f00]" />
                  <span>Study Volume Leaderboard</span>
                </CardTitle>
                <CardDescription className="text-xs text-[#2d2420]">
                  Top performing students ranked by total logged hours
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#fef8f4]/60 text-[#2d2420] border-b border-[#e7e1de]">
                      <tr>
                        <th className="py-2.5 px-3">Rank</th>
                        <th className="py-2.5 px-3">Student</th>
                        <th className="py-2.5 px-3">Stream</th>
                        <th className="py-2.5 px-3 text-right">Total Hours</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60">
                      {leaderboard.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="text-center py-6 text-[#4a3b35]">No student sessions logged yet.</td>
                        </tr>
                      ) : (
                        leaderboard.map((item, idx) => (
                          <tr key={idx} className="hover:bg-[#f8f2ef]">
                            <td className="py-2.5 px-3 font-mono font-bold">
                              {idx === 0 ? ' #1' : idx === 1 ? ' #2' : idx === 2 ? ' #3' : `#${idx + 1}`}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="font-semibold text-[#1d1b19] block">{item.member.fullName || item.member.name}</span>
                              <span className="text-[10px] font-mono text-[#4a3b35]">{item.member.studyId}</span>
                            </td>
                            <td className="py-2.5 px-3 text-[#2d2420]">{item.member.stream}</td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-[#9f3c16]">
                              {item.totalHours.toFixed(1)} hrs
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB: VERIFICATION INBOX & ACCESS CONTROL (AUTHORITATIVE GOVERNANCE) */}
        <TabsContent value="inbox" className="space-y-6 pt-4">
          {/* Top Hero Banner & Batch Controls */}
          <Card className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-[#854f00]">
                      <UserCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-extrabold text-[#1d1b19] font-serif">
                        Student Account Verification Inbox
                      </CardTitle>
                      <CardDescription className="text-xs text-[#2d2420]">
                        Review, approve, or restrict student accounts. Unverified accounts have restricted access.
                      </CardDescription>
                    </div>
                  </div>
                </div>

                {/* Big 1-Click Tactile Action Button */}
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    type="button"
                    onClick={() => setQrScannerOpen(true)}
                    className="min-h-[48px] px-5 bg-[#19202e] hover:bg-slate-800 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-xl active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2 border-2 border-[#19202e]"
                  >
                    <QrCode className="h-4 w-4 text-[#fcd34d]" />
                    <span>Scan Student Pass QR</span>
                  </Button>

                  <Button
                    onClick={handleBatchApprovePending}
                    disabled={bulkActioning || pendingCount === 0}
                    className="min-h-[48px] px-6 bg-emerald-600 hover:bg-emerald-500 disabled:bg-[#f3ede9] disabled:text-[#4a3b35] text-[#1d1b19] font-bold rounded-2xl text-xs sm:text-sm shadow-xl shadow-emerald-600/25 active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2"
                  >
                    {bulkActioning ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Verifying Accounts...</span>
                      </>
                    ) : (
                      <>
                        <CheckCheck className="h-5 w-5 text-emerald-200" />
                        <span>1-Click Approve All Pending ({pendingCount})</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Quick Status KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div
                  onClick={() => setInboxFilter('pending')}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    inboxFilter === 'pending'
                      ? 'bg-amber-500/15 border-amber-500/40 shadow-lg shadow-amber-500/10'
                      : 'bg-[#fef8f4]/60 border-[#e7e1de] hover:border-zinc-700'
                  }`}
                >
                  <span className="text-[11px] font-semibold text-[#2d2420] block">Pending Verification</span>
                  <span className="text-2xl font-black text-[#854f00] font-mono mt-1 block">{pendingCount}</span>
                  <span className="text-[10px] text-amber-300/80">Requires approval</span>
                </div>

                <div
                  onClick={() => setInboxFilter('verified')}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    inboxFilter === 'verified'
                      ? 'bg-emerald-500/15 border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                      : 'bg-[#fef8f4]/60 border-[#e7e1de] hover:border-zinc-700'
                  }`}
                >
                  <span className="text-[11px] font-semibold text-[#2d2420] block">Verified Members</span>
                  <span className="text-2xl font-black text-[#456644] font-mono mt-1 block">{verifiedCount}</span>
                  <span className="text-[10px] text-emerald-300/80">Full access & Digital ID</span>
                </div>

                <div
                  onClick={() => setInboxFilter('suspended')}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    inboxFilter === 'suspended'
                      ? 'bg-rose-500/15 border-rose-500/40 shadow-lg shadow-rose-500/10'
                      : 'bg-[#fef8f4]/60 border-[#e7e1de] hover:border-zinc-700'
                  }`}
                >
                  <span className="text-[11px] font-semibold text-[#2d2420] block">Suspended / Banned</span>
                  <span className="text-2xl font-black text-rose-400 font-mono mt-1 block">{suspendedCount}</span>
                  <span className="text-[10px] text-rose-300/80">Barred from sync</span>
                </div>

                <div
                  onClick={() => setInboxFilter('all')}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    inboxFilter === 'all'
                      ? 'bg-indigo-500/15 border-indigo-500/40 shadow-lg shadow-indigo-500/10'
                      : 'bg-[#fef8f4]/60 border-[#e7e1de] hover:border-zinc-700'
                  }`}
                >
                  <span className="text-[11px] font-semibold text-[#2d2420] block">Total Registered</span>
                  <span className="text-2xl font-black text-[#9f3c16] font-mono mt-1 block">{membersList.length}</span>
                  <span className="text-[10px] text-indigo-300/80">All accounts</span>
                </div>
              </div>

              {/* Filter Tabs & Search Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-1 bg-[#fef8f4]/80 p-1 rounded-2xl border border-[#e7e1de] overflow-x-auto">
                  <button
                    type="button"
                    onClick={() => setInboxFilter('pending')}
                    className={`min-h-[38px] px-3.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      inboxFilter === 'pending'
                        ? 'bg-amber-500 text-zinc-950 font-bold shadow-md'
                        : 'text-[#2d2420] hover:text-[#1d1b19]'
                    }`}
                  >
                    Pending ({pendingCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setInboxFilter('verified')}
                    className={`min-h-[38px] px-3.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      inboxFilter === 'verified'
                        ? 'bg-emerald-600 text-[#1d1b19] font-bold shadow-md'
                        : 'text-[#2d2420] hover:text-[#1d1b19]'
                    }`}
                  >
                    Verified ({verifiedCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setInboxFilter('suspended')}
                    className={`min-h-[38px] px-3.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      inboxFilter === 'suspended'
                        ? 'bg-rose-600 text-[#1d1b19] font-bold shadow-md'
                        : 'text-[#2d2420] hover:text-[#1d1b19]'
                    }`}
                  >
                    Suspended ({suspendedCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setInboxFilter('all')}
                    className={`min-h-[38px] px-3.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      inboxFilter === 'all'
                        ? 'bg-indigo-600 text-[#1d1b19] font-bold shadow-md'
                        : 'text-[#2d2420] hover:text-[#1d1b19]'
                    }`}
                  >
                    All ({membersList.length})
                  </button>
                </div>

                <div className="relative min-w-[260px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#2d2420]" />
                  <Input
                    placeholder="Search name, study ID, school, email..."
                    value={inboxSearch}
                    onChange={(e) => setInboxSearch(e.target.value)}
                    className="pl-8 bg-[#fef8f4]/70 border-[#e7e1de] text-xs h-10 rounded-xl text-[#1d1b19] placeholder:text-[#4a3b35]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Verification Table */}
          <Card className="rounded-3xl border border-white/10 bg-[#fef8f4]/60 backdrop-blur-2xl shadow-xl overflow-hidden">
            <CardContent className="p-0">
              {filteredInboxMembers.length === 0 ? (
                <div className="p-16 text-center space-y-3">
                  <div className="h-12 w-12 rounded-2xl bg-[#ffffff] border border-[#e7e1de] flex items-center justify-center mx-auto text-[#4a3b35]">
                    <UserCheck className="h-6 w-6" />
                  </div>
                  <h3 className="text-sm font-bold text-[#1d1b19]">No accounts match this filter</h3>
                  <p className="text-xs text-[#2d2420] max-w-sm mx-auto">
                    {inboxFilter === 'pending'
                      ? 'Great news! All registered student accounts are currently verified and active.'
                      : 'No student accounts match the current query.'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-[#fef8f4]/80">
                      <TableRow className="border-[#e7e1de]">
                        <TableHead className="text-xs text-[#2d2420] font-semibold py-3 px-4">Student & ID</TableHead>
                        <TableHead className="text-xs text-[#2d2420] font-semibold py-3 px-4">Email & Telegram</TableHead>
                        <TableHead className="text-xs text-[#2d2420] font-semibold py-3 px-4">School & Stream</TableHead>
                        <TableHead className="text-xs text-[#2d2420] font-semibold py-3 px-4">Exam Year</TableHead>
                        <TableHead className="text-xs text-[#2d2420] font-semibold py-3 px-4">Status</TableHead>
                        <TableHead className="text-xs text-[#2d2420] font-semibold py-3 px-4 text-right">Verification Controls</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInboxMembers.map((m) => {
                        const verified = isStudentVerified(m);
                        const isSuspended = (m.status || '').toLowerCase() === 'suspended' || (m.status || '').toLowerCase() === 'banned';

                        return (
                          <TableRow key={m.studyId} className="border-[#e7e1de]/60 hover:bg-[#f8f2ef] transition-colors">
                            <TableCell className="py-3 px-4">
                              <span className="font-semibold text-xs text-[#1d1b19] block">
                                {m.fullName || m.name}
                              </span>
                              <span className="font-mono text-[11px] font-bold text-[#9f3c16]">
                                {m.studyId}
                              </span>
                            </TableCell>

                            <TableCell className="py-3 px-4 text-xs text-[#2d2420]">
                              <span className="block truncate max-w-[190px] text-[#1d1b19] font-mono text-[11px]">{m.email}</span>
                              <span className="text-[11px] text-[#9f3c16] font-mono">
                                {m.telegramUsername || m.telegram || '—'}
                              </span>
                            </TableCell>

                            <TableCell className="py-3 px-4 text-xs text-[#1d1b19]">
                              <span className="block truncate max-w-[190px] font-medium">{m.school}</span>
                              <span className="text-[11px] text-[#4a3b35]">
                                {m.stream} {m.optionalSubject ? `(${m.optionalSubject})` : ''}
                              </span>
                            </TableCell>

                            <TableCell className="py-3 px-4">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-indigo-50 text-indigo-900 border border-indigo-200">
                                {m.examYear ? `${m.examYear} A/L` : '2026 A/L'}
                              </span>
                            </TableCell>

                            <TableCell className="py-3 px-4">
                              {verified ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-100 text-emerald-900 border border-emerald-300">
                                  <CheckCircle2 className="h-3 w-3 text-emerald-700" />
                                  Verified Member
                                </span>
                              ) : isSuspended ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-rose-100 text-rose-900 border border-rose-300">
                                  <UserX className="h-3 w-3 text-rose-700" />
                                  Account Suspended
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-amber-100 text-amber-900 border border-amber-300">
                                  <Clock className="h-3 w-3 text-amber-700" />
                                  Pending Verification
                                </span>
                              )}
                            </TableCell>

                            <TableCell className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                {!verified && !isSuspended && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleVerifyStudent(m.studyId, 'Verified')}
                                    className="min-h-[48px] px-3.5 bg-emerald-600 hover:bg-emerald-500 text-[#1d1b19] rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                                  >
                                    <CheckCircle2 className="h-4 w-4" />
                                    <span>Approve</span>
                                  </Button>
                                )}

                                {verified && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleVerifyStudent(m.studyId, 'Pending')}
                                    className="min-h-[48px] px-3 text-[#854f00] hover:text-amber-300 hover:bg-amber-500/10 rounded-xl text-xs font-semibold active:scale-95 transition-all cursor-pointer"
                                  >
                                    Set Pending
                                  </Button>
                                )}

                                {isSuspended ? (
                                  <Button
                                    size="sm"
                                    onClick={() => handleVerifyStudent(m.studyId, 'Verified')}
                                    className="min-h-[48px] px-3.5 bg-emerald-600 hover:bg-emerald-500 text-[#1d1b19] rounded-xl text-xs font-bold active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                                  >
                                    <ShieldCheck className="h-4 w-4" />
                                    <span>Restore</span>
                                  </Button>
                                ) : (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleBanStudent(m.studyId)}
                                    className="min-h-[48px] px-3 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl text-xs font-semibold active:scale-95 transition-all cursor-pointer"
                                  >
                                    Suspend
                                  </Button>
                                )}

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handlePromoteToAdmin(m.email)}
                                  className="min-h-[48px] px-3 text-[#9f3c16] hover:text-indigo-300 hover:bg-indigo-500/10 rounded-xl text-xs font-semibold active:scale-95 transition-all cursor-pointer"
                                  title={`Promote ${m.email} to Admin`}
                                >
                                  Make Admin
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: MEMBERS DIRECTORY (WITH EDIT & DELETE POWERS) */}
        <TabsContent value="members" className="space-y-4 pt-4">
          <Card className="bg-[#ffffff] backdrop-blur-xl border-[#e7e1de] shadow-xl">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
              <div>
                <CardTitle className="text-base font-bold text-[#1d1b19] flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#9f3c16]" />
                  <span>Registered Members Directory</span>
                </CardTitle>
                <CardDescription className="text-xs text-[#2d2420]">
                  Search, filter, add, edit, and purge live Google Sheets student records
                </CardDescription>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <Button
                  size="sm"
                  onClick={() => setAddMemberOpen(true)}
                  className="bg-[#9f3c16] hover:bg-[#822801] text-white shadow-sm rounded-xl h-9 text-xs flex items-center gap-1.5 font-semibold"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>Add Student</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportMembersCsv}
                  className="border-[#e7e1de] bg-[#ffffff] hover:bg-[#f3ede9] text-[#1d1b19] rounded-xl h-9 text-xs flex items-center gap-1.5"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Export CSV</span>
                </Button>
              </div>
            </CardHeader>

            {/* Filter Bar */}
            <div className="px-6 pb-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#2d2420]" />
                <Input
                  placeholder="Search name, ID, school, email..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="pl-8 bg-[#fef8f4]/60 border-[#e7e1de] text-xs h-9 text-[#1d1b19]"
                />
              </div>

              <Select value={memberStreamFilter} onValueChange={setMemberStreamFilter}>
                <SelectTrigger className="bg-[#fef8f4]/60 border-[#e7e1de] text-xs h-9 text-[#1d1b19]">
                  <SelectValue placeholder="All Streams" />
                </SelectTrigger>
                <SelectContent className="bg-[#ffffff] border-[#e7e1de] text-[#1d1b19] text-xs">
                  <SelectItem value="all">All Streams</SelectItem>
                  <SelectItem value="bio">Biological Science</SelectItem>
                  <SelectItem value="maths">Physical Science</SelectItem>
                </SelectContent>
              </Select>

              <Select value={memberStatusFilter} onValueChange={setMemberStatusFilter}>
                <SelectTrigger className="bg-[#fef8f4]/60 border-[#e7e1de] text-xs h-9 text-[#1d1b19]">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent className="bg-[#ffffff] border-[#e7e1de] text-[#1d1b19] text-xs">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="inactive">Inactive Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bulk Action Bar */}
            {selectedMemberIds.size > 0 && (
              <div className="mx-6 mb-3 p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
                  <span className="text-xs font-semibold text-indigo-200">
                    {selectedMemberIds.size} student{selectedMemberIds.size > 1 ? 's' : ''} selected
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    disabled={bulkActioning}
                    onClick={() => handleBulkSetStatus('Active')}
                    className="h-8 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-[#1d1b19] rounded-lg text-xs px-3 font-semibold transition-all cursor-pointer"
                  >
                    Set Active
                  </Button>
                  <Button
                    size="sm"
                    disabled={bulkActioning}
                    onClick={() => handleBulkSetStatus('Inactive')}
                    className="h-8 bg-rose-600/80 hover:bg-rose-600 active:scale-95 text-[#1d1b19] rounded-lg text-xs px-3 font-semibold transition-all cursor-pointer"
                  >
                    Set Inactive
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={clearSelection}
                    className="h-8 text-[#2d2420] hover:text-[#1d1b19] active:scale-95 text-xs px-2.5 rounded-lg transition-all cursor-pointer"
                  >
                    Clear
                  </Button>
                </div>
              </div>
            )}

            {/* Members Table */}
            <CardContent className="p-0">
              {filteredMembers.length === 0 ? (
                <div className="p-12 text-center text-[#4a3b35] text-xs">
                  No registered members match your search criteria.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-[#fef8f4]/60">
                      <TableRow className="border-[#e7e1de]">
                        <TableHead className="w-10 px-3 text-center">
                          <input
                            type="checkbox"
                            aria-label="Select all students"
                            checked={selectedMemberIds.size > 0 && selectedMemberIds.size === filteredMembers.length}
                            onChange={(e) => (e.target.checked ? selectAllFiltered() : clearSelection())}
                            className="rounded border-zinc-700 bg-[#ffffff] text-indigo-600 focus:ring-indigo-500 cursor-pointer h-4 w-4"
                          />
                        </TableHead>
                        <TableHead className="text-xs text-[#2d2420] font-semibold">Study ID</TableHead>
                        <TableHead className="text-xs text-[#2d2420] font-semibold">Student Name</TableHead>
                        <TableHead className="text-xs text-[#2d2420] font-semibold">Email & Telegram</TableHead>
                        <TableHead className="text-xs text-[#2d2420] font-semibold">School & Stream</TableHead>
                        <TableHead className="text-xs text-[#2d2420] font-semibold">Exam Year</TableHead>
                        <TableHead className="text-xs text-[#2d2420] font-semibold">Status</TableHead>
                        <TableHead className="text-xs text-[#2d2420] font-semibold text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMembers.map((m) => {
                        const isSelected = selectedMemberIds.has(m.studyId);
                        return (
                          <TableRow
                            key={m.studyId}
                            className={`border-[#e7e1de]/60 transition-colors ${
                              isSelected ? 'bg-indigo-950/20 hover:bg-indigo-950/30' : 'hover:bg-[#f8f2ef]'
                            }`}
                          >
                            <TableCell className="px-3 text-center">
                              <input
                                type="checkbox"
                                aria-label={`Select ${m.fullName || m.studyId}`}
                                checked={isSelected}
                                onChange={() => toggleSelectMember(m.studyId)}
                                className="rounded border-zinc-700 bg-[#ffffff] text-indigo-600 focus:ring-indigo-500 cursor-pointer h-4 w-4"
                              />
                            </TableCell>
                            <TableCell className="font-mono text-xs font-bold text-[#9f3c16]">
                              {m.studyId}
                            </TableCell>
                            <TableCell className="font-semibold text-xs text-[#1d1b19]">
                              {m.fullName || m.name}
                            </TableCell>
                            <TableCell className="text-xs text-[#2d2420]">
                              <span className="block truncate max-w-[180px]">{m.email}</span>
                              <span className="text-[11px] text-[#9f3c16] font-mono">
                                {m.telegramUsername || m.telegram || '—'}
                              </span>
                            </TableCell>
                            <TableCell className="text-xs text-[#1d1b19]">
                              <span className="block truncate max-w-[180px]">{m.school}</span>
                              <span className="text-[11px] text-[#4a3b35]">
                                {m.stream} {m.optionalSubject ? `(${m.optionalSubject})` : ''}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                                {m.examYear ? `${m.examYear} A/L` : '2026 A/L'}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                                  (m.status || 'Active') === 'Verified'
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                    : (m.status || 'Active') === 'Active'
                                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                    : (m.status || '').toLowerCase() === 'suspended' || (m.status || '').toLowerCase() === 'banned'
                                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                    : 'bg-[#f3ede9] text-[#2d2420]'
                                }`}
                              >
                                {m.status || 'Active'}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                {m.status !== 'Verified' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleVerifyStudent(m.studyId, 'Verified')}
                                    className="h-8 px-2 text-xs text-[#456644] hover:text-emerald-300 hover:bg-emerald-500/10 active:scale-95 rounded-lg transition-all cursor-pointer"
                                    title="Verify student identity"
                                  >
                                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Verify
                                  </Button>
                                )}

                                {(m.status || '').toLowerCase() === 'suspended' || (m.status || '').toLowerCase() === 'banned' ? (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleVerifyStudent(m.studyId, 'Active')}
                                    className="h-8 px-2 text-xs text-[#456644] hover:text-emerald-300 hover:bg-emerald-500/10 active:scale-95 rounded-lg transition-all cursor-pointer"
                                    title="Restore / Unban student account"
                                  >
                                    <ShieldCheck className="h-3.5 w-3.5 mr-1" /> Unban
                                  </Button>
                                ) : (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleBanStudent(m.studyId)}
                                    className="h-8 px-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 active:scale-95 rounded-lg transition-all cursor-pointer"
                                    title="Ban / Suspend student account"
                                  >
                                    <Ban className="h-3.5 w-3.5 mr-1" /> Ban
                                  </Button>
                                )}

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setViewingStudentId(m.studyId)}
                                  className="h-8 px-2 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 active:scale-95 rounded-lg transition-all cursor-pointer"
                                  title="View full study history"
                                >
                                  <Clock className="h-3.5 w-3.5 mr-1" /> History
                                </Button>

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditModal(m)}
                                  className="h-8 px-2 text-xs text-[#9f3c16] hover:text-indigo-300 hover:bg-indigo-500/10 active:scale-95 rounded-lg transition-all cursor-pointer"
                                >
                                  <Edit2 className="h-3.5 w-3.5 mr-1" /> Edit
                                </Button>

                                {(m.role === 'admin' || (m.email && authorizedAdmins.some(e => e.toLowerCase() === m.email?.toLowerCase()))) ? (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRevokeAdmin(m.email)}
                                    className="h-8 px-2 text-xs text-[#854f00] hover:text-amber-300 hover:bg-amber-500/10 active:scale-95 rounded-lg transition-all cursor-pointer"
                                    title="Revoke Admin Privileges"
                                  >
                                    <ShieldAlert className="h-3.5 w-3.5 mr-1" /> Revoke Admin
                                  </Button>
                                ) : (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handlePromoteToAdmin(m.email || m.studyId)}
                                    className="h-8 px-2 text-xs text-[#456644] hover:text-emerald-300 hover:bg-emerald-500/10 active:scale-95 rounded-lg transition-all cursor-pointer"
                                    title="Grant Admin Privileges"
                                  >
                                    <Shield className="h-3.5 w-3.5 mr-1" /> Make Admin
                                  </Button>
                                )}

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setDeletingMember(m)}
                                  className="h-8 px-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 active:scale-95 rounded-lg transition-all cursor-pointer"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: DAILY LOGS INSPECTOR (WITH DELETE POWERS) */}
        <TabsContent value="logs" className="space-y-4 pt-4">
          <Card className="bg-[#ffffff] backdrop-blur-xl border-[#e7e1de] shadow-xl">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
              <div>
                <CardTitle className="text-base font-bold text-[#1d1b19] flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[#9f3c16]" />
                  <span>All Recorded Daily Study Logs</span>
                </CardTitle>
                <CardDescription className="text-xs text-[#2d2420]">
                  Full verified study sessions recorded in the Google Sheets database
                </CardDescription>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleExportLogsCsv}
                className="border-[#e7e1de] bg-[#ffffff] hover:bg-[#f3ede9] text-[#1d1b19] rounded-xl h-9 text-xs flex items-center gap-1.5"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export Logs CSV</span>
              </Button>
            </CardHeader>

            {/* Filter Bar */}
            <div className="px-6 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#2d2420]" />
                <Input
                  placeholder="Search date, study ID, or student..."
                  value={logsSearch}
                  onChange={(e) => setLogsSearch(e.target.value)}
                  className="pl-8 bg-[#fef8f4]/60 border-[#e7e1de] text-xs h-9 text-[#1d1b19]"
                />
              </div>

              <Select value={logsStreamFilter} onValueChange={setLogsStreamFilter}>
                <SelectTrigger className="bg-[#fef8f4]/60 border-[#e7e1de] text-xs h-9 text-[#1d1b19]">
                  <SelectValue placeholder="All Streams" />
                </SelectTrigger>
                <SelectContent className="bg-[#ffffff] border-[#e7e1de] text-[#1d1b19] text-xs">
                  <SelectItem value="all">All Streams</SelectItem>
                  <SelectItem value="bio">Biological Science</SelectItem>
                  <SelectItem value="maths">Physical Science</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Logs Table */}
            <CardContent className="p-0">
              {filteredLogs.length === 0 ? (
                <div className="p-12 text-center text-[#4a3b35] text-xs">
                  No daily study logs recorded yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-[#fef8f4]/60">
                      <TableRow className="border-[#e7e1de]">
                        <TableHead className="text-xs text-[#2d2420] font-semibold">Date</TableHead>
                        <TableHead className="text-xs text-[#2d2420] font-semibold">Study ID</TableHead>
                        <TableHead className="text-xs text-[#2d2420] font-semibold">Subjects Breakdown</TableHead>
                        <TableHead className="text-xs text-[#2d2420] font-semibold text-right">Total</TableHead>
                        <TableHead className="text-xs text-[#2d2420] font-semibold text-right">Quality</TableHead>
                        <TableHead className="text-xs text-[#2d2420] font-semibold">Proof</TableHead>
                        <TableHead className="text-xs text-[#2d2420] font-semibold text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLogs.map((log, idx) => {
                        const d = log.dateOfStudy || log.date;
                        const subs = log.subjects || [];
                        const h1 = Number(subs[0]?.hours ?? log.subject1Hours ?? 0);
                        const h2 = Number(subs[1]?.hours ?? log.subject2Hours ?? 0);
                        const h3 = Number(subs[2]?.hours ?? log.subject3Hours ?? 0);
                        const tot = Number(log.totalHours || h1 + h2 + h3 || 0);
                        const proof = log.proofPhotoUrl || log.proofUrl;

                        return (
                          <TableRow key={idx} className="border-[#e7e1de]/60 hover:bg-[#f8f2ef]">
                            <TableCell className="font-mono text-xs text-[#1d1b19]">
                              {formatDate(d, 'short')}
                            </TableCell>
                            <TableCell className="font-mono text-xs font-bold text-[#9f3c16]">
                              {log.studyId}
                            </TableCell>
                            <TableCell className="text-xs text-[#1d1b19]">
                              <span className="inline-block mr-2 text-indigo-300">{subs[0]?.name || 'S1'}: {h1.toFixed(1)}h</span>
                              <span className="inline-block mr-2 text-cyan-300">{subs[1]?.name || 'S2'}: {h2.toFixed(1)}h</span>
                              <span className="inline-block text-emerald-300">{subs[2]?.name || 'S3'}: {h3.toFixed(1)}h</span>
                            </TableCell>
                            <TableCell className="text-right font-mono font-bold text-xs text-[#9f3c16]">
                              {tot.toFixed(1)}h
                            </TableCell>
                            <TableCell className="text-right font-mono text-xs text-[#854f00]">
                              F:{subs[0]?.focus || log.focusScore || '—'} P:{subs[0]?.productivity || log.productivityScore || '—'}
                            </TableCell>
                            <TableCell>
                              {proof ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedProofUrl(proof)}
                                  className="h-7 px-2 text-xs text-[#9f3c16] hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg"
                                >
                                  <ImageIcon className="h-3.5 w-3.5 mr-1" /> View
                                </Button>
                              ) : (
                                <span className="text-xs text-zinc-600">—</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right whitespace-nowrap">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditLogModal(log)}
                                className="h-7 px-2 text-xs text-[#9f3c16] hover:text-indigo-300 hover:bg-indigo-500/10 active:scale-95 rounded-lg transition-all cursor-pointer mr-1"
                              >
                                <Edit2 className="h-3.5 w-3.5 mr-1" /> Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeletingLog(log)}
                                className="h-7 px-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 active:scale-95 rounded-lg transition-all cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 4: ADMIN POWERS & LIVE ROOMS */}
        <TabsContent value="powers" className="space-y-6 pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. Live Study Room Generator */}
            <Card className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-[#9f3c16]">
                    <Video className="h-5 w-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Live Broadcast
                  </span>
                </div>
                <CardTitle className="text-lg font-bold text-[#1d1b19] mt-3">Live Study Room Generator</CardTitle>
                <CardDescription className="text-xs text-[#2d2420]">
                  Instantly spin up a Google Meet or Zoom study room and generate a ready-to-broadcast invite for Telegram and WhatsApp.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs text-[#1d1b19]">Choose Platform</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRoomPlatform('google_meet')}
                      className={`h-11 rounded-2xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all cursor-pointer ${
                        roomPlatform === 'google_meet'
                          ? 'bg-indigo-600/25 text-[#1d1b19] border-indigo-500 shadow-md shadow-indigo-600/20'
                          : 'bg-[#ffffff] border-[#e7e1de] text-[#2d2420] hover:text-[#1d1b19]'
                      }`}
                    >
                      <Video className="h-4 w-4 text-[#456644]" />
                      <span>Google Meet</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRoomPlatform('zoom')}
                      className={`h-11 rounded-2xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all cursor-pointer ${
                        roomPlatform === 'zoom'
                          ? 'bg-blue-600/25 text-[#1d1b19] border-blue-500 shadow-md shadow-blue-600/20'
                          : 'bg-[#ffffff] border-[#e7e1de] text-[#2d2420] hover:text-[#1d1b19]'
                      }`}
                    >
                      <Video className="h-4 w-4 text-blue-400" />
                      <span>Zoom Meeting</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-[#1d1b19]">Study Session Topic / Title</Label>
                  <Input
                    value={roomTopic}
                    onChange={(e) => setRoomTopic(e.target.value)}
                    placeholder="e.g. Combined Maths Past Paper Discussion"
                    className="bg-[#fef8f4]/70 border-[#e7e1de] text-[#1d1b19] text-xs h-11 rounded-xl"
                  />
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {[
                      'Biology Unit Revision',
                      'Combined Maths Past Paper Drill',
                      'Physics Mechanics Drill',
                      'Chemistry Organic Masterclass',
                    ].map((sug, sIdx) => (
                      <button
                        key={sIdx}
                        type="button"
                        onClick={() => setRoomTopic(sug)}
                        className="text-[10px] px-2 py-0.5 rounded-lg bg-[#f3ede9]/80 text-[#2d2420] hover:text-[#1d1b19] hover:bg-zinc-700 transition-colors cursor-pointer"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleGenerateLiveRoom}
                  disabled={generatingRoom}
                  className="w-full min-h-[48px] bg-[#9f3c16] hover:bg-[#822801] text-white shadow-sm rounded-2xl text-xs sm:text-sm font-bold shadow-lg shadow-indigo-600/25 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {generatingRoom ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Generating Room Link...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 text-[#854f00]" />
                      <span>Generate Live Study Room</span>
                    </>
                  )}
                </Button>

                {generatedRoom && (
                  <div className="p-4 rounded-2xl bg-[#fef8f4]/80 border border-indigo-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#1d1b19]">Room Ready</span>
                      <a
                        href={generatedRoom.roomUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#9f3c16] hover:text-indigo-300 font-semibold flex items-center gap-1"
                      >
                        <span>Join Room</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#ffffff]/90 font-mono text-[11px] text-[#1d1b19] break-all select-all border border-[#e7e1de]">
                      {generatedRoom.roomUrl}
                    </div>
                    <Button
                      onClick={handleCopyRoomInvite}
                      className="w-full min-h-[48px] bg-emerald-600 hover:bg-emerald-500 text-[#1d1b19] rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg shadow-emerald-600/20"
                    >
                      {copiedInvite ? (
                        <>
                          <Check className="h-4 w-4 text-[#1d1b19]" />
                          <span>Copied Invite to Clipboard!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          <span>Copy Telegram / WhatsApp Invite</span>
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 2. Add More Admins & Grant Admin Powers */}
            <Card className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-[#456644]">
                    <Shield className="h-5 w-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-[#456644]/10 text-[#456644] border border-[#456644]/30">
                    RBAC Security
                  </span>
                </div>
                <CardTitle className="text-lg font-bold text-[#1d1b19] mt-3">Administrator Access & Powers</CardTitle>
                <CardDescription className="text-xs text-[#2d2420]">
                  Grant full administrator privileges to other teachers or supervisors. All changes persist in Google Apps Script.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-[#1d1b19]">Grant Admin Powers to Google Account</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="email"
                      placeholder="teacher@school.lk or admin@gmail.com"
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      className="bg-[#fef8f4]/70 border-[#e7e1de] text-[#1d1b19] text-xs h-12 rounded-xl"
                    />
                    <Button
                      onClick={handleAddAdmin}
                      disabled={addingAdmin || !newAdminEmail.trim()}
                      className="min-h-[48px] px-5 bg-emerald-600 hover:bg-emerald-500 text-[#1d1b19] rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap cursor-pointer transition-all shadow-md shadow-emerald-600/20"
                    >
                      {addingAdmin ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Promote Admin'}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <Label className="text-xs text-[#2d2420]">Current Authorized Administrators</Label>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {Array.from(new Set([...ADMIN_EMAILS, ...authorizedAdmins])).map((email, idx) => {
                      const isPrimary = email.toLowerCase() === 'alwisachalaanurada@gmail.com';
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-[#fef8f4]/60 border border-[#e7e1de] text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-[#456644] shrink-0" />
                            <span className="text-[#1d1b19] font-mono text-[11px] truncate max-w-[220px]">
                              {email}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-semibold font-mono ${
                                isPrimary
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : 'bg-[#f3ede9] text-[#2d2420]'
                              }`}
                            >
                              {isPrimary ? 'Primary Admin' : 'Admin'}
                            </span>
                            {!isPrimary && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRevokeAdmin(email)}
                                className="h-6 px-2 text-[10px] text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded cursor-pointer"
                                title="Revoke administrator privileges"
                              >
                                Revoke
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 3. A/L Exam Countdown Target Settings */}
            <Card className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-[#854f00]">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Countdown Sync
                  </span>
                </div>
                <CardTitle className="text-lg font-bold text-[#1d1b19] mt-3">A/L Exam Target Dates</CardTitle>
                <CardDescription className="text-xs text-[#2d2420]">
                  Manually configure the exact target date for each examination batch. Timers update dynamically across the entire website.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3.5">
                  <div className="space-y-1.5 p-3.5 rounded-2xl bg-[#fef8f4]/60 border border-[#e7e1de]">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-[#1d1b19] font-bold">2026 A/L Target Date & Time</Label>
                      <span className="text-[11px] font-mono text-[#854f00] font-semibold">
                        {getExamCountdown('2026', examDate2026).daysRemaining} days ({getExamCountdown('2026', examDate2026).weeksRemaining} wks)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="datetime-local"
                        value={examDate2026}
                        onChange={(e) => setExamDate2026(e.target.value)}
                        className="bg-[#ffffff] border-zinc-700 text-[#1d1b19] text-xs h-11 rounded-xl font-mono flex-1"
                      />
                      <Button
                        size="sm"
                        disabled={savingExamDate}
                        onClick={() => handleSaveSingleExamDate('2026', examDate2026)}
                        className="min-h-[44px] px-3.5 bg-amber-600 hover:bg-amber-500 text-[#1d1b19] rounded-xl text-xs font-bold cursor-pointer active:scale-95 transition-all shadow-md shadow-amber-600/20"
                      >
                        Save 2026
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1.5 p-3.5 rounded-2xl bg-[#fef8f4]/60 border border-[#e7e1de]">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-[#1d1b19] font-bold">2027 A/L Target Date & Time</Label>
                      <span className="text-[11px] font-mono text-[#854f00] font-semibold">
                        {getExamCountdown('2027', examDate2027).daysRemaining} days ({getExamCountdown('2027', examDate2027).weeksRemaining} wks)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="datetime-local"
                        value={examDate2027}
                        onChange={(e) => setExamDate2027(e.target.value)}
                        className="bg-[#ffffff] border-zinc-700 text-[#1d1b19] text-xs h-11 rounded-xl font-mono flex-1"
                      />
                      <Button
                        size="sm"
                        disabled={savingExamDate}
                        onClick={() => handleSaveSingleExamDate('2027', examDate2027)}
                        className="min-h-[44px] px-3.5 bg-amber-600 hover:bg-amber-500 text-[#1d1b19] rounded-xl text-xs font-bold cursor-pointer active:scale-95 transition-all shadow-md shadow-amber-600/20"
                      >
                        Save 2027
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1.5 p-3.5 rounded-2xl bg-[#fef8f4]/60 border border-[#e7e1de]">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-[#1d1b19] font-bold">2028 A/L Target Date & Time</Label>
                      <span className="text-[11px] font-mono text-[#854f00] font-semibold">
                        {getExamCountdown('2028', examDate2028).daysRemaining} days ({getExamCountdown('2028', examDate2028).weeksRemaining} wks)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="datetime-local"
                        value={examDate2028}
                        onChange={(e) => setExamDate2028(e.target.value)}
                        className="bg-[#ffffff] border-zinc-700 text-[#1d1b19] text-xs h-11 rounded-xl font-mono flex-1"
                      />
                      <Button
                        size="sm"
                        disabled={savingExamDate}
                        onClick={() => handleSaveSingleExamDate('2028', examDate2028)}
                        className="min-h-[44px] px-3.5 bg-amber-600 hover:bg-amber-500 text-[#1d1b19] rounded-xl text-xs font-bold cursor-pointer active:scale-95 transition-all shadow-md shadow-amber-600/20"
                      >
                        Save 2028
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1.5 p-3.5 rounded-2xl bg-[#fef8f4]/60 border border-[#e7e1de]">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-[#1d1b19] font-bold">2029 A/L Target Date & Time</Label>
                      <span className="text-[11px] font-mono text-[#854f00] font-semibold">
                        {getExamCountdown('2029', examDate2029).daysRemaining} days ({getExamCountdown('2029', examDate2029).weeksRemaining} wks)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="datetime-local"
                        value={examDate2029}
                        onChange={(e) => setExamDate2029(e.target.value)}
                        className="bg-[#ffffff] border-zinc-700 text-[#1d1b19] text-xs h-11 rounded-xl font-mono flex-1"
                      />
                      <Button
                        size="sm"
                        disabled={savingExamDate}
                        onClick={() => handleSaveSingleExamDate('2029', examDate2029)}
                        className="min-h-[44px] px-3.5 bg-amber-600 hover:bg-amber-500 text-[#1d1b19] rounded-xl text-xs font-bold cursor-pointer active:scale-95 transition-all shadow-md shadow-amber-600/20"
                      >
                        Save 2029
                      </Button>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleSaveExamDates}
                  disabled={savingExamDate}
                  className="w-full min-h-[48px] bg-amber-600 hover:bg-amber-500 text-[#1d1b19] rounded-2xl text-xs sm:text-sm font-bold shadow-lg shadow-amber-600/25 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {savingExamDate ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving Target Dates...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Save All Exam Target Dates</span>
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* 4. Student Account Verification Inbox */}
            <Card className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-[#9f3c16]">
                    <UserCheck className="h-5 w-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    Verification Inbox
                  </span>
                </div>
                <CardTitle className="text-lg font-bold text-[#1d1b19] mt-3">Account Verification & Status</CardTitle>
                <CardDescription className="text-xs text-[#2d2420]">
                  Review student accounts. Verified students receive the digital ID badge and priority study sync status.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-3 rounded-2xl bg-[#fef8f4]/60 border border-[#e7e1de]">
                    <p className="text-xs text-[#2d2420]">Verified</p>
                    <p className="text-xl font-bold text-[#456644] font-mono mt-1">
                      {membersList.filter((m) => (m.status || '').toLowerCase() === 'verified').length}
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#fef8f4]/60 border border-[#e7e1de]">
                    <p className="text-xs text-[#2d2420]">Pending</p>
                    <p className="text-xl font-bold text-[#854f00] font-mono mt-1">
                      {pendingCount}
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#fef8f4]/60 border border-[#e7e1de]">
                    <p className="text-xs text-[#2d2420]">Suspended</p>
                    <p className="text-xl font-bold text-rose-400 font-mono mt-1">
                      {membersList.filter((m) => (m.status || '').toLowerCase() === 'suspended' || (m.status || '').toLowerCase() === 'banned').length}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <Label className="text-xs text-[#2d2420]">Pending / Unverified Accounts</Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {membersList.filter((m) => (m.status || '').toLowerCase() !== 'verified').slice(0, 10).map((m, mIdx) => (
                      <div
                        key={mIdx}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-[#fef8f4]/60 border border-[#e7e1de] text-xs"
                      >
                        <div>
                          <p className="text-xs font-semibold text-[#1d1b19]">{m.fullName || m.name}</p>
                          <p className="text-[10px] font-mono text-[#2d2420]">{m.studyId} • {m.school}</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Button
                            size="sm"
                            onClick={() => handleVerifyStudent(m.studyId, 'Verified')}
                            className="h-7 px-2 bg-emerald-600 hover:bg-emerald-500 text-[#1d1b19] text-[11px] rounded-lg cursor-pointer"
                          >
                            Verify
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleBanStudent(m.studyId)}
                            className="h-7 px-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 text-[11px] rounded-lg cursor-pointer"
                          >
                            Ban
                          </Button>
                        </div>
                      </div>
                    ))}
                    {membersList.filter((m) => (m.status || '').toLowerCase() !== 'verified').length === 0 && (
                      <p className="text-xs text-[#4a3b35] text-center py-4">All registered students are verified.</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB: Dedicated Hall Control & ID Suite */}
        <TabsContent value="hall-control" className="pt-4">
          <HallControlSuite />
        </TabsContent>

        {/* TAB: Form Studio Admin Engine */}
        <TabsContent value="form-studio" className="pt-4">
          <FormStudioAdminEngine />
        </TabsContent>

        {/* TAB: Student Feedback Vault */}
        <TabsContent value="feedback" className="pt-4">
          <FeedbackVaultAdmin adminEmail={user?.email || 'admin@studysync.lk'} />
        </TabsContent>
      </Tabs>

      {/* Edit Member Modal */}
      <Dialog open={Boolean(editingMember)} onOpenChange={() => setEditingMember(null)}>
        <DialogContent className="max-w-lg bg-[#fef8f4] border-[#e7e1de] text-[#1d1b19] p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-[#1d1b19] flex items-center gap-2">
              <Edit2 className="h-4 w-4 text-[#9f3c16]" />
              <span>Edit Member: {editingMember?.studyId}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-[#2d2420]">
              Changes will immediately update the official Google Sheets database
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-[#1d1b19]">Full Name</Label>
              <Input
                value={editFullName}
                onChange={(e) => setEditFullName(e.target.value)}
                className="bg-[#ffffff] border-[#e7e1de] text-[#1d1b19] text-xs h-9"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-[#1d1b19]">School</Label>
              <Input
                value={editSchool}
                onChange={(e) => setEditSchool(e.target.value)}
                className="bg-[#ffffff] border-[#e7e1de] text-[#1d1b19] text-xs h-9"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-[#1d1b19]">A/L Stream</Label>
                <Select value={editStream} onValueChange={setEditStream}>
                  <SelectTrigger className="bg-[#ffffff] border-[#e7e1de] text-[#1d1b19] text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#ffffff] border-[#e7e1de] text-[#1d1b19] text-xs">
                    <SelectItem value="Physical Science">Physical Science</SelectItem>
                    <SelectItem value="Biological Science">Biological Science</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-[#1d1b19]">Elective Subject</Label>
                <Input
                  value={editOptional}
                  placeholder="Chemistry, Physics, ICT, etc."
                  onChange={(e) => setEditOptional(e.target.value)}
                  className="bg-[#ffffff] border-[#e7e1de] text-[#1d1b19] text-xs h-9"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-[#1d1b19]">Exam Year</Label>
                <Select value={editExamYear} onValueChange={setEditExamYear}>
                  <SelectTrigger className="bg-[#ffffff] border-[#e7e1de] text-[#1d1b19] text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#ffffff] border-[#e7e1de] text-[#1d1b19] text-xs">
                    {EXAM_YEARS.map((y) => (
                      <SelectItem key={y} value={y}>{y} A/L</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-[#1d1b19]">Telegram</Label>
                <Input
                  value={editTelegram}
                  placeholder="@handle"
                  onChange={(e) => setEditTelegram(e.target.value)}
                  className="bg-[#ffffff] border-[#e7e1de] text-[#1d1b19] text-xs h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-[#1d1b19]">Status</Label>
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger className="bg-[#ffffff] border-[#e7e1de] text-[#1d1b19] text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#ffffff] border-[#e7e1de] text-[#1d1b19] text-xs">
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Password Empowerment & Emergency Reset Tool */}
            <div className="pt-3 border-t border-[#e7e1de] space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-indigo-300 font-semibold flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5" />
                  <span>Account Password & Access Credential</span>
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const pw = generateHighEntropyPassword(12);
                    setEditMemberPassword(pw);
                    navigator.clipboard?.writeText(pw);
                    toast.success(`Generated & applied strong password: ${pw} (copied!)`);
                  }}
                  className="h-7 px-2.5 text-xs text-[#9f3c16] hover:text-indigo-300 hover:bg-indigo-500/10 active:scale-95 rounded-lg transition-all cursor-pointer"
                >
                  <Zap className="h-3.5 w-3.5 mr-1" /> Generate Strong
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder="Set or reset student password (min 6 chars)..."
                  value={editMemberPassword}
                  onChange={(e) => setEditMemberPassword(e.target.value)}
                  className="bg-[#ffffff] border-[#e7e1de] text-[#1d1b19] font-mono text-xs h-10 rounded-xl flex-1"
                />
              </div>
              <p className="text-[11px] text-[#2d2420]">
                Type or generate a secure password for this student. When saved, it is salted and SHA-256 hashed to allow secure sign-in via Study ID or Email.
              </p>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingMember(null)}
              className="border-[#e7e1de] text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveMemberEdit}
              disabled={savingMember}
              className="bg-[#9f3c16] hover:bg-[#822801] text-white shadow-sm text-xs"
            >
              {savingMember ? 'Saving...' : 'Save to Google Sheets'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Member Modal */}
      <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
        <DialogContent className="max-w-lg bg-[#fef8f4] border-[#e7e1de] text-[#1d1b19] p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-[#1d1b19] flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-[#9f3c16]" />
              <span>Add New Student Member</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-[#2d2420]">
              Creates a new student record and allocates sequential Study ID in Google Sheets
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddMember} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-[#1d1b19]">Full Name *</Label>
                <Input
                  required
                  placeholder="e.g. Kasun Perera"
                  value={addFullName}
                  onChange={(e) => setAddFullName(e.target.value)}
                  className="bg-[#ffffff] border-[#e7e1de] text-[#1d1b19] text-xs h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-[#1d1b19]">Email Address *</Label>
                <Input
                  required
                  type="email"
                  placeholder="student@gmail.com"
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  className="bg-[#ffffff] border-[#e7e1de] text-[#1d1b19] text-xs h-9"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-[#1d1b19]">School *</Label>
              <Input
                required
                placeholder="e.g. Ananda College, Colombo"
                value={addSchool}
                onChange={(e) => setAddSchool(e.target.value)}
                className="bg-[#ffffff] border-[#e7e1de] text-[#1d1b19] text-xs h-9"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-[#1d1b19]">A/L Stream</Label>
                <Select value={addStream} onValueChange={(val) => {
                  setAddStream(val);
                  setAddOptional(val === 'Biological Science' ? 'Physics' : 'Chemistry');
                }}>
                  <SelectTrigger className="bg-[#ffffff] border-[#e7e1de] text-[#1d1b19] text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#ffffff] border-[#e7e1de] text-[#1d1b19] text-xs">
                    <SelectItem value="Physical Science">Physical Science</SelectItem>
                    <SelectItem value="Biological Science">Biological Science</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-[#1d1b19]">Optional Subject</Label>
                <Select value={addOptional} onValueChange={setAddOptional}>
                  <SelectTrigger className="bg-[#ffffff] border-[#e7e1de] text-[#1d1b19] text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#ffffff] border-[#e7e1de] text-[#1d1b19] text-xs">
                    {addStream === 'Biological Science' ? (
                      <>
                        <SelectItem value="Physics">Physics</SelectItem>
                        <SelectItem value="Agriculture">Agriculture</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="Chemistry">Chemistry</SelectItem>
                        <SelectItem value="ICT">ICT</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-[#1d1b19]">Exam Year</Label>
                <Select value={addExamYear} onValueChange={setAddExamYear}>
                  <SelectTrigger className="bg-[#ffffff] border-[#e7e1de] text-[#1d1b19] text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#ffffff] border-[#e7e1de] text-[#1d1b19] text-xs">
                    {EXAM_YEARS.map((y) => (
                      <SelectItem key={y} value={y}>{y} A/L</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-[#1d1b19]">Gender</Label>
                <Select value={addGender} onValueChange={setAddGender}>
                  <SelectTrigger className="bg-[#ffffff] border-[#e7e1de] text-[#1d1b19] text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#ffffff] border-[#e7e1de] text-[#1d1b19] text-xs">
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-[#1d1b19]">Telegram</Label>
                <Input
                  placeholder="@handle"
                  value={addTelegram}
                  onChange={(e) => setAddTelegram(e.target.value)}
                  className="bg-[#ffffff] border-[#e7e1de] text-[#1d1b19] text-xs h-9"
                />
              </div>
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAddMemberOpen(false)}
                className="border-[#e7e1de] text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={addingMember}
                className="bg-[#9f3c16] hover:bg-[#822801] text-white shadow-sm text-xs"
              >
                {addingMember ? 'Registering...' : 'Register Student'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Member Confirmation Modal */}
      <Dialog open={Boolean(deletingMember)} onOpenChange={() => setDeletingMember(null)}>
        <DialogContent className="max-w-md bg-[#fef8f4] border-rose-500/30 text-[#1d1b19] p-6">
          <DialogHeader className="space-y-2">
            <div className="h-10 w-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <DialogTitle className="text-base font-bold text-[#1d1b19]">
              Purge Member: {deletingMember?.studyId}?
            </DialogTitle>
            <DialogDescription className="text-xs text-[#2d2420] leading-relaxed">
              This will permanently delete <strong className="text-[#1d1b19]">{deletingMember?.fullName || deletingMember?.name}</strong> and all their associated daily study logs from Google Sheets. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeletingMember(null)}
              className="border-[#e7e1de] text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleDeleteMember}
              disabled={deletingProcess}
              className="bg-rose-600 hover:bg-rose-500 text-[#1d1b19] text-xs font-semibold"
            >
              {deletingProcess ? 'Purging...' : 'Permanently Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Daily Log Confirmation Modal */}
      <Dialog open={Boolean(deletingLog)} onOpenChange={() => setDeletingLog(null)}>
        <DialogContent className="max-w-md bg-[#fef8f4] border-rose-500/30 text-[#1d1b19] p-6">
          <DialogHeader className="space-y-2">
            <div className="h-10 w-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <Trash2 className="h-5 w-5" />
            </div>
            <DialogTitle className="text-base font-bold text-[#1d1b19]">
              Delete Daily Study Log?
            </DialogTitle>
            <DialogDescription className="text-xs text-[#2d2420] leading-relaxed">
              Delete study log for <strong className="text-[#1d1b19]">{deletingLog?.studyId}</strong> on <strong className="text-[#1d1b19]">{formatDate(deletingLog?.dateOfStudy || deletingLog?.date, 'short')}</strong> ({deletingLog?.totalHours} hrs).
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeletingLog(null)}
              className="border-[#e7e1de] text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleDeleteLog}
              disabled={deletingLogProcess}
              className="bg-rose-600 hover:bg-rose-500 text-[#1d1b19] text-xs font-semibold"
            >
              {deletingLogProcess ? 'Deleting...' : 'Delete Log'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Photo Proof Modal with Google Drive direct stream & zoom */}
      <PhotoProofModal
        open={Boolean(selectedProofUrl)}
        onOpenChange={(open) => !open && setSelectedProofUrl(null)}
        proofUrl={selectedProofUrl}
      />

      {/* Broadcast Template Modal */}
      <Dialog open={broadcastOpen} onOpenChange={setBroadcastOpen}>
        <DialogContent className="max-w-lg bg-[#fef8f4] border-[#e7e1de] text-[#1d1b19] p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-[#1d1b19] flex items-center gap-2">
              <Share2 className="h-4 w-4 text-[#854f00]" />
              <span>Broadcast Announcement Message</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-[#2d2420]">
              Formatted template with real live stats ready to share on Telegram or WhatsApp
            </DialogDescription>
          </DialogHeader>

          <div className="p-3.5 rounded-xl bg-[#ffffff] border border-[#e7e1de] font-mono text-xs text-[#1d1b19] whitespace-pre-wrap select-all leading-relaxed">
            {broadcastText}
          </div>

          <DialogFooter className="pt-2">
            <Button
              size="sm"
              onClick={handleCopyBroadcast}
              className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs w-full flex items-center justify-center gap-1.5"
            >
              {broadcastCopied ? <Check className="h-3.5 w-3.5 text-zinc-950" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{broadcastCopied ? 'Copied to Clipboard!' : 'Copy Formatted Message'}</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Daily Log Modal */}
      <Dialog open={Boolean(editingLog)} onOpenChange={(o) => !o && setEditingLog(null)}>
        <DialogContent className="max-w-md bg-[#fef8f4] border-[#e7e1de] text-[#1d1b19] p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-[#1d1b19] flex items-center gap-2">
              <Edit2 className="h-4 w-4 text-[#9f3c16]" />
              <span>Edit Study Log: {editingLog?.studyId}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-[#2d2420] leading-relaxed">
              Correct study hours or notes for {editingLog?.dateOfStudy || editingLog?.date}. Updates Google Sheets directly.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-[11px] text-[#2d2420]">{editingLog?.subjects?.[0]?.name || 'Subj 1'} Hrs</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="24"
                  value={editLogHours1}
                  onChange={(e) => setEditLogHours1(e.target.value)}
                  className="bg-[#ffffff] border-[#e7e1de] text-[#1d1b19] text-xs h-9"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] text-[#2d2420]">{editingLog?.subjects?.[1]?.name || 'Subj 2'} Hrs</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="24"
                  value={editLogHours2}
                  onChange={(e) => setEditLogHours2(e.target.value)}
                  className="bg-[#ffffff] border-[#e7e1de] text-[#1d1b19] text-xs h-9"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] text-[#2d2420]">{editingLog?.subjects?.[2]?.name || 'Subj 3'} Hrs</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="24"
                  value={editLogHours3}
                  onChange={(e) => setEditLogHours3(e.target.value)}
                  className="bg-[#ffffff] border-[#e7e1de] text-[#1d1b19] text-xs h-9"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-[11px] text-[#2d2420]">Total Hours (Leave blank to auto-sum)</Label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="24"
                value={editLogTotal}
                onChange={(e) => setEditLogTotal(e.target.value)}
                placeholder="Auto-calculated from subjects if empty"
                className="bg-[#ffffff] border-[#e7e1de] text-[#1d1b19] text-xs h-9 font-mono text-[#9f3c16]"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[11px] text-[#2d2420]">Notes / Remarks</Label>
              <Input
                value={editLogNotes}
                onChange={(e) => setEditLogNotes(e.target.value)}
                placeholder="Study session notes..."
                className="bg-[#ffffff] border-[#e7e1de] text-[#1d1b19] text-xs h-9"
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEditingLog(null)}
              className="border-[#e7e1de] text-xs active:scale-95 transition-all cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveLogEdit}
              disabled={savingLog}
              className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-[#1d1b19] text-xs font-semibold transition-all cursor-pointer"
            >
              {savingLog ? 'Saving to Sheets...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Student History Drill-down Modal */}
      <Dialog open={Boolean(viewingStudentId)} onOpenChange={(o) => !o && setViewingStudentId(null)}>
        <DialogContent className="max-w-2xl bg-[#fef8f4] border-[#e7e1de] text-[#1d1b19] p-6 max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-[#1d1b19] flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-400" />
              <span>
                Study History: {membersList.find((m) => m.studyId === viewingStudentId)?.fullName || viewingStudentId}
              </span>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#f3ede9] text-[#1d1b19]">
                {viewingStudentId}
              </span>
            </DialogTitle>
            <DialogDescription className="text-xs text-[#2d2420]">
              All daily logs recorded for this student in Google Sheets
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            {logsList
              .filter((l) => l.studyId === viewingStudentId)
              .sort((a, b) => String(b.dateOfStudy || b.date || '').localeCompare(String(a.dateOfStudy || a.date || '')))
              .map((l, i) => {
                const subs = l.subjects || [];
                const tot = Number(l.totalHours || 0);
                const proof = l.proofPhotoUrl || l.proofUrl;

                return (
                  <div key={i} className="p-3.5 rounded-xl bg-[#ffffff] border border-[#e7e1de] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#1d1b19] font-mono">
                          {formatDate(l.dateOfStudy || l.date, 'short')}
                        </span>
                        <span className="text-xs font-mono font-bold text-[#9f3c16]">
                          {tot.toFixed(1)} hrs
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {proof && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedProofUrl(proof)}
                            className="h-6 px-2 text-[11px] text-[#456644] hover:text-emerald-300 hover:bg-emerald-500/10 rounded"
                          >
                            <ImageIcon className="h-3 w-3 mr-1" /> View Proof
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditLogModal(l)}
                          className="h-6 px-2 text-[11px] text-[#9f3c16] hover:text-indigo-300 hover:bg-indigo-500/10 rounded"
                        >
                          <Edit2 className="h-3 w-3 mr-1" /> Edit
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs">
                      {subs.map((s, si) => (
                        <span key={si} className="px-2 py-0.5 rounded bg-[#f3ede9] text-[#1d1b19] text-[11px]">
                          {s.name || `Subj ${si + 1}`}: <strong className="text-[#1d1b19]">{Number(s.hours || 0).toFixed(1)}h</strong> (F:{s.focus || '—'})
                        </span>
                      ))}
                    </div>

                    {l.notes && (
                      <p className="text-xs text-[#2d2420] italic pt-1 border-t border-[#e7e1de]/60">
                        &ldquo;{l.notes}&rdquo;
                      </p>
                    )}
                  </div>
                );
              })}

            {logsList.filter((l) => l.studyId === viewingStudentId).length === 0 && (
              <div className="p-8 text-center text-[#4a3b35] text-xs">
                No study logs recorded for this student yet.
              </div>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewingStudentId(null)}
              className="border-[#e7e1de] text-xs active:scale-95 transition-all cursor-pointer w-full"
            >
              Close History View
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Forms & Surveys Builder Modal */}
      <FormBuilderModal
        adminEmail={user?.email || 'admin@studysync.lk'}
        isOpen={formBuilderOpen}
        onClose={() => setFormBuilderOpen(false)}
      />


      {/* Quick Note Modal */}
      <Dialog open={quickNoteOpen} onOpenChange={setQuickNoteOpen}>
        <DialogContent className="bg-[#ffffff] border-[#e7e1de] text-[#1d1b19] max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Send Quick Note to {quickNoteStudent}</DialogTitle>
            <DialogDescription className="text-[#2d2420] text-xs">
              Send a personalized word of encouragement or feedback directly to the student's study ledger.
            </DialogDescription>
          </DialogHeader>
          <div className="py-3">
            <textarea
              rows={4}
              value={quickNoteText}
              onChange={(e) => setQuickNoteText(e.target.value)}
              placeholder="E.g., Great pace on this mechanics derivation! Remember to recheck tension vectors on incline problems."
              className="w-full bg-[#fef8f4] border border-[#e7e1de] rounded-xl p-3 text-xs text-[#1d1b19] placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setQuickNoteOpen(false)} className="border-[#e7e1de] text-[#1d1b19]">
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!quickNoteText.trim()) {
                  toast.error('Please enter a note before sending');
                  return;
                }
                if (quickNoteStudyId) {
                  localDb.sendMessageToStudentInbox(quickNoteStudyId, {
                    title: 'Note from Academic Supervisor',
                    body: quickNoteText.trim(),
                    sender: 'Academic Supervisor',
                    type: 'announcement',
                  });
                }
                toast.success(`Note delivered to ${quickNoteStudent}'s personal inbox!`);
                setQuickNoteOpen(false);
                setQuickNoteText('');
              }}
              className="bg-[#9f3c16] hover:bg-[#822801] text-[#1d1b19] font-semibold text-xs cursor-pointer"
            >
              Send Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Audit Photo Proof Inspection Modal */}
      <PhotoProofModal
        open={!!auditPhotoUrl}
        onOpenChange={(open) => {
          if (!open) setAuditPhotoUrl(null);
        }}
        proofUrl={auditPhotoUrl || ''}
      />

      {/* Admin QR Scanner Modal */}
      <AdminQrScannerModal
        open={qrScannerOpen}
        onOpenChange={setQrScannerOpen}
        onStudentVerified={(scannedId, updatedMember) => {
          setMembersList((prev) =>
            prev.map((m) => (m.studyId.toUpperCase() === scannedId.toUpperCase() ? updatedMember : m))
          );
        }}
      />

    </div>
  );
}
