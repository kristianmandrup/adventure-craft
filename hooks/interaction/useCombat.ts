import { useState } from 'react';
import * as THREE from 'three';
import { Character, InventoryItem, Projectile } from '../../types';
import { audioManager } from '../../utils/audio';
import { v4 as uuidv4 } from 'uuid';

interface UseCombatProps {
    characters: Character[];
    setCharacters: React.Dispatch<React.SetStateAction<Character[]>>;
    setProjectiles: React.Dispatch<React.SetStateAction<Projectile[]>>;
    inventory: InventoryItem[];
    setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
    playerStats: { attackMultiplier: number; speedMultiplier: number; defenseReduction: number };
    onQuestUpdate: (type: string, amount: number) => void;
    onXpGain: (amount: number) => void;
    onGoldGain: (amount: number) => void;
    onNotification: (message: string, type: import('../../types').NotificationType, subMessage?: string) => void;
    setDroppedItems: React.Dispatch<React.SetStateAction<import('../../types').DroppedItem[]>>;
    onSpawnParticles: (pos: THREE.Vector3, color: string) => void;
}

const ENEMY_XP: Record<string, number> = {
  zombie: 15, skeleton: 20, spider: 15, sorcerer: 40, giant: 75,
};

const ENEMY_GOLD: Record<string, [number, number]> = {
  zombie: [5, 10], skeleton: [8, 15], spider: [5, 10], sorcerer: [15, 25], giant: [30, 50], boss: [50, 100],
};

