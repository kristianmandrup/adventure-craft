import { Block } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import { TerrainResult, CaveSpawn } from './types';
import { getHeight, getUnderworldHeight, generateTerrainForRange } from './terrain';
import { generateCave } from './caves';

export * from './types';
export * from './terrain';
export * from './caves';

export const generateInitialTerrain = (): TerrainResult => {
  const blocks = generateTerrainForRange(-40, 40, -40, 40);  // 80x80 starting map
  const caveSpawns: CaveSpawn[] = [];
  
  // Generate 1-2 caves at random positions
  const numCaves = 1 + Math.floor(Math.random() * 2);
  
  const add = (x: number, y: number, z: number, color: string, type: string) => {
    blocks.push({ id: uuidv4(), x, y, z, color, type });
  };
  
  for (let i = 0; i < numCaves; i++) {
    // Random position within the map but not at edges
    const caveX = -20 + Math.floor(Math.random() * 40);
    const caveZ = -20 + Math.floor(Math.random() * 40);
    const surfaceHeight = getHeight(caveX, caveZ);
    
    // Only create caves on reasonably flat land
    if (surfaceHeight >= 0 && surfaceHeight <= 4) {
      const spawn = generateCave(caveX, caveZ, surfaceHeight, add);
      caveSpawns.push(spawn);
    }
  }
  
  // Spawn fixed fireplace at random grass location
  const fireplaceX = -15 + Math.floor(Math.random() * 30);
  const fireplaceZ = -15 + Math.floor(Math.random() * 30);
  const fireplaceY = getHeight(fireplaceX, fireplaceZ);
  if (fireplaceY >= 0) {
    // Stone base
    for (let fx = -1; fx <= 1; fx++) {
      for (let fz = -1; fz <= 1; fz++) {
        add(fireplaceX + fx, fireplaceY + 1, fireplaceZ + fz, '#525252', 'stone');
      }
    }
    // Fire blocks
    add(fireplaceX, fireplaceY + 2, fireplaceZ, '#f97316', 'fire');
    add(fireplaceX, fireplaceY + 3, fireplaceZ, '#ef4444', 'fire');
    // Side stones
    add(fireplaceX - 1, fireplaceY + 2, fireplaceZ, '#404040', 'stone');
    add(fireplaceX + 1, fireplaceY + 2, fireplaceZ, '#404040', 'stone');
    add(fireplaceX, fireplaceY + 2, fireplaceZ - 1, '#404040', 'stone');
    add(fireplaceX, fireplaceY + 2, fireplaceZ + 1, '#404040', 'stone');
  }
  
  return { blocks, caveSpawns };
};

export const generateExpansion = (currentSize: number, expansionSize: number): Block[] => {
  const oldMin = -currentSize;
  const oldMax = currentSize;
  const newSize = currentSize + expansionSize;
  const newMin = -newSize;
  const newMax = newSize;

  return generateTerrainForRange(newMin, newMax, newMin, newMax, {
    minX: oldMin,
    maxX: oldMax,
    minZ: oldMin,
    maxZ: oldMax
  });
};

export const generateUnderworldTerrain = (): TerrainResult => {
  const blocks: Block[] = [];
  const caveSpawns: CaveSpawn[] = [];
  
  const add = (x: number, y: number, z: number, color: string, type: string) => {
    blocks.push({ id: uuidv4(), x, y, z, color, type });
  };

  // Generate underworld terrain (100x100)
  for (let x = -50; x <= 50; x++) {
    for (let z = -50; z <= 50; z++) {
      const height = getUnderworldHeight(x, z);
      
      // Underground layer (negative depth)
      for (let y = -5; y <= height; y++) {
        if (y === height) {
          // Surface - dark volcanic rock
          if (height > 6) {
            add(x, y, z, '#1f1f1f', 'obsidian');  // Very high = obsidian
          } else if (height > 3) {
            add(x, y, z, '#374151', 'stone');  // High = dark stone
          } else if (height < -2) {
            add(x, y, z, '#dc2626', 'lava');  // Low = lava
          } else {
            add(x, y, z, '#451a03', 'dirt');  // Dark corrupted dirt
          }
        } else if (y >= height - 3) {
          add(x, y, z, '#292524', 'stone');  // Dark stone below surface
        } else {
          add(x, y, z, '#1c1917', 'stone');  // Deeper dark stone
        }
      }
      
      // NO trees in underworld! Only occasional dead bushes (no leaves, just sticks)
      if (height >= 1 && height <= 4 && Math.random() < 0.01) {
        // Dead bush - just a few stick-like blocks
        add(x, height + 1, z, '#78350f', 'wood');
        if (Math.random() > 0.5) add(x, height + 2, z, '#78350f', 'wood');
      }
    }
  }
  
  // Generate exactly 2 caves with boss in one - WITH RETRY LOGIC (added during refactor)
  const numCaves = 2;
  let bossPlaced = false;
  
  for (let i = 0; i < numCaves; i++) {
    let attempts = 0;
    while(attempts < 50) {
        attempts++;
        const caveX = -40 + Math.floor(Math.random() * 80);
        const caveZ = -40 + Math.floor(Math.random() * 80);
        const surfaceHeight = getUnderworldHeight(caveX, caveZ);
        
        if (surfaceHeight >= 0 && surfaceHeight <= 6) {
          const spawn = generateCave(caveX, caveZ, surfaceHeight, add);
          
          // First suitable cave gets the boss
          if (!bossPlaced) {
            spawn.type = 'boss';
            bossPlaced = true;
          }
          caveSpawns.push(spawn);
          break; // Success
        }
    }
  }
  
  return { blocks, caveSpawns };
};
