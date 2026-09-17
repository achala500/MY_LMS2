'use client';

import React, { useRef, useEffect, useState } from 'react';
import { IdCard, MemberIdCardData, EXPORT_SCALE_3X } from '@/lib/idcard';
import { Button } from '@/components/ui/button';
import { Download, ShieldCheck, Sparkles, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

export interface AppleWalletCardProps {
  member: MemberIdCardData;
  showActions?: boolean;
  className?: string;
}

export function AppleWalletCard({
  member,
  showActions = true,
  className = '',
}: AppleWalletCardProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cardContainerRef = useRef<HTMLDivElement | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tiltStyle, setTiltStyle] = useState<React.CSSProperties>({});
  const [glarePosition, setGlarePosition] = useState<{ x: number; y: number; opacity: number }>({
    x: 50,
    y: 50,
    opacity: 0,
  });

  useEffect(() => {
    if (canvasRef.current && member && member.studyId) {
      IdCard.renderToCanvas(member, canvasRef.current, 1).catch((err) => {
        console.error('Error rendering ID card canvas:', err);
      });
    }
  }, [member]);

  const updateCardTilt = (clientX: number, clientY: number) => {
    if (!cardContainerRef.current) return;
    const rect = cardContainerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    const glareX = Math.round((x / rect.width) * 100);
    const glareY = Math.round((y / rect.height) * 100);

    setGlarePosition({ x: glareX, y: glareY, opacity: 0.35 });
    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.025, 1.025, 1.025)`,
      transition: 'transform 0.08s ease-out',
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    updateCardTilt(e.clientX, e.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 0) {
      updateCardTilt(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleMouseLeave = () => {
    setGlarePosition((prev) => ({ ...prev, opacity: 0 }));
    setTiltStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
    });
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      await IdCard.downloadPass(member, EXPORT_SCALE_3X);
      toast.success('StudySync Platform ID Card downloaded in high-resolution (300 DPI)!');
    } catch (err: any) {
      toast.error('Failed to export ID card image: ' + err.message);
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyStudyId = () => {
    if (!member.studyId) return;
    navigator.clipboard.writeText(member.studyId);
    setCopied(true);
    toast.success(`Study ID copied: ${member.studyId}`);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className={`flex flex-col items-center gap-6 ${className}`}>
      {/* 3D Tilt Card Shell with Dynamic Specular Glare */}
      <div
        ref={cardContainerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseLeave}
        style={tiltStyle}
        className="w-full max-w-[480px] rounded-3xl p-1 bg-gradient-to-tr from-zinc-800/90 via-indigo-500/20 to-zinc-700/80 shadow-2xl backdrop-blur-2xl cursor-pointer will-change-transform relative group select-none"
      >
        <div className="relative rounded-[22px] overflow-hidden bg-[#07090E]">
          <canvas
            ref={canvasRef}
            className="w-full h-auto block rounded-[22px]"
          />

          {/* Dynamic Specular Sheen Glare Layer */}
          <div
            className="pointer-events-none absolute inset-0 rounded-[22px] transition-opacity duration-300"
            style={{
              opacity: glarePosition.opacity,
              background: `radial-gradient(circle 320px at ${glarePosition.x}% ${glarePosition.y}%, rgba(255, 255, 255, 0.28) 0%, rgba(255, 255, 255, 0.08) 45%, transparent 80%)`,
              mixBlendMode: 'overlay',
            }}
          />
        </div>
      </div>

      {/* Card Action Controls */}
      {showActions && (
        <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-[480px]">
          <Button
            onClick={handleDownload}
            disabled={downloading}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl h-11 px-5 shadow-lg shadow-indigo-600/30 flex items-center gap-2 flex-1 sm:flex-initial"
          >
            <Download className="h-4 w-4" />
            <span>{downloading ? 'Generating Pass...' : 'Download 3x PNG (1440x906)'}</span>
          </Button>

          <Button
            variant="outline"
            onClick={handleCopyStudyId}
            className="border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 rounded-xl h-11 px-4 flex items-center gap-2"
          >
            {copied ? (
              <Check className="h-4 w-4 text-emerald-400" />
            ) : (
              <Copy className="h-4 w-4 text-zinc-400" />
            )}
            <span className="font-mono text-xs">{member.studyId || 'Copy ID'}</span>
          </Button>

          <a
            href={`/verify.html?id=${encodeURIComponent(member.studyId || '')}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="outline"
              className="border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 rounded-xl h-11 px-4 flex items-center gap-2"
            >
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Verify Link</span>
            </Button>
          </a>
        </div>
      )}
    </div>
  );
}

export default AppleWalletCard;
