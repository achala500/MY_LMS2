/**
 * StudySync â€” Registration View Component
 * One-time stream-aware registration flow with locked Google email (1:1 mapping),
 * searchable school autocomplete, stream selection, and dynamic optional subject selector.
 */

import { AppState } from '../state.js';
import { ApiClient } from '../api.js';
import { Toast } from '../toast.js';
import { initSchoolAutocomplete } from '../schools.js';
import { formatTelegramUsername } from '../utils.js';

export class RegisterView {
  constructor() {
    this.container = null;
    this.schoolAutocomplete = null;
    this.selectedStream = 'Biological Science';
    this.selectedOptional = 'Physics';
  }

  /**
   * Render registration view into target DOM container
   * @param {HTMLElement} container 
   */
  render(container) {
    this.container = container;
    const state = AppState.get();

    // Check if user is authenticated
    if (!state.user) {
      Toast.warning('Please sign in with your Google account first.', 'Authentication Required');
      window.location.hash = '#landing';
      return;
    }

    // If user is already registered, redirect to dashboard
    if (state.member) {
      Toast.info(`Already registered as ${state.member.fullName} (${state.member.studyId})`, 'Existing Account');
      window.location.hash = '#dashboard';
      return;
    }

    const authUser = state.user;
    const prefillEmail = authUser.email || '';
    const prefillName = authUser.displayName || '';

    this.container.innerHTML = `
      <div class="w-full max-w-2xl mx-auto py-4 sm:py-8 animate-fade-in">
        
        <!-- Registration Card Container -->
        <div class="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
          
          <!-- Top Accent Line -->
          <div class="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500"></div>

          <!-- Header -->
          <div class="mb-6 text-center sm:text-left">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-2">
              <span class="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
              <span>One-Time Member Onboarding</span>
            </div>
            <h2 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Study Group Registration</h2>
            <p class="text-xs sm:text-sm text-slate-300 mt-1">
              Complete your profile to receive your sequential <strong class="text-cyan-300 font-mono">Study ID</strong> and official <strong class="text-white">Platform ID Card</strong>.
            </p>
          </div>

          <!-- Form Element -->
          <form id="form-register" class="flex flex-col gap-5">
            
            <!-- 1. Google Email (Read-Only 1:1 Account Binding) -->
            <div class="flex flex-col gap-1.5">
              <label for="reg-email" class="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Google Account Email (Locked Key)</span>
                <span class="text-[10px] text-indigo-400 font-normal flex items-center gap-1">
                  <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                  Authenticated
                </span>
              </label>
              <div class="relative">
                <input 
                  type="email" 
                  id="reg-email" 
                  name="email" 
                  value="${this._escape(prefillEmail)}" 
                  readonly 
                  tabindex="-1"
                  class="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm font-mono bg-white/[0.03] text-slate-300 border-white/10 cursor-not-allowed opacity-90 focus:outline-none" 
                />
                <div class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs"> Immutable</div>
              </div>
              <p class="text-[10px] text-slate-500">1 Google account = 1 Member ID. Prevents duplicate registrations and keeps your history linked.</p>
            </div>

            <!-- 2. Full Name -->
            <div class="flex flex-col gap-1.5">
              <label for="reg-name" class="text-xs font-semibold text-slate-300">
                Full Name <span class="text-rose-400">*</span>
              </label>
              <input 
                type="text" 
                id="reg-name" 
                name="fullName" 
                value="${this._escape(prefillName)}" 
                placeholder="e.g. Achala Anuradha" 
                required 
                class="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none text-white placeholder:text-slate-500" 
              />
            </div>

            <!-- 3. Gender & Telegram Username (2 Columns) -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <!-- Gender -->
              <div class="flex flex-col gap-1.5">
                <label for="reg-gender" class="text-xs font-semibold text-slate-300">
                  Gender <span class="text-rose-400">*</span>
                </label>
                <select 
                  id="reg-gender" 
                  name="gender" 
                  required 
                  class="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none text-white bg-[#0E131F]"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <!-- Telegram Username -->
              <div class="flex flex-col gap-1.5">
                <label for="reg-telegram" class="text-xs font-semibold text-slate-300">
                  Telegram Username <span class="text-rose-400">*</span>
                </label>
                <div class="relative">
                  <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-mono">@</span>
                  <input 
                    type="text" 
                    id="reg-telegram" 
                    name="telegram" 
                    placeholder="your_telegram_handle" 
                    required 
                    class="glass-input w-full pl-8 pr-3.5 py-2.5 rounded-xl text-sm font-mono focus:outline-none text-white placeholder:text-slate-500" 
                  />
                </div>
              </div>

            </div>

            <!-- 4. School Searchable Autocomplete -->
            <div class="flex flex-col gap-1.5 relative">
              <label for="reg-school-input" class="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>School / College <span class="text-rose-400">*</span></span>
                <span class="text-[10px] text-slate-400">260+ Sri Lankan Schools</span>
              </label>
              <div class="relative">
                <input 
                  type="text" 
                  id="reg-school-input" 
                  placeholder="Type school name (e.g. Royal College, Ananda, Visakha, Kandy...)" 
                  autocomplete="off" 
                  required 
                  class="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none text-white placeholder:text-slate-500" 
                />
                <div class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                </div>
              </div>
              
              <!-- Autocomplete Dropdown Popup -->
              <div id="school-dropdown" class="autocomplete-dropdown hidden absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-xl glass-card border border-white/15 shadow-2xl bg-[#0B0F19]/95 "></div>
            </div>

            <!-- 5. A/L Stream Selection (Visual Cards) -->
            <div class="flex flex-col gap-2 pt-2 border-t border-white/10">
              <label class="text-xs font-semibold text-slate-300">
                A/L Subject Stream <span class="text-rose-400">*</span>
              </label>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                <!-- Biological Science Option Card -->
                <label class="stream-card cursor-pointer p-3.5 rounded-2xl border transition-all duration-200 flex items-center gap-3 bg-white/5 border-indigo-500/40 text-white" data-stream="Biological Science">
                  <input type="radio" name="stream" value="Biological Science" checked class="hidden" />
                  <div class="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <span class="text-lg"></span>
                  </div>
                  <div>
                    <h4 class="text-xs font-bold text-white">Biological Science</h4>
                    <p class="text-[10px] text-slate-400">Prefix: <span class="font-mono text-cyan-300">SG-BIO-XXXX</span></p>
                  </div>
                </label>

                <!-- Physical Science Option Card -->
                <label class="stream-card cursor-pointer p-3.5 rounded-2xl border transition-all duration-200 flex items-center gap-3 bg-white/5 border-white/10 text-slate-300 hover:border-white/20" data-stream="Physical Science">
                  <input type="radio" name="stream" value="Physical Science" class="hidden" />
                  <div class="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                    <span class="text-lg"></span>
                  </div>
                  <div>
                    <h4 class="text-xs font-bold text-white">Physical Science (Maths)</h4>
                    <p class="text-[10px] text-slate-400">Prefix: <span class="font-mono text-indigo-300">SG-MATH-XXXX</span></p>
                  </div>
                </label>

              </div>
            </div>

            <!-- 6. Dynamic Optional Subject Picker -->
            <div class="flex flex-col gap-2" id="optional-subject-container">
              <label class="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Optional 3rd Subject <span class="text-rose-400">*</span></span>
                <span id="optional-subject-hint" class="text-[10px] text-indigo-300 font-mono">Bio Stream: Physics OR Agriculture</span>
              </label>

              <div id="optional-subject-choices" class="grid grid-cols-2 gap-3">
                <!-- Dynamically populated by _updateOptionalChoices() -->
              </div>
            </div>

            <!-- 7. Dynamic 3-Subject Preview Tag Bar -->
            <div class="p-3.5 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-1.5">
              <span class="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Your Daily Tracking Subjects</span>
              <div id="subject-preview-tags" class="flex flex-wrap gap-2">
                <!-- Dynamically populated tags -->
              </div>
            </div>

            <!-- Submit Button -->
            <div class="pt-2">
              <button 
                type="submit" 
                id="btn-register-submit" 
                class="apple-btn-primary w-full py-3.5 text-sm font-bold flex items-center justify-center gap-2 shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all"
              >
                <span>Complete Registration & Generate Digital ID</span>
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>

          </form>

        </div>

      </div>
    `;

    this._initAutocomplete();
    this._bindStreamEvents();
    this._updateOptionalChoices();
    this._bindFormSubmit();
  }

