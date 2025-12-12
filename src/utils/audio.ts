import { SOUND_ASSETS, SoundCategory } from './sound-assets';

export class AudioManager {
  private static instance: AudioManager;
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private buffers: Map<string, AudioBuffer> = new Map();
  private isMuted: boolean = false;

  private constructor() {}

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

    public async init() {
    if (!this.ctx) {
      // @ts-ignore
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.3; // Default volume
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  public resume() {
    this.init();
  }

  public setVolume(val: number) {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, val));
    }
  }

  private async loadBuffer(url: string): Promise<AudioBuffer | null> {
    if (this.buffers.has(url)) return this.buffers.get(url)!;
    if (!this.ctx) return null;

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
      this.buffers.set(url, audioBuffer);
      return audioBuffer;
    } catch (error) {
      console.error(`Failed to load sound: ${url}`, error);
      return null;
    }
  }

  public async playSFX(category: SoundCategory, volume: number = 1.0, pitchVariation: number = 0.1) {
    await this.init();
    if (!this.ctx || !this.masterGain) return;

    const files = SOUND_ASSETS[category];
    if (!files || files.length === 0) return;

    const file = files[Math.floor(Math.random() * files.length)];
    const buffer = await this.loadBuffer(file);
    if (!buffer) return;

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;

    const gainNode = this.ctx.createGain();
    gainNode.gain.value = volume;

    // Randomize pitch slightly
    if (pitchVariation > 0) {
       source.playbackRate.value = 1 + (Math.random() * pitchVariation * 2 - pitchVariation);
    }

    source.connect(gainNode);
    gainNode.connect(this.masterGain);
    source.start(0);
  }

  // kept for backward compat if any calls remain, though we should migrate all
  public playTone(freq: number, type: OscillatorType, duration: number, startTime: number = 0, vol: number = 1) {
    // Deprecated tone generator
  }
  
  public playSpatialSFX(category: SoundCategory, dist: number) {
     if (dist > 30) return;
     const vol = Math.max(0, 1 - (dist / 30));
     this.playSFX(category, vol);
  }

  private activeLoops: Map<string, { source: AudioBufferSourceNode, gain: GainNode }> = new Map();

  public async playAmbient(category: SoundCategory, volume: number = 0.5) {
      await this.init();
      if (!this.ctx || !this.masterGain) return;
      if (this.activeLoops.has(category)) return; // Already playing

      const files = SOUND_ASSETS[category];
      if (!files || files.length === 0) return;
      
      const file = files[0]; // Loop first file usually
      const buffer = await this.loadBuffer(file);
      if (!buffer) return;

      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const gainNode = this.ctx.createGain();
      gainNode.gain.value = 0; // Start at 0 for fade in
      
      source.connect(gainNode);
      gainNode.connect(this.masterGain);
      source.start(0);
      
      // Fade in
      gainNode.gain.linearRampToValueAtTime(volume, this.ctx.currentTime + 2);

      this.activeLoops.set(category, { source, gain: gainNode });
  }

  public stopAmbient(category: SoundCategory) {
      const active = this.activeLoops.get(category);
      if (active && this.ctx) {
          // Fade out
          active.gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 2);
          setTimeout(() => {
              active.source.stop();
              active.source.disconnect();
              active.gain.disconnect();
          }, 2000);
          this.activeLoops.delete(category);
      }
  }

  public stopAllAmbient() {
      for (const cat of this.activeLoops.keys()) {
          this.stopAmbient(cat as SoundCategory);
      }
  }

  public speak(text: string, variant: 'BOSS' | 'MERCHANT' | 'NORMAL' = 'NORMAL') {
      const synth = window.speechSynthesis;
      if (!synth) return;
      
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 0.9;
      
      if (variant === 'BOSS') {
          utter.pitch = 0.1; // Deep/Ominous
          utter.rate = 0.7; // Slow
          utter.volume = 1;
      } else if (variant === 'MERCHANT') {
          utter.pitch = 1.2; // Friendly/Higher
          utter.rate = 1.1; // Faster
      }

      synth.speak(utter);
  }
}

export const audioManager = AudioManager.getInstance();
