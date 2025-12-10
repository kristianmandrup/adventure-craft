import * as THREE from 'three';
import { Character } from '../../types';

export const updateFriendlyCharacter = (char: Character): Character => {
    let rotation = char.rotation;
    // Friendly idle wander rotation
    if (Math.random() < 0.01) {
        rotation += (Math.random() - 0.5);
    }
    // Could add walking logic here similar to enemy wander but peaceful
    return { ...char, rotation, isMoving: false };
};