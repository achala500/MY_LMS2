'use client';

import React, { useState, useEffect } from 'react';
import { FocusTownDesk } from './FocusTownDesk';
import { RoomPeer, RoomCheer, CheerType } from '@/lib/rooms/roomPresence';
import { Sparkles, Users, Flame, Coffee, Heart, Share2, Check, GraduationCap, LogOut, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { buildRoomInviteUrl } from '@/lib/urls';

interface FocusTownCanvasProps {
  roomId?: string;
  roomName: string;
  roomDistrict: string;
  peers: RoomPeer[];
  hasClaimedDesk?: boolean;
  onClaimDesk: (deskNumber?: number) => void;
  onLeaveDesk?: () => void;
  onToggleBreak?: () => void;
  isOnBreak?: boolean;
  onCheerPeer: (toStudyId: string, type: CheerType, message: string) => void;
  showCommunityPeers?: boolean;
  onToggleCommunityPeers?: () => void;
}

interface FloatingCheerParticle {
  id: string;
  from: string;
  type: CheerType;
  message: string;
  x: number;
}

export const FocusTownCanvas: React.FC<FocusTownCanvasProps> = ({
  roomId = 'colombo-library',
  roomName,
  roomDistrict,
  peers,
  hasClaimedDesk,
  onClaimDesk,
  onLeaveDesk,
  onToggleBreak,
  isOnBreak,
  onCheerPeer,
}) => {
  const [particles, setParticles] = useState<FloatingCheerParticle[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const handleCheer = (e: any) => {
      const cheer = e.detail as RoomCheer;
      if (cheer) {
        const newParticle: FloatingCheerParticle = {
          id: cheer.id,
          from: cheer.fromName,
          type: cheer.type,
          message: cheer.message,
          x: Math.floor(Math.random() * 70) + 15,
        };
        setParticles((prev) => [...prev.slice(-6), newParticle]);
        setTimeout(() => {
          setParticles((prev) => prev.filter((p) => p.id !== newParticle.id));
        }, 3000);
      }
    };

    window.addEventListener('studysync_room_cheer_received', handleCheer);
    return () => window.removeEventListener('studysync_room_cheer_received', handleCheer);
  }, []);

  const handleCopyInvite = () => {
    if (typeof window !== 'undefined') {
      const canonicalUrl = buildRoomInviteUrl({
        roomId,
        hubName: roomDistrict,
      });
      navigator.clipboard.writeText(canonicalUrl);
      setCopiedLink(true);
      toast.success('Room link copied');
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const activeFocusCount = React.useMemo(() => (
    peers.filter((p) => p.status === 'focus' || p.status === 'deep_work').length
  ), [peers]);

  const deskSlots = React.useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const deskNum = i + 1;
      const peerAtDesk = peers.find((p) => p.deskNumber === deskNum);
      return { deskNum, peer: peerAtDesk };
    });
  }, [peers]);

  return (
    <div className="relative rounded-3xl bg-[#fef8f4] border border-[#e7e1de] p-5 sm:p-7 shadow-xs overflow-hidden">
      {/* Floating Vector Cheer Particles Overlay - Zero Emojis */}
      <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
        {particles.map((p) => (
          <div
            key={p.id}
            style={{ left: `${p.x}%` }}
            className="absolute bottom-10 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#c85a32] shadow-md animate-in fade-in slide-in-from-bottom-8 duration-700 text-xs font-serif font-semibold text-[#1d1b19]"
          >
            {p.type === 'tea' && <Coffee className="w-3.5 h-3.5 text-[#854f00]" />}
            {p.type === 'star' && <Sparkles className="w-3.5 h-3.5 text-[#c85a32]" />}
            {p.type === 'fire' && <Flame className="w-3.5 h-3.5 text-[#c85a32]" />}
            {p.type === 'clap' && <Heart className="w-3.5 h-3.5 text-[#456644]" />}
            <span>{p.message}</span>
          </div>
        ))}
      </div>

      {/* Room Header - De-slopped Minimalist */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#e7e1de]">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1d1b19]">{roomName}</h2>
          <span className="px-2.5 py-0.5 rounded-full bg-[#f3ede9] text-[#2d2420] font-mono text-xs border border-[#e7e1de]">
            {roomDistrict}
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#c6edc1] text-[#022106] font-mono text-[11px] font-bold border border-[#456644]/40">
            <span className="w-1.5 h-1.5 rounded-full bg-[#456644] animate-pulse" />
            Live
          </span>
        </div>

        {/* Live Controls */}
        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          {hasClaimedDesk && (
            <>
              {/* 5-Min Tea Break Toggle */}
              <button
                type="button"
                onClick={onToggleBreak}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-[#f8f2ef] border border-[#e7e1de] text-xs font-medium text-[#1d1b19] transition-all active:scale-95 shadow-xs"
              >
                <Coffee className="w-3.5 h-3.5 text-[#854f00]" />
                <span>{isOnBreak ? 'Resume Focus' : '5-Min Tea Break'}</span>
              </button>

              {/* Persistent Sticky Leave Desk Button */}
              <button
                type="button"
                onClick={onLeaveDesk}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ba1a1a]/10 hover:bg-[#ba1a1a]/20 border border-[#ba1a1a]/30 text-xs font-semibold text-[#ba1a1a] transition-all active:scale-95 shadow-xs"
              >
                <LogOut className="w-3.5 h-3.5 text-[#ba1a1a]" />
                <span>Leave Desk</span>
              </button>
            </>
          )}

          {!hasClaimedDesk && (
            <button
              type="button"
              onClick={() => onClaimDesk()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#c85a32] hover:bg-[#b04b25] active:scale-95 text-white font-semibold text-xs transition-all shadow-xs"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Claim Station</span>
            </button>
          )}

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#e7e1de] font-mono text-xs shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#456644] animate-ping" />
            <span>{activeFocusCount} Seated</span>
          </div>

          <button
            type="button"
            onClick={handleCopyInvite}
            className="p-2 rounded-full bg-white hover:bg-[#f8f2ef] border border-[#e7e1de] text-[#57423b] transition-colors active:scale-95"
            title="Share Room"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-[#456644]" /> : <Share2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Top-Down Architectural Monolinear Desks Floor Plan Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 mt-6">
        {deskSlots.map(({ deskNum, peer }) => (
          <FocusTownDesk
            key={deskNum}
            deskNumber={deskNum}
            peer={peer}
            onClaim={onClaimDesk}
            onCheer={onCheerPeer}
            isSelf={peer?.isSelf}
          />
        ))}
      </div>
    </div>
  );
};

export default FocusTownCanvas;
