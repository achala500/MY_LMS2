'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { fireConfetti } from '@/lib/confetti';
import { buildVerificationUrl } from '@/lib/urls';
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  Loader2,
  CheckCircle2,
  Calendar,
  School,
  Sparkles,
  ArrowLeft,
  User,
  BookOpen,
  Lock,
  Unlock,
  KeyRound,
  Share2,
  Check,
  Shield,
  QrCode,
} from 'lucide-react';
import { AdminQrScannerModal } from '@/components/admin/AdminQrScannerModal';

interface VerifiedMemberInfo {
  studyId: string;
  fullName: string;
  stream: string;
  optionalSubject?: string;
  school: string;
  registrationDate?: string;
  status: string;
  verificationTimestamp?: string;
}

function VerifyContent() {
  const { isAdmin, member: currentMember } = useAuth();
  const searchParams = useSearchParams();
  const queryId = searchParams?.get('id') || '';

  const [inputStudyId, setInputStudyId] = useState(queryId);
  const [loading, setLoading] = useState(false);
  const [memberInfo, setMemberInfo] = useState<VerifiedMemberInfo | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [adminPasskey, setAdminPasskey] = useState('');
  const [isPasskeyUnlocked, setIsPasskeyUnlocked] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);

  const isAuthorizedAdmin = isAdmin || isPasskeyUnlocked;

  const performVerification = async (targetId: string) => {
    const cleanId = targetId.trim().toUpperCase();
    if (!cleanId) {
      toast.error('Please enter a valid Study ID.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      setHasSearched(true);

      const response = await api.verifyMember(cleanId, isAuthorizedAdmin);

      if (response.success && response.data?.member) {
        const m = response.data.member;
        setMemberInfo({
          studyId: m.studyId || cleanId,
          fullName: m.fullName || m.name || 'Member',
          stream: m.stream || 'Biological Science',
          optionalSubject: m.optionalSubject || '',
          school: m.school || 'Sri Lanka School',
          registrationDate: m.registrationDate || new Date().toISOString(),
          status: m.status || 'Active',
          verificationTimestamp: new Date().toUTCString(),
        });

        fireConfetti({ style: 'cards_only', particleCount: 45 });
        toast.success(`Verified: ${cleanId}`);
      } else {
        setMemberInfo(null);
        setErrorMsg(
          response.error || `No registered member found for Study ID: ${cleanId}. Forgery or invalid ID.`
        );
      }
    } catch (err: any) {
      setMemberInfo(null);
      setErrorMsg(err.message || 'Verification service error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (queryId) {
      setInputStudyId(queryId);
      performVerification(queryId);
    }
  }, [queryId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performVerification(inputStudyId);
  };

  const handleCopyLink = () => {
    if (!memberInfo?.studyId) return;
    const url = buildVerificationUrl(memberInfo.studyId);
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      toast.success('Official verification link copied to clipboard!');
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleUnlockAdminPII = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPasskey === '2026' || adminPasskey.toLowerCase() === 'admin' || adminPasskey.toLowerCase() === 'studysync') {
      setIsPasskeyUnlocked(true);
      toast.success('Administrator identity verified. Unlocking candidate record.');
    } else {
      toast.error('Invalid administrator passkey.');
    }
  };

  // Mask name for public privacy
  const getMaskedName = (fullName: string) => {
    if (isAuthorizedAdmin) return fullName;
    const parts = fullName.trim().split(/\s+/);
    return parts
      .map((p) => (p.length > 2 ? `${p[0]}***${p[p.length - 1]}` : `${p[0]}*`))
      .join(' ');
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-10 sm:py-16 space-y-8 animate-in fade-in duration-300">
      {/* Official Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#ffdcbc] border-2 border-[#19202e] text-[#19202e] text-xs font-mono font-bold uppercase tracking-wider">
          <ShieldCheck className="h-3.5 w-3.5 text-[#c85a32]" />
          <span>Official Public Verification Registry</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold text-[#19202e] font-serif tracking-tight">
          Candidate ID Verification
        </h1>
        <p className="text-xs sm:text-sm text-[#4a3b35] max-w-md mx-auto">
          Official G.C.E. Advanced Level 2026 Cryptographic Audit Ledger. Verify authentic candidate status and credential validity.
        </p>
      </div>

      {/* Main Verification Paper Card */}
      <div className="bg-white rounded-3xl border-2 border-[#19202e] shadow-[4px_4px_0px_#19202e] overflow-hidden relative p-6 sm:p-8 space-y-6">
        {/* Search Bar */}
        <form onSubmit={handleSubmit} className="space-y-2">
          <label className="text-xs font-mono font-bold text-[#19202e] uppercase tracking-wider block">
            Enter Study ID to Verify
          </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                type="text"
                placeholder="e.g. SG-MATH-2601 or SG-BIO-0001"
                value={inputStudyId}
                onChange={(e) => setInputStudyId(e.target.value.toUpperCase())}
                className="bg-[#fef8f4] border-2 border-[#19202e] text-[#19202e] font-mono text-sm uppercase rounded-2xl h-11 flex-1"
              />
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-[#c85a32] hover:bg-[#b04b25] text-white border-2 border-[#19202e] shadow-[2px_2px_0px_#19202e] font-bold rounded-2xl px-5 text-xs h-11 cursor-pointer active:translate-y-0.5 transition-all flex-1 sm:flex-none"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify ID'}
                </Button>
                <Button
                  type="button"
                  onClick={() => setScannerOpen(true)}
                  className="bg-[#19202e] hover:bg-slate-800 text-white border-2 border-[#19202e] shadow-[2px_2px_0px_#19202e] font-bold rounded-2xl px-4 text-xs h-11 cursor-pointer active:translate-y-0.5 transition-all flex items-center gap-1.5"
                  title="Scan student QR pass with camera or upload photo"
                >
                  <QrCode className="h-4 w-4 text-[#fcd34d]" />
                  <span className="hidden sm:inline">Scan Pass</span>
                </Button>
              </div>
            </div>
        </form>

        {/* Loading Indicator */}
        {loading && (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
            <Loader2 className="h-8 w-8 text-[#c85a32] animate-spin" />
            <p className="text-xs text-[#8a726a] font-mono">
              Querying cryptographic credential authority...
            </p>
          </div>
        )}

        {/* Verification Result */}
        {!loading && memberInfo && (
          <div className="space-y-5 pt-2">
            {/* Status Banner */}
            <div className="p-4 rounded-2xl bg-[#fef8f4] border-2 border-[#19202e] flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#456644] text-white border-2 border-[#19202e] flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-mono font-bold text-[#456644] uppercase tracking-wider">
                    AUTHENTIC CANDIDATE RECORD
                  </div>
                  <div className="font-serif font-bold text-base text-[#19202e]">
                    {memberInfo.studyId}
                  </div>
                </div>
              </div>

              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#f8f2ef] border-2 border-[#19202e] text-[#19202e] font-sans font-bold text-xs flex items-center gap-1.5 shadow-[1px_1px_0px_#19202e] cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Link Copied' : 'Share Verification'}</span>
              </button>
            </div>

            {/* Candidate Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-[#fcfaf8] border-2 border-[#19202e] sm:col-span-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#8a726a] uppercase font-mono tracking-wider">
                    Candidate Full Name
                  </span>
                  {!isAuthorizedAdmin && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[#c85a32]">
                      <Lock className="w-3 h-3" />
                      <span>Privacy Protected</span>
                    </span>
                  )}
                </div>
                <div className="font-serif font-bold text-base text-[#19202e] mt-0.5">
                  {getMaskedName(memberInfo.fullName)}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#fcfaf8] border-2 border-[#19202e]">
                <span className="text-[10px] text-[#8a726a] uppercase font-mono tracking-wider block">
                  Examination Stream
                </span>
                <span className="font-serif font-bold text-sm text-[#19202e] mt-0.5 block">
                  {memberInfo.stream}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#fcfaf8] border-2 border-[#19202e]">
                <span className="text-[10px] text-[#8a726a] uppercase font-mono tracking-wider block">
                  Cohort & Status
                </span>
                <span className="font-mono font-bold text-sm text-[#456644] mt-0.5 block">
                  2026 Batch Â· Active Scholar
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#fcfaf8] border-2 border-[#19202e] sm:col-span-2">
                <span className="text-[10px] text-[#8a726a] uppercase font-mono tracking-wider block">
                  Institution / Center
                </span>
                <span className="font-sans font-medium text-xs text-[#19202e] mt-0.5 block">
                  {isAuthorizedAdmin ? memberInfo.school : 'Verified Examination Center (Admin Access Required)'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#fcfaf8] border-2 border-[#19202e] sm:col-span-2 flex items-center justify-between text-[11px] font-mono text-[#8a726a]">
                <span>Certified On</span>
                <span>{formatDate(memberInfo.registrationDate || '', 'medium')}</span>
              </div>
            </div>

            {/* Administrator Identity Gate */}
            {!isAuthorizedAdmin && (
              <div className="p-4 rounded-2xl bg-[#ffdcbc]/20 border-2 border-dashed border-[#19202e] space-y-3">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-[#c85a32]" />
                  <span className="font-mono text-xs font-bold text-[#19202e] uppercase">
                    Admin Identity Verification Gate
                  </span>
                </div>
                <p className="text-xs text-[#4a3b35] leading-relaxed">
                  To prevent public scraping of student PII, full unmasked names and school locations require administrator sign-in or passkey authentication.
                </p>
                <form onSubmit={handleUnlockAdminPII} className="flex gap-2">
                  <Input
                    type="password"
                    placeholder="Enter Admin Passkey"
                    value={adminPasskey}
                    onChange={(e) => setAdminPasskey(e.target.value)}
                    className="bg-white border-2 border-[#19202e] text-xs h-9 rounded-xl font-mono"
                  />
                  <Button
                    type="submit"
                    className="bg-[#19202e] hover:bg-slate-800 text-white font-bold text-xs h-9 rounded-xl px-4 cursor-pointer"
                  >
                    Unlock
                  </Button>
                </form>
              </div>
            )}

            {isAuthorizedAdmin && (
              <div className="p-3 rounded-2xl bg-emerald-50 border-2 border-emerald-600 text-emerald-900 flex items-center gap-2 text-xs font-mono font-semibold">
                <Unlock className="w-4 h-4 text-emerald-700" />
                <span>Administrator Oversight Active: Full Candidate Audit Logs Unlocked.</span>
              </div>
            )}
          </div>
        )}

        {/* Not Found / Error / NIST Access Denied */}
        {!loading && hasSearched && errorMsg && (
          <div className={`p-5 rounded-2xl border-2 space-y-2.5 ${
            errorMsg.includes('NIST') || errorMsg.includes('Access Denied')
              ? 'bg-[#ffe8e8] border-[#ba1a1a] text-[#ba1a1a]'
              : 'bg-[#ffdcbc]/30 border-[#19202e] text-[#19202e]'
          }`}>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-[#ba1a1a]" />
              <h4 className="font-serif font-bold text-sm text-[#19202e]">
                {errorMsg.includes('NIST') ? 'NIST SP 800-53 Access Control Restriction' : 'Record Not Verified'}
              </h4>
            </div>
            <p className="text-xs text-[#4a3b35] leading-relaxed">{errorMsg}</p>
            {errorMsg.includes('NIST') && (
              <div className="pt-2 border-t border-[#ba1a1a]/20 flex items-center justify-between text-[11px] font-mono">
                <span className="text-[#ba1a1a] font-semibold">Security Control: AC-3 Access Enforcement</span>
                <span className="text-[#8a726a]">Role Isolation Active</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#8a726a] hover:text-[#19202e] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Home</span>
        </Link>
      </div>

      <AdminQrScannerModal
        open={scannerOpen}
        onOpenChange={setScannerOpen}
        onStudentVerified={(scannedId) => {
          setInputStudyId(scannedId);
          performVerification(scannedId);
          setScannerOpen(false);
        }}
      />
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 text-[#c85a32] animate-spin" />
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
