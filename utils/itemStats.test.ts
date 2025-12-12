import { describe, it, expect } from 'vitest';
import { getItemStats, ItemStats } from './itemStats';

describe('itemStats', () => {
    describe('getItemStats', () => {
        describe('weapons', () => {
            it('should return fire sword stats', () => {
                const stats = getItemStats('fire_sword');
                expect(stats.attack).toBe(30);
                expect(stats.special).toBe('Flame Effect');
            });

            it('should return ice blade stats', () => {
                const stats = getItemStats('ice_blade');
                expect(stats.attack).toBe(25);
                expect(stats.special).toBe('Freeze');
            });

            it('should return magic sword stats', () => {
                const stats = getItemStats('magic_sword');
                expect(stats.attack).toBe(25);
                expect(stats.special).toBe('Magic Aura');
            });

            it('should return standard sword stats', () => {
                const stats = getItemStats('sword');
                expect(stats.attack).toBe(20);
                expect(stats.defense).toBe(0);
            });

            it('should return bow stats', () => {
                const stats = getItemStats('bow');
                expect(stats.attack).toBe(15);
            });

            it('should return magic bow stats', () => {
                const stats = getItemStats('magic_bow');
                expect(stats.attack).toBe(20);
                expect(stats.special).toBe('Homing Arrows');
            });
        });

        describe('tools', () => {
            it('should return axe stats', () => {
                const stats = getItemStats('axe');
                expect(stats.attack).toBe(12);
            });

            it('should return pickaxe stats', () => {
                // Note: pickaxe matches 'axe' first, so gets axe stats
                const stats = getItemStats('pickaxe');
                expect(stats.attack).toBe(12);
            });
        });

        describe('armor - helmets', () => {
            it('should return iron helmet stats', () => {
                const stats = getItemStats('iron_helmet');
                expect(stats.defense).toBe(8);
                expect(stats.attack).toBe(0);
            });

            it('should return gold helmet stats', () => {
                const stats = getItemStats('gold_helmet');
                expect(stats.defense).toBe(6);
                expect(stats.special).toBe('Bling');
            });

            it('should return basic helmet stats', () => {
                const stats = getItemStats('leather_cap');
                expect(stats.defense).toBe(4);
            });
        });

        describe('armor - chest', () => {
            it('should return iron armor stats', () => {
                const stats = getItemStats('iron_armor');
                expect(stats.defense).toBe(20);
                expect(stats.speed).toBe(-5);
            });

            it('should return leather armor stats', () => {
                const stats = getItemStats('leather_tunic');
                expect(stats.defense).toBe(10);
                expect(stats.speed).toBe(0);
            });
        });

        describe('armor - boots', () => {
            it('should return magic boots stats', () => {
                const stats = getItemStats('magic_boots');
                expect(stats.speed).toBe(50);
                expect(stats.special).toBe('Super Speed');
            });

            it('should return iron boots stats', () => {
                const stats = getItemStats('iron_boots');
                expect(stats.defense).toBe(6);
                expect(stats.speed).toBe(-2);
            });

            it('should return basic boots stats', () => {
                const stats = getItemStats('boots');
                expect(stats.defense).toBe(3);
                expect(stats.speed).toBe(2);
            });
        });

        describe('shields', () => {
            it('should return magic shield stats', () => {
                const stats = getItemStats('magic_shield');
                expect(stats.defense).toBe(25);
                expect(stats.special).toBe('Magic Block');
            });

            it('should return iron shield stats', () => {
                const stats = getItemStats('iron_shield');
                expect(stats.defense).toBe(20);
            });

            it('should return basic shield stats', () => {
                const stats = getItemStats('shield');
                expect(stats.defense).toBe(15);
            });
        });

        describe('unknown items', () => {
            it('should return zero stats for unknown items', () => {
                const stats = getItemStats('unknown_item');
                expect(stats.attack).toBe(0);
                expect(stats.defense).toBe(0);
                expect(stats.speed).toBe(0);
            });

            it('should return zero stats for materials', () => {
                const stats = getItemStats('wood');
                expect(stats.attack).toBe(0);
                expect(stats.defense).toBe(0);
            });
        });
    });
});
