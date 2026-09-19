import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { timingSafeEqual } from '../src/lib/security/passwords.ts';

describe('Constant-Time Timing-Safe Comparison Unit Tests', () => {
  test('timingSafeEqual correctly compares matching strings', () => {
    assert.strictEqual(timingSafeEqual('abcdef123456', 'abcdef123456'), true);
    assert.strictEqual(timingSafeEqual('', ''), true);
  });

  test('timingSafeEqual detects mismatching strings of equal length', () => {
    assert.strictEqual(timingSafeEqual('abcdef123456', 'abcdef123457'), false);
  });

  test('timingSafeEqual detects mismatching strings of different lengths', () => {
    assert.strictEqual(timingSafeEqual('abcdef123456', 'abcdef1234567'), false);
    assert.strictEqual(timingSafeEqual('abcdef1234567', 'abcdef123456'), false);
    assert.strictEqual(timingSafeEqual('', 'a'), false);
  });
});
