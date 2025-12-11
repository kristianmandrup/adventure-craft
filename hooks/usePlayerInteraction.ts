import { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Block, Character, InventoryItem, Projectile } from '../types';
import { raycastBlock } from '../utils/physics';
import { useCombat } from './interaction/useCombat';
import { useMining } from './interaction/useMining';
import { usePlacement } from './interaction/usePlacement';

interface UsePlayerInteractionProps {
  blockMap: Map<string, Block>;
  positionRef: React.MutableRefObject<THREE.Vector3>;
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  activeSlot: number;
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
  setCharacters: React.Dispatch<React.SetStateAction<Character[]>>;
  setPlayerHunger: React.Dispatch<React.SetStateAction<number>>;
  viewMode: 'FP' | 'OVERHEAD' | 'TP';
  isLocked: React.MutableRefObject<boolean>;
  targetPosRef: React.MutableRefObject<[number, number, number] | null>;
  characters: Character[];
  onQuestUpdate: (type: string, amount: number) => void;
  setProjectiles: React.Dispatch<React.SetStateAction<Projectile[]>>;
  playerStats: { attackMultiplier: number; speedMultiplier: number; defenseReduction: number };
  onXpGain: (amount: number) => void;
  onGoldGain: (amount: number) => void;
  camera?: THREE.Object3D;
  setDroppedItems: React.Dispatch<React.SetStateAction<import('../types').DroppedItem[]>>;
  onNotification: (message: string, type: import('../types').NotificationType, subMessage?: string) => void;
}

export const usePlayerInteraction = ({
  blockMap, positionRef, inventory, setInventory, activeSlot, setBlocks, setCharacters, setPlayerHunger, viewMode, isLocked, targetPosRef, characters, onQuestUpdate,
  setProjectiles, playerStats, onXpGain, onGoldGain, setDroppedItems, onNotification
}: UsePlayerInteractionProps) => {
  const { camera, raycaster, pointer } = useThree();
  const [cursorPos, setCursorPos] = useState<[number, number, number] | null>(null);
  const isAttacking = useRef(false);
  const armRef = useRef<THREE.Group>(null);

  // Sub-Hooks
  const { handleAttack } = useCombat({
      characters, setCharacters, setProjectiles, inventory, setInventory, playerStats, onQuestUpdate, onXpGain, onGoldGain, onNotification, setDroppedItems
  });

  const { handleMining } = useMining({
      setBlocks, inventory, setDroppedItems, onQuestUpdate, onNotification
  });

  const { handleInteraction: handlePlace } = usePlacement({
      setBlocks, inventory, setInventory, setPlayerHunger, onNotification, positionRef, viewMode, blockMap, onGoldGain
  });

  const handleInteraction = (isRightClick: boolean) => {
       if (!isLocked.current && viewMode === 'FP') return;

       // Attack / Mine Logic (Left Click or X)
       if (!isRightClick) {
          isAttacking.current = true;
          setTimeout(() => isAttacking.current = false, 150);

          // 1. Try Combat
          const hitSomething = handleAttack(camera, activeSlot);
          
          // 2. Try Mining (if no combat hit)
          if (!hitSomething) {
             const dir = new THREE.Vector3();
             camera.getWorldDirection(dir);
             const blockHit = raycastBlock(camera.position, dir, blockMap, 5);
             if (blockHit.block) {
                 handleMining(blockHit.block, activeSlot);
             }
          }
       } 
       // Right Click Logic (Place / Eat)
       else if (isRightClick && cursorPos) {
           handlePlace(cursorPos, activeSlot);
       }
  };

  useEffect(() => {
    const onMouseDown = (event: MouseEvent) => {
      if ((event.target as HTMLElement).tagName !== 'CANVAS') return;
      handleInteraction(event.button === 2);
    };

    const onKeyDown = (event: KeyboardEvent) => {
        if (event.code === 'KeyX') {
            handleInteraction(false); 
        }
    };

    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
        document.removeEventListener('mousedown', onMouseDown);
        document.removeEventListener('keydown', onKeyDown);
    };
  }, [blockMap, positionRef, inventory, activeSlot, viewMode, isLocked, cursorPos, handleAttack, handleMining, handlePlace]);

  // Frame Loop for Raycasting
  useFrame(() => {
    let origin, direction;
    if (viewMode === 'OVERHEAD') {
      raycaster.setFromCamera(pointer, camera);
      origin = raycaster.ray.origin;
      direction = raycaster.ray.direction;
    } else {
      origin = camera.position;
      const dir = new THREE.Vector3();
      camera.getWorldDirection(dir);
      direction = dir;
    }

    const hit = raycastBlock(origin, direction, blockMap, viewMode === 'OVERHEAD' ? 200 : 5);
    
    if (hit.block && hit.face) {
       const tx = hit.block.x + (hit.face.x > 0 ? 1 : hit.face.x < 0 ? -1 : 0);
       const ty = hit.block.y + (hit.face.y > 0 ? 1 : hit.face.y < 0 ? -1 : 0);
       const tz = hit.block.z + (hit.face.z > 0 ? 1 : hit.face.z < 0 ? -1 : 0);
       setCursorPos([tx, ty, tz]);
       targetPosRef.current = [tx, ty, tz];
    } else {
       setCursorPos(null);
       targetPosRef.current = null;
    }
    
    // Arm Animation
    if (armRef.current && (viewMode === 'FP')) {
        if (isAttacking.current) {
            armRef.current.rotation.x = THREE.MathUtils.lerp(armRef.current.rotation.x, -Math.PI / 1.5, 0.4);
            armRef.current.rotation.y = THREE.MathUtils.lerp(armRef.current.rotation.y, -0.8, 0.4);
        } else {
            armRef.current.rotation.x = THREE.MathUtils.lerp(armRef.current.rotation.x, -0.2, 0.1);
            armRef.current.rotation.y = THREE.MathUtils.lerp(armRef.current.rotation.y, 0, 0.1);
        }
    }
  });

  return { cursorPos, armRef, isAttacking };
};