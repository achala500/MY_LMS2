import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  PRODUCTION_BASE_URL,
  getPublicBaseUrl,
  buildRoomInviteUrl,
  buildCelebrationUrl,
  buildVerificationUrl
} from '../src/lib/urls.ts';

describe('src/lib/urls.ts Utility Unit Tests', () => {

  describe('buildRoomInviteUrl', () => {
    it('should build a valid invite URL with only mandatory roomId', () => {
      const result = buildRoomInviteUrl({ roomId: 'colombo-library' });
      const parsed = new URL(result);

      assert.strictEqual(parsed.pathname, '/rooms');
      assert.strictEqual(parsed.searchParams.get('room'), 'colombo-library');
      assert.strictEqual(parsed.searchParams.has('hub'), false);
      assert.strictEqual(parsed.searchParams.has('desk'), false);
      assert.strictEqual(parsed.searchParams.has('subject'), false);
      assert.strictEqual(result, `${PRODUCTION_BASE_URL}/rooms?room=colombo-library`);
    });

    it('should build a valid invite URL with all parameters provided', () => {
      const result = buildRoomInviteUrl({
        roomId: 'kandy-hub-01',
        hubName: 'Kandy Study Hub',
        deskNumber: 12,
        subject: 'Combined Maths'
      });
      const parsed = new URL(result);

      assert.strictEqual(parsed.pathname, '/rooms');
      assert.strictEqual(parsed.searchParams.get('room'), 'kandy-hub-01');
      assert.strictEqual(parsed.searchParams.get('hub'), 'Kandy Study Hub');
      assert.strictEqual(parsed.searchParams.get('desk'), '12');
      assert.strictEqual(parsed.searchParams.get('subject'), 'Combined Maths');
    });

    it('should include hubName when provided without deskNumber or subject', () => {
      const result = buildRoomInviteUrl({
        roomId: 'galle-library',
        hubName: 'Galle Hub'
      });
      const parsed = new URL(result);

      assert.strictEqual(parsed.searchParams.get('room'), 'galle-library');
      assert.strictEqual(parsed.searchParams.get('hub'), 'Galle Hub');
      assert.strictEqual(parsed.searchParams.has('desk'), false);
      assert.strictEqual(parsed.searchParams.has('subject'), false);
    });

    it('should include deskNumber when provided without hubName or subject', () => {
      const result = buildRoomInviteUrl({
        roomId: 'room-404',
        deskNumber: 7
      });
      const parsed = new URL(result);

      assert.strictEqual(parsed.searchParams.get('room'), 'room-404');
      assert.strictEqual(parsed.searchParams.get('desk'), '7');
      assert.strictEqual(parsed.searchParams.has('hub'), false);
      assert.strictEqual(parsed.searchParams.has('subject'), false);
    });

    it('should include subject when provided without hubName or deskNumber', () => {
      const result = buildRoomInviteUrl({
        roomId: 'bio-squad',
        subject: 'Biology'
      });
      const parsed = new URL(result);

      assert.strictEqual(parsed.searchParams.get('room'), 'bio-squad');
      assert.strictEqual(parsed.searchParams.get('subject'), 'Biology');
      assert.strictEqual(parsed.searchParams.has('hub'), false);
      assert.strictEqual(parsed.searchParams.has('desk'), false);
    });

    it('should properly encode special characters and unicode in query parameters', () => {
      const result = buildRoomInviteUrl({
        roomId: 'special-room#1',
        hubName: 'Colombo & Gampaha (Hub)',
        deskNumber: 5,
        subject: 'Physics & Chemistry'
      });

      const parsed = new URL(result);

      assert.strictEqual(parsed.searchParams.get('room'), 'special-room#1');
      assert.strictEqual(parsed.searchParams.get('hub'), 'Colombo & Gampaha (Hub)');
      assert.strictEqual(parsed.searchParams.get('subject'), 'Physics & Chemistry');
      // Verify raw URL contains encoded ampersands
      assert.ok(result.includes('hub=Colombo+%26+Gampaha+%28Hub%29') || result.includes('hub=Colombo%20%26%20Gampaha%20%28Hub%29'));
    });

    it('should adapt base URL when window.location is defined (e.g. localhost)', () => {
      const originalWindow = global.window;

      try {
        // Mock browser environment
        global.window = {
          location: {
            origin: 'http://localhost:3000',
            hostname: 'localhost'
          }
        };

        const result = buildRoomInviteUrl({ roomId: 'local-room' });
        assert.strictEqual(result, 'http://localhost:3000/rooms?room=local-room');
      } finally {
        if (originalWindow === undefined) {
          delete global.window;
        } else {
          global.window = originalWindow;
        }
      }
    });
  });

  describe('getPublicBaseUrl', () => {
    it('should default to PRODUCTION_BASE_URL in server/Node environment', () => {
      const originalWindow = global.window;
      try {
        delete global.window;
        assert.strictEqual(getPublicBaseUrl(), PRODUCTION_BASE_URL);
      } finally {
        if (originalWindow !== undefined) {
          global.window = originalWindow;
        }
      }
    });

    it('should return window.location.origin when running in browser environment', () => {
      const originalWindow = global.window;
      try {
        global.window = {
          location: {
            origin: 'https://staging.studysync.lk',
            hostname: 'staging.studysync.lk'
          }
        };
        assert.strictEqual(getPublicBaseUrl(), 'https://staging.studysync.lk');
      } finally {
        if (originalWindow === undefined) {
          delete global.window;
        } else {
          global.window = originalWindow;
        }
      }
    });
  });

  describe('buildCelebrationUrl', () => {
    it('should build celebration URL with all optional fields', () => {
      const result = buildCelebrationUrl({
        studyId: 'SG-MATH-2601',
        name: 'Kasun Perera',
        streak: 14,
        subject: 'Combined Maths',
        targetZScore: '2.05',
        stream: 'Physical Science'
      });

      const parsed = new URL(result);
      assert.strictEqual(parsed.pathname, '/celebrate');
      assert.strictEqual(parsed.searchParams.get('id'), 'SG-MATH-2601');
      assert.strictEqual(parsed.searchParams.get('name'), 'Kasun Perera');
      assert.strictEqual(parsed.searchParams.get('streak'), '14');
      assert.strictEqual(parsed.searchParams.get('subject'), 'Combined Maths');
      assert.strictEqual(parsed.searchParams.get('z'), '2.05');
      assert.strictEqual(parsed.searchParams.get('stream'), 'Physical Science');
    });

    it('should build celebration URL with empty/omitted parameters', () => {
      const result = buildCelebrationUrl({});
      const parsed = new URL(result);
      assert.strictEqual(parsed.pathname, '/celebrate');
      assert.strictEqual(parsed.search, '');
    });
  });

  describe('buildVerificationUrl', () => {
    it('should build official verification URL for a given studyId', () => {
      const result = buildVerificationUrl('SG-BIO-0001');
      const parsed = new URL(result);

      assert.strictEqual(parsed.pathname, '/verify');
      assert.strictEqual(parsed.searchParams.get('id'), 'SG-BIO-0001');
      assert.strictEqual(result, `${PRODUCTION_BASE_URL}/verify?id=SG-BIO-0001`);
    });
  });

});
