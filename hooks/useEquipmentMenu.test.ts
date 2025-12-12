import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useEquipmentMenu } from './useEquipmentMenu';
import { getItemStats } from '../utils/itemStats';

vi.mock('../utils/itemStats', () => ({
    getItemStats: vi.fn().mockReturnValue({ attack: 0, defense: 0, speed: 0, special: null })
}));

describe('useEquipmentMenu', () => {
    let onEquip: any;
    let equipment: any;

    beforeEach(() => {
        onEquip = vi.fn();
        equipment = {
            head: null,
            chest: null,
            feet: null,
            mainHand: null,
            offHand: null
        };
        vi.clearAllMocks();
    });

    it('should calculate stats correctly', () => {
        // Mock stats return
        (getItemStats as any)
            .mockReturnValueOnce({ attack: 5, defense: 0, speed: 0 }) // Sword
            .mockReturnValueOnce({ attack: 0, defense: 3, speed: 0 }); // Shield covering next call logic if we iterate

        // We need to set equipment props
        const equipState = {
            ...equipment,
            mainHand: { type: 'sword', count: 1, color: '#999' },
            offHand: { type: 'shield', count: 1, color: '#664' }
        };

        const { result } = renderHook(() => useEquipmentMenu(equipState, onEquip));

        expect(result.current.stats.attack).toBe(5);
        expect(result.current.stats.defense).toBe(3);
        // Note: mockReturnValueOnce queues up returns. 
        // Hook logic iterates slots: head, chest, feet, mainHand, offHand.
        // We set mainHand and offHand. 
        // getItemStats is called for each present item.
        // Order: mainHand (last in hook list? No list is head, chest, feet, mainHand, offHand)
        // If we only populate main/off, getItemStats called twice.
    });

    it('should auto-equip helmet to head', () => {
        const { result } = renderHook(() => useEquipmentMenu(equipment, onEquip));
        const item = { type: 'Iron Helmet', count: 1, color: '#aaa' };
        
        act(() => {
            result.current.handleInventoryClick(item, 2);
        });

        expect(onEquip).toHaveBeenCalledWith(2, 'head');
    });

    it('should auto-equip armor to chest', () => {
        const { result } = renderHook(() => useEquipmentMenu(equipment, onEquip));
        const item = { type: 'Leather Tunic', count: 1, color: '#852' };
        
        act(() => {
            result.current.handleInventoryClick(item, 1);
        });

        expect(onEquip).toHaveBeenCalledWith(1, 'chest');
    });

    it('should auto-equip boots to feet', () => {
        const { result } = renderHook(() => useEquipmentMenu(equipment, onEquip));
        const item = { type: 'Magic Boots', count: 1, color: '#f0f' };
        
        act(() => {
            result.current.handleInventoryClick(item, 5);
        });

        expect(onEquip).toHaveBeenCalledWith(5, 'feet');
    });

    it('should auto-equip shield to offHand', () => {
        const { result } = renderHook(() => useEquipmentMenu(equipment, onEquip));
        const item = { type: 'Wooden Shield', count: 1, color: '#532' };
        
        act(() => {
            result.current.handleInventoryClick(item, 0);
        });

        expect(onEquip).toHaveBeenCalledWith(0, 'offHand');
    });

    it('should default other items to mainHand', () => {
        const { result } = renderHook(() => useEquipmentMenu(equipment, onEquip));
        const item = { type: 'Iron Sword', count: 1, color: '#999' };
        
        act(() => {
            result.current.handleInventoryClick(item, 0);
        });

        expect(onEquip).toHaveBeenCalledWith(0, 'mainHand');
    });
});
