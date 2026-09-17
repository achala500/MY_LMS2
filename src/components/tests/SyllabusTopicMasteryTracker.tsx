'use client';

import React, { useState, useEffect } from 'react';
import { safeStorage } from '@/lib/storage/safeStorage';
import { BookOpen, CheckCircle2, ChevronRight, Sliders, Award, Sparkles, Plus, Minus } from 'lucide-react';
import { toast } from 'sonner';

interface TopicUnit {
  id: string;
  subject: string;
  unitNumber: string;
  name: string;
  totalSubtopics: number;
  completedSubtopics: number;
}

interface SyllabusTopicMasteryTrackerProps {
  stream?: string;
  onOpenAnonymousEvaluation?: () => void;
}

const DEFAULT_SYLLABUS_TOPICS: TopicUnit[] = [
  // Combined Maths
  { id: 'cm-1', subject: 'Combined Maths', unitNumber: 'Unit 01', name: 'Real Numbers & Polynomial Roots', totalSubtopics: 8, completedSubtopics: 7 },
  { id: 'cm-2', subject: 'Combined Maths', unitNumber: 'Unit 02', name: 'Trigonometric Identities & Equations', totalSubtopics: 10, completedSubtopics: 8 },
  { id: 'cm-3', subject: 'Combined Maths', unitNumber: 'Unit 03', name: 'Differential Calculus & Curve Sketching', totalSubtopics: 12, completedSubtopics: 9 },
  { id: 'cm-4', subject: 'Combined Maths', unitNumber: 'Unit 04', name: 'Integral Calculus & Area Integration', totalSubtopics: 14, completedSubtopics: 10 },
  { id: 'cm-5', subject: 'Combined Maths', unitNumber: 'Unit 05', name: 'Vectors & Coplanar Force Systems', totalSubtopics: 8, completedSubtopics: 6 },
  { id: 'cm-6', subject: 'Combined Maths', unitNumber: 'Unit 06', name: 'Linear Dynamics & Relative Motion', totalSubtopics: 10, completedSubtopics: 7 },

  // Physics
  { id: 'ph-1', subject: 'Physics', unitNumber: 'Unit 01', name: 'Units, Dimensions & Error Estimation', totalSubtopics: 6, completedSubtopics: 6 },
  { id: 'ph-2', subject: 'Physics', unitNumber: 'Unit 02', name: 'Mechanics & Hydrodynamics (Bernoulli)', totalSubtopics: 14, completedSubtopics: 11 },
  { id: 'ph-3', subject: 'Physics', unitNumber: 'Unit 03', name: 'Oscillations, Waves & Optical Dispersion', totalSubtopics: 12, completedSubtopics: 9 },
  { id: 'ph-4', subject: 'Physics', unitNumber: 'Unit 04', name: 'Thermal Physics & Kinetic Gas Theory', totalSubtopics: 10, completedSubtopics: 8 },
  { id: 'ph-5', subject: 'Physics', unitNumber: 'Unit 05', name: 'Electrostatic Potential & Circuits', totalSubtopics: 12, completedSubtopics: 8 },
  { id: 'ph-6', subject: 'Physics', unitNumber: 'Unit 06', name: 'Electromagnetism & Nuclear Radiation', totalSubtopics: 10, completedSubtopics: 6 },

  // Chemistry
  { id: 'ch-1', subject: 'Chemistry', unitNumber: 'Unit 01', name: 'Atomic Structure & Periodic Trends', totalSubtopics: 8, completedSubtopics: 8 },
  { id: 'ch-2', subject: 'Chemistry', unitNumber: 'Unit 02', name: 'Chemical Bonding & VSEPR Geometries', totalSubtopics: 10, completedSubtopics: 9 },
  { id: 'ch-3', subject: 'Chemistry', unitNumber: 'Unit 03', name: 'Chemical Calculations & Gas State', totalSubtopics: 10, completedSubtopics: 7 },
  { id: 'ch-4', subject: 'Chemistry', unitNumber: 'Unit 04', name: 'Energetics, Enthalpy & Hess Cycle', totalSubtopics: 8, completedSubtopics: 6 },
  { id: 'ch-5', subject: 'Chemistry', unitNumber: 'Unit 05', name: 'Inorganic Chemistry (s, p, d-block)', totalSubtopics: 16, completedSubtopics: 11 },
  { id: 'ch-6', subject: 'Chemistry', unitNumber: 'Unit 06', name: 'Organic Reaction Mechanisms & Synthesis', totalSubtopics: 18, completedSubtopics: 12 },

  // Biology (Bio Stream)
  { id: 'bio-1', subject: 'Biology', unitNumber: 'Unit 01', name: 'Chemical Basis of Life & Cell Structure', totalSubtopics: 10, completedSubtopics: 9 },
  { id: 'bio-2', subject: 'Biology', unitNumber: 'Unit 02', name: 'Evolution & Biodiversity Classification', totalSubtopics: 12, completedSubtopics: 10 },
  { id: 'bio-3', subject: 'Biology', unitNumber: 'Unit 03', name: 'Plant Form, Nutrition & Transport', totalSubtopics: 14, completedSubtopics: 11 },
  { id: 'bio-4', subject: 'Biology', unitNumber: 'Unit 04', name: 'Animal Physiology & Human Organ Systems', totalSubtopics: 18, completedSubtopics: 13 },
  { id: 'bio-5', subject: 'Biology', unitNumber: 'Unit 05', name: 'Genetics, Molecular Biology & Biotech', totalSubtopics: 14, completedSubtopics: 10 },
];