  _initAutocomplete() {
    const schoolInput = this.container.querySelector('#reg-school-input');
    const dropdown = this.container.querySelector('#school-dropdown');
    if (!schoolInput || !dropdown) return;

    this.schoolAutocomplete = initSchoolAutocomplete(schoolInput, dropdown, (selectedSchool) => {
      schoolInput.value = selectedSchool;
    });
  }

  _bindStreamEvents() {
    const streamCards = this.container.querySelectorAll('.stream-card');
    streamCards.forEach((card) => {
      card.addEventListener('click', () => {
        const streamVal = card.getAttribute('data-stream');
        this.selectedStream = streamVal;

        // Update card styles
        streamCards.forEach((c) => {
          if (c.getAttribute('data-stream') === streamVal) {
            c.classList.add('border-indigo-500/50', 'bg-indigo-500/10');
            c.classList.remove('border-white/10', 'bg-white/5');
            const radio = c.querySelector('input[type="radio"]');
            if (radio) radio.checked = true;
          } else {
            c.classList.remove('border-indigo-500/50', 'bg-indigo-500/10');
            c.classList.add('border-white/10', 'bg-white/5');
            const radio = c.querySelector('input[type="radio"]');
            if (radio) radio.checked = false;
          }
        });

        // Set default optional for stream
        this.selectedOptional = streamVal === 'Biological Science' ? 'Physics' : 'Chemistry';
        this._updateOptionalChoices();
      });
    });
  }

