import { Block } from '../../types';

/**
 * Predefined structure prefabs for quick spawning without AI API calls.
 */

export interface StructurePrefab {
  name: string;
  blocks: Omit<Block, 'id'>[];
}

// Helper to create a filled box
const createBlockBox = (
  startX: number, startY: number, startZ: number,
  width: number, height: number, depth: number,
  color: string, type: string
): Omit<Block, 'id'>[] => {
  const blocks: Omit<Block, 'id'>[] = [];
  for (let x = startX; x < startX + width; x++) {
    for (let y = startY; y < startY + height; y++) {
      for (let z = startZ; z < startZ + depth; z++) {
        blocks.push({ x, y, z, color, type });
      }
    }
  }
  return blocks;
};

// Helper to create a hollow box (walls only)
const createHollowBox = (
  startX: number, startY: number, startZ: number,
  width: number, height: number, depth: number,
  color: string, type: string
): Omit<Block, 'id'>[] => {
  const blocks: Omit<Block, 'id'>[] = [];
  for (let x = startX; x < startX + width; x++) {
    for (let y = startY; y < startY + height; y++) {
      for (let z = startZ; z < startZ + depth; z++) {
        const isEdge = 
          x === startX || x === startX + width - 1 ||
          y === startY || y === startY + height - 1 ||
          z === startZ || z === startZ + depth - 1;
        if (isEdge) {
          blocks.push({ x, y, z, color, type });
        }
      }
    }
  }
  return blocks;
};

// ============ STRUCTURES ============

export const housePrefab: StructurePrefab = {
  name: 'Wooden House',
  blocks: [
    // Floor (5x5 instead of 7x7)
    ...createBlockBox(-2, 0, -2, 5, 1, 5, '#8b4513', 'plank'),
    
    // Walls (hollow)
    ...createBlockBox(-2, 1, -2, 5, 3, 1, '#deb887', 'plank'),  // Back wall
    ...createBlockBox(-2, 1, 2, 5, 3, 1, '#deb887', 'plank'),   // Front wall
    ...createBlockBox(-2, 1, -1, 1, 3, 3, '#deb887', 'plank'),  // Left wall
    ...createBlockBox(2, 1, -1, 1, 3, 3, '#deb887', 'plank'),   // Right wall
    
    // Door opening
    { x: 0, y: 1, z: 2, color: '#654321', type: 'wood' },
    { x: 0, y: 2, z: 2, color: '#654321', type: 'wood' },
    
    // Windows
    { x: -1, y: 2, z: 2, color: '#87ceeb', type: 'glass' },
    { x: 1, y: 2, z: 2, color: '#87ceeb', type: 'glass' },
    
    // Roof (pyramid)
    ...createBlockBox(-3, 4, -3, 7, 1, 7, '#8b0000', 'brick'),
    ...createBlockBox(-2, 5, -2, 5, 1, 5, '#8b0000', 'brick'),
    ...createBlockBox(-1, 6, -1, 3, 1, 3, '#8b0000', 'brick'),
    { x: 0, y: 7, z: 0, color: '#8b0000', type: 'brick' },
  ]
};

export const towerPrefab: StructurePrefab = {
  name: 'Stone Tower',
  blocks: (() => {
    const blocks: Omit<Block, 'id'>[] = [];
    const height = 8; // Reduced from 12
    
    // Tower body (hollow cylinder approximation)
    for (let y = 0; y < height; y++) {
      for (let x = -2; x <= 2; x++) {
        for (let z = -2; z <= 2; z++) {
          const dist = Math.sqrt(x * x + z * z);
          if (dist <= 1.8 && dist > 1.0) { // Reduced radius 2.5->1.8
            blocks.push({ x, y, z, color: '#808080', type: 'stone' });
          }
        }
      }
    }
    
    // Floor
    blocks.push(...createBlockBox(-2, 0, -2, 5, 1, 5, '#696969', 'stone'));
    
    // Windows (every 3 levels)
    blocks.push({ x: 0, y: 3, z: 2, color: '#87ceeb', type: 'glass' });
    blocks.push({ x: 0, y: 6, z: 2, color: '#87ceeb', type: 'glass' });
    
    // Battlements at top
    for (let x = -2; x <= 2; x++) {
      for (let z = -2; z <= 2; z++) {
        const dist = Math.sqrt(x * x + z * z);
        if (dist <= 2.2 && dist > 1.5) {
          blocks.push({ x, y: height, z, color: '#808080', type: 'stone' });
          if ((x + z) % 2 === 0) {
            blocks.push({ x, y: height + 1, z, color: '#808080', type: 'stone' });
          }
        }
      }
    }
    
    return blocks;
  })()
};

