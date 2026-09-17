/**
 * StudySync — Protected Admin Dashboard View Component
 * 
 * Features:
 * - Email Whitelist Security Check (ADMIN_EMAILS) with styled 403 Forbidden Screen for unauthorized users.
 * - Tab 1: Group Analytics & Streak Leaderboard (KPI metric cards, Top Streaks with Gold/Silver/Bronze badges, Stream distribution).
 * - Tab 2: Members Directory (Search by Name/ID, filters by Stream/School/Status, RFC 4180 CSV export).
 * - Tab 3: Daily Logs Inspector (Search, date range filters, student filters, full-size photo preview modal, RFC 4180 CSV export).
 * - Zero native popups (Toast notification engine).
 */

import { AppState } from '../state.js';
import { ApiClient } from '../api.js';
import { Toast } from '../toast.js';
import { getSubjectIcon } from './dailyFormView.js';
import {
  getTodayDateString,
  formatDate,
  sanitizeString,
  formatTelegramUsername,
  generateCsvString,
  downloadCsvFile
} from '../utils.js';

// Configurable Admin Email Whitelist
export const ADMIN_EMAILS = [
  'alwisachalaanurada@gmail.com',
  'admin@studysync.lk',
  'lead.organizer@gmail.com',
  'studysync.admin@gmail.com',
  'alwis@gmail.com',
  'testadmin@studysync.lk'
];

export class AdminView {
  constructor() {
    this.container = null;
    this.activeTab = 'analytics'; // 'analytics' | 'members' | 'logs'
    this.adminData = null;
    this.isLoading = false;

    // Filters for Members Directory
    this.memberSearch = '';
    this.memberStreamFilter = 'all';
    this.memberStatusFilter = 'all';

    // Filters for Daily Logs Inspector
    this.logsSearch = '';
    this.logsDateFrom = '';
    this.logsDateTo = '';
    this.logsStreamFilter = 'all';
    this.logsStudentFilter = 'all';

    this._keydownHandler = null;
  }

  /**
   * Check if an email has administrator privileges
   * @param {string} email 
   * @returns {boolean}
   */
  static isAuthorizedAdmin(email) {
    if (!email || typeof email !== 'string') return false;
    const cleanEmail = email.trim().toLowerCase();
    return ADMIN_EMAILS.some(e => e.toLowerCase() === cleanEmail);
  }

  /**
   * Render Admin View into container
   * @param {HTMLElement} container 
   */
  async render(container) {
    this.container = container;
    const state = AppState.get();

    // 1. Authentication Check
    if (!state.user) {
      Toast.warning('Please sign in with administrator credentials to access the admin console.', 'Sign In Required');
      if (typeof window !== 'undefined' && window.location) {
        window.location.hash = '#landing';
      }
      return;
    }

    // 2. Whitelist Security Gate
    const isWhitelisted = AdminView.isAuthorizedAdmin(state.user.email) || (state.member && state.member.role === 'admin');

    if (!isWhitelisted) {
      this._render403Forbidden(state.user.email);
      Toast.error('Access Denied: You do not have administrator permissions.', '403 Forbidden');
      return;
    }

    // 3. Render Admin Shell
    this._renderAdminShell(state.user);

    // 4. Fetch Admin Data from Backend
    await this._fetchAdminData(state.user.email);

    if (typeof window !== 'undefined' && window.lucide) {
      window.lucide.createIcons();
    }
  }

  /**
   * Render 403 Forbidden Screen for Unauthorized Users
   */
  _render403Forbidden(userEmail) {
    this.container.innerHTML = `
      <div class="flex flex-col items-center justify-center min-h-[70vh] py-12 px-4 animate-fade-in">
        <div class="w-full max-w-lg glass-card p-8 rounded-3xl border border-rose-500/30 text-center relative overflow-hidden shadow-2xl shadow-rose-950/40">
          
          <div class="absolute -right-12 -top-12 w-40 h-40 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div class="absolute -left-12 -bottom-12 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <!-- Lock / Shield Visual Icon -->
          <div class="w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto mb-6 shadow-lg shadow-rose-500/20">
            <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-mono font-bold mb-4 border border-rose-500/30">
            <span>403 FORBIDDEN</span>
          </div>

          <h2 class="text-2xl font-extrabold text-white tracking-tight mb-2">
            Restricted Admin Console
          </h2>

          <p class="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">
            This management console is strictly restricted to designated StudySync group administrators.
          </p>

          <div class="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-400 mb-6 flex flex-col items-center gap-1">
            <span class="text-[10px] uppercase font-semibold tracking-wider text-slate-400">Attempted Access By:</span>
            <span class="font-mono text-indigo-300 font-semibold">${sanitizeString(userEmail || 'Unknown')}</span>
          </div>

          <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="#dashboard" class="apple-btn-primary text-xs px-5 py-2.5 w-full sm:w-auto flex items-center justify-center gap-2">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Return to Student Dashboard</span>
            </a>
          </div>

        </div>
      </div>
    `;
  }

  /**
   * Render Main Admin Console Shell
   */
  _renderAdminShell(user) {
    this.container.innerHTML = `
      <div class="flex flex-col w-full max-w-7xl mx-auto py-4 sm:py-6 gap-8 animate-fade-in">
        
        <!-- 1. ADMIN HEADER -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 relative overflow-hidden">
          <div class="absolute -right-16 -top-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div class="absolute -left-16 -bottom-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div class="relative z-10 flex flex-col gap-1.5">
            <div class="flex flex-wrap items-center gap-2.5">
              <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <i data-lucide="shield" class="w-3.5 h-3.5 text-amber-400"></i>
                <span>SUPER ADMIN CONSOLE</span>
              </span>
              <span class="text-xs text-slate-400">•</span>
              <span class="text-xs text-indigo-300 font-mono">${sanitizeString(user.email)}</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              StudySync <span class="gradient-text">Group Directorate</span>
            </h1>
            <p class="text-xs sm:text-sm text-slate-300">
              Real-time member management, group analytics, daily study logs inspector, and streak leaderboard.
            </p>
          </div>

          <div class="relative z-10 flex items-center gap-3">
            <button id="btn-admin-refresh" type="button" class="apple-btn-secondary text-xs px-4 py-2.5 flex items-center gap-2">
              <i data-lucide="refresh-cw" class="w-4 h-4 text-slate-400"></i>
              <span>Refresh Data</span>
            </button>
            <a href="#dashboard" class="apple-btn-secondary text-xs px-4 py-2.5 flex items-center gap-2">
              <i data-lucide="layout-dashboard" class="w-4 h-4 text-indigo-400"></i>
              <span>Student View</span>
            </a>
          </div>
        </div>

        <!-- 2. ADMIN TABS NAVIGATION -->
        <div class="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto">
          <button
            id="tab-btn-analytics"
            type="button"
            class="admin-tab-btn px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${this.activeTab === 'analytics' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-lg shadow-amber-500/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}"
            data-tab="analytics"
          >
            <i data-lucide="bar-chart-3" class="w-4 h-4"></i>
            <span>Group Analytics & Leaderboard</span>
          </button>

          <button
            id="tab-btn-members"
            type="button"
            class="admin-tab-btn px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${this.activeTab === 'members' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-lg shadow-amber-500/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}"
            data-tab="members"
          >
            <i data-lucide="users" class="w-4 h-4"></i>
            <span>Members Directory</span>
          </button>

          <button
            id="tab-btn-logs"
            type="button"
            class="admin-tab-btn px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${this.activeTab === 'logs' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-lg shadow-amber-500/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}"
            data-tab="logs"
          >
            <i data-lucide="file-text" class="w-4 h-4"></i>
            <span>Daily Logs Inspector</span>
          </button>
        </div>

        <!-- 3. TAB CONTENT CONTAINER -->
        <div id="admin-tab-content" class="w-full">
          <div class="flex flex-col items-center justify-center py-16 gap-3">
            <div class="apple-spinner"></div>
            <p class="text-xs text-slate-400 font-mono">Loading group telemetry from database...</p>
          </div>
        </div>

      </div>
    `;

    this._bindTabEvents(user);
  }

