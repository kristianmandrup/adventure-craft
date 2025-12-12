import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { ItemDrop } from './ItemDrop';
import * as THREE from 'three';

// Mock Three.js components
vi.mock('@react-three/fiber', () => ({
    useFrame: vi.fn((callback) => {}),
}));

describe('ItemDrop', () => {
    const defaultProps = {
        item: {
            id: 'drop-1',
            type: 'wood',
            count: 5,
            position: new THREE.Vector3(5, 1, 5),
            velocity: new THREE.Vector3(0, -1, 0),
            color: '#8B4513',
            createdAt: Date.now(),
        },
        onPickup: vi.fn(),
        playerPos: [0, 0, 0] as [number, number, number],
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should export ItemDrop component', () => {
        expect(ItemDrop).toBeDefined();
        expect(typeof ItemDrop).toBe('function');
    });

    it('should accept required props', () => {
        const props = defaultProps;
        expect(props.item.id).toBeDefined();
        expect(props.item.type).toBe('wood');
        expect(props.item.count).toBe(5);
        expect(typeof props.onPickup).toBe('function');
    });

    it('should have valid item structure', () => {
        const { item } = defaultProps;
        expect(item.position).toBeInstanceOf(THREE.Vector3);
        expect(item.velocity).toBeInstanceOf(THREE.Vector3);
        expect(typeof item.color).toBe('string');
    });
});
