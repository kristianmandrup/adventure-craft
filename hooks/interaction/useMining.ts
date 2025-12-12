import * as THREE from 'three';
import { Block, InventoryItem } from '../../types';
import { audioManager } from '../../utils/audio';
import { v4 as uuidv4 } from 'uuid';

// Block hardness (HP) values
const BLOCK_HARDNESS: Record<string, number> = {
    stone: 30,
    gold: 40,
    obsidian: 50,
    iron_ore: 35,
    diamond_ore: 45,
    log: 15,
    wood: 10,
    plank: 8,
    grass: 5,
    sand: 5,
    dirt: 8,
    leaf: 3,
    sugar_cane: 3,
    grape: 3,
    wheat: 3,
};

// Unminable blocks
const UNMINABLE_BLOCKS = ['water', 'lava', 'fire', 'portal'];

interface UseMiningProps {
    setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
    inventory: InventoryItem[];
    setDroppedItems: React.Dispatch<React.SetStateAction<import('../../types').DroppedItem[]>>;
    onQuestUpdate: (type: string, amount: number) => void;
    onNotification: (message: string, type: import('../../types').NotificationType, subMessage?: string) => void;
    onSpawnParticles: (pos: THREE.Vector3, color: string) => void;
}

export const useMining = ({
    setBlocks, inventory, setDroppedItems, onQuestUpdate, onNotification, onSpawnParticles
}: UseMiningProps) => {

    const spawnDrop = (position: THREE.Vector3, type: string, count: number, color: string) => {
        const velocity = new THREE.Vector3((Math.random() - 0.5) * 2, 4, (Math.random() - 0.5) * 2);
        setDroppedItems(prev => [...prev, {
            id: uuidv4(), type, position: position.clone(), velocity, count, color, createdAt: Date.now()
        }]);
    };

    const handleMining = (block: Block, activeSlot: number) => {
        // Check if block is unminable
        if (UNMINABLE_BLOCKS.includes(block.type || '')) {
            onNotification(`Cannot mine ${block.type}!`, 'INFO');
            return;
        }
        
        const currentItem = inventory[activeSlot];
        const toolType = currentItem?.type?.toLowerCase() || '';
        
        // Calculate damage based on tool
        let damage = 2; // Bare hands
        const hasAxe = toolType === 'axe' || toolType.includes('axe');
        const hasPickaxe = toolType.includes('pickaxe') || toolType.includes('pick');
        const isMagic = toolType.includes('magic');
        
        if (hasAxe) {
            damage = 10; // Axe for wood
        } else if (hasPickaxe) {
            damage = isMagic ? 20 : 10; // Magic pickaxe doubles damage
        }
        
        // Apply block hardness
        const blockHardness = BLOCK_HARDNESS[block.type || 'dirt'] || 20;

        setBlocks(prev => {
            return prev.reduce((acc, blk) => {
                if (blk.id === block.id) {
                    const currentHp = blk.hp ?? blockHardness;
                    const newHp = currentHp - damage;
                    // Spawn Particles (Always on hit)
                    onSpawnParticles(new THREE.Vector3(block.x, block.y, block.z), block.color);

                    if (newHp <= 0) {
                        onQuestUpdate(block.type || 'dirt', 1);
                        spawnDrop(new THREE.Vector3(block.x, block.y, block.z), block.type || 'dirt', 1, block.color);
                        
                        // Grass blocks have chance to drop flowers
                        if (block.type === 'grass' && Math.random() < 0.20) {
                             spawnDrop(new THREE.Vector3(block.x, block.y + 0.5, block.z), 'flower', 1, '#ff69b4');
                             onNotification('You found a flower!', 'INFO');
                        }
                        
                        // Sugar cane blocks drop sugar
                        if (block.type === 'sugar_cane' || block.type?.includes('cane')) {
                             spawnDrop(new THREE.Vector3(block.x, block.y + 0.5, block.z), 'sugar', 1, '#ffffff');
                        }
                        
                        // Sand blocks have chance to drop bones
                        if (block.type === 'sand' && Math.random() < 0.10) {
                             spawnDrop(new THREE.Vector3(block.x, block.y + 0.5, block.z), 'bone', 1, '#f5f5dc');
                             onNotification('You found a bone!', 'INFO');
                        }
                        
                        // Rare Chance for Treasure in Gold Blocks
                        if (block.type === 'gold' && Math.random() < 0.05) {
                             spawnDrop(new THREE.Vector3(block.x, block.y + 0.5, block.z), 'iron_armor', 1, '#9ca3af');
                             onNotification('You found Iron Armor inside the gold!', 'INFO');
                        }
                        
                        // Grape blocks drop grapes
                        if (block.type === 'grape') {
                             spawnDrop(new THREE.Vector3(block.x, block.y + 0.5, block.z), 'grape', 1, '#7c3aed');
                        }
                        
                        // Wheat blocks drop wheat
                        if (block.type === 'wheat') {
                             spawnDrop(new THREE.Vector3(block.x, block.y + 0.5, block.z), 'wheat', 1, '#eab308');
                        }

                        try { 
                            if (block.type?.includes('wood') || block.type?.includes('log') || block.type?.includes('plank')) {
                                audioManager.playSFX('CHOP_WOOD');
                            } else {
                                audioManager.playSFX('MINE'); 
                            }
                        } catch (e) {}
                        onNotification(`You mined 1 ${block.type || 'dirt'}`, 'INFO');
                        // Do not push to acc (remove block)
                    } else {
                        try { 
                            if (block.type?.includes('wood') || block.type?.includes('log') || block.type?.includes('plank')) {
                                audioManager.playSFX('CHOP_WOOD');
                            } else {
                                audioManager.playSFX('MINE'); 
                            }
                        } catch (e) {}
                        // Push updated block
                        acc.push({ ...blk, hp: newHp });
                    }
                } else {
                    acc.push(blk);
                }
                return acc;
            }, [] as Block[]);
        });
    };

    return { handleMining };
};
