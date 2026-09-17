/**
 * PRESIGNED URL UPLOAD PIPELINE
 * 
 * 3-Step Process:
 * 1. Frontend requests signed URL → Backend generates 60-second presigned R2 URL
 * 2. Frontend uploads directly to R2 → Magic bytes validated at ingestion
 * 3. R2 webhook triggers backend → Verify file, move to final bucket, update DB
 */

import { Router } from 'hono';
import { sign } from '@aws-sdk/s3-request-presigner';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';

// ============================================================================
// 1. REQUEST PRESIGNED URL (Frontend calls this)
// ============================================================================

export async function requestPresignedUrl(
  req: Request,
  db: any,
  r2: any
): Promise<Response> {
  try {
    const { study_id, date_of_study, intended_size } = await req.json();

    // Validation
    if (!study_id || !date_of_study || intended_size > 50 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: 'Invalid input or file too large' }), {
        status: 400,
      });
    }

    // Rate limit: 5 uploads per day per student
    const uploadCountToday = await db
      .prepare(
        `
        SELECT COUNT(*) as count FROM image_quarantine_log 
        WHERE student_id = (SELECT id FROM students WHERE study_id = ?)
        AND DATE(flagged_at) = DATE('now')
      `
      )
      .bind(study_id)
      .first();

    if (uploadCountToday && uploadCountToday.count > 5) {
      return new Response(JSON.stringify({ error: 'Daily upload limit exceeded' }), {
        status: 429,
      });
    }

    // Generate presigned URL valid for 60 seconds
    const fileId = crypto.randomBytes(16).toString('hex');
    const fileName = `uploads/quarantine/${study_id}/${date_of_study}/${fileId}.bin`;

    const command = new GetObjectCommand({
      Bucket: 'studysync-quarantine',
      Key: fileName,
    });

    // CRITICAL: Use AWS SDK v3 request presigner
    const presignedUrl = await sign(command, {
      region: 'auto',
      credentials: {
        accessKeyId: req.env.R2_ACCESS_KEY_ID,
        secretAccessKey: req.env.R2_SECRET_ACCESS_KEY,
      },
      signingDate: new Date(),
      expiresIn: 60, // 60 seconds
    });

    return new Response(
      JSON.stringify({
        presignedUrl,
        fileName,
        expiresIn: 60,
        uploadId: fileId,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('[Upload] Failed to generate presigned URL:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}

// ============================================================================
// 2. MAGIC BYTE VALIDATION (Anti-malware gate)
// ============================================================================

const ALLOWED_MAGIC_BYTES = {
  jpeg: Buffer.from([0xff, 0xd8, 0xff]),
  png: Buffer.from([0x89, 0x50, 0x4e, 0x47]),
  gif: Buffer.from([0x47, 0x49, 0x46]),
  pdf: Buffer.from([0x25, 0x50, 0x44, 0x46]), // %PDF
  webp: Buffer.from([0x52, 0x49, 0x46, 0x46]), // RIFF (webp container)
};

function validateMagicBytes(buffer: Buffer): { valid: boolean; mimeType?: string } {
  // Check JPEG
  if (buffer.length >= 3 && buffer.subarray(0, 3).equals(ALLOWED_MAGIC_BYTES.jpeg)) {
    return { valid: true, mimeType: 'image/jpeg' };
  }

  // Check PNG
  if (buffer.length >= 4 && buffer.subarray(0, 4).equals(ALLOWED_MAGIC_BYTES.png)) {
    return { valid: true, mimeType: 'image/png' };
  }

  // Check GIF
  if (buffer.length >= 3 && buffer.subarray(0, 3).equals(ALLOWED_MAGIC_BYTES.gif)) {
    return { valid: true, mimeType: 'image/gif' };
  }

  // Check PDF
  if (buffer.length >= 4 && buffer.subarray(0, 4).equals(ALLOWED_MAGIC_BYTES.pdf)) {
    return { valid: true, mimeType: 'application/pdf' };
  }

  // Check WEBP (RIFF format)
  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).equals(ALLOWED_MAGIC_BYTES.webp) &&
    buffer.subarray(8, 12).toString() === 'WEBP'
  ) {
    return { valid: true, mimeType: 'image/webp' };
  }

  return { valid: false };
}

// ============================================================================
// 3. R2 WEBHOOK HANDLER (Triggered on file ingestion)
// ============================================================================

export async function handleR2Webhook(req: Request, db: any, r2: any): Promise<Response> {
  try {
    const payload = await req.json();
    const { eventType, object } = payload;

    if (eventType !== 'object.created') {
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }

    const { key, size } = object;

    // Extract metadata from key: uploads/quarantine/study_id/date/fileId.bin
    const [_, __, study_id, date_of_study, _____] = key.split('/');

    // Get student ID
    const student = await db
      .prepare('SELECT id FROM students WHERE study_id = ?')
      .bind(study_id)
      .first();

    if (!student) {
      console.error(`[R2 Webhook] Unknown student: ${study_id}`);
      return new Response(JSON.stringify({ error: 'Student not found' }), { status: 404 });
    }

    // Download first 512 bytes from R2 to validate magic bytes
    const headObject = await r2.getObject({
      Bucket: 'studysync-quarantine',
      Key: key,
      Range: 'bytes=0-511',
    });

    const buffer = Buffer.from(await headObject.Body.arrayBuffer());
    const validation = validateMagicBytes(buffer);

    if (!validation.valid) {
      // Log as threat
      await db
        .prepare(`
          INSERT INTO image_quarantine_log 
          (student_id, file_name, file_size, threat_type, threat_details, flagged_at)
          VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `)
        .bind(student.id, key, size, 'invalid_magic_bytes', `Detected: ${buffer.toString('hex').substring(0, 16)}`)
        .run();

      console.warn(`[R2 Webhook] Quarantined invalid file: ${key}`);
      return new Response(JSON.stringify({ quarantined: true }), { status: 200 });
    }

    // File is valid: move from quarantine to verified_proofs
    const verifiedKey = key.replace('quarantine', 'verified_proofs');
    const verifiedUrl = `https://studysync-verified.cdn.cloudflare.net/${verifiedKey}`;

    // Copy object from quarantine to verified_proofs
    const copySource = encodeURIComponent(`studysync-quarantine/${key}`);
    await r2.copyObject({
      Bucket: 'studysync-verified',
      Key: verifiedKey,
      CopySource: copySource,
    });

    // Delete quarantine copy
    await r2.deleteObject({
      Bucket: 'studysync-quarantine',
      Key: key,
    });

    // Update study log with verified URL
    await db
      .prepare(`
        UPDATE study_logs
        SET proof_image_url = ?
        WHERE student_id = ? AND date_of_study = ?
      `)
      .bind(verifiedUrl, student.id, date_of_study)
      .run();

    // Log success
    await auditLog(db, 'IMAGE_VERIFIED', 'study_logs', student.id, {
      date_of_study,
      mime_type: validation.mimeType,
      file_size: size,
      verified_url: verifiedUrl,
    });

    return new Response(JSON.stringify({ verified: true, url: verifiedUrl }), { status: 200 });
  } catch (error) {
    console.error('[R2 Webhook] Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}

// ============================================================================
// 4. MALWARE DETECTION (Extended: script injection checks)
// ============================================================================

function detectScriptInjection(buffer: Buffer, mimeType: string): boolean {
  // If it's supposed to be an image but contains text signatures of scripts
  if (mimeType.startsWith('image/')) {
    const text = buffer.toString('utf8', 0, Math.min(1024, buffer.length));

    // Reject if contains PHP/Python/Node executable signatures
    const maliciousPatterns = [
      /<?php/i,
      /python/i,
      /#!\/bin\/(bash|sh)/,
      /#!\/usr\/bin\/env python/,
      /<script/i,
      /eval\(/i,
      /exec\(/i,
      /system\(/i,
      /passthru\(/i,
    ];

    for (const pattern of maliciousPatterns) {
      if (pattern.test(text)) {
        return true; // Malicious content detected
      }
    }
  }

  return false;
}

async function auditLog(db: any, action: string, resourceType: string, resourceId: string, details: any): Promise<void> {
  await db
    .prepare(`
      INSERT INTO audit_log (action, resource_type, resource_id, details, status)
      VALUES (?, ?, ?, ?, ?)
    `)
    .bind(action, resourceType, resourceId, JSON.stringify(details), 'success')
    .run()
    .catch((err) => console.error(`[Audit] Failed to log ${action}:`, err));
}

// ============================================================================
// FRONTEND INTEGRATION EXAMPLE
// ============================================================================
/*
// 1. Request presigned URL
const response = await fetch('/api/upload/presigned-url', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    study_id: 'SG-MATH-0001',
    date_of_study: '2024-12-15',
    intended_size: fileSize,
  }),
});

const { presignedUrl, uploadId } = await response.json();

// 2. Upload directly to R2
const uploadResponse = await fetch(presignedUrl, {
  method: 'PUT',
  headers: { 'Content-Type': 'image/jpeg' },
  body: fileBlob,
});

if (uploadResponse.ok) {
  // Webhook will handle verification and URL update
  showNotification(`Upload successful (ID: ${uploadId})`);
}
*/
