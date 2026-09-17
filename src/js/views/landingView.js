/**
 * StudySync — Landing View Component
 * Apple-inspired hero showcase, Google Sign-In CTA, quick 1-click demo role switcher,
 * live Platform ID Card ID card preview canvas, and feature bento grid.
 */

import { AuthService } from '../auth.js';
import { IdCard } from '../idcard.js';
import { AppState } from '../state.js';

export class LandingView {
  constructor() {
    this.container = null;
    this._previewCanvas = null;
  }

  /**
   * Render landing view into target DOM container
   * @param {HTMLElement} container 
   */
  render(container) {
    this.container = container;
    
    // If user is already logged in and registered, allow quick jump
    const state = AppState.get();
    const isLoggedIn = Boolean(state.user);

    this.container.innerHTML = `
      <div class="flex flex-col items-center w-full max-w-6xl mx-auto py-6 sm:py-12 gap-12 sm:gap-20 animate-fade-in">
        
        <!-- 1. HERO SECTION -->
        <section class="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-14 w-full">
          
          <!-- Left Hero Text & CTAs -->
          <div class="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left gap-6 max-w-2xl">
            
            <!-- Category Badge -->
            <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-semibold tracking-wide">
              <span class="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
              <span>G.C.E. Advanced Level Sri Lanka • Study Accountability System</span>
            </div>

            <!-- Main Headline with Gradient Text -->
            <h1 class="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
              Elevate Your <span class="gradient-text">A/L Journey</span> with Precision Tracking.
            </h1>

            <!-- Subtitle -->
            <p class="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
              Track stream-specific study hours, log 1-10 focus levels, and upload verified photo proofs. 
              Generate your official <strong class="text-white">StudySync Platform ID Card</strong> and maintain your daily study streak.
            </p>

            <!-- Primary Actions & Google Sign-In -->
            <div class="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto mt-2">
              
              <!-- Google Sign-In Button -->
              <button id="btn-hero-google" type="button" class="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-sm transition-all duration-200 shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:scale-[1.02] flex items-center justify-center gap-3 active:scale-[0.98]">
                <svg class="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Continue with Google</span>
              </button>

              <!-- Direct Account Registration Button -->
              <button id="btn-hero-direct" type="button" class="apple-btn-primary w-full sm:w-auto text-sm px-6 py-3.5 flex items-center justify-center gap-2 font-semibold shadow-lg shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all">
                <svg class="w-4 h-4 text-indigo-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <span>Register Account</span>
              </button>

              <!-- Verify Pass Secondary Button -->
              <a href="verify.html" class="apple-btn-secondary w-full sm:w-auto text-sm px-5 py-3.5 flex items-center justify-center gap-2">
                <svg class="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Verify ID</span>
              </a>
            </div>

            <!-- Features Highlights Pills -->
            <div class="w-full mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div class="p-3 rounded-2xl glass-card border border-white/10 flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                </div>
                <div class="text-left">
                  <p class="text-xs font-bold text-white">1:1 Account ID</p>
                  <p class="text-[10px] text-slate-400">Zero duplicate data</p>
                </div>
              </div>

              <div class="p-3 rounded-2xl glass-card border border-white/10 flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
                </div>
                <div class="text-left">
                  <p class="text-xs font-bold text-white">Stream-Specific</p>
                  <p class="text-[10px] text-slate-400">Bio & Maths tracks</p>
                </div>
              </div>

              <div class="p-3 rounded-2xl glass-card border border-white/10 flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                </div>
                <div class="text-left">
                  <p class="text-xs font-bold text-white">Drive Photo Proof</p>
                  <p class="text-[10px] text-slate-400">Secure cloud sync</p>
                </div>
              </div>
            </div>

          </div>

          <!-- Right Hero Pass Preview Canvas -->
          <div class="flex-1 flex flex-col items-center justify-center relative w-full max-w-md lg:max-w-lg">
            
            <div class="relative group cursor-pointer w-full flex flex-col items-center">
              <!-- Glow halo -->
              <div class="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 rounded-3xl blur-xl opacity-30 group-hover:opacity-60 transition duration-500"></div>
              
              <!-- Card container -->
              <div class="relative w-full rounded-2xl overflow-hidden shadow-2xl border border-white/15 bg-black/40 backdrop-blur-xl p-2 sm:p-3">
                <div class="flex items-center justify-between mb-2 px-1 text-[11px] text-slate-400">
                  <span class="font-mono flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Digital Platform ID Card
                  </span>
                  <span class="text-indigo-400 font-medium">Auto Generated</span>
                </div>
                
                <!-- Dynamic Canvas Preview Element -->
                <canvas id="hero-pass-canvas" class="w-full h-auto rounded-xl shadow-inner border border-white/10 block"></canvas>
              </div>
            </div>

            <p class="text-[11px] text-slate-400 font-mono text-center mt-3">
              Encrypted dual QR payload with live cryptographic verification.
            </p>
          </div>

        </section>

        <!-- 2. FEATURE BENTO GRID -->
        <section class="w-full flex flex-col gap-6">
          <div class="text-center max-w-xl mx-auto mb-2">
            <h2 class="text-2xl sm:text-3xl font-bold text-white tracking-tight">Engineered for Academic Excellence</h2>
            <p class="text-xs sm:text-sm text-slate-400 mt-2">Zero fluff. Stream-aware daily discipline built for Sri Lankan students.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
            
            <!-- Bento 1: Stream-Aware Tracking -->
            <div class="glass-card p-6 rounded-2xl flex flex-col gap-3.5 border border-white/10 relative overflow-hidden group hover:border-indigo-500/40 transition-colors">
              <div class="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 class="text-base font-bold text-white">Stream-Specific Subjects</h3>
              <p class="text-xs text-slate-300 leading-relaxed">
                Bio students see Biology, Chemistry, and Physics/Ag. Maths students see Combined Maths, Physics, and Chemistry/ICT. Clean, focused, and distraction-free.
              </p>
            </div>

            <!-- Bento 2: Platform ID Card -->
            <div class="glass-card p-6 rounded-2xl flex flex-col gap-3.5 border border-white/10 relative overflow-hidden group hover:border-purple-500/40 transition-colors">
              <div class="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
              </div>
              <h3 class="text-base font-bold text-white">Platform ID Card</h3>
              <p class="text-xs text-slate-300 leading-relaxed">
                Metallic dark gradient pass featuring gold EMV chip, SF Pro typography, 300DPI 3x PNG export, and an embedded verification QR code.
              </p>
            </div>

            <!-- Bento 3: Streaks & Analytics -->
            <div class="glass-card p-6 rounded-2xl flex flex-col gap-3.5 border border-white/10 relative overflow-hidden group hover:border-cyan-500/40 transition-colors">
              <div class="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 class="text-base font-bold text-white">Streaks & Group Leaderboard</h3>
              <p class="text-xs text-slate-300 leading-relaxed">
                Automatic consecutive study streak computation, aggregate study hours, 1-10 focus metrics, and a ranked leaderboard for member accountability.
              </p>
            </div>

          </div>
        </section>

      </div>
    `;

    this._bindEvents();
    this._renderPreviewPass();
  }

