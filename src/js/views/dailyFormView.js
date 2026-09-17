/**
 * StudySync — Stream-Aware Daily Study Form View Component
 * 
 * Features:
 * - Dynamic stream resolution (3 subjects strictly: Bio: Bio, Chem, Phys/Agri | Maths: Maths, Phys, Chem/ICT)
 * - Decimal hours input with quick buttons (+30m, +1h, +2h, Clear) and live total hours aggregation
 * - Custom 1-10 dual gradient sliders for Focus and Productivity per subject
 * - Date picker defaulting to today (YYYY-MM-DD), blocking future dates
 * - Auto-filled read-only student ID, full name, and Google email
 * - Editable Telegram username and optional notes textarea
 * - Photo proof uploader with live preview, remove action, and Canvas image compression (<400KB base64)
 * - Duplicate submission detection: switches to read-only summary view if already logged for the date
 * - Zero browser popup alerts (animated Toast notification system)
 */

import { AppState } from '../state.js';
import { ApiClient } from '../api.js';
import { Toast } from '../toast.js';
import { CustomSlider, createDualSlider } from '../slider.js';
import {
  getTodayDateString,
  isFutureDate,
  formatDate,
  formatBytes,
  formatTelegramUsername,
  compressImage,
  sanitizeString
} from '../utils.js';

/**
 * Resolve the strictly 3 stream-specific subjects for a student
 * @param {string} stream - 'Biological Science' or 'Physical Science'
 * @param {string} [optionalSubject] - 'Physics'|'Agriculture' or 'Chemistry'|'ICT'
 * @returns {Array<string>} Array of 3 subject names
 */
export function resolveStreamSubjects(stream, optionalSubject) {
  const isBio = stream === 'Biological Science' || String(stream).toLowerCase().includes('bio');
  
  if (isBio) {
    const validOptional = (optionalSubject === 'Agriculture') ? 'Agriculture' : 'Physics';
    return ['Biology', 'Chemistry', validOptional];
  } else {
    const validOptional = (optionalSubject === 'ICT') ? 'ICT' : 'Chemistry';
    return ['Combined Maths', 'Physics', validOptional];
  }
}

/**
 * Get visual icon for a subject
 * @param {string} subjectName 
 * @returns {string} Emoji icon
 */
export function getSubjectIcon(subjectName) {
  switch (subjectName) {
    case 'Biology': return '🧬';
    case 'Chemistry': return '⚗️';
    case 'Physics': return '⚛️';
    case 'Agriculture': return '🌱';
    case 'Combined Maths': return '📐';
    case 'ICT': return '💻';
    default: return '📚';
  }
}

export class DailyFormView {
  constructor() {
    this.container = null;
    this.selectedDate = getTodayDateString();
    this.sliderInstances = [];
    this.proofFileData = null; // { base64, mimeType, fileName, compressedSize, originalSize, previewUrl }
    this.subjects = [];
    this.subjectInputs = [];
    this.isSubmitting = false;
  }

  /**
   * Render daily form view into target container
   * @param {HTMLElement} container 
   */
  render(container) {
    this.container = container;
    const state = AppState.get();

    // 1. Authentication & Registration Guard
    if (!state.user) {
      Toast.warning('Please sign in with your Google account to log study sessions.', 'Sign In Required');
      window.location.hash = '#landing';
      return;
    }

    if (!state.member) {
      Toast.info('Please complete your one-time registration first.', 'Registration Needed');
      window.location.hash = '#register';
      return;
    }

    const member = state.member;
    this.subjects = resolveStreamSubjects(member.stream, member.optionalSubject);

    // 2. Check if a log entry already exists for selectedDate
    const existingLog = this._findLogForDate(this.selectedDate, state);

    if (existingLog) {
      this._renderReadOnlyMode(member, existingLog);
    } else {
      this._renderEditableMode(member);
    }

    if (typeof window !== 'undefined' && window.lucide) {
      window.lucide.createIcons();
    }
  }

  /**
   * Find existing log for a given date in state (todayLog or history)
   * @param {string} dateStr 
   * @param {Object} state 
   * @returns {Object|null}
   */
  _findLogForDate(dateStr, state) {
    if (!dateStr) return null;
    
    // Check state.todayLog
    if (state.todayLog) {
      const todayData = state.todayLog.data || state.todayLog;
      const todayLogDate = todayData.dateOfStudy || todayData.date;
      if (todayLogDate && todayLogDate.substring(0, 10) === dateStr) {
        return todayData;
      }
    }

    // Check state.history
    if (Array.isArray(state.history)) {
      const match = state.history.find(l => {
        const d = l.dateOfStudy || l.date || l.Date;
        return d && d.substring(0, 10) === dateStr;
      });
      if (match) return match;
    }

    return null;
  }

