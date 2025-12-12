import { useUIState } from '../hooks/useUIState';
import { GenerationMode, Job, InventoryItem, Quest } from '../types';
import { CharacterPrefab } from '../utils/prefabs/characters';
import { StructurePrefab } from '../utils/prefabs/structures';
import { TopBar } from './ui/TopBar';
import { Hotbar } from './ui/Hotbar';
import { SpawnMenu } from './ui/SpawnMenu';
import { GenerationInput } from './ui/GenerationInput';
import { CraftingMenu } from './ui/CraftingMenu';
import { JobQueue } from './ui/JobQueue';
import { QuestDisplay } from './ui/QuestDisplay';
import { EquipmentMenu } from './ui/EquipmentMenu';

interface UIOverlayProps {
  onGenerate: (type: GenerationMode, prompt: string, count: number, isEnemy?: boolean, isGiant?: boolean, isFriendly?: boolean, isAquatic?: boolean) => void;
  onSpawnPredefinedCharacter: (prefab: CharacterPrefab, count: number, isEnemy?: boolean, isGiant?: boolean, isFriendly?: boolean, isAquatic?: boolean) => void;
  onSpawnPredefinedStructure: (prefab: StructurePrefab, count: number) => void;
  onReset: () => void;
  onExpand: () => void;
  onShrink: () => void;
  onGiveItem: (item: string, count: number) => void;
  onRespawn: () => void;
  onResetView: () => void;
  jobs: Job[];
  playerHp: number;
  playerHunger: number;
  inventory: InventoryItem[];
  activeSlot: number;
  setActiveSlot: (slot: number) => void;
  onCraft: (recipeId: string) => void;
  expansionLevel: number;
  viewMode?: 'FP' | 'OVERHEAD' | 'TP';
  quest: Quest | null;
  questMessage: string | null;
  playerXp: number;
  playerLevel: number;
  xpThresholds: number[];
  levelUpMessage: string | null;
  playerGold: number;
  hasApiKey: boolean;
  equipment: import('../types').Equipment;
  onEquip: (index: number, slot: import('../types').EquipmentSlot) => void;
  onUnequip: (slot: import('../types').EquipmentSlot) => void;
  onEat: (slotIndex: number) => void;
  gameMode: 'CREATIVE' | 'ADVENTURE';
}


export const UIOverlay: React.FC<UIOverlayProps> = ({ 
  onGenerate, onSpawnPredefinedCharacter, onSpawnPredefinedStructure, onReset, onExpand, onShrink, onGiveItem, onRespawn, onResetView, jobs, playerHp, playerHunger, inventory, activeSlot, setActiveSlot, onCraft, expansionLevel, viewMode = 'FP', quest, questMessage,
  playerXp, playerLevel, xpThresholds, levelUpMessage, playerGold, hasApiKey,
  equipment, onEquip, onUnequip, onEat
}) => {
  const {
      showCrafting,
      setShowCrafting,
      toggleCrafting,
      showEquipment,
      setShowEquipment,
      toggleEquipment,
      tooltip,
      showTooltip,
      hideTooltip,
      generationCount,
      setGenerationCount,
      inputRef,
      stopProp
  } = useUIState({ onReset, onRespawn, onExpand, onResetView, setActiveSlot, inventory, activeSlot, onEat });


  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 z-10">
      
      {/* ... Tooltips ... */}
      {tooltip && (
        <div 
            className="fixed z-100 px-3 py-1.5 bg-black/90 text-white text-xs font-semibold rounded-lg shadow-xl border border-white/20 whitespace-nowrap pointer-events-none transition-opacity duration-200"
            style={{ left: tooltip.x, top: tooltip.y, transform: 'translate(-50%, -100%)' }}
        >
            {tooltip.text}
            <div className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-black/90 rotate-45 border-r border-b border-white/20"></div>
        </div>
      )}

      {/* API Key Warning Banner */}
      {!hasApiKey && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-100 bg-red-600/95 text-white px-6 py-3 rounded-xl shadow-2xl border border-red-400/50 flex items-center gap-3 pointer-events-auto backdrop-blur-md">
          <svg className="w-6 h-6 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <div className="font-bold">API Key Missing!</div>
            <div className="text-sm text-red-100">AI features disabled. Set GEMINI_API_KEY in .env.local</div>
          </div>
        </div>
      )}

      {viewMode === 'FP' && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 pointer-events-none z-50 flex items-center justify-center opacity-80">
          <div className="absolute w-8 h-1 bg-white drop-shadow-md border border-black/20"></div>
          <div className="absolute h-8 w-1 bg-white drop-shadow-md border border-black/20"></div>
        </div>
      )}

      <TopBar 
        playerHp={playerHp} 
        playerHunger={playerHunger} 
        viewMode={viewMode} 
        expansionLevel={expansionLevel}
        onResetView={onResetView}
        onExpand={onExpand}
        onShrink={onShrink}
        onRespawn={onRespawn}
        onReset={onReset}
        onToggleCrafting={toggleCrafting}
        stopProp={stopProp}
        showTooltip={showTooltip}
        hideTooltip={hideTooltip}
        playerXp={playerXp}
        playerLevel={playerLevel}
        xpThresholds={xpThresholds}
        levelUpMessage={levelUpMessage}
        playerGold={playerGold}
      />
      
      {/* Equipment Button (Temporary location or inside TopBar? I'll add a floating button or key hint) */}
      <div className="absolute top-24 right-6 pointer-events-auto flex flex-col gap-2">
         <button 
           onClick={toggleEquipment}
           className="bg-slate-800 text-white p-2 rounded border border-slate-600 hover:bg-slate-700 active:scale-95 transition-all shadow-lg"
           title="Equipment (E)"
         >
           🛡️ Equipment
         </button>
      </div>

      <QuestDisplay quest={quest} questMessage={questMessage} />

      {showCrafting && (
        <CraftingMenu onCraft={onCraft} onClose={() => setShowCrafting(false)} stopProp={stopProp} />
      )}
      
      {showEquipment && (
          // Dynamic Import to avoid cycle? No.
          <EquipmentMenu 
            equipment={equipment} 
            inventory={inventory} 
            onEquip={onEquip} 
            onUnequip={onUnequip} 
            onClose={() => setShowEquipment(false)} 
          />
      )}

      <JobQueue jobs={jobs} />

      <div className="w-full max-w-2xl mx-auto flex flex-col gap-2">
        <Hotbar 
            inventory={inventory} 
            activeSlot={activeSlot} 
            setActiveSlot={setActiveSlot} 
            stopProp={stopProp}
            showTooltip={showTooltip}
            hideTooltip={hideTooltip}
        />
        
        <SpawnMenu 
            onSpawnPredefinedCharacter={onSpawnPredefinedCharacter}
            onSpawnPredefinedStructure={onSpawnPredefinedStructure}
            onGiveItem={onGiveItem} 
            count={generationCount}
            stopProp={stopProp}
            showTooltip={showTooltip}
            hideTooltip={hideTooltip}
        />

        <GenerationInput 
            onGenerate={onGenerate} 
            count={generationCount}
            setCount={setGenerationCount}
            inputRef={inputRef} 
            stopProp={stopProp}
            showTooltip={showTooltip}
            hideTooltip={hideTooltip}
        />
      </div>
    </div>
  );
};