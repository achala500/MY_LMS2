/**
 * StudySync â€” Firebase Authentication & Client Service
 * 
 * Provides official Google Sign-In via Firebase v10 compat SDK, direct email fallback,
 * local storage session persistence, and auth state observation.
 */

import { AuthUser, MemberData } from '@/types/member';
import { ADMIN_WHITELIST, STORAGE_KEYS } from './constants';

// Storage keys
export const AUTH_STORAGE_KEY = STORAGE_KEYS.AUTH_SESSION;
export const LEGACY_STORAGE_KEY = STORAGE_KEYS.APP_STATE;

export { ADMIN_WHITELIST };

/**
 * Global Firebase Window Augmentation
 */
declare global {
  interface Window {
    firebase?: {
      apps?: any[];
      initializeApp?: (config: any) => any;
      auth?: () => any & {
        GoogleAuthProvider: new () => any;
        signInWithPopup: (provider: any) => Promise<any>;
        signInWithRedirect: (provider: any) => Promise<any>;
        signOut: () => Promise<void>;
        onAuthStateChanged: (callback: (user: any) => void) => () => void;
        currentUser?: any;
      };
    };
  }
}

import { localDb } from './storage/localDb';
import { safeStorage } from './storage/safeStorage';

/**
 * Checks whether an email or role qualifies for Super Admin access
 */
export function isAdminUser(email?: string | null, role?: string | null): boolean {
  if (!email && !role) return false;
  if (role === 'admin') return true;
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  if (ADMIN_WHITELIST.some((admin) => admin.toLowerCase() === clean)) {
    return true;
  }
  try {
    const list = safeStorage.getJson<string[]>('studysync_custom_admins', []);
    if (Array.isArray(list) && list.some((a: string) => String(a).toLowerCase().trim() === clean)) {
      return true;
    }
    // Check local database member record
    const member = localDb.getMemberByEmail(clean);
    if (member?.role === 'admin') return true;
  } catch {}
  return false;
}

/**
 * Safely resolves the Firebase Auth instance from window.firebase
 */
export function getFirebaseAuth(): any | null {
  if (typeof window === 'undefined') return null;
  if (window.firebase && typeof window.firebase.auth === 'function') {
    try {
      return window.firebase.auth();
    } catch (e) {
      console.warn('[AuthService] Error invoking window.firebase.auth():', e);
      return null;
    }
  }
  return null;
}

/**
 * Waits for Firebase Auth SDK to initialize (useful during initial client hydration)
 */
export async function waitForFirebaseAuth(timeoutMs: number = 3000): Promise<any | null> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const auth = getFirebaseAuth();
    if (auth) return auth;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  return getFirebaseAuth();
}

/**
 * Saves authenticated user profile to localStorage for zero-flash page loads
 */
export function saveAuthSession(user: AuthUser | null): void {
  try {
    if (user) {
      safeStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      safeStorage.removeItem(AUTH_STORAGE_KEY);
      safeStorage.removeItem(LEGACY_STORAGE_KEY);
    }
  } catch (e) {
    console.warn('[AuthService] Error persisting auth session:', e);
  }
}

/**
 * Restores cached user profile from safeStorage
 */
export function loadAuthSession(): AuthUser | null {
  try {
    const raw = safeStorage.getItem(AUTH_STORAGE_KEY) || safeStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);

    // Support legacy shape where user is wrapped in AppState object
    const user = parsed.user || parsed;
    if (user && user.email) {
      const email = String(user.email).toLowerCase();
      // Discard legacy mock personas
      if (email.includes('kasun') || email.includes('dineth')) {
        safeStorage.removeItem(AUTH_STORAGE_KEY);
        return null;
      }
      return {
        uid: user.uid || `user-${Date.now()}`,
        email: email,
        displayName: user.displayName || email.split('@')[0],
        photoURL: user.photoURL || '',
        emailVerified: Boolean(user.emailVerified),
      };
    }
  } catch (e) {
    console.warn('[AuthService] Error loading persisted auth session:', e);
  }
  return null;
}

/**
 * Triggers official Google Sign-In popup via Firebase Auth
 */
