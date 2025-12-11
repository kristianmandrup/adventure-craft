import * as THREE from 'three';
import { Block } from '../types';

export const GRAVITY = 18.0;
export const JUMP_FORCE = 13.0; // Increased from 8.0 for 2x height
export const SPEED = 10.0;  // Base walk speed
export const MAX_SPRINT_SPEED = 18.0;
export const ACCELERATION = 20.0;
export const DECELERATION = 10.0;
export const PLAYER_HEIGHT = 1.8;
export const PLAYER_WIDTH = 0.6;

// Convert block list to a Map for O(1) collision lookup
export const createBlockMap = (blocks: Block[]) => {
  const map = new Map<string, Block>();
  blocks.forEach(b => {
    map.set(`${Math.round(b.x)},${Math.round(b.y)},${Math.round(b.z)}`, b);
  });
  return map;
};

// AABB Collision Detection
export const resolveCollision = (
  position: THREE.Vector3, 
  velocity: THREE.Vector3, 
  delta: number, 
  blockMap: Map<string, Block>
) => {
  const newPos = position.clone();
  
  // Apply Gravity
  velocity.y -= GRAVITY * delta;
  
  // Try X movement
  newPos.x += velocity.x * delta;
  if (checkCollision(newPos, blockMap)) {
    newPos.x -= velocity.x * delta;
    velocity.x = 0;
  }

  // Try Z movement
  newPos.z += velocity.z * delta;
  if (checkCollision(newPos, blockMap)) {
    newPos.z -= velocity.z * delta;
    velocity.z = 0;
  }

  // Try Y movement
  newPos.y += velocity.y * delta;
  let onGround = false;
  
  if (checkCollision(newPos, blockMap)) {
    if (velocity.y < 0) onGround = true;
    newPos.y -= velocity.y * delta;
    velocity.y = 0;
  }

  // Floor check (simple infinite plane at y = -2 for water level safety)
  if (newPos.y < -2) {
      newPos.y = -2;
      velocity.y = 0;
      onGround = true;
  }

  return { position: newPos, velocity, onGround };
};

const checkCollision = (pos: THREE.Vector3, blockMap: Map<string, Block>) => {
  // Check bounds of player against integer block coordinates
  // Player is roughly -WIDTH/2 to WIDTH/2 in X/Z and 0 to HEIGHT in Y relative to pos
  
  const minX = Math.floor(pos.x - PLAYER_WIDTH / 2);
  const maxX = Math.floor(pos.x + PLAYER_WIDTH / 2);
  const minY = Math.floor(pos.y);
  const maxY = Math.floor(pos.y + PLAYER_HEIGHT - 0.1); // -0.1 to avoid head hitting ceiling when standing exactly below
  const minZ = Math.floor(pos.z - PLAYER_WIDTH / 2);
  const maxZ = Math.floor(pos.z + PLAYER_WIDTH / 2);

  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      for (let z = minZ; z <= maxZ; z++) {
        if (blockMap.has(`${x},${y},${z}`)) {
           // Check if block is solid (ignore water for collision maybe? logic: water is block type 'water')
           const b = blockMap.get(`${x},${y},${z}`);
           if (b?.type !== 'water' && b?.type !== 'cloud') return true;
        }
      }
    }
  }
  return false;
};

// Simple Raycast for Mining
export const raycastBlock = (
  origin: THREE.Vector3, 
  direction: THREE.Vector3, 
  blockMap: Map<string, Block>,
  maxDist: number = 5
): { block: Block | null, face: THREE.Vector3 | null, dist: number } => {
  
  // Step Marching (Simplified DDA)
  const pos = origin.clone();
  const step = 0.1;
  let dist = 0;

  while (dist < maxDist) {
    pos.add(direction.clone().multiplyScalar(step));
    dist += step;

    const bx = Math.round(pos.x);
    const by = Math.round(pos.y);
    const bz = Math.round(pos.z);

    const key = `${bx},${by},${bz}`;
    if (blockMap.has(key)) {
       // Found a block
       // Determine face
       const block = blockMap.get(key)!;
       
       // Calculate face normal by checking which side we entered from
       const prevPos = pos.clone().sub(direction.clone().multiplyScalar(step));
       const dx = Math.abs(Math.round(prevPos.x) - bx);
       const dy = Math.abs(Math.round(prevPos.y) - by);
       const dz = Math.abs(Math.round(prevPos.z) - bz);
       
       const face = new THREE.Vector3();
       if (Math.round(prevPos.x) > bx) face.x = 1;
       else if (Math.round(prevPos.x) < bx) face.x = -1;
       
       if (Math.round(prevPos.y) > by) face.y = 1;
       else if (Math.round(prevPos.y) < by) face.y = -1;

       if (Math.round(prevPos.z) > bz) face.z = 1;
       else if (Math.round(prevPos.z) < bz) face.z = -1;

       return { block, face, dist };
    }
  }

  return { block: null, face: null, dist: 0 };
};