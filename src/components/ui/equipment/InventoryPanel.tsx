import React from 'react';
import { InventoryItem } from '../../../types';

interface InventoryPanelProps {
    inventory: InventoryItem[];
    onItemClick: (item: InventoryItem, index: number) => void;
}

export const InventoryPanel: React.FC<InventoryPanelProps> = ({ inventory, onItemClick }) => {
    return (
        <div className="flex-1 flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-slate-400 mb-0 uppercase tracking-wider">Inventory</h3>
            <div className="bg-slate-800/50 rounded-lg p-4 overflow-y-auto flex-1 h-[400px] border border-slate-700/50">
                <div className="grid grid-cols-4 gap-2">
                    {inventory.map((item, idx) => (
                        <div 
                            key={idx} 
                            onClick={() => onItemClick(item, idx)}
                            className="aspect-square bg-slate-700 rounded border border-slate-600 hover:border-white hover:bg-slate-600 cursor-pointer flex items-center justify-center relative group transition-all"
                            title={item.type}
                        >
                            <div className="w-3/4 h-3/4 rounded-full shadow-inner" style={{ backgroundColor: item.color }}></div>
                            <span className="absolute bottom-0 right-1 text-xs font-bold text-white drop-shadow-md">{item.count}</span>
                            
                            <div className="absolute opacity-0 group-hover:opacity-100 bottom-full left-1/2 -translate-x-1/2 mb-1 bg-black/90 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10 pointer-events-none border border-white/10">
                                {item.type}
                                <div className="text-[10px] text-slate-400 italic">Click to equip</div>
                            </div>
                        </div>
                    ))}
                    {inventory.length === 0 && <div className="col-span-4 text-center text-slate-500 py-10 italic">Inventory Empty</div>}
                </div>
            </div>
            <div className="text-xs text-slate-500 text-center mt-2">Click items to equip • Click slots to unequip</div>
        </div>
    );
};
