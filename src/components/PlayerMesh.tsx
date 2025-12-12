import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Equipment } from '../types';
import { HandWeapon } from './weapons/HandWeapon';
import { Shield } from './weapons/Shield';

interface PlayerMeshProps {
    equipment: Equipment;
    velocityRef: React.MutableRefObject<THREE.Vector3>;
    isSwimming?: boolean;
}

export const PlayerMesh: React.FC<PlayerMeshProps> = ({ equipment, velocityRef, isSwimming }) => {
    const groupRef = useRef<THREE.Group>(null);
    const leftLegRef = useRef<THREE.Group>(null);
    const rightLegRef = useRef<THREE.Group>(null);
    const leftArmRef = useRef<THREE.Group>(null);
    const rightArmRef = useRef<THREE.Group>(null);

    // Simple Walk Animation
    useFrame((state) => {
        if (!groupRef.current) return;
        const time = state.clock.getElapsedTime();
        const isMoving = velocityRef.current.length() > 0.1;
        
        if (isSwimming) {
            // Swimming animation - prone position with arm/leg strokes
            groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, Math.PI / 2.5, 0.1);
            groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, -0.5, 0.1);
            
            const swimSpeed = 4;
            if (leftLegRef.current) leftLegRef.current.rotation.x = Math.sin(time * swimSpeed) * 0.3;
            if (rightLegRef.current) rightLegRef.current.rotation.x = Math.sin(time * swimSpeed + Math.PI) * 0.3;
            if (leftArmRef.current) {
                leftArmRef.current.rotation.x = Math.sin(time * swimSpeed * 0.5) * 0.8;
                leftArmRef.current.rotation.z = Math.abs(Math.sin(time * swimSpeed * 0.5)) * 0.5;
            }
            if (rightArmRef.current) {
                rightArmRef.current.rotation.x = Math.sin(time * swimSpeed * 0.5 + Math.PI) * 0.8;
                rightArmRef.current.rotation.z = -Math.abs(Math.sin(time * swimSpeed * 0.5 + Math.PI)) * 0.5;
            }
        } else if (isMoving) {
            // Reset from swimming
            if (groupRef.current.rotation.x !== 0) {
                groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0, 0.1);
                groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, 0, 0.1);
            }
            
            const speed = 10;
            if (leftLegRef.current) leftLegRef.current.rotation.x = Math.sin(time * speed) * 0.5;
            if (rightLegRef.current) rightLegRef.current.rotation.x = Math.sin(time * speed + Math.PI) * 0.5;
            if (leftArmRef.current) {
                leftArmRef.current.rotation.x = Math.sin(time * speed + Math.PI) * 0.5;
                leftArmRef.current.rotation.z = 0;
            }
            if (rightArmRef.current) {
                rightArmRef.current.rotation.x = Math.sin(time * speed) * 0.5;
                rightArmRef.current.rotation.z = 0;
            }
        } else {
            // Idle - reset all
            if (groupRef.current.rotation.x !== 0) {
                groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0, 0.1);
                groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, 0, 0.1);
            }
            if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
            if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
            if (leftArmRef.current) { leftArmRef.current.rotation.x = 0; leftArmRef.current.rotation.z = 0; }
            if (rightArmRef.current) { rightArmRef.current.rotation.x = 0; rightArmRef.current.rotation.z = 0; }
        }
    });

    const skinColor = "#eecfa1";
    const shirtColor = "#3b82f6"; // Default Blue shirt
    const pantsColor = "#1e3a8a"; // Dark blue pants

    // Armor Colors (Override if equipped)
    const chestColor = equipment.chest ? equipment.chest.color : shirtColor;
    const feetColor = equipment.feet ? equipment.feet.color : "#000000"; // Shoes
    const legColor = equipment.feet ? equipment.feet.color : pantsColor; // Pants match shoes or default? pants default.
    // Actually pants should be pantsColor. Boots are just feet.

    return (
        <group ref={groupRef}>
            {/* Head */}
            <mesh position={[0, 1.5, 0]}>
                <boxGeometry args={[0.5, 0.5, 0.5]} />
                <meshStandardMaterial color={skinColor} />
            </mesh>
            {/* Helmet */}
            {equipment.head && (
                <mesh position={[0, 1.55, 0]}>
                    <boxGeometry args={[0.6, 0.6, 0.6]} />
                    <meshStandardMaterial color={equipment.head.color} />
                </mesh>
            )}

            {/* Body */}
            <mesh position={[0, 0.75, 0]}>
                <boxGeometry args={[0.6, 1.0, 0.3]} />
                <meshStandardMaterial color={chestColor} />
            </mesh>

            {/* Arms - Pivoted at shoulder (0, 1.2, 0) */}
            <group ref={leftArmRef} position={[-0.4, 1.2, 0]}>
                <mesh position={[0, -0.4, 0]}>
                    <boxGeometry args={[0.2, 0.8, 0.2]} />
                    <meshStandardMaterial color={skinColor} />
                </mesh>
                {/* Shield in Left Hand */}
                {equipment.offHand && equipment.offHand.type.includes('shield') && (
                    <group position={[0, -0.7, 0.2]} rotation={[0, 0, 0]}>
                        <Shield />
                    </group>
                )}
            </group>

            <group ref={rightArmRef} position={[0.4, 1.2, 0]}>
                <mesh position={[0, -0.4, 0]}>
                    <boxGeometry args={[0.2, 0.8, 0.2]} />
                    <meshStandardMaterial color={skinColor} />
                </mesh>
                 {/* Weapon in Right Hand */}
                 {equipment.mainHand && (
                    <group position={[0, -0.7, 0.2]} rotation={[Math.PI/2, 0, 0]}>
                         <HandWeapon activeItem={equipment.mainHand} />
                    </group>
                 )}
            </group>

            {/* Legs */}
            <group ref={leftLegRef} position={[-0.15, 0.25, 0]}>
                <mesh position={[0, -0.375, 0]}>
                    <boxGeometry args={[0.25, 0.75, 0.25]} />
                    <meshStandardMaterial color={pantsColor} />
                </mesh>
                 {/* Boot */}
                 {equipment.feet && (
                     <mesh position={[0, -0.7, 0]}>
                        <boxGeometry args={[0.27, 0.2, 0.27]} />
                        <meshStandardMaterial color={equipment.feet.color} />
                     </mesh>
                 )}
            </group>

            <group ref={rightLegRef} position={[0.15, 0.25, 0]}>
                <mesh position={[0, -0.375, 0]}>
                    <boxGeometry args={[0.25, 0.75, 0.25]} />
                    <meshStandardMaterial color={pantsColor} />
                </mesh>
                 {/* Boot */}
                 {equipment.feet && (
                     <mesh position={[0, -0.7, 0]}>
                        <boxGeometry args={[0.27, 0.2, 0.27]} />
                        <meshStandardMaterial color={equipment.feet.color} />
                     </mesh>
                 )}
            </group>

        </group>
    );
};
