/**
 * StudySync Cognitive AI Study Advisor & Stream-Tailored Heuristic Engine
 * 
 * Implements domain-specific diagnostic rules for:
 * 1. Physical Science Stream (Combined Maths, Physics, Chemistry / ICT)
 * 2. Biological Science Stream (Biology, Chemistry, Physics / Agriculture)
 * 3. General Cognitive Fatigue & Subject Equilibrium Heuristics
 */

import { TestMarkEntry, AiStudyPrescription, PrescriptionCategory } from '../../types/testMarks';
import { DailyLogEntry } from '../../types/logs';
import { MemberData } from '../../types/member';
import {
  CognitivePrescription,
  PrescriptionSeverity,
  ComprehensiveCognitiveReport,
  SubjectZScoreDetail,
} from '../../types/ai';
import {
  calculateCompositeZScore,
  calculateSubjectZScoreDetail,
  calculateDynamicVelocity,
  calculateTargetGapAnalysis,
  calculateCognitiveFatigueIndex,
  calculateSubjectEntropyEquilibrium,
  calculateStudyRoi,
  calculateSubjectEma,
} from '../analytics/dataEngineering';

export interface EnhancedPrescription extends AiStudyPrescription {
  ruleId?: string;
  stream?: 'Physical Science' | 'Biological Science' | 'General';
  diagnosticReason: string;
  actionProtocol: string;
  priorityScore: number;
}

/**
 * Generates stream-tailored, prioritized cognitive prescriptions
 */
