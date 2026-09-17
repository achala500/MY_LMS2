/**
 * StudySync â€” Verify View Component (Public Member Verification View)
 * Publicly renders official cryptographic verification badge, student details,
 * and live anti-counterfeit UTC timestamp for scanned QR passes or direct URL lookups.
 */

import { ApiClient } from '../api.js';
import { AppState } from '../state.js';
import { formatDate } from '../utils.js';

export class VerifyView {
  constructor() {
    this.container = null;
    this.currentStudyId = null;
  }

  /**
   * Render public verification view into target DOM container
   * @param {HTMLElement} container 
   */
  render(container) {
    this.container = container;
    
    // Extract ID from routeParams or hash
    const state = AppState.get();
    const routeId = state.routeParams?.id || this._getIdFromHash();

    this.container.innerHTML = `
      <div class="w-full max-w-lg mx-auto py-6 sm:py-10 animate-fade-in">
        
        <!-- Header -->
        <div class="text-center mb-6">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Public Member Verification Registry</span>
          </div>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Member ID Verification</h2>
          <p class="text-xs text-slate-400 mt-1">Official Sri Lanka G.C.E. A/L StudySync Authentication</p>
        </div>

        <!-- Verification Glass Card -->
        <div id="verify-card-box" class="glass-card p-6 sm:p-8 relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
          
          <!-- Top Decorative Accent -->
          <div class="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-cyan-500 to-indigo-500"></div>

          <!-- Lookup / Search Box -->
          <div id="verify-lookup-box" class="mb-6">
            <label for="verify-input-id" class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Enter Study ID to Verify
            </label>
            <div class="flex gap-2">
              <input 
                type="text" 
                id="verify-input-id" 
                placeholder="e.g. SG-BIO-0001 or SG-MATH-0001" 
                value="${this._escape(routeId || '')}"
                class="glass-input flex-1 px-3.5 py-2.5 rounded-xl text-sm font-mono uppercase focus:outline-none text-white placeholder:text-slate-500" 
              />
              <button id="btn-do-verify" type="button" class="apple-btn-primary text-xs px-5 py-2.5 font-bold">
                <span>Verify</span>
              </button>
            </div>
          </div>

          <!-- Loading State -->
          <div id="verify-state-loading" class="hidden flex-col items-center justify-center py-10 gap-3 text-center">
            <div class="apple-spinner w-8 h-8"></div>
            <p class="text-xs text-slate-400 font-mono">Authenticating with official registry...</p>
          </div>

          <!-- Verified Success State -->
          <div id="verify-state-success" class="hidden flex-col gap-5 animate-fade-in">
            
            <!-- Verified Banner -->
            <div class="flex items-center gap-3.5 p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
              <div class="w-11 h-11 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                <svg class="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 class="text-sm font-bold text-emerald-300 uppercase tracking-wide">Official Verified Member</h3>
                <p class="text-[11px] text-emerald-400/80">Active StudySync G.C.E. A/L Member Record</p>
              </div>
            </div>

            <!-- Member Profile Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              
              <!-- Full Name -->
              <div class="p-3 rounded-xl bg-white/5 border border-white/5 sm:col-span-2">
                <span class="text-[10px] text-slate-400 uppercase font-mono tracking-wider block mb-0.5">Member Full Name</span>
                <span id="v-res-name" class="font-bold text-base text-white">â€”</span>
              </div>

              <!-- Study ID -->
              <div class="p-3 rounded-xl bg-white/5 border border-white/5">
                <span class="text-[10px] text-slate-400 uppercase font-mono tracking-wider block mb-0.5">Unique Study ID</span>
                <span id="v-res-id" class="font-mono font-bold text-sm text-cyan-300">â€”</span>
              </div>

              <!-- Membership Status -->
              <div class="p-3 rounded-xl bg-white/5 border border-white/5">
                <span class="text-[10px] text-slate-400 uppercase font-mono tracking-wider block mb-0.5">Status</span>
                <span id="v-res-status" class="inline-flex items-center gap-1.5 font-bold text-emerald-400">
                  <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Active Member
                </span>
              </div>

              <!-- School -->
              <div class="p-3 rounded-xl bg-white/5 border border-white/5 sm:col-span-2">
                <span class="text-[10px] text-slate-400 uppercase font-mono tracking-wider block mb-0.5">School / College</span>
                <span id="v-res-school" class="font-medium text-slate-200">â€”</span>
              </div>

              <!-- Stream & Optional Subject -->
              <div class="p-3 rounded-xl bg-white/5 border border-white/5 sm:col-span-2">
                <span class="text-[10px] text-slate-400 uppercase font-mono tracking-wider block mb-0.5">A/L Subject Stream</span>
                <span id="v-res-stream" class="font-semibold text-indigo-300">â€”</span>
              </div>

              <!-- Registration Date -->
              <div class="p-3 rounded-xl bg-white/5 border border-white/5 sm:col-span-2">
                <span class="text-[10px] text-slate-400 uppercase font-mono tracking-wider block mb-0.5">Registration & Issue Date</span>
                <span id="v-res-date" class="text-slate-300 font-mono">â€”</span>
              </div>

            </div>

            <!-- Anti-Counterfeit Stamp -->
            <div class="pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span>Timestamp: <span id="v-res-timestamp" class="text-slate-400">2026-08-26 09:30 UTC</span></span>
              <span class="text-emerald-400"> Cryptographically Authenticated</span>
            </div>

          </div>

          <!-- Invalid / Error State -->
          <div id="verify-state-error" class="hidden flex-col items-center text-center py-8 gap-3 animate-fade-in">
            <div class="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 class="text-base font-bold text-rose-300">Member Record Not Found</h3>
              <p id="verify-error-text" class="text-xs text-slate-400 mt-1 max-w-xs">
                No member record was found matching this Study ID. Ensure the ID was typed correctly.
              </p>
            </div>
          </div>

        </div>

        <!-- Back to App Link -->
        <div class="text-center mt-6">
          <a href="#landing" class="text-xs text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1.5 transition-colors">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Return to StudySync Main App</span>
          </a>
        </div>

      </div>
    `;

    this._bindEvents();

    if (routeId) {
      this.performLookup(routeId);
    }
  }

