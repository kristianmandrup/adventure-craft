import { CharacterPart } from '../../types';

/**
 * Predefined character prefabs for quick spawning without AI API calls.
 * Each character has segmented body parts for animation.
 */

export interface CharacterPrefab {
  name: string;
  parts: CharacterPart[];
  maxHp: number;
}

// Helper to create a simple box of voxels
const createBox = (
  startX: number, startY: number, startZ: number,
  width: number, height: number, depth: number,
  color: string
) => {
  const voxels = [];
  for (let x = startX; x < startX + width; x++) {
    for (let y = startY; y < startY + height; y++) {
      for (let z = startZ; z < startZ + depth; z++) {
        voxels.push({ x, y, z, color });
      }
    }
  }
  return voxels;
};

// ============ ANIMALS ============

export const sheepPrefab: CharacterPrefab = {
  name: 'Sheep',
  maxHp: 10,
  parts: [
    { name: 'head', voxels: [
      ...createBox(-1, 4, 3, 2, 2, 2, '#f5f5f5'),  // Head
      { x: -1, y: 5, z: 5, color: '#1a1a1a' },     // Eye left
      { x: 0, y: 5, z: 5, color: '#1a1a1a' },      // Eye right
    ]},
    { name: 'body', voxels: [
      ...createBox(-2, 2, -2, 4, 3, 5, '#f5f5f5'), // Fluffy body
    ]},
    { name: 'left_arm', voxels: createBox(-2, 0, 1, 1, 2, 1, '#3d3d3d') },
    { name: 'right_arm', voxels: createBox(1, 0, 1, 1, 2, 1, '#3d3d3d') },
    { name: 'left_leg', voxels: createBox(-2, 0, -1, 1, 2, 1, '#3d3d3d') },
    { name: 'right_leg', voxels: createBox(1, 0, -1, 1, 2, 1, '#3d3d3d') },
  ]
};

export const cowPrefab: CharacterPrefab = {
  name: 'Cow',
  maxHp: 15,
  parts: [
    { name: 'head', voxels: [
      ...createBox(-2, 3, 4, 4, 3, 2, '#4a3728'),  // Head
      { x: -2, y: 5, z: 6, color: '#1a1a1a' },     // Eye left
      { x: 1, y: 5, z: 6, color: '#1a1a1a' },      // Eye right
      ...createBox(-1, 3, 6, 2, 1, 1, '#ffc0cb'),  // Nose
    ]},
    { name: 'body', voxels: [
      ...createBox(-2, 2, -3, 4, 3, 7, '#4a3728'),
      ...createBox(-2, 2, -1, 4, 3, 3, '#f5f5f5'), // White patch
    ]},
    { name: 'left_arm', voxels: createBox(-2, 0, 2, 1, 2, 1, '#4a3728') },
    { name: 'right_arm', voxels: createBox(1, 0, 2, 1, 2, 1, '#4a3728') },
    { name: 'left_leg', voxels: createBox(-2, 0, -2, 1, 2, 1, '#4a3728') },
    { name: 'right_leg', voxels: createBox(1, 0, -2, 1, 2, 1, '#4a3728') },
  ]
};

export const pigPrefab: CharacterPrefab = {
  name: 'Pig',
  maxHp: 10,
  parts: [
    { name: 'head', voxels: [
      ...createBox(-1, 3, 2, 3, 3, 2, '#f5a9b8'),  // Head
      { x: -1, y: 5, z: 4, color: '#1a1a1a' },     // Eye left
      { x: 1, y: 5, z: 4, color: '#1a1a1a' },      // Eye right
      ...createBox(0, 3, 4, 1, 2, 1, '#d4838f'),   // Snout
    ]},
    { name: 'body', voxels: createBox(-2, 2, -2, 4, 3, 4, '#f5a9b8') },
    { name: 'left_arm', voxels: createBox(-2, 0, 0, 1, 2, 1, '#d4838f') },
    { name: 'right_arm', voxels: createBox(1, 0, 0, 1, 2, 1, '#d4838f') },
    { name: 'left_leg', voxels: createBox(-2, 0, -2, 1, 2, 1, '#d4838f') },
    { name: 'right_leg', voxels: createBox(1, 0, -2, 1, 2, 1, '#d4838f') },
  ]
};