export const SyllabusTopicMasteryTracker: React.FC<SyllabusTopicMasteryTrackerProps> = ({
  stream,
  onOpenAnonymousEvaluation,
}) => {
  const isBio = String(stream || '').toLowerCase().includes('bio');

  const [topics, setTopics] = useState<TopicUnit[]>(() => {
    return safeStorage.getJson<TopicUnit[]>('studysync_topic_mastery', DEFAULT_SYLLABUS_TOPICS);
  });

  const [selectedSubject, setSelectedSubject] = useState<string>(isBio ? 'Biology' : 'Combined Maths');

  const activeSubjects = isBio
    ? ['Biology', 'Physics', 'Chemistry']
    : ['Combined Maths', 'Physics', 'Chemistry'];

  useEffect(() => {
    if (!activeSubjects.includes(selectedSubject)) {
      setSelectedSubject(activeSubjects[0]);
    }
  }, [isBio]);

  const updateProgress = (topicId: string, delta: number) => {
    setTopics((prev) => {
      const updated = prev.map((t) => {
        if (t.id === topicId) {
          const nextVal = Math.min(t.totalSubtopics, Math.max(0, t.completedSubtopics + delta));
          return { ...t, completedSubtopics: nextVal };
        }
        return t;
      });
      safeStorage.setJson('studysync_topic_mastery', updated);
      return updated;
    });
  };

  const filteredTopics = topics.filter((t) => t.subject === selectedSubject);
  const totalSubtopics = filteredTopics.reduce((acc, t) => acc + t.totalSubtopics, 0);
  const totalCompleted = filteredTopics.reduce((acc, t) => acc + t.completedSubtopics, 0);
  const overallPercentage = totalSubtopics > 0 ? Math.round((totalCompleted / totalSubtopics) * 100) : 0;

  return (
    <div className="w-full rounded-2xl bg-white border border-[#e7e1de] p-5 sm:p-7 shadow-xs">
      {/* Tracker Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#f3ede9]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1d1b19]">
              Syllabus Topic Mastery Tracker
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-[#f3ede9] text-[#2d2420] font-mono text-xs border border-[#e7e1de]">
              {overallPercentage}% Complete
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenAnonymousEvaluation && (
            <button
              type="button"
              onClick={onOpenAnonymousEvaluation}
              className="px-4 py-2 rounded-full bg-[#c85a32] hover:bg-[#b04b25] active:scale-95 text-white font-semibold text-xs shadow-xs transition-all flex items-center gap-1.5"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Anonymous Paper Evaluation</span>
            </button>
          )}
        </div>
      </div>

      {/* Subject Filter Tabs */}
      <div className="flex items-center gap-2 my-5 overflow-x-auto pb-1 scrollbar-none">
        {activeSubjects.map((sub) => {
          const isActive = sub === selectedSubject;
          return (
            <button
              key={sub}
              type="button"
              onClick={() => setSelectedSubject(sub)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all active:scale-95 ${
                isActive
                  ? 'bg-[#19202e] text-white shadow-xs'
                  : 'bg-[#f8f2ef] hover:bg-[#ede7e3] text-[#57423b]'
              }`}
            >
              {sub}
            </button>
          );
        })}
      </div>

      {/* Progress Metric Bar */}
      <div className="mb-6 p-4 rounded-xl bg-[#fef8f4] border border-[#f3ede9] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-2/3">
          <div className="flex justify-between text-xs font-mono font-medium text-[#57423b] mb-1.5">
            <span>{selectedSubject} Syllabus Completion</span>
            <span>{totalCompleted} / {totalSubtopics} Modules</span>
          </div>
          <div className="w-full h-3 rounded-full bg-[#ede7e3] overflow-hidden">
            <div
              className="h-full rounded-full bg-[#c85a32] transition-all duration-300"
              style={{ width: `${overallPercentage}%` }}
            />
          </div>
        </div>
        <div className="font-mono text-xs text-[#8a726a] text-center sm:text-right shrink-0">
          Target: 100% before October Revision Cycle
        </div>
      </div>

      {/* Topic Units Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredTopics.map((topic) => {
          const pct = Math.round((topic.completedSubtopics / topic.totalSubtopics) * 100);
          const isFinished = pct === 100;

          return (
            <div
              key={topic.id}
              className="p-4 rounded-xl border border-[#e7e1de] bg-white hover:border-[#8a726a] transition-all duration-150 flex flex-col justify-between gap-3 shadow-2xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-mono text-[10px] uppercase font-bold text-[#c85a32]">
                    {topic.unitNumber}
                  </span>
                  <h4 className="font-serif font-semibold text-sm text-[#1d1b19] leading-snug">
                    {topic.name}
                  </h4>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold shrink-0 ${
                    isFinished
                      ? 'bg-[#c6edc1] text-[#022106]'
                      : 'bg-[#ffdcbc] text-[#854f00]'
                  }`}
                >
                  {pct}%
                </span>
              </div>

              {/* Progress Slider Bar */}
              <div>
                <div className="w-full h-2 rounded-full bg-[#f3ede9] overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full transition-all duration-200 ${
                      isFinished ? 'bg-[#456644]' : 'bg-[#c85a32]'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-[11px] text-[#57423b]">
                    {topic.completedSubtopics} of {topic.totalSubtopics} subtopics
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => updateProgress(topic.id, -1)}
                      disabled={topic.completedSubtopics <= 0}
                      className="w-6 h-6 rounded-md bg-[#f8f2ef] hover:bg-[#ede7e3] active:scale-95 disabled:opacity-40 flex items-center justify-center text-[#1d1b19] transition-all"
                      title="Decrement"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => updateProgress(topic.id, 1)}
                      disabled={topic.completedSubtopics >= topic.totalSubtopics}
                      className="w-6 h-6 rounded-md bg-[#f8f2ef] hover:bg-[#ede7e3] active:scale-95 disabled:opacity-40 flex items-center justify-center text-[#1d1b19] transition-all"
                      title="Increment"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SyllabusTopicMasteryTracker;
