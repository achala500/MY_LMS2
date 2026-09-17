/**
 * StudySync Resilient Safe Storage
 * 
 * Protects against uncaught SecurityErrors and QuotaExceededErrors on:
 * - iOS Safari Private Browsing
 * - Brave Shields / Strict Tracking Prevention
 * - Embedded WebViews / iframe sandboxes
 * 
 * Provides transparent in-memory fallback when localStorage is blocked or unavailable.
 */

class SafeStorageWrapper {
  private memory = new Map<string, string>();
  private storageAvailable: boolean | null = null;
  private storageType: 'local' | 'session';
  private prefix: string;

  constructor(type: 'local' | 'session' = 'local', prefix = '') {
    this.storageType = type;
    this.prefix = prefix;
  }

  private getNativeStorage(): Storage | null {
    if (typeof window === 'undefined') return null;
    try {
      return this.storageType === 'session' ? window.sessionStorage : window.localStorage;
    } catch {
      return null;
    }
  }

  private isAvailable(): boolean {
    if (this.storageAvailable !== null) return this.storageAvailable;
    const storage = this.getNativeStorage();
    if (!storage) {
      this.storageAvailable = false;
      return false;
    }

    try {
      const testKey = `__studysync_probe_${Math.random().toString(36).slice(2)}`;
      storage.setItem(testKey, '1');
      const read = storage.getItem(testKey);
      storage.removeItem(testKey);
      this.storageAvailable = read === '1';
    } catch {
      this.storageAvailable = false;
    }

    return this.storageAvailable;
  }

  public get length(): number {
    if (this.isAvailable()) {
      try {
        const s = this.getNativeStorage();
        if (s) return s.length;
      } catch {
        return this.memory.size;
      }
    }
    return this.memory.size;
  }

  public clear(): void {
    this.memory.clear();
    if (this.isAvailable()) {
      try {
        const s = this.getNativeStorage();
        if (s) s.clear();
      } catch (err) {
        console.warn(`[safeStorage] ${this.storageType}Storage clear failed, cleared memory fallback`, err);
      }
    }
  }

  public getItem(key: string): string | null {
    const fullKey = this.prefix + key;
    if (this.isAvailable()) {
      try {
        const s = this.getNativeStorage();
        if (s) {
          const val = s.getItem(fullKey);
          if (val !== null) return val;
        }
      } catch {
        // Fall back to memory
      }
    }
    return this.memory.has(fullKey) ? this.memory.get(fullKey)! : null;
  }

  public setItem(key: string, value: string): void {
    const fullKey = this.prefix + key;
    this.memory.set(fullKey, value);

    if (this.isAvailable()) {
      try {
        const s = this.getNativeStorage();
        if (s) s.setItem(fullKey, value);
      } catch {
        console.warn(`[safeStorage] Write failed for "${key}" in ${this.storageType}Storage, stored in memory fallback`);
      }
    }
  }

  public removeItem(key: string): void {
    const fullKey = this.prefix + key;
    this.memory.delete(fullKey);

    if (this.isAvailable()) {
      try {
        const s = this.getNativeStorage();
        if (s) s.removeItem(fullKey);
      } catch {
        // Ignore
      }
    }
  }

  public key(index: number): string | null {
    if (this.isAvailable()) {
      try {
        const s = this.getNativeStorage();
        if (s) return s.key(index);
      } catch {
        const keys = Array.from(this.memory.keys());
        return keys[index] ?? null;
      }
    }
    const keys = Array.from(this.memory.keys());
    return keys[index] ?? null;
  }

  public keys(): string[] {
    const keySet = new Set<string>();
    if (this.isAvailable()) {
      try {
        const s = this.getNativeStorage();
        if (s) {
          for (let i = 0; i < s.length; i++) {
            const k = s.key(i);
            if (k !== null) {
              if (this.prefix && k.startsWith(this.prefix)) {
                keySet.add(k.slice(this.prefix.length));
              } else if (!this.prefix) {
                keySet.add(k);
              }
            }
          }
        }
      } catch {
        // Fallback to memory keys
      }
    }
    for (const k of this.memory.keys()) {
      if (this.prefix && k.startsWith(this.prefix)) {
        keySet.add(k.slice(this.prefix.length));
      } else if (!this.prefix) {
        keySet.add(k);
      }
    }
    return Array.from(keySet);
  }

  /**
   * Helper for typed JSON storage with defaults
   */
  public getJson<T>(key: string, defaultValue: T): T {
    try {
      const raw = this.getItem(key);
      if (!raw) return defaultValue;
      return JSON.parse(raw) as T;
    } catch {
      return defaultValue;
    }
  }

  public setJson<T>(key: string, value: T): void {
    try {
      this.setItem(key, JSON.stringify(value));
    } catch {
      console.warn(`[safeStorage] Failed to serialize json for key: ${key}`);
    }
  }
}

export const safeStorage = new SafeStorageWrapper('local');
export const safeSessionStorage = new SafeStorageWrapper('session');
