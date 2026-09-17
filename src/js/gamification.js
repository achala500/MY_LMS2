/**
 * StudySync Gamification & Progression Engine (ESM)
 */

export const LEVEL_TIERS = [
  { level: 1, title: 'Novice', minXp: 0 },
  { level: 2, title: 'Apprentice', minXp: 300 },
  { level: 3, title: 'Scholar', minXp: 800 },
  { level: 4, title: 'Achiever', minXp: 1600 },
  { level: 5, title: 'Expert', minXp: 2800 },
  { level: 6, title: 'Master', minXp: 4500 },
  { level: 7, title: 'Grandmaster', minXp: 7000 },
];

export function calculateXp(totalHours = 0, streak = 0, sessionCount = 0) {
  const safeHours = Math.max(0, Number(totalHours) || 0);
  const safeStreak = Math.max(0, Number(streak) || 0);
  const safeSessions = Math.max(0, Number(sessionCount) || 0);

  const hoursXp = Math.round(safeHours * 100);
  const streakXp = safeStreak * 50;
  const sessionXp = safeSessions * 25;

  return hoursXp + streakXp + sessionXp;
}

export function calculateLevelProgression(totalXp = 0) {
  const xp = Math.max(0, totalXp);

  let currentTier = LEVEL_TIERS[0];
  let nextTier = LEVEL_TIERS[1];

  for (let i = LEVEL_TIERS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_TIERS[i].minXp) {
      currentTier = LEVEL_TIERS[i];
      nextTier = LEVEL_TIERS[i + 1] || null;
      break;
    }
  }

  if (!nextTier) {
    return {
      level: currentTier.level,
      rankTitle: currentTier.title,
      currentLevelFloorXp: currentTier.minXp,
      nextLevelThresholdXp: currentTier.minXp + 3000,
      levelProgressPct: 100,
    };
  }

  const range = nextTier.minXp - currentTier.minXp;
  const earnedInLevel = xp - currentTier.minXp;
  const levelProgressPct = Math.min(100, Math.max(0, Math.round((earnedInLevel / range) * 100)));

  return {
    level: currentTier.level,
    rankTitle: currentTier.title,
    currentLevelFloorXp: currentTier.minXp,
    nextLevelThresholdXp: nextTier.minXp,
    levelProgressPct,
  };
}

function inspectSessionHabits(logs = []) {
  let hasEarlyBird = false;
  let hasNightOwl = false;

  for (const log of logs) {
    if (log.timestamp) {
      try {
        const date = new Date(log.timestamp);
        const hours = date.getHours();
        if (hours >= 4 && hours < 12) hasEarlyBird = true;
        if (hours >= 20 || hours < 4) hasNightOwl = true;
      } catch (e) {}
    }

    const notesLower = String(log.notes || '').toLowerCase();
    if (notesLower.includes('morning') || notesLower.includes('early') || notesLower.includes('5am') || notesLower.includes('6am')) {
      hasEarlyBird = true;
    }
    if (notesLower.includes('night') || notesLower.includes('late') || notesLower.includes('midnight') || notesLower.includes('11pm')) {
      hasNightOwl = true;
    }
  }

  return { hasEarlyBird, hasNightOwl };
}

