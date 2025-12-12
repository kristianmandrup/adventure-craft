import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePlacement } from './usePlacement';
import * as THREE from 'three';
import { audioManager } from '../../utils/audio';

vi.mock('../../utils/audio', () => ({
    audioManager: {
        playSFX: vi.fn()
    }
}));

// We can rely on real THREE JS math for Box3 if available, 
// otherwise we'd mock it. Vitest uses JSDOM so THREE works fine.

describe('usePlacement', () => {
    let setBlocks: any;
    let setInventory: any;
    let setPlayerHunger: any;
    let onNotification: any;
    let onGoldGain: any;
    let positionRef: any;
    let blockMap: any;

    const defaultInventory = [
        { type: 'wood', count: 10, color: '#brown' },
        { type: 'sword', count: 1, color: '#999' }
    ];

    beforeEach(() => {
        setBlocks = vi.fn();
        setInventory = vi.fn();
        setPlayerHunger = vi.fn();
        onNotification = vi.fn();
        onGoldGain = vi.fn();
        positionRef = { current: new THREE.Vector3(0, 0, 0) };
        blockMap = new Map();
        vi.clearAllMocks();
    });

    const getDefaultProps = () => ({
        setBlocks: setBlocks as any,
        inventory: defaultInventory,
        setInventory: setInventory as any,
        setPlayerHunger: setPlayerHunger as any,
        onNotification: onNotification as any,
        positionRef,
        viewMode: 'FP' as const,
        blockMap,
        onGoldGain: onGoldGain as any
    });

    it('should place a block if item is valid block type and not colliding', () => {
        // Player at 0,0,0. Cursor at 2,0,0 (Not colliding with player width 0.6)
        const { result } = renderHook(() => usePlacement(getDefaultProps()));

        act(() => {
            result.current.handleInteraction([2, 0, 0], 0); // Slot 0 is wood
        });

        expect(setBlocks).toHaveBeenCalled();
        expect(setInventory).toHaveBeenCalled(); // Should decrease count
    });

    it('should NOT place a block if colliding with player', () => {
        // Player at 0,0,0. Cursor at 0,0,0.
        const { result } = renderHook(() => usePlacement(getDefaultProps()));

        act(() => {
            result.current.handleInteraction([0, 0, 0], 0); 
        });

        expect(setBlocks).not.toHaveBeenCalled();
    });

    it('should NOT place if item is weapon/tool', () => {
        const { result } = renderHook(() => usePlacement(getDefaultProps()));
        
        act(() => {
            result.current.handleInteraction([2, 0, 0], 1); // Slot 1 is sword
        });

        expect(setBlocks).not.toHaveBeenCalled();
    });

    it('should consume food and restore hunger', () => {
        const invWithFood = [ { type: 'meat', count: 1, color: '#f00' }];
        const { result } = renderHook(() => usePlacement({ ...getDefaultProps(), inventory: invWithFood }));

        act(() => {
            result.current.handleInteraction([0,0,0], 0);
        });

        expect(setPlayerHunger).toHaveBeenCalled();
        expect(audioManager.playSFX).toHaveBeenCalledWith('EAT_MEAT');
        expect(setInventory).toHaveBeenCalled();
        expect(onNotification).toHaveBeenCalledWith('You consumed meat', 'INFO');
    });

    it('should always place block in OVERHEAD mode even if colliding', () => {
        // OVERHEAD ignores collision
        const { result } = renderHook(() => usePlacement({ ...getDefaultProps(), viewMode: 'OVERHEAD' }));

        act(() => {
            result.current.handleInteraction([0, 0, 0], 0); // Collides with player pos 0,0,0
        });

        expect(setBlocks).toHaveBeenCalled();
    });
});