  _updateOptionalChoices() {
    const choicesContainer = this.container.querySelector('#optional-subject-choices');
    const hintEl = this.container.querySelector('#optional-subject-hint');
    const tagsContainer = this.container.querySelector('#subject-preview-tags');
    if (!choicesContainer) return;

    const isBio = this.selectedStream === 'Biological Science';
    const choices = isBio ? ['Physics', 'Agriculture'] : ['Chemistry', 'ICT'];
    const mandatory = isBio ? ['Biology', 'Chemistry'] : ['Combined Maths', 'Physics'];

    if (hintEl) {
      hintEl.textContent = isBio ? 'Bio Stream: Physics OR Agriculture' : 'Maths Stream: Chemistry OR ICT';
    }

    choicesContainer.innerHTML = choices.map((opt) => `
      <label class="optional-card cursor-pointer p-3 rounded-xl border transition-all flex items-center justify-between ${
        this.selectedOptional === opt ? 'bg-indigo-500/20 border-indigo-500/50 text-white' : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/20'
      }" data-option="${opt}">
        <input type="radio" name="optionalSubject" value="${opt}" ${this.selectedOptional === opt ? 'checked' : ''} class="hidden" />
        <span class="text-xs font-semibold">${opt}</span>
        <span class="w-4 h-4 rounded-full border ${this.selectedOptional === opt ? 'border-indigo-400 bg-indigo-500 flex items-center justify-center' : 'border-slate-500'}">
          ${this.selectedOptional === opt ? '<span class="w-1.5 h-1.5 rounded-full bg-white"></span>' : ''}
        </span>
      </label>
    `).join('');

    // Bind click on optional cards
    choicesContainer.querySelectorAll('.optional-card').forEach((card) => {
      card.addEventListener('click', () => {
        this.selectedOptional = card.getAttribute('data-option');
        this._updateOptionalChoices();
      });
    });

    // Update 3-subject preview tags
    if (tagsContainer) {
      tagsContainer.innerHTML = `
        <span class="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium">1. ${mandatory[0]}</span>
        <span class="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium">2. ${mandatory[1]}</span>
        <span class="px-2.5 py-1 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-medium">3. ${this.selectedOptional} (Optional)</span>
      `;
    }
  }

  _bindFormSubmit() {
    const form = this.container.querySelector('#form-register');
    const submitBtn = this.container.querySelector('#btn-register-submit');
    if (!form || !submitBtn) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const fullName = (form.querySelector('#reg-name')?.value || '').trim();
      const email = (form.querySelector('#reg-email')?.value || '').trim().toLowerCase();
      const gender = form.querySelector('#reg-gender')?.value || 'Other';
      const telegramRaw = (form.querySelector('#reg-telegram')?.value || '').trim();
      const school = (form.querySelector('#reg-school-input')?.value || '').trim();
      const stream = this.selectedStream;
      const optionalSubject = this.selectedOptional;

      if (!fullName) {
        Toast.error('Please enter your full name', 'Validation Error');
        return;
      }
      if (!email) {
        Toast.error('Google account email is missing', 'Validation Error');
        return;
      }
      if (!telegramRaw) {
        Toast.error('Please enter your Telegram username', 'Validation Error');
        return;
      }
      if (!school) {
        Toast.error('Please select or enter your school name', 'Validation Error');
        return;
      }

      const telegram = formatTelegramUsername(telegramRaw);

      // Loading UI
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <div class="apple-spinner w-4 h-4"></div>
        <span>Generating Unique Study ID...</span>
      `;

      try {
        const payload = {
          fullName,
          email,
          gender,
          telegram,
          school,
          stream,
          optionalSubject
        };

        const res = await ApiClient.registerUser(payload);

        if (res.success && res.data) {
          const memberData = res.data.member || res.data;
          AppState.set({ member: memberData });

          Toast.success(`Registration successful! Allocated Study ID: ${memberData.studyId}`, 'Welcome to StudySync');
          window.location.hash = '#dashboard';
        } else {
          Toast.error(res.error || 'Failed to complete registration', 'Registration Error');
          submitBtn.disabled = false;
          submitBtn.innerHTML = `
            <span>Complete Registration & Generate Digital ID</span>
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          `;
        }
      } catch (err) {
        Toast.error(err.message || 'An unexpected error occurred during registration', 'System Error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = `
          <span>Complete Registration & Generate Digital ID</span>
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
        `;
      }
    });
  }

  _escape(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, '');
  }

  destroy() {
    if (this.schoolAutocomplete) {
      this.schoolAutocomplete.destroy();
      this.schoolAutocomplete = null;
    }
    this.container = null;
  }
}

export default RegisterView;