  _bindEvents() {
    // Google Sign-In CTA
    const googleBtn = this.container.querySelector('#btn-hero-google');
    if (googleBtn) {
      googleBtn.addEventListener('click', async () => {
        googleBtn.disabled = true;
        const originalHtml = googleBtn.innerHTML;
        googleBtn.innerHTML = `
          <div class="apple-spinner w-4 h-4"></div>
          <span>Connecting with Google...</span>
        `;
        try {
          await AuthService.signIn();
        } finally {
          if (googleBtn) {
            googleBtn.disabled = false;
            googleBtn.innerHTML = originalHtml;
          }
        }
      });
    }

    // Direct Account Creation / Sign-In CTA
    const directBtn = this.container.querySelector('#btn-hero-direct');
    if (directBtn) {
      directBtn.addEventListener('click', async () => {
        await AuthService.promptEmailSignIn();
      });
    }
  }

  _renderPreviewPass() {
    const canvas = this.container.querySelector('#hero-pass-canvas');
    if (!canvas) return;

    const sampleMember = {
      studyId: 'SG-AL-2026',
      fullName: 'A/L STUDY MEMBER',
      school: 'Sri Lanka National College',
      stream: 'Physical Science',
      optionalSubject: 'Chemistry',
      registrationDate: '2026-08-26',
      status: 'Active'
    };

    try {
      IdCard.renderToCanvas(sampleMember, canvas, 1);
    } catch (err) {
      console.warn('[LandingView] Failed to render sample pass preview:', err);
    }
  }

  destroy() {
    this.container = null;
  }
}

export default LandingView;
