import React from 'react';
import { VoxelWorld } from './VoxelWorld';
import { UIOverlay } from './UIOverlay';
import { Minimap } from './Minimap';
import { DebugOverlay, DebugOverlayRef } from './ui/DebugOverlay';
import { NotificationToast } from './ui/NotificationToast';
import { ChatWindow } from './ui/ChatWindow';
import { ShopPanel } from './ui/ShopPanel';
import { BloodOverlay } from './ui/BloodOverlay';
import { BuffDisplay } from './ui/BuffDisplay';
import { generateInitialTerrain } from '../utils/procedural';
import { audioManager } from '../utils/audio';

// Context Hooks
import { usePlayerContext } from '../contexts/PlayerContext';
import { useWorldContext } from '../contexts/WorldContext';
import { useUIContext } from '../contexts/UIContext';

interface GameLayoutProps {
  debugRef: React.RefObject<DebugOverlayRef>;
  handleGiveItem: (item: string, count: number) => void;
  addJob: (mode: any, prompt: string, count: number, ...args: any[]) => void;
  spawnPredefinedCharacter: (prefab: any, count: number, ...args: any[]) => void;
  setGameStarted: (started: boolean) => void;
  spawnCaveContents: (spawns: any[]) => void;
}

export const GameLayout: React.FC<GameLayoutProps> = ({
  debugRef, handleGiveItem, addJob, spawnPredefinedCharacter, setGameStarted, spawnCaveContents
}) => {
  // Get state from contexts
  const player = usePlayerContext();
  const world = useWorldContext();
  const ui = useUIContext();

  return (
    <>
        <BloodOverlay hp={player.playerHp} />
        {player.activeBuffs && <BuffDisplay activeBuffs={player.activeBuffs} />}
        <VoxelWorld 
            blocks={world.blocks} setBlocks={world.setBlocks}
            characters={world.characters} setCharacters={world.setCharacters}
            projectiles={world.projectiles} setProjectiles={world.setProjectiles}
            droppedItems={world.droppedItems} setDroppedItems={world.setDroppedItems}
            inventory={player.inventory} setInventory={player.setInventory}
            activeSlot={player.activeSlot}
            viewMode={player.viewMode} setViewMode={player.setViewMode}
            playerHp={player.playerHp} setPlayerHp={player.setPlayerHp}
            playerHunger={player.playerHunger} setPlayerHunger={player.setPlayerHunger}
            isDay={world.isDay} isRaining={world.isRaining}
            onDayChange={world.setIsDay}
            respawnTrigger={player.respawnTrigger}
            resetViewTrigger={player.resetViewTrigger}
            playerPosRef={player.playerPosRef}
            targetPosRef={player.targetPosRef}
            onCharacterInteract={(char) => {
               if(char.isFriendly) {
                   ui.setActiveDialogNpcId(char.id);
                   if(char.name.includes('Merchant')) {
                       ui.setActiveMerchant(char);
                       ui.setShopOpen(true);
                   }
               }
            }}
            onQuestUpdate={ui.onQuestUpdate}
            playerStats={player.playerStats}
            onXpGain={player.onXpGain}
            onGoldGain={player.onGoldGain}
            onDebugUpdate={(info) => { if(debugRef.current) debugRef.current.update(info); }}
            onNotification={ui.showNotification}
            equipment={player.equipment}
            portalPosition={world.portalPosition}
            portalColor={world.portalColor}
            onEnterPortal={world.enterUnderworld}
            isUnderworld={world.isUnderworld}
            difficultyMode={world.difficultyMode}
           />

           <UIOverlay 
             onGenerate={addJob}
             onSpawnPredefinedCharacter={spawnPredefinedCharacter}
             onSpawnPredefinedStructure={() => {}} 
             onReset={() => { 
                world.setBlocks([]); 
                world.setCharacters([]); 
                world.setProjectiles([]);
                world.setDroppedItems([]);
                const result = generateInitialTerrain();
                world.setBlocks(result.blocks);
                spawnCaveContents(result.caveSpawns);
                setGameStarted(true); 
                audioManager.init();
             }}
             onExpand={world.handleExpand}
             onShrink={world.handleShrink}
             onGiveItem={handleGiveItem}
             onRespawn={player.onRespawn}
             onResetView={player.onResetView}
             jobs={ui.jobs}
             playerHp={player.playerHp}
             playerHunger={player.playerHunger}
             inventory={player.inventory}
             activeSlot={player.activeSlot}
             setActiveSlot={player.setActiveSlot}
             onCraft={player.craftItem}
             expansionLevel={world.expansionLevel}
             viewMode={player.viewMode}
             quest={ui.currentQuest}
             questMessage={ui.questMessage}
             playerXp={player.playerXp}
             playerLevel={player.playerLevel}
             xpThresholds={player.XP_THRESHOLDS}
             levelUpMessage={player.levelUpMessage}
             playerGold={player.playerGold}
             hasApiKey={ui.hasApiKey}
             equipment={player.equipment}
             onEquip={player.equipFromInventory}
             onUnequip={player.unequipItem}
             onEat={player.eatItem}
             gameMode={ui.gameMode}
           />

           <Minimap 
             blocks={world.blocks}
             characters={world.characters}
             playerPosRef={player.playerPosRef}
             spawnMarkers={world.spawnMarkers}
             portalPosition={world.portalPosition}
           />
           
           <DebugOverlay ref={debugRef} />
           
           {ui.notification && (
              <NotificationToast 
                message={ui.notification.message}
                subMessage={ui.notification.subMessage}
                type={ui.notification.type}
                duration={ui.notification.duration}
                onClose={() => ui.setNotification(null)}
              />
           )}

           {ui.activeDialogNpcId && !ui.shopOpen && (
              <ChatWindow 
                 npcId={ui.activeDialogNpcId} 
                 npcName={world.characters.find(c => c.id === ui.activeDialogNpcId)?.name || 'NPC'}
                 history={ui.chatHistory[ui.activeDialogNpcId] || []}
                 onClose={() => ui.setActiveDialogNpcId(null)}
                 onSendMessage={async (text) => {
                     // Chat logic would be here
                 }}
              />
           )}
           
           {ui.shopOpen && ui.activeMerchant && (
             <ShopPanel 
                items={[
                    { id: '1', name: 'Sword', type: 'weapon', price: 50, color: '#06b6d4' },
                    { id: '2', name: 'Apple', type: 'apple', price: 10, color: '#ef4444' }
                ]}
                playerGold={player.playerGold}
                onBuy={(item) => {
                    if(player.playerGold >= item.price) {
                        player.onGoldGain(-item.price);
                        handleGiveItem(item.type, 1);
                    }
                }}
                onClose={() => ui.setShopOpen(false)}
             />
           )}
    </>
  );
};
