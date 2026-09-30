## 2026-05-18 - Base64 Decoding Chunk Boundary & Buffer Allocation Hardening
**Vulnerability:** Unaligned Base64 truncation prior to `atob()` decoding caused `DOMException: InvalidCharacterError` exceptions on large uploads, and `new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength)` exposed shared Node.js 8KB Buffer pool offsets.
**Learning:** `atob()` requires input string lengths to be strict multiples of 4. Node.js `Buffer.from` creates views over an internal shared buffer pool when length < 4096.
**Prevention:** Align Base64 substring limits to 4-character multiples (`Math.floor(limit / 4) * 4`) and allocate Uint8Array directly from Buffer using `new Uint8Array(buf)`.
