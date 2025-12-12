import React, { useRef, useMemo } from 'react';
import { StartScreen } from './components/StartScreen';
import { GameOverScreen } from './components/GameOverScreen';
import { GameLayout } from './components/GameLayout'; 
// Custom Hooks
import { useWorldState } from './hooks/useWorldState';
import { usePlayerState } from './hooks/usePlayerState';
import { useEntityState } from './hooks/useEntityState';
import { useGameState } from './hooks/useGameState';
import { useSpawner } from './hooks/useSpawner';
import { useJobProcessor } from './hooks/useJobProcessor';
import { useAmbiance } from './hooks/useAmbiance';
import { useSpawnDirector } from './hooks/useSpawnDirector';
import { useGameLoop } from './hooks/useGameLoop'; 
import { useGameOver } from './hooks/useGameOver'; // New Hook
import { useGameLifecycle } from './hooks/useGameLifecycle'; // New Hook

import { DebugOverlayRef } from './components/ui/DebugOverlay';

export default function App() {
  // 1. Player State
  const { 
    playerHp, setPlayerHp, playerHunger, setPlayerHunger, inventory, setInventory,
    activeSlot, setActiveSlot, respawnTrigger, onRespawn, resetViewTrigger, onResetView,
    viewMode, setViewMode, playerPosRef, targetPosRef, playerXp, playerLevel, playerGold,
    levelUpMessage, onXpGain, onGoldGain, playerStats, XP_THRESHOLDS, craftItem,
    equipment, setEquipment, equipFromInventory, unequipItem, eatItem
  } = usePlayerState(true);

  // 2. Game State (Mode, Jobs, Quest, etc)
  const [gameMode, setGameMode] = React.useState<'CREATIVE' | 'ADVENTURE'>('CREATIVE'); // Ensure React is imported or use useState from import

  const {
    gameStarted, setGameStarted, jobs, setJobs, currentQuest, questMessage,
    activeDialogNpcId, setActiveDialogNpcId, chatHistory, shopOpen, setShopOpen,
    activeMerchant, setActiveMerchant, notification, setNotification, hasApiKey, 
    generateRandomQuest, onQuestUpdate
  } = useGameState(onXpGain);

  // 3. World State
  const {
    blocks, setBlocks, isDay, setIsDay, isRaining, expansionLevel,
    portalActive, portalPosition, isUnderworld, portalColor,
    handleExpand, handleShrink, BASE_SIZE, EXPANSION_STEP, enterUnderworld
  } = useWorldState(gameStarted);

  // 4. Entity State
  const {
    characters, setCharacters, projectiles, setProjectiles, spawnMarkers, setSpawnMarkers,
    droppedItems, setDroppedItems, getEntityCounts, spawnDroppedItem
  } = useEntityState(gameStarted, isUnderworld);

  // 5. Spawning & AI Support
  const { spawnPredefinedCharacter, spawnCaveContents } = useSpawner(
    blocks, targetPosRef, playerPosRef, setCharacters, setBlocks, setSpawnMarkers, 
    BASE_SIZE, expansionLevel, EXPANSION_STEP
  );

  const { addJob } = useJobProcessor({
      setJobs, targetPosRef, BASE_SIZE, expansionLevel, EXPANSION_STEP,
      blocks, setBlocks, setCharacters, setInventory, setSpawnMarkers
  });

  useSpawnDirector({
      gameMode, gameStarted, isDay, isRaining, playerLevel,
      getEntityCounts, spawnPredefinedCharacter, characters
  });

  useAmbiance(playerPosRef, blocks);

  // 6. Game Lifecycle (New Game / Continue / Restart)
  const { handleNewGame, handleContinue } = useGameLifecycle({
      setBlocks, setCharacters, setProjectiles, setDroppedItems, setInventory,
      setPlayerHp, setPlayerHunger, setGameMode, setGameStarted, setEquipment,
      playerPosRef, spawnCaveContents, spawnPredefinedCharacter, generateRandomQuest
  });

  const { gameOver, setGameOver } = useGameOver(playerHp, gameStarted);

  const handleRestart = () => {
      setGameOver(false);
      handleNewGame(); 
      window.location.reload(); 
  };

  const showNotification = (message: string, type: import('./types').NotificationType = 'INFO', subMessage?: string) => {
      setNotification({ message, type, subMessage, duration: 2000 });
  };
  
  const handleGiveItem = (item: string, count: number) => { // Simple enough to keep? Yes.
      if(!playerPosRef.current) return;
      spawnDroppedItem(item, count, playerPosRef.current);
  };

  const debugRef = useRef<DebugOverlayRef>(null);

  // 7. Core Loop (AutoSave / Spawners)
  const stateToSave = useMemo(() => ({
        playerHp, playerHunger, playerXp, playerLevel, playerGold,
        inventory, blocks, characters, droppedItems,
        currentQuest, questMessage, gameStarted, isDay, expansionLevel, gameMode, equipment
  }), [playerHp, playerHunger, playerXp, playerLevel, playerGold, inventory, blocks, characters, droppedItems, currentQuest, questMessage, gameStarted, isDay, expansionLevel, gameMode, equipment]);

  useGameLoop({
      gameStarted, playerHp, playerPosRef, stateToSave, getEntityCounts, spawnPredefinedCharacter
  });

  // Adventure Mode Auto-Expand Effect (kept here as it ties mode+world)
  React.useEffect(() => {
    if (gameMode !== 'ADVENTURE' || !gameStarted) return;
    const targetExp = playerLevel >= 3 ? 3 : (playerLevel >= 2 ? 2 : 1);
    if (expansionLevel < targetExp) handleExpand();
}, [gameMode, gameStarted, playerLevel, expansionLevel, handleExpand]);


  return (
    <div className="w-full h-screen bg-black">
       {gameOver && <GameOverScreen onRestart={handleRestart} score={playerXp} />}
       {!gameStarted && !gameOver && (
           <StartScreen 
             onStart={handleNewGame} 
             onContinue={handleContinue}
           />
       )}
       
       {gameStarted && (
            <GameLayout 
                blocks={blocks} setBlocks={setBlocks}
                characters={characters} setCharacters={setCharacters}
                projectiles={projectiles} setProjectiles={setProjectiles}
                droppedItems={droppedItems} setDroppedItems={setDroppedItems}
                inventory={inventory} setInventory={setInventory}
                activeSlot={activeSlot} setActiveSlot={setActiveSlot}
                viewMode={viewMode} setViewMode={setViewMode}
                playerPosRef={playerPosRef} targetPosRef={targetPosRef}
                playerHp={playerHp} setPlayerHp={setPlayerHp}
                playerHunger={playerHunger} setPlayerHunger={setPlayerHunger}
                isDay={isDay} setIsDay={setIsDay} isRaining={isRaining}
                portalActive={portalActive} portalPosition={portalPosition} portalColor={portalColor}
                isUnderworld={isUnderworld} enterUnderworld={enterUnderworld}
                respawnTrigger={respawnTrigger} onRespawn={onRespawn}
                resetViewTrigger={resetViewTrigger} onResetView={onResetView}
                handleGiveItem={handleGiveItem} showNotification={showNotification}
                playerStats={playerStats} playerXp={playerXp} playerLevel={playerLevel} playerGold={playerGold}
                onXpGain={onXpGain} onGoldGain={onGoldGain}
                currentQuest={currentQuest} questMessage={questMessage} onQuestUpdate={onQuestUpdate}
                debugRef={debugRef}
                equipment={equipment} onEquip={equipFromInventory} onUnequip={unequipItem} eatItem={eatItem}
                jobs={jobs} addJob={addJob} spawnPredefinedCharacter={spawnPredefinedCharacter}
                expansionLevel={expansionLevel} handleExpand={handleExpand} handleShrink={handleShrink}
                gameMode={gameMode} setGameStarted={setGameStarted}
                spawnCaveContents={spawnCaveContents} spawnMarkers={spawnMarkers}
                XP_THRESHOLDS={XP_THRESHOLDS} levelUpMessage={levelUpMessage}
                hasApiKey={hasApiKey} craftItem={craftItem}
                notification={notification} setNotification={setNotification}
                activeDialogNpcId={activeDialogNpcId} setActiveDialogNpcId={setActiveDialogNpcId}
                chatHistory={chatHistory} 
                shopOpen={shopOpen} setShopOpen={setShopOpen}
                activeMerchant={activeMerchant} setActiveMerchant={setActiveMerchant}
            />
       )}
    </div>
  );
}