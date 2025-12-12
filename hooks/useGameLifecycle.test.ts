import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useGameLifecycle } from './useGameLifecycle';
import { clearSave, loadGame } from '../utils/storage';
import { getMostRecentSave } from '../utils/cloudSaves';
import { audioManager } from '../utils/audio';

// Mocks
vi.mock('../utils/storage', () => ({
    clearSave: vi.fn(),
    loadGame: vi.fn()
}));

vi.mock('../utils/cloudSaves', () => ({
    getMostRecentSave: vi.fn()
}));

vi.mock('../utils/audio', () => ({
    audioManager: {
        init: vi.fn()
    }
}));

vi.mock('../utils/procedural', () => ({
    generateInitialTerrain: vi.fn().mockReturnValue({ blocks: [], caveSpawns: [] }),
    // Static mock for dynamic import resolution if needed, 
    // but code uses `import('../utils/procedural')`.
    // Vitest mocks usually handle this if we mock the module.
    generateUnderworldTerrain: vi.fn().mockReturnValue({ blocks: [], caveSpawns: [] })
}));

// Mock dynamic imports for prefabs
vi.mock('../utils/prefabs/characters', () => ({
    animalPrefabs: { pig: {}, sheep: {}, cow: {} },
    enemyPrefabs: { zombie: {}, skeleton: {}, sorcerer: {}, giant: {} }
}));

vi.mock('../utils/prefabs/structures', () => ({
    structurePrefabs: { house: { blocks: [] }, tower: { blocks: [] } }
}));

describe('useGameLifecycle', () => {
    let setBlocks: any, setCharacters: any, setProjectiles: any, setDroppedItems: any, setInventory: any;
    let setPlayerHp: any, setPlayerHunger: any, setGameMode: any, setGameStarted: any, setEquipment: any;
    let setDifficultyMode: any, setIsUnderworld: any, onXpGain: any;
    let spawnPredefinedCharacter: any, spawnCaveContents: any, generateRandomQuest: any;
    let playerPosRef: any;

    beforeEach(() => {
        setBlocks = vi.fn(); setCharacters = vi.fn(); setProjectiles = vi.fn(); setDroppedItems = vi.fn(); setInventory = vi.fn();
        setPlayerHp = vi.fn(); setPlayerHunger = vi.fn(); setGameMode = vi.fn(); setGameStarted = vi.fn(); setEquipment = vi.fn();
        setDifficultyMode = vi.fn(); setIsUnderworld = vi.fn(); onXpGain = vi.fn();
        spawnPredefinedCharacter = vi.fn(); spawnCaveContents = vi.fn(); generateRandomQuest = vi.fn();
        playerPosRef = { current: [0, 0, 0] };
        vi.clearAllMocks();
    });

    const getDefaultProps = () => ({
        setBlocks, setCharacters, setProjectiles, setDroppedItems, setInventory,
        setPlayerHp, setPlayerHunger, setGameMode, setGameStarted, setEquipment,
        playerPosRef, spawnCaveContents, spawnPredefinedCharacter, generateRandomQuest,
        userId: 'user1',
        setDifficultyMode, setIsUnderworld, onXpGain
    });

    it('should initialize new game correctly', async () => {
        const { result } = renderHook(() => useGameLifecycle(getDefaultProps()));

        await act(async () => {
             result.current.handleNewGame('ADVENTURE', 'NORMAL');
        });

        expect(clearSave).toHaveBeenCalled();
        expect(setDifficultyMode).toHaveBeenCalledWith('NORMAL');
        expect(setIsUnderworld).toHaveBeenCalledWith(false);
        expect(setPlayerHp).toHaveBeenCalledWith(100);
        expect(setGameStarted).toHaveBeenCalledWith(true);
        expect(audioManager.init).toHaveBeenCalled();
        
        // Check dynamic imports resolved
        await vi.waitUntil(() => spawnPredefinedCharacter.mock.calls.length > 0);
        expect(spawnPredefinedCharacter).toHaveBeenCalled();
    });

    it('should initialize Dark Underworld game correctly', async () => {
        const { result } = renderHook(() => useGameLifecycle(getDefaultProps()));

        await act(async () => {
             result.current.handleNewGame('ADVENTURE', 'DARK_UNDERWORLD');
        });

        expect(setDifficultyMode).toHaveBeenCalledWith('DARK_UNDERWORLD');
        expect(setIsUnderworld).toHaveBeenCalledWith(true);
        expect(onXpGain).toHaveBeenCalledWith(5000); // Level 10 XP
        
        // Should wait for procedural generation import
        // The mock above handles static import, but code uses dynamic `import('../utils/procedural')`.
        // Vitest might need help mapping the dynamic import to the mocked module instance.
        // Assuming test environment resolves it correctly.
    });

    it('should load save on continue', async () => {
        const mockSave = { 
            playerHp: 80, 
            playerHunger: 90, 
            inventory: [], 
            blocks: [], 
            characters: [], 
            gameMode: 'ADVENTURE' 
        };
        (loadGame as any).mockReturnValue(mockSave);
        (getMostRecentSave as any).mockResolvedValue({ save: mockSave, source: 'cloud' });

        const { result } = renderHook(() => useGameLifecycle(getDefaultProps()));

        await act(async () => {
            await result.current.handleContinue();
        });

        expect(setPlayerHp).toHaveBeenCalledWith(80);
        expect(setGameStarted).toHaveBeenCalledWith(true);
        expect(result.current.saveSource).toBe('cloud');
    });
});
