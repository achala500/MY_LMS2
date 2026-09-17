'use client';

import React from 'react';
import { DailyLogEntry, StudySession } from '@/types/logs';
import { cn } from '@/lib/utils';
import { Clock } from 'lucide-react';

export interface SessionBadgesProps {
  log: DailyLogEntry;
  sessions?: StudySession[];
  maxVisible?: number;
  size?: 'sm' | 'md';
  onBadgeClick?: (session?: StudySession, log?: DailyLogEntry) => void;
  className?: string;
  showTimeRange?: boolean;
}

export function getSubjectBadgeConfig(subjectName: string): {
  abbr: string;
  fullName: string;
  badgeClass: string;
  dotColor: string;
  borderColor: string;
  hex: string;
} {
  const normalized = (subjectName || '').trim().toLowerCase();

  if (normalized.includes('bio')) {
    return {
      abbr: 'Bio',
      fullName: 'Biology',
      badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25',
      dotColor: 'bg-emerald-400',
      borderColor: 'border-emerald-500/30',
      hex: '#10b981',
    };
  }
  if (normalized.includes('math') || normalized.includes('comb')) {
    return {
      abbr: 'Maths',
      fullName: 'Combined Maths',
      badgeClass: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/25',
      dotColor: 'bg-indigo-400',
      borderColor: 'border-indigo-500/30',
      hex: '#6366f1',
    };
  }
  if (normalized.includes('phys')) {
    return {
      abbr: 'Phys',
      fullName: 'Physics',
      badgeClass: 'bg-purple-500/15 text-purple-300 border-purple-500/30 hover:bg-purple-500/25',
      dotColor: 'bg-purple-400',
      borderColor: 'border-purple-500/30',
      hex: '#a855f7',
    };
  }
  if (normalized.includes('chem')) {
    return {
      abbr: 'Chem',
      fullName: 'Chemistry',
      badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/25',
      dotColor: 'bg-amber-400',
      borderColor: 'border-amber-500/30',
      hex: '#f59e0b',
    };
  }
  if (normalized.includes('ict') || normalized.includes('info') || normalized.includes('tech')) {
    return {
      abbr: 'ICT',
      fullName: 'ICT',
      badgeClass: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/25',
      dotColor: 'bg-cyan-400',
      borderColor: 'border-cyan-500/30',
      hex: '#06b6d4',
    };
  }
  if (normalized.includes('agri')) {
    return {
      abbr: 'Agri',
      fullName: 'Agriculture',
      badgeClass: 'bg-lime-500/15 text-lime-300 border-lime-500/30 hover:bg-lime-500/25',
      dotColor: 'bg-lime-400',
      borderColor: 'border-lime-500/30',
      hex: '#84cc16',
    };
  }

  const shortName = subjectName ? (subjectName.length > 5 ? subjectName.slice(0, 4) : subjectName) : 'Sub';
  return {
    abbr: shortName,
    fullName: subjectName || 'Other Subject',
    badgeClass: 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700/80',
    dotColor: 'bg-zinc-400',
    borderColor: 'border-zinc-700',
    hex: '#71717a',
  };
}

