import * as THREE from 'three';
import { Block, InventoryItem } from '../../types';
import { audioManager } from '../../utils/audio';
import { v4 as uuidv4 } from 'uuid';

interface UseMiningProps {
    setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
    inventory: InventoryItem[];
    setDroppedItems: React.Dispatch<React.SetStateAction<import('../../types').DroppedItem[]>>;
    onQuestUpdate: (type: string, amount: number) => void;
    onNotification: (message: string, type: import('../../types').NotificationType, subMessage?: string) => void;
}

export const useMining = ({
    setBlocks, inventory, setDroppedItems, onQuestUpdate, onNotification
}: UseMiningProps) => {

    const spawnDrop = (position: THREE.Vector3, type: string, count: number, color: string) => {
        const velocity = new THREE.Vector3((Math.random() - 0.5) * 2, 4, (Math.random() - 0.5) * 2);
        setDroppedItems(prev => [...prev, {
            id: uuidv4(), type, position: position.clone(), velocity, count, color, createdAt: Date.now()
        }]);
    };

    const handleMining = (block: Block, activeSlot: number) => {
        const currentItem = inventory[activeSlot];
        const hasAxe = currentItem?.type === 'axe';

        setBlocks(prev => {
            return prev.filter(blk => {
                if (blk.id === block.id) {
                    const damage = hasAxe ? 10 : 2; 
                    const newHp = (blk.hp || 1) - damage; 
                    
                    if (newHp <= 0) {
                        onQuestUpdate(block.type || 'dirt', 1);
                        spawnDrop(new THREE.Vector3(block.x, block.y, block.z), block.type || 'dirt', 1, block.color);
                        try { audioManager.playSFX('BLOCK'); } catch (e) {}
                        onNotification(`You mined 1 ${block.type || 'dirt'}`, 'INFO');
                        return false; 
                    } else {
                        try { audioManager.playSFX('BLOCK'); } catch (e) {}
                        return true; 
                    }
                }
                return true;
            });
        });
    };

    return { handleMining };
};
