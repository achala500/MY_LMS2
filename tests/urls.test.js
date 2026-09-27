import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  getPublicBaseUrl,
  buildRoomInviteUrl,
  buildCelebrationUrl,
  buildVerificationUrl,
  PRODUCTION_BASE_URL
} from '../src/lib/urls.ts';

describe('src/lib/urls.ts - buildCelebrationUrl & URL generator test suite', () => {
  // Store original window object if present
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

  describe('buildCelebrationUrl', () => {
    it('generates celebration URL with default production base URL when window is undefined', () => {
      delete global.window;
      const urlStr = buildCelebrationUrl({});
      assert.strictEqual(urlStr, 'https://studysync-al-2026.web.app/celebrate');
    });

    it('sets all query parameters correctly when all fields are provided', () => {
      delete global.window;
      const params = {
        studyId: 'SG-MATH-2601',
        name: 'Kasun Perera',
        streak: 14,
        subject: 'Combined Maths',
        targetZScore: '2.05',
        stream: 'Physical Science',
      };

      const urlStr = buildCelebrationUrl(params);
      const url = new URL(urlStr);

      assert.strictEqual(url.origin, 'https://studysync-al-2026.web.app');
      assert.strictEqual(url.pathname, '/celebrate');
      assert.strictEqual(url.searchParams.get('id'), 'SG-MATH-2601');
      assert.strictEqual(url.searchParams.get('name'), 'Kasun Perera');
      assert.strictEqual(url.searchParams.get('streak'), '14');
      assert.strictEqual(url.searchParams.get('subject'), 'Combined Maths');
      assert.strictEqual(url.searchParams.get('z'), '2.05');
      assert.strictEqual(url.searchParams.get('stream'), 'Physical Science');
    });

    it('handles partial parameters correctly and omits missing options', () => {
      delete global.window;
      const params = {
        studyId: 'SG-BIO-0001',
        streak: 7,
      };

      const urlStr = buildCelebrationUrl(params);
      const url = new URL(urlStr);

      assert.strictEqual(url.searchParams.get('id'), 'SG-BIO-0001');
      assert.strictEqual(url.searchParams.get('streak'), '7');
      assert.strictEqual(url.searchParams.has('name'), false);
      assert.strictEqual(url.searchParams.has('subject'), false);
      assert.strictEqual(url.searchParams.has('z'), false);
      assert.strictEqual(url.searchParams.has('stream'), false);
    });

    it('properly encodes special characters, ampersands, spaces, and Sinhala/Tamil Unicode in parameters', () => {
      delete global.window;
      const params = {
        name: 'Kasun & Nimali <Student>',
        subject: 'Combined Maths & Physics',
        stream: 'ජීව විද්‍යාව', // Sinhala Unicode for Biological Science
      };

      const urlStr = buildCelebrationUrl(params);
      const url = new URL(urlStr);

      assert.strictEqual(url.searchParams.get('name'), 'Kasun & Nimali <Student>');
      assert.strictEqual(url.searchParams.get('subject'), 'Combined Maths & Physics');
      assert.strictEqual(url.searchParams.get('stream'), 'ජීව විද්‍යාව');
    });

    it('handles boundary and empty string parameters correctly', () => {
      delete global.window;
      const params = {
        studyId: '',
        name: '',
        streak: 0,
        subject: '',
      };

      const urlStr = buildCelebrationUrl(params);
      const url = new URL(urlStr);

      assert.strictEqual(url.searchParams.has('id'), false);
      assert.strictEqual(url.searchParams.has('name'), false);
      assert.strictEqual(url.searchParams.has('streak'), false);
      assert.strictEqual(url.searchParams.has('subject'), false);
      assert.strictEqual(urlStr, 'https://studysync-al-2026.web.app/celebrate');
    });

    it('uses window.location.origin when executed in browser environment on localhost', () => {
      global.window = {
        location: {
          origin: 'http://localhost:3000',
          hostname: 'localhost',
        },
      };

      const urlStr = buildCelebrationUrl({ studyId: 'SG-MATH-001' });
      assert.strictEqual(urlStr, 'http://localhost:3000/celebrate?id=SG-MATH-001');
    });

    it('uses window.location.origin when executed in browser environment on custom domain', () => {
      global.window = {
        location: {
          origin: 'https://staging.studysync.lk',
          hostname: 'staging.studysync.lk',
        },
      };

      const urlStr = buildCelebrationUrl({ studyId: 'SG-BIO-005', name: 'Amaya' });
      assert.strictEqual(urlStr, 'https://staging.studysync.lk/celebrate?id=SG-BIO-005&name=Amaya');
    });
  });

  describe('getPublicBaseUrl', () => {
    it('returns PRODUCTION_BASE_URL when window is undefined', () => {
      delete global.window;
      assert.strictEqual(getPublicBaseUrl(), PRODUCTION_BASE_URL);
    });

    it('returns window.location.origin when window is defined', () => {
      global.window = {
        location: {
          origin: 'https://custom-app.com',
          hostname: 'custom-app.com',
        },
      };
      assert.strictEqual(getPublicBaseUrl(), 'https://custom-app.com');
    });
  });

  describe('buildRoomInviteUrl', () => {
    it('builds room invite URL with required and optional parameters', () => {
      delete global.window;
      const urlStr = buildRoomInviteUrl({
        roomId: 'colombo-library',
        hubName: 'Colombo',
        deskNumber: 3,
        subject: 'Physics',
      });

      const url = new URL(urlStr);
      assert.strictEqual(url.pathname, '/rooms');
      assert.strictEqual(url.searchParams.get('room'), 'colombo-library');
      assert.strictEqual(url.searchParams.get('hub'), 'Colombo');
      assert.strictEqual(url.searchParams.get('desk'), '3');
      assert.strictEqual(url.searchParams.get('subject'), 'Physics');
    });
  });

  describe('buildVerificationUrl', () => {
    it('builds official verification URL with studyId', () => {
      delete global.window;
      const urlStr = buildVerificationUrl('SG-BIO-0001');
      const url = new URL(urlStr);

      assert.strictEqual(url.pathname, '/verify');
      assert.strictEqual(url.searchParams.get('id'), 'SG-BIO-0001');
    });
  });
});
