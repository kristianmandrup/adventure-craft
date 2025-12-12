import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as THREE from 'three';

// Test utility functions that might be used across AI behaviors
describe('AI Utilities', () => {
    describe('distance calculation', () => {
        const getDistance = (pos1: [number, number, number], pos2: THREE.Vector3): number => {
            return Math.sqrt(
                Math.pow(pos1[0] - pos2.x, 2) +
                Math.pow(pos1[1] - pos2.y, 2) +
                Math.pow(pos1[2] - pos2.z, 2)
            );
        };

        it('should calculate correct distance between two points', () => {
            const pos1: [number, number, number] = [0, 0, 0];
            const pos2 = new THREE.Vector3(3, 4, 0);
            
            expect(getDistance(pos1, pos2)).toBeCloseTo(5);
        });

        it('should return 0 for same position', () => {
            const pos1: [number, number, number] = [5, 5, 5];
            const pos2 = new THREE.Vector3(5, 5, 5);
            
            expect(getDistance(pos1, pos2)).toBe(0);
        });

        it('should work with negative coordinates', () => {
            const pos1: [number, number, number] = [-5, 0, 0];
            const pos2 = new THREE.Vector3(5, 0, 0);
            
            expect(getDistance(pos1, pos2)).toBe(10);
        });
    });

    describe('angle calculation', () => {
        const getAngleToTarget = (from: [number, number, number], to: THREE.Vector3): number => {
            const dx = to.x - from[0];
            const dz = to.z - from[2];
            return Math.atan2(dx, dz);
        };

        it('should calculate angle facing north (positive Z)', () => {
            const from: [number, number, number] = [0, 0, 0];
            const to = new THREE.Vector3(0, 0, 10);
            
            expect(getAngleToTarget(from, to)).toBeCloseTo(0);
        });

        it('should calculate angle facing east (positive X)', () => {
            const from: [number, number, number] = [0, 0, 0];
            const to = new THREE.Vector3(10, 0, 0);
            
            expect(getAngleToTarget(from, to)).toBeCloseTo(Math.PI / 2);
        });

        it('should calculate angle facing south (negative Z)', () => {
            const from: [number, number, number] = [0, 0, 0];
            const to = new THREE.Vector3(0, 0, -10);
            
            expect(getAngleToTarget(from, to)).toBeCloseTo(Math.PI);
        });
    });

    describe('movement vector calculation', () => {
        const getMoveDirection = (from: [number, number, number], to: THREE.Vector3, speed: number): { dx: number, dz: number } => {
            const dx = to.x - from[0];
            const dz = to.z - from[2];
            const dist = Math.sqrt(dx * dx + dz * dz);
            if (dist === 0) return { dx: 0, dz: 0 };
            return {
                dx: (dx / dist) * speed,
                dz: (dz / dist) * speed
            };
        };

        it('should normalize movement direction', () => {
            const from: [number, number, number] = [0, 0, 0];
            const to = new THREE.Vector3(10, 0, 0);
            const speed = 1;
            
            const dir = getMoveDirection(from, to, speed);
            expect(dir.dx).toBeCloseTo(1);
            expect(dir.dz).toBeCloseTo(0);
        });

        it('should scale by speed', () => {
            const from: [number, number, number] = [0, 0, 0];
            const to = new THREE.Vector3(10, 0, 0);
            const speed = 2;
            
            const dir = getMoveDirection(from, to, speed);
            expect(dir.dx).toBeCloseTo(2);
        });

        it('should return zero for same position', () => {
            const from: [number, number, number] = [5, 0, 5];
            const to = new THREE.Vector3(5, 0, 5);
            const speed = 1;
            
            const dir = getMoveDirection(from, to, speed);
            expect(dir.dx).toBe(0);
            expect(dir.dz).toBe(0);
        });
    });
});
