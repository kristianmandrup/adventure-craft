import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePlayerState } from './usePlayerState';

// Mock audio manager
vi.mock('../utils/audio', () => ({
    audioManager: {
        playSFX: vi.fn(),
        init: vi.fn(),
    },
}));

describe('usePlayerState', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('initial state', () => {
        it('should initialize with default values', () => {
            const { result } = renderHook(() => usePlayerState(false));
            
            expect(result.current.playerHp).toBe(100);
            expect(result.current.playerHunger).toBe(100);
            expect(result.current.playerXp).toBe(0);
            expect(result.current.playerLevel).toBe(1);
            expect(result.current.playerGold).toBe(0);
            expect(result.current.inventory).toEqual([]);
            expect(result.current.activeSlot).toBe(0);
        });

        it('should have correct equipment slots', () => {
            const { result } = renderHook(() => usePlayerState(false));
            
            expect(result.current.equipment).toEqual({
                head: null,
                chest: null,
                feet: null,
                mainHand: null,
                offHand: null,
            });
        });

        it('should have XP thresholds defined', () => {
            const { result } = renderHook(() => usePlayerState(false));
            
            expect(result.current.XP_THRESHOLDS).toBeDefined();
            expect(result.current.XP_THRESHOLDS.length).toBe(10);
            expect(result.current.XP_THRESHOLDS[0]).toBe(0);
        });
    });

    describe('XP and leveling', () => {
        it('should gain XP', () => {
            const { result } = renderHook(() => usePlayerState(true));
            
            act(() => {
                result.current.onXpGain(50);
            });
            
            expect(result.current.playerXp).toBe(50);
        });

        it('should level up when XP threshold is reached', () => {
            const { result } = renderHook(() => usePlayerState(true));
            
            act(() => {
                result.current.onXpGain(100);
            });
            
            expect(result.current.playerLevel).toBe(2);
        });

        it('should accumulate XP across multiple gains', () => {
            const { result } = renderHook(() => usePlayerState(true));
            
            act(() => {
                result.current.onXpGain(30);
                result.current.onXpGain(40);
                result.current.onXpGain(50);
            });
            
            expect(result.current.playerXp).toBe(120);
            expect(result.current.playerLevel).toBe(2);
        });
    });

    describe('gold', () => {
        it('should gain gold', () => {
            const { result } = renderHook(() => usePlayerState(true));
            
            act(() => {
                result.current.onGoldGain(100);
            });
            
            expect(result.current.playerGold).toBe(100);
        });

        it('should not go below 0 gold', () => {
            const { result } = renderHook(() => usePlayerState(true));
            
            act(() => {
                result.current.onGoldGain(50);
                result.current.onGoldGain(-100);
            });
            
            expect(result.current.playerGold).toBe(0);
        });
    });

    describe('player stats', () => {
        it('should have base stats at level 1', () => {
            const { result } = renderHook(() => usePlayerState(false));
            
            expect(result.current.playerStats.attackMultiplier).toBe(1);
            expect(result.current.playerStats.speedMultiplier).toBe(1);
            expect(result.current.playerStats.defenseReduction).toBe(0);
        });

        it('should improve stats as level increases', () => {
            const { result } = renderHook(() => usePlayerState(true));
            
            // Level up to 2
            act(() => {
                result.current.onXpGain(100);
            });
            
            expect(result.current.playerStats.attackMultiplier).toBeGreaterThan(1);
            expect(result.current.playerStats.speedMultiplier).toBeGreaterThan(1);
            expect(result.current.playerStats.defenseReduction).toBeGreaterThan(0);
        });
    });

    describe('HP and setters', () => {
        it('should allow setting HP', () => {
            const { result } = renderHook(() => usePlayerState(false));
            
            act(() => {
                result.current.setPlayerHp(50);
            });
            
            expect(result.current.playerHp).toBe(50);
        });

        it('should allow setting hunger', () => {
            const { result } = renderHook(() => usePlayerState(false));
            
            act(() => {
                result.current.setPlayerHunger(75);
            });
            
            expect(result.current.playerHunger).toBe(75);
        });
    });

    describe('inventory', () => {
        it('should allow setting inventory', () => {
            const { result } = renderHook(() => usePlayerState(false));
            
            act(() => {
                result.current.setInventory([
                    { type: 'wood', count: 10, color: '#8B4513' }
                ]);
            });
            
            expect(result.current.inventory).toHaveLength(1);
            expect(result.current.inventory[0].type).toBe('wood');
        });

        it('should allow changing active slot', () => {
            const { result } = renderHook(() => usePlayerState(false));
            
            act(() => {
                result.current.setActiveSlot(3);
            });
            
            expect(result.current.activeSlot).toBe(3);
        });
    });

    describe('view mode', () => {
        it('should start in first-person view', () => {
            const { result } = renderHook(() => usePlayerState(false));
            
            expect(result.current.viewMode).toBe('FP');
        });

        it('should allow changing view mode', () => {
            const { result } = renderHook(() => usePlayerState(false));
            
            act(() => {
                result.current.setViewMode('TP');
            });
            
            expect(result.current.viewMode).toBe('TP');
        });
    });

    describe('respawn and reset', () => {
        it('should trigger respawn', () => {
            const { result } = renderHook(() => usePlayerState(false));
            
            const initialTrigger = result.current.respawnTrigger;
            
            act(() => {
                result.current.onRespawn();
            });
            
            expect(result.current.respawnTrigger).toBe(initialTrigger + 1);
        });

        it('should trigger reset view', () => {
            const { result } = renderHook(() => usePlayerState(false));
            
            const initialTrigger = result.current.resetViewTrigger;
            
            act(() => {
                result.current.onResetView();
            });
            
            expect(result.current.resetViewTrigger).toBe(initialTrigger + 1);
        });
    });

    describe('eatItem - food balancing', () => {
        it('should allow eating raw grapes for +5 hunger', () => {
            const { result } = renderHook(() => usePlayerState(true));
            
            act(() => {
                result.current.setInventory([{ type: 'grape', count: 2, color: '#7c3aed' }]);
                result.current.setPlayerHunger(50);
            });
            
            act(() => {
                result.current.eatItem(0);
            });
            
            expect(result.current.playerHunger).toBe(55); // +5
        });

        it('should allow eating raw fish for +5 hunger', () => {
            const { result } = renderHook(() => usePlayerState(true));
            
            act(() => {
                result.current.setInventory([{ type: 'fish', count: 1, color: '#3b82f6' }]);
                result.current.setPlayerHunger(50);
            });
            
            act(() => {
                result.current.eatItem(0);
            });
            
            expect(result.current.playerHunger).toBe(55); // +5
        });

        it('should allow eating raw meat for +5 hunger', () => {
            const { result } = renderHook(() => usePlayerState(true));
            
            act(() => {
                result.current.setInventory([{ type: 'meat', count: 1, color: '#dc2626' }]);
                result.current.setPlayerHunger(50);
            });
            
            act(() => {
                result.current.eatItem(0);
            });
            
            expect(result.current.playerHunger).toBe(55); // +5
        });

        it('should allow eating cooked fish for +20 hunger', () => {
            const { result } = renderHook(() => usePlayerState(true));
            
            act(() => {
                result.current.setInventory([{ type: 'cooked_fish', count: 1, color: '#92400e' }]);
                result.current.setPlayerHunger(50);
            });
            
            act(() => {
                result.current.eatItem(0);
            });
            
            expect(result.current.playerHunger).toBe(70); // +20
        });

        it('should allow eating cooked meat for +20 hunger +10 HP', () => {
            const { result } = renderHook(() => usePlayerState(true));
            
            act(() => {
                result.current.setInventory([{ type: 'cooked_meat', count: 1, color: '#92400e' }]);
                result.current.setPlayerHunger(50);
                result.current.setPlayerHp(80);
            });
            
            act(() => {
                result.current.eatItem(0);
            });
            
            expect(result.current.playerHunger).toBe(70); // +20
            expect(result.current.playerHp).toBe(90); // +10
        });

        it('should allow eating wine for +15 hunger +10 HP', async () => {
            const { result } = renderHook(() => usePlayerState(true));
            
            act(() => {
                result.current.setInventory([{ type: 'wine', count: 1, color: '#7c3aed' }]);
                result.current.setPlayerHunger(50);
                result.current.setPlayerHp(80);
            });
            
            act(() => {
                const consumed = result.current.eatItem(0);
                expect(consumed).toBe(true);
            });
            
            // Sync update
            expect(result.current.playerHunger).toBe(65); // +15
            expect(result.current.playerHp).toBe(90); // +10
        });

        it('should allow eating bread for +15 hunger +10 HP', async () => {
            const { result } = renderHook(() => usePlayerState(true));
            
            act(() => {
                result.current.setInventory([{ type: 'bread', count: 1, color: '#d97706' }]);
                result.current.setPlayerHunger(50);
                result.current.setPlayerHp(80);
            });
            
            act(() => {
                const consumed = result.current.eatItem(0);
                expect(consumed).toBe(true);
            });
            
            expect(result.current.playerHunger).toBe(65); // +15
            expect(result.current.playerHp).toBe(90); // +10
        });

        it('should allow eating apple for +10 hunger +5 HP', async () => {
            const { result } = renderHook(() => usePlayerState(true));
            
            act(() => {
                result.current.setInventory([{ type: 'apple', count: 1, color: '#dc2626' }]);
                result.current.setPlayerHunger(50);
                result.current.setPlayerHp(80);
            });
            
            act(() => {
                const consumed = result.current.eatItem(0);
                expect(consumed).toBe(true);
            });
            
            expect(result.current.playerHunger).toBe(60); // +10
            expect(result.current.playerHp).toBe(85); // +5
        });
    });

    describe('craftItem - food crafting', () => {
        it('should craft wine from 2 grapes', () => {
            const { result } = renderHook(() => usePlayerState(true));
            
            act(() => {
                result.current.setInventory([{ type: 'grape', count: 3, color: '#7c3aed' }]);
            });
            
            act(() => {
                result.current.craftItem('wine');
            });
            
            const grapes = result.current.inventory.find(i => i.type === 'grape');
            const wine = result.current.inventory.find(i => i.type === 'wine');
            
            expect(grapes?.count).toBe(1); // 3 - 2
            expect(wine?.count).toBe(1);
        });

        it('should craft bread from 2 wheat', () => {
            const { result } = renderHook(() => usePlayerState(true));
            
            act(() => {
                result.current.setInventory([{ type: 'wheat', count: 2, color: '#eab308' }]);
            });
            
            act(() => {
                result.current.craftItem('bread');
            });
            
            const wheat = result.current.inventory.find(i => i.type === 'wheat');
            const bread = result.current.inventory.find(i => i.type === 'bread');
            
            expect(wheat).toBeUndefined(); // All used
            expect(bread?.count).toBe(1);
        });
    });
});
