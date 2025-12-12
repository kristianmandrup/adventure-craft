import React from 'react';
import { InventoryItem } from '../../types';

interface HotbarProps {
  inventory: InventoryItem[];
  activeSlot: number;
  setActiveSlot: (slot: number) => void;
  stopProp: (e: any) => void;
  showTooltip: (e: any, text: string) => void;
  hideTooltip: () => void;
}

export const Hotbar: React.FC<HotbarProps> = ({ inventory, activeSlot, setActiveSlot, stopProp, showTooltip, hideTooltip }) => {
  return (
    <div className="flex justify-center gap-2 mb-2 pointer-events-auto" onPointerDown={stopProp} onClick={stopProp}>
       {[0,1,2,3,4].map(idx => (
         <div 
           key={idx}
           onClick={() => setActiveSlot(idx)}
           className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center relative cursor-pointer transition-all ${activeSlot === idx ? 'border-yellow-400 bg-white/20 scale-110' : 'border-white/30 bg-black/40 hover:bg-white/10'}`}
           onMouseEnter={(e) => showTooltip(e, `Slot ${idx + 1}`)}
           onMouseLeave={hideTooltip}
         >
            {inventory[idx] && (
               <>
                 <div className="w-6 h-6 rounded-sm shadow-sm flex items-center justify-center text-[10px] overflow-hidden" style={{ backgroundColor: inventory[idx].color }}>
                    {inventory[idx].type.includes('weapon') || inventory[idx].type === 'sword' ? '⚔️' : 
                     inventory[idx].type.includes('meat') ? '🥩' : 
                     inventory[idx].type === 'shield' ? '🛡️' :
                     inventory[idx].type === 'bow' ? '🏹' :
                     inventory[idx].type.includes('pick') ? '⛏️' :
                     inventory[idx].type === 'axe' ? '🪓' :
                     inventory[idx].type === 'apple' ? '🍎' :
                     inventory[idx].type === 'torch' ? '🔥' : 
                     inventory[idx].type === 'arrows' ? '➹' : ''}
                 </div>
                 <span className="absolute bottom-0.5 right-1 text-[10px] font-bold text-white shadow-black drop-shadow-md">{inventory[idx].count}</span>
               </>
            )}
            <span className="absolute top-0.5 left-1 text-[8px] text-white/50">{idx + 1}</span>
         </div>
       ))}
    </div>
  );
};