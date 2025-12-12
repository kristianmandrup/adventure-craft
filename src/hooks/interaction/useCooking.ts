import { useCallback } from 'react';
import * as THREE from 'three';
import { Block, InventoryItem } from '../../types';

interface UseCookingProps {
    positionRef: React.MutableRefObject<THREE.Vector3>;
    blockMap: Map<string, Block>;
    setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
    setDroppedItems: React.Dispatch<React.SetStateAction<import('../../types').DroppedItem[]>>;
    onNotification: (message: string, type: import('../../types').NotificationType, subMessage?: string) => void;
    onSpawnParticles: (pos: THREE.Vector3, color: string) => void;
}

export const useCooking = ({ 
    positionRef, blockMap, setInventory, setDroppedItems, onNotification, onSpawnParticles 
}: UseCookingProps) => {

    const handleCooking = useCallback(() => {
        const playerPos = positionRef.current;
        const radius = 2; // Check 2 block radius
        let nearFire = false;
        let firePos: THREE.Vector3 | null = null;
        
        // Find nearby fire
        for (let x = -radius; x <= radius; x++) {
            for (let z = -radius; z <= radius; z++) {
                 // Check fire block
                 const k = `${Math.round(playerPos.x + x)},${Math.round(playerPos.y)},${Math.round(playerPos.z + z)}`;
                 const b = blockMap.get(k);
                 if (b && b.type === 'fire') {
                     nearFire = true;
                     firePos = new THREE.Vector3(b.x, b.y, b.z);
                     break;
                 }
                 // Also check below
                 const k2 = `${Math.round(playerPos.x + x)},${Math.round(playerPos.y - 1)},${Math.round(playerPos.z + z)}`;
                 const b2 = blockMap.get(k2);
                 if (b2 && b2.type === 'fire') {
                     nearFire = true;
                     firePos = new THREE.Vector3(b2.x, b2.y, b2.z);
                     break;
                 }
            }
            if (nearFire) break;
        }

        if (nearFire && firePos) {
              setInventory(prev => {
                  // Find cookable items
                  const meatIdx = prev.findIndex(i => i.type === 'meat');
                  const fishIdx = prev.findIndex(i => i.type === 'fish');
                  
                  if (meatIdx === -1 && fishIdx === -1) {
                      onNotification('You need raw meat or fish to cook!', 'INFO');
                      return prev;
                  }
                  
                  // Cook one item
                  const idxToCook = meatIdx !== -1 ? meatIdx : fishIdx;
                  const item = prev[idxToCook];
                  const newInv = [...prev];
                  
                  if (item.count > 1) {
                      newInv[idxToCook] = { ...item, count: item.count - 1 };
                  } else {
                      newInv.splice(idxToCook, 1);
                  }
                  
                  const cookedType = item.type === 'meat' ? 'cooked_meat' : 'cooked_fish';
                  
                  // Spawn cooked item after delay
                  onNotification(`Cooking ${item.type}...`, 'INFO');
                  
                  // Particles (Orange sparks)
                  if (!firePos) return newInv; // Should exist

                  onSpawnParticles(firePos.clone().add(new THREE.Vector3(0, 0.5, 0)), '#f97316');
                  
                  setTimeout(() => {
                      const fPos = firePos!.clone().add(new THREE.Vector3(0, 1, 0));
                      
                      setDroppedItems(d => [...d, {
                          id: crypto.randomUUID(),
                          type: cookedType,
                          count: 1,
                          position: fPos, // Drop above fire
                          velocity: new THREE.Vector3(0, 1, 0),
                          color: cookedType === 'cooked_meat' ? '#7f1d1d' : '#ea580c',
                          createdAt: Date.now()
                      }]);
                      
                      onSpawnParticles(fPos, '#ffffff'); // White steam
                      onNotification(`✅ ${cookedType.replace('_', ' ')} is ready!`, 'INFO');
                  }, 5000);
                  
                  return newInv;
              });
              return true;
        }
        
        return false;
    }, [positionRef, blockMap, setInventory, setDroppedItems, onNotification, onSpawnParticles]);

    return { handleCooking };
};
