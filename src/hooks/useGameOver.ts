import { useState, useEffect } from 'react';
import { clearSave } from '../utils/storage';

export const useGameOver = (playerHp: number, gameStarted: boolean) => {
    const [gameOver, setGameOver] = useState(false);

    useEffect(() => {
        if (playerHp <= 0 && gameStarted) {
            setGameOver(true);
            clearSave(); 
        }
    }, [playerHp, gameStarted]);

    // Press N to Game Over (Debug)
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() === 'n' && gameStarted) setGameOver(true);
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [gameStarted]);

    return { gameOver, setGameOver };
};
