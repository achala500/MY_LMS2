'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Sparkles,
  AlertTriangle,
  Flame,
  ShieldAlert,
  CheckCircle2,
  ArrowRight,
  Filter,
  BrainCircuit,
  BookOpen,
  Target,
  Zap,
} from 'lucide-react';
import { AiStudyPrescription } from '@/types/testMarks';
import { CognitivePrescription, PrescriptionSeverity } from '@/types/ai';

interface CognitiveAdvisorCardProps {
  prescriptions: (AiStudyPrescription | CognitivePrescription)[];
  streamName?: string;
}

export const CognitiveAdvisorCard: React.FC<CognitiveAdvisorCardProps> = ({
  prescriptions,
  streamName,
}) => {
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');

  const severityStyles: Record<
    PrescriptionSeverity,
    { border: string; badge: string; bg: string; icon: React.ReactNode; label: string }
  > = {
    urgent: {
      border: 'border-[#ba1a1a]/30 hover:border-[#ba1a1a]/60',
      badge: 'bg-[#ba1a1a]/10 text-[#ba1a1a] border-[#ba1a1a]/30',
      bg: 'bg-white',
      icon: <ShieldAlert className="h-4 w-4 text-[#ba1a1a] shrink-0" />,
      label: 'High Priority',
    },
    alert: {
      border: 'border-[#854f00]/30 hover:border-[#854f00]/60',
      badge: 'bg-[#854f00]/10 text-[#854f00] border-[#854f00]/30',
      bg: 'bg-white',
      icon: <AlertTriangle className="h-4 w-4 text-[#854f00] shrink-0" />,
      label: 'Needs Review',
    },
    mastery: {
      border: 'border-[#456644]/30 hover:border-[#456644]/60',
      badge: 'bg-[#456644]/10 text-[#456644] border-[#456644]/30',
      bg: 'bg-white',
      icon: <Flame className="h-4 w-4 text-[#456644] fill-[#456644] shrink-0" />,
      label: 'Great Progress',
    },
    focus: {
      border: 'border-[#9f3c16]/30 hover:border-[#9f3c16]/60',
      badge: 'bg-[#9f3c16]/10 text-[#9f3c16] border-[#9f3c16]/30',
      bg: 'bg-white',
      icon: <Sparkles className="h-4 w-4 text-[#9f3c16] shrink-0" />,
      label: 'Study Focus',
    },
  };

  const filteredPrescriptions = prescriptions.filter((p) => {
    if (selectedSeverity === 'all') return true;
    return p.severity === selectedSeverity;
  });

  const severityCounts = {
    all: prescriptions.length,
    urgent: prescriptions.filter((p) => p.severity === 'urgent').length,
    alert: prescriptions.filter((p) => p.severity === 'alert').length,
    mastery: prescriptions.filter((p) => p.severity === 'mastery').length,
    focus: prescriptions.filter((p) => p.severity === 'focus').length,
  };

  return (
    <div className="rounded-3xl border border-[#dec0b7] bg-white shadow-sm p-6 sm:p-8 space-y-6 relative overflow-hidden transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#dec0b7]/60">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-[#9f3c16]/10 border border-[#9f3c16]/20 flex items-center justify-center text-[#9f3c16] shrink-0">
            <BrainCircuit className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#1d1b19] flex items-center gap-2 flex-wrap">
              <span>Study Tips & Strategy</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold font-mono bg-[#f3ede9] text-[#1d1b19] border border-[#dec0b7]/60">
                {streamName || 'Your Stream'}
              </span>
            </h3>
            <p className="text-xs text-[#2d2420] mt-0.5">
              Personalized advice based on your study hours and paper marks
            </p>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex flex-wrap gap-1.5">
          {(['all', 'urgent', 'alert', 'mastery', 'focus'] as const).map((sev) => {
            const count = severityCounts[sev];
            if (sev !== 'all' && count === 0) return null;
            return (
              <button
                key={sev}
                type="button"
                onClick={() => setSelectedSeverity(sev)}
                className={`px-3 py-1 rounded-full text-xs font-semibold font-mono transition-all duration-200 active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                  selectedSeverity === sev
                    ? 'bg-[#9f3c16] text-white shadow-sm'
                    : 'bg-[#fef8f4] hover:bg-[#ede7e3] text-[#2d2420] hover:text-[#1d1b19] border border-[#dec0b7]/70'
                }`}
              >
                <span className="capitalize">{sev}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  selectedSeverity === sev ? 'bg-white/20 text-white' : 'bg-[#ede7e3] text-[#4a3b35]'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        {filteredPrescriptions.length === 0 ? (
          <div className="p-8 text-center space-y-2 rounded-2xl bg-[#fef8f4] border border-[#dec0b7]/60">
            <CheckCircle2 className="h-8 w-8 text-[#456644] mx-auto" />
            <p className="text-sm font-bold text-[#1d1b19]">No tips in this category right now</p>
            <p className="text-xs text-[#2d2420]">
              Your study pace looks steady! Switch to &quot;All&quot; to see all tips.
            </p>
          </div>
        ) : (
          filteredPrescriptions.map((p) => {
            const style = severityStyles[p.severity as PrescriptionSeverity] || severityStyles.focus;
            const diagnosis =
              (p as any).diagnosticReason || (p as any).diagnosis || 'Helpful study advice based on your logs.';
            const protocol =
              (p as any).actionProtocol ||
              (p as any).actionablePrescription ||
              'Keep revising consistently according to your timetable.';
            const targetSubject = p.targetSubject;
            const gain = p.projectedZGain;

            return (
              <div
                key={p.id}
                className="p-5 rounded-2xl bg-[#fef8f4] border border-[#dec0b7] space-y-3 relative transition-all duration-200 hover:border-[#9f3c16]/50 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {style.icon}
                    <span className="font-bold text-sm text-[#1d1b19]">{p.title}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono border ${style.badge}`}
                    >
                      {style.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {targetSubject && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-white text-[#9f3c16] border border-[#dec0b7]">
                        {targetSubject}
                      </span>
                    )}
                    {gain !== undefined && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-[#456644]/15 text-[#456644] border border-[#456644]/30">
                        +{gain.toFixed(2)} Est. Z Gain
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-[#2d2420] leading-relaxed font-sans pl-6">
                  {diagnosis}
                </p>

                {/* What to do next */}
                <div className="p-3.5 rounded-xl bg-white border border-[#dec0b7]/70 flex items-start gap-3">
                  <div className="h-6 w-6 rounded-lg bg-[#9f3c16]/10 border border-[#9f3c16]/20 flex items-center justify-center text-[#9f3c16] shrink-0 mt-0.5">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-bold text-[#9f3c16] uppercase tracking-wide">
                      What to do
                    </span>
                    <p className="text-xs text-[#1d1b19] font-medium leading-relaxed font-sans">
                      {protocol}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
