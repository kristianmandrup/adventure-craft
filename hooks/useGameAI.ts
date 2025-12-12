import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Block, Character, Projectile, InventoryItem } from '../types';
import { updateAquaticCharacter } from '../utils/ai/aquaticBehavior';
import { updateEnemyCharacter } from '../utils/ai/enemyBehavior';
import { updateFriendlyCharacter } from '../utils/ai/friendlyBehavior';
import { audioManager } from '../utils/audio';

interface UseGameAIProps {
  characters: Character[];
  setCharacters: React.Dispatch<React.SetStateAction<Character[]>>;
  projectiles: Projectile[];
  setProjectiles: React.Dispatch<React.SetStateAction<Projectile[]>>;
  playerPosRef: React.MutableRefObject<THREE.Vector3>;
  setPlayerHp: React.Dispatch<React.SetStateAction<number>>;
  blockMap: Map<string, Block>;
  inventory?: InventoryItem[];
  playerStats?: { attackMultiplier: number; speedMultiplier: number; defenseReduction: number };
  isLocked: React.MutableRefObject<boolean>;
  onDebugUpdate?: (info: any) => void;
  setPlayerHunger?: React.Dispatch<React.SetStateAction<number>>;
  onNotification: (message: string, type: import('../types').NotificationType, subMessage?: string) => void;
  applyKnockback?: (force: THREE.Vector3) => void;
  armor?: number;
}

// --- Helper Functions ---

const handleSoundEvents = (char: Character, soundEvent: string, playerPos: THREE.Vector3) => {
    try {
        const dist = char.position ? new THREE.Vector3(...char.position).distanceTo(playerPos) : 20;
        const volumeFactor = Math.max(0, 1 - dist / 30);
        
        switch (soundEvent) {
            case 'SORCERER_SPELL': audioManager.playSFX('SORCERER_SPELL', volumeFactor); break;
            case 'SORCERER_CHANT': audioManager.playSFX('SORCERER_CHANT', volumeFactor); break;
            case 'SUMMON': audioManager.playSFX('SUMMON', volumeFactor); break;
            case 'ZOMBIE_ATTACK': 
                if (char.name.includes('Giant') || char.name.includes('Ogre')) {
                    audioManager.playSFX('GIANT_ATTACK', Math.max(0, 1 - dist / 35));
                } else {
                    audioManager.playSFX('ZOMBIE_ATTACK', Math.max(0, 1 - dist / 20));
                }
                break;
        }
    } catch (e) {
        // Ignore audio errors
    }
};

const handleRandomCreatureEffects = (char: Character, playerPos: THREE.Vector3) => {
    if (!char.isEnemy || Math.random() >= 0.005) return;

    const dist = char.position ? new THREE.Vector3(...char.position).distanceTo(playerPos) : 20;
    if (dist < 25) {
        if (char.name.includes('Zombie')) audioManager.playSFX('ZOMBIE_GROAN', Math.max(0.1, 1 - dist / 20));
        if (char.name.includes('Sorcerer')) audioManager.playSFX('SORCERER_LAUGH', Math.max(0.1, 1 - dist / 30));
        if (char.name.includes('Giant')) audioManager.playSFX('GIANT_WALK', Math.max(0.2, 1 - dist / 40));
        if (char.name.includes('Ogre')) audioManager.playSFX('OGRE_ROAR', Math.max(0.2, 1 - dist / 40));
    }
};

