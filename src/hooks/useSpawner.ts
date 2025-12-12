import { useCallback } from 'react';
import { Character, Block } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { enemyPrefabs, animalPrefabs, npcPrefabs } from '../utils/prefabs/characters';

export const useSpawner = (
    blocks: Block[],
    targetPosRef: React.MutableRefObject<[number, number, number] | null>,
    playerPosRef: React.MutableRefObject<[number, number, number] | null>,
    setCharacters: React.Dispatch<React.SetStateAction<Character[]>>,
    setBlocks: React.Dispatch<React.SetStateAction<Block[]>>,
    setSpawnMarkers: React.Dispatch<React.SetStateAction<import('../types').SpawnMarker[]>>,
    BASE_SIZE: number,
    expansionLevel: number,
    EXPANSION_STEP: number
) => {

    const spawnPredefinedCharacter = useCallback((
        prefab: any,
        count: number,
        isEnemy: boolean = false,
        isGiant: boolean = false,
        isFriendly: boolean = false,
        isAquatic: boolean = false,
        useRandomLocation: boolean = false
      ) => {
        const range = BASE_SIZE + (expansionLevel * EXPANSION_STEP);
        const newChars: Character[] = [];
        
        // Helper: Random Valid Position Finder
        const findValidPosition = (center: [number, number, number] | null, range: number): [number, number, number] | null => {
             // If center is null, use map center [0,0,0] but range is full map size minus barrier
             let origin = center || [0,0,0];
             let searchRange = range;
             
             // Global Spawn if center is null 
             // (User asked for "within 3 blocks from edge" -> meaning "at least 3 blocks from edge")
             // Map size is roughly BASE_SIZE + expansionLevel * STEP.
             // Assume origin [0,0,0] is center. Max coord is +/- mapSize/2.
             const mapRadius = (BASE_SIZE + expansionLevel * EXPANSION_STEP) / 2;
             
             if (!center) {
                 searchRange = mapRadius - 3; // 3 block buffer
             }

             let attempts = 0;
             while(attempts < 20) {
                 attempts++;
                 const rx = origin[0] + (Math.floor(Math.random() * searchRange * 2) - searchRange);
                 const rz = origin[2] + (Math.floor(Math.random() * searchRange * 2) - searchRange);
                 
                 // Distance check (min 10 blocks from player to avoid popping in face)
                 if (playerPosRef.current) {
                     const dist = Math.sqrt((rx - playerPosRef.current[0])**2 + (rz - playerPosRef.current[2])**2);
                     if (dist < 15) continue;
                 }
                 
                 // Terrain check
                 const inWater = blocks.some(b => Math.round(b.x) === Math.round(rx) && Math.round(b.z) === Math.round(rz) && b.type === 'water');
                 
                 if (isAquatic && !inWater) continue;
                 if (!isAquatic && inWater) continue;
                 
                 // Find height
                 let ry = 5;
                 const blockCol = blocks.filter(b => Math.round(b.x) === Math.round(rx) && Math.round(b.z) === Math.round(rz));
                 if(blockCol.length === 0 && !isAquatic) continue; // Don't spawn in void

                 const highestBlock = blockCol.sort((a,b) => b.y - a.y)[0];
                 if (highestBlock) ry = highestBlock.y + 1;
                 
                 if (ry > 15) continue; // Height check
    
                 return [rx, ry, rz];
             }
             return null;
        };
    
        for (let i = 0; i < count; i++) {
            let spawnPos: [number, number, number] | null = null;
            
            // Only use targetPos (cursor) if NOT forcing random location
            if (!useRandomLocation && targetPosRef.current) {
                const t = targetPosRef.current;
                spawnPos = [t[0], t[1] + 1, t[2]];
            }
            if (!spawnPos) {
                 // Pass null for center to trigger Global Spawn mode
                 spawnPos = findValidPosition(null, range);
            }
            
            if (spawnPos) {
                const [spawnX, spawnY, spawnZ] = spawnPos;
                setSpawnMarkers(prev => [...prev, { id: uuidv4(), x: spawnX, z: spawnZ, timestamp: Date.now() }]);
                
                newChars.push({
                    id: uuidv4(),
                    name: prefab.name,
                    playerPos: [spawnX, spawnY, spawnZ],
                    rotation: Math.random() * Math.PI * 2,
                    parts: prefab.parts,
                    maxHp: isGiant ? 100 : prefab.maxHp,
                    hp: isGiant ? 100 : prefab.maxHp,
                    isEnemy, isGiant, isFriendly, isAquatic,
                });
            }
        }
        setCharacters(prev => [...prev, ...newChars]);
      }, [blocks, expansionLevel, BASE_SIZE, EXPANSION_STEP]);
      
      const spawnCaveContents = (caveSpawns: import('../utils/procedural').CaveSpawn[]) => {
          caveSpawns.forEach(spawn => {
               if (spawn.type === 'treasure') {
                   setBlocks(prev => [...prev, 
                     { id: uuidv4(), x: spawn.x, y: spawn.y, z: spawn.z, color: '#fbbf24', type: 'gold' },
                     { id: uuidv4(), x: spawn.x, y: spawn.y + 1, z: spawn.z, color: '#b45309', type: 'wood' },
                   ]);
                   setSpawnMarkers(prev => [...prev, { id: uuidv4(), x: spawn.x, z: spawn.z, timestamp: Date.now() }]);
               } else if (spawn.type === 'boss') {
                   // Spawn Boss
                   const bossChar: Character = {
                       id: uuidv4(),
                       name: 'Cave Guardian',
                       playerPos: [spawn.x, spawn.y, spawn.z],
                       rotation: 0,
                       parts: enemyPrefabs.sorcerer.parts,
                       maxHp: 200, hp: 200,
                       isEnemy: true, isGiant: true, isFriendly: false, isAquatic: false
                   };
                   setCharacters(prev => [...prev, bossChar]);
                   
                   // Spawn Treasure Chest nearby (2 blocks away)
                   const chestX = spawn.x + 2;
                   const chestZ = spawn.z;
                   setBlocks(prev => [...prev, 
                     { id: uuidv4(), x: chestX, y: spawn.y, z: chestZ, color: '#fbbf24', type: 'gold' }, // Gold base
                     { id: uuidv4(), x: chestX, y: spawn.y + 1, z: chestZ, color: '#b45309', type: 'wood' }, // Wood top (Chest)
                     { id: uuidv4(), x: chestX, y: spawn.y + 2, z: chestZ, color: '#fbbf24', type: 'gold' }, // Extra gold
                   ]);

                   setSpawnMarkers(prev => [...prev, { id: uuidv4(), x: spawn.x, z: spawn.z, timestamp: Date.now() }]);
               } else if (spawn.type === 'merchant') {
                   // Spawn Merchant
                   const merchantChar: Character = {
                       id: uuidv4(),
                       name: 'Merchant',
                       playerPos: [spawn.x, spawn.y, spawn.z],
                       rotation: 0,
                       parts: npcPrefabs.merchant?.parts || animalPrefabs.pig.parts, // Fallback if merchant prefab missing
                       maxHp: 100, hp: 100,
                       isEnemy: false, isGiant: false, isFriendly: true, isAquatic: false
                   };
                   setCharacters(prev => [...prev, merchantChar]);
                   
                   // Build Shop Structure (Counter + Back Wall)
                   // Position relative to merchant
                   const builds: Block[] = [];
                   // Counter
                   builds.push({ id: uuidv4(), x: spawn.x + 1, y: spawn.y, z: spawn.z - 1, color: '#78350f', type: 'wood' });
                   builds.push({ id: uuidv4(), x: spawn.x + 1, y: spawn.y, z: spawn.z, color: '#78350f', type: 'wood' });
                   builds.push({ id: uuidv4(), x: spawn.x + 1, y: spawn.y, z: spawn.z + 1, color: '#78350f', type: 'wood' });
                   
                   // Back Wall (behind merchant)
                   for(let i=0; i<3; i++) {
                       for(let j=0; j<3; j++) {
                           builds.push({ id: uuidv4(), x: spawn.x - 2, y: spawn.y + j, z: spawn.z - 1 + i, color: '#374151', type: 'stone' });
                       }
                   }
                   
                   setBlocks(prev => [...prev, ...builds]);
                   setSpawnMarkers(prev => [...prev, { id: uuidv4(), x: spawn.x, z: spawn.z, timestamp: Date.now() }]);
               }
          });
      };

      return { spawnPredefinedCharacter, spawnCaveContents };
};

