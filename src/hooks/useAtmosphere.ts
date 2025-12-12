import { audioManager } from '../utils/audio';
import { useState, useEffect, useMemo } from 'react';

export const useAtmosphere = (isDay: boolean, isRaining: boolean, isUnderworld: boolean) => {
  // Fog Calculations
  const fogColor = useMemo(() => {
      if (isUnderworld) return '#2a0a0a';
      if (isDay) return isRaining ? '#64748b' : '#87ceeb';
      return '#0f172a';
  }, [isDay, isRaining, isUnderworld]);

  const fogDensity = useMemo(() => {
      if (isUnderworld) return 0.04;
      if (isDay) return isRaining ? 0.02 : 0.008;
      return 0.03;
  }, [isDay, isRaining, isUnderworld]);

  // Lightning Logic
  const [lightningFlash, setLightningFlash] = useState(0);

  useEffect(() => {
    if (!isRaining || isUnderworld) {
        setLightningFlash(0);
        audioManager.stopAmbient('RAIN');
        audioManager.stopAmbient('THUNDER'); // Stop ambient thunder loop if we decide to use it, though existing is one-shot
        return;
    }
    
    audioManager.playAmbient('RAIN', 0.4);

    const interval = setInterval(() => {
        if (Math.random() < 0.1) { // 10% chance every 2 sec
            setLightningFlash(2); // Flash intensity
            audioManager.playSFX('THUNDER', 0.8);
            setTimeout(() => setLightningFlash(0), 100);
        }
    }, 2000);
    
    return () => {
        clearInterval(interval);
        audioManager.stopAmbient('RAIN');
    };
  }, [isRaining, isUnderworld]);

  return { fogColor, fogDensity, lightningFlash };
};
