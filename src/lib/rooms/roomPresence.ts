/**
 * StudySync Focus Town â€” Real-Time Collaborative Room & Presence Engine
 * Free Firebase Hostable with BroadcastChannel Cross-Tab Synchronization and Realistic Peer Simulation.
 */

export type FocusModeType = 'pomodoro_25' | 'deep_50' | 'exam_180' | 'stopwatch';
export type PeerStatus = 'focus' | 'break' | 'review' | 'deep_work';
export type CheerType = 'tea' | 'star' | 'clap' | 'lamp' | 'fire';

export interface RoomPeer {
  id: string;
  studyId: string;
  name: string;
  school: string;
  district: string;
  stream: string;
  activeSubject: string;
  currentTopic: string;
  status: PeerStatus;
  elapsedSeconds: number;
  streak: number;
  joinedAt: number;
  lastHeartbeat: number;
  avatarSeed: number;
  isSelf?: boolean;
  deskNumber?: number;
  companion?: 'owl' | 'cat' | 'tea' | 'succulent';
}

export interface RoomCheer {
  id: string;
  fromName: string;
  toStudyId: string;
  type: CheerType;
  message: string;
  timestamp: number;
}

export interface FocusRoom {
  id: string;
  name: string;
  category: 'library' | 'night' | 'exam' | 'circle';
  tagline: string;
  district: string;
  capacity: number;
  featuredSubject: string;
}

export const PRESET_ROOMS: FocusRoom[] = [
  {
    id: 'colombo-library',
    name: 'Colombo Central Library Hall',
    category: 'library',
    tagline: 'Quiet scholarly environment for structured daily goals and derivations.',
    district: 'Colombo',
    capacity: 12,
    featuredSubject: 'Combined Mathematics',
  },
  {
    id: 'kandy-night-cram',
    name: 'Hill Country Night Cram Desk',
    category: 'night',
    tagline: 'Soft lamplight and quiet study rhythms for late evening past paper prep.',
    district: 'Kandy',
    capacity: 12,
    featuredSubject: 'Physics',
  },
  {
    id: 'galle-paper-arena',
    name: 'Galle Fort Past Paper Arena',
    category: 'exam',
    tagline: 'Timed 3-hour exam simulation under official time pressure and strict pacing.',
    district: 'Galle',
    capacity: 12,
    featuredSubject: 'Biology',
  },
  {
    id: 'jaffna-maths-circle',
    name: 'Jaffna Pure Calculus Circle',
    category: 'circle',
    tagline: 'Pure mathematics, trigonometry, and coordinate geometry deep-work floor.',
    district: 'Jaffna',
    capacity: 12,
    featuredSubject: 'Chemistry',
  },
];

// Optional simulated real-world A/L study peers (off by default)
const SIMULATED_PEERS: Omit<RoomPeer, 'id' | 'lastHeartbeat' | 'joinedAt'>[] = [
  {
    studyId: 'SG-BIO-0042',
    name: 'Senuri Madushani',
    school: 'Devi Balika Vidyalaya',
    district: 'Colombo',
    stream: 'Biological Science',
    activeSubject: 'Biology',
    currentTopic: 'Cellular Respiration & Krebs Cycle',
    status: 'focus',
    elapsedSeconds: 1420,
    streak: 18,
    avatarSeed: 1,
    deskNumber: 2,
    companion: 'succulent',
  },
  {
    studyId: 'SG-MATH-0019',
    name: 'Kavindu Perera',
    school: 'Ananda College',
    district: 'Colombo',
    stream: 'Physical Science',
    activeSubject: 'Combined Maths',
    currentTopic: 'Integration by Substitution & Parts',
    status: 'deep_work',
    elapsedSeconds: 2890,
    streak: 34,
    avatarSeed: 2,
    deskNumber: 4,
    companion: 'owl',
  },
  {
    studyId: 'SG-MATH-0081',
    name: 'Dinuka Kulatunga',
    school: 'Royal College',
    district: 'Colombo',
    stream: 'Physical Science',
    activeSubject: 'Physics',
    currentTopic: 'Rotational Dynamics & Moment of Inertia',
    status: 'focus',
    elapsedSeconds: 980,
    streak: 12,
    avatarSeed: 3,
    deskNumber: 7,
    companion: 'tea',
  },
];