  /**
   * Fetch fresh admin dataset from backend
   */
  async _fetchAdminData(adminEmail) {
    if (this.isLoading) return;
    this.isLoading = true;

    try {
      const res = await ApiClient.getAdminData(adminEmail);

      if (res.success && res.data) {
        this.adminData = res.data;
        AppState.set({ adminData: this.adminData });
        this._renderActiveTab();
      } else {
        Toast.error(res.error || 'Failed to retrieve admin data.', 'Admin Sync Failed');
        this._renderErrorState(res.error || 'Server error occurred.');
      }
    } catch (err) {
      console.error('[AdminView] Error fetching admin data:', err);
      Toast.error('Network request failed.', 'Sync Error');
      this._renderErrorState(err.message);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Render error state in tab container
   */
  _renderErrorState(errorMsg) {
    const tabContainer = document.getElementById('admin-tab-content');
    if (!tabContainer) return;

    tabContainer.innerHTML = `
      <div class="glass-card p-8 rounded-3xl border border-rose-500/30 text-center flex flex-col items-center justify-center gap-3">
        <i data-lucide="alert-triangle" class="w-8 h-8 text-rose-400"></i>
        <h3 class="text-sm font-bold text-white">Failed to Load Admin Data</h3>
        <p class="text-xs text-slate-400 max-w-md">${sanitizeString(errorMsg)}</p>
        <button id="btn-admin-retry" type="button" class="apple-btn-primary text-xs px-4 py-2 mt-2">
          Retry Sync
        </button>
      </div>
    `;

    const retryBtn = tabContainer.querySelector('#btn-admin-retry');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        const state = AppState.get();
        if (state.user) this._fetchAdminData(state.user.email);
      });
    }

