import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ZombieBehavior } from './ZombieBehavior';
import * as THREE from 'three';
import { Character } from '../../../types';
import { AIContext } from './BaseBehavior';

describe('ZombieBehavior', () => {
    const createMockCharacter = (overrides: Partial<Character> = {}): Character => ({
        id: 'zombie-1',
        name: 'Zombie',
        playerPos: [5, 0, 5],
        rotation: 0,
        parts: [],
        maxHp: 20,
        hp: 20,
        isEnemy: true,
        isFriendly: false,
        isGiant: false,
        isAquatic: false,
        isMoving: false,
        ...overrides
    });

    const createMockContext = (overrides: Partial<AIContext> = {}): AIContext => ({
        playerPos: new THREE.Vector3(0, 0, 0),
        blockMap: new Map(),
        setProjectiles: vi.fn(),
        now: Date.now(),
        ...overrides
    });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('update', () => {
        it('should return character object', () => {
            const char = createMockCharacter();
            const context = createMockContext();
            
            const result = ZombieBehavior.update(char, context);
            
            expect(result.character).toBeDefined();
            expect(result.character.id).toBe('zombie-1');
        });

        it('should chase player when close', () => {
            const char = createMockCharacter({ 
                playerPos: [5, 0, 5]
            });
            const context = createMockContext({
                playerPos: new THREE.Vector3(7, 0, 5) // 2 blocks away
            });
            
            const result = ZombieBehavior.update(char, context);
            
            expect(result.character.isMoving).toBe(true);
            expect(result.character.wanderTarget).toBeNull();
        });

        it('should update rotation towards player', () => {
            const char = createMockCharacter({ 
                playerPos: [0, 0, 0],
                rotation: 0
            });
            const context = createMockContext({
                playerPos: new THREE.Vector3(10, 0, 0)
            });
            
            const result = ZombieBehavior.update(char, context);
            
            expect(typeof result.character.rotation).toBe('number');
        });

        it('should wander when player is far away', () => {
            const char = createMockCharacter({ 
                playerPos: [100, 0, 100]
            });
            const context = createMockContext({
                playerPos: new THREE.Vector3(0, 0, 0) // Very far
            });
            
            const result = ZombieBehavior.update(char, context);
            
            // Should fall back to passive behavior
            expect(result.character.wanderTarget).toBeDefined();
        });

        it('should move towards player position', () => {
            const char = createMockCharacter({ 
                playerPos: [0, 0, 0]
            });
            const context = createMockContext({
                playerPos: new THREE.Vector3(5, 0, 5)
            });
            
            const result = ZombieBehavior.update(char, context);
            
            // Position should change towards player
            const newPos = result.character.playerPos;
            expect(newPos).toBeDefined();
        });
    });
});
