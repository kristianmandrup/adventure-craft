import { collection, addDoc, query, orderBy, limit, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface LeaderboardEntry {
    id?: string;
    name: string;
    score: number;
    date: number;
    userId?: string;
}

const LEADERBOARD_COLLECTION = 'leaderboard';

/**
 * Fetches the global leaderboard from Firestore
 * @param count Number of top scores to fetch (default 10)
 */
export const getGlobalLeaderboard = async (count: number = 10): Promise<LeaderboardEntry[]> => {
    try {
        const leaderboardRef = collection(db, LEADERBOARD_COLLECTION);
        const q = query(leaderboardRef, orderBy('score', 'desc'), limit(count));
        const snapshot = await getDocs(q);
        
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as LeaderboardEntry[];
    } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
        return [];
    }
};

/**
 * Submits a score to the global leaderboard
 */
export const submitScore = async (
    userId: string,
    name: string,
    score: number
): Promise<boolean> => {
    try {
        const leaderboardRef = collection(db, LEADERBOARD_COLLECTION);
        await addDoc(leaderboardRef, {
            userId,
            name,
            score,
            date: Date.now(),
            createdAt: serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error('Failed to submit score:', error);
        return false;
    }
};

/**
 * Checks if a score qualifies for the global top 10
 */
export const isGlobalHighScore = async (score: number): Promise<boolean> => {
    try {
        const leaderboard = await getGlobalLeaderboard(10);
        if (leaderboard.length < 10) return true;
        return score > leaderboard[leaderboard.length - 1].score;
    } catch (error) {
        return false;
    }
};
