import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  PRODUCTION_BASE_URL,
  getPublicBaseUrl,
  buildRoomInviteUrl,
  buildCelebrationUrl,
  buildVerificationUrl
} from '../src/lib/urls.ts';

describe('src/lib/urls.ts', () => {
  let originalWindow;

  beforeEach(() => {
    originalWindow = global.window;
  });

  afterEach(() => {
    if (originalWindow === undefined) {
      delete global.window;
    } else {
      global.window = originalWindow;
    }
  });

  describe('getPublicBaseUrl()', () => {
    it('returns PRODUCTION_BASE_URL when window is undefined (SSR / Node.js context)', () => {
      delete global.window;
      assert.strictEqual(getPublicBaseUrl(), PRODUCTION_BASE_URL);
      assert.strictEqual(getPublicBaseUrl(), 'https://studysync-al-2026.web.app');
    });

    it('returns window.location.origin when running on localhost in browser context', () => {
      global.window = {
        location: {
          hostname: 'localhost',
          origin: 'http://localhost:3000'
        }
      };
      assert.strictEqual(getPublicBaseUrl(), 'http://localhost:3000');
    });

    it('returns window.location.origin when running on 127.0.0.1 in browser context', () => {
      global.window = {
        location: {
          hostname: '127.0.0.1',
          origin: 'http://127.0.0.1:3000'
        }
      };
      assert.strictEqual(getPublicBaseUrl(), 'http://127.0.0.1:3000');
    });

    it('returns window.location.origin when running on production or custom domain in browser context', () => {
      global.window = {
        location: {
          hostname: 'studysync-al-2026.web.app',
          origin: 'https://studysync-al-2026.web.app'
        }
      };
      assert.strictEqual(getPublicBaseUrl(), 'https://studysync-al-2026.web.app');

      global.window = {
        location: {
          hostname: 'app.studysync.lk',
          origin: 'https://app.studysync.lk'
        }
      };
      assert.strictEqual(getPublicBaseUrl(), 'https://app.studysync.lk');
    });

    it('returns PRODUCTION_BASE_URL if window exists but window.location or origin is missing', () => {
      global.window = {};
      assert.strictEqual(getPublicBaseUrl(), PRODUCTION_BASE_URL);

      global.window = { location: null };
      assert.strictEqual(getPublicBaseUrl(), PRODUCTION_BASE_URL);
    });
  });

  describe('buildRoomInviteUrl()', () => {
    it('builds canonical room invite URL with all parameters when window is undefined', () => {
      delete global.window;
      const url = buildRoomInviteUrl({
        roomId: 'colombo-library',
        hubName: 'Colombo',
        deskNumber: 3,
        subject: 'Combined Maths'
      });

      assert.strictEqual(
        url,
        'https://studysync-al-2026.web.app/rooms?room=colombo-library&hub=Colombo&desk=3&subject=Combined+Maths'
      );
    });

    it('builds room invite URL using window.location.origin in browser context', () => {
      global.window = {
        location: {
          hostname: 'localhost',
          origin: 'http://localhost:3000'
        }
      };
      const url = buildRoomInviteUrl({
        roomId: 'kandy-hub'
      });

      assert.strictEqual(url, 'http://localhost:3000/rooms?room=kandy-hub');
    });
  });

  describe('buildCelebrationUrl()', () => {
    it('builds celebration certificate URL with optional parameters', () => {
      delete global.window;
      const url = buildCelebrationUrl({
        studyId: 'SG-MATH-2601',
        name: 'Kasun Perera',
        streak: 14,
        subject: 'Combined Maths',
        stream: 'Physical Science',
        targetZScore: '2.15'
      });

      const parsed = new URL(url);
      assert.strictEqual(parsed.origin, 'https://studysync-al-2026.web.app');
      assert.strictEqual(parsed.pathname, '/celebrate');
      assert.strictEqual(parsed.searchParams.get('id'), 'SG-MATH-2601');
      assert.strictEqual(parsed.searchParams.get('name'), 'Kasun Perera');
      assert.strictEqual(parsed.searchParams.get('streak'), '14');
      assert.strictEqual(parsed.searchParams.get('subject'), 'Combined Maths');
      assert.strictEqual(parsed.searchParams.get('stream'), 'Physical Science');
      assert.strictEqual(parsed.searchParams.get('z'), '2.15');
    });
  });

  describe('buildVerificationUrl()', () => {
    it('builds verification URL for study ID', () => {
      delete global.window;
      const url = buildVerificationUrl('SG-BIO-0001');
      assert.strictEqual(url, 'https://studysync-al-2026.web.app/verify?id=SG-BIO-0001');
    });

    it('builds verification URL using local origin when in browser local dev', () => {
      global.window = {
        location: {
          hostname: '127.0.0.1',
          origin: 'http://127.0.0.1:8080'
        }
      };
      const url = buildVerificationUrl('SG-BIO-0001');
      assert.strictEqual(url, 'http://127.0.0.1:8080/verify?id=SG-BIO-0001');
    });
  });
});
