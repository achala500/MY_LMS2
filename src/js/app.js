/**
 * StudySync — Main Application Bootstrap & Client-Side Hash Router
 * Wires AppState, Toast system, header navigation, and view mounting for all routes:
 * #landing, #register, #dashboard, #daily, #history, #admin, #verify/:id
 */

import { AppState } from './state.js';
import { Toast } from './toast.js';
import { calculateStreak } from './utils.js';

import { LandingView } from './views/landingView.js';
import { RegisterView } from './views/registerView.js';
import { VerifyView } from './views/verifyView.js';
import { DailyFormView } from './views/dailyFormView.js';
import { DashboardView } from './views/dashboardView.js';
import { AdminView, ADMIN_EMAILS } from './views/adminView.js';

class AppRouter {
  constructor() {
    this.root = null;
    this.header = null;
    this.streakPill = null;
    this.streakVal = null;
    this.userSection = null;
    this.navLinks = null;
    this.adminLink = null;
    this.currentViewInstance = null;

    if (typeof window !== 'undefined') {
      this._init();
    }
  }

  _init() {
    if (typeof document !== 'undefined') {
      this.root = document.getElementById('app-root');
      this.header = document.getElementById('app-header');
      this.streakPill = document.getElementById('header-streak-pill');
      this.streakVal = document.getElementById('header-streak-val');
      this.userSection = document.getElementById('header-user-section');
      this.navLinks = document.getElementById('header-nav-links');
      this.adminLink = document.getElementById('nav-admin-link');
    }

    // Listen to hash route changes
    window.addEventListener('hashchange', () => this._handleRouteChange());

    // Subscribe to state changes to update header UI
    AppState.subscribe((state) => this._onStateChange(state));

    // Handle initial route
    this._handleRouteChange();
  }

