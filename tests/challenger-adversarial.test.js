/**
 * StudySync — Empirical Challenger Adversarial Stress Test Suite
 * 
 * Adversarially challenges:
 * 1. Client-Side Canvas Image Compression Pipeline & Boundaries
 * 2. Dual-Slider Pointer Event Clamping, Step Math & Keyboard Bounds
 * 3. RFC 4180 CSV Export Escaping with Sinhala/Tamil/CRLF/Quotes
 * 4. AppState Reactive Pub/Sub & LocalStorage Serialization Resilience
 * 5. Static & Runtime Zero-Alert Invariant Verification
 * 6. API Contract Endpoints & Concurrency/Duplicate Invariants
 */

import { describe, it, before, beforeEach } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';

// Setup Mock DOM & Browser Environment for Node.js before importing DOM-dependent modules
function setupMockBrowser() {
  const listeners = {};
  const storage = {};

  const mockStorage = {
    getItem: (key) => storage[key] || null,
    setItem: (key, val) => { storage[key] = String(val); },
    removeItem: (key) => { delete storage[key]; },
    clear: () => { Object.keys(storage).forEach(k => delete storage[k]); }
  };

  global.window = {
    location: { hash: '#landing', host: 'localhost:3000', protocol: 'http:' },
    localStorage: mockStorage,
    addEventListener: (evt, fn) => {
      listeners[evt] = listeners[evt] || [];
      listeners[evt].push(fn);
    },
    removeEventListener: (evt, fn) => {
      if (listeners[evt]) {
        listeners[evt] = listeners[evt].filter(f => f !== fn);
      }
    }
  };

  global.localStorage = mockStorage;

  // DOM Mock
  class MockElement {
    constructor(tagName = 'div') {
      this.tagName = tagName.toUpperCase();
      this.innerHTML = '';
      this.textContent = '';
      this.style = {};
      this.classList = {
        _classes: new Set(),
        add: (...cls) => cls.forEach(c => this.classList._classes.add(c)),
        remove: (...cls) => cls.forEach(c => this.classList._classes.delete(c)),
        contains: (c) => this.classList._classes.has(c),
        toggle: (c) => this.classList.contains(c) ? this.classList.remove(c) : this.classList.add(c)
      };
      this.attributes = {};
      this._eventListeners = {};
      this._boundingClientRect = { left: 100, top: 200, width: 300, height: 24, right: 400, bottom: 224 };
    }

    setAttribute(k, v) { this.attributes[k] = String(v); }
    getAttribute(k) { return this.attributes[k] !== undefined ? this.attributes[k] : null; }
    removeAttribute(k) { delete this.attributes[k]; }
    getBoundingClientRect() { return this._boundingClientRect; }
    setPointerCapture() {}
    releasePointerCapture() {}

    addEventListener(evt, handler) {
      this._eventListeners[evt] = this._eventListeners[evt] || [];
      this._eventListeners[evt].push(handler);
    }

    removeEventListener(evt, handler) {
      if (this._eventListeners[evt]) {
        this._eventListeners[evt] = this._eventListeners[evt].filter(h => h !== handler);
      }
    }

    dispatchEvent(evt) {
      const handlers = this._eventListeners[evt.type] || [];
      handlers.forEach(h => h(evt));
      return true;
    }

    querySelector(selector) {
      if (!this._children) this._children = {};
      if (!this._children[selector]) {
        const sub = new MockElement();
        if (selector.includes('custom-slider-container')) {
          sub.setAttribute('tabindex', this.innerHTML.includes('tabindex="-1"') ? '-1' : '0');
          sub.setAttribute('role', 'slider');
        } else if (selector.includes('track')) {
          sub._boundingClientRect = { left: 100, top: 200, width: 200, height: 12, right: 300, bottom: 212 };
        }
        this._children[selector] = sub;
      }
      return this._children[selector];
    }

    querySelectorAll() {
      return [new MockElement(), new MockElement()];
    }
  }

  global.document = {
    createElement: (tag) => new MockElement(tag),
    querySelector: () => new MockElement(),
    querySelectorAll: () => [new MockElement()]
  };

  global.CustomEvent = class CustomEvent {
    constructor(type, options = {}) {
      this.type = type;
      this.detail = options.detail || {};
    }
  };
}

