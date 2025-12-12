import { describe, it, expect, beforeEach, vi } from 'vitest';
import { saveGame, loadGame, clearSave, saveScore, getLeaderboard, isHighScore } from './storage';
import { GameSaveState } from '../types';

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

describe('storage', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    describe('saveGame / loadGame', () => {
        it('should save and load game state', () => {
            const gameState = createMockGameState({
                playerHp: 80,
                playerHunger: 60,
                inventory: [{ type: 'wood', count: 5, color: '#8B4513' }],
                playerPos: [10, 5, 10],
                gameMode: 'ADVENTURE',
            });

            saveGame(gameState);
            const loaded = loadGame();

            expect(loaded).not.toBeNull();
            expect(loaded?.playerHp).toBe(80);
            expect(loaded?.playerHunger).toBe(60);
            expect(loaded?.inventory).toHaveLength(1);
            expect(loaded?.timestamp).toBeDefined();
        });

        it('should return null if no save exists', () => {
            const loaded = loadGame();
            expect(loaded).toBeNull();
        });
    });

    describe('clearSave', () => {
        it('should clear saved game', () => {
            saveGame(createMockGameState());

            clearSave();
            const loaded = loadGame();

            expect(loaded).toBeNull();
        });
    });

    describe('leaderboard', () => {
        it('should save and retrieve scores', () => {
            saveScore('Alice', 1000);
            saveScore('Bob', 500);

            const leaderboard = getLeaderboard();

            expect(leaderboard).toHaveLength(2);
            expect(leaderboard[0].name).toBe('Alice');
            expect(leaderboard[0].score).toBe(1000);
        });

        it('should keep only top 5 scores', () => {
            for (let i = 0; i < 7; i++) {
                saveScore(`Player${i}`, i * 100);
            }

            const leaderboard = getLeaderboard();

            expect(leaderboard).toHaveLength(5);
            expect(leaderboard[0].score).toBe(600); // Highest
            expect(leaderboard[4].score).toBe(200); // 5th highest
        });

        it('should sort scores descending', () => {
            saveScore('Low', 100);
            saveScore('High', 500);
            saveScore('Mid', 300);

            const leaderboard = getLeaderboard();

            expect(leaderboard[0].score).toBe(500);
            expect(leaderboard[1].score).toBe(300);
            expect(leaderboard[2].score).toBe(100);
        });
    });

    describe('isHighScore', () => {
        it('should return true if less than 5 entries', () => {
            saveScore('Player1', 1000);

            expect(isHighScore(50)).toBe(true);
        });

        it('should return true if score beats lowest', () => {
            for (let i = 0; i < 5; i++) {
                saveScore(`Player${i}`, (i + 1) * 100);
            }

            expect(isHighScore(150)).toBe(true);
        });

        it('should return false if score does not beat lowest', () => {
            for (let i = 0; i < 5; i++) {
                saveScore(`Player${i}`, (i + 1) * 100);
            }

            expect(isHighScore(50)).toBe(false);
        });
    });
});