export function generateAiPrescriptions(
  member: MemberData | null,
  logs: DailyLogEntry[],
  testMarks: TestMarkEntry[]
): EnhancedPrescription[] {
  const isBio =
    member?.stream === 'Biological Science' ||
    String(member?.stream || '').toLowerCase().includes('bio');

  const streamName: 'Physical Science' | 'Biological Science' = isBio
    ? 'Biological Science'
    : 'Physical Science';

  const streamSubjects = isBio
    ? ['Biology', 'Chemistry', member?.optionalSubject || 'Physics']
    : ['Combined Maths', 'Physics', member?.optionalSubject || 'Chemistry'];

  const prescriptions: EnhancedPrescription[] = [];

  // Data Engineering calculations
  const forecast = calculateCompositeZScore(streamSubjects, testMarks);
  const rois = calculateStudyRoi(streamSubjects, logs || [], testMarks || []);
  const streak = logs?.length || 0;
  const fatigue = calculateCognitiveFatigueIndex(logs || [], streak);

  // Subject hours for entropy equilibrium
  const subjectHours = streamSubjects.map((sub) => {
    let hrs = 0;
    (logs || []).forEach((log) => {
      const subs = log.subjects || [];
      const match = subs.find((s) => s.name?.toLowerCase() === sub.toLowerCase());
      if (match) {
        hrs += Number(match.hours || 0);
      }
    });
    return hrs;
  });

  const equilibrium = calculateSubjectEntropyEquilibrium(subjectHours, streamSubjects);

  // --------------------------------------------------------------------------
  // Rule 0: Onboarding Baseline (0 tests logged)
  // --------------------------------------------------------------------------
  if (!testMarks || testMarks.length === 0) {
    return [
      {
        id: 'onboarding-diagnostic',
        ruleId: 'ONBOARDING-01',
        stream: streamName,
        category: 'strategy',
        severity: 'focus',
        title: 'Cognitive AI Diagnostic Active â€” Awaiting First Test Mark',
        diagnosticReason:
          'Your AI Study Advisor is ready to calibrate. Log your first school term test, model paper, or revision quiz score to compute your empirical Sri Lankan Z-Score and identify subject bottlenecks.',
        diagnosis:
          'Your AI Study Advisor is ready to calibrate. Log your first school term test, model paper, or revision quiz score to compute your empirical Sri Lankan Z-Score and identify subject bottlenecks.',
        actionProtocol:
          'Click "+ Log Test Mark" above and record your most recent paper marks for ' +
          streamSubjects.join(', ') +
          '.',
        actionablePrescription:
          'Click "+ Log Test Mark" above and record your most recent paper marks for ' +
          streamSubjects.join(', ') +
          '.',
        targetSubject: streamSubjects[0],
        projectedZGain: 0.25,
        priorityScore: 100,
      },
    ];
  }

  // Map latest marks and counts per subject
  const subStats: Record<string, { avgScore: number; count: number; hours: number; emaVelocity: number }> = {};
  streamSubjects.forEach((sub, idx) => {
    const matching = testMarks.filter((t) => t.subject.toLowerCase() === sub.toLowerCase());
    const count = matching.length;
    const avgScore = count > 0 ? matching.reduce((acc, m) => acc + m.score, 0) / count : 0;
    const ema = calculateSubjectEma(sub, testMarks);
    subStats[sub] = {
      avgScore,
      count,
      hours: subjectHours[idx] || 0,
      emaVelocity: ema.velocity,
    };
  });

  // --------------------------------------------------------------------------
  // Physical Science Stream Tips
  // --------------------------------------------------------------------------
  if (!isBio) {
    const math = subStats['Combined Maths'] || subStats['Combined Mathematics'] || { avgScore: 0, count: 0, hours: 0, emaVelocity: 0 };
    const phys = subStats['Physics'] || { avgScore: 0, count: 0, hours: 0, emaVelocity: 0 };
    const chem = subStats['Chemistry'] || { avgScore: 0, count: 0, hours: 0, emaVelocity: 0 };
    const ict = subStats['ICT'] || subStats['Information & Communication Technology'] || { avgScore: 0, count: 0, hours: 0, emaVelocity: 0 };

    // MATH-DYN-01: Mechanics & Dynamics practice
    if (math.count >= 1 && (math.emaVelocity < 0 || (math.hours > 15 && math.avgScore < 60))) {
      prescriptions.push({
        id: 'math-dyn-01',
        ruleId: 'MATH-DYN-01',
        stream: 'Physical Science',
        category: 'mechanics',
        severity: 'urgent',
        title: 'Focus on Dynamics & Mechanics in Combined Maths',
        diagnosticReason:
          'You are spending good time studying, but paper scores show that timed problem solving will help you score much higher than re-reading notes.',
        diagnosis:
          'You are spending good time studying, but paper scores show that timed problem solving will help you score much higher than re-reading notes.',
        actionProtocol:
          'Try solving 2 past paper questions from Dynamics or Statics with a 45-minute timer. Note down any steps where you got stuck.',
        actionablePrescription:
          'Try solving 2 past paper questions from Dynamics or Statics with a 45-minute timer. Note down any steps where you got stuck.',
        targetSubject: 'Combined Maths',
        projectedZGain: 0.24,
        priorityScore: 95,
      });
    }

    // MATH-CALC-02: Pure Maths Calculus & Trigonometry
    if (math.count >= 2 && math.avgScore < 50) {
      prescriptions.push({
        id: 'math-calc-02',
        ruleId: 'MATH-CALC-02',
        stream: 'Physical Science',
        category: 'calculus',
        severity: 'urgent',
        title: 'Daily Quick Practice for Calculus & Trigonometry',
        diagnosticReason:
          'Calculus and Trigonometry appear in almost every Part A question. Practicing a few questions daily builds speed and confidence.',
        diagnosis:
          'Calculus and Trigonometry appear in almost every Part A question. Practicing a few questions daily builds speed and confidence.',
        actionProtocol:
          'Spend 25 minutes each morning solving 4 integration or differentiation problems from recent past papers before starting other topics.',
        actionablePrescription:
          'Spend 25 minutes each morning solving 4 integration or differentiation problems from recent past papers before starting other topics.',
        targetSubject: 'Combined Maths',
        projectedZGain: 0.20,
        priorityScore: 92,
      });
    }

    // PHYS-NUM-01: Physics Mechanics
    if (phys.count >= 1 && (phys.avgScore < 55 || (phys.hours < 8 && phys.avgScore < 65))) {
      prescriptions.push({
        id: 'phys-num-01',
        ruleId: 'PHYS-NUM-01',
        stream: 'Physical Science',
        category: 'mechanics',
        severity: 'alert',
        title: 'Physics Mechanics & Diagrams',
        diagnosticReason:
          'Drawing clear force diagrams before writing equations will save you marks in Physics structured essay questions.',
        diagnosis:
          'Drawing clear force diagrams before writing equations will save you marks in Physics structured essay questions.',
        actionProtocol:
          'When solving mechanics questions, always draw the complete force diagram first, write your coordinate formulas clearly, and double check units.',
        actionablePrescription:
          'When solving mechanics questions, always draw the complete force diagram first, write your coordinate formulas clearly, and double check units.',
        targetSubject: 'Physics',
        projectedZGain: 0.22,
        priorityScore: 88,
      });
    }

    // CHEM-PHYS-01: Physical Chemistry
    if (chem.count >= 1 && chem.avgScore < 60 && math.avgScore >= 75) {
      prescriptions.push({
        id: 'chem-phys-01',
        ruleId: 'CHEM-PHYS-01',
        stream: 'Physical Science',
        category: 'calculus',
        severity: 'alert',
        title: 'Apply Your Maths Strengths to Physical Chemistry',
        diagnosticReason:
          'You have strong maths skills! Connecting that directly to equilibrium and thermodynamics calculations will quickly raise your chemistry grade.',
        diagnosis:
          'You have strong maths skills! Connecting that directly to equilibrium and thermodynamics calculations will quickly raise your chemistry grade.',
        actionProtocol:
          'Practice 8 equilibrium (Kp, Kc, pH) and electrochemistry problems using step-by-step tables to organize the numbers clearly.',
        actionablePrescription:
          'Practice 8 equilibrium (Kp, Kc, pH) and electrochemistry problems using step-by-step tables to organize the numbers clearly.',
        targetSubject: 'Chemistry',
        projectedZGain: 0.18,
        priorityScore: 84,
      });
    }

    // CHEM-INORG-02: Inorganic Chemistry Recall
    if (chem.count >= 2 && chem.emaVelocity <= -4) {
      prescriptions.push({
        id: 'chem-inorg-02',
        ruleId: 'CHEM-INORG-02',
        stream: 'Physical Science',
        category: 'active_recall',
        severity: 'focus',
        title: 'Quick Daily Refresh for Inorganic Reactions',
        diagnosticReason:
          'Inorganic reactions and color tests are easy to forget without regular quick reviews.',
        diagnosis:
          'Inorganic reactions and color tests are easy to forget without regular quick reviews.',
        actionProtocol:
          'Keep a 1-page reaction summary sheet handy and spend 10 minutes testing your memory before going to bed.',
        actionablePrescription:
          'Keep a 1-page reaction summary sheet handy and spend 10 minutes testing your memory before going to bed.',
        targetSubject: 'Chemistry',
        projectedZGain: 0.16,
        priorityScore: 78,
      });
    }

    // ICT-ALG-01: Programming & Algorithm Logic Bottleneck
    if (ict.count >= 1 && ict.avgScore < 65 && member?.optionalSubject === 'ICT') {
      prescriptions.push({
        id: 'ict-alg-01',
        ruleId: 'ICT-ALG-01',
        stream: 'Physical Science',
        category: 'strategy',
        severity: 'alert',
        title: 'Programming & Algorithm Logic Bottleneck in ICT',
        diagnosticReason:
          'Weakness in Section B structured Python programming, pseudo-code trace tables, and database normalization (2NF/3NF).',
        diagnosis:
          'Weakness in Section B structured Python programming, pseudo-code trace tables, and database normalization (2NF/3NF).',
        actionProtocol:
          'Code Trace & SQL Sprint: Write out dry-run trace tables for recursive algorithms and normalize 3 database schema scenarios from provincial past papers weekly.',
        actionablePrescription:
          'Code Trace & SQL Sprint: Write out dry-run trace tables for recursive algorithms and normalize 3 database schema scenarios from provincial past papers weekly.',
        targetSubject: 'ICT',
        projectedZGain: 0.20,
        priorityScore: 82,
      });
    }
  }

  // --------------------------------------------------------------------------
  // Biological Science Stream Heuristics
  // --------------------------------------------------------------------------
  if (isBio) {
    const bio = subStats['Biology'] || { avgScore: 0, count: 0, hours: 0, emaVelocity: 0 };
    const chem = subStats['Chemistry'] || { avgScore: 0, count: 0, hours: 0, emaVelocity: 0 };
    const phys = subStats['Physics'] || { avgScore: 0, count: 0, hours: 0, emaVelocity: 0 };
    const agri = subStats['Agriculture'] || subStats['Agricultural Science'] || { avgScore: 0, count: 0, hours: 0, emaVelocity: 0 };

    // BIO-RES-01: NIE Resource Book Phrasing Imprecision
    if (bio.count >= 2 && bio.avgScore < 65) {
      prescriptions.push({
        id: 'bio-res-01',
        ruleId: 'BIO-RES-01',
        stream: 'Biological Science',
        category: 'active_recall',
        severity: 'urgent',
        title: 'NIE Resource Book Phrasing Imprecision in Biology',
        diagnosticReason:
          'Inability to match official National Institute of Education (NIE) Resource Book marking keywords in structured essay questions.',
        diagnosis:
          'Inability to match official National Institute of Education (NIE) Resource Book marking keywords in structured essay questions.',
        actionProtocol:
          'NIE Keyword Cloze Drills: Convert Resource Book Unit summaries into active fill-in-the-blank cloze tests. Practice writing 1 full essay question weekly and self-evaluate strictly against Department of Examinations marking schemes.',
        actionablePrescription:
          'NIE Keyword Cloze Drills: Convert Resource Book Unit summaries into active fill-in-the-blank cloze tests. Practice writing 1 full essay question weekly and self-evaluate strictly against Department of Examinations marking schemes.',
        targetSubject: 'Biology',
        projectedZGain: 0.28,
        priorityScore: 96,
      });
    }

    // BIO-SPACED-02: Passive Reading Satiation & Ebbinghaus Decay
    if (bio.hours > 18 && bio.avgScore >= 55 && bio.avgScore <= 70) {
      prescriptions.push({
        id: 'bio-spaced-02',
        ruleId: 'BIO-SPACED-02',
        stream: 'Biological Science',
        category: 'spaced_retrieval',
        severity: 'alert',
        title: 'Passive Reading Satiation & Ebbinghaus Decay in Biology',
        diagnosticReason:
          'Excessive passive highlighting with diminishing retention returns in high-volume units like Plant Physiology and Genetics.',
        diagnosis:
          'Excessive passive highlighting with diminishing retention returns in high-volume units like Plant Physiology and Genetics.',
        actionProtocol:
          '2-3-7 Spaced Retrieval Protocol: Implement 2-day, 3-day, and 7-day spaced active recall cycles for high-volume units (Plant Physiology, Genetics, Molecular Biology).',
        actionablePrescription:
          '2-3-7 Spaced Retrieval Protocol: Implement 2-day, 3-day, and 7-day spaced active recall cycles for high-volume units (Plant Physiology, Genetics, Molecular Biology).',
        targetSubject: 'Biology',
        projectedZGain: 0.22,
        priorityScore: 86,
      });
    }

    // BIO-CHEM-ORG-01: Organic Chemistry Mechanisms
    if (chem.count >= 1 && chem.avgScore < 55) {
      prescriptions.push({
        id: 'bio-chem-org-01',
        ruleId: 'BIO-CHEM-ORG-01',
        stream: 'Biological Science',
        category: 'organic',
        severity: 'urgent',
        title: 'Master Organic Chemistry Conversions',
        diagnosticReason:
          'Chemistry is essential for medical and science faculty selection. Practicing reaction pathways step-by-step will give your score an immediate boost.',
        diagnosis:
          'Chemistry is essential for medical and science faculty selection. Practicing reaction pathways step-by-step will give your score an immediate boost.',
        actionProtocol:
          'Practice drawing out reaction conversion roadmaps twice weekly. Try 4 conversion questions each week to make the reactions second nature.',
        actionablePrescription:
          'Practice drawing out reaction conversion roadmaps twice weekly. Try 4 conversion questions each week to make the reactions second nature.',
        targetSubject: 'Chemistry',
        projectedZGain: 0.30,
        priorityScore: 98,
      });
    }

    // BIO-PHYS-MATH-01: Physics Calculations
    if (phys.count >= 1 && phys.avgScore < 50 && member?.optionalSubject === 'Physics') {
      prescriptions.push({
        id: 'bio-phys-math-01',
        ruleId: 'BIO-PHYS-MATH-01',
        stream: 'Biological Science',
        category: 'mechanics',
        severity: 'alert',
        title: 'Step-by-Step Approach for Physics Problems',
        diagnosticReason:
          'Physics calculation problems can feel daunting, but breaking them into small steps makes them much easier to solve.',
        diagnosis:
          'Physics calculation problems can feel daunting, but breaking them into small steps makes them much easier to solve.',
        actionProtocol:
          'Write down the given values first, write the formula, and solve carefully. Start with past paper MCQs to build your pace and accuracy.',
        actionablePrescription:
          'Write down the given values first, write the formula, and solve carefully. Start with past paper MCQs to build your pace and accuracy.',
        targetSubject: 'Physics',
        projectedZGain: 0.25,
        priorityScore: 90,
      });
    }

    // AGRI-AGRON-01: Agriculture Calculations
    if (agri.count >= 1 && agri.avgScore < 60 && member?.optionalSubject === 'Agriculture') {
      prescriptions.push({
        id: 'agri-agron-01',
        ruleId: 'AGRI-AGRON-01',
        stream: 'Biological Science',
        category: 'strategy',
        severity: 'focus',
        title: 'Agriculture Calculations Practice',
        diagnosticReason:
          'Practicing agronomy and soil calculations will help you secure full marks in structured questions.',
        diagnosis:
          'Practicing agronomy and soil calculations will help you secure full marks in structured questions.',
        actionProtocol:
          'Solve 4 numerical problems on fertilizer and irrigation from recent provincial papers.',
        actionablePrescription:
          'Solve 4 numerical problems on fertilizer and irrigation from recent provincial papers.',
        targetSubject: 'Agriculture',
        projectedZGain: 0.18,
        priorityScore: 80,
      });
    }
  }

  // --------------------------------------------------------------------------
  // Cross-Stream Study Advice: Fatigue, Balance, Subject Focus
  // --------------------------------------------------------------------------

  // 1. Study Fatigue Check
  if (fatigue.tier === 'burnout' || fatigue.tier === 'high') {
    prescriptions.push({
      id: 'cognitive-fatigue-alert',
      ruleId: 'FATIGUE-01',
      stream: 'General',
      category: 'fatigue',
      severity: fatigue.tier === 'burnout' ? 'urgent' : 'alert',
      title: 'Time for a Well-Deserved Rest',
      diagnosticReason: `You've logged ${fatigue.totalHours7d} hours this week! Taking scheduled rest days protects your focus and prevents exhaustion.`,
      diagnosis: `You've logged ${fatigue.totalHours7d} hours this week! Taking scheduled rest days protects your focus and prevents exhaustion.`,
      actionProtocol: fatigue.restorativeProtocol,
      actionablePrescription: fatigue.restorativeProtocol,
      projectedZGain: 0.15,
      priorityScore: fatigue.tier === 'burnout' ? 99 : 85,
    });
  }

  // 2. Balancing Subject Scores
  const subjectsWithMarks = forecast.subjectMetrics.filter((s) => s.confidencePct > 0);
  if (subjectsWithMarks.length >= 2) {
    const sortedByZ = [...subjectsWithMarks].sort((a, b) => a.zScore - b.zScore);
    const weakest = sortedByZ[0];
    const strongest = sortedByZ[sortedByZ.length - 1];

    if (weakest && strongest && strongest.zScore - weakest.zScore >= 0.50) {
      prescriptions.push({
        id: 'asymmetry-drag',
        ruleId: 'ASYM-DRAG-01',
        stream: streamName,
        category: 'balance',
        severity: 'urgent',
        title: `Boost Your ${weakest.subject} to Lift Your Overall Rank`,
        diagnosticReason: `Your ${strongest.subject} is tracking well at ${strongest.grade} grade. Putting extra time into ${weakest.subject} will have the biggest positive impact on your final Z-Score.`,
        diagnosis: `Your ${strongest.subject} is tracking well at ${strongest.grade} grade. Putting extra time into ${weakest.subject} will have the biggest positive impact on your final Z-Score.`,
        actionProtocol: `Dedicate 3 extra hours this week specifically to ${weakest.subject} past paper questions and revision.`,
        actionablePrescription: `Dedicate 3 extra hours this week specifically to ${weakest.subject} past paper questions and revision.`,
        targetSubject: weakest.subject,
        projectedZGain: 0.28,
        priorityScore: 94,
      });
    }
  }

  // 3. Subject Equilibrium Neglect Alert (Shannon Entropy < 70%)
  if (equilibrium.isNeglected && equilibrium.weakestSubject) {
    prescriptions.push({
      id: 'subject-neglect-alert',
      ruleId: 'NEGLECT-01',
      stream: streamName,
      category: 'balance',
      severity: 'alert',
      title: `Asymmetric Study Allocation: ${equilibrium.weakestSubject} Neglect`,
      diagnosticReason: `Your study distribution across subjects has an equilibrium index of ${equilibrium.equilibriumPct}% (Shannon entropy ${equilibrium.entropyScore}). ${equilibrium.weakestSubject} is receiving significantly less focus than ${equilibrium.strongestSubject}.`,
      diagnosis: `Your study distribution across subjects has an equilibrium index of ${equilibrium.equilibriumPct}% (Shannon entropy ${equilibrium.entropyScore}). ${equilibrium.weakestSubject} is receiving significantly less focus than ${equilibrium.strongestSubject}.`,
      actionProtocol: `Reallocate ~${equilibrium.reallocationHoursTarget} hours from ${equilibrium.strongestSubject} to ${equilibrium.weakestSubject} this week to restore three-subject balance.`,
      actionablePrescription: `Reallocate ~${equilibrium.reallocationHoursTarget} hours from ${equilibrium.strongestSubject} to ${equilibrium.weakestSubject} this week to restore three-subject balance.`,
      targetSubject: equilibrium.weakestSubject,
      projectedZGain: 0.18,
      priorityScore: 81,
    });
  }

  // 4. Low Yield Study Bottlenecks
  const lowRoi = rois.find((r) => r.efficiencyBadge === 'Low Yield Alert ');
  if (lowRoi) {
    prescriptions.push({
      id: 'low-roi-bottleneck',
      ruleId: 'LOW-ROI-01',
      stream: streamName,
      category: 'efficiency',
      severity: 'alert',
      title: `Low Yield Study Bottleneck in ${lowRoi.subject}`,
      diagnosticReason: `You have logged ${lowRoi.totalStudyHours}h in ${lowRoi.subject}, but average mark is ${lowRoi.averageMark}%. Passive reading is yielding diminishing returns.`,
      diagnosis: `You have logged ${lowRoi.totalStudyHours}h in ${lowRoi.subject}, but average mark is ${lowRoi.averageMark}%. Passive reading is yielding diminishing returns.`,
      actionProtocol: `Replace passive notes reading with active recall: 40-minute timed past paper drills followed by immediate error taxonomy review.`,
      actionablePrescription: `Replace passive notes reading with active recall: 40-minute timed past paper drills followed by immediate error taxonomy review.`,
      targetSubject: lowRoi.subject,
      projectedZGain: 0.20,
      priorityScore: 83,
    });
  }

  // 5. Positive Momentum / Mastery
  streamSubjects.forEach((sub) => {
    const ema = calculateSubjectEma(sub, testMarks);
    if (ema.trend === 'accelerating' && ema.velocity >= 4) {
      prescriptions.push({
        id: `acceleration-${sub.toLowerCase().replace(/\s+/g, '-')}`,
        ruleId: 'MOMENTUM-01',
        stream: streamName,
        category: 'mastery',
        severity: 'mastery',
        title: `Positive Acceleration Momentum in ${sub}`,
        diagnosticReason: `Your ${sub} test performance has accelerated by +${ema.velocity}% over recent assessments with strong momentum (${ema.currentEma3}% EMA-3).`,
        diagnosis: `Your ${sub} test performance has accelerated by +${ema.velocity}% over recent assessments with strong momentum (${ema.currentEma3}% EMA-3).`,
        actionProtocol: `Maintain this cadence with weekly full-length model paper simulations under strict exam timer conditions.`,
        actionablePrescription: `Maintain this cadence with weekly full-length model paper simulations under strict exam timer conditions.`,
        targetSubject: sub,
        projectedZGain: 0.14,
        priorityScore: 70,
      });
    }
  });

  // Default Fallback Prescription
  if (prescriptions.length === 0) {
    prescriptions.push({
      id: 'strategic-default',
      ruleId: 'STRATEGY-01',
      stream: streamName,
      category: 'strategy',
      severity: 'focus',
      title: 'Balanced A/L Study Cadence',
      diagnosticReason: `Composite Z-Score is tracking at ${forecast.compositeZScore.toFixed(2)} (${forecast.predictedGradesSummary}). Continuous logging will refine predictive precision.`,
      diagnosis: `Composite Z-Score is tracking at ${forecast.compositeZScore.toFixed(2)} (${forecast.predictedGradesSummary}). Continuous logging will refine predictive precision.`,
      actionProtocol: 'Log at least 2 timed model papers per week and record your scores in the Test Marks inspector.',
      actionablePrescription: 'Log at least 2 timed model papers per week and record your scores in the Test Marks inspector.',
      projectedZGain: 0.10,
      priorityScore: 50,
    });
  }

  // Sort by priorityScore descending
  return prescriptions.sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0));
}

