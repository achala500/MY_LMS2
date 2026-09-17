/**
 * StudySync Focus Town â€” Procedural Ambient Sound Synthesizer
 * Generates soothing focus soundscapes using the Web Audio API without external audio files.
 */

export type AmbientSoundType = 'none' | 'rain' | 'ocean' | 'library' | 'binaural' | 'clock';

class AmbientSoundSynth {
  private ctx: AudioContext | null = null;
  private currentType: AmbientSoundType = 'none';
  private masterGain: GainNode | null = null;
  private noiseNode: AudioNode | null = null;
  private oscillatorNodes: OscillatorNode[] = [];
  private intervalTimer: any = null;
  private volume: number = 0.4;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public getCurrentType(): AmbientSoundType {
    return this.currentType;
  }

  public stop() {
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
      this.intervalTimer = null;
    }
    this.oscillatorNodes.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {}
    });
    this.oscillatorNodes = [];

    if (this.noiseNode) {
      try {
        this.noiseNode.disconnect();
      } catch (e) {}
      this.noiseNode = null;
    }
    this.currentType = 'none';
  }

  public play(type: AmbientSoundType) {
    this.stop();
    if (type === 'none') return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    this.currentType = type;

    switch (type) {
      case 'rain':
        this.startRain();
        break;
      case 'ocean':
        this.startOcean();
        break;
      case 'library':
        this.startLibrary();
        break;
      case 'binaural':
        this.startBinaural();
        break;
      case 'clock':
        this.startClock();
        break;
    }
  }

  private createNoiseBuffer(seconds: number = 5): AudioBuffer | null {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * seconds;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Brown noise integration
      lastOut = (lastOut + 0.02 * white) / 1.02;
      output[i] = lastOut * 3.5;
    }
    return buffer;
  }

  private startRain() {
    if (!this.ctx || !this.masterGain) return;
    const buffer = this.createNoiseBuffer(5);
    if (!buffer) return;

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    // Highpass filter for rain pitter-patter
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, this.ctx.currentTime);
    filter.Q.setValueAtTime(0.8, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.6, this.ctx.currentTime);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    source.start();
    this.noiseNode = source;
  }

  private startOcean() {
    if (!this.ctx || !this.masterGain) return;
    const buffer = this.createNoiseBuffer(6);
    if (!buffer) return;

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, this.ctx.currentTime);

    // LFO to simulate rhythmic ocean waves
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime); // ~8 sec wave period
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(300, this.ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();
    this.oscillatorNodes.push(lfo);

    source.connect(filter);
    filter.connect(this.masterGain);

    source.start();
    this.noiseNode = source;
  }

  private startLibrary() {
    if (!this.ctx || !this.masterGain) return;
    const buffer = this.createNoiseBuffer(4);
    if (!buffer) return;

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(250, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, this.ctx.currentTime);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    source.start();
    this.noiseNode = source;
  }

  private startBinaural() {
    if (!this.ctx || !this.masterGain) return;

    // Left channel: 200 Hz
    const oscLeft = this.ctx.createOscillator();
    oscLeft.type = 'sine';
    oscLeft.frequency.setValueAtTime(200, this.ctx.currentTime);

    const panLeft = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
    if (panLeft) panLeft.pan.setValueAtTime(-0.8, this.ctx.currentTime);

    // Right channel: 240 Hz (40 Hz difference for gamma/alpha focus entrainment)
    const oscRight = this.ctx.createOscillator();
    oscRight.type = 'sine';
    oscRight.frequency.setValueAtTime(240, this.ctx.currentTime);

    const panRight = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
    if (panRight) panRight.pan.setValueAtTime(0.8, this.ctx.currentTime);

    const toneGain = this.ctx.createGain();
    toneGain.gain.setValueAtTime(0.18, this.ctx.currentTime);

    if (panLeft && panRight) {
      oscLeft.connect(panLeft);
      panLeft.connect(toneGain);
      oscRight.connect(panRight);
      panRight.connect(toneGain);
    } else {
      oscLeft.connect(toneGain);
      oscRight.connect(toneGain);
    }

    toneGain.connect(this.masterGain);
    oscLeft.start();
    oscRight.start();

    this.oscillatorNodes.push(oscLeft, oscRight);
  }

  private startClock() {
    if (!this.ctx || !this.masterGain) return;

    const playTick = () => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.045);
    };

    playTick();
    this.intervalTimer = setInterval(playTick, 1000);
  }
}

export const ambientSoundSynth = new AmbientSoundSynth();
