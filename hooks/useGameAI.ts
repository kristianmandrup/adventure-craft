import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Block, Character, Projectile } from '../types';
import { updateAquaticCharacter } from '../utils/ai/aquaticBehavior';
import { updateEnemyCharacter } from '../utils/ai/enemyBehavior';
import { updateFriendlyCharacter } from '../utils/ai/friendlyBehavior';

interface UseGameAIProps {
  characters: Character[];
  setCharacters: React.Dispatch<React.SetStateAction<Character[]>>;
  projectiles: Projectile[];
  setProjectiles: React.Dispatch<React.SetStateAction<Projectile[]>>;
  position: THREE.Vector3;
  setPlayerHp: React.Dispatch<React.SetStateAction<number>>;
  blockMap: Map<string, Block>;
}

export const useGameAI = ({
  characters, setCharacters, projectiles, setProjectiles, position, setPlayerHp, blockMap
}: UseGameAIProps) => {
  const lastAiUpdate = useRef(0);

  useFrame((state, delta) => {
    // Projectiles Logic
    if (projectiles.length > 0) {
      setProjectiles(prev => {
         const nextProjs: Projectile[] = [];
         prev.forEach(p => {
            const nextPos = p.position.clone().add(p.velocity.clone().multiplyScalar(delta));
            if (nextPos.y < -5 || p.position.distanceTo(position) > 100) return;
            
            if (nextPos.distanceTo(position) < 1.0) {
              setPlayerHp(h => Math.max(0, h - p.damage));
              return;
            }
            nextProjs.push({ ...p, position: nextPos });
         });
         return nextProjs;
      });
    }

    // AI Character Update Logic
    const now = Date.now();
    if (now - lastAiUpdate.current > 50) {
      lastAiUpdate.current = now;
      
      setCharacters(prev => prev.map(char => {
         if (char.isAquatic) {
             return updateAquaticCharacter(char, blockMap);
         } else if (char.isEnemy) {
             return updateEnemyCharacter(char, position, blockMap, setProjectiles);
         } else if (char.isFriendly) {
             return updateFriendlyCharacter(char);
         }
         return char;
      }));
    }
  });
};