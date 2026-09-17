/**
 * StudySync — Standalone Toast Notification Engine
 * High-performance, animated toast notifications. Zero browser alert dialogs.
 */

class ToastEngine {
  constructor() {
    this.container = null;
    this.toasts = new Map();
    this.counter = 0;
    this._initContainer();
    this._installAlertSafeguard();
  }

  /**
   * Ensure the toast DOM container exists
   */
  _initContainer() {
    if (typeof document === 'undefined') return;
    
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.setAttribute('aria-live', 'polite');
      container.setAttribute('role', 'region');
      container.setAttribute('aria-label', 'Notifications');
      document.body.appendChild(container);
    }
    this.container = container;
  }

  /**
   * Overrides window.alert to guarantee zero browser alert dialogs
   */
  _installAlertSafeguard() {
    if (typeof window !== 'undefined') {
      window.alert = (message) => {
        this.warning(String(message), 'System Notice');
      };
    }
  }

  /**
   * Display a new toast notification
   * @param {Object} options 
   * @param {string} options.message - Notification body text
   * @param {string} [options.title] - Optional title
   * @param {'success'|'error'|'warning'|'info'} [options.type='info'] - Notification type
   * @param {number} [options.duration=4000] - Auto-dismiss timeout in ms (0 for persistent)
   * @returns {string} Toast ID
   */
  show({ message, title, type = 'info', duration = 4000 }) {
    if (typeof document === 'undefined') return '';
    if (!this.container) this._initContainer();

    const id = `toast-${++this.counter}`;
    const safeType = ['success', 'error', 'warning', 'info'].includes(type) ? type : 'info';
    
    // Default titles based on type
    const defaultTitles = {
      success: 'Success',
      error: 'Error',
      warning: 'Warning',
      info: 'Notice'
    };
    const toastTitle = title || defaultTitles[safeType];

    // Icons SVG
    const icons = {
      success: `<svg class="w-5 h-5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
      error: `<svg class="w-5 h-5 text-rose-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
      warning: `<svg class="w-5 h-5 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>`,
      info: `<svg class="w-5 h-5 text-cyan-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`
    };

    // Create Toast DOM element
    const el = document.createElement('div');
    el.id = id;
    el.className = `toast-item toast-${safeType}`;
    el.setAttribute('role', 'alert');

    el.innerHTML = `
      ${icons[safeType]}
      <div class="flex-1 min-w-0">
        <h4 class="text-sm font-semibold text-white leading-tight mb-0.5">${this._escapeHtml(toastTitle)}</h4>
        <p class="text-xs text-slate-300 leading-relaxed break-words">${this._escapeHtml(message)}</p>
      </div>
      <button type="button" class="toast-close text-slate-400 hover:text-white transition-colors p-1 -mr-1 -mt-1 rounded-md focus:outline-none" aria-label="Close notification">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
      ${duration > 0 ? `<div class="toast-progress-bar" style="transform: scaleX(1);"></div>` : ''}
    `;

    // Attach dismiss click
    const closeBtn = el.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => this.dismiss(id));

    // Append to container
    this.container.appendChild(el);

    // Trigger show animation on next animation frame
    requestAnimationFrame(() => {
      el.classList.add('toast-show');
    });

    const toastRecord = {
      id,
      el,
      timer: null,
      startTime: Date.now(),
      remainingTime: duration,
      duration,
      isPaused: false
    };

    // Countdown & Progress bar animation
    if (duration > 0) {
      const progressBar = el.querySelector('.toast-progress-bar');
      if (progressBar) {
        progressBar.style.transitionDuration = `${duration}ms`;
        requestAnimationFrame(() => {
          progressBar.style.transform = 'scaleX(0)';
        });
      }

      toastRecord.timer = setTimeout(() => {
        this.dismiss(id);
      }, duration);

      // Hover to pause countdown
      el.addEventListener('mouseenter', () => {
        if (!toastRecord.isPaused) {
          clearTimeout(toastRecord.timer);
          toastRecord.isPaused = true;
          const elapsed = Date.now() - toastRecord.startTime;
          toastRecord.remainingTime = Math.max(0, toastRecord.duration - elapsed);
          if (progressBar) {
            const computedTransform = window.getComputedStyle(progressBar).transform;
            progressBar.style.transition = 'none';
            progressBar.style.transform = computedTransform;
          }
        }
      });

      el.addEventListener('mouseleave', () => {
        if (toastRecord.isPaused && toastRecord.remainingTime > 0) {
          toastRecord.isPaused = false;
          toastRecord.startTime = Date.now();
          if (progressBar) {
            progressBar.style.transition = `transform ${toastRecord.remainingTime}ms linear`;
            progressBar.style.transform = 'scaleX(0)';
          }
          toastRecord.timer = setTimeout(() => {
            this.dismiss(id);
          }, toastRecord.remainingTime);
        }
      });
    }

    this.toasts.set(id, toastRecord);
    return id;
  }

  /**
   * Convenience helpers
   */
  success(message, title = 'Success', duration = 4000) {
    return this.show({ message, title, type: 'success', duration });
  }

  error(message, title = 'Error', duration = 5000) {
    return this.show({ message, title, type: 'error', duration });
  }

  warning(message, title = 'Warning', duration = 4500) {
    return this.show({ message, title, type: 'warning', duration });
  }

  info(message, title = 'Information', duration = 4000) {
    return this.show({ message, title, type: 'info', duration });
  }

  /**
   * Dismiss and remove a toast with smooth slide-out animation
   * @param {string} id 
   */
  dismiss(id) {
    const toast = this.toasts.get(id);
    if (!toast) return;

    if (toast.timer) clearTimeout(toast.timer);

    toast.el.classList.remove('toast-show');
    toast.el.classList.add('toast-hide');

    setTimeout(() => {
      if (toast.el.parentNode) {
        toast.el.parentNode.removeChild(toast.el);
      }
      this.toasts.delete(id);
    }, 350);
  }

  /**
   * Clear all active toasts immediately
   */
  clearAll() {
    for (const [id] of this.toasts) {
      this.dismiss(id);
    }
  }

  /**
   * Basic HTML entity escaping
   */
  _escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

// Export singleton
export const Toast = new ToastEngine();
export default Toast;
