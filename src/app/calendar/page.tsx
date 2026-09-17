'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getExamCountdown } from '@/lib/calendar';
import { toast } from 'sonner';
import { safeStorage } from '@/lib/storage/safeStorage';
import { localDb } from '@/lib/storage/localDb';
import { EmptyCalendarScheduleIllustration } from '@/components/illustrations';
import {
  Calendar as CalendarIcon,
  Clock,
  Flame,
  Plus,
  ArrowRight,
  CheckCircle2,
  Layers,
  Sparkles,
  BookOpen,
  Filter,
  Check,
  Trash2,
  Play,
  Download,
  X,
  Target,
  Award,
} from 'lucide-react';

export interface StudyBlock {
  id: string;
  day: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';
  title: string;
  subject: string;
  unit: string;
  timeSlot: string;
  durationHours: number;
  status: 'completed' | 'in_progress' | 'planned';
  notes: string;
}

const DEFAULT_BLOCKS: StudyBlock[] = [
  {
    id: 'blk-mon-1',
    day: 'MON',
    title: 'Pure Mathematics: Differentiation & Curve Sketching',
    subject: 'Combined Maths',
    unit: 'Unit 06 • Pure Calculus',
    timeSlot: '08:00 – 11:00 AM',
    durationHours: 3.0,
    status: 'completed',
    notes: 'Completed 15 past paper problems on stationary points and asymptotes.',
  },
  {
    id: 'blk-mon-2',
    day: 'MON',
    title: 'Physics Core: Oscillations & Simple Harmonic Motion',
    subject: 'Physics',
    unit: 'Mechanics • SHM & Waves',
    timeSlot: '02:00 – 04:30 PM',
    durationHours: 2.5,
    status: 'completed',
    notes: 'Energy conservation in SHM springs and torsional pendulums.',
  },
  {
    id: 'blk-tue-1',
    day: 'TUE',
    title: 'Inorganic Chemistry: Transition Elements & Coordination',
    subject: 'Chemistry',
    unit: 'Inorganic • d-Block Series',
    timeSlot: '08:30 – 11:00 AM',
    durationHours: 2.5,
    status: 'completed',
    notes: 'Complex ion color precipitates and ligand exchange equations.',
  },
  {
    id: 'blk-tue-2',
    day: 'TUE',
    title: 'Combined Maths: Vector Equations of Lines & Planes',
    subject: 'Combined Maths',
    unit: 'Vectors & 3D Geometry',
    timeSlot: '01:30 – 04:30 PM',
    durationHours: 3.0,
    status: 'completed',
    notes: 'Scalar and vector triple products with 2022 past exam proofs.',
  },
  {
    id: 'blk-wed-1',
    day: 'WED',
    title: 'Physics: Electric Fields & Gauss Applications',
    subject: 'Physics',
    unit: 'Fields • Electrostatics',
    timeSlot: '08:00 – 11:00 AM',
    durationHours: 3.0,
    status: 'completed',
    notes: 'Spherical and cylindrical charge symmetry potential gradients.',
  },
  {
    id: 'blk-wed-2',
    day: 'WED',
    title: 'Physical Chemistry: Chemical Kinetics & Rate Laws',
    subject: 'Chemistry',
    unit: 'Physical Chemistry • Kinetics',
    timeSlot: '02:00 – 04:00 PM',
    durationHours: 2.0,
    status: 'completed',
    notes: 'Arrhenius activation energy determination and half-life derivations.',
  },
  {
    id: 'blk-thu-1',
    day: 'THU',
    title: 'Pure Mathematics: Integration by Parts & Definite Integrals',
    subject: 'Combined Maths',
    unit: 'Combined Maths • Unit 07',
    timeSlot: '08:00 – 11:00 AM',
    durationHours: 3.0,
    status: 'completed',
    notes: 'Completed 18 past structured questions (2018-2024). Worked through trigonometric substitution nuances.',
  },
  {
    id: 'blk-thu-2',
    day: 'THU',
    title: 'Physics Core: Rotational Dynamics & Moment of Inertia',
    subject: 'Physics',
    unit: 'Physics Advanced • Mechanics',
    timeSlot: '01:00 – 03:30 PM',
    durationHours: 2.5,
    status: 'completed',
    notes: 'Rigid body angular momentum derivations and 2021 Part II past paper questions.',
  },
  {
    id: 'blk-thu-3',
    day: 'THU',
    title: 'Chemical Equilibrium & Inorganic Reaction Schemes',
    subject: 'Chemistry',
    unit: 'Chemistry • Physical & Inorganic',
    timeSlot: '05:00 – 07:00 PM',
    durationHours: 2.0,
    status: 'in_progress',
    notes: 'Targeting Le Chatelier shifts, solubility products calculation practice, and d-block precipitate cards.',
  },
  {
    id: 'blk-thu-4',
    day: 'THU',
    title: 'Formula Ledger & Active Recall Synthesis',
    subject: 'Combined Maths',
    unit: 'Handwritten Notebook • Review',
    timeSlot: '08:30 – 09:30 PM',
    durationHours: 1.0,
    status: 'planned',
    notes: 'Quick error log review from morning Pure Maths. Zero screens 30 mins before sleep.',
  },
  {
    id: 'blk-fri-1',
    day: 'FRI',
    title: 'Organic Chemistry: Aldehydes, Ketones & Nucleophilic Addition',
    subject: 'Chemistry',
    unit: 'Organic Chemistry • Carbonyls',
    timeSlot: '08:00 – 11:00 AM',
    durationHours: 3.0,
    status: 'planned',
    notes: 'Reaction pathways for Grignard reagents and aldol condensation.',
  },
  {
    id: 'blk-fri-2',
    day: 'FRI',
    title: 'Physics: Magnetic Fields & Ampere Applications',
    subject: 'Physics',
    unit: 'Electromagnetism',
    timeSlot: '02:00 – 04:30 PM',
    durationHours: 2.5,
    status: 'planned',
    notes: 'Toroid and solenoid magnetic fluxes with structured derivations.',
  },
  {
    id: 'blk-sat-1',
    day: 'SAT',
    title: 'Combined Maths: Statics & Rigid Body Equilibrium Drill',
    subject: 'Combined Maths',
    unit: 'Applied Maths • Statics',
    timeSlot: '08:00 – 11:30 AM',
    durationHours: 3.5,
    status: 'planned',
    notes: 'Friction, jointed rods, and virtual work principles past exam series.',
  },
  {
    id: 'blk-sat-2',
    day: 'SAT',
    title: 'Physics Structured Essay Timed Simulation (Paper II)',
    subject: 'Physics',
    unit: 'Past Exam Sprint • Mechanics & Waves',
    timeSlot: '01:30 – 04:30 PM',
    durationHours: 3.0,
    status: 'planned',
    notes: 'Strict exam conditions with non-programmable calculator and official answer scripts.',
  },
  {
    id: 'blk-sun-1',
    day: 'SUN',
    title: 'Islandwide Full Mock Simulation (Maths & Chemistry)',
    subject: 'Combined Maths',
    unit: 'Full Mock Sprint • National Benchmarking',
    timeSlot: '08:00 – 12:00 PM',
    durationHours: 4.0,
    status: 'planned',
    notes: 'Full combined mock sitting to simulate national exam pressure and stamina.',
  },
  {
    id: 'blk-sun-2',
    day: 'SUN',
    title: 'Weekly Error Log Synthesis & Rest Protocol',
    subject: 'Chemistry',
    unit: 'Error Ledger & Recovery',
    timeSlot: '04:00 – 06:00 PM',
    durationHours: 2.0,
    status: 'planned',
    notes: 'Review red-flagged questions from mock paper. Plan coming week schedule.',
  },
];