export const chickenPrefab: CharacterPrefab = {
  name: 'Chicken',
  maxHp: 5,
  parts: [
    { name: 'head', voxels: [
      ...createBox(0, 4, 1, 2, 2, 2, '#f5f5f5'),   // Head
      { x: 0, y: 5, z: 3, color: '#1a1a1a' },      // Eye
      { x: 1, y: 4, z: 3, color: '#ff6b35' },      // Beak
      { x: 0, y: 6, z: 1, color: '#ff3333' },      // Comb
    ]},
    { name: 'body', voxels: createBox(-1, 1, -1, 3, 3, 3, '#f5f5f5') },
    { name: 'left_arm', voxels: createBox(-2, 2, 0, 1, 2, 1, '#f5f5f5') },  // Wing
    { name: 'right_arm', voxels: createBox(2, 2, 0, 1, 2, 1, '#f5f5f5') },  // Wing
    { name: 'left_leg', voxels: createBox(0, 0, 0, 1, 1, 1, '#ff6b35') },
    { name: 'right_leg', voxels: createBox(1, 0, 0, 1, 1, 1, '#ff6b35') },
  ]
};

export const fishPrefab: CharacterPrefab = {
  name: 'Tropical Fish',
  maxHp: 5,
  parts: [
    { name: 'head', voxels: [
      { x: 0, y: 0, z: 2, color: '#ff6b35' },
      { x: 0, y: 1, z: 2, color: '#1a1a1a' },  // Eye
    ]},
    { name: 'body', voxels: [
      ...createBox(-1, 0, -1, 2, 2, 3, '#ff6b35'),
      { x: 0, y: 0, z: 0, color: '#00bfff' },  // Stripe
      { x: 0, y: 1, z: 0, color: '#00bfff' },
    ]},
    { name: 'left_arm', voxels: [{ x: -2, y: 1, z: 0, color: '#ff6b35' }] },   // Fin
    { name: 'right_arm', voxels: [{ x: 1, y: 1, z: 0, color: '#ff6b35' }] },   // Fin
    { name: 'left_leg', voxels: [{ x: 0, y: 0, z: -2, color: '#ff6b35' }] },   // Tail
    { name: 'right_leg', voxels: [{ x: 0, y: 1, z: -2, color: '#ff6b35' }] },  // Tail
  ]
};

export const horsePrefab: CharacterPrefab = {
  name: 'Horse',
  maxHp: 20,
  parts: [
    { name: 'head', voxels: [
      ...createBox(-1, 5, 4, 2, 3, 3, '#8b4513'),  // Head
      { x: -1, y: 7, z: 6, color: '#1a1a1a' },     // Eye
      { x: 0, y: 7, z: 6, color: '#1a1a1a' },
      ...createBox(-1, 8, 4, 2, 2, 1, '#5c3317'),  // Mane
    ]},
    { name: 'body', voxels: [
      ...createBox(-2, 3, -3, 4, 4, 7, '#8b4513'),
      ...createBox(-1, 7, -2, 2, 1, 4, '#5c3317'), // Mane on back
    ]},
    { name: 'left_arm', voxels: createBox(-2, 0, 2, 1, 3, 1, '#8b4513') },
    { name: 'right_arm', voxels: createBox(1, 0, 2, 1, 3, 1, '#8b4513') },
    { name: 'left_leg', voxels: createBox(-2, 0, -2, 1, 3, 1, '#8b4513') },
    { name: 'right_leg', voxels: createBox(1, 0, -2, 1, 3, 1, '#8b4513') },
  ]
};

// ============ ENEMIES ============

