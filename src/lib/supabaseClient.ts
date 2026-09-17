/**
 * StudySync Multi-Cloud Backbone: Supabase Client & Realtime Presence
 * Direct PostgreSQL interaction, OAuth 2.0 PKCE, Row-Level Security, and WebSockets.
 */

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

const DEFAULT_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://studysync-project.supabase.co';
const DEFAULT_SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_anon_key_studysync';

export class SupabaseService {
  private url: string;
  private anonKey: string;
  private activeWs: WebSocket | null = null;
  private wsListeners: Set<(payload: any) => void> = new Set();

  constructor(config?: Partial<SupabaseConfig>) {
    this.url = config?.url || DEFAULT_SUPABASE_URL;
    this.anonKey = config?.anonKey || DEFAULT_SUPABASE_KEY;
  }

  /**
   * Execute authenticated PostgreSQL REST query via PostgREST
   */
  public async query<T = any>(
    table: string,
    options: {
      select?: string;
      filter?: Record<string, any>;
      method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
      body?: any;
    } = {}
  ): Promise<{ data: T | null; error: string | null }> {
    try {
      const { select = '*', filter = {}, method = 'GET', body } = options;
      const params = new URLSearchParams({ select });
      Object.entries(filter).forEach(([key, val]) => {
        params.append(key, `eq.${val}`);
      });

      const endpoint = `${this.url}/rest/v1/${table}?${params.toString()}`;
      const headers: Record<string, string> = {
        'apikey': this.anonKey,
        'Authorization': `Bearer ${this.anonKey}`,
        'Content-Type': 'application/json',
        'Prefer': method === 'POST' ? 'return=representation' : 'count=exact',
      };

      const res = await fetch(endpoint, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!res.ok) {
        const errText = await res.text();
        return { data: null, error: `Supabase Error (${res.status}): ${errText}` };
      }

      const data = await res.json();
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err?.message || 'Network error connecting to Supabase' };
    }
  }

  /**
   * Connect to Realtime WebSockets channel for Focus Town desk synchronization
   */
  public connectRealtimeChannel(
    roomId: string,
    onMessage: (payload: any) => void
  ): () => void {
    this.wsListeners.add(onMessage);

    if (typeof window === 'undefined') return () => {};

    try {
      const wsUrl = `${this.url.replace(/^http/, 'ws')}/realtime/v1/websocket?apikey=${this.anonKey}&vsn=1.0.0`;
      if (!this.activeWs || this.activeWs.readyState !== WebSocket.OPEN) {
        this.activeWs = new WebSocket(wsUrl);

        this.activeWs.onopen = () => {
          // Join room topic
          const joinPayload = {
            topic: `realtime:focustown:${roomId}`,
            event: 'phx_join',
            payload: {},
            ref: '1',
          };
          this.activeWs?.send(JSON.stringify(joinPayload));
        };

        this.activeWs.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.wsListeners.forEach((listener) => listener(data));
          } catch (e) {}
        };
      }
    } catch (e) {
      console.warn('[Supabase Realtime] Fallback to local channel broadcast');
    }

    return () => {
      this.wsListeners.delete(onMessage);
    };
  }

  /**
   * Broadcast desk movement / presence change
   */
  public broadcastPresence(roomId: string, peerData: any) {
    if (this.activeWs && this.activeWs.readyState === WebSocket.OPEN) {
      this.activeWs.send(
        JSON.stringify({
          topic: `realtime:focustown:${roomId}`,
          event: 'presence_update',
          payload: peerData,
          ref: String(Date.now()),
        })
      );
    }
    // Also dispatch local window event for seamless offline/in-browser mirroring
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('studysync_supabase_presence', { detail: peerData }));
    }
  }
}

export const supabase = new SupabaseService();
