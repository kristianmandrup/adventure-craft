import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEntityState } from './useEntityState';

vi.mock('three', async () => {
    const actual = await vi.importActual('three');
    return actual;
});

describe('useEntityState', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('initial state', () => {
        it('should start with empty characters', () => {
            const { result } = renderHook(() => useEntityState(false, false));
            expect(result.current.characters).toEqual([]);
        });

        it('should start with empty projectiles', () => {
            const { result } = renderHook(() => useEntityState(false, false));
            expect(result.current.projectiles).toEqual([]);
        });

        it('should start with empty dropped items', () => {
            const { result } = renderHook(() => useEntityState(false, false));
            expect(result.current.droppedItems).toEqual([]);
        });

        it('should start with empty spawn markers', () => {
            const { result } = renderHook(() => useEntityState(false, false));
            expect(result.current.spawnMarkers).toEqual([]);
        });
    });

    describe('entity caps', () => {
        it('should have entity caps defined', () => {
            const { result } = renderHook(() => useEntityState(false, false));
            expect(result.current.ENTITY_CAPS.enemies).toBeDefined();
            expect(result.current.ENTITY_CAPS.animals).toBeDefined();
            expect(result.current.ENTITY_CAPS.friendlyNpcs).toBeDefined();
        });
    });

    describe('getEntityCounts', () => {
        it('should count enemies correctly', () => {
            const { result } = renderHook(() => useEntityState(true, false));
            
            act(() => {
                result.current.setCharacters([
                    { id: '1', name: 'Zombie', isEnemy: true } as any,
                    { id: '2', name: 'Skeleton', isEnemy: true } as any,
                    { id: '3', name: 'Sheep', isEnemy: false } as any,
                ]);
            });
            
            const counts = result.current.getEntityCounts();
            expect(counts.enemies).toBe(2);
        });

        it('should count animals correctly', () => {
            const { result } = renderHook(() => useEntityState(true, false));
            
            act(() => {
                result.current.setCharacters([
                    { id: '1', name: 'Sheep', isEnemy: false, isFriendly: false } as any,
                    { id: '2', name: 'Cow', isEnemy: false, isFriendly: false } as any,
                ]);
            });
            
            const counts = result.current.getEntityCounts();
            expect(counts.animals).toBe(2);
        });

        it('should count friendly NPCs correctly', () => {
            const { result } = renderHook(() => useEntityState(true, false));
            
            act(() => {
                result.current.setCharacters([
                    { id: '1', name: 'Merchant', isEnemy: false, isFriendly: true } as any,
                ]);
            });
            
            const counts = result.current.getEntityCounts();
            expect(counts.friendlyNpcs).toBe(1);
        });
    });

    describe('setters', () => {
        it('should allow setting characters', () => {
            const { result } = renderHook(() => useEntityState(false, false));
            
            act(() => {
                result.current.setCharacters([{ id: '1', name: 'Test' } as any]);
            });
            
            expect(result.current.characters).toHaveLength(1);
        });

        it('should allow setting projectiles', () => {
            const { result } = renderHook(() => useEntityState(false, false));
            
            act(() => {
                result.current.setProjectiles([{ id: 'p1' } as any]);
            });
            
            expect(result.current.projectiles).toHaveLength(1);
        });

        it('should allow setting dropped items', () => {
            const { result } = renderHook(() => useEntityState(false, false));
            
            act(() => {
                result.current.setDroppedItems([{ id: 'd1', type: 'wood' } as any]);
            });
            
            expect(result.current.droppedItems).toHaveLength(1);
        });
    });

    describe('spawnDroppedItem', () => {
        it('should spawn a dropped item', () => {
            const { result } = renderHook(() => useEntityState(true, false));
            
            act(() => {
                result.current.spawnDroppedItem('apple', 3, [5, 1, 5]);
            });
            
            expect(result.current.droppedItems).toHaveLength(1);
            expect(result.current.droppedItems[0].type).toBe('apple');
            expect(result.current.droppedItems[0].count).toBe(3);
        });

        it('should assign correct color to known items', () => {
            const { result } = renderHook(() => useEntityState(true, false));
            
            act(() => {
                result.current.spawnDroppedItem('apple', 1, [0, 0, 0]);
            });
            
            expect(result.current.droppedItems[0].color).toBe('#ef4444');
        });
    });
});
