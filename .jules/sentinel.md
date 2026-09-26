## 2026-03-30 - Constant-Time Password Verification to Prevent Timing Side-Channel Attacks
**Vulnerability:** Standard string equality operator (`===`) was used in `verifyPassword` to compare SHA-256 password hashes, which terminates early on the first mismatched character and exposes execution timing differences.
**Learning:** String comparisons using `===` leak timing information proportionally to the number of matching prefix characters, allowing timing side-channel analysis to reconstruct hashes byte-by-byte.
**Prevention:** Always use bitwise XOR constant-time string comparison (`timingSafeEqual`) for password hashes, HMAC tokens, nonces, and secret comparisons.
