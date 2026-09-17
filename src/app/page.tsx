'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { localDb } from '@/lib/storage/localDb';
import { getExamCountdown } from '@/lib/calendar';
import { ScholarLoginModal } from '@/components/auth/ScholarLoginModal';
import {
  LandingHeroIllustration,
  AcademicRhythmIllustration,
  ZScoreForecastIllustration,
  AdminVerificationDeskIllustration,
} from '@/components/illustrations';
import { HomeInteractiveSuite } from '@/components/home/HomeInteractiveSuite';

export default function HomePage() {
  const router = useRouter();
  const { user, member, signInWithGoogle } = useAuth();
  const [scholarModalOpen, setScholarModalOpen] = useState(false);
  const [candidateCount, setCandidateCount] = useState(1420);
  const [studyHours, setStudyHours] = useState(48290);
  const [activeLogs, setActiveLogs] = useState(12450);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [batchYear, setBatchYear] = useState<'2026' | '2027'>('2026');

  const countdown = getExamCountdown(batchYear);

  useEffect(() => {
    try {
      const members = localDb.getMembers();
      if (members && members.length > 0) {
        setCandidateCount(1420 + members.length);
      }
    } catch (e) {}
  }, []);

  const handleStartStudying = () => {
    if (user) {
      router.push('/dashboard');
    } else {
      setScholarModalOpen(true);
    }
  };

  const handleGoogleQuick = async () => {
    try {
      await signInWithGoogle();
      router.push('/dashboard');
    } catch (err) {
      setScholarModalOpen(true);
    }
  };

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <div className="w-full bg-[#fef8f4] text-[#1d1b19] font-sans antialiased selection:bg-[#c85a32]/20 selection:text-[#1d1b19]">
      <div className="flex flex-col w-full">
        <section className="max-w-[1440px] mx-auto px-6 lg:px-12 pt-8 pb-4 w-full">
<div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#dec0b7]/40">
<div className="flex items-center gap-3">
<span className="inline-flex items-center px-3 py-1 rounded-full bg-[#f3ede9] text-[#3d3430] font-sans text-[11px] font-mono tracking-wider uppercase tracking-widest">
          â€¢ Sri Lankan A/L Academic Companion â€¢ 2026 Examination
        </span>
<span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-[#456644]"></span>
<span className="hidden sm:inline-block font-sans text-xs text-[#2d2420] leading-normal text-[#3d3430]">
          Colombo â€¢ Kandy â€¢ Galle â€¢ Jaffna â€¢ Kurunegala
        </span>
</div>
<div className="flex items-center gap-6">
<div className="flex items-center gap-2 font-sans text-[11px] font-mono tracking-wider text-[#3d3430]">
<span className="w-2 h-2 rounded-full bg-[#456644] animate-pulse"></span>
<span>{candidateCount.toLocaleString()} Active Candidates</span>
</div>
<button className="font-sans text-xs font-semibold text-[#c85a32] hover:text-[#9f3c16] transition-colors" onClick={() => setScholarModalOpen(true)}>
          Candidate Portal â†’
        </button>
</div>
</div>
</section>
        <section className="max-w-[1440px] mx-auto px-6 lg:px-12 py-12 lg:py-20 w-full">
<div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

<div className="lg:col-span-6 flex flex-col items-start space-y-6">
<div className="space-y-4">
<span className="font-sans text-[11px] font-mono tracking-wider uppercase tracking-widest text-[#c85a32] font-semibold">
            The Mindful Way to Excel
          </span>
<h1 className="font-serif text-3xl sm:text-5xl font-medium tracking-tight text-[#1d1b19] leading-[1.08]">
            A quiet, steady companion for your A/L journey.
          </h1>
<p className="font-sans text-base text-[#3d3430] leading-relaxed max-w-xl">
            Track your daily study hours with handwritten proof, forecast your district Z-Score, and maintain steady balance across Combined Maths, Physics, and Chemistry â€” without stress or burnout.
          </p>
</div>

<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2 w-full sm:w-auto">
<button className="px-6 py-3.5 rounded-full bg-[#c85a32] hover:bg-[#b04b25] text-white font-sans text-xs font-semibold shadow-sm transition-all duration-200 flex items-center justify-center gap-2.5" onClick={handleStartStudying}>
<span className="material-symbols-outlined text-[18px]">menu_book</span>
<span>Start Studying Today</span>
</button>
<button className="px-5 py-3.5 rounded-full bg-[#f3ede9] hover:bg-[#ede7e3] text-[#1d1b19] font-sans text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-2.5" onClick={handleGoogleQuick}>
<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
<path d="M22.5 12.2c0-.7-.1-1.4-.2-2H12v4.3h5.9c-.3 1.4-1.1 2.6-2.4 3.4v2.8h3.9c2.3-2.1 3.1-5.3 3.1-8.5z"></path>
<path d="M12 23c3.2 0 6-1.1 8-3l-3.9-2.8c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.2v3.1C3.3 20.3 7.4 23 12 23z"></path>
<path d="M5.3 13.4c-.2-.7-.4-1.5-.4-2.4s.2-1.7.4-2.4V5.5H1.2C.4 7.1 0 8.9 0 11s.4 3.9 1.2 5.5l4.1-3.1z"></path>
<path d="M12 4.6c1.8 0 3.3.6 4.6 1.8l3.4-3.4C18 1.1 15.2 0 12 0 7.4 0 3.3 2.7 1.2 6.5l4.1 3.1c.9-2.9 3.6-5 6.7-5z"></path>
</svg>
<span>Sign in with Google</span>
</button>
<a className="px-4 py-3.5 rounded-full text-[#3d3430] hover:text-[#1d1b19] font-sans text-xs font-semibold flex items-center justify-center gap-1.5" href="#chapters">
<span>Preview without account</span>
<span className="material-symbols-outlined text-[16px]">arrow_downward</span>
</a>
</div>

<div className="flex items-center gap-4 pt-2 text-[#2d2420] font-sans text-xs leading-normal">
<div className="flex items-center gap-1.5">
<span className="material-symbols-outlined text-[#2e522d] text-[16px]">verified</span>
<span>Accredited 2026 Curriculum</span>
</div>
<span>â€¢</span>
<div className="flex items-center gap-1.5">
<span className="material-symbols-outlined text-[#2e522d] text-[16px]">lock</span>
<span>Zero ad trackers or rank exposure</span>
</div>
</div>
</div>

<div className="lg:col-span-6 flex justify-center">
<div className="w-full max-w-[540px] bg-[#f8f2ef] rounded-3xl p-3.5 sm:p-6 lg:p-8 shadow-sm relative overflow-hidden">
<div className="flex items-center justify-between mb-4">
<span className="font-sans text-[11px] font-mono tracking-wider uppercase text-[#6b5952]">Study Table â€¢ 06:15 AM</span>
<span className="inline-flex items-center gap-1 font-sans text-[11px] font-mono tracking-wider text-[#2e522d] bg-[#c6edc1]/60 px-2.5 py-0.5 rounded-full">
<span className="w-1.5 h-1.5 rounded-full bg-[#456644]"></span>
              Colombo Morning Rhythm
            </span>
</div>

<LandingHeroIllustration className="w-full h-auto" animated={false} />
<div className="mt-4 pt-3 border-t border-[#dec0b7]/40 flex items-center justify-between text-[#3d3430] font-sans text-[11px] font-mono tracking-wider">
<span>Proof of work verification</span>
<span className="font-semibold text-[#c85a32]">Target: 3h Pure Maths today</span>
</div>
</div>
</div>
</div>
</section>
        <section className="max-w-[1440px] mx-auto px-6 lg:px-12 py-10 w-full">
<div className="bg-[#f3ede9] rounded-3xl p-8 lg:p-12 shadow-sm">
<div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-8 border-b border-[#dec0b7]/40">
<div>
<span className="font-sans text-[11px] font-mono tracking-wider uppercase tracking-widest text-[#c85a32] font-semibold">National Study Framework</span>
<h2 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-[#1d1b19] mt-1">Calibrated to the 2026 Examination cycle.</h2>
</div>
<p className="font-sans text-sm text-[#2d2420] leading-relaxed max-w-md">
          Dedicated revision accountability, Z-score modeling, and syllabus pacing for G.C.E. Advanced Level candidates across all 25 districts.
        </p>
</div>
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

<div className="flex flex-col p-6 rounded-2xl bg-[#ffffff] shadow-sm hover:shadow-md transition-shadow">
<div className="flex items-center justify-between">
  <span className="font-sans text-[11px] font-mono tracking-wider uppercase text-[#6b5952]">Countdown</span>
  <div className="flex items-center gap-1 bg-[#f3ede9] p-0.5 rounded-lg text-[10px] font-mono">
    <button
      type="button"
      onClick={() => setBatchYear('2026')}
      className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${batchYear === '2026' ? 'bg-[#c85a32] text-white shadow-xs' : 'text-[#4a3b35]'}`}
    >
      2026
    </button>
    <button
      type="button"
      onClick={() => setBatchYear('2027')}
      className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${batchYear === '2027' ? 'bg-[#c85a32] text-white shadow-xs' : 'text-[#4a3b35]'}`}
    >
      2027
    </button>
  </div>
</div>
<div className="flex items-baseline gap-2 mt-2">
<span className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#c85a32]" id="counter-days">{countdown.daysRemaining}</span>
<span className="font-sans text-sm font-semibold text-[#1d1b19]">Days Left</span>
</div>
<p className="font-sans text-xs text-[#2d2420] leading-normal mt-2">
  Official G.C.E. Advanced Level scheduled for late {batchYear}.
</p>
</div>

<div className="flex flex-col p-6 rounded-2xl bg-[#ffffff] shadow-sm hover:shadow-md transition-shadow">
<span className="font-sans text-[11px] font-mono tracking-wider uppercase text-[#6b5952]">Islandwide Reach</span>
<div className="flex items-baseline gap-2 mt-2">
<span className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#1d1b19]">25</span>
<span className="font-sans text-sm font-semibold text-[#1d1b19]">Districts</span>
</div>
<p className="font-sans text-xs text-[#2d2420] leading-normal mt-2">
            District-quota calibrated Z-scores and province-wide admission paths.
          </p>
</div>

<div className="flex flex-col p-6 rounded-2xl bg-[#ffffff] shadow-sm hover:shadow-md transition-shadow">
<span className="font-sans text-[11px] font-mono tracking-wider uppercase text-[#6b5952]">Daily Target</span>
<div className="flex items-baseline gap-2 mt-2">
<span className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#2e522d]">5.0+</span>
<span className="font-sans text-sm font-semibold text-[#1d1b19]">Hours / Day</span>
</div>
<p className="font-sans text-xs text-[#2d2420] leading-normal mt-2">
            Recommended self-directed deep focus quota for island ranks.
          </p>
</div>

<div className="flex flex-col p-6 rounded-2xl bg-[#ffffff] shadow-sm hover:shadow-md transition-shadow">
<span className="font-sans text-[11px] font-mono tracking-wider uppercase text-[#6b5952]">Verified Auditing</span>
<div className="flex items-baseline gap-2 mt-2">
<span className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#854f00]">100%</span>
<span className="font-sans text-sm font-semibold text-[#1d1b19]">Proof-Backed</span>
</div>
<p className="font-sans text-xs text-[#2d2420] leading-normal mt-2">
            Every logged session requires photographic work proof.
          </p>
</div>
</div>
</div>
</section>
        <section className="max-w-[1440px] mx-auto px-6 lg:px-12 py-16 lg:py-24 w-full space-y-28" id="chapters">

<div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
<div className="lg:col-span-5 order-2 lg:order-1 flex flex-col space-y-5">
<div className="inline-flex items-center gap-2">
<span className="font-sans text-[11px] font-mono tracking-wider uppercase tracking-widest text-[#c85a32] font-bold">Chapter 01</span>
<span className="w-8 h-[1px] bg-[#dec0b7]"></span>
<span className="font-sans text-[11px] font-mono tracking-wider text-[#3d3430] uppercase">Kinfolk Clarity</span>
</div>
<h3 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-[#1d1b19]">Daily Focus &amp; Handwritten Proof</h3>
<p className="font-sans text-base text-[#3d3430] leading-relaxed">
          Digital timers lie; paper never does. StudySync anchors your daily rhythm around genuine physical pen-to-paper problem solving.
        </p>
<div className="space-y-3 pt-2">
<div className="flex items-start gap-3">
<span className="material-symbols-outlined text-[#c85a32] text-[20px] mt-0.5">check_circle</span>
<div>
<h4 className="font-sans text-sm font-semibold text-[#1d1b19]">Snap your finished paper sheets</h4>
<p className="font-sans text-xs text-[#2d2420] leading-normal text-[#3d3430]">Upload quick photographs of your Combined Maths integration sets or Organic reaction mechanisms.</p>
</div>
</div>
<div className="flex items-start gap-3">
<span className="material-symbols-outlined text-[#c85a32] text-[20px] mt-0.5">check_circle</span>
<div>
<h4 className="font-sans text-sm font-semibold text-[#1d1b19]">AI-free human verification</h4>
<p className="font-sans text-xs text-[#2d2420] leading-normal text-[#3d3430]">Private mentor spot-checks or self-audit stamps keep accountability healthy and constructive.</p>
</div>
</div>
</div>
<div className="pt-4">
<button className="inline-flex items-center gap-2 font-sans text-xs font-semibold text-[#c85a32] hover:text-[#9f3c16] transition-colors" onClick={handleStartStudying}>
<span>Explore daily journaling rhythm</span>
<span className="material-symbols-outlined text-[16px]">arrow_forward</span>
</button>
</div>
</div>

<div className="lg:col-span-7 order-1 lg:order-2 flex justify-center">
<div className="w-full max-w-[560px] bg-[#f8f2ef] p-6 sm:p-8 rounded-3xl shadow-sm relative flex flex-col items-center">
<div className="w-full flex items-center justify-between mb-4">
<span className="font-sans text-[11px] font-mono tracking-wider uppercase text-[#6b5952]">Derivation Capture Interface</span>
<span className="font-sans text-[11px] font-mono tracking-wider text-[#c85a32]">Paper Proof #841</span>
</div>
<div className="w-full flex justify-center p-4 bg-white rounded-2xl border border-[#dec0b7]/60 shadow-sm">
  <AcademicRhythmIllustration className="w-full h-auto max-h-[340px]" />
</div>
<div className="mt-4 w-full flex items-center justify-between text-[#3d3430] font-sans text-[11px] font-mono tracking-wider">
<span>Stored on candidate's private Google Drive</span>
<span className="text-[#2e522d] font-semibold">100% Privacy Preserved</span>
</div>
</div>
</div>
</div>

<div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

<div className="lg:col-span-7 flex justify-center">
<div className="w-full max-w-[580px] bg-[#f8f2ef] p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col items-center">
<div className="w-full flex items-center justify-between mb-4">
<span className="font-sans text-[11px] font-mono tracking-wider uppercase text-[#6b5952]">Statistical Gaussian Distribution</span>
<span className="font-sans text-[11px] font-mono tracking-wider text-[#2e522d] bg-[#c6edc1]/70 px-2.5 py-0.5 rounded-full">
              Colombo District Normalization
            </span>
</div>
<div className="relative w-full overflow-hidden rounded-2xl bg-white border border-[#dec0b7]/60 p-4 flex justify-center">
  <ZScoreForecastIllustration className="w-full h-auto max-h-[340px]" />
</div>
<div className="mt-4 pt-3 border-t border-[#dec0b7]/40 w-full flex flex-wrap items-center justify-between gap-2 text-[#3d3430] font-sans text-[11px] font-mono tracking-wider">
<span className="flex items-center gap-1.5">
<span className="w-2 h-2 rounded-full bg-[#456644]"></span>
              Engineering cutoff zone
            </span>
<span className="flex items-center gap-1.5">
<span className="w-2 h-2 rounded-full bg-[#c85a32]"></span>
              Your 3-term predicted median
            </span>
</div>
</div>
</div>

<div className="lg:col-span-5 flex flex-col space-y-5">
<div className="inline-flex items-center gap-2">
<span className="font-sans text-[11px] font-mono tracking-wider uppercase tracking-widest text-[#c85a32] font-bold">Chapter 02</span>
<span className="w-8 h-[1px] bg-[#dec0b7]"></span>
<span className="font-sans text-[11px] font-mono tracking-wider text-[#3d3430] uppercase">Demystifying the Metric</span>
</div>
<h3 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-[#1d1b19]">Transparent Z-Score Modeling</h3>
<p className="font-sans text-base text-[#3d3430] leading-relaxed">
          The Sri Lankan University Admissions system is often shrouded in anxious mystery. We turn standard deviation equations into calm, predictable milestones.
        </p>
<div className="space-y-3 pt-2">
<div className="flex items-start gap-3">
<span className="material-symbols-outlined text-[#2e522d] text-[20px] mt-0.5">query_stats</span>
<div>
<h4 className="font-sans text-sm font-semibold text-[#1d1b19]">District-weighted percentiles</h4>
<p className="font-sans text-xs text-[#2d2420] leading-normal text-[#3d3430]">Whether you are registered in Colombo or Monaragala, forecast quotas with realistic district cohorts.</p>
</div>
</div>
<div className="flex items-start gap-3">
<span className="material-symbols-outlined text-[#2e522d] text-[20px] mt-0.5">balance</span>
<div>
<h4 className="font-sans text-sm font-semibold text-[#1d1b19]">Balanced subject triad</h4>
<p className="font-sans text-xs text-[#2d2420] leading-normal text-[#3d3430]">Prevent the common trap of overstudying Maths while falling behind on Chemistry inorganic theory.</p>
</div>
</div>
</div>
<div className="pt-4">
<button className="inline-flex items-center gap-2 font-sans text-xs font-semibold text-[#c85a32] hover:text-[#9f3c16] transition-colors" onClick={handleStartStudying}>
<span>Calculate your projected Z-Score</span>
<span className="material-symbols-outlined text-[16px]">arrow_forward</span>
</button>
</div>
</div>
</div>

<div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
<div className="lg:col-span-5 order-2 lg:order-1 flex flex-col space-y-5">
<div className="inline-flex items-center gap-2">
<span className="font-sans text-[11px] font-mono tracking-wider uppercase tracking-widest text-[#c85a32] font-bold">Chapter 03</span>
<span className="w-8 h-[1px] bg-[#dec0b7]"></span>
<span className="font-sans text-[11px] font-mono tracking-wider text-[#3d3430] uppercase">Tactile Identity</span>
</div>
<h3 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-[#1d1b19]">Digital Student Pass</h3>
<p className="font-sans text-base text-[#3d3430] leading-relaxed">
          A minimalist digital credential that represents your academic discipline. Show it at partner revision libraries, study pods, and tuition hubs across Sri Lanka.
        </p>
<div className="space-y-3 pt-2">
<div className="flex items-start gap-3">
<span className="material-symbols-outlined text-[#854f00] text-[20px] mt-0.5">badge</span>
<div>
<h4 className="font-sans text-sm font-semibold text-[#1d1b19]">Instant tuition &amp; library check-in</h4>
<p className="font-sans text-xs text-[#2d2420] leading-normal text-[#3d3430]">Scannable QR identity verified directly against your verified exam preparation records.</p>
</div>
</div>
<div className="flex items-start gap-3">
<span className="material-symbols-outlined text-[#854f00] text-[20px] mt-0.5">offline_pin</span>
<div>
<h4 className="font-sans text-sm font-semibold text-[#1d1b19]">Works offline on mobile</h4>
<p className="font-sans text-xs text-[#2d2420] leading-normal text-[#3d3430]">Cached locally on your browser with cryptographic validationâ€”no active internet required at the hall entrance.</p>
</div>
</div>
</div>
<div className="pt-4">
<button className="inline-flex items-center gap-2 font-sans text-xs font-semibold text-[#c85a32] hover:text-[#9f3c16] transition-colors" onClick={handleStartStudying}>
<span>Issue your Candidate Pass</span>
<span className="material-symbols-outlined text-[16px]">arrow_forward</span>
</button>
</div>
</div>

<div className="lg:col-span-7 order-1 lg:order-2 flex justify-center">
<div className="w-full max-w-[520px] bg-[#f8f2ef] p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col items-center">
<div className="w-full flex items-center justify-between mb-4">
<span className="font-sans text-[11px] font-mono tracking-wider uppercase text-[#6b5952]">Pass Preview</span>
<span className="font-sans text-[11px] font-mono tracking-wider text-[#3d3430]">NFC &amp; QR Enabled</span>
</div>

<div className="w-full flex justify-center p-4 bg-white rounded-2xl border border-[#dec0b7]/60 shadow-sm">
  <AdminVerificationDeskIllustration className="w-full h-auto max-h-[340px]" />
</div>
<p className="font-sans text-xs text-[#2d2420] leading-normal text-[#3d3430] text-center mt-4">
  Official recognition with 120+ verified tuition and practical laboratory centers.
</p>
</div>
</div>
</div>
</section>

        {/* Snap Paper Notes & Resource Vault Suite */}
        <section className="max-w-[1440px] mx-auto px-6 lg:px-12 py-8 w-full">
          <HomeInteractiveSuite />
        </section>

        <section className="max-w-[1440px] mx-auto px-6 lg:px-12 py-12 w-full">
<div className="bg-[#f3ede9] rounded-3xl p-8 lg:p-14">
<div className="max-w-3xl space-y-4">
<span className="font-sans text-[11px] font-mono tracking-wider uppercase tracking-widest text-[#c85a32] font-semibold">Our Principles</span>
<h2 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-[#1d1b19]">Education without distraction or comparison.</h2>
<p className="font-sans text-base text-[#3d3430] leading-relaxed">
          Most study apps replicate social media addictions with predatory streaks, public leaderboards that cause panic, and intrusive advertising. StudySync is built like a quiet monastery library.
        </p>
</div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 pt-8 border-t border-[#dec0b7]/40">
<div className="space-y-2">
<div className="w-10 h-10 rounded-full bg-[#e7e1de] flex items-center justify-center text-[#c85a32]">
<span className="material-symbols-outlined text-[20px]">no_accounts</span>
</div>
<h3 className="font-sans text-base sm:text-lg font-semibold text-[#1d1b19]">Zero Public Ranks</h3>
<p className="font-sans text-xs text-[#2d2420] leading-normal text-[#3d3430]">
            No public leaderboards. You compete exclusively against yesterdayâ€™s version of yourself, not an anonymous stranger.
          </p>
</div>
<div className="space-y-2">
<div className="w-10 h-10 rounded-full bg-[#e7e1de] flex items-center justify-center text-[#2e522d]">
<span className="material-symbols-outlined text-[20px]">cloud_sync</span>
</div>
<h3 className="font-sans text-base sm:text-lg font-semibold text-[#1d1b19]">Private Google Drive Sync</h3>
<p className="font-sans text-xs text-[#2d2420] leading-normal text-[#3d3430]">
            Every handwritten log and note stays in your own personal cloud storage. We never monetize or scrape your work.
          </p>
</div>
<div className="space-y-2">
<div className="w-10 h-10 rounded-full bg-[#e7e1de] flex items-center justify-center text-[#854f00]">
<span className="material-symbols-outlined text-[20px]">psychology</span>
</div>
<h3 className="font-sans text-base sm:text-lg font-semibold text-[#1d1b19]">Burnout Defense</h3>
<p className="font-sans text-xs text-[#2d2420] leading-normal text-[#3d3430]">
            Intelligent nudges prompt restful sleep when you exceed 7 consecutive high-intensity hours. A sharp mind beats a tired mind.
          </p>
</div>
</div>
</div>
</section>
        <section className="max-w-[1000px] mx-auto px-6 lg:px-12 py-16 w-full">
<div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
<span className="font-sans text-[11px] font-mono tracking-wider uppercase tracking-widest text-[#c85a32] font-semibold">Inquiries &amp; Admissions</span>
<h2 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-[#1d1b19]">Frequently Asked Questions</h2>
<p className="font-sans text-sm text-[#3d3430] leading-relaxed">
        Understanding how raw marks transform into University Grants Commission (UGC) admission slots.
      </p>
</div>

<div className="space-y-4" id="faq-accordion">

<div className="bg-[#f8f2ef] rounded-2xl p-6 transition-all duration-200 cursor-pointer border border-[#dec0b7]/40 hover:border-[#c85a32]/40" onClick={() => toggleFaq(1)}>
<div className="flex items-center justify-between gap-4">
<h3 className="font-sans text-base sm:text-lg font-semibold text-[#1d1b19]">How is the Z-Score actually computed across 3 subjects?</h3>
<span className={`material-symbols-outlined text-[#6b5952] transition-transform duration-200 ${openFaq === 1 ? 'rotate-180 text-[#c85a32]' : ''}`}>expand_more</span>
</div>
<div className={`mt-3 text-[#2d2420] font-sans text-sm leading-relaxed pt-2 border-t border-[#dec0b7]/30 ${openFaq === 1 ? 'block' : 'hidden'}`}>
          Each candidate's raw mark in Combined Maths, Physics, and Chemistry is transformed by subtracting the islandwide subject mean and dividing by the standard deviation: Z = (X - XÌ„) / SD. The three resulting individual Z-Scores are then averaged to produce your final Composite Z-Score. StudySync accurately models this distribution based on previous Department of Examinations datasets.
        </div>
</div>

<div className="bg-[#f8f2ef] rounded-2xl p-6 transition-all duration-200 cursor-pointer border border-[#dec0b7]/40 hover:border-[#c85a32]/40" onClick={() => toggleFaq(2)}>
<div className="flex items-center justify-between gap-4">
<h3 className="font-sans text-base sm:text-lg font-semibold text-[#1d1b19]">Why do district quotas matter so significantly?</h3>
<span className={`material-symbols-outlined text-[#6b5952] transition-transform duration-200 ${openFaq === 2 ? 'rotate-180 text-[#c85a32]' : ''}`}>expand_more</span>
</div>
<div className={`mt-3 text-[#2d2420] font-sans text-sm leading-relaxed pt-2 border-t border-[#dec0b7]/30 ${openFaq === 2 ? 'block' : 'hidden'}`}>
          Under Sri Lanka's current university selection policy, approximately 40% of admissions are awarded on pure all-island merit, 55% allocated across the 25 administrative districts in proportion to population, and 5% reserved for underprivileged educationally backward districts. Hence, a Z-score of +1.81 might suffice for Colombo Medicine or Moratuwa Engineering depending on your district quota.
        </div>
</div>

<div className="bg-[#f8f2ef] rounded-2xl p-6 transition-all duration-200 cursor-pointer border border-[#dec0b7]/40 hover:border-[#c85a32]/40" onClick={() => toggleFaq(3)}>
<div className="flex items-center justify-between gap-4">
<h3 className="font-sans text-base sm:text-lg font-semibold text-[#1d1b19]">Can I use StudySync for the Biological Science stream?</h3>
<span className={`material-symbols-outlined text-[#6b5952] transition-transform duration-200 ${openFaq === 3 ? 'rotate-180 text-[#c85a32]' : ''}`}>expand_more</span>
</div>
<div className={`mt-3 text-[#2d2420] font-sans text-sm leading-relaxed pt-2 border-t border-[#dec0b7]/30 ${openFaq === 3 ? 'block' : 'hidden'}`}>
          Yes. While our diagrams highlight Pure Maths and Physics, the system fully supports Biology, Chemistry, and Physics/Agriculture streams, complete with botanical taxonomy flash-checklists and organic reaction pathway trackers.
        </div>
</div>

<div className="bg-[#f8f2ef] rounded-2xl p-6 transition-all duration-200 cursor-pointer border border-[#dec0b7]/40 hover:border-[#c85a32]/40" onClick={() => toggleFaq(4)}>
<div className="flex items-center justify-between gap-4">
<h3 className="font-sans text-base sm:text-lg font-semibold text-[#1d1b19]">Is StudySync free for all Sri Lankan students?</h3>
<span className={`material-symbols-outlined text-[#6b5952] transition-transform duration-200 ${openFaq === 4 ? 'rotate-180 text-[#c85a32]' : ''}`}>expand_more</span>
</div>
<div className={`mt-3 text-[#2d2420] font-sans text-sm leading-relaxed pt-2 border-t border-[#dec0b7]/30 ${openFaq === 4 ? 'block' : 'hidden'}`}>
          Core daily logging, revision checklists, Z-score forecasting, and digital student passes are 100% free forever. We operate as an academic initiative to provide equitable revision clarity to candidates across all provinces.
        </div>
</div>
</div>
</section>
        <section className="max-w-[1440px] mx-auto px-6 lg:px-12 py-16 w-full mb-12">
<div className="bg-[#f8f2ef] rounded-3xl p-10 lg:p-16 text-center max-w-3xl mx-auto space-y-6 shadow-sm">
<span className="font-sans text-[11px] font-mono tracking-wider uppercase tracking-widest text-[#c85a32] font-semibold">Your Path Awaits</span>
<h2 className="font-serif text-3xl sm:text-5xl font-medium tracking-tight text-[#1d1b19]">Give your mind the quiet space it needs to master A/Ls.</h2>
<p className="font-sans text-base text-[#2d2420] leading-relaxed max-w-xl mx-auto">
        Join dedicated candidates waking up early, working systematically with pen and paper, and building peaceful confidence.
      </p>
<div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
<button className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#c85a32] hover:bg-[#b04b25] text-white font-sans text-xs font-semibold transition-all duration-200 shadow-sm" onClick={handleStartStudying}>
          Create Free Candidate Profile
        </button>
<button className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-[#f3ede9] hover:bg-[#ede7e3] text-[#1d1b19] font-sans text-xs font-semibold transition-all duration-200" onClick={handleStartStudying}>
          Sign In Existing Pass
        </button>
</div>
<p className="font-sans text-xs text-[#2d2420] leading-normal text-[#6b5952] pt-2">
        No payment details needed â€¢ Immediate setup in under 60 seconds
      </p>
</div>
</section>
      </div>
      
      {/* Interactive Scholar Access Modal */}
      <ScholarLoginModal
        isOpen={scholarModalOpen}
        onClose={() => setScholarModalOpen(false)}
        onSuccess={() => router.push('/dashboard')}
      />
    </div>
  );
}
