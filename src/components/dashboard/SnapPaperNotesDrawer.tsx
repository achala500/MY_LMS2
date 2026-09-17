'use client';

import React, { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  X,
  RotateCw,
  CheckCircle2,
  FileText,
  Sparkles,
  Loader2,
  Trash2,
  Maximize2
} from 'lucide-react';
import { toast } from 'sonner';
import { uploadVaultFile } from '@/lib/storage/vaultDb';

interface SnapPaperNotesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  stream?: string;
  studyId?: string;
  onUploadSuccess?: () => void;
}

export function SnapPaperNotesDrawer({
  isOpen,
  onClose,
  stream = 'Physical Science',
  studyId = 'STUDENT',
  onUploadSuccess,
}: SnapPaperNotesDrawerProps) {
  const [file, setFile] = useState<File | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [rotation, setRotation] = useState<number>(0);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const [subject, setSubject] = useState<string>(
    stream.toLowerCase().includes('bio') ? 'Biology' : 'Combined Maths'
  );
  const [paperType, setPaperType] = useState<'past_paper' | 'revision_note'>('revision_note');
  const [noteTitle, setNoteTitle] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const compressImage = async (inputFile: File): Promise<{ blob: Blob; dataUrl: string }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;

      img.onload = () => {
        const MAX_WIDTH = 1600;
        const MAX_HEIGHT = 1600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Compress to JPEG with 0.78 quality (~200KB-280KB)
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Blob generation failed'));
              return;
            }
            const dataUrl = canvas.toDataURL('image/jpeg', 0.78);
            resolve({ blob, dataUrl });
          },
          'image/jpeg',
          0.78
        );
      };

      reader.readAsDataURL(inputFile);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setOriginalSize(selected.size);
    setIsCompressing(true);

    try {
      const { blob, dataUrl } = await compressImage(selected);
      setCompressedBlob(blob);
      setPreviewUrl(dataUrl);
      setRotation(0);
      toast.success(
        `Optimized: ${(selected.size / (1024 * 1024)).toFixed(1)}MB ? ${(blob.size / 1024).toFixed(0)}KB (${Math.round((1 - blob.size / selected.size) * 100)}% saved)`
      );
    } catch (err) {
      console.error(err);
      toast.error('Could not process image. Please try again.');
    } finally {
      setIsCompressing(false);
    }
  };

  const rotateImage = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleSave = async () => {
    if (!compressedBlob || !file) {
      toast.error('Please capture or select an image first');
      return;
    }

    setIsUploading(true);
    try {
      const cleanTitle = noteTitle.trim() || `${subject} - Notes ${new Date().toLocaleDateString()}`;
      const processedFile = new File(
        [compressedBlob],
        `${cleanTitle.replace(/[^a-z0-9]/gi, '_')}.jpg`,
        { type: 'image/jpeg' }
      );

      await uploadVaultFile({
        file: processedFile,
        subject,
        type: paperType,
        uploadedBy: studyId,
        description: `Handwritten proof • Client compressed (${(compressedBlob.size / 1024).toFixed(0)} KB)`,
      });

      toast.success('Paper notes securely archived in Vault!');
      if (onUploadSuccess) onUploadSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save paper note');
    } finally {
      setIsUploading(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / 1024).toFixed(0)} KB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#19202e]/60  animate-in fade-in duration-200">
      <div className="w-full max-w-xl max-h-[92vh] flex flex-col bg-[#ffffff] rounded-t-3xl sm:rounded-2xl border border-[#e7e1de] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#f0eae6] flex items-center justify-between bg-[#fefaf8]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#fa7268]/15 text-[#c85a32] flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#19202e]">Snap Paper Notes</h2>
              <p className="text-[11px] text-[#4a3b35]">Client-side downsampled to &lt; 300KB</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#4a3b35] hover:bg-[#f3ede9] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Upload & Camera Buttons */}
          {!previewUrl && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="p-6 rounded-2xl border-2 border-dashed border-[#c85a32]/40 hover:border-[#c85a32] bg-[#fdf8f6] hover:bg-[#faeeea] transition-all flex flex-col items-center justify-center gap-2.5 text-center group"
                >
                  <div className="w-12 h-12 rounded-full bg-[#c85a32] text-white flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                    <Camera className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold text-[#19202e]">Take Photo</span>
                  <span className="text-[10px] text-[#4a3b35]">Direct phone camera</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-6 rounded-2xl border-2 border-dashed border-[#e7e1de] hover:border-[#4a3b35] bg-[#faf8f6] hover:bg-[#f3ede9] transition-all flex flex-col items-center justify-center gap-2.5 text-center group"
                >
                  <div className="w-12 h-12 rounded-full bg-[#19202e] text-white flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                    <Upload className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold text-[#19202e]">Choose File</span>
                  <span className="text-[10px] text-[#4a3b35]">From gallery / photos</span>
                </button>
              </div>

              {/* Hidden Inputs */}
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileChange}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />

              {isCompressing && (
                <div className="p-4 rounded-xl bg-[#fef8f4] border border-[#f0eae6] flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-[#c85a32] animate-spin" />
                  <span className="text-xs text-[#19202e]">Downsampling and compressing...</span>
                </div>
              )}
            </div>
          )}

          {/* Preview & Document Inspection */}
          {previewUrl && (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden bg-[#19202e] border border-[#e7e1de] flex items-center justify-center min-h-[220px] max-h-[340px]">
                <img
                  src={previewUrl}
                  alt="Paper preview"
                  style={{ transform: `rotate(${rotation}deg)` }}
                  className="max-h-[300px] w-auto object-contain transition-transform duration-200"
                />

                {/* Control Overlay */}
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 bg-[#19202e]/80  p-1 rounded-full text-white">
                  <button
                    type="button"
                    onClick={rotateImage}
                    title="Rotate 90°"
                    className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewUrl(null);
                      setCompressedBlob(null);
                      setFile(null);
                    }}
                    title="Remove"
                    className="p-1.5 hover:bg-red-500/30 rounded-full text-red-300 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Size badge */}
                <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-full bg-[#19202e]/85  text-[11px] font-mono text-white flex items-center gap-2">
                  <span className="line-through text-gray-400">{formatSize(originalSize)}</span>
                  <span className="text-[#fcd34d] font-semibold">? {compressedBlob ? formatSize(compressedBlob.size) : ''}</span>
                </div>
              </div>

              {/* Metadata Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#4a3b35] mb-1">Subject</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-[#e7e1de] bg-[#ffffff] focus:ring-1 focus:ring-[#c85a32]"
                  >
                    <option value="Combined Maths">Combined Maths</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#4a3b35] mb-1">Category</label>
                  <select
                    value={paperType}
                    onChange={(e) => setPaperType(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-[#e7e1de] bg-[#ffffff] focus:ring-1 focus:ring-[#c85a32]"
                  >
                    <option value="revision_note">Handwritten Notes / Tute</option>
                    <option value="past_paper">Structured Essay Proof</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#4a3b35] mb-1">Title / Unit Note</label>
                <input
                  type="text"
                  placeholder="e.g. Unit 4 Equilibrium Proof pg 3"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-[#e7e1de] bg-[#ffffff] focus:ring-1 focus:ring-[#c85a32]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#f0eae6] bg-[#fefaf8] flex items-center justify-between">
          <span className="text-[11px] text-[#4a3b35]">
            {compressedBlob ? 'Ready to archive' : 'Select or take a photo'}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#4a3b35] hover:bg-[#f3ede9] rounded-full transition-colors"
            >
              Cancel
            </button>
            {previewUrl && (
              <button
                type="button"
                disabled={isUploading}
                onClick={handleSave}
                className="px-5 py-2 text-xs font-semibold text-white bg-[#c85a32] hover:bg-[#b04b25] disabled:opacity-50 rounded-full transition-all flex items-center gap-2 shadow-xs"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Archiving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Save to Vault</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
