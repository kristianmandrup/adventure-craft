import * as THREE from 'three';
import { Block, Character } from '../../types';

export const updateAquaticCharacter = (
    char: Character, 
    blockMap: Map<string, Block>
): Character => {
    const charPos = new THREE.Vector3(...char.position);
    let isMoving = false;
    let wanderTarget = char.wanderTarget;

    // Swim Logic
    if (!wanderTarget || charPos.distanceTo(wanderTarget) < 0.5) {
        // Pick random neighbor block that is water
        const candidates: THREE.Vector3[] = [];
        for(let x=-1; x<=1; x++) {
            for(let y=-1; y<=1; y++) {
                for(let z=-1; z<=1; z++) {
                    if(x===0 && y===0 && z===0) continue;
                    const target = new THREE.Vector3(Math.round(charPos.x + x), Math.round(charPos.y + y), Math.round(charPos.z + z));
                    const key = `${target.x},${target.y},${target.z}`;
                    const b = blockMap.get(key);
                    if (b && b.type === 'water') {
                        candidates.push(target);
                    }
                }
            }
        }
        if (candidates.length > 0) {
            wanderTarget = candidates[Math.floor(Math.random() * candidates.length)];
        } else {
            // Stuck? Stay put.
            wanderTarget = charPos.clone();
        }
    } else {
        isMoving = true;
        const dir = wanderTarget.clone().sub(charPos).normalize();
        const speed = 0.05;
        const newPos = new THREE.Vector3(
            charPos.x + dir.x * speed,
            charPos.y + dir.y * speed,
            charPos.z + dir.z * speed
        );
        
        return {
            ...char,
            position: [newPos.x, newPos.y, newPos.z],
            rotation: Math.atan2(dir.x, dir.z),
            isMoving,
            wanderTarget
        };
    }

    return { ...char, isMoving, wanderTarget };
};