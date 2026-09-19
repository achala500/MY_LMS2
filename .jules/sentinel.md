## 2026-03-30 - Constant-Time Password Hash Verification
**Vulnerability:** Standard strict equality string comparison (`===`) in password verification introduces side-channel timing leak vulnerabilities where string length or early char mismatches alter execution time.
**Learning:** JavaScript equality comparison short-circuits on length or first mismatched character, allowing attackers to measure microsecond timing variations to reconstruct password hashes.
**Prevention:** Always perform constant-time byte/character XOR checks over the maximum expected string length (`timingSafeEqual`) when comparing password hashes or secret tokens.
