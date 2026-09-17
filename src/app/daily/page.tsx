"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import { SubmitDailyLogPayload } from '@/types/api';
import {
  cn,
  getTodayDateString,
  normalizeDateString,
  formatDate,
  formatBytes,
  compressImage,
  formatHoursHuman,
  extractLogDate,
  extractLogHours,
} from '@/lib/utils';
import { localDb } from '@/lib/storage/localDb';
import { DailyLogEntry } from '@/types/logs';
import {
  validateImageFile,
  scanBase64Payload,
  sanitizeInput,
  submissionRateLimiter,
} from '@/lib/security';
import { fireConfetti } from '@/lib/confetti';
import { playSuccessChime } from '@/lib/audio';
import { PhotoProofModal } from '@/components/ui/PhotoProofModal';
import { toast } from 'sonner';
import { EmptyDailyBlocksIllustration } from '@/components/illustrations';
import { StudyHeatmap } from '@/components/daily/StudyHeatmap';
import { safeStorage } from '@/lib/storage/safeStorage';
import { ScholarLoginModal } from '@/components/auth/ScholarLoginModal';
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  Camera,
  Upload,
  CheckCircle2,
  Eye,
  Trash2,
  BookOpen,
  Loader2,
  Lock,
  FileCheck,
} from 'lucide-react';