  /**
   * --------------------------------------------------------------------------
   * 1. EDITABLE FORM MODE
   * --------------------------------------------------------------------------
   */
  _renderEditableMode(member) {
    this._cleanupSliders();

    const todayStr = getTodayDateString();
    const isBio = member.stream === 'Biological Science' || String(member.stream).toLowerCase().includes('bio');
    const streamBadgeColor = isBio ? 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-300' : 'from-indigo-500/20 to-cyan-500/20 border-indigo-500/30 text-cyan-300';
    const streamTitle = isBio ? 'Biological Science Stream' : 'Physical Science (Combined Maths) Stream';

    this.container.innerHTML = `
      <div class="w-full max-w-4xl mx-auto py-4 sm:py-6 animate-fade-in">
        
        <!-- Header & Breadcrumbs -->
        <div class="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r ${streamBadgeColor} border text-xs font-semibold mb-2">
              <span>${isBio ? '' : ''}</span>
              <span>${streamTitle}</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Daily Study Log</h1>
            <p class="text-xs sm:text-sm text-slate-300 mt-1">Record your study hours, focus, productivity, and photo proof for daily accountability.</p>
          </div>

          <!-- Date Selector Control -->
          <div class="glass-card p-3 rounded-2xl border border-white/10 flex items-center gap-3 self-start sm:self-auto shadow-lg">
            <div class="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            </div>
            <div class="flex flex-col">
              <label for="input-study-date" class="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Date of Study</label>
              <input 
                type="date" 
                id="input-study-date" 
                value="${this.selectedDate}" 
                max="${todayStr}" 
                class="bg-transparent text-sm font-semibold text-white focus:outline-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        <!-- Main Form Container -->
        <form id="form-daily-study" class="flex flex-col gap-6">

          <!-- 1. Read-Only Member Identity Banner -->
          <div class="glass-card p-4 sm:p-5 rounded-2xl border border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white/[0.02]">
            
            <!-- Study ID -->
            <div class="flex flex-col gap-1">
              <span class="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <svg class="w-3 h-3 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                Unique Study ID
              </span>
              <div class="flex items-center gap-2">
                <span id="display-study-id" class="text-sm sm:text-base font-bold font-mono text-cyan-300">${sanitizeString(member.studyId)}</span>
                <span class="text-[10px] text-slate-500 font-mono"> Locked</span>
              </div>
            </div>

            <!-- Full Name -->
            <div class="flex flex-col gap-1">
              <span class="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <svg class="w-3 h-3 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                Full Name
              </span>
              <span id="display-full-name" class="text-sm font-semibold text-white truncate">${sanitizeString(member.fullName)}</span>
            </div>

            <!-- Google Account Email -->
            <div class="flex flex-col gap-1">
              <span class="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <svg class="w-3 h-3 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                Google Email
              </span>
              <span id="display-email" class="text-xs font-mono text-slate-300 truncate">${sanitizeString(member.email)}</span>
            </div>

          </div>

          <!-- 2. Live Total Hours Banner -->
          <div class="glass-card p-4 sm:p-5 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900/50 flex items-center justify-between shadow-xl">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xl shadow-inner">
                ⏱️
              </div>
              <div>
                <span class="text-[10px] font-mono text-indigo-300 uppercase tracking-wider font-semibold">Total Day Study Time</span>
                <div class="flex items-baseline gap-2">
                  <span id="live-total-hours" class="text-2xl sm:text-3xl font-black text-white tracking-tight font-mono">0.0</span>
                  <span class="text-xs text-slate-400 font-medium">hours</span>
                </div>
              </div>
            </div>

            <div class="hidden sm:flex items-center gap-2">
              <span class="text-xs text-slate-400">Stream Subjects:</span>
              <span class="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-slate-300">${this.subjects.join(' • ')}</span>
            </div>
          </div>

          <!-- 3. Dynamic 3 Stream-Specific Subject Cards -->
          <div class="flex flex-col gap-5" id="subjects-container">
            ${this.subjects.map((subjectName, index) => this._generateSubjectCardHtml(subjectName, index)).join('')}
          </div>

          <!-- 4. Telegram Handle & Optional Notes Card -->
          <div class="glass-card p-5 sm:p-6 rounded-2xl border border-white/10 flex flex-col gap-5">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-cyan-400"></span>
              <h3 class="text-sm font-bold text-white uppercase tracking-wider">Reflection & Telegram Info</h3>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
              
              <!-- Editable Telegram Username -->
              <div class="flex flex-col gap-1.5">
                <label for="input-telegram" class="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Telegram Handle</span>
                  <span class="text-[10px] text-slate-500 font-normal">Editable</span>
                </label>
                <div class="relative">
                  <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-mono">@</span>
                  <input 
                    type="text" 
                    id="input-telegram" 
                    value="${sanitizeString(formatTelegramUsername(member.telegram).replace(/^@/, ''))}" 
                    placeholder="username" 
                    class="glass-input w-full pl-8 pr-3 py-2.5 rounded-xl text-sm font-mono text-white placeholder:text-slate-500 focus:outline-none"
                  />
                </div>
                <span class="text-[10px] text-slate-500">Used by study leaders for daily accountability sync.</span>
              </div>

              <!-- Notes & Reflections -->
              <div class="sm:col-span-2 flex flex-col gap-1.5">
                <label for="input-notes" class="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Daily Reflections & Notes (Optional)</span>
                  <span class="text-[10px] text-slate-400">Topics covered, difficulties, key takeaways</span>
                </label>
                <textarea 
                  id="input-notes" 
                  rows="3" 
                  placeholder="e.g. Completed 15 MCQ questions on Genetics and revised Optics formulas..."
                  class="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none resize-y"
                ></textarea>
              </div>

            </div>
          </div>

          <!-- 5. Photo Proof Uploader (Canvas Compression Engine) -->
          <div class="glass-card p-5 sm:p-6 rounded-2xl border border-white/10 flex flex-col gap-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-purple-400"></span>
                <h3 class="text-sm font-bold text-white uppercase tracking-wider">Photo Proof of Study (Optional / Recommended)</h3>
              </div>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300">Auto-Compressed &lt;400KB</span>
            </div>

            <!-- Upload Dropzone -->
            <div id="photo-dropzone" class="border-2 border-dashed border-white/15 hover:border-indigo-500/50 rounded-2xl p-6 transition-all duration-200 flex flex-col items-center justify-center text-center cursor-pointer bg-white/[0.01] hover:bg-white/[0.03]">
              <input type="file" id="file-proof-input" accept="image/*" class="hidden" />
              
              <div id="dropzone-empty-state" class="flex flex-col items-center gap-2">
                <div class="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center text-2xl shadow-inner">
                  
                </div>
                <div>
                  <p class="text-xs sm:text-sm font-semibold text-white">Click or drag & drop handwritten notes or past paper proof</p>
                  <p class="text-[11px] text-slate-400 mt-0.5">JPEG, PNG, WebP • Canvas compressed automatically before upload</p>
                </div>
              </div>

              <!-- Live Preview State -->
              <div id="dropzone-preview-state" class="hidden w-full flex-col sm:flex-row items-center gap-4 text-left">
                <div class="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden border border-white/20 bg-slate-900 shrink-0 shadow-lg">
                  <img id="photo-preview-img" src="" alt="Proof Preview" class="w-full h-full object-cover" />
                  <span class="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-mono text-emerald-300">Ready</span>
                </div>
                <div class="flex-1 flex flex-col gap-1 min-w-0">
                  <span id="photo-preview-name" class="text-xs font-semibold text-white truncate">proof.jpg</span>
                  <div class="flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-400">
                    <span id="photo-preview-orig-size">Orig: 2.4 MB</span>
                    <span>→</span>
                    <span id="photo-preview-comp-size" class="text-emerald-300 font-bold">Comp: 280 KB</span>
                    <span class="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-300">Passed Limit</span>
                  </div>
                  <p class="text-[11px] text-slate-400 mt-1">Organized in Google Drive: <code class="text-indigo-300">StudySync_Uploads/${sanitizeString(member.studyId)}/${this.selectedDate}/</code></p>
                </div>
                <button type="button" id="btn-remove-photo" class="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  <span>Remove</span>
                </button>
              </div>

            </div>
          </div>

          <!-- Submit CTA Button -->
          <div class="pt-2">
            <button 
              type="submit" 
              id="btn-daily-submit" 
              class="apple-btn-primary w-full py-4 text-base font-bold flex items-center justify-center gap-2 shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.01] active:scale-[0.99] transition-all"
            >
              <span>Submit Daily Study Log</span>
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </button>
          </div>

        </form>

      </div>
    `;

    this._bindDateChange(member);
    this._mountDualSliders();
    this._bindHoursCalculations();
    this._bindPhotoUpload();
    this._bindFormSubmit(member);
  }

