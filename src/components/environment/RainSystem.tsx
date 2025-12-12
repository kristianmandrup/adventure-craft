import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const RainSystem: React.FC = () => {
    const count = 1000;
    const positions = useMemo(() => {
        const pos = new Float32Array(count * 3);
        for(let i=0; i<count; i++) {
            pos[i*3] = (Math.random() - 0.5) * 40;
            pos[i*3+1] = Math.random() * 20;
            pos[i*3+2] = (Math.random() - 0.5) * 40;
        }
        return pos;
    }, []);

    const mesh = useRef<THREE.Points>(null);
    useFrame((state, delta) => {
        if (!mesh.current) return;
        const pos = mesh.current.geometry.attributes.position.array as Float32Array;
        for(let i=0; i<count; i++) {
            pos[i*3+1] -= delta * 15; // Rain speed
            if (pos[i*3+1] < 0) pos[i*3+1] = 20;
        }
        mesh.current.geometry.attributes.position.needsUpdate = true;
    });

    return (
        <points ref={mesh}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
            </bufferGeometry>
            <pointsMaterial color="#aaaaaa" size={0.1} transparent opacity={0.6} />
        </points>
    );
};