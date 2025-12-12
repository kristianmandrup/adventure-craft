import * as THREE from 'three';
import { Block, Character, Projectile } from '../../types';
import { AIContext } from './behaviors/BaseBehavior';
import { ZombieBehavior } from './behaviors/ZombieBehavior';
import { SorcererBehavior } from './behaviors/SorcererBehavior';
import { PassiveBehavior } from './behaviors/PassiveBehavior';

export const updateEnemyCharacter = (
    char: Character,
    playerPos: THREE.Vector3,
    blockMap: Map<string, Block>,
    setProjectiles: React.Dispatch<React.SetStateAction<Projectile[]>>
): { character: Character, soundEvent?: string, spawnRequest?: any } => {
    
    const context: AIContext = {
        playerPos,
        blockMap,
        setProjectiles,
        now: Date.now()
    };

    const type = char.name.toLowerCase();
    
    if (type.includes('sorcerer')) {
        return SorcererBehavior.update(char, context);
    } else if (type.includes('zombie') || type.includes('skeleton') || type.includes('spider') || type.includes('giant')) {
        return ZombieBehavior.update(char, context);
    }

    // Default Fallback
    return PassiveBehavior.update(char, context);
};