import React, { useEffect, useRef } from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { Block, Character, Projectile, InventoryItem } from '../types';
import { usePlayerPhysics } from '../hooks/usePlayerPhysics';
import { usePlayerInteraction } from '../hooks/usePlayerInteraction';
import { useGameAI } from '../hooks/useGameAI';
import { HandWeapon } from './weapons/HandWeapon';
import { Shield } from './weapons/Shield';
import { PlayerMesh } from './PlayerMesh';
import { useFrame, useThree } from '@react-three/fiber';

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
  onNotification: (message: string, type: import('../types').NotificationType, subMessage?: string) => void;
  playerHp: number;
  playerHunger: number;
  onSpawnParticles: (pos: THREE.Vector3, color: string) => void;
  equipment: import('../types').Equipment;
  portalPosition: [number, number, number] | null;
  onEnterPortal: () => void;
}

export const WorldController: React.FC<WorldControllerProps> = ({ 
  blockMap, positionRef, rainGroupRef, setBlocks, inventory, setInventory, activeSlot, 
  characters, setCharacters, projectiles, setProjectiles, controlsRef, setIsLocked, setPlayerHunger, setPlayerHp, respawnTrigger,
  viewMode, setViewMode, targetPosRef, resetViewTrigger, playerPosRef, onQuestUpdate,
  playerStats, onXpGain, onGoldGain, onDebugUpdate, droppedItems, setDroppedItems, onNotification,
  playerHp, playerHunger, onSpawnParticles, equipment, portalPosition, onEnterPortal
}) => {

  const cameraFollowerRef = useRef<THREE.Group>(null);
  const { camera } = useThree();

   // Interaction Hook
  const hasMagicBoots = equipment?.feet?.type === 'magic_boots';

  const { isLocked: isLockedRef, camAngle, debugInfo, applyKnockback, velocityRef } = usePlayerPhysics({ 
    controlsRef, blockMap, positionRef, rainGroupRef,
    viewMode, setIsLocked, respawnTrigger, targetPosRef, resetViewTrigger, playerPosRef,
    hasMagicBoots
  });



  const { cursorPos, armRef, isAttacking } = usePlayerInteraction({
    blockMap, positionRef, inventory, setInventory, activeSlot, setBlocks,
    setCharacters, setPlayerHunger, viewMode, isLocked: isLockedRef, targetPosRef,
    characters, onQuestUpdate, setProjectiles, playerStats, onXpGain, onGoldGain,
    camera: controlsRef.current?.getObject(), setDroppedItems, onNotification, onSpawnParticles
  });

  useGameAI({
     characters, setCharacters, projectiles, setProjectiles, playerPosRef: positionRef,
     setPlayerHp, armor: equipment?.chest?.type === 'iron_armor' ? 10 : 0,
     blockMap, isLocked: isLockedRef, onNotification
  });

  useEffect(() => {
     if(onDebugUpdate && debugInfo) onDebugUpdate(debugInfo);
  }, [debugInfo, onDebugUpdate]);

    // Portal Interaction
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 'X' to enter portal
      if ((e.key === 'x' || e.key === 'X') && portalPosition && playerPosRef?.current) {
        const [px, py, pz] = playerPosRef.current;
        const [tx, ty, tz] = portalPosition;
        const dist = Math.sqrt((px - tx) ** 2 + (pz - tz) ** 2);
        
        if (dist < 5) {
          import('../utils/audio').then(({ audioManager }) => {
              audioManager.playSFX('PORTAL_OPENING');
              audioManager.playSFX('PORTAL_ACTIVATED');
          });
          onEnterPortal();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [portalPosition, onEnterPortal, playerPosRef]);

  // Player Damage Particles
  const prevHpRef = useRef(playerHp);
  useEffect(() => {
      if (playerHp < prevHpRef.current) {
          // Player took damage
          if (playerPosRef?.current) {
               import('../utils/audio').then(({ audioManager }) => {
                 audioManager.playSFX('PLAYER_HIT'); 
               });
               const [x,y,z] = playerPosRef.current;
               // Spawn blood particles
               onSpawnParticles(new THREE.Vector3(x, y + 1, z), '#ff0000');
          }
      }
      prevHpRef.current = playerHp;
  }, [playerHp, playerPosRef, onSpawnParticles]);

  // Sync FP Arms with Camera AND TP Mesh with Position
  const playerMeshRef = useRef<THREE.Group>(null);

  useFrame(() => {
     if (viewMode === 'FP' && cameraFollowerRef.current) {
         cameraFollowerRef.current.position.copy(camera.position);
         cameraFollowerRef.current.quaternion.copy(camera.quaternion);
     }
     
     if (viewMode !== 'FP' && playerMeshRef.current) {
         playerMeshRef.current.position.copy(positionRef.current);
         // Optional: Rotate player mesh to face camera or velocity?
         // For now just position. Rotation is handled by AnimatedCharacter usually, but PlayerMesh is simple.
         // Let's rotate to face direction of movement if moving?
         if (velocityRef.current.length() > 0.1) {
             const angle = Math.atan2(velocityRef.current.x, velocityRef.current.z);
             playerMeshRef.current.rotation.y = angle;
         }
     }
  });

  const activeHotbarItem = inventory[activeSlot];
  const visualHandItem = activeHotbarItem || equipment?.mainHand;
  const hasShield = equipment?.offHand?.type.includes('shield');

  return (
    <group>
      {viewMode === 'FP' && (
        <group ref={cameraFollowerRef}>
            {/* Right Arm (Weapon) */}
            <group ref={armRef} position={[0.3, -0.3, -0.5]}>
               <mesh position={[0, -0.1, 0.2]} rotation={[-0.2, -0.1, 0]}>
                 <boxGeometry args={[0.08, 0.08, 0.4]} />
                 <meshStandardMaterial color="#eecfa1" />
               </mesh>
               <group position={[0, -0.1, -0.1]} rotation={[0, 0, 0]}>
                  <HandWeapon activeItem={visualHandItem} />
               </group>
            </group>

             {/* Left Arm (Shield) */}
            <group position={[-0.3, -0.3, -0.5]}>
               {hasShield && (
                   <>
                       <mesh position={[0, -0.1, 0.2]} rotation={[-0.2, 0.1, 0]}>
                           <boxGeometry args={[0.08, 0.08, 0.4]} />
                           <meshStandardMaterial color="#eecfa1" />
                       </mesh>
                       <group position={[0, -0.05, -0.1]} rotation={[0, -0.2, 0]}>
                           <Shield />
                       </group>
                   </>
               )}
            </group>
        </group>
      )}
      
      {/* 3rd Person Mesh */}
      {viewMode !== 'FP' && (
          <group ref={(ref) => {
              // Sync position in useFrame, but we need a ref to the group.
              // We can define a new ref or just use an inline callback?
              // Better to use a dedicated ref defined at top level for clarity, but I'll use a local ref or just let PlayerMesh handle it?
              // No, PlayerMesh is inside this group.
              // I will use a dedicated ref `playerMeshRef`.
              if (ref) {
                 // Attach ref in render
                 (playerMeshRef.current as any) = ref;
              }
          }}>
              <PlayerMesh equipment={equipment} velocityRef={velocityRef} />
          </group>
      )}
    </group>
  );
};