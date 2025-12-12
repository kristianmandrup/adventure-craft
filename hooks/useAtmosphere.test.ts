import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAtmosphere } from './useAtmosphere';

describe('useAtmosphere', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should return Day settings when isDay=true', () => {
        const { result } = renderHook(() => useAtmosphere(true, false, false));
        expect(result.current.fogColor).toBe('#87ceeb');
        expect(result.current.fogDensity).toBe(0.008);
        expect(result.current.lightningFlash).toBe(0);
    });

    it('should return Night settings when isDay=false', () => {
        const { result } = renderHook(() => useAtmosphere(false, false, false));
        expect(result.current.fogColor).toBe('#0f172a');
        expect(result.current.fogDensity).toBe(0.03);
    });

    it('should return Rain settings when isRaining=true', () => {
        // Day Rain
        const { result } = renderHook(() => useAtmosphere(true, true, false));
        expect(result.current.fogColor).toBe('#64748b');
        expect(result.current.fogDensity).toBe(0.02);
    });

    it('should return Underworld settings when isUnderworld=true', () => {
        // Underworld overrides everything
        const { result } = renderHook(() => useAtmosphere(true, true, true));
        expect(result.current.fogColor).toBe('#2a0a0a');
        expect(result.current.fogDensity).toBe(0.04);
        
        // Should NOT have lightning in Underworld logic (based on line 21: if(!isRaining || isUnderworld))
        expect(result.current.lightningFlash).toBe(0);
        
        act(() => {
            vi.advanceTimersByTime(10000);
        });
        
        // Still 0
        expect(result.current.lightningFlash).toBe(0);
    });

    it('should trigger lightning flashes when Raining (and not Underworld)', () => {
        const { result } = renderHook(() => useAtmosphere(true, true, false));
        
        // Mock Math.random to trigger flash (< 0.1)
        vi.spyOn(Math, 'random').mockReturnValue(0.05);

        act(() => {
            vi.advanceTimersByTime(2000); // Trigger interval
        });
        
        expect(result.current.lightningFlash).toBe(2);
        
        act(() => {
            vi.advanceTimersByTime(100); // Reset timeout
        });
        
        expect(result.current.lightningFlash).toBe(0);
    });
});