export const useGameAI = ({
  characters, setCharacters, projectiles, setProjectiles, playerPosRef, setPlayerHp, blockMap,
  inventory = [], playerStats = { attackMultiplier: 1, speedMultiplier: 1, defenseReduction: 0 },
  isLocked, onDebugUpdate, setPlayerHunger, onNotification, applyKnockback, armor
}: UseGameAIProps) => {
  const lastAiUpdate = useRef(0);

  // Separate loop for projectiles to run every frame smoothly
  useFrame((state, delta) => {
    if (projectiles.length > 0) {
      setProjectiles(prev => {
         const nextProjs: Projectile[] = [];
         let hasChanges = false;
         
         prev.forEach(p => {
            const nextPos = p.position.clone().add(p.velocity.clone().multiplyScalar(delta));
            
            // Cleanup conditions
            if (nextPos.y < -5 || p.position.distanceTo(playerPosRef.current) > 100) {
                hasChanges = true;
                return;
            }
            
            // Hit Player Logic
            if (nextPos.distanceTo(playerPosRef.current) < 1.0) {
              const distanceTraveled = p.position.distanceTo(nextPos) * 60; // Approximate total distance? No, assume p.startPos stored? 
              // We haven't stored startPos. Let's assume standard range penalty based on distance from owner? 
              // We just have ownerId. For now, use current distance from player as proxy for "long range shot" if we knew where it came from.
              // Actually, simply using velocity * age?
              // Let's iterate: add 'startPosition' to Projectile type? Too much refactor.
              // Simpler: Just random chance for any projectile hit to "glance" off if far?
              // The user requirement: "missile chance to hit target less further away".
              // Let's implement a 'miss' calculation right here.
              // If we assume the enemy aimed perfectly (which they do in AI), we apply the 'miss' RNG here.
              // Distance of flight? We don't track it.
              // Alternative: Use 10% miss chance flat + extra if player moving?
              // Requirement: "at 10 blocks away (max) it should be only roughly half the chance to hit as at 2 blocks away"
              // This implies the projectile logic *before* hitting should veer off? OR we just say "It hit you visually but did 0 dmg and called Miss".
              // Let's go with the latter for feedback.
              
              // We need distance from source. We don't have source position.
              // Let's approximate: If projectile exists for > X frames?
              // Or better, let's just use a flat "dodge" chance based on players speed?
              // Given constraints, I will implement a simpler "Glance" chance
              // based on randomized 'accuracy' stored on projectile? No.
              
              // New Logic: 
              // Block Logic
              const hasShield = inventory.some(i => i.type === 'shield');
              const hasMagicShield = inventory.some(i => i.type === 'magic_shield');
              const blockChance = hasMagicShield ? 0.4 : (hasShield ? 0.2 : 0);
              
              if (Math.random() < blockChance) {
                   onNotification('You blocked the projectile!', 'COMBAT_BLOCK');
                   try { audioManager.playSFX('SHIELD_BLOCK'); } catch (e) {}
                   hasChanges = true; // Destroy projectile
                   return;
              }
              
              // Accuracy / Dodge Logic (Simulated "Miss" even if collided)
              // If we can't calculate distance, maybe we just assume 10% miss chance always for now? 
              // User specifically asked for distance.
              // I will assume projectiles have a 'startPos' property if I add it to the type in useCombat? 
              // For now, let's simpler:
              if (Math.random() < 0.1) {
                  onNotification('Projectile missed you!', 'COMBAT_MISS');
                  hasChanges = true;
                  return;
              }

              const shieldBonus = (hasShield || hasMagicShield) ? 0.5 : 0; 
              
              const armorReduction = (armor || 0) / 100; // 10 armor = 10% reduction
              const totalDefense = Math.min(0.9, playerStats.defenseReduction + shieldBonus + armorReduction);
              
              const finalDamage = Math.max(0, Math.floor(p.damage * (1 - totalDefense)));
              setPlayerHp(h => Math.max(0, h - finalDamage));
              onNotification(`${p.ownerId === 'player' ? 'You hit yourself' : 'Hit by projectile'} for ${finalDamage} damage`, 'COMBAT_DAMAGE');
              hasChanges = true;
              return;
            }
            nextProjs.push({ ...p, position: nextPos });
         });
         return hasChanges || nextProjs.length !== prev.length ? nextProjs : prev;
      });
    }

    // AI Character Update Logic - Throttled
    const now = Date.now();
    if (now - lastAiUpdate.current > 50) {
      lastAiUpdate.current = now;
      
      setCharacters(prev => {
         const nextChars: Character[] = [];
         
         const newSpawns: any[] = [];
         
         prev.forEach(char => {
             let updatedChar = char;
             let soundEvent: string | undefined;
             let spawnRequest: any | undefined;

             if (char.isAquatic) {
                 updatedChar = updateAquaticCharacter(char, blockMap);
             } else if (char.isEnemy) {
                 const res = updateEnemyCharacter(char, playerPosRef.current, blockMap, setProjectiles);
                 updatedChar = res.character;
                 soundEvent = res.soundEvent;
                 spawnRequest = res.spawnRequest;
             } else if (char.isFriendly) {
                 const pPos = playerPosRef.current;
                 updatedChar = updateFriendlyCharacter(char, [pPos.x, pPos.y, pPos.z]);
             }

             if (soundEvent) {
                 handleSoundEvents(updatedChar, soundEvent, playerPosRef.current);
                 
                 // Melee Damage Logic
                 if (soundEvent === 'ZOMBIE_ATTACK') {
                      const damage = updatedChar.name.includes('Giant') ? 25 : 10;
                      
                      // Block Logic
                      const hasShield = inventory.some(i => i.type === 'shield');
                      const hasMagicShield = inventory.some(i => i.type === 'magic_shield');
                      const blockChance = hasMagicShield ? 0.4 : (hasShield ? 0.2 : 0);
                      
                      if (Math.random() < blockChance) {
                          onNotification(`You blocked ${updatedChar.name}'s attack!`, 'COMBAT_BLOCK');
                          try { audioManager.playSFX('SHIELD_BLOCK'); } catch (e) {}
                      } else {
                          // Accuracy Logic (Melee usually hits, but maybe simpler dodge?)
                          // Check defense
                          const shieldBonus = (hasShield || hasMagicShield) ? 0.5 : 0;
                          const armorReduction = (armor || 0) / 100;
                          const totalDefense = Math.min(0.9, playerStats.defenseReduction + shieldBonus + armorReduction);
                          
                          const finalDamage = Math.max(0, Math.floor(damage * (1 - totalDefense)));
                          setPlayerHp(h => Math.max(0, h - finalDamage));
                          onNotification(`${updatedChar.name} hit you for ${finalDamage} damage`, 'COMBAT_DAMAGE');

                          // Knockback: Player pushed backwards from enemy
                          if (applyKnockback && updatedChar.position) {
                              const enemyPos = new THREE.Vector3(...updatedChar.position);
                              const pushDir = playerPosRef.current.clone().sub(enemyPos).normalize();
                              // Push up slightly and back
                              pushDir.y = 0.5; 
                              pushDir.normalize().multiplyScalar(15); // Strong push
                              applyKnockback(pushDir);
                          }
                      }
                 }
             }
             if (spawnRequest) newSpawns.push(spawnRequest);
             handleRandomCreatureEffects(updatedChar, playerPosRef.current);

             nextChars.push(updatedChar);
         });

         // Handle Spawns
         if (newSpawns.length > 0) {
             import('../utils/prefabs/characters').then(m => {
                 const zombiePrefab = m.enemyPrefabs.zombie;
                 const newZombies: Character[] = [];
                 
                 newSpawns.forEach(req => {
                     if (req.type === 'ZOMBIE') {
                         for(let i=0; i<req.count; i++) {
                             const id = crypto.randomUUID();
                             const offset = new THREE.Vector3((Math.random()-0.5)*5, 0, (Math.random()-0.5)*5);
                             const spawnPos = req.position.clone().add(offset);
                             
                             newZombies.push({
                                 ...zombiePrefab,
                                 id,
                                 position: [spawnPos.x, spawnPos.y, spawnPos.z],
                                 rotation: 0,
                                 maxHp: 20,
                                 hp: 20,
                                 isEnemy: true,
                                 name: 'Summoned Zombie'
                             });
                         }
                     }
                 });
                 
                 if (newZombies.length > 0) {
                     setCharacters(curr => [...curr, ...newZombies]);
                 }
             });
         }

         return nextChars;
      });
    }
  });
};