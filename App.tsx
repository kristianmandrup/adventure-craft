import { useRef, useEffect, useState } from 'react';
import { VoxelWorld } from './components/VoxelWorld';
import { UIOverlay } from './components/UIOverlay';
import { Minimap } from './components/Minimap';
import { StartScreen } from './components/StartScreen';
import { ChatWindow } from './components/ui/ChatWindow';
import { ShopPanel } from './components/ui/ShopPanel';
import { DebugOverlay, DebugOverlayRef } from './components/ui/DebugOverlay';
import { GameOverScreen } from './components/GameOverScreen';
import { NotificationToast } from './components/ui/NotificationToast';
import { BloodOverlay } from './components/ui/BloodOverlay'; // Added this import

// ... (existing imports need to be preserved if I'm replacing lines 1-144, that's too much, I should use multi-replace or smaller chunk)
// Wait, I need to add state `gameOver` and `handleRestart`. I can't just replace the `return` because `gameOver` state needs to be defined in function body.
// I will use `multi_replace_file_content`.

import { generateInitialTerrain } from './utils/procedural';
import { audioManager } from './utils/audio';

// Custom Hooks
import { useWorldState } from './hooks/useWorldState';
import { usePlayerState } from './hooks/usePlayerState';
import { useEntityState } from './hooks/useEntityState';
import { useGameState } from './hooks/useGameState';
import { useSpawner } from './hooks/useSpawner';
import { useJobProcessor } from './hooks/useJobProcessor';
import { useAmbiance } from './hooks/useAmbiance';

