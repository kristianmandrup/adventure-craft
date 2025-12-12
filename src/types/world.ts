import { InventoryItem, Equipment, DroppedItem } from './item';
import { Character } from './character';
import { Quest } from './quest';
import { GameMode } from './game';

export interface Block {
  id: string;
  x: number;
  y: number;
  z: number;
  color: string;
  type?: string; // e.g., 'wood', 'stone', 'leaf', 'water'
  hp?: number;   // Block HP for trees/structures (undefined = instant break)
}

export interface GameSaveState {
  version: number;
  timestamp: number;
  playerHp: number;
  playerHunger: number;
  playerXp: number;
  playerLevel: number;
  playerGold: number;
  inventory: InventoryItem[];
  equipment: Equipment;
  blocks: Block[];
  characters: Character[];
  droppedItems: DroppedItem[];
  currentQuest: Quest | null;
  questMessage: string | null;
  gameStarted: boolean;
  isDay: boolean;
  expansionLevel: number;
  playerPos: [number, number, number];
  gameMode?: 'CREATIVE' | 'ADVENTURE';
  difficultyMode?: GameMode;
}

export interface GenerationResponse {
  description: string;
  blocks: Omit<Block, 'id'>[];
}

export interface SpawnMarker {
  id: string;
  x: number;
  z: number;
  timestamp: number;
}
