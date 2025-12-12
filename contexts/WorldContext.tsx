import React, { createContext, useContext } from 'react';
import { Block, Character, Projectile, DroppedItem, SpawnMarker, GameMode } from '../types';

interface WorldContextType {
  blocks: Block[];
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
  characters: Character[];
  setCharacters: React.Dispatch<React.SetStateAction<Character[]>>;
  projectiles: Projectile[];
  setProjectiles: React.Dispatch<React.SetStateAction<Projectile[]>>;
  droppedItems: DroppedItem[];
  setDroppedItems: React.Dispatch<React.SetStateAction<DroppedItem[]>>;
  spawnMarkers: SpawnMarker[];
  isDay: boolean;
  setIsDay: React.Dispatch<React.SetStateAction<boolean>>;
  isRaining: boolean;
  expansionLevel: number;
  handleExpand: () => void;
  handleShrink: () => void;
  portalActive: boolean;
  portalPosition: [number, number, number] | null;
  portalColor: string;
  isUnderworld: boolean;
  enterUnderworld: () => void;
  difficultyMode?: GameMode;
}

const WorldContext = createContext<WorldContextType | null>(null);

export const WorldProvider: React.FC<{ value: WorldContextType; children: React.ReactNode }> = ({ value, children }) => {
  return <WorldContext.Provider value={value}>{children}</WorldContext.Provider>;
};

export const useWorldContext = () => {
  const context = useContext(WorldContext);
  if (!context) {
    throw new Error('useWorldContext must be used within a WorldProvider');
  }
  return context;
};
