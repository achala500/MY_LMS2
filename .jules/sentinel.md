# Sentinel's Journal - Critical Security Learnings

## 2025-05-18 - Enforcing Cryptographically Secure PRNG Across Environments
**Vulnerability:** Insecure PRNG fallback (`Math.random()`) in cryptographic key/salt/nonce generation functions (`generateSalt`, `generateSecurityNonce`, `generateHighEntropyPassword`).
**Learning:** Legacy checks checking only `window.crypto` failed in SSR / Node environments, leading code to fall back to `Math.random()` which is predictable and non-cryptographic.
**Prevention:** Always use `globalThis.crypto?.getRandomValues` for cross-environment Web Crypto support, and throw an explicit error rather than falling back to `Math.random()` if a CSPRNG is unavailable.
