import React from 'react';
import { Equipment, InventoryItem, EquipmentSlot } from '../../../types';
import { getItemStats } from '../../../utils/itemStats';

interface EquipmentDollProps {
    equipment: Equipment;
    onUnequip: (slot: EquipmentSlot) => void;
}

export const EquipmentDoll: React.FC<EquipmentDollProps> = ({ equipment, onUnequip }) => {
    
    const getSlotIcon = (slot: string) => {
        switch (slot) {
            case 'head': return '👑';
            case 'chest': return '👕';
            case 'feet': return '👢';
            case 'mainHand': return '🗡️';
            case 'offHand': return '🛡️';
            default: return '📦';
        }
    };

    return (
        <div className="flex flex-col items-center gap-4 bg-slate-800/30 p-4 rounded-xl border border-slate-700/50">
            <EquipmentSlotDisplay slot="head" active={equipment.head} icon={getSlotIcon('head')} onClick={() => onUnequip('head')} />
            
            <div className="flex gap-4">
                <EquipmentSlotDisplay slot="mainHand" active={equipment.mainHand} icon={getSlotIcon('mainHand')} onClick={() => onUnequip('mainHand')} />
                <EquipmentSlotDisplay slot="chest" active={equipment.chest} icon={getSlotIcon('chest')} onClick={() => onUnequip('chest')} />
                <EquipmentSlotDisplay slot="offHand" active={equipment.offHand} icon={getSlotIcon('offHand')} onClick={() => onUnequip('offHand')} />
            </div>

            <EquipmentSlotDisplay slot="feet" active={equipment.feet} icon={getSlotIcon('feet')} onClick={() => onUnequip('feet')} />
        </div>
    );
};

const EquipmentSlotDisplay = ({ slot, active, icon, onClick }: { slot: string, active: InventoryItem | null, icon: string, onClick: () => void }) => {
    
    // Calculate stats if active
    const stats = active ? getItemStats(active.type) : null;
    
    // Determine badge content
    let badge = null;
    let badgeColor = "text-white";
    
    if (stats) {
        if (slot === 'mainHand' && stats.attack > 0) {
            badge = `+${stats.attack}`;
            badgeColor = "text-red-400";
        } else if ((slot === 'head' || slot === 'chest' || slot === 'offHand') && stats.defense > 0) {
            badge = `+${stats.defense}`;
            badgeColor = "text-blue-400";
        } else if (slot === 'feet') {
            if (stats.speed > 0) {
                badge = `+${stats.speed}%`;
                badgeColor = "text-green-400";
            } else if (stats.defense > 0) {
                badge = `+${stats.defense}`;
                badgeColor = "text-blue-400";
            }
        }
    }

    // Tooltip content
    const tooltipText = active 
        ? `${active.type}\n` + 
          (stats?.attack ? `⚔️ Attack: +${stats.attack}\n` : '') +
          (stats?.defense ? `🛡️ Defense: +${stats.defense}\n` : '') +
          (stats?.speed ? `💨 Speed: +${stats.speed}%\n` : '') +
          (stats?.special ? `✨ ${stats.special}` : '')
        : slot;

    return (
        <div 
            onClick={() => active && onClick()}
            className={`w-16 h-16 rounded-lg border-2 flex items-center justify-center relative transition-all group/slot ${active ? 'bg-slate-700 border-yellow-500 cursor-pointer hover:bg-red-900/30 hover:border-red-500' : 'bg-slate-800 border-slate-600'}`}
            title={tooltipText}
        >
            {active ? (
                <>
                    <div className="w-10 h-10 rounded-full shadow-lg" style={{ backgroundColor: active.color }}></div>
                    <span className="absolute -bottom-1 -right-1 bg-slate-900 text-xs px-1.5 rounded border border-slate-600 z-10">{active.count}</span>
                    
                    {/* Stat Badge */}
                    {badge && (
                        <div className={`absolute -top-2 -right-2 bg-slate-900 border border-slate-600 px-1.5 rounded-full text-xs font-bold shadow ${badgeColor} z-20`}>
                            {badge}
                        </div>
                    )}
                </>
            ) : (
                <span className="text-2xl opacity-30 grayscale">{icon}</span>
            )}
        </div>
    );
};
