import * as THREE from 'three';

export interface CharacterVoxel {
  x: number;
  y: number;
  z: number;
  color: string;
}

export interface CharacterPart {
  name: 'head' | 'body' | 'left_arm' | 'right_arm' | 'left_leg' | 'right_leg' | 'misc';
  voxels: CharacterVoxel[];
}

export interface Character {
  id: string;
  playerPos?: [number, number, number]; // World position
  rotation: number; // Y-axis rotation in radians
  parts: CharacterPart[]; // Animated parts
  name: string;
  // Combat stats
  maxHp: number;
  hp: number;
  isEnemy: boolean;
  isFriendly?: boolean; // NPC
  isGiant?: boolean; // 3x size
  isAquatic?: boolean; // Fish
  isMoving?: boolean; // For animation
  lastAttackTime?: number;
  wanderTarget?: THREE.Vector3 | null; // For idle AI
  hasSummoned?: boolean; // For Sorcerer
  lastDamagedTime?: number; // For fleeing logic
}

export interface Projectile {
  id: string;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  ownerId: string; // Who shot it
  damage: number;
  color: string;
  createdAt: number;
}

export interface CharacterGenerationResponse {
  description: string;
  parts: CharacterPart[];
}
