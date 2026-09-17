'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { localDb } from '@/lib/storage/localDb';
import { api } from '@/lib/api';
import { DailyLogEntry } from '@/types/logs';
import { ambientSoundSynth, AmbientSoundType } from '@/lib/audio/ambientSoundSynth';
import { roomPresenceManager, FocusModeType, PeerStatus } from '@/lib/rooms/roomPresence';
import { getTodayDateString, formatHoursHuman } from '@/lib/utils';
import { fireConfetti } from '@/lib/confetti';
import { playSuccessChime } from '@/lib/audio';
import { toast } from 'sonner';
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  BookOpen,
  Coffee,
  CheckCircle2,
  Headphones,
  Flame,
} from 'lucide-react';

interface RoomControlsDrawerProps {
  currentSubject: string;
  onSubjectChange: (sub: string) => void;
  currentTopic: string;
  onTopicChange: (top: string) => void;
  activeSeconds: number;
  isRunning: boolean;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  focusMode: FocusModeType;
  onFocusModeChange: (mode: FocusModeType) => void;
}

export const RoomControlsDrawer: React.FC<RoomControlsDrawerProps> = ({
  currentSubject,
  onSubjectChange,
  currentTopic,
  onTopicChange,
  activeSeconds,
  isRunning,
  onToggleTimer,
  onResetTimer,
  focusMode,
  onFocusModeChange,
}) => {
  const { user, member } = useAuth();
  const { recordDailyLogOptimistic, refreshHistory } = useApp();

  const [ambientType, setAmbientType] = useState<AmbientSoundType>('none');
  const [ambientVol, setAmbientVol] = useState<number>(0.4);
  const [syncingToLedger, setSyncingToLedger] = useState(false);

  // Available stream subjects
  const isBio = String(member?.stream || '').toLowerCase().includes('bio');
  const subjects = isBio
    ? ['Biology', 'Chemistry', 'Physics', 'General English']
    : ['Combined Maths', 'Physics', 'Chemistry', 'ICT'];

  const handleSoundSelect = (type: AmbientSoundType) => {
    setAmbientType(type);
    ambientSoundSynth.play(type);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setAmbientVol(val);
    ambientSoundSynth.setVolume(val);
  };

  // Sync accumulated Focus Town hours to daily ledger
  const handleSyncToLedger = async () => {
    if (activeSeconds < 300) {
      toast.error('Record at least 5 minutes of study before syncing to ledger');
      return;
    }

    const hours = Number((activeSeconds / 3600).toFixed(2));
    const today = getTodayDateString();

    const isSub1 = currentSubject === subjects[0];
    const isSub2 = currentSubject === subjects[1];

    const optimisticEntry: DailyLogEntry = {
      id: `log-room-${Date.now()}`,
      studyId: member?.studyId || user?.email || 'SG-SCHOLAR',
      dateOfStudy: today,
      date: today,
      hoursSubject1: isSub1 ? hours : 0,
      hoursSubject2: isSub2 ? hours : 0,
      hoursSubject3: !isSub1 && !isSub2 ? hours : 0,
      totalHours: hours,
      focusScore: 9,
      productivityScore: 9,
      notes: `Focus Town Live Room: ${currentSubject} — ${currentTopic || 'Deep focus revision'}`,
      subjects: [
        {
          name: currentSubject,
          hours,
          focus: 9,
          productivity: 9,
        },
      ],
      timestamp: new Date().toISOString(),
    };

    try {
      setSyncingToLedger(true);
      recordDailyLogOptimistic(optimisticEntry);
      localDb.saveDailyLog(optimisticEntry);

      fireConfetti();
      playSuccessChime();
      toast.success(`Synced ${formatHoursHuman(hours)} to your personal study ledger!`);

      // Optionally sync to backend if registered
      if (user?.email) {
        api.submitDailyLog({
          studyId: member?.studyId || user.email,
          email: user.email,
          fullName: member?.fullName || user.displayName || 'Scholar',
          stream: member?.stream || '',
          dateOfStudy: today,
          hoursSubject1: isSub1 ? hours : 0,
          hoursSubject2: isSub2 ? hours : 0,
          hoursSubject3: !isSub1 && !isSub2 ? hours : 0,
          totalHours: hours,
          notes: optimisticEntry.notes,
        }).catch(() => {});
      }

      await refreshHistory(true);
    } catch (e) {
      toast.error('Failed to sync study session');
    } finally {
      setSyncingToLedger(false);
    }
  };

  return (
    <div className="bg-white border border-[#e7e1de] rounded-3xl p-5 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#f3ede9]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#c85a32]/10 border border-[#c85a32]/20 flex items-center justify-center text-[#c85a32]">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-sm text-[#1d1b19]">Your Study Desk Cockpit</h3>
            <p className="font-sans text-[11px] text-[#2d2420]">Control your timer, audio, and active topic</p>
          </div>
        </div>

        <button
          onClick={handleSyncToLedger}
          disabled={syncingToLedger || activeSeconds < 300}
          className="px-3.5 py-1.5 rounded-full bg-[#c85a32] hover:bg-[#b04b25] disabled:opacity-40 text-white font-sans text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Save to Ledger</span>
        </button>
      </div>

      {/* Subject & Topic Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-mono text-[#2d2420] uppercase mb-1.5">Subject Channel</label>
          <select
            value={currentSubject}
            onChange={(e) => onSubjectChange(e.target.value)}
            className="w-full bg-[#fef8f4] border border-[#e7e1de] rounded-xl px-3 py-2 text-xs text-[#1d1b19] font-medium outline-none focus:border-[#c85a32] cursor-pointer"
          >
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-mono text-[#2d2420] uppercase mb-1.5">Current Focus Goal</label>
          <input
            type="text"
            value={currentTopic}
            onChange={(e) => onTopicChange(e.target.value)}
            placeholder="E.g., 2022 Mechanics Q3 or Organic Synthesis"
            className="w-full bg-[#fef8f4] border border-[#e7e1de] rounded-xl px-3 py-2 text-xs text-[#1d1b19] placeholder:text-[#4a3b35] outline-none focus:border-[#c85a32]"
          />
        </div>
      </div>

      {/* Focus Mode & Timer Controls */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <label className="text-[11px] font-mono text-[#2d2420] uppercase">Timer Rhythm</label>
          <div className="flex items-center gap-1 bg-[#fef8f4] p-1 rounded-xl border border-[#e7e1de]">
            <button
              onClick={() => onFocusModeChange('pomodoro_25')}
              className={`px-2 py-1 rounded-lg text-[10px] font-mono font-semibold transition-colors cursor-pointer ${
                focusMode === 'pomodoro_25' ? 'bg-[#c85a32] text-white' : 'text-[#2d2420] hover:text-[#1d1b19]'
              }`}
            >
              25m Pomo
            </button>
            <button
              onClick={() => onFocusModeChange('deep_50')}
              className={`px-2 py-1 rounded-lg text-[10px] font-mono font-semibold transition-colors cursor-pointer ${
                focusMode === 'deep_50' ? 'bg-[#c85a32] text-white' : 'text-[#2d2420] hover:text-[#1d1b19]'
              }`}
            >
              50m Block
            </button>
            <button
              onClick={() => onFocusModeChange('exam_180')}
              className={`px-2 py-1 rounded-lg text-[10px] font-mono font-semibold transition-colors cursor-pointer ${
                focusMode === 'exam_180' ? 'bg-[#c85a32] text-white' : 'text-[#2d2420] hover:text-[#1d1b19]'
              }`}
            >
              3h Paper
            </button>
            <button
              onClick={() => onFocusModeChange('stopwatch')}
              className={`px-2 py-1 rounded-lg text-[10px] font-mono font-semibold transition-colors cursor-pointer ${
                focusMode === 'stopwatch' ? 'bg-[#c85a32] text-white' : 'text-[#2d2420] hover:text-[#1d1b19]'
              }`}
            >
              Stopwatch
            </button>
          </div>
        </div>

        {/* Timer Play / Pause Bar */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-[#fef8f4] border border-[#e7e1de]">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#c85a32]" />
            <span className="font-mono text-lg font-bold text-[#1d1b19]">
              {Math.floor(activeSeconds / 60)}m {activeSeconds % 60}s
            </span>
            <span className="text-[11px] text-[#2d2420] font-sans">accumulated</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleTimer}
              className={`px-4 py-1.5 rounded-full font-sans text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer ${
                isRunning
                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                  : 'bg-[#456644] hover:bg-[#344d33] text-white'
              }`}
            >
              {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isRunning ? 'Pause Desk' : 'Start Focus'}</span>
            </button>

            <button
              onClick={onResetTimer}
              className="p-1.5 rounded-full bg-white hover:bg-[#ede7e3] text-[#2d2420] border border-[#e7e1de] transition-colors cursor-pointer"
              title="Reset Timer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Procedural Web Audio Ambient Soundscapes */}
      <div className="pt-2 border-t border-[#f3ede9] space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-mono text-[#2d2420]">
            <Headphones className="w-3.5 h-3.5 text-[#c85a32]" />
            <span className="uppercase font-semibold">Ambient Focus Soundscape</span>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 rounded">0 Bandwidth</span>
          </div>

          <div className="flex items-center gap-2">
            {ambientType !== 'none' ? (
              <Volume2 className="w-3.5 h-3.5 text-[#c85a32]" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-[#4a3b35]" />
            )}
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={ambientVol}
              onChange={handleVolumeChange}
              className="w-18 accent-[#c85a32] cursor-pointer"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'none', label: 'Off' },
            { id: 'rain', label: 'Gentle Rain' },
            { id: 'ocean', label: 'Ocean Tide' },
            { id: 'library', label: 'Library Desk' },
            { id: 'binaural', label: '40Hz Alpha Tone' },
            { id: 'clock', label: 'Soft Clock' },
          ].map((snd) => (
            <button
              key={snd.id}
              onClick={() => handleSoundSelect(snd.id as AmbientSoundType)}
              className={`px-3 py-1 rounded-full text-xs font-sans transition-all cursor-pointer ${
                ambientType === snd.id
                  ? 'bg-[#19202e] text-white font-semibold shadow-xs'
                  : 'bg-[#f8f2ef] hover:bg-[#ede7e3] text-[#2d2420]'
              }`}
            >
              {snd.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
