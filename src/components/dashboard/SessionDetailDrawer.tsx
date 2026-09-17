'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { DailyLogEntry, StudySession } from '@/types/logs';
import { formatDate } from '@/lib/utils';
import { getSubjectBadgeConfig } from '@/components/dashboard/SessionBadges';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Clock,
  Zap,
  Target,
  Sparkles,
  Image as ImageIcon,
  FileText,
  CheckCircle2,
  BookOpen,
  Layers,
  X,
  ExternalLink,
} from 'lucide-react';

export interface SessionDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  log: DailyLogEntry | null;
  studentName?: string;
  streamName?: string;
  onViewProof?: (url: string) => void;
}

export function SessionDetailDrawer({
  open,
  onOpenChange,
  log,
  studentName,
  streamName,
  onViewProof,
}: SessionDetailDrawerProps) {
  if (!log) return null;

  const dateStr = log.dateOfStudy || log.date;
  const formattedDate = formatDate(dateStr || '', 'long');

  // Normalize sessions array with comprehensive fallback synthesis
  const sessions: StudySession[] = React.useMemo(() => {
    if (log.sessions && Array.isArray(log.sessions) && log.sessions.length > 0) {
      return log.sessions.filter((s) => Number(s.hours) > 0);
    }

    if (log.subjects && Array.isArray(log.subjects) && log.subjects.length > 0) {
      return log.subjects
        .filter((s) => Number(s.hours) > 0)
        .map((s, idx) => ({
          id: `synth_${idx}`,
          subject: s.name,
          hours: Number(s.hours),
          focus: s.focus || log.focusScore || 8,
          productivity: s.productivity || log.productivityScore || 8,
        }));
    }

    // Scalar subject fallbacks
    const synthList: StudySession[] = [];
    const h1 = Number(log.subject1Hours ?? log.hoursSubject1 ?? 0);
    const h2 = Number(log.subject2Hours ?? log.hoursSubject2 ?? 0);
    const h3 = Number(log.subject3Hours ?? log.hoursSubject3 ?? 0);

    if (h1 > 0) {
      synthList.push({
        id: 's1',
        subject: log.subject1 || 'Subject 1',
        hours: h1,
        focus: log.focusScore || 8,
        productivity: log.productivityScore || 8,
      });
    }
    if (h2 > 0) {
      synthList.push({
        id: 's2',
        subject: log.subject2 || 'Subject 2',
        hours: h2,
        focus: log.focusScore || 8,
        productivity: log.productivityScore || 8,
      });
    }
    if (h3 > 0) {
      synthList.push({
        id: 's3',
        subject: log.subject3 || 'Subject 3',
        hours: h3,
        focus: log.focusScore || 8,
        productivity: log.productivityScore || 8,
      });
    }

    return synthList;
  }, [log]);

  const totalHours = Number(log.totalHours || sessions.reduce((acc, s) => acc + (Number(s.hours) || 0), 0)).toFixed(1);
  const avgFocus = log.focusScore || log.focusLevel || Math.round(
    sessions.reduce((acc, s) => acc + (s.focus || 8), 0) / (sessions.length || 1)
  );
  const avgProd = log.productivityScore || log.productivityLevel || Math.round(
    sessions.reduce((acc, s) => acc + (s.productivity || 8), 0) / (sessions.length || 1)
  );

  const proofUrl = log.proofPhotoUrl || log.proofUrl || log.photoProofUrl || log.proofImage;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6 bg-zinc-950 border border-zinc-800 shadow-2xl rounded-2xl">
        <DialogHeader className="space-y-2 pb-4 border-b border-zinc-800/80">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Study Session Breakdown
            </span>
            {streamName && <span className="text-xs text-zinc-400">{streamName}</span>}
          </div>

          <DialogTitle className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5 font-display">
            <Calendar className="h-5 w-5 text-indigo-400 shrink-0" />
            <span>{formattedDate}</span>
          </DialogTitle>

          <DialogDescription className="text-xs sm:text-sm text-zinc-400">
            Full session breakdown, timestamps, and focus ratings for this study day.
          </DialogDescription>
        </DialogHeader>

        {/* 1. Day Summary Bento */}
        <div className="grid grid-cols-3 gap-3 py-2">
          <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-center space-y-0.5">
            <span className="text-[11px] text-zinc-400 font-medium">Total Time</span>
            <div className="text-lg sm:text-xl font-extrabold text-white font-mono">{totalHours}h</div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-center space-y-0.5">
            <span className="text-[11px] text-zinc-400 font-medium">Sessions</span>
            <div className="text-lg sm:text-xl font-extrabold text-cyan-400 font-mono">{sessions.length}</div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-center space-y-0.5">
            <span className="text-[11px] text-zinc-400 font-medium">Focus / Energy</span>
            <div className="text-lg sm:text-xl font-extrabold text-emerald-400 font-mono">
              {avgFocus}/10
            </div>
          </div>
        </div>

        {/* 2. Individual Sessions List */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-indigo-400" />
              <span>Logged Sessions ({sessions.length})</span>
            </h4>
          </div>

          {sessions.length === 0 ? (
            <div className="p-6 rounded-xl bg-zinc-900/40 border border-zinc-800 text-center text-xs text-zinc-400">
              No session details recorded for this date.
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session, index) => {
                const config = getSubjectBadgeConfig(session.subject);
                const hasTime = session.startTime && session.endTime;

                return (
                  <div
                    key={session.id || index}
                    className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800/90 hover:border-zinc-700 transition-all space-y-2.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: config.hex }} />
                        <span className="text-sm font-bold text-white">{session.subject}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${config.badgeClass}`}
                        >
                          {config.abbr}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {hasTime && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono bg-zinc-800 text-zinc-300 border border-zinc-700">
                            <Clock className="h-3 w-3 text-cyan-400" />
                            {session.startTime} – {session.endTime}
                          </span>
                        )}
                        <span className="text-xs font-mono font-bold text-indigo-300 bg-indigo-950/50 px-2.5 py-0.5 rounded-full border border-indigo-800/50">
                          {Number(session.hours || 0).toFixed(1)} hrs
                        </span>
                      </div>
                    </div>

                    {/* Topic and Focus Indicators */}
                    <div className="flex flex-wrap items-center gap-3 text-xs pt-1 border-t border-zinc-800/60">
                      {session.topic && (
                        <div className="flex items-center gap-1 text-zinc-300 font-medium">
                          <BookOpen className="h-3.5 w-3.5 text-amber-400" />
                          <span>{session.topic}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 ml-auto">
                        <span className="text-[11px] text-zinc-400">
                          Focus: <strong className="text-white font-mono">{session.focus || 8}/10</strong>
                        </span>
                        <span className="text-zinc-600">•</span>
                        <span className="text-[11px] text-zinc-400">
                          Productivity: <strong className="text-white font-mono">{session.productivity || 8}/10</strong>
                        </span>
                      </div>
                    </div>

                    {/* Individual Session Notes */}
                    {session.notes && (
                      <div className="p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800 text-xs text-zinc-300 leading-relaxed italic">
                        &ldquo;{session.notes}&rdquo;
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 3. Overall Daily Notes */}
        {log.notes && (
          <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/80 space-y-1.5">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-indigo-400" />
              <span>Overall Day Remarks</span>
            </h4>
            <p className="text-xs text-zinc-300 leading-relaxed">&ldquo;{log.notes}&rdquo;</p>
          </div>
        )}

        {/* 4. Study Proof Photo Preview */}
        {proofUrl && (
          <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="h-3.5 w-3.5 text-emerald-400" />
                <span>Uploaded Study Proof</span>
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewProof?.(proofUrl)}
                className="h-7 text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer"
              >
                <ExternalLink className="h-3 w-3 mr-1" /> View Full Resolution
              </Button>
            </div>

            <div
              onClick={() => onViewProof?.(proofUrl)}
              className="h-36 rounded-lg border border-zinc-800 overflow-hidden bg-zinc-950 cursor-pointer hover:border-indigo-500/50 transition-all flex items-center justify-center relative group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={proofUrl}
                alt="Study proof thumbnail"
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-xs font-medium text-white bg-zinc-900/80 px-2.5 py-1 rounded-md border border-zinc-700">
                  Click to Zoom
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 5. Footer */}
        <div className="pt-2 flex justify-end">
          <Button
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto h-11 px-6 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium cursor-pointer"
          >
            Close Details
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
