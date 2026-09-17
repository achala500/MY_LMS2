/**
 * StudySync — Student Personal Dashboard View Component
 * 
 * Features:
 * - Read-only student profile card with verified email binding and glowing status badge.
 * - Interactive StudySync Platform ID Card canvas preview with 1-click 3x PNG download (300 DPI) and verification link.
 * - Personal stats bento grid: Study streak counter (), total study hours rollup, stream 3-subject breakdown bars, average focus & productivity meters.
 * - Today's study status banner with quick CTA to stream-aware daily study logger (#daily).
 * - Interactive, searchable past study history table with subject breakdowns, reflections, and full-resolution proof photo modal.
 * - Zero native popups (Toast notification engine).
 */

import { AppState } from '../state.js';
import { ApiClient } from '../api.js';
import { Toast } from '../toast.js';
import { IdCard } from '../idcard.js';
import { resolveStreamSubjects, getSubjectIcon } from './dailyFormView.js';
import { initSchoolAutocomplete } from '../schools.js';
import {
  getTodayDateString,
  formatDate,
  calculateStats,
  calculateStreak,
  sanitizeString,
  isToday
} from '../utils.js';

export class DashboardView {
  constructor() {
    this.container = null;
    this.canvasElement = null;
    this.historyLogs = [];
    this.personalStats = null;
    this.searchQuery = '';
    this.isLoadingHistory = false;
    this._keydownHandler = null;
  }

  /**
   * Render student dashboard into target container
   * @param {HTMLElement} container 
   */
  async render(container) {
    this.container = container;
    const state = AppState.get();

    // 1. Authentication & Registration Guard
    if (!state.user) {
      Toast.warning('Please sign in with your Google account to access your dashboard.', 'Sign In Required');
      if (typeof window !== 'undefined' && window.location) {
        window.location.hash = '#landing';
      }
      return;
    }

    if (!state.member) {
      Toast.info('Please complete your one-time registration first.', 'Registration Needed');
      if (typeof window !== 'undefined' && window.location) {
        window.location.hash = '#register';
      }
      return;
    }

    const member = state.member;

    // Initial state setup from AppState
    this.historyLogs = Array.isArray(state.history) ? [...state.history] : [];
    this.personalStats = calculateStats(this.historyLogs);

    // Initial HTML Shell
    this._renderSkeleton(member);

    // Render Platform ID Card ID Card onto canvas
    this._renderIdCard(member);

    // Bind initial event listeners
    this._bindEvents(member);

    // Fetch latest fresh student history from backend
    await this._fetchFreshHistory(member);

    if (typeof window !== 'undefined' && window.lucide) {
      window.lucide.createIcons();
    }
  }

