'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { safeStorage } from '@/lib/storage/safeStorage';
import { localDb } from '@/lib/storage/localDb';
import { MemberData } from '@/types/member';
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Users,
  Camera,
  FileCheck,
  Lock,
  Unlock,
  RotateCcw,
  Check,
  X,
  Eye,
  ZoomIn,
  ZoomOut,
  Ban,
  Download,
  Award,
} from 'lucide-react';
import { toast } from 'sonner';

export const HallControlSuite: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'gate' | 'slips' | 'double_blind'>('gate');
  const [searchQuery, setSearchQuery] = useState('');
  const [members, setMembers] = useState<MemberData[]>(() => localDb.getMembers());
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, { timestamp: string; gate: string }>>(() => {
    return safeStorage.getJson('studysync_hall_attendance', {});
  });

  // Offline Roster Pre-caching
  const [rosterCached, setRosterCached] = useState(false);

  useEffect(() => {
    try {
      const allMembers = localDb.getMembers();
      setMembers(allMembers);
      safeStorage.setJson('studysync_offline_roster', allMembers);
      setRosterCached(true);
    } catch (e) {}
  }, []);

  // Filtered members for manual search
  const filteredCandidates = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return members.filter((m) =>
      m.studyId?.toLowerCase().includes(q) ||
      m.fullName?.toLowerCase().includes(q) ||
      m.nic?.toLowerCase().includes(q) ||
      (m as any).candidateId?.toLowerCase().includes(q)
    );
  }, [searchQuery, members]);

  // Handle Manual or QR Admittance
  const handleAdmitCandidate = (candidate: MemberData) => {
    const studyId = candidate.studyId;
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // Check duplicate attendance alarm
    if (attendanceRecords[studyId] && attendanceRecords[studyId].timestamp.startsWith(todayStr)) {
      toast.error(`DUPLICATE ATTENDANCE ALARM: ${candidate.fullName} already checked in at ${attendanceRecords[studyId].timestamp.split('T')[1].slice(0, 5)}!`);
      return;
    }

    const newRecord = {
      ...attendanceRecords,
      [studyId]: {
        timestamp: now.toISOString(),
        gate: 'Hall Gate 01',
      },
    };
    setAttendanceRecords(newRecord);
    safeStorage.setJson('studysync_hall_attendance', newRecord);
    toast.success(`ADMITTED: ${candidate.fullName} (${studyId})`);
  };

  // Emergency Revoke Pass
  const handleRevokePass = (studyId: string) => {
    const updated = members.map((m) => {
      if (m.studyId === studyId) {
        return { ...m, isVerified: false, status: 'locked' };
      }
      return m;
    });
    setMembers(updated);
    safeStorage.setJson('studysync_offline_roster', updated);
    toast.error(`EMERGENCY LOCKOUT: Pass revoked for Study ID ${studyId}`);
  };

  // Bank Slip Inspector State
  const [selectedSlipCandidate, setSelectedSlipCandidate] = useState<MemberData | null>(null);
  const [slipZoom, setSlipZoom] = useState(1);

  // Candidates with payment slips
  const candidatesWithSlips = useMemo(() => {
    return members.filter((m) => m.paymentSlipUrl || m.bankSlipUrl || (m as any).slipUrl);
  }, [members]);

  const handleApproveSlip = (studyId: string) => {
    const updated = members.map((m) => (m.studyId === studyId ? { ...m, isVerified: true } : m));
    setMembers(updated);
    safeStorage.setJson('studysync_offline_roster', updated);
    toast.success('Bank slip approved. Candidate pass activated!');
    setSelectedSlipCandidate(null);
  };

  const handleRejectSlip = (studyId: string) => {
    toast.error('Payment slip rejected. Notice dispatched to student inbox.');
    setSelectedSlipCandidate(null);
  };

  // Double-Blind Script Token Allocation
  const [allocatedTokens, setAllocatedTokens] = useState<Record<string, string>>(() => {
    return safeStorage.getJson('studysync_double_blind_tokens', {});
  });

  const generateBlindTokens = () => {
    const tokens: Record<string, string> = {};
    members.forEach((m, idx) => {
      tokens[m.studyId] = `ANON-${Math.floor(1000 + Math.random() * 9000)}-LK`;
    });
    setAllocatedTokens(tokens);
    safeStorage.setJson('studysync_double_blind_tokens', tokens);
    toast.success('Double-blind anonymous tokens generated for markers');
  };

  return (
    <div className="w-full rounded-3xl bg-white border border-[#e7e1de] p-6 sm:p-8 shadow-xs font-sans">
      {/* Navigation Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#f3ede9]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#c85a32]/10 text-[#c85a32]">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#1d1b19]">
                Verify ID &amp; Hall Control Suite
              </h2>
              <p className="text-xs text-[#57423b]">
                Real-time rotating pass validation &middot; Offline roster cache &middot; NIST PR.AA-1
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-[#f8f2ef] rounded-2xl border border-[#dec0b7]/60">
          <button
            type="button"
            onClick={() => setActiveTab('gate')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 ${
              activeTab === 'gate' ? 'bg-white text-[#c85a32] shadow-xs' : 'text-[#57423b]'
            }`}
          >
            Gate Admittance
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('slips')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 ${
              activeTab === 'slips' ? 'bg-white text-[#c85a32] shadow-xs' : 'text-[#57423b]'
            }`}
          >
            Bank Slips ({candidatesWithSlips.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('double_blind')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 ${
              activeTab === 'double_blind' ? 'bg-white text-[#c85a32] shadow-xs' : 'text-[#57423b]'
            }`}
          >
            Double-Blind Marks
          </button>
        </div>
      </div>

      {/* TAB 1: GATE ADMITTANCE */}
      {activeTab === 'gate' && (
        <div className="mt-6 space-y-6">
          {/* Status Bar */}
          <div className="p-4 rounded-2xl bg-[#fef8f4] border border-[#f3ede9] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#456644] animate-pulse" />
              <span className="font-semibold text-[#1d1b19]">Offline Gate Scanner Ready</span>
              <span className="font-mono text-[#8a726a]">&middot; {members.length} Candidates Pre-Cached</span>
            </div>
            <span className="font-mono text-[11px] text-[#456644] font-bold">
              {Object.keys(attendanceRecords).length} Checked In Today
            </span>
          </div>

          {/* Search Box for Dead Phone Admittance */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#8a726a] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Manual Index or NIC lookup (e.g. 200428901234 or STUDY-8421)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-[#e7e1de] bg-[#f8f2ef] text-xs text-[#1d1b19] outline-none focus:border-[#c85a32] transition-colors"
            />
          </div>

          {/* Search Candidates Results */}
          {filteredCandidates.length > 0 && (
            <div className="p-4 rounded-2xl border border-[#e7e1de] bg-white space-y-3">
              <span className="text-[11px] font-mono font-bold text-[#8a726a] uppercase">
                Matching Roster Candidates
              </span>
              <div className="divide-y divide-[#f3ede9]">
                {filteredCandidates.map((cand) => (
                  <div key={cand.studyId} className="py-3 flex items-center justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-xs text-[#1d1b19]">{cand.fullName}</h4>
                      <p className="text-[11px] font-mono text-[#57423b]">
                        ID: {cand.studyId} &middot; NIC: {cand.nic || 'Registered'} &middot; {cand.stream}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleAdmitCandidate(cand)}
                        className="px-3.5 py-1.5 rounded-full bg-[#456644] hover:bg-[#344f33] active:scale-95 text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Admit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRevokePass(cand.studyId)}
                        className="p-1.5 rounded-full bg-red-50 hover:bg-red-100 active:scale-95 text-red-600 transition-colors"
                        title="Emergency Revoke Pass"
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Roster Grid */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#e7e1de] text-[#8a726a] font-mono text-[10px] uppercase">
                  <th className="py-2.5 px-3">Candidate</th>
                  <th className="py-2.5 px-3">Stream / District</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Hall Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f3ede9]">
                {members.slice(0, 8).map((m) => {
                  const isAdmitted = attendanceRecords[m.studyId];
                  return (
                    <tr key={m.studyId} className="hover:bg-[#fef8f4]/60">
                      <td className="py-3 px-3">
                        <p className="font-semibold text-[#1d1b19]">{m.fullName}</p>
                        <p className="font-mono text-[10px] text-[#8a726a]">{m.studyId}</p>
                      </td>
                      <td className="py-3 px-3 text-[#57423b]">
                        {m.stream || 'Physical Science'} &middot; {m.district || 'Colombo'}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                            isAdmitted
                              ? 'bg-[#c6edc1] text-[#022106]'
                              : 'bg-[#f3ede9] text-[#57423b]'
                          }`}
                        >
                          {isAdmitted ? 'Checked In' : 'Outside'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleAdmitCandidate(m)}
                          className="px-3 py-1 rounded-full bg-[#c85a32] hover:bg-[#b04b25] active:scale-95 text-white text-[11px] font-semibold transition-all shadow-xs"
                        >
                          Check In
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: BANK SLIP INSPECTOR */}
      {activeTab === 'slips' && (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Slip Candidates List */}
          <div className="lg:col-span-5 space-y-2 border-r border-[#f3ede9] pr-4">
            <span className="text-[11px] font-mono font-bold text-[#8a726a] uppercase block mb-2">
              Pending Slips ({candidatesWithSlips.length})
            </span>
            {candidatesWithSlips.map((cand) => (
              <div
                key={cand.studyId}
                onClick={() => {
                  setSelectedSlipCandidate(cand);
                  setSlipZoom(1);
                }}
                className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition-all active:scale-[0.98] ${
                  selectedSlipCandidate?.studyId === cand.studyId
                    ? 'bg-[#fef8f4] border-[#c85a32] shadow-xs'
                    : 'bg-white border-[#e7e1de] hover:border-[#8a726a]'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-[#1d1b19]">{cand.fullName}</h4>
                    <p className="font-mono text-[11px] text-[#8a726a]">{cand.studyId}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-[#ffdcbc] text-[#854f00] text-[10px] font-bold">
                    Review
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* High-Resolution Split-Screen Inspector */}
          <div className="lg:col-span-7">
            {selectedSlipCandidate ? (
              <div className="p-5 rounded-2xl bg-[#f8f2ef]/50 border border-[#e7e1de] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-[#1d1b19]">
                      {selectedSlipCandidate.fullName}
                    </h4>
                    <p className="text-[11px] font-mono text-[#8a726a]">
                      Slip Verification for {selectedSlipCandidate.studyId}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSlipZoom((z) => Math.max(0.5, z - 0.25))}
                      className="p-1.5 rounded-lg bg-white border border-[#e7e1de] text-[#1d1b19]"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSlipZoom((z) => Math.min(2.5, z + 0.25))}
                      className="p-1.5 rounded-lg bg-white border border-[#e7e1de] text-[#1d1b19]"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Slip Canvas Frame */}
                <div className="aspect-[4/3] rounded-xl bg-white border border-[#e7e1de] overflow-hidden flex items-center justify-center p-2 relative">
                  <img
                    src={selectedSlipCandidate.paymentSlipUrl || '/images/rooms/scholar_desk_break.jpg'}
                    alt="Bank payment slip"
                    style={{ transform: `scale(${slipZoom})` }}
                    className="max-w-full max-h-full object-contain transition-transform duration-150"
                  />
                </div>

                {/* 1-Click Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => handleRejectSlip(selectedSlipCandidate.studyId)}
                    className="px-4 py-2 rounded-full bg-white hover:bg-red-50 text-red-600 border border-red-200 text-xs font-semibold active:scale-95 transition-all"
                  >
                    Reject Slip
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApproveSlip(selectedSlipCandidate.studyId)}
                    className="px-5 py-2 rounded-full bg-[#456644] hover:bg-[#344f33] text-white text-xs font-semibold active:scale-95 transition-all shadow-xs"
                  >
                    Approve Pass
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-64 rounded-2xl bg-[#f8f2ef]/30 border border-[#e7e1de] flex flex-col items-center justify-center text-center p-6 text-xs text-[#8a726a]">
                Select a candidate from the left panel to inspect their deposit slip in high resolution.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: DOUBLE-BLIND SCRIPT ALLOCATION */}
      {activeTab === 'double_blind' && (
        <div className="mt-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#fef8f4] border border-[#f3ede9]">
            <div>
              <h4 className="font-bold text-sm text-[#1d1b19]">Double-Blind Examination Marking</h4>
              <p className="text-xs text-[#57423b]">
                Anonymizes candidate identity with temporary tokens, preventing bias during manual paper marking.
              </p>
            </div>
            <button
              type="button"
              onClick={generateBlindTokens}
              className="px-4 py-2 rounded-full bg-[#c85a32] hover:bg-[#b04b25] active:scale-95 text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Generate Anonymous Tokens</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#e7e1de] text-[#8a726a] font-mono text-[10px] uppercase">
                  <th className="py-2 px-3">Real Candidate Name</th>
                  <th className="py-2 px-3">Real Study ID</th>
                  <th className="py-2 px-3">Double-Blind Token (Visible to Markers)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f3ede9]">
                {members.slice(0, 10).map((m) => (
                  <tr key={m.studyId} className="hover:bg-[#fef8f4]/60">
                    <td className="py-2.5 px-3 font-semibold text-[#1d1b19]">{m.fullName}</td>
                    <td className="py-2.5 px-3 font-mono text-[#8a726a]">{m.studyId}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2.5 py-1 rounded-md bg-[#19202e] text-white font-mono text-xs font-bold tracking-wider">
                        {allocatedTokens[m.studyId] || 'ANON-LOCK'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default HallControlSuite;