export const wineBarrelPrefab: StructurePrefab = {
  name: 'Wine Barrel',
  blocks: (() => {
    const blocks: Omit<Block, 'id'>[] = [];
    
    // Barrel body (horizontal cylinder)
    for (let z = -2; z <= 2; z++) {
      for (let x = -1; x <= 1; x++) {
        for (let y = 0; y <= 2; y++) {
          const dist = Math.sqrt(x * x + (y - 1) * (y - 1));
          if (dist <= 1.5) {
            blocks.push({ x, y, z, color: '#8b4513', type: 'wood' });
          }
        }
      }
    }
    
    // Metal bands
    blocks.push({ x: 0, y: 0, z: -2, color: '#4a4a4a', type: 'stone' });
    blocks.push({ x: 0, y: 2, z: -2, color: '#4a4a4a', type: 'stone' });
    blocks.push({ x: 0, y: 0, z: 2, color: '#4a4a4a', type: 'stone' });
    blocks.push({ x: 0, y: 2, z: 2, color: '#4a4a4a', type: 'stone' });
    
    // Spigot
    blocks.push({ x: 0, y: 1, z: 3, color: '#c0c0c0', type: 'stone' });
    
    return blocks;
  })()
};

export const templePrefab: StructurePrefab = {
  name: 'Ancient Temple',
  blocks: (() => {
    const blocks: Omit<Block, 'id'>[] = [];
    
    // Platform/steps (Reduced from 13 to 9)
    blocks.push(...createBlockBox(-4, 0, -4, 9, 1, 9, '#d4c4a8', 'stone'));
    blocks.push(...createBlockBox(-3, 1, -3, 7, 1, 7, '#d4c4a8', 'stone'));
    blocks.push(...createBlockBox(-2, 2, -2, 5, 1, 5, '#d4c4a8', 'stone'));
    
    // Pillars
    const pillarPositions = [
      [-2, -2], [2, -2], [-2, 2], [2, 2],
      [0, -2], [0, 2], [-2, 0], [2, 0]
    ];
    for (const [px, pz] of pillarPositions) {
      for (let y = 3; y < 7; y++) { // Height reduced
        blocks.push({ x: px, y, z: pz, color: '#f5f5dc', type: 'stone' });
      }
    }
    
    // Roof
    blocks.push(...createBlockBox(-3, 7, -3, 7, 1, 7, '#cd853f', 'wood'));
    blocks.push(...createBlockBox(-2, 8, -2, 5, 1, 5, '#cd853f', 'wood'));
    blocks.push(...createBlockBox(-1, 9, -1, 3, 1, 3, '#cd853f', 'wood'));
    
    // Altar in center
    blocks.push(...createBlockBox(-1, 3, -1, 3, 1, 3, '#808080', 'stone'));
    blocks.push({ x: 0, y: 4, z: 0, color: '#ffd700', type: 'stone' }); // Gold top
    
    return blocks;
  })()
};

export const treePrefab: StructurePrefab = {
  name: 'Giant Oak Tree',
  blocks: (() => {
    const blocks: Omit<Block, 'id'>[] = [];
    
    // Trunk (thick)
    for (let y = 0; y < 8; y++) {
      blocks.push(...createBlockBox(-1, y, -1, 3, 1, 3, '#654321', 'wood'));
    }
    
    // Branches and canopy
    const canopyLevels = [
      { y: 6, radius: 4 },
      { y: 7, radius: 5 },
      { y: 8, radius: 5 },
      { y: 9, radius: 4 },
      { y: 10, radius: 3 },
      { y: 11, radius: 2 },
    ];
    
    for (const level of canopyLevels) {
      for (let x = -level.radius; x <= level.radius; x++) {
        for (let z = -level.radius; z <= level.radius; z++) {
          const dist = Math.sqrt(x * x + z * z);
          if (dist <= level.radius) {
            // Add some randomness by skipping some blocks
            if (Math.random() > 0.15) {
              const isApple = Math.random() < 0.05;
              blocks.push({
                x, y: level.y, z,
                color: isApple ? '#ef4444' : '#228b22',
                type: isApple ? 'apple' : 'leaf'
              });
            }
          }
        }
      }
    }
    
    return blocks;
  })()
};

