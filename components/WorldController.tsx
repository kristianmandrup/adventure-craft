import React, { useEffect } from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { Block, Character, Projectile, InventoryItem } from '../types';
import { usePlayerPhysics } from '../hooks/usePlayerPhysics';
import { usePlayerInteraction } from '../hooks/usePlayerInteraction';
import { useGameAI } from '../hooks/useGameAI';

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
  viewMode: 'FP' | 'OVERHEAD';
  setViewMode: (mode: 'FP' | 'OVERHEAD') => void;
  targetPosRef: React.MutableRefObject<[number, number, number] | null>;
  resetViewTrigger: number;
  playerPosRef?: React.MutableRefObject<[number, number, number] | null>;
  onQuestUpdate: (type: string, amount: number) => void;
  playerStats: { attackMultiplier: number; speedMultiplier: number; defenseReduction: number };
  onXpGain: (amount: number) => void;
  onGoldGain: (amount: number) => void;
  onDebugUpdate?: (info: any) => void;
}

export const WorldController: React.FC<WorldControllerProps> = ({ 
  blockMap, positionRef, rainGroupRef, setBlocks, inventory, setInventory, activeSlot, 
  characters, setCharacters, projectiles, setProjectiles, controlsRef, setIsLocked, setPlayerHunger, setPlayerHp, respawnTrigger,
  viewMode, setViewMode, targetPosRef, resetViewTrigger, playerPosRef, onQuestUpdate,
  playerStats, onXpGain, onGoldGain, onDebugUpdate
}) => {

  // Sync player position for minimap
  useEffect(() => {
    if (playerPosRef && positionRef.current) {
        playerPosRef.current = [positionRef.current.x, positionRef.current.y, positionRef.current.z];
    }
  }, [playerPosRef]);

  // Keyboard listener for View Mode Toggle (not handled in hooks because it interacts with UI/State)
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.target as HTMLElement).tagName === 'INPUT') return;
      if (event.code === 'KeyV') {
         setViewMode(viewMode === 'FP' ? 'OVERHEAD' : 'FP');
         if (viewMode === 'FP') {
           document.exitPointerLock();
         }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [viewMode, setViewMode]);

  // Physics Hook
  const { isLocked: isLockedRef, camAngle, debugInfo } = usePlayerPhysics({ 
    controlsRef, blockMap, positionRef, rainGroupRef,
    viewMode, setIsLocked, respawnTrigger, targetPosRef, resetViewTrigger, playerPosRef
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
    camera: controlsRef.current?.getObject()
  });

  // AI Hook
  useGameAI({
    characters,
    setCharacters,
    playerPosRef: positionRef, // Pass the ref itself
    projectiles,
    setProjectiles,
    setPlayerHp,
    setPlayerHunger,
    isLocked: isLockedRef,
    onDebugUpdate,
    blockMap,
    inventory,
    playerStats
  });

  // Update parent with debug info
  useEffect(() => {
     if (onDebugUpdate) {
         onDebugUpdate({
             ...debugInfo,
             pitch: camAngle.pitch,
             yaw: camAngle.yaw
         });
     }
  }, [debugInfo, camAngle, onDebugUpdate]);

  return (
    <group>
      {/* Player Model / Arm */}
      {viewMode === 'FP' && (
        <group ref={armRef} position={[positionRef.current.x, positionRef.current.y, positionRef.current.z]}>
           {/* Simple Arm Model */}
           <mesh position={[0.3, -0.2, -0.5]} rotation={[-0.2, 0, 0]}>
             <boxGeometry args={[0.1, 0.1, 0.4]} />
             <meshStandardMaterial color="#eecfa1" />
           </mesh>
             {/* Item in Hand */}
             {inventory[activeSlot] && (
               <mesh position={[0.3, -0.2, -0.8]} rotation={[0, 0, 0.2]}>
                  <boxGeometry args={[0.2, 0.2, 0.2]} />
                  <meshStandardMaterial color={inventory[activeSlot].color} />
               </mesh>
             )}
        </group>
      )}

      {/* Cursor Highlight */}
      {cursorPos && (
        <mesh position={[cursorPos[0], cursorPos[1], cursorPos[2]]}>
          <boxGeometry args={[1.05, 1.05, 1.05]} />
          <meshBasicMaterial color="white" wireframe transparent opacity={0.5} />
        </mesh>
      )}
      
      {/* Compass / Direction Indicator (Optional) */}
      <arrowHelper args={[new THREE.Vector3(0,0,-1), positionRef.current, 1, 0xffff00]} />
    </group>
  );
};