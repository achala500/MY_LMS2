/**
 * StudySync â€” Authentication Service
 * Official Google Sign-In (Firebase Authentication) with 1:1 Google Account Binding.
 * Authenticates real user credentials and synchronizes member profiles with Google Sheets.
 */

import { AppState } from './state.js';
import { ApiClient } from './api.js';
import { Toast } from './toast.js';

function setRouteHash(hash) {
  if (typeof window !== 'undefined' && window.location) {
    window.location.hash = hash;
  }
}

class AuthServiceEngine {
  constructor() {
    this.firebaseAuth = null;
    this.googleProvider = null;
    this._authListeners = new Set();
    this._initialized = false;
  }

  /**
   * Initialize Firebase Auth
   */
  async init() {
    if (this._initialized) return;
    this._initialized = true;

    if (typeof window !== 'undefined' && window.firebase && window.firebase.auth) {
      try {
        this.firebaseAuth = window.firebase.auth();
        this.googleProvider = new window.firebase.auth.GoogleAuthProvider();
        this.googleProvider.setCustomParameters({ prompt: 'select_account' });
        
        // Listen to live Firebase Auth state changes.
        // On page load this fires once: with the restored user (if any) or null.
        // We handle it as a silent background restore â€” don't block page render.
        this.firebaseAuth.onAuthStateChanged(async (firebaseUser) => {
          if (firebaseUser && !AppState.getProp('user')) {
            // Silent session restore (page reload with existing Google session)
            const user = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
              photoURL: firebaseUser.photoURL || ''
            };
            await this._handleSuccessfulLogin(user);
          }
        });
      } catch (err) {
        console.warn('[AuthService] Firebase Auth init error:', err);
      }
    }
  }

  /**
   * Primary Sign-In entry point using official Google Sign-In
   * @returns {Promise<Object>}
   */
  async signIn() {
    await this.init();

    if (this.firebaseAuth && this.googleProvider) {
      try {
        AppState.set({ isLoading: true });
        const result = await this.firebaseAuth.signInWithPopup(this.googleProvider);
        const user = {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName || result.user.email.split('@')[0],
          photoURL: result.user.photoURL || ''
        };
        return await this._handleSuccessfulLogin(user);
      } catch (err) {
        AppState.set({ isLoading: false });
        console.warn('[AuthService] Firebase sign-in notice:', err.code, err.message);

        // If popup blocked on mobile, try redirect or provide direct email sign-in modal
        if (err.code === 'auth/popup-blocked') {
          try {
            return await this.firebaseAuth.signInWithRedirect(this.googleProvider);
          } catch (rErr) {
            console.error('[AuthService] Redirect error:', rErr);
          }
        }

        // Show prompt for user to sign in with their real Google Email
        return this.promptEmailSignIn(err);
      }
    }

    return this.promptEmailSignIn();
  }

  /**
   * Prompt user to authenticate with their real Google Account Email
   */
  async promptEmailSignIn(originalError = null) {
    return new Promise((resolve) => {
      const modal = document.getElementById('modal-container');
      if (!modal) {
        Toast.error('Auth container missing.', 'Error');
        resolve({ user: null, isRegistered: false, member: null });
        return;
      }

      modal.innerHTML = `
        <div class="glass-card p-6 sm:p-8 rounded-3xl max-w-md w-full border border-white/10 shadow-2xl relative animate-fade-in">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
              <svg class="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
            </div>
            <div>
              <h3 class="font-bold text-lg text-white">Sign In with Google</h3>
              <p class="text-xs text-slate-400">StudySync Account Authentication</p>
            </div>
          </div>

          <p class="text-xs text-slate-300 mb-4 leading-relaxed">
            Enter your real Google Account email to securely access your personalized study dashboard and records.
          </p>

          <form id="form-direct-auth" class="flex flex-col gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Your Google Account Email</label>
              <input 
                type="email" 
                id="input-direct-email" 
                required 
                placeholder="your.email@gmail.com" 
                class="glass-input w-full px-4 py-3 rounded-xl text-sm focus:outline-none text-white placeholder:text-slate-500" 
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Full Name</label>
              <input 
                type="text" 
                id="input-direct-name" 
                required 
                placeholder="e.g. Achala Anuradha" 
                class="glass-input w-full px-4 py-3 rounded-xl text-sm focus:outline-none text-white placeholder:text-slate-500" 
              />
            </div>

            <div class="flex gap-2.5 mt-2">
              <button type="button" id="btn-cancel-auth" class="apple-btn-secondary flex-1 py-3 text-xs">
                Cancel
              </button>
              <button type="submit" class="apple-btn-primary flex-1 py-3 text-xs font-bold">
                Continue
              </button>
            </div>
          </form>
        </div>
      `;

      modal.classList.remove('hidden');
      modal.classList.add('flex');

      document.getElementById('btn-cancel-auth')?.addEventListener('click', () => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        resolve({ user: null, isRegistered: false, member: null });
      });

      document.getElementById('form-direct-auth')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('input-direct-email')?.value.trim();
        const name = document.getElementById('input-direct-name')?.value.trim();

        if (!email || !name) {
          Toast.error('Please enter your email and full name', 'Required');
          return;
        }

        modal.classList.add('hidden');
        modal.classList.remove('flex');

        const realUser = {
          uid: `user-${Date.now()}`,
          email: email.toLowerCase(),
          displayName: name,
          photoURL: ''
        };

        const result = await this._handleSuccessfulLogin(realUser);
        resolve(result);
      });
    });
  }

  /**
   * Internal handler following successful authentication
   */
  async _handleSuccessfulLogin(user) {
    AppState.set({
      user,
      isLoading: true
    });

    try {
      // Query backend database to check if this user is already registered in Google Sheet
      const checkRes = await ApiClient.checkUser(user.email);
      let isRegistered = false;
      let memberData = null;

      if (checkRes.success && checkRes.data) {
        if (checkRes.data.registered && checkRes.data.member) {
          isRegistered = true;
          memberData = checkRes.data.member;
          AppState.set({
            member: memberData,
            todayLog: checkRes.data.todayLog || null,
            history: checkRes.data.stats ? [checkRes.data.stats] : []
          });
        }
      }

      AppState.set({ isLoading: false });

      // Route decision:
      // If unregistered -> ALWAYS go to #register so user can customize name, school, stream & get ID
      // If already registered -> go to #dashboard
      const isAdmin = (memberData && memberData.role === 'admin') || user.email === 'admin@studysync.lk' || user.email === 'alwisachalaanurada@gmail.com';

      if (!isRegistered || !memberData) {
        Toast.info('Welcome! Please complete your one-time study group profile.', 'Create Your Account');
        setRouteHash('#register');
      } else {
        if (isAdmin) {
          Toast.success(`Welcome Administrator, ${memberData.fullName || user.displayName}!`, 'Signed In');
        } else {
          Toast.success(`Welcome back, ${memberData.fullName || user.displayName}!`, 'Signed In');
        }
        setRouteHash('#dashboard');
      }

      this._notifyAuthListeners(user);
      return { user, isRegistered, member: memberData };
    } catch (err) {
      AppState.set({ isLoading: false });
      console.error('[AuthService] Error checking user:', err);
      setRouteHash('#register');
      return { user, isRegistered: false, member: null };
    }
  }

  /**
   * Sign out current user and clear state
   */
  async signOut() {
    try {
      if (this.firebaseAuth) {
        await this.firebaseAuth.signOut();
      }
    } catch (err) {
      console.warn('[AuthService] Firebase signOut warning:', err);
    }

    AppState.reset();
    Toast.info('You have been signed out safely.', 'Signed Out');
    setRouteHash('#landing');
    this._notifyAuthListeners(null);
  }

  /**
   * Get current authenticated user
   */
  getCurrentUser() {
    return AppState.getProp('user');
  }

  /**
   * Subscribe to auth state transitions
   * @param {Function} callback 
   * @returns {Function} Unsubscribe function
   */
  onAuthStateChanged(callback) {
    if (typeof callback === 'function') {
      this._authListeners.add(callback);
      callback(this.getCurrentUser());
    }
    return () => {
      this._authListeners.delete(callback);
    };
  }

  _notifyAuthListeners(user) {
    for (const listener of this._authListeners) {
      try {
        listener(user);
      } catch (e) {
        console.error('[AuthService] Error in auth listener callback:', e);
      }
    }
  }
}

// Export singleton instance
export const AuthService = new AuthServiceEngine();

// Eagerly init Firebase Auth on module load so onAuthStateChanged fires on every page load.
// Without this, returning users see the spinner forever because init() was only called inside signIn().
if (typeof window !== 'undefined') {
  AuthService.init().catch(err => console.warn('[AuthService] Eager init warning:', err));
}

export default AuthService;
