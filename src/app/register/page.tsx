'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { localDb } from '@/lib/storage/localDb';
import { toast } from 'sonner';
import {
  ShieldCheck,
  KeyRound,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Loader2,
  GraduationCap,
  Layers,
  School,
  FileCheck,
} from 'lucide-react';
import { SRI_LANKAN_SCHOOLS } from '@/lib/schools';

export default function RegisterPage() {
  const router = useRouter();
  const { signInWithGoogle, signInWithCandidateId, createCustomProfile, user, member } = useAuth();

  // Mode: 'signin' | 'register'
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');
  const [activeTab, setActiveTab] = useState<'google' | 'pin'>('google');

  // Sign In inputs
  const [candidateId, setCandidateId] = useState('');
  const [candidatePin, setCandidatePin] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Register inputs
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [school, setSchool] = useState('');
  const [district, setDistrict] = useState('Colombo');
  const [stream, setStream] = useState('Physical Science');
  const [optionalSubject, setOptionalSubject] = useState('Chemistry');
  const [examYear, setExamYear] = useState('2026');

  const [loading, setLoading] = useState(false);

  // 1. Google One-Tap Auth
  const handleGoogleAuth = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
      toast.success('Scholar session authenticated via Google');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error('Google authentication failed: ' + (err?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // 2. Candidate ID & PIN validation (Keyboard-First)
  const handlePinAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateId.trim()) {
      toast.error('Please enter your Candidate Study ID (e.g. SG-MATH-0001)');
      return;
    }
    if (!candidatePin.trim() || candidatePin.length < 4) {
      toast.error('Please enter your 4-6 digit security PIN');
      return;
    }

    try {
      setLoading(true);
      const cleanId = candidateId.trim().toUpperCase();
      const ok = await signInWithCandidateId(cleanId, candidatePin.trim());
      if (ok) {
        router.push('/dashboard');
      }
    } catch (err: any) {
      toast.error('Verification failed: ' + (err?.message || 'Invalid credentials'));
    } finally {
      setLoading(false);
    }
  };

  // 4. Registration Submission (Direct Custom Profile)
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !school.trim()) {
      toast.error('Please fill in all mandatory fields');
      return;
    }

    try {
      setLoading(true);
      const newMember = await createCustomProfile({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        school: school.trim(),
        district,
        stream,
        optionalSubject,
      });

      if (newMember) {
        router.push('/dashboard');
      }
    } catch (err: any) {
      toast.error('Registration failed: ' + (err?.message || 'Server error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] bg-[#fef8f4] text-[#1d1b19] font-sans antialiased selection:bg-[#c85a32]/20 selection:text-[#1d1b19] py-8 sm:py-12">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Mindful Welcome & Value Anchor */}
          <section className="lg:col-span-6 flex flex-col gap-6 lg:pr-6">
            {/* Context Tracker & District Pill */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f3ede9] text-[#2d2420] text-xs font-mono tracking-wider uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-[#854f00]" />
                A/L 2026 Cohort Gateway
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#c6edc1] text-[#022106] text-xs font-mono font-medium">
                <Lock className="w-3 h-3" />
                Encrypted Scholar Vault
              </span>
            </div>

            {/* Headline & Conversational Subtitle */}
            <div className="space-y-2">
              <h1 className="font-serif text-3xl sm:text-4xl text-[#1d1b19] tracking-tight leading-tight">
                Welcome back to your <span className="italic font-normal text-[#c85a32]">quiet space</span>.
              </h1>
              <p className="text-sm sm:text-base text-[#2d2420] leading-relaxed max-w-xl">
                Enter your scholar portal to log daily study sessions, audit verified proof submissions, and benchmark your progress toward university selection.
              </p>
            </div>

            {/* Trust Pillar Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-[#ffffff] border border-[#e7e1de] shadow-xs space-y-1">
                <div className="flex items-center gap-2 text-[#c85a32]">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-xs font-semibold">Zero Ad Trackers</span>
                </div>
                <p className="text-xs text-[#2d2420] leading-relaxed">
                  No gamification, leaderboards, or public ranking exposure. Only quiet personal progress.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#ffffff] border border-[#e7e1de] shadow-xs space-y-1">
                <div className="flex items-center gap-2 text-[#456644]">
                  <FileCheck className="w-4 h-4" />
                  <span className="text-xs font-semibold">Verified Proof Ledger</span>
                </div>
                <p className="text-xs text-[#2d2420] leading-relaxed">
                  Every logged hour backed by handwritten working and teacher verification.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#ffffff] border border-[#e7e1de] shadow-xs space-y-1">
                <div className="flex items-center gap-2 text-[#854f00]">
                  <Layers className="w-4 h-4" />
                  <span className="text-xs font-semibold">District Z-Score Model</span>
                </div>
                <p className="text-xs text-[#2d2420] leading-relaxed">
                  Predict national cut-offs calibrated for Colombo, Kandy, Galle, and all 25 districts.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#ffffff] border border-[#e7e1de] shadow-xs space-y-1">
                <div className="flex items-center gap-2 text-[#c85a32]">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-xs font-semibold">Verified Candidate Pass</span>
                </div>
                <p className="text-xs text-[#2d2420] leading-relaxed">
                  Fast, secure access using your Google account or Candidate Study ID.
                </p>
              </div>
            </div>

            {/* Quote Reflection */}
            <div className="p-4 rounded-xl bg-[#f8f2ef] border border-[#e7e1de] text-xs text-[#2d2420] italic">
              "Excellence is not an act, but a steady rhythm practiced daily without distraction."
            </div>
          </section>

          {/* Right Column: The Auth Card */}
          <section className="lg:col-span-6 w-full max-w-lg mx-auto">
            <div className="bg-[#ffffff] rounded-2xl p-6 sm:p-8 border border-[#e7e1de] shadow-sm relative overflow-hidden">
              
              {/* Header */}
              <div className="flex items-center justify-between pb-6 border-b border-[#e7e1de]">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#4a3b35]">Authentication Protocol</span>
                  <h2 className="font-serif text-2xl font-semibold text-[#1d1b19] mt-0.5">
                    {authMode === 'signin' ? 'Scholar Access' : 'New Enrollment'}
                  </h2>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f3ede9] text-[#2d2420] text-xs font-mono">
                  <span className="w-2 h-2 rounded-full bg-[#456644] animate-pulse" />
                  <span>256-Bit Vault</span>
                </div>
              </div>

              {/* Mode Toggle Pill */}
              <div className="grid grid-cols-2 p-1 rounded-xl bg-[#f8f2ef] border border-[#e7e1de] my-6 gap-1">
                <button
                  type="button"
                  onClick={() => setAuthMode('signin')}
                  className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                    authMode === 'signin'
                      ? 'bg-[#c85a32] text-white shadow-xs'
                      : 'text-[#2d2420] hover:text-[#1d1b19]'
                  }`}
                >
                  Scholar Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                    authMode === 'register'
                      ? 'bg-[#c85a32] text-white shadow-xs'
                      : 'text-[#2d2420] hover:text-[#1d1b19]'
                  }`}
                >
                  Enroll as New Candidate
                </button>
              </div>

              {authMode === 'signin' ? (
                <>
                  {/* Segmented Auth Method Switcher */}
                  <div className="grid grid-cols-2 p-1 rounded-xl bg-[#f8f2ef] border border-[#e7e1de] mb-6 gap-1">
                    <button
                      type="button"
                      onClick={() => setActiveTab('google')}
                      className={`py-2 px-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                        activeTab === 'google'
                          ? 'bg-[#ffffff] text-[#1d1b19] shadow-xs'
                          : 'text-[#2d2420] hover:text-[#1d1b19]'
                      }`}
                    >
                      <span>Google Account</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('pin')}
                      className={`py-2 px-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                        activeTab === 'pin'
                          ? 'bg-[#ffffff] text-[#1d1b19] shadow-xs'
                          : 'text-[#2d2420] hover:text-[#1d1b19]'
                      }`}
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Study ID &amp; PIN</span>
                    </button>
                  </div>

                  {/* Tab 1: Google One-Tap */}
                  {activeTab === 'google' && (
                    <div className="space-y-4">
                      <p className="text-xs text-[#2d2420] leading-relaxed">
                        Authorize instantly with your Sri Lankan student Google account. Zero passwords to remember.
                      </p>
                      <button
                        type="button"
                        onClick={handleGoogleAuth}
                        disabled={loading}
                        className="w-full py-3.5 px-4 rounded-full bg-[#f8f2ef] hover:bg-[#ede7e3] border border-[#e7e1de] text-[#1d1b19] text-xs font-semibold flex items-center justify-center gap-3 transition-colors shadow-xs"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path
                            fill="#EA4335"
                            d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                          />
                          <path
                            fill="#4285F4"
                            d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.1s.7 5.4 1.9 7.8l3.7-2.9z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.5C3.7 20.3 7.5 23.5 12 23.5z"
                          />
                        </svg>
                        <span>Continue with Google Workspace</span>
                      </button>
                    </div>
                  )}

                  {/* Tab 2: Candidate ID & PIN */}
                  {activeTab === 'pin' && (
                    <form onSubmit={handlePinAuth} className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-[#1d1b19] mb-1.5">
                          Candidate Study ID
                        </label>
                        <input
                          type="text"
                          required
                          value={candidateId}
                          onChange={(e) => setCandidateId(e.target.value)}
                          placeholder="e.g. SG-MATH-0001"
                          className="w-full px-4 py-2.5 rounded-xl bg-[#f8f2ef] border border-[#e7e1de] text-xs font-mono text-[#1d1b19] focus:outline-none focus:border-[#c85a32] transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-[#1d1b19] mb-1.5">
                          Security PIN
                        </label>
                        <input
                          type="password"
                          required
                          value={candidatePin}
                          onChange={(e) => setCandidatePin(e.target.value)}
                          placeholder="••••"
                          maxLength={8}
                          className="w-full px-4 py-2.5 rounded-xl bg-[#f8f2ef] border border-[#e7e1de] text-xs font-mono text-[#1d1b19] focus:outline-none focus:border-[#c85a32] transition-colors tracking-widest"
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1">
                        <label className="flex items-center gap-2 cursor-pointer text-[#2d2420]">
                          <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="rounded border-[#e7e1de] text-[#c85a32] focus:ring-[#c85a32]"
                          />
                          <span>Remember on this browser</span>
                        </label>
                        <span className="text-[#4a3b35] font-mono text-[11px]">Pin: 1234</span>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 rounded-full bg-[#c85a32] hover:bg-[#b04b25] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors"
                      >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                        <span>Access Examination Ledger</span>
                      </button>
                    </form>
                  )}
                </>
              ) : (
                /* Registration Form */
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-[#1d1b19] mb-1.5">
                      Full Legal Name (as registered with Examinations Dept)
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Kavindu Senarathne"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#f8f2ef] border border-[#e7e1de] text-xs text-[#1d1b19] focus:outline-none focus:border-[#c85a32]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#1d1b19] mb-1.5">
                      Primary Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. kavindu@gmail.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#f8f2ef] border border-[#e7e1de] text-xs text-[#1d1b19] focus:outline-none focus:border-[#c85a32]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[#1d1b19] mb-1.5">
                        School / Institute
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          list="register-schools-datalist"
                          value={school}
                          onChange={(e) => setSchool(e.target.value)}
                          placeholder="Type or select your school..."
                          className="w-full px-4 py-2.5 rounded-xl bg-[#f8f2ef] border border-[#e7e1de] text-xs text-[#1d1b19] focus:outline-none focus:border-[#c85a32]"
                        />
                        <datalist id="register-schools-datalist">
                          {SRI_LANKAN_SCHOOLS.map((s) => (
                            <option key={s.id || s.name} value={s.name}>
                              {s.district} District • {s.type}
                            </option>
                          ))}
                        </datalist>
                      </div>
                      {/* 1-tap district school quick suggestion pills */}
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <span className="text-[10px] text-[#8a726a] font-mono mr-1 self-center">
                          {district}:
                        </span>
                        {SRI_LANKAN_SCHOOLS.filter((s) => s.district.toLowerCase() === district.toLowerCase())
                          .slice(0, 3)
                          .map((s) => (
                            <button
                              key={s.id || s.name}
                              type="button"
                              onClick={() => setSchool(s.name)}
                              className="text-[10px] px-2 py-0.5 rounded-full bg-[#f4ebe6] hover:bg-[#e7e1de] text-[#1d1b19] font-medium border border-[#ded5d0] transition-colors"
                            >
                              {s.name}
                            </button>
                          ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#1d1b19] mb-1.5">
                        District (for Z-Score)
                      </label>
                      <select
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#f8f2ef] border border-[#e7e1de] text-xs text-[#1d1b19] focus:outline-none focus:border-[#c85a32]"
                      >
                        <option value="Colombo">Colombo</option>
                        <option value="Gampaha">Gampaha</option>
                        <option value="Kalutara">Kalutara</option>
                        <option value="Kandy">Kandy</option>
                        <option value="Galle">Galle</option>
                        <option value="Matara">Matara</option>
                        <option value="Kurunegala">Kurunegala</option>
                        <option value="Jaffna">Jaffna</option>
                        <option value="Anuradhapura">Anuradhapura</option>
                        <option value="Badulla">Badulla</option>
                        <option value="Ratnapura">Ratnapura</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[#1d1b19] mb-1.5">
                        A/L Stream
                      </label>
                      <select
                        value={stream}
                        onChange={(e) => setStream(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#f8f2ef] border border-[#e7e1de] text-xs text-[#1d1b19] focus:outline-none focus:border-[#c85a32]"
                      >
                        <option value="Physical Science">Physical Science (Maths)</option>
                        <option value="Biological Science">Biological Science (Bio)</option>
                        <option value="Technology">Technology Stream</option>
                        <option value="Commerce">Commerce Stream</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#1d1b19] mb-1.5">
                        Optional Subject
                      </label>
                      <select
                        value={optionalSubject}
                        onChange={(e) => setOptionalSubject(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#f8f2ef] border border-[#e7e1de] text-xs text-[#1d1b19] focus:outline-none focus:border-[#c85a32]"
                      >
                        <option value="Chemistry">Chemistry</option>
                        <option value="Physics">Physics</option>
                        <option value="Information Technology">Information Tech (ICT)</option>
                        <option value="Agricultural Science">Agricultural Science</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-4 rounded-full bg-[#c85a32] hover:bg-[#b04b25] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors mt-2"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    <span>Issue Official Digital Pass &amp; Study ID</span>
                  </button>
                </form>
              )}

              {/* Secure Footer Note */}
              <div className="pt-6 mt-6 border-t border-[#e7e1de] flex items-center justify-between text-[11px] font-mono text-[#4a3b35]">
                <span>SSL Encrypted</span>
                <span>NIE Curriculum Standard</span>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
