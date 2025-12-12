import { describe, it, expect, beforeEach } from 'vitest';
import * as THREE from 'three';
import { resolveCollision, raycastBlock, createBlockMap, GRAVITY } from './physics';
import { Block } from '../types';

describe('physics utils', () => {
    describe('createBlockMap', () => {
        it('should map blocks by coordinate key', () => {
            const blocks: Block[] = [
                { id: '1', x: 1, y: 0, z: 1, type: 'dirt', color: '#000' },
                { id: '2', x: -1, y: 2, z: -1, type: 'stone', color: '#000' }
            ];
            const map = createBlockMap(blocks);
            expect(map.get('1,0,1')).toEqual(blocks[0]);
            expect(map.get('-1,2,-1')).toEqual(blocks[1]);
            expect(map.size).toBe(2);
        });
    });

    describe('resolveCollision', () => {
        let blockMap: Map<string, Block>;

        beforeEach(() => {
            blockMap = new Map();
            // Create a floor at y=0 
            // Player size is width 0.6, height 1.8.
            // If player is at y=1.8 (standing on 0).
            // Block at 0,0,0.
            blockMap.set('0,-1,0', { id: 'f1', x: 0, y: -1, z: 0, type: 'stone', color: '#fff' });
            
            // Wall at x=2
            blockMap.set('2,1,0', { id: 'w1', x: 2, y: 1, z: 0, type: 'stone', color: '#fff' });
            blockMap.set('2,2,0', { id: 'w2', x: 2, y: 2, z: 0, type: 'stone', color: '#fff' });
        });

        it('should apply gravity', () => {
            const pos = new THREE.Vector3(0, 50, 0); // Higher to avoid floor
            const vel = new THREE.Vector3(0, 0, 0);
            const delta = 0.1; // Smaller delta
            
            const result = resolveCollision(pos, vel, delta, blockMap);
            
            // GRAVITY * delta = 18 * 0.1 = 1.8
            expect(result.velocity.y).toBeCloseTo(-GRAVITY * delta);
        });

        it('should allow movement in free space', () => {
            const pos = new THREE.Vector3(0, 5, 0);
            const vel = new THREE.Vector3(1, 0, 0);
            const delta = 1;

            const result = resolveCollision(pos, vel, delta, blockMap);
            expect(result.position.x).toBe(1);
        });

        it('should stop at walls (X axis)', () => {
            // Player at 1.4. Wall at 2. Player Width 0.8.
            // Half width 0.4. Max X = 1.8.
            // Move right.
            const pos = new THREE.Vector3(1.3, 1, 0);
            const vel = new THREE.Vector3(1, 0, 0); // Moving towards wall
            const delta = 0.5; // Expected X + 0.5 = 1.8. 
            // Collision logic: check new position bounds.
            // New Center 1.8. Bounds [1.4, 2.2].
            // Checks x=1, x=2. Block at x=2 exists. Collision!
            
            const result = resolveCollision(pos, vel, delta, blockMap);
            
            // Should retract X to original?
            // Code: newPos.x -= velocity.x * delta; velocity.x = 0;
            expect(result.position.x).toBe(1.3);
            expect(result.velocity.x).toBe(0);
        });

        it('should land on ground (Y axis)', () => {
            // Floor at y=-1 (top face y=0 implicit? Block is cube centered at index? No, typically bottom-left or center?
            // "Round" logic in createBlockMap implies integers.
            // checkCollision uses Math.floor bounds.
            // Block (0,-1,0). Bounds x[0,0], y[-1,-1], z[0,0]?
            // Player (0, 0.5, 0). MinY = 0.5. No collision.
            // Player (0, 0, 0). MinY = 0. Collision with (0,-1,0)? 
            // MinY = floor(0) = 0. MaxY = floor(1.8) = 1.
            // Loop y from 0 to 1.
            // Block is at y=-1. No collision if player is at 0.
            // Wait. Gravity pulls down.
            // pos y=0. vel y=-1. delta=0.1.
            // NewPos y=-0.1. MinY = floor(-0.1) = -1.
            // Loop touches y=-1. Collision!
            // So onGround should be true.
            
            const pos = new THREE.Vector3(0, 0, 0);
            // Block at 0,-1,0.
            // But Map keys? createBlockMap rounds coords.
            // Map.set('0,-1,0', ...).
            
            const vel = new THREE.Vector3(0, -1, 0);
            const delta = 0.1;
            
            const result = resolveCollision(pos, vel, delta, blockMap);
            
            expect(result.onGround).toBe(true);
            expect(result.velocity.y).toBe(0);
            expect(result.position.y).toBe(0); // Reset
        });
        
        it('should handle infinite floor at y=-2', () => {
            const pos = new THREE.Vector3(100, -1.9, 0);
            const vel = new THREE.Vector3(0, -1, 0);
            const delta = 0.2; // new y = -2.1
            const emptyMap = new Map();
            
            const result = resolveCollision(pos, vel, delta, emptyMap);
            expect(result.position.y).toBe(-2);
            expect(result.onGround).toBe(true);
        });
    });

    describe('raycastBlock', () => {
         let blockMap: Map<string, Block>;
         beforeEach(() => {
             blockMap = new Map();
             blockMap.set('0,1,5', { id: 'b1', x: 0, y: 1, z: 5, type: 'dirt', color: '#dbb' });
         });

         it('should find block in direction', () => {
             const origin = new THREE.Vector3(0, 1, 0);
             const dir = new THREE.Vector3(0, 0, 1); // Towards Z
             
             const result = raycastBlock(origin, dir, blockMap, 10);
             expect(result.block).toBeDefined();
             expect(result.block?.type).toBe('dirt');
             // Uses Math.round, so hits z=5 when z >= 4.5
             expect(result.dist).toBeCloseTo(4.5, 0); 
         });

         it('should return null if no block', () => {
             const origin = new THREE.Vector3(0, 1, 0);
             const dir = new THREE.Vector3(0, 1, 0); // UP
             const result = raycastBlock(origin, dir, blockMap, 10);
             expect(result.block).toBeNull();
         });

         it('should determine correct face', () => {
             const origin = new THREE.Vector3(0, 1, 0);
             const dir = new THREE.Vector3(0, 0, 1); // +Z
             // Striking (0,1,5). Enters from (0,1,4).
             // Face should be Z = -1? (Facing viewer/origin).
             // Logic: prevPos z < block z.
             // if (round(prevPos.z) < bz) face.z = -1;
             
             const result = raycastBlock(origin, dir, blockMap, 10);
             expect(result.face).toBeDefined();
             expect(result.face?.z).toBe(-1);
             expect(result.face?.x).toBe(0);
             expect(result.face?.y).toBe(0);
         });
    });
});
