import { Block, Character, InventoryItem, Projectile, DroppedItem, Quest, GameSaveState } from '../types';

// Removed local GameSaveState interface

export interface ScoreEntry {
    name: string;
    score: number;
    date: number;
}

const SAVE_KEY = 'adventure-craft-save';
const LEADERBOARD_KEY = 'adventure-craft-leaderboard';

export const saveGame = (state: Omit<GameSaveState, 'timestamp'>) => {
    try {
        const data: GameSaveState = {
            ...state,
            timestamp: Date.now()
        };
        localStorage.setItem(SAVE_KEY, JSON.stringify(data));
        console.log('Game saved successfully');
    } catch (e) {
        console.error('Failed to save game', e);
    }
};

export const loadGame = (): GameSaveState | null => {
    try {
        const data = localStorage.getItem(SAVE_KEY);
        if (!data) return null;
        return JSON.parse(data);
    } catch (e) {
        console.error('Failed to load game', e);
        return null;
    }
};

export const clearSave = () => {
    localStorage.removeItem(SAVE_KEY);
};

export const saveScore = (name: string, score: number) => {
    try {
        const currentScores = getLeaderboard();
        currentScores.push({ name, score, date: Date.now() });
        // Sort descending
        currentScores.sort((a, b) => b.score - a.score);
        // Keep top 5
        const top5 = currentScores.slice(0, 5);
        localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(top5));
    } catch (e) {
        console.error('Failed to save score', e);
    }
};

export const getLeaderboard = (): ScoreEntry[] => {
    try {
        const data = localStorage.getItem(LEADERBOARD_KEY);
        if (!data) return [];
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
};

export const isHighScore = (score: number): boolean => {
    const scores = getLeaderboard();
    if (scores.length < 5) return true;
    return score > scores[scores.length - 1].score;
};
