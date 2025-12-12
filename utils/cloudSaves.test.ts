import { describe, it, expect, vi, beforeEach } from 'vitest';
import { saveGameToCloud, loadGameFromCloud, getCloudSaveInfo, getMostRecentSave } from './cloudSaves';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { GameSaveState } from '../types';

// Mock Firestore
vi.mock('firebase/firestore', () => ({
    doc: vi.fn(),
    setDoc: vi.fn(),
    getDoc: vi.fn(),
    serverTimestamp: vi.fn(() => ({ toDate: () => new Date() })),
}));

vi.mock('./firebase', () => ({
    db: {},
}));

// Helper to create a complete game state for tests
const createMockGameState = (overrides: Partial<Omit<GameSaveState, 'timestamp'>> = {}): Omit<GameSaveState, 'timestamp'> => ({
    playerHp: 100,
    playerHunger: 100,
    playerXp: 0,
    playerLevel: 1,
    playerGold: 0,
    inventory: [],
    blocks: [],
    characters: [],
    droppedItems: [],
    playerPos: [0, 5, 0],
    gameMode: 'CREATIVE',
    isDay: true,
    gameStarted: true,
    expansionLevel: 0,
    currentQuest: null,
    questMessage: null,
    equipment: { head: null, chest: null, feet: null, mainHand: null, offHand: null },
    version: 1,
    ...overrides
});

describe('cloudSaves', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('saveGameToCloud', () => {
        it('should save game state to Firestore', async () => {
            vi.mocked(setDoc).mockResolvedValue(undefined);
            vi.mocked(doc).mockReturnValue({} as any);

            const result = await saveGameToCloud(
                'user123',
                createMockGameState({
                    playerHp: 100,
                    playerHunger: 100,
                    gameMode: 'ADVENTURE',
                }),
                5,
                1000,
                'ADVENTURE'
            );

            expect(result).toBe(true);
            expect(setDoc).toHaveBeenCalled();
        });

        it('should return false on error', async () => {
            vi.mocked(setDoc).mockRejectedValue(new Error('Network error'));
            vi.mocked(doc).mockReturnValue({} as any);

            const result = await saveGameToCloud(
                'user123',
                createMockGameState(),
                1,
                0,
                'CREATIVE'
            );

            expect(result).toBe(false);
        });
    });

    describe('loadGameFromCloud', () => {
        it('should load game state from Firestore', async () => {
            const mockGameState = createMockGameState({
                playerHp: 80,
                playerHunger: 50,
                inventory: [{ type: 'wood', count: 10, color: '#8B4513' }],
            });

            vi.mocked(doc).mockReturnValue({} as any);
            vi.mocked(getDoc).mockResolvedValue({
                exists: () => true,
                data: () => ({ gameState: mockGameState }),
            } as any);

            const result = await loadGameFromCloud('user123');

            expect(result).toEqual(mockGameState);
        });

        it('should return null if no save exists', async () => {
            vi.mocked(doc).mockReturnValue({} as any);
            vi.mocked(getDoc).mockResolvedValue({
                exists: () => false,
            } as any);

            const result = await loadGameFromCloud('user123');

            expect(result).toBeNull();
        });
    });

    describe('getCloudSaveInfo', () => {
        it('should return metadata for existing save', async () => {
            vi.mocked(doc).mockReturnValue({} as any);
            vi.mocked(getDoc).mockResolvedValue({
                exists: () => true,
                data: () => ({
                    playerLevel: 10,
                    gameMode: 'ADVENTURE',
                    playerXp: 5000,
                    lastPlayed: { toDate: () => new Date('2024-01-01') },
                }),
            } as any);

            const result = await getCloudSaveInfo('user123');

            expect(result.exists).toBe(true);
            expect(result.playerLevel).toBe(10);
            expect(result.gameMode).toBe('ADVENTURE');
        });

        it('should return exists: false if no save', async () => {
            vi.mocked(doc).mockReturnValue({} as any);
            vi.mocked(getDoc).mockResolvedValue({
                exists: () => false,
            } as any);

            const result = await getCloudSaveInfo('user123');

            expect(result.exists).toBe(false);
        });
    });

    describe('getMostRecentSave', () => {
        it('should return cloud save if more recent', async () => {
            const cloudSave = { ...createMockGameState(), timestamp: 2000 } as GameSaveState;
            const localSave = { ...createMockGameState(), timestamp: 1000 } as GameSaveState;

            vi.mocked(doc).mockReturnValue({} as any);
            vi.mocked(getDoc).mockResolvedValue({
                exists: () => true,
                data: () => ({ gameState: cloudSave }),
            } as any);

            const result = await getMostRecentSave('user123', localSave);

            expect(result.source).toBe('cloud');
            expect(result.save).toEqual(cloudSave);
        });

        it('should return local save if more recent', async () => {
            const cloudSave = { ...createMockGameState(), timestamp: 1000 } as GameSaveState;
            const localSave = { ...createMockGameState(), timestamp: 2000 } as GameSaveState;

            vi.mocked(doc).mockReturnValue({} as any);
            vi.mocked(getDoc).mockResolvedValue({
                exists: () => true,
                data: () => ({ gameState: cloudSave }),
            } as any);

            const result = await getMostRecentSave('user123', localSave);

            expect(result.source).toBe('local');
            expect(result.save).toEqual(localSave);
        });

        it('should return none if no saves exist', async () => {
            vi.mocked(doc).mockReturnValue({} as any);
            vi.mocked(getDoc).mockResolvedValue({
                exists: () => false,
            } as any);

            const result = await getMostRecentSave('user123', null);

            expect(result.source).toBe('none');
            expect(result.save).toBeNull();
        });
    });
});
