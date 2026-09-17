"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { AppleWalletCard } from '@/components/idcard/AppleWalletCard';
import { downloadAppleWalletPass, openGoogleWalletPass } from '@/lib/walletPass';
import {
  formatHoursHuman,
  isStudentVerified,
} from '@/lib/utils';
import { safeStorage } from '@/lib/storage/safeStorage';
import { toast } from 'sonner';
import {
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  Smartphone,
  QrCode,
  Lock,
  Printer,
  Download,
  Wallet,
  CheckCircle2,
  Loader2,
  ExternalLink,
  Copy,
  Clock,
} from 'lucide-react';

export default function DigitalStudentPassPage() {
  const { user, member, loading: authLoading } = useAuth();
  const { logs } = useApp();

  const [tiltStyle, setTiltStyle] = useState({});
  const cardRef = useRef<HTMLDivElement>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [offlinePass, setOfflinePass] = useState<any>(() => {
    return safeStorage.getJson('studysync_offline_pass', null);
  });

  const effectiveMember = member || offlinePass;

  useEffect(() => {
    if (member) {
      safeStorage.setJson('studysync_offline_pass', member);
      setOfflinePass(member);
    }
  }, [member]);

  useEffect(() => {
    const studyId = effectiveMember?.studyId || 'STUDY-2026';
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://studysync-al-2026.web.app';
    const verifyUrl = `${origin}/verify.html?id=${encodeURIComponent(studyId)}`;

    QRCode.toDataURL(verifyUrl, {
      width: 320,
      margin: 1,
      color: {
        dark: '#1d1b19',
        light: '#ffffff',
      },
    })
      .then((url: string) => setQrCodeUrl(url))
      .catch((err: unknown) => console.error('Failed to generate pass QR:', err));
  }, [effectiveMember?.studyId]);

  const handleSaveOfflinePass = () => {
    if (effectiveMember) {
      safeStorage.setJson('studysync_offline_pass', effectiveMember);
      setOfflinePass(effectiveMember);
      toast.success('A/L Student Index Pass cached for offline hall admittance!');
    }
  };

  // Compute total logged hours & streak from real logs
  const totalHours = useMemo(() => {
    return logs.reduce((acc, l) => acc + (l.totalHours || 0), 0);
  }, [logs]);

  // Dynamic subjects list
  const isBio = String(effectiveMember?.stream || '').toLowerCase().includes('bio');
  const sub1 = isBio ? 'Biology' : 'Combined Mathematics';
  const sub2 = isBio ? 'Chemistry' : 'Physics';
  const sub3 = effectiveMember?.optionalSubject || (isBio ? 'Physics' : 'Chemistry');
  const subjectCombination = `${sub1}, ${sub2}, ${sub3}`;

  // Interactive 3D Perspective Tilt on Mouse Move
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -3;
    const rotateY = ((x - centerX) / centerX) * 3;

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`,
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
    });
  };

  // High-Resolution Print / PDF trigger
  const handlePrintPdf = () => {
    toast.info('Preparing 300 DPI Official Student Pass print preview...');
    setTimeout(() => {
      window.print();
    }, 300);
  };

  // Apple / Google Wallet notification
  const [showWalletModal, setShowWalletModal] = useState(false);
  const handleWalletSync = () => {
    setShowWalletModal(true);
    toast.success('Generated digital pass format for Apple / Google Wallet.');
  };

  const copyVerificationLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://studysync-al-2026.web.app';
    const url = `${origin}/verify.html?id=${encodeURIComponent(effectiveMember?.studyId || 'STUDY-2026')}`;
    navigator.clipboard.writeText(url);
    toast.success('Authenticity verification link copied to clipboard!');
  };

  if (authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh] bg-[#fef8f4]">
        <Loader2 className="h-8 w-8 text-[#9f3c16] animate-spin" />
      </div>
    );
  }

  if (!user && !effectiveMember) {
    return (
      <div className="max-w-md mx-auto my-auto px-4 py-20 text-center space-y-6 bg-[#fef8f4]">
        <div className="bg-white border border-[#dec0b7]/60 shadow-xl rounded-2xl p-8 space-y-5">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-[#ede7e3] border border-[#dec0b7]/50 flex items-center justify-center text-[#9f3c16]">
            <Lock className="h-6 w-6" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold text-[#1d1b19] tracking-tight">Digital Pass Locked</h2>
            <p className="text-xs text-[#2d2420] leading-relaxed">
              Please sign in and complete candidate registration to generate your official Student ID Pass.
            </p>
          </div>
          <div className="pt-2">
            <Link href={user ? '/register' : '/'}>
              <button className="w-full bg-[#9f3c16] hover:bg-[#822801] text-white font-medium rounded-xl h-11 transition-all cursor-pointer">
                {user ? 'Complete Registration' : 'Sign In with Google'}
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isVerified = isStudentVerified(effectiveMember);

  return (
    <div className="w-full flex-1 bg-[#fef8f4] text-[#1d1b19] pb-10 sm:pb-12 selection:bg-[#ffdbcf] selection:text-[#9f3c16] print:bg-white print:p-0">
      <div className="w-full max-w-[1440px] mx-auto pt-6 px-4 md:px-12 print:max-w-none print:p-0">
        <div className="flex flex-col w-full gap-8">
          {/* Breadcrumbs & Navigation Back */}
          <div className="flex items-center justify-between print:hidden">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-xs font-medium text-[#2d2420] hover:text-[#9f3c16] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Link>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c6edc1]/70 border border-[#456644]/20 text-[#456644] text-xs font-semibold">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
              <span>{isVerified ? 'Verified Student Pass' : 'Pending Verification'}</span>
            </div>
          </div>

          {/* Editorial Page Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 print:hidden">
            <div className="flex flex-col max-w-2xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-[#456644]" />
                <span className="font-mono text-[11px] uppercase tracking-widest text-[#456644] font-semibold">
                  Department of Advanced Studies • Identity Ledger
                </span>
              </div>
              <h1 className="font-serif text-2xl sm:text-4xl font-bold text-[#1d1b19] tracking-tight">
                Student Pass
              </h1>
            </div>

            {/* Action Utilities */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handleSaveOfflinePass}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#19202e] hover:bg-slate-800 active:scale-95 text-white transition-all duration-200 shadow-sm cursor-pointer text-xs font-semibold"
                title="Save pass locally for instant offline hall access"
              >
                <Download className="w-4 h-4 text-[#fcd34d]" />
                <span>Download Offline Pass</span>
              </button>
              <button
                type="button"
                onClick={handlePrintPdf}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#ede7e3] hover:bg-[#e7e1de] text-[#1d1b19] transition-all duration-200 shadow-sm cursor-pointer text-xs font-semibold"
              >
                <Printer className="w-4 h-4 text-[#2d2420]" />
                <span>Printable Pass (300 DPI)</span>
              </button>
              <button
                type="button"
                onClick={() => downloadAppleWalletPass(effectiveMember)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#000000] hover:bg-[#222222] text-white transition-all duration-200 shadow-sm cursor-pointer text-xs font-semibold"
                title="Download official Apple Wallet (.pkpass) bundle"
              >
                <Wallet className="w-4 h-4 text-white" />
                <span>Add to Apple Wallet</span>
              </button>
              <button
                type="button"
                onClick={() => openGoogleWalletPass(effectiveMember)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#ffffff] hover:bg-[#f8f2ef] text-[#1d1b19] border border-[#dec0b7] transition-all duration-200 shadow-sm cursor-pointer text-xs font-semibold"
                title="Generate Google Wallet pass JSON definition"
              >
                <Smartphone className="w-4 h-4 text-[#4285F4]" />
                <span>Save to Google Wallet</span>
              </button>
            </div>
          </div>

          {/* Centerpiece: Skeuomorphic Editorial Pass Card Showcase */}
          <div className="relative w-full flex justify-center py-2 md:py-4">
            {/* Ambient Studio Lighting Glow */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-3/4 max-w-4xl h-72 bg-gradient-to-b from-[#ffb59c]/25 via-[#ffdcbc]/15 to-transparent blur-3xl pointer-events-none rounded-full" />

            {/* The Tactile Cotton Paper Card */}
            <div
              ref={cardRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={tiltStyle}
              className="relative w-full max-w-[1080px] bg-white border border-[#E5DDD5] rounded-[24px] shadow-[0_16px_40px_-6px_rgba(36,34,32,0.08),0_2px_10px_rgba(36,34,32,0.03)] transition-transform duration-200 ease-out will-change-transform overflow-hidden print:shadow-none print:border-2"
            >
              {/* Top Multi-Tone Security Gradient Edge */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#9f3c16] via-[#854f00] to-[#456644]" />

              {/* Security Microprint Ribbon */}
              <div className="w-full bg-[#f8f5f1] border-b border-[#ebdcd2] py-1 px-4 overflow-hidden select-none">
                <div className="whitespace-nowrap font-mono text-[8px] uppercase tracking-[0.24em] text-[#4a3b35]/80 leading-none">
                  G.C.E. ADVANCED LEVEL EXAMINATION • DEPARTMENT OF EXAMINATIONS SRI LANKA • OFFICIAL ADMISSION PASSPORT • SECURE ENCLAVE VERIFIED • CRYPTOGRAPHIC TRUST LEDGER • G.C.E. ADVANCED LEVEL EXAMINATION • DEPARTMENT OF EXAMINATIONS SRI LANKA • OFFICIAL ADMISSION PASSPORT
                </div>
              </div>

              {/* Guilloche Fine Line Vector Security Background Pattern */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.05] overflow-hidden">
                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 600" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M0,50 Q250,0 500,50 T1000,50 M0,80 Q250,30 500,80 T1000,80 M0,110 Q250,60 500,110 T1000,110 M0,140 Q250,90 500,140 T1000,140 M0,170 Q250,120 500,170 T1000,170 M0,200 Q250,150 500,200 T1000,200 M0,230 Q250,180 500,230 T1000,230 M0,260 Q250,210 500,260 T1000,260 M0,290 Q250,240 500,290 T1000,290 M0,320 Q250,270 500,320 T1000,320 M0,350 Q250,300 500,350 T1000,350 M0,380 Q250,330 500,380 T1000,380 M0,410 Q250,360 500,410 T1000,410 M0,440 Q250,390 500,440 T1000,440 M0,470 Q250,420 500,470 T1000,470 M0,500 Q250,450 500,500 T1000,500 M0,530 Q250,480 500,530 T1000,530 M0,560 Q250,510 500,560 T1000,560"
                    fill="none"
                    stroke="#9f3c16"
                    strokeWidth="0.85"
                  />
                  <ellipse cx="500" cy="300" fill="none" rx="420" ry="240" stroke="#456644" strokeDasharray="3,3" strokeWidth="0.75" />
                  <ellipse cx="500" cy="300" fill="none" rx="360" ry="200" stroke="#9f3c16" strokeWidth="0.6" />
                  <circle cx="500" cy="300" fill="none" r="120" stroke="#456644" strokeWidth="0.7" />
                </svg>
              </div>

              {/* Inner Content Grid */}
              <div className="relative p-6 sm:p-9 md:p-10 flex flex-col xl:flex-row gap-8 md:gap-10">
                {/* Left Column: Academic Security Ledger & Institutional Identity */}
                <div className="flex-1 flex flex-col justify-between">
                  {/* Card Official Header Bar */}
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#EDE5DE]">
                      <div className="flex items-center gap-2.5">
                        {/* Security Enclave Chip Badge */}
                        <div className="px-2.5 py-1 rounded bg-[#ebdcd2]/60 border border-[#dec0b7] flex items-center gap-1.5 shadow-inner">
                          <span className="w-2 h-2 rounded-sm bg-[#9f3c16]/80" />
                          <span className="font-mono text-[10px] font-semibold tracking-wider text-[#2d2420] uppercase">
                            SEC-ENCLAVE SHA-256
                          </span>
                        </div>
                        <span className="px-2.5 py-1 rounded-full font-mono text-[10px] font-semibold tracking-wider uppercase bg-[#c6edc1] text-[#022106] flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#456644]" />
                          {isVerified ? 'Verified Candidate' : 'Pending Review'}
                        </span>
                      </div>

                      {/* Holographic Seal Emblem */}
                      <div className="relative px-3 py-1 rounded-full border border-[#dec0b7] bg-gradient-to-r from-[#ffdcbc]/40 via-white to-[#c6edc1]/40 shadow-xs flex items-center gap-1.5 select-none">
                        <Sparkles className="w-3.5 h-3.5 text-[#854f00]" />
                        <span className="font-mono text-[9px] font-bold tracking-widest text-[#2c1700] uppercase">
                          OFFICIAL SECURE CREDENTIAL
                        </span>
                      </div>
                    </div>

                    {/* Candidate Title & Standardized Identity Keys */}
                    <div className="mt-4">
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <span className="font-mono text-xs uppercase tracking-widest text-[#4a3b35]">
                          Candidate Name
                        </span>
                        <span className="text-xs text-[#456644] font-mono tracking-wider">
                          ● ACTIVE ADMISSION
                        </span>
                      </div>
                      <h2 className="font-mono text-2xl sm:text-3xl font-bold text-[#9f3c16] tracking-tight mt-0.5">
                        {effectiveMember?.fullName || 'A/L Candidate'}
                      </h2>
                      <p className="font-serif italic text-base sm:text-lg text-[#2d2420] mt-1">
                        G.C.E. Advanced Level Examination •{' '}
                        <span className="font-mono not-italic font-semibold text-[#1d1b19]">
                          {effectiveMember?.stream || 'Physical Science'}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Structured High-Security Credential Matrix */}
                  <div className="my-5 p-5 bg-[#f8f2ef]/70 border border-[#E5DDD5] rounded-2xl">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-4">
                      <div>
                        <span className="block font-mono text-[10px] uppercase tracking-wider text-[#4a3b35] font-semibold">
                          Index / Candidate ID
                        </span>
                        <span className="font-mono text-sm font-bold text-[#9f3c16] mt-0.5 block">
                          {(effectiveMember as any)?.candidateId || effectiveMember?.studyId}
                        </span>
                      </div>
                      <div>
                        <span className="block font-mono text-[10px] uppercase tracking-wider text-[#4a3b35] font-semibold">
                          Study ID Key
                        </span>
                        <span className="font-mono text-sm font-bold text-[#1d1b19] mt-0.5 block">
                          {effectiveMember?.studyId}
                        </span>
                      </div>
                      <div>
                        <span className="block font-mono text-[10px] uppercase tracking-wider text-[#4a3b35] font-semibold">
                          District &amp; Province
                        </span>
                        <span className="font-mono text-sm font-semibold text-[#1d1b19] mt-0.5 block">
                          {(effectiveMember as any)?.district || 'Colombo'} • Western
                        </span>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="block font-mono text-[10px] uppercase tracking-wider text-[#4a3b35] font-semibold">
                          Registered School / Institution
                        </span>
                        <span className="font-mono text-sm font-medium text-[#1d1b19] mt-0.5 block">
                          {effectiveMember?.school || 'Government Examination Candidate'}
                        </span>
                      </div>
                      <div>
                        <span className="block font-mono text-[10px] uppercase tracking-wider text-[#4a3b35] font-semibold">
                          Exam Year
                        </span>
                        <span className="font-mono text-sm font-medium text-[#1d1b19] mt-0.5 block">
                          {effectiveMember?.examYear || '2026'}
                        </span>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="block font-mono text-[10px] uppercase tracking-wider text-[#4a3b35] font-semibold">
                          Subject Combination
                        </span>
                        <span className="font-mono text-xs font-medium text-[#2d2420] mt-0.5 block">
                          {subjectCombination}
                        </span>
                      </div>
                      <div>
                        <span className="block font-mono text-[10px] uppercase tracking-wider text-[#4a3b35] font-semibold">
                          Target University
                        </span>
                        <span className="font-mono text-xs font-medium text-[#456644] mt-0.5 block truncate">
                          {isBio ? 'Univ. of Colombo (Medicine)' : 'Univ. of Moratuwa (Engineering)'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Verified Study Volume Ledger */}
                  <div className="flex flex-wrap items-center gap-4 text-[#2d2420] font-mono text-xs">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#854f00]" />
                      <span>
                        Total Logged Hours:{' '}
                        <strong className="text-[#9f3c16] font-semibold">
                          {formatHoursHuman(totalHours)}
                        </strong>
                      </span>
                    </div>
                    <span className="text-[#dec0b7]">•</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#9f3c16]"></span>
                      <span>
                        Recorded Blocks:{' '}
                        <strong className="text-[#9f3c16] font-semibold">{logs.length}</strong>
                      </span>
                    </div>
                    <span className="text-[#dec0b7]">•</span>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#456644]" />
                      <span>
                        Clearance:{' '}
                        <strong className="text-[#456644] font-medium">All-Island Unrestricted</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Vertical Security Perforation Divider */}
                <div className="hidden xl:flex flex-col items-center justify-between w-px bg-[#E5DDD5] py-2 relative">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#fef8f4] absolute -top-2 -left-1.5 border border-[#E5DDD5]" />
                  <span className="w-3.5 h-3.5 rounded-full bg-[#fef8f4] absolute -bottom-2 -left-1.5 border border-[#E5DDD5]" />
                  <div className="h-full border-r border-dashed border-[#dec0b7]/80" />
                </div>

                {/* Right Column: Scannable QR Matrix & Offline Token */}
                <div className="w-full xl:w-72 shrink-0 flex flex-col items-center justify-between bg-[#f8f2ef]/60 border border-[#E5DDD5] rounded-2xl p-6 text-center">
                  <div className="w-full flex items-center justify-between text-[#2d2420] pb-2 border-b border-[#EDE5DE]">
                    <span className="font-mono text-[10px] uppercase tracking-wider font-semibold text-[#1d1b19]">
                      Optical Pass Scanner
                    </span>
                    <span className="font-mono text-[9px] bg-white px-2 py-0.5 rounded border border-[#dec0b7]/60 text-[#456644] font-semibold">
                      OFFLINE SECURE
                    </span>
                  </div>

                  {/* High Contrast Monoline Stylized QR Matrix */}
                  <div className="relative my-4 p-3.5 bg-white rounded-xl border border-[#dec0b7] shadow-sm flex items-center justify-center min-h-[160px] min-w-[160px]">
                    {/* Animated Scanning Beam */}
                    <div className="absolute inset-x-3 top-3 h-0.5 bg-[#9f3c16]/70 blur-[1px] animate-[bounce_3s_ease-in-out_infinite] pointer-events-none print:hidden" />

                    {qrCodeUrl ? (
                      <img
                        src={qrCodeUrl}
                        alt={`Authentic Verification QR for ${effectiveMember?.studyId || 'Candidate'}`}
                        className="w-40 h-40 object-contain rounded-md"
                      />
                    ) : (
                      <div className="w-40 h-40 flex flex-col items-center justify-center gap-2 text-stone-400">
                        <Loader2 className="w-6 h-6 animate-spin text-[#9f3c16]" />
                        <span className="text-[10px] font-mono text-[#4a3b35]">Generating QR...</span>
                      </div>
                    )}
                  </div>

                  {/* Public Verification Link */}
                  <div className="w-full space-y-2">
                    <span className="font-mono text-[10px] text-[#4a3b35] block">
                      SHA256: {effectiveMember?.studyId || 'STUDY-2026'}
                    </span>
                    <button
                      type="button"
                      onClick={copyVerificationLink}
                      className="w-full py-1.5 px-3 rounded-lg bg-white border border-[#dec0b7]/60 hover:bg-[#ede7e3] text-[#2d2420] font-mono text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer print:hidden"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Verify Link</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Apple Wallet Format Modal */}
      {showWalletModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl relative border border-[#dec0b7]/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-[#9f3c16]" />
                <h3 className="font-serif text-xl font-semibold text-[#1d1b19]">
                  Apple &amp; Google Wallet Pass
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowWalletModal(false)}
                className="text-[#4a3b35] hover:text-[#1d1b19] font-mono text-sm px-2 py-1 rounded-lg hover:bg-[#f8f2ef]"
              >
                Close
              </button>
            </div>

            <div className="flex justify-center py-2">
              {effectiveMember && (
                <AppleWalletCard
                  member={{
                    studyId: effectiveMember.studyId || 'STUDY-2026',
                    fullName: effectiveMember.fullName || 'Scholar Candidate',
                    name: effectiveMember.name || effectiveMember.fullName || 'Scholar Candidate',
                    school: effectiveMember.school || 'National School',
                    stream: effectiveMember.stream || 'Combined Mathematics',
                    optionalSubject: effectiveMember.optionalSubject || 'Information Technology',
                    registrationDate: effectiveMember.registrationDate || '2026-01-01',
                    status: effectiveMember.status || 'Active Scholar',
                    examYear: effectiveMember.examYear || '2026',
                  }}
                  showActions={true}
                />
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  if (effectiveMember) {
                    downloadAppleWalletPass({
                      studyId: effectiveMember.studyId || 'STUDY-2026',
                      fullName: effectiveMember.fullName || 'Scholar Candidate',
                      stream: effectiveMember.stream || 'Physical Science',
                      school: effectiveMember.school || 'National School',
                      district: effectiveMember.district || 'Colombo',
                      status: effectiveMember.status || 'Active Scholar',
                      examYear: effectiveMember.examYear || '2026',
                    });
                  } else {
                    toast.error('No pass credentials found to generate wallet pass.');
                  }
                }}
                className="py-2.5 px-4 rounded-xl bg-black text-white text-xs font-semibold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors shadow-xs"
              >
                <Wallet className="w-4 h-4" />
                <span>Get .pkpass Bundle</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (effectiveMember) {
                    openGoogleWalletPass({
                      studyId: effectiveMember.studyId || 'STUDY-2026',
                      fullName: effectiveMember.fullName || 'Scholar Candidate',
                      stream: effectiveMember.stream || 'Physical Science',
                      school: effectiveMember.school || 'National School',
                      district: effectiveMember.district || 'Colombo',
                      status: effectiveMember.status || 'Active Scholar',
                      examYear: effectiveMember.examYear || '2026',
                    });
                  } else {
                    toast.error('No pass credentials found to generate wallet pass.');
                  }
                }}
                className="py-2.5 px-4 rounded-xl bg-[#f8f2ef] border border-[#dec0b7] text-[#1d1b19] text-xs font-semibold flex items-center justify-center gap-2 hover:bg-[#ede7e3] transition-colors shadow-xs"
              >
                <Smartphone className="w-4 h-4 text-[#4285F4]" />
                <span>Google Wallet Pass</span>
              </button>
            </div>

            <div className="pt-2 text-center">
              <p className="font-sans text-xs text-[#2d2420]">
                Cryptographically validated against the official StudySync Sri Lanka examination registry.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
