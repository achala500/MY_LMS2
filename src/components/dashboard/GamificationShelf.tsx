'use client';

import React from 'react';
import { DailyLogEntry } from '@/types/logs';
import { getGamificationState, AchievementBadge } from '@/lib/gamification';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Flame,
  Zap,
  Crown,
  Award,
  Trophy,
  Scale,
  Sun,
  Moon,
  Lock,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

interface GamificationShelfProps {
  streak: number;
  totalHours: number;
  balanceScore: number;
  logs: DailyLogEntry[];
}

const BADGE_ICONS: Record<string, React.ElementType> = {
  Flame,
  Zap,
  Crown,
  Award,
  Trophy,
  Scale,
  Sun,
  Moon,
};

export function GamificationShelf({
  streak,
  totalHours,
  balanceScore,
  logs,
}: GamificationShelfProps) {
  const state = getGamificationState(streak, totalHours, balanceScore, logs);

  return (
    <Card className="bg-card/60  border-border shadow-xl overflow-hidden relative">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-indigo-500 to-emerald-500" />

      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30">
                <Sparkles className="h-3 w-3" /> Gamification & Achievements
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                {state.unlockedBadgesCount} / {state.totalBadgesCount} Badges Unlocked
              </span>
            </div>
            <CardTitle className="text-xl sm:text-2xl font-extrabold text-foreground flex items-center gap-2.5">
              <span>Level {state.level}: {state.rankTitle}</span>
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Earn XP through daily study consistency, verified hours, and balanced revision.
            </CardDescription>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 block">
                {state.totalXp.toLocaleString()} Total XP
              </span>
              <span className="text-[11px] text-muted-foreground font-mono">
                {state.level < 7
                  ? `${(state.nextLevelThresholdXp - state.totalXp).toLocaleString()} XP to Level ${state.level + 1}`
                  : 'Max Rank Achieved'}
              </span>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-amber-500 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center shrink-0">
              <div className="h-full w-full bg-card rounded-[14px] flex items-center justify-center">
                <span className="text-lg font-extrabold font-mono text-foreground">
                  L{state.level}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="space-y-1.5 pt-3">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-muted-foreground">Level {state.level} ({state.rankTitle})</span>
            <span className="text-foreground font-semibold">{state.levelProgressPct}%</span>
            <span className="text-muted-foreground">{state.level < 7 ? `Level ${state.level + 1}` : 'Mastery'}</span>
          </div>
          <Progress
            value={state.levelProgressPct}
            className="h-2.5 bg-muted rounded-full"
          />
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono mb-3">
          A/L Milestone Badges Shelf
        </h4>

        {/* Badges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {state.badges.map((badge) => {
            const IconComponent = BADGE_ICONS[badge.icon] || Award;
            const isUnlocked = badge.unlocked;

            return (
              <Tooltip key={badge.id}>
                <TooltipTrigger asChild>
                  <div
                    className={`p-3 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between gap-2.5 relative overflow-hidden ${
                      isUnlocked
                        ? 'bg-card/90 border-amber-500/40 shadow-md shadow-amber-500/10 hover:border-amber-500/60 hover:scale-[1.02]'
                        : 'bg-muted/30 border-border/60 opacity-70 hover:opacity-90'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div
                        className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isUnlocked
                            ? 'bg-gradient-to-tr from-amber-500/20 to-indigo-500/20 border border-amber-500/40 text-amber-500 dark:text-amber-400'
                            : 'bg-muted text-muted-foreground border border-border'
                        }`}
                      >
                        <IconComponent className="h-5 w-5" />
                      </div>

                      {isUnlocked ? (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold font-mono bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 className="h-2.5 w-2.5" /> Unlocked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-mono text-muted-foreground bg-muted border border-border">
                          <Lock className="h-2.5 w-2.5" /> {badge.progress}%
                        </span>
                      )}
                    </div>

                    <div>
                      <h5 className="text-xs font-bold text-foreground truncate">
                        {badge.title}
                      </h5>
                      <p className="text-[10px] text-muted-foreground line-clamp-2 leading-tight mt-0.5">
                        {badge.description}
                      </p>
                    </div>

                    {/* Mini Progress */}
                    {!isUnlocked && (
                      <Progress
                        value={badge.progress}
                        className="h-1 bg-muted rounded-full"
                      />
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-popover border-border text-popover-foreground text-xs max-w-xs p-3 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <IconComponent className="h-3.5 w-3.5 text-amber-500" />
                    <span>{badge.title}</span>
                  </p>
                  <p className="text-muted-foreground text-[11px]">{badge.description}</p>
                  <p className="text-[10px] font-mono text-indigo-500 dark:text-indigo-400 pt-1">
                    Progress: {badge.currentValue} / {badge.targetValue} {badge.unit} ({badge.progress}%)
                  </p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
