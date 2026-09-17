'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { fireConfetti } from '@/lib/confetti';
import { buildCelebrationUrl } from '@/lib/urls';
import {
  Award,
  Sparkles,
  Share2,
  Check,
  Flame,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  Target,
  BookOpen,
} from 'lucide-react';
import { toast } from 'sonner';

export default function CelebratePage() {
  const { member, user } = useAuth();
  const [copied, setCopied] = useState(false);
  const hasFiredConfetti = useRef(false);

  const [params, setParams] = useState({
    id: 'SG-MATH-2601',
    name: 'A/L Candidate',
    streak: 7,
    subject: 'Combined Mathematics',
    stream: 'Physical Science',
    targetZScore: '+2.15',
  });

  // Read URL query params once on client mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search);
      const urlId = sp.get('id');
      const urlName = sp.get('name');
      const urlStreak = sp.get('streak');
      const urlSubject = sp.get('subject');
      const urlStream = sp.get('stream');
      const urlZ = sp.get('z');

      setParams({
        id: urlId || member?.studyId || 'SG-MATH-2601',
        name: urlName || member?.fullName || user?.displayName || 'A/L Candidate',
        streak: urlStreak ? parseInt(urlStreak, 10) : member?.streakCount || 7,
        subject: urlSubject || 'Combined Mathematics',
        stream: urlStream || member?.stream || 'Physical Science',
        targetZScore: urlZ || (member as any)?.targetZScore || '+2.15',
      });
    }

    // Fire celebration confetti ONCE with safety timer
    if (!hasFiredConfetti.current) {
      hasFiredConfetti.current = true;
      const timer = setTimeout(() => {
        fireConfetti({ particleCount: 25 });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleCopyLink = () => {
    const canonicalUrl = buildCelebrationUrl({
      studyId: params.id,
      name: params.name,
      streak: params.streak,
      subject: params.subject,
      stream: params.stream,
      targetZScore: params.targetZScore,
    });

    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(canonicalUrl);
      setCopied(true);
      toast.success('Professional milestone link copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleBlastAgain = () => {
    fireConfetti({ particleCount: 30 });
    toast.success('Celebration blast fired!');
  };

  return (
    <div className="w-full flex-1 py-6 sm:py-10 px-3 sm:px-6 lg:px-8 max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300 overflow-x-hidden">
      {/* Top Banner Navigation */}
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#e7e1de] w-full">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full bg-[#fa7268] shrink-0" />
          <span className="font-mono text-[11px] sm:text-xs uppercase font-bold text-[#19202e] tracking-wider truncate">
            StudySync Academic Milestone
          </span>
        </div>
        <Link
          href="/dashboard"
          className="text-xs font-sans font-bold text-[#c85a32] hover:text-[#19202e] flex items-center gap-1 transition-colors shrink-0"
        >
          <span>Dashboard</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Main Celebration Certificate Card */}
      <div className="relative rounded-3xl bg-white border-2 border-[#19202e] shadow-[4px_4px_0px_#19202e] sm:shadow-[6px_6px_0px_#19202e] p-5 sm:p-8 overflow-hidden text-center space-y-5 w-full">
        {/* Certificate Decorative Border */}
        <div className="absolute inset-2 rounded-2xl border border-dashed border-[#e7e1de] pointer-events-none" />

        {/* Monoline Seal Medallion */}
        <div className="relative mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#ffdcbc] border-2 border-[#19202e] flex items-center justify-center shadow-[2px_2px_0px_#19202e]">
          <Award className="w-8 h-8 sm:w-10 sm:h-10 text-[#c85a32]" />
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#fcd34d] border-2 border-[#19202e] flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-[#19202e]" />
          </div>
        </div>

        {/* Certificate Titles */}
        <div className="space-y-1.5 relative z-10">
          <span className="px-2.5 py-0.5 rounded-full bg-[#f3ede9] text-[#19202e] font-mono text-[10px] sm:text-xs font-bold uppercase tracking-wider border border-[#19202e]/20 inline-block">
            G.C.E. Advanced Level 2026
          </span>
          <h1 className="font-serif text-xl sm:text-3xl font-bold text-[#19202e] tracking-tight">
            Academic Focus Citation
          </h1>
          <p className="font-sans text-xs sm:text-sm text-[#4a3b35] max-w-md mx-auto leading-relaxed px-2">
            In recognition of rigorous preparation, disciplined focus routines, and relentless consistency toward the national cohort examination.
          </p>
        </div>

        {/* Candidate & Streak Details Grid - Fully Mobile Responsive */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-xl mx-auto pt-1 relative z-10 w-full text-left">
          <div className="p-2.5 sm:p-3 rounded-2xl bg-[#fef8f4] border-2 border-[#19202e] min-w-0">
            <div className="flex items-center gap-1 text-[10px] font-mono text-[#8a726a] mb-0.5">
              <GraduationCap className="w-3 h-3 text-[#c85a32] shrink-0" />
              <span className="truncate">CANDIDATE</span>
            </div>
            <div className="font-serif font-bold text-xs sm:text-sm text-[#19202e] truncate">{params.name}</div>
            <div className="font-mono text-[10px] text-[#8a726a] mt-0.5 truncate">{params.id}</div>
          </div>

          <div className="p-2.5 sm:p-3 rounded-2xl bg-[#ffdcbc]/30 border-2 border-[#19202e] min-w-0">
            <div className="flex items-center gap-1 text-[10px] font-mono text-[#8a726a] mb-0.5">
              <Flame className="w-3 h-3 text-[#fa7268] shrink-0" />
              <span>STREAK</span>
            </div>
            <div className="font-serif font-bold text-base sm:text-lg text-[#19202e]">{params.streak} Days</div>
            <div className="font-sans text-[10px] text-[#456644] font-semibold mt-0.5 truncate">Active Cadence</div>
          </div>

          <div className="p-2.5 sm:p-3 rounded-2xl bg-[#fef8f4] border-2 border-[#19202e] min-w-0">
            <div className="flex items-center gap-1 text-[10px] font-mono text-[#8a726a] mb-0.5">
              <BookOpen className="w-3 h-3 text-[#456644] shrink-0" />
              <span className="truncate">STREAM</span>
            </div>
            <div className="font-serif font-bold text-xs sm:text-sm text-[#19202e] truncate">{params.stream}</div>
            <div className="font-mono text-[10px] text-[#8a726a] mt-0.5 truncate">{params.subject}</div>
          </div>

          <div className="p-2.5 sm:p-3 rounded-2xl bg-[#fcd34d]/20 border-2 border-[#19202e] min-w-0">
            <div className="flex items-center gap-1 text-[10px] font-mono text-[#8a726a] mb-0.5">
              <Target className="w-3 h-3 text-amber-700 shrink-0" />
              <span className="truncate">TARGET Z</span>
            </div>
            <div className="font-serif font-bold text-base sm:text-lg text-[#19202e]">{params.targetZScore}</div>
            <div className="font-sans text-[10px] text-[#8a726a] mt-0.5 truncate">District Pace</div>
          </div>
        </div>

        {/* Cryptographic Badge Tag */}
        <div className="pt-1 flex items-center justify-center gap-1.5 font-mono text-[11px] text-[#456644] font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-[#456644] shrink-0" />
          <span className="truncate">Cryptographically Certified via StudySync</span>
        </div>

        {/* Action Controls - Stack Cleanly on Mobile */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 relative z-10 w-full">
          <button
            onClick={handleBlastAgain}
            className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-[#fa7268] hover:bg-[#e65a50] text-[#19202e] border-2 border-[#19202e] shadow-[2px_2px_0px_#19202e] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer active:translate-y-0.5 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>Celebration Blast</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-white hover:bg-[#f8f2ef] text-[#19202e] border-2 border-[#19202e] shadow-[2px_2px_0px_#19202e] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer active:translate-y-0.5 transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <Share2 className="w-3.5 h-3.5 shrink-0" />}
            <span>{copied ? 'Link Copied!' : 'Copy Milestone Link'}</span>
          </button>

          <Link
            href="/rooms"
            className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-[#c85a32] hover:bg-[#b04b25] text-white border-2 border-[#19202e] shadow-[2px_2px_0px_#19202e] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer active:translate-y-0.5 transition-all"
          >
            <GraduationCap className="w-3.5 h-3.5 shrink-0" />
            <span>Focus Town Desks</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
