## 2026-03-31 - Web Crypto API Runtime Fallback Vulnerability in Non-Browser Contexts
**Vulnerability:** `hashString`, `generateSalt`, and `generateHighEntropyPassword` relied on `typeof window !== 'undefined'` checks for Web Crypto API access (`window.crypto.subtle` / `window.crypto.getRandomValues`). In server-side, Node.js, Next.js SSR, and worker environments where `window` is undefined, the functions silently fell back to non-cryptographic 32-bit linear hashes (`((hash << 5) - hash) + char`) and `Math.random()`.

**Learning:** Checking `typeof window !== 'undefined'` to feature-detect `crypto` ignores modern JavaScript runtimes (Node.js 19+, Deno, Bun, Cloudflare Workers, Edge Runtime) where `globalThis.crypto` is globally available. Server-side password hashing and salt generation were operating with weak non-cryptographic primitives as a result.

**Prevention:** Always reference `globalThis.crypto` or `typeof globalThis !== 'undefined' ? globalThis.crypto : undefined` when checking for Web Crypto API capabilities across multi-runtime isomorphic applications.