export const fountainPrefab: StructurePrefab = {
  name: 'Water Fountain',
  blocks: (() => {
    const blocks: Omit<Block, 'id'>[] = [];
    
    // Base pool (octagonal approximation)
    for (let x = -3; x <= 3; x++) {
      for (let z = -3; z <= 3; z++) {
        const dist = Math.abs(x) + Math.abs(z);
        if (dist <= 4) {
          blocks.push({ x, y: 0, z, color: '#808080', type: 'stone' });
          if (dist > 2) {
            blocks.push({ x, y: 1, z, color: '#808080', type: 'stone' });
          }
        }
      }
    }
    
    // Water
    for (let x = -2; x <= 2; x++) {
      for (let z = -2; z <= 2; z++) {
        const dist = Math.abs(x) + Math.abs(z);
        if (dist <= 3) {
          blocks.push({ x, y: 1, z, color: '#3b82f6', type: 'water' });
        }
      }
    }
    
    // Central pillar
    for (let y = 1; y <= 4; y++) {
      blocks.push({ x: 0, y, z: 0, color: '#c0c0c0', type: 'stone' });
    }
    
    // Spout/top
    blocks.push({ x: 0, y: 5, z: 0, color: '#d4d4d4', type: 'stone' });
    blocks.push({ x: -1, y: 5, z: 0, color: '#c0c0c0', type: 'stone' });
    blocks.push({ x: 1, y: 5, z: 0, color: '#c0c0c0', type: 'stone' });
    blocks.push({ x: 0, y: 5, z: -1, color: '#c0c0c0', type: 'stone' });
    blocks.push({ x: 0, y: 5, z: 1, color: '#c0c0c0', type: 'stone' });
    
    // Water spray effect (falling water)
    blocks.push({ x: 0, y: 4, z: 1, color: '#60a5fa', type: 'water' });
    blocks.push({ x: 0, y: 3, z: 1, color: '#60a5fa', type: 'water' });
    blocks.push({ x: 1, y: 4, z: 0, color: '#60a5fa', type: 'water' });
    blocks.push({ x: 1, y: 3, z: 0, color: '#60a5fa', type: 'water' });
    
    return blocks;
  })()
};

export const bushPrefab: StructurePrefab = {
  name: 'Bush',
  blocks: (() => {
    const blocks: Omit<Block, 'id'>[] = [];
    
    // Dense, low leaf cluster
    for (let x = -1; x <= 1; x++) {
      for (let z = -1; z <= 1; z++) {
        for (let y = 0; y <= 1; y++) {
          if (Math.random() > 0.15) {
            const isBerry = Math.random() < 0.1;
            blocks.push({
              x, y, z,
              color: isBerry ? '#dc2626' : '#166534',
              type: isBerry ? 'apple' : 'leaf'
            });
          }
        }
      }
    }
    // Top
    blocks.push({ x: 0, y: 2, z: 0, color: '#15803d', type: 'leaf' });
    
    return blocks;
  })()
};

export const portalPrefab: StructurePrefab = {
  name: 'Mystical Portal',
  blocks: (() => {
    const blocks: Omit<Block, 'id'>[] = [];
    
    // Obsidian frame
    // Bottom
    for (let x = -2; x <= 2; x++) {
      blocks.push({ x, y: 0, z: 0, color: '#1e1b4b', type: 'obsidian' });
    }
    // Sides
    for (let y = 1; y <= 4; y++) {
      blocks.push({ x: -2, y, z: 0, color: '#1e1b4b', type: 'obsidian' });
      blocks.push({ x: 2, y, z: 0, color: '#1e1b4b', type: 'obsidian' });
    }
    // Top
    for (let x = -2; x <= 2; x++) {
      blocks.push({ x, y: 5, z: 0, color: '#1e1b4b', type: 'obsidian' });
    }
    
    // Portal interior (purple/magical)
    for (let x = -1; x <= 1; x++) {
      for (let y = 1; y <= 4; y++) {
        blocks.push({ x, y, z: 0, color: '#a855f7', type: 'portal' });
      }
    }
    
    // Corner decorations
    blocks.push({ x: -2, y: 0, z: -1, color: '#7c3aed', type: 'stone' });
    blocks.push({ x: 2, y: 0, z: -1, color: '#7c3aed', type: 'stone' });
    blocks.push({ x: -2, y: 0, z: 1, color: '#7c3aed', type: 'stone' });
    blocks.push({ x: 2, y: 0, z: 1, color: '#7c3aed', type: 'stone' });
    
    return blocks;
  })()
};

export const fireplacePrefab: StructurePrefab = {
  name: 'Fireplace',
  blocks: (() => {
    const blocks: Omit<Block, 'id'>[] = [];
    
    // Stone base
    blocks.push(...createBlockBox(-1, 0, -1, 3, 1, 3, '#525252', 'stone'));
    
    // Fire blocks (orange/red)
    blocks.push({ x: 0, y: 1, z: 0, color: '#f97316', type: 'fire' });
    blocks.push({ x: 0, y: 2, z: 0, color: '#ef4444', type: 'fire' });
    
    // Side stones
    blocks.push({ x: -1, y: 1, z: 0, color: '#404040', type: 'stone' });
    blocks.push({ x: 1, y: 1, z: 0, color: '#404040', type: 'stone' });
    blocks.push({ x: 0, y: 1, z: -1, color: '#404040', type: 'stone' });
    blocks.push({ x: 0, y: 1, z: 1, color: '#404040', type: 'stone' });
    
    return blocks;
  })()
};

// Export all prefabs
export const structurePrefabs = {
  house: housePrefab,
  tower: towerPrefab,
  wineBarrel: wineBarrelPrefab,
  temple: templePrefab,
  fountain: fountainPrefab,
  bush: bushPrefab,
  portal: portalPrefab,
  fireplace: fireplacePrefab,
};

