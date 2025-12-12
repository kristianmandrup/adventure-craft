import * as THREE from 'three';
import { Block, Character, Projectile } from '../../../types';
import { audioManager } from '../../audio';

export interface AIContext {
    playerPos: THREE.Vector3;
    blockMap: Map<string, Block>;
    setProjectiles: React.Dispatch<React.SetStateAction<Projectile[]>>;
    now: number;
}

export interface SpawnRequest {
    type: 'ZOMBIE';
    count: number;
    position: THREE.Vector3;
}

export interface BehaviorStrategy {
    update: (char: Character, context: AIContext) => { character: Character, soundEvent?: string, spawnRequest?: SpawnRequest };
}

export const COMMON_AI = {
    // Utility for gravity/terrain adjustment
    applyGravity: (pos: THREE.Vector3, blockMap: Map<string, Block>) => {
        const roundedPos = pos.clone().round();
        if (blockMap.has(`${roundedPos.x},${Math.floor(roundedPos.y-1)},${roundedPos.z}`)) {
            // On ground
            return pos;
        } else if (roundedPos.y > 0) {
           pos.y -= 0.2; 
        }
        return pos;
    },
    
    // Check if character should chase
    shouldChase: (charPos: THREE.Vector3, playerPos: THREE.Vector3, range: number) => {
        const dist = charPos.distanceTo(playerPos);
        return dist < range && dist > 1.2;
    }
};
