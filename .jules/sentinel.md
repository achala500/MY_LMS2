## 2026-09-25 - Secure Random Salt Generation
**Vulnerability:** `generateSalt()` in `src/lib/security/passwords.ts` fell back to `Math.random()` when `window.crypto` was not present, introducing predictable password salts in non-browser/SSR contexts.
**Learning:** Checking only `window.crypto` missed modern runtime global `globalThis.crypto` and allowed insecure fallback to `Math.random()`.
**Prevention:** Use `globalThis.crypto` for environment-agnostic Web Crypto API access and fail securely by throwing an error if a CSPRNG is unavailable rather than falling back to pseudo-random functions.
