import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as THREE from 'three';
import { SorcererBehavior } from './SorcererBehavior';
import { Character, Projectile } from '../../../types';
import { AIContext } from './BaseBehavior';

describe('SorcererBehavior', () => {
  let mockContext: AIContext;
  let baseChar: Character;
  let setProjectilesMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    setProjectilesMock = vi.fn();
    mockContext = {
      playerPos: new THREE.Vector3(0, 0, 0),
      blockMap: new Map(),
      now: Date.now(),
      setProjectiles: setProjectilesMock,
    };
    
    baseChar = {
      id: 'sorcerer-1',
      name: 'Sorcerer',
      playerPos: [20, 5, 20],
      isEnemy: true,
      isMoving: false,
      rotation: 0,
      health: 100,
      maxHealth: 100,
      hasSummoned: false,
      lastAttackTime: 0,
    } as Character;
  });

  describe('Summoning behavior', () => {
    it('should summon zombies when player gets close and has not summoned yet', () => {
      const nearChar: Character = { ...baseChar, playerPos: [10, 0, 0] };
      mockContext.playerPos = new THREE.Vector3(0, 0, 0);
      
      const result = SorcererBehavior.update(nearChar, mockContext);
      
      expect(result.character.hasSummoned).toBe(true);
      expect(result.soundEvent).toBe('SUMMON');
      expect(result.spawnRequest).toBeDefined();
      expect(result.spawnRequest?.type).toBe('ZOMBIE');
      expect(result.spawnRequest?.count).toBeGreaterThanOrEqual(1);
      expect(result.spawnRequest?.count).toBeLessThanOrEqual(3);
    });

    it('should not summon again if already summoned', () => {
      const summonedChar: Character = { ...baseChar, playerPos: [10, 0, 0], hasSummoned: true };
      mockContext.playerPos = new THREE.Vector3(0, 0, 0);
      
      const result = SorcererBehavior.update(summonedChar, mockContext);
      
      expect(result.spawnRequest).toBeUndefined();
    });

    it('should not summon if player is far away', () => {
      const farChar: Character = { ...baseChar, playerPos: [50, 0, 50] };
      mockContext.playerPos = new THREE.Vector3(0, 0, 0);
      
      const result = SorcererBehavior.update(farChar, mockContext);
      
      expect(result.spawnRequest).toBeUndefined();
      expect(result.character.hasSummoned).toBeFalsy();
    });
  });

  describe('Attack behavior', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });
    
    afterEach(() => {
      vi.useRealTimers();
    });

    it('should attack player when in range and cooldown expired', () => {
      const nearChar: Character = { 
        ...baseChar, 
        playerPos: [10, 0, 0], 
        hasSummoned: true,
        lastAttackTime: 0 
      };
      mockContext.now = 10000;
      mockContext.playerPos = new THREE.Vector3(0, 0, 0);
      
      const result = SorcererBehavior.update(nearChar, mockContext);
      
      // Advance to run setTimeout(..,.0)
      vi.advanceTimersByTime(1);
      
      expect(result.soundEvent).toBe('SORCERER_SPELL');
      expect(result.character.lastAttackTime).toBe(10000);
      expect(setProjectilesMock).toHaveBeenCalled();
    });

    it('should not attack if cooldown is not expired', () => {
      const nearChar: Character = { 
        ...baseChar, 
        playerPos: [10, 0, 0], 
        hasSummoned: true,
        lastAttackTime: Date.now() - 1000 // Only 1 second ago
      };
      mockContext.now = Date.now();
      mockContext.playerPos = new THREE.Vector3(0, 0, 0);
      
      const result = SorcererBehavior.update(nearChar, mockContext);
      
      expect(result.soundEvent).toBeUndefined();
      expect(setProjectilesMock).not.toHaveBeenCalled();
    });

    it('should track player rotation when in range', () => {
      const nearChar: Character = { 
        ...baseChar, 
        playerPos: [10, 0, 0], 
        hasSummoned: true,
        rotation: 0 
      };
      mockContext.playerPos = new THREE.Vector3(0, 0, 0);
      
      const result = SorcererBehavior.update(nearChar, mockContext);
      
      expect(result.character.rotation).not.toBe(0);
    });
  });

  describe('Passive fallback', () => {
    it('should wander passively when player is far and conditions not met', () => {
      const farChar: Character = { 
        ...baseChar, 
        playerPos: [50, 0, 50], 
        hasSummoned: true 
      };
      mockContext.playerPos = new THREE.Vector3(0, 0, 0);
      
      const result = SorcererBehavior.update(farChar, mockContext);
      
      expect(result.soundEvent).toBeUndefined();
      expect(result.spawnRequest).toBeUndefined();
      expect(result.character).toBeDefined();
    });

    it('should preserve lastAttackTime during passive behavior', () => {
      const farChar: Character = { 
        ...baseChar, 
        playerPos: [50, 0, 50], 
        hasSummoned: true,
        lastAttackTime: 5000
      };
      mockContext.playerPos = new THREE.Vector3(0, 0, 0);
      
      const result = SorcererBehavior.update(farChar, mockContext);
      
      expect(result.character.lastAttackTime).toBe(5000);
    });
  });
});
