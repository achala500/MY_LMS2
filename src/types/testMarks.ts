export type ExamType =
  | 'Term Test'
  | 'Model Paper'
  | 'Past Paper'
  | 'Unit Exam'
  | 'Revision Quiz';

export interface TestMarkEntry {
  id: string;
  testId?: string;
  studyId: string;
  studentEmail: string;
  testDate: string;
  examType: ExamType;
  subject: string;
  paperTitle: string;
  score: number; // 0 to 100
  totalPossible?: number;
  hasMcq?: boolean;
  mcqScore?: number; // Score for MCQ component
  essayScore?: number; // Score for Essay / Structured component
  rank?: number | null;
  difficultyRating?: number; // 1 to 5
  timeTakenMinutes?: number;
  notes?: string;
  createdAt?: string;
  created_at?: string;
}

export interface SubjectZScoreMetric {
  subject: string;
  rawScore: number;
  mean: number;
  stdDev: number;
  zScore: number;
  grade: 'A' | 'B' | 'C' | 'S' | 'F';
  confidencePct: number;
}

export interface StreamZScoreForecast {
  compositeZScore: number;
  zScoreRange: { min: number; max: number };
  subjectMetrics: SubjectZScoreMetric[];
  predictedGradesSummary: string; // e.g. "3A" or "2A 1B"
  nationalPercentile: number;
  targetTier: 'Engineering / Medicine Direct' | 'Physical / Bio Applied Sciences' | 'National University Threshold' | 'Revision Required';
}

export interface SubjectEmaMetric {
  subject: string;
  currentEma3: number;
  currentEma5: number;
  velocity: number; // + or - percentage slope
  trend: 'accelerating' | 'stable' | 'decaying';
}

export interface SubjectStudyRoi {
  subject: string;
  totalStudyHours: number;
  averageMark: number;
  roiScore: number; // Marks per 10 Study Hours
  efficiencyBadge: 'High Yield ' | 'Optimal Balance ' | 'Low Yield Alert ';
}

export interface GradeOutcomeProbability {
  tier: string;
  probabilityPct: number;
  color: string;
}

export type PrescriptionCategory =
  | 'efficiency'
  | 'balance'
  | 'burnout'
  | 'fatigue'
  | 'mastery'
  | 'strategy'
  | 'mechanics'
  | 'calculus'
  | 'organic'
  | 'active_recall'
  | 'spaced_retrieval';

export interface AiStudyPrescription {
  id: string;
  ruleId?: string;
  category: PrescriptionCategory;
  severity: 'mastery' | 'alert' | 'urgent' | 'focus';
  title: string;
  diagnosis: string;
  actionablePrescription: string;
  targetSubject?: string;
  projectedZGain?: number;
}
