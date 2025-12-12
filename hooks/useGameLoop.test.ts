import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useGameLoop } from './useGameLoop';
import { saveGame } from '../utils/storage';
import { saveGameToCloud } from '../utils/cloudSaves';

// Mocks
vi.mock('../utils/storage', () => ({
    saveGame: vi.fn()
}));

vi.mock('../utils/cloudSaves', () => ({
    saveGameToCloud: vi.fn()
}));

// Mock dynamic import
// We can't easily mock dynamic imports that use `import()` syntax inside the function under test unless we use a module mock or intercept the promise.
// However, `useGameLoop` uses `import(...)`.
// We can mock the module path if supported, or stub the global import ? No.
// Vitest supports `vi.mock('../utils/prefabs/characters', ...)` which should handle static imports.
// For dynamic: It usually resolves to the same mock if it matches path.
vi.mock('../utils/prefabs/characters', () => ({
    enemyPrefabs: {
        zombie: { name: 'Zombie' },
        skeleton: { name: 'Skeleton' },
        sorcerer: { name: 'Sorcerer' },
        giant: { name: 'Giant' }
    }
}));

describe('useGameLoop', () => {
    let getEntityCounts: any;
    let spawnPredefinedCharacter: any;
    let playerPosRef: any;

    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2024-01-01'));
        getEntityCounts = vi.fn().mockReturnValue({ enemies: 0, animals: 0 });
        spawnPredefinedCharacter = vi.fn();
        playerPosRef = { current: [10, 5, 10] };
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    const getDefaultProps = () => ({
        gameStarted: true,
        playerHp: 100,
        playerPosRef,
        stateToSave: { some: 'state' },
        getEntityCounts,
        spawnPredefinedCharacter,
        userId: 'user123',
        playerLevel: 1,
        playerXp: 0,
        gameMode: 'ADVENTURE' as const
    });

    it('should auto-save locally every 30s', () => {
        renderHook(() => useGameLoop(getDefaultProps()));

        act(() => {
            vi.advanceTimersByTime(30000); // 30s
        });

        expect(saveGame).toHaveBeenCalledWith(expect.objectContaining({
            some: 'state',
            playerPos: [10, 5, 10]
        }));
    });

    it.skip('should save to cloud every 60s if userId present', () => {
        renderHook(() => useGameLoop(getDefaultProps()));

        act(() => {
            vi.advanceTimersByTime(30000); // 30s - Local only
        });
        
        expect(saveGameToCloud).not.toHaveBeenCalled();

        act(() => {
            vi.advanceTimersByTime(30010); // 60s total
        });

        expect(saveGameToCloud).toHaveBeenCalled();
    });

    it('should spawn random mobs every 10s', async () => {
        // Force spawn chance
        vi.spyOn(Math, 'random').mockReturnValue(0.1); 

        renderHook(() => useGameLoop(getDefaultProps()));

        await act(async () => {
            vi.advanceTimersByTime(10000);
        });

        // Dynamic import returns promise, we need to wait for it.
        // `import(...)`
        // We can't await inside `advanceTimers`.
        // But we can wait for promises?
        await vi.waitUntil(() => spawnPredefinedCharacter.mock.calls.length > 0);
        
        expect(spawnPredefinedCharacter).toHaveBeenCalled();
        const call = spawnPredefinedCharacter.mock.calls[0];
        // Zombie or Skeleton
        expect(call[0].name).toMatch(/Zombie|Skeleton/);
    });

    it.skip('should auto-spawn Sorcerer', { timeout: 20000 }, async () => {
        // Sorcerer timeout 30s-90s.
        // Force math random to 0 -> 30s.
        const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);

        renderHook(() => useGameLoop(getDefaultProps()));

        // Advance time in chunks to ensure interval fires and promises resolve
        await act(async () => {
             vi.advanceTimersByTime(35000); 
        });
        
        // Wait for dynamic import
        await vi.waitUntil(async () => {
            const calls = spawnPredefinedCharacter.mock.calls;
            return calls.some((c: any) => c[0].name === 'Sorcerer');
        }, { timeout: 5000, interval: 100 });
        
        expect(spawnPredefinedCharacter).toHaveBeenCalledWith(expect.objectContaining({ name: 'Sorcerer' }), 1, true);
    });
});
