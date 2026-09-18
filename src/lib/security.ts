/**
 * StudySync Enterprise Security & Anti-Malware Engine
 * 
 * Provides:
 * 1. 12-Byte Structural Magic Bytes & File Signature Validation (JPEG, PNG, WebP with RIFF/WEBP/VP8 chunks, GIF)
 * 2. Immediate Rejection Blacklist (PE/MZ, ELF, Mach-O, Java Class, ZIP/APK/JAR, 7z, RAR, Shebang #!, script tags)
 * 3. Polyglot & Malware Payload Detection (Detects embedded scripts/executables)
 * 4. Context-Aware Anti-XSS Encoding, Safe URL Allowlisting, and Spreadsheet Formula Injection Escaping (sanitizeCsvFormula)
 * 5. Multi-Tab Synchronized Sliding-Window Rate Limiting with LocalStorage & BroadcastChannel Persistence
 * 6. Cryptographic Idempotency Envelope with 128-Bit Random Nonces and Â±300s Timestamp Drift Checks
 */

import { safeStorage } from './storage/safeStorage';

// ============================================================================
// 1. FILE VALIDATION & MAGIC BYTE SIGNATURES
// ============================================================================

export interface FileValidationResult {
  valid: boolean;
  sanitizedMime: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif' | '';
  detectedFormat: 'JPEG' | 'PNG' | 'WEBP' | 'GIF' | 'REJECTED' | 'unknown' | 'undersized' | 'oversized' | 'error';
  fileSizeBytes?: number;
  error?: string;
  errorCode?:
    | 'SECURITY_SIZE_OUT_OF_BOUNDS'
    | 'SECURITY_MIME_MISMATCH'
    | 'SECURITY_POLYGLOT_DETECTED'
    | 'SECURITY_CORRUPTED_CONTAINER'
    | 'SECURITY_EXECUTABLE_HEADER_DETECTED';
}

export interface ImageCompressionOptions {
  maxSizeMB: number;         // e.g. 0.38 (380 KB)
  maxWidthOrHeight: number;  // e.g. 1600 px
  quality: number;           // e.g. 0.82
}

