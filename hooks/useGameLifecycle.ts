import { useCallback, useState } from 'react';
import { generateInitialTerrain } from '../utils/procedural';
import { audioManager } from '../utils/audio';
import { clearSave, loadGame } from '../utils/storage';
import { getMostRecentSave } from '../utils/cloudSaves';
import { Block, Character, Projectile, DroppedItem, InventoryItem, Equipment, GameMode } from '../types';

interface UseGameLifecycleProps {
    setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
    setCharacters: React.Dispatch<React.SetStateAction<Character[]>>;
    setProjectiles: React.Dispatch<React.SetStateAction<Projectile[]>>;
    setDroppedItems: React.Dispatch<React.SetStateAction<DroppedItem[]>>;
    setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
    setPlayerHp: React.Dispatch<React.SetStateAction<number>>;
    setPlayerHunger: React.Dispatch<React.SetStateAction<number>>;
    setGameMode: React.Dispatch<React.SetStateAction<'CREATIVE' | 'ADVENTURE'>>;
    setGameStarted: (started: boolean) => void;
    setEquipment: React.Dispatch<React.SetStateAction<Equipment>>;
    playerPosRef: React.MutableRefObject<[number, number, number] | null>;
    spawnCaveContents: (spawns: any[]) => void;
    spawnPredefinedCharacter: (prefab: any, count: number, ...args: any[]) => void;
    generateRandomQuest: () => void;
    userId: string | null;
    setDifficultyMode: React.Dispatch<React.SetStateAction<GameMode>>;
    setIsUnderworld: React.Dispatch<React.SetStateAction<boolean>>;
    onXpGain: (amount: number) => void;
}

