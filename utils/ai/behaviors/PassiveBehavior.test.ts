import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PassiveBehavior } from './PassiveBehavior';
import * as THREE from 'three';
import { Character } from '../../../types';
import { AIContext } from './BaseBehavior';

describe('PassiveBehavior', () => {
    const createMockCharacter = (overrides: Partial<Character> = {}): Character => ({
        id: 'test-char',
        name: 'Sheep',
        playerPos: [5, 0, 5],
        rotation: 0,
        parts: [],
        maxHp: 10,
        hp: 10,
        isEnemy: false,
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
            
            const result = PassiveBehavior.update(char, context);
            
            expect(result.character).toBeDefined();
        });

        it('should set wander target if none exists', () => {
            const char = createMockCharacter({ wanderTarget: undefined });
            const context = createMockContext();
            
            const result = PassiveBehavior.update(char, context);
            
            expect(result.character.wanderTarget).toBeDefined();
        });

        it('should mark character as moving when wandering', () => {
            const char = createMockCharacter({ 
                wanderTarget: new THREE.Vector3(10, 0, 10),
                playerPos: [0, 0, 0]
            });
            const context = createMockContext();
            
            const result = PassiveBehavior.update(char, context);
            
            expect(result.character.isMoving).toBe(true);
        });

        it('should update character position when moving', () => {
            const char = createMockCharacter({ 
                wanderTarget: new THREE.Vector3(10, 0, 10),
                playerPos: [0, 0, 0]
            });
            const context = createMockContext();
            
            const result = PassiveBehavior.update(char, context);
            
            expect(result.character.playerPos).toBeDefined();
        });
    });
});