const DEFAULT_BIO_BLOCKS: StudyBlock[] = [
  {
    id: 'blk-bio-mon-1',
    day: 'MON',
    title: 'Biology Core: Plant Tissues, Transport & Transpiration',
    subject: 'Biology',
    unit: 'Unit 03 • Plant Form and Function',
    timeSlot: '08:00 – 11:00 AM',
    durationHours: 3.0,
    status: 'completed',
    notes: 'Covered xylem vessel structures, stomatal mechanisms, and past structured questions.',
  },
  {
    id: 'blk-bio-mon-2',
    day: 'MON',
    title: 'Chemistry: Equilibrium & Ionic Equilibria Calculations',
    subject: 'Chemistry',
    unit: 'Physical Chemistry • Equilibrium',
    timeSlot: '02:00 – 04:30 PM',
    durationHours: 2.5,
    status: 'completed',
    notes: 'Buffer solutions, solubility product (Ksp) calculations and common ion effect.',
  },
  {
    id: 'blk-bio-tue-1',
    day: 'TUE',
    title: 'Inorganic Chemistry: Transition Metal Precipitates',
    subject: 'Chemistry',
    unit: 'Inorganic Chemistry',
    timeSlot: '08:30 – 11:00 AM',
    durationHours: 2.5,
    status: 'completed',
    notes: 'Systematic qualitative anion and cation analysis identification table.',
  },
  {
    id: 'blk-bio-tue-2',
    day: 'TUE',
    title: 'Biology: Human Circulatory & Cardiac Cycle Physiology',
    subject: 'Biology',
    unit: 'Unit 05 • Animal Form & Physiology',
    timeSlot: '01:30 – 04:30 PM',
    durationHours: 3.0,
    status: 'completed',
    notes: 'Cardiac conductive system, ECG tracing, and pressure changes in the left ventricle.',
  },
  {
    id: 'blk-bio-wed-1',
    day: 'WED',
    title: 'Physics Core: Geometrical Optics & Microscope Instruments',
    subject: 'Physics',
    unit: 'Geometrical Optics & Waves',
    timeSlot: '08:00 – 11:00 AM',
    durationHours: 3.0,
    status: 'completed',
    notes: 'Compound microscope ray diagrams and angular magnification derivations.',
  },
  {
    id: 'blk-bio-wed-2',
    day: 'WED',
    title: 'Biology Resource Book Review: Molecular Biology & Genetics',
    subject: 'Biology',
    unit: 'Unit 04 • Genetics & Molecular Biology',
    timeSlot: '02:00 – 04:00 PM',
    durationHours: 2.0,
    status: 'completed',
    notes: 'DNA replication, transcription, and translation keywords check against NIE resource book.',
  },
  {
    id: 'blk-bio-thu-1',
    day: 'THU',
    title: 'Organic Chemistry: Mechanisms & Reaction Roadmaps',
    subject: 'Chemistry',
    unit: 'Organic Chemistry',
    timeSlot: '08:00 – 11:00 AM',
    durationHours: 3.0,
    status: 'completed',
    notes: 'Electrophilic addition to alkenes and nucleophilic substitution mechanisms.',
  },
  {
    id: 'blk-bio-thu-2',
    day: 'THU',
    title: 'Physics: Electric Fields, Capacitance & Energy Storage',
    subject: 'Physics',
    unit: 'Fields • Electrostatics',
    timeSlot: '01:00 – 03:30 PM',
    durationHours: 2.5,
    status: 'completed',
    notes: 'Parallel plate capacitor dielectric breakdown and charge distribution.',
  },
  {
    id: 'blk-bio-thu-3',
    day: 'THU',
    title: 'Biology: Photosynthesis Light & Dark Reactions Drill',
    subject: 'Biology',
    unit: 'Unit 02 • Chemical & Cellular Basis of Life',
    timeSlot: '05:00 – 07:00 PM',
    durationHours: 2.0,
    status: 'in_progress',
    notes: 'Calvin cycle carbon fixation stoichiometry and C4/CAM pathway comparison.',
  },
  {
    id: 'blk-bio-fri-1',
    day: 'FRI',
    title: 'Chemistry: Thermochemistry & Born-Haber Cycles',
    subject: 'Chemistry',
    unit: 'Physical Chemistry',
    timeSlot: '08:00 – 11:00 AM',
    durationHours: 3.0,
    status: 'planned',
    notes: 'Lattice energy, hydration enthalpy and Hess cycle calculations.',
  },
  {
    id: 'blk-bio-sat-1',
    day: 'SAT',
    title: 'Biology Structured Essay Simulation (Past Papers)',
    subject: 'Biology',
    unit: 'Structured Essay Drill',
    timeSlot: '08:00 – 11:30 AM',
    durationHours: 3.5,
    status: 'planned',
    notes: 'Writing timed structured answers strictly according to official marking points.',
  },
  {
    id: 'blk-bio-sun-1',
    day: 'SUN',
    title: 'Full Bio Stream Mock Exam Sitting (Biology & Chemistry)',
    subject: 'Biology',
    unit: 'National Mock Simulation',
    timeSlot: '08:00 – 12:00 PM',
    durationHours: 4.0,
    status: 'planned',
    notes: 'Timed MCQ + Structured + Essay paper sitting under full exam conditions.',
  },
];