export const zombiePrefab: CharacterPrefab = {
  name: 'Zombie',
  maxHp: 30,
  parts: [
    { name: 'head', voxels: [
      ...createBox(-2, 10, -1, 4, 4, 4, '#5a7a5a'),  // Green head
      { x: -1, y: 12, z: 3, color: '#1a1a1a' },      // Eye left
      { x: 1, y: 12, z: 3, color: '#1a1a1a' },       // Eye right
      { x: 0, y: 11, z: 3, color: '#3d5c3d' },       // Mouth
    ]},
    { name: 'body', voxels: [
      ...createBox(-2, 5, 0, 4, 5, 2, '#4a6a4a'),    // Torso (tattered shirt)
      ...createBox(-2, 5, 0, 4, 2, 2, '#3d5c3d'),    // Lower torso
    ]},
    { name: 'left_arm', voxels: [
      ...createBox(-4, 6, 0, 2, 5, 2, '#5a7a5a'),    // Extended arm
    ]},
    { name: 'right_arm', voxels: [
      ...createBox(2, 6, 0, 2, 5, 2, '#5a7a5a'),
    ]},
    { name: 'left_leg', voxels: createBox(-2, 0, 0, 2, 5, 2, '#3a4a6a') },  // Torn pants
    { name: 'right_leg', voxels: createBox(0, 0, 0, 2, 5, 2, '#3a4a6a') },
  ]
};

export const skeletonPrefab: CharacterPrefab = {
  name: 'Skeleton',
  maxHp: 20,
  parts: [
    { name: 'head', voxels: [
      ...createBox(-2, 10, -1, 4, 4, 4, '#e8e8e8'),  // Skull
      { x: -1, y: 12, z: 3, color: '#1a1a1a' },      // Eye socket left
      { x: 1, y: 12, z: 3, color: '#1a1a1a' },       // Eye socket right
      { x: 0, y: 10, z: 3, color: '#1a1a1a' },       // Nose
    ]},
    { name: 'body', voxels: [
      { x: 0, y: 9, z: 0, color: '#d4d4d4' },        // Spine
      { x: 0, y: 8, z: 0, color: '#d4d4d4' },
      { x: 0, y: 7, z: 0, color: '#d4d4d4' },
      { x: 0, y: 6, z: 0, color: '#d4d4d4' },
      ...createBox(-2, 8, 0, 5, 1, 1, '#d4d4d4'),    // Ribs
      ...createBox(-2, 7, 0, 5, 1, 1, '#d4d4d4'),
      { x: 0, y: 5, z: 0, color: '#d4d4d4' },        // Pelvis
    ]},
    { name: 'left_arm', voxels: [
      { x: -3, y: 9, z: 0, color: '#d4d4d4' },
      { x: -3, y: 8, z: 0, color: '#d4d4d4' },
      { x: -3, y: 7, z: 0, color: '#d4d4d4' },
      { x: -3, y: 6, z: 0, color: '#d4d4d4' },
    ]},
    { name: 'right_arm', voxels: [
      { x: 3, y: 9, z: 0, color: '#d4d4d4' },
      { x: 3, y: 8, z: 0, color: '#d4d4d4' },
      { x: 3, y: 7, z: 0, color: '#d4d4d4' },
      { x: 3, y: 6, z: 0, color: '#d4d4d4' },
    ]},
    { name: 'left_leg', voxels: [
      { x: -1, y: 4, z: 0, color: '#d4d4d4' },
      { x: -1, y: 3, z: 0, color: '#d4d4d4' },
      { x: -1, y: 2, z: 0, color: '#d4d4d4' },
      { x: -1, y: 1, z: 0, color: '#d4d4d4' },
      { x: -1, y: 0, z: 0, color: '#d4d4d4' },
    ]},
    { name: 'right_leg', voxels: [
      { x: 1, y: 4, z: 0, color: '#d4d4d4' },
      { x: 1, y: 3, z: 0, color: '#d4d4d4' },
      { x: 1, y: 2, z: 0, color: '#d4d4d4' },
      { x: 1, y: 1, z: 0, color: '#d4d4d4' },
      { x: 1, y: 0, z: 0, color: '#d4d4d4' },
    ]},
  ]
};

