import * as THREE from 'three';
import { Character, Projectile } from '../../../types';
import { AIContext, BehaviorStrategy, SpawnRequest } from './BaseBehavior';
import { PassiveBehavior } from './PassiveBehavior';

const handleSummoning = (dist: number, char: Character, charPos: THREE.Vector3, playerPos: THREE.Vector3): { soundEvent?: string, spawnRequest?: SpawnRequest, updatedChar?: Character } | null => {
    // Summoning Logic: When player gets near (e.g., < 20 blocks) and hasn't summoned yet
    if (!char.hasSummoned && dist < 20) {
         const soundEvent = 'SUMMON';
         const spawnRequest: SpawnRequest = {
             type: 'ZOMBIE',
             count: Math.floor(Math.random() * 3) + 1, // 1-3 zombies
             position: charPos
         };
         
         const updatedChar: Character = {
             ...char,
             hasSummoned: true,
             // Briefly look at player
             rotation: Math.atan2(playerPos.x - charPos.x, playerPos.z - charPos.z),
             isMoving: false
         };

         return { soundEvent, spawnRequest, updatedChar };
    }
    return null;
};

const handleAttack = (dist: number, char: Character, context: AIContext, charPos: THREE.Vector3): { soundEvent?: string, updatedChar?: Character } | null => {
    const now = context.now;
    let lastAttackTime = char.lastAttackTime || 0;

    if (dist < 15) {
         if (now - lastAttackTime > 5000) { 
            lastAttackTime = now;
            
            // Standard Attack
            const soundEvent = 'SORCERER_SPELL';
            const projDir = context.playerPos.clone().sub(charPos).normalize();
            
            const newProj: Projectile = {
                id: crypto.randomUUID(),
                position: charPos.clone().add(new THREE.Vector3(0, 1.5, 0)),
                velocity: projDir.multiplyScalar(10), 
                damage: 15,
                ownerId: char.id,
                color: '#a855f7',
                createdAt: now
            };
            
            setTimeout(() => context.setProjectiles(p => [...p, newProj]), 0);
            
            return {
                soundEvent,
                updatedChar: {
                    ...char,
                    rotation: Math.atan2(context.playerPos.x - charPos.x, context.playerPos.z - charPos.z),
                    lastAttackTime,
                    isMoving: false
                }
            };
         }
         
         // In range but cooldown active - just update rotation
         return {
             updatedChar: {
                 ...char,
                 rotation: Math.atan2(context.playerPos.x - charPos.x, context.playerPos.z - charPos.z),
                 lastAttackTime,
                 isMoving: false
             }
         };
    }
    return null;
};

export const SorcererBehavior: BehaviorStrategy = {
    update: (char: Character, context: AIContext): { character: Character, soundEvent?: string, spawnRequest?: SpawnRequest } => {
        const charPos = new THREE.Vector3(...char.position);
        const dist = charPos.distanceTo(context.playerPos);

        // 1. Try Summoning
        const summonRes = handleSummoning(dist, char, charPos, context.playerPos);
        if (summonRes && summonRes.updatedChar) {
            return { character: summonRes.updatedChar, soundEvent: summonRes.soundEvent, spawnRequest: summonRes.spawnRequest };
        }

        // 2. Try Attacking
        const attackRes = handleAttack(dist, char, context, charPos);
        if (attackRes && attackRes.updatedChar) {
             return { character: attackRes.updatedChar, soundEvent: attackRes.soundEvent };
        }

        // 3. Fallback to Passive Wander
        const updatedChar = PassiveBehavior.update(char, context).character;
        // Preserve lastAttackTime just in case
        return { character: { ...updatedChar, lastAttackTime: char.lastAttackTime }, soundEvent: undefined };
    }
};
