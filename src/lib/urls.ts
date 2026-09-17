/**
 * StudySync Canonical URL & Deep-Link Generator
 * Generates professional, clean, branded URLs for rooms, student milestones,
 * celebration certificates, and candidate credentials.
 */

export const PRODUCTION_BASE_URL = 'https://studysync-al-2026.web.app';

export function getPublicBaseUrl(): string {
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    // In local development or staging, return origin; otherwise production canonical
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return window.location.origin;
    }
    return window.location.origin;
  }
  return PRODUCTION_BASE_URL;
}

/**
 * Generate a professional invite link for a Study Room & Desk
 * Example: https://studysync-al-2026.web.app/rooms?room=colombo-library&hub=Colombo&desk=3
 */
export function buildRoomInviteUrl(params: {
  roomId: string;
  hubName?: string;
  deskNumber?: number;
  subject?: string;
}): string {
  const base = getPublicBaseUrl();
  const url = new URL('/rooms', base);
  url.searchParams.set('room', params.roomId);
  if (params.hubName) {
    url.searchParams.set('hub', params.hubName);
  }
  if (params.deskNumber) {
    url.searchParams.set('desk', String(params.deskNumber));
  }
  if (params.subject) {
    url.searchParams.set('subject', params.subject);
  }
  return url.toString();
}

/**
 * Generate a professional celebration milestone certificate URL
 * Example: https://studysync-al-2026.web.app/celebrate?id=SG-MATH-2601&streak=14&subject=Combined+Maths
 */
export function buildCelebrationUrl(params: {
  studyId?: string;
  name?: string;
  streak?: number;
  subject?: string;
  targetZScore?: string;
  stream?: string;
}): string {
  const base = getPublicBaseUrl();
  const url = new URL('/celebrate', base);
  if (params.studyId) url.searchParams.set('id', params.studyId);
  if (params.streak) url.searchParams.set('streak', String(params.streak));
  if (params.subject) url.searchParams.set('subject', params.subject);
  if (params.stream) url.searchParams.set('stream', params.stream);
  if (params.targetZScore) url.searchParams.set('z', params.targetZScore);
  if (params.name) url.searchParams.set('name', params.name);
  return url.toString();
}

/**
 * Generate an official cryptographic verification URL
 * Example: https://studysync-al-2026.web.app/verify?id=SG-MATH-2601
 */
export function buildVerificationUrl(studyId: string): string {
  const base = getPublicBaseUrl();
  const url = new URL('/verify', base);
  url.searchParams.set('id', studyId);
  return url.toString();
}
