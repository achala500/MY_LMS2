'use client';

import React, { useMemo } from 'react';
import { DailyLogEntry } from '@/types/logs';
import { extractLogDate, extractLogHours } from '@/lib/utils';
import { Flame, Calendar } from 'lucide-react';

interface StudyHeatmapProps {
  logs: DailyLogEntry[];
  streakCount?: number;
}

export function StudyHeatmap({ logs, streakCount = 0 }: StudyHeatmapProps) {
  // Generate 12 weeks (84 days) leading up to today
  const { weeks, totalHours } = useMemo(() => {
    const hoursByDate: Record<string, number> = {};
    for (const log of logs) {
      const d = extractLogDate(log);
      if (d) {
        hoursByDate[d] = (hoursByDate[d] || 0) + extractLogHours(log);
      }
    }

    const today = new Date();
    const totalDays = 12 * 7;
    const days: { dateStr: string; dayName: string; hours: number; isToday: boolean }[] = [];

    for (let i = totalDays - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${day}`;

      days.push({
        dateStr,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        hours: +(hoursByDate[dateStr] || 0).toFixed(1),
        isToday: i === 0,
      });
    }

    const weekChunks: typeof days[] = [];
    for (let w = 0; w < 12; w++) {
      weekChunks.push(days.slice(w * 7, (w + 1) * 7));
    }

    let tot = 0;
    Object.values(hoursByDate).forEach((h) => {
      tot += h;
    });

    return { weeks: weekChunks, totalHours: tot.toFixed(1) };
  }, [logs]);

  const getColorClass = (hours: number) => {
    if (hours === 0) return 'bg-[#f3ede9] hover:border-[#19202e]/30';
    if (hours < 2.0) return 'bg-[#ffdcbc] border-[#f5b88c]';
    if (hours < 4.5) return 'bg-[#fa8b60] border-[#c85a32]';
    if (hours < 7.0) return 'bg-[#c85a32] text-white border-[#b04b25]';
    return 'bg-[#7c2d12] text-white border-[#541c0b] shadow-xs';
  };

  return (
    <div className="w-full rounded-2xl bg-[#ffffff] border border-[#e7e1de] p-5 sm:p-6 shadow-sm space-y-4">
      {/* Header with Streak & Stats */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-[#f3ede9]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#fa7268]/15 text-[#c85a32] flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#1d1b19]">Activity Heatmap</h3>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fef0ea] border border-[#fbd8c7] text-[#c85a32] font-semibold">
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>{streakCount} Day Streak</span>
          </div>

          <div className="hidden sm:flex items-center gap-1 px-3 py-1 rounded-full bg-[#f3ede9] text-[#2d2420]">
            <span>{totalHours}h</span>
            <span className="text-[10px] text-[#4a3b35]">logged</span>
          </div>
        </div>
      </div>

      {/* 7-row x 12-column Heatmap Grid */}
      <div className="overflow-x-auto pb-2 scrollbar-none">
        <div className="min-w-[480px]">
          <div className="flex gap-2">
            {/* Day of week labels */}
            <div className="flex flex-col gap-1.5 justify-between py-1 text-[10px] font-mono text-[#4a3b35] pr-1 select-none">
              <span>M</span>
              <span>W</span>
              <span>F</span>
              <span>S</span>
            </div>

            {/* 12 Week Columns */}
            <div className="flex gap-1.5 flex-1 justify-between">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-1.5 flex-1">
                  {week.map((day) => (
                    <div
                      key={day.dateStr}
                      className="group relative"
                    >
                      <div
                        className={`w-full aspect-square rounded-[5px] border transition-all cursor-pointer ${getColorClass(
                          day.hours
                        )} ${day.isToday ? 'ring-2 ring-[#c85a32] ring-offset-1' : ''}`}
                      />

                      {/* Tooltip Card */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center pointer-events-none z-30">
                        <div className="px-2.5 py-1.5 rounded-lg bg-[#19202e] text-white text-[10px] font-mono whitespace-nowrap shadow-xl">
                          <div className="font-bold text-[#fcd34d]">{day.hours} hrs</div>
                          <div className="text-gray-300 text-[9px]">{day.dateStr}</div>
                        </div>
                        <div className="w-2 h-1 bg-[#19202e] rotate-45 -mt-0.5" />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Scale Legend */}
          <div className="flex items-center justify-between pt-3 text-[11px] font-mono text-[#4a3b35]">
            <span className="text-[10px]">12 weeks ago</span>
            <div className="flex items-center gap-1.5">
              <span>Less</span>
              <span className="w-3 h-3 rounded-[3px] bg-[#f3ede9] border border-[#e7e1de]" />
              <span className="w-3 h-3 rounded-[3px] bg-[#ffdcbc] border border-[#f5b88c]" />
              <span className="w-3 h-3 rounded-[3px] bg-[#fa8b60] border border-[#c85a32]" />
              <span className="w-3 h-3 rounded-[3px] bg-[#c85a32] border border-[#b04b25]" />
              <span className="w-3 h-3 rounded-[3px] bg-[#7c2d12] border border-[#541c0b]" />
              <span>More</span>
            </div>
            <span className="text-[10px]">Today</span>
          </div>
        </div>
      </div>
    </div>
  );
}
