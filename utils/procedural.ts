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

  const add = (x: number, y: number, z: number, color: string, type: string) => {
    blocks.push({ id: uuidv4(), x, y, z, color, type });
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

const generateTree = (x: number, y: number, z: number, add: (x: number, y: number, z: number, color: string, type: string) => void) => {
    const treeType = Math.random();
    const size = Math.random(); // 0-0.33 small, 0.33-0.66 med, 0.66-1 large
    
    // Height mod based on size
    const heightMod = size < 0.33 ? 0 : size < 0.66 ? 2 : 4;

    if (treeType < 0.33) {
        // Oak (Classic)
        const trunkH = 3 + heightMod + Math.floor(Math.random() * 2);
        for (let i = 1; i <= trunkH; i++) add(x, y + i, z, '#451a03', 'wood');
        
        const leafStart = y + trunkH - 1;
        const leafEnd = y + trunkH + 1 + (size > 0.6 ? 1 : 0);
        const radius = size > 0.6 ? 3 : 2;

        for (let ly = leafStart; ly <= leafEnd; ly++) {
            for (let lx = x - radius; lx <= x + radius; lx++) {
                for (let lz = z - radius; lz <= z + radius; lz++) {
                    if (Math.abs(lx - x) + Math.abs(lz - z) + Math.abs(ly - (leafStart + 1)) <= radius + 1) {
                        if (lx !== x || lz !== z || ly > y + trunkH) {
                             // Apple Chance
                             if (Math.random() < 0.1) add(lx, ly, lz, '#ef4444', 'apple'); // Apple block
                             else add(lx, ly, lz, '#15803d', 'leaf');
                        }
                    }
                }
            }
        }
    } else if (treeType < 0.66) {
        // Pine (Cone)
        const trunkH = 4 + heightMod + Math.floor(Math.random() * 2);
        for (let i = 1; i <= trunkH; i++) add(x, y + i, z, '#271c19', 'wood'); // Darker wood

        let currentRadius = size > 0.6 ? 3 : 2;
        let ly = y + 2;
        while (currentRadius >= 0) {
             for (let lx = x - currentRadius; lx <= x + currentRadius; lx++) {
                 for (let lz = z - currentRadius; lz <= z + currentRadius; lz++) {
                     if ((lx !== x || lz !== z) && (Math.abs(lx-x) + Math.abs(lz-z) <= currentRadius + 0.5)) {
                        if (Math.random() < 0.1) add(lx, ly, lz, '#ef4444', 'apple');
                        else add(lx, ly, lz, '#064e3b', 'leaf'); // Darker leaf
                     }
                 }
             }
             ly++;
             if (ly % 2 === 0) currentRadius--;
        }
        add(x, ly, z, '#064e3b', 'leaf'); // Top
    } else {
        // Birch (Tall, Thin, Pale)
        const trunkH = 5 + heightMod + Math.floor(Math.random() * 3);
        for (let i = 1; i <= trunkH; i++) add(x, y + i, z, '#e5e5e5', 'wood'); // White wood
        
        // Sparse top
        const canopyStart = y + trunkH - 2;
        for (let ly = canopyStart; ly <= y + trunkH + 1; ly++) {
             for (let lx = x - 2; lx <= x + 2; lx++) {
                 for (let lz = z - 2; lz <= z + 2; lz++) {
                     if (Math.abs(lx-x) <= 1 && Math.abs(lz-z) <= 1 && Math.random() > 0.2) {
                         if (lx !== x || lz !== z || ly > y + trunkH) {
                            if (Math.random() < 0.1) add(lx, ly, lz, '#ef4444', 'apple');
                            else add(lx, ly, lz, '#84cc16', 'leaf'); // Lime leaf
                         }
                     }
                 }
             }
        }
    }
}

export const generateInitialTerrain = (): Block[] => {
  return generateTerrainForRange(-20, 20, -20, 20);
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