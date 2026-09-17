/**
 * StudySync Cognitive AI & Dynamic Z-Score Velocity Type Definitions
 * 
 * Defines data contracts for:
 * 1. Empirical Bayes standardization & National Norms
 * 2. Hastings Rational Polynomial CDF & Islandwide Percentiles
 * 3. Dynamic Velocity (V_Z) & Dual EMA Momentum (EMA_3 - EMA_5)
 * 4. University Cutoff Gap & Partial Derivative Sensitivity
 * 5. Multi-Factor Cognitive Fatigue Index (F_cog)
 * 6. Shannon Entropy Subject Equilibrium (E_norm)
 * 7. Stream-Tailored Cognitive Heuristic Prescriptions
 */

import { PrescriptionCategory } from '@/types/testMarks';

export interface SubjectNationalNorm {
  mean: number;
  stdDev: number;
  weight: number;
  code?: string;
}

export interface SubjectZScoreDetail {
  subject: string;
  rawScore: number;
  mean: number;
  stdDev: number;
  bayesianMean: number;
  zScore: number;
  grade: 'A' | 'B' | 'C' | 'S' | 'F';
  confidencePct: number;
  sensitivity: number; // ∂Z/∂X_j = 1 / (3 * σ_j)
  marksNeededPer01Z: number; // 3 * σ_j * 0.1
  percentile: number;
}

export interface UniversityCutoffTier {
  id: string;
  name: string;
  faculty: string;
  targetZ: number;
  description: string;
  color: string;
}

export interface TargetGapAnalysis {
  targetTier: UniversityCutoffTier;
  currentZ: number;
  targetZ: number;
  gap: number;
  isTargetMet: boolean;
  subjectRequiredMarks: Record<string, number>;
  uniformMarksNeeded: number;
}

export interface DynamicVelocityMetric {
  subject?: string;
  periodDays: number;
  velocityZPerMonth: number;
  ema3: number;
  ema5: number;
  momentum: number; // EMA_3 - EMA_5
  momentumStatus: 'accelerating' | 'stable' | 'decaying';
  velocityLabel: string;
}

export interface CognitiveFatigueMetrics {
  fatigueIndex: number; // 0.0 to 10.0 scale
  tier: 'optimal' | 'moderate' | 'high' | 'burnout';
  label: string;
  flowScore: number; // 10 - fatigueIndex
  avgFocus7d: number;
  avgProductivity7d: number;
  totalHours7d: number;
  streakDays: number;
  recommendation: string;
  restorativeProtocol: string;
}

export interface SubjectEquilibriumMetrics {
  entropyScore: number; // Shannon entropy H
  maxEntropy: number; // ln(3) ≈ 1.0986
  equilibriumPct: number; // (H / ln(3)) * 100
  assessment: string;
  isNeglected: boolean;
  weakestSubject?: string;
  strongestSubject?: string;
  reallocationHoursTarget?: number;
}

export type PrescriptionSeverity = 'urgent' | 'alert' | 'mastery' | 'focus';

export interface CognitivePrescription {
  id: string;
  ruleId?: string;
  stream?: 'Physical Science' | 'Biological Science' | 'General';
  category: PrescriptionCategory;
  severity: PrescriptionSeverity;
  title: string;
  diagnosticReason: string;
  diagnosis?: string;
  actionProtocol: string;
  actionablePrescription?: string;
  targetSubject?: string;
  projectedZGain?: number;
  priorityScore?: number;
}

export interface ComprehensiveCognitiveReport {
  compositeZScore: number;
  nationalPercentile: number;
  predictedGradesSummary: string;
  confidencePct: number;
  subjects: SubjectZScoreDetail[];
  velocity: DynamicVelocityMetric;
  targetGap: TargetGapAnalysis;
  fatigue: CognitiveFatigueMetrics;
  equilibrium: SubjectEquilibriumMetrics;
  prescriptions: CognitivePrescription[];
}
