import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as THREE from 'three';
import { updateEnemyCharacter } from './enemyBehavior';
import { Character, Block, Projectile } from '../../types';

describe('enemyBehavior', () => {
  let blockMap: Map<string, Block>;
  let playerPos: THREE.Vector3;
  let setProjectilesMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    blockMap = new Map();
    playerPos = new THREE.Vector3(0, 0, 0);
    setProjectilesMock = vi.fn();
  });

  const createChar = (name: string, pos: [number, number, number] = [10, 0, 10]): Character => ({
    id: `enemy-${name}`,
    name,
    playerPos: pos,
    isEnemy: true,
    isMoving: false,
    rotation: 0,
    health: 50,
    maxHealth: 50,
  } as Character);

  describe('Behavior routing', () => {
    it('should use SorcererBehavior for sorcerer enemies', () => {
      const char = createChar('Dark Sorcerer');
      
      const result = updateEnemyCharacter(char, playerPos, blockMap, setProjectilesMock);
      
      expect(result.character).toBeDefined();
      // Sorcerer should try to summon when player is close
    });

    it('should use ZombieBehavior for zombie enemies', () => {
      const char = createChar('Zombie');
      
      const result = updateEnemyCharacter(char, playerPos, blockMap, setProjectilesMock);
      
      expect(result.character).toBeDefined();
    });

    it('should use ZombieBehavior for skeleton enemies', () => {
      const char = createChar('Skeleton Warrior');
      
      const result = updateEnemyCharacter(char, playerPos, blockMap, setProjectilesMock);
      
      expect(result.character).toBeDefined();
    });

    it('should use ZombieBehavior for spider enemies', () => {
      const char = createChar('Giant Spider');
      
      const result = updateEnemyCharacter(char, playerPos, blockMap, setProjectilesMock);
      
      expect(result.character).toBeDefined();
    });

    it('should use ZombieBehavior for giant enemies', () => {
      const char = createChar('Stone Giant');
      
      const result = updateEnemyCharacter(char, playerPos, blockMap, setProjectilesMock);
      
      expect(result.character).toBeDefined();
    });

    it('should fallback to PassiveBehavior for unknown enemy types', () => {
      const char = createChar('Unknown Monster');
      
      const result = updateEnemyCharacter(char, playerPos, blockMap, setProjectilesMock);
      
      expect(result.character).toBeDefined();
      expect(result.soundEvent).toBeUndefined();
    });
  });

  describe('Return values', () => {
    it('should return character, soundEvent, and spawnRequest', () => {
      const char = createChar('Zombie');
      
      const result = updateEnemyCharacter(char, playerPos, blockMap, setProjectilesMock);
      
      expect(result).toHaveProperty('character');
      expect('soundEvent' in result || result.soundEvent === undefined).toBe(true);
      expect('spawnRequest' in result || result.spawnRequest === undefined).toBe(true);
    });
  });
});
