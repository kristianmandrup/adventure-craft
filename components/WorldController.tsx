import React, { useEffect } from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { Block, Character, Projectile, InventoryItem } from '../types';
import { usePlayerPhysics } from '../hooks/usePlayerPhysics';
import { usePlayerInteraction } from '../hooks/usePlayerInteraction';
import { useGameAI } from '../hooks/useGameAI';
import { HandWeapon } from './weapons/HandWeapon';

interface WorldControllerProps {
  blockMap: Map<string, Block>;
  positionRef: React.MutableRefObject<THREE.Vector3>;
  rainGroupRef: React.RefObject<THREE.Group>;
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  activeSlot: number;
  characters: Character[];
  setCharacters: React.Dispatch<React.SetStateAction<Character[]>>;
  projectiles: Projectile[];
  setProjectiles: React.Dispatch<React.SetStateAction<Projectile[]>>;
  controlsRef: React.RefObject<any>;
  setIsLocked: (locked: boolean) => void;
  setPlayerHunger: React.Dispatch<React.SetStateAction<number>>;
  setPlayerHp: React.Dispatch<React.SetStateAction<number>>;
  respawnTrigger: number;
  viewMode: 'FP' | 'OVERHEAD' | 'TP';
  setViewMode: React.Dispatch<React.SetStateAction<'FP' | 'OVERHEAD' | 'TP'>>;
  targetPosRef: React.MutableRefObject<[number, number, number] | null>;
  resetViewTrigger: number;
  playerPosRef?: React.MutableRefObject<[number, number, number] | null>;
  onQuestUpdate: (type: string, amount: number) => void;
  playerStats: { attackMultiplier: number; speedMultiplier: number; defenseReduction: number };
  onXpGain: (amount: number) => void;
  onGoldGain: (amount: number) => void;
  onDebugUpdate?: (info: any) => void;
  droppedItems: import('../types').DroppedItem[];
  setDroppedItems: React.Dispatch<React.SetStateAction<import('../types').DroppedItem[]>>;
  onNotification: (message: string, type: 'info' | 'success' | 'warning' | 'error', subMessage?: string) => void;
  playerHp: number;
  playerHunger: number;
}

