import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Block, Character, Projectile, InventoryItem } from '../types';
import { updateAquaticCharacter } from '../utils/ai/aquaticBehavior';
import { updateEnemyCharacter } from '../utils/ai/enemyBehavior';
import { updateFriendlyCharacter } from '../utils/ai/friendlyBehavior';

interface UseGameAIProps {
  characters: Character[];
  setCharacters: React.Dispatch<React.SetStateAction<Character[]>>;
  projectiles: Projectile[];
  setProjectiles: React.Dispatch<React.SetStateAction<Projectile[]>>;
  playerPosRef: React.MutableRefObject<THREE.Vector3>;
  setPlayerHp: React.Dispatch<React.SetStateAction<number>>;
  blockMap: Map<string, Block>;
  inventory?: InventoryItem[];
  playerStats?: { attackMultiplier: number; speedMultiplier: number; defenseReduction: number };
  isLocked: React.MutableRefObject<boolean>;
  onDebugUpdate?: (info: any) => void;
  setPlayerHunger?: React.Dispatch<React.SetStateAction<number>>; // Add missing prop definition
}

export const useGameAI = ({
  characters, setCharacters, projectiles, setProjectiles, playerPosRef, setPlayerHp, blockMap,
  inventory = [], playerStats = { attackMultiplier: 1, speedMultiplier: 1, defenseReduction: 0 },
  isLocked, onDebugUpdate, setPlayerHunger
}: UseGameAIProps) => {
  const lastAiUpdate = useRef(0);

  useFrame((state, delta) => {
    // Projectiles Logic
    if (projectiles.length > 0) {
      setProjectiles(prev => {
         const nextProjs: Projectile[] = [];
         prev.forEach(p => {
            const nextPos = p.position.clone().add(p.velocity.clone().multiplyScalar(delta));
            if (nextPos.y < -5 || p.position.distanceTo(playerPosRef.current) > 100) return;
            
            if (nextPos.distanceTo(playerPosRef.current) < 1.0) {
              // Apply defense reduction from level + shield (shield doubles protection)
              const hasShield = inventory.some(i => i.type === 'shield');
              const shieldBonus = hasShield ? playerStats.defenseReduction : 0;
              const totalDefense = playerStats.defenseReduction + shieldBonus;
              const finalDamage = Math.floor(p.damage * (1 - totalDefense));
              setPlayerHp(h => Math.max(0, h - finalDamage));
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
             return updateEnemyCharacter(char, playerPosRef.current, blockMap, setProjectiles);
         } else if (char.isFriendly) {
             return updateFriendlyCharacter(char);
         }
         return char;
      }));
    }
  });
};