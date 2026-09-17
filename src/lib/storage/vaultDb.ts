/**
 * vaultDb.ts — Academic Resource Vault
 * Hybrid IndexedDB (offline-first) + Google Apps Script cloud sync
 * for PDF past papers, revision notes, and study resources.
 */

'use client';

export interface VaultFile {
  id: string;
  name: string;
  subject: string;
  year?: string;
  type: 'past_paper' | 'revision_note' | 'tutorial' | 'resource';
  sizeBytes: number;
  mimeType: string;
  uploadedAt: string;
  uploadedBy: string;
  base64Data: string;
  cloudSynced: boolean;
  cloudUrl?: string;
  tags?: string[];
  description?: string;
}

export interface VaultUploadPayload {
  file: File;
  subject: string;
  year?: string;
  type: VaultFile['type'];
  uploadedBy: string;
  description?: string;
  tags?: string[];
}

const DB_NAME = 'studysync_vault';
const DB_VERSION = 1;
const STORE_NAME = 'vault_files';

function openVaultDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('IndexedDB not available in server context'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('subject', 'subject', { unique: false });
        store.createIndex('type', 'type', { unique: false });
        store.createIndex('uploadedAt', 'uploadedAt', { unique: false });
        store.createIndex('uploadedBy', 'uploadedBy', { unique: false });
      }
    };
    request.onsuccess = (event) => resolve((event.target as IDBOpenDBRequest).result);
    request.onerror = (event) => reject((event.target as IDBOpenDBRequest).error);
  });
}

function generateId(): string {
  return 'vault_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function uploadVaultFile(payload: VaultUploadPayload): Promise<VaultFile> {
  const base64Data = await fileToBase64(payload.file);
  const entry: VaultFile = {
    id: generateId(),
    name: payload.file.name,
    subject: payload.subject,
    year: payload.year,
    type: payload.type,
    sizeBytes: payload.file.size,
    mimeType: payload.file.type,
    uploadedAt: new Date().toISOString(),
    uploadedBy: payload.uploadedBy,
    base64Data,
    cloudSynced: false,
    description: payload.description,
    tags: payload.tags ?? [],
  };
  const db = await openVaultDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(entry);
    req.onsuccess = () => resolve(entry);
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

export async function getVaultFiles(subject?: string): Promise<VaultFile[]> {
  if (typeof window === 'undefined') return [];
  try {
    const db = await openVaultDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = subject ? store.index('subject').getAll(subject) : store.getAll();
      req.onsuccess = () => {
        const results: VaultFile[] = req.result;
        results.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
        resolve(results);
      };
      req.onerror = () => reject(req.error);
      tx.oncomplete = () => db.close();
    });
  } catch (_e) { return []; }
}

export async function deleteVaultFile(id: string): Promise<void> {
  if (typeof window === 'undefined') return;
  const db = await openVaultDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

export function downloadVaultFile(file: VaultFile): void {
  const link = document.createElement('a');
  link.href = file.base64Data;
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function getVaultFile(id: string): Promise<VaultFile | null> {
  if (typeof window === 'undefined') return null;
  try {
    const db = await openVaultDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => reject(req.error);
      tx.oncomplete = () => db.close();
    });
  } catch (_e) { return null; }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function getVaultStats(): Promise<Record<string, number>> {
  const files = await getVaultFiles();
  const stats: Record<string, number> = {};
  for (const f of files) {
    stats[f.subject] = (stats[f.subject] ?? 0) + 1;
  }
  return stats;
}
