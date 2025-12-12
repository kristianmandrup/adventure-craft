import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateTerrainForRange, generateInitialTerrain, generateExpansion, generateUnderworldTerrain } from './procedural';

// Mock UUID to be deterministic or just consistent length
vi.mock('uuid', () => ({
  v4: () => 'test-uuid'
}));

describe('procedural', () => {
    beforeEach(() => {
        vi.spyOn(Math, 'random').mockReturnValue(0.1); // Default deterministic low value
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('generateTerrainForRange', () => {
        it('should generate blocks within range', () => {
            const blocks = generateTerrainForRange(0, 2, 0, 2);
            // 3x3 = 9 columns. Each column has some depth.
            expect(blocks.length).toBeGreaterThan(0);
            
            // Check bounds
            const xs = blocks.map(b => b.x);
            const zs = blocks.map(b => b.z);
            expect(Math.min(...xs)).toBe(0);
            expect(Math.max(...xs)).toBe(2);
            expect(Math.min(...zs)).toBe(0);
            expect(Math.max(...zs)).toBe(2);
            expect(blocks[0].id).toBe('test-uuid');
        });

        it('should respect existing bounds to skip generation', () => {
            // Generate full 5x5
            const full = generateTerrainForRange(-2, 2, -2, 2);
            
            // Generate with exclusion of inner 3x3
            const hollow = generateTerrainForRange(-2, 2, -2, 2, {
                minX: -1, maxX: 1, minZ: -1, maxZ: 1
            });
            
            expect(hollow.length).toBeLessThan(full.length);
            
            // Ensure no blocks in excluded zone (x: -1..1, z: -1..1)
            const inner = hollow.filter(b => b.x >= -1 && b.x <= 1 && b.z >= -1 && b.z <= 1);
            expect(inner.length).toBe(0);
        });

        it('should generate water below sea level', () => {
            // Find a coordinate known to be low in the heightmap
            // sin(0)*3 + cos(0)*3 = 3 -> height 3 (land)
            // sin(x) ... need negative. sin(3*0.1) ~ 0.3. cos(3*0.1) ~ 0.9.
            // Let's force a "hole" by finding a spot manually or analyzing function?
            // "height < 0".
            // Let's rely on randomness? No height map is deterministic:
            // Math.sin(x * 0.1) * 3 + Math.cos(z * 0.1) * 3 + Math.sin(x * 0.3 + z * 0.2) * 1
            
            // Try x=30 (3.0 rad ~ 0.14), z=30 (3.0 rad ~ -0.99)
            // 3*0.14 + 3*-0.99 = 0.42 - 2.97 ~ -2.5.
            // Should be water.
            
            const blocks = generateTerrainForRange(30, 30, 30, 30);
            const water = blocks.find(b => b.type === 'water');
            expect(water).toBeDefined();
            const sand = blocks.find(b => b.type === 'sand');
            // If height ~ -2, we usually put sand at 0? Wait logic:
            // if (height === -1) add sand at 0.
            // if height < -1, just water filling up to -1.
            
            expect(water?.color).toBe('#3b82f6');
        });

        it('should generate trees on grass', () => {
            // Force tree generation: type===grass and random < 0.02
            // We set random to 0.01 in beforeEach
            // Need a grass spot. (0,0) is height 3 -> grass
            
            const blocks = generateTerrainForRange(0, 0, 0, 0);
            // Height 3.
            // Grass added.
            // random 0.1 > 0.02 -> NO TREE
            
            // Let's mock random to 0.01 just for this test
            vi.spyOn(Math, 'random').mockReturnValue(0.01); 
            
            const blocksWithTree = generateTerrainForRange(0, 0, 0, 0);
            const wood = blocksWithTree.find(b => b.type === 'wood');
            expect(wood).toBeDefined();
            expect(wood?.hp).toBe(50);
        });
        
        it('should generate different tree types based on random', () => {
             // Mock random sequence
             // 1. Terrain stone check (>0.5 -> grass) -> 0.6
             // 2. Tree chance (<0.02) -> 0.01
             // 3. Tree Type (<0.33 oak) -> 0.2
             // 4. Size -> 0.5
             // ...
             
             const random = vi.spyOn(Math, 'random');
             random.mockReturnValueOnce(0.01) // tree chance -> yes (isStone check skipped for height=3)
                   .mockReturnValueOnce(0.2)  // tree type -> Oak
                   .mockReturnValueOnce(0.5)  // size
                   .mockReturnValueOnce(0.6) // height var
                   .mockReturnValueOnce(0.1); // apple chance
             
             const blocks = generateTerrainForRange(0,0,0,0);
             const leaves = blocks.filter(b => b.type === 'leaf');
             expect(leaves.length).toBeGreaterThan(0);
        });
    });

    describe('generateInitialTerrain', () => {
        it('should return blocks and cave spawns', () => {
             const result = generateInitialTerrain();
             expect(result.blocks.length).toBeGreaterThan(100);
             // With fixed random, caves should spawn?
             expect(result.caveSpawns).toBeDefined();
        });

        it('should spawn a fixed fireplace with fire blocks', () => {
             // Use actual random for terrain generation to ensure fireplace spawns
             vi.spyOn(Math, 'random').mockReturnValue(0.5); // 0.5 gives coords 0,0 where height is likely positive
             const result = generateInitialTerrain();
             const fireBlocks = result.blocks.filter(b => b.type === 'fire');
             expect(fireBlocks.length).toBeGreaterThan(0);
        });

        it('should spawn fireplace with stone base blocks', () => {
             vi.spyOn(Math, 'random').mockReturnValue(0.5);
             const result = generateInitialTerrain();
             // Fireplace has stone base at specific pattern
             const stoneBlocks = result.blocks.filter(b => b.type === 'stone');
             expect(stoneBlocks.length).toBeGreaterThan(0);
        });
    });

    describe('generateExpansion', () => {
        it('should verify expansion only adds new outer ring', () => {
            // current 10, expand 10 -> new range -20..20, exclude -10..10
            const blocks = generateExpansion(10, 10);
            
            // Check exclusion
            const inner = blocks.filter(b => b.x >= -10 && b.x <= 10 && b.z >= -10 && b.z <= 10);
            expect(inner.length).toBe(0);
            
            // Check existence of outer
            const outer = blocks.filter(b => b.x === 20 || b.x === -20);
            expect(outer.length).toBeGreaterThan(0);
        });
    });

    describe('generateUnderworldTerrain', () => {
        it('should generate dark blocks and lava/obsidian', () => {
             const result = generateUnderworldTerrain();
             const stone = result.blocks.find(b => b.color === '#1c1917' || b.color === '#292524');
             expect(stone).toBeDefined();
             expect(result.blocks.length).toBeGreaterThan(0);
        });

        it('should generate exactly 2 caves with one boss in 100x100 area', () => {
             // Mock random to ensure hitting valid height (e.g. 0,0 -> height 5)
             // -40 + 0.5*80 = 0.
             const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.5);
             const result = generateUnderworldTerrain();
             randomSpy.mockRestore();
             
             // Check Bounds (-50 to 50)
             const xs = result.blocks.map(b => b.x);
             const zs = result.blocks.map(b => b.z);
             expect(Math.min(...xs)).toBe(-50);
             expect(Math.max(...xs)).toBe(50);
             expect(Math.min(...zs)).toBe(-50);
             expect(Math.max(...zs)).toBe(50);

             // Check Caves
             expect(result.caveSpawns).toHaveLength(2);
             
             // Check Boss
             const bossCave = result.caveSpawns.find(c => c.type === 'boss');
             expect(bossCave).toBeDefined();
        });
    });
});
