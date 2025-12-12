import { useEffect, useRef } from 'react';
import { saveGame } from '../utils/storage';

interface UseGameLoopProps {
    gameStarted: boolean;
    playerHp: number;
    playerPosRef: React.MutableRefObject<[number, number, number] | null>;
    stateToSave: any;
    getEntityCounts: () => { enemies: number; animals: number; };
    spawnPredefinedCharacter: (prefab: any, count: number, isEnemy?: boolean, isGiant?: boolean) => void;
}

export const useGameLoop = ({
    gameStarted,
    playerHp,
    playerPosRef,
    stateToSave,
    getEntityCounts,
    spawnPredefinedCharacter
}: UseGameLoopProps) => {

    // Auto-Save Interval (30s)
    useEffect(() => {
        if (!gameStarted || playerHp <= 0) return;
        const interval = setInterval(() => {
            if (playerPosRef.current) {
                const [x, y, z] = playerPosRef.current;
                saveGame({
                    ...stateToSave,
                    playerPos: [x, y, z],
                    version: 1
                });
            }
        }, 30000); 
        return () => clearInterval(interval);
    }, [gameStarted, playerHp, stateToSave]);

    // Random Spawn Interval (10s)
    useEffect(() => {
       if(!gameStarted) return;
       
       const interval = setInterval(() => {
          const counts = getEntityCounts();
          
          if (Math.random() < 0.5 && counts.enemies < 20) {
              import('../utils/prefabs/characters').then(m => {
                  const types = [m.enemyPrefabs.zombie, m.enemyPrefabs.skeleton];
                  const type = types[Math.floor(Math.random() * types.length)];
                  spawnPredefinedCharacter(type, 1, true);
              });
          }
       }, 10000);
       return () => clearInterval(interval);
    }, [gameStarted, getEntityCounts, spawnPredefinedCharacter]);

    // Sorcerer Auto-Spawn (30-90s)
    useEffect(() => {
        if (!gameStarted) return;
        const timeout = Math.random() * 60000 + 30000;
        const interval = setInterval(() => {
            import('../utils/prefabs/characters').then(m => {
                spawnPredefinedCharacter(m.enemyPrefabs.sorcerer, 1, true);
            });
        }, timeout);
        return () => clearInterval(interval);
      }, [gameStarted, spawnPredefinedCharacter]);
  
      // Giant Auto-Spawn (60-120s)
      useEffect(() => {
        if (!gameStarted) return;
        const timeout = Math.random() * 60000 + 60000;
        const interval = setInterval(() => {
            import('../utils/prefabs/characters').then(m => {
                spawnPredefinedCharacter(m.enemyPrefabs.giant, 1, true, true);
            });
        }, timeout);
        return () => clearInterval(interval);
      }, [gameStarted, spawnPredefinedCharacter]);
};