export const sorcererPrefab: CharacterPrefab = {
  name: 'Evil Sorcerer',
  maxHp: 50,
  parts: [
    { name: 'head', voxels: [
      ...createBox(-2, 12, -1, 4, 4, 4, '#4a3a5a'),   // Hood
      ...createBox(-1, 12, 2, 2, 2, 1, '#2a1a2a'),    // Face shadow
      { x: -1, y: 13, z: 3, color: '#a855f7' },       // Glowing eye left
      { x: 1, y: 13, z: 3, color: '#a855f7' },        // Glowing eye right
      ...createBox(-1, 16, 0, 2, 2, 2, '#4a3a5a'),    // Hood tip
    ]},
    { name: 'body', voxels: [
      ...createBox(-3, 4, -1, 6, 8, 3, '#2a1a3a'),    // Robe
      ...createBox(-2, 4, -1, 4, 2, 3, '#1a0a2a'),    // Robe bottom
    ]},
    { name: 'left_arm', voxels: [
      ...createBox(-5, 8, 0, 2, 5, 2, '#2a1a3a'),
      { x: -5, y: 8, z: 0, color: '#a855f7' },        // Magic glow
    ]},
    { name: 'right_arm', voxels: [
      ...createBox(3, 8, 0, 2, 5, 2, '#2a1a3a'),
      { x: 4, y: 8, z: 0, color: '#a855f7' },
    ]},
    { name: 'left_leg', voxels: createBox(-2, 0, 0, 2, 4, 2, '#1a0a2a') },
    { name: 'right_leg', voxels: createBox(0, 0, 0, 2, 4, 2, '#1a0a2a') },
  ]
};

export const spiderPrefab: CharacterPrefab = {
  name: 'Giant Spider',
  maxHp: 20,
  parts: [
    { name: 'head', voxels: [
      ...createBox(-1, 2, 3, 3, 2, 2, '#1a1a1a'),    // Head
      { x: -1, y: 3, z: 5, color: '#ff0000' },       // Eye
      { x: 0, y: 3, z: 5, color: '#ff0000' },
      { x: 1, y: 3, z: 5, color: '#ff0000' },
      { x: -1, y: 2, z: 5, color: '#ff0000' },
      { x: 1, y: 2, z: 5, color: '#ff0000' },
    ]},
    { name: 'body', voxels: [
      ...createBox(-2, 1, -3, 5, 3, 6, '#2a2a2a'),   // Abdomen
      ...createBox(-1, 2, -4, 3, 2, 2, '#1a1a1a'),   // Spinnerets
    ]},
    { name: 'left_arm', voxels: [  // Front left legs
      { x: -3, y: 1, z: 2, color: '#1a1a1a' },
      { x: -4, y: 2, z: 3, color: '#1a1a1a' },
      { x: -5, y: 1, z: 4, color: '#1a1a1a' },
      { x: -3, y: 1, z: 0, color: '#1a1a1a' },
      { x: -4, y: 2, z: 0, color: '#1a1a1a' },
      { x: -5, y: 1, z: -1, color: '#1a1a1a' },
    ]},
    { name: 'right_arm', voxels: [  // Front right legs
      { x: 3, y: 1, z: 2, color: '#1a1a1a' },
      { x: 4, y: 2, z: 3, color: '#1a1a1a' },
      { x: 5, y: 1, z: 4, color: '#1a1a1a' },
      { x: 3, y: 1, z: 0, color: '#1a1a1a' },
      { x: 4, y: 2, z: 0, color: '#1a1a1a' },
      { x: 5, y: 1, z: -1, color: '#1a1a1a' },
    ]},
    { name: 'left_leg', voxels: [  // Back left legs
      { x: -3, y: 1, z: -2, color: '#1a1a1a' },
      { x: -4, y: 2, z: -2, color: '#1a1a1a' },
      { x: -5, y: 1, z: -3, color: '#1a1a1a' },
      { x: -3, y: 1, z: -4, color: '#1a1a1a' },
      { x: -4, y: 2, z: -4, color: '#1a1a1a' },
      { x: -5, y: 1, z: -5, color: '#1a1a1a' },
    ]},
    { name: 'right_leg', voxels: [  // Back right legs
      { x: 3, y: 1, z: -2, color: '#1a1a1a' },
      { x: 4, y: 2, z: -2, color: '#1a1a1a' },
      { x: 5, y: 1, z: -3, color: '#1a1a1a' },
      { x: 3, y: 1, z: -4, color: '#1a1a1a' },
      { x: 4, y: 2, z: -4, color: '#1a1a1a' },
      { x: 5, y: 1, z: -5, color: '#1a1a1a' },
    ]},
  ]
};