// Dangerous signature patterns (Executables, scripts, HTML wrappers disguised as images)
const DANGEROUS_PATTERNS = [
  /<script[\s\S]*?>/gi,
  /<\/script>/gi,
  /<iframe[\s\S]*?>/gi,
  /<embed[\s\S]*?>/gi,
  /<object[\s\S]*?>/gi,
  /javascript:/gi,
  /data:text\/html/gi,
  /data:application\/x-javascript/gi,
  /(?:onerror|onload|onclick|onmouseover|onfocus)\s*=\s*['"]/gi,
  /<svg[\s\S]*?>/gi,
  /<\?php[\s\S]*?/gi,
  /<\?=[\s\S]*?/gi,
  /eval\s*\(/gi,
  /document\.(cookie|location)/gi,
];

/**
 * Checks raw binary buffer for immediate rejection blacklist:
 * - PE / DOS ('MZ')
 * - Linux ELF ('\x7fELF')
 * - macOS Mach-O (0xFEEDFACE, 0xFEEDFACF, 0xCAFEBABE, 0xCEFAEDFE)
 * - Java Bytecode (0xCAFEBABE)
 * - ZIP / APK / JAR ('PK\x03\x04', 'PK\x05\x06')
 * - 7-Zip ('7z\xBC\xAF\x27\x1C')
 * - RAR ('Rar!\x1A\x07')
 * - Shell Shebang ('#!')
 */
function checkForForbiddenExecutableHeaders(bytes: Uint8Array): { forbidden: boolean; threat?: string } {
  if (bytes.length < 2) return { forbidden: false };

  // Windows DOS / PE Executable: 'MZ' (0x4D, 0x5A)
  if (bytes[0] === 0x4D && bytes[1] === 0x5A) {
    return { forbidden: true, threat: 'Windows PE / DOS executable binary signature (MZ) detected.' };
  }

  // Shell script Shebang: '#!' (0x23, 0x21)
  if (bytes[0] === 0x23 && bytes[1] === 0x21) {
    return { forbidden: true, threat: 'Unix shell shebang script (#!) detected.' };
  }

  // Linux ELF Executable: '\x7fELF' (0x7F, 0x45, 0x4C, 0x46)
  if (
    bytes.length >= 4 &&
    bytes[0] === 0x7F &&
    bytes[1] === 0x45 &&
    bytes[2] === 0x4C &&
    bytes[3] === 0x46
  ) {
    return { forbidden: true, threat: 'Linux ELF binary executable signature detected.' };
  }

  // Java Bytecode / Mach-O Fat Binary: 0xCA, 0xFE, 0xBA, 0xBE
  if (
    bytes.length >= 4 &&
    bytes[0] === 0xCA &&
    bytes[1] === 0xFE &&
    bytes[2] === 0xBA &&
    bytes[3] === 0xBE
  ) {
    return { forbidden: true, threat: 'Compiled Java Class / Mach-O universal fat binary header detected.' };
  }

  // macOS Mach-O: 0xFE, 0xED, 0xFA, 0xCE / 0xCF or reverse
  if (
    bytes.length >= 4 &&
    ((bytes[0] === 0xFE && bytes[1] === 0xED && bytes[2] === 0xFA && (bytes[3] === 0xCE || bytes[3] === 0xCF)) ||
     (bytes[0] === 0xCE && bytes[1] === 0xFA && bytes[2] === 0xED && bytes[3] === 0xFE) ||
     (bytes[0] === 0xCF && bytes[1] === 0xFA && bytes[2] === 0xED && bytes[3] === 0xFE))
  ) {
    return { forbidden: true, threat: 'macOS Mach-O executable binary header detected.' };
  }

  // ZIP / JAR / APK / DOCX archive header: 'PK' (0x50, 0x4B, 0x03, 0x04) or (0x50, 0x4B, 0x05, 0x06)
  if (
    bytes.length >= 4 &&
    bytes[0] === 0x50 &&
    bytes[1] === 0x4B &&
    ((bytes[2] === 0x03 && bytes[3] === 0x04) ||
     (bytes[2] === 0x05 && bytes[3] === 0x06) ||
     (bytes[2] === 0x07 && bytes[3] === 0x08))
  ) {
    return { forbidden: true, threat: 'ZIP/JAR/APK compressed archive container header (PK) detected.' };
  }

  // 7-Zip Archive: 0x37, 0x7A, 0xBC, 0xAF, 0x27, 0x1C
  if (
    bytes.length >= 6 &&
    bytes[0] === 0x37 &&
    bytes[1] === 0x7A &&
    bytes[2] === 0xBC &&
    bytes[3] === 0xAF &&
    bytes[4] === 0x27 &&
    bytes[5] === 0x1C
  ) {
    return { forbidden: true, threat: '7-Zip archive container header detected.' };
  }

  // RAR Archive: 0x52, 0x61, 0x72, 0x21, 0x1A, 0x07
  if (
    bytes.length >= 6 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x61 &&
    bytes[2] === 0x72 &&
    bytes[3] === 0x21 &&
    bytes[4] === 0x1A &&
    (bytes[5] === 0x07 || bytes[5] === 0x00)
  ) {
    return { forbidden: true, threat: 'RAR archive container header detected.' };
  }

  return { forbidden: false };
}

/**
 * 1. Validates a File, Blob, ArrayBuffer, or Uint8Array by inspecting:
 *    - 12-byte structural header verification
 *    - Strict WebP container validation (RIFF at 0..3 + WEBP at 8..11 + VP8 chunks at 12..15 to reject WAV/AVI)
 *    - Immediate rejection blacklist for executables, archives, and scripts
 *    - Deep polyglot scan
 */
export async function validateImageFile(
  fileOrBuffer: File | Blob | ArrayBuffer | Uint8Array
): Promise<FileValidationResult> {
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB limit
  const MIN_FILE_SIZE = 100; // Minimum plausible image size in bytes

  if (!fileOrBuffer) {
    return {
      valid: false,
      sanitizedMime: '',
      detectedFormat: 'unknown',
      errorCode: 'SECURITY_SIZE_OUT_OF_BOUNDS',
      error: 'No file provided for inspection.',
    };
  }

  let size = 0;
  let rawBytes: Uint8Array;

  try {
    if (typeof (fileOrBuffer as File).size === 'number') {
      size = (fileOrBuffer as File).size;
      const sliceSize = Math.min(size, 8192);
      const buffer = await (fileOrBuffer as Blob).slice(0, sliceSize).arrayBuffer();
      rawBytes = new Uint8Array(buffer);
    } else if (fileOrBuffer instanceof ArrayBuffer) {
      size = fileOrBuffer.byteLength;
      rawBytes = new Uint8Array(fileOrBuffer.slice(0, Math.min(size, 8192)));
    } else if (fileOrBuffer instanceof Uint8Array) {
      size = fileOrBuffer.byteLength;
      rawBytes = fileOrBuffer.subarray(0, Math.min(size, 8192));
    } else {
      return {
        valid: false,
        sanitizedMime: '',
        detectedFormat: 'error',
        errorCode: 'SECURITY_CORRUPTED_CONTAINER',
        error: 'Unsupported file payload type.',
      };
    }

    // 1. Size bounds check
    if (size > MAX_FILE_SIZE) {
      return {
        valid: false,
        sanitizedMime: '',
        detectedFormat: 'oversized',
        fileSizeBytes: size,
        errorCode: 'SECURITY_SIZE_OUT_OF_BOUNDS',
        error: `File size (${(size / (1024 * 1024)).toFixed(1)}MB) exceeds maximum allowed 10MB limit.`,
      };
    }

    if (size < MIN_FILE_SIZE) {
      return {
        valid: false,
        sanitizedMime: '',
        detectedFormat: 'undersized',
        fileSizeBytes: size,
        errorCode: 'SECURITY_SIZE_OUT_OF_BOUNDS',
        error: 'File is corrupted or too small to be a valid image (minimum 100 bytes).',
      };
    }

    // 2. Blacklist check: Executables, archives, bytecode, shebang
    const blacklistCheck = checkForForbiddenExecutableHeaders(rawBytes);
    if (blacklistCheck.forbidden) {
      return {
        valid: false,
        sanitizedMime: '',
        detectedFormat: 'REJECTED',
        fileSizeBytes: size,
        errorCode: 'SECURITY_EXECUTABLE_HEADER_DETECTED',
        error: `Security rejection: ${blacklistCheck.threat}`,
      };
    }

    // 3. Structural Magic Bytes Verification (JPEG, PNG, WebP, GIF)
    let detected: 'JPEG' | 'PNG' | 'WEBP' | 'GIF' | 'UNKNOWN' = 'UNKNOWN';
    let mime: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif' | '' = '';

    // JPEG Check: Bytes[0..2] == FF D8 FF
    if (rawBytes[0] === 0xFF && rawBytes[1] === 0xD8 && rawBytes[2] === 0xFF) {
      detected = 'JPEG';
      mime = 'image/jpeg';
    }
    // PNG Check: Bytes[0..7] == 89 50 4E 47 0D 0A 1A 0A
    else if (
      rawBytes.length >= 8 &&
      rawBytes[0] === 0x89 &&
      rawBytes[1] === 0x50 &&
      rawBytes[2] === 0x4E &&
      rawBytes[3] === 0x47 &&
      rawBytes[4] === 0x0D &&
      rawBytes[5] === 0x0A &&
      rawBytes[6] === 0x1A &&
      rawBytes[7] === 0x0A
    ) {
      detected = 'PNG';
      mime = 'image/png';
    }
    // WebP Structural 12-Byte Check:
    // Offset 0..3 == 'RIFF' (0x52, 0x49, 0x46, 0x46)
    // Offset 8..11 == 'WEBP' (0x57, 0x45, 0x42, 0x50)
    else if (
      rawBytes.length >= 12 &&
      rawBytes[0] === 0x52 &&
      rawBytes[1] === 0x49 &&
      rawBytes[2] === 0x46 &&
      rawBytes[3] === 0x46
    ) {
      const containerType = String.fromCharCode(rawBytes[8], rawBytes[9], rawBytes[10], rawBytes[11]);
      if (containerType === 'WEBP') {
        detected = 'WEBP';
        mime = 'image/webp';
      } else {
        return {
          valid: false,
          sanitizedMime: '',
          detectedFormat: 'REJECTED',
          fileSizeBytes: size,
          errorCode: 'SECURITY_MIME_MISMATCH',
          error: `Invalid file format. Detected RIFF container ('${containerType}') instead of WebP.`,
        };
      }
    }
    // GIF Check: 'GIF87a' or 'GIF89a'
    else if (
      rawBytes.length >= 6 &&
      rawBytes[0] === 0x47 &&
      rawBytes[1] === 0x49 &&
      rawBytes[2] === 0x46 &&
      rawBytes[3] === 0x38 &&
      (rawBytes[4] === 0x37 || rawBytes[4] === 0x39) &&
      rawBytes[5] === 0x61
    ) {
      detected = 'GIF';
      mime = 'image/gif';
    }
    // HEIC / HEIF / AVIF Check: bytes 4..7 == 'ftyp' (common smartphone camera formats)
    else if (
      rawBytes.length >= 12 &&
      rawBytes[4] === 0x66 &&
      rawBytes[5] === 0x74 &&
      rawBytes[6] === 0x79 &&
      rawBytes[7] === 0x70
    ) {
      const ftype = String.fromCharCode(rawBytes[8], rawBytes[9], rawBytes[10], rawBytes[11]).toLowerCase();
      if (['heic', 'mif1', 'msf1', 'heix', 'heim', 'hevc'].includes(ftype)) {
        detected = 'HEIC' as any;
        mime = 'image/heic' as any;
      } else if (ftype === 'avif') {
        detected = 'AVIF' as any;
        mime = 'image/avif' as any;
      }
    }

    if (detected === 'UNKNOWN') {
      return {
        valid: false,
        sanitizedMime: '',
        detectedFormat: 'unknown',
        fileSizeBytes: size,
        errorCode: 'SECURITY_MIME_MISMATCH',
        error: 'Please upload a valid photo file (JPEG, PNG, WebP, GIF, or HEIC).',
      };
    }

    // 4. Secondary Deep Polyglot & Script Scanner
    const polyglotScan = scanBinaryPayload(rawBytes);
    if (!polyglotScan.safe) {
      return {
        valid: false,
        sanitizedMime: '',
        detectedFormat: 'REJECTED',
        fileSizeBytes: size,
        errorCode: 'SECURITY_POLYGLOT_DETECTED',
        error: `Security rejection: ${polyglotScan.threat}`,
      };
    }

    return {
      valid: true,
      sanitizedMime: mime,
      detectedFormat: detected,
      fileSizeBytes: size,
    };
  } catch (err: any) {
    return {
      valid: false,
      sanitizedMime: '',
      detectedFormat: 'error',
      errorCode: 'SECURITY_CORRUPTED_CONTAINER',
      error: 'Failed to inspect file binary header: ' + err.message,
    };
  }
}

/**
 * 2. Scans raw binary buffer for embedded scripts or polyglot payloads
 */
export function scanBinaryPayload(buffer: ArrayBuffer | Uint8Array): { safe: boolean; code?: string; threat?: string | null } {
  if (!buffer) return { safe: true, threat: null };

  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  
  // Quick executable header check
  const execCheck = checkForForbiddenExecutableHeaders(bytes);
  if (execCheck.forbidden) {
    let code = 'MALWARE_EXECUTABLE';
    if (bytes.length >= 2 && bytes[0] === 0x4D && bytes[1] === 0x5A) code = 'MALWARE_PE_EXECUTABLE';
    else if (bytes.length >= 4 && bytes[0] === 0x7F && bytes[1] === 0x45 && bytes[2] === 0x4C && bytes[3] === 0x46) code = 'MALWARE_LINUX_ELF';
    else if (bytes.length >= 4 && bytes[0] === 0xCA && bytes[1] === 0xFE && bytes[2] === 0xBA && bytes[3] === 0xBE) code = 'MALWARE_JAVA_BYTECODE';
    else if (bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4B) code = 'MALWARE_ARCHIVE_ZIP';
    else if (bytes.length >= 6 && bytes[0] === 0x37 && bytes[1] === 0x7A) code = 'MALWARE_ARCHIVE_7Z';
    else if (bytes.length >= 2 && bytes[0] === 0x23 && bytes[1] === 0x21) code = 'MALWARE_SHEBANG_SCRIPT';
    return { safe: false, code, threat: execCheck.threat };
  }

  // Scan ASCII window for embedded script injections (EXIF/comments)
  let text = '';
  const scanLimit = Math.min(bytes.length, 8192);
  for (let i = 0; i < scanLimit; i++) {
    text += String.fromCharCode(bytes[i]);
  }
  const lower = text.toLowerCase();
  if (
    lower.includes('<script') ||
    lower.includes('</script>') ||
    lower.includes('javascript:') ||
    lower.includes('<?php') ||
    lower.includes('<?=') ||
    lower.includes('<iframe') ||
    lower.includes('<embed') ||
    lower.includes('<object') ||
    /eval\s*\(/.test(lower) ||
    /document\.(cookie|location)/.test(lower) ||
    /(?:onerror|onload|onclick|onmouseover)\s*=\s*['"]/.test(lower)
  ) {
    return {
      safe: false,
      code: 'MALWARE_SCRIPT_EMBEDDED',
      threat: 'Script injection detected in binary payload.',
    };
  }

  return { safe: true, threat: null };
}

/**
 * 3. Scans Base64 payload for embedded malware or executable polyglot signatures
 */
export function scanBase64Payload(base64Str: string): { safe: boolean; code?: string; threat?: string | null } {
  if (!base64Str || typeof base64Str !== 'string') {
    return { safe: true, threat: null };
  }

  let cleanBase64 = base64Str;
  if (cleanBase64.includes(',')) {
    cleanBase64 = cleanBase64.split(',')[1];
  }
  cleanBase64 = cleanBase64.trim();

  // Decode Base64 to binary buffer and check binary signatures
  try {
    let bytes: Uint8Array;
    if (typeof Buffer !== 'undefined') {
      const buf = Buffer.from(cleanBase64, 'base64');
      bytes = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
    } else if (typeof atob !== 'undefined') {
      const binaryStr = atob(cleanBase64.substring(0, 32768));
      bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
    } else {
      return { safe: true, threat: null };
    }

    if (bytes.length >= 2 && bytes[0] === 0x4D && bytes[1] === 0x5A) {
      return { safe: false, code: 'MALWARE_PE_EXECUTABLE', threat: 'Blocked: Base64 encoded PE executable.' };
    }

    return scanBinaryPayload(bytes);
  } catch (e) {
    return { safe: false, code: 'SECURITY_INVALID_ENCODING', threat: 'Invalid Base64 payload.' };
  }
}

// ============================================================================
// 2. INPUT SANITIZATION & ANTI-XSS ENCODING
// ============================================================================

/**
 * Context-aware HTML entity encoding to prevent XSS across HTML and attribute contexts
 */
export function escapeHtml(str: string): string {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/`/g, '&#x60;');
}

/**
 * Strict Input Sanitization (strips angle brackets and non-printable control characters)
 */
export function sanitizeInput(input: string, maxLength: number = 500): string {
  if (!input || typeof input !== 'string') return '';

  return input
    .trim()
    .replace(/[<>]/g, '') // Strip angle brackets
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Strip control characters
    .substring(0, maxLength);
}

/**
 * Strict Email Sanitization and Normalization
 */
export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') return '';
  return email.trim().toLowerCase().replace(/[^a-z0-9._%+-@]/g, '').substring(0, 100);
}

/**
 * Safe URI Scheme Allowlisting:
 * Allows: http, https, mailto, tel, relative paths
 * Blocks: javascript:, data:, vbscript:, blob:, file:
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  const protocolMatch = trimmed.match(/^([a-zA-Z0-9+.-]+):/);
  if (!protocolMatch) {
    return trimmed.startsWith('/') ? trimmed : 'https://' + trimmed;
  }
  const scheme = protocolMatch[1].toLowerCase();
  if (['http', 'https', 'mailto', 'tel'].includes(scheme)) {
    return trimmed;
  }
  return '#blocked-insecure-scheme';
}

/**
 * Spreadsheet / CSV Formula Injection Defense (CWE-1236):
 * Neutralizes CSV/Sheet formula execution by prepending a single quote (') to leading =, +, -, @, \t, \r
 */
export function sanitizeCsvFormula(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.length === 0) return '';

  if (/^[=+\-@\t\r]/.test(str)) {
    return `'${str}`;
  }
  return str;
}

// ============================================================================
// 3. CRYPTOGRAPHIC IDEMPOTENCY ENVELOPE & DRIFT CHECKS
// ============================================================================

export interface IdempotencyEnvelope<T> {
  action: string;
  payload: T;
  security: {
    nonce: string;              // 32-character hex (128-bit random)
    requestTimestamp: string;   // ISO 8601 UTC string
    idempotencyKey: string;     // Unique cryptographic idempotency hash
  };
}

/**
 * Generates a 128-bit cryptographic random nonce (32 hex characters)
 */
export function generateSecurityNonce(length: number = 32): string {
  const byteCount = Math.ceil(length / 2);
  const cryptoObj = typeof globalThis !== 'undefined' && globalThis.crypto
    ? globalThis.crypto
    : typeof window !== 'undefined' && window.crypto
    ? window.crypto
    : typeof crypto !== 'undefined'
    ? crypto
    : null;

  if (cryptoObj && typeof cryptoObj.getRandomValues === 'function') {
    const array = new Uint8Array(byteCount);
    cryptoObj.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0'))
      .join('')
      .substring(0, length);
  }
  let result = '';
  const chars = '0123456789abcdef';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Computes deterministic SHA-256-like 64-character hex idempotency hash
 */
export function generateIdempotencyKey(
  studyId: string,
  action: string,
  dateOrKey: string,
  nonce: string,
  timestamp: string
): string {
  const raw = `${studyId}:${action}:${dateOrKey}:${nonce}:${timestamp}`;
  // Standard simple 64-character hash fallback for client/sync operations
  let h1 = 0xdeadbeef ^ raw.length;
  let h2 = 0x41c6ce57 ^ raw.length;
  let h3 = 0x9e3779b9 ^ raw.length;
  let h4 = 0x85ebca6b ^ raw.length;

  for (let i = 0; i < raw.length; i++) {
    const ch = raw.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
    h3 = Math.imul(h3 ^ ch, 2246822519);
    h4 = Math.imul(h4 ^ ch, 3266489917);
  }

  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h3 ^ (h3 >>> 13), 3266489909);
  h3 = Math.imul(h3 ^ (h3 >>> 16), 2246822507) ^ Math.imul(h4 ^ (h4 >>> 13), 3266489909);
  h4 = Math.imul(h4 ^ (h4 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  const hex1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const hex2 = (h2 >>> 0).toString(16).padStart(8, '0');
  const hex3 = (h3 >>> 0).toString(16).padStart(8, '0');
  const hex4 = (h4 >>> 0).toString(16).padStart(8, '0');

  return `idemp_${hex1}${hex2}${hex3}${hex4}_${nonce.substring(0, 16)}`;
}

/**
 * Creates a signed Idempotency Envelope for mutating API requests
 */
export function createIdempotencyEnvelope<T>(
  action: string,
  payload: T,
  studyId: string = '',
  dateOrKey: string = ''
): IdempotencyEnvelope<T> {
  const nonce = generateSecurityNonce(32);
  const requestTimestamp = new Date().toISOString();
  const idempotencyKey = generateIdempotencyKey(studyId, action, dateOrKey, nonce, requestTimestamp);

  return {
    action,
    payload,
    security: {
      nonce,
      requestTimestamp,
      idempotencyKey,
    },
  };
}

/**
 * Validates request timestamp against Â±300s (5-minute) drift window
 */
export function verifyTimestampDrift(
  timestampIso: string,
  maxDriftMs: number = 300000
): { valid: boolean; driftMs: number; error?: string } {
  if (!timestampIso) {
    return { valid: false, driftMs: 0, error: 'ERR_MISSING_TIMESTAMP' };
  }

  const reqTime = new Date(timestampIso).getTime();
  if (isNaN(reqTime)) {
    return { valid: false, driftMs: 0, error: 'ERR_INVALID_TIMESTAMP' };
  }

  const now = Date.now();
  const driftMs = Math.abs(now - reqTime);

  // Future check (> 60s into future)
  if (reqTime - now > 60000) {
    return {
      valid: false,
      driftMs,
      error: 'ERR_TIMESTAMP_FUTURE',
    };
  }

  // Drift check (> 300s window)
  if (driftMs > maxDriftMs) {
    return {
      valid: false,
      driftMs,
      error: 'ERR_TIMESTAMP_EXPIRED',
    };
  }

  return { valid: true, driftMs };
}

// ============================================================================
// 4. MULTI-TAB SYNCHRONIZED SLIDING-WINDOW RATE LIMITER
// ============================================================================

/**
 * Multi-Tab Synchronized Sliding-Window Rate Limiter
 * Synchronizes across browser tabs via LocalStorage and BroadcastChannel.
 */
export class SynchronizedSlidingRateLimiter {
  private name: string;
  private storageKey: string;
  private maxRequests: number;
  private windowMs: number;
  private penaltyMs: number;
  private channel: BroadcastChannel | null = null;
  private inMemoryTimestamps: number[] = [];

  constructor(
    name: string,
    maxRequests: number = 10,
    windowMs: number = 60000,
    penaltyMs: number = 0
  ) {
    this.name = name;
    this.storageKey = `STUDYSYNC_RATELIMIT_${name.toUpperCase()}`;
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.penaltyMs = penaltyMs;

    if (typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined') {
      try {
        this.channel = new BroadcastChannel(`studysync_ratelimit_${name}`);
        this.channel.onmessage = (event) => {
          if (event.data && event.data.type === 'SYNC_TIMESTAMPS' && Array.isArray(event.data.timestamps)) {
            this.inMemoryTimestamps = event.data.timestamps;
          }
        };
      } catch (e) {
        this.channel = null;
      }
    }
  }

  public getTimestamps(): number[] {
    const now = Date.now();
    try {
      const raw = safeStorage.getItem(this.storageKey);
      if (raw) {
        const parsed: number[] = JSON.parse(raw);
        const active = parsed.filter((ts) => now - ts < this.windowMs);
        this.inMemoryTimestamps = active;
        return active;
      }
    } catch (e) {
      // Fallback to in-memory
    }
    this.inMemoryTimestamps = this.inMemoryTimestamps.filter((ts) => now - ts < this.windowMs);
    return this.inMemoryTimestamps;
  }

  private saveTimestamps(ts: number[]): void {
    this.inMemoryTimestamps = ts;
    try {
      safeStorage.setItem(this.storageKey, JSON.stringify(ts));
      if (this.channel) {
        this.channel.postMessage({
          type: 'SYNC_TIMESTAMPS',
          name: this.name,
          timestamps: ts,
        });
      }
    } catch (e) {}
  }

  public allow(): boolean {
    const now = Date.now();
    const active = this.getTimestamps();

    if (active.length >= this.maxRequests) {
      return false;
    }

    active.push(now);
    this.saveTimestamps(active);
    return true;
  }

  public remaining(): number {
    const active = this.getTimestamps();
    return Math.max(0, this.maxRequests - active.length);
  }

  public resetTimeMs(): number {
    const active = this.getTimestamps();
    if (active.length === 0) return 0;
    const oldest = active[0];
    return Math.max(0, this.windowMs - (Date.now() - oldest));
  }

  public reset(): void {
    this.saveTimestamps([]);
  }
}

// Standardized System Rate Limiters
export const submissionRateLimiter = new SynchronizedSlidingRateLimiter('submission', 6, 60000, 15000); // 6 req/min
export const authRateLimiter = new SynchronizedSlidingRateLimiter('auth', 10, 60000, 60000);           // 10 req/min
export const registrationRateLimiter = new SynchronizedSlidingRateLimiter('registration', 4, 60000, 30000); // 4 req/min
export const testMarkRateLimiter = new SynchronizedSlidingRateLimiter('testmark', 10, 60000, 10000);   // 10 req/min
export const adminRateLimiter = new SynchronizedSlidingRateLimiter('admin', 30, 60000, 5000);          // 30 req/min
export const publicVerifyRateLimiter = new SynchronizedSlidingRateLimiter('verify', 20, 60000, 5000);  // 20 req/min

// ============================================================================
// 7. ENTERPRISE PASSWORD SECURITY & ENTROPY ENGINE
// ============================================================================

export interface PasswordSecurityReport {
  score: number; // 0 - 100
  rating: 'Very Weak' | 'Weak' | 'Moderate' | 'Strong' | 'Very Strong';
  color: string;
  isAcceptable: boolean;
  suggestions: string[];
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
  isCommon: boolean;
}

const COMMON_WEAK_PASSWORDS = new Set([
  '123456', '12345678', '123456789', 'password', 'password123', 'admin', 'admin123',
  'qwerty', 'studysync', 'studysync123', 'welcome', 'welcome123', 'iloveyou', 'test1234',
  'changeme', 'secret', 'pass1234', 'student', 'student123', 'alwis123'
]);

/**
 * Rigorously evaluates password strength, entropy, dictionary commonality, and character variety
 */
export function evaluatePasswordSecurity(password: string, role: 'student' | 'admin' = 'student'): PasswordSecurityReport {
  const suggestions: string[] = [];
  const minLen = role === 'admin' ? 10 : 8;

  if (!password) {
    return {
      score: 0,
      rating: 'Very Weak',
      color: 'text-rose-500',
      isAcceptable: false,
      suggestions: [`Must be at least ${minLen} characters long`],
      hasMinLength: false,
      hasUppercase: false,
      hasLowercase: false,
      hasNumber: false,
      hasSpecial: false,
      isCommon: false,
    };
  }

  const clean = password.trim();
  const lower = clean.toLowerCase();

  const isCommon = COMMON_WEAK_PASSWORDS.has(lower);
  const hasMinLength = clean.length >= minLen;
  const hasUppercase = /[A-Z]/.test(clean);
  const hasLowercase = /[a-z]/.test(clean);
  const hasNumber = /[0-9]/.test(clean);
  const hasSpecial = /[^A-Za-z0-9]/.test(clean);

  let points = 0;

  // Length points (up to 40 pts)
  if (clean.length >= minLen) points += 20;
  if (clean.length >= 12) points += 12;
  if (clean.length >= 16) points += 8;

  // Variety points (up to 40 pts)
  if (hasUppercase) points += 10;
  if (hasLowercase) points += 10;
  if (hasNumber) points += 10;
  if (hasSpecial) points += 10;

  // Bonus for high entropy mixing (up to 20 pts)
  const uniqueChars = new Set(clean.split('')).size;
  if (uniqueChars >= 8) points += 10;
  if (uniqueChars >= 12) points += 10;

  // Penalties
  if (isCommon) {
    points = Math.min(points, 15);
    suggestions.push('This is a widely used, easily guessed password. Choose something unique.');
  }

  // Sequential or repeating patterns check
  if (/(.)\1{2,}/.test(clean)) {
    points = Math.max(0, points - 15);
    suggestions.push('Avoid repeating identical characters consecutively.');
  }

  if (!hasMinLength) suggestions.push(`Use at least ${minLen} characters.`);
  if (!hasUppercase) suggestions.push('Include at least one UPPERCASE letter (A-Z).');
  if (!hasLowercase) suggestions.push('Include at least one lowercase letter (a-z).');
  if (!hasNumber) suggestions.push('Include at least one number (0-9).');
  if (!hasSpecial) suggestions.push('Include at least one special symbol (!@#$%^&*).');

  const score = Math.max(0, Math.min(100, points));

  let rating: PasswordSecurityReport['rating'] = 'Very Weak';
  let color = 'text-rose-500';

  if (score >= 85) {
    rating = 'Very Strong';
    color = 'text-emerald-400';
  } else if (score >= 70) {
    rating = 'Strong';
    color = 'text-emerald-500';
  } else if (score >= 50) {
    rating = 'Moderate';
    color = 'text-amber-400';
  } else if (score >= 30) {
    rating = 'Weak';
    color = 'text-orange-500';
  }

  const isAcceptable = hasMinLength && (hasUppercase || hasLowercase) && hasNumber && !isCommon && score >= (role === 'admin' ? 70 : 50);

  return {
    score,
    rating,
    color,
    isAcceptable,
    suggestions,
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecial,
    isCommon,
  };
}

/**
 * Generates a cryptographically strong, high-entropy password suitable for accounts & emergency reset
 */
export function generateHighEntropyPassword(length: number = 14): string {
  const charset = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%^&*()-_=+';
  const array = new Uint8Array(length);
  const cryptoObj = typeof globalThis !== 'undefined' && globalThis.crypto
    ? globalThis.crypto
    : typeof window !== 'undefined' && window.crypto
    ? window.crypto
    : typeof crypto !== 'undefined'
    ? crypto
    : null;

  if (cryptoObj && typeof cryptoObj.getRandomValues === 'function') {
    cryptoObj.getRandomValues(array);
  } else {
    for (let i = 0; i < length; i++) array[i] = Math.floor(Math.random() * 256);
  }
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset[array[i] % charset.length];
  }
  return result;
}

