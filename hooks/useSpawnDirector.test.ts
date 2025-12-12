import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useSpawnDirector } from './useSpawnDirector';

describe('useSpawnDirector', () => {
    let getEntityCounts: any;
    let spawnPredefinedCharacter: any;
    let characters: any[];

    beforeEach(() => {
        vi.useFakeTimers();
        getEntityCounts = vi.fn().mockReturnValue({ enemies: 0, animals: 0 });
        spawnPredefinedCharacter = vi.fn();
        characters = [];
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    const getDefaultProps = () => ({
        gameMode: 'ADVENTURE' as const,
        gameStarted: true,
        isDay: true,
        isRaining: false,
        playerLevel: 1,
        getEntityCounts,
        spawnPredefinedCharacter,
        characters: [],
        difficultyMode: 'NORMAL' as import('../types').GameMode
    });

    it('should not spawn if game not started', () => {
        renderHook(() => useSpawnDirector({ ...getDefaultProps(), gameStarted: false }));
        act(() => {
            vi.advanceTimersByTime(10000);
        });
        expect(spawnPredefinedCharacter).not.toHaveBeenCalled();
    });

    it('should spawn zombie if below cap and luck favors', () => {
        // Mock random < chance (0.3 + 0.05 = 0.35)
        vi.spyOn(Math, 'random').mockReturnValue(0.1); 

        renderHook(() => useSpawnDirector(getDefaultProps()));

        act(() => {
            vi.advanceTimersByTime(5000);
        });

        expect(spawnPredefinedCharacter).toHaveBeenCalled();
        // Check first call prefab name
        const callArgs = spawnPredefinedCharacter.mock.calls[0];
        expect(callArgs[0].name).toContain('Zombie');
    });

    it('should NOT spawn zombie if cap reached', () => {
        const fullZombies = Array(10).fill({ name: 'Zombie' });
        
        renderHook(() => useSpawnDirector({ ...getDefaultProps(), characters: fullZombies }));

        act(() => {
            vi.advanceTimersByTime(5000);
        });

        // Might spawn other things, but should check zombie logic logic
        // We can inspect calls to ensure no Zombies spawned
        // But internal logic checks `zombies < MAX_ZOMBIES`.
        // If random favors, it would call spawn.
        // If we force random to satisfy zombie check but fail others? 
        // Zombie check is first.
        
        vi.spyOn(Math, 'random').mockReturnValue(0.01);
        
        // It skips zombie.
        // Falls through to Skeleton? (Level 1 req).
        // Then Spider.
        // Then Animals.
        // It might spawn animals.
        
        // Assert that Zombie was NOT spawned
        const calls = spawnPredefinedCharacter.mock.calls;
        const spawnedZombies = calls.filter((c: any) => c[0].name.includes('Zombie'));
        expect(spawnedZombies.length).toBe(0);
    });

    it('should respect Dark Underworld limit for Giants and Sorcerers', () => {
        // Normal Mode: Max 1
        // Underworld: Max 2
        
        // Test Underworld limit 2
        const oneGiant = [{ name: 'Giant' }];
        
        vi.spyOn(Math, 'random').mockReturnValue(0.01); // Force spawn (luck)

        renderHook(() => useSpawnDirector({ 
            ...getDefaultProps(), 
            difficultyMode: 'DARK_UNDERWORLD', 
            characters: oneGiant as any,
            playerLevel: 10 // Req level 5
        }));

        act(() => {
            vi.advanceTimersByTime(5000);
        });

        // Should spawn another giant (1 < 2)
        const calls = spawnPredefinedCharacter.mock.calls;
        const giantCall = calls.find((c: any) => c[0].name.includes('Giant'));
        expect(giantCall).toBeDefined();
    });

    it('should restrict pig spawning in Dark Underworld if limit reached', () => {
        // Limit 3 pigs.
        const pigs = [ 
            { name: 'wild pig 1' }, 
            { name: 'wild pig 2' }, 
            { name: 'wild pig 3' }
        ];
        
        // Mock animal types to ensure Pig is selected if available
        // But logic is: `availableTypes = ...filter`.
        // If we make sure math.random picks pig index? 
        // Logic: `types[Math.floor(...)]`.
        // If pig is removed, pig is never picked.
        
        vi.spyOn(Math, 'random').mockReturnValue(0.1); // Animal spawn chance

        renderHook(() => useSpawnDirector({
            ...getDefaultProps(),
            difficultyMode: 'DARK_UNDERWORLD',
            characters: pigs as any,
            getEntityCounts: () => ({ animals: 3, enemies: 0 }) // animals < 8 cap
        }));
        
        act(() => {
            vi.advanceTimersByTime(5000);
        });
        
        // Should spawn SOMETHING (Animal cap is 8), but NOT a pig.
        const calls = spawnPredefinedCharacter.mock.calls;
        const pigCalls = calls.filter((c: any) => c[0].name.includes('pig'));
        expect(pigCalls.length).toBe(0);
        
        // Should have spawned something else (cow, sheep, etc)
        expect(calls.length).toBeGreaterThan(0);
    });
});
