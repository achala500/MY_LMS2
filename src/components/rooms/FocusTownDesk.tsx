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

export const FocusTownDesk: React.FC<FocusTownDeskProps> = ({
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
            {/* Desk Lamp Base */}
            <circle cx="25" cy="30" r="3" />
          </svg>
        </div>

        <button
          type="button"
          className="w-full py-1.5 rounded-full bg-white group-hover:bg-[#c85a32] group-hover:text-white border border-[#dec0b7] group-hover:border-[#c85a32] text-[11px] font-medium text-[#57423b] transition-all shadow-xs"
        >
          Claim Station
        </button>
      </div>
    );
  }

  const isStudying = peer.status === 'focus' || peer.status === 'deep_work';
  const isBreak = peer.status === 'break';

  return (
    <div
      className={cn(
        'relative group rounded-2xl bg-white border transition-all duration-200 p-4 flex flex-col justify-between shadow-xs hover:shadow-md select-none',
        isSelf ? 'border-[#c85a32] ring-2 ring-[#c85a32]/20' : 'border-[#e7e1de] hover:border-[#8a726a]'
      )}
    >
      {/* Header Info */}
      <div className="flex items-center justify-between gap-1.5 pb-2 border-b border-[#f3ede9]">
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className={cn(
              'w-2 h-2 rounded-full shrink-0 animate-pulse',
              isStudying ? 'bg-[#456644]' : 'bg-[#fcd34d]'
            )}
          />
          <span className="font-serif font-bold text-xs text-[#1d1b19] truncate">{peer.name}</span>
          {isSelf && (
            <span className="px-1.5 py-0.5 rounded-full bg-[#ffdcbc] text-[#854f00] text-[9px] font-mono font-bold">
              YOU
            </span>
          )}
        </div>

        <span
          className={cn(
            'px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider border',
            isBreak
              ? 'bg-[#ffdcbc] text-[#854f00] border-[#854f00]/30'
              : 'bg-[#c6edc1] text-[#022106] border-[#456644]/40'
          )}
        >
          {isBreak ? 'Break' : 'Focus'}
        </span>
      </div>

      {/* Top-Down Architectural Monolinear Claimed Desk Vector with Custom Line-Art Avatar */}
      <div className="w-full aspect-[4/3] bg-[#fef8f4] rounded-xl my-2 flex items-center justify-center relative overflow-hidden border border-[#f3ede9]">
        <svg viewBox="0 0 120 90" width="100%" height="100%" fill="none" stroke="#1d1b19" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {/* Desk Surface */}
          <rect x="15" y="12" width="90" height="46" rx="4" fill="#ffffff" stroke="#1d1b19" />

          {/* Open Notebook & Derivation Lines */}
          <rect x="42" y="20" width="36" height="26" rx="2" fill="#f8f2ef" stroke="#1d1b19" strokeWidth="1.5" />
          <line x1="47" y1="26" x2="73" y2="26" stroke="#c85a32" strokeWidth="1.5" />
          <line x1="47" y1="31" x2="69" y2="31" stroke="#8a726a" strokeWidth="1" />
          <line x1="47" y1="36" x2="65" y2="36" stroke="#8a726a" strokeWidth="1" />

          {/* Top-Down Seated Student Avatar */}
          <circle cx="60" cy="74" r="11" fill="#fef8f4" stroke="#1d1b19" strokeWidth="2" />
          <path d="M42 86 C42 78 50 75 60 75 C70 75 78 78 78 86" fill="#fef8f4" stroke="#1d1b19" strokeWidth="2" />

          {/* Arms Reaching to Desk */}
          <path d="M44 80 Q40 50 48 40" stroke="#1d1b19" strokeWidth="2" />
          <path d="M76 80 Q80 50 72 40" stroke="#1d1b19" strokeWidth="2" />

          {/* Companion Vector Indicator (Focus Pulse, Flame Streak, or Tea Mug - Zero Emojis) */}
          {peer.companion === 'tea' || isBreak ? (
            <g transform="translate(86, 20)">
              {/* Monolinear Tea Mug */}
              <rect x="0" y="4" width="10" height="12" rx="2" stroke="#854f00" strokeWidth="1.5" />
              <path d="M10 7 C13 7 13 13 10 13" stroke="#854f00" strokeWidth="1.5" />
              <path d="M3 1 Q4 -2 5 1" stroke="#854f00" strokeWidth="1" />
            </g>
          ) : peer.companion === 'cat' ? (
            <g transform="translate(24, 20)">
              {/* Flame Streak Indicator */}
              <path d="M5 14 C2 10 3 6 6 3 C7 5 8 6 9 8 C10 6 12 7 11 11 C10 14 7 15 5 14 Z" stroke="#c85a32" strokeWidth="1.5" fill="none" />
            </g>
          ) : (
            <g transform="translate(24, 20)">
              {/* Focus Pulse Concentric Circles */}
              <circle cx="6" cy="8" r="3" stroke="#456644" strokeWidth="1.5" />
              <circle cx="6" cy="8" r="6" stroke="#456644" strokeWidth="1" strokeDasharray="2 2" />
            </g>
          )}
        </svg>

        {/* Ambient Subtle Lamp Glow */}
        {isStudying && (
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

export default FocusTownDesk;
