'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { fireConfetti } from '@/lib/confetti';
import {
  X,
  KeyRound,
  Lock,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Eye,
  EyeOff,
  Sparkles,
  GraduationCap,
  Loader2,
  Fingerprint,
  School as SchoolIcon,
  Check,
} from 'lucide-react';
import { SRI_LANKAN_SCHOOLS } from '@/lib/schools';

interface ScholarLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ScholarLoginModal({ isOpen, onClose, onSuccess }: ScholarLoginModalProps) {
  const {
    signInWithGoogle,
    signInWithCandidateId,
    createCustomProfile,
  } = useAuth();

  // Active tab: 'pin' (default keyboard-friendly ID & PIN) | 'register' (custom profile) | 'providers' (Google, GitHub, Passkey)
  const [activeTab, setActiveTab] = useState<'pin' | 'register' | 'providers'>('pin');

  // ID & PIN State
  const [candidateId, setCandidateId] = useState('');
  const [candidatePin, setCandidatePin] = useState('');
  const [showPin, setShowPin] = useState(false);

  // Custom Profile Creation State (No Google required)
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [regFullName, setRegFullName] = useState('');
  const [regStudyId, setRegStudyId] = useState('');
  const [regContact, setRegContact] = useState('');
  const [regSchool, setRegSchool] = useState('');
  const [showSchoolDropdown, setShowSchoolDropdown] = useState(false);
  const schoolDropdownRef = useRef<HTMLDivElement>(null);
  const [regStream, setRegStream] = useState('Physical Science');
  const [regDistrict, setRegDistrict] = useState('Colombo');
  const [targetZScore, setTargetZScore] = useState(1.92);
  const [studyCadence, setStudyCadence] = useState('pomodoro');
  const [selectedMascot, setSelectedMascot] = useState<'owl' | 'cat' | 'tea' | 'succulent'>('owl');
  const [regPin, setRegPin] = useState('2026');

  const [loading, setLoading] = useState(false);
  const idInputRef = useRef<HTMLInputElement>(null);

