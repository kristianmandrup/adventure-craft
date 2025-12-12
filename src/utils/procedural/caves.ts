import { CaveSpawn } from './types';

// Generate a cave at the given surface position
export const generateCave = (
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
