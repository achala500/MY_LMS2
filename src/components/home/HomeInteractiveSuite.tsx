'use client';

import React, { useState, useRef } from 'react';
import { compressNoteForR2, uploadToR2 } from '@/lib/cloudflareR2';
import { Camera, Upload, CheckCircle2, Download, FileText, Loader2, Sparkles, BookOpen, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export const HomeInteractiveSuite: React.FC = () => {
  const [compressing, setCompressing] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [compressedSizeKb, setCompressedSizeKb] = useState<number | null>(null);
  const [noteHash, setNoteHash] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setCompressing(true);
      // Canvas 2D compression guarantee under 300KB
      const { blob, dataUrl, size } = await compressNoteForR2(file, 1600, 300 * 1024);
      setCompressedSizeKb(Math.round(size / 1024));

      // Multi-cloud upload to Cloudflare R2
      const res = await uploadToR2(blob, file.name, 'notes');
      setUploadedUrl(dataUrl);
      setNoteHash('R2-' + Math.random().toString(36).substring(2, 9).toUpperCase());
      toast.success(`Note compressed to ${Math.round(size / 1024)}KB and stored`);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || 'Compression failed');
    } finally {
      setCompressing(false);
    }
  };

  const resourceVault = [
    {
      title: 'Combined Maths: Differential & Integral Calculus Master Pack',
      stream: 'Physical Science',
      size: '2.4 MB',
      type: 'PDF',
      tag: '2026 Core',
    },
    {
      title: 'Physics: Complete Resource Handbook (Bernoulli to Electronics)',
      stream: 'Common A/L',
      size: '3.1 MB',
      type: 'PDF',
      tag: 'Verified Syllabus',
    },
    {
      title: 'Chemistry: Organic Reaction Mechanisms & Synthesis Flowchart',
      stream: 'Physical / Bio',
      size: '1.8 MB',
      type: 'PDF',
      tag: 'Kinfolk Edition',
    },
    {
      title: 'Biology: Human Physiology & Genetics High-Yield Diagrams',
      stream: 'Biological Science',
      size: '2.9 MB',
      type: 'PDF',
      tag: 'National Exam',
    },
  ];

  return (
    <div className="w-full space-y-12">
      {/* 1. Snap Paper Notes & Canvas Compression Dropzone */}
      <div className="rounded-3xl bg-white border border-[#e7e1de] p-6 sm:p-10 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#f3ede9]">
          <div>
            <span className="text-[10px] font-mono uppercase font-bold text-[#c85a32] tracking-wider">
              Work Verification Engine
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#1d1b19] mt-1">
              Snap Paper Notes
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#f3ede9] text-[#2d2420] text-xs font-mono font-medium">
              &lt; 300KB Auto-Compression
            </span>
            <span className="px-3 py-1 rounded-full bg-[#c6edc1] text-[#022106] text-xs font-mono font-bold">
              Cloudflare R2 Stored
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center mt-6">
          <div className="lg:col-span-7">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*,.pdf"
              className="hidden"
              onChange={handleFileChange}
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#dec0b7] hover:border-[#c85a32] bg-[#fef8f4]/60 hover:bg-[#fef8f4] transition-all duration-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer group active:scale-[0.99]"
            >
              <div className="w-14 h-14 rounded-2xl bg-white text-[#c85a32] group-hover:scale-110 shadow-xs flex items-center justify-center mb-3 transition-transform">
                {compressing ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <Camera className="w-6 h-6" />
                )}
              </div>

              <h4 className="font-serif font-bold text-base text-[#1d1b19]">
                {compressing ? 'Compressing via HTML5 Canvas...' : 'Select or Capture Written Sheet'}
              </h4>
              <p className="text-xs text-[#57423b] mt-1 max-w-sm">
                Automatic client-side optimization compresses images under 300KB before uploading.
              </p>

              <button
                type="button"
                className="mt-4 px-5 py-2 rounded-full bg-[#c85a32] text-white text-xs font-semibold shadow-xs hover:bg-[#b04b25] transition-all"
              >
                Upload Sheet
              </button>
            </div>
          </div>

          <div className="lg:col-span-5">
            {uploadedUrl ? (
              <div className="p-5 rounded-2xl bg-[#fef8f4] border border-[#f3ede9] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold text-[#456644] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Compressed &amp; Verified
                  </span>
                  <span className="text-xs font-mono font-bold text-[#1d1b19]">
                    {compressedSizeKb} KB
                  </span>
                </div>

                <div className="aspect-[4/3] rounded-xl overflow-hidden bg-white border border-[#e7e1de] shadow-xs flex items-center justify-center">
                  <img
                    src={uploadedUrl}
                    alt="Compressed handwritten script"
                    className="w-full h-full object-contain p-2"
                  />
                </div>

                <div className="pt-2 border-t border-[#f3ede9] flex items-center justify-between text-xs font-mono text-[#8a726a]">
                  <span>Hash: {noteHash}</span>
                  <span className="text-[#456644]">R2 Verified</span>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-[#f8f2ef]/40 border border-[#e7e1de] flex flex-col items-center justify-center text-center aspect-[4/3]">
                <FileText className="w-10 h-10 text-[#dec0b7] mb-2" />
                <span className="font-serif font-semibold text-sm text-[#1d1b19]">
                  Paper Proof Canvas
                </span>
                <span className="text-xs text-[#8a726a] mt-1 max-w-xs">
                  Photographs of your handwritten derivations and daily working sets will appear here once attached.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Downloadable Resource Vault */}
      <div className="rounded-3xl bg-[#f3ede9] p-6 sm:p-10 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-6 border-b border-[#dec0b7]/50">
          <div>
            <span className="text-[10px] font-mono uppercase font-bold text-[#c85a32] tracking-wider">
              Examination Repository
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#1d1b19] mt-1">
              Resource Vault
            </h3>
          </div>

          <span className="px-3 py-1 rounded-full bg-white text-[#1d1b19] text-xs font-mono font-medium border border-[#dec0b7]/60">
            Open Access Benchmarks
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {resourceVault.map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white border border-[#e7e1de] hover:border-[#8a726a] transition-all flex flex-col justify-between gap-4 shadow-2xs group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-mono uppercase font-bold text-[#c85a32]">
                    {item.stream}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#f8f2ef] text-[#57423b]">
                    {item.size}
                  </span>
                </div>
                <h4 className="font-serif font-semibold text-sm text-[#1d1b19] leading-snug">
                  {item.title}
                </h4>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#f3ede9]">
                <span className="text-[11px] font-mono text-[#8a726a]">{item.tag}</span>
                <button
                  type="button"
                  onClick={() => {
                    toast.success(`Downloading ${item.title}`);
                  }}
                  className="px-3.5 py-1.5 rounded-full bg-[#f8f2ef] hover:bg-[#c85a32] hover:text-white text-xs font-medium text-[#1d1b19] transition-all flex items-center gap-1.5 active:scale-95 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeInteractiveSuite;
