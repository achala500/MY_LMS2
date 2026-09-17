"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import { TestMarkEntry } from '@/types/testMarks';
import { AddTestMarkModal } from '@/components/tests/AddTestMarkModal';
import { TestMarksTable } from '@/components/tests/TestMarksTable';
import { PaperMarksBreakdownChart } from '@/components/tests/PaperMarksBreakdownChart';
import { SyllabusTopicMasteryTracker } from '@/components/tests/SyllabusTopicMasteryTracker';
import { AnonymousPaperEvaluationModal } from '@/components/tests/AnonymousPaperEvaluationModal';
import { StudyAdvisorCard } from '@/components/ai/StudyAdvisorCard';
import {
  calculateCompositeZScore,
  calculateSubjectZScore,
  calculatePercentileFromZ,
  NATIONAL_SUBJECT_STATS,
} from '@/lib/analytics/dataEngineering';
import { generateAiPrescriptions } from '@/lib/ai/studyAdvisor';
import { safeStorage } from '@/lib/storage/safeStorage';
import { toast } from 'sonner';
import {
  BookOpen,
  Plus,
  TrendingUp,
  Award,
  Loader2,
  RefreshCw,
  ArrowLeft,
  Sliders,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
} from 'lucide-react';

export default function TestsAndForecastPage() {
  const router = useRouter();
  const { user, member, loading: authLoading } = useAuth();
  const { logs } = useApp();

  const [testMarks, setTestMarks] = useState<TestMarkEntry[]>([]);
  const [loadingMarks, setLoadingMarks] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [evalModalOpen, setEvalModalOpen] = useState(false);

  // Student's 3 real stream subjects
  const streamSubjects = useMemo(() => {
    if (member?.stream === 'Biological Science') {
      return ['Biology', 'Chemistry', member?.optionalSubject || 'Physics'];
    }
    return ['Combined Maths', 'Physics', member?.optionalSubject || 'Chemistry'];
  }, [member]);

  // Load test marks from Google Sheets Backend & Local Storage Cache
  const loadTestMarks = async () => {
    if (!user?.email) return;
    try {
      setLoadingMarks(true);
      const cacheKey = `studysync_testmarks_${user.email}`;

      // Fetch authoritative marks from Google Apps Script Backend
      if (member?.studyId) {
        const res = await api.getTestMarks(member.studyId, user.email);
        if (res.success && Array.isArray(res.data?.testMarks)) {
          setTestMarks(res.data.testMarks);
          safeStorage.setJson(cacheKey, res.data.testMarks);
          return;
        }
      }

      // Fallback to local storage
      const cached = safeStorage.getJson<any[]>(cacheKey, []);
      if (cached && Array.isArray(cached)) {
        const clean = cached.filter((t: any) => !t.id?.startsWith('seed-'));
        setTestMarks(clean);
      } else {
        setTestMarks([]);
      }
    } catch (e) {
      console.error('Error loading test marks:', e);
      setTestMarks([]);
    } finally {
      setLoadingMarks(false);
    }
  };

  useEffect(() => {
    if (user?.email) {
      loadTestMarks();
    }
  }, [user, member]);

  // Add new test mark handler
  const handleAddTest = async (newEntry: Omit<TestMarkEntry, 'id' | 'createdAt'>) => {
    const entry: TestMarkEntry = {
      ...newEntry,
      id: `test_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };

    const updated = [entry, ...testMarks];
    setTestMarks(updated);

    if (user?.email) {
      const cacheKey = `studysync_testmarks_${user.email}`;
      safeStorage.setJson(cacheKey, updated);

      try {
        await api.logTestMark(entry);
        toast.success('Test mark synchronized to backend!');
      } catch (err) {
        console.error('Failed to sync test mark to backend:', err);
      }
    }
  };

  // Base live calculated forecast
  const liveForecast = useMemo(
    () => calculateCompositeZScore(streamSubjects, testMarks),
    [streamSubjects, testMarks]
  );

  // What-If Simulator State
  const [simulatorActive, setSimulatorActive] = useState(false);
  const [simScore1, setSimScore1] = useState(80);
  const [simScore2, setSimScore2] = useState(75);
  const [simScore3, setSimScore3] = useState(72);

  // Update simulator defaults when live marks change
  useEffect(() => {
    if (liveForecast?.subjectMetrics && liveForecast.subjectMetrics.length >= 3) {
      setSimScore1(Math.round(liveForecast.subjectMetrics[0]?.rawScore || 80));
      setSimScore2(Math.round(liveForecast.subjectMetrics[1]?.rawScore || 75));
      setSimScore3(Math.round(liveForecast.subjectMetrics[2]?.rawScore || 72));
    }
  }, [liveForecast]);

  // Calculated What-If Z-Score
  const simulatedZScore = useMemo(() => {
    const sub1 = streamSubjects[0] || 'Combined Maths';
    const sub2 = streamSubjects[1] || 'Physics';
    const sub3 = streamSubjects[2] || 'Chemistry';

    const z1 = calculateSubjectZScore(sub1, simScore1, 1).zScore;
    const z2 = calculateSubjectZScore(sub2, simScore2, 1).zScore;
    const z3 = calculateSubjectZScore(sub3, simScore3, 1).zScore;

    const avgZ = Number(((z1 + z2 + z3) / 3).toFixed(2));
    return avgZ;
  }, [streamSubjects, simScore1, simScore2, simScore3]);

  // Active display Z-score & percentile
  const displayZ = simulatorActive ? simulatedZScore : (liveForecast?.compositeZScore || 0);
  const displayPercentile = useMemo(() => calculatePercentileFromZ(displayZ), [displayZ]);



  const prescriptions = useMemo(
    () => generateAiPrescriptions(member, logs || [], testMarks),
    [member, logs, testMarks]
  );

  const district = (member as any)?.district || 'Colombo';

  if (authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh] bg-[#fef8f4]">
        <Loader2 className="h-8 w-8 text-[#9f3c16] animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-auto px-4 py-20 text-center space-y-6 bg-[#fef8f4]">
        <div className="rounded-2xl border border-[#dec0b7]/60 bg-white p-8 space-y-5 shadow-xl">
          <div className="mx-auto h-12 w-12 rounded-xl bg-[#f8f2ef] border border-[#dec0b7]/50 flex items-center justify-center text-[#9f3c16]">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold text-[#1d1b19] tracking-tight">Sign In Required</h2>
            <p className="text-xs text-[#2d2420] leading-relaxed">
              Sign in to access your tests forecast, normal distribution curve, and university cutoff tracker.
            </p>
          </div>
          <div className="pt-2">
            <Link href="/">
              <button className="w-full bg-[#9f3c16] hover:bg-[#822801] text-white rounded-xl h-11 font-medium transition-all cursor-pointer">
                Sign In with Google
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex-1 bg-[#fef8f4] text-[#1d1b19] pb-10 sm:pb-12 selection:bg-[#ffdbcf] selection:text-[#9f3c16]">
      <div className="w-full max-w-[1440px] mx-auto pt-6 px-4 md:px-12">
        <div className="flex flex-col w-full">
          {/* Top Headline Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 mt-2">
            <div className="space-y-1">
              <p className="font-sans text-xs text-[#9f3c16] tracking-wider uppercase font-semibold">
                Your Score Dashboard
              </p>
              <h1 className="font-serif text-3xl md:text-4xl text-[#1d1b19] tracking-tight italic">
                Tests &amp; Marks Forecast
              </h1>
              <p className="font-sans text-sm text-[#2d2420] max-w-2xl leading-relaxed">
                See where your marks put you for state university cutoffs in {district}, without doing crazy math in your head.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setAddModalOpen(true)}
                className="flex items-center gap-2 h-10 px-5 rounded-xl bg-[#9f3c16] text-white font-sans text-xs font-semibold shadow-sm hover:bg-[#822801] active:scale-[0.98] transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add test score</span>
              </button>

              <button
                type="button"
                onClick={loadTestMarks}
                disabled={loadingMarks}
                className="h-10 px-3.5 rounded-xl border border-[#dec0b7]/60 bg-white hover:bg-[#f8f2ef] text-[#2d2420] text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Refresh from cloud"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingMarks ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Sync</span>
              </button>
            </div>
          </div>

          {/* Bento Top Grid: Main Projection Card + Distribution Visualizer */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
            {/* Primary Metric Card (5 Cols) */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-[#dec0b7]/60 shadow-xs flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-sans text-xs text-[#2d2420] font-medium tracking-wide">
                      Projected Z-Score
                    </span>
                    <span className="font-mono text-[11px] text-[#4a3b35]">
                      {simulatorActive ? '[SIMULATOR]' : '[OFFICIAL_SYNC]'}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#c6edc1]/70 text-[#456644] border border-[#456644]/20 font-sans text-xs font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#456644]" />
                    {liveForecast?.targetTier || 'University Target In Reach'} 
                  </span>
                </div>

                <div className="pt-2">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="font-serif text-5xl sm:text-6xl text-[#1d1b19] tracking-tight italic">
                      {displayZ >= 0 ? `+${displayZ.toFixed(2)}` : displayZ.toFixed(2)}
                    </span>
                    <span className="font-sans text-xs text-[#456644] font-semibold">
                      Top {(100 - displayPercentile).toFixed(1)}% in {district}
                    </span>
                  </div>
                  <p className="font-sans text-xs text-[#2d2420] mt-2 leading-relaxed">
                    {simulatorActive
                      ? 'Displaying real-time simulated forecast based on slider inputs below.'
                      : `Crunching your ${testMarks.length} timed papers straight against ${district} district cutoff thresholds. Pure math.`}
                  </p>
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-[#dec0b7]/30">
                <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-[#f8f2ef] border border-[#dec0b7]/30 text-center">
                  <div>
                    <span className="font-mono text-[10px] text-[#4a3b35] block uppercase tracking-wider">
                      Est. Rank
                    </span>
                    <span className="font-serif text-lg font-semibold text-[#1d1b19] mt-0.5 block">
                      #{Math.max(1, Math.round(12000 * (1 - displayPercentile / 100)))}
                    </span>
                  </div>
                  <div>
                    <span className="font-mono text-[10px] text-[#4a3b35] block uppercase tracking-wider">
                      Papers Sat
                    </span>
                    <span className="font-serif text-lg font-semibold text-[#1d1b19] mt-0.5 block">
                      {testMarks.length}
                    </span>
                  </div>
                  <div>
                    <span className="font-mono text-[10px] text-[#4a3b35] block uppercase tracking-wider">
                      Target Cutoff
                    </span>
                    <span className="font-serif text-lg font-semibold text-[#456644] mt-0.5 block">
                      +1.98
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Syllabus Topic Mastery Tracker (7 Cols) */}
            <div className="lg:col-span-7">
              <SyllabusTopicMasteryTracker
                stream={member?.stream}
                onOpenAnonymousEvaluation={() => setEvalModalOpen(true)}
              />
            </div>
          </div>

          {/* Simulator Section (3 Precision Sliders) */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-[#dec0b7]/60 shadow-xs mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[#dec0b7]/30 gap-3">
              <div>
                <h2 className="font-serif text-xl font-semibold text-[#1d1b19]">Forecast Simulator</h2>
                <p className="font-sans text-xs text-[#2d2420]">
                  What-if test simulator â€” tweak your scores and see your Z-score change on the fly.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSimulatorActive(!simulatorActive)}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-sans text-xs font-semibold transition-all cursor-pointer ${
                    simulatorActive
                      ? 'bg-[#9f3c16] text-white'
                      : 'bg-[#f8f2ef] text-[#2d2420] hover:bg-[#ede7e3]'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>{simulatorActive ? 'Simulation Active' : 'Enable Simulator'}</span>
                </button>
              </div>
            </div>

            {/* 3 Subject Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-5">
              {/* Subject 1 */}
              <div className="p-4 rounded-xl bg-[#f8f2ef] border border-[#dec0b7]/30 flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-sans text-xs font-semibold text-[#1d1b19]">{streamSubjects[0]}</span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-serif text-xl font-semibold text-[#9f3c16]">{simScore1}</span>
                    <span className="font-mono text-[11px] text-[#4a3b35]">/ 100</span>
                  </div>
                </div>
                <input
                  type="range"
                  min={35}
                  max={100}
                  value={simScore1}
                  onChange={(e) => {
                    setSimulatorActive(true);
                    setSimScore1(parseInt(e.target.value, 10));
                  }}
                  className="w-full h-1.5 bg-[#ede7e3] rounded-lg appearance-none cursor-pointer accent-[#9f3c16]"
                />
                <div className="flex justify-between font-mono text-[10px] text-[#4a3b35]">
                  <span>Pass (35)</span>
                  <span>Mean: {NATIONAL_SUBJECT_STATS[streamSubjects[0]]?.mean || 45}</span>
                  <span>Max (100)</span>
                </div>
              </div>

              {/* Subject 2 */}
              <div className="p-4 rounded-xl bg-[#f8f2ef] border border-[#dec0b7]/30 flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-sans text-xs font-semibold text-[#1d1b19]">{streamSubjects[1]}</span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-serif text-xl font-semibold text-[#9f3c16]">{simScore2}</span>
                    <span className="font-mono text-[11px] text-[#4a3b35]">/ 100</span>
                  </div>
                </div>
                <input
                  type="range"
                  min={35}
                  max={100}
                  value={simScore2}
                  onChange={(e) => {
                    setSimulatorActive(true);
                    setSimScore2(parseInt(e.target.value, 10));
                  }}
                  className="w-full h-1.5 bg-[#ede7e3] rounded-lg appearance-none cursor-pointer accent-[#9f3c16]"
                />
                <div className="flex justify-between font-mono text-[10px] text-[#4a3b35]">
                  <span>Pass (35)</span>
                  <span>Mean: {NATIONAL_SUBJECT_STATS[streamSubjects[1]]?.mean || 46}</span>
                  <span>Max (100)</span>
                </div>
              </div>

              {/* Subject 3 */}
              <div className="p-4 rounded-xl bg-[#f8f2ef] border border-[#dec0b7]/30 flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-sans text-xs font-semibold text-[#1d1b19]">{streamSubjects[2]}</span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-serif text-xl font-semibold text-[#9f3c16]">{simScore3}</span>
                    <span className="font-mono text-[11px] text-[#4a3b35]">/ 100</span>
                  </div>
                </div>
                <input
                  type="range"
                  min={35}
                  max={100}
                  value={simScore3}
                  onChange={(e) => {
                    setSimulatorActive(true);
                    setSimScore3(parseInt(e.target.value, 10));
                  }}
                  className="w-full h-1.5 bg-[#ede7e3] rounded-lg appearance-none cursor-pointer accent-[#9f3c16]"
                />
                <div className="flex justify-between font-mono text-[10px] text-[#4a3b35]">
                  <span>Pass (35)</span>
                  <span>Mean: {NATIONAL_SUBJECT_STATS[streamSubjects[2]]?.mean || 48}</span>
                  <span>Max (100)</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Study Advisor Prescriptions Card */}
          <div className="mb-8">
            <StudyAdvisorCard prescriptions={prescriptions} streamName={member?.stream || 'Physical Science'} />
          </div>

          {/* Paper Marks MCQ / Essay Breakdown Interactive Chart */}
          <div className="mb-8">
            <PaperMarksBreakdownChart
              testMarks={testMarks}
              streamSubjects={streamSubjects}
            />
          </div>

          {/* Test Marks History Table */}
          <div className="bg-white rounded-2xl p-6 border border-[#dec0b7]/60 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-serif text-xl font-semibold text-[#1d1b19]">Exam Records Ledger</h3>
                <p className="font-sans text-xs text-[#2d2420]">
                  Full historical archive of timed model papers and term examination scores.
                </p>
              </div>
              <span className="font-mono text-xs px-3 py-1 rounded-full bg-[#f8f2ef] text-[#2d2420] border border-[#dec0b7]/40">
                {testMarks.length} Total
              </span>
            </div>

            <TestMarksTable testMarks={testMarks} />
          </div>
        </div>
      </div>

      {/* Add Test Mark Modal */}
      <AddTestMarkModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        streamSubjects={streamSubjects}
        onAddTest={handleAddTest}
        studyId={member?.studyId || user.email}
        studentEmail={user.email}
      />

      {/* Anonymous Paper Evaluation Modal */}
      <AnonymousPaperEvaluationModal
        isOpen={evalModalOpen}
        onClose={() => setEvalModalOpen(false)}
        stream={member?.stream}
      />
    </div>
  );
}
