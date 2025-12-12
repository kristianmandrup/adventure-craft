import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCombat } from './useCombat';
import * as THREE from 'three';
import { audioManager } from '../../utils/audio';

// Mocks
vi.mock('../../utils/audio', () => ({
    audioManager: {
        playSFX: vi.fn()
    }
}));

const mockCrypto = { randomUUID: () => 'test-uuid' };
vi.stubGlobal('crypto', mockCrypto);

vi.mock('uuid', () => ({
  v4: () => 'drop-uuid'
}));

// Mock Camera
const mockCamera = new THREE.PerspectiveCamera();
mockCamera.position.set(0, 0, 0);
mockCamera.getWorldDirection = vi.fn((vec) => vec.set(0, 0, -1)); // Facing North

describe('useCombat', () => {
    let props: any;
    let setCharacters: any;
    let setProjectiles: any;
    let setInventory: any;
    let onQuestUpdate: any;
    let onXpGain: any;
    let onGoldGain: any;
    let onNotification: any;
    let setDroppedItems: any;
    let onSpawnParticles: any;

    beforeEach(() => {
        vi.clearAllMocks();
        setCharacters = vi.fn((cb) => {
            if (typeof cb === 'function') {
                return cb(props.characters);
            }
        });
        setProjectiles = vi.fn((cb) => {
             if (typeof cb === 'function') return cb([]);
        });
        setInventory = vi.fn((cb) => {
             if (typeof cb === 'function') return cb(props.inventory);
        });
        onQuestUpdate = vi.fn();
        onXpGain = vi.fn();
        onGoldGain = vi.fn();
        onNotification = vi.fn();
        setDroppedItems = vi.fn((cb) => {
             if (typeof cb === 'function') return cb([]);
        });
        onSpawnParticles = vi.fn();

        props = {
            characters: [],
            setCharacters,
            setProjectiles,
            inventory: [],
            setInventory,
            playerStats: { attackMultiplier: 1, speedMultiplier: 1, defenseReduction: 0 },
            onQuestUpdate,
            onXpGain,
            onGoldGain,
            onNotification,
            setDroppedItems,
            onSpawnParticles
        };
        
        mockCamera.position.set(0, 0, 0);
        (mockCamera.getWorldDirection as any).mockImplementation((vec: any) => vec.set(0, 0, -1));
    });

    describe('Melee Combat', () => {
        it('should hit enemy in front of player', () => {
             const enemy = { id: 'c1', name: 'Zombie', isEnemy: true, playerPos: [0, 0, -2], hp: 100 };
             props.characters = [enemy];
             props.inventory = [{ type: 'sword' }]; // Active slot 0

             const { result } = renderHook(() => useCombat(props));

             const hit = result.current.handleAttack(mockCamera, 0);
             expect(hit).toBe(true);
             
             expect(setCharacters).toHaveBeenCalled();
             expect(onNotification).toHaveBeenCalledWith(expect.stringContaining('You hit Zombie'), 'COMBAT_HIT');
        });

        it('should miss enemy out of range', () => {
             const enemy = { id: 'c1', name: 'Zombie', isEnemy: true, playerPos: [0, 0, -10], hp: 100 }; // > 5m
             props.characters = [enemy];
             
             const { result } = renderHook(() => useCombat(props));
             const hit = result.current.handleAttack(mockCamera, 0);
             expect(hit).toBe(false);
             expect(setCharacters).not.toHaveBeenCalled();
        });

        it('should miss enemy behind player', () => {
             const enemy = { id: 'c1', name: 'Zombie', isEnemy: true, playerPos: [0, 0, 2], hp: 100 }; // Behind (facing -Z)
             props.characters = [enemy];
             
             const { result } = renderHook(() => useCombat(props));
             const hit = result.current.handleAttack(mockCamera, 0);
             expect(hit).toBe(false); // Dot product < 0.9
        });

        it('should kill enemy and grant rewards', () => {
             const enemy = { id: 'c1', name: 'Zombie', isEnemy: true, playerPos: [0, 0, -2], hp: 10 }; // Low HP
             props.characters = [enemy];
             
             // Mock random to prevent drops (0.6 > 0.5) to ensure "You killed" message
             vi.spyOn(Math, 'random').mockReturnValue(0.6);
             
             const { result } = renderHook(() => useCombat(props));
             
             // First hit does 10 damage * 1 = 10. Dies.
             result.current.handleAttack(mockCamera, -1); // Unarmed is fine or sword? Base damage 10 unarmed? No, check code:
             // Code: isWeapon ? ... else unarmed playSFX.
             // Base Damage calc: const baseDamage = hasSword ? 20 : 10;
             // Unarmed -> 10 damage.
             
             expect(setCharacters).toHaveBeenCalled();
             
             // Check rewards
             expect(onXpGain).toHaveBeenCalledWith(15); // Zombie XP
             expect(onQuestUpdate).toHaveBeenCalledWith('zombie', 1);
             expect(onNotification).toHaveBeenCalledWith('You killed Zombie', 'MERCHANT');
        });
        
        it('should spawn drops on kill', () => {
             const pig = { id: 'c1', name: 'wild pig', isEnemy: false, playerPos: [0, 0, -2], hp: 5 };
             props.characters = [pig];
             
             const { result } = renderHook(() => useCombat(props));
             
             result.current.handleAttack(mockCamera, -1);
             
             // Verify Drops
             // Should spawn pork
             expect(setDroppedItems).toHaveBeenCalled();
             // The callback to setDroppedItems is executed by our mock?
             // Yes, we updated the mock to run callback.
             // However, to verify WHAT was passed to callback, we can inspect mock calls.
             // But inside callback `prev => [...prev, newItem]`.
             // We return result of callback.
        });
    });

    describe('Dark Underworld Mode', () => {
        it('should respawn pig when killed in DARK_UNDERWORLD mode', () => {
            const pig = { id: 'pig1', name: 'wild pig', isEnemy: false, playerPos: [0, 0, -2], hp: 5, maxHp: 10 };
            props.characters = [pig];
            props.difficultyMode = 'DARK_UNDERWORLD'; // Set mode

            const { result } = renderHook(() => useCombat(props));
            
            // Hit pig (Damage 10 hits HP 5 -> Kill)
            result.current.handleAttack(mockCamera, -1); 

            expect(setCharacters).toHaveBeenCalled();
            
            // Analyze the update
            const updateFn = setCharacters.mock.lastCall![0] as Function;
            const newChars = updateFn(props.characters);
            
            // Original pig removed, new pig added -> Length should be 1
            expect(newChars).toHaveLength(1);
            // New pig should have different ID
            expect(newChars[0].id).not.toBe('pig1');
            expect(newChars[0].name).toContain('pig');
        });

        it('should trigger boss quest update when killing a boss', () => {
             const boss = { id: 'boss1', name: 'Giant King', isEnemy: true, playerPos: [0, 0, -2], hp: 10 };
             props.characters = [boss];
             props.difficultyMode = 'DARK_UNDERWORLD';

             const { result } = renderHook(() => useCombat(props));
             
             result.current.handleAttack(mockCamera, -1); // Kill

             // Should trigger 'giant' (normal logic) and 'boss' (underworld logic)
             expect(onQuestUpdate).toHaveBeenCalledWith('giant', 1);
             expect(onQuestUpdate).toHaveBeenCalledWith('boss', 1);
        });
    });

    describe('Ranged Combat', () => {
        it('should fire arrow if bow equipped and arrows available', () => {
             props.inventory = [
                 { type: 'bow', count: 1 }, // Slot 0
                 { type: 'arrows', count: 10 } // Slot 1
             ];
             
             const { result } = renderHook(() => useCombat(props));
             
             const fired = result.current.handleAttack(mockCamera, 0);
             expect(fired).toBe(true);
             
             // Check Projectile Spawn
             expect(setProjectiles).toHaveBeenCalled();
             
             // Check Inventory consumption
             expect(setInventory).toHaveBeenCalled();
             // Verify arrow count decreased
             // setInventory mock executes callback.
             // The callback runs map/filter on props.inventory.
             // We can spy on the result?
             // Since mock returns the result, renderHook doesn't expose it directly.
             // But we can check mock Calls.
             const updateFn = setInventory.mock.calls[0][0];
             const newInv = updateFn(props.inventory);
             const arrows = newInv.find((i: any) => i.type === 'arrows');
             expect(arrows.count).toBe(9);
        });

        it('should not fire if no arrows', () => {
             props.inventory = [{ type: 'bow', count: 1 }];
             const { result } = renderHook(() => useCombat(props));
             
             result.current.handleAttack(mockCamera, 0);
             expect(setProjectiles).not.toHaveBeenCalled();
        });
        
        it('should auto-aim at nearest enemy', () => {
             props.inventory = [{ type: 'bow' }, { type: 'arrows', count: 1 }];
             const enemy = { id: 'c1', name: 'Zombie', isEnemy: true, playerPos: [2, 0, -10], hp: 100 }; // Somewhat to right
             props.characters = [enemy];
             
             // Camera facing North (0,0,-1). Enemy at (2,0,-10).
             // ToChar is (0.2, 0, -0.98). Dot with (0,0,-1) is 0.98 > 0.5.
             
             const { result } = renderHook(() => useCombat(props));
             result.current.handleAttack(mockCamera, 0);
             
             expect(setProjectiles).toHaveBeenCalled();
             const updateFn = setProjectiles.mock.calls[0][0];
             const newProjs = updateFn([]);
             const p = newProjs[0];
             
             // Velocity should point towards enemy
             const expectedDir = new THREE.Vector3(2, 0, -10).normalize();
             const velDir = p.velocity.clone().normalize();
             
             expect(velDir.x).toBeCloseTo(expectedDir.x);
             expect(velDir.z).toBeCloseTo(expectedDir.z);
        });
    });
});
