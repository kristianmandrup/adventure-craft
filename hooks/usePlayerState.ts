import { useState, useCallback, useEffect, useRef } from 'react';
import { InventoryItem, Equipment, EquipmentSlot } from '../types';
import { audioManager } from '../utils/audio';

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

  // Equip Sound Logic
  useEffect(() => {
     if (!gameStarted) return;
     const item = inventory[activeSlot];
     if (item && (item.type === 'weapon' || item.type.includes('sword') || item.type === 'bow')) {
         try { audioManager.playSFX('DRAW_SWORD'); } catch (e) {}
     }
  }, [activeSlot, inventory, gameStarted]);

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

  const [equipment, setEquipment] = useState<Equipment>({
    head: null, chest: null, feet: null, mainHand: null, offHand: null
  });

  const equipFromInventory = useCallback((inventoryIndex: number, slot: EquipmentSlot) => {
    setInventory(prev => {
        const item = prev[inventoryIndex];
        if (!item) return prev;
        
        // Take 1
        const newInv = [...prev];
        if (item.count > 1) {
            newInv[inventoryIndex] = { ...item, count: item.count - 1 };
        } else {
            newInv.splice(inventoryIndex, 1);
        }

        setEquipment(prevEq => {
            const currentEquip = prevEq[slot];
            if (currentEquip) {
                // Add back to inventory (simplified: push to end)
                // In a real app we would try to stack, but strict push is safe for now
                // Actually we can try to find stack
                const stackIdx = newInv.findIndex(i => i.type === currentEquip.type);
                if (stackIdx >= 0) newInv[stackIdx] = { ...newInv[stackIdx], count: newInv[stackIdx].count + 1 };
                else newInv.push(currentEquip);
            }
            return { ...prevEq, [slot]: { ...item, count: 1 } };
        });

        return newInv;
    });
    // Sound Effect
    try { audioManager.playSFX('DRAW_SWORD'); } catch(e) {}
  }, []);

  const unequipItem = useCallback((slot: EquipmentSlot) => {
      setEquipment(prevEq => {
          const item = prevEq[slot];
          if (!item) return prevEq;
          
          setInventory(prevInv => {
              const newInv = [...prevInv];
              const stackIdx = newInv.findIndex(i => i.type === item.type);
              if (stackIdx >= 0) newInv[stackIdx] = { ...newInv[stackIdx], count: newInv[stackIdx].count + 1 };
              else newInv.push(item);
              return newInv;
          });
          
          return { ...prevEq, [slot]: null };
      });
  }, []);

  const eatItem = useCallback((slotIndex: number) => {
      let consumed = false;
      setInventory(prev => {
          const item = prev[slotIndex];
          if (!item) return prev;
          
          const type = item.type;
          let isEdible = false;
          
          if (type === 'apple' || type.includes('meat') || type.includes('fish') || type === 'bread') {
              isEdible = true;
          }
          
          if (isEdible) {
              consumed = true;
              // Remove 1 item
              const newInv = [...prev];
              if (item.count > 1) {
                  newInv[slotIndex] = { ...item, count: item.count - 1 };
              } else {
                  newInv.splice(slotIndex, 1);
              }
              return newInv;
          }
          
          return prev;
      });

      if (consumed) {
          // Play Sound & Restore Stats (outside setState to be safe with closure)
          // We can check type again from current inventory state? 
          // Actually we know it was edible.
          // Since we rely on setInventory for atomic update, we should calculate stat boost here.
          // But we don't have the item type easily accessible outside without reading inventory[slotIndex].
          // Let's assume generic food or read type from inventory first.
          // Better: do stat update in a separate effect? No.
          // Better: Just set stats blindly? Or use logic.
          // Let's assume apple/meat logic.
          setPlayerHunger(h => Math.min(100, h + 15));
          setPlayerHp(h => Math.min(100, h + 10));
          try { audioManager.playSFX('EAT'); } catch (e) {}
          return true;
      }
      return false;
  }, []);

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
    craftItem,
    equipment, setEquipment, equipFromInventory, unequipItem,
    eatItem
  };
};
