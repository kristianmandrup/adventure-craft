import { describe, it, expect } from 'vitest';
import { SOUND_ASSETS } from './sound-assets';

describe('sound-assets', () => {
    describe('SOUND_ASSETS structure', () => {
        it('should have player action sounds', () => {
            expect(SOUND_ASSETS.ATTACK_SWORD).toBeDefined();
            expect(Array.isArray(SOUND_ASSETS.ATTACK_SWORD)).toBe(true);
            expect(SOUND_ASSETS.ATTACK_SWORD.length).toBeGreaterThan(0);
        });

        it('should have eating sounds', () => {
            expect(SOUND_ASSETS.EAT).toBeDefined();
            expect(SOUND_ASSETS.EAT_MEAT).toBeDefined();
            expect(SOUND_ASSETS.EAT_FISH).toBeDefined();
        });

        it('should have combat sounds', () => {
            expect(SOUND_ASSETS.PUNCH).toBeDefined();
            expect(SOUND_ASSETS.PUNCH_HIT).toBeDefined();
            expect(SOUND_ASSETS.BLOCK).toBeDefined();
            expect(SOUND_ASSETS.SHIELD_BLOCK).toBeDefined();
        });

        it('should have magic sounds', () => {
            expect(SOUND_ASSETS.SPELL_CAST).toBeDefined();
            expect(SOUND_ASSETS.SPELL_FIREBALL).toBeDefined();
        });

        it('should have all sound paths as .mp3 files', () => {
            const checkPaths = (sounds: string[]) => {
                sounds.forEach(path => {
                    expect(path).toMatch(/\.mp3$/);
                    expect(path).toContain('sfx/');
                });
            };

            checkPaths(SOUND_ASSETS.ATTACK_SWORD);
            checkPaths(SOUND_ASSETS.PUNCH);
            checkPaths(SOUND_ASSETS.EAT);
        });

        it('should have tool sounds', () => {
            expect(SOUND_ASSETS.CHOP_WOOD).toBeDefined();
            expect(SOUND_ASSETS.DRAW_SWORD).toBeDefined();
        });

        it('should have multiple variations for common sounds', () => {
            expect(SOUND_ASSETS.ATTACK_SWORD.length).toBeGreaterThanOrEqual(3);
            expect(SOUND_ASSETS.PUNCH.length).toBeGreaterThanOrEqual(2);
        });
    });
});
