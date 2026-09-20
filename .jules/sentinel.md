## 2025-05-18 - Ensure `globalThis.crypto` for Server/SSR Web Crypto Utilities
**Vulnerability:** Checking `typeof window !== 'undefined'` for Web Crypto API access (`crypto.getRandomValues` and `crypto.subtle`) caused SSR, Node.js server-side execution, and Web Worker contexts to fall back to `Math.random()` for salts/nonces and a weak 32-bit polynomial hash for `hashString`.
**Learning:** Modern JavaScript runtimes (Node 19+, Edge, Cloudflare Workers, Web Workers) expose standard Web Crypto API on `globalThis.crypto` even when `window` is undefined.
**Prevention:** Always check `globalThis.crypto` (or `globalThis.crypto?.subtle`) when resolving Web Crypto API capability across environment boundaries.