export default function App() {
  // 1. Player State
  const { 
    playerHp, setPlayerHp, playerHunger, setPlayerHunger, inventory, setInventory,
    activeSlot, setActiveSlot, respawnTrigger, onRespawn, resetViewTrigger, onResetView,
    viewMode, setViewMode, playerPosRef, targetPosRef, playerXp, playerLevel, playerGold,
    levelUpMessage, onXpGain, onGoldGain, playerStats, XP_THRESHOLDS, craftItem 
  } = usePlayerState(true);

  // 2. Game State
  const {
    gameStarted, setGameStarted, jobs, setJobs, currentQuest, questMessage,
    activeDialogNpcId, setActiveDialogNpcId, chatHistory, shopOpen, setShopOpen,
    activeMerchant, setActiveMerchant, notification, setNotification, hasApiKey, 
    generateRandomQuest, onQuestUpdate
  } = useGameState(onXpGain);

  // 3. World State
  const {
    blocks, setBlocks, isDay, setIsDay, isRaining, expansionLevel,
    portalActive, portalPosition, isUnderworld,
    handleExpand, handleShrink, BASE_SIZE, EXPANSION_STEP
  } = useWorldState(gameStarted);

  // 4. Entity State
  const {
    characters, setCharacters, projectiles, setProjectiles, spawnMarkers, setSpawnMarkers,
    droppedItems, setDroppedItems, getEntityCounts, spawnDroppedItem
  } = useEntityState(gameStarted, isUnderworld);

  // 5. Spawning Logic
  const { spawnPredefinedCharacter, spawnCaveContents } = useSpawner(
    blocks, targetPosRef, playerPosRef, setCharacters, setBlocks, setSpawnMarkers, 
    BASE_SIZE, expansionLevel, EXPANSION_STEP
  );

  // 6. Job Processing (AI Generation)
  const { addJob } = useJobProcessor({
      setJobs, targetPosRef, BASE_SIZE, expansionLevel, EXPANSION_STEP,
      blocks, setBlocks, setCharacters, setInventory, setSpawnMarkers
  });

  // 7. Ambiance
  useAmbiance(playerPosRef, blocks);


  const debugRef = useRef<DebugOverlayRef>(null);

  // Initial Load
  useEffect(() => {
    // Moved audio init to StartScreen interaction to comply with autoplay policy
    // const init = async () => { await audioManager.init(); };
    // init();

    const result = generateInitialTerrain();
    setBlocks(result.blocks);
    spawnCaveContents(result.caveSpawns);
    generateRandomQuest();
  }, []);

  // Entity Spawning Loop
  useEffect(() => {
     if(!gameStarted) return;
     // Note: complex spawning interval logic moved to hook or kept here?
     // For now, let's keep the simple random loop here or delegating to spawner
     // Actually useSpawner didn't export the loop. Let's add the loop here using the helper.
     
     const interval = setInterval(() => {
        const counts = getEntityCounts();
        
        // Random spawn logic
        if (Math.random() < 0.5 && counts.enemies < 20) {
            import('./utils/prefabs/characters').then(m => {
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
         import('./utils/prefabs/characters').then(m => {
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
         import('./utils/prefabs/characters').then(m => {
             spawnPredefinedCharacter(m.enemyPrefabs.giant, 1, true, true);
         });
     }, timeout);
     return () => clearInterval(interval);
   }, [gameStarted, spawnPredefinedCharacter]);
  
  // Handler for giving items (e.g. drops or debug)
  const handleGiveItem = (item: string, count: number) => {
      if(!playerPosRef.current) return;
      spawnDroppedItem(item, count, playerPosRef.current);
  };

  // Helper to show notifications
  const showNotification = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info', subMessage?: string) => {
      // Map to supported types (INFO, BOSS, MERCHANT)
      // For now, map everything to INFO as the underlying type is strict
      setNotification({ message, type: 'INFO', subMessage, duration: 2000 });
  };
  const [gameOver, setGameOver] = useState(false);
  
  useEffect(() => {
      if (playerHp <= 0 && gameStarted) {
          setGameOver(true);
      }
  }, [playerHp, gameStarted]);

  const handleRestart = () => {
      setGameOver(false);
      setBlocks([]); 
      setCharacters([]); 
      setProjectiles([]);
      setDroppedItems([]);
      setInventory([]);
      setPlayerHp(100);
      setPlayerHunger(100);
      
      const result = generateInitialTerrain();
      setBlocks(result.blocks);
      spawnCaveContents(result.caveSpawns);
      
      // Re-init other states if needed
      setGameStarted(true); 
  };
  
  // Press N to Game Over
  useEffect(() => {
      const handleKey = (e: KeyboardEvent) => {
          if (e.key.toLowerCase() === 'n' && gameStarted) {
              setGameOver(true);
          }
      };
      window.addEventListener('keydown', handleKey);
      return () => window.removeEventListener('keydown', handleKey);
  }, [gameStarted]);

  return (
    <div className="w-full h-screen bg-black">
       {gameOver && <GameOverScreen onRestart={handleRestart} />}
       {!gameStarted && !gameOver && <StartScreen onStart={() => { setGameStarted(true); audioManager.init(); }} />}
       {gameStarted && <BloodOverlay hp={playerHp} />}
      
      {gameStarted && (
        <>
             <VoxelWorld 
            blocks={blocks} setBlocks={setBlocks}
            characters={characters} setCharacters={setCharacters}
            projectiles={projectiles} setProjectiles={setProjectiles}
            droppedItems={droppedItems} setDroppedItems={setDroppedItems}
            inventory={inventory} setInventory={setInventory}
            activeSlot={activeSlot}
            viewMode={viewMode} setViewMode={setViewMode}
            playerHp={playerHp} setPlayerHp={setPlayerHp}
            playerHunger={playerHunger} setPlayerHunger={setPlayerHunger}
            isDay={isDay} isRaining={isRaining}
            onDayChange={setIsDay}
            respawnTrigger={respawnTrigger}
            resetViewTrigger={resetViewTrigger}
            playerPosRef={playerPosRef}
            targetPosRef={targetPosRef}
            onCharacterInteract={(char) => {
               if(char.isFriendly) {
                   setActiveDialogNpcId(char.id);
                   if(char.name.includes('Merchant')) {
                       setActiveMerchant(char);
                       setShopOpen(true);
                   }
               }
            }}
            onQuestUpdate={onQuestUpdate}
            playerStats={playerStats}
            onXpGain={onXpGain}
            onGoldGain={onGoldGain}
            onDebugUpdate={(info) => { if(debugRef.current) debugRef.current.update(info); }}
            onNotification={showNotification}
           />

           <UIOverlay 
             onGenerate={addJob}
             onSpawnPredefinedCharacter={spawnPredefinedCharacter}
             onSpawnPredefinedStructure={() => {}} // Placeholder or impl
             onReset={() => { 
                setBlocks([]); 
                setCharacters([]); 
                setProjectiles([]);
                setDroppedItems([]);
                const result = generateInitialTerrain();
                setBlocks(result.blocks);
                spawnCaveContents(result.caveSpawns);
                setGameStarted(true); // Ensure game stays started
                audioManager.init(); // Re-init audio just in case
             }}
             onExpand={handleExpand}
             onShrink={handleShrink}
             onGiveItem={handleGiveItem}
             onRespawn={onRespawn}
             onResetView={onResetView}
             jobs={jobs}
             playerHp={playerHp}
             playerHunger={playerHunger}
             inventory={inventory}
             activeSlot={activeSlot}
             setActiveSlot={setActiveSlot}
             onCraft={craftItem}
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

           <Minimap 
             blocks={blocks}
             characters={characters}
             playerPosRef={playerPosRef}
             spawnMarkers={spawnMarkers}
             portalPosition={portalPosition}
           />
           
           <DebugOverlay ref={debugRef} />
           
           {notification && (
              <NotificationToast 
                message={notification.message}
                subMessage={notification.subMessage}
                type={notification.type}
                duration={notification.duration}
                onClose={() => setNotification(null)}
              />
           )}

           {activeDialogNpcId && !shopOpen && (
              <ChatWindow 
                 npcId={activeDialogNpcId} 
                 npcName={characters.find(c => c.id === activeDialogNpcId)?.name || 'NPC'}
                 history={chatHistory[activeDialogNpcId] || []}
                 onClose={() => setActiveDialogNpcId(null)}
                 onSendMessage={async (text) => {
                     // Chat logic would be here
                 }}
              />
           )}
           
           {shopOpen && activeMerchant && (
             <ShopPanel 
                items={[
                    { id: '1', name: 'Sword', type: 'weapon', price: 50, color: '#06b6d4' },
                    { id: '2', name: 'Apple', type: 'apple', price: 10, color: '#ef4444' }
                ]}
                playerGold={playerGold}
                onBuy={(item) => {
                    if(playerGold >= item.price) {
                        onGoldGain(-item.price);
                        handleGiveItem(item.type, 1);
                    }
                }}
                onClose={() => setShopOpen(false)}
             />
           )}
        </>
      )}
    </div>
  );
}