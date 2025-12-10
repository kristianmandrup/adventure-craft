import React, { useState } from 'react';
import { Sword, Apple, Shield, Ghost, Skull, Wand2, Home, Castle, TowerControl as Tower, Trees, MessageSquare, Wine, Fish } from 'lucide-react';
import { GenerationMode } from '../../types';

interface SpawnMenuProps {
  onGenerate: (prompt: string, mode: GenerationMode, count: number, isEnemy?: boolean, isGiant?: boolean, isFriendly?: boolean, isAquatic?: boolean) => void;
  onGiveItem: (item: string, count: number) => void;
  count: number;
  stopProp: (e: any) => void;
  showTooltip: (e: any, text: string) => void;
  hideTooltip: () => void;
}

type TabType = 'ITEMS' | 'CHARACTERS' | 'ANIMALS' | 'ENEMIES' | 'STRUCTURES';

export const SpawnMenu: React.FC<SpawnMenuProps> = ({ onGenerate, onGiveItem, count, stopProp, showTooltip, hideTooltip }) => {
  const [activeTab, setActiveTab] = useState<TabType>('ANIMALS');

  const spawnOptions = {
      ITEMS: [
          { label: "Sword", icon: <Sword size={14} />, action: () => onGiveItem('weapon', count) },
          { label: "Apple", icon: <Apple size={14} />, action: () => onGiveItem('apple', count) },
          { label: "Shield", icon: <Shield size={14} />, action: () => onGiveItem('shield', count) },
      ],
      CHARACTERS: [
           { label: "Villager", icon: <MessageSquare size={14} />, action: () => onGenerate("Medieval Villager", "CHARACTER", count, false, false, true) },
           { label: "Knight", icon: <Shield size={14} />, action: () => onGenerate("Royal Knight", "CHARACTER", count, false, false, true) },
           { label: "Wizard", icon: <Wand2 size={14} />, action: () => onGenerate("Old Wizard", "CHARACTER", count, false, false, true) },
      ],
      ANIMALS: [
          { label: "Sheep", icon: <div className="w-3 h-3 bg-white rounded-sm border border-gray-400"></div>, action: () => onGenerate("White Sheep", "CHARACTER", count) },
          { label: "Cow", icon: <div className="w-3 h-3 bg-amber-800 rounded-sm"></div>, action: () => onGenerate("Cow", "CHARACTER", count) },
          { label: "Pig", icon: <div className="w-3 h-3 bg-pink-400 rounded-sm"></div>, action: () => onGenerate("Pig", "CHARACTER", count) },
          { label: "Chicken", icon: <div className="w-3 h-3 bg-white rounded-sm"></div>, action: () => onGenerate("Chicken", "CHARACTER", count) },
          { label: "Fish", icon: <Fish size={14} />, action: () => onGenerate("Tropical Fish", "CHARACTER", count, false, false, false, true) },
          { label: "Horse", icon: <div className="w-3 h-3 bg-amber-600 rounded-sm"></div>, action: () => onGenerate("Horse", "CHARACTER", count) },
      ],
      ENEMIES: [
          { label: "Zombie", icon: <Ghost size={14} />, action: () => onGenerate("Green Zombie", "CHARACTER", count, true) },
          { label: "Skeleton", icon: <Skull size={14} />, action: () => onGenerate("Skeleton Archer", "CHARACTER", count, true) },
          { label: "Sorcerer", icon: <Wand2 size={14} />, action: () => onGenerate("Evil Sorcerer", "CHARACTER", count, true) },
          { label: "Giant", icon: <div className="w-4 h-4 bg-green-900 rounded-sm"></div>, action: () => onGenerate("Giant Ogre", "CHARACTER", count, true, true) },
          { label: "Spider", icon: <div className="w-3 h-3 bg-black rounded-full"></div>, action: () => onGenerate("Giant Spider", "CHARACTER", count, true) },
      ],
      STRUCTURES: [
          { label: "House", icon: <Home size={14} />, action: () => onGenerate("Wooden House", "STRUCTURE", count) },
          { label: "Tower", icon: <Tower size={14} />, action: () => onGenerate("Tall Stone Tower", "STRUCTURE", count) },
          { label: "Wine Barrel", icon: <Wine size={14} />, action: () => onGenerate("Wooden Wine Barrel", "STRUCTURE", count) },
          { label: "Temple", icon: <Castle size={14} />, action: () => onGenerate("Ancient Temple", "STRUCTURE", count) },
          { label: "Tree", icon: <Trees size={14} />, action: () => onGenerate("Giant Oak Tree", "STRUCTURE", count) },
          { label: "Fountain", icon: <div className="w-3 h-3 bg-blue-400 rounded-sm"></div>, action: () => onGenerate("Water Fountain", "STRUCTURE", count) },
      ]
  };

  return (
    <div className="bg-black/40 backdrop-blur-md rounded-xl border border-white/10 p-2 mb-2 pointer-events-auto" onPointerDown={stopProp} onClick={stopProp}>
        <div className="flex gap-2 mb-2 justify-center">
            {(['ITEMS', 'CHARACTERS', 'ANIMALS', 'ENEMIES', 'STRUCTURES'] as TabType[]).map(tab => (
                <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${activeTab === tab ? 'bg-white text-black' : 'bg-black/30 text-white/60 hover:bg-white/10'}`}
                >
                    {tab}
                </button>
            ))}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 justify-center no-scrollbar px-2">
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
        <style>{`
        .quick-btn {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 0.35rem 0.75rem;
          border-radius: 0.5rem;
          font-size: 0.75rem; font-weight: 600;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          transition: transform 0.1s, background-color 0.2s;
          white-space: nowrap;
        }
        .quick-btn:hover { transform: scale(1.02); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};