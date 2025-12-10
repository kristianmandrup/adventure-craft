import { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Block, Character, InventoryItem } from '../types';
import { raycastBlock } from '../utils/physics';

interface UsePlayerInteractionProps {
  blockMap: Map<string, Block>;
  position: THREE.Vector3;
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  activeSlot: number;
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
  setCharacters: React.Dispatch<React.SetStateAction<Character[]>>;
  setPlayerHunger: React.Dispatch<React.SetStateAction<number>>;
  viewMode: 'FP' | 'OVERHEAD';
  isLocked: React.MutableRefObject<boolean>;
  targetPosRef: React.MutableRefObject<[number, number, number] | null>;
  characters: Character[];
  onQuestUpdate: (type: string, amount: number) => void;
}

export const usePlayerInteraction = ({
  blockMap, position, inventory, setInventory, activeSlot, setBlocks, setCharacters, setPlayerHunger, viewMode, isLocked, targetPosRef, characters, onQuestUpdate
}: UsePlayerInteractionProps) => {
  const { camera, raycaster, pointer } = useThree();
  const [cursorPos, setCursorPos] = useState<[number, number, number] | null>(null);
  const isAttacking = useRef(false);
  const armRef = useRef<THREE.Group>(null);

  // Mouse Down Handler
  useEffect(() => {
    const onMouseDown = (event: MouseEvent) => {
      if ((event.target as HTMLElement).tagName !== 'CANVAS') return;
      if (viewMode === 'FP' && !isLocked.current) return;
      if (viewMode === 'OVERHEAD' && event.button !== 0 && event.button !== 2) return;

      const currentItem = inventory[activeSlot];

      if (cursorPos) {
        const [tx, ty, tz] = cursorPos; 
        
        // Right Click: Place / Eat
        if (event.button === 2) {
          if (currentItem && currentItem.count > 0) {
            if (currentItem.type === 'meat') {
               setPlayerHunger(h => Math.min(100, h + 20));
               setInventory(prev => prev.map((inv, idx) => idx === activeSlot ? { ...inv, count: inv.count - 1 } : inv));
            } else if (currentItem.type !== 'weapon') {
               const pBox = new THREE.Box3().setFromCenterAndSize(position, new THREE.Vector3(0.6, 1.8, 0.6));
               const bBox = new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(tx, ty, tz), new THREE.Vector3(1, 1, 1));
               
               if (viewMode === 'OVERHEAD' || !pBox.intersectsBox(bBox)) {
                   setBlocks(prev => [...prev, {
                     id: crypto.randomUUID(),
                     x: tx, y: ty, z: tz,
                     color: currentItem.color,
                     type: currentItem.type
                   }]);
                   setInventory(prev => prev.map((inv, idx) => idx === activeSlot ? { ...inv, count: inv.count - 1 } : inv));
               }
            }
          }
        }
        
        // Left Click: Mine / Attack
        if (event.button === 0) {
           isAttacking.current = true;
           setTimeout(() => isAttacking.current = false, 200);

           if (viewMode === 'OVERHEAD') {
             raycaster.setFromCamera(pointer, camera);
             const origin = raycaster.ray.origin;
             const direction = raycaster.ray.direction;
             const hit = raycastBlock(origin, direction, blockMap, 100);
             if (hit.block) {
                setBlocks(prev => prev.filter(b => b.id !== hit.block!.id));
                const b = hit.block;
                onQuestUpdate(b.type || 'dirt', 1); // Quest Update on Mine
                setInventory(prev => {
                     const existing = prev.find(i => i.type === b.type);
                     if (existing) return prev.map(i => i.type === b.type ? { ...i, count: i.count + 1 } : i);
                     return [...prev, { type: b.type || 'dirt', count: 1, color: b.color }];
                 });
             }
           } else {
             const dir = new THREE.Vector3();
             camera.getWorldDirection(dir);
             const hit = raycastBlock(camera.position, dir, blockMap, 4);
             
             let hitEnemy = false;
             const rayOrigin = camera.position.clone();
             
             // Detect hit locally first to trigger updates
             const hitChars = characters.filter(c => {
                 const charPos = new THREE.Vector3(...c.position);
                 const dist = charPos.distanceTo(rayOrigin);
                 const toChar = charPos.clone().sub(rayOrigin).normalize();
                 const dot = dir.dot(toChar);
                 return dist < 5 && dot > 0.9;
             });

             if (hitChars.length > 0) {
                 hitEnemy = true;
                 const baseDamage = 4;
                 const weaponBonus = currentItem?.type === 'weapon' ? 11 : 0; 
                 const damage = baseDamage + weaponBonus;

                 // Update HP state
                 setCharacters(prev => {
                    return prev.map(c => {
                        if (hitChars.find(hc => hc.id === c.id)) {
                             const newHp = c.hp - damage;
                             if (newHp <= 0) {
                                // Quest update on Kill
                                const type = c.name.toLowerCase();
                                if (type.includes('zombie')) onQuestUpdate('zombie', 1);
                                if (type.includes('spider')) onQuestUpdate('spider', 1);
                                if (type.includes('skeleton')) onQuestUpdate('skeleton', 1);
                                if (type.includes('sorcerer')) onQuestUpdate('sorcerer', 1);
                                
                                const isAnimal = !c.isEnemy || type.includes('sheep') || type.includes('cow') || type.includes('pig');
                                if (isAnimal) {
                                   setInventory(inv => {
                                     const existing = inv.find(i => i.type === 'meat');
                                     if (existing) return inv.map(i => i.type === 'meat' ? { ...i, count: i.count + 1 } : i);
                                     return [...inv, { type: 'meat', count: 1, color: '#ef4444' }];
                                   });
                                }
                             }
                             return { ...c, hp: newHp };
                        }
                        return c;
                    }).filter(c => c.hp > 0);
                 });
             }

             if (!hitEnemy && hit.block) {
                setBlocks(prev => prev.filter(b => b.id !== hit.block!.id));
                 const b = hit.block;
                 onQuestUpdate(b.type || 'dirt', 1); // Quest Update on Mine
                 setInventory(prev => {
                     const existing = prev.find(i => i.type === b.type);
                     if (existing) return prev.map(i => i.type === b.type ? { ...i, count: i.count + 1 } : i);
                     return [...prev, { type: b.type || 'dirt', count: 1, color: b.color }];
                 });
             }
           }
        }
      }
    };

    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [blockMap, position, inventory, activeSlot, viewMode, isLocked, cursorPos, setBlocks, setInventory, setCharacters, setPlayerHunger, characters, onQuestUpdate]);

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
    if (armRef.current && viewMode === 'FP') {
        if (isAttacking.current) {
            armRef.current.rotation.x = THREE.MathUtils.lerp(armRef.current.rotation.x, -Math.PI / 2, 0.5);
            armRef.current.rotation.y = THREE.MathUtils.lerp(armRef.current.rotation.y, -0.5, 0.5);
        } else {
            armRef.current.rotation.x = THREE.MathUtils.lerp(armRef.current.rotation.x, -0.2, 0.1);
            armRef.current.rotation.y = THREE.MathUtils.lerp(armRef.current.rotation.y, 0, 0.1);
        }
    }
  });

  return { cursorPos, armRef, isAttacking };
};