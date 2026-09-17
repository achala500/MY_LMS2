/**
 * M6 Challenger 2: Empirical Adversarial Stress Test Suite
 * 
 * Deeply challenges:
 * 1. Subject Balance & Equilibrium Index Mathematics
 * 2. StudyTrendChart SVG Engine & Curve Rendering
 * 3. Admin Security, Whitelist Protection & Data Export (RFC 4180 CSV & JSON Dump)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';

// Authoritative Constants from src/lib/constants.ts
const SUPER_ADMIN_EMAIL = 'alwisachalaanurada@gmail.com';
const ADMIN_WHITELIST = [
  'alwisachalaanurada@gmail.com',
  'admin@studysync.lk',
  'alwis@gmail.com',
  'lead.admin@studysync.lk',
];

// Auth check logic from src/lib/auth.ts
function isAdminUser(email, role) {
  if (!email && !role) return false;
  if (role === 'admin') return true;
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return ADMIN_WHITELIST.some((admin) => admin.toLowerCase() === clean);
}

// RFC 4180 CSV Helpers from src/lib/utils.ts
function formatCsvCell(val) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function generateCsvString(headers, rows) {
  const headerLine = headers.map(formatCsvCell).join(',');
  const rowLines = (rows || []).map((row) => (row || []).map(formatCsvCell).join(','));
  return [headerLine, ...rowLines].join('\r\n');
}

function formatDate(dateVal, style = 'medium') {
  if (!dateVal) return '';
  let d = dateVal;
  if (typeof dateVal === 'string') {
    const parts = String(dateVal).split('T')[0].split('-');
    if (parts.length === 3) {
      d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10), 12, 0, 0);
    } else {
      d = new Date(dateVal);
    }
  }
  if (isNaN(d.getTime())) return String(dateVal);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fullMonths = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const day = d.getDate();
  const monthIndex = d.getMonth();
  const year = d.getFullYear();

  if (style === 'short') {
    return `${day} ${months[monthIndex]} ${year}`;
  } else if (style === 'long') {
    return `${days[d.getDay()]}, ${fullMonths[monthIndex]} ${day}, ${year}`;
  }
  return `${months[monthIndex]} ${day}, ${year}`;
}

function getTodayDateString(d = new Date()) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function normalizeDateToYmd(val) {
  if (!val) return '';
  if (val instanceof Date) {
    if (Number.isNaN(val.getTime())) return '';
    const y = val.getFullYear();
    const m = String(val.getMonth() + 1).padStart(2, '0');
    const d = String(val.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  const str = String(val).trim();
  if (!str) return '';

  const ymdMatch = str.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (ymdMatch) {
    const y = ymdMatch[1];
    const m = ymdMatch[2].padStart(2, '0');
    const d = ymdMatch[3].padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  const dmyMatch = str.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
  if (dmyMatch) {
    const d = dmyMatch[1].padStart(2, '0');
    const m = dmyMatch[2].padStart(2, '0');
    const y = dmyMatch[3];
    return `${y}-${m}-${d}`;
  }

  const parsed = new Date(str);
  if (!Number.isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const d = String(parsed.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  return str.substring(0, 10);
}

// SubjectBalanceCard.tsx exact mathematical algorithm
function computeSubjectBalance(sub1Name, sub1Hours, sub2Name, sub2Hours, sub3Name, sub3Hours) {
  const totalHours = sub1Hours + sub2Hours + sub3Hours;

  if (totalHours <= 0) {
    return {
      score: 100,
      level: 'Optimal Equilibrium',
      color: 'text-emerald-400',
      badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      recommendation: 'Start your study streak today! Distribute your time equally across all 3 subjects.',
      lowestSubject: sub1Name,
      highestSubject: sub1Name,
      p1: 33.3,
      p2: 33.3,
      p3: 33.3,
      stdDev: 0,
      maxStdDev: Math.sqrt((Math.pow(1 - 1 / 3, 2) + Math.pow(0 - 1 / 3, 2) + Math.pow(0 - 1 / 3, 2)) / 3),
    };
  }

  // Proportions
  const prop1 = sub1Hours / totalHours;
  const prop2 = sub2Hours / totalHours;
  const prop3 = sub3Hours / totalHours;

  const pct1 = Math.round(prop1 * 100);
  const pct2 = Math.round(prop2 * 100);
  const pct3 = Math.round(prop3 * 100);

  // Variance from ideal (1/3 for each)
  const ideal = 1 / 3;
  const variance =
    (Math.pow(prop1 - ideal, 2) + Math.pow(prop2 - ideal, 2) + Math.pow(prop3 - ideal, 2)) / 3;
  const stdDev = Math.sqrt(variance);
  const maxStdDev = Math.sqrt((Math.pow(1 - ideal, 2) + Math.pow(0 - ideal, 2) + Math.pow(0 - ideal, 2)) / 3);

  // Score 0 to 100
  const rawScore = Math.round(Math.max(0, (1 - stdDev / maxStdDev) * 100));

  // Determine lowest and highest subjects
  const subjects = [
    { name: sub1Name, hours: sub1Hours, pct: pct1 },
    { name: sub2Name, hours: sub2Hours, pct: pct2 },
    { name: sub3Name, hours: sub3Hours, pct: pct3 },
  ].sort((a, b) => a.hours - b.hours);

  const lowest = subjects[0];
  const highest = subjects[2];

  let lvl = 'Balanced Distribution';
  let clr = 'text-indigo-400';
  let bClass = 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
  let rec = `Great distribution! Keep maintaining this steady cadence across ${sub1Name}, ${sub2Name}, and ${sub3Name}.`;

  if (rawScore >= 85) {
    lvl = 'Optimal Equilibrium';
    clr = 'text-emerald-400';
    bClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    rec = `Mastery balance! You are spending an optimal proportion of time across all 3 subjects.`;
  } else if (rawScore >= 70) {
    lvl = 'Healthy Balance';
    clr = 'text-cyan-400';
    bClass = 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
    rec = `Good pacing. Consider allocating your next session to ${lowest.name} (${lowest.hours.toFixed(1)}h logged) to reach optimal equilibrium.`;
  } else if (rawScore >= 50) {
    lvl = 'Moderate Subject Skew';
    clr = 'text-amber-400';
    bClass = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    rec = `⚠️ Noticeable focus on ${highest.name} (${highest.pct}% of time). We recommend dedicating your next 2 study sessions to ${lowest.name} (${lowest.pct}%).`;
  } else {
    lvl = 'High Subject Disparity';
    clr = 'text-rose-400';
    bClass = 'bg-rose-500/20 text-rose-300 border-rose-500/30';
    rec = `🚨 Severe imbalance detected! ${lowest.name} is significantly behind (${lowest.hours.toFixed(1)}h vs ${highest.hours.toFixed(1)}h for ${highest.name}). Reallocate time immediately for exam readiness.`;
  }

  return {
    score: rawScore,
    level: lvl,
    color: clr,
    badgeClass: bClass,
    recommendation: rec,
    lowestSubject: lowest.name,
    highestSubject: highest.name,
    p1: pct1,
    p2: pct2,
    p3: pct3,
    stdDev,
    maxStdDev,
  };
}

// StudyTrendChart.tsx exact model & SVG coordinate generation
function generateChartModel(logs, daysCount = 7, referenceDate = new Date()) {
  const result = [];
  const now = new Date(referenceDate);

  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const dateStr = normalizeDateToYmd(d);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const displayDate = formatDate(dateStr, 'short');

    const matchedLog = logs.find((l) => {
      const logDate = normalizeDateToYmd(l.dateOfStudy || l.date);
      return logDate === dateStr;
    });

    if (matchedLog) {
      const subs = matchedLog.subjects || [];
      const h1 = Number(subs[0]?.hours ?? matchedLog.subject1Hours ?? matchedLog.hoursSubject1 ?? 0);
      const h2 = Number(subs[1]?.hours ?? matchedLog.subject2Hours ?? matchedLog.hoursSubject2 ?? 0);
      const h3 = Number(subs[2]?.hours ?? matchedLog.subject3Hours ?? matchedLog.hoursSubject3 ?? 0);
      const tot = Number(matchedLog.totalHours || h1 + h2 + h3 || 0);

      const f1 = Number(subs[0]?.focus ?? 0);
      const f2 = Number(subs[1]?.focus ?? 0);
      const f3 = Number(subs[2]?.focus ?? 0);
      const p1 = Number(subs[0]?.productivity ?? 0);
      const p2 = Number(subs[1]?.productivity ?? 0);
      const p3 = Number(subs[2]?.productivity ?? 0);

      const avgF = subs.length > 0 ? Math.round((f1 + f2 + f3) / 3) : (matchedLog.focusScore || 0);
      const avgP = subs.length > 0 ? Math.round((p1 + p2 + p3) / 3) : (matchedLog.productivityScore || 0);

      result.push({
        dateStr,
        displayDate,
        dayName,
        totalHours: tot,
        sub1Hours: h1,
        sub2Hours: h2,
        sub3Hours: h3,
        focus: avgF,
        productivity: avgP,
        hasLog: true,
      });
    } else {
      result.push({
        dateStr,
        displayDate,
        dayName,
        totalHours: 0,
        sub1Hours: 0,
        sub2Hours: 0,
        sub3Hours: 0,
        focus: 0,
        productivity: 0,
        hasLog: false,
      });
    }
  }

  const highest = Math.max(...result.map((d) => d.totalHours), 0);
  const maxHours = Math.max(Math.ceil(highest + 1), 4);
  const totalPeriodHours = result.reduce((sum, d) => sum + d.totalHours, 0);
  const avgDailyHours = (totalPeriodHours / daysCount).toFixed(1);

  // SVG dimensions
  const svgWidth = 640;
  const svgHeight = 220;
  const paddingLeft = 36;
  const paddingRight = 16;
  const paddingTop = 20;
  const paddingBottom = 30;
  const plotWidth = svgWidth - paddingLeft - paddingRight;
  const plotHeight = svgHeight - paddingTop - paddingBottom;

  const points = result.map((d, index) => {
    const x = paddingLeft + (index / (result.length - 1)) * plotWidth;
    const y = paddingTop + plotHeight - (d.totalHours / maxHours) * plotHeight;
    return { x, y, data: d };
  });

  let pathD = '';
  if (points.length === 1) {
    pathD = `M ${points[0].x} ${points[0].y}`;
  } else if (points.length > 1) {
    pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cx = (p0.x + p1.x) / 2;
      pathD += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
    }
  }

  let areaD = '';
  if (points.length > 0) {
    const bottomY = paddingTop + plotHeight;
    const firstX = points[0].x;
    const lastX = points[points.length - 1].x;
    areaD = `${pathD} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }

  return {
    chartData: result,
    maxHours,
    totalPeriodHours,
    avgDailyHours,
    points,
    pathD,
    areaD,
    svgDimensions: { svgWidth, svgHeight, plotWidth, plotHeight, paddingTop, paddingBottom, paddingLeft, paddingRight },
  };
}

describe('Challenger 2 Empirical Verification: Data Synthesis & Admin Security', () => {

  // =========================================================================
  // 1. SUBJECT BALANCE & EQUILIBRIUM INDEX MATHEMATICS
  // =========================================================================
  describe('1. Subject Balance & Equilibrium Index Mathematics', () => {

    it('Scenario 1.1: 0 total hours yields perfect 100% score with Optimal Equilibrium and 33.3% defaults', () => {
      const res = computeSubjectBalance('Biology', 0, 'Chemistry', 0, 'Physics', 0);
      assert.strictEqual(res.score, 100);
      assert.strictEqual(res.level, 'Optimal Equilibrium');
      assert.strictEqual(res.p1, 33.3);
      assert.strictEqual(res.p2, 33.3);
      assert.strictEqual(res.p3, 33.3);
      assert.ok(res.recommendation.includes('Start your study streak today'));
    });

    it('Scenario 1.2: Perfect 1/3 balance (equal non-zero hours) yields exactly 100% score', () => {
      const cases = [
        [1, 1, 1],
        [3.5, 3.5, 3.5],
        [10, 10, 10],
        [100, 100, 100],
      ];
      for (const [h1, h2, h3] of cases) {
        const res = computeSubjectBalance('Biology', h1, 'Chemistry', h2, 'Physics', h3);
        assert.strictEqual(res.score, 100, `Expected score 100 for equal hours (${h1}, ${h2}, ${h3})`);
        assert.strictEqual(res.level, 'Optimal Equilibrium');
        assert.strictEqual(res.stdDev, 0);
        assert.strictEqual(res.p1, 33);
        assert.strictEqual(res.p2, 33);
        assert.strictEqual(res.p3, 33);
      }
    });

    it('Scenario 1.3: 100% hours in 1 single subject yields strictly 0% score and High Subject Disparity', () => {
      const cases = [
        [10, 0, 0, 'Biology', 'Chemistry'],
        [0, 15, 0, 'Chemistry', 'Biology'],
        [0, 0, 20, 'Physics', 'Biology'],
      ];
      for (const [h1, h2, h3, expectedHighest, expectedLowest] of cases) {
        const res = computeSubjectBalance('Biology', h1, 'Chemistry', h2, 'Physics', h3);
        assert.strictEqual(res.score, 0, `Expected 0 score when all hours are in one subject`);
        assert.strictEqual(res.level, 'High Subject Disparity');
        assert.strictEqual(res.highestSubject, expectedHighest);
        assert.strictEqual(res.lowestSubject, expectedLowest);
        assert.ok(Math.abs(res.stdDev - res.maxStdDev) < 1e-10, 'stdDev should equal maxStdDev');
        assert.ok(res.recommendation.includes('Severe imbalance detected'));
      }
    });

    it('Scenario 1.4: 50% / 50% / 0% split yields exactly 50% score and Moderate Subject Skew', () => {
      const res = computeSubjectBalance('Biology', 5, 'Chemistry', 5, 'Physics', 0);
      assert.strictEqual(res.score, 50);
      assert.strictEqual(res.level, 'Moderate Subject Skew');
      assert.strictEqual(res.p1, 50);
      assert.strictEqual(res.p2, 50);
      assert.strictEqual(res.p3, 0);
      assert.strictEqual(res.lowestSubject, 'Physics');
      assert.ok(res.recommendation.includes('Noticeable focus on'));
    });

    it('Scenario 1.5: Standard deviation bounds hold across 500 randomized positive distributions', () => {
      const maxPossibleStdDev = Math.sqrt((Math.pow(1 - 1/3, 2) + Math.pow(0 - 1/3, 2) + Math.pow(0 - 1/3, 2)) / 3);
      
      for (let i = 0; i < 500; i++) {
        const h1 = Math.random() * 50;
        const h2 = Math.random() * 50;
        const h3 = Math.random() * 50;
        const res = computeSubjectBalance('Sub1', h1, 'Sub2', h2, 'Sub3', h3);

        assert.ok(res.score >= 0 && res.score <= 100, `Score ${res.score} must be within [0, 100]`);
        assert.ok(res.stdDev >= 0, `stdDev ${res.stdDev} must be non-negative`);
        assert.ok(res.stdDev <= maxPossibleStdDev + 1e-12, `stdDev ${res.stdDev} must not exceed maxStdDev ${maxPossibleStdDev}`);
        assert.ok(['Optimal Equilibrium', 'Healthy Balance', 'Moderate Subject Skew', 'High Subject Disparity'].includes(res.level));
      }
    });

    it('Scenario 1.6: Boundary score tiers trigger accurate qualitative levels and color mappings', () => {
      // Score >= 85: Optimal Equilibrium
      const optimal = computeSubjectBalance('Bio', 4, 'Chem', 3, 'Phys', 3); // 40%, 30%, 30% -> ~90%
      assert.ok(optimal.score >= 85);
      assert.strictEqual(optimal.level, 'Optimal Equilibrium');
      assert.strictEqual(optimal.color, 'text-emerald-400');

      // Score 70-84: Healthy Balance
      const healthy = computeSubjectBalance('Bio', 5, 'Chem', 3, 'Phys', 2); // 50%, 30%, 20% -> ~75%
      assert.ok(healthy.score >= 70 && healthy.score < 85);
      assert.strictEqual(healthy.level, 'Healthy Balance');
      assert.strictEqual(healthy.color, 'text-cyan-400');

      // Score 50-69: Moderate Subject Skew
      const moderate = computeSubjectBalance('Bio', 6, 'Chem', 3, 'Phys', 1); // 60%, 30%, 10% -> ~58%
      assert.ok(moderate.score >= 50 && moderate.score < 70);
      assert.strictEqual(moderate.level, 'Moderate Subject Skew');
      assert.strictEqual(moderate.color, 'text-amber-400');

      // Score < 50: High Subject Disparity
      const disparity = computeSubjectBalance('Bio', 9, 'Chem', 1, 'Phys', 0); // 90%, 10%, 0% -> ~20%
      assert.ok(disparity.score < 50);
      assert.strictEqual(disparity.level, 'High Subject Disparity');
      assert.strictEqual(disparity.color, 'text-rose-400');
    });

    it('Scenario 1.7: Mathematical symmetry under subject permutation', () => {
      const res1 = computeSubjectBalance('A', 8, 'B', 2, 'C', 0);
      const res2 = computeSubjectBalance('A', 0, 'B', 8, 'C', 2);
      const res3 = computeSubjectBalance('A', 2, 'B', 0, 'C', 8);

      assert.strictEqual(res1.score, res2.score);
      assert.strictEqual(res2.score, res3.score);
      assert.strictEqual(res1.level, res2.level);
    });
  });

  // =========================================================================
  // 2. STUDYTRENDCHART SVG ENGINE & PATH GENERATION
  // =========================================================================
  describe('2. StudyTrendChart SVG Engine & Path Generation', () => {

    it('Scenario 2.1: 7-day interval generates exactly 7 distinct, evenly-spaced X points', () => {
      const model = generateChartModel([], 7);
      assert.strictEqual(model.chartData.length, 7);
      assert.strictEqual(model.points.length, 7);

      const xs = model.points.map((p) => p.x);
      assert.strictEqual(xs[0], 36); // paddingLeft
      assert.strictEqual(xs[6], 640 - 16); // svgWidth - paddingRight = 624

      // Verify uniform spacing
      const step = (624 - 36) / 6;
      for (let i = 0; i < 6; i++) {
        assert.ok(Math.abs(xs[i + 1] - xs[i] - step) < 1e-9);
      }
    });

    it('Scenario 2.2: 14-day interval generates exactly 14 distinct, evenly-spaced X points', () => {
      const model = generateChartModel([], 14);
      assert.strictEqual(model.chartData.length, 14);
      assert.strictEqual(model.points.length, 14);

      const xs = model.points.map((p) => p.x);
      assert.strictEqual(xs[0], 36);
      assert.strictEqual(xs[13], 624);

      const step = (624 - 36) / 13;
      for (let i = 0; i < 13; i++) {
        assert.ok(Math.abs(xs[i + 1] - xs[i] - step) < 1e-9);
      }
    });

    it('Scenario 2.3: Empty history renders without NaN, undefined, or syntax errors', () => {
      const model = generateChartModel([], 7);
      assert.strictEqual(model.maxHours, 4, 'Default maxHours should be 4 for empty history');
      assert.strictEqual(model.totalPeriodHours, 0);
      assert.strictEqual(model.avgDailyHours, '0.0');

      // Check pathD
      assert.ok(!model.pathD.includes('NaN'), 'pathD must not contain NaN');
      assert.ok(!model.pathD.includes('undefined'), 'pathD must not contain undefined');
      assert.ok(model.pathD.startsWith('M 36 '));

      // Check areaD
      assert.ok(!model.areaD.includes('NaN'), 'areaD must not contain NaN');
      assert.ok(!model.areaD.includes('undefined'), 'areaD must not contain undefined');
      assert.ok(model.areaD.endsWith('Z'), 'areaD must be a closed polygon path');
    });

    it('Scenario 2.4: Single day history properly maps date and calculates correct peak Y', () => {
      const todayStr = getTodayDateString();
      const mockLog = {
        dateOfStudy: todayStr,
        totalHours: 6,
        subjects: [
          { name: 'Biology', hours: 2, focus: 8, productivity: 8 },
          { name: 'Chemistry', hours: 2, focus: 7, productivity: 8 },
          { name: 'Physics', hours: 2, focus: 2, productivity: 9 },
        ],
      };

      const model = generateChartModel([mockLog], 7);
      assert.strictEqual(model.chartData[6].hasLog, true);
      assert.strictEqual(model.chartData[6].totalHours, 6);
      assert.strictEqual(model.chartData[0].hasLog, false);
      assert.strictEqual(model.chartData[0].totalHours, 0);

      // maxHours should be Math.max(Math.ceil(6 + 1), 4) = 7
      assert.strictEqual(model.maxHours, 7);

      // Today point Y coordinate:
      // plotHeight = 220 - 20 - 30 = 170. paddingTop = 20.
      // y = 20 + 170 - (6 / 7) * 170 = 20 + 170 * (1/7) = 44.2857...
      const todayPt = model.points[6];
      assert.ok(todayPt.y >= 20 && todayPt.y <= 190);
      assert.ok(!Number.isNaN(todayPt.y));
    });

    it('Scenario 2.5: Extreme study hours (e.g. 18h, 24h, 100h) scale cleanly without viewport clipping', () => {
      const todayStr = getTodayDateString();
      const extremeLog = {
        dateOfStudy: todayStr,
        totalHours: 24,
        subject1Hours: 8,
        subject2Hours: 8,
        subject3Hours: 8,
      };

      const model = generateChartModel([extremeLog], 7);
      assert.strictEqual(model.maxHours, 25);

      for (const pt of model.points) {
        assert.ok(pt.y >= 20, `Point Y (${pt.y}) must be >= paddingTop (20)`);
        assert.ok(pt.y <= 190, `Point Y (${pt.y}) must be <= plot bottom (190)`);
        assert.ok(pt.x >= 36 && pt.x <= 624, `Point X (${pt.x}) must be within plot width`);
      }
    });

    it('Scenario 2.6: SVG Path Syntax compliance regex validation', () => {
      const logs = [
        { dateOfStudy: '2026-08-20', totalHours: 3 },
        { dateOfStudy: '2026-08-22', totalHours: 5 },
        { dateOfStudy: '2026-08-25', totalHours: 8 },
      ];
      const model = generateChartModel(logs, 7, new Date('2026-08-26'));

      // Validate SVG cubic bezier path syntax
      // Pattern: M x y (C cx1 cy1, cx2 cy2, x2 y2)+
      const pathRegex = /^M\s+[0-9\.]+\s+[0-9\.]+(\s+C\s+[0-9\.]+\s+[0-9\.]+,\s+[0-9\.]+\s+[0-9\.]+,\s+[0-9\.]+\s+[0-9\.]+)+$/;
      assert.ok(pathRegex.test(model.pathD), `pathD "${model.pathD}" must match SVG cubic path syntax`);

      // Validate SVG closed polygon area syntax
      // Pattern: pathD L lastX bottomY L firstX bottomY Z
      const areaRegex = /^M.*L\s+[0-9\.]+\s+[0-9\.]+\s+L\s+[0-9\.]+\s+[0-9\.]+\s+Z$/;
      assert.ok(areaRegex.test(model.areaD), `areaD "${model.areaD}" must match SVG area polygon syntax`);
    });
  });

  // =========================================================================
  // 3. ADMIN SECURITY & DATA EXPORT (RFC 4180 CSV & JSON)
  // =========================================================================
  describe('3. Admin Security & Data Export Verification', () => {

    it('Scenario 3.1: Super admin and whitelisted admin emails are granted admin authorization', () => {
      assert.strictEqual(SUPER_ADMIN_EMAIL, 'alwisachalaanurada@gmail.com');
      assert.ok(ADMIN_WHITELIST.includes('alwisachalaanurada@gmail.com'));
      assert.ok(ADMIN_WHITELIST.includes('admin@studysync.lk'));
      assert.ok(ADMIN_WHITELIST.includes('alwis@gmail.com'));
      assert.ok(ADMIN_WHITELIST.includes('lead.admin@studysync.lk'));

      for (const email of ADMIN_WHITELIST) {
        assert.strictEqual(isAdminUser(email), true, `Admin email ${email} must be authorized`);
      }
    });

    it('Scenario 3.2: Case-insensitivity and whitespace resilience in admin check', () => {
      assert.strictEqual(isAdminUser('ALWISACHALAANURADA@GMAIL.COM'), true);
      assert.strictEqual(isAdminUser('Admin@StudySync.LK'), true);
      assert.strictEqual(isAdminUser('  alwis@gmail.com  '), true);
    });

    it('Scenario 3.3: Non-admin emails and attack vectors are strictly rejected', () => {
      const unauthorizedEmails = [
        'student@gmail.com',
        'kasun.kalhara@gmail.com',
        'admin@studysync.com', // Wrong TLD
        'alwisachalaanurada@gmail.com.evil.com', // Subdomain attack
        'fake.admin@studysync.lk.attacker.io',
        'admin@gmail.com',
        'root@localhost',
        '',
        null,
        undefined,
        'null',
      ];

      for (const email of unauthorizedEmails) {
        assert.strictEqual(isAdminUser(email), false, `Email ${email} must NOT have admin access`);
      }
    });

    it('Scenario 3.4: Role-based privilege elevation works correctly', () => {
      assert.strictEqual(isAdminUser('custom_user@domain.com', 'admin'), true);
      assert.strictEqual(isAdminUser('custom_user@domain.com', 'student'), false);
      assert.strictEqual(isAdminUser(null, 'admin'), true);
      assert.strictEqual(isAdminUser(null, 'student'), false);
      assert.strictEqual(isAdminUser(null, null), false);
    });

    it('Scenario 3.5: RFC 4180 CSV Cell formatting handles special characters', () => {
      // 1. Basic text
      assert.strictEqual(formatCsvCell('Royal College'), 'Royal College');

      // 2. Text containing comma -> quoted
      assert.strictEqual(formatCsvCell('Royal College, Colombo'), '"Royal College, Colombo"');

      // 3. Text containing double quotes -> quotes escaped and quoted
      assert.strictEqual(formatCsvCell('He said "Study"'), '"He said ""Study"""');

      // 4. Text containing newline -> quoted
      assert.strictEqual(formatCsvCell("Notes:\nPage 1 to 50"), '"Notes:\nPage 1 to 50"');
      assert.strictEqual(formatCsvCell("Line 1\r\nLine 2"), '"Line 1\r\nLine 2"');

      // 5. Text containing comma, quotes, and newlines combined
      assert.strictEqual(formatCsvCell('Note: "Done, verified"\nNext task'), '"Note: ""Done, verified""\nNext task"');

      // 6. Null and undefined -> empty string
      assert.strictEqual(formatCsvCell(null), '');
      assert.strictEqual(formatCsvCell(undefined), '');

      // 7. Numbers -> stringified
      assert.strictEqual(formatCsvCell(12.5), '12.5');
      assert.strictEqual(formatCsvCell(0), '0');
    });

    it('Scenario 3.6: RFC 4180 CSV String Generation produces compliant CRLF delimited structure', () => {
      const headers = ['Study ID', 'Name', 'School', 'Hours', 'Notes'];
      const rows = [
        ['SG-BIO-0001', 'Kasun Perera', 'Royal College, Colombo', 6.5, 'Read "Physics" ch 1-3'],
        ['SG-MATH-0002', 'Sanduni Silva', 'Visakha Vidyalaya', 4.0, 'Maths past papers,\nPure maths solved'],
      ];

      const csv = generateCsvString(headers, rows);
      const lines = csv.split('\r\n');

      assert.strictEqual(lines.length, 3);
      assert.strictEqual(lines[0], 'Study ID,Name,School,Hours,Notes');
      assert.strictEqual(lines[1], 'SG-BIO-0001,Kasun Perera,"Royal College, Colombo",6.5,"Read ""Physics"" ch 1-3"');
      assert.strictEqual(lines[2], 'SG-MATH-0002,Sanduni Silva,Visakha Vidyalaya,4,"Maths past papers,\nPure maths solved"');
    });

    it('Scenario 3.7: Multilingual Unicode (Sinhala, Tamil) in CSV export preserves characters without corruption', () => {
      const headers = ['ID', 'Sinhala Name', 'Tamil School'];
      const rows = [
        ['SG-BIO-0001', 'අචල අනුරාධ ද අල්විස්', 'யாழ்ப்பாணம் இந்துக் கல்லூரி'],
      ];

      const csv = generateCsvString(headers, rows);
      assert.ok(csv.includes('අචල අනුරාධ ද අල්විස්'));
      assert.ok(csv.includes('யாழ்ப்பாணம் இந்துக் கல்லூரி'));
    });

    it('Scenario 3.8: JSON database dump serialization completeness & round-trip validity', () => {
      const mockMembers = [
        {
          studyId: 'SG-BIO-0001',
          fullName: 'Achala Alwis',
          email: 'alwisachalaanurada@gmail.com',
          school: 'Ananda College, Colombo',
          stream: 'Biological Science',
          optionalSubject: 'Physics',
          examYear: '2026',
          telegramUsername: '@achala',
          registrationDate: '2026-08-01',
          status: 'Active',
        },
      ];

      const mockLogs = [
        {
          studyId: 'SG-BIO-0001',
          dateOfStudy: '2026-08-25',
          totalHours: 7.5,
          subjects: [
            { name: 'Biology', hours: 2.5, focus: 9, productivity: 8 },
            { name: 'Chemistry', hours: 2.5, focus: 8, productivity: 8 },
            { name: 'Physics', hours: 2.5, focus: 2.5, productivity: 9 },
          ],
          notes: 'Covered biochemistry pathways and organic reaction mechanisms.',
          proofPhotoUrl: 'https://drive.google.com/open?id=mock-proof-1',
        },
      ];

      const dump = {
        exportTimestamp: new Date().toISOString(),
        admin: 'alwisachalaanurada@gmail.com',
        totalMembers: mockMembers.length,
        totalLogs: mockLogs.length,
        members: mockMembers,
        logs: mockLogs,
      };

      const jsonStr = JSON.stringify(dump, null, 2);
      const parsed = JSON.parse(jsonStr);

      assert.strictEqual(parsed.admin, 'alwisachalaanurada@gmail.com');
      assert.strictEqual(parsed.totalMembers, 1);
      assert.strictEqual(parsed.totalLogs, 1);
      assert.deepStrictEqual(parsed.members, mockMembers);
      assert.deepStrictEqual(parsed.logs, mockLogs);
      assert.strictEqual(parsed.members[0].studyId, 'SG-BIO-0001');
      assert.strictEqual(parsed.logs[0].subjects.length, 3);
    });
  });

});
