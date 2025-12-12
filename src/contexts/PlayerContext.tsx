import React, { createContext, useContext } from 'react';
import { InventoryItem, Equipment, EquipmentSlot } from '../types';

interface ActiveBuff {
  type: 'swimming' | 'strength' | 'speed';
  remainingTime: number;
  effectValue: number;
}

interface PlayerContextValue {
  playerHp: number;
  setPlayerHp: React.Dispatch<React.SetStateAction<number>>;
  playerHunger: number;
  setPlayerHunger: React.Dispatch<React.SetStateAction<number>>;
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  activeSlot: number;
  setActiveSlot: (slot: number) => void;
  respawnTrigger: number;
  onRespawn: () => void;
  resetViewTrigger: number;
  onResetView: () => void;
  viewMode: 'FP' | 'OVERHEAD' | 'TP';
  setViewMode: (mode: 'FP' | 'OVERHEAD' | 'TP') => void;
  playerPosRef: React.MutableRefObject<[number, number, number] | null>;
  targetPosRef: React.MutableRefObject<[number, number, number] | null>;
  playerXp: number;
  playerLevel: number;
  playerGold: number;
  levelUpMessage: string | null;
  onXpGain: (amount: number) => void;
  onGoldGain: (amount: number) => void;
  playerStats: { attackMultiplier: number; speedMultiplier: number; defenseReduction: number };
  XP_THRESHOLDS: number[];
  equipment: Equipment;
  equipFromInventory: (index: number, slot: EquipmentSlot) => void;
  unequipItem: (slot: EquipmentSlot) => void;
  eatItem: (slotIndex: number) => void;
  craftItem: (recipeId: string) => void;
  activeBuffs: ActiveBuff[];
  hasSwimmingBuff: boolean;
  usePotion: (slotIndex: number) => boolean;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export const PlayerProvider: React.FC<{ value: PlayerContextValue; children: React.ReactNode }> = ({ value, children }) => {
  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
};

export const usePlayerContext = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayerContext must be used within a PlayerProvider');
  }
  return context;
};
