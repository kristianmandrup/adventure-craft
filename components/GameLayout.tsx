import React from 'react';
import { VoxelWorld } from './VoxelWorld';
import { UIOverlay } from './UIOverlay';
import { Minimap } from './Minimap';
import { DebugOverlay, DebugOverlayRef } from './ui/DebugOverlay';
import { NotificationToast } from './ui/NotificationToast';
import { ChatWindow } from './ui/ChatWindow';
import { ShopPanel } from './ui/ShopPanel';
import { BloodOverlay } from './ui/BloodOverlay';
import { generateInitialTerrain } from '../utils/procedural';
import { audioManager } from '../utils/audio';

// Types
import { Block, Character, Projectile, InventoryItem, DroppedItem, Equipment, Quest, Job, NotificationType } from '../types';

interface GameLayoutProps {
  // World State
  blocks: Block[];
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
  isDay: boolean;
  setIsDay: (isDay: boolean) => void;
  isRaining: boolean;
  portalActive: boolean;
  portalPosition?: [number, number, number] | null;
  portalColor?: string;
  isUnderworld: boolean;
  enterUnderworld: () => void;

  // Entity State
  characters: Character[];
  setCharacters: React.Dispatch<React.SetStateAction<Character[]>>;
  projectiles: Projectile[];
  setProjectiles: React.Dispatch<React.SetStateAction<Projectile[]>>;
  droppedItems: DroppedItem[];
  setDroppedItems: React.Dispatch<React.SetStateAction<DroppedItem[]>>;
  spawnMarkers: any[];
  
  // Player State
  playerHp: number;
  setPlayerHp: React.Dispatch<React.SetStateAction<number>>;
  playerHunger: number;
  setPlayerHunger: React.Dispatch<React.SetStateAction<number>>;
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  activeSlot: number;
  setActiveSlot: (slot: number) => void;
  viewMode: 'FP' | 'OVERHEAD' | 'TP';
  setViewMode: (mode: 'FP' | 'OVERHEAD' | 'TP') => void;
  playerPosRef: React.MutableRefObject<[number, number, number] | null>;
  targetPosRef: React.MutableRefObject<[number, number, number] | null>;
  equipment: Equipment;
  onEquip: (index: number, slot: import('../types').EquipmentSlot) => void;
  onUnequip: (slot: import('../types').EquipmentSlot) => void;
  eatItem: (slotIndex: number) => void;
  
  // Game Logic
  onRespawn: () => void;
  resetViewTrigger: number;
  onResetView: () => void;
  respawnTrigger: number;
  handleGiveItem: (item: string, count: number) => void;
  showNotification: (message: string, type?: NotificationType, subMessage?: string) => void;
  
  // Progression
  playerXp: number;
  playerLevel: number;
  playerGold: number;
  playerStats: any;
  XP_THRESHOLDS: number[];
  levelUpMessage: string | null;
  onXpGain: (amount: number) => void;
  onGoldGain: (amount: number) => void;
  currentQuest: Quest | null;
  questMessage: string | null;
  onQuestUpdate: (type: string, amount: number) => void;

  // AI & Jobs
  jobs: Job[];
  addJob: (mode: any, prompt: string, count: number, ...args: any[]) => void;
  spawnPredefinedCharacter: (prefab: any, count: number, ...args: any[]) => void;
  
  // UI & Interaction
  notification: any;
  setNotification: (n: any) => void;
  activeDialogNpcId: string | null;
  setActiveDialogNpcId: (id: string | null) => void;
  shopOpen: boolean;
  setShopOpen: (open: boolean) => void;
  activeMerchant: Character | null;
  setActiveMerchant: (char: Character | null) => void;
  chatHistory: Record<string, any[]>;
  hasApiKey: boolean;
  debugRef: React.RefObject<DebugOverlayRef>;
  
  // Adventure Mode
  expansionLevel: number;
  handleExpand: () => void;
  handleShrink: () => void;
  gameMode: 'CREATIVE' | 'ADVENTURE';
  setGameStarted: (started: boolean) => void;
  spawnCaveContents: (spawns: any[]) => void;
  craftItem: (recipeId: string) => void;
}

export const GameLayout: React.FC<GameLayoutProps> = (props) => {
  const {
    blocks, setBlocks, characters, setCharacters, projectiles, setProjectiles, droppedItems, setDroppedItems,
    inventory, setInventory, activeSlot, setActiveSlot, viewMode, setViewMode, playerPosRef, targetPosRef,
    playerHp, setPlayerHp, playerHunger, setPlayerHunger, isDay, setIsDay, isRaining, portalPosition, portalColor,
    enterUnderworld, isUnderworld, respawnTrigger, resetViewTrigger, onRespawn, onResetView, handleGiveItem,
    showNotification, playerStats, playerXp, playerLevel, playerGold, onXpGain, onGoldGain, currentQuest,
    onQuestUpdate, debugRef, equipment, onEquip, onUnequip, eatItem,
    addJob, spawnPredefinedCharacter, jobs, expansionLevel, handleExpand, handleShrink, gameMode,
    currentQuest: quest, questMessage, XP_THRESHOLDS, levelUpMessage, hasApiKey, craftItem,
    notification, setNotification, activeDialogNpcId, setActiveDialogNpcId, chatHistory, shopOpen, setShopOpen,
    activeMerchant, setActiveMerchant, setGameStarted, spawnCaveContents, spawnMarkers
  } = props;

  return (
    <>
        <BloodOverlay hp={playerHp} />
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
            equipment={equipment}
            portalPosition={portalPosition}
            portalColor={portalColor}
            onEnterPortal={enterUnderworld}
            isUnderworld={isUnderworld}
           />

           <UIOverlay 
             onGenerate={addJob}
             onSpawnPredefinedCharacter={spawnPredefinedCharacter}
             onSpawnPredefinedStructure={() => {}} 
             onReset={() => { 
                setBlocks([]); 
                setCharacters([]); 
                setProjectiles([]);
                setDroppedItems([]);
                const result = generateInitialTerrain();
                setBlocks(result.blocks);
                spawnCaveContents(result.caveSpawns);
                setGameStarted(true); 
                audioManager.init();
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
             quest={quest}
             questMessage={questMessage}
             playerXp={playerXp}
             playerLevel={playerLevel}
             xpThresholds={XP_THRESHOLDS}
             levelUpMessage={levelUpMessage}
             playerGold={playerGold}
             hasApiKey={hasApiKey}
             equipment={equipment}
             onEquip={onEquip}
             onUnequip={onUnequip}
             onEat={eatItem}
             gameMode={gameMode}
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
  );
};
