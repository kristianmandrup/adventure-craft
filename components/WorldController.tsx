import React, { useEffect } from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { Block, Character, Projectile, InventoryItem } from '../types';
import { usePlayerPhysics } from '../hooks/usePlayerPhysics';
import { usePlayerInteraction } from '../hooks/usePlayerInteraction';
import { useGameAI } from '../hooks/useGameAI';

interface WorldControllerProps {
  blockMap: Map<string, Block>;
  position: THREE.Vector3;
  setPosition: (v: THREE.Vector3) => void;
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
}

export const WorldController: React.FC<WorldControllerProps> = ({ 
  blockMap, position, setPosition, setBlocks, inventory, setInventory, activeSlot, 
  characters, setCharacters, projectiles, setProjectiles, controlsRef, setIsLocked, setPlayerHunger, setPlayerHp, respawnTrigger,
  viewMode, setViewMode, targetPosRef, resetViewTrigger, playerPosRef, onQuestUpdate
}) => {

  // Sync player position for minimap
  useEffect(() => {
    if (playerPosRef) {
        playerPosRef.current = [position.x, position.y, position.z];
    }
  }, [position, playerPosRef]);

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

  // Hook: Physics & Movement
  const { isLocked, camAngle } = usePlayerPhysics({
    controlsRef, blockMap, position, setPosition, viewMode, setIsLocked, respawnTrigger, targetPosRef, resetViewTrigger
  });

  // Hook: Interaction (Mining, Placing, Attacking)
  const { armRef, isAttacking } = usePlayerInteraction({
    blockMap, position, inventory, setInventory, activeSlot, setBlocks, setCharacters, setPlayerHunger, viewMode, isLocked, targetPosRef, characters, onQuestUpdate
  });

  // Hook: Game AI (Enemies, Projectiles)
  useGameAI({
    characters, setCharacters, projectiles, setProjectiles, position, setPlayerHp, blockMap
  });

  return (
    <>
      <Html position={[0, 0, 0]} calculatePosition={() => [0, 0, 0]} style={{ pointerEvents: 'none' }}>
         <div style={{ position: 'fixed', bottom: '20px', right: '180px', color: 'rgba(255,255,255,0.8)', fontSize: '12px', fontFamily: 'monospace', background: 'rgba(0,0,0,0.5)', padding: '8px', borderRadius: '8px' }}>
            <div>ANGLE VIEW</div>
            <div>PITCH: {camAngle.pitch}°</div>
            <div>YAW: {camAngle.yaw}°</div>
         </div>
      </Html>

      {viewMode === 'FP' && (
        <group position={position}>
           <group ref={armRef} position={[0.3, 0.4, 0.4]}>
             <mesh rotation={[0,0,0]} scale={[0.15, 0.15, 0.6]}>
                 <boxGeometry />
                 <meshStandardMaterial color="#eab308" />
             </mesh>
           </group>
        </group>
      )}
    </>
  );
};