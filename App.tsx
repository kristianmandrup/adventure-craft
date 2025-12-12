import React, { useRef, useMemo } from 'react';
import { StartScreen } from './components/StartScreen';
import { GameOverScreen } from './components/GameOverScreen';
import { GameLayout } from './components/GameLayout'; 

// Context Providers
import { PlayerProvider } from './contexts/PlayerContext';
import { WorldProvider } from './contexts/WorldContext';
import { UIProvider } from './contexts/UIContext';

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
import { useGameOver } from './hooks/useGameOver'; 
import { useGameLifecycle } from './hooks/useGameLifecycle';
import { useFirebaseAuth } from './hooks/useFirebaseAuth';
import { VersionBadge } from './components/ui/VersionBadge';

import { DebugOverlayRef } from './components/ui/DebugOverlay';

export default function App() {
  // 0. Firebase Auth
  const { userId, isLoading: isAuthLoading } = useFirebaseAuth();

  // 1. Player State
  const playerState = usePlayerState(true);
  const { 
    playerHp, setPlayerHp, playerHunger, setPlayerHunger, inventory, setInventory,
    playerPosRef, targetPosRef, playerXp, playerLevel, playerGold,
    onXpGain, onGoldGain, equipment, setEquipment
  } = playerState;

  // 2. Game Mode
  const [gameMode, setGameMode] = React.useState<'CREATIVE' | 'ADVENTURE'>('CREATIVE');
  const [difficultyMode, setDifficultyMode] = React.useState<import('./types').GameMode>('NORMAL');

  // 3. Game UI State
  const gameState = useGameState(onXpGain);
  const {
    gameStarted, setGameStarted, jobs, setJobs, currentQuest, questMessage,
    activeDialogNpcId, setActiveDialogNpcId, chatHistory, shopOpen, setShopOpen,
    activeMerchant, setActiveMerchant, notification, setNotification, hasApiKey, 
    generateRandomQuest, onQuestUpdate
  } = gameState;

  // 4. World State
  const worldState = useWorldState(gameStarted);
  const {
    blocks, setBlocks, isDay, setIsDay, isRaining, expansionLevel,
    portalActive, portalPosition, isUnderworld,  setIsUnderworld, portalColor,
    handleExpand, handleShrink, BASE_SIZE, EXPANSION_STEP, enterUnderworld
  } = worldState;

  // 5. Entity State
  const entityState = useEntityState(gameStarted, isUnderworld);
  const {
    characters, setCharacters, projectiles, setProjectiles, spawnMarkers, setSpawnMarkers,
    droppedItems, setDroppedItems, getEntityCounts, spawnDroppedItem
  } = entityState;

  // 6. Spawning & AI
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
      getEntityCounts, spawnPredefinedCharacter, characters,
      difficultyMode 
  });

  useAmbiance(playerPosRef, blocks);

  // 7. Game Lifecycle (now with cloud saves)
  const { handleNewGame, handleContinue, saveSource, isLoadingContinue } = useGameLifecycle({
      setBlocks, setCharacters, setProjectiles, setDroppedItems, setInventory,
      setPlayerHp, setPlayerHunger, setGameMode, setGameStarted, setEquipment,
      playerPosRef, spawnCaveContents, spawnPredefinedCharacter, generateRandomQuest,
      userId,
      setDifficultyMode, setIsUnderworld, onXpGain
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
  
  const handleGiveItem = (item: string, count: number) => {
      if(!playerPosRef.current) return;
      spawnDroppedItem(item, count, playerPosRef.current);
  };

  const debugRef = useRef<DebugOverlayRef>(null);

  // 8. Core Loop (now with cloud save sync)
  const stateToSave = useMemo(() => ({
        playerHp, playerHunger, playerXp, playerLevel, playerGold,
        inventory, blocks, characters, droppedItems,
        currentQuest, questMessage, gameStarted, isDay, expansionLevel, gameMode, equipment,
        difficultyMode
  }), [playerHp, playerHunger, playerXp, playerLevel, playerGold, inventory, blocks, characters, droppedItems, currentQuest, questMessage, gameStarted, isDay, expansionLevel, gameMode, equipment, difficultyMode]);

  useGameLoop({
      gameStarted, playerHp, playerPosRef, stateToSave, getEntityCounts, spawnPredefinedCharacter,
      userId, playerLevel, playerXp, gameMode
  });

  React.useEffect(() => {
    if (gameMode !== 'ADVENTURE' || !gameStarted) return;
    const targetExp = playerLevel >= 3 ? 3 : (playerLevel >= 2 ? 2 : 1);
    if (expansionLevel < targetExp) handleExpand();
  }, [gameMode, gameStarted, playerLevel, expansionLevel, handleExpand]);

  // Context Values
  const playerContextValue = useMemo(() => ({
    ...playerState,
  }), [playerState]);

  const worldContextValue = useMemo(() => ({
    blocks, setBlocks, characters, setCharacters, projectiles, setProjectiles, 
    droppedItems, setDroppedItems, spawnMarkers, isDay, setIsDay, isRaining, 
    expansionLevel, handleExpand, handleShrink, portalActive, portalPosition, portalColor,
    isUnderworld, enterUnderworld, difficultyMode
  }), [blocks, characters, projectiles, droppedItems, spawnMarkers, isDay, isRaining, expansionLevel, portalActive, portalPosition, portalColor, isUnderworld, handleExpand, handleShrink, enterUnderworld, setBlocks, setCharacters, setProjectiles, setDroppedItems, setIsDay, difficultyMode]);
  
  const uiContextValue = useMemo(() => ({
    jobs, currentQuest, questMessage, onQuestUpdate, notification, setNotification,
    showNotification, activeDialogNpcId, setActiveDialogNpcId, chatHistory, 
    shopOpen, setShopOpen, activeMerchant, setActiveMerchant, hasApiKey, gameMode
  }), [jobs, currentQuest, questMessage, onQuestUpdate, notification, setNotification, activeDialogNpcId, setActiveDialogNpcId, chatHistory, shopOpen, setShopOpen, activeMerchant, setActiveMerchant, hasApiKey, gameMode, showNotification]);


  return (
    <div className="w-full h-screen bg-black">
       {gameOver && <GameOverScreen onRestart={handleRestart} score={playerXp} />}
       <VersionBadge />
       {!gameStarted && !gameOver && (
           <StartScreen 
             onStart={(mode, diff) => {
                 setDifficultyMode(diff);
                 handleNewGame(mode, diff);
             }}
             onContinue={handleContinue}
             userId={userId}
             isAuthLoading={isAuthLoading}
             isLoadingContinue={isLoadingContinue}
           />
       )}
       
       {gameStarted && (
          <PlayerProvider value={playerContextValue}>
            <WorldProvider value={worldContextValue}>
              <UIProvider value={uiContextValue}>
                <GameLayout 
                    debugRef={debugRef}
                    handleGiveItem={handleGiveItem}
                    addJob={addJob}
                    spawnPredefinedCharacter={spawnPredefinedCharacter}
                    setGameStarted={setGameStarted}
                    spawnCaveContents={spawnCaveContents}
                />
              </UIProvider>
            </WorldProvider>
          </PlayerProvider>
       )}
    </div>
  );
}