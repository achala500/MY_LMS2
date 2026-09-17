# Handoff Report — Challenger 1 (QR Engine Boundary Re-verification)

## 1. Observation

1. **Source Code Inspection (`src/lib/qr.ts`)**:
   - Dark Module initialization at lines 396-397:
     ```ts
     matrix[size - 8][8] = true;
     isFunctionPattern[size - 8][8] = true;
     ```
   - Format Information Area 2 loop at lines 411-437:
     ```ts
     for (let i = 0; i < 15; i++) {
       const bit = ((formatBits >>> (14 - i)) & 1) === 1;
       if (i <= 5) {
         matrix[8][i] = bit;
         isFunctionPattern[8][i] = true;
       } else if (i === 6) {
         matrix[8][7] = bit;
         isFunctionPattern[8][7] = true;
       } else if (i === 7) {
         matrix[8][8] = bit;
         isFunctionPattern[8][8] = true;
       } else if (i === 8) {
         matrix[7][8] = bit;
         isFunctionPattern[7][8] = true;
       } else {
         matrix[14 - i][8] = bit;
         isFunctionPattern[14 - i][8] = true;
       }

       if (i < 7) {
         matrix[size - 1 - i][8] = bit;
         isFunctionPattern[size - 1 - i][8] = true;
       } else {
         matrix[8][size - 15 + i] = bit;
         isFunctionPattern[8][size - 15 + i] = true;
       }
     }
     ```
   - Data masking and placement guard at line 458:
     ```ts
     if (!isFunctionPattern[r][c]) {
       const bitVal = bitIdx < dataBits.length ? dataBits[bitIdx] : false;
       bitIdx++;
       const maskVal = (r + c) % 2 === 0;
       matrix[r][c] = bitVal !== maskVal;
     }
     ```

2. **Empirical Test Suite Execution (`tests/qr-iso-boundary.test.js`)**:
   - Command: `node --test tests/qr-iso-boundary.test.js`
   - Output:
     ```
     ▶ QR Engine Index Boundary Fix & ISO/IEC 18004 Dark Module Verification
       ✔ ISO-1: (size - 8, 8) is strictly true (dark) across all 14 QR versions and EC levels L and M (32.9ms)
       ✔ ISO-2: Format bit 7 for M-0 is 0 (false) and does NOT corrupt dark module at (size - 8, 8) (1.1ms)
       ✔ ISO-3: Format Information Area 1 and Area 2 module coordinate mapping matches ISO/IEC 18004 standard exactly (0.6ms)
       ✔ ISO-4: Boundary off-by-one counter-factual proof: if i <= 7 were used, dark module would fail (0.5ms)
       ✔ ISO-5: Full Matrix standard compliance vs official QRCode npm package (25.0ms)
     ✔ QR Engine Index Boundary Fix & ISO/IEC 18004 Dark Module Verification (66.4ms)
     ℹ tests 5 | suites 1 | pass 5 | fail 0
     ```

3. **Full Project Test Suite Results**:
   - `npm test`: 248 passing unit tests across 30 test suites (0 failures).
   - `npm run test:e2e`: 327 passing automated tests across Tiers 1-5 (0 failures).
   - `npx tsc --noEmit`: 0 TypeScript type errors.
   - `npm run build`: Static HTML export produced all 10 application routes in `out/` with exit code 0.

## 2. Logic Chain

1. According to ISO/IEC 18004 (Section 6.8.2 and Section 6.9), for any QR Code version $V \in [1, 40]$ with matrix dimension $N = 4V + 17$, the Dark Module is permanently located at coordinate $(row, col) = (N - 8, 8)$ and MUST always be dark (`true`). It is a fixed function pattern and must never be altered by format information or data masking.
2. The format information comprises 15 bits ($i = 0 \dots 14$). In Area 2, the standard partitions these 15 bits into:
   - Exactly 7 bits ($i = 0 \dots 6$) placed vertically alongside the bottom-left finder pattern at $(N - 1, 8), (N - 2, 8), \dots, (N - 7, 8)$.
   - Exactly 8 bits ($i = 7 \dots 14$) placed horizontally alongside the top-right finder pattern at $(8, N - 8), (8, N - 7), \dots, (8, N - 1)$.
3. Under the prior off-by-one condition `if (i <= 7)`, when $i = 7$, the loop evaluated `matrix[size - 1 - 7][8]` which equals `matrix[size - 8][8]`. Because format bit 7 for mask M-0 (`0x5412`) is `0` (false), this buggy condition overwrote the Dark Module to `false` (white), causing severe ISO/IEC 18004 non-compliance and camera scan failures.
4. With the fix at line 430: `if (i < 7)`, when $i \in [0, 6]$, the row index spans from $size - 1$ down to $size - 7$, terminating immediately before row $size - 8$. When $i = 7$, execution transitions to the `else` branch, writing format bit 7 to `matrix[8][size - 15 + 7] = matrix[8][size - 8]`.
5. Because `isFunctionPattern[size - 8][8]` is set to `true` at line 397 and the format loop never touches row $size - 8$, and the subsequent data masking loop skips all modules where `isFunctionPattern` is true (line 458), coordinate $(size - 8, 8)$ is guaranteed to retain its initial value of `true` across all 14 QR versions, error correction levels, and mask combinations.
6. The empirical verification test suite (`tests/qr-iso-boundary.test.js`) conclusively proved this invariant across all 14 supported QR versions ($V = 1 \dots 14$, dimensions $21 \times 21$ to $73 \times 73$), verified the counter-factual failure if $i \le 7$ had remained, and confirmed parity with the official reference `qrcode` npm package.

## 3. Caveats

No caveats. The boundary condition was analyzed algebraically, checked against the ISO/IEC 18004 standard specification, and empirically validated with automated test harnesses across all supported QR versions (1 through 14) and error correction levels.

## 4. Conclusion

**Verdict: APPROVE**

The QR code engine index boundary fix in `src/lib/qr.ts` (line 430: `if (i < 7)`) is mathematically and empirically correct. It strictly preserves the ISO/IEC 18004 standard dark module at `(size - 8, 8)` as `true` (dark), properly distributes the 15 format bits (7 bits in the bottom-left column and 8 bits in the top-right row), prevents data mask corruption, and ensures 100% standard compliance and camera scannability.

## 5. Verification Method

To independently verify these findings, run the following commands from the project root:

1. **Run QR ISO/IEC 18004 Boundary Empirical Verification Test**:
   ```bash
   node --test tests/qr-iso-boundary.test.js
   ```
2. **Run All Project Unit Tests**:
   ```bash
   npm test
   ```
3. **Run Complete 327-Test E2E Runner**:
   ```bash
   npm run test:e2e
   ```
4. **Verify Type Validity and Production Static Build**:
   ```bash
   npx tsc --noEmit
   npm run build
   ```

**Invalidation Conditions**:
- If `matrix[size - 8][8]` ever evaluates to `false` for any QR version or payload.
- If format bits in Area 2 overwrite row $size - 8$ at column 8.
- If any test in `tests/qr-iso-boundary.test.js`, `npm test`, or `npm run test:e2e` fails.
