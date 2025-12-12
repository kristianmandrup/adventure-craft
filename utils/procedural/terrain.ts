import { Block } from '../../types';
import { v4 as uuidv4 } from 'uuid';

// Deterministic height function
export const getHeight = (x: number, z: number) => {
  return Math.floor(
    Math.sin(x * 0.1) * 3 + 
    Math.cos(z * 0.1) * 3 + 
    Math.sin(x * 0.3 + z * 0.2) * 1
  );
};

// Underworld terrain - no trees, more mountains, caves with boss
export const getUnderworldHeight = (x: number, z: number) => {
  // More dramatic terrain with higher mountains
  return Math.floor(
    Math.sin(x * 0.08) * 5 + 
    Math.cos(z * 0.08) * 5 + 
    Math.sin(x * 0.25 + z * 0.15) * 3 +
    Math.abs(Math.sin(x * 0.05) * Math.cos(z * 0.05)) * 6
  );
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
           
           // Sugar cane spawns on sand near water (15% chance)
           if (Math.random() < 0.15) {
             const caneHeight = 2 + Math.floor(Math.random() * 2); // 2-3 blocks
             for (let cy = 1; cy <= caneHeight; cy++) {
               add(x, cy, z, '#22c55e', 'sugar_cane');
             }
           }
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