export const giantPrefab: CharacterPrefab = {
  name: 'Giant Ogre',
  maxHp: 100,
  parts: [
    { name: 'head', voxels: [
      ...createBox(-3, 14, -2, 6, 5, 5, '#4a6a3a'),   // Head
      { x: -2, y: 17, z: 3, color: '#1a1a1a' },       // Eye left
      { x: 2, y: 17, z: 3, color: '#1a1a1a' },        // Eye right
      ...createBox(-1, 14, 3, 3, 2, 1, '#3a5a2a'),    // Jaw
    ]},
    { name: 'body', voxels: [
      ...createBox(-4, 6, -2, 8, 8, 5, '#5a7a4a'),    // Torso
      ...createBox(-3, 4, -1, 6, 2, 3, '#4a3a2a'),    // Belt
    ]},
    { name: 'left_arm', voxels: [
      ...createBox(-7, 8, 0, 3, 7, 3, '#4a6a3a'),
      ...createBox(-7, 6, 0, 3, 2, 3, '#4a6a3a'),
    ]},
    { name: 'right_arm', voxels: [
      ...createBox(4, 8, 0, 3, 7, 3, '#4a6a3a'),
      ...createBox(4, 6, 0, 3, 2, 3, '#4a6a3a'),
    ]},
    { name: 'left_leg', voxels: createBox(-4, 0, 0, 3, 6, 3, '#3a4a2a') },
    { name: 'right_leg', voxels: createBox(1, 0, 0, 3, 6, 3, '#3a4a2a') },
  ]
};

// ============ NPCs ============

export const villagerPrefab: CharacterPrefab = {
  name: 'Villager',
  maxHp: 50,
  parts: [
    { name: 'head', voxels: [
      ...createBox(-2, 10, -1, 4, 4, 4, '#deb887'),   // Face
      { x: -1, y: 12, z: 3, color: '#1a1a1a' },       // Eye left
      { x: 1, y: 12, z: 3, color: '#1a1a1a' },        // Eye right
      { x: 0, y: 11, z: 3, color: '#c9a876' },        // Nose
      ...createBox(-2, 13, -1, 4, 2, 4, '#654321'),   // Hair
    ]},
    { name: 'body', voxels: [
      ...createBox(-2, 5, 0, 4, 5, 2, '#8b4513'),     // Brown tunic
      ...createBox(-2, 5, 0, 4, 2, 2, '#654321'),     // Belt area
    ]},
    { name: 'left_arm', voxels: [
      ...createBox(-4, 6, 0, 2, 5, 2, '#deb887'),
    ]},
    { name: 'right_arm', voxels: [
      ...createBox(2, 6, 0, 2, 5, 2, '#deb887'),
    ]},
    { name: 'left_leg', voxels: createBox(-2, 0, 0, 2, 5, 2, '#2f4f4f') },
    { name: 'right_leg', voxels: createBox(0, 0, 0, 2, 5, 2, '#2f4f4f') },
  ]
};

export const knightPrefab: CharacterPrefab = {
  name: 'Royal Knight',
  maxHp: 80,
  parts: [
    { name: 'head', voxels: [
      ...createBox(-2, 11, -1, 4, 4, 4, '#c0c0c0'),   // Helmet
      ...createBox(-1, 12, 3, 2, 2, 1, '#1a1a1a'),    // Visor slit
      { x: 0, y: 15, z: 0, color: '#ff0000' },        // Plume
      { x: 0, y: 16, z: 0, color: '#ff0000' },
    ]},
    { name: 'body', voxels: [
      ...createBox(-3, 5, -1, 6, 6, 3, '#c0c0c0'),    // Armor
      ...createBox(-2, 6, 2, 4, 4, 1, '#ffd700'),     // Crest
    ]},
    { name: 'left_arm', voxels: [
      ...createBox(-5, 6, 0, 2, 6, 2, '#c0c0c0'),
    ]},
    { name: 'right_arm', voxels: [
      ...createBox(3, 6, 0, 2, 6, 2, '#c0c0c0'),
    ]},
    { name: 'left_leg', voxels: createBox(-2, 0, 0, 2, 5, 2, '#a0a0a0') },
    { name: 'right_leg', voxels: createBox(0, 0, 0, 2, 5, 2, '#a0a0a0') },
  ]
};

