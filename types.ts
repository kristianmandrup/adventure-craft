import * as THREE from 'three';

export interface Block {
  id: string;
  x: number;
  y: number;
  z: number;
  color: string;
  type?: string; // e.g., 'wood', 'stone', 'leaf', 'water'
  hp?: number;   // Block HP for trees/structures (undefined = instant break)
}

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
  position: [number, number, number]; // World position
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

export interface InventoryItem {
  type: string;
  count: number;
  color: string;
}

export interface GenerationResponse {
  description: string;
  blocks: Omit<Block, 'id'>[];
}

export interface CharacterGenerationResponse {
  description: string;
  parts: CharacterPart[];
}

export interface ItemGenerationResponse {
  name: string;
  color: string;
  description: string;
}

export enum GameState {
  IDLE = 'IDLE',
  ERROR = 'ERROR',
}

export type GenerationMode = 'STRUCTURE' | 'CHARACTER' | 'ITEM';

export interface Job {
  id: string;
  type: GenerationMode;
  prompt: string;
  status: 'pending' | 'generating' | 'success' | 'error';
  message?: string;
  isEnemy?: boolean;
  isGiant?: boolean;
  isFriendly?: boolean;
  isAquatic?: boolean;
}

export interface ChatMessage {
  sender: 'Player' | 'NPC';
  text: string;
}

export interface Quest {
  id: string;
  title: string;
  requirements: Record<string, number>; // e.g. { 'wood': 10, 'zombie': 2 }
  progress: Record<string, number>;
  completed: boolean;
}

export interface SpawnMarker {
  id: string;
  x: number;
  z: number;
  timestamp: number;
}

export interface DroppedItem {
  id: string;
  type: string;
  position: THREE.Vector3;
  count: number;
  color: string;
  velocity: THREE.Vector3; // For bouncing animation
  createdAt: number;
}

export type NotificationType = 'BOSS' | 'MERCHANT' | 'INFO' | 'COMBAT_HIT' | 'COMBAT_MISS' | 'COMBAT_BLOCK' | 'COMBAT_DAMAGE' | 'WARNING';