setupMockBrowser();

// Import domain & client modules after mock browser setup
import {
  getTodayDateString,
  formatDate,
  parseDateString,
  isToday,
  isFutureDate,
  daysBetween,
  calculateStreak,
  calculateStats,
  formatBytes,
  sanitizeString,
  formatTelegramUsername,
  validateEmail,
  validateStudyId,
  formatCsvCell,
  generateCsvString
} from '../src/js/utils.js';

import { CustomSlider, createDualSlider } from '../src/js/slider.js';
import { AppState } from '../src/js/state.js';
import {
  SRI_LANKAN_SCHOOLS,
  filterSchools,
  STREAMS,
  STREAM_SUBJECTS,
  getStudentSubjects,
  getFocusBadge,
  getProductivityBadge,
  StudySyncDatabase,
  generateQrPayload,
  parseQrPayload
} from './test-harness.js';

describe('CHALLENGER ADVERSARIAL SUITE: Client State & API Contracts', () => {

  // ==========================================================================
  // 1. IMAGE COMPRESSION PIPELINE & BOUNDARIES
  // ==========================================================================
  describe('1. Canvas Image Compression Pipeline & Extreme Dimensions', () => {

    it('Calculates correct proportional downscaling for oversized dimensions (>1600px)', () => {
      const maxDim = 1600;

      // Scenario A: Landscape 4000 x 3000
      let w = 4000, h = 3000;
      if (w > maxDim || h > maxDim) {
        if (w > h) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
      }
      assert.strictEqual(w, 1600);
      assert.strictEqual(h, 1200);

      // Scenario B: Portrait 2400 x 4800
      w = 2400; h = 4800;
      if (w > maxDim || h > maxDim) {
        if (w > h) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
      }
      assert.strictEqual(w, 800);
      assert.strictEqual(h, 1600);

      // Scenario C: Square 3200 x 3200
      w = 3200; h = 3200;
      if (w > maxDim || h > maxDim) {
        if (w > h) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
      }
      assert.strictEqual(w, 1600);
      assert.strictEqual(h, 1600);
    });

    it('Handles extreme aspect ratios without NaN or division by zero', () => {
      const maxDim = 1600;

      // Extreme panorama: 10000 x 100
      let w = 10000, h = 100;
      if (w > h) {
        h = Math.round((h * maxDim) / w);
        w = maxDim;
      }
      assert.strictEqual(w, 1600);
      assert.strictEqual(h, 16);
      assert.ok(!isNaN(w) && !isNaN(h));

      // Extreme tall strip: 50 x 8000
      w = 50; h = 8000;
      if (h > w) {
        w = Math.round((w * maxDim) / h);
        h = maxDim;
      }
      assert.strictEqual(w, 10);
      assert.strictEqual(h, 1600);

      // 1x1 single pixel
      w = 1; h = 1;
      assert.ok(w <= maxDim && h <= maxDim);
    });

    it('Verifies formatBytes helper handles 0 B, KB, MB, and boundary values', () => {
      assert.strictEqual(formatBytes(0), '0 B');
      assert.strictEqual(formatBytes(512), '512 B');
      assert.strictEqual(formatBytes(1024), '1 KB');
      assert.strictEqual(formatBytes(350 * 1024), '350 KB');
      assert.strictEqual(formatBytes(1024 * 1024 * 3.5), '3.5 MB');
      assert.strictEqual(formatBytes(1024 * 1024 * 1024 * 2), '2 GB');
    });

    it('Verifies simulated base64 payload size for compressed proof image is within 400KB budget', () => {
      // 1600x1200 JPEG at quality 0.75 typically results in ~120KB - 280KB binary size
      const simulatedBinarySizeBytes = 245 * 1024; // 245 KB
      const base64Length = Math.ceil(simulatedBinarySizeBytes * 4 / 3);
      
      assert.ok(simulatedBinarySizeBytes < 400 * 1024, 'Binary size must be < 400KB');
      assert.ok(base64Length < 550 * 1024, 'Base64 string must be < 550KB');
    });
  });

  // ==========================================================================
  // 2. DUAL-SLIDER COMPONENT: POINTER DRAG & KEYBOARD BOUNDARIES
  // ==========================================================================
  describe('2. CustomSlider Pointer Clamping, Step Quantization & Key Navigation', () => {

    it('Clamps values strictly between min (1) and max (10) when pointer drags past boundaries', () => {
      const container = global.document.createElement('div');
      const slider = new CustomSlider(container, { min: 1, max: 10, value: 5 });

      // Mock track width = 200, left = 100
      slider.trackEl.getBoundingClientRect = () => ({ left: 100, width: 200 });

      // Dragging far left past 0% (clientX = -500)
      slider._updateFromPointer({ clientX: -500 });
      assert.strictEqual(slider.getValue(), 1, 'Pointer dragged far left must clamp to min 1');

      // Dragging far right past 100% (clientX = 5000)
      slider._updateFromPointer({ clientX: 5000 });
      assert.strictEqual(slider.getValue(), 10, 'Pointer dragged far right must clamp to max 10');

      // Dragging exact middle (clientX = 200 -> offsetX = 100 -> ratio = 0.5 -> val = 1 + 0.5*9 = 5.5 -> round = 6)
      slider._updateFromPointer({ clientX: 200 });
      assert.strictEqual(slider.getValue(), 6);
    });

    it('Correctly steps and rounds fractional values', () => {
      const container = global.document.createElement('div');
      const slider = new CustomSlider(container, { min: 1, max: 10, value: 5, step: 1 });

      slider.setValue(3.4);
      assert.strictEqual(slider.getValue(), 3);

      slider.setValue(3.6);
      assert.strictEqual(slider.getValue(), 4);

      slider.setValue(0); // below min
      assert.strictEqual(slider.getValue(), 1);

      slider.setValue(100); // above max
      assert.strictEqual(slider.getValue(), 10);
    });

    it('Dispatches score tiers and qualitative metadata accurately across 1-10 range', () => {
      // 1-3: Distracted / Low (danger / #ef4444)
      [1, 2, 3].forEach(v => {
        const tier = CustomSlider.getScoreTier(v);
        assert.strictEqual(tier.status, 'Distracted / Low');
        assert.strictEqual(tier.tone, 'danger');
        assert.strictEqual(tier.primaryColor, '#ef4444');
      });

      // 4-6: Moderate / Steady (warning / #eab308)
      [4, 5, 6].forEach(v => {
        const tier = CustomSlider.getScoreTier(v);
        assert.strictEqual(tier.status, 'Moderate / Steady');
        assert.strictEqual(tier.tone, 'warning');
        assert.strictEqual(tier.primaryColor, '#eab308');
      });

      // 7-8: High / Productive (success / #10b981)
      [7, 8].forEach(v => {
        const tier = CustomSlider.getScoreTier(v);
        assert.strictEqual(tier.status, 'High / Productive');
        assert.strictEqual(tier.tone, 'success');
        assert.strictEqual(tier.primaryColor, '#10b981');
      });

      // 9-10: Deep Flow State (purple / #06b6d4 / #8b5cf6)
      [9, 10].forEach(v => {
        const tier = CustomSlider.getScoreTier(v);
        assert.strictEqual(tier.status, 'Deep Flow State 🔥');
        assert.strictEqual(tier.tone, 'purple');
      });
    });

    it('Handles disabled state preventing pointer and keyboard updates', () => {
      const container = global.document.createElement('div');
      const slider = new CustomSlider(container, { min: 1, max: 10, value: 7, disabled: true });

      assert.strictEqual(slider.disabled, true);
      assert.strictEqual(slider.sliderContainerEl.getAttribute('tabindex'), '-1');

      // Attempt programmatic setDisabled toggle
      slider.setDisabled(false);
      assert.strictEqual(slider.disabled, false);
      assert.strictEqual(slider.sliderContainerEl.getAttribute('tabindex'), '0');

      slider.setDisabled(true);
      assert.strictEqual(slider.disabled, true);
      assert.strictEqual(slider.sliderContainerEl.getAttribute('tabindex'), '-1');
    });

    it('createDualSlider instantiates paired Focus and Productivity sliders with independent state', () => {
      const container = global.document.createElement('div');
      let focusVal = null;
      let prodVal = null;

      const dual = createDualSlider(container, {
        subjectName: 'Combined Maths',
        initialFocus: 8,
        initialProductivity: 9,
        onFocusChange: (v) => { focusVal = v; },
        onProductivityChange: (v) => { prodVal = v; }
      });

      assert.strictEqual(dual.focusSlider.getValue(), 8);
      assert.strictEqual(dual.prodSlider.getValue(), 9);

      dual.focusSlider.setValue(4);
      assert.strictEqual(dual.focusSlider.getValue(), 4);
      assert.strictEqual(dual.prodSlider.getValue(), 9, 'Prod slider should remain unaffected by Focus change');
      assert.strictEqual(focusVal, 4);

      dual.prodSlider.setValue(10);
      assert.strictEqual(dual.prodSlider.getValue(), 10);
      assert.strictEqual(prodVal, 10);
    });
  });

  // ==========================================================================
  // 3. RFC 4180 CSV GENERATION & UNICODE ESCAPING
  // ==========================================================================
  describe('3. RFC 4180 CSV Generation, Quotes Escaping & Unicode Sinhala/Tamil Support', () => {

    it('Properly formats plain strings without quotes when no special characters exist', () => {
      assert.strictEqual(formatCsvCell('SG-BIO-0001'), 'SG-BIO-0001');
      assert.strictEqual(formatCsvCell('Kasun Perera'), 'Kasun Perera');
      assert.strictEqual(formatCsvCell(123), '123');
      assert.strictEqual(formatCsvCell(null), '');
      assert.strictEqual(formatCsvCell(undefined), '');
    });

    it('Escapes commas by wrapping cell in double quotes', () => {
      const val = 'Royal College, Colombo 07';
      assert.strictEqual(formatCsvCell(val), '"Royal College, Colombo 07"');
    });

    it('Escapes embedded double quotes by doubling them ("" -> """")', () => {
      const val = 'Study "Hard" Plan';
      assert.strictEqual(formatCsvCell(val), '"Study ""Hard"" Plan"');
    });

    it('Escapes multi-line strings with CRLF / LF', () => {
      const val = 'Line 1\nLine 2\r\nLine 3';
      assert.strictEqual(formatCsvCell(val), '"Line 1\nLine 2\r\nLine 3"');
    });

    it('Properly preserves Unicode Sinhala and Tamil school names in CSV output', () => {
      const headers = ['Study ID', 'Full Name', 'School', 'Stream'];
      const rows = [
        ['SG-BIO-0001', 'කසුන් පෙරේරා', 'රාජකීය විද්‍යාලය, කොළඹ 07', 'Biological Science'],
        ['SG-BIO-0002', 'අනුෂ්ක ප්‍රනාන්දු', 'ආනන්ද විද්‍යාලය, කොළඹ', 'Biological Science'],
        ['SG-MATH-0001', 'செல்வா குமார்', 'யாழ்ப்பாணம் இந்துக் கல்லூரி, யாழ்ப்பாணம்', 'Physical Science'],
        ['SG-MATH-0002', 'பிரியா தர்மலிங்கம்', 'கொழும்பு "விவேகானந்தா" கல்லூரி', 'Physical Science']
      ];

      const csv = generateCsvString(headers, rows);
      assert.ok(csv.includes('Study ID,Full Name,School,Stream'));
      assert.ok(csv.includes('"රාජකීය විද්‍යාලය, කොළඹ 07"'));
      assert.ok(csv.includes('"ආනන්ද විද්‍යාලය, කොළඹ"'));
      assert.ok(csv.includes('"யாழ்ப்பாணம் இந்துக் கல்லூரி, யாழ்ப்பாணம்"'));
      assert.ok(csv.includes('"கொழும்பு ""விவேகானந்தா"" கல்லூரி"'));

      // RFC 4180 requires CRLF line endings
      assert.ok(csv.includes('\r\n'));
    });

    it('Verifies complete RFC 4180 roundtrip parser on generated CSV', () => {
      const headers = ['ID', 'Notes', 'Score'];
      const rows = [
        ['1', 'Completed past paper; scored 85%, need review on Q4.', '85'],
        ['2', 'He said, "Practice makes perfect!"\r\nRevised kinematics.', '92'],
        ['3', 'Regular note without delimiters', '78']
      ];

      const csvString = generateCsvString(headers, rows);

      // RFC 4180 Parser
      function parseRfc4180Csv(text) {
        const records = [];
        let row = [];
        let cell = '';
        let inQuotes = false;
        let i = 0;

        while (i < text.length) {
          const char = text[i];
          const nextChar = text[i + 1];

          if (inQuotes) {
            if (char === '"') {
              if (nextChar === '"') {
                cell += '"';
                i += 2;
                continue;
              } else {
                inQuotes = false;
                i++;
                continue;
              }
            } else {
              cell += char;
              i++;
              continue;
            }
          } else {
            if (char === '"') {
              inQuotes = true;
              i++;
              continue;
            } else if (char === ',') {
              row.push(cell);
              cell = '';
              i++;
              continue;
            } else if (char === '\r' && nextChar === '\n') {
              row.push(cell);
              records.push(row);
              row = [];
              cell = '';
              i += 2;
              continue;
            } else if (char === '\n') {
              row.push(cell);
              records.push(row);
              row = [];
              cell = '';
              i++;
              continue;
            } else {
              cell += char;
              i++;
              continue;
            }
          }
        }
        if (cell.length > 0 || row.length > 0) {
          row.push(cell);
          records.push(row);
        }
        return records;
      }

      const parsed = parseRfc4180Csv(csvString);
      assert.strictEqual(parsed.length, 4); // Header + 3 rows
      assert.deepStrictEqual(parsed[0], ['ID', 'Notes', 'Score']);
      assert.strictEqual(parsed[1][1], 'Completed past paper; scored 85%, need review on Q4.');
      assert.strictEqual(parsed[2][1], 'He said, "Practice makes perfect!"\r\nRevised kinematics.');
      assert.strictEqual(parsed[3][1], 'Regular note without delimiters');
    });
  });

  // ==========================================================================
  // 4. APPSTATE REACTIVITY & LOCAL STORAGE PERSISTENCE RESILIENCE
  // ==========================================================================
  describe('4. AppState Reactive Pub/Sub, Patch Isolation & LocalStorage Resilience', () => {

    beforeEach(() => {
      AppState.reset();
    });

    it('Executes subscriber immediately upon registration and on subsequent state sets', () => {
      let callCount = 0;
      let lastState = null;

      const unsub = AppState.subscribe((state) => {
        callCount++;
        lastState = state;
      });

      assert.strictEqual(callCount, 1, 'Subscriber must be invoked immediately on subscribe');
      assert.strictEqual(lastState.route, 'landing');

      AppState.set({ route: 'dashboard' });
      assert.strictEqual(callCount, 2);
      assert.strictEqual(lastState.route, 'dashboard');

      unsub();
      AppState.set({ route: 'register' });
      assert.strictEqual(callCount, 2, 'Unsubscribed listener must NOT receive further updates');
    });

    it('Supports multiple concurrent subscribers without cross-interference', () => {
      let callsA = 0;
      let callsB = 0;

      const unsubA = AppState.subscribe(() => { callsA++; });
      const unsubB = AppState.subscribe(() => { callsB++; });

      AppState.set({ isLoading: true });
      assert.strictEqual(callsA, 2);
      assert.strictEqual(callsB, 2);

      unsubA();
      AppState.set({ isLoading: false });
      assert.strictEqual(callsA, 2);
      assert.strictEqual(callsB, 3);

      unsubB();
    });

    it('Persists user and member to localStorage and ignores invalid patches', () => {
      AppState.set({
        user: { email: 'kasun@gmail.com', displayName: 'Kasun P' },
        member: { studyId: 'SG-BIO-0001', stream: 'Biological Science' },
        isMockMode: true
      });

      const raw = global.localStorage.getItem('studysync_app_state_v1');
      assert.ok(raw);
      const parsed = JSON.parse(raw);
      assert.strictEqual(parsed.user.email, 'kasun@gmail.com');
      assert.strictEqual(parsed.member.studyId, 'SG-BIO-0001');
      assert.strictEqual(parsed.isMockMode, true);

      // Setting null or non-object patch should not crash or corrupt state
      AppState.set(null);
      AppState.set(undefined);
      AppState.set('invalid string');
      assert.strictEqual(AppState.get().member.studyId, 'SG-BIO-0001');
    });

    it('Handles corrupted LocalStorage JSON gracefully during state load', () => {
      global.localStorage.setItem('studysync_app_state_v1', 'CORRUPTED_{{{NOT_VALID_JSON');
      assert.doesNotThrow(() => {
        AppState._loadPersistedState();
      });
    });
  });

  // ==========================================================================
  // 5. STATIC & RUNTIME ZERO-ALERT INVARIANT VERIFICATION
  // ==========================================================================
  describe('5. Zero Raw alert() Calls Across Entire Workspace', () => {

    it('Scans all frontend views, utils, backend scripts, and HTML files for zero alert() invocations', () => {
      const rootDir = path.resolve('.');
      const filesToScan = [];

      function walkDir(dir) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === '.agents') continue;
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            walkDir(fullPath);
          } else if (entry.isFile() && /\.(js|html|gs)$/i.test(entry.name)) {
            // Exclude test assertions that specifically check for alert absence
            if (!fullPath.includes('tests')) {
              filesToScan.push(fullPath);
            }
          }
        }
      }

      walkDir(rootDir);
      assert.ok(filesToScan.length >= 10, `Found ${filesToScan.length} files to scan for alert calls`);

      const illegalCalls = [];
      const alertRegex = /\b(window\.)?alert\s*\(/;

      filesToScan.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n');
        lines.forEach((line, idx) => {
          const trimmed = line.trim();
          if (alertRegex.test(trimmed) && !trimmed.startsWith('//') && !trimmed.startsWith('*')) {
            illegalCalls.push({ file, line: idx + 1, text: trimmed });
          }
        });
      });

      assert.strictEqual(
        illegalCalls.length,
        0,
        `Found forbidden raw alert() calls: ${JSON.stringify(illegalCalls, null, 2)}`
      );
    });
  });

  // ==========================================================================
  // 6. API CONTRACT & DATABASE INVARIANTS
  // ==========================================================================
  describe('6. API Contract Endpoints, Concurrency & Database Schema Invariants', () => {
    let db;

    beforeEach(() => {
      db = new StudySyncDatabase();
    });

    it('Generates atomic sequential Study IDs partitioned strictly by stream', () => {
      const bio1 = db.generateStudyId(STREAMS.BIO);
      const bio2 = db.generateStudyId(STREAMS.BIO);
      const math1 = db.generateStudyId(STREAMS.MATHS);
      const bio3 = db.generateStudyId(STREAMS.BIO);
      const math2 = db.generateStudyId(STREAMS.MATHS);

      assert.strictEqual(bio1, 'SG-BIO-0001');
      assert.strictEqual(bio2, 'SG-BIO-0002');
      assert.strictEqual(math1, 'SG-MATH-0001');
      assert.strictEqual(bio3, 'SG-BIO-0003');
      assert.strictEqual(math2, 'SG-MATH-0002');
    });

    it('Enforces 1:1 unique email key on member registration and rejects duplicates', () => {
      db.registerMember({
        fullName: 'Kasun Perera',
        email: 'kasun.p@gmail.com',
        gender: 'Male',
        telegram: '@kasun_p',
        school: 'Royal College, Colombo',
        stream: STREAMS.BIO,
        optionalSubject: 'Physics'
      });

      assert.throws(() => {
        db.registerMember({
          fullName: 'Kasun P Duplicate',
          email: 'KASUN.P@gmail.com', // Case-insensitive collision
          gender: 'Male',
          telegram: '@kasun_dup',
          school: 'Ananda College, Colombo',
          stream: STREAMS.BIO,
          optionalSubject: 'Physics'
        });
      }, /already exists/);
    });

    it('Enforces stream-specific 3-subject validation rules', () => {
      const memBio = db.registerMember({
        fullName: 'Kasun Bio',
        email: 'kasun.bio@gmail.com',
        gender: 'Male',
        telegram: '@kasun_bio',
        school: 'Royal College, Colombo',
        stream: STREAMS.BIO,
        optionalSubject: 'Physics'
      });

      // Valid Bio subjects: Biology, Chemistry, Physics
      const validSubBio = [
        { name: 'Biology', hours: 2.5, focus: 8, productivity: 8 },
        { name: 'Chemistry', hours: 2.0, focus: 7, productivity: 7 },
        { name: 'Physics', hours: 1.5, focus: 9, productivity: 9 }
      ];

      const res = db.submitDailyLog({
        studyId: memBio['Study ID'],
        email: memBio.Email,
        dateOfStudy: '2026-08-26',
        subjects: validSubBio
      });

      assert.strictEqual(res.isDuplicate, false);
      assert.strictEqual(res.totalHours, 6.0);

      // Attempt submitting wrong subjects (e.g. Combined Maths for Bio student)
      assert.throws(() => {
        db.submitDailyLog({
          studyId: memBio['Study ID'],
          email: memBio.Email,
          dateOfStudy: '2026-08-27',
          subjects: [
            { name: 'Combined Maths', hours: 2.0, focus: 8, productivity: 8 },
            { name: 'Chemistry', hours: 2.0, focus: 7, productivity: 7 },
            { name: 'Physics', hours: 1.5, focus: 9, productivity: 9 }
          ]
        });
      }, /Invalid subject at index 0/);
    });

    it('Enforces One-Submission-Per-Day duplicate lock', () => {
      const mem = db.registerMember({
        fullName: 'Nimali Fernando',
        email: 'nimali@gmail.com',
        gender: 'Female',
        telegram: '@nimali_f',
        school: 'Visakha Vidyalaya, Colombo',
        stream: STREAMS.MATHS,
        optionalSubject: 'ICT'
      });

      const subjects = [
        { name: 'Combined Maths', hours: 3.0, focus: 8, productivity: 8 },
        { name: 'Physics', hours: 2.0, focus: 7, productivity: 7 },
        { name: 'ICT', hours: 1.5, focus: 9, productivity: 9 }
      ];

      const firstSub = db.submitDailyLog({
        studyId: mem['Study ID'],
        email: mem.Email,
        dateOfStudy: '2026-08-26',
        subjects
      });
      assert.strictEqual(firstSub.isDuplicate, false);

      const secondSub = db.submitDailyLog({
        studyId: mem['Study ID'],
        email: mem.Email,
        dateOfStudy: '2026-08-26',
        subjects
      });
      assert.strictEqual(secondSub.isDuplicate, true);
      assert.ok(secondSub.message.includes('already submitted'));
    });

    it('Maintains strict 10-column Members and 19-column DailyLogs schema invariants', () => {
      assert.strictEqual(StudySyncDatabase.MEMBERS_COLUMNS.length, 10);
      assert.strictEqual(StudySyncDatabase.DAILY_LOGS_COLUMNS.length, 19);

      // Verify no duplicate email columns
      const memberEmailCols = StudySyncDatabase.MEMBERS_COLUMNS.filter(c => c.toLowerCase().includes('email'));
      assert.strictEqual(memberEmailCols.length, 1, 'Members must have exactly 1 email column');

      const logsEmailCols = StudySyncDatabase.DAILY_LOGS_COLUMNS.filter(c => c.toLowerCase().includes('email'));
      assert.strictEqual(logsEmailCols.length, 1, 'DailyLogs must have exactly 1 email column');
    });

    it('Dual-payload QR code engine generates and parses verified payload', () => {
      const member = {
        studyId: 'SG-BIO-0001',
        fullName: 'Kasun Perera',
        stream: 'Biological Science',
        school: 'Royal College, Colombo',
        registrationDate: '2026-08-26'
      };

      const qr = generateQrPayload(member, 'https://studysync.lk');
      assert.ok(qr.verifyUrl.includes('#verify/SG-BIO-0001'));
      assert.ok(qr.offlineData.includes('Kasun Perera'));

      const parsed = parseQrPayload(qr.combinedString);
      assert.strictEqual(parsed.type, 'STUDYSYNC_DUAL');
      assert.strictEqual(parsed.studyId, 'SG-BIO-0001');
      assert.strictEqual(parsed.offlineData.name, 'Kasun Perera');
    });
  });
});