  /**
   * Render full dashboard skeleton and bento layout
   */
  _renderSkeleton(member) {
    const streamSubjects = resolveStreamSubjects(member.stream, member.optionalSubject);
    const stats = this.personalStats || calculateStats(this.historyLogs);
    const streak = stats.streak || calculateStreak(this.historyLogs);

    // Check if today's log has been submitted
    const todayStr = getTodayDateString();
    const todayLog = this.historyLogs.find(l => {
      const d = l.dateOfStudy || l.date || l.Date;
      return d && String(d).startsWith(todayStr);
    }) || AppState.getProp('todayLog');

    const hasCompletedToday = Boolean(todayLog && (todayLog.totalHours > 0 || Array.isArray(todayLog.subjects)));

    // Focus & Productivity Qualitative Labels
    const focusLabel = this._getScoreLabel(stats.avgFocus, 'focus');
    const prodLabel = this._getScoreLabel(stats.avgProductivity, 'productivity');

    this.container.innerHTML = `
      <div class="flex flex-col w-full max-w-7xl mx-auto py-4 sm:py-6 gap-8 animate-fade-in">
        
        <!-- 1. DASHBOARD HEADER & GREETING -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 relative overflow-hidden">
          <div class="absolute -right-16 -top-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div class="absolute -left-16 -bottom-16 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div class="relative z-10 flex flex-col gap-1.5">
            <div class="flex flex-wrap items-center gap-2.5">
              <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Welcome back, <span class="gradient-text">${sanitizeString(member.fullName.split(' ')[0] || member.fullName)}</span>! 
              </h1>
              <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${member.stream.includes('Bio') ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'}">
                <span>${member.stream.includes('Bio') ? '' : ''}</span>
                <span>${sanitizeString(member.stream)}</span>
              </span>
            </div>
            <p class="text-xs sm:text-sm text-slate-300">
              StudySync Student Command Center • <span class="font-mono text-cyan-300 font-semibold">${sanitizeString(member.studyId)}</span>
            </p>
          </div>

          <div class="relative z-10 flex items-center gap-3">
            <button id="btn-refresh-dashboard" type="button" class="apple-btn-secondary text-xs px-4 py-2.5 flex items-center gap-2" title="Sync Latest History">
              <i data-lucide="refresh-cw" class="w-4 h-4 text-slate-400"></i>
              <span>Sync Data</span>
            </button>
            <a href="#daily" class="apple-btn-primary text-xs px-5 py-2.5 flex items-center gap-2 shadow-lg shadow-indigo-500/20">
              <i data-lucide="clipboard-pen" class="w-4 h-4 text-white"></i>
              <span>Log Today's Study</span>
            </a>
          </div>
        </div>

        <!-- 2. SECTION: PROFILE & Platform ID Card ID CARD (2 COLUMNS) -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          <!-- Left Column: Student Profile Details Card (5 cols) -->
          <div class="lg:col-span-5 flex flex-col glass-card p-6 rounded-3xl border border-white/10 relative overflow-hidden justify-between">
            <div>
              <div class="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
                <div class="flex items-center gap-2.5">
                  <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md">
                    <i data-lucide="user-check" class="w-5 h-5"></i>
                  </div>
                  <div>
                    <h2 class="text-base font-bold text-white leading-tight">Member Profile</h2>
                    <p class="text-[11px] text-slate-400">Verified StudySync Registration</p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <button id="btn-edit-profile" type="button" class="apple-btn-secondary text-[11px] px-2.5 py-1 flex items-center gap-1.5 border border-indigo-500/30 text-indigo-300 hover:text-white" title="Edit Profile Details">
                    <i data-lucide="edit-3" class="w-3 h-3"></i>
                    <span>Edit</span>
                  </button>
                  <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                    <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>${sanitizeString(member.status || 'Active')}</span>
                  </div>
                </div>
              </div>

              <!-- Profile Fields List -->
              <div class="space-y-3.5 text-xs">
                
                <!-- Study ID & Copy Button -->
                <div class="flex items-center justify-between py-1.5 border-b border-white/5">
                  <span class="text-slate-400 font-medium">Study ID:</span>
                  <div class="flex items-center gap-2">
                    <span id="profile-study-id" class="font-mono text-cyan-300 font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">${sanitizeString(member.studyId)}</span>
                    <button id="btn-copy-id" type="button" class="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors" title="Copy Study ID">
                      <i data-lucide="copy" class="w-3.5 h-3.5"></i>
                    </button>
                  </div>
                </div>

                <!-- Full Name -->
                <div class="flex items-center justify-between py-1.5 border-b border-white/5">
                  <span class="text-slate-400 font-medium">Full Name:</span>
                  <span class="text-white font-semibold text-right">${sanitizeString(member.fullName)}</span>
                </div>

                <!-- Verified Email -->
                <div class="flex items-center justify-between py-1.5 border-b border-white/5">
                  <span class="text-slate-400 font-medium">Google Email:</span>
                  <span class="text-indigo-300 font-mono text-[11px] text-right truncate max-w-[200px]" title="${sanitizeString(member.email)}">${sanitizeString(member.email)}</span>
                </div>

                <!-- School -->
                <div class="flex items-center justify-between py-1.5 border-b border-white/5">
                  <span class="text-slate-400 font-medium">School:</span>
                  <span class="text-slate-200 text-right truncate max-w-[200px]" title="${sanitizeString(member.school)}">${sanitizeString(member.school)}</span>
                </div>

                <!-- Stream & Optional Subject -->
                <div class="flex items-center justify-between py-1.5 border-b border-white/5">
                  <span class="text-slate-400 font-medium">Stream & Elective:</span>
                  <div class="text-right">
                    <div class="text-slate-200 font-medium">${sanitizeString(member.stream)}</div>
                    <div class="text-[10px] text-indigo-300 font-mono">(${sanitizeString(member.optionalSubject || 'Standard')})</div>
                  </div>
                </div>

                <!-- Telegram -->
                <div class="flex items-center justify-between py-1.5 border-b border-white/5">
                  <span class="text-slate-400 font-medium">Telegram:</span>
                  <span class="text-cyan-300 font-mono">${sanitizeString(member.telegram || 'Not set')}</span>
                </div>

                <!-- Registration Date -->
                <div class="flex items-center justify-between py-1.5">
                  <span class="text-slate-400 font-medium">Registered:</span>
                  <span class="text-slate-300">${formatDate(member.registrationDate, 'medium')}</span>
                </div>

              </div>
            </div>

            <!-- Profile Footer Security Note -->
            <div class="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
              <span class="flex items-center gap-1">
                <i data-lucide="shield-check" class="w-3.5 h-3.5 text-emerald-400"></i>
                <span>1:1 Google Account Binding</span>
              </span>
              <span class="font-mono text-[10px] text-slate-500">v1.0</span>
            </div>
          </div>

          <!-- Right Column: Interactive StudySync Platform ID Card (7 cols) -->
          <div class="lg:col-span-7 flex flex-col glass-card p-6 rounded-3xl border border-white/10 relative overflow-hidden items-center justify-between">
            <div class="w-full">
              <div class="flex items-center justify-between border-b border-white/10 pb-4 mb-5 w-full">
                <div class="flex items-center gap-2.5">
                  <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
                    <i data-lucide="credit-card" class="w-5 h-5"></i>
                  </div>
                  <div>
                    <h2 class="text-base font-bold text-white leading-tight">StudySync Platform ID Card</h2>
                    <p class="text-[11px] text-slate-400">Verified G.C.E. A/L Member Identity</p>
                  </div>
                </div>
                <span class="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">300 DPI High-Res</span>
              </div>

              <!-- Interactive Card Canvas Container -->
              <div class="relative w-full flex justify-center py-2">
                <div class="relative w-full max-w-[480px] aspect-[480/302] rounded-2xl overflow-hidden shadow-2xl shadow-indigo-950/60 border border-white/15 group">
                  <canvas id="dashboard-id-canvas" class="w-full h-full block cursor-pointer transition-transform duration-300 group-hover:scale-[1.01]" width="480" height="302" title="Click to download Digital ID pass"></canvas>
                  <div class="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/20 via-transparent to-white/10 rounded-2xl"></div>
                </div>
              </div>
            </div>

            <!-- Card Actions -->
            <div class="w-full flex flex-col sm:flex-row items-center justify-between gap-3 mt-5 pt-4 border-t border-white/10">
              <a href="#verify/${encodeURIComponent(member.studyId)}" class="apple-btn-secondary text-xs px-4 py-2.5 w-full sm:w-auto flex items-center justify-center gap-2">
                <i data-lucide="shield-check" class="w-4 h-4 text-emerald-400"></i>
                <span>Public Verification URL</span>
              </a>
              <button id="btn-download-id-png" type="button" class="apple-btn-primary text-xs px-5 py-2.5 w-full sm:w-auto flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/30">
                <i data-lucide="download" class="w-4 h-4 text-white"></i>
                <span>Download Digital ID (3x PNG)</span>
              </button>
            </div>
          </div>

        </div>

        <!-- 3. SECTION: TODAY'S STUDY SESSION STATUS BANNER -->
        <div id="today-study-banner">
          ${this._renderTodayStatusBanner(hasCompletedToday, todayLog, todayStr)}
        </div>

        <!-- 4. SECTION: PERSONAL STATS BENTO GRID (4 METRIC CARDS) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          <!-- Card 1: Study Streak -->
          <div class="glass-card p-5 rounded-3xl border border-white/10 relative overflow-hidden flex flex-col justify-between">
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs font-semibold text-slate-300 uppercase tracking-wider">Study Streak</span>
              <div class="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <i data-lucide="flame" class="w-4 h-4"></i>
              </div>
            </div>
            <div class="flex items-baseline gap-2 mb-2">
              <span class="text-3xl sm:text-4xl font-extrabold text-white">${streak.currentStreak || 0}</span>
              <span class="text-xs text-amber-400 font-semibold">Days Consecutive</span>
            </div>
            <div class="flex items-center justify-between text-[11px] pt-2 border-t border-white/5">
              <span class="text-slate-400">Longest Streak:</span>
              <span class="font-bold text-amber-300 font-mono">${streak.longestStreak || 0} days</span>
            </div>
          </div>

          <!-- Card 2: Total Study Hours -->
          <div class="glass-card p-5 rounded-3xl border border-white/10 relative overflow-hidden flex flex-col justify-between">
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs font-semibold text-slate-300 uppercase tracking-wider">Total Time Studied</span>
              <div class="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <i data-lucide="clock" class="w-4 h-4"></i>
              </div>
            </div>
            <div class="flex items-baseline gap-2 mb-2">
              <span class="text-3xl sm:text-4xl font-extrabold text-white">${stats.totalHours || 0}</span>
              <span class="text-xs text-indigo-400 font-semibold">Total Hours</span>
            </div>
            <div class="flex items-center justify-between text-[11px] pt-2 border-t border-white/5">
              <span class="text-slate-400">Daily Average:</span>
              <span class="font-bold text-indigo-300 font-mono">${stats.avgDailyHours || 0} hrs/session</span>
            </div>
          </div>

          <!-- Card 3: Stream 3-Subject Breakdown -->
          <div class="glass-card p-5 rounded-3xl border border-white/10 relative overflow-hidden flex flex-col justify-between">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-semibold text-slate-300 uppercase tracking-wider">Subject Hours</span>
              <div class="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <i data-lucide="book-open" class="w-4 h-4"></i>
              </div>
            </div>
            
            <div class="space-y-2 my-1">
              ${streamSubjects.map(subName => {
                const subHours = (stats.subjectTotals && stats.subjectTotals[subName]) ? stats.subjectTotals[subName] : 0;
                const percent = stats.totalHours > 0 ? Math.min(100, Math.round((subHours / stats.totalHours) * 100)) : 0;
                return `
                  <div>
                    <div class="flex items-center justify-between text-[11px] mb-0.5">
                      <span class="text-slate-300 flex items-center gap-1 truncate max-w-[120px]">
                        <span>${getSubjectIcon(subName)}</span>
                        <span>${sanitizeString(subName)}</span>
                      </span>
                      <span class="font-mono text-cyan-300 font-semibold">${subHours.toFixed(1)}h</span>
                    </div>
                    <div class="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div class="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full" style="width: ${percent}%"></div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>

            <div class="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-white/5">
              <span>Total Sessions Logged:</span>
              <span class="font-bold text-white font-mono">${stats.totalSubmissions || 0}</span>
            </div>
          </div>

          <!-- Card 4: Focus & Productivity Rollup -->
          <div class="glass-card p-5 rounded-3xl border border-white/10 relative overflow-hidden flex flex-col justify-between">
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs font-semibold text-slate-300 uppercase tracking-wider">Quality Ratings</span>
              <div class="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <i data-lucide="zap" class="w-4 h-4"></i>
              </div>
            </div>
            
            <div class="space-y-2.5 my-1">
              <!-- Focus Meter -->
              <div>
                <div class="flex items-center justify-between text-[11px] mb-1">
                  <span class="text-slate-400">Avg Focus:</span>
                  <div class="flex items-center gap-1.5">
                    <span class="font-mono font-bold text-indigo-300">${stats.avgFocus || 0} / 10</span>
                    <span class="text-[9px] px-1.5 py-0.2 rounded ${focusLabel.bg} ${focusLabel.color}">${focusLabel.text}</span>
                  </div>
                </div>
                <div class="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div class="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style="width: ${((stats.avgFocus || 0) / 10) * 100}%"></div>
                </div>
              </div>

              <!-- Productivity Meter -->
              <div>
                <div class="flex items-center justify-between text-[11px] mb-1">
                  <span class="text-slate-400">Avg Productivity:</span>
                  <div class="flex items-center gap-1.5">
                    <span class="font-mono font-bold text-fuchsia-300">${stats.avgProductivity || 0} / 10</span>
                    <span class="text-[9px] px-1.5 py-0.2 rounded ${prodLabel.bg} ${prodLabel.color}">${prodLabel.text}</span>
                  </div>
                </div>
                <div class="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div class="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full" style="width: ${((stats.avgProductivity || 0) / 10) * 100}%"></div>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-white/5">
              <span>Standard 1-10 Scale</span>
              <span class="text-indigo-400 font-semibold">Self-Assessed</span>
            </div>
          </div>

        </div>

        <!-- 5. SECTION: PAST STUDY HISTORY TABLE & SEARCH -->
        <div class="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 relative overflow-hidden">
          
          <!-- History Header & Search Filter -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div class="flex items-center gap-2.5">
                <h2 class="text-lg font-bold text-white tracking-tight">Past Study History</h2>
                <span id="history-count-badge" class="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  ${this.historyLogs.length} logs
                </span>
              </div>
              <p class="text-xs text-slate-400 mt-0.5">Chronological record of all logged study sessions, focus ratings, reflections, and verified photo proofs.</p>
            </div>

            <!-- Search History Input -->
            <div class="relative w-full sm:w-64">
              <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"></i>
              <input
                id="input-search-history"
                type="text"
                value="${sanitizeString(this.searchQuery)}"
                placeholder="Search by date, notes..."
                class="apple-input pl-9 pr-3 py-2 text-xs w-full"
              />
            </div>
          </div>

          <!-- History Table / Card Container -->
          <div id="dashboard-history-table-container">
            ${this._renderHistoryTable(this.historyLogs, this.searchQuery)}
          </div>

        </div>

      </div>
    `;
  }

  /**
   * Render today's study status banner
   */
  _renderTodayStatusBanner(hasCompletedToday, todayLog, todayStr) {
    if (hasCompletedToday) {
      const hours = todayLog.totalHours || (Array.isArray(todayLog.subjects) ? todayLog.subjects.reduce((sum, s) => sum + (Number(s.hours) || 0), 0) : 0);
      return `
        <div class="glass-panel p-5 rounded-3xl border border-emerald-500/30 bg-emerald-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div class="flex items-center gap-3.5">
            <div class="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-lg shadow-lg shadow-emerald-500/20">
              
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-sm font-bold text-white">Today's Study Session Logged!</h3>
                <span class="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Completed</span>
              </div>
              <p class="text-xs text-slate-300 mt-0.5">
                You logged <strong class="text-emerald-300 font-mono">${hours} hours</strong> for today (${formatDate(todayStr, 'short')}). Your streak is safe!
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2 w-full sm:w-auto">
            <a href="#daily" class="apple-btn-secondary text-xs px-4 py-2 w-full sm:w-auto flex items-center justify-center gap-1.5">
              <i data-lucide="eye" class="w-3.5 h-3.5 text-slate-400"></i>
              <span>View Today's Log</span>
            </a>
          </div>
        </div>
      `;
    }

    return `
      <div class="glass-panel p-5 rounded-3xl border border-amber-500/30 bg-amber-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div class="flex items-center gap-3.5">
          <div class="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 text-lg shadow-lg shadow-amber-500/20">
            ⏳
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-sm font-bold text-white">Today's Study Session Pending</h3>
              <span class="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">Action Needed</span>
            </div>
            <p class="text-xs text-slate-300 mt-0.5">
              You haven't logged your study hours for today (${formatDate(todayStr, 'short')}) yet. Keep your daily streak going!
            </p>
          </div>
        </div>
        <div class="flex items-center gap-2 w-full sm:w-auto">
          <a href="#daily" class="apple-btn-primary text-xs px-5 py-2.5 w-full sm:w-auto flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20">
            <i data-lucide="plus-circle" class="w-4 h-4 text-white"></i>
            <span>Log Today's Hours</span>
          </a>
        </div>
      </div>
    `;
  }

  /**
   * Render history table from log list with search filtering
   */
  _renderHistoryTable(logs, query = '') {
    let filtered = logs;
    const q = (query || '').trim().toLowerCase();

    if (q) {
      filtered = logs.filter(log => {
        const dateStr = String(log.dateOfStudy || log.date || '').toLowerCase();
        const notesStr = String(log.notes || '').toLowerCase();
        const idStr = String(log.studyId || '').toLowerCase();
        return dateStr.includes(q) || notesStr.includes(q) || idStr.includes(q);
      });
    }

    if (!filtered || filtered.length === 0) {
      return `
        <div class="flex flex-col items-center justify-center py-12 text-center text-slate-400 gap-3">
          <div class="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500">
            <i data-lucide="calendar-x-2" class="w-6 h-6"></i>
          </div>
          <p class="text-sm font-semibold text-slate-300">No study logs found ${q ? `matching "${sanitizeString(q)}"` : 'yet'}.</p>
          <p class="text-xs text-slate-400 max-w-sm">Complete your daily study schedule and submit your daily log to populate your study history.</p>
          <a href="#daily" class="apple-btn-primary text-xs px-4 py-2 mt-2">Log First Session</a>
        </div>
      `;
    }

    return `
      <div class="overflow-x-auto -mx-6 sm:mx-0">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="border-b border-white/10 text-slate-400 uppercase tracking-wider font-semibold">
              <th class="py-3 px-4">Date</th>
              <th class="py-3 px-4">Total Time</th>
              <th class="py-3 px-4">Subject Breakdown</th>
              <th class="py-3 px-4">Notes / Reflection</th>
              <th class="py-3 px-4 text-center">Proof Photo</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5 text-slate-300 font-normal">
            ${filtered.map((log, index) => this._renderHistoryRow(log, index)).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  /**
   * Render individual history table row
   */
  _renderHistoryRow(log, index) {
    const rawDate = log.dateOfStudy || log.date || log.Date || log.timestamp;
    const formattedDate = formatDate(rawDate, 'medium');
    const isTodayRow = isToday(rawDate);
    const totalHours = Number(log.totalHours || 0).toFixed(1);
    const notes = log.notes || '—';
    const proofPhotoUrl = log.proofPhotoUrl || log.proofUrl || log.Proof || '';

    // Extract subjects array
    let subjects = [];
    if (Array.isArray(log.subjects)) {
      subjects = log.subjects;
    } else {
      for (let i = 1; i <= 3; i++) {
        const name = log[`subject${i}Name`] || log[`Subject ${i} Name`];
        const hours = log[`subject${i}Hours`] || log[`Subject ${i} Hours`];
        const focus = log[`subject${i}Focus`] || log[`Subject ${i} Focus`];
        const prod = log[`subject${i}Productivity`] || log[`Subject ${i} Productivity`];
        if (name) {
          subjects.push({ name, hours, focus, productivity: prod });
        }
      }
    }

    return `
      <tr class="hover:bg-white/[0.03] transition-colors group">
        
        <!-- Date -->
        <td class="py-3.5 px-4 whitespace-nowrap">
          <div class="flex items-center gap-2">
            <span class="font-semibold text-white">${formattedDate}</span>
            ${isTodayRow ? '<span class="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">Today</span>' : ''}
          </div>
          <span class="text-[10px] text-slate-400 font-mono">${formatDate(rawDate, 'iso')}</span>
        </td>

        <!-- Total Time -->
        <td class="py-3.5 px-4 whitespace-nowrap">
          <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-mono font-bold">
            <i data-lucide="clock" class="w-3.5 h-3.5 text-indigo-400"></i>
            <span>${totalHours} hrs</span>
          </div>
        </td>

        <!-- Subject Breakdown -->
        <td class="py-3.5 px-4 min-w-[240px]">
          <div class="flex flex-col gap-1.5">
            ${subjects.map(s => `
              <div class="flex items-center justify-between text-[11px] bg-white/[0.02] px-2 py-0.5 rounded border border-white/5">
                <span class="text-slate-300 font-medium truncate max-w-[130px]">
                  ${getSubjectIcon(s.name)} ${sanitizeString(s.name)}: <strong class="text-white font-mono">${s.hours || 0}h</strong>
                </span>
                <span class="text-[10px] font-mono text-slate-400">
                  F:<strong class="text-indigo-300">${s.focus || 0}</strong> P:<strong class="text-fuchsia-300">${s.productivity || 0}</strong>
                </span>
              </div>
            `).join('')}
          </div>
        </td>

        <!-- Notes -->
        <td class="py-3.5 px-4 max-w-[220px]">
          <p class="text-xs text-slate-300 line-clamp-2 italic" title="${sanitizeString(notes)}">
            "${sanitizeString(notes)}"
          </p>
        </td>

        <!-- Proof Photo Column -->
        <td class="py-3.5 px-4 text-center whitespace-nowrap">
          ${proofPhotoUrl ? `
            <button
              type="button"
              class="btn-view-proof-photo inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-indigo-500/20 text-indigo-300 hover:text-indigo-200 border border-white/10 transition-colors cursor-pointer"
              data-url="${sanitizeString(proofPhotoUrl)}"
              data-date="${sanitizeString(formattedDate)}"
              data-hours="${totalHours}"
              data-notes="${sanitizeString(notes)}"
              title="View Photo Proof"
            >
              <i data-lucide="image" class="w-3.5 h-3.5 text-indigo-400"></i>
              <span>View Proof</span>
            </button>
          ` : `
            <span class="text-[11px] text-slate-400 italic">No photo</span>
          `}
        </td>

      </tr>
    `;
  }

  /**
   * Render Digital ID Card canvas using IdCard engine
   */
  _renderIdCard(member) {
    if (!this.container) return;
    this.canvasElement = this.container.querySelector('#dashboard-id-canvas');

    if (this.canvasElement) {
      try {
        const dpr = (typeof window !== 'undefined' && window.devicePixelRatio > 1) ? 2 : 1;
        IdCard.renderToCanvas(member, this.canvasElement, dpr);
      } catch (err) {
        console.error('[DashboardView] Failed to render Digital ID Canvas:', err);
      }
    }
  }

  /**
   * Asynchronously fetch fresh student history from backend
   */
  async _fetchFreshHistory(member) {
    if (this.isLoadingHistory) return;
    this.isLoadingHistory = true;

    try {
      const res = await ApiClient.getStudentHistory(member.studyId, member.email);

      if (res.success && res.data) {
        if (Array.isArray(res.data.logs)) {
          this.historyLogs = res.data.logs;
          AppState.set({ history: this.historyLogs });
        }
        if (res.data.stats) {
          this.personalStats = res.data.stats;
        } else {
          this.personalStats = calculateStats(this.historyLogs);
        }

        // Re-render history table and stats if container is active
        this._updateHistoryTableUI();
      }
    } catch (err) {
      console.warn('[DashboardView] Error fetching history from backend:', err);
    } finally {
      this.isLoadingHistory = false;
    }
  }

  /**
   * Update only history table and badges without tearing down canvas
   */
  _updateHistoryTableUI() {
    if (!this.container) return;

    const tableContainer = this.container.querySelector('#dashboard-history-table-container');
    const countBadge = this.container.querySelector('#history-count-badge');

    if (tableContainer) {
      tableContainer.innerHTML = this._renderHistoryTable(this.historyLogs, this.searchQuery);
      this._bindTablePhotoButtons();
    }

    if (countBadge) {
      countBadge.textContent = `${this.historyLogs.length} logs`;
    }

    if (typeof window !== 'undefined' && window.lucide) {
      window.lucide.createIcons();
    }
  }

  /**
   * Bind interactive events
   */
  _bindEvents(member) {
    if (!this.container) return;

    // 0. Edit Profile button
    const editProfileBtn = this.container.querySelector('#btn-edit-profile');
    if (editProfileBtn) {
      editProfileBtn.addEventListener('click', () => {
        this._openEditProfileModal(member);
      });
    }

    // 1. Copy Study ID button
    const copyBtn = this.container.querySelector('#btn-copy-id');
    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(member.studyId);
          }
          Toast.success(`Study ID copied: ${member.studyId}`, 'Copied to Clipboard');
        } catch (e) {
          Toast.info(`Study ID: ${member.studyId}`, 'Member Study ID');
        }
      });
    }

    // 2. Download Digital ID 3x High-Res PNG
    const downloadBtn = this.container.querySelector('#btn-download-id-png');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', async () => {
        try {
          Toast.info('Rendering 300 DPI high-resolution ID pass...', 'Exporting');
          await IdCard.downloadPass(member, 3);
          Toast.success('Digital ID pass downloaded at 300 DPI high resolution', 'ID Pass Exported');
        } catch (err) {
          console.error('[DashboardView] Download error:', err);
          Toast.error('Failed to export Digital ID. Please try again.', 'Export Error');
        }
      });
    }

    // 3. Canvas click triggers download
    if (this.canvasElement) {
      this.canvasElement.addEventListener('click', async () => {
        try {
          Toast.info('Rendering 300 DPI high-resolution ID pass...', 'Exporting');
          await IdCard.downloadPass(member, 3);
          Toast.success('Digital ID pass downloaded at 300 DPI high resolution', 'ID Pass Exported');
        } catch (err) {
          console.error('[DashboardView] Canvas click download error:', err);
        }
      });
    }

    // 4. Refresh Dashboard button
    const refreshBtn = this.container.querySelector('#btn-refresh-dashboard');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', async () => {
        Toast.info('Syncing latest study history from cloud...', 'Syncing');
        await this._fetchFreshHistory(member);
        Toast.success('Dashboard synchronized with latest data', 'Sync Complete');
      });
    }

    // 5. Search History input
    const searchInput = this.container.querySelector('#input-search-history');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this._updateHistoryTableUI();
      });
    }

    // 6. Photo proof buttons in table
    this._bindTablePhotoButtons();

    // 7. Global ESC key listener for modal closing
    this._keydownHandler = (e) => {
      if (e.key === 'Escape') {
        this._closePhotoModal();
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this._keydownHandler);
    }
  }

  /**
   * Bind click handlers to proof photo preview buttons
   */
  _bindTablePhotoButtons() {
    if (!this.container) return;
    const photoBtns = this.container.querySelectorAll('.btn-view-proof-photo');

    photoBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const url = btn.getAttribute('data-url');
        const date = btn.getAttribute('data-date');
        const hours = btn.getAttribute('data-hours');
        const notes = btn.getAttribute('data-notes');
        this._openPhotoModal(url, date, hours, notes);
      });
    });
  }

  /**
   * Open full-resolution proof photo modal
   */
  _openPhotoModal(imageUrl, date, hours, notes) {
    const modalContainer = typeof document !== 'undefined' ? document.getElementById('modal-container') : null;
    if (!modalContainer) return;

    modalContainer.innerHTML = `
      <div class="relative w-full max-w-2xl bg-[#0D111A] border border-white/15 rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col gap-4 animate-fade-in">
        
        <!-- Modal Header -->
        <div class="flex items-center justify-between border-b border-white/10 pb-3">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <i data-lucide="image" class="w-4 h-4"></i>
            </div>
            <div>
              <h3 class="text-sm font-bold text-white">Study Proof Verification</h3>
              <p class="text-[11px] text-slate-400">${sanitizeString(date)} • ${sanitizeString(hours)} Hours Logged</p>
            </div>
          </div>

          <button id="btn-close-modal" type="button" class="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors" title="Close (Esc)">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Image Container -->
        <div class="relative w-full max-h-[60vh] bg-black/60 rounded-2xl overflow-hidden flex items-center justify-center border border-white/10 p-2">
          <img src="${sanitizeString(imageUrl)}" alt="Study Proof Photo" class="max-w-full max-h-[55vh] object-contain rounded-xl shadow-lg" onerror="this.onerror=null;this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'300\\' height=\\'200\\' viewBox=\\'0 0 300 200\\'><rect width=\\'300\\' height=\\'200\\' fill=\\'%23131B2A\\'/><text x=\\'50%\\' y=\\'50%\\' fill=\\'%2364748B\\' font-size=\\'14\\' font-family=\\'sans-serif\\' text-anchor=\\'middle\\'>Proof Image Unavailable</text></svg>';" />
        </div>

        <!-- Reflection / Notes Snippet -->
        ${notes && notes !== '—' ? `
          <div class="p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-300 italic">
            <span class="text-slate-400 not-italic font-semibold block text-[10px] uppercase mb-0.5">Student Reflection:</span>
            "${sanitizeString(notes)}"
          </div>
        ` : ''}

        <!-- Modal Actions -->
        <div class="flex items-center justify-between pt-2 border-t border-white/10">
          <a href="${sanitizeString(imageUrl)}" target="_blank" rel="noopener noreferrer" class="apple-btn-secondary text-xs px-3.5 py-1.5 flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <span>Open Original</span>
          </a>

          <button id="btn-modal-dismiss" type="button" class="apple-btn-primary text-xs px-4 py-1.5">
            Done
          </button>
        </div>

      </div>
    `;

    modalContainer.classList.remove('hidden');
    modalContainer.classList.add('flex');

    const closeBtn = modalContainer.querySelector('#btn-close-modal');
    const dismissBtn = modalContainer.querySelector('#btn-modal-dismiss');

    if (closeBtn) closeBtn.addEventListener('click', () => this._closePhotoModal());
    if (dismissBtn) dismissBtn.addEventListener('click', () => this._closePhotoModal());

    // Dismiss on backdrop click
    modalContainer.onclick = (e) => {
      if (e.target === modalContainer) {
        this._closePhotoModal();
      }
    };

    if (typeof window !== 'undefined' && window.lucide) {
      window.lucide.createIcons();
    }
  }

  /**
   * Open interactive profile editing modal with live Google Sheet sync
   */
  _openEditProfileModal(member) {
    const modalContainer = typeof document !== 'undefined' ? document.getElementById('modal-container') : null;
    if (!modalContainer) return;

    let selectedStream = member.stream || 'Physical Science';
    let selectedOptional = member.optionalSubject || (selectedStream.includes('Bio') ? 'Physics' : 'Chemistry');

    modalContainer.innerHTML = `
      <div class="glass-card p-6 sm:p-8 rounded-3xl max-w-lg w-full border border-white/10 shadow-2xl relative animate-fade-in my-8 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md">
              <i data-lucide="edit-3" class="w-4 h-4"></i>
            </div>
            <div>
              <h3 class="text-base font-bold text-white leading-tight">Edit Member Profile</h3>
              <p class="text-[11px] text-slate-400">Updates sync dynamically to Google Sheet database</p>
            </div>
          </div>
          <button id="btn-close-edit-modal" type="button" class="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>
        </div>

        <form id="form-edit-profile" class="flex flex-col gap-4 text-xs">
          <!-- Study ID (Read-only) -->
          <div>
            <label class="block text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-1">Unique Study ID (Immutable)</label>
            <input type="text" value="${sanitizeString(member.studyId)}" disabled class="glass-input w-full px-3.5 py-2 rounded-xl text-slate-400 font-mono bg-white/[0.02] cursor-not-allowed border border-white/5" />
          </div>

          <!-- Full Name -->
          <div>
            <label class="block text-[10px] uppercase font-mono tracking-wider text-slate-300 mb-1">Full Name</label>
            <input type="text" id="edit-fullname" required value="${sanitizeString(member.fullName)}" class="glass-input w-full px-3.5 py-2.5 rounded-xl text-white focus:outline-none focus:border-indigo-500/50" />
          </div>

          <!-- Telegram Username -->
          <div>
            <label class="block text-[10px] uppercase font-mono tracking-wider text-slate-300 mb-1">Telegram Username</label>
            <input type="text" id="edit-telegram" value="${sanitizeString(member.telegram || '')}" placeholder="@username" class="glass-input w-full px-3.5 py-2.5 rounded-xl text-cyan-300 font-mono focus:outline-none focus:border-indigo-500/50" />
          </div>

          <!-- School with Autocomplete -->
          <div class="relative">
            <label class="block text-[10px] uppercase font-mono tracking-wider text-slate-300 mb-1">School / College</label>
            <input type="text" id="edit-school" required value="${sanitizeString(member.school || '')}" placeholder="Search 300+ Sri Lankan schools..." class="glass-input w-full px-3.5 py-2.5 rounded-xl text-white focus:outline-none focus:border-indigo-500/50" autocomplete="off" />
            <div id="edit-school-dropdown" class="absolute left-0 right-0 top-full mt-1.5 max-h-48 overflow-y-auto rounded-xl bg-[#0d121f] border border-white/15 shadow-2xl z-50 hidden"></div>
          </div>

          <!-- Stream Selection -->
          <div>
            <label class="block text-[10px] uppercase font-mono tracking-wider text-slate-300 mb-1.5">A/L Subject Stream</label>
            <div class="grid grid-cols-2 gap-2.5">
              <label class="flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${selectedStream.includes('Bio') ? 'bg-indigo-500/20 border-indigo-500/40 text-white' : 'bg-white/5 border-white/10 text-slate-300'}">
                <input type="radio" name="edit-stream" value="Biological Science" ${selectedStream.includes('Bio') ? 'checked' : ''} class="text-indigo-500 focus:ring-0" />
                <span class="font-medium text-xs"> Biological Science</span>
              </label>
              <label class="flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${!selectedStream.includes('Bio') ? 'bg-indigo-500/20 border-indigo-500/40 text-white' : 'bg-white/5 border-white/10 text-slate-300'}">
                <input type="radio" name="edit-stream" value="Physical Science" ${!selectedStream.includes('Bio') ? 'checked' : ''} class="text-indigo-500 focus:ring-0" />
                <span class="font-medium text-xs"> Physical Science</span>
              </label>
            </div>
          </div>

          <!-- Optional Subject -->
          <div id="edit-optional-container">
            <label class="block text-[10px] uppercase font-mono tracking-wider text-slate-300 mb-1.5">Elective Subject</label>
            <div id="edit-optional-options" class="grid grid-cols-2 gap-2.5">
              <!-- Dynamically populated -->
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-end gap-2.5 pt-3 mt-2 border-t border-white/10">
            <button id="btn-cancel-edit" type="button" class="apple-btn-secondary text-xs px-4 py-2">
              Cancel
            </button>
            <button id="btn-save-edit" type="submit" class="apple-btn-primary text-xs px-5 py-2 flex items-center gap-2">
              <i data-lucide="check" class="w-3.5 h-3.5"></i>
              <span>Save & Sync Database</span>
            </button>
          </div>
        </form>
      </div>
    `;

    modalContainer.classList.remove('hidden');
    modalContainer.classList.add('flex');

    // Initialize school autocomplete
    const schoolInput = modalContainer.querySelector('#edit-school');
    const schoolDropdown = modalContainer.querySelector('#edit-school-dropdown');
    if (schoolInput && schoolDropdown) {
      initSchoolAutocomplete(schoolInput, schoolDropdown);
    }

    // Helper to render elective choices based on stream
    const updateElectiveUI = (stream) => {
      const optContainer = modalContainer.querySelector('#edit-optional-options');
      if (!optContainer) return;

      const isBio = stream.includes('Bio');
      const options = isBio
        ? [{ label: 'Physics', val: 'Physics' }, { label: 'Agriculture', val: 'Agriculture' }]
        : [{ label: 'Chemistry', val: 'Chemistry' }, { label: 'ICT', val: 'ICT' }];

      optContainer.innerHTML = options.map(opt => `
        <label class="flex items-center gap-2 p-2.5 rounded-xl border bg-white/5 border-white/10 cursor-pointer text-slate-200 hover:bg-white/10">
          <input type="radio" name="edit-optional" value="${opt.val}" ${selectedOptional === opt.val ? 'checked' : ''} class="text-indigo-500 focus:ring-0" />
          <span class="font-medium text-xs">${opt.label}</span>
        </label>
      `).join('');
    };

    updateElectiveUI(selectedStream);

    // Stream change handler
    modalContainer.querySelectorAll('input[name="edit-stream"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        selectedStream = e.target.value;
        selectedOptional = selectedStream.includes('Bio') ? 'Physics' : 'Chemistry';
        updateElectiveUI(selectedStream);
      });
    });

    // Close handlers
    const closeEdit = () => {
      modalContainer.classList.add('hidden');
      modalContainer.classList.remove('flex');
      modalContainer.innerHTML = '';
      modalContainer.onclick = null;
    };

    modalContainer.querySelector('#btn-close-edit-modal')?.addEventListener('click', closeEdit);
    modalContainer.querySelector('#btn-cancel-edit')?.addEventListener('click', closeEdit);
    modalContainer.onclick = (e) => {
      if (e.target === modalContainer) closeEdit();
    };

    // Form submit handler
    const form = modalContainer.querySelector('#form-edit-profile');
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();

      const saveBtn = modalContainer.querySelector('#btn-save-edit');
      if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.innerHTML = `<span class="apple-spinner w-3.5 h-3.5 border-2 border-white/20 border-t-white inline-block"></span> <span>Saving to Google Sheet...</span>`;
      }

      const fullName = modalContainer.querySelector('#edit-fullname')?.value.trim();
      const telegram = modalContainer.querySelector('#edit-telegram')?.value.trim();
      const school = modalContainer.querySelector('#edit-school')?.value.trim();
      const streamRadio = modalContainer.querySelector('input[name="edit-stream"]:checked');
      const optRadio = modalContainer.querySelector('input[name="edit-optional"]:checked');

      const stream = streamRadio ? streamRadio.value : selectedStream;
      const optionalSubject = optRadio ? optRadio.value : selectedOptional;

      const payload = {
        email: member.email,
        studyId: member.studyId,
        fullName,
        telegram,
        school,
        stream,
        optionalSubject
      };

      try {
        Toast.info('Updating profile in live Google Sheet...', 'Saving');
        const res = await ApiClient.updateProfile(payload);

        if (res.success && res.data && res.data.member) {
          const updatedMember = res.data.member;
          AppState.set({ member: updatedMember });

          closeEdit();
          Toast.success('Profile updated and synchronized with live database!', 'Profile Saved');

          // Re-render dashboard and ID card canvas
          if (this.container) {
            this._renderSkeleton(updatedMember);
            this._renderIdCard(updatedMember);
            this._bindEvents(updatedMember);
            this._updateHistoryTableUI();
          }
        } else {
          // Fallback update locally if offline
          const fallbackMember = { ...member, ...payload };
          AppState.set({ member: fallbackMember });
          closeEdit();
          Toast.warning('Profile updated locally (offline mode).', 'Offline Update');
          if (this.container) {
            this._renderSkeleton(fallbackMember);
            this._renderIdCard(fallbackMember);
            this._bindEvents(fallbackMember);
          }
        }
      } catch (err) {
        console.error('[DashboardView] Profile update error:', err);
        Toast.error('Network error while saving profile. Please check your connection.', 'Update Failed');
        if (saveBtn) {
          saveBtn.disabled = false;
          saveBtn.innerHTML = `<i data-lucide="check" class="w-3.5 h-3.5"></i> <span>Save & Sync Database</span>`;
          if (window.lucide) window.lucide.createIcons();
        }
      }
    });

    if (typeof window !== 'undefined' && window.lucide) {
      window.lucide.createIcons();
    }
  }

  /**
   * Close photo preview modal
   */
  _closePhotoModal() {
    const modalContainer = typeof document !== 'undefined' ? document.getElementById('modal-container') : null;
    if (modalContainer) {
      modalContainer.classList.add('hidden');
      modalContainer.classList.remove('flex');
      modalContainer.innerHTML = '';
      modalContainer.onclick = null;
    }
  }

  /**
   * Helper: Get qualitative score label
   */
  _getScoreLabel(score, type) {
    const s = Number(score) || 0;
    if (type === 'focus') {
      if (s >= 9) return { text: 'Laser Focus', bg: 'bg-emerald-500/20', color: 'text-emerald-300' };
      if (s >= 7) return { text: 'Deep Focus', bg: 'bg-indigo-500/20', color: 'text-indigo-300' };
      if (s >= 5) return { text: 'Moderate', bg: 'bg-amber-500/20', color: 'text-amber-300' };
      return { text: 'Light', bg: 'bg-rose-500/20', color: 'text-rose-300' };
    } else {
      if (s >= 9) return { text: 'Peak Output', bg: 'bg-emerald-500/20', color: 'text-emerald-300' };
      if (s >= 7) return { text: 'Optimal', bg: 'bg-fuchsia-500/20', color: 'text-fuchsia-300' };
      if (s >= 5) return { text: 'Steady', bg: 'bg-amber-500/20', color: 'text-amber-300' };
      return { text: 'Slow', bg: 'bg-rose-500/20', color: 'text-rose-300' };
    }
  }

  /**
   * Lifecycle destroy method
   */
  destroy() {
    if (this._keydownHandler && typeof window !== 'undefined') {
      window.removeEventListener('keydown', this._keydownHandler);
      this._keydownHandler = null;
    }
    this._closePhotoModal();
  }
}

export default DashboardView;
