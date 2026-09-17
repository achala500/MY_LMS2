'use client';

import React, { useState, useMemo } from 'react';
import { DailyLogEntry } from '@/types/logs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { TrendingUp, Zap, RefreshCw } from 'lucide-react';

interface StudyTrendChartProps {
  logs: DailyLogEntry[];
  sub1Name: string;
  sub2Name: string;
  sub3Name: string;
  onRefresh?: () => Promise<void> | void;
  isRefreshing?: boolean;
}

interface DayData {
  dateStr: string;
  displayDate: string;
  dayName: string;
  totalHours: number;
  sub1Hours: number;
  sub2Hours: number;
  sub3Hours: number;
  focus: number;
  productivity: number;
  hasLog: boolean;
}

/**
 * Robust date normalizer that handles ISO timestamps, local dates, DD/MM/YYYY,
 * YYYY-MM-DD, and Date objects without timezone-induced day shifts.
 */
export function normalizeDateToYmd(val: any): string {
  if (!val) return '';
  if (val instanceof Date) {
    if (isNaN(val.getTime())) return '';
    const y = val.getFullYear();
    const m = String(val.getMonth() + 1).padStart(2, '0');
    const d = String(val.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  const str = String(val).trim();
  if (!str) return '';

  // Case 1: YYYY-MM-DD or YYYY/MM/DD (1 or 2 digit month/day)
  const ymdMatch = str.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (ymdMatch) {
    const y = ymdMatch[1];
    const m = ymdMatch[2].padStart(2, '0');
    const d = ymdMatch[3].padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // Case 2: DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = str.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
  if (dmyMatch) {
    const d = dmyMatch[1].padStart(2, '0');
    const m = dmyMatch[2].padStart(2, '0');
    const y = dmyMatch[3];
    return `${y}-${m}-${d}`;
  }

  // Case 3: Parseable standard date string
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const d = String(parsed.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  return str.substring(0, 10);
}

/**
 * Extracts study hours for a specific subject dynamically from sessions,
 * structured subjects, or legacy indexed fields.
 */
function extractSubjectHours(log: DailyLogEntry, targetSubName: string, fallbackIndex: number): number {
  if (!log) return 0;
  const targetLower = (targetSubName || '').toLowerCase().trim();

  // 1. Check sessions array if present (dynamic multi-session format)
  if (Array.isArray(log.sessions) && log.sessions.length > 0) {
    const sessionMatches = log.sessions.filter(
      (s) => s && s.subject && s.subject.toLowerCase().trim() === targetLower
    );
    if (sessionMatches.length > 0) {
      return sessionMatches.reduce((acc, s) => acc + (Number(s.hours) || 0), 0);
    }
  }

  // 2. Check structured subjects array
  if (Array.isArray(log.subjects) && log.subjects.length > 0) {
    if (targetLower) {
      const matched = log.subjects.find(
        (s) => s && s.name && s.name.toLowerCase().trim() === targetLower
      );
      if (matched && matched.hours !== undefined && matched.hours !== null) {
        return Number(matched.hours) || 0;
      }
    }
    // Fallback to positional index if name match failed
    if (fallbackIndex >= 0 && fallbackIndex < log.subjects.length) {
      const posSub = log.subjects[fallbackIndex];
      if (posSub && posSub.hours !== undefined && posSub.hours !== null) {
        return Number(posSub.hours) || 0;
      }
    }
  }

  // 3. Fallback to flat column properties
  if (fallbackIndex === 0) {
    return Number(log.subject1Hours ?? log.hoursSubject1 ?? 0);
  } else if (fallbackIndex === 1) {
    return Number(log.subject2Hours ?? log.hoursSubject2 ?? 0);
  } else if (fallbackIndex === 2) {
    return Number(log.subject3Hours ?? log.hoursSubject3 ?? 0);
  }

  return 0;
}

export function StudyTrendChart({
  logs = [],
  sub1Name,
  sub2Name,
  sub3Name,
  onRefresh,
  isRefreshing = false,
}: StudyTrendChartProps) {
  const [daysCount, setDaysCount] = useState<7 | 14 | 30>(7);
  const [hoveredDay, setHoveredDay] = useState<DayData | null>(null);

  // Generate data points for the last N days (including days with 0 hours)
  const chartData = useMemo<DayData[]>(() => {
    const result: DayData[] = [];
    const now = new Date();

    for (let i = daysCount - 1; i >= 0; i--) {
      // Local calendar date arithmetic to avoid UTC offset drift
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const displayDate = formatDate(dateStr, 'short');

      // Find all logs matching this local date
      const matchedLogs = (logs || []).filter((l) => {
        const logDateStr = normalizeDateToYmd(l.dateOfStudy || l.date || l.Date);
        return logDateStr === dateStr;
      });

      if (matchedLogs.length > 0) {
        let tot = 0;
        let h1 = 0;
        let h2 = 0;
        let h3 = 0;
        let focusSum = 0;
        let prodSum = 0;
        let scoreCount = 0;

        for (const log of matchedLogs) {
          const sub1H = extractSubjectHours(log, sub1Name, 0);
          const sub2H = extractSubjectHours(log, sub2Name, 1);
          const sub3H = extractSubjectHours(log, sub3Name, 2);

          let logTotal = Number(log.totalHours || log.total || 0);
          if (logTotal <= 0) {
            logTotal = sub1H + sub2H + sub3H;
          }

          tot += logTotal;
          h1 += sub1H;
          h2 += sub2H;
          h3 += sub3H;

          const f = Number(log.focusScore ?? log.focusLevel ?? log.avgFocus ?? 0);
          const p = Number(log.productivityScore ?? log.productivityLevel ?? log.avgProductivity ?? 0);
          if (f > 0) {
            focusSum += f;
            scoreCount++;
          }
          if (p > 0) {
            prodSum += p;
          }
        }

        const avgF = scoreCount > 0 ? Math.round(focusSum / scoreCount) : 0;
        const avgP = scoreCount > 0 ? Math.round(prodSum / scoreCount) : 0;

        result.push({
          dateStr,
          displayDate,
          dayName,
          totalHours: Math.round(tot * 10) / 10,
          sub1Hours: Math.round(h1 * 10) / 10,
          sub2Hours: Math.round(h2 * 10) / 10,
          sub3Hours: Math.round(h3 * 10) / 10,
          focus: avgF,
          productivity: avgP,
          hasLog: true,
        });
      } else {
        result.push({
          dateStr,
          displayDate,
          dayName,
          totalHours: 0,
          sub1Hours: 0,
          sub2Hours: 0,
          sub3Hours: 0,
          focus: 0,
          productivity: 0,
          hasLog: false,
        });
      }
    }

    return result;
  }, [logs, daysCount, sub1Name, sub2Name, sub3Name]);

  // Compute scale max (at least 4 hours for nice headroom)
  const maxHours = useMemo(() => {
    const highest = Math.max(...chartData.map((d) => d.totalHours), 0);
    return Math.max(Math.ceil(highest + 1), 4);
  }, [chartData]);

  const totalPeriodHours = useMemo(() => {
    return chartData.reduce((sum, d) => sum + d.totalHours, 0);
  }, [chartData]);

  const avgDailyHours = (totalPeriodHours / daysCount).toFixed(1);

  // SVG dimensions
  const svgWidth = 640;
  const svgHeight = 220;
  const paddingLeft = 36;
  const paddingRight = 16;
  const paddingTop = 20;
  const paddingBottom = 30;
  const plotWidth = svgWidth - paddingLeft - paddingRight;
  const plotHeight = svgHeight - paddingTop - paddingBottom;

  // Compute curve coordinates
  const points = chartData.map((d, index) => {
    const x = paddingLeft + (index / (chartData.length - 1)) * plotWidth;
    const y = paddingTop + plotHeight - (d.totalHours / maxHours) * plotHeight;
    return { x, y, data: d };
  });

  // Generate SVG path for smooth curve
  const pathD = useMemo(() => {
    if (points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cx = (p0.x + p1.x) / 2;
      d += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return d;
  }, [points]);

  const areaD = useMemo(() => {
    if (points.length === 0) return '';
    const bottomY = paddingTop + plotHeight;
    const firstX = points[0].x;
    const lastX = points[points.length - 1].x;
    return `${pathD} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }, [pathD, points, plotHeight, paddingTop]);

  return (
    <div className="rounded-xl border border-[#E5DDD0] dark:border-white/[0.08] bg-[#F5F1E9] dark:bg-[#17201D] shadow-sm overflow-hidden p-5 sm:p-6">
      <div className="pb-4 border-b border-[#E5DDD0] dark:border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#C85A32]/10 text-[#C85A32]">
              <TrendingUp className="h-4 w-4" strokeWidth={1.5} />
            </div>
            <h3 className="text-base sm:text-lg font-serif text-[#132219] dark:text-[#F2EFE9]">
              Study Volume & Session Trends
            </h3>
          </div>
          <p className="text-xs text-[#697D72] dark:text-[#8E9A90] mt-0.5">
            Visualizing daily effort, intensity, and subject allocation
          </p>
        </div>

        {/* View Range Switcher, Refresh & Summary Pill */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#EFE9DF]/80 dark:bg-white/[0.04] border border-[#E5DDD0] dark:border-white/[0.08] text-[11px] font-mono text-[#132219] dark:text-[#F2EFE9]">
            <span className="text-[#697D72] dark:text-[#8E9A90]">Period Avg:</span>
            <span className="font-bold text-[#C85A32]">{avgDailyHours}h / day</span>
          </div>

          <div className="flex items-center rounded-lg bg-[#EFE9DF] dark:bg-white/[0.04] p-0.5 border border-[#E5DDD0] dark:border-white/[0.08] gap-0.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDaysCount(7)}
              className={`h-7 px-2.5 text-xs rounded-md transition-all font-mono ${
                daysCount === 7
                  ? 'bg-[#132219] dark:bg-[#F2EFE9] text-[#FBF9F5] dark:text-[#132219] font-semibold shadow-xs'
                  : 'text-[#697D72] dark:text-[#8E9A90] hover:text-[#132219] dark:hover:text-[#F2EFE9]'
              }`}
            >
              7D
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDaysCount(14)}
              className={`h-7 px-2.5 text-xs rounded-md transition-all font-mono ${
                daysCount === 14
                  ? 'bg-[#132219] dark:bg-[#F2EFE9] text-[#FBF9F5] dark:text-[#132219] font-semibold shadow-xs'
                  : 'text-[#697D72] dark:text-[#8E9A90] hover:text-[#132219] dark:hover:text-[#F2EFE9]'
              }`}
            >
              14D
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDaysCount(30)}
              className={`h-7 px-2.5 text-xs rounded-md transition-all font-mono ${
                daysCount === 30
                  ? 'bg-[#132219] dark:bg-[#F2EFE9] text-[#FBF9F5] dark:text-[#132219] font-semibold shadow-xs'
                  : 'text-[#697D72] dark:text-[#8E9A90] hover:text-[#132219] dark:hover:text-[#F2EFE9]'
              }`}
            >
              30D
            </Button>
          </div>

          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="h-8 w-8 p-0 rounded-lg bg-[#EFE9DF] dark:bg-white/[0.04] border border-[#E5DDD0] dark:border-white/[0.08] text-[#697D72] hover:text-[#132219] transition-colors cursor-pointer"
              title="Refresh latest study data from Google Sheets"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-[#C85A32]' : ''}`} />
            </Button>
          )}
        </div>
      </div>

      <div className="pt-4">
        {/* SVG Curve Chart */}
        <div className="relative w-full overflow-x-auto select-none">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto min-w-[500px]"
          >
            <defs>
              {/* Area Gradient */}
              <linearGradient id="trendAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C85A32" stopOpacity="0.18" />
                <stop offset="70%" stopColor="#C85A32" stopOpacity="0.04" />
                <stop offset="100%" stopColor="#C85A32" stopOpacity="0.0" />
              </linearGradient>

              {/* Line Gradient */}
              <linearGradient id="trendLineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#C85A32" />
                <stop offset="50%" stopColor="#C85A32" />
                <stop offset="100%" stopColor="#2D5A43" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid Lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((fraction, idx) => {
              const y = paddingTop + plotHeight * (1 - fraction);
              const val = (maxHours * fraction).toFixed(fraction === 0 ? 0 : 1);
              return (
                <g key={idx}>
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={svgWidth - paddingRight}
                    y2={y}
                    stroke="rgba(105, 125, 114, 0.2)"
                    strokeDasharray={fraction > 0 && fraction < 1 ? '4 4' : '0'}
                  />
                  <text
                    x={paddingLeft - 8}
                    y={y + 3}
                    textAnchor="end"
                    className="fill-[#697D72] dark:fill-[#8E9A90] text-[10px] font-mono"
                  >
                    {val}h
                  </text>
                </g>
              );
            })}

            {/* Filled Area */}
            <path d={areaD} fill="url(#trendAreaGradient)" />

            {/* Main Smooth Line */}
            <path
              d={pathD}
              fill="none"
              stroke="url(#trendLineGradient)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Interactive Data Points & Hover Zones */}
            {points.map((pt, idx) => {
              const isHovered = hoveredDay?.dateStr === pt.data.dateStr;
              return (
                <g key={idx} className="cursor-pointer">
                  {/* Vertical Guide Line on Hover */}
                  {isHovered && (
                    <line
                      x1={pt.x}
                      y1={paddingTop}
                      x2={pt.x}
                      y2={paddingTop + plotHeight}
                      stroke="rgba(200, 90, 50, 0.4)"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                    />
                  )}

                  {/* Outer Ring */}
                  {pt.data.hasLog && (
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? 6 : 4}
                      fill="#F5F1E9"
                      stroke={isHovered ? '#C85A32' : '#2D5A43'}
                      strokeWidth={isHovered ? 2.5 : 1.5}
                      className="transition-all duration-150"
                    />
                  )}

                  {/* Date Label on X Axis */}
                  {(daysCount === 7 ||
                    (daysCount === 14 ? idx % 2 === 0 : idx % 5 === 0 || idx === chartData.length - 1)) && (
                    <text
                      x={pt.x}
                      y={svgHeight - 10}
                      textAnchor="middle"
                      className={`text-[10px] font-mono transition-colors ${
                        isHovered
                          ? 'fill-[#C85A32] font-bold'
                          : pt.data.hasLog
                          ? 'fill-[#132219] dark:fill-[#F2EFE9]'
                          : 'fill-[#697D72] dark:fill-[#8E9A90]'
                      }`}
                    >
                      {daysCount === 7 ? `${pt.data.dayName}` : pt.data.displayDate.split(' ')[0]}
                    </text>
                  )}

                  {/* Invisible broad hitbox for easy touch/mouse hover */}
                  <rect
                    x={pt.x - plotWidth / (chartData.length * 2)}
                    y={0}
                    width={plotWidth / chartData.length}
                    height={svgHeight}
                    fill="transparent"
                    onMouseEnter={() => setHoveredDay(pt.data)}
                    onMouseLeave={() => setHoveredDay(null)}
                  />
                </g>
              );
            })}
          </svg>

          {/* Hover Floating Details Card */}
          {hoveredDay && (
            <div className="mt-3 p-3 rounded-lg bg-[#FBF9F5] dark:bg-[#111614] border border-[#E5DDD0] dark:border-white/[0.1] shadow-md flex flex-wrap items-center justify-between gap-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-serif font-medium text-[#132219] dark:text-[#F2EFE9]">
                    {hoveredDay.displayDate} ({hoveredDay.dayName})
                  </span>
                  {hoveredDay.hasLog ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-[#2D5A43]/10 text-[#2D5A43] dark:text-[#A3B5AA] border border-[#2D5A43]/20">
                      Logged
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#EFE9DF] text-[#697D72]">
                      No Session
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#697D72] dark:text-[#8E9A90] font-mono">
                  Total Effort: <span className="font-bold text-[#132219] dark:text-[#F2EFE9]">{hoveredDay.totalHours.toFixed(1)} hours</span>
                </p>
              </div>

              {hoveredDay.hasLog && (
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#EFE9DF]/80 dark:bg-white/[0.04] border border-[#E5DDD0] dark:border-white/[0.08]">
                    <span className="text-[11px] text-[#2D5A43] font-serif">{sub1Name}:</span>
                    <span className="font-mono font-bold text-[#132219] dark:text-[#F2EFE9]">{hoveredDay.sub1Hours.toFixed(1)}h</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#EFE9DF]/80 dark:bg-white/[0.04] border border-[#E5DDD0] dark:border-white/[0.08]">
                    <span className="text-[11px] text-[#C85A32] font-serif">{sub2Name}:</span>
                    <span className="font-mono font-bold text-[#132219] dark:text-[#F2EFE9]">{hoveredDay.sub2Hours.toFixed(1)}h</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#EFE9DF]/80 dark:bg-white/[0.04] border border-[#E5DDD0] dark:border-white/[0.08]">
                    <span className="text-[11px] text-[#9C6328] font-serif">{sub3Name}:</span>
                    <span className="font-mono font-bold text-[#132219] dark:text-[#F2EFE9]">{hoveredDay.sub3Hours.toFixed(1)}h</span>
                  </div>

                  {(hoveredDay.focus > 0 || hoveredDay.productivity > 0) && (
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#EFE9DF] text-[#132219] text-[11px] font-mono">
                      <Zap className="h-3 w-3 text-[#C85A32]" />
                      <span>F:{hoveredDay.focus} | P:{hoveredDay.productivity}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#E5DDD0] dark:border-white/[0.08] mt-2 text-[11px] text-[#697D72] dark:text-[#8E9A90]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-serif">
              <span className="h-2 w-2 rounded-full bg-[#2D5A43]" />
              <span>{sub1Name}</span>
            </span>
            <span className="flex items-center gap-1.5 font-serif">
              <span className="h-2 w-2 rounded-full bg-[#C85A32]" />
              <span>{sub2Name}</span>
            </span>
            <span className="flex items-center gap-1.5 font-serif">
              <span className="h-2 w-2 rounded-full bg-[#9C6328]" />
              <span>{sub3Name}</span>
            </span>
          </div>

          <span className="text-[#697D72] dark:text-[#8E9A90] font-mono text-[10px]">
            Hover data points for per-subject breakdown
          </span>
        </div>
      </div>
    </div>
  );
}
