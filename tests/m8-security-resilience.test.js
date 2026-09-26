/**
 * ============================================================================
 * StudySync — Milestone M8: Security Hardening & Concurrency Resilience Tests
 * ============================================================================
 * 
 * Verifies:
 * 1. 12-Byte Structural Magic Byte Header Verification (JPEG, PNG, WebP, GIF)
 * 2. Masquerade & Polyglot Rejection (WAV/AVI RIFF containers, executable blacklists)
 * 3. File Boundary Constraints (min 100B, max 10MB)
 * 4. Deep Polyglot Scanner (Base64 XSS, PHP tags, embedded PE signatures)
 * 5. Synchronized Sliding-Window Multi-Tab Rate Limiter
 * 6. Cryptographic Idempotency Envelope & Nonce Generator
 * 7. Timestamp Drift Window (±300s enforcement, future timestamp rejection)
 * 8. Context-Aware Anti-XSS, URL Allowlisting, and CSV Formula Escaping (CWE-1236)
 * 9. Live Mock Server Security Parity & Formula Neutralization
 */

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'http';
import { app } from '../server/mock-server.js';
import {
  inspectMagicBytes,
  validateBinaryBuffer,
  scanBinaryPayload,
  scanBase64Payload,
  SynchronizedSlidingRateLimiter,
  generateSecurityNonce,
  generateIdempotencyKey,
  createIdempotencyEnvelope,
  verifyTimestampDrift,
  escapeHtml,
  sanitizeInput,
  sanitizeUrl,
  sanitizeCsvFormula,
  formatCsvCell,
  generateCsvString
} from './test-harness.js';
import { timingSafeEqual, verifyPassword, hashPassword } from '../src/lib/security/passwords.ts';

