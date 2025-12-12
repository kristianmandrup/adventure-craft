import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { usePlayerInteraction } from './usePlayerInteraction';
import * as THREE from 'three';
import { useCombat } from './interaction/useCombat';
import { useMining } from './interaction/useMining';
import { usePlacement } from './interaction/usePlacement';
import { raycastBlock } from '../utils/physics';

// Mock sub-hooks
vi.mock('./interaction/useCombat', () => ({
    useCombat: vi.fn()
}));
vi.mock('./interaction/useMining', () => ({
    useMining: vi.fn()
}));
vi.mock('./interaction/usePlacement', () => ({
    usePlacement: vi.fn()
}));

// Mock utils
vi.mock('../utils/physics', () => ({
    raycastBlock: vi.fn()
}));

// Mock Three Fiber
vi.mock('@react-three/fiber', () => ({
    useFrame: (callback: any) => {
        // Expose callback for testing frame loop manually if needed
        // For now, we might not invoke it automatically.
        // Or store it in a global to trigger.
        (global as any).mockFrameCallback = callback;
    },
    useThree: () => ({
        camera: { 
            position: new THREE.Vector3(0,0,0),
            getWorldDirection: vi.fn((v) => v.set(0,0,1)),
            rotation: { x:0, y:0, z:0 }
        },
        raycaster: {
            setFromCamera: vi.fn(),
            ray: { origin: new THREE.Vector3(), direction: new THREE.Vector3() }
        },
        pointer: new THREE.Vector2()
    })
}));

describe('usePlayerInteraction', () => {
    let handleAttack: any;
    let handleMining: any;
    let handlePlace: any;
    let addEventListenerSpy: any;
    let removeEventListenerSpy: any;

    beforeEach(() => {
        handleAttack = vi.fn();
        handleMining = vi.fn();
        handlePlace = vi.fn();
        
        (useCombat as any).mockReturnValue({ handleAttack });
        (useMining as any).mockReturnValue({ handleMining });
        (usePlacement as any).mockReturnValue({ handleInteraction: handlePlace });
        
        // Default raycast miss
        (raycastBlock as any).mockReturnValue({ block: null, face: null });

        addEventListenerSpy = vi.spyOn(document, 'addEventListener');
        removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    const defaultProps = {
        blockMap: new Map(),
        positionRef: { current: new THREE.Vector3() },
        inventory: [],
        setInventory: vi.fn(),
        activeSlot: 0,
        setBlocks: vi.fn(),
        setCharacters: vi.fn(),
        setPlayerHunger: vi.fn(),
        viewMode: 'FP' as const,
        isLocked: { current: true }, // Locked pointer = FP active
        targetPosRef: { current: null },
        characters: [],
        onQuestUpdate: vi.fn(),
        setProjectiles: vi.fn(),
        playerStats: { attackMultiplier: 1, speedMultiplier: 1, defenseReduction: 0 },
        onXpGain: vi.fn(),
        onGoldGain: vi.fn(),
        setDroppedItems: vi.fn(),
        onNotification: vi.fn(),
        onSpawnParticles: vi.fn()
    };

    it('should register event listeners on mount and cleanup on unmount', () => {
        const { unmount } = renderHook(() => usePlayerInteraction(defaultProps));
        
        expect(addEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
        expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
        
        unmount();
        
        expect(removeEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
        expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    it('should handle Left Click (Attack) -> Combat -> Mining', () => {
        renderHook(() => usePlayerInteraction(defaultProps));
        
        // Extract listener
        const mouseDownHandler = addEventListenerSpy.mock.calls.find((call: any) => call[0] === 'mousedown')[1];

        // 1. Combat Hit
        handleAttack.mockReturnValue(true);
        act(() => {
            mouseDownHandler({ button: 0, target: { tagName: 'CANVAS' } } as any);
        });
        
        expect(handleAttack).toHaveBeenCalled();
        expect(handleMining).not.toHaveBeenCalled(); // Combat handled it

        // Reset
        handleAttack.mockClear();
        
        // 2. Combat Miss, Raycast Hit Block
        handleAttack.mockReturnValue(false);
        (raycastBlock as any).mockReturnValue({ block: { id: 'b1' }, face: { x:0, y:1, z:0 } });
        
        act(() => {
            mouseDownHandler({ button: 0, target: { tagName: 'CANVAS' } } as any);
        });
        
        expect(handleAttack).toHaveBeenCalled();
        expect(handleMining).toHaveBeenCalledWith({ id: 'b1' }, 0);
    });

    it('should handle Raycasting in loop', () => {
        const { result } = renderHook(() => usePlayerInteraction(defaultProps));
        
        // Simulate Frame Loop
        const callback = (global as any).mockFrameCallback;
        expect(callback).toBeDefined();

        // Hit Block
        (raycastBlock as any).mockReturnValue({ 
            block: { x: 10, y: 0, z: 10 }, 
            face: { x: 0, y: 1, z: 0 } 
        });

        act(() => {
            callback();
        });

        // Cursor Pos should be (10, 1, 10)
        expect(result.current.cursorPos).toEqual([10, 1, 10]);
        expect(defaultProps.targetPosRef.current).toEqual([10, 1, 10]);
    });

    it('should handle Right Click (Place) if cursor pos valid', () => {
        const { result } = renderHook(() => usePlayerInteraction(defaultProps));
        
        // Set valid cursor pos via frame loop
        const callback = (global as any).mockFrameCallback;
        (raycastBlock as any).mockReturnValue({ 
            block: { x: 10, y: 0, z: 10 }, 
            face: { x: 0, y: 1, z: 0 } 
        });
        act(() => callback());

        const mouseDownHandler = addEventListenerSpy.mock.calls.filter((call: any) => call[0] === 'mousedown').pop()[1];
        
        act(() => {
            mouseDownHandler({ button: 2, target: { tagName: 'CANVAS' } } as any);
        });
        
        expect(handlePlace).toHaveBeenCalledWith([10, 1, 10], 0);
    });

    it('should use X key as Left Click', () => {
        renderHook(() => usePlayerInteraction(defaultProps));
        const keyDownHandler = addEventListenerSpy.mock.calls.find((call: any) => call[0] === 'keydown')[1];

        handleAttack.mockReturnValue(true);

        act(() => {
            keyDownHandler({ code: 'KeyX' } as any);
        });

        expect(handleAttack).toHaveBeenCalled();
    });
});
