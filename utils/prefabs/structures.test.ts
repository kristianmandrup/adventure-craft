import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
    structurePrefabs
} from './structures';

describe('Structure Prefabs', () => {
    describe('house prefab', () => {
        it('should have house prefab defined', () => {
            expect(structurePrefabs.house).toBeDefined();
            expect(structurePrefabs.house.blocks).toBeDefined();
        });

        it('should have blocks with valid coordinates', () => {
            structurePrefabs.house.blocks.forEach(block => {
                expect(typeof block.x).toBe('number');
                expect(typeof block.y).toBe('number');
                expect(typeof block.z).toBe('number');
                expect(block.color).toBeDefined();
            });
        });
    });

    describe('tower prefab', () => {
        it('should have tower prefab defined', () => {
            expect(structurePrefabs.tower).toBeDefined();
            expect(structurePrefabs.tower.blocks.length).toBeGreaterThan(0);
        });
    });

    describe('portal prefab', () => {
        it('should have portal prefab defined', () => {
            expect(structurePrefabs.portal).toBeDefined();
        });

        it('should contain portal type blocks', () => {
            const portalBlocks = structurePrefabs.portal.blocks.filter(b => b.type === 'portal');
            expect(portalBlocks.length).toBeGreaterThan(0);
        });
    });

    describe('all prefabs', () => {
        it('should have blocks in each prefab', () => {
            Object.values(structurePrefabs).forEach(prefab => {
                expect(prefab.blocks.length).toBeGreaterThan(0);
            });
        });

        it('should have valid colors on all blocks', () => {
            Object.values(structurePrefabs).forEach(prefab => {
                prefab.blocks.forEach(block => {
                    expect(block.color).toMatch(/^#[0-9a-fA-F]{6}$/);
                });
            });
        });
    });

    describe('grapeBush prefab', () => {
        it('should have grapeBush prefab defined', () => {
            expect(structurePrefabs.grapeBush).toBeDefined();
        });

        it('should contain grape type blocks', () => {
            const grapeBlocks = structurePrefabs.grapeBush.blocks.filter(b => b.type === 'grape');
            expect(grapeBlocks.length).toBeGreaterThan(0);
        });

        it('should have purple grape blocks', () => {
            const grapeBlocks = structurePrefabs.grapeBush.blocks.filter(b => b.type === 'grape');
            grapeBlocks.forEach(block => {
                expect(block.color).toBe('#7c3aed');
            });
        });
    });

    describe('wheatField prefab', () => {
        it('should have wheatField prefab defined', () => {
            expect(structurePrefabs.wheatField).toBeDefined();
        });

        it('should contain wheat type blocks', () => {
            const wheatBlocks = structurePrefabs.wheatField.blocks.filter(b => b.type === 'wheat');
            expect(wheatBlocks.length).toBeGreaterThan(0);
        });

        it('should have golden wheat blocks', () => {
            structurePrefabs.wheatField.blocks.forEach(block => {
                expect(block.color).toBe('#eab308');
            });
        });
    });

    describe('sugarCane prefab', () => {
        it('should have sugarCane prefab defined', () => {
            expect(structurePrefabs.sugarCane).toBeDefined();
        });

        it('should contain sugar_cane type blocks', () => {
            const caneBlocks = structurePrefabs.sugarCane.blocks.filter(b => b.type === 'sugar_cane');
            expect(caneBlocks.length).toBeGreaterThan(0);
        });
    });

    describe('fireplace prefab', () => {
        it('should have fireplace prefab defined', () => {
            expect(structurePrefabs.fireplace).toBeDefined();
        });

        it('should contain fire type blocks', () => {
            const fireBlocks = structurePrefabs.fireplace.blocks.filter(b => b.type === 'fire');
            expect(fireBlocks.length).toBeGreaterThan(0);
        });

        it('should contain stone base blocks', () => {
            const stoneBlocks = structurePrefabs.fireplace.blocks.filter(b => b.type === 'stone');
            expect(stoneBlocks.length).toBeGreaterThan(0);
        });
    });
});
