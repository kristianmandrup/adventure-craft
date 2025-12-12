import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateFriendlyCharacter } from './friendlyBehavior';
import { Character } from '../../types';

describe('friendlyBehavior', () => {
  let baseChar: Character;
  let playerPos: [number, number, number];

  beforeEach(() => {
    playerPos = [0, 0, 0];
    baseChar = {
      id: 'cow-1',
      name: 'Cow',
      playerPos: [10, 0, 10],
      isEnemy: false,
      isMoving: false,
      rotation: 0,
      parts: [],
      hp: 20,
      maxHp: 20,
    } as Character;
  });

  describe('Flee behavior', () => {
    it('should flee when recently damaged', () => {
      const damagedChar: Character = {
        ...baseChar,
        lastDamagedTime: Date.now() - 1000 // 1 second ago
      };
      
      const result = updateFriendlyCharacter(damagedChar, playerPos);
      
      expect(result.isMoving).toBe(true);
      // Should move away from player (increased distance)
      const distBefore = Math.sqrt(10*10 + 10*10);
      const distAfter = Math.sqrt(
        (result.playerPos![0]) ** 2 + 
        (result.playerPos![2]) ** 2
      );
      expect(distAfter).toBeGreaterThan(distBefore);
    });

    it('should stop fleeing after 8 seconds', () => {
      const oldDamageChar: Character = {
        ...baseChar,
        lastDamagedTime: Date.now() - 9000 // 9 seconds ago
      };
      
      // Run multiple times to check it's not always fleeing
      let movedCount = 0;
      for (let i = 0; i < 100; i++) {
        const result = updateFriendlyCharacter(oldDamageChar, playerPos);
        if (result.isMoving) movedCount++;
      }
      
      // Should not be constantly moving (only occasional idle wander)
      expect(movedCount).toBeLessThan(50);
    });

    it('should update rotation when fleeing', () => {
      const damagedChar: Character = {
        ...baseChar,
        rotation: 0,
        lastDamagedTime: Date.now() - 1000
      };
      
      const result = updateFriendlyCharacter(damagedChar, playerPos);
      
      expect(result.rotation).not.toBe(0);
    });
  });

  describe('Idle behavior', () => {
    it('should occasionally wander when idle', () => {
      // Mock random to trigger movement (chance is usually 0.005)
      const randomSpy = vi.spyOn(Math, 'random');
      
      // Force movement: random < 0.005
      randomSpy.mockReturnValue(0.001);
      
      const result = updateFriendlyCharacter(baseChar, playerPos);
      
      expect(result.isMoving).toBe(true);
      
      randomSpy.mockRestore();
    });

    it('should occasionally change rotation when idle', () => {
      const randomSpy = vi.spyOn(Math, 'random');
          
      // Sequence:
      // 1. Rotation check (< 0.01) -> 0.005 (True)
      // 2. Rotation value -> 0.8
      // 3. Movement check -> 0.5 (False)
      randomSpy
        .mockReturnValueOnce(0.005)
        .mockReturnValueOnce(0.8)
        .mockReturnValueOnce(0.5);
      
      const result = updateFriendlyCharacter(baseChar, playerPos);
      
      expect(result.rotation).not.toBe(0);
      expect(result.rotation).toBeCloseTo(0 + (0.8 - 0.5));
      
      randomSpy.mockRestore();
    });
  });

  describe('Return values', () => {
    it('should return updated character with position, rotation, isMoving', () => {
      const result = updateFriendlyCharacter(baseChar, playerPos);
      
      expect(result.playerPos).toBeDefined();
      expect(result.rotation).toBeDefined();
      expect(result.isMoving).toBeDefined();
    });

    it('should preserve character properties', () => {
      const result = updateFriendlyCharacter(baseChar, playerPos);
      
      expect(result.id).toBe(baseChar.id);
      expect(result.name).toBe(baseChar.name);
      expect(result.hp).toBe(baseChar.hp);
    });
  });
});
