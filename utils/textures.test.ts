import { describe, it, expect, vi } from 'vitest';
import { getTextureType } from './textures';

// Note: createNoiseTexture requires document.createElement which is mocked in test setup
// We only test getTextureType which is pure logic

describe('textures', () => {
    describe('getTextureType', () => {
        it('should return grass for grass types', () => {
            expect(getTextureType('grass')).toBe('grass');
            expect(getTextureType('GRASS')).toBe('grass');
            expect(getTextureType('tall_grass')).toBe('grass');
        });

        it('should return dirt for dirt types', () => {
            expect(getTextureType('dirt')).toBe('dirt');
            expect(getTextureType('soil')).toBe('dirt');
        });

        it('should return stone for stone types', () => {
            expect(getTextureType('stone')).toBe('stone');
            expect(getTextureType('rock')).toBe('stone');
            expect(getTextureType('cobble')).toBe('stone');
            expect(getTextureType('cobblestone')).toBe('stone');
        });

        it('should return wood for wood types', () => {
            expect(getTextureType('wood')).toBe('wood');
            expect(getTextureType('log')).toBe('wood');
            expect(getTextureType('plank')).toBe('wood');
            expect(getTextureType('trunk')).toBe('wood');
            expect(getTextureType('oak_log')).toBe('wood');
        });

        it('should return leaf for leaf types', () => {
            expect(getTextureType('leaf')).toBe('leaf');
            expect(getTextureType('leaves')).toBe('leaf');
            expect(getTextureType('tree')).toBe('leaf');
        });

        it('should return sand for sand types', () => {
            expect(getTextureType('sand')).toBe('sand');
            expect(getTextureType('desert')).toBe('sand');
        });

        it('should return snow for snow types', () => {
            expect(getTextureType('snow')).toBe('snow');
            expect(getTextureType('ice')).toBe('snow');
        });

        it('should return water for water types', () => {
            expect(getTextureType('water')).toBe('water');
            expect(getTextureType('liquid')).toBe('water');
            expect(getTextureType('ocean')).toBe('water');
        });

        it('should return default for unknown types', () => {
            expect(getTextureType('unknown')).toBe('default');
            expect(getTextureType('gold')).toBe('default');
            expect(getTextureType('diamond')).toBe('default');
        });

        it('should return default for undefined', () => {
            expect(getTextureType(undefined)).toBe('default');
            expect(getTextureType()).toBe('default');
        });

        it('should be case insensitive', () => {
            expect(getTextureType('STONE')).toBe('stone');
            expect(getTextureType('WoOd')).toBe('wood');
            expect(getTextureType('LEAF')).toBe('leaf');
        });
    });
});
