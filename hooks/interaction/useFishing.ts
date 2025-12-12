import { useCallback } from 'react';
import { InventoryItem } from '../../types';

interface UseFishingProps {
    isSwimming?: boolean;
    setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
    onNotification: (message: string, type: import('../../types').NotificationType, subMessage?: string) => void;
}

export const useFishing = ({ isSwimming, setInventory, onNotification }: UseFishingProps) => {
    
    // Return true if fishing occurred
    const handleFishing = useCallback(() => {
        if (!isSwimming) return false;

        // 30% Chance to catch
        if (Math.random() < 0.30) {
            setInventory(prev => {
                const fishIdx = prev.findIndex(i => i.type === 'fish');
                if (fishIdx >= 0) {
                    if (prev[fishIdx].count >= 64) {
                        onNotification('Inventory full for fish!', 'INFO');
                        return prev;
                    }
                    const newInv = [...prev];
                    newInv[fishIdx] = { ...newInv[fishIdx], count: newInv[fishIdx].count + 1 };
                    return newInv;
                }
                return [...prev, { type: 'fish', count: 1, color: '#3b82f6' }];
            });
            onNotification('🐟 You caught a fish!', 'INFO');
        } else {
            onNotification('Nothing biting...', 'INFO');
        }
        return true;
    }, [isSwimming, setInventory, onNotification]);

    return { handleFishing };
};
