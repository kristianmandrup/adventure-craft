import React, { useState, useEffect, useRef } from 'react';
import { GenerationMode, Job, InventoryItem, Quest } from '../types';
import { TopBar } from './ui/TopBar';
import { Hotbar } from './ui/Hotbar';
import { SpawnMenu } from './ui/SpawnMenu';
import { GenerationInput } from './ui/GenerationInput';
import { CraftingMenu } from './ui/CraftingMenu';
import { JobQueue } from './ui/JobQueue';
import { QuestDisplay } from './ui/QuestDisplay';

interface UIOverlayProps {
  onGenerate: (prompt: string, mode: GenerationMode, count: number, isEnemy?: boolean) => void;
  onReset: () => void;
  onExpand: () => void;
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
  viewMode?: 'FP' | 'OVERHEAD';
  quest: Quest | null;
  questMessage: string | null;
}

export const UIOverlay: React.FC<UIOverlayProps> = ({ 
  onGenerate, onReset, onExpand, onGiveItem, onRespawn, onResetView, jobs, playerHp, playerHunger, inventory, activeSlot, setActiveSlot, onCraft, expansionLevel, viewMode = 'FP', quest, questMessage
}) => {
  const [showCrafting, setShowCrafting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [tooltip, setTooltip] = useState<{text: string, x: number, y: number} | null>(null);
  
  // Hoisted state for shared count control
  const [generationCount, setGenerationCount] = useState(1);

  const showTooltip = (e: React.MouseEvent, text: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({ text, x: rect.left + rect.width / 2, y: rect.top - 8 });
  };
  const hideTooltip = () => setTooltip(null);
  
  const stopProp = (e: React.PointerEvent | React.MouseEvent) => {
      e.stopPropagation();
      e.nativeEvent.stopImmediatePropagation();
  };

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const isInputFocused = document.activeElement === inputRef.current;
      if (e.key === 'Enter') {
        if (!isInputFocused) {
           if (document.pointerLockElement) document.exitPointerLock();
           setTimeout(() => inputRef.current?.focus(), 10);
           e.preventDefault();
        }
        return;
      }
      if (isInputFocused) return;
      if (['1','2','3','4','5'].includes(e.key)) setActiveSlot(parseInt(e.key) - 1);
      switch(e.key.toLowerCase()) {
        case 'n': onReset(); break;
        case 'r': onRespawn(); break;
        case 'm': onExpand(); break;
        case 'h': onResetView(); break;
        case 'c': setShowCrafting(prev => !prev); break;
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [onReset, onRespawn, onExpand, onResetView, setActiveSlot]);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 z-10">
      
      {tooltip && (
        <div 
            className="fixed z-[100] px-3 py-1.5 bg-black/90 text-white text-xs font-semibold rounded-lg shadow-xl border border-white/20 whitespace-nowrap pointer-events-none transition-opacity duration-200"
            style={{ left: tooltip.x, top: tooltip.y, transform: 'translate(-50%, -100%)' }}
        >
            {tooltip.text}
            <div className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-black/90 rotate-45 border-r border-b border-white/20"></div>
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
        onRespawn={onRespawn}
        onReset={onReset}
        onToggleCrafting={() => setShowCrafting(!showCrafting)}
        stopProp={stopProp}
        showTooltip={showTooltip}
        hideTooltip={hideTooltip}
      />

      <QuestDisplay quest={quest} questMessage={questMessage} />

      {showCrafting && (
        <CraftingMenu onCraft={onCraft} onClose={() => setShowCrafting(false)} stopProp={stopProp} />
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
            onGenerate={onGenerate} 
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