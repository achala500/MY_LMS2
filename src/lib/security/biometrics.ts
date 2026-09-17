/**
 * StudySync — Biometric Security & App Lock Engine
 * 
 * Supports:
 * - W3C WebAuthn Biometrics (Windows Hello, Touch ID, Face ID, Android Fingerprint)
 * - Cryptographic SHA-256 PIN / Password Protection
 * - Session Auto-Lock & Secure Verification
 */

import { safeStorage, safeSessionStorage } from '../storage/safeStorage';

export interface SecurityConfig {
  biometricsEnabled: boolean;
  pinEnabled: boolean;
  pinHash?: string;
  credentialId?: string;
  autoLockMinutes: number; // 0 = disabled, 5, 15, 30
  lastUnlockedAt?: number;
}

const STORAGE_SECURITY_KEY = 'studysync_security_config';
const SESSION_LOCK_KEY = 'studysync_session_locked';

/**
 * SHA-256 Hash helper using Web Crypto API
 */
export async function hashString(str: string): Promise<string> {
  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    // Basic fallback hash for non-standard environments
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return String(Math.abs(hash));
  }
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Check if platform authenticator (Windows Hello / Touch ID / Face ID) is supported
 */
export async function isBiometricsSupported(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (!window.PublicKeyCredential) return false;
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch (e) {
    return false;
  }
}

/**
 * Get current user security configuration
 */
export function getSecurityConfig(): SecurityConfig {
  return safeStorage.getJson<SecurityConfig>(STORAGE_SECURITY_KEY, {
    biometricsEnabled: false,
    pinEnabled: false,
    autoLockMinutes: 0,
  });
}

/**
 * Save security configuration
 */
export function saveSecurityConfig(config: Partial<SecurityConfig>): void {
  const current = getSecurityConfig();
  const updated = { ...current, ...config };
  safeStorage.setJson(STORAGE_SECURITY_KEY, updated);
}

/**
 * Register Windows Hello / Biometrics credential via WebAuthn
 */
export async function registerBiometrics(userEmail: string): Promise<{ success: boolean; error?: string }> {
  if (typeof window === 'undefined' || !window.PublicKeyCredential) {
    return { success: false, error: 'WebAuthn biometric authentication is not supported by this browser.' };
  }

  try {
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const userId = new Uint8Array(16);
    window.crypto.getRandomValues(userId);

    const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
      challenge,
      rp: {
        name: 'StudySync Sri Lanka A/L',
        id: window.location.hostname === 'localhost' ? 'localhost' : window.location.hostname,
      },
      user: {
        id: userId,
        name: userEmail,
        displayName: userEmail.split('@')[0],
      },
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' }, // ES256
        { alg: -257, type: 'public-key' }, // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'required',
      },
      timeout: 60000,
      attestation: 'none',
    };

    const credential = (await navigator.credentials.create({
      publicKey: publicKeyCredentialCreationOptions,
    })) as PublicKeyCredential;

    if (credential && credential.id) {
      saveSecurityConfig({
        biometricsEnabled: true,
        credentialId: credential.id,
      });
      return { success: true };
    }
    return { success: false, error: 'Failed to create biometric credential.' };
  } catch (err: any) {
    return {
      success: false,
      error: err.name === 'NotAllowedError'
        ? 'Biometric prompt was canceled or timed out.'
        : err.message || 'Biometric enrollment failed.',
    };
  }
}

/**
 * Verify identity using Windows Hello / Touch ID / Face ID
 */
export async function verifyBiometrics(): Promise<{ success: boolean; error?: string }> {
  if (typeof window === 'undefined' || !window.PublicKeyCredential) {
    return { success: false, error: 'Biometrics unavailable.' };
  }

  const config = getSecurityConfig();
  if (!config.biometricsEnabled) {
    return { success: false, error: 'Biometrics not configured.' };
  }

  try {
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const getOptions: PublicKeyCredentialRequestOptions = {
      challenge,
      timeout: 60000,
      userVerification: 'required',
      rpId: window.location.hostname === 'localhost' ? 'localhost' : window.location.hostname,
    };

    const assertion = await navigator.credentials.get({ publicKey: getOptions });
    if (assertion) {
      unlockAppSession();
      return { success: true };
    }
    return { success: false, error: 'Verification failed.' };
  } catch (err: any) {
    return {
      success: false,
      error: err.name === 'NotAllowedError'
        ? 'Biometric scan canceled.'
        : err.message || 'Biometric check failed.',
    };
  }
}

/**
 * Set and hash 4-6 digit Security PIN
 */
export async function setAppPin(pin: string): Promise<boolean> {
  if (!pin || pin.length < 4) return false;
  const hash = await hashString(pin);
  saveSecurityConfig({
    pinEnabled: true,
    pinHash: hash,
  });
  return true;
}

/**
 * Verify entered Security PIN against stored SHA-256 hash
 */
export async function verifyAppPin(enteredPin: string): Promise<boolean> {
  const config = getSecurityConfig();
  if (!config.pinEnabled || !config.pinHash) return false;
  const enteredHash = await hashString(enteredPin);
  const isValid = enteredHash === config.pinHash;
  if (isValid) {
    unlockAppSession();
  }
  return isValid;
}

/**
 * Session Lock Management
 */
export function isAppSessionLocked(): boolean {
  const config = getSecurityConfig();
  if (!config.biometricsEnabled && !config.pinEnabled) return false;
  return safeSessionStorage.getItem(SESSION_LOCK_KEY) === 'locked';
}

export function lockAppSession(): void {
  safeSessionStorage.setItem(SESSION_LOCK_KEY, 'locked');
}

export function unlockAppSession(): void {
  safeSessionStorage.removeItem(SESSION_LOCK_KEY);
  saveSecurityConfig({ lastUnlockedAt: Date.now() });
}
