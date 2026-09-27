# Security Learnings & Sentinel Audit Log

## Hardcoded Secrets Extraction
- Firebase API Key and configuration parameters must be externalized to `process.env.NEXT_PUBLIC_FIREBASE_*` environment variables in Next.js applications rather than embedded in layout scripts (`layout.tsx`) or constants (`constants.ts`).
- Public HTML fallbacks (`index.html`) should be sanitized to ensure hardcoded API key strings do not leak into source control.
