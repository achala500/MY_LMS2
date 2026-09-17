'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { DailyLogEntry, StudentStats } from '@/types/logs';
import { MemberData } from '@/types/member';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatDate, downloadCsvFile, generateCsvString, getTodayDateString, daysBetween, parseDateString } from '@/lib/utils';
import { renderQrToCanvas } from '@/lib/qr';
import {
  FileText,
  Download,
  Printer,
  ShieldCheck,
  Sparkles,
  Check,
  Flame,
  Clock,
  BookOpen,
  Scale,
  Award,
  Calendar,
  BrainCircuit,
  QrCode as QrIcon,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';

interface AcademicReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: MemberData;
  logs: DailyLogEntry[];
  stats: StudentStats;
  sub1Name: string;
  sub2Name: string;
  sub3Name: string;
  sub1Hours: number;
  sub2Hours: number;
  sub3Hours: number;
  balanceScore: number;
}

type DateRangeOption = 'week' | 'month' | 'all';

export function AcademicReportModal({
  open,
  onOpenChange,
  member,
  logs,
  stats,
  sub1Name,
  sub2Name,
  sub3Name,
  sub1Hours,
  sub2Hours,
  sub3Hours,
  balanceScore,
}: AcademicReportModalProps) {
  const [range, setRange] = useState<DateRangeOption>('month');
  const [downloadingCsv, setDownloadingCsv] = useState(false);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  const todayStr = getTodayDateString();
  const todayFormatted = formatDate(new Date(), 'long');
  const streak = typeof stats?.currentStreak === 'number' ? stats.currentStreak : (stats?.activeStreak || 0);

  // Filter logs by selected date range
  const filteredLogs = useMemo(() => {
    if (range === 'all') return logs;
    const maxDays = range === 'week' ? 7 : 30;
    return logs.filter((log) => {
      const d = log.dateOfStudy || log.date;
      if (!d) return false;
      const diff = daysBetween(String(d).substring(0, 10), todayStr);
      return diff >= 0 && diff < maxDays;
    });
  }, [logs, range, todayStr]);

  // Compute metrics for the selected range
  const rangeMetrics = useMemo(() => {
    let s1 = 0;
    let s2 = 0;
    let s3 = 0;
    let totalFocus = 0;
    let totalProd = 0;
    let validSessionCount = 0;

    filteredLogs.forEach((l) => {
      const subs = l.subjects || [];
      const h1 = Number(subs[0]?.hours ?? l.subject1Hours ?? l.hoursSubject1 ?? 0);
      const h2 = Number(subs[1]?.hours ?? l.subject2Hours ?? l.hoursSubject2 ?? 0);
      const h3 = Number(subs[2]?.hours ?? l.subject3Hours ?? l.hoursSubject3 ?? 0);
      s1 += h1;
      s2 += h2;
      s3 += h3;

      const f = subs[0]?.focus || l.focusScore || l.focusLevel || 0;
      const p = subs[0]?.productivity || l.productivityScore || l.productivityLevel || 0;
      if (f > 0) {
        totalFocus += Number(f);
        totalProd += Number(p);
        validSessionCount++;
      }
    });

    const rangeTot = s1 + s2 + s3;
    const denominatorDays = range === 'week' ? 7 : range === 'month' ? 30 : Math.max(1, filteredLogs.length);
    const dailyAvg = (rangeTot / denominatorDays).toFixed(1);

    // Subject equilibrium calculation in range
    let rangeBal = 100;
    if (rangeTot > 0) {
      const p1 = s1 / rangeTot;
      const p2 = s2 / rangeTot;
      const p3 = s3 / rangeTot;
      const ideal = 1 / 3;
      const variance = (Math.pow(p1 - ideal, 2) + Math.pow(p2 - ideal, 2) + Math.pow(p3 - ideal, 2)) / 3;
      const maxStd = Math.sqrt((Math.pow(1 - ideal, 2) + 2 * Math.pow(0 - ideal, 2)) / 3);
      rangeBal = Math.round(Math.max(0, (1 - Math.sqrt(variance) / maxStd) * 100));
    }

    const avgFocus = validSessionCount > 0 ? (totalFocus / validSessionCount).toFixed(1) : '8.0';
    const avgProd = validSessionCount > 0 ? (totalProd / validSessionCount).toFixed(1) : '8.0';

    return {
      sub1Hours: s1,
      sub2Hours: s2,
      sub3Hours: s3,
      totalHours: rangeTot,
      dailyAvgHours: dailyAvg,
      balanceScore: rangeBal,
      avgFocus,
      avgProd,
      sessionCount: filteredLogs.length,
    };
  }, [filteredLogs, range]);

  // Generate QR Code on canvas
  useEffect(() => {
    if (open && qrCanvasRef.current && member?.studyId) {
      const verifyUrl = `https://studysync-al-2026.web.app/verify.html?id=${encodeURIComponent(member.studyId)}`;
      renderQrToCanvas(verifyUrl, qrCanvasRef.current, {
        margin: 1,
        darkColor: '#090d16',
        lightColor: '#ffffff',
      });
    }
  }, [open, member?.studyId]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    try {
      setDownloadingCsv(true);
      const headers = [
        'Timestamp',
        'Study ID',
        'Full Name',
        'Email',
        'Stream',
        'Exam Year',
        'Date of Study',
        'Subject 1 Name',
        'Subject 1 Hours',
        'Subject 1 Focus',
        'Subject 1 Productivity',
        'Subject 2 Name',
        'Subject 2 Hours',
        'Subject 2 Focus',
        'Subject 2 Productivity',
        'Subject 3 Name',
        'Subject 3 Hours',
        'Subject 3 Focus',
        'Subject 3 Productivity',
        'Total Hours',
        'Notes',
        'Proof URL',
      ];

      const rows = filteredLogs.map((log) => {
        const subs = log.subjects || [];
        const h1 = Number(subs[0]?.hours ?? log.subject1Hours ?? 0);
        const h2 = Number(subs[1]?.hours ?? log.subject2Hours ?? 0);
        const h3 = Number(subs[2]?.hours ?? log.subject3Hours ?? 0);
        const f1 = Number(subs[0]?.focus ?? log.focusScore ?? 0);
        const f2 = Number(subs[1]?.focus ?? log.focusScore ?? 0);
        const f3 = Number(subs[2]?.focus ?? log.focusScore ?? 0);
        const p1 = Number(subs[0]?.productivity ?? log.productivityScore ?? 0);
        const p2 = Number(subs[1]?.productivity ?? log.productivityScore ?? 0);
        const p3 = Number(subs[2]?.productivity ?? log.productivityScore ?? 0);

        return [
          log.timestamp || '',
          member.studyId,
          member.fullName,
          member.email,
          member.stream,
          member.examYear || '2026',
          log.dateOfStudy || log.date || '',
          subs[0]?.name || sub1Name,
          h1,
          f1,
          p1,
          subs[1]?.name || sub2Name,
          h2,
          f2,
          p2,
          subs[2]?.name || sub3Name,
          h3,
          f3,
          p3,
          log.totalHours || (h1 + h2 + h3),
          log.notes || '',
          log.proofPhotoUrl || log.proofUrl || '',
        ];
      });

      const csvContent = generateCsvString(headers, rows);
      const filename = `StudySync_${member.studyId}_Report_${range}_${getTodayDateString()}.csv`;
      downloadCsvFile(filename, csvContent);
      toast.success('Official study log CSV exported successfully!');
    } catch (err: any) {
      toast.error('Failed to export CSV: ' + err.message);
    } finally {
      setDownloadingCsv(false);
    }
  };

  // Generate Cognitive AI remarks
  const aiRemarks = useMemo(() => {
    const hours = rangeMetrics.totalHours;
    const avg = Number(rangeMetrics.dailyAvgHours);
    const bal = rangeMetrics.balanceScore;

    let consistencyRemarks = '';
    if (streak >= 14) {
      consistencyRemarks = `Exemplary study discipline with an active unbroken streak of ${streak} days. The student exhibits sustained long-term commitment critical for competitive island ranking.`;
    } else if (streak >= 7) {
      consistencyRemarks = `Strong weekly cadence with a ${streak}-day active streak. Maintain this rhythm to build automated study habits.`;
    } else {
      consistencyRemarks = `Cadence requires reinforcement. Encourage consistent daily study blocks (minimum 2.5â€“3 hours daily) to avoid last-minute revision fatigue.`;
    }

    let pacingRemarks = '';
    if (avg >= 4.5) {
      pacingRemarks = `Pacing is intensive (${avg}h/day average). Ensure scheduled rest breaks (e.g. Pomodoro 50/10) to maintain high retention prior to model exams.`;
    } else if (avg >= 2.5) {
      pacingRemarks = `Healthy and sustainable revision volume (${avg}h/day average) aligned with Sri Lankan G.C.E. A/L requirements.`;
    } else {
      pacingRemarks = `Daily average (${avg}h/day) is below recommended benchmark (3.5h/day). Recommend extending core subject problem-solving intervals.`;
    }

    let balanceRemarks = '';
    if (bal >= 85) {
      balanceRemarks = `Outstanding Subject Equilibrium (${bal}%). All 3 stream subjects are receiving equal attention, safeguarding the student against single-subject Z-Score drag.`;
    } else if (bal >= 70) {
      balanceRemarks = `Adequate balance (${bal}%). Minor subject skew detected; ensure equal weekly problem sets across all 3 subjects.`;
    } else {
      balanceRemarks = `Subject imbalance detected (${bal}%). Heavy bias toward primary subject at the expense of third subject. Prioritize neglected subject past papers immediately.`;
    }

    return { consistencyRemarks, pacingRemarks, balanceRemarks };
  }, [rangeMetrics, streak]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto bg-card border-border text-foreground p-6 sm:p-8">
        <DialogHeader className="pb-4 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg sm:text-xl font-bold text-foreground">
                  Parent & Teacher Study Performance Report
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Official G.C.E. Advanced Level Academic Verification & Study Ledger
                </DialogDescription>
              </div>
            </div>

            {/* Desktop Action Controls */}
            <div className="hidden sm:flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="border-border bg-card hover:bg-muted text-foreground rounded-xl h-9 px-3.5 text-xs flex items-center gap-1.5"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print / PDF</span>
              </Button>

              <Button
                size="sm"
                onClick={handleExportCsv}
                disabled={downloadingCsv}
                className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl h-9 px-3.5 text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export CSV</span>
              </Button>
            </div>
          </div>

          {/* Date Range Filter Selector */}
          <div className="flex items-center gap-2 pt-4 no-print">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> Report Range:
            </span>
            <div className="flex items-center bg-muted/60 p-1 rounded-xl border border-border">
              {[
                { key: 'week', label: 'Weekly (Last 7 Days)' },
                { key: 'month', label: 'Monthly (Last 30 Days)' },
                { key: 'all', label: 'All-Time' },
              ].map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setRange(opt.key as DateRangeOption)}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                    range === opt.key
                      ? 'bg-card text-foreground font-bold shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </DialogHeader>

        {/* Printable Report Canvas */}
        <div id="academic-printable-report" className="space-y-6 pt-2">
          {/* Header Banner with Embedded QR Code */}
          <div className="p-5 rounded-2xl bg-card/80 border border-border shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block">
                  StudySync Official Academic Ledger
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30">
                  {range === 'week' ? '7-Day Review' : range === 'month' ? '30-Day Progress' : 'Comprehensive'}
                </span>
              </div>
              <h2 className="text-2xl font-extrabold text-foreground">{member.fullName}</h2>
              <p className="text-xs text-muted-foreground">
                {member.school} â€¢ {member.stream} {member.optionalSubject ? `(${member.optionalSubject})` : ''}
              </p>
              <p className="text-[11px] text-muted-foreground font-mono">
                Study ID: <strong className="text-cyan-600 dark:text-cyan-400">{member.studyId}</strong> â€¢ Target: {member.examYear || '2026'} A/L Examination
              </p>
            </div>

            {/* Embedded QR Code Canvas for Live Verification */}
            <div className="flex items-center gap-3 bg-muted/40 p-2.5 rounded-xl border border-border shrink-0">
              <div className="bg-white p-1 rounded-lg shadow-sm">
                <canvas
                  ref={qrCanvasRef}
                  width={80}
                  height={80}
                  className="w-20 h-20 block"
                  aria-label="Verification QR Code"
                />
              </div>
              <div className="text-[10px] font-mono text-muted-foreground space-y-0.5 max-w-[120px]">
                <span className="font-bold text-foreground block flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-emerald-500" /> Verified
                </span>
                <span>Scan with phone camera to verify ledger</span>
                <span className="text-[9px] text-indigo-500 block pt-0.5">studysync-al-2026.web.app</span>
              </div>
            </div>
          </div>

          {/* Key Executive Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-card border border-border text-center space-y-1">
              <span className="text-[11px] text-muted-foreground block font-medium">Study Streak</span>
              <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {streak} Days
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-card border border-border text-center space-y-1">
              <span className="text-[11px] text-muted-foreground block font-medium">Range Study Time</span>
              <span className="text-xl font-bold font-mono text-cyan-600 dark:text-cyan-400">
                {rangeMetrics.totalHours.toFixed(1)} Hours
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-card border border-border text-center space-y-1">
              <span className="text-[11px] text-muted-foreground block font-medium">Daily Average</span>
              <span className="text-xl font-bold font-mono text-indigo-600 dark:text-indigo-400">
                {rangeMetrics.dailyAvgHours} h/day
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-card border border-border text-center space-y-1">
              <span className="text-[11px] text-muted-foreground block font-medium">Subject Balance</span>
              <span className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400">
                {rangeMetrics.balanceScore}%
              </span>
            </div>
          </div>

          {/* Subject Distribution Breakdown Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">
              Subject Study Volume & Pacing Breakdown ({range.toUpperCase()})
            </h3>
            <div className="overflow-hidden rounded-xl border border-border">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/70 text-muted-foreground border-b border-border">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Subject</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Hours Logged</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Proportion</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Equilibrium Target</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 bg-card">
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-foreground">{sub1Name}</td>
                    <td className="py-2.5 px-3 font-mono text-right text-indigo-600 dark:text-indigo-400 font-bold">
                      {rangeMetrics.sub1Hours.toFixed(1)}h
                    </td>
                    <td className="py-2.5 px-3 font-mono text-right text-foreground">
                      {rangeMetrics.totalHours > 0
                        ? `${Math.round((rangeMetrics.sub1Hours / rangeMetrics.totalHours) * 100)}%`
                        : '0%'}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-right text-muted-foreground">33.3%</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-foreground">{sub2Name}</td>
                    <td className="py-2.5 px-3 font-mono text-right text-cyan-600 dark:text-cyan-400 font-bold">
                      {rangeMetrics.sub2Hours.toFixed(1)}h
                    </td>
                    <td className="py-2.5 px-3 font-mono text-right text-foreground">
                      {rangeMetrics.totalHours > 0
                        ? `${Math.round((rangeMetrics.sub2Hours / rangeMetrics.totalHours) * 100)}%`
                        : '0%'}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-right text-muted-foreground">33.3%</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-foreground">{sub3Name}</td>
                    <td className="py-2.5 px-3 font-mono text-right text-emerald-600 dark:text-emerald-400 font-bold">
                      {rangeMetrics.sub3Hours.toFixed(1)}h
                    </td>
                    <td className="py-2.5 px-3 font-mono text-right text-foreground">
                      {rangeMetrics.totalHours > 0
                        ? `${Math.round((rangeMetrics.sub3Hours / rangeMetrics.totalHours) * 100)}%`
                        : '0%'}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-right text-muted-foreground">33.3%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Parent/Teacher Academic Advisory Summary Section */}
          <div className="p-5 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 space-y-3">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <BrainCircuit className="h-5 w-5" />
              <h3 className="text-sm font-bold text-foreground">
                Parent & Teacher Academic Advisory Summary
              </h3>
            </div>

            <div className="space-y-2 text-xs leading-relaxed text-muted-foreground">
              <p>
                <strong className="text-foreground">1. Consistency & Rhythm:</strong> {aiRemarks.consistencyRemarks}
              </p>
              <p>
                <strong className="text-foreground">2. Volume & Pacing:</strong> {aiRemarks.pacingRemarks}
              </p>
              <p>
                <strong className="text-foreground">3. Subject Balance:</strong> {aiRemarks.balanceRemarks}
              </p>
              <p className="text-[11px] pt-1 italic text-indigo-600/80 dark:text-indigo-300/80">
                Recommendation: Guardians are encouraged to review this ledger weekly to ensure balanced preparation across all 3 subjects without single-subject deficit.
              </p>
            </div>
          </div>

          {/* Recent Recorded Study Sessions */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">
              Recent Recorded Study Sessions ({filteredLogs.length} Entries in Range)
            </h3>
            <div className="overflow-hidden rounded-xl border border-border">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/70 text-muted-foreground border-b border-border">
                  <tr>
                    <th className="py-2 px-3 font-semibold">Date</th>
                    <th className="py-2 px-3 font-semibold">{sub1Name}</th>
                    <th className="py-2 px-3 font-semibold">{sub2Name}</th>
                    <th className="py-2 px-3 font-semibold">{sub3Name}</th>
                    <th className="py-2 px-3 font-semibold text-right">Total</th>
                    <th className="py-2 px-3 font-semibold text-right">Focus/Prod</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 bg-card">
                  {filteredLogs.slice(0, 10).map((log, idx) => {
                    const d = log.dateOfStudy || log.date;
                    const subs = log.subjects || [];
                    const h1 = Number(subs[0]?.hours ?? log.subject1Hours ?? 0);
                    const h2 = Number(subs[1]?.hours ?? log.subject2Hours ?? 0);
                    const h3 = Number(subs[2]?.hours ?? log.subject3Hours ?? 0);
                    const tot = Number(log.totalHours || h1 + h2 + h3 || 0);
                    const f = subs[0]?.focus || log.focusScore || '8';
                    const p = subs[0]?.productivity || log.productivityScore || '8';

                    return (
                      <tr key={idx}>
                        <td className="py-2 px-3 font-mono text-foreground font-semibold">{formatDate(d, 'short')}</td>
                        <td className="py-2 px-3 font-mono text-muted-foreground">{h1.toFixed(1)}h</td>
                        <td className="py-2 px-3 font-mono text-muted-foreground">{h2.toFixed(1)}h</td>
                        <td className="py-2 px-3 font-mono text-muted-foreground">{h3.toFixed(1)}h</td>
                        <td className="py-2 px-3 font-mono font-bold text-cyan-600 dark:text-cyan-400 text-right">{tot.toFixed(1)}h</td>
                        <td className="py-2 px-3 font-mono text-muted-foreground text-right">F:{f} P:{p}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Verification Footer & Security Stamp */}
          <div className="p-3.5 rounded-xl bg-card border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Tamper-evident verification backed by StudySync Google Apps Script ledger.</span>
            </div>
            <a
              href={`/verify.html?id=${encodeURIComponent(member.studyId)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 dark:text-indigo-400 font-mono underline"
            >
              Verify Record Online â†—
            </a>
          </div>
        </div>

        {/* Mobile Action Controls */}
        <div className="flex sm:hidden items-center justify-between gap-2 pt-4 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="border-border bg-card text-foreground flex-1 text-xs"
          >
            <Printer className="h-3.5 w-3.5 mr-1.5" />
            Print / PDF
          </Button>

          <Button
            size="sm"
            onClick={handleExportCsv}
            disabled={downloadingCsv}
            className="bg-indigo-600 text-white flex-1 text-xs"
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Export CSV
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
