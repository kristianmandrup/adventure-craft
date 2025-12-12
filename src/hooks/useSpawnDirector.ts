import { useEffect, useRef } from 'react';
import { enemyPrefabs, animalPrefabs } from '../utils/prefabs/characters';
import { GameMode } from '../types';

interface SpawnDirectorProps {
  gameMode: 'CREATIVE' | 'ADVENTURE';
  gameStarted: boolean;
  isDay: boolean;
  isRaining: boolean;
  playerLevel: number;
  getEntityCounts: () => { enemies: number; animals: number; [key: string]: number };
  spawnPredefinedCharacter: (prefab: any, count: number, isEnemy?: boolean, isGiant?: boolean, isFriendly?: boolean, isAquatic?: boolean) => void;
  characters: import('../types').Character[];
  difficultyMode?: GameMode;
}

export const useSpawnDirector = ({
  gameMode, gameStarted, isDay, isRaining, playerLevel,
  getEntityCounts, spawnPredefinedCharacter, characters, difficultyMode
}: SpawnDirectorProps) => {

  // Configuration
  const SPAWN_INTERVAL_MS = 5000; // Check every 5s
  
  // Caps
  const MAX_ZOMBIES = 10;
  const MAX_SKELETONS = 10;
  const MAX_SPIDERS = 4;
  const MAX_GIANTS = difficultyMode === 'DARK_UNDERWORLD' ? 2 : 1;
  const MAX_SORCERERS = difficultyMode === 'DARK_UNDERWORLD' ? 2 : 1;
  const MAX_ANIMALS = 8; // Keep world lively but not crowded
  const MAX_PIGS = 3;

  useEffect(() => {
    if (!gameStarted || gameMode !== 'ADVENTURE') return;

    const interval = setInterval(() => {
        const counts = getEntityCounts();
        
        // --- 1. Current Population Analysis ---
        const zombies = characters.filter(c => c.name.includes('Zombie')).length;
        const skeletons = characters.filter(c => c.name.includes('Skeleton')).length;
        const spiders = characters.filter(c => c.name.includes('Spider')).length;
        const giants = characters.filter(c => c.name.includes('Giant') || c.name.includes('Ogre')).length;
        const sorcerers = characters.filter(c => c.name.includes('Sorcerer')).length;
        const pigs = characters.filter(c => c.name.includes('pig')).length;
        const animals = counts.animals;

        // --- 2. Scaling Factors ---
        // Level 1: Rate 0.5x, Level 5: Rate 1.5x
        // Night: Rate 2x
        // Rain: Rate 1.5x
        let spawnChance = 0.3 + (playerLevel * 0.05); 
        if (!isDay) spawnChance *= 2.0;
        if (isRaining) spawnChance *= 1.5;

        // --- 3. Spawn Logic ---
        
        // Zombies (Common)
        if (zombies < MAX_ZOMBIES && Math.random() < spawnChance) {
             // Stat scaling
             const booster = Math.max(1, playerLevel * 0.1); 
             const prefab = { ...enemyPrefabs.zombie, maxHp: enemyPrefabs.zombie.maxHp * booster };
             spawnPredefinedCharacter(prefab, 1, true);
        }

        // Skeletons (Target Level 2+)
        if (skeletons < MAX_SKELETONS && playerLevel >= 1 && Math.random() < spawnChance * 0.8) {
             const booster = Math.max(1, playerLevel * 0.1); 
             const prefab = { ...enemyPrefabs.skeleton, maxHp: enemyPrefabs.skeleton.maxHp * booster };
             spawnPredefinedCharacter(prefab, 1, true);
        }

        // Spiders (Uncommon)
        if (spiders < MAX_SPIDERS && Math.random() < spawnChance * 0.4) {
             spawnPredefinedCharacter(enemyPrefabs.spider, 1, true);
        }

        // Sorcerers (Rare / Boss)
        if (sorcerers < MAX_SORCERERS && playerLevel >= 3 && Math.random() < 0.1) {
             const booster = Math.max(1, playerLevel * 0.2); 
             const prefab = { ...enemyPrefabs.sorcerer, maxHp: enemyPrefabs.sorcerer.maxHp * booster };
             spawnPredefinedCharacter(prefab, 1, true);
        }

        // Giants (Rare / Boss)
        if (giants < MAX_GIANTS && playerLevel >= 5 && Math.random() < 0.05) {
             const booster = Math.max(1, playerLevel * 0.3); 
             const prefab = { ...enemyPrefabs.giant, maxHp: enemyPrefabs.giant.maxHp * booster };
             spawnPredefinedCharacter(prefab, 1, true, true);
        }

        // Animals (Passive refill)
        if (animals < MAX_ANIMALS && Math.random() < 0.2) {
             const types = Object.values(animalPrefabs);
             // Filter out pigs if limit reached in Dark Mode
             let availableTypes = types;
             if (difficultyMode === 'DARK_UNDERWORLD' && pigs >= MAX_PIGS) {
                availableTypes = types.filter(t => !t.name.includes('pig'));
             }

             if (availableTypes.length > 0) {
                 const type = availableTypes[Math.floor(Math.random() * availableTypes.length)];
                 spawnPredefinedCharacter(type, 1, false, false, false, type.name.includes('Fish')); // isAquatic logic?
             }
        }

    }, SPAWN_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [gameStarted, gameMode, isDay, isRaining, playerLevel, characters, getEntityCounts, spawnPredefinedCharacter, difficultyMode]);

};
