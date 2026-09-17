'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getExamCountdown } from '@/lib/calendar';
import {
  BookOpen,
  CheckCircle2,
  Circle,
  Layers,
  Sparkles,
  Flame,
  ShieldCheck,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  Award,
} from 'lucide-react';
import { safeStorage } from '@/lib/storage/safeStorage';

export default function SubjectsPage() {
  const router = useRouter();
  const { user, member } = useAuth();
  const countdown = getExamCountdown('2026');

  const [activeStream, setActiveStream] = useState<'physical' | 'biological'>('physical');
  const [activeSubject, setActiveSubject] = useState<string>('maths');
  const [checkedTopics, setCheckedTopics] = useState<Record<string, boolean>>({});

  const streakDays = member?.streakCount ?? 0;

  useEffect(() => {
    const saved = safeStorage.getJson<Record<string, boolean>>('studysync_subtopics_mastery', {});
    setCheckedTopics(saved);
  }, []);

  const toggleTopic = (topicId: string) => {
    setCheckedTopics((prev) => {
      const updated = { ...prev, [topicId]: !prev[topicId] };
      safeStorage.setJson('studysync_subtopics_mastery', updated);
      return updated;
    });
  };

  return (
    <div className="min-h-[calc(100vh-140px)] bg-[#fef8f4] text-[#1d1b19] font-sans antialiased selection:bg-[#c85a32]/20 selection:text-[#1d1b19] py-8">
      <div className="flex flex-col w-full pb-space-xl">

<div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-space-sm mb-space-lg pt-space-xs">
<div className="flex items-center gap-space-sm flex-wrap">
<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ede7e3] text-[#3d3430] font-sans text-[11px] font-mono tracking-wider uppercase shadow-sm">
<span className="w-1.5 h-1.5 rounded-full bg-[#c85a32] animate-pulse"></span>
        NIE CURRICULUM ARCHIVE • A/L 2026
      </span>
<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f3ede9] text-[#3d3430] font-sans text-[11px] font-mono tracking-wider">
<span className="material-symbols-outlined text-sm leading-none text-[#6b5952]">location_on</span>
        Colombo Benchmark Sync
      </span>
<span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#ffdcbc] text-on-tertiary-fixed font-sans text-[11px] font-mono tracking-wider">
<span className=""></span>
<span className="">{streakDays} Day Streak Unbroken</span>
</span>
</div>
<div className="flex items-center gap-space-sm self-start md:self-auto">
<div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#c6edc1]/70 text-on-secondary-container font-sans text-[11px] font-mono tracking-wider">
<span className="material-symbols-outlined text-sm text-[#2e522d]">verified_user</span>
<span className="">AES-256 Local + Drive Sync Active</span>
</div>
<div className="hidden lg:flex items-center gap-1 text-[#6b5952] font-sans text-[11px] font-mono tracking-wider px-2">
<span className="material-symbols-outlined text-sm">schedule</span>
<span className="">48.5 hrs mapped</span>
</div>
</div>
</div>

<div className="relative w-full rounded-2xl bg-[#ffffff] p-6 md:p-10 shadow-sm overflow-hidden mb-space-lg">
<div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-[#c85a32]/5 blur-3xl pointer-events-none"></div>
<div className="absolute right-32 -bottom-16 w-64 h-64 rounded-full bg-[#456644]/5 blur-2xl pointer-events-none"></div>
<div className="relative z-10 max-w-4xl">
<div className="flex items-center gap-2 mb-3">
<span className="px-2.5 py-0.5 rounded-full bg-[#f3ede9] font-sans text-[11px] font-mono tracking-wider uppercase tracking-widest text-[#c85a32]">Syllabus Matrix</span>
<span className="text-[#6b5952]">•</span>
<span className="font-sans text-[11px] font-mono tracking-wider text-[#3d3430]">National Institute of Education (NIE) 2026 Grid</span>
</div>
<h1 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-[#1d1b19] mb-3">
        Subject Syllabus &amp; Subtopic Mastery
      </h1>
<p className="font-sans text-base text-[#3d3430] leading-relaxed max-w-3xl mb-6">
        Every single topic and unit derivation mapped against the National NIE syllabus. Check off subtopics, review past paper weightages, and see where your study balance stands without feeling overwhelmed.
      </p>

<div className="flex flex-wrap items-center gap-2.5 pt-2">
<button className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#ffdbcf] text-white-container font-sans text-sm font-semibold text-[#1d1b19] shadow-sm transition-all duration-200 hover:brightness-105 active:scale-95" id="stream-physical" >
<span className="material-symbols-outlined text-base">functions</span>
<span className="">Physical Science (Combined Maths, Physics, Chemistry)</span>
<span className="inline-block w-2 h-2 rounded-full bg-on-primary-container"></span>
</button>
<button className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#f8f2ef] text-[#3d3430] hover:bg-[#f3ede9] hover:text-[#1d1b19] font-sans text-sm font-semibold text-[#1d1b19] transition-all duration-200" id="stream-biological" >
<span className="material-symbols-outlined text-base">biotech</span>
<span className="">Biological Science (Biology, Physics, Chemistry)</span>
</button>
</div>
</div>
</div>

<div className="grid grid-cols-2 md:grid-cols-4 gap-space-sm mb-space-lg">
<div className="bg-[#ffffff] p-4 rounded-xl shadow-sm flex flex-col justify-between">
<span className="font-sans text-[11px] font-mono tracking-wider uppercase text-[#6b5952]">Total Curriculum Reach</span>
<div className="flex items-baseline gap-2 mt-2">
<span className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#1d1b19]">61.3%</span>
<span className="font-sans text-[11px] font-mono tracking-wider text-[#2e522d] font-semibold">+4.2% this week</span>
</div>
<div className="w-full bg-[#f3ede9] h-1.5 rounded-full mt-3 overflow-hidden">
<div className="bg-[#456644] h-full rounded-full" style={{ width: '61.3%' }}></div>
</div>
</div>
<div className="bg-[#ffffff] p-4 rounded-xl shadow-sm flex flex-col justify-between">
<span className="font-sans text-[11px] font-mono tracking-wider uppercase text-[#6b5952]">Mastered Units</span>
<div className="flex items-baseline gap-2 mt-2">
<span className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#1d1b19]">39<span className="font-sans text-xs text-[#2d2420] leading-normal text-[#6b5952] font-normal">/64 units</span></span>
</div>
<div className="flex items-center gap-1.5 mt-3 text-[#2e522d] font-sans text-[11px] font-mono tracking-wider">
<span className="material-symbols-outlined text-sm">verified</span>
<span className="">With structured proof cards</span>
</div>
</div>
<div className="bg-[#ffffff] p-4 rounded-xl shadow-sm flex flex-col justify-between">
<span className="font-sans text-[11px] font-mono tracking-wider uppercase text-[#6b5952]">Past Paper Proofs</span>
<div className="flex items-baseline gap-2 mt-2">
<span className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#1d1b19]">142</span>
<span className="font-sans text-[11px] font-mono tracking-wider text-[#3d3430] font-normal">Paper II solved</span>
</div>
<div className="flex items-center gap-1 mt-3 font-sans text-[11px] font-mono tracking-wider text-[#c85a32]">
<span className="">From 2011 to 2024</span>
</div>
</div>
<div className="bg-[#ffffff] p-4 rounded-xl shadow-sm flex flex-col justify-between">
<span className="font-sans text-[11px] font-mono tracking-wider uppercase text-[#6b5952]">Study Balance State</span>
<div className="flex items-baseline gap-2 mt-2">
<span className="font-sans text-base sm:text-lg font-semibold text-[#1d1b19] text-[#854f00] font-bold">Chemistry Lag</span>
</div>
<div className="flex items-center gap-1 mt-3 font-sans text-[11px] font-mono tracking-wider text-[#854f00]">
<span className="material-symbols-outlined text-sm">trending_down</span>
<span className="">8% below target cadence</span>
</div>
</div>
</div>

<div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">

<div className="xl:col-span-8 flex flex-col gap-space-lg">

<div className="bg-[#ffffff] rounded-2xl p-6 shadow-sm transition-all duration-300 hover:shadow-md">

<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5">
<div>
<div className="flex items-center gap-2 mb-1">
<span className="px-2.5 py-0.5 rounded-full bg-[#c85a32]-fixed text-white-fixed font-sans text-[11px] font-mono tracking-wider uppercase tracking-wide">Pure &amp; Applied</span>
<span className="font-sans text-[11px] font-mono tracking-wider text-[#6b5952]">Paper 01 &amp; 02 Combined</span>
</div>
<h2 className="font-serif text-xl sm:text-2xl font-medium tracking-tight text-[#1d1b19]">Combined Mathematics</h2>
<p className="font-sans text-xs text-[#2d2420] leading-normal text-[#3d3430] mt-0.5">18 of 26 Core Modules Thoroughly Mastered</p>
</div>
<div className="flex items-center sm:flex-col sm:items-end gap-3 sm:gap-1 bg-[#f8f2ef] sm:bg-transparent px-3 py-2 sm:p-0 rounded-xl">
<span className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#c85a32]">68%</span>
<span className="font-sans text-[11px] font-mono tracking-wider text-[#3d3430] font-medium">Equilibrium: On Track</span>
</div>
</div>

<div className="w-full bg-[#f8f2ef] h-2 rounded-full overflow-hidden mb-5">
<div className="bg-gradient-to-r from-primary to-tertiary h-full rounded-full transition-all duration-700" style={{ width: '68%' }}></div>
</div>

<div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#ffdcbc]/40 text-on-tertiary-fixed mb-5">
<span className="material-symbols-outlined text-base text-[#854f00] shrink-0">grade</span>
<span className="font-sans text-xs text-[#2d2420] leading-normal font-medium">High Yield Focus: Integration and Statics modules alone account for ~45% of Paper II Part B long questions.</span>
</div>

<div className="flex flex-col divide-y divide-surface-container-high/40">

<div className="py-3.5 flex items-center justify-between gap-3 cursor-pointer group hover:bg-[#f8f2ef]/50 px-2 rounded-lg transition-colors" >
<div className="flex items-start gap-3 min-w-0">
<span className="material-symbols-outlined text-[#2e522d] text-lg mt-0.5 shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
<div className="min-w-0">
<p className="font-sans text-sm font-semibold text-[#1d1b19] group-hover:text-[#c85a32] transition-colors truncate">Unit 01: Real Numbers, Induction &amp; Polynomials</p>
<p className="font-sans text-xs text-[#2d2420] leading-normal text-[#6b5952] truncate">Factor Theorem • Mathematical Induction proofs • Rational roots</p>
</div>
</div>
<div className="flex items-center gap-2 shrink-0">
<span className="px-2 py-0.5 rounded-full bg-[#c6edc1] text-on-secondary-container font-sans text-[11px] font-mono tracking-wider">Mastered • 100%</span>
<span className="material-symbols-outlined text-[#6b5952] group-hover:text-[#c85a32] text-base">chevron_right</span>
</div>
</div>

<div className="py-3.5 flex items-center justify-between gap-3 cursor-pointer group hover:bg-[#f8f2ef]/50 px-2 rounded-lg transition-colors" >
<div className="flex items-start gap-3 min-w-0">
<span className="material-symbols-outlined text-[#2e522d] text-lg mt-0.5 shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
<div className="min-w-0">
<p className="font-sans text-sm font-semibold text-[#1d1b19] group-hover:text-[#c85a32] transition-colors truncate">Unit 02: Quadratic Equations &amp; Complex Numbers</p>
<p className="font-sans text-xs text-[#2d2420] leading-normal text-[#6b5952] truncate">De Moivre's Theorem • Argand Geometry • Discriminant proofs</p>
</div>
</div>
<div className="flex items-center gap-2 shrink-0">
<span className="px-2 py-0.5 rounded-full bg-[#c6edc1] text-on-secondary-container font-sans text-[11px] font-mono tracking-wider">Mastered • 100%</span>
<span className="material-symbols-outlined text-[#6b5952] group-hover:text-[#c85a32] text-base">chevron_right</span>
</div>
</div>

<div className="py-3.5 flex items-center justify-between gap-3 cursor-pointer group bg-[#f8f2ef] px-3 rounded-lg transition-all shadow-sm" >
<div className="flex items-start gap-3 min-w-0">
<span className="material-symbols-outlined text-[#c85a32] text-lg mt-0.5 shrink-0 animate-spin">refresh</span>
<div className="min-w-0">
<div className="flex items-center gap-2">
<p className="font-sans text-sm font-semibold text-[#1d1b19] text-[#c85a32] truncate">Unit 03: Integration by Parts &amp; Definite Integrals</p>
<span className="px-1.5 py-0.2 rounded bg-[#c85a32]/10 text-[#c85a32] font-sans text-[10px] uppercase">Active</span>
</div>
<p className="font-sans text-xs text-[#2d2420] leading-normal text-[#3d3430] truncate">Currently Studying • 18 past structured questions solved • Recurrence laws</p>
</div>
</div>
<div className="flex items-center gap-2 shrink-0">
<span className="px-2 py-0.5 rounded-full bg-[#ffdbcf] text-white-container font-sans text-[11px] font-mono tracking-wider">85% • In Depth</span>
<span className="material-symbols-outlined text-[#c85a32] text-base">chevron_right</span>
</div>
</div>

<div className="py-3.5 flex items-center justify-between gap-3 cursor-pointer group hover:bg-[#f8f2ef]/50 px-2 rounded-lg transition-colors" >
<div className="flex items-start gap-3 min-w-0">
<span className="material-symbols-outlined text-[#6b5952] text-lg mt-0.5 shrink-0">timelapse</span>
<div className="min-w-0">
<p className="font-sans text-sm font-semibold text-[#1d1b19] group-hover:text-[#c85a32] transition-colors truncate">Unit 04: Differential Equations &amp; Trajectories</p>
<p className="font-sans text-xs text-[#2d2420] leading-normal text-[#6b5952] truncate">Integrating Factor method • First-order linear forms • Geometric rates</p>
</div>
</div>
<div className="flex items-center gap-2 shrink-0">
<span className="px-2 py-0.5 rounded-full bg-[#ede7e3] text-[#3d3430] font-sans text-[11px] font-mono tracking-wider">Up Next • 40%</span>
<span className="material-symbols-outlined text-[#6b5952] group-hover:text-[#c85a32] text-base">chevron_right</span>
</div>
</div>

<div className="py-3.5 flex items-center justify-between gap-3 cursor-pointer group hover:bg-[#f8f2ef]/50 px-2 rounded-lg transition-colors" >
<div className="flex items-start gap-3 min-w-0">
<span className="material-symbols-outlined text-[#2e522d] text-lg mt-0.5 shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
<div className="min-w-0">
<p className="font-sans text-sm font-semibold text-[#1d1b19] group-hover:text-[#c85a32] transition-colors truncate">Unit 05: Statics: Coplanar Forces &amp; Friction</p>
<p className="font-sans text-xs text-[#2d2420] leading-normal text-[#6b5952] truncate">Jointed rods • Limiting equilibrium • Triangular theorem of forces</p>
</div>
</div>
<div className="flex items-center gap-2 shrink-0">
<span className="px-2 py-0.5 rounded-full bg-[#c6edc1] text-on-secondary-container font-sans text-[11px] font-mono tracking-wider">Completed • 90%</span>
<span className="material-symbols-outlined text-[#6b5952] group-hover:text-[#c85a32] text-base">chevron_right</span>
</div>
</div>

<div className="py-3.5 flex items-center justify-between gap-3 cursor-pointer group hover:bg-[#f8f2ef]/50 px-2 rounded-lg transition-colors" >
<div className="flex items-start gap-3 min-w-0">
<span className="material-symbols-outlined text-[#6b5952] text-lg mt-0.5 shrink-0">pending</span>
<div className="min-w-0">
<p className="font-sans text-sm font-semibold text-[#1d1b19] group-hover:text-[#c85a32] transition-colors truncate">Unit 06: Dynamics: Relative Velocity &amp; Circular Motion</p>
<p className="font-sans text-xs text-[#2d2420] leading-normal text-[#6b5952] truncate">Interception paths • Conical pendulum • Vertical circles • Energy methods</p>
</div>
</div>
<div className="flex items-center gap-2 shrink-0">
<span className="px-2 py-0.5 rounded-full bg-[#ffdcbc] text-on-tertiary-fixed font-sans text-[11px] font-mono tracking-wider">In Progress • 65%</span>
<span className="material-symbols-outlined text-[#6b5952] group-hover:text-[#c85a32] text-base">chevron_right</span>
</div>
</div>
</div>
</div>

<div className="bg-[#ffffff] rounded-2xl p-6 shadow-sm transition-all duration-300 hover:shadow-md">
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5">
<div>
<div className="flex items-center gap-2 mb-1">
<span className="px-2.5 py-0.5 rounded-full bg-[#c6edc1] text-on-secondary-container font-sans text-[11px] font-mono tracking-wider uppercase tracking-wide">Experimental &amp; Theory</span>
<span className="font-sans text-[11px] font-mono tracking-wider text-[#6b5952]">Units 01 through 11</span>
</div>
<h2 className="font-serif text-xl sm:text-2xl font-medium tracking-tight text-[#1d1b19]">Physics Core</h2>
<p className="font-sans text-xs text-[#2d2420] leading-normal text-[#3d3430] mt-0.5">14 of 22 NIE Practical &amp; Theory Units Verified</p>
</div>
<div className="flex items-center sm:flex-col sm:items-end gap-3 sm:gap-1 bg-[#f8f2ef] sm:bg-transparent px-3 py-2 sm:p-0 rounded-xl">
<span className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#2e522d]">62%</span>
<span className="font-sans text-[11px] font-mono tracking-wider text-[#3d3430] font-medium">Equilibrium: Steady</span>
</div>
</div>
<div className="w-full bg-[#f8f2ef] h-2 rounded-full overflow-hidden mb-5">
<div className="bg-gradient-to-r from-secondary to-primary h-full rounded-full transition-all duration-700" style={{ width: '62%' }}></div>
</div>

<div className="flex items-center justify-between p-3 rounded-xl bg-[#f3ede9] text-[#1d1b19] mb-5">
<div className="flex items-center gap-2.5">
<span className="material-symbols-outlined text-[#c85a32] text-lg">menu_book</span>
<span className="font-sans text-xs text-[#2d2420] leading-normal font-medium">Formula Sheet Quick Action: 48 Mandatory NIE Derivations</span>
</div>
<button className="px-3 py-1 rounded-full bg-[#ffffff] text-[#c85a32] font-sans text-[11px] font-mono tracking-wider shadow-sm hover:bg-[#c85a32] hover:text-white transition-all" >
            Inspect Sheets
          </button>
</div>

<div className="flex flex-col divide-y divide-surface-container-high/40">

<div className="py-3.5 flex items-center justify-between gap-3 cursor-pointer group hover:bg-[#f8f2ef]/50 px-2 rounded-lg transition-colors" >
<div className="flex items-start gap-3 min-w-0">
<span className="material-symbols-outlined text-[#2e522d] text-lg mt-0.5 shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
<div className="min-w-0">
<p className="font-sans text-sm font-semibold text-[#1d1b19] group-hover:text-[#c85a32] transition-colors truncate">Unit 01: Measurement &amp; Vernier / Micrometer Errors</p>
<p className="font-sans text-xs text-[#2d2420] leading-normal text-[#6b5952] truncate">Dimensional analysis • Zero errors • Error propagation in products</p>
</div>
</div>
<div className="flex items-center gap-2 shrink-0">
<span className="px-2 py-0.5 rounded-full bg-[#c6edc1] text-on-secondary-container font-sans text-[11px] font-mono tracking-wider">Mastered • 100%</span>
<span className="material-symbols-outlined text-[#6b5952] group-hover:text-[#c85a32] text-base">chevron_right</span>
</div>
</div>

<div className="py-3.5 flex items-center justify-between gap-3 cursor-pointer group hover:bg-[#f8f2ef]/50 px-2 rounded-lg transition-colors" >
<div className="flex items-start gap-3 min-w-0">
<span className="material-symbols-outlined text-[#2e522d] text-lg mt-0.5 shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
<div className="min-w-0">
<p className="font-sans text-sm font-semibold text-[#1d1b19] group-hover:text-[#c85a32] transition-colors truncate">Unit 02: Mechanics &amp; Moment of Inertia</p>
<p className="font-sans text-xs text-[#2d2420] leading-normal text-[#6b5952] truncate">Rotational kinetic energy • Rolling without slipping • Collisions</p>
</div>
</div>
<div className="flex items-center gap-2 shrink-0">
<span className="px-2 py-0.5 rounded-full bg-[#c6edc1] text-on-secondary-container font-sans text-[11px] font-mono tracking-wider">Completed • 95%</span>
<span className="material-symbols-outlined text-[#6b5952] group-hover:text-[#c85a32] text-base">chevron_right</span>
</div>
</div>

<div className="py-3.5 flex items-center justify-between gap-3 cursor-pointer group hover:bg-[#f8f2ef]/50 px-2 rounded-lg transition-colors" >
<div className="flex items-start gap-3 min-w-0">
<span className="material-symbols-outlined text-[#2e522d] text-lg mt-0.5 shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
<div className="min-w-0">
<p className="font-sans text-sm font-semibold text-[#1d1b19] group-hover:text-[#c85a32] transition-colors truncate">Unit 03: Thermal Physics &amp; Heat Capacities</p>
<p className="font-sans text-xs text-[#2d2420] leading-normal text-[#6b5952] truncate">Indicator diagrams • First Law of Thermodynamics • Thermal conductivity</p>
</div>
</div>
<div className="flex items-center gap-2 shrink-0">
<span className="px-2 py-0.5 rounded-full bg-[#c6edc1] text-on-secondary-container font-sans text-[11px] font-mono tracking-wider">Mastered • 100%</span>
<span className="material-symbols-outlined text-[#6b5952] group-hover:text-[#c85a32] text-base">chevron_right</span>
</div>
</div>

<div className="py-3.5 flex items-center justify-between gap-3 cursor-pointer group hover:bg-[#f8f2ef]/50 px-2 rounded-lg transition-colors" >
<div className="flex items-start gap-3 min-w-0">
<span className="material-symbols-outlined text-[#854f00] text-lg mt-0.5 shrink-0">waves</span>
<div className="min-w-0">
<p className="font-sans text-sm font-semibold text-[#1d1b19] group-hover:text-[#c85a32] transition-colors truncate">Unit 04: Waves &amp; Optics: Resonance Tube &amp; Sonometer</p>
<p className="font-sans text-xs text-[#2d2420] leading-normal text-[#6b5952] truncate">Stationary wave nodes • Doppler effect derivations • Refraction at spherical surfaces</p>
</div>
</div>
<div className="flex items-center gap-2 shrink-0">
<span className="px-2 py-0.5 rounded-full bg-[#ffdcbc] text-on-tertiary-fixed font-sans text-[11px] font-mono tracking-wider">In Progress • 60%</span>
<span className="material-symbols-outlined text-[#6b5952] group-hover:text-[#c85a32] text-base">chevron_right</span>
</div>
</div>

<div className="py-3.5 flex items-center justify-between gap-3 cursor-pointer group hover:bg-[#f8f2ef]/50 px-2 rounded-lg transition-colors" >
<div className="flex items-start gap-3 min-w-0">
<span className="material-symbols-outlined text-[#6b5952] text-lg mt-0.5 shrink-0">bolt</span>
<div className="min-w-0">
<p className="font-sans text-sm font-semibold text-[#1d1b19] group-hover:text-[#c85a32] transition-colors truncate">Unit 05: Electric Fields &amp; Coulomb's Law</p>
<p className="font-sans text-xs text-[#2d2420] leading-normal text-[#6b5952] truncate">Capacitor network charges • Electric dipole moment • Equipotential surfaces</p>
</div>
</div>
<div className="flex items-center gap-2 shrink-0">
<span className="px-2 py-0.5 rounded-full bg-[#ede7e3] text-[#3d3430] font-sans text-[11px] font-mono tracking-wider">Up Next • 30%</span>
<span className="material-symbols-outlined text-[#6b5952] group-hover:text-[#c85a32] text-base">chevron_right</span>
</div>
</div>

<div className="py-3.5 flex items-center justify-between gap-3 cursor-pointer group hover:bg-[#f8f2ef]/50 px-2 rounded-lg transition-colors" >
<div className="flex items-start gap-3 min-w-0">
<span className="material-symbols-outlined text-[#6b5952] text-lg mt-0.5 shrink-0">memory</span>
<div className="min-w-0">
<p className="font-sans text-sm font-semibold text-[#1d1b19] group-hover:text-[#c85a32] transition-colors truncate">Unit 06: Electronics &amp; Op-Amps</p>
<p className="font-sans text-xs text-[#2d2420] leading-normal text-[#6b5952] truncate">Negative feedback loops • Virtual ground concept • Comparator applications</p>
</div>
</div>
<div className="flex items-center gap-2 shrink-0">
<span className="px-2 py-0.5 rounded-full bg-[#ede7e3] text-[#6b5952] font-sans text-[11px] font-mono tracking-wider">Upcoming</span>
<span className="material-symbols-outlined text-[#6b5952] group-hover:text-[#c85a32] text-base">chevron_right</span>
</div>
</div>
</div>
</div>

<div className="bg-[#ffffff] rounded-2xl p-6 shadow-sm transition-all duration-300 hover:shadow-md">
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5">
<div>
<div className="flex items-center gap-2 mb-1">
<span className="px-2.5 py-0.5 rounded-full bg-error-container text-on-error-container font-sans text-[11px] font-mono tracking-wider uppercase tracking-wide">Needs Focus Boost</span>
<span className="font-sans text-[11px] font-mono tracking-wider text-[#6b5952]">Units 01 through 14</span>
</div>
<h2 className="font-serif text-xl sm:text-2xl font-medium tracking-tight text-[#1d1b19]">Chemistry Core</h2>
<p className="font-sans text-xs text-[#2d2420] leading-normal text-[#3d3430] mt-0.5">Physical, Inorganic (s, p, d block) &amp; Organic Reaction Pathways</p>
</div>
<div className="flex items-center sm:flex-col sm:items-end gap-3 sm:gap-1 bg-[#f8f2ef] sm:bg-transparent px-3 py-2 sm:p-0 rounded-xl">
<span className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#854f00]">54%</span>
<span className="font-sans text-[11px] font-mono tracking-wider text-error font-medium">Equilibrium: Attention</span>
</div>
</div>
<div className="w-full bg-[#f8f2ef] h-2 rounded-full overflow-hidden mb-5">
<div className="bg-gradient-to-r from-tertiary to-error h-full rounded-full transition-all duration-700" style={{ width: '54%' }}></div>
</div>

<div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#f3ede9] text-[#1d1b19] mb-5">
<span className="material-symbols-outlined text-[#854f00] text-lg shrink-0 mt-0.5">lightbulb</span>
<p className="font-sans text-xs text-[#2d2420] leading-normal leading-relaxed">
<span className="font-bold text-[#1d1b19]">Strategy Tip:</span> Knocking out 2 Organic synthesis reaction pathways before this Friday puts your percentile comfortably ahead of the Colombo district university cutoff threshold.
          </p>
</div>

<div className="flex flex-col divide-y divide-surface-container-high/40">

<div className="py-3.5 flex items-center justify-between gap-3 cursor-pointer group hover:bg-[#f8f2ef]/50 px-2 rounded-lg transition-colors" >
<div className="flex items-start gap-3 min-w-0">
<span className="material-symbols-outlined text-[#2e522d] text-lg mt-0.5 shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
<div className="min-w-0">
<p className="font-sans text-sm font-semibold text-[#1d1b19] group-hover:text-[#c85a32] transition-colors truncate">Unit 01: Atomic Structure &amp; Periodic Trends</p>
<p className="font-sans text-xs text-[#2d2420] leading-normal text-[#6b5952] truncate">Electronegativity • Successive ionization energies • Lattice enthalpies</p>
</div>
</div>
<div className="flex items-center gap-2 shrink-0">
<span className="px-2 py-0.5 rounded-full bg-[#c6edc1] text-on-secondary-container font-sans text-[11px] font-mono tracking-wider">Mastered • 100%</span>
<span className="material-symbols-outlined text-[#6b5952] group-hover:text-[#c85a32] text-base">chevron_right</span>
</div>
</div>

<div className="py-3.5 flex items-center justify-between gap-3 cursor-pointer group hover:bg-[#f8f2ef]/50 px-2 rounded-lg transition-colors" >
<div className="flex items-start gap-3 min-w-0">
<span className="material-symbols-outlined text-[#854f00] text-lg mt-0.5 shrink-0">tune</span>
<div className="min-w-0">
<p className="font-sans text-sm font-semibold text-[#1d1b19] group-hover:text-[#c85a32] transition-colors truncate">Unit 02: Chemical Equilibrium &amp; Solubility Products</p>
<p className="font-sans text-xs text-[#2d2420] leading-normal text-[#6b5952] truncate">Ksp calculations • Le Chatelier shifts • Common-ion suppression</p>
</div>
</div>
<div className="flex items-center gap-2 shrink-0">
<span className="px-2 py-0.5 rounded-full bg-[#ffdcbc] text-on-tertiary-fixed font-sans text-[11px] font-mono tracking-wider">Active • 75%</span>
<span className="material-symbols-outlined text-[#6b5952] group-hover:text-[#c85a32] text-base">chevron_right</span>
</div>
</div>

<div className="py-3.5 flex items-center justify-between gap-3 cursor-pointer group hover:bg-[#f8f2ef]/50 px-2 rounded-lg transition-colors" >
<div className="flex items-start gap-3 min-w-0">
<span className="material-symbols-outlined text-error text-lg mt-0.5 shrink-0">warning</span>
<div className="min-w-0">
<p className="font-sans text-sm font-semibold text-[#1d1b19] group-hover:text-[#c85a32] transition-colors truncate">Unit 03: d-Block Elements &amp; Color Precipitates</p>
<p className="font-sans text-xs text-[#2d2420] leading-normal text-[#6b5952] truncate">Transition metal complexes • Oxidation states • Qualitative color tests</p>
</div>
</div>
<div className="flex items-center gap-2 shrink-0">
<span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-sans text-[11px] font-mono tracking-wider">Review Needed • 50%</span>
<span className="material-symbols-outlined text-[#6b5952] group-hover:text-[#c85a32] text-base">chevron_right</span>
</div>
</div>

<div className="py-3.5 flex items-center justify-between gap-3 cursor-pointer group hover:bg-[#f8f2ef]/50 px-2 rounded-lg transition-colors" >
<div className="flex items-start gap-3 min-w-0">
<span className="material-symbols-outlined text-[#c85a32] text-lg mt-0.5 shrink-0">science</span>
<div className="min-w-0">
<p className="font-sans text-sm font-semibold text-[#1d1b19] group-hover:text-[#c85a32] transition-colors truncate">Unit 04: Organic Reaction Mechanisms &amp; Synthesis</p>
<p className="font-sans text-xs text-[#2d2420] leading-normal text-[#6b5952] truncate">Electrophilic addition • Benzene nitration mechanism • Nucleophilic substitutions</p>
</div>
</div>
<div className="flex items-center gap-2 shrink-0">
<span className="px-2 py-0.5 rounded-full bg-[#ffdbcf] text-white-container font-sans text-[11px] font-mono tracking-wider">In Progress • 65%</span>
<span className="material-symbols-outlined text-[#6b5952] group-hover:text-[#c85a32] text-base">chevron_right</span>
</div>
</div>

<div className="py-3.5 flex items-center justify-between gap-3 cursor-pointer group hover:bg-[#f8f2ef]/50 px-2 rounded-lg transition-colors" >
<div className="flex items-start gap-3 min-w-0">
<span className="material-symbols-outlined text-[#6b5952] text-lg mt-0.5 shrink-0">factory</span>
<div className="min-w-0">
<p className="font-sans text-sm font-semibold text-[#1d1b19] group-hover:text-[#c85a32] transition-colors truncate">Unit 05: Environmental &amp; Industrial Chemistry</p>
<p className="font-sans text-xs text-[#2d2420] leading-normal text-[#6b5952] truncate">Solvay process • Ozone depletion • Green chemistry principles</p>
</div>
</div>
<div className="flex items-center gap-2 shrink-0">
<span className="px-2 py-0.5 rounded-full bg-[#ede7e3] text-[#6b5952] font-sans text-[11px] font-mono tracking-wider">Scheduled</span>
<span className="material-symbols-outlined text-[#6b5952] group-hover:text-[#c85a32] text-base">chevron_right</span>
</div>
</div>
</div>
</div>
</div>

<div className="xl:col-span-4 sticky top-24 flex flex-col gap-space-md">

<div className="bg-[#ffffff] rounded-2xl p-6 shadow-sm transition-all duration-300" id="deep-dive-panel">
<div className="flex items-center justify-between border-b-0 pb-4">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-[#c85a32] text-xl">auto_stories</span>
<span className="font-sans text-[11px] font-mono tracking-wider uppercase text-[#6b5952]">Selected Subtopic</span>
</div>
<span className="px-2.5 py-0.5 rounded-full bg-[#ffdbcf] text-white-container font-sans text-[11px] font-mono tracking-wider font-semibold" id="detail-badge">
            Active Unit
          </span>
</div>
<h3 className="font-serif text-lg sm:text-xl font-medium text-[#1d1b19] mt-1 mb-2 leading-snug" id="detail-title">
          Unit 03: Integration by Parts &amp; Definite Integrals
        </h3>
<div className="flex items-center gap-2 mb-4">
<span className="font-sans text-[11px] font-mono tracking-wider px-2 py-0.5 rounded bg-[#f3ede9] text-[#3d3430]" id="detail-exam-tag">
            Paper II Section B (15 marks)
          </span>
<span className="font-sans text-[11px] font-mono tracking-wider text-[#2e522d] font-medium" id="detail-progress-val">
            85% Mastered
          </span>
</div>
<p className="font-sans text-xs text-[#2d2420] leading-normal text-[#3d3430] leading-relaxed mb-6" id="detail-description">
          18 past structured questions solved. Substitution by trigonometric identities and recurrence relations active in personal study journal.
        </p>

<div className="flex flex-col gap-3 mb-6">

<div className="p-3 rounded-xl bg-[#f8f2ef] hover:bg-[#f3ede9] transition-colors flex items-center justify-between cursor-pointer group">
<div className="flex items-center gap-3">
<div className="w-9 h-9 rounded-lg bg-[#ffffff] flex items-center justify-center text-[#c85a32] shadow-xs">
<span className="material-symbols-outlined text-lg">description</span>
</div>
<div>
<p className="font-sans text-sm font-semibold text-[#1d1b19] group-hover:text-[#c85a32] transition-colors">Handwritten Proof Notebook</p>
<p className="font-sans text-xs text-[#2d2420] leading-normal text-[#6b5952]">14 pages • 2.4 MB PDF scanned</p>
</div>
</div>
<span className="material-symbols-outlined text-[#6b5952] group-hover:text-[#c85a32] text-sm">visibility</span>
</div>

<div className="p-3 rounded-xl bg-[#f8f2ef] hover:bg-[#f3ede9] transition-colors flex items-center justify-between cursor-pointer group">
<div className="flex items-center gap-3">
<div className="w-9 h-9 rounded-lg bg-[#ffffff] flex items-center justify-center text-[#2e522d] shadow-xs">
<span className="material-symbols-outlined text-lg">style</span>
</div>
<div>
<p className="font-sans text-sm font-semibold text-[#1d1b19] group-hover:text-[#2e522d] transition-colors">Formula Speed-Drill Deck</p>
<p className="font-sans text-xs text-[#2d2420] leading-normal text-[#6b5952]">12 active cards • 92% retention</p>
</div>
</div>
<span className="material-symbols-outlined text-[#6b5952] group-hover:text-[#2e522d] text-sm">play_arrow</span>
</div>

<div className="p-3 rounded-xl bg-[#f8f2ef] hover:bg-[#f3ede9] transition-colors flex items-center justify-between cursor-pointer group">
<div className="flex items-center gap-3">
<div className="w-9 h-9 rounded-lg bg-[#ffffff] flex items-center justify-center text-[#854f00] shadow-xs">
<span className="material-symbols-outlined text-lg">history_edu</span>
</div>
<div>
<p className="font-sans text-sm font-semibold text-[#1d1b19] group-hover:text-[#854f00] transition-colors">Verified Examination Occurrences</p>
<p className="font-sans text-xs text-[#2d2420] leading-normal text-[#6b5952]">Appeared in 2018, 2020, 2022, 2023 Paper II</p>
</div>
</div>
<span className="material-symbols-outlined text-[#6b5952] group-hover:text-[#854f00] text-sm">open_in_new</span>
</div>
</div>

<button className="w-full py-3.5 px-6 rounded-full bg-[#c85a32] text-white font-sans text-sm font-semibold text-[#1d1b19] shadow-sm hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group" >
<span className="material-symbols-outlined text-xl group-hover:rotate-45 transition-transform duration-300">hourglass_top</span>
<span className="">Start 45m Focus Block on this Subtopic</span>
</button>
<p className="font-sans text-[11px] font-mono tracking-wider text-center text-[#6b5952] mt-3">
          Deep work blocks automatically register to your daily study log.
        </p>
</div>

<div className="bg-[#ffffff] rounded-2xl p-5 shadow-sm overflow-hidden relative">
<div className="flex items-center justify-between mb-3">
<span className="font-sans text-[11px] font-mono tracking-wider uppercase text-[#6b5952]">Desk Companion</span>
<span className="text-xs text-[#2e522d] font-medium">Kinfolk Calm Space</span>
</div>
<div className="h-44 w-full rounded-xl overflow-hidden relative mb-3">
<img className="w-full h-full object-cover" data-alt="Minimalist calm study desk with a warm cup of Ceylon tea, open grid notebook with handwritten mathematical derivations and ink fountain pen, soft morning natural sunlight from window, organic linen cloth, Kinfolk magazine aesthetic, earthy tones terracotta and cream." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCOdBBzn9_a9QUTMvjGYvfsPT7mtgFcUEcxruYH-cFKbCDtoCXICzmWlq63UYYSDIMnmsvUNMkNbj4VRKRFZgE6B9hvVd87LqDW1jIQQ3HMJZUMNbJqZgXjitD804Kz3Gh4lWWEGdbfYzyGvhUNvrAY-bLOYtgxcRBQFD48rxxet-kgqMuA2d5uYwStUxSWaN9BrpB1WhsKkSF5WIhyd-jVEUmMvCT09o1CLxpkcH19g_ESaPFkMTVm" />
<div className="absolute inset-0 bg-gradient-to-t from-on-surface/60 via-transparent to-transparent"></div>
<div className="absolute bottom-2.5 left-3 right-3 text-surface">
<p className="font-sans text-sm font-semibold text-[#1d1b19] text-surface drop-shadow-sm">Physical Revision Binder</p>
<p className="font-sans text-xs text-[#2d2420] leading-normal text-surface-container-low drop-shadow-sm">Shelf 2 • Combined Maths Pure Notes • Black Folder</p>
</div>
</div>
<p className="font-sans text-xs text-[#2d2420] leading-normal text-[#3d3430] leading-relaxed">
          “Do not attempt to solve every problem at once. One single derivation derived cleanly from first principles is worth ten rushed exercises.”
        </p>
</div>

<div className="bg-[#f8f2ef] rounded-2xl p-5">
<div className="flex items-center justify-between mb-2">
<span className="font-sans text-sm font-semibold text-[#1d1b19]">Colombo Percentile Pace</span>
<span className="font-sans text-[11px] font-mono tracking-wider font-semibold text-[#2e522d]">Top 12%</span>
</div>
<p className="font-sans text-xs text-[#2d2420] leading-normal text-[#3d3430] mb-3">
          Based on 1,420 students tracking the 2026 syllabus in this zone. You are +8 modules ahead in Pure Mathematics.
        </p>
<div className="flex items-center gap-1.5 text-[#6b5952] font-sans text-[11px] font-mono tracking-wider">
<span className="material-symbols-outlined text-sm">info</span>
<span className="">Refreshes at midnight Colombo time</span>
</div>
</div>
</div>
</div>

<div className="fixed inset-0 z-50 bg-on-surface/40 backdrop-blur-sm hidden items-center justify-center p-4" id="derivations-modal">
<div className="bg-[#ffffff] rounded-2xl p-6 md:p-8 max-w-2xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
<div className="flex items-center justify-between pb-4 border-b-0">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-[#c85a32] text-2xl">verified</span>
<h3 className="font-serif text-lg sm:text-xl font-medium text-[#1d1b19]">48 Mandatory NIE Derivations</h3>
</div>
<button className="w-8 h-8 rounded-full bg-[#f3ede9] hover:bg-[#ede7e3] flex items-center justify-center text-[#1d1b19] transition-colors" >
<span className="material-symbols-outlined text-base">close</span>
</button>
</div>
<p className="font-sans text-sm text-[#3d3430] leading-relaxed mb-6">
        All required proofs explicitly stipulated in the official Sri Lankan G.C.E. A/L Physics syllabus document.
      </p>
<div className="space-y-3 font-sans text-xs text-[#2d2420] leading-normal text-[#1d1b19] mb-6">
<div className="p-3 bg-[#f8f2ef] rounded-xl flex items-center justify-between">
<span className="">1. Conservation of Linear Momentum from Newton's Third Law</span>
<span className="text-[#2e522d] font-semibold font-sans text-[11px] font-mono tracking-wider">Tested 2021</span>
</div>
<div className="p-3 bg-[#f8f2ef] rounded-xl flex items-center justify-between">
<span className="">2. Moment of Inertia of a Uniform Solid Cylinder (I = ½ MR²)</span>
<span className="text-[#2e522d] font-semibold font-sans text-[11px] font-mono tracking-wider">Tested 2019</span>
</div>
<div className="p-3 bg-[#f8f2ef] rounded-xl flex items-center justify-between">
<span className="">3. Velocity of Longitudinal Sound Wave in a Stretched String</span>
<span className="text-[#854f00] font-semibold font-sans text-[11px] font-mono tracking-wider">Unexamined 3 Yrs</span>
</div>
<div className="p-3 bg-[#f8f2ef] rounded-xl flex items-center justify-between">
<span className="">4. Pressure Exerted by Ideal Gas Molecules (P = ⅓ ρ c²)</span>
<span className="text-[#2e522d] font-semibold font-sans text-[11px] font-mono tracking-wider">Core Proof</span>
</div>
<div className="p-3 bg-[#f8f2ef] rounded-xl flex items-center justify-between">
<span className="">5. Electric Potential due to Point Charge (V = Q / 4πε&amp;sub0r)</span>
<span className="text-[#c85a32] font-semibold font-sans text-[11px] font-mono tracking-wider">High Priority</span>
</div>
</div>
<div className="flex justify-end gap-3">
<button className="px-5 py-2 rounded-full bg-[#f8f2ef] text-[#1d1b19] font-sans text-sm font-semibold hover:bg-[#f3ede9] transition-colors" >
          Dismiss
        </button>
<button className="px-5 py-2 rounded-full bg-[#c85a32] text-white font-sans text-sm font-semibold text-[#1d1b19] hover:brightness-105 transition-all" >
          Download PDF Booklet
        </button>
</div>
</div>
</div>

<div className="fixed bottom-8 right-8 z-50 transform translate-y-24 opacity-0 transition-all duration-300 pointer-events-none" id="focus-toast">
<div className="bg-inverse-surface text-inverse-on-surface p-4 rounded-xl shadow-xl flex items-center gap-3">
<span className="material-symbols-outlined text-[#2e522d]-fixed text-2xl animate-spin">timelapse</span>
<div>
<p className="font-sans text-sm font-semibold text-[#1d1b19]">45-Minute Focus Block Initialized</p>
<p className="font-sans text-xs text-[#2d2420] leading-normal text-inverse-on-surface/80">Distraction shield activated. Today's log synced.</p>
</div>
</div>
</div>
</div>
    </div>
  );
}
