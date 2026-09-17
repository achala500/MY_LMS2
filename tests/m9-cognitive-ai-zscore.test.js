/**
 * StudySync M9: Cognitive AI Study Bot & Dynamic Z-Score Velocity Test Suite
 * 
 * Comprehensive verification of:
 * 1. Empirical Bayes standardization & National Norms (κ=2.0)
 * 2. Hastings Rational Polynomial CDF approximation (|ε(z)| < 7.5 × 10^-8)
 * 3. Dynamic Z-Score velocity (V_Z) & Dual EMA momentum (EMA_3 - EMA_5)
 * 4. University cutoff sensitivity (dZ/dX_j = 1 / (3*σ_j)) & target gap analysis
 * 5. Multi-factor Cognitive Fatigue Index (F_cog) & 4 tiers
 * 6. Shannon entropy subject equilibrium (E_norm) & reallocation targets
 * 7. Physical Science heuristic rule triggers (Maths, Physics, Chem, ICT)
 * 8. Biological Science heuristic rule triggers (Bio, Chem, Physics, Agri)
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  NATIONAL_SUBJECT_STATS,
  UNIVERSITY_CUTOFF_TIERS,
  calculateSubjectZScore,
  calculateSubjectZScoreDetail,
  calculatePercentileFromZ,
  calculateCompositeZScore,
  calculateSubjectEma,
  calculateDynamicVelocity,
  calculateTargetGapAnalysis,
  calculateCognitiveFatigueIndex,
  calculateSubjectEntropyEquilibrium,
  calculateStudyRoi,
  generateAiPrescriptions,
  generateComprehensiveCognitiveReport,
} from './test-harness.js';

test('M9-1: National Norms & Empirical Bayes Posterior Shrinkage', async (t) => {
  await t.test('Department of Examinations national norms verify exact values', () => {
    assert.equal(NATIONAL_SUBJECT_STATS['Combined Maths'].mean, 42.5);
    assert.equal(NATIONAL_SUBJECT_STATS['Combined Maths'].stdDev, 18.2);
    assert.equal(NATIONAL_SUBJECT_STATS['Physics'].mean, 46.0);
    assert.equal(NATIONAL_SUBJECT_STATS['Physics'].stdDev, 17.5);
    assert.equal(NATIONAL_SUBJECT_STATS['Chemistry'].mean, 48.2);
    assert.equal(NATIONAL_SUBJECT_STATS['Chemistry'].stdDev, 16.8);
    assert.equal(NATIONAL_SUBJECT_STATS['Biology'].mean, 49.5);
    assert.equal(NATIONAL_SUBJECT_STATS['Biology'].stdDev, 16.2);
    assert.equal(NATIONAL_SUBJECT_STATS['ICT'].mean, 52.0);
    assert.equal(NATIONAL_SUBJECT_STATS['ICT'].stdDev, 15.5);
    assert.equal(NATIONAL_SUBJECT_STATS['Agriculture'].mean, 54.0);
    assert.equal(NATIONAL_SUBJECT_STATS['Agriculture'].stdDev, 14.8);
  });

  await t.test('Empirical Bayes shrinkage shrinks n=1 heavily toward prior μ_0', () => {
    // For Combined Maths (μ=42.5, σ=18.2, κ=2.0)
    // If raw score is 80 with n=1:
    // Bayesian mean = (1/(1+2)) * 80 + (2/(1+2)) * 42.5 = 26.6667 + 28.3333 = 55.0000
    // Z = (55.0 - 42.5) / 18.2 = 12.5 / 18.2 ≈ 0.6868
    const n1 = calculateSubjectZScore('Combined Maths', 80, 1);
    assert.equal(n1.subject, 'Combined Maths');
    assert.equal(n1.grade, 'A');
    assert.ok(Math.abs(n1.zScore - 0.6868) < 0.001);
    assert.equal(n1.confidencePct, 42); // 1 - exp(-0.55 * 1) ≈ 42.3%
  });

  await t.test('Empirical Bayes shrinkage converges toward sample mean as n grows', () => {
    // For n=10, weight on raw score is 10/12 ≈ 83.3%
    const n10 = calculateSubjectZScore('Combined Maths', 80, 10);
    // Bayesian mean = (10/12) * 80 + (2/12) * 42.5 = 66.6667 + 7.0833 = 73.7500
    // Z = (73.75 - 42.5) / 18.2 = 31.25 / 18.2 ≈ 1.7170
    assert.ok(Math.abs(n10.zScore - 1.717) < 0.001);
    assert.ok(n10.confidencePct >= 99);
  });
});

test('M9-2: Hastings Rational Polynomial CDF & Islandwide Percentile', async (t) => {
  await t.test('Hastings CDF approximation at standard normal landmarks', () => {
    // Z = 0.0 -> 50.0%
    assert.equal(calculatePercentileFromZ(0.0), 50.0);
    // Z = 1.0 -> ~84.1%
    assert.equal(calculatePercentileFromZ(1.0), 84.1);
    // Z = 1.96 -> ~97.5%
    assert.equal(calculatePercentileFromZ(1.96), 97.5);
    // Z = 2.05 (Colombo cutoff) -> ~98.0%
    assert.equal(calculatePercentileFromZ(2.05), 98.0);
    // Z = -1.0 -> ~15.9%
    assert.equal(calculatePercentileFromZ(-1.0), 15.9);
  });
});

test('M9-3: Dynamic Z-Score Velocity & Dual EMA Momentum', async (t) => {
  await t.test('Dual EMA calculation and positive momentum detection', () => {
    const tests = [
      { id: '1', studyId: 'SG-MATH-0001', studentEmail: 'test@example.com', testDate: '2026-08-01', examType: 'Term Test', subject: 'Combined Maths', paperTitle: 'Paper 1', score: 60 },
      { id: '2', studyId: 'SG-MATH-0001', studentEmail: 'test@example.com', testDate: '2026-08-10', examType: 'Model Paper', subject: 'Combined Maths', paperTitle: 'Paper 2', score: 70 },
      { id: '3', studyId: 'SG-MATH-0001', studentEmail: 'test@example.com', testDate: '2026-08-20', examType: 'Model Paper', subject: 'Combined Maths', paperTitle: 'Paper 3', score: 85 },
    ];

    const ema = calculateSubjectEma('Combined Maths', tests);
    assert.equal(ema.subject, 'Combined Maths');
    assert.ok(ema.currentEma3 > ema.currentEma5);
    assert.equal(ema.trend, 'accelerating');
    assert.ok(ema.velocity > 0);
  });

  await t.test('Composite dynamic velocity metric across stream subjects', () => {
    const tests = [
      { id: '1', studyId: 'SG-MATH-0001', studentEmail: 'test@example.com', testDate: '2026-08-01', examType: 'Term Test', subject: 'Combined Maths', paperTitle: 'Paper 1', score: 55 },
      { id: '2', studyId: 'SG-MATH-0001', studentEmail: 'test@example.com', testDate: '2026-08-01', examType: 'Term Test', subject: 'Physics', paperTitle: 'Paper 1', score: 50 },
      { id: '3', studyId: 'SG-MATH-0001', studentEmail: 'test@example.com', testDate: '2026-08-01', examType: 'Term Test', subject: 'Chemistry', paperTitle: 'Paper 1', score: 58 },
      { id: '4', studyId: 'SG-MATH-0001', studentEmail: 'test@example.com', testDate: '2026-08-25', examType: 'Model Paper', subject: 'Combined Maths', paperTitle: 'Paper 2', score: 80 },
      { id: '5', studyId: 'SG-MATH-0001', studentEmail: 'test@example.com', testDate: '2026-08-25', examType: 'Model Paper', subject: 'Physics', paperTitle: 'Paper 2', score: 75 },
      { id: '6', studyId: 'SG-MATH-0001', studentEmail: 'test@example.com', testDate: '2026-08-25', examType: 'Model Paper', subject: 'Chemistry', paperTitle: 'Paper 2', score: 82 },
    ];

    const vel = calculateDynamicVelocity(['Combined Maths', 'Physics', 'Chemistry'], tests);
    assert.ok(vel.velocityZPerMonth > 0);
    assert.equal(vel.momentumStatus, 'accelerating');
  });
});

test('M9-4: University Cutoff Partial Derivative Sensitivity & Gap Analysis', async (t) => {
  await t.test('Partial derivative dZ/dX_j = 1 / (3 * σ_j) exact calculations', () => {
    const mathDetail = calculateSubjectZScoreDetail('Combined Maths', 75, 3);
    // 1 / (3 * 18.2) = 1 / 54.6 ≈ 0.018315
    assert.ok(Math.abs(mathDetail.sensitivity - 0.018315) < 0.0001);

    const physDetail = calculateSubjectZScoreDetail('Physics', 75, 3);
    // 1 / (3 * 17.5) = 1 / 52.5 ≈ 0.019048
    assert.ok(Math.abs(physDetail.sensitivity - 0.019048) < 0.0001);

    const chemDetail = calculateSubjectZScoreDetail('Chemistry', 75, 3);
    // 1 / (3 * 16.8) = 1 / 50.4 ≈ 0.019841
    assert.ok(Math.abs(chemDetail.sensitivity - 0.019841) < 0.0001);

    const bioDetail = calculateSubjectZScoreDetail('Biology', 75, 3);
    // 1 / (3 * 16.2) = 1 / 48.6 ≈ 0.020576
    assert.ok(Math.abs(bioDetail.sensitivity - 0.020576) < 0.0001);
  });

  await t.test('Target university gap analysis and solo subject requirement', () => {
    // Current Z = 1.85, Target Tier 1 = 2.05 -> Gap = 0.20
    const gapAnalysis = calculateTargetGapAnalysis(1.85, ['Combined Maths', 'Physics', 'Chemistry'], 'colombo-eng-med');
    assert.equal(gapAnalysis.gap, 0.20);
    assert.equal(gapAnalysis.isTargetMet, false);
    // Combined Maths solo requirement: 0.20 * 3 * 18.2 = 10.92 -> ~10.9 marks
    assert.ok(Math.abs(gapAnalysis.subjectRequiredMarks['Combined Maths'] - 10.9) <= 0.2);
    // Physics solo requirement: 0.20 * 3 * 17.5 = 10.50 -> 10.5 marks
    assert.ok(Math.abs(gapAnalysis.subjectRequiredMarks['Physics'] - 10.5) <= 0.2);
  });
});

test('M9-5: Multi-Factor Cognitive Fatigue Index (F_cog)', async (t) => {
  await t.test('Optimal flow state when focus and productivity are high', () => {
    const logs = [
      { dateOfStudy: '2026-08-20', totalHours: 4, focusScore: 9, productivityScore: 9 },
      { dateOfStudy: '2026-08-21', totalHours: 5, focusScore: 9, productivityScore: 8 },
      { dateOfStudy: '2026-08-22', totalHours: 4, focusScore: 8, productivityScore: 9 },
    ];
    const fatigue = calculateCognitiveFatigueIndex(logs, 5);
    assert.ok(fatigue.fatigueIndex < 3.5);
    assert.equal(fatigue.tier, 'optimal');
    assert.ok(fatigue.flowScore >= 6.5);
  });

  await t.test('Burnout detection when focus drops and volume/streak are extreme', () => {
    const logs = [
      { dateOfStudy: '2026-08-20', totalHours: 10, focusScore: 2, productivityScore: 2 },
      { dateOfStudy: '2026-08-21', totalHours: 10, focusScore: 2, productivityScore: 2 },
      { dateOfStudy: '2026-08-22', totalHours: 10, focusScore: 2, productivityScore: 2 },
      { dateOfStudy: '2026-08-23', totalHours: 10, focusScore: 2, productivityScore: 2 },
      { dateOfStudy: '2026-08-24', totalHours: 10, focusScore: 2, productivityScore: 2 },
      { dateOfStudy: '2026-08-25', totalHours: 10, focusScore: 2, productivityScore: 2 },
      { dateOfStudy: '2026-08-26', totalHours: 10, focusScore: 2, productivityScore: 2 },
    ];
    const fatigue = calculateCognitiveFatigueIndex(logs, 40);
    assert.ok(fatigue.fatigueIndex >= 7.5);
    assert.equal(fatigue.tier, 'burnout');
  });
});

test('M9-6: Information-Theoretic Shannon Entropy Subject Equilibrium', async (t) => {
  await t.test('Equal study hours across 3 subjects achieves 100% equilibrium', () => {
    const eq = calculateSubjectEntropyEquilibrium([10, 10, 10], ['Maths', 'Physics', 'Chemistry']);
    assert.equal(eq.equilibriumPct, 100);
    assert.equal(eq.isNeglected, false);
  });

  await t.test('Severe subject neglect triggers asymmetric reallocation alert', () => {
    const eq = calculateSubjectEntropyEquilibrium([25, 2, 1], ['Maths', 'Physics', 'Chemistry']);
    assert.ok(eq.equilibriumPct < 70);
    assert.equal(eq.isNeglected, true);
    assert.ok(eq.reallocationHoursTarget > 0);
  });
});

test('M9-7: Physical Science Stream Cognitive AI Prescriptions', async (t) => {
  const member = {
    studyId: 'SG-MATH-0042',
    fullName: 'Kasun Perera',
    email: 'kasun.p@gmail.com',
    stream: 'Physical Science',
    optionalSubject: 'Chemistry',
    school: 'Royal College',
    examYear: '2026',
  };

  await t.test('Triggers MATH-DYN-01 when Dynamics bottleneck occurs', () => {
    const logs = [
      {
        dateOfStudy: '2026-08-25',
        subjects: [
          { name: 'Combined Maths', hours: 20, focus: 7, productivity: 7 },
          { name: 'Physics', hours: 5, focus: 8, productivity: 8 },
          { name: 'Chemistry', hours: 5, focus: 8, productivity: 8 },
        ],
      },
    ];
    const marks = [
      { id: '1', studyId: 'SG-MATH-0042', studentEmail: 'kasun.p@gmail.com', testDate: '2026-08-20', examType: 'Term Test', subject: 'Combined Maths', paperTitle: 'Dynamics Paper', score: 55 },
    ];

    const prescriptions = generateAiPrescriptions(member, logs, marks);
    const dynRule = prescriptions.find((p) => p.ruleId === 'MATH-DYN-01' || p.id === 'math-dyn-01');
    assert.ok(dynRule, 'MATH-DYN-01 prescription must be triggered');
    assert.equal(dynRule.severity, 'urgent');
    assert.equal(dynRule.targetSubject, 'Combined Maths');
  });

  await t.test('Triggers CHEM-PHYS-01 when Maths is high but Chemistry calculation lags', () => {
    const logs = [];
    const marks = [
      { id: '1', studyId: 'SG-MATH-0042', studentEmail: 'kasun.p@gmail.com', testDate: '2026-08-20', examType: 'Term Test', subject: 'Combined Maths', paperTitle: 'Pure Paper', score: 85 },
      { id: '2', studyId: 'SG-MATH-0042', studentEmail: 'kasun.p@gmail.com', testDate: '2026-08-20', examType: 'Term Test', subject: 'Physics', paperTitle: 'Physics Paper', score: 75 },
      { id: '3', studyId: 'SG-MATH-0042', studentEmail: 'kasun.p@gmail.com', testDate: '2026-08-20', examType: 'Term Test', subject: 'Chemistry', paperTitle: 'Equilibrium Paper', score: 52 },
    ];

    const prescriptions = generateAiPrescriptions(member, logs, marks);
    const chemPhys = prescriptions.find((p) => p.ruleId === 'CHEM-PHYS-01' || p.id === 'chem-phys-01');
    assert.ok(chemPhys, 'CHEM-PHYS-01 prescription must be triggered');
    assert.equal(chemPhys.severity, 'alert');
  });
});

test('M9-8: Biological Science Stream Cognitive AI Prescriptions', async (t) => {
  const member = {
    studyId: 'SG-BIO-0012',
    fullName: 'Nuwan Senanayake',
    email: 'nuwan.s@gmail.com',
    stream: 'Biological Science',
    optionalSubject: 'Physics',
    school: 'Ananda College',
    examYear: '2026',
  };

  await t.test('Triggers BIO-RES-01 on NIE Resource Book keyword imprecision', () => {
    const logs = [];
    const marks = [
      { id: '1', studyId: 'SG-BIO-0012', studentEmail: 'nuwan.s@gmail.com', testDate: '2026-08-10', examType: 'Model Paper', subject: 'Biology', paperTitle: 'Unit 1-4', score: 58 },
      { id: '2', studyId: 'SG-BIO-0012', studentEmail: 'nuwan.s@gmail.com', testDate: '2026-08-20', examType: 'Model Paper', subject: 'Biology', paperTitle: 'Unit 5-8', score: 62 },
    ];

    const prescriptions = generateAiPrescriptions(member, logs, marks);
    const bioRes = prescriptions.find((p) => p.ruleId === 'BIO-RES-01' || p.id === 'bio-res-01');
    assert.ok(bioRes, 'BIO-RES-01 prescription must be triggered');
    assert.equal(bioRes.severity, 'urgent');
    assert.equal(bioRes.projectedZGain, 0.28);
  });

  await t.test('Triggers BIO-CHEM-ORG-01 on Organic Chemistry deficit', () => {
    const logs = [];
    const marks = [
      { id: '1', studyId: 'SG-BIO-0012', studentEmail: 'nuwan.s@gmail.com', testDate: '2026-08-15', examType: 'Term Test', subject: 'Chemistry', paperTitle: 'Organic Paper', score: 48 },
    ];

    const prescriptions = generateAiPrescriptions(member, logs, marks);
    const orgRule = prescriptions.find((p) => p.ruleId === 'BIO-CHEM-ORG-01' || p.id === 'bio-chem-org-01');
    assert.ok(orgRule, 'BIO-CHEM-ORG-01 prescription must be triggered');
    assert.equal(orgRule.severity, 'urgent');
    assert.equal(orgRule.projectedZGain, 0.30);
  });
});

test('M9-9: Comprehensive Cognitive Report Aggregator', async (t) => {
  const member = {
    studyId: 'SG-MATH-0001',
    fullName: 'Nimali Fernando',
    email: 'nimali.f@gmail.com',
    stream: 'Physical Science',
    optionalSubject: 'Chemistry',
    school: 'Visakha Vidyalaya',
    examYear: '2026',
  };

  const logs = [
    {
      dateOfStudy: '2026-08-24',
      subjects: [
        { name: 'Combined Maths', hours: 4, focus: 9, productivity: 8 },
        { name: 'Physics', hours: 3, focus: 8, productivity: 8 },
        { name: 'Chemistry', hours: 2, focus: 9, productivity: 9 },
      ],
      totalHours: 9,
    },
  ];

  const testMarks = [
    { id: '1', studyId: 'SG-MATH-0001', studentEmail: 'nimali.f@gmail.com', testDate: '2026-08-10', examType: 'Model Paper', subject: 'Combined Maths', paperTitle: 'Paper 1', score: 78 },
    { id: '2', studyId: 'SG-MATH-0001', studentEmail: 'nimali.f@gmail.com', testDate: '2026-08-15', examType: 'Model Paper', subject: 'Combined Maths', paperTitle: 'Paper 2', score: 82 },
    { id: '3', studyId: 'SG-MATH-0001', studentEmail: 'nimali.f@gmail.com', testDate: '2026-08-20', examType: 'Model Paper', subject: 'Combined Maths', paperTitle: 'Paper 3', score: 85 },
    { id: '4', studyId: 'SG-MATH-0001', studentEmail: 'nimali.f@gmail.com', testDate: '2026-08-10', examType: 'Model Paper', subject: 'Physics', paperTitle: 'Paper 1', score: 72 },
    { id: '5', studyId: 'SG-MATH-0001', studentEmail: 'nimali.f@gmail.com', testDate: '2026-08-15', examType: 'Model Paper', subject: 'Physics', paperTitle: 'Paper 2', score: 76 },
    { id: '6', studyId: 'SG-MATH-0001', studentEmail: 'nimali.f@gmail.com', testDate: '2026-08-20', examType: 'Model Paper', subject: 'Physics', paperTitle: 'Paper 3', score: 80 },
    { id: '7', studyId: 'SG-MATH-0001', studentEmail: 'nimali.f@gmail.com', testDate: '2026-08-10', examType: 'Model Paper', subject: 'Chemistry', paperTitle: 'Paper 1', score: 80 },
    { id: '8', studyId: 'SG-MATH-0001', studentEmail: 'nimali.f@gmail.com', testDate: '2026-08-15', examType: 'Model Paper', subject: 'Chemistry', paperTitle: 'Paper 2', score: 84 },
    { id: '9', studyId: 'SG-MATH-0001', studentEmail: 'nimali.f@gmail.com', testDate: '2026-08-20', examType: 'Model Paper', subject: 'Chemistry', paperTitle: 'Paper 3', score: 88 },
  ];

  const report = generateComprehensiveCognitiveReport(member, logs, testMarks, 'colombo-eng-med');
  assert.ok(report.compositeZScore > 1.0);
  assert.ok(report.nationalPercentile > 80);
  assert.equal(report.subjects.length, 3);
  assert.ok(report.prescriptions.length > 0);
  assert.equal(report.targetGap.targetTier.id, 'colombo-eng-med');
});
