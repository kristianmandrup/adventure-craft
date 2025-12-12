import { useCallback } from 'react';
import { generateInitialTerrain } from '../utils/procedural';
import { audioManager } from '../utils/audio';
import { clearSave, loadGame } from '../utils/storage';
import { Block, Character, Projectile, DroppedItem, InventoryItem, Equipment } from '../types';

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
}

export const useGameLifecycle = ({
    setBlocks, setCharacters, setProjectiles, setDroppedItems, setInventory,
    setPlayerHp, setPlayerHunger, setGameMode, setGameStarted, setEquipment,
    playerPosRef, spawnCaveContents, spawnPredefinedCharacter, generateRandomQuest
}: UseGameLifecycleProps) => {

    const handleNewGame = useCallback((mode: 'CREATIVE' | 'ADVENTURE' = 'CREATIVE') => {
        clearSave();
        const result = generateInitialTerrain();
        setBlocks(result.blocks);
        spawnCaveContents(result.caveSpawns);
        
        // Adventure Mode Initialization
        if (mode === 'ADVENTURE') {
            import('../utils/prefabs/characters').then(m => {
                 spawnPredefinedCharacter(m.animalPrefabs.sheep, 2, false, false, false, false, true); 
                 spawnPredefinedCharacter(m.animalPrefabs.cow, 2, false, false, false, false, true);
                 spawnPredefinedCharacter(m.animalPrefabs.pig, 2, false, false, false, false, true);
                 spawnPredefinedCharacter(m.enemyPrefabs.zombie, 3, true, false, false, false, true);
                 spawnPredefinedCharacter(m.enemyPrefabs.skeleton, 2, true, false, false, false, true);
            });
            
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

        setCharacters([]);
        setProjectiles([]);
        setDroppedItems([]);
        setInventory([]);
        setPlayerHp(100);
        setPlayerHunger(100);
        setGameMode(mode);
        generateRandomQuest();
        setGameStarted(true);
        audioManager.init();
    }, [setBlocks, spawnCaveContents, spawnPredefinedCharacter, setCharacters, setProjectiles, setDroppedItems, setInventory, setPlayerHp, setPlayerHunger, setGameMode, generateRandomQuest, setGameStarted]);

    const handleContinue = useCallback(() => {
        const save = loadGame();
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
            if (save.equipment) setEquipment(save.equipment); 
            setGameStarted(true);
            audioManager.init();
        }
    }, [setPlayerHp, setPlayerHunger, setInventory, setBlocks, setCharacters, setDroppedItems, playerPosRef, setGameMode, setEquipment, setGameStarted]);

    return { handleNewGame, handleContinue };
};
