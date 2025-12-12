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
      health: 20,
      maxHealth: 20,
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
      // With low probability wander, run many times
      let movedCount = 0;
      for (let i = 0; i < 1000; i++) {
        const result = updateFriendlyCharacter(baseChar, playerPos);
        if (result.isMoving) movedCount++;
      }
      
      // Should move occasionally (0.5% chance)
      expect(movedCount).toBeGreaterThan(0);
      expect(movedCount).toBeLessThan(100); // But not too often
    });

    it('should occasionally change rotation when idle', () => {
      let rotationChanged = false;
      for (let i = 0; i < 1000; i++) {
        const result = updateFriendlyCharacter(baseChar, playerPos);
        if (result.rotation !== 0) {
          rotationChanged = true;
          break;
        }
      }
      
      expect(rotationChanged).toBe(true);
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
      expect(result.health).toBe(baseChar.health);
    });
  });
});
