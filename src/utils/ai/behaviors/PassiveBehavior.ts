import * as THREE from 'three';
import { Character } from '../../../types';
import { AIContext, BehaviorStrategy, COMMON_AI, SpawnRequest } from './BaseBehavior';

export const PassiveBehavior: BehaviorStrategy = {
    update: (char: Character, context: AIContext): { character: Character, soundEvent?: string, spawnRequest?: SpawnRequest } => {
        const charPos = new THREE.Vector3(...char.playerPos!);
        let wanderTarget = char.wanderTarget;
        let isMoving = false;
        
        if (!wanderTarget || charPos.distanceTo(wanderTarget) < 1) {
            // Pick new random point nearby
            wanderTarget = new THREE.Vector3(
                charPos.x + (Math.random() * 10 - 5),
                charPos.y,
                charPos.z + (Math.random() * 10 - 5)
            );
        } else {
            isMoving = true;
            const dir = wanderTarget.clone().sub(charPos).normalize();
            dir.y = 0;
            const speed = 0.05; // Slow wander
            let newPos = charPos.clone().add(dir.multiplyScalar(speed));
            
            newPos = COMMON_AI.applyGravity(newPos, context.blockMap);
            
            return {
                character: {
                    ...char,
                    playerPos: [newPos.x, newPos.y, newPos.z],
                    rotation: Math.atan2(dir.x, dir.z),
                    isMoving: true,
                    wanderTarget
                }
            };
        }
        
        return { character: { ...char, isMoving, wanderTarget } };
    }
};
