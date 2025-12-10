import * as THREE from 'three';
import { Block, Character, Projectile } from '../../types';

export const updateEnemyCharacter = (
    char: Character,
    playerPos: THREE.Vector3,
    blockMap: Map<string, Block>,
    setProjectiles: React.Dispatch<React.SetStateAction<Projectile[]>>
): Character => {
    const charPos = new THREE.Vector3(...char.position);
    const dist = charPos.distanceTo(playerPos);
    let isMoving = false;
    let wanderTarget = char.wanderTarget;
    const now = Date.now();

    // Chase Logic
    if (dist < 15 && dist > (char.isGiant ? 3 : 1.2)) {
        isMoving = true;
        const dir = playerPos.clone().sub(charPos).normalize();
        dir.y = 0; 
        const speed = (char.isGiant ? 1.5 : 2.5) * 0.05; 
        const newPos = charPos.add(dir.multiplyScalar(speed));
        
        // Simple gravity/terrain adjust
        const roundedPos = newPos.clone().round();
        if (blockMap.has(`${roundedPos.x},${Math.floor(roundedPos.y-1)},${roundedPos.z}`)) {
            // On ground
        } else if (roundedPos.y > 0) {
           newPos.y -= 0.2; 
        }

        return {
            ...char,
            position: [newPos.x, newPos.y, newPos.z],
            rotation: Math.atan2(playerPos.x - charPos.x, playerPos.z - charPos.z),
            isMoving,
            wanderTarget: null // Reset wander if chasing
        };
    } 
    // Wander Logic
    else if (dist >= 15) {
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
            const speed = 1.0 * 0.05; // Slow wander
            const newPos = charPos.add(dir.multiplyScalar(speed));
            
            const roundedPos = newPos.clone().round();
            if (blockMap.has(`${roundedPos.x},${Math.floor(roundedPos.y-1)},${roundedPos.z}`)) {
               // On ground
            } else if (roundedPos.y > 0) {
               newPos.y -= 0.2; 
            }
            
            return {
                ...char,
                position: [newPos.x, newPos.y, newPos.z],
                rotation: Math.atan2(wanderTarget.x - charPos.x, wanderTarget.z - charPos.z),
                isMoving,
                wanderTarget
            };
        }
    }

    // Sorcerer Attack Logic
    const isSorcerer = char.name.toLowerCase().includes('sorcerer');
    let lastAttackTime = char.lastAttackTime;
    if (isSorcerer && dist < 12) {
        const last = char.lastAttackTime || 0;
        if (now - last > 5000) { 
            lastAttackTime = now;
            const projDir = playerPos.clone().sub(charPos).normalize();
            const newProj: Projectile = {
                id: crypto.randomUUID(),
                position: charPos.clone().add(new THREE.Vector3(0, 1.5, 0)),
                velocity: projDir.multiplyScalar(10), 
                damage: 15,
                ownerId: char.id,
                color: '#a855f7',
                createdAt: now
            };
            // Use setTimeout to avoid state update during render loop if called directly,
            // though useFrame is technically outside React render phase, it's safer.
            setTimeout(() => setProjectiles(p => [...p, newProj]), 0);
        }
    }

    return { ...char, isMoving, wanderTarget, lastAttackTime };
};