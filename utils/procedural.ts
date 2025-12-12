import { Block } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Deterministic height function
const getHeight = (x: number, z: number) => {
  return Math.floor(
    Math.sin(x * 0.1) * 3 + 
    Math.cos(z * 0.1) * 3 + 
    Math.sin(x * 0.3 + z * 0.2) * 1
  );
};

export const generateTerrainForRange = (minX: number, maxX: number, minZ: number, maxZ: number, existingBounds?: {minX: number, maxX: number, minZ: number, maxZ: number}): Block[] => {
  const blocks: Block[] = [];

  const add = (x: number, y: number, z: number, color: string, type: string, hp?: number) => {
    blocks.push({ id: uuidv4(), x, y, z, color, type, hp });
  };

  for (let x = minX; x <= maxX; x++) {
    for (let z = minZ; z <= maxZ; z++) {
      if (existingBounds) {
        if (x >= existingBounds.minX && x <= existingBounds.maxX && 
            z >= existingBounds.minZ && z <= existingBounds.maxZ) {
          continue;
        }
      }

      const height = getHeight(x, z);

      // Water Level
      if (height < 0) {
        for (let y = height; y <= -1; y++) {
          add(x, y, z, '#3b82f6', 'water');
        }
        if (height === -1) {
           add(x, 0, z, '#fde047', 'sand');
        }
      } else {
        const isSnow = height > 6;
        const isStone = height > 4 && !isSnow && Math.random() > 0.5;
        
        let color = '#22c55e'; // Grass
        let type = 'grass';

        if (isSnow) {
          color = '#ffffff';
          type = 'snow';
        } else if (isStone) {
          color = '#9ca3af';
          type = 'stone';
        }

        add(x, height, z, color, type);
        add(x, height - 1, z, '#78350f', 'dirt');

        // Trees: 2% chance on grass
        if (type === 'grass' && Math.random() < 0.02) {
          generateTree(x, height, z, add);
        }
      }
    }
  }
  return blocks;
};

