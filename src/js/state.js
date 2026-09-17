/**
 * StudySync — Reactive AppState Store with LocalStorage Persistence
 * Manages global application state with pub/sub architecture.
 */

const STORAGE_KEY = 'studysync_app_state_v2';

const INITIAL_STATE = {
  user: null,         // Authenticated user object { uid, email, displayName, photoURL }
  member: null,       // Registered member profile { studyId, fullName, email, gender, telegram, school, stream, optionalSubject, registrationDate, status }
  todayLog: null,     // Today's log entry if submitted { exists: boolean, data: Object|null }
  history: [],        // Array of past daily logs for current student
  adminData: null,    // Admin data payload { members: [], logs: [], analytics: {}, leaderboard: [] }
  route: 'landing',   // Active route: 'landing' | 'register' | 'dashboard' | 'admin' | 'verify'
  routeParams: {},    // Dynamic route parameters, e.g. { id: 'SG-BIO-0001' }
  isMockMode: false,  // True when running in mock auth / local preview mode
  isLoading: false,   // Global loading indicator state
  theme: 'dark'       // UI Theme ('dark')
};

class StateStore {
  constructor() {
    this._state = { ...INITIAL_STATE };
    this._listeners = new Set();
    this._loadPersistedState();
  }

  /**
   * Get current state snapshot (shallow copy)
   * @returns {Object}
   */
  get() {
    return { ...this._state };
  }

  /**
   * Get direct state property
   * @param {string} key 
   * @returns {*}
   */
  getProp(key) {
    return this._state[key];
  }

  /**
   * Update state with partial patch and notify subscribers
   * @param {Object} patch 
   */
  set(patch) {
    if (!patch || typeof patch !== 'object') return;
    
    const prevState = { ...this._state };
    this._state = { ...this._state, ...patch };

    this._persistState();
    this._notify(this._state, prevState);
  }

  /**
   * Subscribe a listener function to state changes
   * @param {Function} listener Callback receiving (currentState, prevState)
   * @returns {Function} Unsubscribe function
   */
  subscribe(listener) {
    if (typeof listener !== 'function') return () => {};
    this._listeners.add(listener);
    
    // Immediately call listener with current state
    try {
      listener(this._state, this._state);
    } catch (err) {
      console.error('[AppState] Error in immediate subscriber call:', err);
    }

    return () => {
      this._listeners.delete(listener);
    };
  }

  /**
   * Reset store to initial state
   */
  reset() {
    this.set({
      user: null,
      member: null,
      todayLog: null,
      history: [],
      adminData: null,
      route: 'landing',
      routeParams: {},
      isMockMode: false,
      isLoading: false
    });
    this._clearPersistedState();
  }

  /**
   * Notify all registered subscribers
   */
  _notify(currentState, prevState) {
    for (const listener of this._listeners) {
      try {
        listener(currentState, prevState);
      } catch (err) {
        console.error('[AppState] Error executing subscriber callback:', err);
      }
    }
  }

  /**
   * Persist state subset to LocalStorage
   */
  _persistState() {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      const persisted = {
        user: this._state.user,
        member: this._state.member,
        isMockMode: this._state.isMockMode
      };
      const jsonStr = JSON.stringify(persisted);
      localStorage.setItem(STORAGE_KEY, jsonStr);
      localStorage.setItem('studysync_app_state_v1', jsonStr);
    } catch (e) {
      console.warn('[AppState] Failed to save state to localStorage:', e);
    }

  }

  /**
   * Restore state subset from LocalStorage
   */
  _loadPersistedState() {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      // Purge legacy v1 mock storage if present
      localStorage.removeItem('studysync_app_state_v1');

      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          // If the cached user is the old mock persona, discard it
          const email = parsed.user?.email || '';
          if (email.includes('kasun') || email.includes('dineth') || parsed.isMockMode) {
            localStorage.removeItem(STORAGE_KEY);
            return;
          }
          if (parsed.user) this._state.user = parsed.user;
          if (parsed.member) this._state.member = parsed.member;
        }
      }
    } catch (e) {
      console.warn('[AppState] Failed to load persisted state:', e);
    }
  }

  /**
   * Clear persisted state from LocalStorage
   */
  _clearPersistedState() {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('studysync_app_state_v1');
    } catch (e) {
      console.warn('[AppState] Failed to clear localStorage:', e);
    }
  }
}

// Export singleton instance
export const AppState = new StateStore();
export default AppState;
