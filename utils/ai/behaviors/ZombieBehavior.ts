import * as THREE from 'three';
import { Character } from '../../../types';
import { AIContext, BehaviorStrategy, COMMON_AI, SpawnRequest } from './BaseBehavior';
import { PassiveBehavior } from './PassiveBehavior';

export const ZombieBehavior: BehaviorStrategy = {
    update: (char: Character, context: AIContext): { character: Character, soundEvent?: string, spawnRequest?: SpawnRequest } => {
        const charPos = new THREE.Vector3(...char.playerPos!);
        let soundEvent: string | undefined;
        
        // Check Aggro
        if (COMMON_AI.shouldChase(charPos, context.playerPos, 15)) {
            const dist = charPos.distanceTo(context.playerPos);
            
            // Attack logic (simple proximity)
            if (dist < 2.0) {
                // If very close, assume attacking
                // Throttle attack sound
                const now = context.now;
                const lastAttack = char.lastAttackTime || 0;
                if (now - lastAttack > 1500) {
                     soundEvent = 'ZOMBIE_ATTACK';
                     // We need to update lastAttackTime on character
                     // We can do this implicitly by returning modified char
                }
                
                return {
                    character: {
                        ...char,
                        lastAttackTime: soundEvent ? now : lastAttack,
                        // Stop moving if attacking?
                        isMoving: false,
                        rotation: Math.atan2(context.playerPos.x - charPos.x, context.playerPos.z - charPos.z)
                    },
                    soundEvent
                };
            }

            const dir = context.playerPos.clone().sub(charPos).normalize();
            dir.y = 0; 
            const speed = (char.isGiant ? 1.5 : 2.5) * 0.05; 
            let newPos = charPos.clone().add(dir.multiplyScalar(speed));
            
            newPos = COMMON_AI.applyGravity(newPos, context.blockMap);

            return {
                character: {
                    ...char,
                    playerPos: [newPos.x, newPos.y, newPos.z],
                    rotation: Math.atan2(context.playerPos.x - charPos.x, context.playerPos.z - charPos.z),
                    isMoving: true,
                    wanderTarget: null
                },
                soundEvent
            };
        }

        // Default to passive wander if not chasing
        const res = PassiveBehavior.update(char, context); // Res is { char, sound }
        return res; 
    }
};
