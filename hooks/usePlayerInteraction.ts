import { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Block, Character, InventoryItem, Projectile } from '../types';
import { raycastBlock } from '../utils/physics';
import { v4 as uuidv4 } from 'uuid';

interface UsePlayerInteractionProps {
  blockMap: Map<string, Block>;
  positionRef: React.MutableRefObject<THREE.Vector3>;
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
  setProjectiles: React.Dispatch<React.SetStateAction<Projectile[]>>;
  playerStats: { attackMultiplier: number; speedMultiplier: number; defenseReduction: number };
  onXpGain: (amount: number) => void;
  onGoldGain: (amount: number) => void;
  // Extras
  camera?: THREE.Object3D;
}

// XP values for enemy types
const ENEMY_XP: Record<string, number> = {
  zombie: 15,
  skeleton: 20,
  spider: 15,
  sorcerer: 40,
  giant: 75,
};

// Gold drops by enemy type
const ENEMY_GOLD: Record<string, [number, number]> = {
  zombie: [5, 10],
  skeleton: [8, 15],
  spider: [5, 10],
  sorcerer: [15, 25],
  giant: [30, 50],
  boss: [50, 100],
};

export const usePlayerInteraction = ({
  blockMap, positionRef, inventory, setInventory, activeSlot, setBlocks, setCharacters, setPlayerHunger, viewMode, isLocked, targetPosRef, characters, onQuestUpdate,
  setProjectiles, playerStats, onXpGain, onGoldGain
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
               const pBox = new THREE.Box3().setFromCenterAndSize(positionRef.current, new THREE.Vector3(0.6, 1.8, 0.6));
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
        
        // Left Click: Mine / Attack / Shoot Bow
        if (event.button === 0) {
           isAttacking.current = true;
           setTimeout(() => isAttacking.current = false, 200);

           // Bow shooting - check if bow equipped and arrows available
           if (currentItem?.type === 'bow') {
             const arrowSlotIndex = inventory.findIndex(i => i.type === 'arrows' && i.count > 0);
             if (arrowSlotIndex >= 0) {
               const dir = new THREE.Vector3();
               camera.getWorldDirection(dir);
               
               // Find nearest enemy within view cone (15 blocks, dot > 0.5 = ~60 degree cone)
               const playerPos = camera.position.clone();
               let nearestEnemy: Character | null = null;
               let nearestDist = 15;
               
               for (const c of characters) {
                 if (!c.isEnemy) continue;
                 const charPos = new THREE.Vector3(...c.position);
                 const dist = charPos.distanceTo(playerPos);
                 if (dist > 15) continue;
                 
                 const toChar = charPos.clone().sub(playerPos).normalize();
                 const dot = dir.dot(toChar);
                 
                 if (dot > 0.5 && dist < nearestDist) {
                   nearestEnemy = c;
                   nearestDist = dist;
                 }
               }
               
               if (nearestEnemy) {
                 // Create arrow projectile toward enemy
                 const targetPos = new THREE.Vector3(...nearestEnemy.position);
                 const arrowDir = targetPos.clone().sub(playerPos).normalize();
                 const arrowVelocity = arrowDir.multiplyScalar(25);
                 
                 setProjectiles(prev => [...prev, {
                   id: uuidv4(),
                   position: playerPos.clone(),
                   velocity: arrowVelocity,
                   damage: Math.floor(15 * playerStats.attackMultiplier),
                   ownerId: 'player',
                   color: '#8b4513',  // Brown arrow color
                   createdAt: Date.now()
                 }]);
                 
                 // Decrement arrow count
                 setInventory(prev => prev.map((inv, idx) => 
                   idx === arrowSlotIndex ? { ...inv, count: inv.count - 1 } : inv
                 ).filter(i => i.count > 0));
               }
             }
             return; // Don't do melee when using bow
           }

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
                 const hasSword = currentItem?.type === 'weapon';
                 const baseDamage = hasSword ? 20 : 10;
                 const damage = Math.floor(baseDamage * playerStats.attackMultiplier);

                 // Update HP state
                 setCharacters(prev => {
                    return prev.map(c => {
                        if (hitChars.find(hc => hc.id === c.id)) {
                             const newHp = c.hp - damage;
                              if (newHp <= 0) {
                                 // Quest update on Kill + XP gain
                                 const type = c.name.toLowerCase();
                                 let enemyType = 'zombie';
                                 
                                 if (type.includes('zombie')) {
                                   onQuestUpdate('zombie', 1);
                                   onXpGain(ENEMY_XP.zombie);
                                   enemyType = 'zombie';
                                 }
                                 if (type.includes('spider')) {
                                   onQuestUpdate('spider', 1);
                                   onXpGain(ENEMY_XP.spider);
                                   enemyType = 'spider';
                                 }
                                 if (type.includes('skeleton')) {
                                   onQuestUpdate('skeleton', 1);
                                   onXpGain(ENEMY_XP.skeleton);
                                   enemyType = 'skeleton';
                                 }
                                 if (type.includes('sorcerer')) {
                                   onQuestUpdate('sorcerer', 1);
                                   onXpGain(ENEMY_XP.sorcerer);
                                   enemyType = 'sorcerer';
                                 }
                                 if (type.includes('giant') || type.includes('ogre') || type.includes('guardian')) {
                                   onQuestUpdate('giant', 1);
                                   onXpGain(ENEMY_XP.giant);
                                   enemyType = type.includes('guardian') ? 'boss' : 'giant';
                                 }
                                 
                                 // Enemy drops (only for enemies)
                                 if (c.isEnemy) {
                                   // 30% chance to drop item
                                   if (Math.random() < 0.3) {
                                     const drops = ['meat', 'apple', 'wood', 'stone'];
                                     const dropItem = drops[Math.floor(Math.random() * drops.length)];
                                     setInventory(inv => {
                                       const existing = inv.find(i => i.type === dropItem);
                                       const color = dropItem === 'meat' ? '#ef4444' : dropItem === 'apple' ? '#ef4444' : dropItem === 'wood' ? '#8b4513' : '#808080';
                                       if (existing) return inv.map(i => i.type === dropItem ? { ...i, count: i.count + 1 } : i);
                                       return [...inv, { type: dropItem, count: 1, color }];
                                     });
                                   }
                                   
                                   // 20% chance to drop gold
                                   if (Math.random() < 0.2) {
                                     const goldRange = ENEMY_GOLD[enemyType] || ENEMY_GOLD.zombie;
                                     const goldAmount = goldRange[0] + Math.floor(Math.random() * (goldRange[1] - goldRange[0] + 1));
                                     onGoldGain(goldAmount);
                                   }
                                 }
                                
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
                  const b = hit.block;
                  const hasAxe = currentItem?.type === 'axe';
                  const isWood = b.type === 'wood' || b.type === 'log';
                  
                  // Wood blocks have HP and require multiple hits
                  if (b.hp !== undefined && b.hp > 0) {
                    // Axe does 10 damage, fist/other does 2 damage
                    const damage = hasAxe ? 10 : 2;
                    const newHp = b.hp - damage;
                    
                    if (newHp <= 0) {
                      // Block destroyed - drop items
                      setBlocks(prev => prev.filter(blk => blk.id !== b.id));
                      onQuestUpdate(b.type || 'dirt', 1);
                      
                      // Axe bonus: 2-5 logs when wood breaks
                      const dropCount = (hasAxe && isWood) ? (2 + Math.floor(Math.random() * 4)) : 1;
                      setInventory(prev => {
                        const existing = prev.find(i => i.type === b.type);
                        if (existing) return prev.map(i => i.type === b.type ? { ...i, count: i.count + dropCount } : i);
                        return [...prev, { type: b.type || 'dirt', count: dropCount, color: b.color }];
                      });
                    } else {
                      // Just reduce HP
                      setBlocks(prev => prev.map(blk => 
                        blk.id === b.id ? { ...blk, hp: newHp } : blk
                      ));
                    }
                  } else {
                    // Instant break for blocks without HP
                    setBlocks(prev => prev.filter(blk => blk.id !== b.id));
                    onQuestUpdate(b.type || 'dirt', 1);
                    setInventory(prev => {
                        const existing = prev.find(i => i.type === b.type);
                        if (existing) return prev.map(i => i.type === b.type ? { ...i, count: i.count + 1 } : i);
                        return [...prev, { type: b.type || 'dirt', count: 1, color: b.color }];
                    });
                  }
              }
           }
        }
      }
    };

    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [blockMap, positionRef, inventory, activeSlot, viewMode, isLocked, cursorPos, setBlocks, setInventory, setCharacters, setPlayerHunger, characters, onQuestUpdate]);

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