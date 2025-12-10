import { useEffect } from 'react';

// Keep audio context global to persist across re-renders if needed, 
// though typically hooks handle lifecycle. 
// Using module-level variables to simulate singleton behavior for the audio context.
let rainOsc: any = null;
let rainCtx: any = null;
let rainBuffer: any = null;
let isRainPlaying = false;
let lastOut = 0;

export const useRainAudio = (isRaining: boolean) => {
  useEffect(() => {
    // Initialize Context and Buffer only once
    if (!rainCtx) {
      const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      rainCtx = new AudioContext();
      const bufferSize = 2 * rainCtx.sampleRate;
      rainBuffer = rainCtx.createBuffer(1, bufferSize, rainCtx.sampleRate);
      const output = rainBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5;
      }
    }

    if (isRaining && !isRainPlaying && rainCtx) {
       rainOsc = rainCtx.createBufferSource();
       rainOsc.buffer = rainBuffer;
       rainOsc.loop = true;
       const gainNode = rainCtx.createGain();
       gainNode.gain.value = 0.1;
       rainOsc.connect(gainNode);
       gainNode.connect(rainCtx.destination);
       rainOsc.start(0);
       isRainPlaying = true;
       // Store ref on window for debugging or external access if strictly necessary, 
       // but here we manage via module scope.
       (window as any).rainOsc = rainOsc;
       (window as any).isRainPlaying = true;
    } else if (!isRaining && isRainPlaying && rainOsc) {
       rainOsc.stop();
       rainOsc = null;
       isRainPlaying = false;
       (window as any).rainOsc = null;
       (window as any).isRainPlaying = false;
    }

    return () => {
        // Optional cleanup if unmounting completely stops rain, 
        // but often we want environment sounds to persist if just re-rendering.
        // For now, we bind strictly to isRaining prop.
    };
  }, [isRaining]);
};