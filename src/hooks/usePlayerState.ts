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

  // Active Buffs System (timed potion effects)
  interface ActiveBuff {
    type: 'swimming' | 'strength' | 'speed';
    remainingTime: number; // seconds
    effectValue: number;
  }
  const [activeBuffs, setActiveBuffs] = useState<ActiveBuff[]>([]);
  
  // Buff countdown timer
  useEffect(() => {
    if (!gameStarted || activeBuffs.length === 0) return;
    const timer = setInterval(() => {
      setActiveBuffs(prev => 
        prev.map(b => ({ ...b, remainingTime: b.remainingTime - 0.1 }))
            .filter(b => b.remainingTime > 0)
      );
    }, 100);
    return () => clearInterval(timer);
  }, [gameStarted, activeBuffs.length]);
  
  // Helper to check buff status
  const hasSwimmingBuff = activeBuffs.some(b => b.type === 'swimming');
  const strengthMultiplier = activeBuffs.find(b => b.type === 'strength')?.effectValue || 1;
  const speedMultiplier = activeBuffs.find(b => b.type === 'speed')?.effectValue || 1;

  const playerStats = {
    attackMultiplier: (1 + (playerLevel - 1) * 0.1) * strengthMultiplier,
    speedMultiplier: (1 + (playerLevel - 1) * 0.05) * speedMultiplier,
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

  // Hunger & Regen - Progressive decay (faster when low)
  useEffect(() => {
    if (!gameStarted) return;
    
    let timeoutId: NodeJS.Timeout;
    
    const tick = () => {
      setPlayerHunger(prev => {
        const newHunger = Math.max(0, prev - 1);
        // Schedule next tick based on current hunger
        let delay = 3000; // Normal: 3s
        if (prev < 10) delay = 1000; // Critical: 1s
        else if (prev < 50) delay = 2000; // Low: 2s
        
        timeoutId = setTimeout(tick, delay);
        return newHunger;
      });
    };
    
    // Start first tick
    timeoutId = setTimeout(tick, 3000);
    
    return () => clearTimeout(timeoutId);
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
    } else if (recipeId === 'workbench') {
        setInventory(prev => {
            const plankIdx = prev.findIndex(i => i.type === 'plank' && i.count >= 4);
            if (plankIdx >= 0) {
                const newInv = [...prev];
                newInv[plankIdx].count -= 4;
                if (newInv[plankIdx].count === 0) newInv.splice(plankIdx, 1);
                
                const wbIdx = newInv.findIndex(i => i.type === 'workbench');
                if (wbIdx >= 0) newInv[wbIdx].count += 1;
                else newInv.push({ type: 'workbench', count: 1, color: '#8b4513' });
                return newInv;
            }
            return prev;
        });
    } else if (recipeId === 'potion') {
        setInventory(prev => {
            const flowerIdx = prev.findIndex(i => i.type.includes('flower') && i.count >= 2);
            if (flowerIdx >= 0) {
                const newInv = [...prev];
                newInv[flowerIdx].count -= 2;
                if (newInv[flowerIdx].count === 0) newInv.splice(flowerIdx, 1);
                
                const potionIdx = newInv.findIndex(i => i.type === 'health_potion');
                if (potionIdx >= 0) newInv[potionIdx].count += 1;
                else newInv.push({ type: 'health_potion', count: 1, color: '#ff6b6b' });
                return newInv;
            }
            return prev;
        });
    } else if (recipeId === 'boat') {
        setInventory(prev => {
            const plankIdx = prev.findIndex(i => i.type === 'plank' && i.count >= 12);
            const woolIdx = prev.findIndex(i => i.type === 'wool' && i.count >= 3);
            if (plankIdx >= 0 && woolIdx >= 0) {
                const newInv = [...prev];
                newInv[plankIdx].count -= 12;
                if (newInv[plankIdx].count === 0) newInv.splice(plankIdx, 1);
                // Re-find wool index since array may have shifted
                const newWoolIdx = newInv.findIndex(i => i.type === 'wool');
                if (newWoolIdx >= 0) {
                    newInv[newWoolIdx].count -= 3;
                    if (newInv[newWoolIdx].count === 0) newInv.splice(newWoolIdx, 1);
                }
                
                const boatIdx = newInv.findIndex(i => i.type === 'boat');
                if (boatIdx >= 0) newInv[boatIdx].count += 1;
                else newInv.push({ type: 'boat', count: 1, color: '#8b6914' });
                return newInv;
            }
            return prev;
        });
    } else if (recipeId === 'speed_potion') {
        setInventory(prev => {
            const flowerIdx = prev.findIndex(i => i.type.includes('flower') && i.count >= 1);
            const sugarIdx = prev.findIndex(i => i.type === 'sugar' && i.count >= 1);
            if (flowerIdx >= 0 && sugarIdx >= 0) {
                const newInv = [...prev];
                newInv[flowerIdx].count -= 1;
                if (newInv[flowerIdx].count === 0) newInv.splice(flowerIdx, 1);
                const newSugarIdx = newInv.findIndex(i => i.type === 'sugar');
                if (newSugarIdx >= 0) {
                    newInv[newSugarIdx].count -= 1;
                    if (newInv[newSugarIdx].count === 0) newInv.splice(newSugarIdx, 1);
                }
                const potionIdx = newInv.findIndex(i => i.type === 'speed_potion');
                if (potionIdx >= 0) newInv[potionIdx].count += 1;
                else newInv.push({ type: 'speed_potion', count: 1, color: '#3b82f6' });
                return newInv;
            }
            return prev;
        });
    } else if (recipeId === 'strength_potion') {
        setInventory(prev => {
            const flowerIdx = prev.findIndex(i => i.type.includes('flower') && i.count >= 1);
            const boneIdx = prev.findIndex(i => i.type === 'bone' && i.count >= 1);
            if (flowerIdx >= 0 && boneIdx >= 0) {
                const newInv = [...prev];
                newInv[flowerIdx].count -= 1;
                if (newInv[flowerIdx].count === 0) newInv.splice(flowerIdx, 1);
                const newBoneIdx = newInv.findIndex(i => i.type === 'bone');
                if (newBoneIdx >= 0) {
                    newInv[newBoneIdx].count -= 1;
                    if (newInv[newBoneIdx].count === 0) newInv.splice(newBoneIdx, 1);
                }
                const potionIdx = newInv.findIndex(i => i.type === 'strength_potion');
                if (potionIdx >= 0) newInv[potionIdx].count += 1;
                else newInv.push({ type: 'strength_potion', count: 1, color: '#f97316' });
                return newInv;
            }
            return prev;
        });
    } else if (recipeId === 'swimming_potion') {
        setInventory(prev => {
            const fishIdx = prev.findIndex(i => i.type === 'fish' && i.count >= 1);
            const flowerIdx = prev.findIndex(i => i.type.includes('flower') && i.count >= 1);
            if (fishIdx >= 0 && flowerIdx >= 0) {
                const newInv = [...prev];
                newInv[fishIdx].count -= 1;
                if (newInv[fishIdx].count === 0) newInv.splice(fishIdx, 1);
                const newFlowerIdx = newInv.findIndex(i => i.type.includes('flower'));
                if (newFlowerIdx >= 0) {
                    newInv[newFlowerIdx].count -= 1;
                    if (newInv[newFlowerIdx].count === 0) newInv.splice(newFlowerIdx, 1);
                }
                const potionIdx = newInv.findIndex(i => i.type === 'swimming_potion');
                if (potionIdx >= 0) newInv[potionIdx].count += 1;
                else newInv.push({ type: 'swimming_potion', count: 1, color: '#06b6d4' });
                return newInv;
            }
            return prev;
        });
    } else if (recipeId === 'wine') {
        setInventory(prev => {
            const grapeIdx = prev.findIndex(i => i.type === 'grape' && i.count >= 2);
            if (grapeIdx >= 0) {
                const newInv = [...prev];
                newInv[grapeIdx].count -= 2;
                if (newInv[grapeIdx].count === 0) newInv.splice(grapeIdx, 1);
                const wineIdx = newInv.findIndex(i => i.type === 'wine');
                if (wineIdx >= 0) newInv[wineIdx].count += 1;
                else newInv.push({ type: 'wine', count: 1, color: '#7c3aed' });
                return newInv;
            }
            return prev;
        });
    } else if (recipeId === 'bread') {
        setInventory(prev => {
            const wheatIdx = prev.findIndex(i => i.type === 'wheat' && i.count >= 2);
            if (wheatIdx >= 0) {
                const newInv = [...prev];
                newInv[wheatIdx].count -= 2;
                if (newInv[wheatIdx].count === 0) newInv.splice(wheatIdx, 1);
                const breadIdx = newInv.findIndex(i => i.type === 'bread');
                if (breadIdx >= 0) newInv[breadIdx].count += 1;
                else newInv.push({ type: 'bread', count: 1, color: '#d97706' });
                return newInv;
            }
            return prev;
        });
    }
  }, []);

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
      const item = inventory[slotIndex];
      if (!item) return;
      
      const type = item.type;
      let isEdible = false;
      let hungerBonus = 0;
      let hpBonus = 0;
      
      // Tiered food system
      if (type === 'apple') {
          isEdible = true;
          hungerBonus = 10; hpBonus = 5;
      } else if (type.includes('cooked_fish')) {
          isEdible = true;
          hungerBonus = 20; hpBonus = 5;
      } else if (type.includes('fish')) {
          isEdible = true;
          hungerBonus = 5; hpBonus = 0; // Raw
      } else if (type.includes('cooked_meat') || type.includes('cooked_')) {
          isEdible = true;
          hungerBonus = 20; hpBonus = 10;
      } else if (type.includes('meat')) {
          isEdible = true;
          hungerBonus = 5; hpBonus = 0; // Raw
      } else if (type === 'bread') {
          isEdible = true;
          hungerBonus = 15; hpBonus = 10;
      } else if (type === 'wine') {
          isEdible = true;
          hungerBonus = 15; hpBonus = 10;
      } else if (type === 'grape') {
          isEdible = true;
          hungerBonus = 5; hpBonus = 0;
      }
      
      if (isEdible) {
          setInventory(prev => {
              const prevItem = prev[slotIndex];
              // Safety check to ensure we are modifying the correct item
              if (!prevItem || prevItem.type !== type) return prev;
              
              const newInv = [...prev];
              if (prevItem.count > 1) {
                  newInv[slotIndex] = { ...prevItem, count: prevItem.count - 1 };
              } else {
                  newInv.splice(slotIndex, 1);
              }
              return newInv;
          });

          setPlayerHunger(h => Math.min(100, h + hungerBonus));
          setPlayerHp(h => Math.min(100, h + hpBonus));
          try { audioManager.playSFX('EAT'); } catch (e) {}
          return true;
      }
      
      return false;
  }, [inventory]);

  // Consume potion and apply timed buff
  const usePotion = useCallback((slotIndex: number) => {
      const item = inventory[slotIndex];
      if (!item) return false;
      
      const type = item.type;
      let buffType: 'swimming' | 'strength' | 'speed' | null = null;
      let effectValue = 1;
      let duration = 10; // seconds
      
      if (type === 'health_potion') {
          // Instant heal
          setPlayerHp(hp => Math.min(100, hp + 50));
          try { audioManager.playSFX('DRINK'); } catch (e) {}
      } else if (type === 'speed_potion') {
          buffType = 'speed';
          effectValue = 2; // 2x speed
          duration = 10;
      } else if (type === 'strength_potion') {
          buffType = 'strength';
          effectValue = 2; // 2x attack
          duration = 10;
      } else if (type === 'swimming_potion') {
          buffType = 'swimming';
          effectValue = 1;
          duration = 10;
      } else {
          return false; // Not a potion
      }
      
      // Remove 1 from inventory
      setInventory(prev => {
          const newInv = [...prev];
          if (newInv[slotIndex].count > 1) {
              newInv[slotIndex] = { ...newInv[slotIndex], count: newInv[slotIndex].count - 1 };
          } else {
              newInv.splice(slotIndex, 1);
          }
          return newInv;
      });
      
      // Apply buff if applicable
      if (buffType) {
          setActiveBuffs(prev => {
              // Replace existing buff of same type or add new
              const filtered = prev.filter(b => b.type !== buffType);
              return [...filtered, { type: buffType!, remainingTime: duration, effectValue }];
          });
      }
      
      try { audioManager.playSFX('DRINK'); } catch (e) {}
      return true;
  }, [inventory]);

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
    eatItem, usePotion,
    activeBuffs, hasSwimmingBuff
  };
};
