/**
 * Unit Test Suite for src/lib/urls.ts
 *
 * Tests:
 * 1. buildVerificationUrl happy path & query parameter formatting
 * 2. buildVerificationUrl special character, unicode, & edge case encoding
 * 3. Environment sensitivity & window location mocking (SSR vs localhost vs 127.0.0.1 vs custom origin)
 * 4. URL validity & structure parsing (pathname, searchParams)
 * 5. Related URL utilities (getPublicBaseUrl, buildRoomInviteUrl, buildCelebrationUrl)
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  PRODUCTION_BASE_URL,
  getPublicBaseUrl,
  buildVerificationUrl,
  buildRoomInviteUrl,
  buildCelebrationUrl,
} from '../src/lib/urls.ts';

describe('Canonical URL & Deep-Link Utilities (src/lib/urls.ts)', () => {
  const originalWindow = global.window;

  afterEach(() => {
    if (originalWindow === undefined) {
      delete global.window;
    } else {
      global.window = originalWindow;
    }
  });

  // =========================================================================
  // 1. buildVerificationUrl Core Functionality & Output Formatting
  // =========================================================================
  describe('buildVerificationUrl Core Functionality', () => {
    it('generates a valid verification URL string with default production base URL', () => {
      delete global.window;
      const urlString = buildVerificationUrl('SG-MATH-2601');
      assert.strictEqual(
        urlString,
        'https://studysync-al-2026.web.app/verify?id=SG-MATH-2601'
      );
    });

    it('generates correct verification URL for Bio stream Study ID', () => {
      delete global.window;
      const urlString = buildVerificationUrl('SG-BIO-0001');
      assert.strictEqual(
        urlString,
        'https://studysync-al-2026.web.app/verify?id=SG-BIO-0001'
      );
    });

    it('returns a string that can be successfully parsed by native URL constructor', () => {
      delete global.window;
      const urlString = buildVerificationUrl('SG-MATH-2601');
      const parsed = new URL(urlString);

      assert.strictEqual(parsed.origin, PRODUCTION_BASE_URL);
      assert.strictEqual(parsed.pathname, '/verify');
      assert.strictEqual(parsed.searchParams.get('id'), 'SG-MATH-2601');
    });
  });

  // =========================================================================
  // 2. Query Parameter Encoding & Edge Cases
  // =========================================================================
  describe('buildVerificationUrl Special Characters & Query Encoding', () => {
    it('properly encodes special characters like slashes, ampersands, and hashes in Study ID', () => {
      delete global.window;
      const studyIdWithSpecials = 'SG-MATH/2601?admin=true#hash&foo=bar';
      const urlString = buildVerificationUrl(studyIdWithSpecials);
      const parsed = new URL(urlString);

      assert.strictEqual(parsed.pathname, '/verify');
      assert.strictEqual(parsed.searchParams.get('id'), studyIdWithSpecials);
      // Ensure the query injection attempt was safely encoded into the 'id' parameter
      assert.strictEqual(parsed.searchParams.get('admin'), null);
      assert.strictEqual(parsed.searchParams.get('foo'), null);
    });

    it('properly encodes spaces in Study ID', () => {
      delete global.window;
      const studyIdWithSpace = 'SG BIO 0001';
      const urlString = buildVerificationUrl(studyIdWithSpace);
      const parsed = new URL(urlString);

      assert.strictEqual(parsed.searchParams.get('id'), 'SG BIO 0001');
      assert.ok(urlString.includes('id=SG+BIO+0001') || urlString.includes('id=SG%20BIO%200001'));
    });

    it('properly handles Sinhala and Tamil Unicode characters in Study ID', () => {
      delete global.window;
      const unicodeStudyId = 'SG-MATH-කොළඹ-2601';
      const urlString = buildVerificationUrl(unicodeStudyId);
      const parsed = new URL(urlString);

      assert.strictEqual(parsed.searchParams.get('id'), 'SG-MATH-කොළඹ-2601');
    });

    it('handles empty string studyId gracefully without crashing', () => {
      delete global.window;
      const urlString = buildVerificationUrl('');
      const parsed = new URL(urlString);

      assert.strictEqual(parsed.pathname, '/verify');
      assert.strictEqual(parsed.searchParams.get('id'), '');
    });
  });

  // =========================================================================
  // 3. Environment Sensitivity & Window Origin Mocking
  // =========================================================================
  describe('Environment Sensitivity & Window Origin Handling', () => {
    it('returns PRODUCTION_BASE_URL when window is undefined (SSR mode)', () => {
      delete global.window;
      assert.strictEqual(getPublicBaseUrl(), PRODUCTION_BASE_URL);
      assert.strictEqual(
        buildVerificationUrl('SG-MATH-2601'),
        'https://studysync-al-2026.web.app/verify?id=SG-MATH-2601'
      );
    });

    it('uses window.location.origin when running on localhost', () => {
      global.window = {
        location: {
          hostname: 'localhost',
          origin: 'http://localhost:3000',
        },
      };

      assert.strictEqual(getPublicBaseUrl(), 'http://localhost:3000');
      assert.strictEqual(
        buildVerificationUrl('SG-MATH-2601'),
        'http://localhost:3000/verify?id=SG-MATH-2601'
      );
    });

    it('uses window.location.origin when running on 127.0.0.1', () => {
      global.window = {
        location: {
          hostname: '127.0.0.1',
          origin: 'http://127.0.0.1:8080',
        },
      };

      assert.strictEqual(getPublicBaseUrl(), 'http://127.0.0.1:8080');
      assert.strictEqual(
        buildVerificationUrl('SG-BIO-0002'),
        'http://127.0.0.1:8080/verify?id=SG-BIO-0002'
      );
    });

    it('uses window.location.origin when running on a custom domain / origin', () => {
      global.window = {
        location: {
          hostname: 'studysync.lk',
          origin: 'https://studysync.lk',
        },
      };

      assert.strictEqual(getPublicBaseUrl(), 'https://studysync.lk');
      assert.strictEqual(
        buildVerificationUrl('SG-MATH-2601'),
        'https://studysync.lk/verify?id=SG-MATH-2601'
      );
    });
  });

  // =========================================================================
  // 4. Related URL Helper Utilities Coverage
  // =========================================================================
  describe('Related URL Helper Utilities', () => {
    it('buildRoomInviteUrl constructs /rooms URL with mandatory and optional parameters', () => {
      delete global.window;
      const urlString = buildRoomInviteUrl({
        roomId: 'colombo-library',
        hubName: 'Colombo Central',
        deskNumber: 3,
        subject: 'Combined Maths',
      });

      const parsed = new URL(urlString);
      assert.strictEqual(parsed.pathname, '/rooms');
      assert.strictEqual(parsed.searchParams.get('room'), 'colombo-library');
      assert.strictEqual(parsed.searchParams.get('hub'), 'Colombo Central');
      assert.strictEqual(parsed.searchParams.get('desk'), '3');
      assert.strictEqual(parsed.searchParams.get('subject'), 'Combined Maths');
    });

    it('buildRoomInviteUrl omits optional parameters when not supplied', () => {
      delete global.window;
      const urlString = buildRoomInviteUrl({ roomId: 'kandy-desk' });
      const parsed = new URL(urlString);

      assert.strictEqual(parsed.pathname, '/rooms');
      assert.strictEqual(parsed.searchParams.get('room'), 'kandy-desk');
      assert.strictEqual(parsed.searchParams.get('hub'), null);
      assert.strictEqual(parsed.searchParams.get('desk'), null);
      assert.strictEqual(parsed.searchParams.get('subject'), null);
    });

    it('buildCelebrationUrl constructs /celebrate URL with all provided parameters', () => {
      delete global.window;
      const urlString = buildCelebrationUrl({
        studyId: 'SG-MATH-2601',
        name: 'Kasun Perera',
        streak: 14,
        subject: 'Combined Maths',
        targetZScore: '2.05',
        stream: 'Physical Science',
      });

      const parsed = new URL(urlString);
      assert.strictEqual(parsed.pathname, '/celebrate');
      assert.strictEqual(parsed.searchParams.get('id'), 'SG-MATH-2601');
      assert.strictEqual(parsed.searchParams.get('name'), 'Kasun Perera');
      assert.strictEqual(parsed.searchParams.get('streak'), '14');
      assert.strictEqual(parsed.searchParams.get('subject'), 'Combined Maths');
      assert.strictEqual(parsed.searchParams.get('z'), '2.05');
      assert.strictEqual(parsed.searchParams.get('stream'), 'Physical Science');
    });

    it('buildCelebrationUrl handles missing optional parameters without adding empty query keys', () => {
      delete global.window;
      const urlString = buildCelebrationUrl({ studyId: 'SG-BIO-0005', streak: 7 });
      const parsed = new URL(urlString);

      assert.strictEqual(parsed.pathname, '/celebrate');
      assert.strictEqual(parsed.searchParams.get('id'), 'SG-BIO-0005');
      assert.strictEqual(parsed.searchParams.get('streak'), '7');
      assert.strictEqual(parsed.searchParams.get('name'), null);
      assert.strictEqual(parsed.searchParams.get('subject'), null);
      assert.strictEqual(parsed.searchParams.get('z'), null);
      assert.strictEqual(parsed.searchParams.get('stream'), null);
    });
  });
});