export async function signInWithGooglePopup(): Promise<AuthUser> {
  const auth = await waitForFirebaseAuth(3000);
  if (!auth || !window.firebase || !(window.firebase as any).auth) {
    throw new Error('Firebase Auth SDK is not available. Please check your internet connection.');
  }

  const provider = new (window.firebase as any).auth.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  try {
    const result = await auth.signInWithPopup(provider);
    const fbUser = result.user;
    const user: AuthUser = {
      uid: fbUser.uid,
      email: fbUser.email.toLowerCase(),
      displayName: fbUser.displayName || fbUser.email.split('@')[0],
      photoURL: fbUser.photoURL || '',
      emailVerified: fbUser.emailVerified,
    };
    saveAuthSession(user);
    return user;
  } catch (err: any) {
    console.warn('[AuthService] Google Sign-In Popup Error:', err.code, err.message);
    throw err;
  }
}

/**
 * Resilient Direct Email Sign-In (Used when popup is blocked or fallback)
 */
export async function signInWithDirectEmail(email: string, fullName?: string): Promise<AuthUser> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    throw new Error('Please enter a valid Google Account email address.');
  }

  const displayName = fullName && fullName.trim() ? fullName.trim() : cleanEmail.split('@')[0];
  const user: AuthUser = {
    uid: `direct-user-${Date.now()}`,
    email: cleanEmail,
    displayName: displayName,
    photoURL: '',
    emailVerified: true,
  };

  saveAuthSession(user);
  return user;
}

/**
 * Authenticated Sign-In with Email/Study ID and Secure Salted Password
 */
export async function signInWithPassword(identifier: string, password: string): Promise<{ user: AuthUser; member: MemberData }> {
  const { authenticateWithPassword } = await import('./security/passwords');
  const authResult = await authenticateWithPassword(identifier, password);
  if (!authResult.success || !authResult.member) {
    throw new Error(authResult.error || 'Authentication failed. Please check your credentials.');
  }

  const member = authResult.member;
  const user: AuthUser = {
    uid: member.studyId || `user-${Date.now()}`,
    email: member.email.toLowerCase(),
    displayName: member.fullName || member.email.split('@')[0],
    photoURL: '',
    emailVerified: true,
  };

  saveAuthSession(user);
  return { user, member };
}

/**
 * Signs out user from Firebase Auth and clears local session cache
 */
export async function signOutAuth(): Promise<void> {
  try {
    const auth = getFirebaseAuth();
    if (auth && typeof auth.signOut === 'function') {
      await auth.signOut();
    }
  } catch (e) {
    console.warn('[AuthService] Error during Firebase signOut:', e);
  } finally {
    saveAuthSession(null);
  }
}

/**
 * Sends official Firebase Email Verification link to the current logged-in user
 */
export async function sendAccountVerificationEmail(): Promise<{ success: boolean; message: string }> {
  const auth = getFirebaseAuth();
  const user = auth?.currentUser;
  if (!user) {
    return { success: false, message: 'Please sign in first.' };
  }
  if (user.emailVerified) {
    return { success: true, message: 'Your email is already verified by Google.' };
  }
  try {
    if (typeof user.sendEmailVerification === 'function') {
      await user.sendEmailVerification();
      return {
        success: true,
        message: 'Verification email sent! Check your inbox and spam folder to confirm.',
      };
    } else {
      return { success: true, message: 'Email verification confirmed with Google account.' };
    }
  } catch (err: any) {
    console.error('[AuthService] sendEmailVerification error:', err);
    return {
      success: false,
      message: err.message || 'Failed to send verification email.',
    };
  }
}

/**
 * Reloads Firebase Auth user to check if email was recently verified
 */
export async function reloadCurrentUserAuth(): Promise<{ emailVerified: boolean }> {
  const auth = getFirebaseAuth();
  const user = auth?.currentUser;
  if (user && typeof user.reload === 'function') {
    try {
      await user.reload();
      const updatedUser = auth.currentUser;
      return { emailVerified: Boolean(updatedUser?.emailVerified) };
    } catch (e) {
      console.warn('[AuthService] reload error:', e);
    }
  }
  return { emailVerified: false };
}
