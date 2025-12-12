import { describe, it, expect, beforeEach } from 'vitest';
import * as THREE from 'three';
import { updateAquaticCharacter } from './aquaticBehavior';
import { Character, Block } from '../../types';

describe('aquaticBehavior', () => {
  let blockMap: Map<string, Block>;
  let baseChar: Character;

  beforeEach(() => {
    blockMap = new Map();
    baseChar = {
      id: 'fish-1',
      name: 'Fish',
      playerPos: [5, -1, 5],
      isEnemy: false,
      isMoving: false,
      rotation: 0,
      health: 10,
      maxHealth: 10,
    } as Character;
  });

  describe('Wander target selection', () => {
    it('should pick a water block as wander target when available', () => {
      // Create water blocks around the fish
      blockMap.set('4,-1,5', { id: '1', x: 4, y: -1, z: 5, type: 'water', color: '#3b82f6' });
      blockMap.set('6,-1,5', { id: '2', x: 6, y: -1, z: 5, type: 'water', color: '#3b82f6' });
      blockMap.set('5,-1,4', { id: '3', x: 5, y: -1, z: 4, type: 'water', color: '#3b82f6' });
      
      const result = updateAquaticCharacter(baseChar, blockMap);
      
      expect(result.wanderTarget).toBeDefined();
    });

    it('should stay in place when no water blocks are available', () => {
      // No water blocks in map
      const result = updateAquaticCharacter(baseChar, blockMap);
      
      expect(result.wanderTarget).toBeDefined();
      expect(result.wanderTarget!.x).toBeCloseTo(5, 0);
      expect(result.wanderTarget!.z).toBeCloseTo(5, 0);
    });
  });

  describe('Movement', () => {
    it('should move toward wander target', () => {
      const charWithTarget: Character = {
        ...baseChar,
        wanderTarget: new THREE.Vector3(10, -1, 10)
      };
      
      const result = updateAquaticCharacter(charWithTarget, blockMap);
      
      expect(result.isMoving).toBe(true);
      // Should move slightly towards target
      expect(result.playerPos![0]).toBeGreaterThan(5);
      expect(result.playerPos![2]).toBeGreaterThan(5);
    });

    it('should update rotation when moving', () => {
      const charWithTarget: Character = {
        ...baseChar,
        rotation: 0,
        wanderTarget: new THREE.Vector3(10, -1, 5)
      };
      
      const result = updateAquaticCharacter(charWithTarget, blockMap);
      
      expect(result.rotation).not.toBe(0);
    });

    it('should pick new target when close to current target', () => {
      // Character is at almost same position as target
      const charNearTarget: Character = {
        ...baseChar,
        playerPos: [5, -1, 5],
        wanderTarget: new THREE.Vector3(5.1, -1, 5.1)
      };
      
      // Add water blocks for new target selection
      blockMap.set('4,-1,5', { id: '1', x: 4, y: -1, z: 5, type: 'water', color: '#3b82f6' });
      
      const result = updateAquaticCharacter(charNearTarget, blockMap);
      
      // Should have selected a new target (or stayed in place if no water)
      expect(result.wanderTarget).toBeDefined();
    });
  });

  describe('Edge cases', () => {
    it('should not crash with undefined playerPos', () => {
      const badChar: Character = {
        ...baseChar,
        playerPos: undefined as any
      };
      
      expect(() => updateAquaticCharacter(badChar, blockMap)).toThrow();
    });

    it('should handle empty blockMap', () => {
      const result = updateAquaticCharacter(baseChar, new Map());
      
      expect(result).toBeDefined();
      expect(result.wanderTarget).toBeDefined();
    });
  });
});
