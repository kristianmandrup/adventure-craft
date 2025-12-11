import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const SorcererEffects = ({ lastAttackTime }: { lastAttackTime: number }) => {
    const chargeRef = useRef<THREE.Group>(null);
    const burstRef = useRef<THREE.Mesh>(null);
    
    useFrame(() => {
        const now = Date.now();
        const timeSince = now - lastAttackTime;
        const cooldown = 5000;
        
        if (chargeRef.current) {
            const isCharging = timeSince > (cooldown - 1500);
            chargeRef.current.visible = isCharging;
            if (isCharging) {
                chargeRef.current.rotation.y += 0.15;
                chargeRef.current.rotation.z -= 0.1;
                const pulse = 1 + Math.sin(now * 0.01) * 0.2;
                chargeRef.current.scale.setScalar(pulse);
            }
        }

        if (burstRef.current) {
            const isBursting = timeSince < 300;
            burstRef.current.visible = isBursting;
            if (isBursting) {
                 const progress = timeSince / 300; 
                 const scale = 0.2 + progress * 3;
                 burstRef.current.scale.setScalar(scale);
                 (burstRef.current.material as THREE.MeshBasicMaterial).opacity = 1 - progress;
            }
        }
    });

    return (
        <group position={[0, 0.5, 0.5]}> 
            <group ref={chargeRef} visible={false}>
                 <mesh>
                    <octahedronGeometry args={[0.3, 0]} />
                    <meshBasicMaterial color="#a855f7" wireframe transparent opacity={0.6} />
                 </mesh>
                 <mesh rotation={[Math.PI/4, Math.PI/4, 0]}>
                    <ringGeometry args={[0.3, 0.35, 32]} />
                    <meshBasicMaterial color="#e9d5ff" transparent opacity={0.4} side={THREE.DoubleSide} />
                 </mesh>
            </group>
            <mesh ref={burstRef} visible={false}>
                <sphereGeometry args={[0.2, 16, 16]} />
                <meshBasicMaterial color="#faf5ff" transparent opacity={1} />
            </mesh>
        </group>
    );
};
