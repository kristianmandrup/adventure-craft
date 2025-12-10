import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { Character } from '../types';

interface AnimatedCharacterProps {
    character: Character;
    onInteract?: (char: Character) => void;
}

const SorcererEffects = ({ lastAttackTime }: { lastAttackTime: number }) => {
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

export const AnimatedCharacter: React.FC<AnimatedCharacterProps> = ({ character, onInteract }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);

  const isSpider = character.name.toLowerCase().includes('spider');
  const isSorcerer = character.name.toLowerCase().includes('sorcerer');

  const scale = character.isGiant ? 3 : 1;

  useFrame((state) => {
    if (!groupRef.current) return;

    // Smooth position interpolation
    groupRef.current.position.lerp(new THREE.Vector3(...character.position), 0.1);
    
    // Smooth rotation
    let currentRot = groupRef.current.rotation.y;
    let targetRot = character.rotation;
    
    while (targetRot - currentRot > Math.PI) targetRot -= Math.PI * 2;
    while (targetRot - currentRot < -Math.PI) targetRot += Math.PI * 2;
    
    groupRef.current.rotation.y = THREE.MathUtils.lerp(currentRot, targetRot, 0.1);

    // Animation Logic
    if (character.isMoving) {
      if (isSpider) {
          const time = state.clock.elapsedTime * 25; 
          const angle = Math.sin(time) * 0.3;

          if (leftLegRef.current) leftLegRef.current.rotation.x = angle;
          if (rightLegRef.current) rightLegRef.current.rotation.x = -angle;
          if (leftArmRef.current) leftArmRef.current.rotation.x = -angle;
          if (rightArmRef.current) rightArmRef.current.rotation.x = angle;
      } else {
          const time = state.clock.elapsedTime * (character.isGiant ? 5 : 10);
          const angle = Math.sin(time) * 0.5;

          if (leftLegRef.current) leftLegRef.current.rotation.x = angle;
          if (rightLegRef.current) rightLegRef.current.rotation.x = -angle;
          
          if (leftArmRef.current) leftArmRef.current.rotation.x = -angle;
          if (rightArmRef.current) rightArmRef.current.rotation.x = angle;
      }
    } else {
      const lerpFactor = 0.1;
      let armTarget = 0;
      if (isSorcerer) {
         const now = Date.now();
         const timeSince = now - (character.lastAttackTime || 0);
         const cooldown = 5000;
         if (timeSince > cooldown - 1500) armTarget = -1.5;
      }

      if (leftLegRef.current) leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, 0, lerpFactor);
      if (rightLegRef.current) rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, 0, lerpFactor);
      if (leftArmRef.current) leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, armTarget, lerpFactor);
      if (rightArmRef.current) rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, armTarget, lerpFactor);
    }
  });

  return (
    <group 
        ref={groupRef} 
        position={new THREE.Vector3(...character.position)} 
        rotation={[0, character.rotation, 0]}
        scale={[scale, scale, scale]}
        onPointerUp={(e) => {
             if (e.button === 2 && character.isFriendly && onInteract) {
                 e.stopPropagation();
                 onInteract(character);
             }
        }}
    >
       {/* HP Bar */}
       <Html position={[0, 2, 0]} center style={{ pointerEvents: 'none' }}>
         <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
            {character.isFriendly && <div className="bg-black/50 text-white text-[8px] px-1 rounded">RIGHT CLICK TO TALK</div>}
            <div style={{ width: '40px', height: '4px', background: 'red', border: '1px solid black' }}>
                <div style={{ width: `${(character.hp / character.maxHp) * 100}%`, height: '100%', background: 'green' }} />
            </div>
         </div>
       </Html>
       
       {isSorcerer && <SorcererEffects lastAttackTime={character.lastAttackTime || 0} />}

       {character.parts.map((part, idx) => {
         let ref = null;
         if (part.name === 'left_leg') ref = leftLegRef;
         if (part.name === 'right_leg') ref = rightLegRef;
         if (part.name === 'left_arm') ref = leftArmRef;
         if (part.name === 'right_arm') ref = rightArmRef;

         return (
           <group key={idx} ref={ref}>
             {part.voxels.map((v, vIdx) => (
                <mesh key={vIdx} position={[v.x/16, v.y/16, v.z/16]}>
                  <boxGeometry args={[1/16, 1/16, 1/16]} />
                  <meshStandardMaterial color={v.color} />
                </mesh>
             ))}
           </group>
         );
       })}
    </group>
  );
};