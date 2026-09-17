'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Sparkles, Zap, Flame, Target } from 'lucide-react';

export interface DualSliderProps {
  label?: string;
  type?: 'focus' | 'productivity';
  value: number;
  onChange: (val: number) => void;
  disabled?: boolean;
}

export function getScoreTier(val: number) {
  const v = Math.round(val);
  if (v <= 3) {
    return {
      status: 'Distracted / Low',
      emoji: '',
      colorClass: 'text-rose-400',
      bgClass: 'bg-rose-500/10 border-rose-500/30 text-rose-300',
      accentColor: '#ef4444',
      trackGradient: 'from-rose-500 to-orange-500',
    };
  } else if (v <= 6) {
    return {
      status: 'Moderate / Steady',
      emoji: '',
      colorClass: 'text-amber-400',
      bgClass: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
      accentColor: '#eab308',
      trackGradient: 'from-amber-500 to-emerald-500',
    };
  } else if (v <= 8) {
    return {
      status: 'High / Productive',
      emoji: '',
      colorClass: 'text-emerald-400',
      bgClass: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
      accentColor: '#10b981',
      trackGradient: 'from-emerald-500 to-cyan-500',
    };
  } else {
    return {
      status: 'Deep Flow State ',
      emoji: '',
      colorClass: 'text-purple-300',
      bgClass: 'bg-purple-500/15 border-purple-500/30 text-purple-200',
      accentColor: '#8b5cf6',
      trackGradient: 'from-cyan-500 via-indigo-500 to-purple-500',
    };
  }
}

export function DualSlider({
  label,
  type = 'focus',
  value,
  onChange,
  disabled = false,
}: DualSliderProps) {
  const displayLabel =
    label || (type === 'focus' ? 'Focus Level' : 'Productivity Level');
  const tier = getScoreTier(value);

  // percentage for track fill: (value - 1) / (10 - 1) * 100%
  const percentage = Math.max(0, Math.min(100, ((value - 1) / 9) * 100));

  return (
    <div className="p-4 rounded-2xl bg-zinc-950/50 border border-zinc-800/80 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {type === 'focus' ? (
            <Target className="h-4 w-4 text-indigo-400" />
          ) : (
            <Zap className="h-4 w-4 text-amber-400" />
          )}
          <span className="text-xs font-semibold text-zinc-300">{displayLabel}</span>
        </div>

        <div
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-semibold transition-colors',
            tier.bgClass
          )}
        >
          <span>{tier.emoji}</span>
          <span>{tier.status}</span>
          <span className="ml-1 font-mono font-bold">({value}/10)</span>
        </div>
      </div>

      <div className="relative pt-2 pb-1">
        {/* Track */}
        <div className="relative w-full h-3 rounded-full bg-zinc-900 overflow-hidden border border-zinc-800">
          <div
            className={cn(
              'h-full rounded-full bg-gradient-to-r transition-all duration-150',
              tier.trackGradient
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Range Input (Invisible overlay for perfect touch/mouse precision) */}
        <input
          type="range"
          min="1"
          max="10"
          step="1"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-20"
        />

        {/* Value Ticks */}
        <div className="flex justify-between px-1 pt-1.5 text-[10px] font-mono text-zinc-400">
          <span>1</span>
          <span>2</span>
          <span>3</span>
          <span>4</span>
          <span>5</span>
          <span>6</span>
          <span>7</span>
          <span>8</span>
          <span>9</span>
          <span>10</span>
        </div>
      </div>
    </div>
  );
}

export default DualSlider;
