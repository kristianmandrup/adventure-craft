import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useGameAI } from './useGameAI';
import * as THREE from 'three';
import { audioManager } from '../utils/audio';
import * as enemyBehavior from '../utils/ai/enemyBehavior';
// import other behaviors if needed, for now mocking them

// Mocks
vi.mock('@react-three/fiber', () => ({
  useFrame: (callback: any) => {
      (global as any).triggerFrame = (state: any, delta: number) => callback(state, delta);
  }
}));

vi.mock('../utils/audio', () => ({
    audioManager: {
        playSFX: vi.fn()
    }
}));

vi.mock('../utils/ai/enemyBehavior', () => ({
    updateEnemyCharacter: vi.fn((char) => ({ character: char }))
}));

vi.mock('../utils/ai/friendlyBehavior', () => ({
    updateFriendlyCharacter: vi.fn((char) => char)
}));

vi.mock('../utils/ai/aquaticBehavior', () => ({
    updateAquaticCharacter: vi.fn((char) => char)
}));

const mockCrypto = { randomUUID: () => 'test-uuid' };
vi.stubGlobal('crypto', mockCrypto);

describe('useGameAI', () => {
    let props: any;
    let setCharacters: any;
    let setProjectiles: any;
    let setPlayerHp: any;
    let onNotification: any;
    let applyKnockback: any;
    
    beforeEach(() => {
        vi.clearAllMocks();
        setCharacters = vi.fn((cb) => {
            if (typeof cb === 'function') {
                return cb(props.characters || []); // Execute with current characters
            }
        });
        setProjectiles = vi.fn((cb) => {
            if (typeof cb === 'function') {
                 return cb(props.projectiles || []); 
            }
        });
        setPlayerHp = vi.fn((cb) => {
             if (typeof cb === 'function') return cb(100);
        });
        onNotification = vi.fn();
        applyKnockback = vi.fn();
        
        props = {
            characters: [],
            setCharacters,
            projectiles: [],
            setProjectiles,
            playerPosRef: { current: new THREE.Vector3(0, 0, 0) },
            setPlayerHp,
            blockMap: new Map(),
            inventory: [],
            playerStats: { attackMultiplier: 1, speedMultiplier: 1, defenseReduction: 0 },
            isLocked: { current: true },
            onNotification,
            applyKnockback,
            armor: 0
        };
    });

    describe('Projectiles', () => {
        it('should update projectile positions', () => {
            const p = { 
                id: 'p1', position: new THREE.Vector3(0, 0, 10), velocity: new THREE.Vector3(0, 0, -1), 
                damage: 10, ownerId: 'enemy' 
            };
            props.projectiles = [p];
            
            renderHook(() => useGameAI(props));
            
            act(() => {
                (global as any).triggerFrame({}, 0.1); // 0.1s update
            });
            
            expect(setProjectiles).toHaveBeenCalled();
            // Get the update callback
            const updateFn = setProjectiles.mock.calls[0][0];
            const nextProjs = updateFn([p]);
            
            expect(nextProjs[0].position.z).toBeCloseTo(9.9); // 10 - 1*0.1
        });

        it('should handle player collision and damage', () => {
            // Projectile very close to player (0,0,0)
            const p = { 
                id: 'p1', position: new THREE.Vector3(0, 0, 0.5), velocity: new THREE.Vector3(0, 0, -1), 
                damage: 10, ownerId: 'enemy' 
            };
            props.projectiles = [p];
            
            renderHook(() => useGameAI(props));
            
            // Mock random to avoid miss/block
            vi.spyOn(Math, 'random').mockReturnValue(0.9); // > any block chance (0) or miss chance (0.1)
            
            act(() => {
                (global as any).triggerFrame({}, 0.1);
            });
            
            // Should call setPlayerHp
            expect(setPlayerHp).toHaveBeenCalled();
            expect(onNotification).toHaveBeenCalledWith(expect.stringContaining('Hit by projectile'), 'COMBAT_DAMAGE');
        });

        it('should allow blocking with shield', () => {
            const p = { 
                id: 'p1', position: new THREE.Vector3(0, 0, 0.5), velocity: new THREE.Vector3(0, 0, -1), 
                damage: 10, ownerId: 'enemy' 
            };
            props.projectiles = [p];
            props.inventory = [{ type: 'shield' }];
            
            renderHook(() => useGameAI(props));
            
            // Mock random to hit block chance. Shield block chance is 0.2.
            vi.spyOn(Math, 'random').mockReturnValue(0.1);
            
            act(() => {
                (global as any).triggerFrame({}, 0.1);
            });
            
            expect(onNotification).toHaveBeenCalledWith('You blocked the projectile!', 'COMBAT_BLOCK');
            expect(audioManager.playSFX).toHaveBeenCalledWith('SHIELD_BLOCK');
            // HP should NOT be updated
            expect(setPlayerHp).not.toHaveBeenCalled();
        });
    });

    describe('AI Characters', () => {
        it('should throttle AI updates', () => {
             props.characters = [{ id: 'c1', isEnemy: true }];
             renderHook(() => useGameAI(props));
             
             // First frame
             act(() => { (global as any).triggerFrame({}, 0.016); });
             expect(setCharacters).toHaveBeenCalled();
             
             setCharacters.mockClear();
             
             // Immediate second frame (delta small, time gap small)
             // Date.now() is mocked? No.
             // We can mock Date.now() or just rely on speed.
             // If we run immediately, 0ms passed. Threshold 50ms.
             
             // Mock Date.now to stay same
             const start = Date.now();
             vi.spyOn(Date, 'now').mockReturnValue(start);
             
             act(() => { (global as any).triggerFrame({}, 0.016); });
             expect(setCharacters).not.toHaveBeenCalled(); // Should be throttled
             
             // Advance time
             vi.spyOn(Date, 'now').mockReturnValue(start + 60);
             act(() => { (global as any).triggerFrame({}, 0.016); });
             expect(setCharacters).toHaveBeenCalled();
        });

        it('should handle enemy attack sound events and knockback', () => {
             const enemy = { id: 'c1', isEnemy: true, name: 'Zombie', playerPos: [2, 0, 2] };
             props.characters = [enemy];
             
             // Mock updateEnemyCharacter to return event
             (enemyBehavior.updateEnemyCharacter as any).mockReturnValue({
                 character: enemy,
                 soundEvent: 'ZOMBIE_ATTACK'
             });
             
             renderHook(() => useGameAI(props));
             
             // Force update
             vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 100);
             vi.spyOn(Math, 'random').mockReturnValue(0.9); // No block
             
             act(() => { (global as any).triggerFrame({}, 0.016); });
             
             // Verify Sound
             expect(audioManager.playSFX).toHaveBeenCalledWith('ZOMBIE_ATTACK', expect.any(Number));
             
             // Verify Damage
             expect(setPlayerHp).toHaveBeenCalled();
             
             // Verify Knockback
             expect(applyKnockback).toHaveBeenCalled();
        });
    });
});
