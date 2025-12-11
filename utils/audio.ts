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
      const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
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
