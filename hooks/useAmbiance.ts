import { useEffect, useRef } from 'react';
import { audioManager } from '../utils/audio';
import * as THREE from 'three';
import { Block } from '../types';

export const useAmbiance = (
    playerPosRef: React.MutableRefObject<[number, number, number] | null>,
    blocks: Block[]
) => {
  const lakeInterval = useRef<any>(null);

  useEffect(() => {
    const checkAmbiance = () => {
        if (!playerPosRef.current) return;
        
        const [px, py, pz] = [Math.floor(playerPosRef.current[0]), Math.floor(playerPosRef.current[1]), Math.floor(playerPosRef.current[2])];
        
        const radius = 10;
        let waterCount = 0;

        // Optimized check: only filter blocks in range roughly before precise checking
        // Since iterating 1000s of blocks is slow, we might just sample or rely on a "isNearLake" flag if provided.
        // But for now, let's filter the array. If array is huge (10k+), this is bad.
        // However, standard generation is small-ish.
        // Better: iterate once and check distance.
        
        // Perf Safety: Limit check to first N blocks or random sample if extremely large? 
        // Or just trust JS engine speed for simple number comparisons.
        
        for (let i = 0; i < blocks.length; i++) {
            const b = blocks[i];
            if (b.type !== 'water') continue;
            
            if (Math.abs(b.x - px) < radius && Math.abs(b.z - pz) < radius && Math.abs(b.y - py) < 5) {
                waterCount++;
                if (waterCount > 10) break; // Optimization: early exit
            }
        }

        if (waterCount > 10) {
            // Near lake
             if (Math.random() < 0.1) {
                 audioManager.playSFX('SPLASH', 0.3);
             }
             if (Math.random() < 0.05) {
                 audioManager.playSFX('LAKE', 0.4);
             }
        }
    };

    lakeInterval.current = setInterval(checkAmbiance, 3000);
    return () => clearInterval(lakeInterval.current);
  }, [blocks, playerPosRef]);
};
