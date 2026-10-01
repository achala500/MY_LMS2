## 2025-05-20 - Cryptographic CSPRNG Nonce and Password Enforcement
**Vulnerability:** Weak `Math.random()` fallbacks in `generateSecurityNonce` and `generateHighEntropyPassword` could allow predictable nonces or password generation in environments where default global `crypto` bindings differ.
**Learning:** In cross-environment JS code, checking `globalThis.crypto` ensures access to Node.js/Web/Worker CSPRNGs (`crypto.getRandomValues`) without falling back to insecure PRNGs (`Math.random`).
**Prevention:** Always require cryptographically secure random number generation (`globalThis.crypto.getRandomValues`) for nonces, tokens, and password generation, throwing an error if CSPRNG is unavailable.
