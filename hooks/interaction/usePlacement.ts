import * as THREE from 'three';
import { Block, InventoryItem } from '../../types';
import { audioManager } from '../../utils/audio';

interface UsePlacementProps {
    setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
    inventory: InventoryItem[];
    setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
    setPlayerHunger: React.Dispatch<React.SetStateAction<number>>;
    onNotification: (message: string, type: import('../../types').NotificationType, subMessage?: string) => void;
    positionRef: React.MutableRefObject<THREE.Vector3>;
    viewMode: string;
    blockMap: Map<string, Block>;
    onGoldGain: (amount: number) => void;
}

export const usePlacement = ({
    setBlocks, inventory, setInventory, setPlayerHunger, onNotification, positionRef, viewMode, blockMap, onGoldGain
}: UsePlacementProps) => {

    const handleInteraction = (cursorPos: [number, number, number], activeSlot: number) => {
        const [tx, ty, tz] = cursorPos;
        const currentItem = inventory[activeSlot];

        if (currentItem && currentItem.count > 0) {
             // Chest Opening Logic (Right Click on Wood block that is above Gold block)
            // Need to check the target block. HandleInteraction usually takes 'cursorPos' which is placement pos.
            // But for interaction (right click on existing block), we should check the block AT the cursor if this was a click ON a block.
            // Wait, usePlacement receives `handleInteraction(cursorPos)`. Correct.
            // BUT, `cursorPos` provided by VoxelWorld for right-click is usually the Face-Normal-Offset (Placement Position).
            // We need the ACTUAL block position. 
            // VoxelWorld `cursorPos` input to this hook: 
            // In App/PlayerInteraction hook: `handleInteraction` is called.
            // Is it passed the INTERSECTED block or the ADJACENT block?
            // Usually right-click is "Place", so it's adjacent.
            // However, to INTERACT (Open Chest), we need to click ON the block.
            // If the user right-clicks a block, standard logic is "Place Item".
            // If we want to intercept that, we need to check if the block *behind* the normal vector (i.e., the one clicked) is a chest.
            // But we only get `cursorPos` (the adjacent air block).
            // We can check the block *below* the cursor pos? (e.g. if I click on top of chest, pos is y+1).
            // OR check neighbors.
            
            // Simpler approach: 
            // If right-clicked with EMPTY HAND or specific item?
            // "Open Chest" usually overrides placement.
            // But if we only get `cursorPos`, we have to guess which block was clicked.
            // Assuming we click the TOP of the chest, `cursorPos` is (x, y+1, z).
            // So check (x, y-1, z).
            
            // Let's check block at (x, y-1, z) relative to `cursorPos`.
            const belowPos = { x: tx, y: ty - 1, z: tz };
            // Since `setBlocks` is a setter, we ideally need to know the blockMap or existing blocks.
            // We don't have `characters` or `blocks` passed to `usePlacement`. We only have `setBlocks`.
            // UsePlacementProps needs `blocks` or `blockMap` to check for chest pattern.
            // I'll need to update UsePlacementProps.
            
            // Eating/Drinking Logic
            if (currentItem.type === 'meat' || currentItem.type === 'apple' || currentItem.type === 'potion') {
                const isDrink = currentItem.type === 'potion';
                const hungerRefill = currentItem.type === 'meat' ? 20 : 10;
                // If potion, maybe restore health instead? But usePlacement only has setPlayerHunger.
                // Assuming potion restores hunger for now or just consumed.
                // Logic says: setPlayerHunger...
                setPlayerHunger(h => Math.min(100, h + hungerRefill));
                setInventory(prev => prev.map((inv, idx) => idx === activeSlot ? { ...inv, count: inv.count - 1 } : inv));
                try { audioManager.playSFX(isDrink ? 'DRINK' : 'EAT'); } catch (e) {}
                onNotification(`You consumed ${currentItem.type}`, 'INFO');
                return;
            } 
            
            // Placing Logic
            if (!['weapon','bow','shield','arrows'].includes(currentItem.type) && !currentItem.type.includes('pick') && !currentItem.type.includes('axe')) {
                const pBox = new THREE.Box3().setFromCenterAndSize(positionRef.current, new THREE.Vector3(0.6, 1.8, 0.6));
                const bBox = new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(tx, ty, tz), new THREE.Vector3(1, 1, 1));
                
                if (viewMode === 'OVERHEAD' || !pBox.intersectsBox(bBox)) {
                    setBlocks(prev => [...prev, {
                        id: crypto.randomUUID(),
                        x: tx, y: ty, z: tz,
                        color: currentItem.color,
                        type: currentItem.type,
                        hp: (currentItem.type === 'wood' || currentItem.type === 'stone') ? 20 : 1
                    }]);
                    setInventory(prev => prev.map((inv, idx) => idx === activeSlot ? { ...inv, count: inv.count - 1 } : inv));
                }
            }
        }
    };

    return { handleInteraction };
};
