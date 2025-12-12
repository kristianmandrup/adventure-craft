import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWorldState } from './useWorldState';

// Mock procedural generation
vi.mock('../utils/procedural', () => ({
    generateInitialTerrain: vi.fn(() => []),
    generateExpansion: vi.fn(() => [
        { id: 'new-1', x: 50, y: 0, z: 50, color: '#22c55e', type: 'grass' }
    ]),
    generateUnderworldTerrain: vi.fn(() => ({ 
        blocks: [{ id: 'cave-1', x: 0, y: 0, z: 0, color: '#333', type: 'stone' }],
        caveSpawns: []
    })),
}));

vi.mock('../utils/prefabs/structures', () => ({
    structurePrefabs: {
        portal: {
            blocks: [
                { x: 0, y: 0, z: 0, color: '#a855f7', type: 'portal' }
            ]
        }
    }
}));

vi.mock('uuid', () => ({
    v4: () => 'mock-uuid-' + Math.random().toString(36).substring(2, 9),
}));

describe('useWorldState', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('initial state', () => {
        it('should initialize with default values', () => {
            const { result } = renderHook(() => useWorldState(false));
            
            expect(result.current.blocks).toEqual([]);
            expect(result.current.isDay).toBe(true);
            expect(result.current.isRaining).toBe(false);
            expect(result.current.expansionLevel).toBe(0);
            expect(result.current.isUnderworld).toBe(false);
        });

        it('should have portal disabled initially', () => {
            const { result } = renderHook(() => useWorldState(false));
            
            expect(result.current.portalActive).toBe(false);
            expect(result.current.portalPosition).toBeNull();
        });

        it('should have correct constants', () => {
            const { result } = renderHook(() => useWorldState(false));
            
            expect(result.current.BASE_SIZE).toBe(40);
            expect(result.current.EXPANSION_STEP).toBe(20);
        });
    });

    describe('day/night and weather', () => {
        it('should allow setting day/night', () => {
            const { result } = renderHook(() => useWorldState(false));
            
            act(() => {
                result.current.setIsDay(false);
            });
            
            expect(result.current.isDay).toBe(false);
        });

        it('should allow setting rain', () => {
            const { result } = renderHook(() => useWorldState(false));
            
            act(() => {
                result.current.setIsRaining(true);
            });
            
            expect(result.current.isRaining).toBe(true);
        });
    });

    describe('world expansion', () => {
        it('should expand the world', () => {
            const { result } = renderHook(() => useWorldState(true));
            
            act(() => {
                result.current.handleExpand();
            });
            
            expect(result.current.expansionLevel).toBe(1);
            expect(result.current.blocks.length).toBeGreaterThan(0);
        });

        it('should not expand beyond level 3', () => {
            const { result } = renderHook(() => useWorldState(true));
            
            act(() => {
                result.current.setExpansionLevel(3);
            });
            
            act(() => {
                result.current.handleExpand();
            });
            
            expect(result.current.expansionLevel).toBe(3);
        });

        it('should shrink the world', () => {
            const { result } = renderHook(() => useWorldState(true));
            
            // First expand
            act(() => {
                result.current.setExpansionLevel(2);
            });
            
            // Then shrink
            act(() => {
                result.current.handleShrink();
            });
            
            expect(result.current.expansionLevel).toBe(1);
        });

        it('should not shrink below level 0', () => {
            const { result } = renderHook(() => useWorldState(true));
            
            act(() => {
                result.current.handleShrink();
            });
            
            expect(result.current.expansionLevel).toBe(0);
        });
    });

    describe('blocks', () => {
        it('should allow setting blocks', () => {
            const { result } = renderHook(() => useWorldState(false));
            
            const newBlocks = [
                { id: '1', x: 0, y: 0, z: 0, color: '#22c55e', type: 'grass' },
                { id: '2', x: 1, y: 0, z: 0, color: '#22c55e', type: 'grass' }
            ];
            
            act(() => {
                result.current.setBlocks(newBlocks);
            });
            
            expect(result.current.blocks).toHaveLength(2);
        });
    });

    describe('portal', () => {
        it('should have default portal color', () => {
            const { result } = renderHook(() => useWorldState(false));
            
            expect(result.current.portalColor).toBe('#a855f7');
        });

        it('should allow activating portal', () => {
            const { result } = renderHook(() => useWorldState(false));
            
            act(() => {
                result.current.setPortalActive(true);
                result.current.setPortalPosition([10, 5, 10]);
            });
            
            expect(result.current.portalActive).toBe(true);
            expect(result.current.portalPosition).toEqual([10, 5, 10]);
        });
    });

    describe('underworld', () => {
        it('should be able to enter underworld', async () => {
            const { result } = renderHook(() => useWorldState(true));
            
            act(() => {
                result.current.enterUnderworld();
            });
            
            expect(result.current.isUnderworld).toBe(true);
            expect(result.current.worldLevel).toBe(2);
            expect(result.current.portalActive).toBe(false);
        });
    });
});