export const useCombat = ({
    characters, setCharacters, setProjectiles, inventory, setInventory, playerStats,
    onQuestUpdate, onXpGain, onGoldGain, onNotification, setDroppedItems, onSpawnParticles
}: UseCombatProps) => {

    const spawnDrop = (position: THREE.Vector3, type: string, count: number, color: string) => {
        const velocity = new THREE.Vector3((Math.random() - 0.5) * 2, 4, (Math.random() - 0.5) * 2);
        setDroppedItems(prev => [...prev, {
            id: uuidv4(), type, position: position.clone(), velocity, count, color, createdAt: Date.now()
        }]);
    };

    const handleAttack = (camera: THREE.Camera, activeSlot: number) => {
        const currentItem = inventory[activeSlot];

        // Bow Logic
        if (currentItem?.type === 'bow') {
            const arrowSlotIndex = inventory.findIndex(i => i.type === 'arrows' && i.count > 0);
            if (arrowSlotIndex >= 0) {
                const dir = new THREE.Vector3();
                camera.getWorldDirection(dir);
                const playerPos = camera.position.clone();
                
                let nearestEnemy: Character | null = null;
                let nearestDist = 15;
                
                for (const c of characters) {
                    if (!c.isEnemy) continue;
                    const charPos = new THREE.Vector3(...c.position);
                    const dist = charPos.distanceTo(playerPos);
                    if (dist > 15) continue;
                    const toChar = charPos.clone().sub(playerPos).normalize();
                    if (dir.dot(toChar) > 0.5 && dist < nearestDist) {
                        nearestEnemy = c;
                        nearestDist = dist;
                    }
                }

                const arrowDir = nearestEnemy 
                    ? new THREE.Vector3(...nearestEnemy.position).sub(playerPos).normalize()
                    : dir;

                setProjectiles(prev => [...prev, {
                    id: crypto.randomUUID(),
                    position: playerPos.clone().add(dir.multiplyScalar(0.5)),
                    velocity: arrowDir.multiplyScalar(25),
                    damage: Math.floor(15 * playerStats.attackMultiplier),
                    ownerId: 'player',
                    color: '#8b4513',
                    createdAt: Date.now()
                }]);
                
                setInventory(prev => prev.map((inv, idx) => 
                    idx === arrowSlotIndex ? { ...inv, count: inv.count - 1 } : inv
                ).filter(i => i.count > 0)); 
                try { audioManager.playSFX('SHOOT'); } catch (e) {}
            }
            return true; // Attack performed
        }

        // Melee Logic
        const isWeapon = currentItem?.type === 'weapon' || currentItem?.type.includes('axe') || currentItem?.type.includes('pick');
        
        if (isWeapon) {
             const isHeavy = currentItem.type === 'weapon' && Math.random() < 0.3;
             const isAxe = currentItem.type.includes('axe');
             try { 
                 if (isAxe) {
                    audioManager.playSFX('ATTACK_AXE');
                 } else {
                    audioManager.playSFX(isHeavy ? 'ATTACK_HEAVY' : 'ATTACK_SWORD'); 
                 }
             } catch (e) {}
        } else {
            // Unarmed / Punch
             try { audioManager.playSFX('PUNCH'); } catch (e) {}
        }

        // Hit Detection
        const dir = new THREE.Vector3();
        camera.getWorldDirection(dir);
        
        const hitChars = characters.filter(c => {
             const charPos = new THREE.Vector3(...c.position);
             const toChar = charPos.clone().sub(camera.position);
             const dist = toChar.length();
             if (dist > 5) return false;
             toChar.normalize();
             return dir.dot(toChar) > 0.9;
        });

        if (hitChars.length > 0) {
            const hasSword = currentItem?.type === 'weapon';
            const baseDamage = hasSword ? 20 : 10;
            const damage = Math.floor(baseDamage * playerStats.attackMultiplier);

            setCharacters(prev => {
                return prev.map(c => {
                    if (hitChars.find(hc => hc.id === c.id)) {
                        const newHp = c.hp - damage;
                        onNotification(`You hit ${c.name} for ${damage} damage`, 'COMBAT_HIT');
                        
                        if (newHp <= 0) {
                            // Kill Logic
                            const type = c.name.toLowerCase();
                            let enemyType = 'zombie';
                            if (type.includes('zombie')) { onQuestUpdate('zombie', 1); onXpGain(ENEMY_XP.zombie); enemyType = 'zombie'; }
                            if (type.includes('spider')) { onQuestUpdate('spider', 1); onXpGain(ENEMY_XP.spider); enemyType = 'spider'; }
                            if (type.includes('skeleton')) { onQuestUpdate('skeleton', 1); onXpGain(ENEMY_XP.skeleton); enemyType = 'skeleton'; }
                            if (type.includes('sorcerer')) { onQuestUpdate('sorcerer', 1); onXpGain(ENEMY_XP.sorcerer); enemyType = 'sorcerer'; }
                            if (type.includes('giant') || type.includes('ogre') || type.includes('guardian')) {
                                onQuestUpdate('giant', 1);
                                onXpGain(ENEMY_XP.giant);
                                enemyType = type.includes('guardian') ? 'boss' : 'giant';
                            }
                            
                            try {
                                if (enemyType === 'zombie') audioManager.playSFX('ZOMBIE_DEATH');
                                else if (enemyType === 'sorcerer') audioManager.playSFX('SORCERER_DEATH');
                                else if (enemyType === 'giant' || enemyType === 'boss') audioManager.playSFX('GIANT_DEATH');
                                else audioManager.playSFX('GENERIC_DEATH');
                            } catch(e) {}

                            let dropMsg = '';
                            let dropsText = [];
                            
                            // Check if enemy or animal
                            const isAnimal = ['sheep', 'cow', 'pig', 'chicken', 'fish'].some(a => type.includes(a));
                            
                            if (c.isEnemy || isAnimal) {
                                // Specific Animal Drops
                                if (isAnimal) {
                                   let meatType = 'meat';
                                   let color = '#ef4444';
                                   let count = 1;
                                   
                                   if (type.includes('chicken')) { meatType = 'chicken_meat'; color = '#fcd5ce'; count = 2; } // 2 legs
                                   if (type.includes('cow')) { meatType = 'beef_meat'; color = '#AA4A44'; count = 2; }
                                   if (type.includes('pig')) { meatType = 'pork_meat'; color = '#ffcad4'; count = 2; }
                                   if (type.includes('sheep')) { meatType = 'mutton_meat'; color = '#c08081'; count = 1; }
                                   if (type.includes('fish')) { meatType = 'fish_meat'; color = '#ff6b35'; count = 1; }

                                   spawnDrop(new THREE.Vector3(...c.position), meatType, count, color);
                                   dropsText.push(`${count} ${meatType.replace('_meat', '')}`);
                                } 
                                // Enemy Drops
                                else if (c.isEnemy) {
                                   const drops = ['meat', 'apple', 'wood', 'stone'];
                                   if (Math.random() < 0.5) {
                                       const droppedItemType = drops[Math.floor(Math.random() * drops.length)];
                                       spawnDrop(new THREE.Vector3(...c.position), droppedItemType, 1, '#ef4444');
                                       dropsText.push(`a ${droppedItemType}`);
                                   }
                                   
                                   if (Math.random() < 0.2 || enemyType === 'boss') {
                                       const goldRange = ENEMY_GOLD[enemyType] || ENEMY_GOLD.zombie;
                                       const goldAmount = goldRange[0] + Math.floor(Math.random() * (goldRange[1] - goldRange[0] + 1));
                                       onGoldGain(goldAmount);
                                       dropsText.push(`${goldAmount} gold`);
                                       
                                       // Boss / Giant Armor Drop Chance
                                       if ((enemyType === 'boss' || enemyType === 'giant') && Math.random() < 0.3) {
                                            spawnDrop(new THREE.Vector3(...c.position), 'iron_armor', 1, '#9ca3af');
                                            dropsText.push('Iron Armor');
                                       }
                                   }
                                }

                                if (dropsText.length > 0) {
                                    dropMsg = `The ${c.name} dropped ${dropsText.join(' and ')}`;
                                }
                                
                                if (dropMsg) onNotification(dropMsg, 'MERCHANT'); 
                                else if (c.isEnemy) onNotification(`You killed ${c.name}`, 'MERCHANT');
                            }
                        } else {
                            try { 
                                audioManager.playSFX('PUNCH_HIT');
                                if (c.name.toLowerCase().includes('zombie')) audioManager.playSFX('ZOMBIE_HIT');
                                else if (isAnimal) audioManager.playSFX('ANIMAL_HURT'); // Placeholder if you have it, else PUNCH_HIT works
                            } catch (e) {}
                            
                            // Enemy Knockback
                            const camPos = camera.position.clone(); 
                            const enemyPos = new THREE.Vector3(...c.position);
                            const pushDir = enemyPos.clone().sub(camPos).normalize();
                            pushDir.y = 0; 
                            
                            // Move 1 block
                            c.position = [
                                c.position[0] + pushDir.x * 1,
                                c.position[1],
                                c.position[2] + pushDir.z * 1
                            ] as [number, number, number];
                            
                            // Trigger Fleeing
                            c.lastDamagedTime = Date.now();
                        }
                        return { ...c, hp: newHp, lastDamagedTime: Date.now() };
                    }
                    return c;
                }).filter(c => c.hp > 0);
            });
            return true; // Hit something
        }
        return false; // Missed
    };

    return { handleAttack };
};
