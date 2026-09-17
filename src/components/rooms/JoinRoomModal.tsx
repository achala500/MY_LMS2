'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { fireConfetti } from '@/lib/confetti';
import { toast } from 'sonner';
import { FocusModeType, RoomPeer } from '@/lib/rooms/roomPresence';
import {
  BookOpen,
  Clock,
  Check,
  Sparkles,
  Coffee,
  Compass,
  GraduationCap,
  Target,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export interface JoinRoomFormValues {
  deskNumber: number;
  name: string;
  studyId: string;
  stream: string;
  subject: string;
  goal: string;
  focusMode: FocusModeType;
  companion: 'owl' | 'cat' | 'tea' | 'succulent';
}

interface JoinRoomModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDesk?: number;
  occupiedDesks: { deskNumber: number; peerName: string }[];
  initialValues?: Partial<JoinRoomFormValues>;
  onJoin: (values: JoinRoomFormValues) => void;
}

const STREAM_SUBJECTS: Record<string, string[]> = {
  'Physical Science': ['Combined Mathematics', 'Physics', 'Chemistry', 'ICT'],
  'Biological Science': ['Biology', 'Chemistry', 'Physics', 'Agricultural Science'],
  'Commerce': ['Accounting', 'Business Studies', 'Economics', 'ICT'],
  'Technology': ['Engineering Technology', 'Biosystems Technology', 'Science for Technology', 'ICT'],
  'Arts': ['Sinhala', 'English Literature', 'Political Science', 'Logic', 'History', 'Buddhist Culture'],
};