export function evaluateBadges(streak = 0, totalHours = 0, balanceScore = 100, logs = []) {
  const safeStreak = Math.max(0, Number(streak) || 0);
  const safeHours = Math.max(0, Number(totalHours) || 0);
  const safeBalance = Math.max(0, Math.min(100, Number(balanceScore) || 0));
  const { hasEarlyBird, hasNightOwl } = inspectSessionHabits(logs);

  return [
    {
      id: 'streak-7',
      title: '7-Day Streak',
      description: 'Maintain an unbroken 7-day daily study consistency rhythm.',
      icon: 'Flame',
      category: 'streak',
      unlocked: safeStreak >= 7,
      progress: Math.min(100, Math.round((safeStreak / 7) * 100)),
      currentValue: safeStreak,
      targetValue: 7,
      unit: 'days',
    },
    {
      id: 'streak-14',
      title: '14-Day Streak',
      description: 'Master consistency with 14 consecutive study days.',
      icon: 'Zap',
      category: 'streak',
      unlocked: safeStreak >= 14,
      progress: Math.min(100, Math.round((safeStreak / 14) * 100)),
      currentValue: safeStreak,
      targetValue: 14,
      unit: 'days',
    },
    {
      id: 'streak-30',
      title: '30-Day Master',
      description: 'Achieve legendary 30-day continuous study accountability.',
      icon: 'Crown',
      category: 'streak',
      unlocked: safeStreak >= 30,
      progress: Math.min(100, Math.round((safeStreak / 30) * 100)),
      currentValue: safeStreak,
      targetValue: 30,
      unit: 'days',
    },
    {
      id: 'hours-50',
      title: '50h Club',
      description: 'Accumulate 50 hours of verified study time.',
      icon: 'Award',
      category: 'hours',
      unlocked: safeHours >= 50,
      progress: Math.min(100, Math.round((safeHours / 50) * 100)),
      currentValue: Number(safeHours.toFixed(1)),
      targetValue: 50,
      unit: 'hours',
    },
    {
      id: 'hours-100',
      title: '100h Club',
      description: 'Reach the century milestone: 100 hours of deep study.',
      icon: 'Trophy',
      category: 'hours',
      unlocked: safeHours >= 100,
      progress: Math.min(100, Math.round((safeHours / 100) * 100)),
      currentValue: Number(safeHours.toFixed(1)),
      targetValue: 100,
      unit: 'hours',
    },
    {
      id: 'equilibrium-master',
      title: 'Subject Equilibrium Master',
      description: 'Attain a Subject Balance score â‰¥85% across all 3 subjects.',
      icon: 'Scale',
      category: 'mastery',
      unlocked: safeBalance >= 85 && safeHours >= 10,
      progress: Math.min(100, safeBalance),
      currentValue: safeBalance,
      targetValue: 85,
      unit: '% balance',
    },
    {
      id: 'early-bird',
      title: 'Early Bird',
      description: 'Log and complete early morning revision sessions.',
      icon: 'Sun',
      category: 'habit',
      unlocked: hasEarlyBird || logs.length >= 5,
      progress: (hasEarlyBird || logs.length >= 5) ? 100 : Math.min(100, Math.round((logs.length / 5) * 100)),
      currentValue: hasEarlyBird ? 1 : Math.min(5, logs.length),
      targetValue: 1,
      unit: 'session',
    },
    {
      id: 'night-owl',
      title: 'Night Owl',
      description: 'Log and complete dedicated late night study sessions.',
      icon: 'Moon',
      category: 'habit',
      unlocked: hasNightOwl || logs.length >= 3,
      progress: (hasNightOwl || logs.length >= 3) ? 100 : Math.min(100, Math.round((logs.length / 3) * 100)),
      currentValue: hasNightOwl ? 1 : Math.min(3, logs.length),
      targetValue: 1,
      unit: 'session',
    },
  ];
}

export function getGamificationState(streak = 0, totalHours = 0, balanceScore = 100, logs = []) {
  const sessionCount = Array.isArray(logs) ? logs.length : 0;
  const totalXp = calculateXp(totalHours, streak, sessionCount);
  const progression = calculateLevelProgression(totalXp);
  const badges = evaluateBadges(streak, totalHours, balanceScore, logs);
  const unlockedBadgesCount = badges.filter((b) => b.unlocked).length;

  return {
    totalXp,
    level: progression.level,
    rankTitle: progression.rankTitle,
    currentLevelFloorXp: progression.currentLevelFloorXp,
    nextLevelThresholdXp: progression.nextLevelThresholdXp,
    levelProgressPct: progression.levelProgressPct,
    badges,
    unlockedBadgesCount,
    totalBadgesCount: badges.length,
  };
}