  /**
   * Generate HTML for 1 subject card
   */
  _generateSubjectCardHtml(subjectName, index) {
    const icon = getSubjectIcon(subjectName);
    const badgeLabel = index === 2 ? 'Subject 3 (Optional Choice)' : `Subject ${index + 1} (Mandatory)`;
    const badgeColor = index === 2 ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-300' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300';

    return `
      <div class="glass-card p-5 sm:p-6 rounded-2xl border border-white/10 relative overflow-hidden flex flex-col gap-4 subject-card" data-subject-index="${index}" data-subject-name="${sanitizeString(subjectName)}">
        
        <!-- Subject Card Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl shadow-inner">
              ${icon}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-base font-bold text-white">${sanitizeString(subjectName)}</h3>
                <span class="text-[10px] font-mono px-2 py-0.5 rounded-full border ${badgeColor}">${badgeLabel}</span>
              </div>
              <p class="text-[11px] text-slate-400">Record study duration, focus depth, and productivity score.</p>
            </div>
          </div>

          <!-- Study Hours Input & Quick Increment Buttons -->
          <div class="flex items-center gap-2 self-start sm:self-auto">
            
            <!-- Decimal Hours Input -->
            <div class="relative w-28">
              <input 
                type="number" 
                step="0.25" 
                min="0" 
                max="24" 
                value="0" 
                id="hours-input-${index}" 
                class="subject-hours-input glass-input w-full pl-3 pr-8 py-2 rounded-xl text-sm font-bold font-mono text-white text-right focus:outline-none"
              />
              <span class="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-mono text-slate-400 pointer-events-none">hrs</span>
            </div>

            <!-- Quick Add Pill Buttons -->
            <div class="flex items-center gap-1">
              <button type="button" class="btn-quick-add px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-indigo-500/20 text-slate-300 hover:text-indigo-300 border border-white/10 text-xs font-mono font-semibold transition-colors" data-index="${index}" data-add="0.5">+30m</button>
              <button type="button" class="btn-quick-add px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-indigo-500/20 text-slate-300 hover:text-indigo-300 border border-white/10 text-xs font-mono font-semibold transition-colors" data-index="${index}" data-add="1.0">+1h</button>
              <button type="button" class="btn-quick-add px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-indigo-500/20 text-slate-300 hover:text-indigo-300 border border-white/10 text-xs font-mono font-semibold transition-colors" data-index="${index}" data-add="2.0">+2h</button>
              <button type="button" class="btn-quick-clear p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-white/10 text-xs transition-colors" data-index="${index}" title="Reset to 0h">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

          </div>
        </div>

        <!-- Custom Dual Sliders Mount Container (Focus & Productivity) -->
        <div class="slider-mount-container pt-1" id="slider-mount-${index}">
          <!-- Dual slider rendered here by _mountDualSliders() -->
        </div>

      </div>
    `;
  }