export function SessionBadges({
  log,
  sessions: explicitSessions,
  maxVisible = 3,
  size = 'sm',
  onBadgeClick,
  className,
  showTimeRange = false,
}: SessionBadgesProps) {
  // Extract session entries from log with full fallback logic
  const items: Array<{
    id: string;
    subject: string;
    hours: number;
    startTime?: string;
    endTime?: string;
    focus?: number;
    notes?: string;
    topic?: string;
    sessionObj?: StudySession;
  }> = React.useMemo(() => {
    if (explicitSessions && explicitSessions.length > 0) {
      return explicitSessions
        .filter((s) => Number(s.hours) > 0)
        .map((s, idx) => ({
          id: s.id || `sess_${idx}`,
          subject: s.subject || 'Subject',
          hours: Number(s.hours) || 0,
          startTime: s.startTime,
          endTime: s.endTime,
          focus: s.focus,
          notes: s.notes,
          topic: s.topic,
          sessionObj: s,
        }));
    }

    if (log && log.sessions && Array.isArray(log.sessions) && log.sessions.length > 0) {
      return log.sessions
        .filter((s) => Number(s.hours) > 0)
        .map((s, idx) => ({
          id: s.id || `sess_${idx}`,
          subject: s.subject || 'Subject',
          hours: Number(s.hours) || 0,
          startTime: s.startTime,
          endTime: s.endTime,
          focus: s.focus,
          notes: s.notes,
          topic: s.topic,
          sessionObj: s,
        }));
    }

    if (log && log.subjects && Array.isArray(log.subjects) && log.subjects.length > 0) {
      return log.subjects
        .filter((s) => Number(s.hours) > 0)
        .map((s, idx) => ({
          id: `sub_${idx}`,
          subject: s.name,
          hours: Number(s.hours),
          focus: s.focus,
        }));
    }

    // Scalar fallbacks
    const fallbackList = [];
    const h1 = Number(log?.subject1Hours ?? log?.hoursSubject1 ?? 0);
    const h2 = Number(log?.subject2Hours ?? log?.hoursSubject2 ?? 0);
    const h3 = Number(log?.subject3Hours ?? log?.hoursSubject3 ?? 0);

    if (h1 > 0) fallbackList.push({ id: 's1', subject: log?.subject1 || 'Subject 1', hours: h1 });
    if (h2 > 0) fallbackList.push({ id: 's2', subject: log?.subject2 || 'Subject 2', hours: h2 });
    if (h3 > 0) fallbackList.push({ id: 's3', subject: log?.subject3 || 'Subject 3', hours: h3 });

    return fallbackList;
  }, [log, explicitSessions]);

  if (items.length === 0) {
    return (
      <span className="text-[11px] text-zinc-500 font-mono italic">
        No sessions
      </span>
    );
  }

  const visibleItems = items.slice(0, maxVisible);
  const remainingCount = items.length - maxVisible;

  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
      {visibleItems.map((item) => {
        const config = getSubjectBadgeConfig(item.subject);
        const timeStr = item.startTime && item.endTime ? `${item.startTime}–${item.endTime}` : '';
        const titleText = `${config.fullName}: ${item.hours.toFixed(1)}h${
          item.focus ? ` (Focus: ${item.focus}/10)` : ''
        }${timeStr ? ` [${timeStr}]` : ''}${item.topic ? ` - ${item.topic}` : ''}`;

        return (
          <button
            key={item.id}
            type="button"
            title={titleText}
            onClick={() => onBadgeClick?.(item.sessionObj, log)}
            className={cn(
              'inline-flex items-center gap-1 font-mono font-medium rounded-md border transition-all duration-150',
              config.badgeClass,
              size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
              onBadgeClick ? 'cursor-pointer active:scale-95' : 'cursor-default'
            )}
          >
            <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', config.dotColor)} />
            <span className="font-semibold">{config.abbr}:</span>
            <span>{item.hours.toFixed(1)}h</span>
            {showTimeRange && timeStr && (
              <span className="text-[10px] opacity-75 hidden sm:inline-flex items-center gap-0.5 ml-0.5">
                <Clock className="h-2.5 w-2.5" />
                {timeStr}
              </span>
            )}
          </button>
        );
      })}

      {remainingCount > 0 && (
        <button
          type="button"
          onClick={() => onBadgeClick?.(undefined, log)}
          className={cn(
            'inline-flex items-center rounded-md border border-zinc-700 bg-zinc-800/80 text-zinc-300 font-mono font-medium hover:bg-zinc-700 transition-colors',
            size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-xs',
            onBadgeClick ? 'cursor-pointer active:scale-95' : 'cursor-default'
          )}
          title={`${remainingCount} more session${remainingCount > 1 ? 's' : ''}`}
        >
          +{remainingCount} more
        </button>
      )}
    </div>
  );
}
