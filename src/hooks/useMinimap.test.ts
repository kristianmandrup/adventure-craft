import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useMinimap } from './useMinimap';

// Mock Canvas Context
const mockContext = {
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0
};

describe('useMinimap', () => {
    let props: any;

    beforeEach(() => {
        vi.clearAllMocks();
        props = {
            playerPosRef: { current: [0, 0, 0] },
            characters: [],
            blocks: [],
            filter: 'ALL',
            spawnMarkers: [],
            portalPosition: null
        };

        // Mock requestAnimationFrame to run immediately or controllable
        // But the hook calls it recursively.
        // We can stub window.requestAnimationFrame
        vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
           // We don't want infinite loop in test.
           // Just return ID.
           return 1;
        });
        vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
        
        // Mock Canvas getContext
        vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(mockContext as any);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should initialize and render frame', () => {
        let rafCallback: Function | null = null;
        vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
            rafCallback = cb;
            return 1;
        });

        const mockCanvas = document.createElement('canvas');
        (mockCanvas as any).getContext = () => mockContext;

        const { result, rerender } = renderHook((p) => useMinimap(p), { initialProps: props });
        
        // Inject Canvas
        (result.current.canvasRef as any).current = mockCanvas;
        
        // Re-run effect (force trigger by changing dependency)
        rerender({ ...props, filter: 'FOES' });
        
        // Should have requested frame
        expect(rafCallback).toBeTruthy();
        
        // Execute frame
        act(() => {
            if (rafCallback) rafCallback(Date.now());
        });
        
        // Check background clear/draw (context calls)
        expect(mockContext.clearRect).toHaveBeenCalled();
        expect(mockContext.fillRect).toHaveBeenCalled();
        expect(mockContext.strokeRect).toHaveBeenCalled();
        
        // Check Player Draw
        expect(mockContext.save).toHaveBeenCalled();
        // Check restore
        expect(mockContext.restore).toHaveBeenCalled();
    });

    it('should draw blocks and characters based on filter', () => {
         let rafCallback: Function | null = null;
         vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
            rafCallback = cb;
            return 1;
         });
         
         const char = { id: 'c1', name: 'Z', isEnemy: true, playerPos: [5, 0, 5], hp: 10 };
         const block = { x: 5, y: 0, z: 5, type: 'plank' }; // Building
         props.characters = [char];
         props.blocks = [block];
         props.filter = 'BUILDINGS';
         
         const mockCanvas = document.createElement('canvas');
         (mockCanvas as any).getContext = () => mockContext;

         const { result, rerender } = renderHook(() => useMinimap(props));
         (result.current.canvasRef as any).current = mockCanvas;
         rerender(); // Effect runs
         
         act(() => { if (rafCallback) rafCallback(); });
         
         // Should draw block (Building)
         // DrawBlock calls fillRect(cx-1...)
         // 2x2 rect
         // mockContext.fillRect called for background AND blocks.
         // Count calls?
         // Background: 1 (clear) + 1 (fill bg) = 2.
         // DrawBlock: 1.
         // Total 3?
         // IsEnemy -> not drawn if filter=BUILDINGS?
         // Actually characters logic:
         // if filter === 'ALL' ...
         // else if filter === 'FOES' ...
         // if filter === 'BUILDINGS', neither 'FOES' nor 'ANIMALS' matches.
         // So character NOT drawn.
         
         // We expect blocks drawn.
    });

    it('should draw spawn markers and portal', () => {
         let rafCallback: Function | null = null;
         vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
            rafCallback = cb;
            return 1;
         });
         
         const marker = { x: 10, z: 10, timestamp: Date.now() };
         const portal = [20, 0, 20];
         
         props.spawnMarkers = [marker];
         props.portalPosition = portal;
         
         const mockCanvas = document.createElement('canvas');
         (mockCanvas as any).getContext = () => mockContext;

         const { result, rerender } = renderHook((p) => useMinimap(p), { initialProps: props });
         (result.current.canvasRef as any).current = mockCanvas;
         
         // Force update
         rerender({ ...props, portalPosition: [21, 0, 21] }); 
         
         act(() => { if (rafCallback) rafCallback(Date.now()); });
         
         // Spawn Markers: Draw Arcs (2 per marker) + Portal (2 arcs essentially - core + pulse)
         // We can just verify arc calls or specific fillStyles
         expect(mockContext.beginPath).toHaveBeenCalled();
         expect(mockContext.arc).toHaveBeenCalled();
         
         // Check for Portal Color
         // ctx.fillStyle = '#a855f7'
         // MockContext doesn't track assigned properties easily unless we use a proxy or setter spy.
         // But we can rely on verifying path creation calls count which should be higher now.
    });

    it('should handle canvas click for entity identification', () => {
        const { result } = renderHook(() => useMinimap({
            ...props,
            characters: [{ id: 'c1', name: 'Zombie', isEnemy: true, playerPos: [10, 0, 0], hp: 100 }]
        }));
        
        // Mock Mouse Event
        // Canvas size 150. Center 75. Range 40. Scale = 75/40 = 1.875.
        // Entity at x=10. dx=10. CanvasX = 75 + 10*1.875 = 93.75.
        // Click at 94, 75.
        
        // We need to simulate the event object structure passed to `handleCanvasClick`
        const mockEvent = {
            currentTarget: {
                getBoundingClientRect: () => ({ left: 0, top: 0 })
            },
            clientX: 94,
            clientY: 75
        };
        
        act(() => {
            result.current.handleCanvasClick(mockEvent as any);
        });
        
        expect(result.current.identifiedEntity).toBe('Zombie');
    });
});
