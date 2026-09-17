"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Upload, FileText, Trash2, Eye, Download, FolderOpen, Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  VaultFile, VaultUploadPayload,
  uploadVaultFile, getVaultFiles, deleteVaultFile,
  downloadVaultFile, formatFileSize
} from '@/lib/storage/vaultDb';
import { PdfPreviewModal } from '@/components/vault/PdfPreviewModal';
import { toast } from 'sonner';

const SUBJECT_OPTIONS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Combined Maths', 'Other'];
const TYPE_OPTIONS: { value: VaultFile['type']; label: string }[] = [
  { value: 'past_paper', label: 'Past Paper' },
  { value: 'revision_note', label: 'Revision Note' },
  { value: 'tutorial', label: 'Tutorial' },
  { value: 'resource', label: 'Resource' },
];

interface VaultPanelProps {
  studyId: string;
  defaultSubject?: string;
}

export function VaultPanel({ studyId, defaultSubject }: VaultPanelProps) {
  const [files, setFiles] = useState<VaultFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [filterSubject, setFilterSubject] = useState(defaultSubject ?? '');
  const [search, setSearch] = useState('');
  const [previewFile, setPreviewFile] = useState<VaultFile | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadSubject, setUploadSubject] = useState(defaultSubject ?? SUBJECT_OPTIONS[0]);
  const [uploadType, setUploadType] = useState<VaultFile['type']>('past_paper');
  const [uploadYear, setUploadYear] = useState('');
  const [uploadDesc, setUploadDesc] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadFiles = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getVaultFiles(filterSubject || undefined);
      setFiles(data);
    } catch (_e) {
      toast.error('Could not load vault files');
    } finally {
      setLoading(false);
    }
  }, [filterSubject]);

  useEffect(() => { loadFiles(); }, [loadFiles]);

  const handleFileSelect = async (selected: FileList | null) => {
    if (!selected || selected.length === 0) return;
    setUploading(true);
    for (const file of Array.from(selected)) {
      if (file.size > 50 * 1024 * 1024) {
        toast.error(`${file.name} is over 50MB`);
        continue;
      }
      const payload: VaultUploadPayload = {
        file, subject: uploadSubject, year: uploadYear || undefined,
        type: uploadType, uploadedBy: studyId,
        description: uploadDesc || undefined,
      };
      try {
        await uploadVaultFile(payload);
        toast.success(`${file.name} added to vault`);
      } catch (_e) {
        toast.error(`Failed to upload ${file.name}`);
      }
    }
    await loadFiles();
    setUploading(false);
    setShowUploadForm(false);
    setUploadYear('');
    setUploadDesc('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = async (file: VaultFile) => {
    if (!confirm(`Remove "${file.name}" from vault?`)) return;
    try {
      await deleteVaultFile(file.id);
      setFiles(prev => prev.filter(f => f.id !== file.id));
      toast.success('Removed from vault');
    } catch (_e) {
      toast.error('Could not delete file');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const filtered = files.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.subject.toLowerCase().includes(search.toLowerCase()) ||
    (f.description ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const typeLabel = (t: VaultFile['type']) =>
    TYPE_OPTIONS.find(o => o.value === t)?.label ?? t;

  const typeColor = (t: VaultFile['type']): string => {
    const map: Record<VaultFile['type'], string> = {
      past_paper: 'bg-primary/10 text-primary border-primary/20',
      revision_note: 'bg-secondary/10 text-secondary border-secondary/20',
      tutorial: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
      resource: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
    };
    return map[t];
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[140px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Search vault..." value={search} onChange={e => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs rounded-full" />
        </div>
        <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)}
          className="h-8 rounded-full border border-border bg-card px-3 text-xs text-foreground">
          <option value="">All subjects</option>
          {SUBJECT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <Button size="sm" onClick={() => setShowUploadForm(p => !p)}
          className="h-8 rounded-full px-3 bg-primary text-primary-foreground text-xs">
          <Upload className="mr-1.5 h-3.5 w-3.5" />Upload
        </Button>
      </div>

      {showUploadForm && (
        <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
          <p className="text-sm font-semibold text-foreground">Upload to vault</p>
          <div className="grid grid-cols-2 gap-2">
            <select value={uploadSubject} onChange={e => setUploadSubject(e.target.value)}
              className="h-8 rounded-xl border border-border bg-card px-3 text-xs text-foreground">
              {SUBJECT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={uploadType} onChange={e => setUploadType(e.target.value as VaultFile['type'])}
              className="h-8 rounded-xl border border-border bg-card px-3 text-xs text-foreground">
              {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <Input placeholder="Year (e.g. 2023)" value={uploadYear}
            onChange={e => setUploadYear(e.target.value)} className="h-8 text-xs rounded-xl" />
          <Input placeholder="Short description (optional)" value={uploadDesc}
            onChange={e => setUploadDesc(e.target.value)} className="h-8 text-xs rounded-xl" />
          <div
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={[
              'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-colors',
              isDragging ? 'border-primary bg-primary/5' : 'border-border bg-muted/30 hover:border-primary/50'
            ].join(' ')}
          >
            <Upload className="mb-2 h-6 w-6 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              {uploading ? 'Uploading...' : 'Drop PDFs here or click to browse'}
            </p>
            <p className="mt-1 text-[10px] text-muted-foreground/60">PDF, DOC, PPTX &mdash; max 50 MB</p>
            <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.pptx,.txt"
              multiple className="hidden" onChange={e => handleFileSelect(e.target.files)} />
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => <div key={i} className="h-14 rounded-xl bg-muted/40 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-10 text-center">
          <FolderOpen className="mb-3 h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm font-medium text-foreground">Vault is empty right now</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Upload your first past paper to get started
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(file => (
            <div key={file.id}
              className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:bg-muted/30">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-border bg-muted/30">
                <FileText className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-muted-foreground">{file.subject}</span>
                  {file.year && <span className="text-[10px] text-muted-foreground">&middot; {file.year}</span>}
                  <span className="text-[10px] text-muted-foreground">&middot; {formatFileSize(file.sizeBytes)}</span>
                </div>
              </div>
              <Badge className={`text-[10px] px-2 py-0 rounded-full border ${typeColor(file.type)}`}>
                {typeLabel(file.type)}
              </Badge>
              <div className="flex items-center gap-1">
                <Button size="sm" variant="ghost" onClick={() => setPreviewFile(file)}
                  className="h-7 w-7 rounded-full p-0 text-muted-foreground" title="Preview">
                  <Eye className="h-3.5 w-3.5" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => downloadVaultFile(file)}
                  className="h-7 w-7 rounded-full p-0 text-muted-foreground" title="Download">
                  <Download className="h-3.5 w-3.5" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(file)}
                  className="h-7 w-7 rounded-full p-0 text-muted-foreground hover:text-destructive" title="Delete">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <PdfPreviewModal
        file={previewFile}
        isOpen={previewFile !== null}
        onClose={() => setPreviewFile(null)}
      />
    </div>
  );
}
