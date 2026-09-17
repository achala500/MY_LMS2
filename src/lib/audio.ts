import { safeStorage } from './storage/safeStorage';

export function isSoundEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return safeStorage.getItem('studysync_sound_enabled') !== 'false';
}

export function setSoundEnabled(enabled: boolean): void {
  safeStorage.setItem('studysync_sound_enabled', enabled ? 'true' : 'false');
}

/**
 * Play an ascending harmonic chime chord (C5 - E5 - G5 - C6)
 */
export function playSuccessChime(): void {
  if (!isSoundEnabled() || typeof window === 'undefined') return;

  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // Frequencies: C5, E5, G5, C6
    const notes = [523.25, 659.25, 783.99, 1046.50];

    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.08);

      gain.gain.setValueAtTime(0.001, now + index * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.18, now + index * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.08 + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + index * 0.08);
      osc.stop(now + index * 0.08 + 0.55);
    });

    // Auto-close audio context after sound finishes
    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 1200);
  } catch (e) {
    // Gracefully handle browser autoplay policies
  }
}

/**
 * Play a grand victory milestone fanfare (F5 - A5 - C6 - F6)
 */
export function playMilestoneFanfare(): void {
  if (!isSoundEnabled() || typeof window === 'undefined') return;

  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // Frequencies: F5, A5, C6, F6
    const notes = [698.46, 880.00, 1046.50, 1396.91];

    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = index === 3 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.1);

      gain.gain.setValueAtTime(0.001, now + index * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.22, now + index * 0.1 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.1 + 0.7);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + index * 0.1);
      osc.stop(now + index * 0.1 + 0.75);
    });

    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 1500);
  } catch (e) {
    // Gracefully handle browser autoplay policies
  }
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// AMBIENT STUDY SOUND ENGINE (Colombo Rain & Silent Library)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
let ambientCtx: AudioContext | null = null;
let ambientGain: GainNode | null = null;
let ambientNoiseNode: AudioNode | null = null;
let currentAmbientType: 'colombo_rain' | 'library_silence' | null = null;

export function isAmbientPlaying(): boolean {
  return currentAmbientType !== null;
}

export function getCurrentAmbientType(): 'colombo_rain' | 'library_silence' | null {
  return currentAmbientType;
}

export function stopAmbientSound(): void {
  if (ambientGain && ambientCtx) {
    try {
      ambientGain.gain.exponentialRampToValueAtTime(0.0001, ambientCtx.currentTime + 0.5);
      setTimeout(() => {
        if (ambientCtx) {
          ambientCtx.close().catch(() => {});
          ambientCtx = null;
          ambientGain = null;
          ambientNoiseNode = null;
        }
      }, 600);
    } catch {
      if (ambientCtx) ambientCtx.close().catch(() => {});
      ambientCtx = null;
    }
  }
  currentAmbientType = null;
}

export function startAmbientSound(type: 'colombo_rain' | 'library_silence', volume = 0.25): void {
  stopAmbientSound();
  if (typeof window === 'undefined') return;

  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    ambientCtx = new AudioCtx();
    const ctx = ambientCtx;
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    if (type === 'colombo_rain') {
      // Pink Noise generation (Paul Kellet's filtered white noise algorithm)
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
        b6 = white * 0.115926;
      }
    } else {
      // Brown Noise generation for quiet room tone
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 2.5; // Gain compensation
      }
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter to shape into gentle room/rain tone
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = type === 'colombo_rain' ? 850 : 380;

    ambientGain = ctx.createGain();
    ambientGain.gain.setValueAtTime(0.001, ctx.currentTime);
    ambientGain.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + 1.2);

    whiteNoise.connect(filter);
    filter.connect(ambientGain);
    ambientGain.connect(ctx.destination);

    whiteNoise.start(0);
    ambientNoiseNode = whiteNoise;
    currentAmbientType = type;
  } catch (err) {
    console.warn('[Audio] Autoplay blocked or audio context unavailable', err);
  }
}
