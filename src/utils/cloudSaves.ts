import { doc, setDoc, getDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import { GameSaveState } from '../types';

const SAVES_COLLECTION = 'saves';

export interface CloudSaveMetadata {
    exists: boolean;
    lastPlayed?: Date;
    playerLevel?: number;
    gameMode?: 'CREATIVE' | 'ADVENTURE';
    playerXp?: number;
}

export interface CloudSaveData {
    userId: string;
    gameState: GameSaveState;
    lastPlayed: Timestamp;
    playerLevel: number;
    gameMode: 'CREATIVE' | 'ADVENTURE';
    playerXp: number;
    version: number;
}

/**
 * Save game state to Firestore cloud
 */
export const saveGameToCloud = async (
    userId: string,
    gameState: Omit<GameSaveState, 'timestamp'>,
    playerLevel: number,
    playerXp: number,
    gameMode: 'CREATIVE' | 'ADVENTURE'
): Promise<boolean> => {
    try {
        const saveRef = doc(db, SAVES_COLLECTION, userId);
        
        const saveData: Omit<CloudSaveData, 'lastPlayed'> & { lastPlayed: ReturnType<typeof serverTimestamp> } = {
            userId,
            gameState: {
                ...gameState,
                timestamp: Date.now()
            },
            lastPlayed: serverTimestamp(),
            playerLevel,
            playerXp,
            gameMode,
            version: 1
        };
        
        await setDoc(saveRef, saveData, { merge: true });
        console.log('☁️ Game saved to cloud');
        return true;
    } catch (error) {
        console.error('Failed to save to cloud:', error);
        return false;
    }
};

/**
 * Load game state from Firestore cloud
 */
export const loadGameFromCloud = async (userId: string): Promise<GameSaveState | null> => {
    try {
        const saveRef = doc(db, SAVES_COLLECTION, userId);
        const snapshot = await getDoc(saveRef);
        
        if (!snapshot.exists()) {
            console.log('No cloud save found');
            return null;
        }
        
        const data = snapshot.data() as CloudSaveData;
        console.log('☁️ Game loaded from cloud');
        return data.gameState;
    } catch (error) {
        console.error('Failed to load from cloud:', error);
        return null;
    }
};

/**
 * Get cloud save metadata without loading full state
 */
export const getCloudSaveInfo = async (userId: string): Promise<CloudSaveMetadata> => {
    try {
        const saveRef = doc(db, SAVES_COLLECTION, userId);
        const snapshot = await getDoc(saveRef);
        
        if (!snapshot.exists()) {
            return { exists: false };
        }
        
        const data = snapshot.data() as CloudSaveData;
        return {
            exists: true,
            lastPlayed: data.lastPlayed?.toDate(),
            playerLevel: data.playerLevel,
            gameMode: data.gameMode,
            playerXp: data.playerXp
        };
    } catch (error) {
        console.error('Failed to get cloud save info:', error);
        return { exists: false };
    }
};

/**
 * Compare local and cloud saves, return the more recent one
 */
export const getMostRecentSave = async (
    userId: string,
    localSave: GameSaveState | null
): Promise<{ source: 'cloud' | 'local' | 'none'; save: GameSaveState | null }> => {
    const cloudSave = await loadGameFromCloud(userId);
    
    if (!cloudSave && !localSave) {
        return { source: 'none', save: null };
    }
    
    if (!cloudSave) {
        return { source: 'local', save: localSave };
    }
    
    if (!localSave) {
        return { source: 'cloud', save: cloudSave };
    }
    
    // Compare timestamps
    const cloudTimestamp = cloudSave.timestamp || 0;
    const localTimestamp = localSave.timestamp || 0;
    
    if (cloudTimestamp > localTimestamp) {
        return { source: 'cloud', save: cloudSave };
    } else {
        return { source: 'local', save: localSave };
    }
};
