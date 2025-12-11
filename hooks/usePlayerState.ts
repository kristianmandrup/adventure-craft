import { useState, useCallback, useEffect, useRef } from 'react';
import { InventoryItem } from '../types';

export const usePlayerState = (gameStarted: boolean) => {
  const [playerHp, setPlayerHp] = useState(100);
  const [playerHunger, setPlayerHunger] = useState(100);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [activeSlot, setActiveSlot] = useState(0);
  const [respawnTrigger, setRespawnTrigger] = useState(0);
  const [resetViewTrigger, setResetViewTrigger] = useState(0);
  const [viewMode, setViewMode] = useState<'FP' | 'OVERHEAD' | 'TP'>('FP');
  const viewModeRef = useRef(viewMode);
  
  const playerPosRef = useRef<[number, number, number] | null>(null);
  const targetPosRef = useRef<[number, number, number] | null>(null);

  // XP & Economy
  const [playerXp, setPlayerXp] = useState(0);
  const [playerLevel, setPlayerLevel] = useState(1);
  const [playerGold, setPlayerGold] = useState(0);
  const [levelUpMessage, setLevelUpMessage] = useState<string | null>(null);

  const XP_THRESHOLDS = [0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200];

  useEffect(() => { viewModeRef.current = viewMode; }, [viewMode]);

  const playerStats = {
    attackMultiplier: 1 + (playerLevel - 1) * 0.1,
    speedMultiplier: 1 + (playerLevel - 1) * 0.05,
    defenseReduction: (playerLevel - 1) * 0.05
  };

  const onXpGain = useCallback((amount: number) => {
    setPlayerXp(prev => {
      const newXp = prev + amount;
      let newLevel = playerLevel;
      for (let i = playerLevel; i < 10; i++) {
        if (newXp >= XP_THRESHOLDS[i]) newLevel = i + 1;
        else break;
      }
      if (newLevel > playerLevel) {
        setPlayerLevel(newLevel);
        setLevelUpMessage(`Level Up! You are now level ${newLevel}!`);
        setTimeout(() => setLevelUpMessage(null), 3000);
      }
      return newXp;
    });
  }, [playerLevel]);

  const onGoldGain = useCallback((amount: number) => {
    setPlayerGold(prev => Math.max(0, prev + amount));
  }, []);

  const onRespawn = useCallback(() => setRespawnTrigger(prev => prev + 1), []);
  const onResetView = useCallback(() => setResetViewTrigger(prev => prev + 1), []);

  // Hunger & Regen
  useEffect(() => {
    if (!gameStarted) return;
    const interval = setInterval(() => setPlayerHunger(prev => Math.max(0, prev - 1)), 3000);
    return () => clearInterval(interval);
  }, [gameStarted]);

  useEffect(() => {
    if (!gameStarted) return;
    const interval = setInterval(() => {
        if (playerHunger > 0) setPlayerHp(prev => Math.min(100, prev + 1));
    }, 2000);
    return () => clearInterval(interval);
  }, [gameStarted, playerHunger]);

  const craftItem = useCallback((recipeId: string) => {
    if (recipeId === 'planks') {
        setInventory(prev => {
            const woodIdx = prev.findIndex(i => i.type.includes('wood') && i.count > 0);
            if (woodIdx >= 0) {
                const newInv = [...prev];
                newInv[woodIdx].count--;
                if (newInv[woodIdx].count === 0) newInv.splice(woodIdx, 1);
                
                const plankIdx = newInv.findIndex(i => i.type === 'plank');
                if (plankIdx >= 0) newInv[plankIdx].count += 4;
                else newInv.push({ type: 'plank', count: 4, color: '#fcd34d' });
                return newInv;
            }
            return prev;
        });
    }
  }, []); // Logic inside setInventory doesn't need inventory dependency if using usage of prev correctly, but findIndex needs it? No, findIndex on prev is safe.

  return {
    playerHp, setPlayerHp,
    playerHunger, setPlayerHunger,
    inventory, setInventory,
    activeSlot, setActiveSlot,
    respawnTrigger, onRespawn,
    resetViewTrigger, onResetView,
    viewMode, setViewMode, viewModeRef,
    playerPosRef, targetPosRef,
    playerXp, playerLevel, playerGold,
    levelUpMessage, onXpGain, onGoldGain,
    playerStats, XP_THRESHOLDS,
    craftItem
  };
};
