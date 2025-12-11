import React, { useState, useCallback, useEffect, useRef } from 'react';
import { VoxelWorld } from './components/VoxelWorld';
import { UIOverlay } from './components/UIOverlay';
import { Minimap } from './components/Minimap';
import { StartScreen } from './components/StartScreen';
import { ChatWindow } from './components/ui/ChatWindow';
import { ShopPanel } from './components/ui/ShopPanel';
import { generateStructure, generateCharacter, generateDialogue, generateItem } from './services/geminiService';
import { Block, Character, GenerationMode, Job, InventoryItem, Projectile, ChatMessage, Quest, SpawnMarker } from './types';
import { v4 as uuidv4 } from 'uuid';
import { generateInitialTerrain, generateExpansion, CaveSpawn, TerrainResult } from './utils/procedural';
import { CharacterPrefab, animalPrefabs, enemyPrefabs, npcPrefabs } from './utils/prefabs/characters';
import { StructurePrefab, structurePrefabs } from './utils/prefabs/structures';
import { DebugOverlay, DebugOverlayRef } from './components/ui/DebugOverlay';

export default function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [spawnMarkers, setSpawnMarkers] = useState<SpawnMarker[]>([]);
  const [isDay, setIsDay] = useState(true);
  const [isRaining, setIsRaining] = useState(false);
  const [viewMode, setViewMode] = useState<'FP' | 'OVERHEAD'>('FP');
  
  // Player State
  const [playerHp, setPlayerHp] = useState(100);
  const [playerHunger, setPlayerHunger] = useState(100);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [activeSlot, setActiveSlot] = useState(0);
  const [respawnTrigger, setRespawnTrigger] = useState(0);
  const [resetViewTrigger, setResetViewTrigger] = useState(0);

  // XP & Level State
  const [playerXp, setPlayerXp] = useState(0);
  const [playerLevel, setPlayerLevel] = useState(1);
  const [levelUpMessage, setLevelUpMessage] = useState<string | null>(null);

  // XP thresholds for each level (cumulative)
  const XP_THRESHOLDS = [0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200]; // Level 1-10
  
  // Calculate stats based on level
  const getPlayerStats = useCallback(() => {
    const attackMultiplier = 1 + (playerLevel - 1) * 0.1;  // +10% per level
    const speedMultiplier = 1 + (playerLevel - 1) * 0.05;  // +5% per level
    const defenseReduction = (playerLevel - 1) * 0.05;     // 5% damage reduction per level
    return { attackMultiplier, speedMultiplier, defenseReduction };
  }, [playerLevel]);

  const handleXpGain = useCallback((amount: number) => {
    setPlayerXp(prev => {
      const newXp = prev + amount;
      // Check for level up
      let newLevel = playerLevel;
      for (let i = playerLevel; i < 10; i++) {
        if (newXp >= XP_THRESHOLDS[i]) {
          newLevel = i + 1;
        } else {
          break;
        }
      }
      if (newLevel > playerLevel) {
        setPlayerLevel(newLevel);
        setLevelUpMessage(`Level Up! You are now level ${newLevel}!`);
        setTimeout(() => setLevelUpMessage(null), 3000);
      }
      return newXp;
    });
  }, [playerLevel]);

  // Quest State
  const [currentQuest, setCurrentQuest] = useState<Quest | null>(null);
  const [questMessage, setQuestMessage] = useState<string | null>(null);

  // Chat State
  const [activeDialogNpcId, setActiveDialogNpcId] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<Record<string, ChatMessage[]>>({});

  // Shop State
  const [shopOpen, setShopOpen] = useState(false);
  const [activeMerchant, setActiveMerchant] = useState<Character | null>(null);

  // Position Ref (Shared with Minimap to avoid re-renders)
  const playerPosRef = useRef<[number, number, number] | null>(null);

  // Target Reference for Spawning (populated by VoxelWorld)
  const targetPosRef = useRef<[number, number, number] | null>(null);

  // Expansion State
  const [expansionLevel, setExpansionLevel] = useState(0);
  const BASE_SIZE = 40;  // 80x80 starting map (-40 to +40)
  const EXPANSION_STEP = 20;

  // Gold & Economy
  const [playerGold, setPlayerGold] = useState(0);
  
  // Portal & Underworld State
  const [portalActive, setPortalActive] = useState(false);
  const [portalPosition, setPortalPosition] = useState<[number, number, number] | null>(null);
  const [isUnderworld, setIsUnderworld] = useState(false);
  const [worldLevel, setWorldLevel] = useState(1);
  
  // API Key Validation
  const [hasApiKey, setHasApiKey] = useState(true);
  
  // Entity Caps
  const ENTITY_CAPS = {
    enemies: 20,
    friendlyNpcs: 10,
    animals: 10,
    structures: 10,  // Tracked by spawn count, not blocks
  };
  
  // Check API key on mount
  useEffect(() => {
    // @ts-ignore - process.env is injected by Vite
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!apiKey || apiKey === 'undefined' || apiKey === '') {
      setHasApiKey(false);
    }
  }, []);
  
  // Count current entities
  const getEntityCounts = useCallback(() => {
    const enemies = characters.filter(c => c.isEnemy).length;
    const animals = characters.filter(c => !c.isEnemy && !c.isFriendly).length;
    const friendlyNpcs = characters.filter(c => c.isFriendly).length;
    return { enemies, animals, friendlyNpcs };
  }, [characters]);

  // Load initial terrain with caves
  useEffect(() => {
    const result = generateInitialTerrain();
    setBlocks(result.blocks);
    
    // Spawn cave contents
    spawnCaveContents(result.caveSpawns);
    
    generateRandomQuest();
  }, []);

  // Portal spawn timer (60-120 seconds after game start)
  useEffect(() => {
    if (!gameStarted || portalActive) return;
    
    const delay = 60000 + Math.random() * 60000; // 60-120 seconds
    const timeout = setTimeout(() => {
      // Find valid spawn location (on solid ground)
      const range = BASE_SIZE + (expansionLevel * EXPANSION_STEP);
      const px = Math.floor(Math.random() * range * 2) - range;
      const pz = Math.floor(Math.random() * range * 2) - range;
      
      // Spawn portal
      setPortalPosition([px, 5, pz]);
      setPortalActive(true);
      
      // Add spawn marker flash effect
      setSpawnMarkers(prev => [...prev, { id: uuidv4(), x: px, z: pz, timestamp: Date.now() }]);
      
      // Spawn the portal blocks
      const portalBlocks = structurePrefabs.portal.blocks.map(b => ({
        id: uuidv4(),
        x: b.x + px,
        y: b.y + 1,
        z: b.z + pz,
        color: b.color,
        type: b.type
      }));
      setBlocks(prev => [...prev, ...portalBlocks]);
    }, delay);
    
    return () => clearTimeout(timeout);
  }, [gameStarted, portalActive, expansionLevel]);

  // Clean up old spawn markers
  useEffect(() => {
    const interval = setInterval(() => {
        const now = Date.now();
        setSpawnMarkers(prev => prev.filter(m => now - m.timestamp < 30000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const generateRandomQuest = () => {
     const types = ['GATHER', 'HUNT'];
     const type = types[Math.floor(Math.random() * types.length)];
     let quest: Quest;
     
     if (type === 'GATHER') {
         const resources = ['wood', 'stone', 'leaf', 'dirt'];
         const resource = resources[Math.floor(Math.random() * resources.length)];
         const amount = Math.floor(Math.random() * 10) + 5;
         quest = {
             id: uuidv4(),
             title: `Gather ${amount} ${resource}`,
             requirements: { [resource]: amount },
             progress: { [resource]: 0 },
             completed: false
         };
     } else {
         const enemies = ['zombie', 'spider', 'skeleton'];
         const enemy = enemies[Math.floor(Math.random() * enemies.length)];
         const amount = Math.floor(Math.random() * 3) + 1;
         
         // Mixed quest chance
         if (Math.random() > 0.7) {
             const enemy2 = enemies[(enemies.indexOf(enemy) + 1) % enemies.length];
             const amount2 = Math.floor(Math.random() * 2) + 1;
             quest = {
                 id: uuidv4(),
                 title: `Hunt ${amount} ${enemy}s & ${amount2} ${enemy2}s`,
                 requirements: { [enemy]: amount, [enemy2]: amount2 },
                 progress: { [enemy]: 0, [enemy2]: 0 },
                 completed: false
             };
         } else {
             quest = {
                 id: uuidv4(),
                 title: `Hunt ${amount} ${enemy}s`,
                 requirements: { [enemy]: amount },
                 progress: { [enemy]: 0 },
                 completed: false
             };
         }
     }
     setCurrentQuest(quest);
  };

  const handleQuestUpdate = useCallback((type: string, amount: number) => {
      setCurrentQuest(prev => {
          if (!prev || prev.completed) return prev;
          
          // Normalized type checks
          let key = type;
          // Partial matching for ease
          const keys = Object.keys(prev.requirements);
          const match = keys.find(k => type.includes(k));
          if (match) key = match;
          else return prev;

          const newProgress = { ...prev.progress, [key]: (prev.progress[key] || 0) + amount };
          
          // Check completion
          let isComplete = true;
          for (const k of keys) {
              if ((newProgress[k] || 0) < prev.requirements[k]) isComplete = false;
          }

          if (isComplete) {
              setQuestMessage("Quest Complete!");
              // Grant XP for quest completion (50-100 based on difficulty)
              const questXp = 50 + Object.keys(prev.requirements).length * 25;
              handleXpGain(questXp);
              setTimeout(() => {
                  setQuestMessage(null);
                  generateRandomQuest();
              }, 4000);
          }

          return { ...prev, progress: newProgress, completed: isComplete };
      });
  }, []);

  // Hunger: -1 per 3 seconds
  useEffect(() => {
    if (!gameStarted) return;
    const interval = setInterval(() => {
        setPlayerHunger(prev => Math.max(0, prev - 1));
    }, 3000);
    return () => clearInterval(interval);
  }, [gameStarted]);

  // Rain Cycle: Check every 60s, 20% chance
  useEffect(() => {
      if (!gameStarted) return;
      const interval = setInterval(() => {
          if (Math.random() < 0.2) {
              setIsRaining(true);
              setTimeout(() => setIsRaining(false), 30000); // Rain for 30s
          }
      }, 60000); 
      return () => clearInterval(interval);
  }, [gameStarted]);

  // Health Regeneration: 1 HP every 2 seconds if not starving
  useEffect(() => {
    if (!gameStarted) return;
    const interval = setInterval(() => {
        if (playerHunger > 0) {
            setPlayerHp(prev => Math.min(100, prev + 1));
        }
    }, 2000);
    return () => clearInterval(interval);
  }, [gameStarted, playerHunger]);

  const handleExpand = useCallback(() => {
    if (expansionLevel >= 3) return;  // Max 3 expansions (60 -> 120 blocks)
    
    const currentSize = BASE_SIZE + (expansionLevel * EXPANSION_STEP);
    const newBlocks = generateExpansion(currentSize, EXPANSION_STEP);
    
    setBlocks(prev => [...prev, ...newBlocks]);
    setExpansionLevel(prev => prev + 1);
  }, [expansionLevel]);

  const handleShrink = useCallback(() => {
    if (expansionLevel <= 0) return;  // Can't go below initial size
    
    const newLevel = expansionLevel - 1;
    const newSize = BASE_SIZE + (newLevel * EXPANSION_STEP);
    
    // Remove blocks outside the new size
    setBlocks(prev => prev.filter(b => 
      Math.abs(b.x) <= newSize && Math.abs(b.z) <= newSize
    ));
    // Remove characters outside the new size
    setCharacters(prev => prev.filter(c => 
      Math.abs(c.position[0]) <= newSize && Math.abs(c.position[2]) <= newSize
    ));
    setExpansionLevel(newLevel);
  }, [expansionLevel]);

  const handleRespawn = useCallback(() => {
    setRespawnTrigger(prev => prev + 1);
  }, []);

  const handleResetView = useCallback(() => {
    setResetViewTrigger(prev => prev + 1);
  }, []);

  const addJob = (type: GenerationMode, prompt: string, count: number, isEnemy?: boolean, isGiant?: boolean, isFriendly?: boolean, isAquatic?: boolean) => {
    const newJob: Job = { id: uuidv4(), type, prompt: `${count}x ${prompt}`, status: 'pending', isEnemy, isGiant, isFriendly, isAquatic };
    setJobs(prev => [newJob, ...prev]);
    processJob(newJob, count);
  };

  const processJob = async (job: Job, count: number) => {
    setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'generating' } : j));
    try {
      let centerX = 0, centerY = 0, centerZ = 0;
      let useTarget = false;

      if (targetPosRef.current) {
        [centerX, centerY, centerZ] = targetPosRef.current;
        useTarget = true;
      } else {
        const range = BASE_SIZE + (expansionLevel * EXPANSION_STEP);
        centerX = (Math.random() * range * 2) - range;
        centerZ = (Math.random() * range * 2) - range;
      }

      if (job.type === 'ITEM') {
          // Parse original prompt back from "Nx prompt"
          const cleanPrompt = job.prompt.replace(/^\d+x\s/, '');
          const response = await generateItem(cleanPrompt);
          
          setInventory(prev => {
              const existing = prev.find(i => i.type === response.name);
              if (existing) {
                  return prev.map(i => i.type === response.name ? { ...i, count: i.count + count } : i);
              }
              // If new, find empty slot or append
              return [...prev, { type: response.name, count: count, color: response.color }];
          });
          updateJobStatus(job.id, 'success', `Created ${response.name}`);
          
      } else if (job.type === 'STRUCTURE') {
        const response = await generateStructure(job.prompt, blocks.length);
        const newBlocks: Block[] = [];
        const scatterRadius = count > 1 ? 5 : 0; 
        const range = BASE_SIZE + (expansionLevel * EXPANSION_STEP);

        for (let i = 0; i < count; i++) {
          let spawnX = centerX;
          let spawnZ = centerZ;
          let spawnY = centerY;
          
          if (!useTarget) {
              // Retry logic for valid ground (not water/leaves)
              let validSpot = false;
              let attempts = 0;
              while (!validSpot && attempts < 10) {
                  attempts++;
                  const testX = (Math.random() * range * 2) - range;
                  const testZ = (Math.random() * range * 2) - range;
                  
                  // Find highest block
                  let highestBlock: Block | null = null;
                  let maxY = -100;
                  
                  // Optimize: this scan is heavy but needed for correct placement
                  for (const b of blocks) {
                      if (Math.abs(b.x - testX) < 1.5 && Math.abs(b.z - testZ) < 1.5) {
                          if (b.y > maxY) {
                              maxY = b.y;
                              highestBlock = b;
                          }
                      }
                  }

                  if (highestBlock) {
                      const t = highestBlock.type || '';
                      if (!t.includes('water') && !t.includes('leaf')) {
                          validSpot = true;
                          spawnX = testX;
                          spawnZ = testZ;
                          spawnY = maxY + 1;
                      }
                  } else {
                      // No block found, maybe empty space? Assume ground level 0 if nothing exists?
                  }
              }
              if (!validSpot) {
                  spawnX = centerX + (Math.random() * 10 - 5);
                  spawnZ = centerZ + (Math.random() * 10 - 5);
                  spawnY = 1; // Fallback
              }
          } else {
             // Use target exactly, but scatter slightly if multiple
             const offsetX = scatterRadius > 0 ? Math.floor((Math.random() * scatterRadius * 2) - scatterRadius) : 0;
             const offsetZ = scatterRadius > 0 ? Math.floor((Math.random() * scatterRadius * 2) - scatterRadius) : 0;
             spawnX += offsetX;
             spawnZ += offsetZ;
          }

          // Add Spawn Marker
          setSpawnMarkers(prev => [...prev, { id: uuidv4(), x: spawnX, z: spawnZ, timestamp: Date.now() }]);

          response.blocks.forEach(b => {
            newBlocks.push({
              ...b,
              id: uuidv4(),
              x: b.x + Math.round(spawnX),
              y: b.y + Math.round(spawnY), 
              z: b.z + Math.round(spawnZ),
            });
          });
        }

        setBlocks(prev => {
           const keys = new Set(prev.map(b => `${b.x},${b.y},${b.z}`));
           return [...prev, ...newBlocks.filter(b => !keys.has(`${b.x},${b.y},${b.z}`))];
        });
        updateJobStatus(job.id, 'success', `Built ${response.description}`);
      
      } else {
        const response = await generateCharacter(job.prompt);
        const newChars: Character[] = [];
        const pLower = job.prompt.toLowerCase();
        
        const scatterRadius = count > 1 ? 4 : 0;

        for (let i = 0; i < count; i++) {
            const offsetX = scatterRadius > 0 ? Math.floor(Math.random() * scatterRadius * 2) - scatterRadius : 0;
            const offsetZ = scatterRadius > 0 ? Math.floor(Math.random() * scatterRadius * 2) - scatterRadius : 0;
            
            let spawnX = Math.round(centerX + offsetX);
            let spawnZ = Math.round(centerZ + offsetZ);
            let spawnY = centerY; 

            if (!useTarget) {
                 if (job.isAquatic) {
                     // Find a water block
                     let waterFound = false;
                     let attempts = 0;
                     // Try to pick a random water block from existing blocks
                     const waterBlocks = blocks.filter(b => b.type === 'water');
                     if (waterBlocks.length > 0) {
                         while (!waterFound && attempts < 10) {
                             const wb = waterBlocks[Math.floor(Math.random() * waterBlocks.length)];
                             // Ensure it's somewhat deep? or just use it
                             spawnX = wb.x;
                             spawnY = wb.y;
                             spawnZ = wb.z;
                             waterFound = true;
                         }
                     }
                     if (!waterFound) spawnY = -2; // Fallback under water level
                 } else {
                     spawnY = 2;
                     let foundY = -100;
                     let found = false;
                     blocks.forEach(b => {
                         if (b.x === spawnX && b.z === spawnZ) {
                             if (b.y > foundY) { foundY = b.y; found = true; }
                         }
                     });
                     if(found) spawnY = foundY + 1;
                 }
            }

            // Add Spawn Marker
            setSpawnMarkers(prev => [...prev, { id: uuidv4(), x: spawnX, z: spawnZ, timestamp: Date.now() }]);

            let maxHp = 20;
            if (job.isGiant) maxHp = 100;
            else if (pLower.includes('zombie')) maxHp = 30;
            else if (pLower.includes('sorcerer')) maxHp = 50;
            else if (job.isFriendly) maxHp = 50;
            else if (job.isAquatic) maxHp = 5;

            newChars.push({
              id: uuidv4(),
              name: response.description,
              position: [spawnX, spawnY, spawnZ],
              rotation: 0,
              parts: response.parts,
              maxHp: maxHp,
              hp: maxHp,
              isEnemy: !!job.isEnemy,
              isGiant: !!job.isGiant,
              isFriendly: !!job.isFriendly,
              isAquatic: !!job.isAquatic
            });
        }
        setCharacters(prev => [...prev, ...newChars]);
        updateJobStatus(job.id, 'success');
      }
    } catch (error) {
      console.error(error);
      updateJobStatus(job.id, 'error', 'Failed');
    }
  };

  const updateJobStatus = (id: string, status: Job['status'], message?: string) => {
    setJobs(prev => prev.map(j => j.id === id ? { ...j, status, message } : j));
    setTimeout(() => setJobs(prev => prev.filter(j => j.id !== id)), 5000);
  };

  const handleCraft = (recipeId: string) => {
    if (recipeId === 'planks') {
        const woodIdx = inventory.findIndex(i => i.type.includes('wood') && i.count > 0);
        if (woodIdx >= 0) {
            const newInv = [...inventory];
            newInv[woodIdx].count--;
            if (newInv[woodIdx].count === 0) newInv.splice(woodIdx, 1);
            
            const plankIdx = newInv.findIndex(i => i.type === 'plank');
            if (plankIdx >= 0) newInv[plankIdx].count += 4;
            else newInv.push({ type: 'plank', count: 4, color: '#fcd34d' });
            
            setInventory(newInv);
        }
    }
  };

  const handleGiveItem = (item: string, count: number = 1) => {
    if (item === 'weapon') {
       setInventory(prev => {
          const existing = prev.find(i => i.type === 'weapon');
          if (existing) return prev.map(i => i.type === 'weapon' ? {...i, count: i.count + count} : i);
          return [...prev, { type: 'weapon', count: count, color: '#06b6d4' }];
       });
    } else if (item === 'apple') {
        setInventory(prev => {
            const existing = prev.find(i => i.type === 'apple');
            if(existing) return prev.map(i => i.type === 'apple' ? {...i, count: i.count + count} : i);
            return [...prev, { type: 'apple', count: count, color: '#ef4444' }];
        });
    } else if (item === 'shield') {
         setInventory(prev => {
            const existing = prev.find(i => i.type === 'shield');
            if(existing) return prev.map(i => i.type === 'shield' ? {...i, count: i.count + count} : i);
            return [...prev, { type: 'shield', count: count, color: '#94a3b8' }];
        });
    } else if (item === 'bow') {
         setInventory(prev => {
            const existing = prev.find(i => i.type === 'bow');
            if(existing) return prev;
            return [...prev, { type: 'bow', count: 1, color: '#8b4513' }];
        });
    } else if (item === 'arrows') {
         setInventory(prev => {
            const existing = prev.find(i => i.type === 'arrows');
            if(existing) return prev.map(i => i.type === 'arrows' ? {...i, count: i.count + 10} : i);
            return [...prev, { type: 'arrows', count: 10, color: '#d4a574' }];
        });
    } else if (item === 'torch') {
         setInventory(prev => {
            const existing = prev.find(i => i.type === 'torch');
            if(existing) return prev.map(i => i.type === 'torch' ? {...i, count: i.count + count} : i);
            return [...prev, { type: 'torch', count: count, color: '#f59e0b' }];
        });
    } else if (item === 'axe') {
         setInventory(prev => {
            const existing = prev.find(i => i.type === 'axe');
            if(existing) return prev.map(i => i.type === 'axe' ? {...i, count: i.count + count} : i);
            return [...prev, { type: 'axe', count: count, color: '#6b7280' }];
        });
    }
  };

  // Predefined spawn handlers (no AI API calls)
  /* Predefined character spawning logic */
  const spawnPredefinedCharacter = useCallback((
    prefab: CharacterPrefab,
    count: number,
    isEnemy: boolean = false,
    isGiant: boolean = false,
    isFriendly: boolean = false,
    isAquatic: boolean = false
  ) => {
    const range = BASE_SIZE + (expansionLevel * EXPANSION_STEP);
    const newChars: Character[] = [];
    const playerPos = playerPosRef.current || [0, 5, 0];
    
    // Helper: Random Valid Position Finder
    const findValidPosition = (center: [number, number, number], range: number): [number, number, number] | null => {
         const playerPos = playerPosRef.current || [0, 5, 0];
         let attempts = 0;
         while(attempts < 20) {
             const rx = center[0] + (Math.floor(Math.random() * range * 2) - range);
             const rz = center[2] + (Math.floor(Math.random() * range * 2) - range);
             
             // Distance check (min 5 blocks from player to avoid clipping)
             const dist = Math.sqrt((rx - playerPos[0])**2 + (rz - playerPos[2])**2);
             if (dist < 5) { attempts++; continue; }
             
             // Terrain check
             const inWater = blocks.some(b => Math.round(b.x) === Math.round(rx) && Math.round(b.z) === Math.round(rz) && b.type === 'water');
             
             if (isAquatic && !inWater) { attempts++; continue; }
             if (!isAquatic && inWater) { attempts++; continue; }
             
             // Find height
             let ry = 0;
             const highestBlock = blocks.filter(b => Math.round(b.x) === Math.round(rx) && Math.round(b.z) === Math.round(rz))
                                        .sort((a,b) => b.y - a.y)[0];
             if (highestBlock) ry = highestBlock.y + 1;
             else ry = 5; // Fallback
             
             return [rx, ry, rz];
         }
         return null;
    };

    for (let i = 0; i < count; i++) {
        let spawnPos: [number, number, number] | null = null;
        
        // Try Targeted Spawn first if available
        if (targetPosRef.current) {
            const t = targetPosRef.current;
            const dist = Math.sqrt((t[0] - playerPos[0])**2 + (t[2] - playerPos[2])**2);
            
            // Validate Target
            const inWater = blocks.some(b => Math.round(b.x) === Math.round(t[0]) && Math.round(b.z) === Math.round(t[2]) && b.type === 'water');
            const validTerrain = isAquatic ? inWater : !inWater;
            
            if (validTerrain) {
                // If terrain is valid, allow it even if close to cursor, but maybe not if <1 block
                // For targeted spawn we trust the cursor
                spawnPos = [t[0], t[1] + 1, t[2]];
            }
        }
        
        // Fallback to Random Range if Target Invalid or not present
        if (!spawnPos) {
             spawnPos = findValidPosition(playerPosRef.current || [0,0,0], 10);
        }
        
        if (spawnPos) {
            const [spawnX, spawnY, spawnZ] = spawnPos;
            
            // Add spawn marker
            setSpawnMarkers(prev => [...prev, { id: uuidv4(), x: spawnX, z: spawnZ, timestamp: Date.now() }]);
            
            newChars.push({
                id: uuidv4(),
                name: prefab.name,
                position: [spawnX, spawnY, spawnZ],
                rotation: Math.random() * Math.PI * 2,
                parts: prefab.parts,
                maxHp: isGiant ? 100 : prefab.maxHp,
                hp: isGiant ? 100 : prefab.maxHp,
                isEnemy,
                isGiant,
                isFriendly,
                isAquatic,
            });
        }
    }
    
    setCharacters(prev => [...prev, ...newChars]);
  }, [expansionLevel, blocks]);

  // Random entity spawn timer (scales with level and underworld)
  useEffect(() => {
    if (!gameStarted) return;
    
    const baseInterval = isUnderworld ? 8000 : 15000; // Faster in underworld
    const levelModifier = Math.max(0.5, 1 - (playerLevel * 0.05)); // Faster at higher levels
    const spawnInterval = baseInterval * levelModifier;
    
    const interval = setInterval(() => {
      const counts = getEntityCounts();
      
      // Random spawn type based on entity caps
      const roll = Math.random();
      if (roll < 0.5 && counts.enemies < ENTITY_CAPS.enemies) {
        // Spawn an enemy
        const enemyTypes = [enemyPrefabs.zombie, enemyPrefabs.skeleton, enemyPrefabs.spider, enemyPrefabs.sorcerer];
        const enemy = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        spawnPredefinedCharacter(enemy, 1, true, false, false, false);
      } else if (roll < 0.8 && counts.animals < ENTITY_CAPS.animals) {
        // Spawn an animal (not fish here - fish spawn in water separately)
        const landAnimals = [animalPrefabs.sheep, animalPrefabs.cow, animalPrefabs.pig, animalPrefabs.chicken];
        const animal = landAnimals[Math.floor(Math.random() * landAnimals.length)];
        spawnPredefinedCharacter(animal, 1, false, false, false, false);
      }
    }, spawnInterval);
    
    return () => clearInterval(interval);
  }, [gameStarted, isUnderworld, playerLevel, getEntityCounts, spawnPredefinedCharacter]);

  const spawnPredefinedStructure = useCallback((prefab: StructurePrefab, count: number) => {
    const range = BASE_SIZE + (expansionLevel * EXPANSION_STEP);
    const newBlocks: Block[] = [];
    
    for (let i = 0; i < count; i++) {
      let spawnX: number, spawnY: number, spawnZ: number;
      
      if (targetPosRef.current) {
        const scatter = count > 1 ? 8 : 0;
        spawnX = targetPosRef.current[0] + (scatter > 0 ? Math.floor(Math.random() * scatter * 2) - scatter : 0);
        spawnY = targetPosRef.current[1];
        spawnZ = targetPosRef.current[2] + (scatter > 0 ? Math.floor(Math.random() * scatter * 2) - scatter : 0);
      } else {
        spawnX = Math.floor(Math.random() * range * 2) - range;
        spawnZ = Math.floor(Math.random() * range * 2) - range;
        spawnY = 1; // Default ground level
      }
      
      // Add spawn marker
      setSpawnMarkers(prev => [...prev, { id: uuidv4(), x: spawnX, z: spawnZ, timestamp: Date.now() }]);
      
      // Add structure blocks offset to spawn position
      prefab.blocks.forEach(b => {
        newBlocks.push({
          id: uuidv4(),
          x: b.x + spawnX,
          y: b.y + spawnY,
          z: b.z + spawnZ,
          color: b.color,
          type: b.type,
        });
      });
    }
    
    // Avoid duplicates
    setBlocks(prev => {
      const keys = new Set(prev.map(b => `${b.x},${b.y},${b.z}`));
      return [...prev, ...newBlocks.filter(b => !keys.has(`${b.x},${b.y},${b.z}`))];
    });
  }, [expansionLevel]);

  // Spawn cave contents (treasure, boss, or merchant) at cave spawn points
  const spawnCaveContents = (caveSpawns: CaveSpawn[]) => {
    caveSpawns.forEach(spawn => {
      if (spawn.type === 'treasure') {
        // Create a treasure chest (gold blocks + give random items when approached)
        setBlocks(prev => [...prev, 
          { id: uuidv4(), x: spawn.x, y: spawn.y, z: spawn.z, color: '#fbbf24', type: 'gold' },
          { id: uuidv4(), x: spawn.x, y: spawn.y + 1, z: spawn.z, color: '#b45309', type: 'wood' },
        ]);
        // Add marker for treasure location
        setSpawnMarkers(prev => [...prev, { id: uuidv4(), x: spawn.x, z: spawn.z, timestamp: Date.now() }]);
      } else if (spawn.type === 'boss') {
        // Spawn a powerful enemy boss
        const bossChar: Character = {
          id: uuidv4(),
          name: 'Cave Guardian',
          position: [spawn.x, spawn.y, spawn.z],
          rotation: 0,
          parts: enemyPrefabs.sorcerer.parts, // Use sorcerer appearance
          maxHp: 150,
          hp: 150,
          isEnemy: true,
          isGiant: true,
          isFriendly: false,
        };
        setCharacters(prev => [...prev, bossChar]);
        setSpawnMarkers(prev => [...prev, { id: uuidv4(), x: spawn.x, z: spawn.z, timestamp: Date.now() }]);
      } else if (spawn.type === 'merchant') {
        // Spawn a merchant NPC
        const merchantChar: Character = {
          id: uuidv4(),
          name: 'Cave Merchant',
          position: [spawn.x, spawn.y, spawn.z],
          rotation: 0,
          parts: npcPrefabs.villager.parts,
          maxHp: 100,
          hp: 100,
          isEnemy: false,
          isFriendly: true,
        };
        setCharacters(prev => [...prev, merchantChar]);
        setSpawnMarkers(prev => [...prev, { id: uuidv4(), x: spawn.x, z: spawn.z, timestamp: Date.now() }]);
      }
    });
  };

  const handleReset = useCallback(() => {
    const result = generateInitialTerrain();
    setBlocks(result.blocks); 
    setCharacters([]); 
    setProjectiles([]);
    setSpawnMarkers([]);
    setExpansionLevel(0);
    setJobs([]);
    setInventory([]);
    setPlayerHp(100);
    setPlayerHunger(100);
    setPlayerXp(0);
    setPlayerLevel(1);
    setPlayerGold(0);  // Reset gold
    setPortalActive(false);  // Reset portal
    setPortalPosition(null);
    setIsUnderworld(false);
    setRespawnTrigger(prev => prev + 1);
    setIsRaining(false);
    setCurrentQuest(null);  // Reset quest
    setQuestMessage(null);
    setLevelUpMessage(null);  // Clear any level up message
    generateRandomQuest();
    
    // Spawn cave contents after a delay to let state settle
    setTimeout(() => spawnCaveContents(result.caveSpawns), 100);
  }, []);

  // Gold gain handler
  const handleGoldGain = useCallback((amount: number) => {
    setPlayerGold(prev => prev + amount);
  }, []);

  // Buy item from shop
  const handleBuyItem = useCallback((type: string, cost: number): boolean => {
    if (playerGold < cost) return false;
    
    setPlayerGold(prev => prev - cost);
    
    // Add item to inventory
    if (type === 'weapon') {
      setInventory(prev => {
        const existing = prev.find(i => i.type === 'weapon');
        if (existing) return prev.map(i => i.type === 'weapon' ? {...i, count: i.count + 1} : i);
        return [...prev, { type: 'weapon', count: 1, color: '#06b6d4' }];
      });
    } else if (type === 'axe') {
      setInventory(prev => {
        const existing = prev.find(i => i.type === 'axe');
        if (existing) return prev.map(i => i.type === 'axe' ? {...i, count: i.count + 1} : i);
        return [...prev, { type: 'axe', count: 1, color: '#6b7280' }];
      });
    } else if (type === 'bow') {
      setInventory(prev => {
        const existing = prev.find(i => i.type === 'bow');
        if (existing) return prev;
        return [...prev, { type: 'bow', count: 1, color: '#8b4513' }];
      });
    } else if (type === 'arrows') {
      setInventory(prev => {
        const existing = prev.find(i => i.type === 'arrows');
        if (existing) return prev.map(i => i.type === 'arrows' ? {...i, count: i.count + 10} : i);
        return [...prev, { type: 'arrows', count: 10, color: '#d4a574' }];
      });
    } else if (type === 'shield') {
      setInventory(prev => {
        const existing = prev.find(i => i.type === 'shield');
        if (existing) return prev.map(i => i.type === 'shield' ? {...i, count: i.count + 1} : i);
        return [...prev, { type: 'shield', count: 1, color: '#94a3b8' }];
      });
    } else if (type === 'torch') {
      setInventory(prev => {
        const existing = prev.find(i => i.type === 'torch');
        if (existing) return prev.map(i => i.type === 'torch' ? {...i, count: i.count + 1} : i);
        return [...prev, { type: 'torch', count: 1, color: '#f59e0b' }];
      });
    } else if (type === 'apple') {
      setInventory(prev => {
        const existing = prev.find(i => i.type === 'apple');
        if (existing) return prev.map(i => i.type === 'apple' ? {...i, count: i.count + 1} : i);
        return [...prev, { type: 'apple', count: 1, color: '#ef4444' }];
      });
    }
    
    return true;
  }, [playerGold]);

  // Chat / NPC Interaction
  const handleNpcInteract = (char: Character) => {
      // Check if this is a merchant
      const isMerchant = char.name.toLowerCase().includes('merchant') || 
                         char.name.toLowerCase().includes('trader') ||
                         char.name.toLowerCase().includes('shopkeeper');
      
      if (isMerchant) {
        setActiveMerchant(char);
        setShopOpen(true);
        if (document.pointerLockElement) document.exitPointerLock();
      } else {
        setActiveDialogNpcId(char.id);
        if (document.pointerLockElement) document.exitPointerLock();
      }
  };

  const handleSendMessage = async (text: string) => {
      if (!activeDialogNpcId) return;
      
      const npc = characters.find(c => c.id === activeDialogNpcId);
      if (!npc) return;

      const newMsg: ChatMessage = { sender: 'Player', text };
      const currentHistory = chatHistory[activeDialogNpcId] || [];
      const updatedHistory = [...currentHistory, newMsg];
      
      setChatHistory(prev => ({ ...prev, [activeDialogNpcId]: updatedHistory }));

      // AI Response
      const npcResponse = await generateDialogue(npc.name, text, updatedHistory);
      setChatHistory(prev => ({ 
          ...prev, 
          [activeDialogNpcId]: [...updatedHistory, { sender: 'NPC', text: npcResponse }] 
      }));
  };

  // Debug Overlay Ref
  const debugOverlayRef = useRef<DebugOverlayRef>(null);
  
  const handleDebugUpdate = useCallback((info: any) => {
      debugOverlayRef.current?.update(info);
  }, []);

  return (
    <div className="w-full h-screen relative overflow-hidden">
      {!gameStarted && <StartScreen onStart={() => setGameStarted(true)} />}
      
      <VoxelWorld 
        blocks={blocks} 
        setBlocks={setBlocks}
        characters={characters} 
        setCharacters={setCharacters}
        projectiles={projectiles}
        setProjectiles={setProjectiles}
        onDayChange={setIsDay}
        isDay={isDay}
        isRaining={isRaining}
        playerHp={playerHp}
        setPlayerHp={setPlayerHp}
        playerHunger={playerHunger}
        setPlayerHunger={setPlayerHunger}
        inventory={inventory}
        setInventory={setInventory}
        activeSlot={activeSlot}
        respawnTrigger={respawnTrigger}
        viewMode={viewMode}
        setViewMode={setViewMode}
        targetPosRef={targetPosRef}
        resetViewTrigger={resetViewTrigger}
        playerPosRef={playerPosRef}
        onCharacterInteract={handleNpcInteract}
        onQuestUpdate={handleQuestUpdate}
        playerStats={getPlayerStats()}
        onXpGain={handleXpGain}
        onGoldGain={handleGoldGain}
        onDebugUpdate={handleDebugUpdate}
      />
      
      {/* Minimap overlays on top */}
      {gameStarted && (
        <>
          <Minimap 
            playerPosRef={playerPosRef}
            characters={characters}
            blocks={blocks}
            spawnMarkers={spawnMarkers}
          />

          <UIOverlay 
            onGenerate={addJob} 
            onSpawnPredefinedCharacter={spawnPredefinedCharacter}
            onSpawnPredefinedStructure={spawnPredefinedStructure}
            onReset={handleReset}
            onExpand={handleExpand}
            onShrink={handleShrink}
            onGiveItem={handleGiveItem}
            onRespawn={handleRespawn}
            onResetView={handleResetView}
            jobs={jobs}
            playerHp={playerHp}
            playerHunger={playerHunger}
            inventory={inventory}
            activeSlot={activeSlot}
            setActiveSlot={setActiveSlot}
            onCraft={handleCraft}
            expansionLevel={expansionLevel}
            viewMode={viewMode}
            quest={currentQuest}
            questMessage={questMessage}
            playerXp={playerXp}
            playerLevel={playerLevel}
            xpThresholds={XP_THRESHOLDS}
            levelUpMessage={levelUpMessage}
            playerGold={playerGold}
            hasApiKey={hasApiKey}
          />
          
          <DebugOverlay ref={debugOverlayRef} />

          {activeDialogNpcId && (
              <ChatWindow 
                npcName={characters.find(c => c.id === activeDialogNpcId)?.name || 'NPC'}
                history={chatHistory[activeDialogNpcId] || []}
                onSendMessage={handleSendMessage}
                onClose={() => { setActiveDialogNpcId(null); setViewMode('FP'); }}
                stopProp={(e) => e.stopPropagation()}
              />
          )}
          
          {shopOpen && activeMerchant && (
              <ShopPanel
                playerGold={playerGold}
                onBuyItem={handleBuyItem}
                onClose={() => { setShopOpen(false); setActiveMerchant(null); setViewMode('FP'); }}
                stopProp={(e) => e.stopPropagation()}
                merchantName={activeMerchant.name}
              />
          )}
        </>
      )}
    </div>
  );
}