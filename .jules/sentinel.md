# Sentinel Security Journal

## 2026-03-30 - Non-Cryptographic PRNG Fallback in Password Salt Generation
**Vulnerability:** `generateSalt` in `src/lib/security/passwords.ts` checked `window.crypto.getRandomValues`. When invoked in non-browser or SSR contexts (where `window` is undefined), it silently fell back to `Math.random()`, exposing salt generation to predictable PRNG state recovery attacks.
**Learning:** Checking `window.crypto` is insufficient for SSR/Node/isomorphic code. `globalThis.crypto.getRandomValues` or Node's `crypto` module must be checked first before any fallback.
**Prevention:** Use `globalThis.crypto?.getRandomValues` for cross-environment Web Crypto API availability, followed by a safe `require('crypto')` fallback in Node.js environments.
