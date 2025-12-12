import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getGlobalLeaderboard, submitScore, isGlobalHighScore } from './cloudLeaderboard';
import { collection, addDoc, query, orderBy, limit, getDocs, serverTimestamp } from 'firebase/firestore';

// Mock Firestore
vi.mock('firebase/firestore', () => ({
    collection: vi.fn(),
    addDoc: vi.fn(),
    query: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
    getDocs: vi.fn(),
    serverTimestamp: vi.fn(),
}));

vi.mock('./firebase', () => ({
    db: {},
}));

describe('cloudLeaderboard', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getGlobalLeaderboard', () => {
        it('should fetch top 10 scores', async () => {
            const mockDocs = [
                { id: '1', data: () => ({ name: 'Player1', score: 1000, date: Date.now() }) },
                { id: '2', data: () => ({ name: 'Player2', score: 800, date: Date.now() }) },
            ];

            vi.mocked(getDocs).mockResolvedValue({ docs: mockDocs } as any);

            const result = await getGlobalLeaderboard(10);

            expect(result).toHaveLength(2);
            expect(result[0].name).toBe('Player1');
            expect(result[0].score).toBe(1000);
        });

        it('should return empty array on error', async () => {
            vi.mocked(getDocs).mockRejectedValue(new Error('Network error'));

            const result = await getGlobalLeaderboard();

            expect(result).toEqual([]);
        });
    });

    describe('submitScore', () => {
        it('should submit score to Firestore', async () => {
            vi.mocked(addDoc).mockResolvedValue({ id: 'new-doc-id' } as any);

            const result = await submitScore('user123', 'TestPlayer', 500);

            expect(result).toBe(true);
            expect(addDoc).toHaveBeenCalled();
        });

        it('should return false on error', async () => {
            vi.mocked(addDoc).mockRejectedValue(new Error('Permission denied'));

            const result = await submitScore('user123', 'TestPlayer', 500);

            expect(result).toBe(false);
        });
    });

    describe('isGlobalHighScore', () => {
        it('should return true if leaderboard has less than 10 entries', async () => {
            const mockDocs = [
                { id: '1', data: () => ({ name: 'Player1', score: 1000 }) },
            ];

            vi.mocked(getDocs).mockResolvedValue({ docs: mockDocs } as any);

            const result = await isGlobalHighScore(100);

            expect(result).toBe(true);
        });

        it('should return true if score beats lowest in top 10', async () => {
            const mockDocs = Array.from({ length: 10 }, (_, i) => ({
                id: `${i}`,
                data: () => ({ name: `Player${i}`, score: 1000 - i * 100 }),
            }));

            vi.mocked(getDocs).mockResolvedValue({ docs: mockDocs } as any);

            // Score of 500 should beat the lowest (100)
            const result = await isGlobalHighScore(500);

            expect(result).toBe(true);
        });

        it('should return false if score does not beat top 10', async () => {
            const mockDocs = Array.from({ length: 10 }, (_, i) => ({
                id: `${i}`,
                data: () => ({ name: `Player${i}`, score: 1000 - i * 10 }),
            }));

            vi.mocked(getDocs).mockResolvedValue({ docs: mockDocs } as any);

            // All scores are 910-1000, so 50 shouldn't qualify
            const result = await isGlobalHighScore(50);

            expect(result).toBe(false);
        });
    });
});
