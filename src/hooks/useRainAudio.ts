import { useEffect, useRef } from 'react';
import { audioManager } from '../utils/audio';

export const useRainAudio = (isRaining: boolean) => {
  const rainInterval = useRef<any>(null);

  useEffect(() => {
    if (isRaining) {
      // Start rain loop immediately
      audioManager.playSFX('RAIN', 0.5);
      
      // Loop it
      rainInterval.current = setInterval(() => {
        audioManager.playSFX('RAIN', 0.5);
      }, 5000); // Assuming rain clip is around 5s or loopable. Adjust based on clip length if known, or just re-trigger overlap.
    } else {
      if (rainInterval.current) {
        clearInterval(rainInterval.current);
        rainInterval.current = null;
      }
    }

    return () => {
      if (rainInterval.current) {
        clearInterval(rainInterval.current);
        rainInterval.current = null;
      }
    };
  }, [isRaining]);
};