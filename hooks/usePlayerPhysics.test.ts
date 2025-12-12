import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { usePlayerPhysics } from './usePlayerPhysics';
import * as THREE from 'three';
import * as physicsUtils from '../utils/physics';

// Mocks
const mockCamera = {
  position: new THREE.Vector3(),
  rotation: new THREE.Euler(),
  getWorldDirection: vi.fn((vec) => vec.set(0, 0, -1)), // Facing North
  up: new THREE.Vector3(0, 1, 0),
};

const mockControls = {
  getObject: vi.fn(() => ({ rotation: { x: 0 } })),
  isLocked: true,
};

vi.mock('@react-three/fiber', () => ({
  useThree: () => ({ camera: mockCamera }),
  useFrame: (callback: any) => {
    // Expose the frame callback to tests so we can manually trigger it
    (global as any).triggerFrame = (state: any, delta: number) => callback(state, delta);
  },
}));

vi.mock('../utils/physics', async (importOriginal) => {
    const actual = await importOriginal<any>();
    const THREE = await import('three');
    return {
        ...actual,
        resolveCollision: vi.fn().mockReturnValue({
            position: new THREE.Vector3(0, 0, 0),
            velocity: new THREE.Vector3(0, 0, 0),
            onGround: true,
        }),
    };
});

describe('usePlayerPhysics', () => {
  let positionRef: any;
  let rainGroupRef: any;
  let targetPosRef: any;
  let playerPosRef: any;
  let controlsRef: any;
  let blockMap: Map<string, any>;
  let setIsLocked: any;

  beforeEach(() => {
    positionRef = { current: new THREE.Vector3(0, 5, 0) };
    rainGroupRef = { current: { position: new THREE.Vector3() } };
    targetPosRef = { current: null };
    playerPosRef = { current: [0, 5, 0] };
    controlsRef = { current: mockControls };
    blockMap = new Map();
    setIsLocked = vi.fn();
    
    vi.clearAllMocks();
    mockCamera.position.set(0, 0, 0);
  });
  
  let defaultProps: any;

  beforeEach(() => {
    positionRef = { current: new THREE.Vector3(0, 5, 0) };
    rainGroupRef = { current: { position: new THREE.Vector3() } };
    targetPosRef = { current: null };
    playerPosRef = { current: [0, 5, 0] };
    controlsRef = { current: mockControls };
    blockMap = new Map();
    setIsLocked = vi.fn();
    
    vi.clearAllMocks();
    mockCamera.position.set(0, 0, 0);

    defaultProps = {
        controlsRef,
        blockMap,
        positionRef,
        rainGroupRef,
        viewMode: 'FP' as const,
        setIsLocked,
        respawnTrigger: 0,
        targetPosRef,
        resetViewTrigger: 0,
        playerPosRef,
        hasMagicBoots: false
    };
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => usePlayerPhysics(defaultProps));
    expect(result.current.debugInfo.locked).toBe(false); // Initially false in hook state until frame updates?
    // The hook sets refs initially.
  });

  it('should update debug info on frame loop when locked', () => {
    const { result } = renderHook(() => usePlayerPhysics(defaultProps));
    
    // Simulate frame
    act(() => {
       (global as any).triggerFrame({}, 0.02);
    });

    expect(result.current.debugInfo).toBeDefined();
    // Assuming mockControls.isLocked is true
    expect(setIsLocked).toHaveBeenCalledWith(true);
  });

  it('should handle movement input and update velocity', () => {
    const { result } = renderHook(() => usePlayerPhysics(defaultProps));

    // Simulate Key Press
    act(() => {
        const event = new KeyboardEvent('keydown', { code: 'KeyW' });
        document.dispatchEvent(event);
    });

    // Run frame
    act(() => {
        (global as any).triggerFrame({}, 0.02);
    });
    
    // Check if resolveCollision was called (implies physics ran)
    expect(physicsUtils.resolveCollision).toHaveBeenCalled();
  });

  it('should double speed when magic boots are active and sprinting', () => {
     const { result } = renderHook(() => usePlayerPhysics({ ...defaultProps, hasMagicBoots: true }));

     // Sprint + Move
     act(() => {
         document.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW' }));
         document.dispatchEvent(new KeyboardEvent('keydown', { code: 'ShiftLeft' }));
     });

     // Process Frame to activate boots
     act(() => {
         (global as any).triggerFrame({}, 0.02);
     });
     
     // Boots should activate now.
     // Check debug info for boost status
     expect(result.current.debugInfo.boost).toBe('ACTIVE!');
  });
  
  it('should handle physics mode toggling', () => {
      const { result } = renderHook(() => usePlayerPhysics(defaultProps));
      
      act(() => {
          document.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyP' }));
          (global as any).triggerFrame({}, 0.02);
      });
      
      expect(result.current.debugInfo.mode).toBe('DIRECT');
      
      act(() => {
          document.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyP' }));
          (global as any).triggerFrame({}, 0.02);
      });
      
      expect(result.current.debugInfo.mode).toBe('ACCELERATION');
  });

  it('should jump when Space is pressed and on ground', () => {
      const { result } = renderHook(() => usePlayerPhysics(defaultProps));
      
      // Mock collision to say onGround = true
      // (Actually mock default return is onGround=true already)
      
      act(() => {
          document.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }));
          // Logic is: KeyDown Space -> checks canJump ref (set by previous frame).
          // We need a frame first to set canJump = true from collision result.
      });
      
      act(() => {
         (global as any).triggerFrame({}, 0.02);
         document.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }));
      });
      
      // We can't easily check internal velocity ref without exposing it or spying the calculation.
      // But the hook does expose velocityRef?
      // Yes: return { ..., velocityRef: velocity };
      
      expect(result.current.velocityRef.current.y).toBeGreaterThan(0);
  });
  
  it('should respawn player when trigger increments', () => {
      const { result, rerender } = renderHook((props) => usePlayerPhysics(props), { initialProps: defaultProps });
      
      // Init frame
      act(() => { (global as any).triggerFrame({}, 0.02); });
      
      // Trigger Respawn
      rerender({ ...defaultProps, respawnTrigger: 1 });
      
      // Frame to process respawn
      act(() => { (global as any).triggerFrame({}, 0.02); });
      
      // Should reset velocity
      expect(result.current.velocityRef.current.x).toBe(0);
      expect(result.current.velocityRef.current.z).toBe(0);
      // Position also reset (mocked set to 0,30,0 if no blocks)
      expect(positionRef.current.y).toBe(30);
  });

  it('should update camera position in FP mode', () => {
      const { result } = renderHook(() => usePlayerPhysics(defaultProps));
      
      act(() => { (global as any).triggerFrame({}, 0.02); });
      
      // FP: camera = pos + (0, 1.6, 0)
      // pos mocked as 0,0,0 by resolveCollision return
      expect(mockCamera.position.y).toBe(1.6);
  });

  it('should update camera position in TP mode', () => {
      const { result } = renderHook(() => usePlayerPhysics({ ...defaultProps, viewMode: 'TP' }));
      
      act(() => { (global as any).triggerFrame({}, 0.02); });
      
      // TP logic is more complex, effectively checks it moved from default
      expect(mockCamera.position.equals(new THREE.Vector3(0,0,0))).toBe(false);
  });
});
