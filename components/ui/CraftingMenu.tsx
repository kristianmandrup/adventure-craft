import React from 'react';
import { Hammer, Ship, Zap, Swords } from 'lucide-react';

interface CraftingMenuProps {
  onCraft: (recipeId: string) => void;
  onClose: () => void;
  stopProp: (e: any) => void;
}

export const CraftingMenu: React.FC<CraftingMenuProps> = ({ onCraft, onClose, stopProp }) => {
  return (
    <div className="pointer-events-auto absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/80 backdrop-blur-xl border border-white/20 p-6 rounded-2xl w-96 text-white shadow-2xl max-h-[80vh] overflow-y-auto" onPointerDown={stopProp} onClick={stopProp}>
       <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Hammer className="w-5 h-5" /> Crafting</h2>
       <div className="space-y-2">
         <p className="text-xs text-gray-500 uppercase">Basic</p>
         <button onClick={() => onCraft('planks')} className="w-full bg-white/10 hover:bg-white/20 p-2 rounded flex justify-between">
           <span>Wood Planks x4</span> <span className="text-xs text-gray-400">1 Log</span>
         </button>
         <button onClick={() => onCraft('workbench')} className="w-full bg-white/10 hover:bg-white/20 p-2 rounded flex justify-between">
           <span>Workbench</span> <span className="text-xs text-gray-400">4 Planks</span>
         </button>
         
         <p className="text-xs text-gray-500 uppercase mt-4">Potions</p>
         <button onClick={() => onCraft('potion')} className="w-full bg-red-500/20 hover:bg-red-500/40 p-2 rounded flex justify-between">
           <span>❤️ Health Potion</span> <span className="text-xs text-gray-400">2 Flowers</span>
         </button>
         <button onClick={() => onCraft('speed_potion')} className="w-full bg-blue-500/20 hover:bg-blue-500/40 p-2 rounded flex justify-between items-center">
           <span className="flex items-center gap-1"><Zap size={14} className="text-blue-400" /> Speed Potion</span> <span className="text-xs text-gray-400">1 Flower + 1 Sugar</span>
         </button>
         <button onClick={() => onCraft('strength_potion')} className="w-full bg-orange-500/20 hover:bg-orange-500/40 p-2 rounded flex justify-between items-center">
           <span className="flex items-center gap-1"><Swords size={14} className="text-orange-400" /> Strength Potion</span> <span className="text-xs text-gray-400">1 Flower + 1 Bone</span>
         </button>
         <button onClick={() => onCraft('swimming_potion')} className="w-full bg-cyan-500/20 hover:bg-cyan-500/40 p-2 rounded flex justify-between items-center">
           <span className="flex items-center gap-1">🏊 Swimming Potion</span> <span className="text-xs text-gray-400">1 Fish + 1 Flower</span>
         </button>
         
         <p className="text-xs text-gray-500 uppercase mt-4">Food</p>
         <button onClick={() => onCraft('wine')} className="w-full bg-purple-500/20 hover:bg-purple-500/40 p-2 rounded flex justify-between items-center">
           <span className="flex items-center gap-1">🍷 Wine</span> <span className="text-xs text-gray-400">2 Grapes (+15 Hunger, +10 HP)</span>
         </button>
         <button onClick={() => onCraft('bread')} className="w-full bg-amber-600/20 hover:bg-amber-600/40 p-2 rounded flex justify-between items-center">
           <span className="flex items-center gap-1">🍞 Bread</span> <span className="text-xs text-gray-400">2 Wheat (+15 Hunger, +10 HP)</span>
         </button>
         
         <p className="text-xs text-gray-500 uppercase mt-4">Vehicles</p>
         <button onClick={() => onCraft('boat')} className="w-full bg-amber-500/20 hover:bg-amber-500/40 p-2 rounded flex justify-between items-center">
           <span className="flex items-center gap-1"><Ship size={14} className="text-amber-400" /> Boat</span> <span className="text-xs text-gray-400">12 Planks + 3 Wool</span>
         </button>
       </div>
       <button onClick={onClose} className="mt-4 w-full bg-red-500/50 hover:bg-red-500 p-2 rounded">Close</button>
    </div>
  );
};