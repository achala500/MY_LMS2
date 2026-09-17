/**
 * ============================================================================
 * Milestone M3 Verification Test Suite
 * Comprehensive automated unit and integration tests for Authentication,
 * Member Registration Flow, QR Code Engine, and StudySync Platform ID Card.
 * ============================================================================
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';

// Import M3 modules
import { generateQrMatrix, generateQrPayload, parseQrPayload } from '../src/js/qr.js';
import {
  IdCard,
  CARD_WIDTH_BASE,
  CARD_HEIGHT_BASE,
  EXPORT_SCALE_3X,
  EXPORT_WIDTH_3X,
  EXPORT_HEIGHT_3X
} from '../src/js/idcard.js';
import { AuthService } from '../src/js/auth.js';
import { ApiClient } from '../src/js/api.js';
import { AppState } from '../src/js/state.js';
import { LandingView } from '../src/js/views/landingView.js';
import { RegisterView } from '../src/js/views/registerView.js';
import { VerifyView } from '../src/js/views/verifyView.js';
import { app } from '../server/mock-server.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

// ----------------------------------------------------------------------------
// SUITE 1: Rule Compliance & Zero alert() Audit
// ----------------------------------------------------------------------------
test('Rule Compliance: Zero alert() calls in created files', async (t) => {
  await t.test('All JS files in src/js/ and src/js/views/ have zero raw alert() calls', () => {
    const checkDirs = [
      path.join(ROOT_DIR, 'src', 'js'),
      path.join(ROOT_DIR, 'src', 'js', 'views')
    ];

    const alertRegex = /(?<![.\w])alert\s*\(/g;
    const violations = [];

    for (const dir of checkDirs) {
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir);
        for (const file of files) {
          const filePath = path.join(dir, file);
          if (fs.statSync(filePath).isFile() && file.endsWith('.js')) {
            const content = fs.readFileSync(filePath, 'utf8');
            // Allow window.alert override safeguard in toast.js only
            const filtered = content.split('\n').filter(
              line => !line.includes('window.alert =') && !line.includes('// Overrides window.alert')
            );
            const matches = filtered.join('\n').match(alertRegex);
            if (matches) {
              violations.push({ file: filePath, count: matches.length });
            }
          }
        }
      }
    }

    assert.equal(violations.length, 0, `Forbidden alert() calls detected: ${JSON.stringify(violations)}`);
  });
});

// ----------------------------------------------------------------------------
// SUITE 2: QR Code Matrix & Dual-Payload Engine
// ----------------------------------------------------------------------------
test('QR Code Engine: Matrix generation and dual-payload verification', async (t) => {
  await t.test('generateQrMatrix produces a square 2D boolean array for text', () => {
    const text = 'STUDYSYNC|SG-BIO-0001|https://studysync.lk/#verify/SG-BIO-0001|{}';
    const matrix = generateQrMatrix(text, 'M');

    assert.ok(Array.isArray(matrix), 'Matrix must be an array');
    assert.ok(matrix.length >= 21, `Matrix size must be >= 21, got ${matrix.length}`);
    assert.equal(matrix.length, matrix[0].length, 'Matrix must be square');
    assert.equal(typeof matrix[0][0], 'boolean', 'Modules must be booleans');
  });

  await t.test('generateQrPayload creates offlineData, verifyUrl, and combinedString', () => {
    const sampleMember = {
      studyId: 'SG-BIO-0001',
      fullName: 'Kasun Perera',
      school: 'Royal College, Colombo',
      stream: 'Biological Science',
      optionalSubject: 'Physics',
      registrationDate: '2026-08-20',
      status: 'Active'
    };

    const payload = generateQrPayload(sampleMember, 'https://studysync.lk');
    assert.ok(payload.offlineData, 'Must produce offlineData');
    assert.ok(payload.verifyUrl.includes('/#verify/SG-BIO-0001'), 'verifyUrl must contain encoded studyId');
    assert.ok(payload.combinedString.startsWith('STUDYSYNC|SG-BIO-0001|'), 'combinedString must follow protocol');

    const parsedOffline = JSON.parse(payload.offlineData);
    assert.equal(parsedOffline.id, 'SG-BIO-0001');
    assert.equal(parsedOffline.name, 'Kasun Perera');
    assert.equal(parsedOffline.stream, 'Biological Science');
  });

  await t.test('parseQrPayload accurately decodes combined, json, and url formats', () => {
    const sampleMember = {
      studyId: 'SG-MATH-0042',
      fullName: 'Nimali Fernando',
      school: 'Visakha Vidyalaya',
      stream: 'Physical Science',
      registrationDate: '2026-08-21'
    };

    const payload = generateQrPayload(sampleMember, 'https://studysync.lk');
    const decoded = parseQrPayload(payload.combinedString);

    assert.ok(decoded !== null, 'Decoded payload must not be null');
    assert.equal(decoded.type, 'STUDYSYNC_DUAL');
    assert.equal(decoded.studyId, 'SG-MATH-0042');
    assert.equal(decoded.offlineData.name, 'Nimali Fernando');

    // Test pure JSON string
    const jsonStr = JSON.stringify({ id: 'SG-BIO-0005', name: 'Test Student' });
    const decodedJson = parseQrPayload(jsonStr);
    assert.equal(decodedJson.type, 'STUDYSYNC_JSON');
    assert.equal(decodedJson.studyId, 'SG-BIO-0005');

    // Test direct URL
    const urlStr = 'https://studysync.lk/#verify/SG-BIO-0099';
    const decodedUrl = parseQrPayload(urlStr);
    assert.equal(decodedUrl.type, 'STUDYSYNC_URL');
    assert.equal(decodedUrl.studyId, 'SG-BIO-0099');
  });
});

// ----------------------------------------------------------------------------
// SUITE 3: StudySync Platform ID Card Renderer & 3x PNG Exporter
// ----------------------------------------------------------------------------
test('IdCard Renderer: Dimensions, scale factors, and export specifications', async (t) => {
  await t.test('Base and 3x export constants match authoritative specification', () => {
    assert.equal(CARD_WIDTH_BASE, 480, 'Base width must be 480');
    assert.equal(CARD_HEIGHT_BASE, 302, 'Base height must be 302');
    assert.equal(EXPORT_SCALE_3X, 3, 'Export scale factor must be 3');
    assert.equal(EXPORT_WIDTH_3X, 1440, '3x export width must be 1440px (480 * 3)');
    assert.equal(EXPORT_HEIGHT_3X, 906, '3x export height must be 906px (302 * 3)');
  });

  await t.test('renderToCanvas sets accurate canvas pixel dimensions for 1x and 3x', () => {
    // Mock canvas context
    const createMockCanvas = () => {
      const drawnOps = [];
      return {
        width: 0,
        height: 0,
        getContext: () => ({
          save: () => drawnOps.push('save'),
          restore: () => drawnOps.push('restore'),
          beginPath: () => drawnOps.push('beginPath'),
          closePath: () => drawnOps.push('closePath'),
          moveTo: () => {},
          lineTo: () => {},
          quadraticCurveTo: () => {},
          arc: () => {},
          stroke: () => {},
          fill: () => {},
          fillRect: () => {},
          strokeRect: () => {},
          fillText: () => {},
          measureText: (txt) => ({ width: txt.length * 8 }),
          clip: () => drawnOps.push('clip'),
          createLinearGradient: () => ({ addColorStop: () => {} }),
          createRadialGradient: () => ({ addColorStop: () => {} })
        }),
        _drawnOps: drawnOps
      };
    };

    const sampleBioMember = {
      studyId: 'SG-BIO-0001',
      fullName: 'Kasun Perera',
      school: 'Royal College, Colombo',
      stream: 'Biological Science',
      optionalSubject: 'Physics',
      registrationDate: '2026-08-20',
      status: 'Active'
    };

    // 1x scale
    const canvas1x = createMockCanvas();
    IdCard.renderToCanvas(sampleBioMember, canvas1x, 1);
    assert.equal(canvas1x.width, 480);
    assert.equal(canvas1x.height, 302);

    // 3x scale
    const canvas3x = createMockCanvas();
    IdCard.renderToCanvas(sampleBioMember, canvas3x, 3);
    assert.equal(canvas3x.width, 1440);
    assert.equal(canvas3x.height, 906);
  });
});

// ----------------------------------------------------------------------------
// SUITE 4: Authentication Service & State Management
// ----------------------------------------------------------------------------
test('AuthService: State management and authentication lifecycle', async (t) => {
  await t.test('AuthService initializes and manages auth listeners', async () => {
    await AuthService.init();
    assert.equal(typeof AuthService.signIn, 'function');
    assert.equal(typeof AuthService.signOut, 'function');
    assert.equal(typeof AuthService.getCurrentUser, 'function');
  });

  await t.test('_handleSuccessfulLogin updates AppState with user data', async () => {
    AppState.reset();
    assert.equal(AppState.get().user, null);

    const testUser = {
      uid: 'test-uid-123',
      email: 'student.test@gmail.com',
      displayName: 'Test Student',
      photoURL: ''
    };

    const result = await AuthService._handleSuccessfulLogin(testUser);
    assert.equal(result.user.email, 'student.test@gmail.com');
    assert.equal(AppState.get().user.email, 'student.test@gmail.com');
  });

  await t.test('signOut resets AppState completely', async () => {
    await AuthService.signOut();
    const state = AppState.get();
    assert.equal(state.user, null);
    assert.equal(state.member, null);
  });
});

// ----------------------------------------------------------------------------
// SUITE 5: Unified ApiClient Functional Endpoints
// ----------------------------------------------------------------------------
test('ApiClient: All 7 endpoints structure & mock server integration', async (t) => {
  let server;
  let testPort;

  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, () => {
      testPort = server.address().port;
      resolve();
    });
  });

  t.after(() => {
    server.close();
  });

  // Set ApiClient base URL to the local test server
  ApiClient.setBaseUrl(`http://127.0.0.1:${testPort}/api`);

  await t.test('ApiClient defines all 7 required endpoints', () => {
    assert.equal(typeof ApiClient.checkUser, 'function');
    assert.equal(typeof ApiClient.registerUser, 'function');
    assert.equal(typeof ApiClient.submitDailyLog, 'function');
    assert.equal(typeof ApiClient.getStudentHistory, 'function');
    assert.equal(typeof ApiClient.verifyMember, 'function');
    assert.equal(typeof ApiClient.getAdminData, 'function');
    assert.equal(typeof ApiClient.getAnalytics, 'function');
  });

  await t.test('checkUser returns registered=false for unregistered email', async () => {
    const res = await ApiClient.checkUser('brand.new.user@gmail.com');
    assert.equal(res.success, true);
    assert.equal(res.data.registered, false);
    assert.equal(res.data.member, null);
  });

  let testStudyId = '';
  await t.test('registerUser registers new member and allocates sequential ID', async () => {
    const uniqueEmail = `student_${Date.now()}@gmail.com`;
    const res = await ApiClient.registerUser({
      fullName: 'Kamal Gunaratne',
      email: uniqueEmail,
      gender: 'Male',
      telegram: '@kamal_g',
      school: 'Royal College, Colombo',
      stream: 'Biological Science',
      optionalSubject: 'Physics'
    });

    assert.equal(res.success, true);
    assert.ok(res.data.studyId.startsWith('SG-BIO-'));
    assert.equal(res.data.fullName, 'Kamal Gunaratne');
    assert.equal(res.data.school, 'Royal College, Colombo');
    testStudyId = res.data.studyId;
  });

  await t.test('verifyMember validates member public record', async () => {
    const res = await ApiClient.verifyMember(testStudyId);
    assert.equal(res.success, true);
    assert.equal(res.data.valid, true);
    assert.equal(res.data.member.studyId, testStudyId);
    assert.equal(res.data.member.fullName, 'Kamal Gunaratne');
  });

  await t.test('getAnalytics retrieves public group statistics', async () => {
    const res = await ApiClient.getAnalytics();
    assert.equal(res.success, true);
    assert.ok(res.data.kpi !== undefined);
    assert.ok(res.data.streamBreakdown !== undefined);
  });
});

// ----------------------------------------------------------------------------
// SUITE 6: View Components Structure & Interfaces
// ----------------------------------------------------------------------------
test('View Components: LandingView, RegisterView, VerifyView exports and lifecycle', async (t) => {
  await t.test('LandingView instantiates and implements render() and destroy()', () => {
    const view = new LandingView();
    assert.equal(typeof view.render, 'function');
    assert.equal(typeof view.destroy, 'function');
  });

  await t.test('RegisterView instantiates and implements render() and destroy()', () => {
    const view = new RegisterView();
    assert.equal(typeof view.render, 'function');
    assert.equal(typeof view.destroy, 'function');
  });

  await t.test('VerifyView instantiates and implements render(), performLookup(), destroy()', () => {
    const view = new VerifyView();
    assert.equal(typeof view.render, 'function');
    assert.equal(typeof view.performLookup, 'function');
    assert.equal(typeof view.destroy, 'function');
  });
});
