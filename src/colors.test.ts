import { describe, it, expect } from 'vitest';
import { getItemColor, getTerrainColor, ITEM_COLORS, TERRAIN_COLORS } from './colors';

describe('colors', () => {
    describe('getItemColor', () => {
        it('should return exact match color', () => {
            expect(getItemColor('wood')).toBe(ITEM_COLORS.wood);
            expect(getItemColor('stone')).toBe(ITEM_COLORS.stone);
        });

        it('should return exact match color ignoring case', () => {
            expect(getItemColor('WOOD')).toBe(ITEM_COLORS.wood);
            expect(getItemColor('Stone')).toBe(ITEM_COLORS.stone);
        });

        it('should return partial match for food', () => {
            expect(getItemColor('golden_apple')).toBe(ITEM_COLORS.apple);
            expect(getItemColor('cooked_meat')).toBe(ITEM_COLORS.meat);
        });

        it('should return partial match for special items', () => {
            expect(getItemColor('red_torch')).toBe(ITEM_COLORS.torch);
            expect(getItemColor('health_potion')).toBe(ITEM_COLORS.potion);
        });

        it('should return partial match for equipment', () => {
            expect(getItemColor('iron_sword')).toBe(ITEM_COLORS.sword);
            expect(getItemColor('diamond_pickaxe')).toBe(ITEM_COLORS.axe); // Matches 'axe' substring first
        });

        it('should return default color for unknown items', () => {
            expect(getItemColor('unknown_item')).toBe(ITEM_COLORS.default);
            expect(getItemColor('')).toBe(ITEM_COLORS.default);
        });
    });

    describe('getTerrainColor', () => {
        it('should return exact match color', () => {
            expect(getTerrainColor('grass')).toBe(TERRAIN_COLORS.grass);
            expect(getTerrainColor('sand')).toBe(TERRAIN_COLORS.sand);
        });

        it('should return exact match color ignoring case', () => {
            expect(getTerrainColor('GRASS')).toBe(TERRAIN_COLORS.grass);
            expect(getTerrainColor('Sand')).toBe(TERRAIN_COLORS.sand);
        });

        it('should return partial match', () => {
            expect(getTerrainColor('dark_grass')).toBe(TERRAIN_COLORS.grass);
            expect(getTerrainColor('wet_sand')).toBe(TERRAIN_COLORS.sand);
        });

        it('should return default fallback (stone) for unknown terrain', () => {
            expect(getTerrainColor('unknown_terrain')).toBe(TERRAIN_COLORS.stone);
            expect(getTerrainColor('')).toBe(TERRAIN_COLORS.stone);
        });
    });
});