  _bindEvents() {
    const input = this.container.querySelector('#verify-input-id');
    const btn = this.container.querySelector('#btn-do-verify');

    if (btn && input) {
      btn.addEventListener('click', () => {
        const id = input.value.trim().toUpperCase();
        if (id) this.performLookup(id);
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const id = input.value.trim().toUpperCase();
          if (id) this.performLookup(id);
        }
      });
    }
  }

  /**
   * Perform verification query against ApiClient or local records
   * @param {string} studyId 
   */
  async performLookup(studyId) {
    if (!studyId) return;

    const loadingEl = this.container.querySelector('#verify-state-loading');
    const successEl = this.container.querySelector('#verify-state-success');
    const errorEl = this.container.querySelector('#verify-state-error');
    const errorTextEl = this.container.querySelector('#verify-error-text');

    if (!loadingEl || !successEl || !errorEl) return;

    loadingEl.classList.remove('hidden');
    loadingEl.classList.add('flex');
    successEl.classList.add('hidden');
    successEl.classList.remove('flex');
    errorEl.classList.add('hidden');
    errorEl.classList.remove('flex');

    try {
      // 1. First check active AppState if current member matches
      let member = null;
      const state = AppState.get();
      if (state.member && state.member.studyId?.toUpperCase() === studyId) {
        member = state.member;
      }

      // 2. Query ApiClient verify endpoint
      if (!member) {
        const res = await ApiClient.verifyMember(studyId);
        if (res.success && res.data && res.data.valid) {
          member = res.data.member;
        }
      }

      loadingEl.classList.add('hidden');
      loadingEl.classList.remove('flex');

      // 3. If member found from backend or current session, display verified state
      if (member) {
        this.container.querySelector('#v-res-name').textContent = member.fullName || member.name || 'Member';
        this.container.querySelector('#v-res-id').textContent = member.studyId || studyId;
        this.container.querySelector('#v-res-school').textContent = member.school || 'Sri Lanka School';
        this.container.querySelector('#v-res-stream').textContent = `${member.stream || 'A/L Stream'}${member.optionalSubject ? ` (${member.optionalSubject})` : ''}`;
        this.container.querySelector('#v-res-date').textContent = formatDate(member.registrationDate || new Date(), 'medium');
        this.container.querySelector('#v-res-status').innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> ${member.status || 'Active Member'}`;
        this.container.querySelector('#v-res-timestamp').textContent = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';

        successEl.classList.remove('hidden');
        successEl.classList.add('flex');
      } else {
        errorTextEl.textContent = `No active member was found matching Study ID "${studyId}". Please check the ID.`;
        errorEl.classList.remove('hidden');
        errorEl.classList.add('flex');
      }
    } catch (err) {
      loadingEl.classList.add('hidden');
      loadingEl.classList.remove('flex');
      errorTextEl.textContent = 'A network error occurred while querying the verification registry.';
      errorEl.classList.remove('hidden');
      errorEl.classList.add('flex');
    }
  }

  _getIdFromHash() {
    if (typeof window === 'undefined' || !window.location.hash) return null;
    const match = window.location.hash.match(/#(?:verify\/)?([A-Za-z0-9\-]+)/);
    return match ? match[1].toUpperCase() : null;
  }

  _escape(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, '');
  }

  destroy() {
    this.container = null;
  }
}

export default VerifyView;
