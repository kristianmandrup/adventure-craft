import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useJobProcessor } from './useJobProcessor';
import { generateItem, generateStructure, generateCharacter } from '../services/geminiService';

vi.mock('../services/geminiService', () => ({
    generateItem: vi.fn(),
    generateStructure: vi.fn(),
    generateCharacter: vi.fn()
}));

vi.mock('uuid', () => ({
    v4: () => 'test-job-id'
}));

describe('useJobProcessor', () => {
    let setJobs: any;
    let setBlocks: any;
    let setCharacters: any;
    let setInventory: any;
    let setSpawnMarkers: any;
    let targetPosRef: any;

    beforeEach(() => {
        setJobs = vi.fn();
        setBlocks = vi.fn();
        setCharacters = vi.fn();
        setInventory = vi.fn();
        setSpawnMarkers = vi.fn();
        targetPosRef = { current: [0, 0, 0] };
        vi.clearAllMocks();
    });

    const getDefaultProps = () => ({
        setJobs,
        targetPosRef,
        BASE_SIZE: 50,
        expansionLevel: 0,
        EXPANSION_STEP: 10,
        blocks: [],
        setBlocks,
        setCharacters,
        setInventory,
        setSpawnMarkers
    });

    it('should add an item job and process it successfully', async () => {
        (generateItem as any).mockResolvedValue({ name: 'generated_sword', color: '#fff' });
        
        // Mock setJobs implementation to simulate state update if needed, 
        // but for now we check calls.
        
        const { result } = renderHook(() => useJobProcessor(getDefaultProps()));

        await act(async () => {
             result.current.addJob('ITEM', 'sword', 1);
        });

        // 1. Job Added (pending)
        // 2. Job Updated (generating)
        // 3. Inventory Updated
        // 4. Job Updated (success)

        expect(setJobs).toHaveBeenCalled();
        expect(generateItem).toHaveBeenCalledWith('sword');
        expect(setInventory).toHaveBeenCalled();
        
        // Check final success update
        // We can't easily check order without refined mocks, but we check calls exist.
    });

    it('should add a structure job and process it successfully', async () => {
        (generateStructure as any).mockResolvedValue({ 
            description: 'House', 
            blocks: [{ x: 1, y: 1, z: 1, color: '#000', type: 'stone' }] 
        });

        const { result } = renderHook(() => useJobProcessor(getDefaultProps()));

        await act(async () => {
             result.current.addJob('STRUCTURE', 'castle', 1);
        });

        expect(generateStructure).toHaveBeenCalledWith('1x castle', 0);
        expect(setBlocks).toHaveBeenCalled(); // Should add blocks
        expect(setSpawnMarkers).toHaveBeenCalled();
    });

    it('should add a character job and process it successfully', async () => {
        (generateCharacter as any).mockResolvedValue({
            description: 'Orc',
            parts: []
        });

        const { result } = renderHook(() => useJobProcessor(getDefaultProps()));

        await act(async () => {
            result.current.addJob('CHARACTER', 'orc', 1, true); // Enemy
        });

        expect(generateCharacter).toHaveBeenCalledWith('1x orc');
        expect(setCharacters).toHaveBeenCalled();
        expect(setSpawnMarkers).toHaveBeenCalled();
    });

    it('should handle generation errors', async () => {
        (generateItem as any).mockRejectedValue(new Error('API Fail'));

        const { result } = renderHook(() => useJobProcessor(getDefaultProps()));

        await act(async () => {
             result.current.addJob('ITEM', 'fail', 1);
        });

        expect(generateItem).toHaveBeenCalled();
        // Should update job with error
        // The implementation calls updateJobStatus(..., 'error', ...)
        expect(setJobs).toHaveBeenCalled();
    });
});
