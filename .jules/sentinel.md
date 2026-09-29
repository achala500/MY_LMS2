
## 2026-08-27 - Missing Security Binary Scanning in Vault Storage Uploads
**Vulnerability:** `uploadVaultFile` in `src/lib/storage/vaultDb.ts` accepted raw file uploads without binary payload security inspection, allowing potential storage of malicious PE/ELF executables or script injection payloads in IndexedDB.
**Learning:** Storage handlers operating offline-first via IndexedDB should validate binary payloads using `scanBinaryPayload` prior to processing or local persistence.
**Prevention:** Always inspect raw file byte arrays via `scanBinaryPayload` before converting and storing files in client storage engines.
