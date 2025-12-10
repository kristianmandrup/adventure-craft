import React, { useState, useCallback, useEffect, useRef } from 'react';
import { VoxelWorld } from './components/VoxelWorld';
import { UIOverlay } from './components/UIOverlay';
import { Minimap } from './components/Minimap';
import { StartScreen } from './components/StartScreen';
import { ChatWindow } from './components/ui/ChatWindow';
import { generateStructure, generateCharacter, generateDialogue, generateItem } from './services/geminiService';
import { Block, Character, GenerationMode, Job, InventoryItem, Projectile, ChatMessage, Quest, SpawnMarker } from './types';
import { v4 as uuidv4 } from 'uuid';
import { generateInitialTerrain, generateExpansion } from './utils/procedural';

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

  // Quest State
  const [currentQuest, setCurrentQuest] = useState<Quest | null>(null);
  const [questMessage, setQuestMessage] = useState<string | null>(null);

  // Chat State
  const [activeDialogNpcId, setActiveDialogNpcId] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<Record<string, ChatMessage[]>>({});

  // Position Ref (Shared with Minimap to avoid re-renders)
  const playerPosRef = useRef<[number, number, number] | null>(null);

  // Target Reference for Spawning (populated by VoxelWorld)
  const targetPosRef = useRef<[number, number, number] | null>(null);

  // Expansion State
  const [expansionLevel, setExpansionLevel] = useState(0);
  const BASE_SIZE = 20;
  const EXPANSION_STEP = 20;

  // Load initial terrain
  useEffect(() => {
    const terrain = generateInitialTerrain();
    setBlocks(terrain);
    generateRandomQuest();
  }, []);

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
    if (expansionLevel >= 5) return;
    
    const currentSize = BASE_SIZE + (expansionLevel * EXPANSION_STEP);
    const newBlocks = generateExpansion(currentSize, EXPANSION_STEP);
    
    setBlocks(prev => [...prev, ...newBlocks]);
    setExpansionLevel(prev => prev + 1);
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
    }
  };

  const handleReset = useCallback(() => {
    setBlocks(generateInitialTerrain()); 
    setCharacters([]); 
    setProjectiles([]);
    setSpawnMarkers([]);
    setExpansionLevel(0);
    setJobs([]);
    setInventory([]);
    setPlayerHp(100);
    setPlayerHunger(100);
    setRespawnTrigger(prev => prev + 1);
    setIsRaining(false);
    generateRandomQuest();
  }, []);

  // Chat
  const handleNpcInteract = (char: Character) => {
      setActiveDialogNpcId(char.id);
      if (document.pointerLockElement) document.exitPointerLock();
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
            onReset={handleReset}
            onExpand={handleExpand}
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
          />

          {activeDialogNpcId && (
              <ChatWindow 
                npcName={characters.find(c => c.id === activeDialogNpcId)?.name || 'NPC'}
                history={chatHistory[activeDialogNpcId] || []}
                onSendMessage={handleSendMessage}
                onClose={() => { setActiveDialogNpcId(null); setViewMode('FP'); }}
                stopProp={(e) => e.stopPropagation()}
              />
          )}
        </>
      )}
    </div>
  );
}