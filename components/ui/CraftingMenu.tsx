import React from 'react';
import { Hammer } from 'lucide-react';

interface CraftingMenuProps {
  onCraft: (recipeId: string) => void;
  onClose: () => void;
  stopProp: (e: any) => void;
}

export const CraftingMenu: React.FC<CraftingMenuProps> = ({ onCraft, onClose, stopProp }) => {
  return (
    <div className="pointer-events-auto absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/80 backdrop-blur-xl border border-white/20 p-6 rounded-2xl w-80 text-white shadow-2xl" onPointerDown={stopProp} onClick={stopProp}>
       <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Hammer className="w-5 h-5" /> Crafting</h2>
       <div className="space-y-2">
         <button onClick={() => onCraft('planks')} className="w-full bg-white/10 hover:bg-white/20 p-2 rounded flex justify-between">
           <span>Wood Planks x4</span> <span className="text-xs text-gray-400">Needs 1 Log</span>
         </button>
         <button onClick={() => onCraft('workbench')} className="w-full bg-white/10 hover:bg-white/20 p-2 rounded flex justify-between">
           <span>Workbench</span> <span className="text-xs text-gray-400">Needs 4 Planks</span>
         </button>
         <button onClick={() => onCraft('potion')} className="w-full bg-white/10 hover:bg-white/20 p-2 rounded flex justify-between">
           <span>Health Potion</span> <span className="text-xs text-gray-400">Needs 2 Flowers</span>
         </button>
       </div>
       <button onClick={onClose} className="mt-4 w-full bg-red-500/50 hover:bg-red-500 p-2 rounded">Close</button>
    </div>
  );
};