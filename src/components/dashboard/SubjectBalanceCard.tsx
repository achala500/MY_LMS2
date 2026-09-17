'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Scale, Award, AlertTriangle, CheckCircle2, Sparkles, ArrowRight, Lightbulb } from 'lucide-react';

interface SubjectBalanceCardProps {
  sub1Name: string;
  sub1Hours: number;
  sub2Name: string;
  sub2Hours: number;
  sub3Name: string;
  sub3Hours: number;
}

export function SubjectBalanceCard({
  sub1Name,
  sub1Hours,
  sub2Name,
  sub2Hours,
  sub3Name,
  sub3Hours,
}: SubjectBalanceCardProps) {
  const totalHours = sub1Hours + sub2Hours + sub3Hours;

  const { score, level, color, badgeClass, recommendation, lowestSubject, highestSubject, p1, p2, p3 } =
    useMemo(() => {
      if (totalHours <= 0) {
        return {
          score: 100,
          level: 'Optimal Equilibrium',
          color: 'text-emerald-400',
          badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          recommendation: 'Start your study streak today! Distribute your time equally across all 3 subjects.',
          lowestSubject: sub1Name,
          highestSubject: sub1Name,
          p1: 33.3,
          p2: 33.3,
          p3: 33.3,
        };
      }

      // Proportions
      const prop1 = sub1Hours / totalHours;
      const prop2 = sub2Hours / totalHours;
      const prop3 = sub3Hours / totalHours;

      const pct1 = Math.round(prop1 * 100);
      const pct2 = Math.round(prop2 * 100);
      const pct3 = Math.round(prop3 * 100);

      // Variance from ideal (1/3 for each)
      const ideal = 1 / 3;
      const variance =
        (Math.pow(prop1 - ideal, 2) + Math.pow(prop2 - ideal, 2) + Math.pow(prop3 - ideal, 2)) / 3;
      const stdDev = Math.sqrt(variance);
      const maxStdDev = Math.sqrt((Math.pow(1 - ideal, 2) + Math.pow(0 - ideal, 2) + Math.pow(0 - ideal, 2)) / 3);

      // Score 0 to 100
      const rawScore = Math.round(Math.max(0, (1 - stdDev / maxStdDev) * 100));

      // Determine lowest and highest subjects
      const subjects = [
        { name: sub1Name, hours: sub1Hours, pct: pct1 },
        { name: sub2Name, hours: sub2Hours, pct: pct2 },
        { name: sub3Name, hours: sub3Hours, pct: pct3 },
      ].sort((a, b) => a.hours - b.hours);

      const lowest = subjects[0];
      const highest = subjects[2];

      let lvl = 'Good Balance';
      let clr = 'text-indigo-400';
      let bClass = 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      let rec = `Great job! You are balancing your time well across ${sub1Name}, ${sub2Name}, and ${sub3Name}.`;

      if (rawScore >= 85) {
        lvl = 'Well Balanced';
        clr = 'text-emerald-400';
        bClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
        rec = `Excellent! You are giving equal attention to all 3 subjects.`;
      } else if (rawScore >= 70) {
        lvl = 'Healthy Balance';
        clr = 'text-cyan-400';
        bClass = 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
        rec = `Good pacing. Try studying more ${lowest.name} (${lowest.hours.toFixed(1)}h logged) in your next session.`;
      } else if (rawScore >= 50) {
        lvl = 'Slightly Uneven';
        clr = 'text-amber-400';
        bClass = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
        rec = `You are spending a lot of time on ${highest.name} (${highest.pct}% of total time). Try spending your next session on ${lowest.name} (${lowest.pct}%).`;
      } else {
        lvl = 'Uneven Study Time';
        clr = 'text-rose-400';
        bClass = 'bg-rose-500/20 text-rose-300 border-rose-500/30';
        rec = `One of your subjects is lagging behind. ${lowest.name} has only ${lowest.hours.toFixed(1)}h logged compared to ${highest.hours.toFixed(1)}h for ${highest.name}. Try catching up on ${lowest.name}!`;
      }

      return {
        score: rawScore,
        level: lvl,
        color: clr,
        badgeClass: bClass,
        recommendation: rec,
        lowestSubject: lowest.name,
        highestSubject: highest.name,
        p1: pct1,
        p2: pct2,
        p3: pct3,
      };
    }, [sub1Name, sub1Hours, sub2Name, sub2Hours, sub3Name, sub3Hours, totalHours]);

  return (
    <div className="rounded-xl border border-[#E5DDD0] dark:border-white/[0.08] bg-[#F5F1E9] dark:bg-[#17201D] shadow-sm overflow-hidden flex flex-col justify-between p-5 sm:p-6 space-y-4">
      <div className="pb-3 border-b border-[#E5DDD0] dark:border-white/[0.08]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#2D5A43]/10 text-[#2D5A43] dark:text-[#A3B5AA] shrink-0">
              <Scale className="h-4 w-4" strokeWidth={1.5} />
            </div>
            <h3 className="text-base sm:text-lg font-serif text-[#132219] dark:text-[#F2EFE9]">
              Subject Balance
            </h3>
          </div>

          <span className="px-2 py-0.5 rounded-full text-[11px] font-mono border border-[#E5DDD0] dark:border-white/[0.1] bg-[#EFE9DF] dark:bg-white/[0.04] text-[#132219] dark:text-[#F2EFE9]">
            {score}% Balanced
          </span>
        </div>
        <p className="text-xs text-[#697D72] dark:text-[#8E9A90] mt-0.5">
          Distribution of hours across your 3 stream subjects
        </p>
      </div>

      <div className="space-y-4 pt-0">
        {/* Score Radial / Bar Meter */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#697D72] dark:text-[#8E9A90] font-serif">{level}</span>
            <span className="font-mono font-bold text-sm text-[#132219] dark:text-[#F2EFE9]">{score} / 100</span>
          </div>
          <div className="w-full bg-[#E5DDD0] dark:bg-white/[0.08] rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                score >= 85
                  ? 'bg-[#2D5A43]'
                  : score >= 65
                  ? 'bg-[#C85A32]'
                  : score >= 45
                  ? 'bg-[#9C6328]'
                  : 'bg-[#FF453A]'
              }`}
              style={{ width: `${Math.max(5, score)}%` }}
            />
          </div>
        </div>

        {/* 3-Subject Distribution Gauges */}
        <div className="grid grid-cols-3 gap-2">
          {/* Subject 1 */}
          <div className="p-2.5 rounded-lg bg-[#EFE9DF]/70 dark:bg-white/[0.03] border border-[#E5DDD0] dark:border-white/[0.08] space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#132219] dark:text-[#F2EFE9] font-serif truncate">{sub1Name}</span>
              <span className="font-mono text-[#2D5A43] dark:text-[#A3B5AA] font-bold">{p1}%</span>
            </div>
            <div className="h-1 rounded-full bg-[#E5DDD0] dark:bg-white/[0.08] overflow-hidden">
              <div className="h-full bg-[#2D5A43] rounded-full" style={{ width: `${p1}%` }} />
            </div>
            <span className="text-[10px] text-[#697D72] dark:text-[#8E9A90] font-mono block">{sub1Hours.toFixed(1)} hrs</span>
          </div>

          {/* Subject 2 */}
          <div className="p-2.5 rounded-lg bg-[#EFE9DF]/70 dark:bg-white/[0.03] border border-[#E5DDD0] dark:border-white/[0.08] space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#132219] dark:text-[#F2EFE9] font-serif truncate">{sub2Name}</span>
              <span className="font-mono text-[#C85A32] font-bold">{p2}%</span>
            </div>
            <div className="h-1 rounded-full bg-[#E5DDD0] dark:bg-white/[0.08] overflow-hidden">
              <div className="h-full bg-[#C85A32] rounded-full" style={{ width: `${p2}%` }} />
            </div>
            <span className="text-[10px] text-[#697D72] dark:text-[#8E9A90] font-mono block">{sub2Hours.toFixed(1)} hrs</span>
          </div>

          {/* Subject 3 */}
          <div className="p-2.5 rounded-lg bg-[#EFE9DF]/70 dark:bg-white/[0.03] border border-[#E5DDD0] dark:border-white/[0.08] space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#132219] dark:text-[#F2EFE9] font-serif truncate">{sub3Name}</span>
              <span className="font-mono text-[#9C6328] font-bold">{p3}%</span>
            </div>
            <div className="h-1 rounded-full bg-[#E5DDD0] dark:bg-white/[0.08] overflow-hidden">
              <div className="h-full bg-[#9C6328] rounded-full" style={{ width: `${p3}%` }} />
            </div>
            <span className="text-[10px] text-[#697D72] dark:text-[#8E9A90] font-mono block">{sub3Hours.toFixed(1)} hrs</span>
          </div>
        </div>

        {/* Strategic Recommendation Card */}
        <div className="p-3 rounded-lg bg-[#EFE9DF] dark:bg-white/[0.04] border border-[#E5DDD0] dark:border-white/[0.08] text-xs text-[#132219] dark:text-[#F2EFE9] flex items-start gap-2.5">
          <Lightbulb className="h-4 w-4 text-[#C85A32] shrink-0 mt-0.5" strokeWidth={1.5} />
          <div className="space-y-0.5">
            <span className="font-serif font-medium text-[11px] block">Curriculum Allocation Strategy</span>
            <p className="text-[11px] text-[#697D72] dark:text-[#8E9A90] leading-relaxed">{recommendation}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