  _onStateChange(state) {
    if (!this.userSection) return;

    // Update streak display in header
    if (state.member) {
      let streakCount = 0;
      if (Array.isArray(state.history) && state.history.length > 0) {
        const streakInfo = calculateStreak(state.history);
        streakCount = streakInfo.currentStreak || 0;
      } else if (state.member.streakCount !== undefined) {
        streakCount = state.member.streakCount || 0;
      }

      if (this.streakPill && this.streakVal) {
        this.streakVal.textContent = streakCount;
        this.streakPill.classList.remove('hidden');
        this.streakPill.classList.add('flex');
      }
    } else if (this.streakPill) {
      this.streakPill.classList.add('hidden');
      this.streakPill.classList.remove('flex');
    }

    // Update navigation links visibility
    if (state.user) {
      if (this.navLinks) this.navLinks.classList.remove('hidden');
      
      if (this.adminLink) {
        const isAdmin = AdminView.isAuthorizedAdmin(state.user.email) || (state.member && state.member.role === 'admin');
        if (isAdmin) {
          this.adminLink.classList.remove('hidden');
        } else {
          this.adminLink.classList.add('hidden');
        }
      }

      // User profile button
      this.userSection.innerHTML = `
        <div class="flex items-center gap-2.5">
          <div class="flex flex-col items-end hidden sm:flex">
            <span class="text-xs font-semibold text-white leading-tight">${this._escape(state.user.displayName || state.member?.fullName || 'Student')}</span>
            <span class="text-[10px] font-mono text-cyan-300 leading-none">${state.member?.studyId || 'Member'}</span>
          </div>
          <button id="btn-logout" type="button" class="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition-colors border border-white/5" title="Sign Out">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      `;

      const logoutBtn = this.userSection.querySelector('#btn-logout');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
          AppState.reset();
          Toast.info('Signed out successfully');
          window.location.hash = '#landing';
        });
      }
    } else {
      if (this.navLinks) this.navLinks.classList.add('hidden');
      if (this.adminLink) this.adminLink.classList.add('hidden');
      this.userSection.innerHTML = `
        <button id="header-login-btn" type="button" class="apple-btn-secondary text-xs px-3.5 py-1.5 flex items-center gap-1.5">
          <svg class="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
          <span>Sign In / Register</span>
        </button>
      `;

      const headerLoginBtn = this.userSection.querySelector('#header-login-btn');
      if (headerLoginBtn) {
        headerLoginBtn.addEventListener('click', () => {
          import('./auth.js').then(({ AuthService }) => AuthService.signIn());
        });
      }
    }

    // Refresh Lucide icons if loaded
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  _handleRouteChange() {
    const rawHash = window.location.hash.slice(1) || 'landing';
    const [route, param] = rawHash.split('/');

    AppState.set({
      route,
      routeParams: param ? { id: param } : {}
    });

    // Highlight active nav links
    document.querySelectorAll('.nav-link').forEach((link) => {
      const href = link.getAttribute('href');
      if (href === `#${route}`) {
        link.classList.add('bg-white/10', 'text-white');
        link.classList.remove('text-slate-300');
      } else {
        link.classList.remove('bg-white/10', 'text-white');
        link.classList.add('text-slate-300');
      }
    });

    // Mount active view component
    this._mountView(route, param);

    // Custom event for view renderers
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new CustomEvent('app:routechange', {
        detail: { route, param }
      }));
    }
  }

  _mountView(route, param) {
    if (!this.root && typeof document !== 'undefined') {
      this.root = document.getElementById('app-root');
    }
    if (!this.root) return;

    if (this.currentViewInstance && typeof this.currentViewInstance.destroy === 'function') {
      try {
        this.currentViewInstance.destroy();
      } catch (dErr) {
        console.warn('[AppRouter] View destroy warning:', dErr);
      }
    }

    const state = AppState.get();
    const setHash = (h) => {
      if (typeof window !== 'undefined' && window.location) {
        window.location.hash = h;
      }
    };

    try {
      switch (route) {
        case 'landing':
          this.currentViewInstance = new LandingView();
          this.currentViewInstance.render(this.root);
          break;

        case 'register':
          this.currentViewInstance = new RegisterView();
          this.currentViewInstance.render(this.root);
          break;

        case 'verify':
          this.currentViewInstance = new VerifyView();
          this.currentViewInstance.render(this.root);
          break;

        case 'daily':
          if (!state.user) {
            Toast.warning('Please sign in to access your daily study log.', 'Authentication Required');
            setHash('#landing');
          } else if (!state.member) {
            Toast.info('Please complete your one-time registration first.', 'Registration Needed');
            setHash('#register');
          } else {
            this.currentViewInstance = new DailyFormView();
            this.currentViewInstance.render(this.root);
          }
          break;

        case 'dashboard':
          if (!state.user) {
            Toast.warning('Please sign in to access your dashboard.', 'Authentication Required');
            setHash('#landing');
          } else if (!state.member) {
            Toast.info('Please complete your one-time registration first.', 'Registration Needed');
            setHash('#register');
          } else {
            this.currentViewInstance = new DashboardView();
            this.currentViewInstance.render(this.root);
          }
          break;

        case 'history':
          if (!state.user) {
            Toast.warning('Please sign in to access your study history.', 'Authentication Required');
            setHash('#landing');
          } else if (!state.member) {
            Toast.info('Please complete your one-time registration first.', 'Registration Needed');
            setHash('#register');
          } else {
            this.currentViewInstance = new DashboardView();
            this.currentViewInstance.render(this.root);
          }
          break;

        case 'admin':
          if (!state.user) {
            Toast.warning('Please sign in with administrator credentials.', 'Authentication Required');
            setHash('#landing');
          } else {
            this.currentViewInstance = new AdminView();
            this.currentViewInstance.render(this.root);
          }
          break;

        default:
          if (!state.user) {
            setHash('#landing');
          } else if (state.member) {
            setHash('#dashboard');
          } else {
            setHash('#register');
          }
          break;
      }
    } catch (err) {
      console.error('[AppRouter] Mount view failed for route:', route, err);
      if (this.root) {
        this.root.innerHTML = `
          <div class="glass-card p-8 rounded-3xl border border-white/10 max-w-md mx-auto text-center my-12 flex flex-col items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            </div>
            <h3 class="text-lg font-bold text-white">Application Loading Error</h3>
            <p class="text-xs text-slate-300">An unexpected error occurred while loading this view.</p>
            <button onclick="window.location.hash='#landing'; window.location.reload();" class="apple-btn-primary text-xs px-5 py-2.5">
              Reload StudySync
            </button>
          </div>
        `;
      }
    }

    if (typeof window !== 'undefined' && window.lucide) {
      try {
        window.lucide.createIcons();
      } catch (lErr) {
        console.warn('[AppRouter] Lucide warning:', lErr);
      }
    }
  }

  _escape(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, '');
  }
}

// Bootstrap router when DOM is ready (handles both pre- and post-DOMContentLoaded module execution)
if (typeof document !== 'undefined') {
  const startRouter = () => {
    if (!window.appRouter) {
      window.appRouter = new AppRouter();
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startRouter);
  } else {
    startRouter();
  }
}

export { AppRouter };
export default AppRouter;
