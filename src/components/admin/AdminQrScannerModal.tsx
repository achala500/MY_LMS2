'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import jsQR from 'jsqr';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { localDb } from '@/lib/storage/localDb';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { MemberData } from '@/types/member';
import { formatHoursHuman, isStudentVerified } from '@/lib/utils';
import { fireConfetti } from '@/lib/confetti';
import { toast } from 'sonner';
import {
  Camera,
  Upload,
  QrCode,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  UserCheck,
  RefreshCw,
  ExternalLink,
  BookOpen,
  School,
  Clock,
  Loader2,
  Sparkles,
} from 'lucide-react';

interface AdminQrScannerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStudentVerified?: (studyId: string, member: MemberData) => void;
}

export const AdminQrScannerModal: React.FC<AdminQrScannerModalProps> = ({
  open,
  onOpenChange,
  onStudentVerified,
}) => {
  const { user } = useAuth();
  const [mode, setMode] = useState<'camera' | 'upload'>('camera');
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scannedId, setScannedId] = useState<string | null>(null);
  const [scannedMember, setScannedMember] = useState<MemberData | null>(null);
  const [scannedHours, setScannedHours] = useState<number>(0);
  const [verifying, setVerifying] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Extract studyId from raw QR data
  const extractStudyId = (raw: string): string | null => {
    const trimmed = raw.trim();
    // 1. Check for URL format: ?id=XYZ
    try {
      if (trimmed.includes('?') && (trimmed.includes('http') || trimmed.includes('/verify'))) {
        const url = new URL(trimmed.startsWith('http') ? trimmed : `https://example.com${trimmed}`);
        const idParam = url.searchParams.get('id');
        if (idParam) return idParam.trim().toUpperCase();
      }
    } catch {
      // ignore URL parsing error
    }

    // 2. Check for JSON format
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed.studyId) return String(parsed.studyId).trim().toUpperCase();
      if (parsed.id) return String(parsed.id).trim().toUpperCase();
    } catch {
      // ignore JSON error
    }

    // 3. Raw format: SG-MATH-2601, SG-BIO-0001, STUDY-2601, etc.
    const match = trimmed.match(/[A-Z0-9_-]{4,20}/i);
    if (match) {
      return match[0].toUpperCase();
    }

    return trimmed.toUpperCase();
  };

  const handleQrDetected = useCallback(async (rawData: string) => {
    const targetId = extractStudyId(rawData);
    if (!targetId) {
      toast.error('Invalid QR Code. No candidate Study ID found.');
      return;
    }

    // Stop camera scanning loop
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    stopCamera();

    setScannedId(targetId);
    setVerificationSuccess(false);

    // Look up member from localDb first, fallback to API
    const members = localDb.getMembers();
    let found = members.find((m) => m.studyId.toUpperCase() === targetId);

    if (!found) {
      try {
        const res = await api.verifyMember(targetId);
        if (res.success && res.data?.member) {
          found = res.data.member as MemberData;
        }
      } catch {
        // Continue with minimal placeholder
      }
    }

    if (found) {
      setScannedMember(found);
      // Compute logged hours
      const logs = localDb.getLogs().filter((l) => l.studyId.toUpperCase() === targetId);
      const totalHrs = logs.reduce((acc, l) => acc + (l.totalHours || 0), 0);
      setScannedHours(totalHrs);
    } else {
      // Mock / fallback candidate for unregistered ID
      setScannedMember({
        studyId: targetId,
        fullName: 'Unregistered Candidate',
        stream: 'General Stream',
        school: 'Unverified Center',
        status: 'Unregistered',
      } as MemberData);
      setScannedHours(0);
    }

    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([80, 40, 80]);
      } catch {}
    }
  }, []);

  // Camera scan loop using requestAnimationFrame + jsQR
  const startCamera = async () => {
    setCameraError(null);
    setScanning(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        requestAnimationFrame(tickScan);
      }
    } catch (err: any) {
      console.warn('Camera error:', err);
      setCameraError(
        'Unable to access camera. Please check camera permissions, or upload a photo / screenshot of the candidate QR code instead.'
      );
      setMode('upload');
      setScanning(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setScanning(false);
  };

  const tickScan = () => {
    if (!videoRef.current || videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
      animFrameRef.current = requestAnimationFrame(tickScan);
      return;
    }

    const video = videoRef.current;
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'attemptBoth',
      });

      if (code && code.data) {
        handleQrDetected(code.data);
        return;
      }
    }

    animFrameRef.current = requestAnimationFrame(tickScan);
  };

  // Handle image file upload for QR code
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth',
        });

        if (code && code.data) {
          handleQrDetected(code.data);
        } else {
          toast.error('No QR code detected in this photo. Please try a clearer snapshot.');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Lifecycle when modal opens/closes
  useEffect(() => {
    if (open) {
      setScannedId(null);
      setScannedMember(null);
      setVerificationSuccess(false);
      setMode('camera');
      // Delay camera start slightly to allow modal transition
      const timer = setTimeout(() => {
        startCamera();
      }, 300);
      return () => clearTimeout(timer);
    } else {
      stopCamera();
    }
  }, [open]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Admin one-tap verify action
  const handleApproveStudent = async () => {
    if (!scannedMember || !scannedId) return;

    try {
      setVerifying(true);
      const updatedMember: MemberData = {
        ...scannedMember,
        status: 'Verified',
        adminVerified: true,
      };

      // 1. Update in localDb
      localDb.saveMember(updatedMember);

      // 2. Dispatch to API if possible
      if (user?.email) {
        try {
          await api.adminVerifyMember(user.email, scannedId, 'Verified');
        } catch {
          // localDb acts as source of truth
        }
      }

      setScannedMember(updatedMember);
      setVerificationSuccess(true);
      fireConfetti({ particleCount: 60, style: 'cards_only' });
      toast.success(`Candidate ${scannedMember.fullName} (#${scannedId}) is officially verified!`);

      if (onStudentVerified) {
        onStudentVerified(scannedId, updatedMember);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to verify candidate.');
    } finally {
      setVerifying(false);
    }
  };

  const handleResetScanner = () => {
    setScannedId(null);
    setScannedMember(null);
    setVerificationSuccess(false);
    setMode('camera');
    startCamera();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl bg-white border-2 border-[#19202e] text-[#19202e] p-6 rounded-3xl shadow-[6px_6px_0px_#19202e] overflow-hidden">
        <DialogHeader className="pb-4 border-b border-[#f3ede9]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#ffdcbc] border-2 border-[#19202e] flex items-center justify-center text-[#c85a32] shadow-[2px_2px_0px_#19202e]">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="font-serif text-xl font-bold text-[#19202e]">
                Candidate QR Scanner
              </DialogTitle>
              <DialogDescription className="text-xs text-[#4a3b35]">
                Scan a student pass or tuition badge to verify authenticity and admit into halls.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Mode Switcher */}
          {!scannedId && (
            <div className="flex items-center justify-center gap-2 p-1 bg-[#fef8f4] border-2 border-[#19202e] rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  setMode('camera');
                  startCamera();
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  mode === 'camera'
                    ? 'bg-[#19202e] text-white shadow-sm'
                    : 'text-[#4a3b35] hover:text-[#19202e]'
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>Live Camera</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('upload');
                  stopCamera();
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  mode === 'upload'
                    ? 'bg-[#19202e] text-white shadow-sm'
                    : 'text-[#4a3b35] hover:text-[#19202e]'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>Upload Photo / Pass</span>
              </button>
            </div>
          )}

          {/* Scanner Viewport */}
          {!scannedId && mode === 'camera' && (
            <div className="relative w-full aspect-square max-h-[320px] mx-auto rounded-2xl overflow-hidden border-2 border-[#19202e] bg-[#19202e] flex items-center justify-center">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />

              {/* Aiming Reticle Monoline Animation */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-dashed border-[#fa7268] rounded-2xl relative animate-pulse">
                  <div className="absolute -top-1.5 -left-1.5 w-4 h-4 border-t-4 border-l-4 border-[#c85a32] rounded-tl" />
                  <div className="absolute -top-1.5 -right-1.5 w-4 h-4 border-t-4 border-r-4 border-[#c85a32] rounded-tr" />
                  <div className="absolute -bottom-1.5 -left-1.5 w-4 h-4 border-b-4 border-l-4 border-[#c85a32] rounded-bl" />
                  <div className="absolute -bottom-1.5 -right-1.5 w-4 h-4 border-b-4 border-r-4 border-[#c85a32] rounded-br" />
                </div>
              </div>

              <div className="absolute bottom-3 px-3 py-1 rounded-full bg-black/70 text-white font-mono text-[11px]  border border-white/20">
                Point camera at student QR code
              </div>
            </div>
          )}

          {/* Upload Viewport */}
          {!scannedId && mode === 'upload' && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-[4/3] max-h-[260px] mx-auto rounded-2xl border-2 border-dashed border-[#19202e] bg-[#fef8f4] hover:bg-[#fff5ee] transition-colors flex flex-col items-center justify-center p-6 text-center cursor-pointer group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-2xl bg-white border-2 border-[#19202e] flex items-center justify-center text-[#c85a32] group-hover:scale-105 transition-transform mb-3 shadow-[2px_2px_0px_#19202e]">
                <Upload className="w-6 h-6" />
              </div>
              <p className="font-serif font-bold text-sm text-[#19202e]">
                Click or Drop Student Pass Photo
              </p>
              <p className="text-xs text-[#8a726a] mt-1 max-w-xs">
                Upload a screenshot, digital pass photo, or classroom attendance card.
              </p>
            </div>
          )}

          {cameraError && mode === 'camera' && (
            <div className="p-3.5 rounded-xl bg-amber-50 border-2 border-amber-300 text-amber-900 text-xs flex items-center gap-2">
              <span className="shrink-0 font-bold font-mono">Notice:</span>
              <span>{cameraError}</span>
            </div>
          )}

          {/* Scanned Candidate Profile Card */}
          {scannedId && scannedMember && (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="p-4 rounded-2xl bg-[#fef8f4] border-2 border-[#19202e] shadow-[2px_2px_0px_#19202e] space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#8a726a] font-bold">
                      Study ID
                    </span>
                    <div className="font-mono font-bold text-lg text-[#19202e] tracking-tight">
                      {scannedMember.studyId}
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border-2 ${
                      isStudentVerified(scannedMember) || verificationSuccess
                        ? 'bg-[#c6edc1] text-[#456644] border-[#456644]'
                        : 'bg-amber-100 text-amber-900 border-amber-500'
                    }`}
                  >
                    {isStudentVerified(scannedMember) || verificationSuccess ? (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Verified Candidate</span>
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Pending Approval</span>
                      </>
                    )}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2.5 rounded-xl bg-white border border-[#19202e]">
                    <span className="text-[10px] text-[#8a726a] font-mono uppercase block">Candidate Name</span>
                    <strong className="font-serif text-sm text-[#19202e] truncate block">
                      {scannedMember.fullName || 'Candidate'}
                    </strong>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-[#19202e]">
                    <span className="text-[10px] text-[#8a726a] font-mono uppercase block">Stream</span>
                    <strong className="font-serif text-sm text-[#19202e] truncate block">
                      {scannedMember.stream}
                    </strong>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-[#19202e]">
                    <span className="text-[10px] text-[#8a726a] font-mono uppercase block">School / Center</span>
                    <span className="font-sans font-medium text-xs text-[#19202e] truncate block">
                      {scannedMember.school || 'Colombo Examination Center'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-[#19202e]">
                    <span className="text-[10px] text-[#8a726a] font-mono uppercase block">Logged Study</span>
                    <span className="font-mono font-bold text-xs text-[#c85a32] block">
                      {formatHoursHuman(scannedHours)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                {!(isStudentVerified(scannedMember) || verificationSuccess) ? (
                  <Button
                    type="button"
                    onClick={handleApproveStudent}
                    disabled={verifying}
                    className="flex-1 bg-[#456644] hover:bg-[#344e33] text-white border-2 border-[#19202e] shadow-[2px_2px_0px_#19202e] font-bold rounded-2xl h-11 text-xs cursor-pointer flex items-center justify-center gap-2"
                  >
                    {verifying ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ShieldCheck className="w-4 h-4" />
                    )}
                    <span>Approve &amp; Verify Student</span>
                  </Button>
                ) : (
                  <div className="flex-1 p-2.5 rounded-2xl bg-[#c6edc1]/60 border-2 border-[#456644] text-[#456644] text-xs font-bold flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Candidate Verified for Admittance</span>
                  </div>
                )}

                <Button
                  type="button"
                  onClick={handleResetScanner}
                  variant="outline"
                  className="bg-white hover:bg-[#f8f2ef] border-2 border-[#19202e] text-[#19202e] font-bold rounded-2xl h-11 text-xs px-4 cursor-pointer flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Scan Next</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