  /**
   * Mount custom gradient dual sliders for each subject
   */
  _mountDualSliders() {
    this.subjects.forEach((subjectName, index) => {
      const mountEl = this.container.querySelector(`#slider-mount-${index}`);
      if (!mountEl) return;

      const dual = createDualSlider(mountEl, {
        subjectName,
        initialFocus: 7,
        initialProductivity: 7,
        onFocusChange: () => {},
        onProductivityChange: () => {}
      });

      this.sliderInstances.push({
        index,
        subjectName,
        focusSlider: dual.focusSlider,
        prodSlider: dual.prodSlider
      });
    });
  }

  /**
   * Bind study hours inputs, quick add buttons, and live total calculator
   */
  _bindHoursCalculations() {
    const hoursInputs = this.container.querySelectorAll('.subject-hours-input');
    const quickAddBtns = this.container.querySelectorAll('.btn-quick-add');
    const quickClearBtns = this.container.querySelectorAll('.btn-quick-clear');
    const totalDisplay = this.container.querySelector('#live-total-hours');

    const updateTotal = () => {
      let total = 0;
      hoursInputs.forEach((inp) => {
        const val = parseFloat(inp.value) || 0;
        total += Math.max(0, val);
      });
      if (totalDisplay) {
        totalDisplay.textContent = total.toFixed(1);
      }
    };

    hoursInputs.forEach((inp) => {
      inp.addEventListener('input', () => {
        if (parseFloat(inp.value) < 0) inp.value = 0;
        if (parseFloat(inp.value) > 24) inp.value = 24;
        updateTotal();
      });
    });

    quickAddBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = btn.getAttribute('data-index');
        const addAmount = parseFloat(btn.getAttribute('data-add')) || 0;
        const targetInput = this.container.querySelector(`#hours-input-${idx}`);
        if (targetInput) {
          const current = parseFloat(targetInput.value) || 0;
          const next = Math.min(24, Math.max(0, current + addAmount));
          targetInput.value = next % 1 === 0 ? next : next.toFixed(2);
          updateTotal();
        }
      });
    });

    quickClearBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = btn.getAttribute('data-index');
        const targetInput = this.container.querySelector(`#hours-input-${idx}`);
        if (targetInput) {
          targetInput.value = 0;
          updateTotal();
        }
      });
    });

    updateTotal();
  }

  /**
   * Bind date picker changes and trigger instant mode switch if date has existing log
   */
  _bindDateChange(member) {
    const dateInput = this.container.querySelector('#input-study-date');
    if (!dateInput) return;

    dateInput.addEventListener('change', () => {
      const newDate = dateInput.value;
      if (!newDate) return;

      if (isFutureDate(newDate)) {
        Toast.warning('Cannot log study hours for future dates.', 'Invalid Date');
        dateInput.value = getTodayDateString();
        this.selectedDate = getTodayDateString();
        return;
      }

      this.selectedDate = newDate;
      const state = AppState.get();
      const existing = this._findLogForDate(newDate, state);

      if (existing) {
        Toast.info(`Displaying submitted log for ${formatDate(newDate, 'short')}`, 'Existing Submission');
        this._renderReadOnlyMode(member, existing);
      } else {
        // Re-render editable mode for this date
        this._renderEditableMode(member);
      }
    });
  }

  /**
   * Bind photo proof file uploader with Canvas compression pipeline
   */
  _bindPhotoUpload() {
    const dropzone = this.container.querySelector('#photo-dropzone');
    const fileInput = this.container.querySelector('#file-proof-input');
    const emptyState = this.container.querySelector('#dropzone-empty-state');
    const previewState = this.container.querySelector('#dropzone-preview-state');
    const previewImg = this.container.querySelector('#photo-preview-img');
    const previewName = this.container.querySelector('#photo-preview-name');
    const previewOrig = this.container.querySelector('#photo-preview-orig-size');
    const previewComp = this.container.querySelector('#photo-preview-comp-size');
    const removeBtn = this.container.querySelector('#btn-remove-photo');

    if (!dropzone || !fileInput) return;

    const handleFile = async (file) => {
      if (!file || !file.type || !file.type.startsWith('image/')) {
        Toast.warning('Please select a valid image file (JPEG, PNG, WebP).', 'Invalid File');
        return;
      }

      try {
        emptyState.innerHTML = `
          <div class="apple-spinner w-8 h-8"></div>
          <span class="text-xs text-indigo-300 font-mono">Compressing via Canvas 2D...</span>
        `;

        const result = await compressImage(file, 1600, 0.75);

        this.proofFileData = {
          base64: result.base64,
          mimeType: result.mimeType,
          fileName: result.fileName,
          originalSize: result.originalSize,
          compressedSize: result.compressedSize,
          previewUrl: result.dataUrl
        };

        // Render preview UI
        if (previewImg) previewImg.src = result.dataUrl;
        if (previewName) previewName.textContent = result.fileName;
        if (previewOrig) previewOrig.textContent = `Orig: ${formatBytes(result.originalSize)}`;
        if (previewComp) previewComp.textContent = `Comp: ${formatBytes(result.compressedSize)}`;

        emptyState.classList.add('hidden');
        previewState.classList.remove('hidden');
        previewState.classList.add('flex');

        Toast.success(`Image compressed to ${formatBytes(result.compressedSize)} (< 400KB target)`, 'Photo Ready');
      } catch (err) {
        Toast.error('Failed to compress image file. Please try another image.', 'Compression Error');
        emptyState.classList.remove('hidden');
        previewState.classList.add('hidden');
      }
    };

    dropzone.addEventListener('click', (e) => {
      if (e.target.closest('#btn-remove-photo')) return;
      fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) handleFile(file);
    });

    // Drag & Drop
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('border-indigo-500', 'bg-indigo-500/5');
    });

    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('border-indigo-500', 'bg-indigo-500/5');
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('border-indigo-500', 'bg-indigo-500/5');
      const file = e.dataTransfer.files && e.dataTransfer.files[0];
      if (file) handleFile(file);
    });

    if (removeBtn) {
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.proofFileData = null;
        fileInput.value = '';
        if (previewImg) previewImg.src = '';
        previewState.classList.add('hidden');
        previewState.classList.remove('flex');
        emptyState.classList.remove('hidden');
        emptyState.innerHTML = `
          <div class="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center text-2xl shadow-inner">
            
          </div>
          <div>
            <p class="text-xs sm:text-sm font-semibold text-white">Click or drag & drop handwritten notes or past paper proof</p>
            <p class="text-[11px] text-slate-400 mt-0.5">JPEG, PNG, WebP • Canvas compressed automatically before upload</p>
          </div>
        `;
        Toast.info('Photo proof removed');
      });
    }
  }

  /**
   * Bind submit handler
   */
  _bindFormSubmit(member) {
    const form = this.container.querySelector('#form-daily-study');
    const submitBtn = this.container.querySelector('#btn-daily-submit');
    if (!form || !submitBtn) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (this.isSubmitting) return;

      const dateOfStudy = this.selectedDate || getTodayDateString();
      if (isFutureDate(dateOfStudy)) {
        Toast.warning('Cannot submit study log for a future date.', 'Validation Error');
        return;
      }

      // Collect subject data
      const subjectPayload = [];
      let totalHours = 0;

      this.subjects.forEach((name, idx) => {
        const hoursInp = this.container.querySelector(`#hours-input-${idx}`);
        const hours = parseFloat(hoursInp?.value) || 0;
        totalHours += hours;

        const sliderGroup = this.sliderInstances.find(s => s.index === idx);
        const focus = sliderGroup?.focusSlider?.getValue() ?? 7;
        const productivity = sliderGroup?.prodSlider?.getValue() ?? 7;

        subjectPayload.push({
          name,
          hours: Math.max(0, hours),
          focus: Math.min(10, Math.max(1, focus)),
          productivity: Math.min(10, Math.max(1, productivity))
        });
      });

      if (totalHours <= 0) {
        Toast.warning('Please enter study hours greater than 0 for at least one subject.', 'Zero Study Time');
        return;
      }

      const rawTelegram = this.container.querySelector('#input-telegram')?.value || member.telegram || '';
      const telegram = formatTelegramUsername(rawTelegram);
      const notes = (this.container.querySelector('#input-notes')?.value || '').trim();

      const payload = {
        studyId: member.studyId,
        email: member.email,
        dateOfStudy,
        subjects: subjectPayload,
        notes,
        telegram,
        proofFile: this.proofFileData ? {
          base64: this.proofFileData.base64,
          mimeType: this.proofFileData.mimeType,
          fileName: this.proofFileData.fileName
        } : null
      };

      // Loading UI
      this.isSubmitting = true;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <div class="apple-spinner w-5 h-5"></div>
        <span>Encrypting & Saving Daily Log...</span>
      `;

      try {
        const res = await ApiClient.submitDailyLog(payload);

        if (res.success && res.data) {
          const submittedLog = res.data.log || {
            timestamp: new Date().toISOString(),
            studyId: member.studyId,
            email: member.email,
            dateOfStudy,
            subjects: subjectPayload,
            totalHours,
            notes,
            telegram,
            proofPhotoUrl: res.data.proofPhotoUrl || ''
          };

          // Update global AppState
          const currentHistory = AppState.getProp('history') || [];
          const updatedHistory = [submittedLog, ...currentHistory.filter(l => (l.dateOfStudy || l.date) !== dateOfStudy)];
          
          AppState.set({
            todayLog: dateOfStudy === getTodayDateString() ? { exists: true, data: submittedLog } : AppState.getProp('todayLog'),
            history: updatedHistory
          });

          Toast.success(`Awesome effort! Log recorded for ${formatDate(dateOfStudy, 'short')} (${totalHours} hrs total).`, 'Study Log Saved ');
          
          // Switch to read-only mode for this date
          this._renderReadOnlyMode(member, submittedLog);
        } else {
          Toast.error(res.error || 'Failed to record daily study log', 'Submission Error');
          this.isSubmitting = false;
          submitBtn.disabled = false;
          submitBtn.innerHTML = `
            <span>Submit Daily Study Log</span>
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          `;
        }
      } catch (err) {
        Toast.error(err.message || 'An unexpected error occurred during log submission', 'System Error');
        this.isSubmitting = false;
        submitBtn.disabled = false;
        submitBtn.innerHTML = `
          <span>Submit Daily Study Log</span>
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        `;
      }
    });
  }

  /**
   * --------------------------------------------------------------------------
   * 2. READ-ONLY SUMMARY MODE (One-Submission-Per-Day Lock)
   * --------------------------------------------------------------------------
   */
  _renderReadOnlyMode(member, log) {
    this._cleanupSliders();

    const todayStr = getTodayDateString();
    const logDate = log.dateOfStudy || log.date || this.selectedDate;
    const formattedDate = formatDate(logDate, 'long');

    // Extract subjects array
    let logSubjects = [];
    if (Array.isArray(log.subjects)) {
      logSubjects = log.subjects;
    } else {
      for (let i = 1; i <= 3; i++) {
        const name = log[`subject${i}Name`] || log[`Subject ${i} Name`];
        if (name) {
          logSubjects.push({
            name,
            hours: parseFloat(log[`subject${i}Hours`] || log[`Subject ${i} Hours`]) || 0,
            focus: parseInt(log[`subject${i}Focus`] || log[`Subject ${i} Focus`], 10) || 7,
            productivity: parseInt(log[`subject${i}Productivity`] || log[`Subject ${i} Productivity`], 10) || 7
          });
        }
      }
    }

    if (logSubjects.length === 0) {
      logSubjects = this.subjects.map(s => ({ name: s, hours: 0, focus: 7, productivity: 7 }));
    }

    const totalHours = log.totalHours !== undefined 
      ? log.totalHours 
      : logSubjects.reduce((acc, s) => acc + (parseFloat(s.hours) || 0), 0);

    const notes = log.notes || 'No reflections recorded for this session.';
    const telegram = log.telegram || member.telegram || 'Not provided';
    const proofUrl = log.proofPhotoUrl || log['Proof Photo URL'] || '';

    this.container.innerHTML = `
      <div class="w-full max-w-4xl mx-auto py-4 sm:py-6 animate-fade-in">
        
        <!-- Header & Breadcrumbs -->
        <div class="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-2">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Daily Log Completed & Verified</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Study Summary • ${sanitizeString(logDate)}</h1>
            <p class="text-xs sm:text-sm text-slate-300 mt-1">One-submission-per-day enforcement active. Your log for this date is securely saved.</p>
          </div>

          <!-- Date Selector Control (Can still check other dates) -->
          <div class="glass-card p-3 rounded-2xl border border-white/10 flex items-center gap-3 self-start sm:self-auto shadow-lg">
            <div class="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            </div>
            <div class="flex flex-col">
              <label for="input-study-date-readonly" class="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Inspect Date</label>
              <input 
                type="date" 
                id="input-study-date-readonly" 
                value="${logDate}" 
                max="${todayStr}" 
                class="bg-transparent text-sm font-semibold text-white focus:outline-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        <!-- Lock Status Alert Card -->
        <div class="glass-card p-4 sm:p-5 rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/30 via-slate-900/60 to-slate-900/40 flex items-center justify-between mb-6 shadow-xl">
          <div class="flex items-center gap-3.5">
            <div class="w-11 h-11 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-2xl shrink-0">
              
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h4 class="text-sm font-bold text-white">Daily Log Recorded for ${sanitizeString(formattedDate)}</h4>
                <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">Read-Only</span>
              </div>
              <p class="text-xs text-slate-300 mt-0.5">You have already submitted a daily study log for this date. Duplicates are restricted to maintain sheet integrity.</p>
            </div>
          </div>

          <div class="hidden md:flex flex-col items-end">
            <span class="text-[10px] font-mono text-slate-400 uppercase">Logged Total</span>
            <span class="text-xl font-bold font-mono text-emerald-300">${totalHours.toFixed(1)} hrs</span>
          </div>
        </div>

        <div class="flex flex-col gap-6">

          <!-- 1. Member Identity Details -->
          <div class="glass-card p-4 sm:p-5 rounded-2xl border border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white/[0.02]">
            <div class="flex flex-col gap-1">
              <span class="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Member ID</span>
              <span class="text-sm font-bold font-mono text-cyan-300">${sanitizeString(member.studyId)}</span>
            </div>
            <div class="flex flex-col gap-1">
              <span class="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Full Name</span>
              <span class="text-sm font-semibold text-white">${sanitizeString(member.fullName)}</span>
            </div>
            <div class="flex flex-col gap-1">
              <span class="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Study Stream</span>
              <span class="text-xs font-mono text-slate-300">${sanitizeString(member.stream)}</span>
            </div>
          </div>

          <!-- 2. Stream 3-Subject Read-Only Cards -->
          <div class="flex flex-col gap-4">
            ${logSubjects.map((sub, idx) => {
              const icon = getSubjectIcon(sub.name);
              const focusTier = CustomSlider.getScoreTier(sub.focus);
              const prodTier = CustomSlider.getScoreTier(sub.productivity);

              return `
                <div class="glass-card p-5 rounded-2xl border border-white/10 flex flex-col gap-3.5 bg-white/[0.01]">
                  
                  <!-- Card Top: Name + Hours -->
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <div class="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lg">
                        ${icon}
                      </div>
                      <div>
                        <h4 class="text-sm font-bold text-white">${sanitizeString(sub.name)}</h4>
                        <span class="text-[10px] text-slate-400 font-mono">Subject #${idx + 1}</span>
                      </div>
                    </div>

                    <div class="flex items-baseline gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                      <span class="text-base font-bold font-mono text-white">${(parseFloat(sub.hours) || 0).toFixed(1)}</span>
                      <span class="text-xs font-mono text-slate-400">hours</span>
                    </div>
                  </div>

                  <!-- Metrics Pills: Focus & Productivity -->
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/5 text-xs">
                    
                    <!-- Focus Pill -->
                    <div class="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                      <span class="text-slate-400">Focus Score:</span>
                      <div class="flex items-center gap-2">
                        <span class="font-mono font-bold text-white">${sub.focus}/10</span>
                        <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full" style="background:${focusTier.badgeBg}; border:1px solid ${focusTier.badgeBorder}; color:${focusTier.textColor}">
                          ${focusTier.emoji} ${focusTier.status}
                        </span>
                      </div>
                    </div>

                    <!-- Productivity Pill -->
                    <div class="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                      <span class="text-slate-400">Productivity Score:</span>
                      <div class="flex items-center gap-2">
                        <span class="font-mono font-bold text-white">${sub.productivity}/10</span>
                        <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full" style="background:${prodTier.badgeBg}; border:1px solid ${prodTier.badgeBorder}; color:${prodTier.textColor}">
                          ${prodTier.emoji} ${prodTier.status}
                        </span>
                      </div>
                    </div>

                  </div>

                </div>
              `;
            }).join('')}
          </div>

          <!-- 3. Reflections & Proof Display Card -->
          <div class="glass-card p-5 sm:p-6 rounded-2xl border border-white/10 flex flex-col gap-4">
            <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider">Session Reflections & Proof</h4>

            <div class="flex flex-col gap-2">
              <span class="text-[10px] font-mono text-slate-400 uppercase">Telegram Contact</span>
              <span class="text-sm font-mono text-cyan-300">${sanitizeString(telegram)}</span>
            </div>

            <div class="flex flex-col gap-2">
              <span class="text-[10px] font-mono text-slate-400 uppercase">Study Reflections</span>
              <p class="text-sm text-slate-200 bg-white/[0.03] p-3.5 rounded-xl border border-white/5 leading-relaxed">${sanitizeString(notes)}</p>
            </div>

            ${proofUrl ? `
              <div class="flex flex-col gap-2 pt-2 border-t border-white/5">
                <span class="text-[10px] font-mono text-slate-400 uppercase">Photo Proof</span>
                <div class="flex items-center gap-4">
                  <a href="${proofUrl}" target="_blank" rel="noopener noreferrer" class="group relative w-32 h-32 rounded-xl overflow-hidden border border-white/20 shadow-lg">
                    <img src="${proofUrl}" alt="Study Proof" class="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold transition-opacity">
                      View Full Size ↗
                    </div>
                  </a>
                  <div class="flex flex-col gap-1 text-xs text-slate-400">
                    <span class="text-white font-medium">Uploaded Photo Proof</span>
                    <span class="text-[11px] font-mono">Stored securely in Drive</span>
                    <a href="${proofUrl}" target="_blank" rel="noopener noreferrer" class="text-indigo-400 hover:text-indigo-300 underline text-xs mt-1">Open Image Link ↗</a>
                  </div>
                </div>
              </div>
            ` : `
              <div class="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-slate-400 italic">
                No photo proof was attached with this submission.
              </div>
            `}
          </div>

          <!-- Bottom Action Buttons -->
          <div class="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <a href="#dashboard" class="apple-btn-secondary w-full sm:w-auto py-3 text-sm flex items-center justify-center gap-2">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
              <span>Back to Dashboard</span>
            </a>
            <a href="#history" class="apple-btn-primary w-full sm:w-auto py-3 text-sm flex items-center justify-center gap-2">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              <span>View Full History Table</span>
            </a>
          </div>

        </div>

      </div>
    `;

    // Bind date change in read-only mode so user can switch to another date
    const dateInput = this.container.querySelector('#input-study-date-readonly');
    if (dateInput) {
      dateInput.addEventListener('change', () => {
        const newDate = dateInput.value;
        if (!newDate) return;

        if (isFutureDate(newDate)) {
          Toast.warning('Cannot view or log study hours for future dates.', 'Invalid Date');
          dateInput.value = logDate;
          return;
        }

        this.selectedDate = newDate;
        const state = AppState.get();
        const existing = this._findLogForDate(newDate, state);

        if (existing) {
          this._renderReadOnlyMode(member, existing);
        } else {
          this._renderEditableMode(member);
        }
      });
    }
  }

  /**
   * Cleanup slider instances to prevent memory leaks
   */
  _cleanupSliders() {
    this.sliderInstances = [];
  }

  /**
   * Teardown view on router route change
   */
  destroy() {
    this._cleanupSliders();
    this.proofFileData = null;
    this.container = null;
  }
}

export default DailyFormView;