export const JoinRoomModal: React.FC<JoinRoomModalProps> = ({
  open,
  onOpenChange,
  defaultDesk = 1,
  occupiedDesks,
  initialValues,
  onJoin,
}) => {
  const [selectedDesk, setSelectedDesk] = useState<number>(defaultDesk);
  const [name, setName] = useState(initialValues?.name || 'A/L Scholar');
  const [studyId, setStudyId] = useState(initialValues?.studyId || 'AL-2026');
  const [stream, setStream] = useState(initialValues?.stream || 'Physical Science');
  const [subject, setSubject] = useState(initialValues?.subject || 'Combined Mathematics');
  const [goal, setGoal] = useState(initialValues?.goal || 'Solving 2022 Past Paper questions');
  const [focusMode, setFocusMode] = useState<FocusModeType>(initialValues?.focusMode || 'pomodoro_25');
  const [companion, setCompanion] = useState<'owl' | 'cat' | 'tea' | 'succulent'>(initialValues?.companion || 'owl');

  useEffect(() => {
    if (defaultDesk) {
      setSelectedDesk(defaultDesk);
    }
  }, [defaultDesk]);

  useEffect(() => {
    if (open && initialValues) {
      if (initialValues.name) setName(initialValues.name);
      if (initialValues.studyId) setStudyId(initialValues.studyId);
      if (initialValues.stream) setStream(initialValues.stream);
      if (initialValues.subject) setSubject(initialValues.subject);
      if (initialValues.goal) setGoal(initialValues.goal);
      if (initialValues.focusMode) setFocusMode(initialValues.focusMode);
      if (initialValues.companion) setCompanion(initialValues.companion);
    }
  }, [open]);

  const handleStreamChange = (newStream: string) => {
    setStream(newStream);
    const available = STREAM_SUBJECTS[newStream] || ['General'];
    setSubject(available[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter your name.');
      return;
    }

    onJoin({
      deskNumber: selectedDesk,
      name: name.trim(),
      studyId: studyId.trim() || `AL-${Math.floor(1000 + Math.random() * 9000)}`,
      stream,
      subject,
      goal: goal.trim() || 'Deep Focus Session',
      focusMode,
      companion,
    });

    fireConfetti();
    toast.success(`You claimed Desk #${String(selectedDesk).padStart(2, '0')}. Let's study!`);
    onOpenChange(false);
  };

  const desks = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border-2 border-[#19202e] rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0px_#19202e]">
        <DialogHeader className="border-b border-[#e7e1de] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#fef3c7] border-2 border-[#19202e] flex items-center justify-center shadow-[2px_2px_0px_#19202e]">
              <GraduationCap className="w-5 h-5 text-[#c85a32]" />
            </div>
            <div>
              <DialogTitle className="font-serif text-2xl font-bold text-[#1d1b19]">
                Claim Your Study Desk
              </DialogTitle>
              <DialogDescription className="text-xs text-[#2d2420] mt-0.5">
                Join your classmates in the live study hall. Pick a desk, set your goal, and study together.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4 text-xs">
          {/* 1. Desk Selection Matrix */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-mono font-bold text-xs text-[#19202e] uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#c85a32]" />
                1. Select Desk (01–12)
              </label>
              <div className="flex items-center gap-3 text-[11px] text-[#4a3b35]">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded border border-[#19202e] bg-white" /> Open
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded border border-[#19202e] bg-[#fef3c7]" /> Chosen
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded bg-slate-200" /> Taken
                </span>
              </div>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {desks.map((d) => {
                const occupant = occupiedDesks.find((od) => od.deskNumber === d);
                const isOccupied = !!occupant;
                const isSelected = selectedDesk === d;

                return (
                  <button
                    key={d}
                    type="button"
                    disabled={isOccupied && !isSelected}
                    onClick={() => setSelectedDesk(d)}
                    className={`p-2.5 rounded-xl border-2 transition-all flex flex-col items-center justify-center text-center ${
                      isSelected
                        ? 'border-[#19202e] bg-[#fef3c7] shadow-[2px_2px_0px_#19202e] scale-105'
                        : isOccupied
                        ? 'border-slate-200 bg-slate-100 opacity-50 cursor-not-allowed'
                        : 'border-[#19202e] bg-white hover:border-[#c85a32] cursor-pointer'
                    }`}
                  >
                    <span className="font-mono font-black text-xs text-[#19202e]">
                      #{String(d).padStart(2, '0')}
                    </span>
                    <span className="text-[10px] truncate max-w-full font-medium mt-0.5">
                      {isSelected ? (
                        <span className="text-[#c85a32] font-bold">You</span>
                      ) : isOccupied ? (
                        <span className="text-slate-500 truncate">{occupant.peerName.split(' ')[0]}</span>
                      ) : (
                        <span className="text-emerald-600">Open</span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Candidate Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-mono font-bold text-xs text-[#19202e] mb-1 block">
                Your Full Name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Kasun Perera"
                required
                className="h-10 rounded-xl border-2 border-[#19202e] text-xs bg-white focus-visible:ring-0 focus-visible:border-[#c85a32]"
              />
            </div>
            <div>
              <label className="font-mono font-bold text-xs text-[#19202e] mb-1 block">
                Student Index / Study ID
              </label>
              <Input
                value={studyId}
                onChange={(e) => setStudyId(e.target.value)}
                placeholder="e.g. AL-2026-MATH-04"
                className="h-10 rounded-xl border-2 border-[#19202e] text-xs font-mono bg-white focus-visible:ring-0 focus-visible:border-[#c85a32]"
              />
            </div>
          </div>

          {/* 3. Stream & Subject */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-mono font-bold text-xs text-[#19202e] mb-1 block">
                A/L Stream
              </label>
              <select
                value={stream}
                onChange={(e) => handleStreamChange(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border-2 border-[#19202e] text-xs bg-white font-medium focus:outline-none focus:border-[#c85a32]"
              >
                {Object.keys(STREAM_SUBJECTS).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-mono font-bold text-xs text-[#19202e] mb-1 block">
                Subject
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border-2 border-[#19202e] text-xs bg-white font-medium focus:outline-none focus:border-[#c85a32]"
              >
                {(STREAM_SUBJECTS[stream] || ['General']).map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 4. Current Study Goal */}
          <div>
            <label className="font-mono font-bold text-xs text-[#19202e] mb-1 block">
              Today's Specific Goal / Problem Set
            </label>
            <Input
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g. Solving 2022 Mechanics Q4 or Plant Physiology notes"
              className="h-10 rounded-xl border-2 border-[#19202e] text-xs bg-white focus-visible:ring-0 focus-visible:border-[#c85a32]"
            />
          </div>

          {/* 5. Study Cadence Mode */}
          <div>
            <label className="font-mono font-bold text-xs text-[#19202e] mb-2 block uppercase tracking-wider">
              Study Rhythm
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'pomodoro_25', label: 'Pomodoro', desc: '25m Focus / 5m Break' },
                { id: 'deep_50', label: 'Deep Work', desc: '50m Grind / 10m Break' },
                { id: 'exam_180', label: 'Past Paper', desc: '3h Full Exam Drill' },
                { id: 'stopwatch', label: 'Stopwatch', desc: 'Open Study Counter' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setFocusMode(m.id as FocusModeType)}
                  className={`p-2.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                    focusMode === m.id
                      ? 'border-[#19202e] bg-[#fef3c7] shadow-[2px_2px_0px_#19202e]'
                      : 'border-[#19202e]/30 bg-white hover:border-[#19202e]'
                  }`}
                >
                  <p className="font-bold text-xs text-[#19202e]">{m.label}</p>
                  <p className="text-[10px] text-[#4a3b35] mt-0.5">{m.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 6. Desk Mascot Companion */}
          <div>
            <label className="font-mono font-bold text-xs text-[#19202e] mb-2 block uppercase tracking-wider">
              Desk Companion
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'owl', label: 'Study Owl' },
                { id: 'cat', label: 'Sleeping Cat' },
                { id: 'tea', label: 'Ceylon Tea' },
                { id: 'succulent', label: 'Succulent' },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCompanion(c.id as any)}
                  className={`p-2 rounded-xl border-2 text-center transition-all cursor-pointer ${
                    companion === c.id
                      ? 'border-[#19202e] bg-[#fef3c7] shadow-[2px_2px_0px_#19202e] font-bold'
                      : 'border-[#19202e]/30 bg-white hover:border-[#19202e]'
                  }`}
                >
                  <span className="text-[11px] text-[#19202e]">{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-[#e7e1de] flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-2 border-[#19202e] text-[#19202e] rounded-xl h-10 px-4 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-[#c85a32] hover:bg-[#b04b25] text-white border-2 border-[#19202e] shadow-[3px_3px_0px_#19202e] rounded-xl h-10 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer active:translate-y-0.5 transition-all"
            >
              <span>Sit Down &amp; Begin Studying</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
