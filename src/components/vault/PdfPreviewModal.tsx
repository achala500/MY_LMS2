"use client";

import React, { useState, useEffect } from 'react';
import { X, Download, ZoomIn, ZoomOut, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VaultFile, downloadVaultFile, formatFileSize } from '@/lib/storage/vaultDb';

interface PdfPreviewModalProps {
  file: VaultFile | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PdfPreviewModal({ file, isOpen, onClose }: PdfPreviewModalProps) {
  const [zoom, setZoom] = useState(1);

  useEffect(() => { setZoom(1); }, [file]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen || !file) return null;
  const isPdf = file.mimeType === 'application/pdf';
  const scaleStyle: React.CSSProperties = {
    height: '75vh',
    transform: zoom !== 1 ? `scale(${zoom})` : undefined,
    transformOrigin: 'top center',
    width: zoom > 1 ? `${100 / zoom}%` : '100%',
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-stretch justify-center bg-black/70 ">
      <div className="absolute inset-0" onClick={onClose} aria-hidden />
      <div className="relative z-10 mx-auto my-4 flex w-full max-w-4xl flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3 bg-[#fef8f4] dark:bg-[#0F1114]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-border bg-card">
              <FileText className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{file.name}</p>
              <p className="text-[11px] text-muted-foreground">
                {file.subject} &middot; {formatFileSize(file.sizeBytes)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {isPdf && (
              <>
                <Button size="sm" variant="ghost"
                  onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}
                  className="h-8 w-8 rounded-full p-0" title="Zoom out">
                  <ZoomOut className="h-3.5 w-3.5" />
                </Button>
                <span className="text-xs text-muted-foreground font-mono w-10 text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <Button size="sm" variant="ghost"
                  onClick={() => setZoom(z => Math.min(3, z + 0.25))}
                  className="h-8 w-8 rounded-full p-0" title="Zoom in">
                  <ZoomIn className="h-3.5 w-3.5" />
                </Button>
              </>
            )}
            <Button size="sm" onClick={() => downloadVaultFile(file)}
              className="h-8 rounded-full px-3 bg-primary text-primary-foreground text-xs font-medium">
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Download
            </Button>
            <Button size="sm" variant="ghost" onClick={onClose}
              className="h-8 w-8 rounded-full p-0 text-muted-foreground">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden bg-[#2a2a2a] relative">
          {isPdf ? (
            <div className="w-full h-full overflow-auto">
              <iframe
                src={file.base64Data}
                className="w-full border-none"
                style={scaleStyle}
                title={file.name}
              />
            </div>
          ) : (
            <div className="flex h-full items-center justify-center p-8 text-center">
              <div className="space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-card">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Preview not available for this file type.
                </p>
                <Button onClick={() => downloadVaultFile(file)}
                  className="rounded-full bg-primary text-primary-foreground">
                  <Download className="mr-2 h-4 w-4" />Download to view
                </Button>
              </div>
            </div>
          )}
        </div>
        <div className="border-t border-border px-5 py-2.5 bg-[#fef8f4] dark:bg-[#0F1114]">
          <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
            <span className="capitalize">{file.type.replace('_', ' ')}</span>
            {file.year && <span>Year {file.year}</span>}
            {file.description && <span className="truncate">{file.description}</span>}
            <span className="ml-auto">
              {new Date(file.uploadedAt).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric'
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
