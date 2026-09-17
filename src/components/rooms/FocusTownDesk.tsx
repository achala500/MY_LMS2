'use client';

import React, { useState } from 'react';
import { RoomPeer, CheerType } from '@/lib/rooms/roomPresence';
import { cn } from '@/lib/utils';
import { Sparkles, Heart, Flame, Coffee, Award, Clock } from 'lucide-react';

interface FocusTownDeskProps {
  peer?: RoomPeer;
  deskNumber: number;
  onClaim?: (deskNumber: number) => void;
  onCheer?: (toStudyId: string, type: CheerType, message: string) => void;
  isSelf?: boolean;
}

const FocusTownDeskComponent: React.FC<FocusTownDeskProps> = ({
  peer,
  deskNumber,
  onClaim,
  onCheer,
  isSelf,
}) => {
  const [showCheerMenu, setShowCheerMenu] = useState(false);

  const formatTimer = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // If desk is unoccupied, render clean top-down architectural wireframe
  if (!peer) {
    return (
      <div
        onClick={() => onClaim && onClaim(deskNumber)}
        className="group relative rounded-2xl border-2 border-dashed border-[#dec0b7] hover:border-[#c85a32] bg-[#f8f2ef]/40 hover:bg-white transition-all duration-200 p-4 flex flex-col items-center justify-between min-h-[190px] cursor-pointer select-none active:scale-[0.97]"
      >
        <div className="w-full flex items-center justify-between text-[11px] font-mono text-[#8a726a]">
          <span>Station #{String(deskNumber).padStart(2, '0')}</span>
          <span className="text-[10px] uppercase tracking-wider font-semibold group-hover:text-[#c85a32]">
            Available
          </span>
        </div>

        {/* Top-Down Architectural Monolinear Desk Vector Outline */}
        <div className="w-24 h-24 my-2 flex items-center justify-center text-[#dec0b7] group-hover:text-[#c85a32] transition-colors">
          <svg viewBox="0 0 100 100" width="80" height="80" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {/* Desk Surface Outline */}
            <rect x="15" y="20" width="70" height="40" rx="4" />
            {/* Chair Outline */}
            <rect x="35" y="68" width="30" height="16" rx="4" />
            <line x1="38" y1="60" x2="38" y2="68" />
            <line x1="62" y1="60" x2="62" y2="68" />
            {/* Open Paper on Desk */}
            <rect x="36" y="28" width="28" height="20" rx="2" strokeDasharray="2 2" />
            <line x1="42" y1="34" x2="58" y2="34" />
            <line x1="42" y1="40" x2="54" y2="40" />
            {/* Study Lamp */}
            <circle cx="24" cy="28" r="4" />
            <line x1="24" y1="32" x2="24" y2="38" />
          </svg>
        </div>

        <div className="w-full text-center">
          <span className="inline-flex items-center gap-1 text-xs font-mono font-medium text-[#8a726a] group-hover:text-[#c85a32]">
            <span>+ Claim Desk</span>
          </span>
        </div>
      </div>
    );
  }

  const isBreak = peer.status === 'break';

  return (
    <div
      className={cn(
        'group relative rounded-2xl border-2 transition-all duration-300 p-4 flex flex-col justify-between min-h-[190px] shadow-sm select-none',
        isSelf
          ? 'bg-[#ffffff] border-[#c85a32] shadow-md ring-2 ring-[#c85a32]/20'
          : isBreak
          ? 'bg-[#fef8f4] border-[#dec0b7] opacity-85'
          : 'bg-[#ffffff] border-[#dec0b7] hover:border-[#1d1b19]'
      )}
    >
      {/* Header Info */}
      <div className="flex items-center justify-between text-[11px] font-mono">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-[#1d1b19]">
            #{String(deskNumber).padStart(2, '0')}
          </span>
          {isSelf && (
            <span className="px-1.5 py-0.5 rounded bg-[#c85a32] text-white text-[9px] font-bold">
              YOU
            </span>
          )}
        </div>

        {/* Status Pill */}
        <div className="flex items-center gap-1">
          <span
            className={cn(
              'w-2 h-2 rounded-full',
              isBreak ? 'bg-amber-400' : 'bg-emerald-500 animate-pulse'
            )}
          />
          <span
            className={cn(
              'text-[10px] uppercase tracking-wider font-semibold',
              isBreak ? 'text-amber-600' : 'text-emerald-700'
            )}
          >
            {isBreak ? 'Taking Break' : 'Deep Focus'}
          </span>
        </div>
      </div>

      {/* Center Character/Avatar & Mascot Desk Presentation */}
      <div className="my-2 relative flex flex-col items-center justify-center">
        {/* Top-Down Architectural Vector of Occupied Desk */}
        <div className="w-20 h-20 relative flex items-center justify-center">
          <svg viewBox="0 0 100 100" width="76" height="76" fill="none" stroke="#1d1b19" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {/* Desk Surface */}
            <rect x="15" y="20" width="70" height="40" rx="4" fill="#f8f2ef" />
            {/* Open Book with Real Pages */}
            <rect x="34" y="26" width="32" height="24" rx="2" fill="#ffffff" />
            <line x1="50" y1="26" x2="50" y2="50" stroke="#c85a32" />
            <line x1="38" y1="32" x2="46" y2="32" stroke="#8a726a" strokeWidth="1.5" />
            <line x1="38" y1="38" x2="46" y2="38" stroke="#8a726a" strokeWidth="1.5" />
            <line x1="54" y1="32" x2="62" y2="32" stroke="#8a726a" strokeWidth="1.5" />
            <line x1="54" y1="38" x2="62" y2="38" stroke="#8a726a" strokeWidth="1.5" />
            {/* Scholar Head / Cap */}
            <circle cx="50" cy="72" r="12" fill={isSelf ? '#fef3c7' : '#ffffff'} stroke="#1d1b19" />
            {/* Study Lamp Head */}
            <circle cx="24" cy="28" r="4" fill="#fcd34d" stroke="#1d1b19" />
            <line x1="24" y1="32" x2="24" y2="38" />
            {/* Scholar Arms on Table */}
            <path d="M 40 68 Q 36 50 42 46" />
            <path d="M 60 68 Q 64 50 58 46" />
          </svg>
        </div>

        {/* Scholar Identity Tag */}
        <div className="text-center mt-1">
          <p className="text-xs font-bold text-[#1d1b19] line-clamp-1">
            {peer.name}
          </p>
          <p className="text-[10px] font-mono text-[#8a726a] line-clamp-1">
            {peer.school || peer.district || 'A/L Scholar'}
          </p>
        </div>

        {/* Desk Lamp Ambient Spot Glow */}
        {!isBreak && (
          <div className="absolute top-2 right-2 w-10 h-10 bg-[radial-gradient(circle,rgba(252,211,77,0.25)_0%,transparent_70%)] rounded-full pointer-events-none" />
        )}
      </div>

      {/* Footer Details */}
      <div className="pt-2 border-t border-[#f3ede9] flex items-center justify-between text-[11px]">
        <div className="min-w-0 pr-2">
          <p className="font-medium text-[#c85a32] truncate">{peer.activeSubject}</p>
          <p className="text-[10px] text-[#57423b] truncate">{peer.currentTopic}</p>
        </div>

        <div className="flex items-center gap-1 font-mono font-bold text-xs text-[#1d1b19] shrink-0">
          <Clock className="w-3.5 h-3.5 text-[#8a726a]" />
          <span>{formatTimer(peer.elapsedSeconds)}</span>
        </div>
      </div>
    </div>
  );
};

export const FocusTownDesk = React.memo(FocusTownDeskComponent);
export default FocusTownDesk;