export const WorldController: React.FC<WorldControllerProps> = ({ 
  blockMap, positionRef, rainGroupRef, setBlocks, inventory, setInventory, activeSlot, 
  characters, setCharacters, projectiles, setProjectiles, controlsRef, setIsLocked, setPlayerHunger, setPlayerHp, respawnTrigger,
  viewMode, setViewMode, targetPosRef, resetViewTrigger, playerPosRef, onQuestUpdate,
  playerStats, onXpGain, onGoldGain, onDebugUpdate, droppedItems, setDroppedItems, onNotification,
  playerHp, playerHunger
}) => {

  // ... (existing effects)

  // Item Pickup Logic
  useEffect(() => {
    if (!positionRef.current) return;
    const playerPos = positionRef.current;
    
    // Check collisions with dropped items
    const pickupRadius = 2.0;
    const pickedUpParams: string[] = [];
    
    const remainingItems = droppedItems.filter(item => {
        const dx = item.position.x - playerPos.x;
        const dy = item.position.y - playerPos.y;
        const dz = item.position.z - playerPos.z;
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
        
        if (dist < pickupRadius) {
            pickedUpParams.push(item.id);
            // Add to inventory
            setInventory(prev => {
               const existing = prev.find(i => i.type === item.type);
               if (existing) return prev.map(i => i.type === item.type ? { ...i, count: i.count + item.count } : i);
               return [...prev, { type: item.type, count: item.count, color: item.color }];
            });
            // NOTIFICATION: Pickup
            onNotification(`You picked up ${item.count} ${item.type}`, 'success');
            return false; // Remove from world
        }
        return true;
    });
    
    if (pickedUpParams.length > 0) {
        setDroppedItems(remainingItems);
    }
  }, [positionRef.current, droppedItems, setInventory, setDroppedItems, onNotification]); 
  // Note: limiting dependency on droppedItems might cause loop if not careful, but filtering creates new array only on change

  // Keyboard listener for View Mode Toggle
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyV') {
        setViewMode(prev => {
          if (prev === 'FP') return 'TP';
          if (prev === 'TP') return 'OVERHEAD';
          return 'FP';
        });
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [setViewMode]);

  const hasMagicBoots = inventory.some(i => i.type === 'magic_boots');

  const { isLocked: isLockedRef, camAngle, debugInfo, applyKnockback } = usePlayerPhysics({ 
    controlsRef, blockMap, positionRef, rainGroupRef,
    viewMode, setIsLocked, respawnTrigger, targetPosRef, resetViewTrigger, playerPosRef,
    hasMagicBoots
  });

  // Interaction Hook
  const { cursorPos, armRef, isAttacking } = usePlayerInteraction({
    blockMap,
    positionRef,
    inventory,
    setInventory,
    activeSlot,
    setBlocks,
    setCharacters,
    setPlayerHunger,
    viewMode,
    isLocked: isLockedRef,
    targetPosRef,
    characters,
    onQuestUpdate,
    setProjectiles,
    playerStats,
    onXpGain,
    onGoldGain,
    camera: controlsRef.current?.getObject(),
    setDroppedItems,
    onNotification
  });

  // Game AI
  useGameAI({ 
    characters, setCharacters, projectiles, setProjectiles, playerPosRef: positionRef, setPlayerHp, blockMap, inventory, playerStats, isLocked: isLockedRef, onDebugUpdate, setPlayerHunger, onNotification,
    applyKnockback
  });
  
  // Debug Update
  useEffect(() => {
    if (onDebugUpdate && debugInfo) {
       onDebugUpdate({ ...debugInfo, viewMode });
    }
  }, [debugInfo, onDebugUpdate, viewMode]);

  // Status Warnings
  const lastHungerWarn = React.useRef(0);
  const lastHpWarn = React.useRef(0);

  useEffect(() => {
    // Hunger Warnings
    if (setPlayerHunger) {
        // Levels: 50, 25, 10
        if (playerHunger <= 10 && lastHungerWarn.current > 10) {
            onNotification("You are starving. Find and eat food quick!", "error");
        } else if (playerHunger <= 25 && lastHungerWarn.current > 25) {
             onNotification("You are getting very hungry", "warning");
        } else if (playerHunger <= 50 && lastHungerWarn.current > 50) {
             onNotification("You are getting hungry", "info");
        }
        lastHungerWarn.current = playerHunger;
    }

    // Health Warnings
    if (setPlayerHp) {
        const hpPercent = (playerHp / 100) * 100; // Assuming 100 max
        if (hpPercent <= 25 && lastHpWarn.current > 25) {
            onNotification("You are bleeding to death", "error");
        } else if (hpPercent <= 50 && lastHpWarn.current > 50) {
            onNotification("You are severely damaged", "warning");
        }
        lastHpWarn.current = hpPercent;
    }
  }, [playerHunger, playerHp, onNotification, setPlayerHunger, setPlayerHp]);

  const activeItem = inventory[activeSlot];

  return (
    <group>
      {viewMode === 'FP' && (
        <group ref={armRef} position={[positionRef.current.x, positionRef.current.y, positionRef.current.z]}>
           {/* Arm Base */}
           <mesh position={[0.35, -0.25, -0.4]} rotation={[-0.2, -0.1, 0]}>
             <boxGeometry args={[0.08, 0.08, 0.4]} />
             <meshStandardMaterial color="#eecfa1" />
           </mesh>
           
           {/* Hand/Item */}
           <group position={[0.35, -0.25, -0.7]} rotation={[0, 0, 0]}>
              <HandWeapon activeItem={activeItem} />
           </group>
        </group>
      )}

    </group>
  );
};