const generateTree = (x: number, y: number, z: number, add: (x: number, y: number, z: number, color: string, type: string, hp?: number) => void) => {
    const treeType = Math.random();
    const size = Math.random(); // 0-0.33 small, 0.33-0.66 med, 0.66-1 large
    
    // Height mod based on size
    const heightMod = size < 0.33 ? 0 : size < 0.66 ? 2 : 4;
    
    // Wood blocks have 50 HP (5-10 hits with axe doing 5-10 damage)
    const WOOD_HP = 50;
    
    // Apple Logic: 10% of trees have apples
    let hasApples = Math.random() < 0.1;
    // Apple density per leaf if tree has apples
    const appleDensity = 0.15; 

    if (treeType < 0.33) {
        // Oak (Classic) - 30% smaller
        const trunkH = Math.floor((3 + heightMod + Math.floor(Math.random() * 2)) * 0.7);
        for (let i = 1; i <= trunkH; i++) add(x, y + i, z, '#451a03', 'wood', WOOD_HP);
        
        const leafStart = y + trunkH - 1;
        const leafEnd = y + trunkH + 1 + (size > 0.6 ? 1 : 0);
        const radius = size > 0.6 ? 3 : 2;

        for (let ly = leafStart; ly <= leafEnd; ly++) {
            for (let lx = x - radius; lx <= x + radius; lx++) {
                for (let lz = z - radius; lz <= z + radius; lz++) {
                    if (Math.abs(lx - x) + Math.abs(lz - z) + Math.abs(ly - (leafStart + 1)) <= radius + 1) {
                        if (lx !== x || lz !== z || ly > y + trunkH) {
                             if (hasApples && Math.random() < appleDensity) add(lx, ly, lz, '#ef4444', 'apple');
                             else add(lx, ly, lz, '#15803d', 'leaf');
                        }
                    }
                }
            }
        }
    } else if (treeType < 0.66) {
        // Pine (Cone) - TALLER now
        // Base height 6-10 instead of 4
        // Height mod adds up to 4 more.
        const trunkH = Math.floor((6 + heightMod + Math.floor(Math.random() * 3))); 
        for (let i = 1; i <= trunkH; i++) add(x, y + i, z, '#271c19', 'wood', WOOD_HP); // Darker wood

        // NARROWER but taller
        let currentRadius = size > 0.5 ? 2.5 : 1.5; 
        let ly = y + 2;
        // Extend leaves lower down
        
        // Loop up to trunk top
        while (ly <= y + trunkH + 1) {
             const r = Math.max(0, currentRadius * (1 - (ly - (y+2))/(trunkH)));
             const intR = Math.ceil(r);
             
             for (let lx = x - intR; lx <= x + intR; lx++) {
                 for (let lz = z - intR; lz <= z + intR; lz++) {
                     // Circular cone check
                     if ((lx !== x || lz !== z) && (Math.sqrt((lx-x)**2 + (lz-z)**2) <= r + 0.5)) {
                         // No apples on Pine
                         add(lx, ly, lz, '#064e3b', 'leaf'); 
                     }
                 }
             }
             ly++;
        }
        add(x, y + trunkH + 2, z, '#064e3b', 'leaf'); // Top tip
    } else {
        // Birch (Tall, Thin, Pale)
        const trunkH = Math.floor((5 + heightMod + Math.floor(Math.random() * 3)) * 0.7);
        for (let i = 1; i <= trunkH; i++) add(x, y + i, z, '#e5e5e5', 'wood', WOOD_HP); // White wood
        
        // Sparse top
        const canopyStart = y + trunkH - 2;
        for (let ly = canopyStart; ly <= y + trunkH + 1; ly++) {
             for (let lx = x - 2; lx <= x + 2; lx++) {
                 for (let lz = z - 2; lz <= z + 2; lz++) {
                     if (Math.abs(lx-x) <= 1 && Math.abs(lz-z) <= 1 && Math.random() > 0.2) {
                         if (lx !== x || lz !== z || ly > y + trunkH) {
                            if (hasApples && Math.random() < appleDensity) add(lx, ly, lz, '#ef4444', 'apple');
                            else add(lx, ly, lz, '#84cc16', 'leaf'); // Lime leaf
                         }
                     }
                 }
             }
        }
    }
}

// Cave spawn point interface
export interface CaveSpawn {
  x: number;
  y: number;
  z: number;
  type: 'treasure' | 'boss' | 'merchant';
}