    if (typeof window !== 'undefined' && window.lucide) {
      window.lucide.createIcons();
    }
  }

  /**
   * Render currently active tab
   */
  _renderActiveTab() {
    const tabContainer = document.getElementById('admin-tab-content');
    if (!tabContainer || !this.adminData) return;

    switch (this.activeTab) {
      case 'analytics':
        this._renderAnalyticsTab(tabContainer);
        break;

      case 'members':
        this._renderMembersTab(tabContainer);
        break;

      case 'logs':
        this._renderLogsTab(tabContainer);
        break;

      default:
        this._renderAnalyticsTab(tabContainer);
        break;
    }

    if (typeof window !== 'undefined' && window.lucide) {
      window.lucide.createIcons();
    }
  }

  // ==========================================================================
  // TAB 1: GROUP ANALYTICS & STREAK LEADERBOARD
  // ==========================================================================

  _renderAnalyticsTab(container) {
    const data = this.adminData;
    const analytics = data.analytics || {};
    const leaderboard = data.leaderboard || [];
    const members = data.members || [];
    const logs = data.recentLogs || [];

    const totalMembers = analytics.totalMembers || members.length || 0;
    const activeMembers = analytics.activeMembers || members.filter(m => m.status === 'Active').length || 0;
    const totalHours = analytics.totalHours || 0;
    const totalLogs = analytics.totalLogs || logs.length || 0;
    const avgDailyHours = analytics.avgDailyHours || (totalLogs > 0 ? (totalHours / totalLogs).toFixed(1) : 0);
    const avgFocus = analytics.avgGroupFocus || 0;
    const avgProd = analytics.avgGroupProductivity || 0;

    const streamBreakdown = analytics.streamBreakdown || {
      'Biological Science': { members: 0, totalHours: 0, totalLogs: 0 },
      'Physical Science': { members: 0, totalHours: 0, totalLogs: 0 }
    };

    const bioData = streamBreakdown['Biological Science'] || { members: 0, totalHours: 0, totalLogs: 0 };
    const mathData = streamBreakdown['Physical Science'] || { members: 0, totalHours: 0, totalLogs: 0 };

    const bioMemberPercent = totalMembers > 0 ? Math.round((bioData.members / totalMembers) * 100) : 0;
    const mathMemberPercent = totalMembers > 0 ? (100 - bioMemberPercent) : 0;

    container.innerHTML = `
      <div class="flex flex-col gap-8 animate-fade-in">
        
        <!-- 1. GROUP KPI METRICS GRID (5 CARDS) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          <!-- KPI 1: Total Registered Members -->
          <div class="glass-card p-5 rounded-3xl border border-white/10 flex flex-col justify-between">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-semibold text-slate-300 uppercase tracking-wider">Total Members</span>
              <div class="w-8 h-8 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
                <i data-lucide="users" class="w-4 h-4"></i>
              </div>
            </div>
            <div class="text-3xl font-extrabold text-white mb-1">${totalMembers}</div>
            <div class="text-[11px] text-slate-400 pt-2 border-t border-white/5 flex items-center justify-between">
              <span>Active Students:</span>
              <span class="font-mono text-emerald-300 font-bold">${activeMembers}</span>
            </div>
          </div>

          <!-- KPI 2: Active Member Ratio -->
          <div class="glass-card p-5 rounded-3xl border border-white/10 flex flex-col justify-between">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-semibold text-slate-300 uppercase tracking-wider">Active Ratio</span>
              <div class="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <i data-lucide="activity" class="w-4 h-4"></i>
              </div>
            </div>
            <div class="text-3xl font-extrabold text-emerald-300 mb-1">
              ${totalMembers > 0 ? Math.round((activeMembers / totalMembers) * 100) : 0}%
            </div>
            <div class="text-[11px] text-slate-400 pt-2 border-t border-white/5 flex items-center justify-between">
              <span>Account Status:</span>
              <span class="text-emerald-400 font-semibold">100% Verified</span>
            </div>
          </div>

          <!-- KPI 3: Total Group Hours -->
          <div class="glass-card p-5 rounded-3xl border border-white/10 flex flex-col justify-between">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-semibold text-slate-300 uppercase tracking-wider">Total Study Time</span>
              <div class="w-8 h-8 rounded-lg bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
                <i data-lucide="clock" class="w-4 h-4"></i>
              </div>
            </div>
            <div class="text-3xl font-extrabold text-cyan-300 mb-1">${totalHours}h</div>
            <div class="text-[11px] text-slate-400 pt-2 border-t border-white/5 flex items-center justify-between">
              <span>Avg / Session:</span>
              <span class="font-mono text-slate-300 font-bold">${avgDailyHours} hrs</span>
            </div>
          </div>

          <!-- KPI 4: Total Logs Logged -->
          <div class="glass-card p-5 rounded-3xl border border-white/10 flex flex-col justify-between">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-semibold text-slate-300 uppercase tracking-wider">Total Daily Logs</span>
              <div class="w-8 h-8 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center">
                <i data-lucide="clipboard-check" class="w-4 h-4"></i>
              </div>
            </div>
            <div class="text-3xl font-extrabold text-white mb-1">${totalLogs}</div>
            <div class="text-[11px] text-slate-400 pt-2 border-t border-white/5 flex items-center justify-between">
              <span>Sheet Database:</span>
              <span class="font-mono text-purple-300">DailyLogs</span>
            </div>
          </div>

          <!-- KPI 5: Group Focus & Productivity -->
          <div class="glass-card p-5 rounded-3xl border border-white/10 flex flex-col justify-between">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-semibold text-slate-300 uppercase tracking-wider">Group Averages</span>
              <div class="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
                <i data-lucide="zap" class="w-4 h-4"></i>
              </div>
            </div>
            <div class="flex items-baseline gap-2 mb-1">
              <span class="text-2xl font-extrabold text-indigo-300">F: ${avgFocus}</span>
              <span class="text-2xl font-extrabold text-fuchsia-300">P: ${avgProd}</span>
            </div>
            <div class="text-[11px] text-slate-400 pt-2 border-t border-white/5 flex items-center justify-between">
              <span>Standard 1-10:</span>
              <span class="text-amber-300 font-semibold">High Quality</span>
            </div>
          </div>

        </div>

        <!-- 2. STREAM DISTRIBUTION COMPARISON -->
        <div class="glass-card p-6 sm:p-8 rounded-3xl border border-white/10">
          <div class="flex items-center justify-between mb-5">
            <div>
              <h2 class="text-base font-bold text-white">Stream Distribution & Workload Breakdown</h2>
              <p class="text-xs text-slate-400">Biological Science vs. Physical Science comparison across registered cohort</p>
            </div>
            <span class="text-xs font-mono text-indigo-300 bg-indigo-500/15 px-2.5 py-1 rounded-full border border-indigo-500/30">Cohort Metrics</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <!-- Bio Stream Card -->
            <div class="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex flex-col justify-between">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-2">
                  <span class="text-xl"></span>
                  <span class="text-sm font-bold text-white">Biological Science</span>
                </div>
                <span class="text-xs font-mono font-bold text-emerald-300">${bioMemberPercent}% of cohort</span>
              </div>
              <div class="grid grid-cols-3 gap-2 text-center py-2 bg-white/5 rounded-xl border border-white/5">
                <div>
                  <span class="text-[10px] text-slate-400 uppercase block">Members</span>
                  <span class="text-base font-bold text-white font-mono">${bioData.members}</span>
                </div>
                <div>
                  <span class="text-[10px] text-slate-400 uppercase block">Hours</span>
                  <span class="text-base font-bold text-emerald-300 font-mono">${bioData.totalHours}h</span>
                </div>
                <div>
                  <span class="text-[10px] text-slate-400 uppercase block">Logs</span>
                  <span class="text-base font-bold text-white font-mono">${bioData.totalLogs}</span>
                </div>
              </div>
            </div>

            <!-- Maths Stream Card -->
            <div class="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 flex flex-col justify-between">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-2">
                  <span class="text-xl"></span>
                  <span class="text-sm font-bold text-white">Physical Science</span>
                </div>
                <span class="text-xs font-mono font-bold text-cyan-300">${mathMemberPercent}% of cohort</span>
              </div>
              <div class="grid grid-cols-3 gap-2 text-center py-2 bg-white/5 rounded-xl border border-white/5">
                <div>
                  <span class="text-[10px] text-slate-400 uppercase block">Members</span>
                  <span class="text-base font-bold text-white font-mono">${mathData.members}</span>
                </div>
                <div>
                  <span class="text-[10px] text-slate-400 uppercase block">Hours</span>
                  <span class="text-base font-bold text-cyan-300 font-mono">${mathData.totalHours}h</span>
                </div>
                <div>
                  <span class="text-[10px] text-slate-400 uppercase block">Logs</span>
                  <span class="text-base font-bold text-white font-mono">${mathData.totalLogs}</span>
                </div>
              </div>
            </div>

          </div>

          <!-- Visual Proportion Bar -->
          <div class="mt-5">
            <div class="w-full h-3 bg-white/5 rounded-full overflow-hidden flex">
              <div class="h-full bg-gradient-to-r from-emerald-500 to-teal-500" style="width: ${bioMemberPercent}%" title="Bio Stream: ${bioMemberPercent}%"></div>
              <div class="h-full bg-gradient-to-r from-cyan-500 to-indigo-500" style="width: ${mathMemberPercent}%" title="Maths Stream: ${mathMemberPercent}%"></div>
            </div>
            <div class="flex items-center justify-between text-[11px] text-slate-400 mt-1.5 px-1">
              <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-emerald-400"></span> Bio Stream (${bioMemberPercent}%)</span>
              <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-cyan-400"></span> Maths Stream (${mathMemberPercent}%)</span>
            </div>
          </div>
        </div>

        <!-- 3. 7-DAY GROUP STUDY VOLUME AREA CHART -->
        ${this._renderStudyVolumeAreaChart(logs)}

        <!-- 4. TOP PARTICIPATING SCHOOLS DISTRIBUTION -->
        ${this._renderSchoolDistribution(members)}

        <!-- 5. TOP STREAKS LEADERBOARD -->
        <div class="glass-card p-6 sm:p-8 rounded-3xl border border-white/10">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div class="flex items-center gap-2.5">
                <h2 class="text-base font-bold text-white">Top Streaks Leaderboard</h2>
                <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Ranked by Streak & Hours
                </span>
              </div>
              <p class="text-xs text-slate-400 mt-0.5">Students maintaining continuous daily study consistency. Tie-breaker sorted by total hours.</p>
            </div>
          </div>

          <div class="overflow-x-auto -mx-6 sm:mx-0">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="border-b border-white/10 text-slate-400 uppercase tracking-wider font-semibold">
                  <th class="py-3 px-4 text-center">Rank</th>
                  <th class="py-3 px-4">Student & School</th>
                  <th class="py-3 px-4">Study ID</th>
                  <th class="py-3 px-4">Stream</th>
                  <th class="py-3 px-4">Current Streak</th>
                  <th class="py-3 px-4">Total Hours</th>
                  <th class="py-3 px-4">Quality (F / P)</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5 text-slate-300">
                ${leaderboard.length === 0 ? `
                  <tr>
                    <td colspan="7" class="py-8 text-center text-slate-400 italic">No leaderboard records available yet.</td>
                  </tr>
                ` : leaderboard.map((item, index) => this._renderLeaderboardRow(item, index)).join('')}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;
  }

  _renderLeaderboardRow(item, index) {
    const rank = item.rank || (index + 1);
    let rankBadge = `<span class="font-mono text-slate-400 font-bold">${rank}</span>`;

    if (rank === 1) {
      rankBadge = `<span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-sm shadow-md shadow-amber-500/20" title="1st Place (Gold)">🥇</span>`;
    } else if (rank === 2) {
      rankBadge = `<span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-300/20 border border-slate-300/40 text-slate-200 font-bold text-sm" title="2nd Place (Silver)">🥈</span>`;
    } else if (rank === 3) {
      rankBadge = `<span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-700/20 border border-amber-700/40 text-amber-500 font-bold text-sm" title="3rd Place (Bronze)">🥉</span>`;
    }

    const isBio = (item.stream || '').includes('Bio');

    return `
      <tr class="hover:bg-white/[0.03] transition-colors">
        
        <!-- Rank -->
        <td class="py-3.5 px-4 text-center whitespace-nowrap">
          ${rankBadge}
        </td>

        <!-- Student & School -->
        <td class="py-3.5 px-4">
          <div class="font-semibold text-white">${sanitizeString(item.name)}</div>
          <div class="text-[10px] text-slate-400 truncate max-w-[200px]" title="${sanitizeString(item.school)}">${sanitizeString(item.school)}</div>
        </td>

        <!-- Study ID -->
        <td class="py-3.5 px-4 whitespace-nowrap">
          <span class="font-mono text-cyan-300 font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 text-[11px]">
            ${sanitizeString(item.studyId)}
          </span>
        </td>

        <!-- Stream -->
        <td class="py-3.5 px-4 whitespace-nowrap">
          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${isBio ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'}">
            <span>${isBio ? 'Bio' : 'Maths'}</span>
          </span>
        </td>

        <!-- Current Streak -->
        <td class="py-3.5 px-4 whitespace-nowrap">
          <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold font-mono">
            <span>${item.streak || 0} days</span>
          </div>
        </td>

        <!-- Total Hours -->
        <td class="py-3.5 px-4 whitespace-nowrap font-mono">
          <span class="font-bold text-white">${(Number(item.totalHours) || 0).toFixed(1)} hrs</span>
        </td>

        <!-- Quality Scores -->
        <td class="py-3.5 px-4 whitespace-nowrap text-slate-400 font-mono text-[11px]">
          F:<strong class="text-indigo-300">${item.avgFocus || 0}</strong> P:<strong class="text-fuchsia-300">${item.avgProductivity || 0}</strong>
        </td>

      </tr>
    `;
  }

  // ==========================================================================
  // TAB 2: MEMBERS DIRECTORY
  // ==========================================================================

  _renderMembersTab(container) {
    const members = this.adminData.members || [];
    const filteredMembers = this._getFilteredMembers(members);

    container.innerHTML = `
      <div class="flex flex-col gap-6 animate-fade-in">
        
        <!-- Controls & Filters Bar -->
        <div class="glass-card p-6 rounded-3xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div class="flex flex-wrap items-center gap-3 flex-1">
            
            <!-- Search Input -->
            <div class="relative w-full sm:w-64">
              <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"></i>
              <input
                id="admin-member-search"
                type="text"
                value="${sanitizeString(this.memberSearch)}"
                placeholder="Search Name, ID, School, Email..."
                class="apple-input pl-9 pr-3 py-2 text-xs w-full"
              />
            </div>

            <!-- Stream Filter -->
            <select id="admin-member-stream-filter" class="apple-select text-xs py-2 px-3">
              <option value="all" ${this.memberStreamFilter === 'all' ? 'selected' : ''}>All Streams</option>
              <option value="Biological Science" ${this.memberStreamFilter === 'Biological Science' ? 'selected' : ''}>Biological Science</option>
              <option value="Physical Science" ${this.memberStreamFilter === 'Physical Science' ? 'selected' : ''}>Physical Science</option>
            </select>

            <!-- Status Filter -->
            <select id="admin-member-status-filter" class="apple-select text-xs py-2 px-3">
              <option value="all" ${this.memberStatusFilter === 'all' ? 'selected' : ''}>All Statuses</option>
              <option value="Active" ${this.memberStatusFilter === 'Active' ? 'selected' : ''}>Active Only</option>
              <option value="Inactive" ${this.memberStatusFilter === 'Inactive' ? 'selected' : ''}>Inactive Only</option>
            </select>

            <span id="admin-members-count-badge" class="text-xs font-mono px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
              Showing ${filteredMembers.length} of ${members.length} members
            </span>
          </div>

          <!-- Export Actions -->
          <div class="flex items-center gap-2">
            <button id="btn-export-members-json" type="button" class="apple-btn-secondary text-xs px-3.5 py-2.5 flex items-center justify-center gap-1.5 whitespace-nowrap" title="Export Full JSON Database Dump">
              <i data-lucide="database" class="w-4 h-4 text-indigo-400"></i>
              <span>Export JSON</span>
            </button>
            <button id="btn-export-members-csv" type="button" class="apple-btn-primary text-xs px-4 py-2.5 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 whitespace-nowrap" title="Export Members as RFC 4180 CSV">
              <i data-lucide="file-spreadsheet" class="w-4 h-4 text-white"></i>
              <span>Export CSV</span>
            </button>
          </div>

        </div>

        <!-- Members Table -->
        <div class="glass-card p-6 sm:p-8 rounded-3xl border border-white/10">
          <div id="admin-members-table-container">
            ${this._renderMembersTableHtml(filteredMembers)}
          </div>
        </div>

      </div>
    `;

    this._bindMembersFilterEvents(members);
  }

  _getFilteredMembers(members) {
    const q = (this.memberSearch || '').trim().toLowerCase();
    const stream = this.memberStreamFilter;
    const status = this.memberStatusFilter;

    return members.filter(m => {
      // Search match
      if (q) {
        const name = String(m.fullName || '').toLowerCase();
        const id = String(m.studyId || '').toLowerCase();
        const email = String(m.email || '').toLowerCase();
        const school = String(m.school || '').toLowerCase();
        const telegram = String(m.telegram || '').toLowerCase();
        const matches = name.includes(q) || id.includes(q) || email.includes(q) || school.includes(q) || telegram.includes(q);
        if (!matches) return false;
      }

      // Stream filter
      if (stream !== 'all' && m.stream !== stream) {
        return false;
      }

      // Status filter
      if (status !== 'all' && m.status !== status) {
        return false;
      }

      return true;
    });
  }

  _renderMembersTableHtml(members) {
    if (!members || members.length === 0) {
      return `
        <div class="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
          <i data-lucide="user-x" class="w-8 h-8 text-slate-500"></i>
          <p class="text-sm font-semibold text-white">No members matching current filters.</p>
          <p class="text-xs">Try adjusting your search term or filter dropdowns.</p>
        </div>
      `;
    }

    return `
      <div class="overflow-x-auto -mx-6 sm:mx-0">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="border-b border-white/10 text-slate-400 uppercase tracking-wider font-semibold">
              <th class="py-3 px-4">Study ID</th>
              <th class="py-3 px-4">Full Name</th>
              <th class="py-3 px-4">Google Email</th>
              <th class="py-3 px-4">Stream & Elective</th>
              <th class="py-3 px-4">School</th>
              <th class="py-3 px-4">Telegram</th>
              <th class="py-3 px-4">Registered</th>
              <th class="py-3 px-4 text-center">Status</th>
              <th class="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5 text-slate-300">
            ${members.map(m => `
              <tr class="hover:bg-white/[0.03] transition-colors">
                
                <!-- Study ID -->
                <td class="py-3.5 px-4 whitespace-nowrap">
                  <div class="flex items-center gap-1.5">
                    <span class="font-mono text-cyan-300 font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 text-[11px]">
                      ${sanitizeString(m.studyId)}
                    </span>
                  </div>
                </td>

                <!-- Full Name -->
                <td class="py-3.5 px-4 whitespace-nowrap font-semibold text-white">
                  ${sanitizeString(m.fullName)}
                </td>

                <!-- Email -->
                <td class="py-3.5 px-4 whitespace-nowrap text-indigo-300 font-mono text-[11px]">
                  ${sanitizeString(m.email)}
                </td>

                <!-- Stream & Elective -->
                <td class="py-3.5 px-4 whitespace-nowrap">
                  <div>
                    <span class="text-slate-200">${sanitizeString(m.stream)}</span>
                    <span class="text-[10px] text-indigo-300 font-mono block">(${sanitizeString(m.optionalSubject || 'Standard')})</span>
                  </div>
                </td>

                <!-- School -->
                <td class="py-3.5 px-4 max-w-[180px] truncate" title="${sanitizeString(m.school)}">
                  ${sanitizeString(m.school)}
                </td>

                <!-- Telegram -->
                <td class="py-3.5 px-4 whitespace-nowrap font-mono text-cyan-300">
                  ${sanitizeString(m.telegram || '—')}
                </td>

                <!-- Registered -->
                <td class="py-3.5 px-4 whitespace-nowrap text-slate-400 font-mono">
                  ${formatDate(m.registrationDate, 'short')}
                </td>

                <!-- Status -->
                <td class="py-3.5 px-4 text-center whitespace-nowrap">
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${m.status === 'Inactive' ? 'bg-rose-500/15 border border-rose-500/30 text-rose-300' : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'}">
                    <span class="w-1.5 h-1.5 rounded-full ${m.status === 'Inactive' ? 'bg-rose-400' : 'bg-emerald-400 animate-pulse'}"></span>
                    <span>${sanitizeString(m.status || 'Active')}</span>
                  </span>
                </td>

                <!-- Actions: Quick Edit -->
                <td class="py-3.5 px-4 text-center whitespace-nowrap">
                  <button
                    type="button"
                    class="btn-admin-edit-member px-2.5 py-1 rounded-lg bg-white/5 hover:bg-amber-500/20 text-amber-300 hover:text-amber-200 text-[11px] border border-white/10 hover:border-amber-500/30 inline-flex items-center gap-1 transition-colors cursor-pointer"
                    data-studyid="${sanitizeString(m.studyId)}"
                    title="Edit Member Details"
                  >
                    <i data-lucide="edit-3" class="w-3 h-3 text-amber-400"></i>
                    <span>Edit</span>
                  </button>
                </td>

              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  _bindMembersFilterEvents(allMembers) {
    const searchInput = document.getElementById('admin-member-search');
    const streamSelect = document.getElementById('admin-member-stream-filter');
    const statusSelect = document.getElementById('admin-member-status-filter');
    const exportCsvBtn = document.getElementById('btn-export-members-csv');
    const exportJsonBtn = document.getElementById('btn-export-members-json');

    const updateTable = () => {
      const filtered = this._getFilteredMembers(allMembers);
      const container = document.getElementById('admin-members-table-container');
      const badge = document.getElementById('admin-members-count-badge');
      if (container) container.innerHTML = this._renderMembersTableHtml(filtered);
      if (badge) badge.textContent = `Showing ${filtered.length} of ${allMembers.length} members`;
      this._bindMemberEditButtons(allMembers);
      if (typeof window !== 'undefined' && window.lucide) window.lucide.createIcons();
    };

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.memberSearch = e.target.value;
        updateTable();
      });
    }

    if (streamSelect) {
      streamSelect.addEventListener('change', (e) => {
        this.memberStreamFilter = e.target.value;
        updateTable();
      });
    }

    if (statusSelect) {
      statusSelect.addEventListener('change', (e) => {
        this.memberStatusFilter = e.target.value;
        updateTable();
      });
    }

    if (exportCsvBtn) {
      exportCsvBtn.addEventListener('click', () => {
        const filtered = this._getFilteredMembers(allMembers);
        this._exportMembersCsv(filtered);
      });
    }

    if (exportJsonBtn) {
      exportJsonBtn.addEventListener('click', () => {
        this._exportFullDatabaseJson();
      });
    }

    this._bindMemberEditButtons(allMembers);
  }

  _bindMemberEditButtons(allMembers) {
    const editBtns = document.querySelectorAll('.btn-admin-edit-member');
    editBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const studyId = btn.getAttribute('data-studyid');
        const target = (allMembers || []).find(m => m.studyId === studyId);
        if (target) {
          this._openAdminEditMemberModal(target);
        }
      });
    });
  }

  /**
   * Export members list to RFC 4180 CSV
   */
  _exportMembersCsv(members) {
    const headers = [
      'Study ID',
      'Full Name',
      'Email',
      'Gender',
      'Telegram',
      'School',
      'Stream',
      'Optional Subject',
      'Registration Date',
      'Status'
    ];

    const rows = (members || []).map(m => [
      m.studyId || '',
      m.fullName || '',
      m.email || '',
      m.gender || '',
      m.telegram || '',
      m.school || '',
      m.stream || '',
      m.optionalSubject || '',
      m.registrationDate || '',
      m.status || 'Active'
    ]);

    const csvString = generateCsvString(headers, rows);
    const fileName = `StudySync_Members_${getTodayDateString()}.csv`;
    downloadCsvFile(fileName, csvString);

    Toast.success(`Exported ${members.length} members to CSV`, 'Export Complete');
  }

  // ==========================================================================
  // TAB 3: DAILY LOGS INSPECTOR
  // ==========================================================================

  _renderLogsTab(container) {
    const logs = this.adminData.recentLogs || [];
    const members = this.adminData.members || [];
    const filteredLogs = this._getFilteredLogs(logs);

    container.innerHTML = `
      <div class="flex flex-col gap-6 animate-fade-in">
        
        <!-- Controls & Filters Bar -->
        <div class="glass-card p-6 rounded-3xl border border-white/10 flex flex-col gap-4">
          
          <div class="flex flex-wrap items-center justify-between gap-4">
            
            <div class="flex flex-wrap items-center gap-3 flex-1">
              
              <!-- Search Input -->
              <div class="relative w-full sm:w-60">
                <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"></i>
                <input
                  id="admin-logs-search"
                  type="text"
                  value="${sanitizeString(this.logsSearch)}"
                  placeholder="Search ID, Name, Notes..."
                  class="apple-input pl-9 pr-3 py-2 text-xs w-full"
                />
              </div>

              <!-- Date From -->
              <div class="flex items-center gap-1.5 text-xs text-slate-400">
                <span>From:</span>
                <input
                  id="admin-logs-date-from"
                  type="date"
                  value="${this.logsDateFrom}"
                  class="apple-input py-1.5 px-2 text-xs"
                />
              </div>

              <!-- Date To -->
              <div class="flex items-center gap-1.5 text-xs text-slate-400">
                <span>To:</span>
                <input
                  id="admin-logs-date-to"
                  type="date"
                  value="${this.logsDateTo}"
                  class="apple-input py-1.5 px-2 text-xs"
                />
              </div>

              <!-- Student Dropdown -->
              <select id="admin-logs-student-filter" class="apple-select text-xs py-2 px-3 max-w-[180px]">
                <option value="all">All Students</option>
                ${members.map(m => `
                  <option value="${m.studyId}" ${this.logsStudentFilter === m.studyId ? 'selected' : ''}>
                    ${sanitizeString(m.studyId)} (${sanitizeString(m.fullName.split(' ')[0])})
                  </option>
                `).join('')}
              </select>

            </div>

            <!-- CSV Export Button -->
            <button id="btn-export-logs-csv" type="button" class="apple-btn-primary text-xs px-4 py-2.5 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 whitespace-nowrap">
              <i data-lucide="file-spreadsheet" class="w-4 h-4 text-white"></i>
              <span>Export Logs as CSV</span>
            </button>

          </div>

          <!-- Secondary Filter Metrics -->
          <div class="flex items-center justify-between pt-3 border-t border-white/5 text-xs text-slate-400">
            <span id="admin-logs-count-badge">
              Showing <strong class="text-white">${filteredLogs.length}</strong> of ${logs.length} total logs
            </span>
            <span id="admin-logs-sum-hours-badge">
              Sum of Filtered Study Hours: <strong class="text-indigo-300 font-mono">${this._sumHours(filteredLogs)} hrs</strong>
            </span>
          </div>

        </div>

        <!-- Daily Logs Table -->
        <div class="glass-card p-6 sm:p-8 rounded-3xl border border-white/10">
          <div id="admin-logs-table-container">
            ${this._renderLogsTableHtml(filteredLogs)}
          </div>
        </div>

      </div>
    `;

    this._bindLogsFilterEvents(logs);
    this._bindLogsPhotoModalButtons();
  }

  _getFilteredLogs(logs) {
    const q = (this.logsSearch || '').trim().toLowerCase();
    const from = this.logsDateFrom;
    const to = this.logsDateTo;
    const student = this.logsStudentFilter;

    return logs.filter(log => {
      const rawDate = log.dateOfStudy || log.date || '';

      // Date Range filter
      if (from && rawDate < from) return false;
      if (to && rawDate > to) return false;

      // Student filter
      if (student !== 'all' && log.studyId !== student) return false;

      // Search match
      if (q) {
        const id = String(log.studyId || '').toLowerCase();
        const email = String(log.email || '').toLowerCase();
        const notes = String(log.notes || '').toLowerCase();
        const dateStr = String(rawDate).toLowerCase();
        const matches = id.includes(q) || email.includes(q) || notes.includes(q) || dateStr.includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }

  _sumHours(logs) {
    const total = logs.reduce((sum, l) => sum + (Number(l.totalHours) || 0), 0);
    return total.toFixed(1);
  }

  _renderLogsTableHtml(logs) {
    if (!logs || logs.length === 0) {
      return `
        <div class="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
          <i data-lucide="file-x-2" class="w-8 h-8 text-slate-500"></i>
          <p class="text-sm font-semibold text-white">No daily logs matching query.</p>
          <p class="text-xs">Try widening your date range or clearing the search bar.</p>
        </div>
      `;
    }

    return `
      <div class="overflow-x-auto -mx-6 sm:mx-0">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="border-b border-white/10 text-slate-400 uppercase tracking-wider font-semibold">
              <th class="py-3 px-4">Study Date</th>
              <th class="py-3 px-4">Student ID</th>
              <th class="py-3 px-4">Email</th>
              <th class="py-3 px-4">Subject Breakdown (Hours / Focus / Prod)</th>
              <th class="py-3 px-4">Total Time</th>
              <th class="py-3 px-4">Notes</th>
              <th class="py-3 px-4 text-center">Photo Proof</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5 text-slate-300">
            ${logs.map(log => {
              const rawDate = log.dateOfStudy || log.date || log.Date || log.timestamp;
              const formattedDate = formatDate(rawDate, 'medium');
              const totalHours = Number(log.totalHours || 0).toFixed(1);
              const notes = log.notes || '—';
              const proofUrl = log.proofPhotoUrl || log.proofUrl || log.Proof || '';

              // Extract subjects
              let subjects = [];
              if (Array.isArray(log.subjects)) {
                subjects = log.subjects;
              } else {
                for (let i = 1; i <= 3; i++) {
                  const name = log[`subject${i}Name`] || log[`Subject ${i} Name`];
                  const hours = log[`subject${i}Hours`] || log[`Subject ${i} Hours`];
                  const focus = log[`subject${i}Focus`] || log[`Subject ${i} Focus`];
                  const prod = log[`subject${i}Productivity`] || log[`Subject ${i} Productivity`];
                  if (name) subjects.push({ name, hours, focus, productivity: prod });
                }
              }

              return `
                <tr class="hover:bg-white/[0.03] transition-colors">
                  
                  <!-- Date -->
                  <td class="py-3.5 px-4 whitespace-nowrap">
                    <span class="font-semibold text-white block">${formattedDate}</span>
                    <span class="text-[10px] text-slate-400 font-mono">${formatDate(rawDate, 'iso')}</span>
                  </td>

                  <!-- Student ID -->
                  <td class="py-3.5 px-4 whitespace-nowrap">
                    <span class="font-mono text-cyan-300 font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 text-[11px]">
                      ${sanitizeString(log.studyId)}
                    </span>
                  </td>

                  <!-- Email -->
                  <td class="py-3.5 px-4 whitespace-nowrap text-slate-300 text-[11px] font-mono max-w-[140px] truncate" title="${sanitizeString(log.email)}">
                    ${sanitizeString(log.email)}
                  </td>

                  <!-- Subjects -->
                  <td class="py-3.5 px-4 min-w-[240px]">
                    <div class="flex flex-col gap-1">
                      ${subjects.map(s => `
                        <div class="flex items-center justify-between text-[11px] bg-white/[0.02] px-2 py-0.5 rounded border border-white/5">
                          <span class="text-slate-300 font-medium truncate max-w-[120px]">
                            ${getSubjectIcon(s.name)} ${sanitizeString(s.name)}: <strong class="text-white font-mono">${s.hours || 0}h</strong>
                          </span>
                          <span class="text-[10px] font-mono text-slate-400">
                            F:<strong class="text-indigo-300">${s.focus || 0}</strong> P:<strong class="text-fuchsia-300">${s.productivity || 0}</strong>
                          </span>
                        </div>
                      `).join('')}
                    </div>
                  </td>

                  <!-- Total Hours -->
                  <td class="py-3.5 px-4 whitespace-nowrap font-mono text-white font-bold">
                    <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      ${totalHours} hrs
                    </span>
                  </td>

                  <!-- Notes -->
                  <td class="py-3.5 px-4 max-w-[180px]">
                    <p class="text-xs text-slate-300 line-clamp-2 italic" title="${sanitizeString(notes)}">
                      "${sanitizeString(notes)}"
                    </p>
                  </td>

                  <!-- Photo Proof Column -->
                  <td class="py-3.5 px-4 text-center whitespace-nowrap">
                    ${proofUrl ? `
                      <button
                        type="button"
                        class="btn-admin-view-proof inline-flex items-center gap-1 px-2 py-1 rounded bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 transition-colors"
                        data-url="${sanitizeString(proofUrl)}"
                        data-id="${sanitizeString(log.studyId)}"
                        data-date="${sanitizeString(formattedDate)}"
                        data-hours="${totalHours}"
                        data-notes="${sanitizeString(notes)}"
                        title="Inspect Drive Proof Image"
                      >
                        <i data-lucide="image" class="w-3.5 h-3.5"></i>
                        <span>Photo</span>
                      </button>
                    ` : `
                      <span class="text-[10px] text-slate-400 italic">None</span>
                    `}
                  </td>

                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  _bindLogsFilterEvents(allLogs) {
    const searchInput = document.getElementById('admin-logs-search');
    const dateFrom = document.getElementById('admin-logs-date-from');
    const dateTo = document.getElementById('admin-logs-date-to');
    const studentSelect = document.getElementById('admin-logs-student-filter');
    const exportBtn = document.getElementById('btn-export-logs-csv');

    const updateLogsTable = () => {
      const filtered = this._getFilteredLogs(allLogs);
      const container = document.getElementById('admin-logs-table-container');
      const countBadge = document.getElementById('admin-logs-count-badge');
      const sumBadge = document.getElementById('admin-logs-sum-hours-badge');

      if (container) container.innerHTML = this._renderLogsTableHtml(filtered);
      if (countBadge) countBadge.innerHTML = `Showing <strong class="text-white">${filtered.length}</strong> of ${allLogs.length} total logs`;
      if (sumBadge) sumBadge.innerHTML = `Sum of Filtered Study Hours: <strong class="text-indigo-300 font-mono">${this._sumHours(filtered)} hrs</strong>`;

      this._bindLogsPhotoModalButtons();
      if (typeof window !== 'undefined' && window.lucide) window.lucide.createIcons();
    };

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.logsSearch = e.target.value;
        updateLogsTable();
      });
    }

    if (dateFrom) {
      dateFrom.addEventListener('change', (e) => {
        this.logsDateFrom = e.target.value;
        updateLogsTable();
      });
    }

    if (dateTo) {
      dateTo.addEventListener('change', (e) => {
        this.logsDateTo = e.target.value;
        updateLogsTable();
      });
    }

    if (studentSelect) {
      studentSelect.addEventListener('change', (e) => {
        this.logsStudentFilter = e.target.value;
        updateLogsTable();
      });
    }

    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const filtered = this._getFilteredLogs(allLogs);
        this._exportDailyLogsCsv(filtered);
      });
    }
  }

  /**
   * Bind click handlers to proof photo preview buttons in logs tab
   */
  _bindLogsPhotoModalButtons() {
    const photoBtns = typeof document !== 'undefined' ? document.querySelectorAll('.btn-admin-view-proof') : [];
    photoBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const url = btn.getAttribute('data-url');
        const id = btn.getAttribute('data-id');
        const date = btn.getAttribute('data-date');
        const hours = btn.getAttribute('data-hours');
        const notes = btn.getAttribute('data-notes');
        this._openAdminPhotoModal(url, id, date, hours, notes);
      });
    });
  }

  /**
   * Open full-resolution admin proof photo modal
   */
  _openAdminPhotoModal(imageUrl, studyId, date, hours, notes) {
    const modalContainer = typeof document !== 'undefined' ? document.getElementById('modal-container') : null;
    if (!modalContainer) return;

    modalContainer.innerHTML = `
      <div class="relative w-full max-w-2xl bg-[#0D111A] border border-white/15 rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col gap-4 animate-fade-in">
        
        <!-- Modal Header -->
        <div class="flex items-center justify-between border-b border-white/10 pb-3">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <i data-lucide="shield-check" class="w-4 h-4"></i>
            </div>
            <div>
              <h3 class="text-sm font-bold text-white">Admin Proof Inspector</h3>
              <p class="text-[11px] text-slate-400"><span class="font-mono text-cyan-300">${sanitizeString(studyId)}</span> • ${sanitizeString(date)} • ${sanitizeString(hours)} Hours Logged</p>
            </div>
          </div>

          <button id="btn-admin-close-modal" type="button" class="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors" title="Close (Esc)">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Image Container -->
        <div class="relative w-full max-h-[60vh] bg-black/60 rounded-2xl overflow-hidden flex items-center justify-center border border-white/10 p-2">
          <img src="${sanitizeString(imageUrl)}" alt="Drive Study Proof" class="max-w-full max-h-[55vh] object-contain rounded-xl shadow-lg" onerror="this.onerror=null;this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'300\\' height=\\'200\\' viewBox=\\'0 0 300 200\\'><rect width=\\'300\\' height=\\'200\\' fill=\\'%23131B2A\\'/><text x=\\'50%\\' y=\\'50%\\' fill=\\'%2364748B\\' font-size=\\'14\\' font-family=\\'sans-serif\\' text-anchor=\\'middle\\'>Photo Unavailable</text></svg>';" />
        </div>

        <!-- Student Notes -->
        ${notes && notes !== '—' ? `
          <div class="p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-300 italic">
            <span class="text-slate-400 not-italic font-semibold block text-[10px] uppercase mb-0.5">Submitted Notes / Reflections:</span>
            "${sanitizeString(notes)}"
          </div>
        ` : ''}

        <!-- Modal Actions -->
        <div class="flex items-center justify-between pt-2 border-t border-white/10">
          <a href="${sanitizeString(imageUrl)}" target="_blank" rel="noopener noreferrer" class="apple-btn-secondary text-xs px-3.5 py-1.5 flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <span>Open in New Tab</span>
          </a>

          <button id="btn-admin-modal-dismiss" type="button" class="apple-btn-primary text-xs px-4 py-1.5">
            Close Inspector
          </button>
        </div>

      </div>
    `;

    modalContainer.classList.remove('hidden');
    modalContainer.classList.add('flex');

    const closeBtn = modalContainer.querySelector('#btn-admin-close-modal');
    const dismissBtn = modalContainer.querySelector('#btn-admin-modal-dismiss');

    if (closeBtn) closeBtn.addEventListener('click', () => this._closeAdminPhotoModal());
    if (dismissBtn) dismissBtn.addEventListener('click', () => this._closeAdminPhotoModal());

    modalContainer.onclick = (e) => {
      if (e.target === modalContainer) this._closeAdminPhotoModal();
    };

    if (typeof window !== 'undefined' && window.lucide) {
      window.lucide.createIcons();
    }
  }

  _closeAdminPhotoModal() {
    const modalContainer = typeof document !== 'undefined' ? document.getElementById('modal-container') : null;
    if (modalContainer) {
      modalContainer.classList.add('hidden');
      modalContainer.classList.remove('flex');
      modalContainer.innerHTML = '';
      modalContainer.onclick = null;
    }
  }

  /**
   * Export daily study logs to RFC 4180 CSV
   */
  _exportDailyLogsCsv(logs) {
    const headers = [
      'Timestamp',
      'Study ID',
      'Email',
      'Date of Study',
      'Subject 1 Name',
      'Subject 1 Hours',
      'Subject 1 Focus',
      'Subject 1 Productivity',
      'Subject 2 Name',
      'Subject 2 Hours',
      'Subject 2 Focus',
      'Subject 2 Productivity',
      'Subject 3 Name',
      'Subject 3 Hours',
      'Subject 3 Focus',
      'Subject 3 Productivity',
      'Total Hours',
      'Notes',
      'Telegram',
      'Proof Photo URL'
    ];

    const rows = (logs || []).map(log => {
      let s1 = { name: '', hours: '', focus: '', prod: '' };
      let s2 = { name: '', hours: '', focus: '', prod: '' };
      let s3 = { name: '', hours: '', focus: '', prod: '' };

      if (Array.isArray(log.subjects)) {
        if (log.subjects[0]) s1 = { name: log.subjects[0].name, hours: log.subjects[0].hours, focus: log.subjects[0].focus, prod: log.subjects[0].productivity };
        if (log.subjects[1]) s2 = { name: log.subjects[1].name, hours: log.subjects[1].hours, focus: log.subjects[1].focus, prod: log.subjects[1].productivity };
        if (log.subjects[2]) s3 = { name: log.subjects[2].name, hours: log.subjects[2].hours, focus: log.subjects[2].focus, prod: log.subjects[2].productivity };
      } else {
        s1 = { name: log.subject1Name || '', hours: log.subject1Hours || '', focus: log.subject1Focus || '', prod: log.subject1Productivity || '' };
        s2 = { name: log.subject2Name || '', hours: log.subject2Hours || '', focus: log.subject2Focus || '', prod: log.subject2Productivity || '' };
        s3 = { name: log.subject3Name || '', hours: log.subject3Hours || '', focus: log.subject3Focus || '', prod: log.subject3Productivity || '' };
      }

      return [
        log.timestamp || '',
        log.studyId || '',
        log.email || '',
        log.dateOfStudy || log.date || '',
        s1.name || '',
        s1.hours || '',
        s1.focus || '',
        s1.prod || '',
        s2.name || '',
        s2.hours || '',
        s2.focus || '',
        s2.prod || '',
        s3.name || '',
        s3.hours || '',
        s3.focus || '',
        s3.prod || '',
        log.totalHours || '',
        log.notes || '',
        log.telegram || '',
        log.proofPhotoUrl || log.proofUrl || ''
      ];
    });

    const csvString = generateCsvString(headers, rows);
    const fileName = `StudySync_DailyLogs_${getTodayDateString()}.csv`;
    downloadCsvFile(fileName, csvString);

    Toast.success(`Exported ${logs.length} study logs to CSV`, 'Export Complete');
  }

  /**
   * 7-Day Group Study Volume SVG Area Chart
   */
  _renderStudyVolumeAreaChart(logs) {
    const dayData = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const isoStr = d.toISOString().substring(0, 10);
      const dayLogs = (logs || []).filter(l => {
        const dStr = String(l.dateOfStudy || l.date || l.timestamp || '');
        return dStr.startsWith(isoStr);
      });
      const totalHours = dayLogs.reduce((acc, l) => acc + (Number(l.totalHours) || 0), 0);
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
      dayData.push({ date: isoStr, label: dayLabel, hours: Number(totalHours.toFixed(1)) });
    }

    const maxHours = Math.max(10, ...dayData.map(d => d.hours));
    const width = 600;
    const height = 180;
    const padding = { top: 25, right: 30, bottom: 35, left: 45 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const points = dayData.map((d, i) => {
      const x = padding.left + (i / (dayData.length - 1)) * chartW;
      const y = padding.top + chartH - (d.hours / maxHours) * chartH;
      return { ...d, x, y };
    });

    let dPath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cx1 = prev.x + (curr.x - prev.x) / 2;
      const cx2 = cx1;
      dPath += ` C ${cx1} ${prev.y}, ${cx2} ${curr.y}, ${curr.x} ${curr.y}`;
    }

    const areaPath = `${dPath} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`;

    return `
      <div class="glass-card p-6 sm:p-8 rounded-3xl border border-white/10">
        <div class="flex items-center justify-between mb-5">
          <div>
            <h2 class="text-base font-bold text-white flex items-center gap-2">
              <i data-lucide="trending-up" class="w-4 h-4 text-indigo-400"></i>
              <span>7-Day Group Study Volume Telemetry</span>
            </h2>
            <p class="text-xs text-slate-400">Aggregate daily study hours across all registered members</p>
          </div>
          <span class="text-xs font-mono px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">Live Stream Data</span>
        </div>

        <div class="relative w-full overflow-hidden">
          <svg viewBox="0 0 ${width} ${height}" class="w-full h-auto overflow-visible">
            <defs>
              <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#6366F1" stop-opacity="0.5" />
                <stop offset="100%" stop-color="#6366F1" stop-opacity="0.0" />
              </linearGradient>
            </defs>

            <!-- Grid lines -->
            <line x1="${padding.left}" y1="${padding.top}" x2="${width - padding.right}" y2="${padding.top}" stroke="rgba(255,255,255,0.06)" stroke-dasharray="3 3" />
            <line x1="${padding.left}" y1="${padding.top + chartH / 2}" x2="${width - padding.right}" y2="${padding.top + chartH / 2}" stroke="rgba(255,255,255,0.06)" stroke-dasharray="3 3" />
            <line x1="${padding.left}" y1="${padding.top + chartH}" x2="${width - padding.right}" y2="${padding.top + chartH}" stroke="rgba(255,255,255,0.12)" />

            <!-- Y Axis labels -->
            <text x="${padding.left - 8}" y="${padding.top + 4}" fill="#64748B" font-size="10" font-family="monospace" text-anchor="end">${maxHours}h</text>
            <text x="${padding.left - 8}" y="${padding.top + chartH / 2 + 4}" fill="#64748B" font-size="10" font-family="monospace" text-anchor="end">${(maxHours / 2).toFixed(0)}h</text>
            <text x="${padding.left - 8}" y="${padding.top + chartH + 4}" fill="#64748B" font-size="10" font-family="monospace" text-anchor="end">0h</text>

            <!-- Area fill -->
            <path d="${areaPath}" fill="url(#area-grad)" />

            <!-- Smooth Line -->
            <path d="${dPath}" fill="none" stroke="#818CF8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />

            <!-- Points & X Labels -->
            ${points.map(p => `
              <circle cx="${p.x}" cy="${p.y}" r="4.5" fill="#6366F1" stroke="#FFFFFF" stroke-width="1.5" class="transition-all cursor-pointer">
                <title>${p.label}: ${p.hours} hours</title>
              </circle>
              <text x="${p.x}" y="${p.y - 8}" fill="#A5B4FC" font-size="10" font-family="monospace" font-weight="bold" text-anchor="middle">${p.hours > 0 ? p.hours + 'h' : ''}</text>
              <text x="${p.x}" y="${padding.top + chartH + 20}" fill="#94A3B8" font-size="9.5" font-family="sans-serif" text-anchor="middle">${p.label}</text>
            `).join('')}
          </svg>
        </div>
      </div>
    `;
  }

  /**
   * Top Participating Schools Breakdown
   */
  _renderSchoolDistribution(members) {
    const schoolCounts = {};
    (members || []).forEach(m => {
      const s = m.school || 'Unspecified';
      schoolCounts[s] = (schoolCounts[s] || 0) + 1;
    });

    const sortedSchools = Object.entries(schoolCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const total = members.length || 1;

    return `
      <div class="glass-card p-6 sm:p-8 rounded-3xl border border-white/10">
        <div class="flex items-center justify-between mb-5">
          <div>
            <h2 class="text-base font-bold text-white flex items-center gap-2">
              <i data-lucide="graduation-cap" class="w-4 h-4 text-cyan-400"></i>
              <span>Top Participating Schools & Institutions</span>
            </h2>
            <p class="text-xs text-slate-400">Sri Lankan national and provincial colleges with highest active enrollment</p>
          </div>
          <span class="text-xs font-mono text-cyan-300 bg-cyan-500/15 px-2.5 py-1 rounded-full border border-cyan-500/30">Top 5 Cohorts</span>
        </div>

        <div class="space-y-4">
          ${sortedSchools.length === 0 ? `
            <p class="text-xs text-slate-400 italic text-center py-4">No school data recorded yet.</p>
          ` : sortedSchools.map((s, idx) => {
            const pct = Math.round((s.count / total) * 100);
            return `
              <div>
                <div class="flex items-center justify-between text-xs mb-1.5">
                  <span class="font-semibold text-white flex items-center gap-2">
                    <span class="font-mono text-slate-400 text-[11px]">#${idx + 1}</span>
                    <span>${sanitizeString(s.name)}</span>
                  </span>
                  <span class="font-mono text-slate-300 text-[11px]">${s.count} student${s.count > 1 ? 's' : ''} (${pct}%)</span>
                </div>
                <div class="w-full h-2.5 rounded-full bg-white/5 overflow-hidden">
                  <div class="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 rounded-full" style="width: ${pct}%"></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Export Complete Database as formatted JSON
   */
  _exportFullDatabaseJson() {
    if (!this.adminData) {
      Toast.error('No database loaded to export.', 'Export Error');
      return;
    }

    const payload = {
      exportTimestamp: new Date().toISOString(),
      groupDirectorate: 'StudySync A/L Tracker',
      analytics: this.adminData.analytics || {},
      membersCount: (this.adminData.members || []).length,
      members: this.adminData.members || [],
      logsCount: (this.adminData.recentLogs || []).length,
      recentLogs: this.adminData.recentLogs || [],
      leaderboard: this.adminData.leaderboard || []
    };

    const jsonString = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `StudySync_Database_Dump_${getTodayDateString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    Toast.success('Exported full database telemetry as JSON', 'Data Export Complete');
  }

  /**
   * Open Admin Member Quick-Editor modal with dynamic Google Sheet update
   */
  _openAdminEditMemberModal(member) {
    const modalContainer = typeof document !== 'undefined' ? document.getElementById('modal-container') : null;
    if (!modalContainer) return;

    modalContainer.innerHTML = `
      <div class="glass-card p-6 sm:p-8 rounded-3xl max-w-lg w-full border border-white/10 shadow-2xl relative animate-fade-in my-8 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
              <i data-lucide="user-cog" class="w-4 h-4"></i>
            </div>
            <div>
              <h3 class="text-base font-bold text-white leading-tight">Admin Member Editor</h3>
              <p class="text-[11px] text-slate-400">Directly modify Google Sheet record for <span class="font-mono text-cyan-300">${sanitizeString(member.studyId)}</span></p>
            </div>
          </div>
          <button id="btn-close-admin-edit-modal" type="button" class="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>
        </div>

        <form id="form-admin-edit-member" class="flex flex-col gap-4 text-xs">
          <!-- Full Name -->
          <div>
            <label class="block text-[10px] uppercase font-mono tracking-wider text-slate-300 mb-1">Full Name</label>
            <input type="text" id="admin-edit-fullname" required value="${sanitizeString(member.fullName)}" class="glass-input w-full px-3.5 py-2.5 rounded-xl text-white focus:outline-none focus:border-amber-500/50" />
          </div>

          <!-- Email (Read-only) -->
          <div>
            <label class="block text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-1">Google Email (Key)</label>
            <input type="email" value="${sanitizeString(member.email)}" disabled class="glass-input w-full px-3.5 py-2 rounded-xl text-slate-400 font-mono bg-white/[0.02] cursor-not-allowed border border-white/5" />
          </div>

          <!-- School -->
          <div>
            <label class="block text-[10px] uppercase font-mono tracking-wider text-slate-300 mb-1">School / College</label>
            <input type="text" id="admin-edit-school" required value="${sanitizeString(member.school || '')}" class="glass-input w-full px-3.5 py-2.5 rounded-xl text-white focus:outline-none focus:border-amber-500/50" />
          </div>

          <!-- Stream & Optional Subject -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[10px] uppercase font-mono tracking-wider text-slate-300 mb-1">Stream</label>
              <select id="admin-edit-stream" class="apple-select text-xs py-2 px-3 w-full">
                <option value="Biological Science" ${member.stream === 'Biological Science' ? 'selected' : ''}>Biological Science</option>
                <option value="Physical Science" ${member.stream === 'Physical Science' ? 'selected' : ''}>Physical Science</option>
              </select>
            </div>
            <div>
              <label class="block text-[10px] uppercase font-mono tracking-wider text-slate-300 mb-1">Elective Subject</label>
              <input type="text" id="admin-edit-optional" value="${sanitizeString(member.optionalSubject || '')}" class="glass-input w-full px-3.5 py-2.5 rounded-xl text-white focus:outline-none focus:border-amber-500/50" />
            </div>
          </div>

          <!-- Membership Status -->
          <div>
            <label class="block text-[10px] uppercase font-mono tracking-wider text-slate-300 mb-1">Membership Status</label>
            <select id="admin-edit-status" class="apple-select text-xs py-2 px-3 w-full">
              <option value="Active" ${member.status !== 'Inactive' ? 'selected' : ''}> Active</option>
              <option value="Inactive" ${member.status === 'Inactive' ? 'selected' : ''}> Inactive (Suspended)</option>
            </select>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-end gap-2.5 pt-3 mt-2 border-t border-white/10">
            <button id="btn-cancel-admin-edit" type="button" class="apple-btn-secondary text-xs px-4 py-2">
              Cancel
            </button>
            <button id="btn-save-admin-edit" type="submit" class="apple-btn-primary text-xs px-5 py-2 flex items-center gap-2 bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700">
              <i data-lucide="check" class="w-3.5 h-3.5"></i>
              <span>Save & Update Database</span>
            </button>
          </div>
        </form>
      </div>
    `;

    modalContainer.classList.remove('hidden');
    modalContainer.classList.add('flex');

    const closeAdminEdit = () => {
      modalContainer.classList.add('hidden');
      modalContainer.classList.remove('flex');
      modalContainer.innerHTML = '';
      modalContainer.onclick = null;
    };

    modalContainer.querySelector('#btn-close-admin-edit-modal')?.addEventListener('click', closeAdminEdit);
    modalContainer.querySelector('#btn-cancel-admin-edit')?.addEventListener('click', closeAdminEdit);
    modalContainer.onclick = (e) => {
      if (e.target === modalContainer) closeAdminEdit();
    };

    const form = modalContainer.querySelector('#form-admin-edit-member');
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();

      const saveBtn = modalContainer.querySelector('#btn-save-admin-edit');
      if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.innerHTML = `<span class="apple-spinner w-3.5 h-3.5 border-2 border-white/20 border-t-white inline-block"></span> <span>Writing to Google Sheet...</span>`;
      }

      const fullName = modalContainer.querySelector('#admin-edit-fullname')?.value.trim();
      const school = modalContainer.querySelector('#admin-edit-school')?.value.trim();
      const stream = modalContainer.querySelector('#admin-edit-stream')?.value;
      const optionalSubject = modalContainer.querySelector('#admin-edit-optional')?.value.trim();
      const status = modalContainer.querySelector('#admin-edit-status')?.value;

      const user = AppState.getProp('user');
      const adminEmail = user ? user.email : 'alwisachalaanurada@gmail.com';

      const payload = {
        adminEmail,
        studyId: member.studyId,
        fullName,
        school,
        stream,
        optionalSubject,
        status
      };

      try {
        Toast.info('Updating member in Google Sheet...', 'Saving');
        const res = await ApiClient.adminUpdateMember(payload);

        if (res.success && res.data && res.data.member) {
          const updated = res.data.member;
          const idx = (this.adminData.members || []).findIndex(m => m.studyId === member.studyId);
          if (idx !== -1) {
            this.adminData.members[idx] = updated;
          }

          closeAdminEdit();
          Toast.success(`Member ${member.studyId} updated successfully in Google Sheet!`, 'Database Updated');
          this._renderActiveTab();
        } else {
          // Local fallback
          const updated = { ...member, ...payload };
          const idx = (this.adminData.members || []).findIndex(m => m.studyId === member.studyId);
          if (idx !== -1) this.adminData.members[idx] = updated;
          closeAdminEdit();
          Toast.warning('Member updated locally.', 'Offline Mode');
          this._renderActiveTab();
        }
      } catch (err) {
        console.error('[AdminView] Member update error:', err);
        Toast.error('Failed to update member in Google Sheet.', 'Error');
        if (saveBtn) {
          saveBtn.disabled = false;
          saveBtn.innerHTML = `<i data-lucide="check" class="w-3.5 h-3.5"></i> <span>Save & Update Database</span>`;
          if (window.lucide) window.lucide.createIcons();
        }
      }
    });

    if (typeof window !== 'undefined' && window.lucide) {
      window.lucide.createIcons();
    }
  }

  // ==========================================================================
  // TAB SWITCHING & EVENTS
  // ==========================================================================

  _bindTabEvents(user) {
    const tabButtons = this.container.querySelectorAll('.admin-tab-btn');

    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        if (targetTab && targetTab !== this.activeTab) {
          this.activeTab = targetTab;

          // Update tab button styles
          tabButtons.forEach(b => {
            const isCurrent = b.getAttribute('data-tab') === this.activeTab;
            if (isCurrent) {
              b.className = 'admin-tab-btn px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-lg shadow-amber-500/10';
            } else {
              b.className = 'admin-tab-btn px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 text-slate-400 hover:text-white hover:bg-white/5';
            }
          });

          this._renderActiveTab();
        }
      });
    });

    // Refresh Data button
    const refreshBtn = this.container.querySelector('#btn-admin-refresh');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', async () => {
        Toast.info('Syncing latest admin dataset...', 'Syncing');
        await this._fetchAdminData(user.email);
        Toast.success('Admin console synchronized with cloud', 'Sync Complete');
      });
    }

    // Global ESC key listener for photo modal
    this._keydownHandler = (e) => {
      if (e.key === 'Escape') {
        this._closeAdminPhotoModal();
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this._keydownHandler);
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
    this._closeAdminPhotoModal();
  }
}

export default AdminView;