/**
 * Compiles a comprehensive cognitive report aggregating all analytic sub-engines
 */
export function generateComprehensiveCognitiveReport(
  member: MemberData | null,
  logs: DailyLogEntry[],
  testMarks: TestMarkEntry[],
  targetTierId: string = 'colombo-eng-med'
): ComprehensiveCognitiveReport {
  const isBio =
    member?.stream === 'Biological Science' ||
    String(member?.stream || '').toLowerCase().includes('bio');

  const streamSubjects = isBio
    ? ['Biology', 'Chemistry', member?.optionalSubject || 'Physics']
    : ['Combined Maths', 'Physics', member?.optionalSubject || 'Chemistry'];

  const forecast = calculateCompositeZScore(streamSubjects, testMarks);
  const velocity = calculateDynamicVelocity(streamSubjects, testMarks);
  const targetGap = calculateTargetGapAnalysis(forecast.compositeZScore, streamSubjects, targetTierId);
  const fatigue = calculateCognitiveFatigueIndex(logs || [], logs?.length || 0);

  const subjectHours = streamSubjects.map((sub) => {
    let hrs = 0;
    (logs || []).forEach((log) => {
      const subs = log.subjects || [];
      const match = subs.find((s) => s.name?.toLowerCase() === sub.toLowerCase());
      if (match) hrs += Number(match.hours || 0);
    });
    return hrs;
  });

  const equilibrium = calculateSubjectEntropyEquilibrium(subjectHours, streamSubjects);
  const prescriptions = generateAiPrescriptions(member, logs, testMarks);

  const subjects: SubjectZScoreDetail[] = streamSubjects.map((sub) => {
    const matching = testMarks.filter((t) => t.subject.toLowerCase() === sub.toLowerCase());
    const count = matching.length;
    const avgScore = count > 0 ? matching.reduce((acc, m) => acc + m.score, 0) / count : 0;
    return calculateSubjectZScoreDetail(sub, avgScore, count);
  });

  const subjectsWithTests = subjects.filter((s) => s.confidencePct > 0);
  const confidencePct =
    subjectsWithTests.length > 0
      ? Math.round(
          subjectsWithTests.reduce((acc, s) => acc + s.confidencePct, 0) / subjectsWithTests.length
        )
      : 0;

  return {
    compositeZScore: forecast.compositeZScore,
    nationalPercentile: forecast.nationalPercentile,
    predictedGradesSummary: forecast.predictedGradesSummary,
    confidencePct,
    subjects,
    velocity,
    targetGap,
    fatigue,
    equilibrium,
    prescriptions,
  };
}