export default function DailyStudyLogPage() {
  const router = useRouter();
  const { user, member, loading: authLoading } = useAuth();
  const { logs, refreshHistory, recordDailyLogOptimistic } = useApp();

  // Sri Lanka local time (UTC+05:30) date lock
  const getSriLankaTodayString = () => {
    try {
      return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Colombo' });
    } catch (e) {
      return getTodayDateString();
    }
  };

  const [dateOfStudy, setDateOfStudy] = useState(getSriLankaTodayString());
  const [submitting, setSubmitting] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  // Auto-commit unsaved pending study block once user signs in
  useEffect(() => {
    if (user?.email) {
      const pending = safeStorage.getJson<any>('studysync_pending_study_block', null);
      if (pending) {
        safeStorage.removeItem('studysync_pending_study_block');
        toast.success('Restored your recorded study block! Submitting now...');
        
        const isBioCandidate = String(member?.stream || '').toLowerCase().includes('bio');
        const s1 = isBioCandidate ? 'Biology' : 'Combined Maths';
        const s2 = 'Physics';
        const s3 = 'Chemistry';
        let s1H = 0, s2H = 0, s3H = 0;
        if (pending.selectedSubject === s1) s1H = pending.activeBlockHours;
        else if (pending.selectedSubject === s2) s2H = pending.activeBlockHours;
        else s3H = pending.activeBlockHours;

        const fNotes = sanitizeInput(pending.topic ? `${pending.topic} — ${pending.notes}` : pending.notes);
        const optimistic: DailyLogEntry = {
          id: 'log-' + Date.now(),
          studyId: member?.studyId || user.email,
          dateOfStudy: pending.dateOfStudy,
          date: pending.dateOfStudy,
          hoursSubject1: s1H,
          hoursSubject2: s2H,
          hoursSubject3: s3H,
          totalHours: pending.activeBlockHours,
          focusScore: pending.focusScore || 8,
          productivityScore: pending.productivityScore || 8,
          notes: fNotes,
          telegramUsername: member?.telegramUsername || '',
          proofPhotoUrl: pending.proofBase64 || undefined,
          timestamp: new Date().toISOString(),
        };

        recordDailyLogOptimistic(optimistic);
        localDb.saveDailyLog(optimistic);

        api.submitDailyLog({
          studyId: member?.studyId || user.email,
          email: user.email,
          fullName: member?.fullName || user.displayName || 'Student',
          stream: member?.stream || '',
          dateOfStudy: pending.dateOfStudy,
          hoursSubject1: s1H,
          hoursSubject2: s2H,
          hoursSubject3: s3H,
          totalHours: pending.activeBlockHours,
          focusScore: pending.focusScore || 8,
          productivityScore: pending.productivityScore || 8,
          notes: fNotes,
          telegramUsername: member?.telegramUsername || '',
          photoProofBase64: pending.proofBase64 || undefined,
        }).then(() => refreshHistory(true)).catch(() => {});
      }
    }
  }, [user?.email, member]);

  // Dynamic stream detection: Physical Science vs Biological Science - never both together
  const isBio = String(member?.stream || '').toLowerCase().includes('bio');
  const streamSubjects = useMemo(() => {
    if (isBio) {
      return ['Biology', 'Physics', 'Chemistry'];
    }
    return ['Combined Maths', 'Physics', 'Chemistry'];
  }, [isBio]);
  const sub1Name = streamSubjects[0];
  const sub2Name = streamSubjects[1];
  const sub3Name = streamSubjects[2];

  // Selected subject channel
  const [selectedSubject, setSelectedSubject] = useState<string>(sub1Name);
  useEffect(() => {
    if (streamSubjects.length > 0 && !streamSubjects.includes(selectedSubject)) {
      setSelectedSubject(streamSubjects[0]);
    }
  }, [streamSubjects, selectedSubject]);

  // Active topic / focus
  const [topic, setTopic] = useState('');
  const [notes, setNotes] = useState('');

  // Qualitative scores
  const [focusScore, setFocusScore] = useState<number>(8);
  const [productivityScore, setProductivityScore] = useState<number>(8);

  // Focus Stopwatch State
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning]);

  // Format stopwatch: HH:MM:SS
  const formatTimer = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Direct manual hours option if stopwatch not used or adjusting
  const [manualDurationHours, setManualDurationHours] = useState<number>(1.5);
  const [useStopwatchDuration, setUseStopwatchDuration] = useState<boolean>(false);

  const activeBlockHours = useStopwatchDuration
    ? Math.max(0.1, Number((timerSeconds / 3600).toFixed(2)))
    : manualDurationHours;

  // Photo Proof State
  const [proofBase64, setProofBase64] = useState<string | null>(null);
  const [proofFileName, setProofFileName] = useState<string>('');
  const [proofFileSize, setProofFileSize] = useState<string>('');
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [previewModalOpen, setPreviewModalOpen] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Process File (Image or PDF Proof)
  const handleFileProcess = async (file: File) => {
    if (!file) return;

    // Direct support for PDF documents (e.g. past paper scans or printed problem sets)
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (isPdf) {
      if (file.size > 15 * 1024 * 1024) {
        toast.error('PDF file exceeds maximum limit of 15MB');
        return;
      }
      setIsCompressing(true);
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setProofBase64(base64);
        setProofFileName(file.name);
        setProofFileSize(formatBytes(file.size));
        toast.success('Study proof document attached (PDF)');
        setIsCompressing(false);
      };
      reader.onerror = () => {
        toast.error('Failed to read PDF document');
        setIsCompressing(false);
      };
      reader.readAsDataURL(file);
      return;
    }

    const val = await validateImageFile(file);
    if (!val.valid) {
      toast.error(val.error || 'Invalid image file');
      return;
    }

    try {
      setIsCompressing(true);
      const compressed = await compressImage(file, {
        maxWidthOrHeight: 1280,
        quality: 0.82,
      });

      const scanResult = scanBase64Payload(compressed.base64);
      if (!scanResult.safe) {
        toast.error('Image validation failed security scan');
        setIsCompressing(false);
        return;
      }

      setProofBase64(compressed.base64);
      setProofFileName(file.name);
      setProofFileSize(formatBytes(file.size));
      toast.success('Handwritten note attached & compressed');
    } catch (err) {
      console.error(err);
      toast.error('Could not process image file');
    } finally {
      setIsCompressing(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const removeProof = () => {
    setProofBase64(null);
    setProofFileName('');
    setProofFileSize('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Earlier sessions today from backend logs
  const todayDateStr = getTodayDateString();
  const todayLogs = useMemo(() => {
    return logs.filter((l) => {
      const d = extractLogDate(l);
      return d === todayDateStr;
    });
  }, [logs, todayDateStr]);

  // Cumulative today's hours
  const todayAccumulatedHours = useMemo(() => {
    return todayLogs.reduce((acc, l) => acc + extractLogHours(l), 0);
  }, [todayLogs]);

  // Subject breakdown for today
  const todaySubjectBreakdown = useMemo(() => {
    let s1 = 0;
    let s2 = 0;
    let s3 = 0;
    todayLogs.forEach((l) => {
      const subs = l.subjects || l.sessions || [];
      const h1 = Number(subs[0]?.hours || l.sub1Hours || l.hoursSubject1 || l.subject1Hours || 0);
      const h2 = Number(subs[1]?.hours || l.sub2Hours || l.hoursSubject2 || l.subject2Hours || 0);
      const h3 = Number(subs[2]?.hours || l.sub3Hours || l.hoursSubject3 || l.subject3Hours || 0);
      s1 += h1;
      s2 += h2;
      s3 += h3;
    });
    const total = s1 + s2 + s3 || 1;
    return {
      sub1Hours: s1,
      sub2Hours: s2,
      sub3Hours: s3,
      sub1Pct: Math.round((s1 / total) * 100),
      sub2Pct: Math.round((s2 / total) * 100),
      sub3Pct: Math.round((s3 / total) * 100),
    };
  }, [todayLogs]);

  // 7-day velocity points for SVG
  const weekPoints = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const result: { label: string; hours: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const ds = getTodayDateString(d);
      const dayLogs = logs.filter((l) => {
        const lDate = extractLogDate(l);
        return lDate === ds;
      });
      const h = dayLogs.reduce((sum, item) => sum + extractLogHours(item), 0);
      result.push({
        label: i === 0 ? 'Today' : days[d.getDay()],
        hours: Number(h.toFixed(1)),
      });
    }
    return result;
  }, [logs]);

  // Handle Save Session
  const handleSubmitSession = async () => {
    if (activeBlockHours <= 0) {
      toast.error('Please record at least 15 minutes of study time.');
      return;
    }

    // Ceiling validation: Maximum 16.0 study hours per 24-hour cycle
    const alreadyLoggedForDate = logs
      .filter((l) => extractLogDate(l) === dateOfStudy)
      .reduce((sum, item) => sum + extractLogHours(item), 0);

    if (alreadyLoggedForDate + activeBlockHours > 16.0) {
      toast.error(
        `Daily ceiling reached: Sri Lankan A/L maximum is 16.0 study hours per day. Already logged: ${alreadyLoggedForDate.toFixed(1)}h on ${dateOfStudy}.`
      );
      return;
    }

    // Unsaved Timer Safeguard: Cache locally and prompt login
    if (!user?.email) {
      safeStorage.setJson('studysync_pending_study_block', {
        selectedSubject,
        activeBlockHours,
        topic,
        notes,
        focusScore,
        productivityScore,
        dateOfStudy,
        proofBase64,
      });
      setLoginModalOpen(true);
      toast.info('Session saved in browser! Please sign in to commit it to your personal ledger.');
      return;
    }

    if (!submissionRateLimiter.allow()) {
      toast.error('Rate limit reached. Please wait a moment before submitting again.');
      return;
    }

    // Allocate hours to the selected subject
    let sub1H = 0;
    let sub2H = 0;
    let sub3H = 0;

    if (selectedSubject === sub1Name) sub1H = activeBlockHours;
    else if (selectedSubject === sub2Name) sub2H = activeBlockHours;
    else sub3H = activeBlockHours;

    const formattedNotes = sanitizeInput(topic ? `${topic} — ${notes}` : notes);

    const optimisticEntry: DailyLogEntry = {
      id: 'log-' + Date.now(),
      studyId: member?.studyId || user.email,
      dateOfStudy,
      date: dateOfStudy,
      hoursSubject1: sub1H,
      hoursSubject2: sub2H,
      hoursSubject3: sub3H,
      totalHours: activeBlockHours,
      focusScore,
      productivityScore,
      notes: formattedNotes,
      telegramUsername: member?.telegramUsername || '',
      proofPhotoUrl: proofBase64 || undefined,
      subjects: [
        { name: sub1Name, hours: sub1H, focus: focusScore, productivity: productivityScore },
        { name: sub2Name, hours: sub2H, focus: focusScore, productivity: productivityScore },
        { name: sub3Name, hours: sub3H, focus: focusScore, productivity: productivityScore },
      ],
      timestamp: new Date().toISOString(),
    };

    // 0ms instant UI update and local persistence
    recordDailyLogOptimistic(optimisticEntry);
    localDb.saveDailyLog(optimisticEntry);

    try {
      setSubmitting(true);

      const payload: SubmitDailyLogPayload = {
        studyId: member?.studyId || user.email,
        email: user.email,
        fullName: member?.fullName || user.displayName || 'Student',
        stream: member?.stream || '',
        dateOfStudy,
        hoursSubject1: sub1H,
        hoursSubject2: sub2H,
        hoursSubject3: sub3H,
        totalHours: activeBlockHours,
        focusScore,
        productivityScore,
        notes: formattedNotes,
        telegramUsername: member?.telegramUsername || '',
        photoProofBase64: proofBase64 || undefined,
        proofPhotoUrl: proofBase64 || undefined,
        proofUrl: proofBase64 || undefined,
      };

      const res = await api.submitDailyLog(payload);

      if (res.success) {
        fireConfetti();
        playSuccessChime();
        setSaveSuccessNotice(true);
        toast.success('Study session synced to your personal ledger!');

        // Reset timer and inputs
        setIsTimerRunning(false);
        setTimerSeconds(0);
        setTopic('');
        setNotes('');
        removeProof();

        // Refresh app state
        await refreshHistory(true);

        setTimeout(() => setSaveSuccessNotice(false), 5000);
      } else {
        toast.error(res.error || res.data?.message || 'Failed to sync session to backend');
      }
    } catch (err: any) {
      console.error('Submission error:', err);
      toast.error(err.message || 'Network error while recording study log');
    } finally {
      setSubmitting(false);
    }
  };

  // Draft for later (local storage save)
  const handleDraftLater = () => {
    const draft = {
      dateOfStudy,
      selectedSubject,
      topic,
      notes,
      activeBlockHours,
      focusScore,
      productivityScore,
      timestamp: Date.now(),
    };
    safeStorage.setJson('studysync_daily_draft', draft);
    toast.info('Draft preserved in local browser cache.');
  };

  // Load draft on mount
  useEffect(() => {
    try {
      const d = safeStorage.getJson<any>('studysync_daily_draft', null);
      if (d) {
        if (d.topic) setTopic(d.topic);
        if (d.notes) setNotes(d.notes);
        if (d.selectedSubject && streamSubjects.includes(d.selectedSubject)) {
          setSelectedSubject(d.selectedSubject);
        }
      }
    } catch (e) {
      // Ignore
    }
  }, [streamSubjects]);

  const dialRotation = (timerSeconds % 60) * 6;

  // Selected proof preview modal helper
  const [selectedProofUrl, setSelectedProofUrl] = useState<string | null>(null);

  return (
    <div className="w-full flex-1 bg-[#fef8f4] text-[#1d1b19] pb-10 sm:pb-12 selection:bg-[#ffdbcf] selection:text-[#9f3c16]">
      <div className="w-full max-w-[1440px] mx-auto pt-6 px-4 md:px-12">
        <div className="flex flex-col w-full">
          {/* Conversational Header */}
          <section className="mb-8 mt-2 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-2.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ede7e3] border border-[#dec0b7]/40 text-[#854f00] font-mono text-[10px] tracking-widest uppercase shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9f3c16] animate-ping" />
                  ACTIVE STUDY BLOCK
                </span>
                <span className="text-[#dec0b7]">•</span>
                <span className="font-sans text-[11px] font-semibold text-[#2d2420] tracking-wide">
                  Today&apos;s Focus Session
                </span>
              </div>
              <h1 className="font-serif text-3xl md:text-4xl text-[#1d1b19] tracking-tight flex items-baseline gap-3">
                Today&apos;s Study Log
                <span className="font-mono text-xs text-[#4a3b35] font-normal tracking-normal border border-[#dec0b7]/40 px-2 py-0.5 rounded bg-[#f8f2ef] hidden sm:inline-block">
                  A/L 2026
                </span>
              </h1>
              <p className="font-sans text-[15px] text-[#2d2420] mt-2 leading-relaxed">
                Log what you studied today and snap a quick pic of your handwritten working. Keep it honest, quiet, and consistent.
              </p>
            </div>

            {/* Target & Pace Micro-stats */}
            <div className="flex items-center gap-3 self-start md:self-auto bg-gradient-to-b from-[#fdfbf7] to-[#f6efe7] border border-[#dec0b7]/60 shadow-[0_4px_16px_rgba(78,57,48,0.06)] p-3 rounded-2xl">
              <div className="px-3.5 py-1 text-center">
                <span className="block font-mono text-[10px] uppercase tracking-wider text-[#4a3b35]">Target</span>
                <span className="font-mono text-base font-semibold text-[#1d1b19]">6.0 hrs</span>
              </div>
              <div className="w-px h-8 bg-[#dec0b7]/40" />
              <div className="px-3.5 py-1 text-center">
                <span className="block font-mono text-[10px] uppercase tracking-wider text-[#4a3b35]">Logged</span>
                <span className="font-mono text-base font-semibold text-[#9f3c16]">
                  {formatHoursHuman(todayAccumulatedHours)}
                </span>
              </div>
              <div className="w-px h-8 bg-[#dec0b7]/40" />
              <div className="px-3.5 py-1 text-center">
                <span className="block font-mono text-[10px] uppercase tracking-wider text-[#4a3b35]">Pace</span>
                <span className="font-mono text-base font-semibold text-[#456644]">
                  {Math.min(100, Math.round((todayAccumulatedHours / 6) * 100))}%
                </span>
              </div>
            </div>
          </section>

          {/* Two-Column Asymmetric Canvas Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN: Focus Clock & Active Block Entry (7 Columns) */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              {/* Primary Focus Clock Panel */}
              <div className="bg-white border border-[#dec0b7]/70 rounded-3xl p-6 sm:p-8 relative shadow-[0_10px_28px_-6px_rgba(78,57,48,0.06)] overflow-hidden">
                {/* Ambient Subtle Warm Terracotta Glow */}
                <div className="absolute -right-20 -top-20 w-52 h-52 rounded-full bg-[#ffb59c]/15 blur-3xl pointer-events-none" />

                {/* Stopwatch Instrument & Controls */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-[#dec0b7]/30 relative z-10">
                  {/* Digital Precision Focus Ring & Readout */}
                  <div className="flex items-center gap-5">
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center shrink-0">
                      {/* Clean SVG Progress Ring */}
                      <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                        {/* Background track */}
                        <circle
                          cx="50"
                          cy="50"
                          r="42"
                          stroke="#ede7e3"
                          strokeWidth="5"
                          fill="transparent"
                        />
                        {/* Progress stroke */}
                        <circle
                          cx="50"
                          cy="50"
                          r="42"
                          stroke={isTimerRunning ? '#c85a32' : '#dec0b7'}
                          strokeWidth="5"
                          strokeLinecap="round"
                          fill="transparent"
                          strokeDasharray={264}
                          strokeDashoffset={264 - ((timerSeconds % 3600) / 3600) * 264}
                          className="transition-all duration-300"
                        />
                      </svg>
                      {/* Center Content */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
                        <Clock className={`w-5 h-5 sm:w-6 sm:h-6 ${isTimerRunning ? 'text-[#c85a32] animate-pulse' : 'text-[#4a3b35]'}`} />
                        <span className="font-mono text-[9px] uppercase tracking-widest text-[#4a3b35] mt-1 font-semibold">
                          {isTimerRunning ? 'ACTIVE' : 'READY'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider bg-[#f3ede9] text-[#2d2420] border border-[#dec0b7]/50">
                          <span className={`w-1.5 h-1.5 rounded-full ${isTimerRunning ? 'bg-[#456644] animate-pulse' : 'bg-[#dec0b7]'}`} />
                          {isTimerRunning ? 'FOCUS BLOCK IN PROGRESS' : 'STUDY CLOCK STANDBY'}
                        </span>
                      </div>
                      <div className="mt-1.5">
                        <span className="font-mono text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#1d1b19] tabular-nums">
                          {formatTimer(timerSeconds)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5 text-xs text-[#2d2420] font-mono">
                        <span className="px-1.5 py-0.5 rounded bg-[#c6edc1]/70 text-[#022106] font-semibold text-[10px]">
                          CALIBRATED
                        </span>
                        <span>Auto-synced to cloud</span>
                      </div>
                    </div>
                  </div>

                  {/* Stopwatch Tactile Buttons */}
                  <div className="flex sm:flex-col gap-2.5 w-full sm:w-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setIsTimerRunning(!isTimerRunning);
                        setUseStopwatchDuration(true);
                      }}
                      className={cn(
                        'flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-sans font-semibold text-sm shadow-xs active:scale-[0.98] transition-all duration-150 cursor-pointer',
                        isTimerRunning
                          ? 'bg-white text-[#9f3c16] border border-[#dec0b7] hover:bg-[#f8f2ef]'
                          : 'bg-[#c85a32] text-white hover:bg-[#b04b25]'
                      )}
                    >
                      {isTimerRunning ? (
                        <>
                          <Pause className="w-4 h-4 text-[#9f3c16]" />
                          <span>Pause Session</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          <span>{timerSeconds > 0 ? 'Resume Clock' : 'Start Focus Clock'}</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsTimerRunning(false);
                        setTimerSeconds(0);
                      }}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#f8f2ef] text-[#2d2420] font-mono text-xs border border-[#dec0b7]/40 hover:text-[#1d1b19] hover:bg-[#ede7e3] active:scale-[0.98] transition-all cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset</span>
                    </button>
                  </div>
                </div>

                {/* Duration Slider Option (if user logged offline or wants manual adjust) */}
                <div className="pt-4 pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-[#4a3b35]">
                      Session Duration:
                    </span>
                    <span className="font-mono text-sm font-semibold text-[#9f3c16]">
                      {activeBlockHours.toFixed(1)} hrs ({Math.round(activeBlockHours * 60)} mins)
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0.25}
                      max={8}
                      step={0.25}
                      value={activeBlockHours}
                      onChange={(e) => {
                        setUseStopwatchDuration(false);
                        setManualDurationHours(parseFloat(e.target.value));
                      }}
                      className="w-44 h-1.5 bg-[#ede7e3] rounded-lg appearance-none cursor-pointer accent-[#9f3c16]"
                    />
                    <span className="font-mono text-[10px] text-[#4a3b35]">Manual Dial</span>
                  </div>
                </div>

                {/* Subject Mechanical Channel Glider */}
                <div className="pt-5 border-t border-[#dec0b7]/30 mt-3">
                  <div className="flex items-center justify-between mb-2.5">
                    <label className="block font-mono text-[10px] uppercase tracking-wider text-[#4a3b35]">
                      Subject Channel Select
                    </label>
                    <span className="font-mono text-[9px] text-[#4a3b35] uppercase">STREAM SYNC</span>
                  </div>
                  <div className="relative bg-[#ede5de] p-1.5 rounded-2xl flex flex-wrap items-center gap-2 shadow-[inset_0_2px_4px_rgba(45,35,30,0.1)]">
                    {streamSubjects.map((subj) => {
                      const isSelected = selectedSubject === subj;
                      return (
                        <button
                          key={subj}
                          type="button"
                          onClick={() => setSelectedSubject(subj)}
                          className={`relative z-10 flex-1 min-w-[120px] px-4 py-2.5 rounded-xl font-sans text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            isSelected
                              ? 'bg-[#9f3c16] text-white shadow-[0_2px_6px_rgba(159,60,22,0.35)]'
                              : 'text-[#2d2420] hover:text-[#1d1b19] hover:bg-white/40'
                          }`}
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>{subj}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Working On Topic Input */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <label
                      htmlFor="studyFocusInput"
                      className="block font-mono text-[10px] uppercase tracking-wider text-[#4a3b35]"
                    >
                      Active Topic / What did you work on?
                    </label>
                    <input
                      type="date"
                      value={dateOfStudy}
                      onChange={(e) => setDateOfStudy(e.target.value)}
                      className="font-mono text-[11px] bg-white border border-[#dec0b7]/70 rounded-lg px-2 py-0.5 text-[#1d1b19]"
                    />
                  </div>
                  <div className="relative">
                    <input
                      id="studyFocusInput"
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="e.g. Integration by Parts, Galvanic Cells, or Rotational Mechanics..."
                      className="w-full bg-white px-4 py-3.5 rounded-xl font-sans text-sm text-[#1d1b19] border border-[#dec0b7]/70 shadow-inner focus:outline-none focus:border-[#9f3c16] focus:ring-1 focus:ring-[#9f3c16] transition-all"
                    />
                  </div>
                </div>

                {/* Handwritten Working Proof Attachment */}
                <div className="mt-6 pt-5 bg-[#f8f2ef]/80 rounded-2xl p-5 border border-[#dec0b7]/40 relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Camera className="w-5 h-5 text-[#9f3c16]" />
                      <span className="font-sans font-semibold text-sm text-[#1d1b19]">
                        Handwritten Working Pic
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-[#456644] bg-[#c6edc1]/80 border border-[#456644]/30 px-2.5 py-0.5 rounded-full font-medium tracking-wider uppercase">
                      Daily Note Verification
                    </span>
                  </div>
                  <p className="font-sans text-xs text-[#2d2420] mb-4">
                    Upload your handwritten pages, problem set work, or PDF working notes (PNG, JPEG, WebP, or PDF up to 15MB) for verification.
                  </p>

                  {/* Dropzone Container */}
                  {!proofBase64 ? (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragOver(true);
                      }}
                      onDragLeave={() => setIsDragOver(false)}
                      onDrop={onDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`group relative rounded-xl bg-white border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-200 ${
                        isDragOver
                          ? 'border-[#9f3c16] bg-[#f8f2ef] scale-[1.01]'
                          : 'border-[#dec0b7]/70 hover:bg-[#f3ede9]'
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png, image/jpeg, image/webp, application/pdf"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            handleFileProcess(e.target.files[0]);
                          }
                        }}
                      />
                      <div className="flex flex-col items-center justify-center pointer-events-none">
                        <div className="w-12 h-12 rounded-2xl bg-[#ede7e3] border border-[#dec0b7]/50 flex items-center justify-center text-[#9f3c16] group-hover:scale-110 transition-transform mb-2">
                          {isCompressing ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                          ) : (
                            <Upload className="w-6 h-6" />
                          )}
                        </div>
                        <span className="font-sans text-sm font-semibold text-[#1d1b19]">
                          {isCompressing ? 'Compressing handwritten pages...' : 'Drop photo or click to upload'}
                        </span>
                        <span className="font-mono text-[11px] text-[#4a3b35] mt-0.5">
                          Formulas and derivations will be verified by mentors
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* Paper Specimen Card with Clip & Tape Illusion */
                    <div className="mt-2 relative bg-[#fffefb] rounded-xl p-4 border border-[#e5ded7] shadow-sm">
                      {/* Metallic Binder Clip Illusion */}
                      <div className="absolute -top-3 left-8 z-20 flex flex-col items-center">
                        <div className="w-9 h-3.5 bg-gradient-to-b from-[#4a3b35] to-[#453630] rounded-t-sm shadow-[0_2px_4px_rgba(0,0,0,0.3)]" />
                        <div className="w-5 h-2 bg-[#d8ccc4] border border-[#7a645d] rounded-b-xs" />
                      </div>
                      {/* Paper Tape Illusion */}
                      <div className="absolute -top-2.5 right-6 w-14 h-5 bg-[#f5e6b3]/70 transform rotate-2 border-y border-[#d8c28a]/40 shadow-xs pointer-events-none" />

                      <div className="flex items-center justify-between gap-4 pt-1">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div
                            onClick={() => setPreviewModalOpen(true)}
                            className="w-14 h-14 rounded-lg overflow-hidden shrink-0 relative border border-[#dec0b7]/60 shadow-xs bg-[#ede7e3] flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
                          >
                            <img
                              src={proofBase64}
                              alt="Handwritten Working Preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-xs font-semibold text-[#1d1b19] truncate">
                                {proofFileName || 'handwritten-working.jpg'}
                              </span>
                              <CheckCircle2 className="w-4 h-4 text-[#456644] shrink-0" />
                            </div>
                            <span className="font-mono text-[11px] text-[#4a3b35] block truncate mt-0.5">
                              {proofFileSize} • Ready to be linked to your ledger
                            </span>
                            <span className="font-mono text-[10px] text-[#456644] tracking-wider block mt-0.5 uppercase">
                              VERIFIED FOR SUBMISSION
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => setPreviewModalOpen(true)}
                            className="p-2 rounded-lg bg-[#f8f2ef] hover:bg-[#ede7e3] text-[#4a3b35] hover:text-[#9f3c16] transition-all cursor-pointer"
                            title="Inspect proof"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={removeProof}
                            className="p-2 rounded-lg bg-[#f8f2ef] hover:bg-[#ffdad6] text-[#4a3b35] hover:text-[#ba1a1a] transition-all cursor-pointer"
                            title="Remove attachment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Qualitative Focus & Productivity Sliders */}
                <div className="mt-6 pt-5 border-t border-[#dec0b7]/30">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-[#dec0b7]/60">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-mono text-[10px] uppercase tracking-wider text-[#4a3b35]">
                          Focus Intensity
                        </span>
                        <span className="font-mono text-xs font-semibold text-[#9f3c16]">{focusScore} / 10</span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={10}
                        value={focusScore}
                        onChange={(e) => setFocusScore(parseInt(e.target.value, 10))}
                        className="w-full h-1.5 bg-[#ede7e3] rounded-lg appearance-none cursor-pointer accent-[#9f3c16]"
                      />
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-[#dec0b7]/60">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-mono text-[10px] uppercase tracking-wider text-[#4a3b35]">
                          Productivity
                        </span>
                        <span className="font-mono text-xs font-semibold text-[#456644]">{productivityScore} / 10</span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={10}
                        value={productivityScore}
                        onChange={(e) => setProductivityScore(parseInt(e.target.value, 10))}
                        className="w-full h-1.5 bg-[#ede7e3] rounded-lg appearance-none cursor-pointer accent-[#456644]"
                      />
                    </div>
                  </div>
                </div>

                {/* Qualitative Reflection Notes */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <label
                      htmlFor="sessionThoughts"
                      className="block font-mono text-[10px] uppercase tracking-wider text-[#4a3b35]"
                    >
                      Notes &amp; quick thoughts on this session
                    </label>
                    <span className="font-mono text-[9px] text-[#4a3b35]">OPTIONAL FIELD NOTES</span>
                  </div>
                  <textarea
                    id="sessionThoughts"
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="E.g., Circular motion equation felt clear today, but need to re-check tension vectors before tomorrow..."
                    className="w-full bg-white px-4 py-3 rounded-xl font-sans text-sm text-[#1d1b19] border border-[#dec0b7]/70 placeholder:text-[#4a3b35] shadow-inner focus:outline-none focus:border-[#9f3c16] focus:ring-1 focus:ring-[#9f3c16] transition-all resize-none"
                  />
                </div>

                {/* Action Buttons */}
                <div className="mt-8 pt-2 flex flex-col sm:flex-row items-center gap-4">
                  <button
                    type="button"
                    onClick={handleSubmitSession}
                    disabled={submitting}
                    className="w-full sm:flex-1 h-12 rounded-2xl bg-[#9f3c16] hover:bg-[#822801] text-white font-sans font-semibold text-sm tracking-wide shadow-[0_4px_12px_rgba(159,60,22,0.35)] flex items-center justify-center gap-2 cursor-pointer transition-all active:translate-y-0.5 disabled:opacity-60"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Syncing to Ledger...</span>
                      </>
                    ) : (
                      <>
                        <FileCheck className="w-5 h-5" />
                        <span>Save &amp; Wrap Up Block</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleDraftLater}
                    className="w-full sm:w-auto px-6 h-12 rounded-2xl bg-[#ede7e3] text-[#2d2420] font-sans font-medium text-sm border border-[#dec0b7]/60 hover:text-[#1d1b19] hover:bg-[#e7e1de] transition-colors cursor-pointer"
                  >
                    Draft for later
                  </button>
                </div>

                {/* Save Toast Notification */}
                {saveSuccessNotice && (
                  <div className="mt-4 p-3.5 rounded-xl bg-[#c6edc1]/90 border border-[#456644]/40 text-[#022106] text-xs font-mono flex items-center gap-2.5 shadow-sm">
                    <CheckCircle2 className="w-4 h-4 text-[#456644]" />
                    <span>Session saved and synced to your study ledger. Good job!</span>
                  </div>
                )}
              </div>

              {/* Kinfolk Atelier Encouragement Strip */}
              <div className="bg-gradient-to-b from-[#fdfbf7] to-[#f6efe7] border border-[#dec0b7]/60 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-[#ede7e3] border border-[#dec0b7]/50 flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5 text-[#854f00]" />
                </div>
                <div>
                  <p className="font-serif text-base text-[#1d1b19] italic">
                    “Repetition is not the absence of thought; it is the patient etching of intuition.”
                  </p>
                  <span className="block mt-1 font-mono text-[10px] text-[#2d2420] uppercase tracking-widest">
                    StudySync Merit Guide • A/L 2026
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Cumulative Progress & Today's Ledger (5 Columns) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {/* Today's Progress Card */}
              <div className="bg-gradient-to-b from-[#fdfbf7] to-[#f6efe7] border border-[#dec0b7]/60 rounded-3xl p-6 sm:p-7 relative shadow-[0_12px_32px_-4px_rgba(78,57,48,0.08)] overflow-hidden">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-[#4a3b35]">
                      Today&apos;s Progress
                    </span>
                    <div className="mt-1 flex items-baseline gap-2">
                      <h2 className="font-serif text-3xl font-semibold text-[#1d1b19]">
                        {formatHoursHuman(todayAccumulatedHours)}
                      </h2>
                      <span className="font-sans text-xs text-[#2d2420]">accumulated</span>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#ffdcbc] text-[#2c1700] font-mono text-xs border border-[#854f00]/20 shadow-xs">
                    Target: 6.0 hrs
                  </span>
                </div>

                <p className="font-sans text-xs text-[#2d2420] mt-2">
                  {todayAccumulatedHours >= 6
                    ? 'Daily target accomplished! Take a restful evening or consolidate notes.'
                    : `${formatHoursHuman(Math.max(0, 6 - todayAccumulatedHours))} remaining to hit your target before 10:00 PM wind-down.`}
                </p>

                {/* Progress Fill Bar */}
                <div className="mt-6">
                  <div className="flex items-center justify-between font-mono text-[11px] text-[#4a3b35] mb-2">
                    <span>Subject Breakdown</span>
                    <span className="text-[#1d1b19] font-semibold">
                      {Math.min(100, Math.round((todayAccumulatedHours / 6) * 100))}%
                    </span>
                  </div>

                  {/* Multi-Subject Progress Bar Channel */}
                  <div className="w-full h-4 rounded-full bg-[#ede5de] p-0.5 flex gap-1 border border-[#dec0b7]/50 overflow-hidden shadow-inner">
                    <div
                      className="h-full rounded-full bg-[#9f3c16] transition-all duration-700"
                      style={{ width: `${todaySubjectBreakdown.sub1Pct}%` }}
                      title={`${sub1Name}: ${todaySubjectBreakdown.sub1Hours.toFixed(1)}h`}
                    />
                    <div
                      className="h-full rounded-full bg-[#456644] transition-all duration-700"
                      style={{ width: `${todaySubjectBreakdown.sub2Pct}%` }}
                      title={`${sub2Name}: ${todaySubjectBreakdown.sub2Hours.toFixed(1)}h`}
                    />
                    <div
                      className="h-full rounded-full bg-[#a76501] transition-all duration-700"
                      style={{ width: `${todaySubjectBreakdown.sub3Pct}%` }}
                      title={`${sub3Name}: ${todaySubjectBreakdown.sub3Hours.toFixed(1)}h`}
                    />
                  </div>

                  {/* Legend Grid */}
                  <div className="grid grid-cols-3 gap-2 mt-4 pt-1">
                    <div className="bg-[#f8f2ef]/80 p-2 rounded-xl border border-[#dec0b7]/30">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#9f3c16] shrink-0" />
                        <span className="font-sans text-[11px] font-medium text-[#1d1b19] truncate">{sub1Name}</span>
                      </div>
                      <span className="font-mono text-[11px] text-[#4a3b35] block mt-0.5">
                        {todaySubjectBreakdown.sub1Hours.toFixed(1)} hrs
                      </span>
                    </div>

                    <div className="bg-[#f8f2ef]/80 p-2 rounded-xl border border-[#dec0b7]/30">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#456644] shrink-0" />
                        <span className="font-sans text-[11px] font-medium text-[#1d1b19] truncate">{sub2Name}</span>
                      </div>
                      <span className="font-mono text-[11px] text-[#4a3b35] block mt-0.5">
                        {todaySubjectBreakdown.sub2Hours.toFixed(1)} hrs
                      </span>
                    </div>

                    <div className="bg-[#f8f2ef]/80 p-2 rounded-xl border border-[#dec0b7]/30">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#a76501] shrink-0" />
                        <span className="font-sans text-[11px] font-medium text-[#1d1b19] truncate">{sub3Name}</span>
                      </div>
                      <span className="font-mono text-[11px] text-[#4a3b35] block mt-0.5">
                        {todaySubjectBreakdown.sub3Hours.toFixed(1)} hrs
                      </span>
                    </div>
                  </div>
                </div>

                {/* 12-Week Rolling Consistency Heatmap */}
                <div className="mt-6">
                  <StudyHeatmap logs={logs} streakCount={member?.streakCount || 5} />
                </div>

                {/* 7-Day Consistency Vector */}
                <div className="mt-6 pt-5 bg-[#f8f2ef]/60 rounded-2xl p-4 border border-[#dec0b7]/40">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#4a3b35]">
                      7-Day Rhythm
                    </span>
                    <span className="font-mono text-[11px] text-[#456644] font-semibold">
                      {logs.length} logged sessions total
                    </span>
                  </div>
                  {/* SVG Line Sparkline */}
                  <div className="h-16 w-full flex items-end pt-2">
                    {(() => {
                      const maxH = Math.max(...weekPoints.map((p) => p.hours), 0);
                      const scaleMax = Math.max(maxH, 4.0);
                      const getY = (idx: number) => {
                        const h = weekPoints[idx]?.hours || 0;
                        return h > 0 ? 34 - Math.min(28, (h / scaleMax) * 26) : 34;
                      };
                      const pts = weekPoints.map((_, i) => ({ x: i * 40, y: getY(i) }));
                      const pathD = pts.reduce((acc, pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`), '');
                      const areaD = `${pathD} L 240 38 L 0 38 Z`;

                      return (
                        <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 240 40">
                          <defs>
                            <linearGradient id="cadenceGrad" x1="0" x2="0" y1="0" y2="1">
                              <stop offset="0%" stopColor="#9f3c16" stopOpacity="0.3" />
                              <stop offset="100%" stopColor="#9f3c16" stopOpacity="0.02" />
                            </linearGradient>
                          </defs>

                          {/* Reference Guide Grid */}
                          <line stroke="#dec0b7" strokeDasharray="2 3" strokeWidth="0.8" x1="0" x2="240" y1="34" y2="34" />

                          {/* Area fill */}
                          <path d={areaD} fill="url(#cadenceGrad)" />

                          {/* Rhythm Stroke */}
                          <path
                            d={pathD}
                            fill="none"
                            stroke="#9f3c16"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2.5"
                          />

                          {/* Node Points for Each Day */}
                          {pts.map((pt, i) => (
                            <g key={i}>
                              <circle
                                cx={pt.x}
                                cy={pt.y}
                                r={i === 6 ? 4.5 : 3}
                                fill={i === 6 ? '#9f3c16' : '#ffffff'}
                                stroke="#9f3c16"
                                strokeWidth="2"
                              />
                            </g>
                          ))}
                        </svg>
                      );
                    })()}
                  </div>
                  <div className="flex justify-between font-mono text-[10px] text-[#4a3b35] mt-1.5 px-1">
                    {weekPoints.map((p, idx) => (
                      <span key={idx} className={idx === 6 ? 'text-[#1d1b19] font-bold' : ''}>
                        {p.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Earlier Sessions Today */}
              <div className="bg-gradient-to-b from-[#fdfbf7] to-[#f6efe7] border border-[#dec0b7]/60 rounded-3xl p-6 sm:p-7 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-[#4a3b35]">
                      StudySync Ledger • A/L 2026
                    </span>
                    <h3 className="font-serif text-lg font-semibold text-[#1d1b19]">Earlier sessions today</h3>
                  </div>
                  <span className="font-mono text-[10px] px-2.5 py-1 rounded-full bg-[#f3ede9] text-[#2d2420] font-medium border border-[#dec0b7]/40">
                    {todayLogs.length} RECORDED
                  </span>
                </div>

                {todayLogs.length === 0 ? (
                  <div className="p-6 text-center rounded-2xl bg-[#f8f2ef] border border-dashed border-[#dec0b7]/60 flex flex-col items-center justify-center">
                    <EmptyDailyBlocksIllustration size={130} className="mx-auto mb-1" />
                    <p className="font-sans text-xs text-[#2d2420] mt-1">
                      No study blocks logged yet for today. Start the timer or log your first block above!
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-3">
                    {todayLogs.map((log, idx) => (
                      <div
                        key={log.id || idx}
                        className="p-4 rounded-2xl bg-[#f8f2ef] border border-[#dec0b7]/40 hover:bg-white transition-all"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#9f3c16]" />
                            <span className="font-sans font-semibold text-xs text-[#1d1b19]">
                              {log.sub1Hours ? sub1Name : log.sub2Hours ? sub2Name : sub3Name}
                            </span>
                            <span className="text-[#dec0b7]">•</span>
                            <span className="font-mono text-[11px] text-[#2d2420]">{log.date}</span>
                          </div>
                          <span className="font-mono text-xs text-[#9f3c16] font-semibold shrink-0">
                            {formatHoursHuman(log.totalHours || 0)}
                          </span>
                        </div>

                        {log.notes && (
                          <p className="font-sans text-xs text-[#2d2420] mt-2 leading-relaxed line-clamp-2">
                            {log.notes}
                          </p>
                        )}

                        <div className="mt-3 flex items-center justify-between pt-2 border-t border-[#dec0b7]/30 font-mono text-[10px]">
                          <span className="inline-flex items-center gap-1 text-[#456644]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Synced to backend</span>
                          </span>

                          {log.proofUrl && (
                            <button
                              type="button"
                              onClick={() => setSelectedProofUrl(log.proofUrl || null)}
                              className="text-[#9f3c16] hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3 h-3" />
                              <span>View Proof</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Encrypted Sync Notice */}
              <div className="bg-gradient-to-b from-[#fdfbf7] to-[#f6efe7] border border-[#dec0b7]/60 rounded-2xl p-4 flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#c6edc1] flex items-center justify-center text-[#456644] shrink-0 border border-[#456644]/30 shadow-xs">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-xs text-[#1d1b19] font-medium truncate">
                    Connected to Secure Cloud Ledger
                  </p>
                  <p className="font-mono text-[11px] text-[#2d2420] truncate mt-0.5">
                    {user?.email || 'Authenticated Student'} • 100% private &amp; encrypted
                  </p>
                </div>
                <Lock className="w-4 h-4 text-[#4a3b35]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Photo Proof Modal for inspecting proof */}
      <PhotoProofModal
        open={previewModalOpen || !!selectedProofUrl}
        onOpenChange={(open) => {
          if (!open) {
            setPreviewModalOpen(false);
            setSelectedProofUrl(null);
          }
        }}
        proofUrl={selectedProofUrl || proofBase64 || ''}
      />

      {/* Unsaved Timer Login Modal Safeguard */}
      <ScholarLoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />
    </div>
  );
}