class RoomPresenceManager {
  private currentRoomId: string = 'colombo-library';
  private peers: Map<string, RoomPeer> = new Map();
  private simulatedPeers: Map<string, RoomPeer> = new Map();
  private selfPeer: RoomPeer | null = null;
  private channel: BroadcastChannel | null = null;
  private heartbeatTimer: any = null;
  private tickTimer: any = null;
  private cheers: RoomCheer[] = [];
  public simulatedPeersEnabled: boolean = false; // Zero fake info by default

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        this.channel = new BroadcastChannel('studysync_focus_town_mesh');
        this.channel.onmessage = (event) => this.handleBroadcastMessage(event.data);
      } catch (e) {
        // BroadcastChannel fallback
      }
      this.initSimulatedPeers();
      this.startLocalClock();
    }
  }

  private initSimulatedPeers() {
    const now = Date.now();
    SIMULATED_PEERS.forEach((sp, idx) => {
      const id = `peer-sim-${idx}`;
      this.simulatedPeers.set(id, {
        ...sp,
        id,
        joinedAt: now - sp.elapsedSeconds * 1000,
        lastHeartbeat: now,
      });
    });
  }

  public setSimulatedPeersEnabled(enabled: boolean) {
    this.simulatedPeersEnabled = enabled;
    this.dispatchPeersUpdated();
  }

  private startLocalClock() {
    if (this.tickTimer) clearInterval(this.tickTimer);
    this.tickTimer = setInterval(() => {
      // If tab is in background, pause to preserve memory
      if (typeof document !== 'undefined' && document.hidden) return;

      // Only tick and dispatch if the scholar has claimed a desk or community mode is active
      if (!this.selfPeer && !this.simulatedPeersEnabled) return;

      // Advance timers for all peers
      this.peers.forEach((peer) => {
        if (peer.status !== 'break') {
          peer.elapsedSeconds += 1;
        }
      });
      if (this.simulatedPeersEnabled) {
        this.simulatedPeers.forEach((peer) => {
          if (peer.status !== 'break') {
            peer.elapsedSeconds += 1;
          }
        });
      }
      if (this.selfPeer && this.selfPeer.status !== 'break') {
        this.selfPeer.elapsedSeconds += 1;
      }
      this.dispatchPeersUpdated();
    }, 1000);
  }

  public claimDesk(
    roomId: string,
    studentData: {
      deskNumber: number;
      studyId: string;
      name: string;
      school?: string;
      district?: string;
      stream?: string;
      subject?: string;
      topic?: string;
      streak?: number;
      companion?: 'owl' | 'cat' | 'tea' | 'succulent';
    }
  ) {
    this.currentRoomId = roomId;
    const now = Date.now();

    this.selfPeer = {
      id: `peer-${studentData.studyId || 'guest'}`,
      studyId: studentData.studyId || 'SG-SCHOLAR',
      name: studentData.name || 'A/L Candidate',
      school: studentData.school || 'Colombo Academic Center',
      district: studentData.district || 'Colombo',
      stream: studentData.stream || 'Physical Science',
      activeSubject: studentData.subject || 'Combined Maths',
      currentTopic: studentData.topic || 'Deep Focus Revision',
      status: 'focus',
      elapsedSeconds: 0,
      streak: studentData.streak || 1,
      joinedAt: now,
      lastHeartbeat: now,
      avatarSeed: Math.floor(Math.random() * 8) + 1,
      isSelf: true,
      deskNumber: studentData.deskNumber,
      companion: studentData.companion || 'owl',
    };

    this.peers.set(this.selfPeer.id, this.selfPeer);
    this.broadcastState('peer_joined', this.selfPeer);
    this.dispatchPeersUpdated();

    // Start heartbeat
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = setInterval(() => {
      if (this.selfPeer) {
        this.selfPeer.lastHeartbeat = Date.now();
        this.broadcastState('peer_heartbeat', this.selfPeer);
      }
    }, 15000);
  }

  public updateSelfStatus(status: PeerStatus, subject?: string, topic?: string) {
    if (!this.selfPeer) return;
    this.selfPeer.status = status;
    if (subject) this.selfPeer.activeSubject = subject;
    if (topic !== undefined) this.selfPeer.currentTopic = topic;
    this.selfPeer.lastHeartbeat = Date.now();

    this.peers.set(this.selfPeer.id, this.selfPeer);
    this.broadcastState('peer_updated', this.selfPeer);
    this.dispatchPeersUpdated();
  }

  public resetSelfTimer() {
    if (!this.selfPeer) return;
    this.selfPeer.elapsedSeconds = 0;
    this.selfPeer.lastHeartbeat = Date.now();
    this.peers.set(this.selfPeer.id, this.selfPeer);
    this.dispatchPeersUpdated();
  }

  public sendCheer(toStudyId: string, type: CheerType, message: string) {
    const cheer: RoomCheer = {
      id: `cheer-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      fromName: this.selfPeer?.name || 'Fellow Scholar',
      toStudyId,
      type,
      message,
      timestamp: Date.now(),
    };
    this.cheers.push(cheer);
    if (this.cheers.length > 20) this.cheers = this.cheers.slice(-20);
    this.broadcastState('cheer_sent', cheer);
    this.dispatchCheerReceived(cheer);
  }

  public getPeers(): RoomPeer[] {
    const real = Array.from(this.peers.values());
    if (this.simulatedPeersEnabled) {
      return [...real, ...Array.from(this.simulatedPeers.values())];
    }
    return real;
  }

  public getSelfPeer(): RoomPeer | null {
    return this.selfPeer;
  }

  public getCurrentRoomId(): string {
    return this.currentRoomId;
  }

  public leaveRoom() {
    if (this.selfPeer) {
      this.broadcastState('peer_left', { id: this.selfPeer.id });
      this.peers.delete(this.selfPeer.id);
      this.selfPeer = null;
    }
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    this.dispatchPeersUpdated();
  }

  private broadcastState(action: string, payload: any) {
    if (this.channel) {
      try {
        this.channel.postMessage({
          roomId: this.currentRoomId,
          action,
          payload,
          timestamp: Date.now(),
        });
      } catch (e) {}
    }
  }

  private handleBroadcastMessage(data: any) {
    if (!data || data.roomId !== this.currentRoomId) return;

    if (data.action === 'peer_joined' || data.action === 'peer_updated' || data.action === 'peer_heartbeat') {
      const peer = data.payload as RoomPeer;
      if (peer && peer.id !== this.selfPeer?.id) {
        this.peers.set(peer.id, { ...peer, isSelf: false });
        this.dispatchPeersUpdated();
      }
    } else if (data.action === 'peer_left') {
      if (data.payload?.id) {
        this.peers.delete(data.payload.id);
        this.dispatchPeersUpdated();
      }
    } else if (data.action === 'cheer_sent') {
      const cheer = data.payload as RoomCheer;
      if (cheer) {
        this.cheers.push(cheer);
        if (this.cheers.length > 20) this.cheers = this.cheers.slice(-20);
        this.dispatchCheerReceived(cheer);
      }
    }
  }

  private dispatchPeersUpdated() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('studysync_room_peers_updated', { detail: this.getPeers() }));
    }
  }

  private dispatchCheerReceived(cheer: RoomCheer) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('studysync_room_cheer_received', { detail: cheer }));
    }
  }
}

export const roomPresenceManager = new RoomPresenceManager();
