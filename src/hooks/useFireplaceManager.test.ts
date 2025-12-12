import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useFireplaceManager } from './useFireplaceManager';
import { renderHook, act } from '@testing-library/react';

// Mock getHeight
vi.mock('../utils/procedural', () => ({
    getHeight: vi.fn().mockReturnValue(5)
}));

describe('useFireplaceManager', () => {
    let setBlocks: any;

    beforeEach(() => {
        setBlocks = vi.fn();
        vi.clearAllMocks();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('initialization', () => {
        it('should initialize with null tempFireplacePos', () => {
            const { result } = renderHook(() => useFireplaceManager({ setBlocks }));
            expect(result.current.tempFireplacePos).toBeNull();
        });

        it('should spawn temp fireplace after initial delay', () => {
            renderHook(() => useFireplaceManager({ setBlocks }));
            
            // Initial delay is 5000ms
            act(() => {
                vi.advanceTimersByTime(5000);
            });
            
            expect(setBlocks).toHaveBeenCalled();
        });
    });

    describe('respawning', () => {
        it('should respawn fireplace after 60 seconds', () => {
            renderHook(() => useFireplaceManager({ setBlocks }));
            
            // Initial spawn
            act(() => {
                vi.advanceTimersByTime(5000);
            });
            
            const initialCallCount = setBlocks.mock.calls.length;
            
            // Wait 60 seconds for respawn
            act(() => {
                vi.advanceTimersByTime(60000);
            });
            
            expect(setBlocks.mock.calls.length).toBeGreaterThan(initialCallCount);
        });
    });

    describe('spawnTempFireplace', () => {
        it('should spawn fireplace blocks', () => {
            const { result } = renderHook(() => useFireplaceManager({ setBlocks }));
            
            act(() => {
                result.current.spawnTempFireplace();
            });
            
            // Should have called setBlocks multiple times (remove old + add new)
            expect(setBlocks).toHaveBeenCalled();
        });

        it('should update tempFireplacePos after spawn', () => {
            const { result } = renderHook(() => useFireplaceManager({ setBlocks }));
            
            act(() => {
                result.current.spawnTempFireplace();
            });
            
            expect(result.current.tempFireplacePos).not.toBeNull();
        });
    });
});