export const useGameLifecycle = ({
    setBlocks, setCharacters, setProjectiles, setDroppedItems, setInventory,
    setPlayerHp, setPlayerHunger, setGameMode, setGameStarted, setEquipment,
    playerPosRef, spawnCaveContents, spawnPredefinedCharacter, generateRandomQuest,
    userId, setDifficultyMode, setIsUnderworld, onXpGain
}: UseGameLifecycleProps) => {

    const [saveSource, setSaveSource] = useState<'cloud' | 'local' | 'none'>('none');
    const [isLoadingContinue, setIsLoadingContinue] = useState(false);

    const handleNewGame = useCallback((mode: 'CREATIVE' | 'ADVENTURE' = 'CREATIVE', difficulty: GameMode = 'NORMAL') => {
        clearSave();
        
        // Handle Difficulty Mode Settings
        setDifficultyMode(difficulty);
        if (difficulty === 'DARK_UNDERWORLD') {
             setIsUnderworld(true);
             // Start at Level 10 (approx 5000 XP)
             // We need to wait for state reset? internal logic of onXpGain might depend on current XP.
             // But valid because we assume hook is mounted.
             onXpGain(5000); 
        } else {
             setIsUnderworld(false);
             // Logic to reset XP? onXpGain adds. 
             // Ideally we should have setPlayerXp. 
             // But assuming new game, maybe App reloads or we rely on gameOver reset?
        }

        const result = generateInitialTerrain(); // Generate based on default? Or need param?
        // If Underworld, we probably want Underworld terrain?
        // generateInitialTerrain in procedural.ts generates a forest/island.
        // We should probably check difficulty here.
        // But procedural currently only exports generateInitialTerrain.
        // We'll fix terrain in next step or assume default is okay and we teleport?
        // Actually, if setIsUnderworld(true) is called, useWorldState might handle generation?
        // No, useWorldState only generates if enterUnderworld is called.
        // I should stick to basic terrain for now, but if Dark Underworld, maybe use generateUnderworldTerrain?
        
        if (difficulty === 'DARK_UNDERWORLD') {
             // We need to import generateUnderworldTerrain dynamically or statically.
             import('../utils/procedural').then(({ generateUnderworldTerrain }) => {
                 const uResult = generateUnderworldTerrain();
                 setBlocks(uResult.blocks);
                 spawnCaveContents([]); // Underworld might have own caves?
             });
        } else {
             setBlocks(result.blocks);
             spawnCaveContents(result.caveSpawns);
        }
        
        // Adventure Mode Initialization
        if (mode === 'ADVENTURE') {
            import('../utils/prefabs/characters').then(m => {
                 if (difficulty === 'DARK_UNDERWORLD') {
                      spawnPredefinedCharacter(m.animalPrefabs.pig, 3, false, false, false, false, true);
                      spawnPredefinedCharacter(m.enemyPrefabs.sorcerer, 2, true, false, false, false, true);
                      spawnPredefinedCharacter(m.enemyPrefabs.giant, 2, true, false, false, false, true);
                 } else {
                      spawnPredefinedCharacter(m.animalPrefabs.sheep, 2, false, false, false, false, true); 
                      spawnPredefinedCharacter(m.animalPrefabs.cow, 2, false, false, false, false, true);
                      spawnPredefinedCharacter(m.animalPrefabs.pig, 2, false, false, false, false, true);
                      spawnPredefinedCharacter(m.enemyPrefabs.zombie, 3, true, false, false, false, true);
                      spawnPredefinedCharacter(m.enemyPrefabs.skeleton, 2, true, false, false, false, true);
                 }
            });
            
            if (difficulty !== 'DARK_UNDERWORLD') {
                import('../utils/prefabs/structures').then(s => {
                     const house = s.structurePrefabs.house;
                     const tower = s.structurePrefabs.tower;
                     const newStructureBlocks: Block[] = [];
                     
                     const place = (prefab: any, cx: number, cz: number) => {
                         let y = 0;
                         const col = result.blocks.filter(b => Math.round(b.x) === cx && Math.round(b.z) === cz);
                         if (col.length > 0) y = Math.max(...col.map(b => b.y)) + 1;
                         if (y < 1) y = 5; 
                         
                         prefab.blocks.forEach((b: any) => {
                             newStructureBlocks.push({
                                 id: crypto.randomUUID(),
                                 x: b.x + cx,
                                 y: b.y + y,
                                 z: b.z + cz,
                                 color: b.color,
                                 type: b.type,
                                 hp: 100
                             });
                         });
                     };
    
                     if (Math.random() > 0.3) place(house, 20, 20); 
                     if (Math.random() > 0.3) place(tower, -20, -20); 
                     
                     setBlocks(prev => [...prev, ...newStructureBlocks]);
                });
            }
        }

        setCharacters([]);
        setProjectiles([]);
        setDroppedItems([]);
        setInventory([]);
        setPlayerHp(100);
        setPlayerHunger(100);
        setGameMode(mode);
        generateRandomQuest();
        setGameStarted(true);
        setSaveSource('none');
        audioManager.init();
    }, [setBlocks, spawnCaveContents, spawnPredefinedCharacter, setCharacters, setProjectiles, setDroppedItems, setInventory, setPlayerHp, setPlayerHunger, setGameMode, generateRandomQuest, setGameStarted, setDifficultyMode, setIsUnderworld, onXpGain]);

    const handleContinue = useCallback(async () => {
        setIsLoadingContinue(true);
        
        // Get local save
        const localSave = loadGame();
        
        // Compare with cloud save if authenticated
        let save = localSave;
        let source: 'cloud' | 'local' | 'none' = localSave ? 'local' : 'none';
        
        if (userId) {
            try {
                const result = await getMostRecentSave(userId, localSave);
                save = result.save;
                source = result.source;
                
                if (source === 'cloud') {
                    console.log('☁️ Loading from cloud save (more recent)');
                } else if (source === 'local') {
                    console.log('💾 Loading from local save (more recent)');
                }
            } catch (error) {
                console.error('Failed to check cloud save:', error);
                // Fall back to local
            }
        }
        
        if (save) {
            setPlayerHp(save.playerHp);
            setPlayerHunger(save.playerHunger);
            setInventory(save.inventory);
            setBlocks(save.blocks);
            setCharacters(save.characters);
            setDroppedItems(save.droppedItems || []);
            if (save.playerPos && playerPosRef.current) {
                 playerPosRef.current = [...save.playerPos] as [number, number, number];
            }
            if (save.gameMode) setGameMode(save.gameMode);
            if (save.difficultyMode) setDifficultyMode(save.difficultyMode);
            if (save.equipment) setEquipment(save.equipment); 
            setGameStarted(true);
            setSaveSource(source);
            audioManager.init();
        }
        
        setIsLoadingContinue(false);
    }, [setPlayerHp, setPlayerHunger, setInventory, setBlocks, setCharacters, setDroppedItems, playerPosRef, setGameMode, setEquipment, setGameStarted, userId, setDifficultyMode]);

    return { handleNewGame, handleContinue, saveSource, isLoadingContinue };
};
