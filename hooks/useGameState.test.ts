import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameState } from './useGameState';

vi.mock('uuid', () => ({
    v4: () => 'mock-uuid-' + Math.random().toString(36).substring(2, 9),
}));

describe('useGameState', () => {
    const mockOnXpGain = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('initial state', () => {
        it('should start with game not started', () => {
            const { result } = renderHook(() => useGameState(mockOnXpGain));
            expect(result.current.gameStarted).toBe(false);
        });

        it('should start with empty jobs', () => {
            const { result } = renderHook(() => useGameState(mockOnXpGain));
            expect(result.current.jobs).toEqual([]);
        });

        it('should start with no active quest', () => {
            const { result } = renderHook(() => useGameState(mockOnXpGain));
            expect(result.current.currentQuest).toBeNull();
        });

        it('should start with no notification', () => {
            const { result } = renderHook(() => useGameState(mockOnXpGain));
            expect(result.current.notification).toBeNull();
        });

        it('should start with shop closed', () => {
            const { result } = renderHook(() => useGameState(mockOnXpGain));
            expect(result.current.shopOpen).toBe(false);
        });
    });

    describe('game started', () => {
        it('should allow setting game started', () => {
            const { result } = renderHook(() => useGameState(mockOnXpGain));
            
            act(() => {
                result.current.setGameStarted(true);
            });
            
            expect(result.current.gameStarted).toBe(true);
        });
    });

    describe('quest generation', () => {
        it('should generate a random quest', () => {
            const { result } = renderHook(() => useGameState(mockOnXpGain));
            
            act(() => {
                result.current.generateRandomQuest();
            });
            
            expect(result.current.currentQuest).not.toBeNull();
            expect(result.current.currentQuest?.id).toBeDefined();
            expect(result.current.currentQuest?.title).toBeDefined();
            expect(result.current.currentQuest?.completed).toBe(false);
        });

        it('should generate quests with requirements', () => {
            const { result } = renderHook(() => useGameState(mockOnXpGain));
            
            act(() => {
                result.current.generateRandomQuest();
            });
            
            expect(Object.keys(result.current.currentQuest?.requirements || {}).length).toBeGreaterThan(0);
        });
    });

    describe('dialog and chat', () => {
        it('should allow setting active dialog NPC', () => {
            const { result } = renderHook(() => useGameState(mockOnXpGain));
            
            act(() => {
                result.current.setActiveDialogNpcId('npc-123');
            });
            
            expect(result.current.activeDialogNpcId).toBe('npc-123');
        });

        it('should start with empty chat history', () => {
            const { result } = renderHook(() => useGameState(mockOnXpGain));
            expect(result.current.chatHistory).toEqual({});
        });
    });

    describe('shop', () => {
        it('should allow opening shop', () => {
            const { result } = renderHook(() => useGameState(mockOnXpGain));
            
            act(() => {
                result.current.setShopOpen(true);
            });
            
            expect(result.current.shopOpen).toBe(true);
        });

        it('should allow setting active merchant', () => {
            const { result } = renderHook(() => useGameState(mockOnXpGain));
            const mockMerchant = { id: 'merchant-1', name: 'Bob' } as any;
            
            act(() => {
                result.current.setActiveMerchant(mockMerchant);
            });
            
            expect(result.current.activeMerchant?.id).toBe('merchant-1');
        });
    });

    describe('notifications', () => {
        it('should allow setting notification', () => {
            const { result } = renderHook(() => useGameState(mockOnXpGain));
            
            act(() => {
                result.current.setNotification({
                    message: 'Test',
                    type: 'INFO',
                });
            });
            
            expect(result.current.notification?.message).toBe('Test');
        });
    });
});