type DayKey = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';

function getWeekDaysConfig(): { key: DayKey; label: string; dateNum: number; fullDay: string }[] {
  const keys: DayKey[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const fullDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const now = new Date();
  const dayIndex = (now.getDay() + 6) % 7; // Monday = 0, Sunday = 6
  const monday = new Date(now);
  monday.setDate(now.getDate() - dayIndex);

  return keys.map((key, idx) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + idx);
    return {
      key,
      label: key,
      dateNum: d.getDate(),
      fullDay: fullDays[idx],
    };
  });
}

function getTodayDayKey(): DayKey {
  const now = new Date();
  const dayIndex = (now.getDay() + 6) % 7;
  const keys: DayKey[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  return keys[dayIndex] || 'MON';
}

export default function CalendarPage() {
  const router = useRouter();
  const { user, member } = useAuth();
  const countdown = getExamCountdown('2026');

  const isBio = useMemo(() => {
    return (
      member?.stream === 'Biological Science' ||
      String(member?.stream || '').toLowerCase().includes('bio')
    );
  }, [member?.stream]);

  const defaultStreamBlocks = isBio ? DEFAULT_BIO_BLOCKS : DEFAULT_BLOCKS;
  const initialSubject = isBio ? 'Biology' : 'Combined Maths';

  const daysConfig = useMemo(() => getWeekDaysConfig(), []);
  const todayKey = useMemo(() => getTodayDayKey(), []);

  const [selectedDay, setSelectedDay] = useState<DayKey>(todayKey);
  const [blocks, setBlocks] = useState<StudyBlock[]>([]);
  const [weeklyGoalHours, setWeeklyGoalHours] = useState<number>(35.0);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);

  // Form State
  const [formDay, setFormDay] = useState<DayKey>(todayKey);
  const [formSubject, setFormSubject] = useState(initialSubject);
  const [formTitle, setFormTitle] = useState('');
  const [formUnit, setFormUnit] = useState('');
  const [formTimeSlot, setFormTimeSlot] = useState('08:00 – 10:30 AM');
  const [formDuration, setFormDuration] = useState('2.5');
  const [formNotes, setFormNotes] = useState('');

  const scholarName = member?.fullName || user?.displayName || 'Scholar';
  const streamName = member?.stream || (isBio ? 'Biological Science (Biology, Physics, Chemistry)' : 'Physical Science (Combined Maths, Physics, Chemistry)');
  const schoolName = member?.school || 'National Candidate';
  const streakDays = member?.streakCount ?? 0;

  useEffect(() => {
    try {
      const stored = safeStorage.getItem('studysync_calendar_blocks');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setBlocks(parsed);
        } else {
          setBlocks(defaultStreamBlocks);
          safeStorage.setItem('studysync_calendar_blocks', JSON.stringify(defaultStreamBlocks));
        }
      } else {
        setBlocks(defaultStreamBlocks);
        safeStorage.setItem('studysync_calendar_blocks', JSON.stringify(defaultStreamBlocks));
      }

      const storedGoal = safeStorage.getItem('studysync_weekly_goal_hours');
      if (storedGoal) {
        const parsedGoal = parseFloat(storedGoal);
        if (!isNaN(parsedGoal) && parsedGoal > 0) {
          setWeeklyGoalHours(parsedGoal);
        }
      }
    } catch (e) {
      setBlocks(DEFAULT_BLOCKS);
    }
  }, []);

  const saveBlocks = (updated: StudyBlock[]) => {
    setBlocks(updated);
    try {
      safeStorage.setItem('studysync_calendar_blocks', JSON.stringify(updated));
    } catch (e) {}
  };

  const currentDayBlocks = useMemo(() => {
    return blocks.filter((b) => b.day === selectedDay);
  }, [blocks, selectedDay]);

  const { loggedHours, totalPlannedHours } = useMemo(() => {
    let logged = 0;
    let planned = 0;
    for (const b of blocks) {
      planned += b.durationHours;
      if (b.status === 'completed') {
        logged += b.durationHours;
      }
    }
    return { loggedHours: logged, totalPlannedHours: planned };
  }, [blocks]);

  // Dynamic Subject Stats and Sleep Gauge from real localDb logs + scheduled blocks
  const { subjectStats, avgSleepEstimate } = useMemo(() => {
    const streamIsBio = isBio;
    const subj1 = streamIsBio ? 'Biology' : 'Combined Maths';
    const subj2 = 'Physics';
    const subj3 = 'Chemistry';

    const stats: Record<string, { logged: number; total: number; color: string }> = {
      [subj1]: { logged: 0, total: streamIsBio ? 14.0 : 16.0, color: '#c85a32' },
      [subj2]: { logged: 0, total: 12.0, color: '#456644' },
      [subj3]: { logged: 0, total: 11.0, color: '#854f00' },
    };

    // 1. Ingest actual study session logs
    const realLogs = localDb.getLogs();
    for (const log of realLogs) {
      const h1 = Number(log.hoursSubject1 || (log as any).subject1Hours || 0);
      const h2 = Number(log.hoursSubject2 || (log as any).subject2Hours || 0);
      const h3 = Number(log.hoursSubject3 || (log as any).subject3Hours || 0);
      stats[subj1].logged += h1;
      stats[subj2].logged += h2;
      stats[subj3].logged += h3;
    }

    // 2. Add completed calendar blocks
    for (const b of blocks) {
      if (b.status === 'completed') {
        if (b.subject.toLowerCase().includes('math') || b.subject.toLowerCase().includes('bio')) {
          stats[subj1].logged += b.durationHours * 0.5;
        } else if (b.subject.toLowerCase().includes('phys')) {
          stats[subj2].logged += b.durationHours * 0.5;
        } else if (b.subject.toLowerCase().includes('chem')) {
          stats[subj3].logged += b.durationHours * 0.5;
        }
      }
    }

    const totalStudy = stats[subj1].logged + stats[subj2].logged + stats[subj3].logged;
    const dailyStudyAvg = totalStudy > 0 ? totalStudy / 7 : 4.5;
    const calculatedSleep = Math.max(5.5, Math.min(8.5, 24 - dailyStudyAvg - 10));

    return {
      subjectStats: stats,
      avgSleepEstimate: +calculatedSleep.toFixed(1),
    };
  }, [blocks, isBio]);

  const handleToggleBlockStatus = (id: string) => {
    const updated = blocks.map((b) => {
      if (b.id === id) {
        const nextStatus: StudyBlock['status'] =
          b.status === 'completed'
            ? 'planned'
            : b.status === 'planned'
            ? 'in_progress'
            : 'completed';
        toast.success(
          nextStatus === 'completed'
            ? 'Session marked as Completed!'
            : nextStatus === 'in_progress'
            ? 'Session timer started!'
            : 'Session reset to Planned.'
        );
        return { ...b, status: nextStatus };
      }
      return b;
    });
    saveBlocks(updated);
  };

  const handleDeleteBlock = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = blocks.filter((b) => b.id !== id);
    saveBlocks(updated);
    toast.success('Focus block removed from rhythm.');
  };

  const handleCreateBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      toast.error('Please enter a target topic or paper reference.');
      return;
    }

    const duration = parseFloat(formDuration) || 2.0;
    const newBlock: StudyBlock = {
      id: 'blk-' + Date.now(),
      day: formDay,
      title: formTitle.trim(),
      subject: formSubject,
      unit: formUnit.trim() || formSubject + ' • Deep Focus',
      timeSlot: formTimeSlot,
      durationHours: duration,
      status: 'planned',
      notes: formNotes.trim() || 'Self-directed revision block.',
    };

    const updated = [...blocks, newBlock];
    saveBlocks(updated);
    setIsPlanModalOpen(false);
    toast.success('New focus block locked into ' + formDay + ' schedule!');
    setFormTitle('');
    setFormUnit('');
    setFormNotes('');
  };

  const handleSaveGoal = (newGoal: number) => {
    setWeeklyGoalHours(newGoal);
    safeStorage.setItem('studysync_weekly_goal_hours', String(newGoal));
    setIsGoalModalOpen(false);
    toast.success('Weekly goal updated to ' + newGoal + ' hours!');
  };

  const handleExportIcs = () => {
    const dayOffsetMap: Record<DayKey, number> = {
      MON: 0,
      TUE: 1,
      WED: 2,
      THU: 3,
      FRI: 4,
      SAT: 5,
      SUN: 6,
    };

    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//StudySync//AL 2026 Academic Planner//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:StudySync 2026 Focus Rhythm',
      'X-WR-TIMEZONE:Asia/Colombo',
    ];

    const now = new Date();
    const currentDayOfWeek = (now.getDay() + 6) % 7;
    const mondayDate = new Date(now);
    mondayDate.setDate(now.getDate() - currentDayOfWeek);

    for (const b of blocks) {
      const offset = dayOffsetMap[b.day] || 0;
      const blockDate = new Date(mondayDate);
      blockDate.setDate(mondayDate.getDate() + offset);

      const y = blockDate.getFullYear();
      const m = String(blockDate.getMonth() + 1).padStart(2, '0');
      const d = String(blockDate.getDate()).padStart(2, '0');

      let startH = 8;
      if (b.timeSlot.includes('01:') || b.timeSlot.includes('02:')) startH = 14;
      if (b.timeSlot.includes('05:')) startH = 17;
      if (b.timeSlot.includes('08:30 PM') || b.timeSlot.includes('08:00 PM')) startH = 20;

      const endH = startH + Math.max(1, Math.round(b.durationHours));
      const dtStart = `${y}${m}${d}T${String(startH).padStart(2, '0')}0000`;
      const dtEnd = `${y}${m}${d}T${String(endH).padStart(2, '0')}0000`;

      lines.push('BEGIN:VEVENT');
      lines.push(`UID:studysync-${b.id}@studysync.app`);
      lines.push(`SUMMARY:[${b.subject}] ${b.title.replace(/[,;]/g, ' ')}`);
      lines.push(`DESCRIPTION:${b.notes.replace(/[,;]/g, ' ')} | ${b.unit}`);
      lines.push(`DTSTART:${dtStart}`);
      lines.push(`DTEND:${dtEnd}`);
      lines.push('STATUS:CONFIRMED');
      lines.push('END:VEVENT');
    }

    lines.push('END:VCALENDAR');

    const icsContent = lines.join('\r\n');
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'studysync_focus_rhythm_2026.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('Calendar exported! Open the downloaded file to sync with Google or Apple Calendar.');
  };

  const progressPercent = Math.min(100, Math.round((loggedHours / weeklyGoalHours) * 100));
  const remainingHours = Math.max(0, parseFloat((weeklyGoalHours - loggedHours).toFixed(1)));
  const currentDayInfo = daysConfig.find((d) => d.key === selectedDay) || daysConfig[0];

  return (
    <div className="min-h-[calc(100vh-140px)] bg-[#fef8f4] text-[#1d1b19] font-sans antialiased selection:bg-[#c85a32]/20 selection:text-[#1d1b19] py-8">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 flex flex-col gap-8">
        
        {/* Top Header */}
        <section className="relative flex flex-col lg:flex-row lg:items-end justify-between gap-6 pt-4 pb-6 border-b border-[#dec0b7]/60">
          <div className="max-w-3xl flex flex-col">
            <div className="flex flex-wrap items-center gap-2 mb-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#c85a32] animate-ping"></span>
              <span className="font-sans text-[11px] font-mono tracking-wider uppercase tracking-widest text-[#c85a32] font-bold">
                Weekly Rhythm &amp; Focus Flow
              </span>
              <span className="text-[#6b5952] font-sans">•</span>
              <span className="font-sans text-[11px] font-mono tracking-wider text-[#2d2420] font-medium">
                {streamName}
              </span>
              <span className="text-[#6b5952] font-sans">•</span>
              <span className="font-sans text-[11px] font-mono tracking-wider text-[#2d2420] font-medium">
                {schoolName}
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#1d1b19] tracking-tight leading-tight">
              Study Planner
            </h1>
          </div>

          {/* Weekly Study Pace Progress Card */}
          <div className="bg-[#ffffff] rounded-2xl p-5 border border-[#dec0b7] shadow-sm flex flex-col gap-3 min-w-[320px] sm:min-w-[360px]">
            <div className="flex items-center justify-between">
              <span className="font-sans text-[11px] font-mono tracking-wider uppercase text-[#2d2420] font-semibold">
                Weekly Study Pace
              </span>
              <span className="px-2.5 py-1 rounded-full bg-[#EAF2EA] text-[#2D5A2E] font-sans text-[11px] font-mono tracking-wider font-medium border border-[#2D5A2E]/20">
                {progressPercent >= 75 ? 'On track for the weekend' : 'Pacing steady'}
              </span>
            </div>
            <div>
              <div className="flex items-baseline justify-between">
                <div className="font-serif text-xl sm:text-2xl font-medium text-[#1d1b19]">
                  <span className="font-bold text-[#1d1b19]">{loggedHours.toFixed(1)}</span>
                  <span className="font-sans text-xs text-[#2d2420] font-normal"> / {weeklyGoalHours.toFixed(1)} hrs</span>
                </div>
                <span className="font-sans text-[11px] font-mono tracking-wider text-[#2d2420]">
                  {progressPercent}% completed
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-[#f3ede9] mt-2 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#c85a32] transition-all duration-700 ease-out"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-[#2d2420] font-sans pt-1">
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#2e522d]" />
                {remainingHours > 0 ? `${remainingHours} hrs balance left` : 'Weekly quota reached!'}
              </span>
              <button
                onClick={() => setIsGoalModalOpen(true)}
                className="text-[#c85a32] hover:underline font-mono text-[11px] font-semibold cursor-pointer"
              >
                Customize Goal
              </button>
            </div>
          </div>
        </section>

        {/* Main Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          
          {/* Left / Center Schedule Column */}
          <div className="xl:col-span-8 flex flex-col gap-6">
            
            {/* Week Navigation Header */}
            <div className="bg-[#ffffff] rounded-2xl p-4 border border-[#dec0b7] shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="px-1">
                  <span className="font-sans text-sm font-semibold text-[#1d1b19]">
                    2026 Examination Sprint Cycle
                  </span>
                  <span className="block font-sans text-[11px] font-mono tracking-wider text-[#2d2420]">
                    Term Intensive Mock Revision • Active Schedule
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="hidden sm:flex items-center bg-[#f8f2ef] px-3 py-1.5 rounded-full text-xs text-[#2d2420] font-sans gap-1.5 border border-[#dec0b7]/60">
                  <span className="w-2 h-2 rounded-full bg-[#456644]"></span>
                  <span>{currentDayBlocks.filter((b) => b.status === 'completed').length} / {currentDayBlocks.length} blocks done</span>
                </div>
                <button
                  onClick={() => {
                    setFormDay(selectedDay);
                    setIsPlanModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-full bg-[#c85a32] hover:bg-[#b04b25] text-white font-sans text-xs font-semibold transition-all shadow-sm hover:shadow flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Plan Focus Block</span>
                </button>
              </div>
            </div>

            {/* Interactive Day Switcher */}
            <div className="grid grid-cols-7 gap-2 sm:gap-3">
              {daysConfig.map((day) => {
                const isSelected = selectedDay === day.key;
                const dayBlocks = blocks.filter((b) => b.day === day.key);
                const hasCompleted = dayBlocks.some((b) => b.status === 'completed');
                const allDone = dayBlocks.length > 0 && dayBlocks.every((b) => b.status === 'completed');

                return (
                  <button
                    key={day.key}
                    onClick={() => setSelectedDay(day.key)}
                    className={`flex flex-col items-center py-3 px-1 rounded-xl transition cursor-pointer text-center group border ${
                      isSelected
                        ? 'bg-[#c85a32] text-white shadow-md scale-[1.03] ring-2 ring-[#c85a32]/30 border-[#c85a32]'
                        : 'bg-[#ffffff] text-[#1d1b19] border-[#dec0b7] hover:border-[#c85a32]/60'
                    }`}
                  >
                    <span className={`font-sans text-[11px] font-semibold tracking-wider ${
                      isSelected ? 'text-white' : 'text-[#2d2420]'
                    }`}>
                      {day.label}
                    </span>
                    <span className={`font-sans text-base font-bold mt-0.5 ${
                      isSelected ? 'text-white' : 'text-[#1d1b19]'
                    }`}>
                      {day.dateNum}
                    </span>
                    <span className="mt-2 flex items-center justify-center h-2">
                      {isSelected ? (
                        <span className="text-[9px] uppercase font-sans px-1.5 bg-white text-[#c85a32] rounded-full font-bold leading-tight">
                          Active
                        </span>
                      ) : allDone ? (
                        <span className="w-2 h-2 rounded-full bg-[#456644]"></span>
                      ) : hasCompleted ? (
                        <span className="w-2 h-2 rounded-full bg-[#854f00]"></span>
                      ) : dayBlocks.length > 0 ? (
                        <span className="w-2 h-2 rounded-full bg-[#dec0b7]"></span>
                      ) : (
                        <span className="text-[9px] text-[#6b5952] font-mono">Rest</span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected Day Focus Schedule List */}
            <div className="bg-[#ffffff] rounded-2xl p-4 sm:p-6 border border-[#dec0b7] shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 bg-[#f8f2ef]/70 px-4 py-3 rounded-xl border border-[#dec0b7]/60">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-[#c85a32]" />
                  <span className="font-serif text-lg sm:text-xl font-medium text-[#1d1b19]">
                    {currentDayInfo.fullDay} Focus Schedule
                  </span>
                </div>
                <span className="font-sans text-[11px] font-mono tracking-wider text-[#2d2420] font-medium">
                  Target: {currentDayBlocks.reduce((acc, b) => acc + b.durationHours, 0).toFixed(1)} hrs planned
                </span>
              </div>

              {/* Blocks */}
              <div className="flex flex-col gap-3.5">
                {currentDayBlocks.length === 0 ? (
                  <div className="py-10 text-center flex flex-col items-center justify-center bg-[#f8f2ef]/40 rounded-2xl border border-dashed border-[#dec0b7]">
                    <EmptyCalendarScheduleIllustration size={150} className="mx-auto mb-2" />
                    <h4 className="font-serif text-base font-semibold text-[#1d1b19] mt-2">
                      No focus blocks scheduled for {currentDayInfo.fullDay}
                    </h4>
                    <p className="font-sans text-xs text-[#2d2420] mt-1 max-w-sm mx-auto leading-relaxed">
                      Plan a focused study session for theory review, unit exercises, or mock paper revision.
                    </p>
                    <button
                      onClick={() => {
                        setFormDay(selectedDay);
                        setIsPlanModalOpen(true);
                      }}
                      className="mt-4 px-5 py-2.5 rounded-full bg-[#c85a32] hover:bg-[#b04b25] text-white text-xs font-semibold shadow-sm transition cursor-pointer"
                    >
                      Plan First Block
                    </button>
                  </div>
                ) : (
                  currentDayBlocks.map((block) => {
                    const isCompleted = block.status === 'completed';
                    const isInProgress = block.status === 'in_progress';

                    return (
                      <div
                        key={block.id}
                        className={`group relative flex flex-col md:flex-row md:items-stretch gap-4 p-4 rounded-xl border transition-all ${
                          isCompleted
                            ? 'bg-[#f8f2ef] border-[#dec0b7]'
                            : isInProgress
                            ? 'bg-[#ede7e3] border-2 border-[#c85a32]/40 shadow-[0_4px_16px_rgba(200,90,50,0.08)]'
                            : 'bg-[#ffffff] border-[#dec0b7] hover:border-[#c85a32]/60'
                        }`}
                      >
                        {/* Side color accent indicator */}
                        <div
                          className={`w-1.5 rounded-full self-stretch hidden md:block ${
                            isCompleted ? 'bg-[#456644]' : isInProgress ? 'bg-[#c85a32]' : 'bg-[#dec0b7]'
                          }`}
                        ></div>

                        {/* Time & Duration Slot */}
                        <div className="flex flex-col md:w-44 shrink-0 justify-between">
                          <div>
                            <span
                              className={`font-sans text-[11px] font-mono tracking-wider uppercase font-bold flex items-center gap-1.5 ${
                                isCompleted
                                  ? 'text-[#2e522d]'
                                  : isInProgress
                                  ? 'text-[#c85a32]'
                                  : 'text-[#2d2420]'
                              }`}
                            >
                              {isInProgress && (
                                <span className="w-2 h-2 rounded-full bg-[#c85a32] animate-ping"></span>
                              )}
                              {block.timeSlot}
                            </span>
                            <div className="font-sans text-sm font-semibold text-[#1d1b19] mt-1">
                              {block.durationHours.toFixed(1)} hrs allocated
                            </div>
                          </div>
                          <div className="font-sans text-xs text-[#2d2420] mt-1">
                            {isCompleted ? (
                              <span className="text-[#2e522d] font-semibold flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" /> Completed
                              </span>
                            ) : isInProgress ? (
                              <span className="text-[#c85a32] font-semibold flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" /> In Progress
                              </span>
                            ) : (
                              <span className="text-[#6b5952]">Planned Block</span>
                            )}
                          </div>
                        </div>

                        {/* Details & Action */}
                        <div className="flex-1 flex flex-col justify-between pt-1">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h2 className="font-sans text-base sm:text-lg font-semibold text-[#1d1b19]">
                                {block.title}
                              </h2>
                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  onClick={() => handleToggleBlockStatus(block.id)}
                                  className={`px-3 py-1 rounded-full font-sans text-[11px] font-mono tracking-wider font-semibold transition cursor-pointer flex items-center gap-1 border ${
                                    isCompleted
                                      ? 'bg-[#EAF2EA] text-[#2D5A2E] border-[#2D5A2E]/20 hover:bg-[#d8e8d8]'
                                      : isInProgress
                                      ? 'bg-[#c85a32] text-white border-[#c85a32] hover:bg-[#b04b25]'
                                      : 'bg-[#f3ede9] text-[#1d1b19] border-[#dec0b7] hover:bg-[#ede7e3]'
                                  }`}
                                >
                                  {isCompleted ? (
                                    <>
                                      <CheckCircle2 className="w-3.5 h-3.5" /> Done
                                    </>
                                  ) : isInProgress ? (
                                    <>
                                      <Check className="w-3.5 h-3.5" /> Finish
                                    </>
                                  ) : (
                                    <>
                                      <Play className="w-3 h-3" /> Start
                                    </>
                                  )}
                                </button>
                                <button
                                  onClick={(e) => handleDeleteBlock(block.id, e)}
                                  title="Delete focus block"
                                  className="w-7 h-7 flex items-center justify-center rounded-full text-[#6b5952] hover:text-[#ba1a1a] hover:bg-[#ffebee] transition"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            <p className="font-sans text-sm text-[#2d2420] leading-relaxed mt-1.5">
                              {block.notes}
                            </p>
                          </div>

                          <div className="flex items-center gap-3 mt-3 pt-2 text-[#2d2420] font-sans text-[11px] font-mono tracking-wider border-t border-[#dec0b7]/40">
                            <span className="flex items-center gap-1 font-medium">
                              <BookOpen className="w-3.5 h-3.5 text-[#c85a32]" />
                              {block.unit}
                            </span>
                            <span>•</span>
                            <span className="font-semibold text-[#1d1b19]">{block.subject}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Pacing Tip */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#f8f2ef] border border-[#dec0b7] text-xs font-sans text-[#2d2420] mt-2">
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#2e522d]">coffee</span>
                  <span>Pacing tip: Take brief stretch and hydration breaks between blocks to keep your brain fresh.</span>
                </span>
                <button
                  onClick={() => setIsGoalModalOpen(true)}
                  className="text-[#c85a32] hover:underline font-semibold font-sans text-[11px] font-mono tracking-wider cursor-pointer"
                >
                  Adjust Target
                </button>
              </div>
            </div>

            {/* Motivation Quote */}
            <div className="relative overflow-hidden rounded-2xl bg-[#f8f2ef] border border-[#dec0b7] p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#ffffff] border border-[#dec0b7] flex items-center justify-center shrink-0 text-[#c85a32] shadow-sm">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-serif text-xl sm:text-2xl text-[#1d1b19] italic leading-snug">
                    “Consistency eats talent for breakfast. 4 honest hours every day beat a 14-hour panic all-nighter.”
                  </p>
                  <span className="font-sans text-[11px] font-mono tracking-wider text-[#2d2420] uppercase mt-1.5 block font-medium">
                    {scholarName} • StudySync Scholar
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Subject Balance, Milestones, Profile Pass */}
          <div className="xl:col-span-4 flex flex-col gap-6">
            
            {/* Subject Balance Breakdown */}
            <div className="bg-[#ffffff] rounded-2xl p-5 border border-[#dec0b7] shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#dec0b7]/60">
                <div>
                  <h2 className="font-serif text-lg sm:text-xl font-medium text-[#1d1b19]">
                    Subject Balance
                  </h2>
                  <p className="font-sans text-xs text-[#2d2420] mt-0.5">
                    Weekly hours distribution
                  </p>
                </div>
                <Layers className="w-5 h-5 text-[#2d2420]" />
              </div>

              <div className="flex flex-col gap-3.5">
                {Object.entries(subjectStats).map(([subj, data]) => {
                  const pct = Math.min(100, Math.round((data.logged / data.total) * 100));
                  const left = Math.max(0, parseFloat((data.total - data.logged).toFixed(1)));

                  return (
                    <div key={subj} className="p-3.5 rounded-xl bg-[#f8f2ef] border border-[#dec0b7]/60 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }}></span>
                          <span className="font-sans text-sm font-semibold text-[#1d1b19]">{subj}</span>
                        </div>
                        <span className="font-sans text-xs font-semibold text-[#1d1b19]">
                          {data.logged.toFixed(1)} <span className="text-[#2d2420] font-normal">/ {data.total.toFixed(1)} hrs</span>
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#f3ede9] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, backgroundColor: data.color }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between text-xs font-sans text-[#2d2420]">
                        <span className="font-medium">{pct}% Completed</span>
                        <span className={left === 0 ? 'text-[#2e522d] font-semibold' : 'text-[#2d2420]'}>
                          {left === 0 ? 'Target Achieved' : `${left}h to target`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Sleep & Rest Gauge */}
              <div className="p-3.5 rounded-xl bg-[#c6edc1]/40 border border-[#2D5A2E]/20 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#EAF2EA] flex items-center justify-center text-[#2D5A2E]">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-sans text-sm font-semibold text-[#1d1b19]">Sleep &amp; Rest Gauge</div>
                    <div className="font-sans text-xs text-[#2d2420]">Average {avgSleepEstimate} hrs sleep this week</div>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#EAF2EA] text-[#2D5A2E] font-sans text-[11px] font-mono tracking-wider font-medium border border-[#2D5A2E]/20">
                  {avgSleepEstimate >= 7.0 ? 'Well Rested' : avgSleepEstimate >= 6.0 ? 'Moderate Rest' : 'Prioritize Sleep'}
                </span>
              </div>
            </div>

            {/* Sprint Milestones */}
            <div className="bg-[#ffffff] rounded-2xl p-5 border border-[#dec0b7] shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#dec0b7]/60">
                <h2 className="font-serif text-lg sm:text-xl font-medium text-[#1d1b19]">
                  Sprint Milestones
                </h2>
                <Target className="w-5 h-5 text-[#2d2420]" />
              </div>

              <div className="flex flex-col gap-3">
                <div className="p-3.5 rounded-xl bg-[#f8f2ef] border border-[#dec0b7]/60 flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#c85a32] text-white flex items-center justify-center font-sans font-bold shrink-0 shadow-sm">
                      {Math.max(12, Math.floor(countdown.daysRemaining * 0.35))}
                    </div>
                    <div>
                      <div className="font-sans text-sm font-semibold text-[#1d1b19]">
                        District Mock Paper
                      </div>
                      <div className="font-sans text-xs text-[#2d2420]">
                        Provincial Standard Exam Prep
                      </div>
                    </div>
                  </div>
                  <span className="font-sans text-[11px] font-mono tracking-wider uppercase text-[#c85a32] font-bold">
                    {Math.max(12, Math.floor(countdown.daysRemaining * 0.35))} days
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#f8f2ef] border border-[#dec0b7]/60 flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#f3ede9] text-[#1d1b19] flex items-center justify-center font-sans font-bold shrink-0 border border-[#dec0b7]">
                      {countdown.daysRemaining}
                    </div>
                    <div>
                      <div className="font-sans text-sm font-semibold text-[#1d1b19]">
                        G.C.E. Advanced Level
                      </div>
                      <div className="font-sans text-xs text-[#2d2420]">
                        National Examination Sprint
                      </div>
                    </div>
                  </div>
                  <span className="font-sans text-[11px] font-mono tracking-wider uppercase text-[#2d2420] font-bold">
                    {countdown.daysRemaining} days
                  </span>
                </div>
              </div>

              {/* Sync with Google / Apple Calendar Button */}
              <div className="pt-1">
                <button
                  onClick={handleExportIcs}
                  className="w-full py-2.5 px-4 rounded-full bg-[#f3ede9] hover:bg-[#ede7e3] text-[#1d1b19] font-sans text-sm font-semibold transition flex items-center justify-center gap-2 cursor-pointer border border-[#dec0b7] shadow-sm"
                >
                  <Download className="w-4 h-4 text-[#c85a32] Client" />
                  <span>Sync with Google &amp; Apple Calendar</span>
                </button>
                <span className="block text-center font-sans text-[11px] text-[#2d2420] mt-2">
                  Two-way .ics export • Sri Lanka Standard Time (UTC+05:30)
                </span>
              </div>
            </div>

            {/* Authenticated Candidate Profile Card */}
            <div className="bg-[#ffffff] rounded-2xl p-5 border border-[#dec0b7] shadow-sm flex flex-col items-center text-center relative overflow-hidden">
              <div className="w-10 h-10 rounded-full bg-[#f3ede9] flex items-center justify-center mb-2 text-[#c85a32] border border-[#dec0b7]">
                <Award className="w-5 h-5" />
              </div>
              <span className="font-sans text-base font-bold text-[#1d1b19]">
                {scholarName}
              </span>
              <span className="font-sans text-[11px] font-mono tracking-wider text-[#2d2420] uppercase mt-0.5">
                {streamName.split(' ')[0]} Sciences • {schoolName}
              </span>
              <div className="mt-3.5 pt-3 border-t border-[#dec0b7]/80 w-full flex items-center justify-around text-xs text-[#2d2420]">
                <div>
                  <span className="font-sans text-[#1d1b19] block font-bold text-sm">
                    {weeklyGoalHours.toFixed(1)} hrs
                  </span>
                  <span className="text-[11px] text-[#2d2420]">Weekly Goal</span>
                </div>
                <div className="w-px h-6 bg-[#dec0b7]"></div>
                <div>
                  <span className="font-sans text-[#2e522d] block font-bold text-sm">
                    {streakDays} Days
                  </span>
                  <span className="text-[11px] text-[#2d2420]">Focus Streak</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Plan Focus Block Interactive Modal */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#ffffff] max-w-md w-full rounded-2xl p-6 border border-[#dec0b7] shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-[#dec0b7]/60">
              <h3 className="font-serif text-xl font-medium text-[#1d1b19]">
                Schedule Focus Block
              </h3>
              <button
                onClick={() => setIsPlanModalOpen(false)}
                aria-label="Close modal"
                className="w-8 h-8 rounded-full bg-[#f3ede9] hover:bg-[#ede7e3] flex items-center justify-center text-[#1d1b19] cursor-pointer border border-[#dec0b7]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBlock} className="flex flex-col gap-3.5 font-sans text-sm text-[#2d2420]">
              <div>
                <label className="block font-sans text-xs font-semibold text-[#1d1b19] mb-1">
                  Day of Week
                </label>
                <select
                  value={formDay}
                  onChange={(e) => setFormDay(e.target.value as DayKey)}
                  className="w-full px-3 py-2 rounded-xl bg-[#f8f2ef] text-[#1d1b19] border border-[#dec0b7] outline-none focus:ring-1 focus:ring-[#c85a32]"
                >
                  <option value="MON">Monday</option>
                  <option value="TUE">Tuesday</option>
                  <option value="WED">Wednesday</option>
                  <option value="THU">Thursday</option>
                  <option value="FRI">Friday</option>
                  <option value="SAT">Saturday</option>
                  <option value="SUN">Sunday</option>
                </select>
              </div>

              <div>
                <label className="block font-sans text-xs font-semibold text-[#1d1b19] mb-1">
                  Subject Stream
                </label>
                <select
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#f8f2ef] text-[#1d1b19] border border-[#dec0b7] outline-none focus:ring-1 focus:ring-[#c85a32]"
                >
                  <option value="Combined Maths">Combined Mathematics (Pure &amp; Applied)</option>
                  <option value="Physics">Physics (Mechanics, Fields &amp; Thermal)</option>
                  <option value="Chemistry">Chemistry (Inorganic, Organic &amp; Physical)</option>
                  <option value="Biology">Biology (Botany, Zoology &amp; Physiology)</option>
                  <option value="Information Technology">Information &amp; Communication Technology (ICT)</option>
                  <option value="General English">General English / Common General Test</option>
                </select>
              </div>

              <div>
                <label className="block font-sans text-xs font-semibold text-[#1d1b19] mb-1">
                  Focus Topic / Paper Reference
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., 2026 G.C.E. A/L Structured Essay Q1-Q4"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#f8f2ef] text-[#1d1b19] border border-[#dec0b7] outline-none focus:ring-1 focus:ring-[#c85a32] placeholder:text-[#6b5952]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-sans text-xs font-semibold text-[#1d1b19] mb-1">
                    Time Window
                  </label>
                  <input
                    type="text"
                    value={formTimeSlot}
                    onChange={(e) => setFormTimeSlot(e.target.value)}
                    placeholder="08:00 – 10:30 AM"
                    className="w-full px-3 py-2 rounded-xl bg-[#f8f2ef] text-[#1d1b19] border border-[#dec0b7] outline-none focus:ring-1 focus:ring-[#c85a32]"
                  />
                </div>
                <div>
                  <label className="block font-sans text-xs font-semibold text-[#1d1b19] mb-1">
                    Duration
                  </label>
                  <select
                    value={formDuration}
                    onChange={(e) => setFormDuration(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#f8f2ef] text-[#1d1b19] border border-[#dec0b7] outline-none focus:ring-1 focus:ring-[#c85a32]"
                  >
                    <option value="1.0">1.0 Hour (Review block)</option>
                    <option value="1.5">1.5 Hours (Deep sprint)</option>
                    <option value="2.0">2.0 Hours (Standard block)</option>
                    <option value="2.5">2.5 Hours (Structured paper)</option>
                    <option value="3.0">3.0 Hours (Full paper drill)</option>
                    <option value="4.0">4.0 Hours (Mock exam)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-sans text-xs font-semibold text-[#1d1b19] mb-1">
                  Notes / Success Criteria
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Specific derivations or questions to complete before winding down."
                  className="w-full px-3 py-2 rounded-xl bg-[#f8f2ef] text-[#1d1b19] border border-[#dec0b7] outline-none focus:ring-1 focus:ring-[#c85a32] resize-none placeholder:text-[#6b5952]"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#dec0b7]/60">
                <button
                  type="button"
                  onClick={() => setIsPlanModalOpen(false)}
                  className="px-4 py-2 rounded-full bg-[#f3ede9] text-[#1d1b19] font-sans text-xs font-semibold cursor-pointer hover:bg-[#ede7e3] transition border border-[#dec0b7]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#c85a32] text-white font-sans text-xs font-semibold cursor-pointer hover:bg-[#b04b25] transition shadow-sm"
                >
                  Lock into Rhythm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Goal Customization Modal */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#ffffff] max-w-sm w-full rounded-2xl p-6 border border-[#dec0b7] shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-[#dec0b7]/60">
              <h3 className="font-serif text-lg font-medium text-[#1d1b19]">
                Weekly Study Target
              </h3>
              <button
                onClick={() => setIsGoalModalOpen(false)}
                className="w-7 h-7 rounded-full bg-[#f3ede9] flex items-center justify-center text-[#1d1b19]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#2d2420] font-sans leading-relaxed">
              Set a realistic, sustainable weekly deep-focus quota. 30 to 40 hours per week is optimal for high island ranks without cognitive burnout.
            </p>

            <div className="flex flex-col gap-2 py-2">
              <div className="flex items-center justify-between font-mono text-sm font-bold text-[#1d1b19]">
                <span>Target:</span>
                <span className="text-[#c85a32] text-base">{weeklyGoalHours} hrs / week</span>
              </div>
              <input
                type="range"
                min={20}
                max={55}
                step={2.5}
                value={weeklyGoalHours}
                onChange={(e) => setWeeklyGoalHours(parseFloat(e.target.value))}
                className="w-full accent-[#c85a32] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-[#6b5952]">
                <span>20 hrs (Part-time)</span>
                <span>35 hrs (Optimal)</span>
                <span>55 hrs (Sprint)</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#dec0b7]/60">
              <button
                onClick={() => handleSaveGoal(weeklyGoalHours)}
                className="w-full py-2.5 rounded-full bg-[#c85a32] hover:bg-[#b04b25] text-white font-sans text-xs font-semibold transition shadow-sm"
              >
                Save Weekly Target
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
