import React, { useRef } from 'react';
import * as THREE from 'three';
import { Character } from '../types';
import { useCharacterAnimation } from '../hooks/useCharacterAnimation';
import { CharacterHealthBar } from './character/CharacterHealthBar';
import { SorcererEffects } from './character/SorcererEffects';
import { audioManager } from '../utils/audio';
import { useFrame } from '@react-three/fiber';

interface AnimatedCharacterProps {
    character: Character;
    onInteract?: (char: Character) => void;
}

export const AnimatedCharacter: React.FC<AnimatedCharacterProps> = ({ character, onInteract }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);

  const isSorcerer = character.name.toLowerCase().includes('sorcerer');
  const scale = character.isGiant ? 3 : 1;

  // Use Custom Hook for Animation / Physics Interpolation
  useCharacterAnimation(character, groupRef, {
      leftLeg: leftLegRef,
      rightLeg: rightLegRef,
      leftArm: leftArmRef,
      rightArm: rightArmRef
  });

  useFrame((state) => {
      // Random ambient sounds for enemies
      if (character.isEnemy && Math.random() < 0.002) { // Low chance per frame (~ every 8s)
          const charPos = new THREE.Vector3(...character.playerPos!);
          const dist = charPos.distanceTo(state.camera.position);
          if (dist < 15) {
              audioManager.playSpatialSFX('ZOMBIE_GROAN', dist);
          }
      }
  });

  return (
    <group 
        ref={groupRef} 
        position={new THREE.Vector3(...character.playerPos!)} 
        rotation={[0, character.rotation, 0]}
        scale={[scale, scale, scale]}
        onPointerUp={(e) => {
             if (e.button === 2 && character.isFriendly && onInteract) {
                 e.stopPropagation();
                 onInteract(character);
             }
        }}
    >
       <CharacterHealthBar character={character} />
       
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