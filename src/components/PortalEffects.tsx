import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface PortalEffectsProps {
    position: [number, number, number];
    color?: string;
}

export const PortalEffects: React.FC<PortalEffectsProps> = ({ position, color = '#a855f7' }) => {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const count = 200;
    const dummy = useMemo(() => new THREE.Object3D(), []);
    
    // Parse Color
    const baseColor = useMemo(() => new THREE.Color(color), [color]);
    const isBlack = color === '#000000';
    
    // State: [x, y, z, angle, speed, radius, ySpeed, size, r, g, b]
    const data = useMemo(() => {
        const arr = new Float32Array(count * 11);
        for(let i=0; i<count; i++) {
            resetParticle(arr, i, position, baseColor, isBlack, true);
        }
        return arr;
    }, [position, baseColor, isBlack]);

    function resetParticle(arr: Float32Array, i: number, center: [number, number, number], baseCol: THREE.Color, isVoid: boolean, randomStart?: boolean) {
        const idx = i * 11;
        const [cx, cy, cz] = center;
        
        const angle = Math.random() * Math.PI * 2;
        const radius = 1 + Math.random() * 2;
        const speed = 0.5 + Math.random() * 1.0; 
        const startY = randomStart ? cy + (Math.random() * 4) : cy;
        
        arr[idx] = cx + Math.cos(angle) * radius; // x
        arr[idx+1] = startY; // y
        arr[idx+2] = cz + Math.sin(angle) * radius; // z
        arr[idx+3] = angle; 
        arr[idx+4] = speed; 
        arr[idx+5] = radius; 
        arr[idx+6] = 0.5 + Math.random() * 1.5; 
        arr[idx+7] = Math.random(); 
        
        // Color Logic
        if (isVoid) {
            // Black Portal -> White Sparkles (silver/white range)
            const v = 0.8 + Math.random() * 0.2; // 0.8-1.0
            arr[idx+8] = v;
            arr[idx+9] = v;
            arr[idx+10] = v;
        } else {
             // Analogous or Monochromatic variation
             // HSL shift
             const c = baseCol.clone();
             const hsl = { h: 0, s: 0, l: 0 };
             c.getHSL(hsl);
             // Shift Hue slightly
             c.setHSL(hsl.h + (Math.random() * 0.1 - 0.05), Math.max(0, Math.min(1, hsl.s)), Math.max(0, Math.min(1, hsl.l + (Math.random() * 0.4 - 0.2))));
             
             arr[idx+8] = c.r;
             arr[idx+9] = c.g;
             arr[idx+10] = c.b;
        }
    }

    useFrame((state, delta) => {
        if (!meshRef.current) return;
        
        for(let i=0; i<count; i++) {
            const idx = i * 11;
            
            // Spiral Logic
            // Update Angle
            data[idx+3] += data[idx+4] * delta; 
            // Update Y
            data[idx+1] += data[idx+6] * delta;
            
            // Recalculate positions based on angle/radius
            // Contract radius as it goes up? 
            // Let's verify center position hasn't changed drastically or pass it in?
            // "position" prop might change if portal inactive -> active but it's passed once.
            // If we want dynamic portals we need to use 'position' from prop in update... 
            // But doing that every frame for all particles is expensive if we parse it.
            // Let's assume portal is static once spawned.
            
            const [cx, cy, cz] = position;
            
            // Check bounds (height > 5, reset)
            if (data[idx+1] > cy + 5) {
                resetParticle(data, i, position, baseColor, isBlack);
            }

            const r = data[idx+5] * (1 - (data[idx+1] - cy)/5); // Radius shrinks as it goes up
            
            const x = cx + Math.cos(data[idx+3]) * r;
            const z = cz + Math.sin(data[idx+3]) * r;
            
            data[idx] = x;
            data[idx+2] = z;

            // Pulse Size
            data[idx+7] += delta * 2;
            const s = (Math.sin(data[idx+7]) * 0.5 + 0.5) * 0.15; // Size 0 to 0.15

            dummy.position.set(x, data[idx+1], z);
            dummy.scale.setScalar(s);
            dummy.rotation.set(Math.random(), Math.random(), Math.random());
            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);
            meshRef.current.setColorAt(i, new THREE.Color(data[idx+8], data[idx+9], data[idx+10]));
        }
        
        meshRef.current.instanceMatrix.needsUpdate = true;
        if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
            <dodecahedronGeometry args={[0.2, 0]} />
            <meshBasicMaterial transparent opacity={0.6} blending={THREE.AdditiveBlending} />
        </instancedMesh>
    );
};