// Generate a cave at the given surface position
const generateCave = (
  entranceX: number, 
  entranceZ: number,
  surfaceHeight: number,
  add: (x: number, y: number, z: number, color: string, type: string) => void
): CaveSpawn => {
  // Cave entrance - remove surface blocks and create stone archway
  const caveDepth = 4 + Math.floor(Math.random() * 3);  // 4-6 blocks deep
  const caveWidth = 3 + Math.floor(Math.random() * 2);   // 3-4 blocks wide
  const caveLength = 6 + Math.floor(Math.random() * 4);  // 6-9 blocks long
  
  // Carve out the cave (we'll use negative y from surface)
  for (let dy = 0; dy >= -caveDepth; dy--) {
    for (let dx = -caveWidth; dx <= caveWidth; dx++) {
      for (let dz = 0; dz < caveLength; dz++) {
        // Don't add blocks (this is where we carve)
        // The cave is carved by NOT adding blocks here later
      }
    }
  }
  
  // Add stone walls around cave
  for (let dx = -caveWidth - 1; dx <= caveWidth + 1; dx++) {
    for (let dz = -1; dz < caveLength + 1; dz++) {
      // Bottom floor
      add(entranceX + dx, surfaceHeight - caveDepth - 1, entranceZ + dz, '#374151', 'stone');
      // Ceiling (only at entrance opening)
      if (dz > 1) {
        add(entranceX + dx, surfaceHeight + 1, entranceZ + dz, '#374151', 'stone');
      }
    }
  }
  
  // Side walls
  for (let dy = -caveDepth; dy <= 0; dy++) {
    for (let dz = 0; dz < caveLength; dz++) {
      add(entranceX - caveWidth - 1, surfaceHeight + dy, entranceZ + dz, '#374151', 'stone');
      add(entranceX + caveWidth + 1, surfaceHeight + dy, entranceZ + dz, '#374151', 'stone');
    }
    // Back wall
    for (let dx = -caveWidth; dx <= caveWidth; dx++) {
      add(entranceX + dx, surfaceHeight + dy, entranceZ + caveLength, '#374151', 'stone');
    }
  }
  
  // Add entrance arch
  add(entranceX - 2, surfaceHeight + 2, entranceZ, '#6b7280', 'stone');
  add(entranceX + 2, surfaceHeight + 2, entranceZ, '#6b7280', 'stone');
  add(entranceX - 1, surfaceHeight + 2, entranceZ, '#6b7280', 'stone');
  add(entranceX + 1, surfaceHeight + 2, entranceZ, '#6b7280', 'stone');
  add(entranceX, surfaceHeight + 2, entranceZ, '#6b7280', 'stone');
  
  // Add glowing marker blocks at spawn point
  const spawnX = entranceX;
  const spawnY = surfaceHeight - caveDepth;
  const spawnZ = entranceZ + Math.floor(caveLength * 0.7);
  
  // Glowing pedestal
  add(spawnX, spawnY, spawnZ, '#fbbf24', 'gold');
  add(spawnX - 1, spawnY, spawnZ, '#9ca3af', 'stone');
  add(spawnX + 1, spawnY, spawnZ, '#9ca3af', 'stone');
  add(spawnX, spawnY, spawnZ - 1, '#9ca3af', 'stone');
  add(spawnX, spawnY, spawnZ + 1, '#9ca3af', 'stone');
  
  // Random spawn type
  const spawnTypes: Array<'treasure' | 'boss' | 'merchant'> = ['treasure', 'boss', 'merchant'];
  const spawnType = spawnTypes[Math.floor(Math.random() * spawnTypes.length)];
  
  return { x: spawnX, y: spawnY + 1, z: spawnZ, type: spawnType };
};

export interface TerrainResult {
  blocks: Block[];
  caveSpawns: CaveSpawn[];
}

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

// Underworld terrain - no trees, more mountains, caves with boss
const getUnderworldHeight = (x: number, z: number) => {
  // More dramatic terrain with higher mountains
  return Math.floor(
    Math.sin(x * 0.08) * 5 + 
    Math.cos(z * 0.08) * 5 + 
    Math.sin(x * 0.25 + z * 0.15) * 3 +
    Math.abs(Math.sin(x * 0.05) * Math.cos(z * 0.05)) * 6
  );
};

export const generateUnderworldTerrain = (): TerrainResult => {
  const blocks: Block[] = [];
  const caveSpawns: CaveSpawn[] = [];
  
  const add = (x: number, y: number, z: number, color: string, type: string) => {
    blocks.push({ id: uuidv4(), x, y, z, color, type });
  };

  // Generate underworld terrain (60x60 same as normal)
  for (let x = -30; x <= 30; x++) {
    for (let z = -30; z <= 30; z++) {
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
  
  // Generate 3-4 caves with boss in one
  const numCaves = 3 + Math.floor(Math.random() * 2);
  let bossPlaced = false;
  
  for (let i = 0; i < numCaves; i++) {
    const caveX = -20 + Math.floor(Math.random() * 40);
    const caveZ = -20 + Math.floor(Math.random() * 40);
    const surfaceHeight = getUnderworldHeight(caveX, caveZ);
    
    if (surfaceHeight >= 0 && surfaceHeight <= 6) {
      const spawn = generateCave(caveX, caveZ, surfaceHeight, add);
      
      // First suitable cave gets the boss
      if (!bossPlaced) {
        spawn.type = 'boss';
        bossPlaced = true;
      }
      caveSpawns.push(spawn);
    }
  }
  
  return { blocks, caveSpawns };
};