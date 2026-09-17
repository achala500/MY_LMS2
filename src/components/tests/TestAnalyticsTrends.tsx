'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StreamZScoreForecast, SubjectEmaMetric, SubjectStudyRoi } from '@/types/testMarks';
import { TrendingUp, Award, Zap, Flame, ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react';

interface TestAnalyticsTrendsProps {
  forecast: StreamZScoreForecast;
  emaList: SubjectEmaMetric[];
  roiList: SubjectStudyRoi[];
}

export const TestAnalyticsTrends: React.FC<TestAnalyticsTrendsProps> = ({
  forecast,
  emaList,
  roiList,
}) => {
  const hasAnyTests = forecast.subjectMetrics.some((s) => s.confidencePct > 0);

  return (
    <div className="space-y-6">
      {/* 1. Z-Score Normalization Engine Card */}
      <div className="rounded-2xl border border-[#E5DDD0] dark:border-white/[0.08] bg-[#F5F1E9] dark:bg-[#17201D] p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E5DDD0] dark:border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-medium bg-[#EFE9DF] dark:bg-white/[0.05] text-[#132219] dark:text-[#F2EFE9] border border-[#E5DDD0] dark:border-white/[0.08]">
                Sri Lankan A/L Z-Score Model
              </span>
              <span className="text-[#697D72] dark:text-[#8E9A90] text-xs font-mono">Empirical Bayes Standardization</span>
            </div>
            <h2 className="text-xl font-serif text-[#132219] dark:text-[#F2EFE9] tracking-tight">
              Composite Z-Score & Performance Trajectory
            </h2>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-3xl font-mono font-semibold text-[#132219] dark:text-[#F2EFE9]">
              {hasAnyTests ? forecast.compositeZScore.toFixed(4) : '0.0000'}
            </span>
            <p className="text-[11px] text-[#697D72] dark:text-[#8E9A90] font-mono mt-0.5">
              {hasAnyTests
                ? `Projected Range: ${forecast.zScoreRange.min} – ${forecast.zScoreRange.max}`
                : 'Awaiting first test score submission'}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Per-Subject Z-Score Bars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {forecast.subjectMetrics.map((sub, idx) => {
              const hasTest = sub.confidencePct > 0;
              const gradeColors: Record<string, string> = {
                A: 'text-[#2D5A43] bg-[#2D5A43]/10 border-[#2D5A43]/20',
                B: 'text-[#132219] dark:text-[#F2EFE9] bg-[#EFE9DF] dark:bg-white/[0.08] border-[#E5DDD0] dark:border-white/[0.1]',
                C: 'text-[#9C6328] bg-[#9C6328]/10 border-[#9C6328]/20',
                S: 'text-[#C85A32] bg-[#C85A32]/10 border-[#C85A32]/20',
                F: 'text-rose-600 bg-rose-500/10 border-rose-500/20',
              };

              return (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-[#E5DDD0] dark:border-white/[0.08] bg-[#FBF9F5] dark:bg-[#111614] space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-medium text-sm text-[#132219] dark:text-[#F2EFE9]">{sub.subject}</span>
                    {hasTest ? (
                      <span className={`px-2 py-0.5 rounded-md font-mono text-xs border ${gradeColors[sub.grade] || gradeColors.B}`}>
                        Grade {sub.grade}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md font-mono text-[10px] bg-[#EFE9DF] dark:bg-white/[0.05] border border-[#E5DDD0] dark:border-white/[0.08] text-[#697D72] dark:text-[#8E9A90]">
                        No Tests
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline justify-between font-mono">
                    <span className="text-2xl font-semibold text-[#132219] dark:text-[#F2EFE9]">
                      {hasTest ? `${sub.rawScore.toFixed(1)}%` : '—'}
                    </span>
                    <span className="text-xs text-[#C85A32] font-semibold">
                      {hasTest
                        ? `Z: ${sub.zScore > 0 ? '+' : ''}${sub.zScore.toFixed(2)}`
                        : 'Z: —'}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="w-full bg-[#EFE9DF] dark:bg-white/[0.08] rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-[#C85A32] h-full rounded-full transition-all duration-500"
                        style={{ width: `${hasTest ? Math.min(100, Math.max(5, sub.rawScore)) : 0}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-[#697D72] dark:text-[#8E9A90] font-mono">
                      <span>National μ: {sub.mean}</span>
                      <span>Confidence: {hasTest ? `${sub.confidencePct}%` : '0%'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Performance Momentum & Exponential Moving Averages */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* EMA Momentum */}
            <div className="p-4 rounded-xl border border-[#E5DDD0] dark:border-white/[0.08] bg-[#FBF9F5] dark:bg-[#111614] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-serif font-medium text-[#132219] dark:text-[#F2EFE9] flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-[#C85A32]" strokeWidth={1.5} />
                  <span>Exponential Moving Average (EMA-3 / EMA-5)</span>
                </span>
                <span className="text-[10px] text-[#697D72] dark:text-[#8E9A90] font-mono">Smoothed</span>
              </div>

              <div className="space-y-2.5">
                {emaList.map((ema, idx) => {
                  const hasEma = ema.currentEma3 > 0;
                  return (
                    <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-[#E5DDD0]/60 dark:border-white/[0.04] last:border-0">
                      <span className="text-[#132219] dark:text-[#F2EFE9] font-medium">{ema.subject}</span>
                      <div className="flex items-center gap-3 font-mono">
                        <span className="text-[#697D72] dark:text-[#8E9A90]">
                          EMA: <strong className="text-[#132219] dark:text-[#F2EFE9]">{hasEma ? `${ema.currentEma3}%` : '—'}</strong>
                        </span>
                        {hasEma && (
                          <span className={`text-[11px] font-semibold ${
                            ema.trend === 'accelerating' ? 'text-[#2D5A43]' : ema.trend === 'decaying' ? 'text-rose-600' : 'text-[#697D72]'
                          }`}>
                            {ema.velocity > 0 ? `+${ema.velocity}%` : `${ema.velocity}%`}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Study Hour ROI */}
            <div className="p-4 rounded-xl border border-[#E5DDD0] dark:border-white/[0.08] bg-[#FBF9F5] dark:bg-[#111614] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-serif font-medium text-[#132219] dark:text-[#F2EFE9] flex items-center gap-1.5">
                  <Zap className="h-4 w-4 text-[#9C6328]" strokeWidth={1.5} />
                  <span>Study Hour Efficiency (Marks per 10 Study Hours)</span>
                </span>
                <span className="text-[10px] text-[#697D72] dark:text-[#8E9A90] font-mono">Index</span>
              </div>

              <div className="space-y-2.5">
                {roiList.map((roi, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-[#E5DDD0]/60 dark:border-white/[0.04] last:border-0">
                    <div>
                      <span className="text-[#132219] dark:text-[#F2EFE9] font-medium block">{roi.subject}</span>
                      <span className="text-[10px] text-[#697D72] dark:text-[#8E9A90] font-mono">{roi.totalStudyHours}h logged</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-[#EFE9DF] dark:bg-white/[0.05] border border-[#E5DDD0] dark:border-white/[0.08] text-[#132219] dark:text-[#F2EFE9]">
                      {roi.totalStudyHours > 0 || roi.averageMark > 0 ? roi.efficiencyBadge : 'Pending Logs'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