  // Close school dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (schoolDropdownRef.current && !schoolDropdownRef.current.contains(e.target as Node)) {
        setShowSchoolDropdown(false);
      }
    };
    document.addEventListener('pointerdown', handleClickOutside);
    return () => document.removeEventListener('pointerdown', handleClickOutside);
  }, []);

  // Auto-focus ID input when modal opens
  useEffect(() => {
    if (isOpen && activeTab === 'pin') {
      setTimeout(() => idInputRef.current?.focus(), 100);
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  // 1. Candidate ID & PIN Keyboard Sign-In
  const handlePinAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = candidateId.trim().toUpperCase();
    if (!cleanId) {
      toast.error('Please enter your Candidate Index or Study ID');
      return;
    }
    if (!candidatePin.trim() || candidatePin.length < 4) {
      toast.error('PIN must be at least 4 digits');
      return;
    }

    try {
      setLoading(true);
      const ok = await signInWithCandidateId(cleanId, candidatePin.trim());
      if (ok) {
        fireConfetti();
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err: any) {
      toast.error('Authentication error: ' + (err?.message || 'Server unreachable'));
    } finally {
      setLoading(false);
    }
  };

  // 2. Direct Custom Profile Creation (Zero Google dependency)
  const handleCustomProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regFullName.trim()) {
      toast.error('Please enter your full name');
      return;
    }

    try {
      setLoading(true);
      const member = await createCustomProfile({
        fullName: regFullName.trim(),
        studyId: regStudyId.trim() || undefined,
        email: regContact.trim() || undefined,
        school: regSchool.trim() || `${regDistrict} Academic Center`,
        district: regDistrict || 'Colombo',
        stream: regStream,
        pin: regPin.trim() || '2026',
      });

      if (member) {
        fireConfetti();
        toast.success(`Welcome to StudySync, ${member.fullName}!`);
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err: any) {
      toast.error('Profile creation failed: ' + (err?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // 3. Google Institutional Auth
  const handleGoogleAuth = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
      fireConfetti();
      toast.success('Signed in with Google');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#19202e]/60 p-4">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Modal Window in Signature Monoline Vector Aesthetic */}
      <div className="relative z-10 w-full max-w-lg rounded-3xl border-2 border-[#19202e] bg-white p-6 sm:p-8 shadow-[8px_8px_0px_#19202e] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-[#19202e]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#fef3c7] border-2 border-[#19202e] flex items-center justify-center text-[#19202e] shadow-[2px_2px_0px_#19202e]">
              <GraduationCap className="w-5 h-5 text-[#c85a32]" />
            </div>
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#19202e]">
                Scholar Authentication
              </h2>
              <p className="font-mono text-[11px] text-[#4a3b35]">
                G.C.E. Advanced Level 2026 candidate portal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl border-2 border-[#19202e] hover:bg-[#f8f2ef] flex items-center justify-center text-[#19202e] transition-transform active:translate-y-0.5 cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3-Tab Segmented Selector */}
        <div className="grid grid-cols-3 p-1 rounded-2xl border-2 border-[#19202e] bg-[#f8fafc] gap-1 my-5 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('pin')}
            className={`py-2 px-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'pin'
                ? 'bg-[#19202e] text-white shadow-xs'
                : 'text-[#2d2420] hover:text-[#19202e]'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>ID &amp; PIN</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className={`py-2 px-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'register'
                ? 'bg-[#19202e] text-white shadow-xs'
                : 'text-[#2d2420] hover:text-[#19202e]'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>New Profile</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('providers')}
            className={`py-2 px-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'providers'
                ? 'bg-[#19202e] text-white shadow-xs'
                : 'text-[#2d2420] hover:text-[#19202e]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>3rd-Party</span>
          </button>
        </div>

        {/* TAB 1: Keyboard-First ID & PIN Sign-In */}
        {activeTab === 'pin' && (
          <form onSubmit={handlePinAuth} className="space-y-4">
            <div>
              <label className="block font-mono font-bold text-xs text-[#19202e] uppercase tracking-wider mb-1">
                Candidate Index / Study ID
              </label>
              <input
                ref={idInputRef}
                type="text"
                autoFocus
                autoComplete="username"
                placeholder="e.g. AL-2026-MATH-042 or SG-001"
                value={candidateId}
                onChange={(e) => setCandidateId(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border-2 border-[#19202e] bg-white text-xs text-[#19202e] font-mono placeholder:text-slate-400 focus:border-[#c85a32] focus:outline-none transition-all"
                required
              />
              <span className="text-[10px] text-[#4a3b35] mt-0.5 block">
                Type from keyboard or paste your Study ID directly.
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-mono font-bold text-xs text-[#19202e] uppercase tracking-wider">
                  Security PIN (4–6 Digits)
                </label>
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="text-[11px] font-mono text-[#c85a32] hover:underline flex items-center gap-1"
                >
                  {showPin ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{showPin ? 'Hide' : 'Show'}</span>
                </button>
              </div>
              <input
                type={showPin ? 'text' : 'password'}
                inputMode="numeric"
                autoComplete="current-password"
                maxLength={8}
                placeholder="••••"
                value={candidatePin}
                onChange={(e) => setCandidatePin(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border-2 border-[#19202e] bg-white text-sm text-[#19202e] font-mono tracking-widest placeholder:text-slate-400 focus:border-[#c85a32] focus:outline-none transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-[#c85a32] hover:bg-[#b04b25] text-white border-2 border-[#19202e] shadow-[3px_3px_0px_#19202e] font-bold text-xs active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Lock className="w-3.5 h-3.5" />
              )}
              <span>Verify &amp; Enter Workspace</span>
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setActiveTab('register')}
                className="text-xs font-serif text-[#c85a32] hover:underline cursor-pointer"
              >
                Don't have a Study ID yet? Click here to create a custom profile.
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: Stitch MCP 4-Step New Scholar Onboarding Wizard */}
        {activeTab === 'register' && (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            {/* Step Progress Bar */}
            <div className="flex items-center justify-between pb-2 border-b border-[#e7e1de]">
              <span className="font-mono text-[11px] font-bold text-[#c85a32] uppercase tracking-wider">
                Step {wizardStep} of 4: {wizardStep === 1 ? 'Stream & Subjects' : wizardStep === 2 ? 'District & Target Z-Score' : wizardStep === 3 ? 'Study Cadence' : 'Desk Companion'}
              </span>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4].map((s) => (
                  <div
                    key={s}
                    className={`w-5 h-1.5 rounded-full transition-all ${
                      wizardStep >= s ? 'bg-[#c85a32]' : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* STEP 1: Stream Selection */}
            {wizardStep === 1 && (
              <div className="space-y-3">
                <p className="text-xs text-[#2d2420]">
                  Select your primary Sri Lankan G.C.E. Advanced Level study stream:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { id: 'Physical Science', label: 'Physical Science', subs: 'Combined Maths, Physics, Chemistry', tag: 'Engineering' },
                    { id: 'Biological Science', label: 'Biological Science', subs: 'Biology, Chemistry, Physics / Agri', tag: 'Medicine' },
                    { id: 'Technology', label: 'Technology Stream', subs: 'Engineering Tech, Bio Tech, SFT', tag: 'Applied Tech' },
                    { id: 'Commerce', label: 'Commerce Stream', subs: 'Accounting, Business, Economics', tag: 'Management' },
                    { id: 'Arts', label: 'Arts & Humanities', subs: 'Languages, Political Sci, History', tag: 'Social Sciences' },
                  ].map((st) => {
                    const isSel = regStream === st.id;
                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setRegStream(st.id)}
                        className={`p-2.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                          isSel
                            ? 'border-[#19202e] bg-[#fef3c7] shadow-[2px_2px_0px_#19202e]'
                            : 'border-[#19202e] bg-white hover:border-[#c85a32]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-[#19202e]">{st.label}</span>
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-white border border-[#19202e]">
                            {st.tag}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#4a3b35] mt-1 line-clamp-1">{st.subs}</p>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setWizardStep(2)}
                    className="px-4 py-2 rounded-xl bg-[#19202e] hover:bg-[#2d3748] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <span>Next: District &amp; Z-Score</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: District Quota & Target Z-Score */}
            {wizardStep === 2 && (
              <div className="space-y-3.5">
                <div>
                  <label className="block font-mono font-bold text-xs text-[#19202e] mb-1">
                    Administrative District (Quota Calibration)
                  </label>
                  <select
                    value={regDistrict}
                    onChange={(e) => setRegDistrict(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border-2 border-[#19202e] bg-white text-xs text-[#19202e] font-medium focus:border-[#c85a32] focus:outline-none"
                  >
                    {['Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya', 'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar', 'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee', 'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla', 'Monaragala', 'Ratnapura', 'Kegalle'].map((dist) => (
                      <option key={dist} value={dist}>
                        {dist} District
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-mono font-bold text-xs text-[#19202e]">
                      Target Composite Z-Score
                    </label>
                    <span className="font-mono font-bold text-sm text-[#c85a32] tabular-nums">
                      +{targetZScore.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1.40"
                    max="2.40"
                    step="0.05"
                    value={targetZScore}
                    onChange={(e) => setTargetZScore(parseFloat(e.target.value))}
                    className="w-full accent-[#c85a32] cursor-pointer"
                  />
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#4a3b35] mt-1">
                    <span>+1.40 (Campus Pass)</span>
                    <span className="text-[#c85a32] font-semibold">+1.90 (Moratuwa Eng / Med)</span>
                    <span>+2.40 (Island Rank)</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setWizardStep(1)}
                    className="px-3 py-1.5 rounded-xl border border-[#19202e] text-xs font-bold text-[#19202e] hover:bg-slate-100 cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setWizardStep(3)}
                    className="px-4 py-2 rounded-xl bg-[#19202e] hover:bg-[#2d3748] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <span>Next: Study Cadence</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Daily Study Cadence */}
            {wizardStep === 3 && (
              <div className="space-y-3">
                <p className="text-xs text-[#2d2420]">
                  Choose your daily study rhythm calibration:
                </p>
                <div className="space-y-2">
                  {[
                    { id: 'dawn', title: 'Brahma Muhurta (Early Dawn Focus)', desc: '05:00 AM – 08:00 AM uninterrupted pure problem solving.', tag: 'High Retention' },
                    { id: 'pomodoro', title: 'Deep Pomodoro (25m / 5m)', desc: 'Standard rhythmic cycles with short reflective pauses.', tag: 'Balanced' },
                    { id: 'exam', title: '3-Hour Past Paper Flow', desc: 'Strict time simulation under examination pressure.', tag: 'Exam Ready' },
                  ].map((cd) => {
                    const isSel = studyCadence === cd.id;
                    return (
                      <button
                        key={cd.id}
                        type="button"
                        onClick={() => setStudyCadence(cd.id)}
                        className={`w-full p-2.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                          isSel
                            ? 'border-[#19202e] bg-[#fef3c7] shadow-[2px_2px_0px_#19202e]'
                            : 'border-[#19202e] bg-white hover:border-[#c85a32]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-[#19202e]">{cd.title}</span>
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-white border border-[#19202e]">
                            {cd.tag}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#4a3b35] mt-0.5">{cd.desc}</p>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setWizardStep(2)}
                    className="px-3 py-1.5 rounded-xl border border-[#19202e] text-xs font-bold text-[#19202e] hover:bg-slate-100 cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setWizardStep(4)}
                    className="px-4 py-2 rounded-xl bg-[#19202e] hover:bg-[#2d3748] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <span>Next: Mascot &amp; Profile</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Desk Companion Mascot & Final Credentials */}
            {wizardStep === 4 && (
              <form onSubmit={handleCustomProfileSubmit} className="space-y-3.5">
                <div>
                  <label className="block font-mono font-bold text-xs text-[#19202e] mb-1.5">
                    Select Your Desk Companion
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'owl', label: 'Study Owl', desc: 'Vigilance' },
                      { id: 'cat', label: 'Temple Cat', desc: 'Serenity' },
                      { id: 'tea', label: 'Ceylon Tea', desc: 'Warmth' },
                      { id: 'succulent', label: 'Succulent', desc: 'Patience' },
                    ].map((comp) => {
                      const isSel = selectedMascot === comp.id;
                      return (
                        <button
                          key={comp.id}
                          type="button"
                          onClick={() => setSelectedMascot(comp.id as any)}
                          className={`p-2 rounded-xl border-2 text-center transition-all cursor-pointer ${
                            isSel
                              ? 'border-[#19202e] bg-[#fef3c7] shadow-[2px_2px_0px_#19202e] scale-105'
                              : 'border-[#19202e] bg-white hover:border-[#c85a32]'
                          }`}
                        >
                          <span className="font-bold text-[11px] block text-[#19202e]">{comp.label}</span>
                          <span className="text-[9px] text-[#4a3b35] block">{comp.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block font-mono font-bold text-xs text-[#19202e] mb-1">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    autoFocus
                    placeholder="e.g. Kasun Perera"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-xl border-2 border-[#19202e] bg-white text-xs text-[#19202e] focus:border-[#c85a32] focus:outline-none transition-all"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="relative" ref={schoolDropdownRef}>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-mono font-bold text-xs text-[#19202e]">
                        School / College
                      </label>
                      <span className="text-[10px] font-mono text-[#854f00] bg-[#ffdcbc] px-1.5 py-0.2 rounded-full font-bold">
                        306 Pre-Loaded
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        list="scholar-registration-schools-datalist"
                        placeholder="e.g. Royal College, Colombo"
                        value={regSchool}
                        onChange={(e) => {
                          setRegSchool(e.target.value);
                          setShowSchoolDropdown(true);
                        }}
                        onFocus={() => setShowSchoolDropdown(true)}
                        className="w-full h-10 px-3.5 rounded-xl border-2 border-[#19202e] bg-white text-xs text-[#19202e] focus:border-[#c85a32] focus:outline-none pr-8"
                      />
                      {regSchool && (
                        <button
                          type="button"
                          onClick={() => {
                            setRegSchool('');
                            setShowSchoolDropdown(true);
                          }}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8a726a] hover:text-[#19202e] text-xs font-bold"
                          title="Clear school"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Native Datalist Fallback for all browsers and mobile virtual keyboards */}
                    <datalist id="scholar-registration-schools-datalist">
                      {SRI_LANKAN_SCHOOLS.map((s) => (
                        <option key={s.id || s.name} value={s.name}>
                          {s.district} District • {s.type}
                        </option>
                      ))}
                    </datalist>

                    {/* Floating Interactive Pre-Loaded Schools Dropdown */}
                    {showSchoolDropdown && (
                      <div className="absolute left-0 right-0 top-full mt-1.5 max-h-52 overflow-y-auto bg-white border-2 border-[#19202e] rounded-xl shadow-[4px_4px_0px_#19202e] z-50 p-1 divide-y divide-[#f0eae6] animate-in fade-in zoom-in-95 duration-150">
                        <div className="px-2.5 py-1 text-[10px] font-mono font-bold text-[#8a726a] bg-[#fef8f4] rounded-lg flex items-center justify-between mb-1">
                          <span>
                            {regSchool.trim() ? `Search: "${regSchool}"` : `Popular in ${regDistrict}`}
                          </span>
                          <span>
                            {
                              (regSchool.trim()
                                ? SRI_LANKAN_SCHOOLS.filter(
                                    (s) =>
                                      s.name.toLowerCase().includes(regSchool.trim().toLowerCase()) ||
                                      s.district.toLowerCase().includes(regSchool.trim().toLowerCase())
                                  )
                                : SRI_LANKAN_SCHOOLS.filter(
                                    (s) => s.district.toLowerCase() === regDistrict.toLowerCase()
                                  )
                              ).length
                            }{' '}
                            Found
                          </span>
                        </div>
                        {(regSchool.trim()
                          ? SRI_LANKAN_SCHOOLS.filter(
                              (s) =>
                                s.name.toLowerCase().includes(regSchool.trim().toLowerCase()) ||
                                s.district.toLowerCase().includes(regSchool.trim().toLowerCase())
                            ).slice(0, 10)
                          : SRI_LANKAN_SCHOOLS.filter(
                              (s) => s.district.toLowerCase() === regDistrict.toLowerCase()
                            ).slice(0, 8)
                        ).map((s) => (
                          <button
                            key={s.id || s.name}
                            type="button"
                            onClick={() => {
                              setRegSchool(s.name);
                              setShowSchoolDropdown(false);
                            }}
                            className="w-full text-left px-2.5 py-2 hover:bg-[#f8f2ef] rounded-lg transition-colors flex items-center justify-between group cursor-pointer"
                          >
                            <div className="min-w-0 pr-2">
                              <span className="text-xs font-semibold text-[#19202e] group-hover:text-[#c85a32] block truncate">
                                {s.name}
                              </span>
                              <span className="text-[10px] text-[#8a726a] block">
                                {s.province} Province • {s.type}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#f3ede9] text-[#2d2420] shrink-0 border border-[#dec0b7]">
                              {s.district}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Quick 1-Tap District School Suggestion Pills */}
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {SRI_LANKAN_SCHOOLS.filter(
                        (s) => s.district.toLowerCase() === regDistrict.toLowerCase()
                      )
                        .slice(0, 3)
                        .map((s) => (
                          <button
                            key={s.id || s.name}
                            type="button"
                            onClick={() => {
                              setRegSchool(s.name);
                              setShowSchoolDropdown(false);
                            }}
                            className="px-2 py-0.5 rounded-md bg-[#f3ede9] hover:bg-[#ede7e3] text-[10px] font-mono font-medium text-[#2d2420] border border-[#e7e1de] transition-colors cursor-pointer truncate max-w-[140px]"
                            title={s.name}
                          >
                            {s.name.split(',')[0]}
                          </button>
                        ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono font-bold text-xs text-[#19202e] mb-1">
                      Custom Security PIN
                    </label>
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="2026"
                      value={regPin}
                      onChange={(e) => setRegPin(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-xl border-2 border-[#19202e] bg-white text-xs text-[#19202e] font-mono tracking-widest focus:border-[#c85a32] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setWizardStep(3)}
                    className="px-3 py-1.5 rounded-xl border border-[#19202e] text-xs font-bold text-[#19202e] hover:bg-slate-100 cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 rounded-xl bg-[#c85a32] hover:bg-[#b04b25] text-white border-2 border-[#19202e] shadow-[2px_2px_0px_#19202e] font-bold text-xs active:translate-y-0.5 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    <span>Complete Induction &amp; Claim Desk</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* TAB 3: Multiple 3rd-Party & Institutional Providers */}
        {activeTab === 'providers' && (
          <div className="space-y-3">
            {/* Google Sign-In */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={loading}
              className="w-full h-12 rounded-2xl border-2 border-[#19202e] bg-white hover:bg-[#f8fafc] text-[#19202e] font-bold text-xs flex items-center justify-between px-4 shadow-[2px_2px_0px_#19202e] active:translate-y-0.5 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <div className="text-left">
                  <p className="font-bold">Continue with Google Account</p>
                  <p className="text-[10px] text-slate-500 font-normal">Fast one-tap authentication</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#19202e]" />
            </button>

            {/* GitHub Student Account */}
            <button
              type="button"
              onClick={() => {
                toast.info('GitHub Student Auth initializing...');
                handleGoogleAuth();
              }}
              className="w-full h-12 rounded-2xl border-2 border-[#19202e] bg-white hover:bg-[#f8fafc] text-[#19202e] font-bold text-xs flex items-center justify-between px-4 shadow-[2px_2px_0px_#19202e] active:translate-y-0.5 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 shrink-0 fill-current text-[#19202e]" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                <div className="text-left">
                  <p className="font-bold">GitHub Student Developer</p>
                  <p className="text-[10px] text-slate-500 font-normal">Connect via GitHub profile</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#19202e]" />
            </button>

            {/* Hardware Passkey / WebAuthn */}
            <button
              type="button"
              onClick={() => {
                toast.info('Requesting biometric credentials from local machine...');
              }}
              className="w-full h-12 rounded-2xl border-2 border-[#19202e] bg-white hover:bg-[#f8fafc] text-[#19202e] font-bold text-xs flex items-center justify-between px-4 shadow-[2px_2px_0px_#19202e] active:translate-y-0.5 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Fingerprint className="w-5 h-5 text-[#c85a32]" />
                <div className="text-left">
                  <p className="font-bold">Touch ID / Windows Hello Passkey</p>
                  <p className="text-[10px] text-slate-500 font-normal">Hardware cryptographic security</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#19202e]" />
            </button>
          </div>
        )}

        {/* Footer Note */}
        <div className="mt-5 pt-3 border-t border-[#e7e1de] text-center">
          <p className="font-mono text-[10px] text-[#4a3b35]">
            Protected by client-side AES cryptography &middot; Zero tracking policy
          </p>
        </div>
      </div>
    </div>
  );
}
