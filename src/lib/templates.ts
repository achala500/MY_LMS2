/**
 * templates.ts — Centralized Template Variable Engine
 * Parses {{variable}} placeholders in copy strings for personalized Gen-Z messaging.
 */

export interface TemplateVars {
  user_name?: string;
  streak_count?: number;
  exam_countdown_days?: number;
  composite_z_score?: number;
  subject?: string;
  study_hours_today?: number;
  study_hours_week?: number;
  rank?: number;
  total_members?: number;
  study_id?: string;
  exam_year?: string;
  target_z_score?: number;
  current_subject?: string;
  session_minutes?: number;
  topics_done?: number;
  total_topics?: number;
  badge_name?: string;
  grade?: string;
}

/**
 * Interpolate {{variable}} placeholders in a template string.
 */
export function interpolate(template: string, vars: TemplateVars = {}): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const value = (vars as Record<string, unknown>)[key];
    return value !== undefined && value !== null ? String(value) : match;
  });
}

/**
 * Pre-built conversational Gen-Z copy templates for all key app moments.
 */
export const COPY = {
  // Greetings
  greeting_morning: '{{user_name}}, you\'re locked in early — that\'s different',
  greeting_afternoon: 'Back at it, {{user_name}}? Let\'s make it count',
  greeting_evening: 'Late-night session? Respect, {{user_name}}',
  greeting_first_time: 'Welcome to the StudySync workspace, {{user_name}}',

  // Streak moments
  streak_active: '{{streak_count}}-day streak. Keep the momentum going',
  streak_milestone_7: 'Week complete, uninterrupted. Outstanding consistency, {{user_name}}',
  streak_milestone_30: '30 consecutive days. Elite academic discipline, {{user_name}}',
  streak_lost: 'Streak reset, but your knowledge remains. Resume your rhythm, {{user_name}}',
  streak_start: 'Day 1 starts now. Every top rank started right here, {{user_name}}',

  // Exam countdown
  countdown_chill: '{{exam_countdown_days}} days remaining — stay strategic and steady',
  countdown_focus: '{{exam_countdown_days}} days until A/Ls — time to consolidate your revision',
  countdown_crunch: '{{exam_countdown_days}} days remaining. Full focus, {{user_name}}',
  countdown_final: '{{exam_countdown_days}} days. You have prepared for this. Execute with confidence',

  // Study sessions
  session_start: 'Starting {{subject}}. Master the core concepts',
  session_end: '{{session_minutes}} mins of {{subject}} completed. Quality work logged',
  session_good: '{{study_hours_today}}h logged today. Solid academic progress',
  session_great: 'You logged {{study_hours_today}}h today — exceptional dedication and effort',

  // Z-score
  zscore_rising: 'Composite Z-score trending up to {{composite_z_score}} — maintain this trajectory',
  zscore_strong: 'Composite Z-score at {{composite_z_score}} — performing well within university qualification range',
  zscore_needs_work: 'Composite Z-score at {{composite_z_score}} — targeted remediation will raise this',

  // Empty states
  empty_logs: 'No sessions logged today yet. Record your first study block to update your analytics',
  empty_vault: 'Vault is currently empty. Upload your first past paper or structured note',
  empty_calendar: 'No scheduled blocks for this week. Allocate your study slots to maintain balance',
  empty_tests: 'No mock exam scores recorded. Add your first test to initialize predictive Z-score modeling',
  empty_history: 'No study history on record, {{user_name}}. Your first session begins today',

  // Actions
  upload_cta: 'Drop a PDF here or click to browse files',
  verify_pending: 'Your verification request is pending mentor review (typically 24-48 hours)',
  verify_approved: 'Credential verified. Full system access enabled, {{user_name}}.',
  verify_rejected: 'Verification incomplete. Contact your institution coordinator to resolve.',

  // Admin
  admin_welcome: 'Administration Terminal — {{user_name}}',
  admin_new_request: 'Pending student verification review queued',
  admin_bulk_done: 'Batch operation completed — {{total_members}} student records updated',
} as const;

/**
 * Resolve a copy key with template vars applied.
 */
export function getCopy(key: keyof typeof COPY, vars: TemplateVars = {}): string {
  const template = COPY[key] as string;
  return interpolate(template, vars);
}

/**
 * Get context-aware greeting based on current hour.
 */
export function getTimeGreeting(userName: string): string {
  const hour = new Date().getHours();
  if (hour < 12) return getCopy('greeting_morning', { user_name: userName });
  if (hour < 17) return getCopy('greeting_afternoon', { user_name: userName });
  return getCopy('greeting_evening', { user_name: userName });
}

/**
 * Get countdown copy based on days remaining.
 */
export function getCountdownCopy(days: number, userName?: string): string {
  const vars: TemplateVars = { exam_countdown_days: days, user_name: userName };
  if (days > 90) return getCopy('countdown_chill', vars);
  if (days > 30) return getCopy('countdown_focus', vars);
  if (days > 7) return getCopy('countdown_crunch', vars);
  return getCopy('countdown_final', vars);
}
