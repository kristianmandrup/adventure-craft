import React from 'react';
import { Equipment, InventoryItem, EquipmentSlot } from '../../types';
import { StatsPanel } from './equipment/StatsPanel';
import { EquipmentDoll } from './equipment/EquipmentDoll';
import { InventoryPanel } from './equipment/InventoryPanel';
import { EquipmentHeader } from './equipment/EquipmentHeader';
import { useEquipmentMenu } from '../../hooks/useEquipmentMenu';

interface EquipmentMenuProps {
  equipment: Equipment;
  inventory: InventoryItem[];
  onEquip: (index: number, slot: EquipmentSlot) => void;
  onUnequip: (slot: EquipmentSlot) => void;
  onClose: () => void;
}

export const EquipmentMenu: React.FC<EquipmentMenuProps> = ({ 
  equipment, inventory, onEquip, onUnequip, onClose 
}) => {
  
  const { stats, handleInventoryClick } = useEquipmentMenu(equipment, onEquip);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-[800px] shadow-2xl flex flex-col gap-6" onClick={e => e.stopPropagation()}>
        
        <EquipmentHeader onClose={onClose} />

        <div className="flex gap-8 h-full">
            {/* Left Box */}
            <div className="flex flex-col gap-6 w-1/3">
                <EquipmentDoll equipment={equipment} onUnequip={onUnequip} />
                <StatsPanel stats={stats} />
            </div>

            {/* Right: Inventory */}
            <InventoryPanel inventory={inventory} onItemClick={handleInventoryClick} />
        </div>
      </div>
    </div>
  );
};
