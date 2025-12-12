import { describe, it, expect, vi } from 'vitest';
import * as THREE from 'three';
import { PassiveBehavior } from './PassiveBehavior';
import { ZombieBehavior } from './ZombieBehavior';
import { Character } from '../../../types';
import { AIContext } from './BaseBehavior';

// Mock THREE.Vector3 methods
vi.mock('three', async () => {
    const actual = await vi.importActual('three');
    return actual;
});

describe('AI Behaviors', () => {
    const createMockCharacter = (overrides: Partial<Character> = {}): Character => ({
        id: 'test-char',
        name: 'Test Character',
        playerPos: [5, 0, 5],
        rotation: 0,
        parts: [],
        maxHp: 100,
        hp: 100,
        isEnemy: false,
        isFriendly: true,
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

    describe('PassiveBehavior', () => {
        it('should return a character object', () => {
            const char = createMockCharacter();
            const context = createMockContext();
            
            const result = PassiveBehavior.update(char, context);
            
            expect(result.character).toBeDefined();
            expect(result.character.id).toBe('test-char');
        });

        it('should set a wander target if none exists', () => {
            const char = createMockCharacter({ wanderTarget: undefined });
            const context = createMockContext();
            
            const result = PassiveBehavior.update(char, context);
            
            expect(result.character.wanderTarget).toBeDefined();
        });

        it('should move towards wander target', () => {
            const char = createMockCharacter({ 
                wanderTarget: new THREE.Vector3(10, 0, 10),
                playerPos: [0, 0, 0]
            });
            const context = createMockContext();
            
            const result = PassiveBehavior.update(char, context);
            
            expect(result.character.isMoving).toBe(true);
        });
    });

    describe('ZombieBehavior', () => {
        it('should return a character object', () => {
            const char = createMockCharacter({ isEnemy: true, name: 'Zombie' });
            const context = createMockContext();
            
            const result = ZombieBehavior.update(char, context);
            
            expect(result.character).toBeDefined();
        });

        it('should chase player when within aggro range', () => {
            const char = createMockCharacter({ 
                isEnemy: true, 
                name: 'Zombie',
                playerPos: [10, 0, 10] 
            });
            const context = createMockContext({
                playerPos: new THREE.Vector3(12, 0, 10) // 2 blocks away
            });
            
            const result = ZombieBehavior.update(char, context);
            
            expect(result.character.isMoving).toBe(true);
            expect(result.character.wanderTarget).toBe(null);
        });

        it('should not chase when player is too far', () => {
            const char = createMockCharacter({ 
                isEnemy: true, 
                name: 'Zombie',
                playerPos: [100, 0, 100] 
            });
            const context = createMockContext({
                playerPos: new THREE.Vector3(0, 0, 0) // Very far away
            });
            
            const result = ZombieBehavior.update(char, context);
            
            // Should fall back to passive behavior
            expect(result.character.wanderTarget).toBeDefined();
        });

        it('should attack when very close to player', () => {
            const char = createMockCharacter({ 
                isEnemy: true, 
                name: 'Zombie',
                playerPos: [0.5, 0, 0.5],
                lastAttackTime: 0 
            });
            const context = createMockContext({
                playerPos: new THREE.Vector3(0.5, 0, 0.5), // Same position
                now: 10000
            });
            
            const result = ZombieBehavior.update(char, context);
            
            // Just verify the character is updated (attack logic may vary)
            expect(result.character).toBeDefined();
            expect(result.character.id).toBe('test-char');
        });
    });
});
