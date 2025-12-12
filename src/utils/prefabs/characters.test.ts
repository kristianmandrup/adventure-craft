import { describe, it, expect } from 'vitest';
import { 
    sheepPrefab, 
    cowPrefab, 
    pigPrefab,
    zombiePrefab,
    skeletonPrefab,
    sorcererPrefab,
    giantPrefab,
    animalPrefabs,
    enemyPrefabs,
    CharacterPrefab 
} from './characters';

describe('Character Prefabs', () => {
    describe('Animal Prefabs', () => {
        it('should have sheep prefab with correct structure', () => {
            expect(sheepPrefab.name).toBe('Sheep');
            expect(sheepPrefab.maxHp).toBe(10);
            expect(sheepPrefab.parts.length).toBeGreaterThan(0);
        });

        it('should have cow prefab with correct structure', () => {
            expect(cowPrefab.name).toBe('Cow');
            expect(cowPrefab.maxHp).toBe(15);
            expect(cowPrefab.parts.length).toBeGreaterThan(0);
        });

        it('should have pig prefab with correct structure', () => {
            expect(pigPrefab.name).toBe('Pig');
            expect(pigPrefab.maxHp).toBeGreaterThan(0);
            expect(pigPrefab.parts.length).toBeGreaterThan(0);
        });

        it('should export animalPrefabs object', () => {
            expect(animalPrefabs.sheep).toBeDefined();
            expect(animalPrefabs.cow).toBeDefined();
            expect(animalPrefabs.pig).toBeDefined();
        });
    });

    describe('Enemy Prefabs', () => {
        it('should have zombie prefab with correct structure', () => {
            expect(zombiePrefab.name).toBe('Zombie');
            expect(zombiePrefab.maxHp).toBeGreaterThan(0);
            expect(zombiePrefab.parts.length).toBeGreaterThan(0);
        });

        it('should have skeleton prefab with correct structure', () => {
            expect(skeletonPrefab.name).toBe('Skeleton');
            expect(skeletonPrefab.maxHp).toBeGreaterThan(0);
            expect(skeletonPrefab.parts.length).toBeGreaterThan(0);
        });

        it('should have sorcerer prefab with correct structure', () => {
            expect(sorcererPrefab.name).toBe('Evil Sorcerer');
            expect(sorcererPrefab.maxHp).toBeGreaterThan(0);
            expect(sorcererPrefab.parts.length).toBeGreaterThan(0);
        });

        it('should have giant prefab with higher HP', () => {
            expect(giantPrefab.name).toBe('Giant Ogre');
            expect(giantPrefab.maxHp).toBeGreaterThan(zombiePrefab.maxHp);
        });

        it('should export enemyPrefabs object', () => {
            expect(enemyPrefabs.zombie).toBeDefined();
            expect(enemyPrefabs.skeleton).toBeDefined();
            expect(enemyPrefabs.sorcerer).toBeDefined();
            expect(enemyPrefabs.giant).toBeDefined();
        });
    });

    describe('CharacterPrefab structure', () => {
        const validatePrefab = (prefab: CharacterPrefab) => {
            expect(typeof prefab.name).toBe('string');
            expect(typeof prefab.maxHp).toBe('number');
            expect(prefab.maxHp).toBeGreaterThan(0);
            expect(Array.isArray(prefab.parts)).toBe(true);
            
            // Each part should have voxels
            prefab.parts.forEach(part => {
                expect(part.name).toBeDefined();
                expect(Array.isArray(part.voxels)).toBe(true);
                expect(part.voxels.length).toBeGreaterThan(0);
                
                // Each voxel should have coordinates and color
                part.voxels.forEach(voxel => {
                    expect(typeof voxel.x).toBe('number');
                    expect(typeof voxel.y).toBe('number');
                    expect(typeof voxel.z).toBe('number');
                    expect(typeof voxel.color).toBe('string');
                });
            });
        };

        it('should validate all animal prefabs', () => {
            validatePrefab(sheepPrefab);
            validatePrefab(cowPrefab);
            validatePrefab(pigPrefab);
        });

        it('should validate all enemy prefabs', () => {
            validatePrefab(zombiePrefab);
            validatePrefab(skeletonPrefab);
            validatePrefab(sorcererPrefab);
            validatePrefab(giantPrefab);
        });
    });
});