describe('Milestone M8: Security Hardening, Binary Validation & Concurrency Resilience', () => {

  // --------------------------------------------------------------------------
  // 1. 12-Byte Structural Magic Byte Header Verification
  // --------------------------------------------------------------------------
  describe('1. 12-Byte Structural Magic Byte Header Verification', () => {
    test('Valid JPEG image passes 12-byte header verification', () => {
      // JPEG SOI: FF D8 FF E0 + JFIF header
      const jpegBuffer = Buffer.alloc(256);
      jpegBuffer[0] = 0xFF;
      jpegBuffer[1] = 0xD8;
      jpegBuffer[2] = 0xFF;
      jpegBuffer[3] = 0xE0;
      jpegBuffer.write('JFIF', 6, 'ascii');

      const res = validateBinaryBuffer(jpegBuffer, 'image/jpeg');
      assert.strictEqual(res.valid, true);
      assert.strictEqual(res.detectedFormat, 'image/jpeg');
      assert.strictEqual(res.error, null);
    });

    test('Valid PNG image passes 12-byte header and IHDR chunk verification', () => {
      // PNG Signature: 89 50 4E 47 0D 0A 1A 0A + IHDR at offset 12..15
      const pngBuffer = Buffer.alloc(256);
      pngBuffer[0] = 0x89;
      pngBuffer[1] = 0x50;
      pngBuffer[2] = 0x4E;
      pngBuffer[3] = 0x47;
      pngBuffer[4] = 0x0D;
      pngBuffer[5] = 0x0A;
      pngBuffer[6] = 0x1A;
      pngBuffer[7] = 0x0A;
      pngBuffer.write('IHDR', 12, 'ascii');

      const res = validateBinaryBuffer(pngBuffer, 'image/png');
      assert.strictEqual(res.valid, true);
      assert.strictEqual(res.detectedFormat, 'image/png');
      assert.strictEqual(res.error, null);
    });

    test('Valid WebP image passes RIFF + WEBP + VP8 chunk validation', () => {
      // RIFF at 0..3, size at 4..7, WEBP at 8..11, VP8 at 12..15
      const webpBuffer = Buffer.alloc(256);
      webpBuffer.write('RIFF', 0, 'ascii');
      webpBuffer.writeUInt32LE(248, 4);
      webpBuffer.write('WEBP', 8, 'ascii');
      webpBuffer.write('VP8 ', 12, 'ascii');

      const res = validateBinaryBuffer(webpBuffer, 'image/webp');
      assert.strictEqual(res.valid, true);
      assert.strictEqual(res.detectedFormat, 'image/webp');
    });

    test('Valid GIF87a and GIF89a images pass validation', () => {
      const gif89Buffer = Buffer.alloc(150);
      gif89Buffer.write('GIF89a', 0, 'ascii');
      const res1 = validateBinaryBuffer(gif89Buffer, 'image/gif');
      assert.strictEqual(res1.valid, true);
      assert.strictEqual(res1.detectedFormat, 'image/gif');

      const gif87Buffer = Buffer.alloc(150);
      gif87Buffer.write('GIF87a', 0, 'ascii');
      const res2 = validateBinaryBuffer(gif87Buffer, 'image/gif');
      assert.strictEqual(res2.valid, true);
      assert.strictEqual(res2.detectedFormat, 'image/gif');
    });
  });

  // --------------------------------------------------------------------------
  // 2. Disguised Container & Masquerade Rejection
  // --------------------------------------------------------------------------
  describe('2. Masquerade & RIFF Container Defense', () => {
    test('Audio WAV disguised in RIFF container is explicitly rejected with SECURITY_MIME_MISMATCH', () => {
      // RIFF header with WAVE subtype at offset 8..11
      const wavBuffer = Buffer.alloc(256);
      wavBuffer.write('RIFF', 0, 'ascii');
      wavBuffer.writeUInt32LE(248, 4);
      wavBuffer.write('WAVE', 8, 'ascii');

      const res = validateBinaryBuffer(wavBuffer, 'image/webp');
      assert.strictEqual(res.valid, false);
      assert.strictEqual(res.code, 'SECURITY_MIME_MISMATCH');
      assert.match(res.error || '', /WAV/i);
    });

    test('Video AVI disguised in RIFF container is explicitly rejected with SECURITY_MIME_MISMATCH', () => {
      // RIFF header with AVI subtype at offset 8..11
      const aviBuffer = Buffer.alloc(256);
      aviBuffer.write('RIFF', 0, 'ascii');
      aviBuffer.writeUInt32LE(248, 4);
      aviBuffer.write('AVI ', 8, 'ascii');

      const res = validateBinaryBuffer(aviBuffer, 'image/webp');
      assert.strictEqual(res.valid, false);
      assert.strictEqual(res.code, 'SECURITY_MIME_MISMATCH');
      assert.match(res.error || '', /AVI/i);
    });

    test('MIME type mismatch (PNG disguised as JPEG) is rejected', () => {
      const pngBuffer = Buffer.alloc(256);
      pngBuffer[0] = 0x89;
      pngBuffer[1] = 0x50;
      pngBuffer[2] = 0x4E;
      pngBuffer[3] = 0x47;
      pngBuffer[4] = 0x0D;
      pngBuffer[5] = 0x0A;
      pngBuffer[6] = 0x1A;
      pngBuffer[7] = 0x0A;
      pngBuffer.write('IHDR', 12, 'ascii');

      const res = validateBinaryBuffer(pngBuffer, 'image/jpeg');
      assert.strictEqual(res.valid, false);
      assert.strictEqual(res.code, 'SECURITY_MIME_MISMATCH');
    });

    test('Plain text file masquerading as image is rejected with SECURITY_INVALID_HEADER', () => {
      const txtBuffer = Buffer.from('Hello world this is not an image file at all but a plain text document that is well over 100 bytes long for testing.', 'utf-8');
      assert.ok(txtBuffer.length >= 100);
      const res = validateBinaryBuffer(txtBuffer, 'image/jpeg');
      assert.strictEqual(res.valid, false);
      assert.strictEqual(res.code, 'SECURITY_INVALID_HEADER');
    });
  });

  // --------------------------------------------------------------------------
  // 3. Blacklist Signature Detection (PE, ELF, Mach-O, Java, ZIP, Shebang)
  // --------------------------------------------------------------------------
  describe('3. Blacklist Signature Detection', () => {
    test('Windows PE Executable (MZ) is rejected immediately with MALWARE_PE_EXECUTABLE', () => {
      const peBuffer = Buffer.alloc(256);
      peBuffer[0] = 0x4D; // M
      peBuffer[1] = 0x5A; // Z
      const res = validateBinaryBuffer(peBuffer, 'image/jpeg');
      assert.strictEqual(res.valid, false);
      assert.strictEqual(res.code, 'MALWARE_PE_EXECUTABLE');
    });

    test('Linux ELF Binary (\\x7fELF) is rejected immediately with MALWARE_LINUX_ELF', () => {
      const elfBuffer = Buffer.alloc(256);
      elfBuffer[0] = 0x7F;
      elfBuffer[1] = 0x45; // E
      elfBuffer[2] = 0x4C; // L
      elfBuffer[3] = 0x46; // F
      const res = validateBinaryBuffer(elfBuffer, 'image/png');
      assert.strictEqual(res.valid, false);
      assert.strictEqual(res.code, 'MALWARE_LINUX_ELF');
    });

    test('Java Class Bytecode (CA FE BA BE) is rejected immediately with MALWARE_JAVA_BYTECODE', () => {
      const javaBuffer = Buffer.alloc(256);
      javaBuffer[0] = 0xCA;
      javaBuffer[1] = 0xFE;
      javaBuffer[2] = 0xBA;
      javaBuffer[3] = 0xBE;
      const res = validateBinaryBuffer(javaBuffer, 'image/png');
      assert.strictEqual(res.valid, false);
      assert.strictEqual(res.code, 'MALWARE_JAVA_BYTECODE');
    });

    test('ZIP / Android APK archive (PK) is rejected immediately with MALWARE_ARCHIVE_ZIP', () => {
      const zipBuffer = Buffer.alloc(256);
      zipBuffer[0] = 0x50; // P
      zipBuffer[1] = 0x4B; // K
      zipBuffer[2] = 0x03;
      zipBuffer[3] = 0x04;
      const res = validateBinaryBuffer(zipBuffer, 'image/jpeg');
      assert.strictEqual(res.valid, false);
      assert.strictEqual(res.code, 'MALWARE_ARCHIVE_ZIP');
    });

    test('7-Zip Archive is rejected immediately with MALWARE_ARCHIVE_7Z', () => {
      const sevenZBuffer = Buffer.alloc(256);
      sevenZBuffer[0] = 0x37;
      sevenZBuffer[1] = 0x7A;
      sevenZBuffer[2] = 0xBC;
      sevenZBuffer[3] = 0xAF;
      sevenZBuffer[4] = 0x27;
      sevenZBuffer[5] = 0x1C;
      const res = validateBinaryBuffer(sevenZBuffer, 'image/png');
      assert.strictEqual(res.valid, false);
      assert.strictEqual(res.code, 'MALWARE_ARCHIVE_7Z');
    });

    test('Unix Shebang script (#!) is rejected immediately with MALWARE_SHEBANG_SCRIPT', () => {
      const shebangBuffer = Buffer.alloc(256);
      shebangBuffer[0] = 0x23; // #
      shebangBuffer[1] = 0x21; // !
      shebangBuffer.write('/bin/bash', 2, 'ascii');
      const res = validateBinaryBuffer(shebangBuffer, 'image/jpeg');
      assert.strictEqual(res.valid, false);
      assert.strictEqual(res.code, 'MALWARE_SHEBANG_SCRIPT');
    });
  });

  // --------------------------------------------------------------------------
  // 4. File Size Boundary Constraints
  // --------------------------------------------------------------------------
  describe('4. File Size Boundary Constraints', () => {
    test('File underflow (<100 bytes) is rejected with SECURITY_FILE_TOO_SMALL', () => {
      const tinyBuffer = Buffer.alloc(64);
      tinyBuffer[0] = 0xFF;
      tinyBuffer[1] = 0xD8;
      tinyBuffer[2] = 0xFF;
      tinyBuffer[3] = 0xE0;
      const res = validateBinaryBuffer(tinyBuffer, 'image/jpeg');
      assert.strictEqual(res.valid, false);
      assert.strictEqual(res.code, 'SECURITY_FILE_TOO_SMALL');
    });

    test('File overflow (>10MB) is rejected with SECURITY_FILE_TOO_LARGE', () => {
      const hugeBuffer = { byteLength: 10 * 1024 * 1024 + 1024 };
      const res = validateBinaryBuffer(hugeBuffer, 'image/jpeg');
      assert.strictEqual(res.valid, false);
      assert.strictEqual(res.code, 'SECURITY_FILE_TOO_LARGE');
    });
  });

  // --------------------------------------------------------------------------
  // 5. Deep Polyglot & Script Injection Scanner
  // --------------------------------------------------------------------------
  describe('5. Deep Polyglot & Script Injection Scanner', () => {
    test('Detects and blocks Base64 payload containing <script> tag', () => {
      const payload = Buffer.from('GIF89a...<script>alert(document.cookie)</script>').toString('base64');
      const res = scanBase64Payload(payload);
      assert.strictEqual(res.safe, false);
      assert.strictEqual(res.code, 'MALWARE_SCRIPT_EMBEDDED');
      assert.match(res.threat || '', /Script injection/i);
    });

    test('Detects and blocks Base64 payload containing PHP executable tags', () => {
      const payload = Buffer.from('<?php eval($_POST["cmd"]); ?>').toString('base64');
      const res = scanBase64Payload(payload);
      assert.strictEqual(res.safe, false);
      assert.strictEqual(res.code, 'MALWARE_SCRIPT_EMBEDDED');
    });

    test('Detects and blocks Base64 payload with embedded PE MZ header', () => {
      const pePayload = 'TVqQAAMAAAAEAAAA//8AALgAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAA4fug4AtAnNIbgBTM0hVGhpcyBwcm9ncmFtIGNhbm5vdCBiZSBydW4gaW4gRE9TIG1vZGU=';
      const res = scanBase64Payload(pePayload);
      assert.strictEqual(res.safe, false);
      assert.strictEqual(res.code, 'MALWARE_PE_EXECUTABLE');
    });

    test('Legitimate clean Base64 data passes scan safely', () => {
      const cleanData = Buffer.from('Clean binary JPEG compressed data without any scripting tags or malware signatures.').toString('base64');
      const res = scanBase64Payload(cleanData);
      assert.strictEqual(res.safe, true);
      assert.strictEqual(res.threat, null);
    });
  });

  // --------------------------------------------------------------------------
  // 6. Multi-Tab Synchronized Sliding Rate Limiter
  // --------------------------------------------------------------------------
  describe('6. Multi-Tab Synchronized Sliding Rate Limiter', () => {
    test('Allows requests within configured sliding window burst limit', () => {
      const limiter = new SynchronizedSlidingRateLimiter({
        limit: 5,
        windowMs: 60000,
        storageKey: 'test_limiter_1'
      });

      for (let i = 0; i < 5; i++) {
        assert.strictEqual(limiter.allow(), true, `Request ${i + 1} should be permitted`);
      }
      assert.strictEqual(limiter.getRemaining(), 0);
    });

    test('Blocks requests exceeding the sliding window burst limit', () => {
      const limiter = new SynchronizedSlidingRateLimiter({
        limit: 3,
        windowMs: 60000,
        storageKey: 'test_limiter_2'
      });

      assert.strictEqual(limiter.allow(), true);
      assert.strictEqual(limiter.allow(), true);
      assert.strictEqual(limiter.allow(), true);
      assert.strictEqual(limiter.allow(), false, '4th request must be rejected');
      assert.strictEqual(limiter.allow(), false, '5th request must be rejected');
    });

    test('Reports accurate remaining count and reset time', () => {
      const limiter = new SynchronizedSlidingRateLimiter({
        limit: 10,
        windowMs: 60000,
        storageKey: 'test_limiter_3'
      });

      limiter.allow();
      limiter.allow();
      assert.strictEqual(limiter.getRemaining(), 8);
      assert.strictEqual(typeof limiter.getResetTimeMs(), 'number');
      assert.ok(limiter.getResetTimeMs() > 0);
    });
  });

  // --------------------------------------------------------------------------
  // 7. Cryptographic Idempotency Envelope & Timestamp Drift Window
  // --------------------------------------------------------------------------
  describe('7. Idempotency Envelope & Timestamp Drift Validation', () => {
    test('generateSecurityNonce generates 128-bit (32 hex char) random cryptographically secure string', () => {
      const nonce1 = generateSecurityNonce();
      const nonce2 = generateSecurityNonce();
      assert.strictEqual(typeof nonce1, 'string');
      assert.strictEqual(nonce1.length, 32);
      assert.notStrictEqual(nonce1, nonce2);
      assert.match(nonce1, /^[0-9a-f]{32}$/);
    });

    test('generateIdempotencyKey generates deterministic hash for identical payload and nonce', () => {
      const payload = { action: 'submitDailyLog', studyId: 'SG-BIO-0001', dateOfStudy: '2026-08-27' };
      const nonce = 'a1b2c3d4e5f60718293a4b5c6d7e8f90';
      const key1 = generateIdempotencyKey(payload, nonce);
      const key2 = generateIdempotencyKey(payload, nonce);
      assert.strictEqual(key1, key2);

      // Different payload yields different key
      const key3 = generateIdempotencyKey({ ...payload, dateOfStudy: '2026-08-28' }, nonce);
      assert.notStrictEqual(key1, key3);
    });

    test('createIdempotencyEnvelope wraps payload with security metadata', () => {
      const raw = { studyId: 'SG-MATH-0001', totalHours: 6.5 };
      const envelope = createIdempotencyEnvelope(raw);
      assert.strictEqual(envelope.studyId, 'SG-MATH-0001');
      assert.strictEqual(envelope.totalHours, 6.5);
      assert.ok(envelope.security);
      assert.strictEqual(envelope.security.nonce.length, 32);
      assert.strictEqual(typeof envelope.security.idempotencyKey, 'string');
      assert.strictEqual(typeof envelope.security.requestTimestamp, 'string');
    });

    test('verifyTimestampDrift validates timestamps within ±300s window', () => {
      const now = new Date().toISOString();
      const valid = verifyTimestampDrift(now, 300);
      assert.strictEqual(valid.valid, true);
      assert.strictEqual(valid.code, null);
    });

    test('verifyTimestampDrift rejects timestamps older than 300 seconds with ERR_TIMESTAMP_EXPIRED', () => {
      const oldTime = new Date(Date.now() - 400 * 1000).toISOString();
      const expired = verifyTimestampDrift(oldTime, 300);
      assert.strictEqual(expired.valid, false);
      assert.strictEqual(expired.code, 'ERR_TIMESTAMP_EXPIRED');
    });

    test('verifyTimestampDrift rejects future timestamps >60s with ERR_TIMESTAMP_FUTURE', () => {
      const futureTime = new Date(Date.now() + 120 * 1000).toISOString();
      const future = verifyTimestampDrift(futureTime, 300);
      assert.strictEqual(future.valid, false);
      assert.strictEqual(future.code, 'ERR_TIMESTAMP_FUTURE');
    });
  });

  // --------------------------------------------------------------------------
  // 8. Sanitization: HTML, Safe URL & CSV Formula Escaping (CWE-1236)
  // --------------------------------------------------------------------------
  describe('8. Context-Aware Anti-XSS, URL Allowlisting & CSV Formula Sanitization', () => {
    test('escapeHtml encodes special HTML characters safely', () => {
      const raw = `<script>alert("XSS & 'quotes'")</script>`;
      const clean = escapeHtml(raw);
      assert.strictEqual(clean, `&lt;script&gt;alert(&quot;XSS &amp; &#039;quotes&#039;&quot;)&lt;/script&gt;`);
    });

    test('sanitizeUrl allows legitimate http, https, mailto, tel protocols', () => {
      assert.strictEqual(sanitizeUrl('https://studysync-al-2026.web.app'), 'https://studysync-al-2026.web.app');
      assert.strictEqual(sanitizeUrl('http://localhost:3000'), 'http://localhost:3000');
      assert.strictEqual(sanitizeUrl('mailto:student@example.com'), 'mailto:student@example.com');
      assert.strictEqual(sanitizeUrl('tel:+94771234567'), 'tel:+94771234567');
    });

    test('sanitizeUrl neutralizes javascript: and data: attack vectors', () => {
      assert.strictEqual(sanitizeUrl('javascript:alert(1)'), '#');
      assert.strictEqual(sanitizeUrl('JAVASCRIPT:alert(1)'), '#');
      assert.strictEqual(sanitizeUrl('data:text/html,<script>alert(1)</script>'), '#');
      assert.strictEqual(sanitizeUrl('vbscript:msgbox(1)'), '#');
    });

    test('sanitizeCsvFormula prepends single quote to leading =, +, -, @, \\t, \\r characters (CWE-1236)', () => {
      assert.strictEqual(sanitizeCsvFormula("=cmd|' /C calc'!A0"), "'=cmd|' /C calc'!A0");
      assert.strictEqual(sanitizeCsvFormula("+1234"), "'+1234");
      assert.strictEqual(sanitizeCsvFormula("-5678"), "'-5678");
      assert.strictEqual(sanitizeCsvFormula("@SUM(A1:A10)"), "'@SUM(A1:A10)");
      assert.strictEqual(sanitizeCsvFormula("\tMALICIOUS"), "'\tMALICIOUS");
      assert.strictEqual(sanitizeCsvFormula("\rCOMMAND"), "'\rCOMMAND");
      assert.strictEqual(sanitizeCsvFormula("Normal Text Name"), "Normal Text Name");
      assert.strictEqual(sanitizeCsvFormula(""), "");
    });

    test('formatCsvCell and generateCsvString apply formula escaping across RFC 4180 CSV exports', () => {
      const cell1 = formatCsvCell("=HYPERLINK(\"http://evil.com\",\"Click\")");
      assert.strictEqual(cell1, `"'=HYPERLINK(""http://evil.com"",""Click"")"`);

      const csv = generateCsvString(['Name', 'Formula'], [['Kasun', '=1+1']]);
      assert.ok(csv.includes("Kasun,'=1+1"));
    });
  });

  // --------------------------------------------------------------------------
  // 8b. Constant-Time Password Verification & Timing Attack Prevention
  // --------------------------------------------------------------------------
  describe('8b. Constant-Time String Comparison & Password Verification', () => {
    test('timingSafeEqual returns true for identical strings and false for differing strings', () => {
      assert.strictEqual(timingSafeEqual('a1b2c3d4e5f6', 'a1b2c3d4e5f6'), true);
      assert.strictEqual(timingSafeEqual('a1b2c3d4e5f6', 'a1b2c3d4e5f7'), false);
      assert.strictEqual(timingSafeEqual('short', 'longer_string'), false);
      assert.strictEqual(timingSafeEqual('', ''), true);
      assert.strictEqual(timingSafeEqual('a', ''), false);
    });

    test('verifyPassword verifies correct password and rejects invalid password using timingSafeEqual', async () => {
      const password = 'SecretPassword123!';
      const { hash, salt } = await hashPassword(password);

      const isValid = await verifyPassword(password, hash, salt);
      assert.strictEqual(isValid, true);

      const isInvalid = await verifyPassword('WrongPassword123!', hash, salt);
      assert.strictEqual(isInvalid, false);

      const isEmptyInvalid = await verifyPassword('', hash, salt);
      assert.strictEqual(isEmptyInvalid, false);
    });
  });

  // --------------------------------------------------------------------------
  // 9. Live Mock Server Security Parity & Formula Neutralization
  // --------------------------------------------------------------------------
  describe('9. Live Mock Server Security Parity', () => {
    let server;
    const PORT = 3099;

    before((done) => {
      server = http.createServer(app);
      server.listen(PORT, done);
    });

    after((done) => {
      server.close(done);
    });

    function makeRequest(path, payload) {
      return new Promise((resolve, reject) => {
        const body = JSON.stringify(payload);
        const req = http.request({
          hostname: '127.0.0.1',
          port: PORT,
          path: path,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(body)
          }
        }, (res) => {
          let data = '';
          res.on('data', (chunk) => { data += chunk; });
          res.on('end', () => {
            try {
              resolve({ statusCode: res.statusCode, body: JSON.parse(data) });
            } catch (e) {
              resolve({ statusCode: res.statusCode, raw: data });
            }
          });
        });
        req.on('error', reject);
        req.write(body);
        req.end();
      });
    }

    test('POST with expired timestamp returns 400 ERR_TIMESTAMP_EXPIRED', async () => {
      const expiredTimestamp = new Date(Date.now() - 400 * 1000).toISOString();
      const res = await makeRequest('/api', {
        action: 'checkUser',
        email: 'test@example.com',
        security: {
          requestTimestamp: expiredTimestamp,
          nonce: generateSecurityNonce()
        }
      });
      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.body.success, false);
      assert.match(res.body.error, /ERR_TIMESTAMP_EXPIRED/);
    });

    test('POST with future timestamp (>60s) returns 400 ERR_TIMESTAMP_FUTURE', async () => {
      const futureTimestamp = new Date(Date.now() + 120 * 1000).toISOString();
      const res = await makeRequest('/api', {
        action: 'checkUser',
        email: 'test@example.com',
        security: {
          requestTimestamp: futureTimestamp,
          nonce: generateSecurityNonce()
        }
      });
      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.body.success, false);
      assert.match(res.body.error, /ERR_TIMESTAMP_FUTURE/);
    });

    test('Idempotent requests with identical key return cached responses', async () => {
      const nonce = generateSecurityNonce();
      const key = `idempotent_${nonce}`;
      const payload = {
        action: 'registerUser',
        fullName: 'Idempotency User',
        email: `idempotent.${Date.now()}@example.com`,
        gender: 'Male',
        telegram: '@idempotent_user',
        school: 'Ananda College, Colombo',
        stream: 'Biological Science',
        optionalSubject: 'Physics',
        security: {
          idempotencyKey: key,
          requestTimestamp: new Date().toISOString(),
          nonce
        }
      };

      const res1 = await makeRequest('/api', payload);
      assert.strictEqual(res1.statusCode, 200);
      const studyId1 = res1.body.data.studyId;

      // Repeat identical request
      const res2 = await makeRequest('/api', payload);
      assert.strictEqual(res2.statusCode, 200);
      assert.strictEqual(res2.body.data.studyId, studyId1);
    });

    test('CSV formula injection in member registration and daily log is neutralized before DB persistence', async () => {
      const reg = await makeRequest('/api', {
        action: 'registerUser',
        fullName: '=cmd|/C calc',
        email: `formula.${Date.now()}@example.com`,
        gender: 'Female',
        telegram: '+formula_bot',
        school: '@Royal College, Colombo',
        stream: 'Physical Science',
        optionalSubject: 'Chemistry'
      });

      assert.strictEqual(reg.statusCode, 200);
      assert.strictEqual(reg.body.data.fullName, "'=cmd|/C calc");
      assert.strictEqual(reg.body.data.school, "'@Royal College, Colombo");
    });
  });
});