export const wizardPrefab: CharacterPrefab = {
  name: 'Old Wizard',
  maxHp: 40,
  parts: [
    { name: 'head', voxels: [
      ...createBox(-2, 10, -1, 4, 4, 4, '#deb887'),   // Face
      { x: -1, y: 12, z: 3, color: '#1a1a1a' },       // Eye left
      { x: 1, y: 12, z: 3, color: '#1a1a1a' },        // Eye right
      ...createBox(-1, 10, 3, 2, 2, 1, '#e0e0e0'),    // Beard
      ...createBox(-1, 8, 3, 2, 2, 1, '#e0e0e0'),     // Long beard
      ...createBox(-2, 13, -1, 4, 4, 4, '#4169e1'),   // Hat
      ...createBox(-1, 17, 0, 2, 2, 2, '#4169e1'),    // Hat tip
    ]},
    { name: 'body', voxels: [
      ...createBox(-2, 4, 0, 4, 6, 2, '#4169e1'),     // Robe
      ...createBox(-3, 4, 0, 6, 2, 2, '#4169e1'),     // Robe bottom
    ]},
    { name: 'left_arm', voxels: [
      ...createBox(-4, 6, 0, 2, 5, 2, '#4169e1'),
    ]},
    { name: 'right_arm', voxels: [
      ...createBox(2, 6, 0, 2, 5, 2, '#4169e1'),
      { x: 3, y: 6, z: 1, color: '#8b4513' },         // Staff
      { x: 3, y: 7, z: 1, color: '#8b4513' },
      { x: 3, y: 8, z: 1, color: '#8b4513' },
      { x: 3, y: 9, z: 1, color: '#00bfff' },         // Staff gem
    ]},
    { name: 'left_leg', voxels: createBox(-2, 0, 0, 2, 4, 2, '#4169e1') },
    { name: 'right_leg', voxels: createBox(0, 0, 0, 2, 4, 2, '#4169e1') },
  ]
};

export const merchantPrefab: CharacterPrefab = {
  name: 'Merchant',
  maxHp: 50,
  parts: [
    { name: 'head', voxels: [
      ...createBox(-2, 10, -1, 4, 4, 4, '#deb887'),   // Face
      { x: -1, y: 12, z: 3, color: '#1a1a1a' },       // Eye left
      { x: 1, y: 12, z: 3, color: '#1a1a1a' },        // Eye right
      { x: 0, y: 11, z: 3, color: '#c9a876' },        // Nose
      ...createBox(-2, 13, -1, 4, 1, 4, '#8b4513'),   // Hat brim
      ...createBox(-1, 14, 0, 2, 2, 2, '#8b4513'),    // Hat top
    ]},
    { name: 'body', voxels: [
      ...createBox(-2, 5, 0, 4, 5, 2, '#ffd700'),     // Gold/Yellow tunic
      ...createBox(-2, 5, 0, 4, 2, 2, '#daa520'),     // Belt area
      { x: 0, y: 6, z: 2, color: '#c0c0c0' },         // Belt buckle
    ]},
    { name: 'left_arm', voxels: [
      ...createBox(-4, 6, 0, 2, 5, 2, '#deb887'),
    ]},
    { name: 'right_arm', voxels: [
      ...createBox(2, 6, 0, 2, 5, 2, '#deb887'),
    ]},
    { name: 'left_leg', voxels: createBox(-2, 0, 0, 2, 5, 2, '#654321') },
    { name: 'right_leg', voxels: createBox(0, 0, 0, 2, 5, 2, '#654321') },
  ]
};

// Export all prefabs by category
export const animalPrefabs = {
  sheep: sheepPrefab,
  cow: cowPrefab,
  pig: pigPrefab,
  chicken: chickenPrefab,
  fish: fishPrefab,
  horse: horsePrefab,
};

export const enemyPrefabs = {
  zombie: zombiePrefab,
  skeleton: skeletonPrefab,
  sorcerer: sorcererPrefab,
  spider: spiderPrefab,
  giant: giantPrefab,
};

export const npcPrefabs = {
  villager: villagerPrefab,
  knight: knightPrefab,
  wizard: wizardPrefab,
  merchant: merchantPrefab,
};

