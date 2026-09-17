"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ZoomIn, ZoomOut, RotateCw, Download, FileText, X } from 'lucide-react';

interface PdfDocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string;
  title?: string;
  studentName?: string;
}

export const PdfDocumentViewerModal: React.FC<PdfDocumentViewerModalProps> = ({
  isOpen,
  onClose,
  pdfUrl,
  title = 'Past Paper Submission Preview',
  studentName,
}) => {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl w-[95vw] h-[88vh] flex flex-col p-0 gap-0 bg-[#fef8f4] border border-[#dec0b7]/80 rounded-2xl overflow-hidden shadow-2xl">
        {/* Header Toolbar */}
        <DialogHeader className="px-6 py-4 bg-white border-b border-[#dec0b7]/40 flex flex-row items-center justify-between space-y-0 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#c85a32]/10 border border-[#c85a32]/20 flex items-center justify-center text-[#9f3c16]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-serif font-semibold text-[#1d1b19]">
                {title}
              </DialogTitle>
              {studentName && (
                <p className="text-xs text-[#57423b]">Candidate: {studentName}</p>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-[#f8f2ef] border border-[#dec0b7]/50 rounded-xl px-1 py-0.5 text-xs text-[#2d2420]">
              <button
                type="button"
                onClick={handleZoomOut}
                className="p-1.5 hover:bg-white rounded-lg transition-colors cursor-pointer"
                title="Zoom out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="px-2 font-mono text-[11px] font-medium">{zoom}%</span>
              <button
                type="button"
                onClick={handleZoomIn}
                className="p-1.5 hover:bg-white rounded-lg transition-colors cursor-pointer"
                title="Zoom in"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleRotate}
              className="p-2 hover:bg-[#f8f2ef] border border-[#dec0b7]/50 rounded-xl text-[#2d2420] transition-colors cursor-pointer"
              title="Rotate clockwise"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            {pdfUrl && (
              <a
                href={pdfUrl}
                download="StudySync_Submission.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-[#9f3c16] hover:bg-[#822801] text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5 text-xs font-semibold px-3 cursor-pointer"
                title="Download PDF"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Download</span>
              </a>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-[#f8f2ef] text-[#57423b] rounded-xl transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </DialogHeader>

        {/* PDF Canvas Viewport */}
        <div className="flex-1 bg-[#242220]/5 overflow-auto p-4 flex items-center justify-center relative">
          <div
            className="transition-transform duration-200 ease-out origin-center shadow-lg rounded-xl overflow-hidden bg-white max-w-full max-h-full"
            style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              width: '100%',
              height: '100%',
            }}
          >
            {pdfUrl ? (
              <iframe
                src={`${pdfUrl}#toolbar=0`}
                className="w-full h-full border-0 min-h-[600px]"
                title="PDF Document View"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-3">
                <FileText className="w-12 h-12 text-[#dec0b7]" />
                <p className="text-sm font-medium text-[#57423b]">No PDF document attached to this response.</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
