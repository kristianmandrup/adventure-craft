import React, { useState } from 'react';
import { Sword, Apple, Shield, Ghost, Skull, Wand2, Home, Castle, TowerControl as Tower, MessageSquare, Wine, Fish, Target, CircleDot, Flame, Shrub, Axe, Coins, ChevronDown, ChevronUp } from 'lucide-react';
import { CharacterPrefab, animalPrefabs, enemyPrefabs, npcPrefabs } from '../../utils/prefabs/characters';
import { StructurePrefab, structurePrefabs } from '../../utils/prefabs/structures';

interface SpawnMenuProps {
  onSpawnPredefinedCharacter: (prefab: CharacterPrefab, count: number, isEnemy?: boolean, isGiant?: boolean, isFriendly?: boolean, isAquatic?: boolean, useRandomLocation?: boolean) => void;
  onSpawnPredefinedStructure: (prefab: StructurePrefab, count: number) => void;
  onGiveItem: (item: string, count: number) => void;
  count: number;
  stopProp: (e: any) => void;
  showTooltip: (e: any, text: string) => void;
  hideTooltip: () => void;
}

type TabType = 'ITEMS' | 'CHARACTERS' | 'ANIMALS' | 'ENEMIES' | 'STRUCTURES';

export const SpawnMenu: React.FC<SpawnMenuProps> = ({ onSpawnPredefinedCharacter, onSpawnPredefinedStructure, onGiveItem, count, stopProp, showTooltip, hideTooltip }) => {
  const [activeTab, setActiveTab] = useState<TabType>('ANIMALS');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const spawnOptions = {
      ITEMS: [
          { label: "Sword", icon: <Sword size={14} />, action: () => onGiveItem('weapon', count) },
          { label: "Axe", icon: <Axe size={14} />, action: () => onGiveItem('axe', count) },
          { label: "Bow", icon: <Target size={14} />, action: () => onGiveItem('bow', 1) },
          { label: "Arrows", icon: <CircleDot size={14} />, action: () => onGiveItem('arrows', count) },
          { label: "Shield", icon: <Shield size={14} />, action: () => onGiveItem('shield', count) },
          { label: "Torch", icon: <Flame size={14} />, action: () => onGiveItem('torch', count) },
          { label: "Apple", icon: <Apple size={14} />, action: () => onGiveItem('apple', count) },
      ],
      CHARACTERS: [
           { label: "Villager", icon: <MessageSquare size={14} />, action: () => onSpawnPredefinedCharacter(npcPrefabs.villager, count, false, false, true, false, true) },
           { label: "Knight", icon: <Shield size={14} />, action: () => onSpawnPredefinedCharacter(npcPrefabs.knight, count, false, false, true, false, true) },
           { label: "Wizard", icon: <Wand2 size={14} />, action: () => onSpawnPredefinedCharacter(npcPrefabs.wizard, count, false, false, true, false, true) },
           { label: "Merchant", icon: <Coins size={14} />, action: () => onSpawnPredefinedCharacter(npcPrefabs.merchant, count, false, false, true, false, true) },
      ],
      ANIMALS: [
          { label: "Sheep", icon: <div className="w-3 h-3 bg-white rounded-sm border border-gray-400"></div>, action: () => onSpawnPredefinedCharacter(animalPrefabs.sheep, count, false, false, false, false, true) },
          { label: "Cow", icon: <div className="w-3 h-3 bg-amber-800 rounded-sm"></div>, action: () => onSpawnPredefinedCharacter(animalPrefabs.cow, count, false, false, false, false, true) },
          { label: "Pig", icon: <div className="w-3 h-3 bg-pink-400 rounded-sm"></div>, action: () => onSpawnPredefinedCharacter(animalPrefabs.pig, count, false, false, false, false, true) },
          { label: "Chicken", icon: <div className="w-3 h-3 bg-white rounded-sm"></div>, action: () => onSpawnPredefinedCharacter(animalPrefabs.chicken, count, false, false, false, false, true) },
          { label: "Fish", icon: <Fish size={14} />, action: () => onSpawnPredefinedCharacter(animalPrefabs.fish, count, false, false, false, true, true) },
          { label: "Horse", icon: <div className="w-3 h-3 bg-amber-600 rounded-sm"></div>, action: () => onSpawnPredefinedCharacter(animalPrefabs.horse, count, false, false, false, false, true) },
      ],
      ENEMIES: [
          { label: "Zombie", icon: <Ghost size={14} />, action: () => onSpawnPredefinedCharacter(enemyPrefabs.zombie, count, true, false, false, false, true) },
          { label: "Skeleton", icon: <Skull size={14} />, action: () => onSpawnPredefinedCharacter(enemyPrefabs.skeleton, count, true, false, false, false, true) },
          { label: "Sorcerer", icon: <Wand2 size={14} />, action: () => onSpawnPredefinedCharacter(enemyPrefabs.sorcerer, count, true, false, false, false, true) },
          { label: "Giant", icon: <div className="w-4 h-4 bg-green-900 rounded-sm"></div>, action: () => onSpawnPredefinedCharacter(enemyPrefabs.giant, count, true, true, false, false, true) },
          { label: "Spider", icon: <div className="w-3 h-3 bg-black rounded-full"></div>, action: () => onSpawnPredefinedCharacter(enemyPrefabs.spider, count, true, false, false, false, true) },
      ],
      STRUCTURES: [
          { label: "House", icon: <Home size={14} />, action: () => onSpawnPredefinedStructure(structurePrefabs.house, count) },
          { label: "Tower", icon: <Tower size={14} />, action: () => onSpawnPredefinedStructure(structurePrefabs.tower, count) },
          { label: "Barrel", icon: <Wine size={14} />, action: () => onSpawnPredefinedStructure(structurePrefabs.wineBarrel, count) },
          { label: "Temple", icon: <Castle size={14} />, action: () => onSpawnPredefinedStructure(structurePrefabs.temple, count) },
          { label: "Bush", icon: <Shrub size={14} />, action: () => onSpawnPredefinedStructure(structurePrefabs.bush, count) },
          { label: "Fireplace", icon: <Flame size={14} />, action: () => onSpawnPredefinedStructure(structurePrefabs.fireplace, count) },
          { label: "Fountain", icon: <div className="w-3 h-3 bg-blue-400 rounded-sm"></div>, action: () => onSpawnPredefinedStructure(structurePrefabs.fountain, count) },
      ]
  };

  return (
    <div className={`bg-black/40 backdrop-blur-md rounded-xl border border-white/10 p-4 mb-2 pointer-events-auto max-w-[800px] mx-auto transition-all ${isCollapsed ? 'w-fit p-2' : ''}`} onPointerDown={stopProp} onClick={stopProp}>
        <div className="flex justify-between items-center bg-black/20 rounded-lg p-1">
            {!isCollapsed && (
                 <div className="flex gap-2 justify-center flex-1">
                    {(['ITEMS', 'CHARACTERS', 'ANIMALS', 'ENEMIES', 'STRUCTURES'] as TabType[]).map(tab => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === tab ? 'bg-white text-black' : 'bg-black/30 text-white/60 hover:bg-white/10'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            )}
            <button 
                onClick={() => setIsCollapsed(!isCollapsed)} 
                className={`text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors ${isCollapsed ? '' : 'ml-2'}`}
                title={isCollapsed ? "Expand Spawn Menu" : "Collapse Spawn Menu"}
            >
                {isCollapsed ? <div className="flex items-center gap-2 font-bold px-2 whitespace-nowrap"><span className="text-white/80">Spawn Menu</span><ChevronUp size={16} /></div> : <ChevronDown size={16} />}
            </button>
        </div>
        
        {!isCollapsed && (
            <div className="flex flex-wrap gap-2 justify-center px-2 mt-3">
                {spawnOptions[activeTab].map((opt, idx) => (
                    <button 
                        key={idx} 
                        onClick={opt.action} 
                        className="quick-btn bg-white/10 text-white hover:bg-white/20 border border-white/5" 
                        onMouseEnter={(e) => showTooltip(e, opt.label)} 
                        onMouseLeave={hideTooltip}
                    >
                        {opt.icon} <span className="ml-1">{opt.label}</span>
                    </button>
                ))}
            </div>
        )}
        <style>{`
        .quick-btn {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          font-size: 0.85rem; font-weight: 600;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          transition: transform 0.1s, background-color 0.2s;
          white-space: nowrap;
          min-width: 80px;
          justify-content: center;
        }
        .quick-btn:hover { transform: scale(1.05); }
      `}</style>
    </div>
  );
};