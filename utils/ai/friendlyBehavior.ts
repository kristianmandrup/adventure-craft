import * as THREE from 'three';
import { Character } from '../../types';

export const updateFriendlyCharacter = (char: Character, playerPos: [number, number, number]): Character => {
    let rotation = char.rotation;
    let position = char.position;
    let isMoving = false;

    // Flee Logic
    const isFleeing = char.lastDamagedTime && (Date.now() - char.lastDamagedTime < 8000); // Flee for 8s
    
    if (isFleeing) {
        // Calculate direction away from player
        const dx = char.position[0] - playerPos[0];
        const dz = char.position[2] - playerPos[2];
        const angle = Math.atan2(dx, dz); // Angle away from player
        
        // Add some jitter
        rotation = angle + (Math.random() - 0.5) * 0.5;
        isMoving = true;
        
        // Move forward in that direction
        const speed = 0.15; // Fast run
        const nx = position[0] + Math.sin(rotation) * speed;
        const nz = position[2] + Math.cos(rotation) * speed;
        
        position = [nx, position[1], nz];
    } else {
        // Friendly idle wander rotation
        if (Math.random() < 0.01) {
            rotation += (Math.random() - 0.5);
        }
        // Occasional small walk
        if (Math.random() < 0.005) {
            isMoving = true;
            const speed = 0.05;
            const nx = position[0] + Math.sin(rotation) * speed;
            const nz = position[2] + Math.cos(rotation) * speed;
            position = [nx, position[1], nz];
        } else {
            isMoving = false;
        }
    }

    return { ...char, rotation, position, isMoving };
};