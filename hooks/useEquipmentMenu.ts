import { useMemo } from 'react';
import { Equipment, InventoryItem, EquipmentSlot } from '../types';
import { getItemStats } from '../utils/itemStats';

export const useEquipmentMenu = (
  equipment: Equipment,
  onEquip: (index: number, slot: EquipmentSlot) => void
) => {
  
  const stats = useMemo(() => {
       const slots = ['head', 'chest', 'feet', 'mainHand', 'offHand'] as const;
       let acc = { attack: 0, defense: 0, speed: 0 };
       let specials: string[] = [];
       
       slots.forEach(s => {
           if (equipment[s]) {
               const st = getItemStats(equipment[s]!.type);
               acc.attack += st.attack;
               acc.defense += st.defense;
               acc.speed += st.speed;
               if (st.special) specials.push(st.special);
           }
       });
       return { ...acc, specials };
  }, [equipment]);

  const handleInventoryClick = (item: InventoryItem, index: number) => {
      // Auto-equip logic
      let targetSlot: EquipmentSlot | null = null;
      
      const t = item.type.toLowerCase();
      if (t.includes('helmet') || t.includes('hat')) targetSlot = 'head';
      else if (t.includes('chest') || t.includes('armor') || t.includes('tunic')) targetSlot = 'chest';
      else if (t.includes('boots') || t.includes('shoes')) targetSlot = 'feet';
      else if (t.includes('shield')) targetSlot = 'offHand';
      else targetSlot = 'mainHand'; 

      if (targetSlot) {
          onEquip(index, targetSlot);
      }
  };

  return { stats, handleInventoryClick };
};
