'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { getDriveFileId, sanitizeUrl } from '@/lib/utils';
import {
  Image as ImageIcon,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  AlertCircle,
  Loader2,
  Download,
  FileText,
  X,
} from 'lucide-react';

interface PhotoProofModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proofUrl: string | null;
  studentName?: string;
  studyId?: string;
  dateOfStudy?: string;
}

export const PhotoProofModal: React.FC<PhotoProofModalProps> = ({
  open,
  onOpenChange,
  proofUrl,
  studentName,
  studyId,
  dateOfStudy,
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [streamIndex, setStreamIndex] = useState<number>(0);

  const driveId = getDriveFileId(proofUrl);

  const isPdf = Boolean(
    proofUrl && (
      proofUrl.toLowerCase().includes('.pdf') ||
      proofUrl.startsWith('data:application/pdf') ||
      (driveId && proofUrl.includes('drive.google.com') && !proofUrl.startsWith('data:image/'))
    )
  );

  // Fallback stream hierarchy
  const streamUrls = React.useMemo(() => {
    if (!proofUrl) return [];
    if (proofUrl.startsWith('data:') || proofUrl.startsWith('blob:')) {
      return [proofUrl];
    }
    if (!driveId) return [proofUrl];

    return [
      `https://lh3.googleusercontent.com/d/${driveId}=w1600`,
      `https://drive.google.com/thumbnail?id=${driveId}&sz=w1600`,
      `https://drive.google.com/uc?export=view&id=${driveId}`,
      proofUrl,
    ];
  }, [proofUrl, driveId]);

  const safeProofUrl = proofUrl ? sanitizeUrl(proofUrl) : '';
  const currentSrc = streamUrls[streamIndex] || safeProofUrl || '';

  useEffect(() => {
    if (open) {
      setLoading(true);
      setHasError(false);
      setZoom(1);
      setStreamIndex(0);
    }
  }, [open, proofUrl]);

  const handleImageError = () => {
    if (streamIndex < streamUrls.length - 1) {
      // Try next stream fallback
      setStreamIndex((prev) => prev + 1);
    } else {
      setLoading(false);
      setHasError(true);
    }
  };

  const handleZoomIn = () => setZoom((z) => Math.min(3, z + 0.3));
  const handleZoomOut = () => setZoom((z) => Math.max(0.6, z - 0.3));
  const handleResetZoom = () => setZoom(1);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-[#fef8f4] border border-[#dec0b7]/80 text-[#1d1b19] p-6 shadow-2xl rounded-3xl">
        <DialogHeader className="pb-3 border-b border-[#dec0b7]/40">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-[#c85a32]/10 border border-[#c85a32]/20 flex items-center justify-center text-[#c85a32]">
                {isPdf ? <FileText className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-[#1d1b19] flex items-center gap-2">
                  <span>{isPdf ? 'Study Session Document Proof' : 'Study Session Photo Proof'}</span>
                  {studyId && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#ffdcbc] text-[#854f00]">
                      {studyId}
                    </span>
                  )}
                </DialogTitle>
                <DialogDescription className="text-xs text-[#2d2420]">
                  {studentName ? `${studentName} â€¢ ` : ''}{dateOfStudy || 'Verified daily log proof'}
                </DialogDescription>
              </div>
            </div>

            {/* Quick Actions */}
            {!isPdf && (
              <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-xl border border-[#dec0b7]/40 shadow-xs">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomOut}
                  disabled={zoom <= 0.6}
                  className="h-7 w-7 p-0 text-[#2d2420] hover:text-[#1d1b19] rounded-lg cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetZoom}
                  className="h-7 px-2 text-[11px] font-mono text-[#2d2420] hover:text-[#1d1b19] rounded-lg cursor-pointer"
                  title="Reset Zoom"
                >
                  {Math.round(zoom * 100)}%
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomIn}
                  disabled={zoom >= 3}
                  className="h-7 w-7 p-0 text-[#2d2420] hover:text-[#1d1b19] rounded-lg cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>
        </DialogHeader>

        {/* Content Canvas */}
        <div className="mt-4 relative rounded-2xl overflow-hidden border border-[#dec0b7]/60 bg-white min-h-[340px] max-h-[540px] flex items-center justify-center">
          {loading && !isPdf && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#fef8f4]/80  gap-2">
              <Loader2 className="h-6 w-6 text-[#c85a32] animate-spin" />
              <span className="text-xs text-[#2d2420] font-mono">Loading high-resolution proof...</span>
            </div>
          )}

          {isPdf ? (
            <div className="w-full h-[520px] flex flex-col bg-white">
              <iframe
                src={driveId ? `https://drive.google.com/file/d/${driveId}/preview` : currentSrc}
                className="w-full flex-1 border-0 rounded-xl"
                title="Study Session PDF Document"
                onLoad={() => setLoading(false)}
              />
            </div>
          ) : hasError ? (
            <div className="p-8 text-center space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 mx-auto">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-[#1d1b19]">Direct Embedded Preview Restricted</p>
                <p className="text-xs text-[#2d2420] max-w-sm mx-auto">
                  Third-party storage or file permissions restrict iframe embedding. Click below to inspect or download the original proof file.
                </p>
              </div>
              {proofUrl && (
                <div className="flex items-center justify-center gap-2">
                  <a href={safeProofUrl} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" className="bg-[#c85a32] hover:bg-[#b04b25] text-white rounded-xl text-xs flex items-center gap-1.5 font-semibold cursor-pointer">
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>Open File Directly</span>
                    </Button>
                  </a>
                  <a href={safeProofUrl} download={proofUrl.startsWith('data:') ? 'study-proof' : undefined}>
                    <Button variant="outline" size="sm" className="border-[#dec0b7] text-[#1d1b19] rounded-xl text-xs flex items-center gap-1.5 cursor-pointer">
                      <Download className="h-3.5 w-3.5" />
                      <span>Download</span>
                    </Button>
                  </a>
                </div>
              )}
            </div>
          ) : (
            currentSrc && (
              <div className="overflow-auto max-h-[500px] w-full flex items-center justify-center p-3 bg-[#f8f2ef]/40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentSrc}
                  alt="Study Proof"
                  onLoad={() => setLoading(false)}
                  onError={handleImageError}
                  style={{ transform: `scale(${zoom})`, transition: 'transform 0.15s ease' }}
                  className="max-h-[480px] w-auto object-contain rounded-xl shadow-md select-none"
                />
              </div>
            )
          )}
        </div>

        {/* Footer info & external actions */}
        <div className="mt-3 flex items-center justify-between text-xs text-[#4a3b35] flex-wrap gap-2">
          <span className="font-mono text-[11px]">
            {driveId ? `Drive ID: ${driveId.substring(0, 12)}...` : proofUrl?.startsWith('data:') ? 'Attached Verified File' : 'Direct Cloud Storage'}
          </span>

          {proofUrl && (
            <div className="flex items-center gap-3">
              <a
                href={safeProofUrl}
                download={proofUrl.startsWith('data:') ? `study-proof-${studyId || 'candidate'}` : undefined}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#9f3c16] hover:text-[#c85a32] flex items-center gap-1 font-semibold transition-colors cursor-pointer"
              >
                <span>Download Proof</span>
                <Download className="h-3 w-3" />
              </a>
              <a
                href={safeProofUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#9f3c16] hover:text-[#c85a32] flex items-center gap-1 font-semibold transition-colors cursor-pointer"
              >
                <span>Open Fullscreen</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
