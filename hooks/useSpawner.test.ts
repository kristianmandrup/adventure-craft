import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSpawner } from './useSpawner';

vi.mock('../utils/prefabs/characters', () => ({
    enemyPrefabs: {
        sorcerer: { name: 'Sorcerer', parts: [], maxHp: 50 },
        zombie: { name: 'Zombie', parts: [], maxHp: 20 }
    },
    animalPrefabs: {
        pig: { name: 'Pig', parts: [], maxHp: 10 }
    },
    npcPrefabs: {
        merchant: { name: 'Merchant', parts: [], maxHp: 100 }
    }
}));

vi.mock('uuid', () => ({
    v4: () => 'spawn-uuid'
}));

describe('useSpawner', () => {
    let setCharacters: any;
    let setBlocks: any;
    let setSpawnMarkers: any;
    let targetPosRef: any;
    let playerPosRef: any;

    beforeEach(() => {
        setCharacters = vi.fn();
        setBlocks = vi.fn();
        setSpawnMarkers = vi.fn();
        targetPosRef = { current: [10, 5, 10] };
        playerPosRef = { current: [0, 5, 0] };
        vi.clearAllMocks();
    });

    const blocks: any[] = [
        // Platform at 20, 5, 20
        { x: 20, y: 5, z: 20, type: 'stone' }
    ];

    const defaultProps = {
        blocks,
        targetPosRef,
        playerPosRef,
        setCharacters,
        setBlocks,
        setSpawnMarkers,
        BASE_SIZE: 50,
        expansionLevel: 0,
        EXPANSION_STEP: 10
    };

    it('should spawn character at target position', () => {
        const { result } = renderHook(() => 
            useSpawner(
                blocks, targetPosRef, playerPosRef, 
                setCharacters, setBlocks, setSpawnMarkers, 
                50, 0, 10
            ) 
        );

        act(() => {
            const prefab = { name: 'TestChar', parts: [], maxHp: 100 };
            result.current.spawnPredefinedCharacter(prefab, 1);
        });

        expect(setCharacters).toHaveBeenCalled();
        expect(setSpawnMarkers).toHaveBeenCalled();

        // Check Position (Target [10,5,10] -> Spawn [10, 6, 10])
        const updateFn = setCharacters.mock.lastCall[0];
        const newChars = updateFn([]);
        expect(newChars[0].playerPos).toEqual([10, 6, 10]);
    });

    it('should spawn character at random valid position if requested', () => {
        const { result } = renderHook(() => 
            useSpawner(
                blocks, targetPosRef, playerPosRef, 
                setCharacters, setBlocks, setSpawnMarkers, 
                50, 0, 10
            ) 
        );

        // Mock Random to target specific coordinate logic
        // Rx = origin + (random * range * 2 - range)
        // We want to hit 20, 20. Origin 0. Range 25 (BASE/2).
        // 0 + (R * 50 - 25) = 20 -> R*50 = 45 -> R = 0.9.
        
        const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.96);

        act(() => {
            const prefab = { name: 'RandomChar', parts: [], maxHp: 100 };
            result.current.spawnPredefinedCharacter(prefab, 1, false, false, false, false, true); // useRandomLocation=true
        });

        expect(setCharacters).toHaveBeenCalled();
        
        // Should find the block at 20,5,20 and spawn on top (20,6,20)
        // Wait, Map range logic: (50)/2 = 25.
        // If random returns 0.9: floor(0.9 * 50 - 25) = floor(45 - 25) = 20.
        // It should hit.
        
        const updateFn = setCharacters.mock.lastCall[0];
        const newChars = updateFn([]);
        const pos = newChars[0].playerPos;
        
        expect(pos[0]).toBeCloseTo(20);
        expect(pos[2]).toBeCloseTo(20);
        // Y should be 6 (5+1)
        expect(pos[1]).toBe(6);
    });

    it('should spawn Boss in cave', () => {
        const { result } = renderHook(() => 
            useSpawner(blocks, targetPosRef, playerPosRef, setCharacters, setBlocks, setSpawnMarkers, 50, 0, 10) 
        );

        const caveSpawns = [{ x: 100, y: -10, z: 100, type: 'boss' }];

        act(() => {
            // @ts-ignore
            result.current.spawnCaveContents(caveSpawns);
        });

        expect(setCharacters).toHaveBeenCalled();
        const updateFn = setCharacters.mock.lastCall[0];
        const chars = updateFn([]);
        expect(chars[0].name).toBe('Cave Guardian');
        
        // Should also spawn chest
        expect(setBlocks).toHaveBeenCalled(); 
    });

    it('should spawn Merchant and structure', () => {
        const { result } = renderHook(() => 
            useSpawner(blocks, targetPosRef, playerPosRef, setCharacters, setBlocks, setSpawnMarkers, 50, 0, 10) 
        );

        const caveSpawns = [{ x: 50, y: 0, z: 50, type: 'merchant' }];

        act(() => {
            // @ts-ignore
            result.current.spawnCaveContents(caveSpawns);
        });

        expect(setCharacters).toHaveBeenCalled();
        const charUpdate = setCharacters.mock.lastCall[0];
        const chars = charUpdate([]);
        expect(chars[0].name).toBe('Merchant');

        expect(setBlocks).toHaveBeenCalled(); // Shop blocks
    });
});
