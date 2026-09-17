'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  roomPresenceManager,
  PRESET_ROOMS,
  FocusRoom,
  RoomPeer,
  CheerType,
  FocusModeType,
  PeerStatus,
} from '@/lib/rooms/roomPresence';
import { FocusTownCanvas } from '@/components/rooms/FocusTownCanvas';
import { RoomControlsDrawer } from '@/components/rooms/RoomControlsDrawer';
import { JoinRoomModal, JoinRoomFormValues } from '@/components/rooms/JoinRoomModal';
import { toast } from 'sonner';
import { BookOpen, Sparkles, Coffee, Flame, Shield, ArrowRight, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { fireConfetti } from '@/lib/confetti';
import { localDb } from '@/lib/storage/localDb';
import {
  startAmbientSound,
  stopAmbientSound,
  getCurrentAmbientType,
  isAmbientPlaying,
} from '@/lib/audio';
import { CloudRain, Volume2, VolumeX } from 'lucide-react';

export default function StudyRoomsPage() {
  const { user, member } = useAuth();

  const [activeRoomId, setActiveRoomId] = useState<string>('colombo-library');
  const [peers, setPeers] = useState<RoomPeer[]>([]);
  const [activeSubject, setActiveSubject] = useState<string>('Combined Maths');
  const [activeTopic, setActiveTopic] = useState<string>('Integration by Parts & Past Paper 2021');
  const [activeSeconds, setActiveSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [focusMode, setFocusMode] = useState<FocusModeType>('pomodoro_25');
  const [joinModalOpen, setJoinModalOpen] = useState<boolean>(false);
  const [selectedDeskForModal, setSelectedDeskForModal] = useState<number>(1);
  const [hasClaimedDesk, setHasClaimedDesk] = useState<boolean>(false);
  const [showCommunityPeers, setShowCommunityPeers] = useState<boolean>(false);
  const [isOnBreak, setIsOnBreak] = useState<boolean>(false);
  const [ambientType, setAmbientType] = useState<'colombo_rain' | 'library_silence' | null>(null);

  const currentRoom = PRESET_ROOMS.find((r) => r.id === activeRoomId) || PRESET_ROOMS[0];

  // Read URL query parameters (?room=...&desk=...) on initial load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search);
      const roomParam = sp.get('room');
      const deskParam = sp.get('desk');
      const subjectParam = sp.get('subject');

      if (roomParam && PRESET_ROOMS.some((r) => r.id === roomParam)) {
        setActiveRoomId(roomParam);
      }
      if (deskParam) {
        const deskNum = parseInt(deskParam, 10);
        if (deskNum >= 1 && deskNum <= 12) {
          setSelectedDeskForModal(deskNum);
          setJoinModalOpen(true);
        }
      }
      if (subjectParam) {
        setActiveSubject(subjectParam);
      }
    }
  }, []);

  // Initialize room membership
  useEffect(() => {
    setPeers(roomPresenceManager.getPeers());

    const handlePeersUpdate = (e: any) => {
      setPeers([...e.detail]);
    };

    window.addEventListener('studysync_room_peers_updated', handlePeersUpdate);

    return () => {
      window.removeEventListener('studysync_room_peers_updated', handlePeersUpdate);
    };
  }, [activeRoomId]);

  const timerIntervalRef = React.useRef<any>(null);

  // Local student timer tick with persistent background reference to kill CPU lag
  useEffect(() => {
    if (isTimerRunning && hasClaimedDesk) {
      if (!timerIntervalRef.current) {
        timerIntervalRef.current = setInterval(() => {
          setActiveSeconds((prev) => prev + 1);
        }, 1000);
      }
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [isTimerRunning, hasClaimedDesk]);

  // Handle room change
  const handleSwitchRoom = (roomId: string) => {
    setActiveRoomId(roomId);
    roomPresenceManager.leaveRoom();
    setHasClaimedDesk(false);
    setIsTimerRunning(false);
    toast.info(`Switched to ${PRESET_ROOMS.find((r) => r.id === roomId)?.name}`);
  };

  const handleToggleTimer = () => {
    if (!hasClaimedDesk) {
      setJoinModalOpen(true);
      toast.info('Claim a desk to start your focus session.');
      return;
    }
    const nextRunning = !isTimerRunning;
    setIsTimerRunning(nextRunning);
    const newStatus: PeerStatus = nextRunning ? 'focus' : 'break';
    roomPresenceManager.updateSelfStatus(newStatus, activeSubject, activeTopic);
  };

  const handleResetTimer = () => {
    setActiveSeconds(0);
    roomPresenceManager.resetSelfTimer();
    toast.info('Study timer reset');
  };

  const handleSubjectChange = (sub: string) => {
    setActiveSubject(sub);
    roomPresenceManager.updateSelfStatus(isTimerRunning ? 'focus' : 'break', sub, activeTopic);
  };

  const handleTopicChange = (top: string) => {
    setActiveTopic(top);
    roomPresenceManager.updateSelfStatus(isTimerRunning ? 'focus' : 'break', activeSubject, top);
  };

  const handleCheerPeer = (toStudyId: string, type: CheerType, message: string) => {
    roomPresenceManager.sendCheer(toStudyId, type, message);
    toast.success('Silent focus cheer sent!');
  };

  const handleToggleBreak = () => {
    const nextBreak = !isOnBreak;
    setIsOnBreak(nextBreak);
    if (nextBreak) {
      setIsTimerRunning(false);
      roomPresenceManager.updateSelfStatus('break', activeSubject, `${activeTopic} (5-Min Break)`);
      toast.info('Taking a 5-min tea break. Your desk remains reserved!');
    } else {
      setIsTimerRunning(true);
      roomPresenceManager.updateSelfStatus('focus', activeSubject, activeTopic);
      toast.success('Resumed focus session!');
    }
  };

  const handleLeaveDesk = () => {
    const minsLogged = Math.round(activeSeconds / 60);
    if (minsLogged >= 1) {
      const todayStr = new Date().toISOString().split('T')[0];
      const hrs = +(minsLogged / 60).toFixed(2);
      localDb.saveDailyLog({
        logId: `LOG-ROOM-${Date.now()}`,
        studyId: member?.studyId || 'STUDENT',
        fullName: member?.fullName || user?.displayName || 'Student',
        email: member?.email || user?.email || '',
        stream: member?.stream || 'Physical Science',
        dateOfStudy: todayStr,
        date: todayStr,
        Date: todayStr,
        totalHours: hrs,
        hoursSubject1: activeSubject.includes('Math') || activeSubject.includes('Bio') ? hrs : 0,
        hoursSubject2: activeSubject.includes('Phys') ? hrs : 0,
        hoursSubject3: activeSubject.includes('Chem') ? hrs : 0,
        notes: `Focus Town (${currentRoom.name}): ${activeTopic}`,
        timestamp: new Date().toISOString(),
        focusScore: 9,
        productivityScore: 9,
      });
      toast.success(`Session ended. ${minsLogged} focus minutes recorded to your study ledger!`);
    } else {
      toast.info('Desk released.');
    }
    roomPresenceManager.leaveRoom();
    setHasClaimedDesk(false);
    setIsTimerRunning(false);
    setIsOnBreak(false);
    setActiveSeconds(0);
  };

  const handleToggleAmbient = (type: 'colombo_rain' | 'library_silence') => {
    if (ambientType === type) {
      stopAmbientSound();
      setAmbientType(null);
      toast.info('Ambient audio stopped');
    } else {
      startAmbientSound(type, 0.25);
      setAmbientType(type);
      toast.success(type === 'colombo_rain' ? 'Colombo Rain playing' : 'Quiet Study Hall playing');
    }
  };

  const handleOpenClaimModal = (deskNumber?: number) => {
    if (deskNumber) {
      setSelectedDeskForModal(deskNumber);
    }
    setJoinModalOpen(true);
  };

  const handleJoinDesk = (values: JoinRoomFormValues) => {
    setActiveSubject(values.subject);
    setActiveTopic(values.goal);
    setFocusMode(values.focusMode);
    setIsTimerRunning(true);
    setHasClaimedDesk(true);

    roomPresenceManager.claimDesk(activeRoomId, {
      deskNumber: values.deskNumber,
      studyId: values.studyId,
      name: values.name,
      school: member?.school || 'Colombo Examination Center',
      district: member?.district || currentRoom.district,
      stream: values.stream,
      subject: values.subject,
      topic: values.goal,
      streak: member?.streakCount || 5,
      companion: values.companion,
    });

    fireConfetti({ style: 'dual_cannon', particleCount: 75 });
    toast.success(`Desk #${values.deskNumber} claimed! Focus timer initialized.`);
  };

  const handleToggleCommunityPeers = () => {
    const next = !showCommunityPeers;
    setShowCommunityPeers(next);
    roomPresenceManager.setSimulatedPeersEnabled(next);
    toast.info(next ? 'Community study circle enabled.' : 'Showing live desks only.');
  };

  const occupiedDesks = React.useMemo(() => (
    peers
      .filter((p) => typeof p.deskNumber === 'number')
      .map((p) => ({ deskNumber: p.deskNumber!, peerName: p.name }))
  ), [peers]);

  const modalInitialValues = React.useMemo(() => ({
    name: member?.fullName || user?.displayName || 'A/L Candidate',
    studyId: member?.studyId || 'AL-2026',
    stream: member?.stream || 'Physical Science',
    subject: activeSubject,
    goal: activeTopic,
    focusMode,
  }), [member?.fullName, member?.studyId, member?.stream, user?.displayName, activeSubject, activeTopic, focusMode]);

  return (
    <div className="w-full flex-1 py-6 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Top Banner: StudySync Focus Town */}
      <div className="relative overflow-hidden bg-white border border-[#e7e1de] rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-[#ffdcbc] text-[#854f00] font-mono text-[11px] font-bold uppercase tracking-wider">
                LIVE CO-STUDY TOWN
              </span>
              <span className="flex items-center gap-1 text-xs font-mono text-[#456644] font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#456644] animate-pulse" />
                Live Sync Active
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-4xl font-bold text-[#1d1b19] tracking-tight">
              Focus Town
            </h1>
            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => handleOpenClaimModal()}
                className="px-4 py-2 rounded-full bg-[#c85a32] hover:bg-[#b04b25] active:scale-95 text-white font-sans text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>{hasClaimedDesk ? 'Change Station' : 'Claim Station'}</span>
              </button>
              <Link
                href="/daily"
                className="px-4 py-2 rounded-full bg-white hover:bg-[#f8f2ef] active:scale-95 text-[#1d1b19] border border-[#e7e1de] font-sans text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <span>Study Ledger</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Hero Panoramic Monoline Vector Art */}
          <div className="w-full lg:w-[460px] aspect-[16/9] sm:aspect-[16/10] sm:h-56 rounded-2xl overflow-hidden border border-[#e7e1de] bg-[#fef8f4] shrink-0 shadow-xs flex items-center justify-center">
            <img
              src="/images/rooms/focus_town_hero.jpg"
              alt="Focus Town study hall"
              className="w-full h-full object-contain sm:object-cover"
            />
          </div>
        </div>
      </div>

      {/* Room Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {PRESET_ROOMS.map((room) => {
          const isActive = room.id === activeRoomId;
          return (
            <button
              key={room.id}
              onClick={() => handleSwitchRoom(room.id)}
              className={`px-4 py-2.5 rounded-2xl border text-xs font-sans font-medium transition-all shrink-0 cursor-pointer flex items-center gap-2 active:scale-95 ${
                isActive
                  ? 'bg-[#19202e] text-white border-[#19202e] shadow-xs'
                  : 'bg-white text-[#2d2420] hover:text-[#1d1b19] border-[#e7e1de] hover:border-[#19202e]'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isActive ? 'bg-[#fcd34d]' : 'bg-[#c85a32]'
                }`}
              />
              <span className="font-bold">{room.name}</span>
              <span className="font-mono text-[10px] opacity-70">({room.district})</span>
            </button>
          );
        })}
      </div>

      {/* Ambient Audio & Atmosphere Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl bg-white border border-[#e7e1de] shadow-xs">
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-[#c85a32]" />
          <span className="text-xs font-semibold text-[#19202e]">Library Atmosphere</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleToggleAmbient('colombo_rain')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 active:scale-95 ${
              ambientType === 'colombo_rain'
                ? 'bg-[#19202e] text-[#fcd34d] shadow-xs'
                : 'bg-[#f8f2ef] hover:bg-[#ede7e3] text-[#19202e]'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5" />
            <span>Colombo Rain</span>
          </button>
          <button
            type="button"
            onClick={() => handleToggleAmbient('library_silence')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 active:scale-95 ${
              ambientType === 'library_silence'
                ? 'bg-[#19202e] text-[#fcd34d] shadow-xs'
                : 'bg-[#f8f2ef] hover:bg-[#ede7e3] text-[#19202e]'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Silent Study Hall</span>
          </button>
          {ambientType && (
            <button
              type="button"
              onClick={() => {
                stopAmbientSound();
                setAmbientType(null);
                toast.info('Audio stopped');
              }}
              className="p-1.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors active:scale-95"
              title="Mute Ambient Sound"
            >
              <VolumeX className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Focus Town Canvas */}
      <FocusTownCanvas
        roomId={activeRoomId}
        roomName={currentRoom.name}
        roomDistrict={currentRoom.district}
        peers={peers}
        hasClaimedDesk={hasClaimedDesk}
        onClaimDesk={handleOpenClaimModal}
        onLeaveDesk={handleLeaveDesk}
        onToggleBreak={handleToggleBreak}
        isOnBreak={isOnBreak}
        onCheerPeer={handleCheerPeer}
        showCommunityPeers={showCommunityPeers}
        onToggleCommunityPeers={handleToggleCommunityPeers}
      />

      {/* Student Study Cockpit Drawer */}
      <RoomControlsDrawer
        currentSubject={activeSubject}
        onSubjectChange={handleSubjectChange}
        currentTopic={activeTopic}
        onTopicChange={handleTopicChange}
        activeSeconds={activeSeconds}
        isRunning={isTimerRunning}
        onToggleTimer={handleToggleTimer}
        onResetTimer={handleResetTimer}
        focusMode={focusMode}
        onFocusModeChange={setFocusMode}
      />

      {/* Claim Desk Modal */}
      <JoinRoomModal
        open={joinModalOpen}
        onOpenChange={setJoinModalOpen}
        defaultDesk={selectedDeskForModal}
        occupiedDesks={occupiedDesks}
        initialValues={modalInitialValues}
        onJoin={handleJoinDesk}
      />

      {/* Persistent Sticky Action Bar for Claimed Desk (Leave / Break) */}
      {hasClaimedDesk && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-2xl bg-[#19202e] text-white p-3.5 sm:p-4 rounded-2xl shadow-2xl border border-white/10 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 animate-in slide-in-from-bottom-6 duration-300">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isOnBreak ? 'bg-[#fcd34d] animate-ping' : 'bg-[#456644] animate-pulse'}`} />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-[#fcd34d]">
                  {Math.floor(activeSeconds / 60)}m {activeSeconds % 60}s
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 font-mono text-white/80">
                  {isOnBreak ? 'On 5-Min Break' : 'Focus Mode'}
                </span>
              </div>
              <p className="text-[11px] text-white/60 truncate max-w-[180px] sm:max-w-xs">
                {activeSubject} &middot; {activeTopic}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleToggleBreak}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isOnBreak
                  ? 'bg-[#fcd34d] text-[#19202e] shadow-xs'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Coffee className="w-3.5 h-3.5" />
              <span>{isOnBreak ? 'Resume Studying' : 'Take 5m Break'}</span>
            </button>

            <button
              type="button"
              onClick={handleLeaveDesk}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#fa7268] hover:bg-[#e05b51] text-white transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>Leave Desk & Save</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
