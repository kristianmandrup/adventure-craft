import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useGameOver } from './useGameOver';

vi.mock('../utils/storage', () => ({
    clearSave: vi.fn(),
}));

describe('useGameOver', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should start with gameOver as false', () => {
        const { result } = renderHook(() => useGameOver(100, true));
        expect(result.current.gameOver).toBe(false);
    });

    it('should set gameOver to true when HP reaches 0', () => {
        const { result, rerender } = renderHook(
            ({ hp, started }) => useGameOver(hp, started),
            { initialProps: { hp: 100, started: true } }
        );
        
        expect(result.current.gameOver).toBe(false);
        
        rerender({ hp: 0, started: true });
        
        expect(result.current.gameOver).toBe(true);
    });

    it('should not trigger gameOver if game not started', () => {
        const { result } = renderHook(() => useGameOver(0, false));
        expect(result.current.gameOver).toBe(false);
    });

    it('should allow manually setting gameOver', () => {
        const { result } = renderHook(() => useGameOver(100, true));
        
        act(() => {
            result.current.setGameOver(true);
        });
        
        expect(result.current.gameOver).toBe(true);
    });

    it('should trigger gameOver on negative HP', () => {
        const { result } = renderHook(() => useGameOver(-10, true));
        expect(result.current.gameOver).toBe(true);
    });
});
